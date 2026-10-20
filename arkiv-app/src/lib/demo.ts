/**
 * Testläge (EXPO_PUBLIC_DEMO=1): en låtsasserver i minnet som svarar på
 * Supabase-anropen, så att förhandsversionen går att klicka runt i utan
 * databas. Används aldrig i App Store-bygget. Exempelbilderna läggs in av
 * förhandsversionens HTML-sida (window.__DEMO_MEDIA), inte i appen.
 */

export const isDemo = process.env.EXPO_PUBLIC_DEMO === '1';

type Row = Record<string, any>;
const g = globalThis as unknown as { __DEMO_MEDIA?: Record<string, string> };
const uploaded = new Map<string, string>();

/** URL för en fil i testlägets lagring. */
export const demoUrl = (path: string) => uploaded.get(path) ?? g.__DEMO_MEDIA?.[path] ?? '';

/** Enkel minneslagring för inloggningen, så att testläget inte behöver localStorage. */
const mem = new Map<string, string>();
export const memoryStorage = {
  getItem: async (k: string) => mem.get(k) ?? null,
  setItem: async (k: string, v: string) => { mem.set(k, v); },
  removeItem: async (k: string) => { mem.delete(k); },
};

// ---------- Exempeldata ----------

const ME = 'demo-du';
const t0 = Date.now();
const ago = (min: number) => new Date(t0 - min * 60000).toISOString();
const prof = (id: string, handle: string, name: string, avatar: string | null, bio = '', city = 'Stockholm') =>
  ({ id, handle, name, bio, city, avatar_path: avatar, created_at: ago(9000) });
const img = (n: string) => ({ path: `${n}.jpg`, type: 'image' });
const vid = (n: string) => ({ path: `vid-${n}.mp4`, type: 'video', poster: `${n}.jpg` });

let seq = 1;
const id = (p: string) => `${p}-${Date.now().toString(36)}-${seq++}`;

