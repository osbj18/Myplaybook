import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuth } from './auth';
import { isDemo } from './demo';
import { deleteAllFiles, deleteMediaFiles } from './media';
import { supabase } from './supabase';
import type { Comment, Item, Media, Message, Profile, Review, Tag, Thread } from './types';

export const ITEM_SELECT = '*, owner:profiles!items_owner_id_fkey(*), likes(count), comments(count)';
const THREAD_SELECT = '*, item:items(*), buyer:profiles!threads_buyer_id_fkey(*), seller:profiles!threads_seller_id_fkey(*)';

async function run<T>(p: PromiseLike<{ data: T | null; error: unknown }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw error;
  return data as T;
}

export const kr = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} kr`;
export const countOf = (x?: { count: number }[]) => x?.[0]?.count ?? 0;

export function timeAgo(iso: string) {
  const s = Math.max(1, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'nu';
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} tim`;
  if (s < 604800) return `${Math.floor(s / 86400)} d`;
  return new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}
export const clock = (iso: string) => {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return today ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : timeAgo(iso);
};

// ---------- Mina relationer (gillat, sparat, följer, blockerat) ----------

function useIdSet(key: string, table: string, col: string, where: string) {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ['me', key, userId],
    enabled: !!userId,
    queryFn: async () => {
      const rows = await run(supabase.from(table).select(col).eq(where, userId!));
      return new Set((rows as unknown as Record<string, string>[]).map((r) => r[col]));
    },
  });
}

export const useMyLikes = () => useIdSet('likes', 'likes', 'item_id', 'user_id');
export const useMySaves = () => useIdSet('saves', 'saves', 'item_id', 'user_id');
export const useMyFollows = () => useIdSet('follows', 'follows', 'followee_id', 'follower_id');
export const useMyBlocks = () => useIdSet('blocks', 'blocks', 'blocked_id', 'blocker_id');

function useToggle(key: string, table: string, idCol: string, otherCol: string) {
  const qc = useQueryClient();
  const { userId } = useAuth();
  return useMutation({
    mutationFn: async ({ id, on }: { id: string; on: boolean }) => {
      if (on) await run(supabase.from(table).insert({ [idCol]: id } as never));
      else await run(supabase.from(table).delete().eq(idCol, id).eq(otherCol, userId!));
    },
    onMutate: ({ id, on }) => {
      qc.setQueryData<Set<string>>(['me', key, userId], (prev) => {
        const next = new Set(prev);
        if (on) next.add(id); else next.delete(id);
        return next;
      });
    },
    onError: () => qc.invalidateQueries({ queryKey: ['me', key] }),
    onSettled: () => {
      if (key === 'likes') qc.invalidateQueries({ queryKey: ['item'] });
      if (key === 'follows') { qc.invalidateQueries({ queryKey: ['feed'] }); qc.invalidateQueries({ queryKey: ['followCounts'] }); }
      if (key === 'blocks') { qc.invalidateQueries({ queryKey: ['feed'] }); qc.invalidateQueries({ queryKey: ['threads'] }); }
    },
  });
}

export const useToggleLike = () => useToggle('likes', 'likes', 'item_id', 'user_id');
export const useToggleSave = () => useToggle('saves', 'saves', 'item_id', 'user_id');
export const useToggleFollow = () => useToggle('follows', 'follows', 'followee_id', 'follower_id');
export const useToggleBlock = () => useToggle('blocks', 'blocks', 'blocked_id', 'blocker_id');

export async function report(reason: string, target: { item_id?: string; user_id?: string; comment_id?: string }) {
  await run(supabase.from('reports').insert({ reason, ...target }));
}

// ---------- Flöden ----------

export function useFeed() {
  const { userId } = useAuth();
  const follows = useMyFollows();
  return useQuery({
    queryKey: ['feed', userId, follows.data?.size ?? 0],
    enabled: !!userId && follows.isSuccess,
    queryFn: async () => {
      const ids = [...(follows.data ?? [])];
      if (ids.length) {
        const items = await run(supabase.from('items').select(ITEM_SELECT).in('owner_id', [...ids, userId!]).order('created_at', { ascending: false }).limit(60));
        return { following: true, items: items as Item[] };
      }
      const items = await run(supabase.from('items').select(ITEM_SELECT).order('created_at', { ascending: false }).limit(60));
      return { following: false, items: items as Item[] };
    },
  });
}

/** De du följer, med deras senaste inlägg som omslag. */
export function useFavorites() {
  const follows = useMyFollows();
  return useQuery({
    queryKey: ['favorites', [...(follows.data ?? [])].sort().join(',')],
    enabled: follows.isSuccess && (follows.data?.size ?? 0) > 0,
    queryFn: async () => {
      const ids = [...follows.data!];
      const [profiles, items] = await Promise.all([
        run(supabase.from('profiles').select('*').in('id', ids)),
        run(supabase.from('items').select('id, owner_id, media, created_at').in('owner_id', ids).order('created_at', { ascending: false }).limit(200)),
      ]);
      const latest = new Map<string, { media: Media[]; created_at: string }>();
      for (const it of items as { owner_id: string; media: Media[]; created_at: string }[]) if (!latest.has(it.owner_id)) latest.set(it.owner_id, it);
      return (profiles as Profile[])
        .map((p) => ({ profile: p, cover: latest.get(p.id)?.media[0], at: latest.get(p.id)?.created_at ?? '' }))
        .sort((a, b) => b.at.localeCompare(a.at));
    },
  });
}

