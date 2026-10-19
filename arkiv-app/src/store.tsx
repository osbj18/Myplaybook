import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearPhotos } from './photos';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  FOLLOWING_FEED, ME, USERS, seedComments, seedItems, seedThreads,
  type Comment, type Item, type Message, type Sale, type Thread, type User,
} from './data/seed';

const KEY = 'arkiv-state-v1';

export type State = {
  items: Item[];
  comments: Record<string, Comment[]>;
  threads: Thread[];
  feed: string[];
  liked: Record<string, boolean>;
  saved: Record<string, boolean>;
  hearted: Record<string, boolean>;
  likedComments: Record<string, boolean>;
  seenStories: Record<string, boolean>;
  following: Record<string, boolean>;
  blocked: Record<string, boolean>;
  me: { name: string; bio: string };
};

const fresh = (): State => ({
  items: seedItems(),
  comments: seedComments(),
  threads: seedThreads(),
  feed: FOLLOWING_FEED.slice(),
  liked: {}, saved: {}, hearted: {}, likedComments: {}, seenStories: {},
  following: { sofialbrandz: true, ameliacmode: true, filipberg: true },
  blocked: {},
  me: { name: USERS[ME].name, bio: USERS[ME].bio ?? '' },
});

export type Draft = {
  type: 'Inlägg' | 'Sälj' | 'OOTD' | 'Review';
  images: string[];
  caption: string;
  price: number;
  brand: string;
  size: string;
  cond: string;
  ship: string;
  tagged: boolean;
  pickup: boolean;
};