const db: Record<string, Row[]> = {
  profiles: [
    prof(ME, 'du.testar', 'Du Testar', null, 'Det här är ditt testkonto. Lägg upp något och se hur det blir!'),
    prof('demo-amelia', 'ameliacmode', 'Amelia C', 'av-amelia.jpg', 'Svart, vintage och kaffe.'),
    prof('demo-sofia', 'sofialbrandz', 'Sofia Brandt', 'av-sofia.jpg', 'Säljer ur garderoben varje söndag.', 'Göteborg'),
    prof('demo-filip', 'filipberg', 'Filip Berg', 'av-lucas2.jpg', 'Rockar och långa promenader.'),
    prof('demo-milo', 'milostrand', 'Milo Strand', 'av-daniel.jpg', 'Sneakers.'),
    prof('demo-linn', 'linnahlborg', 'Linn Ahlborg', 'av-hanna.jpg', 'Stickat och keramik.', 'Malmö'),
  ],
  items: [
    { id: 'd1', owner_id: 'demo-amelia', kind: 'post', tag: 'OOTD', caption: 'Svart på svart inför hösten. Kavajen är vintage.', media: [vid('amelia-post'), img('amelia-sitting'), img('amelia-feed')], created_at: ago(4) },
    { id: 'd2', owner_id: 'demo-sofia', kind: 'sale', tag: 'Sälj', caption: 'Tvättat linne, rak passform. Använd en sommar.', media: [img('linneskjorta')], title: 'Linneskjorta', brand: 'Our Legacy', price: 750, size: 'M', condition: 'Mycket gott skick', shipping: 'Frakt via PostNord', pickup: true, created_at: ago(35) },
    { id: 'd3', owner_id: 'demo-filip', kind: 'post', tag: 'Inlägg', caption: 'Lång rock, lång promenad. Gamla stan i oktober.', media: [vid('filip-feed')], created_at: ago(80) },
    { id: 'd4', owner_id: 'demo-sofia', kind: 'sale', tag: 'Sälj', caption: 'Tjock ullkvalitet, perfekt som lätt jacka.', media: [img('gron-overshirt')], title: 'Overshirt i ull', brand: 'Norse Projects', price: 900, size: 'L', condition: 'Gott skick', shipping: 'Frakt via PostNord', created_at: ago(140) },
    { id: 'd5', owner_id: 'demo-milo', kind: 'sale', tag: 'Sälj', caption: 'Använda ett fåtal gånger, kartong finns.', media: [img('salomon')], title: 'XT-6', brand: 'Salomon', price: 1400, size: '42', condition: 'Mycket gott skick', shipping: 'Frakt via DHL', created_at: ago(200) },
    { id: 'd6', owner_id: 'demo-linn', kind: 'sale', tag: 'Sälj', caption: 'Varm och mjuk, ingen nopprighet.', media: [img('levis-stickat')], title: 'Kabelstickad tröja', brand: "Levi's", price: 520, size: 'M', condition: 'Mycket gott skick', shipping: 'Frakt via Instabox', pickup: true, created_at: ago(260) },
    { id: 'd7', owner_id: 'demo-amelia', kind: 'post', tag: 'Inlägg', caption: 'Mjukt stickat och vida byxor.', media: [vid('nytt-inlagg'), img('promenad')], created_at: ago(400) },
    { id: 'd8', owner_id: ME, kind: 'sale', tag: 'Sälj', caption: 'Använd ett fåtal gånger, inga fläckar. Sitter lite oversize.', media: [img('overshirt-big')], title: 'Overshirt', brand: 'Arket', price: 600, size: 'M', condition: 'Mycket gott skick', shipping: 'Frakt via PostNord', pickup: true, created_at: ago(600) },
    { id: 'd9', owner_id: 'demo-milo', kind: 'sale', tag: 'Sälj', caption: 'Keps i tvättad bomull.', media: [img('nike-keps')], title: 'Keps', brand: 'Nike', price: 290, size: 'One size', condition: 'Gott skick', shipping: 'Frakt via PostNord', created_at: ago(900) },
    { id: 'd10', owner_id: 'demo-linn', kind: 'post', tag: 'Review', caption: 'Acne-stickan efter fem år. Håller fortfarande!', media: [img('acne-stickat')], created_at: ago(1200) },
    { id: 'd11', owner_id: 'demo-filip', kind: 'post', tag: 'OOTD', caption: 'Mörk jacka, ljus polo. Dagens.', media: [vid('svart-jacka')], created_at: ago(1400) },
    { id: 'd12', owner_id: 'demo-sofia', kind: 'sale', tag: 'Sälj', caption: 'Så här sitter den på. Ull, kraftig kvalitet.', media: [vid('gron-overshirt'), img('gron-overshirt')], title: 'Ulloverskjorta', brand: 'Sunflower', price: 1200, size: 'M', condition: 'Gott skick', shipping: 'Frakt via PostNord', created_at: ago(1600) },
    { id: 'd13', owner_id: 'demo-milo', kind: 'post', tag: 'Review', caption: 'XT-6 efter ett år. Fortfarande favoriten.', media: [vid('salomon')], created_at: ago(1800) },
    { id: 'd14', owner_id: 'demo-linn', kind: 'sale', tag: 'Sälj', caption: 'Stickat i närbild.', media: [vid('levis-stickat')], title: 'Stickad cardigan', brand: 'COS', price: 450, size: 'S', condition: 'Mycket gott skick', shipping: 'Frakt via Instabox', created_at: ago(2000) },
    { id: 'd15', owner_id: 'demo-amelia', kind: 'sale', tag: 'Sälj', caption: 'Svart skinnväska, rymmer en laptop.', media: [img('svart-vaska')], title: 'Skinnväska', brand: 'Filippa K', price: 700, size: 'One size', condition: 'Mycket gott skick', shipping: 'Frakt via PostNord', created_at: ago(2200) },
    { id: 'd16', owner_id: 'demo-filip', kind: 'sale', tag: 'Sälj', caption: 'Vida byxor med pressveck.', media: [img('svarta-byxor')], title: 'Vida byxor', brand: 'Totême', price: 400, size: 'S', condition: 'Gott skick', shipping: 'Frakt via PostNord', created_at: ago(2400) },
    { id: 'd17', owner_id: 'demo-milo', kind: 'sale', tag: 'Sälj', caption: 'Gråa klassiker.', media: [img('nb-sneakers')], title: '990v6', brand: 'New Balance', price: 1100, size: '43', condition: 'Gott skick', shipping: 'Frakt via DHL', created_at: ago(2600) },
    { id: 'd18', owner_id: 'demo-linn', kind: 'post', tag: 'Inlägg', caption: 'Söndag.', media: [img('plant'), img('fav-elladella')], created_at: ago(2800) },
  ].map((x) => ({ title: null, brand: null, price: null, size: null, condition: null, shipping: null, pickup: false, sold: false, ...x })),
  follows: [
    { follower_id: ME, followee_id: 'demo-amelia', created_at: ago(5000) },
    { follower_id: ME, followee_id: 'demo-sofia', created_at: ago(5000) },
    { follower_id: ME, followee_id: 'demo-filip', created_at: ago(5000) },
    { follower_id: 'demo-amelia', followee_id: ME, created_at: ago(5000) },
  ],
  likes: [{ user_id: 'demo-sofia', item_id: 'd1' }, { user_id: 'demo-filip', item_id: 'd1' }, { user_id: 'demo-amelia', item_id: 'd3' }],
  saves: [],
  blocks: [],
  reports: [],
  comments: [
    { id: 'c1', item_id: 'd1', user_id: 'demo-sofia', body: 'Är kavajen till salu? Vilken storlek?', created_at: ago(3) },
    { id: 'c2', item_id: 'd1', user_id: 'demo-amelia', body: 'Inte än, men kanske snart!', created_at: ago(2) },
  ],
  threads: [{ id: 't1', item_id: 'd8', buyer_id: 'demo-sofia', seller_id: ME, last_message: 'Bud 500 kr', last_sender_id: 'demo-sofia', created_at: ago(40), updated_at: ago(6) }],
  thread_reads: [],
  messages: [
    { id: 'm1', thread_id: 't1', sender_id: 'demo-sofia', body: 'Hej! Finns overshirten kvar?', created_at: ago(40) },
    { id: 'm2', thread_id: 't1', sender_id: ME, body: 'Hej! Ja, den finns kvar.', created_at: ago(30) },
    { id: 'm3', thread_id: 't1', sender_id: 'demo-sofia', offer_kind: 'Bud', offer_amount: 500, offer_state: 'open', created_at: ago(6) },
  ].map((m) => ({ body: null, offer_kind: null, offer_amount: null, offer_state: null, system: false, ...m })),
  reviews: [
    { id: 'r1', thread_id: 'x1', seller_id: ME, reviewer_id: 'demo-amelia', stars: 5, body: 'Precis som beskrivet och snabb frakt.', created_at: ago(4000) },
    { id: 'r2', thread_id: 'x2', seller_id: 'demo-sofia', reviewer_id: 'demo-filip', stars: 5, body: 'Smidig affär!', created_at: ago(6000) },
  ],
};