/** Senaste från alla, för Utforska-rutnätet. */
export function useDiscover() {
  return useQuery({
    queryKey: ['discover'],
    queryFn: async () => (await run(supabase.from('items').select(ITEM_SELECT).order('created_at', { ascending: false }).limit(90))) as Item[],
  });
}

export type ExploreFilter = { q: string; size?: string; condition?: string; sort?: 'new' | 'price' };
export function useExplore(f: ExploreFilter) {
  return useQuery({
    queryKey: ['explore', f],
    queryFn: async () => {
      let q = supabase.from('items').select(ITEM_SELECT).eq('kind', 'sale').eq('sold', false);
      const term = f.q.trim().replace(/[%,()]/g, ' ');
      if (term) q = q.or(`title.ilike.%${term}%,brand.ilike.%${term}%,caption.ilike.%${term}%`);
      if (f.size) q = q.eq('size', f.size);
      if (f.condition) q = q.eq('condition', f.condition);
      q = f.sort === 'price' ? q.order('price', { ascending: true }) : q.order('created_at', { ascending: false });
      const [items, people] = await Promise.all([
        run(q.limit(60)),
        term ? run(supabase.from('profiles').select('*').or(`handle.ilike.%${term}%,name.ilike.%${term}%`).limit(10)) : Promise.resolve([]),
      ]);
      return { items: items as Item[], people: people as Profile[] };
    },
  });
}

export function useItem(id?: string) {
  return useQuery({
    queryKey: ['item', id],
    enabled: !!id,
    queryFn: async () => (await run(supabase.from('items').select(ITEM_SELECT).eq('id', id!).maybeSingle())) as Item | null,
  });
}

export function useUserItems(uid?: string) {
  return useQuery({
    queryKey: ['userItems', uid],
    enabled: !!uid,
    queryFn: async () => (await run(supabase.from('items').select(ITEM_SELECT).eq('owner_id', uid!).order('created_at', { ascending: false }).limit(120))) as Item[],
  });
}

export type NewItem = {
  kind: 'post' | 'sale'; tag: Tag; caption: string; media: Media[];
  title?: string; brand?: string; price?: number; size?: string; condition?: string; shipping?: string; pickup?: boolean;
};

export function useCreateItem() {
  const qc = useQueryClient();
  const { userId } = useAuth();
  return useMutation({
    mutationFn: async (n: NewItem) => (await run(supabase.from('items').insert({ owner_id: userId, ...n }).select('id').single())) as { id: string },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['feed'] }); qc.invalidateQueries({ queryKey: ['userItems'] }); qc.invalidateQueries({ queryKey: ['explore'] }); qc.invalidateQueries({ queryKey: ['discover'] }); },
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (it: Item) => {
      await run(supabase.from('items').delete().eq('id', it.id));
      await deleteMediaFiles(it.media).catch(() => {});
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['feed'] }); qc.invalidateQueries({ queryKey: ['userItems'] }); qc.invalidateQueries({ queryKey: ['explore'] }); qc.invalidateQueries({ queryKey: ['discover'] }); },
  });
}

// ---------- Kommentarer ----------

export function useComments(itemId: string, enabled = true) {
  return useQuery({
    queryKey: ['comments', itemId],
    enabled,
    queryFn: async () => (await run(supabase.from('comments').select('*, user:profiles(*)').eq('item_id', itemId).order('created_at').limit(300))) as Comment[],
  });
}

export function useAddComment(itemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => { await run(supabase.from('comments').insert({ item_id: itemId, body })); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['comments', itemId] }); qc.invalidateQueries({ queryKey: ['item', itemId] }); },
  });
}

export function useDeleteComment(itemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await run(supabase.from('comments').delete().eq('id', id)); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', itemId] }),
  });
}

// ---------- Profiler ----------

export function useProfile(id?: string) {
  return useQuery({
    queryKey: ['profile', id],
    enabled: !!id,
    queryFn: async () => (await run(supabase.from('profiles').select('*').eq('id', id!).maybeSingle())) as Profile | null,
  });
}

export function useFollowCounts(id?: string) {
  return useQuery({
    queryKey: ['followCounts', id],
    enabled: !!id,
    queryFn: async () => {
      const [a, b] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('followee_id', id!),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', id!),
      ]);
      return { followers: a.count ?? 0, following: b.count ?? 0 };
    },
  });
}