export const now = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
export const kr = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} kr`;
const round10 = (n: number) => Math.round(n / 10) * 10;
let seq = 0;
const uid = (p: string) => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

function useStoreValue() {
  const [state, setState] = useState<State>(fresh);
  const [ready, setReady] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; key: number } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => { if (raw) setState({ ...fresh(), ...JSON.parse(raw) }); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => { AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {}); }, 300);
    return () => clearTimeout(t);
  }, [state, ready]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const mutate = useCallback((fn: (s: State) => void) => {
    setState((prev) => {
      const next: State = JSON.parse(JSON.stringify(prev));
      fn(next);
      return next;
    });
  }, []);

  const later = useCallback((ms: number, fn: () => void) => { timers.current.push(setTimeout(fn, ms)); }, []);
  const toast = useCallback((text: string) => setToastMsg({ text, key: Date.now() }), []);

  const user = useCallback((h: string): User => {
    if (h === ME) return { ...USERS[ME], name: state.me.name, bio: state.me.bio };
    return USERS[h] ?? { name: h, avatar: null, initials: h.slice(0, 2).toUpperCase() };
  }, [state.me]);

  const item = useCallback((id?: string) => state.items.find((x) => x.id === id), [state.items]);

  const thread = (s: State, id: string) => s.threads.find((t) => t.id === id)!;
  const push = (t: Thread, msg: Omit<Message, 'id'>) => { t.messages.push({ id: uid('m'), ...msg }); t.time = now(); };
  const toTop = (s: State, t: Thread) => { s.threads = [t, ...s.threads.filter((x) => x.id !== t.id)]; };

  const actions = useMemo(() => {
    const typingThenReply = (threadId: string, reply: (s: State, t: Thread) => void, delay = 1800) => {
      later(600, () => mutate((s) => { thread(s, threadId).typing = true; }));
      later(delay, () => mutate((s) => {
        const t = thread(s, threadId);
        t.typing = false;
        reply(s, t);
        t.unread = true; // nollställs av chattskärmen om den är öppen
      }));
    };

    const dealDone = (s: State, t: Thread, amount: number) => {
      const it = s.items.find((x) => x.id === t.item) as Sale | undefined;
      if (it) it.sold = true;
      push(t, { from: 'them', system: `Affär klar · ${kr(amount)} · köparskydd aktivt`, time: now() });
    };

    return {
      toggleLike: (id: string) => mutate((s) => { s.liked[id] = !s.liked[id]; }),
      toggleSave: (id: string) => mutate((s) => { s.saved[id] = !s.saved[id]; }),
      toggleHeart: (id: string) => mutate((s) => { s.hearted[id] = !s.hearted[id]; }),
      toggleCommentLike: (key: string) => mutate((s) => { s.likedComments[key] = !s.likedComments[key]; }),
      markStory: (h: string) => mutate((s) => { s.seenStories[h] = true; }),
      toggleFollow: (h: string) => mutate((s) => { s.following[h] = !s.following[h]; }),
      block: (h: string) => mutate((s) => { s.blocked[h] = true; s.following[h] = false; }),
      unblock: (h: string) => mutate((s) => { delete s.blocked[h]; }),
      addComment: (id: string, text: string) => mutate((s) => { (s.comments[id] ??= []).push({ user: ME, text, time: 'nu', likes: 0 }); }),
      markRead: (id: string) => mutate((s) => { const t = s.threads.find((x) => x.id === id); if (t) t.unread = false; }),
      readAll: () => mutate((s) => { s.threads.forEach((t) => { t.unread = false; }); }),
      updateMe: (me: State['me']) => mutate((s) => { s.me = me; }),

      sendMessage: (threadId: string, text: string) => {
        mutate((s) => { push(thread(s, threadId), { from: 'me', text, time: now() }); });
        const answers: [RegExp, string][] = [
          [/stor|size|mått/i, 'Den är som en vanlig M, lite oversize.'],
          [/ses|mötas|imorgon|träff/i, 'Imorgon kl 17 vid Slussen funkar för mig!'],
          [/frakt|skick/i, 'Jag kan skicka med PostNord, 59 kr.'],
          [/tack/i, 'Tack själv!'],
        ];
        const hit = answers.find(([re]) => re.test(text));
        typingThenReply(threadId, (_, t) => push(t, { from: 'them', text: hit ? hit[1] : 'Låter bra!', time: now() }));
      },

      /** Öppnar (eller skapar) en tråd med en användare och returnerar dess id. */
      openDm: (h: string, itemId?: string) => {
        const existing = state.threads.find((x) => x.with === h && (!itemId || x.item === itemId));
        if (existing) return existing.id;
        const id = uid('dm');
        mutate((s) => { s.threads.unshift({ id, with: h, role: 'seller', item: itemId, time: now(), messages: [{ id: uid('m'), from: 'them', system: 'Säg hej', time: now() }] }); });
        return id;
      },

      /** Köparen lägger bud. Säljaren svarar automatiskt i demon. */
      placeBid: (it: Sale, amount: number) => {
        const existing = state.threads.find((x) => x.with === it.owner && x.item === it.id);
        const id = existing?.id ?? uid('th');
        mutate((s) => {
          let t = s.threads.find((x) => x.id === id);
          if (!t) { t = { id, with: it.owner, role: 'seller', item: it.id, time: now(), messages: [] }; s.threads.unshift(t); }
          push(t, { from: 'me', offer: { kind: 'Bud', amount, state: 'open' }, time: now() });
          toTop(s, t);
        });
        typingThenReply(id, (s, t) => {
          const bid = [...t.messages].reverse().find((x) => x.offer && x.from === 'me')!;
          if (amount >= it.price * 0.9) {
            bid.offer!.state = 'accepted';
            push(t, { from: 'them', text: `Det låter bra, ${kr(amount)} funkar!`, time: now() });
            dealDone(s, t, amount);
          } else {
            bid.offer!.state = 'declined';
            const counter = round10((amount + it.price) / 2);
            push(t, { from: 'them', text: `Tack för budet! Jag kan gå ner till ${kr(counter)}.`, time: now() });
            push(t, { from: 'them', offer: { kind: 'Motbud', amount: counter, state: 'agreed' }, time: now() });
          }
        }, 2200);
        return id;
      },

      /** Acceptera ett motbud/överenskommet pris → affären är klar. */
      acceptOffer: (threadId: string, msgId: string) => mutate((s) => {
        const t = thread(s, threadId);
        const msg = t.messages.find((x) => x.id === msgId)!;
        msg.offer!.state = 'accepted';
        dealDone(s, t, msg.offer!.amount);
      }),

      /** Säljaren svarar på ett inkommande bud. */
      answerBid: (threadId: string, msgId: string, answer: 'accept' | 'decline' | { counter: number }) => {
        mutate((s) => {
          const t = thread(s, threadId);
          const msg = t.messages.find((x) => x.id === msgId)!;
          if (answer === 'accept') { msg.offer!.state = 'accepted'; dealDone(s, t, msg.offer!.amount); }
          else if (answer === 'decline') { msg.offer!.state = 'declined'; push(t, { from: 'me', text: 'Tyvärr, det är för lågt för mig.', time: now() }); }
          else { msg.offer!.state = 'answered'; push(t, { from: 'me', offer: { kind: 'Motbud', amount: answer.counter, state: 'open' }, time: now() }); }
        });
        if (typeof answer === 'object') {
          typingThenReply(threadId, (_, t) => {
            const mine = t.messages[t.messages.length - 1];
            if (mine.offer) mine.offer.state = 'agreed';
            push(t, { from: 'them', text: `Okej, ${kr(answer.counter)} kör vi på!`, time: now() });
          });
        }
      },

      publish: (d: Draft) => {
        const id = uid('new');
        const shipKr = parseInt((d.ship.match(/(\d+) kr/) || [])[1] ?? '0', 10) || 0;
        const condMap: Record<string, string> = { 'Ny med lapp': 'Ny med lapp', 'Mycket gott': 'Mycket gott skick', Gott: 'Gott skick', Använt: 'Använt' };
        mutate((s) => {
          const createdAt = Date.now();
          s.items.unshift(d.type === 'Sälj'
            ? { id, kind: 'sale', owner: ME, createdAt, images: d.images, title: d.caption.trim().split(/[.\n]/)[0].slice(0, 28) || 'Plagg', brand: d.brand.trim(), price: d.price, size: d.size, cond: condMap[d.cond], ship: shipKr, desc: d.caption.trim() || 'Ingen beskrivning.', material: '—', measure: '—', color: '—', posted: 'Nyss' }
            : { id, kind: 'post', owner: ME, createdAt, images: d.images, caption: d.caption.trim() || (d.type === 'OOTD' ? 'Dagens outfit.' : 'Nytt inlägg.'), likes: 0, saves: 0, time: 'nu' });
          s.feed.unshift(id);
        });
        return id;
      },

      deleteItem: (id: string) => mutate((s) => { s.items = s.items.filter((x) => x.id !== id); s.feed = s.feed.filter((x) => x !== id); }),

      reset: () => { timers.current.forEach(clearTimeout); timers.current = []; clearPhotos(); setState(fresh()); },
    };
  }, [mutate, later, state.threads]);

  return { state, ready, user, item, toast, toastMsg, ...actions };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore måste användas inom StoreProvider');
  return v;
}