const profile = (pid: string | null) => db.profiles.find((p) => p.id === pid);

/** Tabeller med inbäddade relationer, som PostgREST skulle ge. */
function rowsFor(table: string): Row[] {
  if (table === 'items') {
    return db.items.map((it) => ({
      ...it,
      owner: profile(it.owner_id),
      likes: [{ count: db.likes.filter((l) => l.item_id === it.id).length }],
      comments: [{ count: db.comments.filter((c) => c.item_id === it.id).length }],
    }));
  }
  if (table === 'threads') {
    return db.threads.map((t) => ({ ...t, item: db.items.find((i) => i.id === t.item_id) ?? null, buyer: profile(t.buyer_id), seller: profile(t.seller_id) }));
  }
  if (table === 'comments') return db.comments.map((c) => ({ ...c, user: profile(c.user_id) }));
  if (table === 'reviews') return db.reviews.map((r) => ({ ...r, reviewer: profile(r.reviewer_id) }));
  return db[table] ?? [];
}

// ---------- PostgREST-filter ----------

function splitTop(s: string) {
  const out: string[] = [];
  let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

function test(row: Row, col: string, op: string, val: string): boolean {
  const v = row[col];
  if (op === 'eq') return String(v) === val;
  if (op === 'neq') return String(v) !== val;
  if (op === 'is') return val === 'null' ? v == null : String(v) === val;
  if (op === 'in') return val.replace(/^\(|\)$/g, '').split(',').map((x) => x.replace(/"/g, '')).includes(String(v));
  if (op === 'ilike') return String(v ?? '').toLowerCase().includes(val.replace(/%/g, '').toLowerCase());
  return true;
}

function clause(row: Row, c: string): boolean {
  if (c.startsWith('and(')) return splitTop(c.slice(4, -1)).every((x) => clause(row, x));
  if (c.startsWith('or(')) return splitTop(c.slice(3, -1)).some((x) => clause(row, x));
  const [col, op, ...rest] = c.split('.');
  return test(row, col, op, rest.join('.'));
}

function applyFilters(list: Row[], params: URLSearchParams) {
  for (const [k, v] of params) {
    if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].includes(k)) continue;
    if (k === 'or') { const parts = splitTop(v.slice(1, -1)); list = list.filter((r) => parts.some((p) => clause(r, p))); continue; }
    const [op, ...rest] = v.split('.');
    list = list.filter((r) => test(r, k, op, rest.join('.')));
  }
  const ord = params.get('order');
  if (ord) {
    const [col, dir] = ord.split('.');
    list = [...list].sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (dir === 'desc' ? -1 : 1));
  }
  const lim = params.get('limit');
  return lim ? list.slice(0, +lim) : list;
}