export function useReviews(sellerId?: string) {
  return useQuery({
    queryKey: ['reviews', sellerId],
    enabled: !!sellerId,
    queryFn: async () => (await run(supabase.from('reviews').select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)').eq('seller_id', sellerId!).order('created_at', { ascending: false }).limit(100))) as Review[],
  });
}

export async function handleTaken(handle: string, exceptId?: string) {
  const { data } = await supabase.from('profiles').select('id').eq('handle', handle).maybeSingle();
  return !!data && data.id !== exceptId;
}

export async function saveProfile(p: Partial<Profile> & { id: string }) {
  await run(supabase.from('profiles').upsert(p));
}

export async function deleteAccount(uid: string) {
  await deleteAllFiles(uid).catch(() => {});
  await run(supabase.rpc('delete_account'));
  await supabase.auth.signOut();
}

// ---------- Meddelanden ----------

export function useThreads() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['threads', userId],
    enabled: !!userId,
    refetchInterval: isDemo ? 2000 : false,
    queryFn: async () => {
      const [threads, reads] = await Promise.all([
        run(supabase.from('threads').select(THREAD_SELECT).order('updated_at', { ascending: false }).limit(200)),
        run(supabase.from('thread_reads').select('thread_id, read_at').eq('user_id', userId!)),
      ]);
      const readAt = new Map((reads as { thread_id: string; read_at: string }[]).map((r) => [r.thread_id, r.read_at]));
      return (threads as Thread[]).map((t) => ({
        ...t,
        unread: !!t.last_sender_id && t.last_sender_id !== userId && t.updated_at > (readAt.get(t.id) ?? ''),
      }));
    },
  });

  useEffect(() => {
    if (!userId || isDemo) return;
    const ch = supabase
      .channel(`threads-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'threads' }, () => qc.invalidateQueries({ queryKey: ['threads'] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, qc]);

  return q;
}

export function useMessages(threadId: string) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['messages', threadId],
    refetchInterval: isDemo ? 1500 : false,
    queryFn: async () => (await run(supabase.from('messages').select('*').eq('thread_id', threadId).order('created_at').limit(500))) as Message[],
  });
  useEffect(() => {
    if (isDemo) return;
    const ch = supabase
      .channel(`messages-${threadId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `thread_id=eq.${threadId}` }, () => {
        qc.invalidateQueries({ queryKey: ['messages', threadId] });
        qc.invalidateQueries({ queryKey: ['item'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [threadId, qc]);
  return q;
}

/** Hittar eller skapar en tråd med en annan användare (valfritt om ett plagg). */
export async function openThread(me: string, other: string, item?: Item): Promise<string> {
  const buyer = me;
  const seller = item ? item.owner_id : other;
  if (item) {
    const found = await run(supabase.from('threads').select('id').eq('buyer_id', buyer).eq('seller_id', seller).eq('item_id', item.id).maybeSingle()) as { id: string } | null;
    if (found) return found.id;
  } else {
    const found = await run(
      supabase.from('threads').select('id').is('item_id', null)
        .or(`and(buyer_id.eq.${me},seller_id.eq.${other}),and(buyer_id.eq.${other},seller_id.eq.${me})`).limit(1).maybeSingle(),
    ) as { id: string } | null;
    if (found) return found.id;
  }
  const created = await run(supabase.from('threads').insert({ buyer_id: buyer, seller_id: seller, item_id: item?.id ?? null }).select('id').single());
  return (created as unknown as { id: string }).id;
}

export function useChatActions(threadId: string) {
  const qc = useQueryClient();
  const refresh = () => { qc.invalidateQueries({ queryKey: ['messages', threadId] }); qc.invalidateQueries({ queryKey: ['threads'] }); };
  return {
    send: async (body: string) => { await run(supabase.from('messages').insert({ thread_id: threadId, body })); refresh(); },
    offer: async (amount: number) => { await run(supabase.rpc('make_offer', { p_thread: threadId, p_amount: amount })); refresh(); },
    answer: async (messageId: string, action: 'accept' | 'decline' | 'counter', amount?: number) => {
      await run(supabase.rpc('answer_offer', { p_message: messageId, p_action: action, p_amount: amount ?? null }));
      refresh();
      qc.invalidateQueries({ queryKey: ['item'] });
      qc.invalidateQueries({ queryKey: ['userItems'] });
    },
    markRead: async (uid: string) => {
      await supabase.from('thread_reads').upsert({ thread_id: threadId, user_id: uid, read_at: new Date().toISOString() });
      qc.invalidateQueries({ queryKey: ['threads'] });
    },
    review: async (sellerId: string, stars: number, body: string) => {
      await run(supabase.from('reviews').insert({ thread_id: threadId, seller_id: sellerId, stars, body }));
      qc.invalidateQueries({ queryKey: ['reviews', sellerId] });
      qc.invalidateQueries({ queryKey: ['myReview', threadId] });
    },
  };
}

export function useMyReview(threadId: string) {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ['myReview', threadId],
    queryFn: async () => (await run(supabase.from('reviews').select('id').eq('thread_id', threadId).eq('reviewer_id', userId!).maybeSingle())) as unknown as { id: string } | null,
  });
}