// ---------- Inloggning ----------

let current: string | null = null;
const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
function session(uid: string, email: string) {
  current = uid;
  const exp = Math.floor(Date.now() / 1000) + 24 * 3600;
  const user = { id: uid, aud: 'authenticated', role: 'authenticated', email, app_metadata: { provider: 'email' }, user_metadata: {}, created_at: ago(9000) };
  return { access_token: `${b64({ alg: 'none' })}.${b64({ sub: uid, exp, role: 'authenticated' })}.demo`, token_type: 'bearer', expires_in: 24 * 3600, expires_at: exp, refresh_token: 'demo', user };
}

// ---------- Bud ----------

const push = (m: Row): Row => {
  const msg: Row = { id: id('m'), body: null, offer_kind: null, offer_amount: null, offer_state: null, system: false, created_at: new Date().toISOString(), ...m };
  db.messages.push(msg);
  const t = db.threads.find((x) => x.id === msg.thread_id);
  if (t) Object.assign(t, { updated_at: msg.created_at, last_sender_id: msg.sender_id, last_message: msg.offer_kind ? `${msg.offer_kind} ${msg.offer_amount} kr` : String(msg.body ?? '').slice(0, 140) });
  return msg;
};

function accept(m: Row, by: string) {
  m.offer_state = 'accepted';
  const t = db.threads.find((x) => x.id === m.thread_id)!;
  const it = db.items.find((x) => x.id === t.item_id);
  if (it) it.sold = true;
  return push({ thread_id: t.id, sender_id: by, body: `Affär klar · ${m.offer_amount} kr`, system: true });
}

/** Den andra personen svarar efter en stund, så att man ser hur bud fungerar. */
function otherReplies(threadId: string) {
  setTimeout(() => {
    const t = db.threads.find((x) => x.id === threadId);
    const open = [...db.messages].reverse().find((m) => m.thread_id === threadId && m.offer_state === 'open' && m.sender_id === current);
    if (!t || !open) return;
    const other = t.buyer_id === current ? t.seller_id : t.buyer_id;
    const it = db.items.find((x) => x.id === t.item_id);
    if (!it) return;
    if (open.offer_amount >= it.price * 0.9 || open.offer_kind === 'Motbud') {
      push({ thread_id: threadId, sender_id: other, body: `Det låter bra, ${open.offer_amount} kr funkar!` });
      accept(open, other);
    } else {
      open.offer_state = 'countered';
      const counter = Math.round((open.offer_amount + it.price) / 20) * 10;
      push({ thread_id: threadId, sender_id: other, body: `Tack för budet! Jag kan gå ner till ${counter} kr.` });
      push({ thread_id: threadId, sender_id: other, offer_kind: 'Motbud', offer_amount: counter, offer_state: 'open' });
    }
  }, 2500);
}

function rpc(fn: string, body: Row): Row | null {
  if (fn === 'make_offer') {
    db.messages.filter((m) => m.thread_id === body.p_thread && m.offer_state === 'open').forEach((m) => { m.offer_state = 'declined'; });
    const m = push({ thread_id: body.p_thread, sender_id: current, offer_kind: 'Bud', offer_amount: body.p_amount, offer_state: 'open' });
    otherReplies(body.p_thread);
    return m;
  }
  if (fn === 'answer_offer') {
    const m = db.messages.find((x) => x.id === body.p_message);
    if (!m || m.offer_state !== 'open') throw new Error('Budet är inte längre öppet');
    if (body.p_action === 'accept') return accept(m, current!);
    if (body.p_action === 'decline') { m.offer_state = 'declined'; return m; }
    m.offer_state = 'countered';
    const r = push({ thread_id: m.thread_id, sender_id: current, offer_kind: 'Motbud', offer_amount: body.p_amount, offer_state: 'open' });
    otherReplies(m.thread_id);
    return r;
  }
  if (fn === 'delete_account') {
    for (const t of Object.keys(db)) db[t] = db[t].filter((r) => !Object.values(r).includes(current));
    return null;
  }
  return null;
}

// ---------- fetch ----------

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(data === undefined ? null : JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...headers } });

/** Svarar på Supabase-klientens anrop som om det vore en riktig server. */
export async function demoFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const req = new Request(input, init);
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;
  await new Promise((r) => setTimeout(r, 120)); // lite nätverkskänsla

  if (path.startsWith('/auth/v1/')) {
    if (path.endsWith('/token')) {
      const body = await req.json().catch(() => ({}));
      if (url.searchParams.get('grant_type') === 'refresh_token') return json(session(current ?? ME, 'du@testlage.se'));
      return json(session(ME, body.email ?? 'du@testlage.se'));
    }
    if (path.endsWith('/otp')) return json({});
    if (path.endsWith('/verify')) {
      const body = await req.json();
      const existing = (body.email ?? '').startsWith('du') ? ME : `demo-user-${btoa(body.email ?? 'ny').slice(0, 8)}`;
      return json(session(existing, body.email));
    }
    if (path.endsWith('/logout')) { current = null; return new Response(null, { status: 204 }); }
    if (path.endsWith('/user')) return json(session(current ?? ME, 'du@testlage.se').user);
    return json({});
  }

  if (path.startsWith('/storage/v1/object/')) {
    const rest = path.replace('/storage/v1/object/', '');
    if (method === 'POST' && rest.startsWith('list/')) return json([]);
    if (method === 'POST' || method === 'PUT') {
      const filePath = decodeURIComponent(rest.replace(/^media\//, ''));
      const blob = await req.blob();
      const type = /\.(mp4|mov)$/i.test(filePath) ? 'video/mp4' : 'image/jpeg';
      uploaded.set(filePath, URL.createObjectURL(new Blob([blob], { type })));
      return json({ Key: `media/${filePath}`, path: filePath, id: id('f') });
    }
    if (method === 'DELETE') return json([]);
    return json({});
  }

  if (path.startsWith('/rest/v1/rpc/')) {
    try {
      const body = await req.json().catch(() => ({}));
      return json(rpc(path.split('/').pop()!, body));
    } catch (e) {
      return json({ message: e instanceof Error ? e.message : 'Fel', code: 'P0001' }, 400);
    }
  }

  if (path.startsWith('/rest/v1/')) {
    const table = path.replace('/rest/v1/', '');
    const prefer = req.headers.get('Prefer') ?? '';
    const wantsObject = (req.headers.get('Accept') ?? '').includes('vnd.pgrst.object');

    if (method === 'GET' || method === 'HEAD') {
      const list = applyFilters(rowsFor(table), url.searchParams);
      if (prefer.includes('count=exact') && method === 'HEAD') return new Response(null, { status: 200, headers: { 'Content-Range': `0-${Math.max(0, list.length - 1)}/${list.length}` } });
      if (wantsObject) return list.length ? json(list[0]) : json({ code: 'PGRST116', message: 'Inga rader' }, 406);
      return json(list, 200, prefer.includes('count=exact') ? { 'Content-Range': `0-${Math.max(0, list.length - 1)}/${list.length}` } : {});
    }

    if (method === 'POST') {
      const body = await req.json();
      const rows: Row[] = Array.isArray(body) ? body : [body];
      const saved: Row[] = [];
      for (const r of rows) {
        const now = new Date().toISOString();
        const defaults: Record<string, Row> = {
          items: { id: id('i'), owner_id: current, sold: false, pickup: false, title: null, brand: null, price: null, size: null, condition: null, shipping: null, created_at: now },
          comments: { id: id('c'), user_id: current, created_at: now },
          messages: { sender_id: current },
          threads: { id: id('t'), last_message: '', last_sender_id: null, created_at: now, updated_at: now },
          likes: { user_id: current, created_at: now }, saves: { user_id: current, created_at: now },
          follows: { follower_id: current, created_at: now }, blocks: { blocker_id: current, created_at: now },
          reviews: { id: id('r'), reviewer_id: current, created_at: now }, reports: { id: id('rep'), reporter_id: current, created_at: now },
          profiles: { bio: '', city: '', avatar_path: null, created_at: now },
          thread_reads: {},
        };
        const row = { ...(defaults[table] ?? {}), ...r };
        if (table === 'messages') { saved.push(push(row)); continue; }
        const keyCols: Record<string, string[]> = { profiles: ['id'], thread_reads: ['thread_id', 'user_id'] };
        const keys = keyCols[table];
        const existing = keys && prefer.includes('merge-duplicates') ? (db[table] ??= []).find((x) => keys.every((k) => x[k] === row[k])) : undefined;
        if (existing) { Object.assign(existing, r); saved.push(existing); } else { (db[table] ??= []).push(row); saved.push(row); }
      }
      const out = applyFilters(saved.map((s) => rowsFor(table).find((x) => x.id && x.id === s.id) ?? s), new URLSearchParams());
      if (!prefer.includes('return=representation')) return new Response(null, { status: 201 });
      return wantsObject ? json(out[0], 201) : json(out, 201);
    }

    if (method === 'PATCH') {
      const patch = await req.json();
      const matching = applyFilters(db[table] ?? [], url.searchParams);
      matching.forEach((r) => Object.assign(r, patch));
      return prefer.includes('return=representation') ? json(matching) : new Response(null, { status: 204 });
    }

    if (method === 'DELETE') {
      const remove = new Set(applyFilters(db[table] ?? [], url.searchParams));
      db[table] = (db[table] ?? []).filter((r) => !remove.has(r));
      return new Response(null, { status: 204 });
    }
  }

  return json({ message: 'Okänd adress i testläget' }, 404);
}
