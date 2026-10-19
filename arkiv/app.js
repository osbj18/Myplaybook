/* ARKIV — klickbar prototyp. Ren HTML/CSS/JS utan beroenden. */
(() => {
  'use strict';

  const IMG = (n) => `img/${n}.jpg`;

  // ---------- Ikoner ----------
  const I = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="13" cy="10" r="5"/><path d="m9.5 13.5-5 5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5h4"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m14.5 6-6 6 6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6.5 3.5h11v17L12 16l-5.5 4.5z"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3.5 21.5 12 3 20.5l3.2-8.5z"/></svg>',
    flip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9a7 7 0 0 0-12.5-2.5L5 8M5 4v4h4M5 15a7 7 0 0 0 12.5 2.5L19 16M19 20v-4h-4"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 17 17 7M9 7h8v8"/></svg>',
    chev: '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="m2.5 4 2.5 2.5L7.5 4"/></svg>',
    check: '<svg class="verified" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="m7.5 12.3 3 3 6-6.3" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>',
  };

  // ---------- Data ----------
  const ME = 'duandersson';

  const USERS = {
    duandersson: { name: 'Du Andersson', avatar: null, initials: 'DU' },
    sofialbrandz: { name: 'Sofia Brandt', avatar: IMG('av-sofia') },
    ameliacmode: { name: 'Amelia C', avatar: IMG('av-amelia') },
    filipberg: { name: 'Filip Berg', avatar: IMG('av-lucas2') },
    emilynparis: { name: 'Emily N', avatar: IMG('emily') },
    linnahlborg: { name: 'Linn Ahlborg', avatar: IMG('av-hanna') },
    milostrand: { name: 'Milo Strand', avatar: IMG('av-daniel') },
    elladella: { name: 'Ella Della', avatar: IMG('av-emma') },
    oscarhed: { name: 'Oscar Hed', avatar: IMG('av-oskar') },
    sofia: { name: 'Sofia Lindgren', avatar: IMG('av-sofia'), online: true },
    erik: { name: 'Erik Johansson', avatar: IMG('av-erik2') },
    maja: { name: 'Maja Karlsson', avatar: IMG('av-maja2') },
    lucas: { name: 'Lucas Berg', avatar: IMG('av-lucas2') },
    emma: { name: 'Emma Nilsson', avatar: IMG('av-emma') },
    daniel: { name: 'Daniel Lund', avatar: IMG('av-daniel') },
    hanna: { name: 'Hanna Sjöberg', avatar: IMG('av-hanna') },
    oskar: { name: 'Oskar Vik', avatar: IMG('av-oskar') },
  };

  const FAVORITES = [
    { user: 'emilynparis', img: IMG('fav-emilynparis'), story: IMG('emily') },
    { user: 'linnahlborg', img: IMG('fav-linnahlborg'), story: IMG('plant') },
    { user: 'milostrand', img: IMG('fav-milostrand'), story: IMG('fav-milostrand') },
    { user: 'elladella', img: IMG('fav-elladella'), story: IMG('fav-elladella') },
    { user: 'oscarhed', img: IMG('fav-oscarhed'), story: IMG('fav-oscarhed') },
  ];

  const seedItems = () => [
    { id: 'linne', kind: 'sale', owner: 'sofialbrandz', images: [IMG('linneskjorta')], title: 'Linneskjorta', brand: 'Our Legacy', price: 750, size: 'M', cond: 'Mycket gott skick', ship: 59, desc: 'Tvättat linne, rak passform. Använd en sommar.', material: 'Linne', measure: 'Axel 47 · Längd 76 cm', color: 'Sand', posted: '1 dag sedan' },
    { id: 'grön', kind: 'sale', owner: 'sofialbrandz', images: [IMG('gron-overshirt')], title: 'Overshirt i ull', brand: 'Norse Projects', price: 900, size: 'L', cond: 'Gott skick', ship: 59, desc: 'Tjock ullkvalitet, perfekt som lätt jacka på hösten.', material: 'Ull', measure: 'Axel 50 · Längd 75 cm', color: 'Mossgrön', posted: '2 dagar sedan' },
    { id: 'amelia', kind: 'post', owner: 'ameliacmode', images: [IMG('amelia-post'), IMG('amelia-sitting'), IMG('amelia-feed'), IMG('fav-emilynparis')], caption: 'Svart på svart inför hösten. Kavajen är vintage och säljs i min garderob.', likes: 4100, saves: 492, time: '2 min' },
    { id: 'filip', kind: 'post', owner: 'filipberg', images: [IMG('filip-feed'), IMG('fav-oscarhed')], caption: 'Lång rock, lång promenad. Gamla stan i oktober.', likes: 1820, saves: 133, time: '1 tim' },
    { id: 'overshirt', kind: 'sale', owner: ME, images: [IMG('overshirt-big')], thumb: IMG('overshirt'), title: 'Overshirt', brand: 'Arket', price: 600, size: 'M', cond: 'Mycket gott skick', ship: 59, desc: 'Använd ett fåtal gånger, inga fläckar eller hål. Sitter lite oversize – passar S–M. Kan mötas i Stockholm.', material: 'Ullblandning', measure: 'Axel 48 · Längd 74 cm', color: 'Olivbrun', posted: '3 dagar sedan' },
    { id: 'promenad', kind: 'post', owner: ME, images: [IMG('promenad')], caption: 'Mjukt stickat och vida byxor. Väskan är tagen i bilden.', likes: 312, saves: 28, time: '4 dagar' },
    { id: 'nb', kind: 'sale', owner: ME, images: [IMG('nb-sneakers')], title: '990v6', brand: 'New Balance', price: 1100, size: '43', cond: 'Gott skick', ship: 79, desc: 'Gråa klassiker, nya sulor kvar länge.', material: 'Mocka/mesh', measure: 'EU 43', color: 'Grå', posted: '5 dagar sedan' },
    { id: 'svartjacka', kind: 'post', owner: ME, images: [IMG('svart-jacka')], caption: 'Mörk jacka, ljus polo.', likes: 241, saves: 19, time: '1 v' },
    { id: 'linne2', kind: 'sale', owner: ME, images: [IMG('linneskjorta')], title: 'Linneskjorta', brand: 'COS', price: 450, size: 'M', cond: 'Mycket gott skick', ship: 59, desc: 'Ljus linneskjorta med två bröstfickor.', material: 'Linne', measure: 'Axel 46 · Längd 74 cm', color: 'Natur', posted: '1 v sedan' },
    { id: 'grön2', kind: 'sale', owner: ME, images: [IMG('gron-overshirt')], title: 'Overshirt', brand: 'Sunflower', price: 1200, size: 'M', cond: 'Gott skick', ship: 59, desc: 'Grön ull-overshirt, kraftig kvalitet.', material: 'Ull', measure: 'Axel 48 · Längd 73 cm', color: 'Grön', posted: '1 v sedan' },
    { id: 'byxor', kind: 'sale', owner: ME, images: [IMG('svarta-byxor')], thumb: IMG('byxor'), title: 'Vida byxor', brand: 'Totême', price: 400, size: 'S', cond: 'Gott skick', ship: 59, desc: 'Svarta vida byxor med pressveck.', material: 'Ullblandning', measure: 'Midja 74 · Innerben 80 cm', color: 'Svart', posted: '2 v sedan' },
    { id: 'acne', kind: 'post', owner: ME, images: [IMG('acne-stickat')], caption: 'Favoritstickan sedan 2019.', likes: 198, saves: 11, time: '2 v' },
    { id: 'vaska', kind: 'sale', owner: ME, images: [IMG('svart-vaska')], thumb: IMG('vaska'), title: 'Skinnväska', brand: 'Filippa K', price: 700, size: 'One size', cond: 'Mycket gott skick', ship: 79, desc: 'Svart skinn, rymmer en laptop.', material: 'Läder', measure: '38 × 30 cm', color: 'Svart', posted: '3 v sedan' },
    { id: 'sneakers', kind: 'sale', owner: ME, images: [IMG('sneakers-du')], title: 'Låga sneakers', brand: 'Rick Owens', price: 550, size: '42', cond: 'Använt', ship: 79, desc: 'Kontrastsula, välvårdade.', material: 'Läder/canvas', measure: 'EU 42', color: 'Brun/kräm', posted: '3 v sedan' },
    // Utforska
    { id: 'xt6', kind: 'sale', owner: 'milostrand', images: [IMG('salomon')], title: 'XT-6', brand: 'Salomon', price: 1400, size: '42', cond: 'Mycket gott skick', ship: 79, desc: 'Använda ett fåtal gånger, kartong finns.', material: 'Mesh', measure: 'EU 42', color: 'Vintage khaki', posted: '6 tim sedan', explore: true },
    { id: 'nike', kind: 'sale', owner: 'oscarhed', images: [IMG('nike-keps')], title: 'Dunk Low', brand: 'Nike', price: 990, size: 'One size', cond: 'Gott skick', ship: 49, desc: 'Keps i tvättad bomull, justerbar.', material: 'Bomull', measure: 'Justerbar', color: 'Mörkgrön', posted: '1 dag sedan', explore: true },
    { id: 'levis', kind: 'sale', owner: 'linnahlborg', images: [IMG('levis-stickat')], title: 'Kabelstickad tröja', brand: "Levi's", price: 520, size: 'M', cond: 'Mycket gott skick', ship: 59, desc: 'Varm och mjuk, ingen nopprighet.', material: 'Ullblandning', measure: 'Bröst 56 · Längd 66 cm', color: 'Beige', posted: '2 dagar sedan', explore: true },
    { id: 'stussy', kind: 'sale', owner: 'elladella', images: [IMG('stussy-keps')], title: 'Ram-keps', brand: 'Stüssy', price: 450, size: 'One size', cond: 'Ny med lapp', ship: 49, desc: 'Oanvänd, lappen kvar.', material: 'Bomull', measure: 'Justerbar', color: 'Svart', posted: '3 dagar sedan', explore: true },
  ];

  const FOLLOWING_FEED = ['linne', 'grön', 'amelia', 'filip', 'overshirt', 'promenad'];

  const seedComments = () => ({
    amelia: [
      { user: 'erik', text: 'Är kavajen fortfarande till salu? Vilken storlek?', time: '1 tim', likes: 3 },
      { user: 'ameliacmode', text: 'Ja! Storlek M, den är taggad i bilden.', time: '52 min', reply: true, creator: true, likes: 5 },
      { user: 'maja', text: 'Snygg kombo med byxorna.', time: '40 min', likes: 1 },
      { user: 'lucas', text: 'Var är byxorna ifrån?', time: '12 min', likes: 0 },
    ],
    filip: [{ user: 'oskar', text: 'Vilken rock! Märke?', time: '20 min', likes: 2 }],
  });

  const seedThreads = () => [
    { id: 'sofia', with: 'sofia', role: 'buyer', item: 'overshirt', time: '09:41', unread: true, messages: [
      { from: 'them', text: 'Hej! Är den här fortfarande till salu?', time: '09:12' },
      { from: 'me', text: 'Hej! Ja, den finns kvar.', time: '09:13' },
      { from: 'them', text: 'Toppen! Skulle du kunna tänka dig 500 kr?', time: '09:15' },
      { from: 'them', offer: { kind: 'Bud', amount: 500, state: 'answered' }, time: '09:20' },
      { from: 'me', text: 'Jag kan möta dig på 550 kr. Vad säger du?', time: '09:20' },
      { from: 'me', offer: { kind: 'Motbud', amount: 550, state: 'agreed' }, time: '09:20' },
      { from: 'them', text: 'Perfekt, då säger vi 550 kr! Kan vi ses imorgon?', time: '09:21' },
    ] },
    { id: 'erik', with: 'erik', role: 'seller', time: 'Igår', messages: [{ from: 'me', text: 'Swishar ikväll!', time: 'Igår' }, { from: 'them', text: 'Tack!', time: 'Igår' }] },
    { id: 'maja', with: 'maja', role: 'buyer', item: 'byxor', time: 'Igår', messages: [{ from: 'them', text: 'Är den fortfarande kvar?', time: 'Igår' }] },
    { id: 'lucas', with: 'lucas', role: 'buyer', item: 'nb', time: 'Igår', messages: [{ from: 'them', offer: { kind: 'Bud', amount: 950, state: 'open' }, time: 'Igår' }] },
    { id: 'emma', with: 'emma', role: 'seller', time: 'Tis', messages: [{ from: 'me', text: 'Skickar den på torsdag.', time: 'Tis' }, { from: 'them', text: 'Super, hör av mig!', time: 'Tis' }] },
    { id: 'daniel', with: 'daniel', role: 'seller', time: 'Tis', messages: [{ from: 'them', text: 'Kan mötas i veckan', time: 'Tis' }] },
    { id: 'hanna', with: 'hanna', role: 'buyer', item: 'vaska', time: 'Mån', messages: [{ from: 'me', text: 'Paketet är skickat.', time: 'Mån' }, { from: 'them', text: 'Tack så mycket!', time: 'Mån' }] },
    { id: 'oskar', with: 'oskar', role: 'buyer', item: 'sneakers', time: 'Mån', messages: [{ from: 'them', text: 'Är den i bra skick?', time: 'Mån' }] },
  ];

  const REVIEWS = [
    { user: 'sofia', stars: 5, when: '3 dagar sedan', text: 'Precis som beskrivet och supersnabb frakt. Rekommenderas varmt.' },
    { user: 'erik', stars: 5, when: '1 vecka sedan', text: 'Smidig affär, svarade snabbt på alla frågor om måtten.' },
    { user: 'emma', stars: 4, when: '2 veckor sedan', text: 'Fint plagg, paketet dröjde en dag extra.' },
    { user: 'oskar', stars: 5, when: '1 månad sedan', text: 'Ännu bättre skick än på bilderna.' },
  ];

  const CAMERA_ROLL = ['nytt-inlagg', 'overshirt', 'svart-jacka', 'nb-sneakers', 'linneskjorta', 'gron-overshirt', 'svarta-byxor', 'acne-stickat', 'svart-vaska', 'amelia-sitting', 'plant', 'salomon', 'levis-stickat', 'filip-feed', 'nike-keps', 'amelia-post'].map(IMG);

  // ---------- State ----------
  const fresh = () => ({
    items: seedItems(),
    comments: seedComments(),
    threads: seedThreads(),
    liked: {}, saved: {}, hearted: {}, likedComments: {}, seenStories: {},
    following: { sofialbrandz: true, ameliacmode: true, filipberg: true },
    feed: FOLLOWING_FEED.slice(),
  });
  let S = fresh();
  let stack = [{ name: 'home', params: {} }];
  const ui = { slide: 0, exploreQuery: '', exploreFilter: null, msgTab: 'Alla', profTab: 'Profil', profFilter: 'Alla', camMode: 'Inlägg', camFlip: false, pick: [], postType: 'Inlägg', draft: null };

  const $ = (sel, root = document) => root.querySelector(sel);
  const app = $('#app'), screen = $('#screen'), tabbar = $('#tabbar'), layer = $('#layer');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const kr = (n) => `${Number(n).toLocaleString('sv-SE')} kr`;
  const fmtCount = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.', ',').replace(',0', '')}K` : String(n));
  const item = (id) => S.items.find((x) => x.id === id);
  const user = (h) => USERS[h] || { name: h, avatar: null, initials: h.slice(0, 2).toUpperCase() };
  const now = () => new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  const avatar = (h, cls = 'avatar') => {
    const u = user(h);
    return u.avatar ? `<img class="${cls}" src="${u.avatar}" alt="">` : `<span class="${cls} init">${esc(u.initials || h.slice(0, 2).toUpperCase())}</span>`;
  };

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
  }

  // ---------- Navigation ----------
  const TABS = [
    { name: 'home', label: 'Hem', icon: I.home },
    { name: 'explore', label: 'Utforska', icon: I.search },
    { name: 'camera', label: 'Skapa', icon: I.plus },
    { name: 'messages', label: 'Meddelanden', icon: I.chat },
    { name: 'profile', label: 'Profil', icon: I.user },
  ];
  const TAB_OF = { home: 'home', post: 'home', listing: 'home', explore: 'explore', messages: 'messages', chat: 'messages', profile: 'profile', camera: 'camera' };
  const NO_TABBAR = new Set(['chat', 'camera', 'picker', 'sell']);

  function go(name, params = {}) { closeSheet(true); stack.push({ name, params }); ui.slide = 0; render(true); }
  function tab(name) { closeSheet(true); stack = [{ name, params: name === 'profile' ? { user: ME } : {} }]; render(true); }
  function back() { closeSheet(true); if (stack.length > 1) stack.pop(); ui.slide = 0; render(true); }
  const cur = () => stack[stack.length - 1];

  function render(resetScroll) {
    const { name, params } = cur();
    const view = VIEWS[name];
    const scroll = screen.scrollTop;
    const out = view(params);
    screen.className = 'screen' + (out.full ? ' full' : '') + (out.noscroll ? ' noscroll' : '');
    app.classList.toggle('dark', !!out.dark);
    app.classList.toggle('light-status', !!out.lightStatus);
    screen.innerHTML = out.html;
    screen.scrollTop = resetScroll ? 0 : scroll;
    renderTabbar(name);
    out.after && out.after();
  }

  function renderTabbar(name) {
    tabbar.classList.toggle('hidden', NO_TABBAR.has(name));
    const active = TAB_OF[name] || (cur().params.user === ME ? 'profile' : 'home');
    const unread = S.threads.some((t) => t.unread);
    tabbar.innerHTML = TABS.map((t) => `
      <button class="tab ${t.name === active ? 'active' : ''}" data-act="tab" data-to="${t.name}">
        ${t.name === 'messages' && unread ? '<i class="dot"></i>' : ''}${t.icon}<span>${t.label}</span>
      </button>`).join('');
  }

  // ---------- Views ----------
  const VIEWS = {};

  VIEWS.home = () => {
    const favs = FAVORITES.map((f, i) => `
      <button class="fav ${S.seenStories[f.user] ? 'seen' : ''}" data-act="story" data-i="${i}">
        <img src="${f.img}" alt=""><span>${f.user}</span>
      </button>`).join('');
    const tiles = S.feed.map(item).filter(Boolean).map(tileHTML).join('');
    return { html: `
      <header class="topbar">
        <button class="pill-btn" data-act="tab" data-to="camera" style="justify-self:start">Lägg ut</button>
        <div class="logo">ARKIV</div>
        <button class="icon-btn" data-act="tab" data-to="messages" aria-label="Meddelanden">${I.chat}</button>
      </header>
      <div class="pad" style="margin:6px 0 14px"><h2 class="section-label">FAVORITER</h2></div>
      <div class="favs">${favs}</div>
      <div class="pad row-between" style="margin:26px 0 14px">
        <h2 class="section-label">FÖLJER</h2>
        <button class="see-all" data-act="tab" data-to="explore">SE ALLA ›</button>
      </div>
      <div class="feed">${tiles}</div>` };
  };

  function tileHTML(it) {
    const isSale = it.kind === 'sale';
    return `<button class="tile" data-act="open" data-id="${it.id}">
      <img src="${it.thumb || it.images[0]}" alt="${esc(it.title || it.caption)}" loading="lazy">
      ${isSale ? `<span class="badge">${it.sold ? 'Såld' : 'Säljes'}</span>` : ''}
      <span class="handle">@${it.owner}</span>
    </button>`;
  }

  function heroHTML(it, cls) {
    const n = it.images.length;
    const s = Math.min(ui.slide, n - 1);
    return `<div class="hero ${cls}">
      <div class="slides" style="transform:translateX(-${s * 100}%)">${it.images.map((src) => `<img src="${src}" alt="">`).join('')}</div>
      <button class="author" data-act="profile" data-user="${it.owner}">${avatar(it.owner)}@${it.owner}</button>
      ${it.kind === 'sale' ? `<span class="badge">${it.sold ? 'Såld' : 'Säljes'}</span>` : ''}
      <span class="count">${s + 1}/${n}</span>
      ${n > 1 ? `<div class="dots">${it.images.map((_, i) => `<i class="${i === s ? 'on' : ''}"></i>`).join('')}</div>
        <button class="nav-zone prev" data-act="slide" data-d="-1" aria-label="Föregående bild"></button>
        <button class="nav-zone next" data-act="slide" data-d="1" aria-label="Nästa bild"></button>` : ''}
      ${it.kind === 'sale' ? `<button class="heart-fab ${S.hearted[it.id] ? 'on' : ''}" data-act="heart" data-id="${it.id}" aria-label="Spara">${I.heart}</button>` : ''}
    </div>`;
  }

  VIEWS.post = ({ id }) => {
    const it = item(id);
    const liked = S.liked[id], saved = S.saved[id];
    const nComments = (S.comments[id] || []).length + 34;
    return { full: true, lightStatus: true, html: `
      ${heroHTML(it, 'is-post')}
      <div class="post-meta">
        <div class="row-between">
          <span class="chip">Inlägg</span>
          <div class="actions">
            <button class="${liked ? 'on' : ''}" data-act="like" data-id="${id}">${I.heart}${fmtCount(it.likes + (liked ? 1 : 0))}</button>
            <button class="${saved ? 'on' : ''}" data-act="save" data-id="${id}">${I.bookmark}${fmtCount(it.saves + (saved ? 1 : 0))}</button>
          </div>
        </div>
        <p class="caption">${esc(it.caption)}</p>
        <div class="row-between small"><button class="muted" data-act="comments" data-id="${id}">Visa alla ${nComments} kommentarer</button><span class="muted">${it.time}</span></div>
      </div>
      <div style="height:20px"></div>`, after: swipeable };
  };

  VIEWS.listing = ({ id }) => {
    const it = item(id);
    return { full: true, lightStatus: true, html: `
      ${heroHTML(it, 'is-sale')}
      <div class="buybar">
        <div>
          <h2>${esc(it.title)}<span>${kr(it.price)}</span></h2>
          <button class="muted small" data-act="details" data-id="${id}">${esc(it.brand)} · Storlek ${esc(it.size)} · Detaljer ›</button>
        </div>
        <button class="btn" data-act="bid" data-id="${id}" ${it.sold ? 'disabled' : ''}>${it.sold ? 'Såld' : 'Lägg bud'}</button>
      </div>`, after: swipeable };
  };

  VIEWS.explore = () => {
    const q = ui.exploreQuery.trim().toLowerCase();
    let list = S.items.filter((x) => x.kind === 'sale' && x.owner !== ME && !x.sold);
    if (q) list = list.filter((x) => [x.brand, x.title, x.owner, x.color].join(' ').toLowerCase().includes(q));
    else list = list.filter((x) => x.explore).concat(list.filter((x) => !x.explore));
    const f = ui.exploreFilter;
    if (f === 'Pris') list = list.slice().sort((a, b) => a.price - b.price);
    if (f === 'Skick') list = list.filter((x) => /Ny|Mycket/.test(x.cond));
    if (f === 'Storlek') list = list.filter((x) => ['M', 'One size'].includes(x.size));
    if (f === 'Märke') list = list.slice().sort((a, b) => a.brand.localeCompare(b.brand, 'sv'));
    if (f === 'Färg') list = list.filter((x) => /Svart|Grå|Beige|Sand|Natur/.test(x.color));
    const filterHint = { Pris: 'lägst först', Skick: 'mycket gott eller bättre', Storlek: 'M', Märke: 'A–Ö', Färg: 'neutrala' };
    const prods = list.map((x) => `
      <div class="product">
        <button class="ph" data-act="open" data-id="${x.id}" style="display:block;width:100%"><img src="${x.thumb || x.images[0]}" alt="" loading="lazy"></button>
        <button class="heart-fab ${S.hearted[x.id] ? 'on' : ''}" data-act="heart" data-id="${x.id}" aria-label="Spara">${I.heart}</button>
        <button data-act="open" data-id="${x.id}" style="text-align:left;display:block">
          <div class="b">${esc(x.brand)}</div><div class="n">${esc(x.title)}</div><div class="p">${kr(x.price)}</div>
        </button>
      </div>`).join('');
    return { html: `
      <header class="topbar">
        <button class="icon-btn" data-act="tab" data-to="home" style="justify-self:start" aria-label="Tillbaka">${I.back}</button>
        <div class="logo">ARKIV</div>
        <button class="icon-btn" data-act="toast" data-msg="Inga nya notiser" aria-label="Notiser">${I.bell}</button>
      </header>
      <div class="pad">
        <h1 class="big-title">Upptäck</h1>
        <label class="search">${I.search}<input id="q" type="search" placeholder="Sök märke, plagg eller medlem" value="${esc(ui.exploreQuery)}" autocomplete="off"></label>
        <div class="filters">${['Märke', 'Storlek', 'Skick', 'Färg', 'Pris'].map((n) => `<button class="filter ${f === n ? 'on' : ''}" data-act="filter" data-f="${n}">${n}${f === n ? ` · ${filterHint[n]}` : ''} ${I.chev}</button>`).join('')}</div>
        <div class="h-row"><h3>${q ? `Resultat för ”${esc(ui.exploreQuery)}”` : `För dig ${I.check}`}</h3>${q ? '' : '<button data-act="toast" data-msg="Du ser redan alla plagg">Visa alla ›</button>'}</div>
        <div class="products">${prods || '<p class="empty" style="grid-column:1/-1">Inga plagg matchar din sökning.</p>'}</div>
      </div>`,
    after: () => {
      const input = $('#q');
      input.addEventListener('input', () => {
        ui.exploreQuery = input.value;
        const pos = input.selectionStart;
        render();
        const again = $('#q'); again.focus(); again.setSelectionRange(pos, pos);
      });
    } };
  };

  function lastLine(t) {
    const m = t.messages[t.messages.length - 1];
    if (m.system) return m.system;
    if (m.offer) return m.from === 'me' ? `Du skickade ett ${m.offer.kind.toLowerCase()}` : 'Skickade ett bud';
    return (m.from === 'me' ? 'Du: ' : '') + m.text;
  }

  VIEWS.messages = () => {
    const tabFilter = { Alla: () => true, Köpare: (t) => t.role === 'buyer', Säljare: (t) => t.role === 'seller' }[ui.msgTab];
    const list = S.threads.filter(tabFilter).map((t) => {
      const u = user(t.with);
      return `<li><button class="thread ${t.unread ? 'unread' : ''}" data-act="chat" data-id="${t.id}">
        <img src="${u.avatar}" alt="">
        <div class="t"><div class="n">${esc(u.name)}</div><div class="m">${esc(lastLine(t))}</div></div>
        <div class="d">${t.time}${t.unread ? '<i></i>' : ''}</div>
      </button></li>`;
    }).join('');
    return { html: `
      <header class="topbar">
        <span></span><div class="logo">ARKIV</div>
        <button class="icon-btn" data-act="readall" aria-label="Markera alla som lästa">${I.dots}</button>
      </header>
      <div class="seg">${['Alla', 'Köpare', 'Säljare'].map((n) => `<button class="${ui.msgTab === n ? 'on' : ''}" data-act="msgtab" data-t="${n}">${n}</button>`).join('')}</div>
      <ul class="threads">${list || '<li class="empty">Inga konversationer</li>'}</ul>` };
  };

  function offerHTML(m, ti, mi, t) {
    const o = m.offer;
    let action = '';
    if (o.state === 'open' && m.from === 'them') action = `<button class="btn" data-act="answer" data-t="${ti}" data-m="${mi}">Svara</button>`;
    else if (o.state === 'open' && m.from === 'me') action = '<span class="state">Väntar…</span>';
    else if (o.state === 'agreed') action = `<button class="btn" data-act="accept" data-t="${ti}" data-m="${mi}">Acceptera</button>`;
    else if (o.state === 'accepted') action = '<span class="state">Accepterat ✓</span>';
    else if (o.state === 'declined') action = '<span class="state">Avböjt</span>';
    else if (o.state === 'answered') action = '<span class="state">Besvarat</span>';
    return `<div class="bubble offer"><div><small>${o.kind}</small><strong>${kr(o.amount)}</strong></div>${action}</div>`;
  }

  VIEWS.chat = ({ id }) => {
    const ti = S.threads.findIndex((t) => t.id === id);
    const t = S.threads[ti];
    t.unread = false;
    const u = user(t.with);
    const it = t.item && item(t.item);
    const msgs = t.messages.map((m, mi) => m.system
      ? `<div class="system">${esc(m.system)}</div>`
      : `<div class="msg ${m.from}">${m.offer ? offerHTML(m, ti, mi, t) : `<div class="bubble">${esc(m.text)}</div>`}<time>${m.time}</time></div>`).join('');
    return { noscroll: true, html: `
      <div class="chat-wrap">
        <div class="chat-head">
          <button class="icon-btn" data-act="back" aria-label="Tillbaka">${I.back}</button>
          <img class="av" src="${u.avatar}" alt="">
          <div class="who"><b>${esc(u.name)}</b><span>${u.online ? 'Aktiv nu' : 'Aktiv idag'}</span></div>
          ${it ? `<button class="item" data-act="open" data-id="${it.id}"><img src="${it.thumb || it.images[0]}" alt=""><div>${esc(it.title)} från ${esc(it.brand)}<b>${kr(it.price)}</b></div></button>` : ''}
        </div>
        <div class="chat" id="chat">${msgs}${t.typing ? '<div class="typing">skriver…</div>' : ''}</div>
        <form class="chat-foot" id="chatform">
          <button type="button" class="plus" data-act="${it && t.role === 'seller' ? 'bid' : 'chatplus'}" data-id="${it ? it.id : ''}" aria-label="Lägg bud">${I.plus.replace('<circle cx="12" cy="12" r="9"/>', '')}</button>
          <input class="input" id="chatinput" placeholder="Skriv ett meddelande..." autocomplete="off">
          <button class="send-plain" aria-label="Skicka">${I.send}</button>
        </form>
      </div>`,
    after: () => {
      const c = $('#chat'); c.scrollTop = c.scrollHeight;
      $('#chatform').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = $('#chatinput').value.trim();
        if (!v) return;
        t.messages.push({ from: 'me', text: v, time: now() });
        t.time = now();
        render();
        autoReply(t, v);
      });
    } };
  };

  VIEWS.profile = ({ user: h = ME }) => {
    const u = user(h);
    const own = S.items.filter((x) => x.owner === h);
    const forSale = own.filter((x) => x.kind === 'sale' && !x.sold);
    const head = `<div class="seg2">${['Profil', 'Omdömen · 128'].map((n) => `<button class="${ui.profTab === n.split(' ')[0] ? 'on' : ''}" data-act="proftab" data-t="${n.split(' ')[0]}">${n}</button>`).join('')}</div>`;
    if (ui.profTab === 'Omdömen') {
      const dist = [[5, 120], [4, 6], [3, 1], [2, 1], [1, 0]];
      return { html: `${head}
        <div class="rating">
          <div class="score"><b>4,9</b><div class="stars">★★★★★</div><div class="muted small">128 omdömen</div></div>
          <div class="bars">${dist.map(([s, n]) => `<div><span>${s}</span><i style="--w:${Math.max(n ? 2 : 0, (n / 128) * 100)}%"></i><span>${n}</span></div>`).join('')}</div>
        </div>
        ${REVIEWS.map((r) => `<div class="review"><div class="top"><img src="${user(r.user).avatar}" alt=""><div><b>${user(r.user).name}</b><span class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span> <span class="when">· ${r.when}</span></div></div><p>${r.text}</p></div>`).join('')}` };
    }
    const shown = own.filter((x) => ui.profFilter === 'Alla' || (ui.profFilter === 'Säljes' ? x.kind === 'sale' : x.kind === 'post'));
    const following = S.following[h];
    return { html: `${head}
      <div class="prof">
        ${u.avatar ? `<img class="pic" src="${u.avatar}" alt="" style="object-fit:cover">` : `<div class="pic">${u.initials}</div>`}
        <div>
          <h2>${esc(u.name)} ${I.check}</h2>
          <div class="loc">GARDEROB · STOCKHOLM</div>
          <p>${h === ME ? 'Kurerat ur egen garderob. Skickar inom ett dygn.' : 'Delar looks och säljer det jag inte längre bär.'}</p>
        </div>
      </div>
      <div class="stats"><div><b>${own.filter((x) => x.kind === 'post').length + 20}</b><span>INLÄGG</span></div><div><b>${forSale.length}</b><span>PLAGG TILL SALU</span></div></div>
      <div class="prof-actions">
        <button class="${following ? '' : 'primary'}" data-act="follow" data-user="${h}">${following ? 'Följer' : 'Följ'}</button>
        <button data-act="dm" data-user="${h}">Meddelande</button>
        <button data-act="share" aria-label="Dela profil">${I.arrow}</button>
      </div>
      <div class="pfilters">${[['Alla', 'Alla'], ['Säljes', `Säljes · ${forSale.length}`], ['Inlägg', 'Inlägg']].map(([k, l]) => `<button class="${ui.profFilter === k ? 'on' : ''}" data-act="proffilter" data-f="${k}">${l}</button>`).join('')}</div>
      <div class="pgrid">${shown.map((x) => `<button data-act="open" data-id="${x.id}"><img src="${x.thumb || x.images[0]}" alt="" loading="lazy">${x.kind === 'sale' ? `<span class="badge sm">${x.sold ? 'Såld' : 'Säljes'}</span>` : ''}</button>`).join('') || '<p class="empty" style="grid-column:1/-1">Inget här än.</p>'}</div>` };
  };

  VIEWS.camera = () => ({ full: true, dark: true, noscroll: true, html: `
    <div class="cam">
      <div class="view ${ui.camFlip ? 'flip' : ''}">
        <img src="${IMG('kamera')}" alt="">
        <div class="flash" id="flash"></div>
        <button class="x" data-act="tab" data-to="home" aria-label="Stäng">${I.close}</button>
        <button class="flip-btn" data-act="camflip" aria-label="Vänd kamera">${I.flip}</button>
      </div>
      <button class="shutter" id="shutter" aria-label="Ta foto"></button>
      <div class="controls">
        <button class="roll" data-act="picker" aria-label="Kamerarulle"><img src="${IMG('nytt-inlagg')}" alt=""></button>
        ${['Inlägg', 'Sälj plagg', 'OOTD', 'Review'].map((m) => `<button class="mode ${ui.camMode === m ? 'on' : ''}" data-act="cammode" data-m="${m}">${m}</button>`).join('')}
      </div>
      <div class="hint">Tryck för foto · håll in för video</div>
    </div>`,
  after: () => {
    const sh = $('#shutter');
    let timer, long = false;
    const start = () => { long = false; timer = setTimeout(() => { long = true; sh.classList.add('rec'); toast('Spelar in…'); }, 450); };
    const end = () => {
      clearTimeout(timer);
      sh.classList.remove('rec');
      const f = $('#flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
      ui.pick = [IMG('kamera')];
      ui.postType = ui.camMode === 'Sälj plagg' ? 'Sälj' : ui.camMode;
      setTimeout(() => { toast(long ? 'Video sparad' : 'Foto taget'); go('picker'); }, 320);
    };
    sh.addEventListener('pointerdown', start);
    sh.addEventListener('pointerup', end);
    sh.addEventListener('pointerleave', () => clearTimeout(timer));
  } });

  VIEWS.picker = () => {
    if (!ui.pick.length) ui.pick = [CAMERA_ROLL[0]];
    const roll = ui.pick.filter((p) => !CAMERA_ROLL.includes(p)).concat(CAMERA_ROLL);
    return { full: true, noscroll: true, html: `
      <div class="picker" style="padding-top:54px">
        <header class="topbar" style="padding-bottom:10px">
          <button class="icon-btn" data-act="back" style="justify-self:start" aria-label="Stäng">${I.close}</button>
          <div class="title">Nytt inlägg</div>
          <button class="link-accent" data-act="next">Nästa</button>
        </header>
        <div class="preview"><img src="${ui.pick[ui.pick.length - 1]}" alt=""></div>
        <div class="bar">
          <b>Senaste ${I.chev.replace('viewBox', 'width="10" height="10" viewBox')}</b>
          <div class="r"><button class="${ui.multi ? 'on' : ''}" data-act="multi">Välj flera</button><button class="dark" data-act="tab" data-to="camera">Kamera</button></div>
        </div>
        <div class="roll-grid">${roll.map((src) => {
          const n = ui.pick.indexOf(src);
          return `<button class="${n >= 0 ? 'on' : ''}" data-act="pick" data-src="${src}"><img src="${src}" alt="" loading="lazy"><span class="sel">${n >= 0 && ui.multi ? n + 1 : n >= 0 ? '✓' : ''}</span></button>`;
        }).join('')}</div>
        <div class="typebar">${[['Inlägg', 'INLÄGG'], ['Sälj', 'SÄLJ'], ['OOTD', 'OOTD'], ['Review', 'REVIEW']].map(([k, l]) => `<button class="${ui.postType === k ? 'on' : ''}" data-act="ptype" data-t="${k}">${l}</button>`).join('')}</div>
      </div>` };
  };

  VIEWS.sell = () => {
    const d = ui.draft;
    const sale = d.type === 'Sälj';
    const titles = { Inlägg: 'Nytt inlägg', Sälj: 'Säljes', OOTD: 'Dagens outfit', Review: 'Review' };
    const typeLabels = [['Inlägg', 'Inlägg'], ['Sälj', 'Sälj plagg'], ['OOTD', 'OOTD'], ['Review', 'Review']];
    const ok = !sale || (d.price > 0 && d.brand.trim());
    return { html: `
      <header class="topbar">
        <button class="icon-btn" data-act="back" style="justify-self:start" aria-label="Tillbaka">${I.back}</button>
        <div class="title">${titles[d.type]}</div>
        <button class="link-accent" data-act="publish" ${ok ? '' : 'style="opacity:.35"'}>Dela</button>
      </header>
      <div class="compose"><img src="${d.images[0]}" alt=""><textarea id="cap" placeholder="Skriv en bildtext...">${esc(d.caption)}</textarea></div>
      <div class="pad">
        <div class="form-h"><h3 class="section-label">TYP AV INLÄGG</h3><span class="muted small">Visas under ${sale ? 'Säljes' : 'Inlägg'}</span></div>
        <div class="typeseg">${typeLabels.map(([k, l]) => `<button class="${d.type === k ? 'on' : ''}" data-act="dtype" data-t="${k}">${l}</button>`).join('')}</div>
        ${sale ? `
        <h3 class="section-label" style="margin-bottom:12px">OM PLAGGET</h3>
        <div class="fields">
          <label class="field"><small>Pris</small><input id="price" inputmode="numeric" placeholder="0 kr" value="${d.price ? d.price + ' kr' : ''}"></label>
          <label class="field"><small>Märke</small><input id="brand" placeholder="t.ex. Arket" value="${esc(d.brand)}"></label>
        </div>
        <p class="opt-label">Storlek</p>
        <div class="opts">${['XS', 'S', 'M', 'L', 'XL'].map((s) => `<button class="${d.size === s ? 'on' : ''}" data-act="dsize" data-v="${s}">${s}</button>`).join('')}</div>
        <p class="opt-label">Skick</p>
        <div class="opts">${['Ny med lapp', 'Mycket gott', 'Gott', 'Använt'].map((s) => `<button class="${d.cond === s ? 'on' : ''}" data-act="dcond" data-v="${s}">${s}</button>`).join('')}</div>
        <button class="navrow boxed" data-act="ship"><span>Frakt</span><span class="v">${d.ship} ›</span></button>` : ''}
        <button class="navrow ${d.tagged ? 'on' : ''}" data-act="dtag"><span>Tagga i en look</span><span class="v">${d.tagged ? 'Taggad ✓' : '›'}</span></button>
        <button class="navrow ${d.pickup ? 'on' : ''}" data-act="dpickup"><span>Upphämtning i Stockholm</span><span class="v">${d.pickup ? 'Ja ✓' : '›'}</span></button>
        <div style="padding:26px 0 30px"><button class="btn block" data-act="publish" ${ok ? '' : 'disabled'}>${sale ? 'Lägg ut till salu' : 'Dela inlägg'}</button></div>
      </div>`,
    after: () => {
      $('#cap').addEventListener('input', (e) => { d.caption = e.target.value; });
      const p = $('#price'), b = $('#brand');
      const sync = () => {
        const ready = d.price > 0 && d.brand.trim();
        document.querySelectorAll('[data-act="publish"]').forEach((el) => { el.disabled = el.tagName === 'BUTTON' && el.classList.contains('btn') ? !ready : false; el.style.opacity = ready ? '' : '.35'; });
      };
      if (p) {
        p.addEventListener('input', () => { d.price = parseInt(p.value.replace(/\D/g, ''), 10) || 0; sync(); });
        p.addEventListener('focus', () => { p.value = d.price || ''; });
        p.addEventListener('blur', () => { p.value = d.price ? `${d.price} kr` : ''; });
        b.addEventListener('input', () => { d.brand = b.value; sync(); });
      }
    } };
  };

  // ---------- Bladväxling med svep ----------
  function swipeable() {
    const hero = $('.hero', screen);
    if (!hero) return;
    let x0 = null;
    hero.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    hero.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { ui.swiped = Date.now(); slide(dx < 0 ? 1 : -1); }
    });
  }
  function slide(d) {
    const it = item(cur().params.id);
    const n = it.images.length;
    ui.slide = Math.max(0, Math.min(n - 1, ui.slide + d));
    const s = ui.slide;
    $('.slides', screen).style.transform = `translateX(-${s * 100}%)`;
    $('.count', screen).textContent = `${s + 1}/${n}`;
    screen.querySelectorAll('.dots i').forEach((el, i) => el.classList.toggle('on', i === s));
  }

  // ---------- Sheets ----------
  function openSheet(html, after) {
    layer.innerHTML = `<div class="scrim" data-act="closesheet"></div><div class="sheet"><div class="grabber"></div>${html}</div>`;
    requestAnimationFrame(() => layer.classList.add('open'));
    after && after(layer);
  }
  function closeSheet(instant) {
    if (!layer.classList.contains('open')) return;
    layer.classList.remove('open');
    if (instant) layer.innerHTML = '';
    else setTimeout(() => { if (!layer.classList.contains('open')) layer.innerHTML = ''; }, 300);
  }

  function commentsSheet(id) {
    const list = S.comments[id] || (S.comments[id] = []);
    const total = list.length + 34;
    const body = list.map((c, i) => {
      const key = id + i, on = S.likedComments[key];
      return `<div class="comment ${c.reply ? 'reply' : ''}">
        ${user(c.user).avatar ? `<img src="${user(c.user).avatar}" alt="">` : avatar(c.user, 'avatar')}
        <div class="body">
          <div class="who">${c.user === 'ameliacmode' || c.user === ME ? c.user : esc(user(c.user).name)} <span>· ${c.creator ? 'Skapare · ' : ''}${c.time}</span></div>
          <p>${esc(c.text)}</p>
          <button class="reply-btn" data-act="replyto" data-name="${esc(user(c.user).name.split(' ')[0])}">Svara</button>
        </div>
        <button class="like ${on ? 'on' : ''}" data-act="clike" data-id="${id}" data-i="${i}" aria-label="Gilla">${I.heart}${(c.likes + (on ? 1 : 0)) || ''}</button>
      </div>`;
    }).join('');
    openSheet(`
      <div class="sheet-head">${total} kommentarer</div>
      <div class="sheet-body" id="cbody" style="height:480px">${body}</div>
      <form class="sheet-foot" id="cform"><input class="input" id="cinput" placeholder="Skriv en kommentar..." autocomplete="off"><button class="send-round" aria-label="Skicka">${I.send}</button></form>`,
    () => {
      $('#cform').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = $('#cinput').value.trim();
        if (!v) return;
        list.push({ user: ME, text: v, time: 'nu', likes: 0 });
        commentsSheet(id);
        const b = $('#cbody'); b.scrollTop = b.scrollHeight;
        render();
      });
    });
    layer.classList.add('open');
  }

  function detailsSheet(id) {
    const it = item(id);
    const more = S.items.filter((x) => x.owner === it.owner && x.kind === 'sale' && x.id !== id && !x.sold).slice(0, 3);
    openSheet(`
      <div class="sheet-body detail">
        <h2><span>${esc(it.title)}</span><span>${kr(it.price)}</span></h2>
        <div class="brand">${esc(it.brand)}</div>
        <div class="chips"><span class="chip">Storlek ${esc(it.size)}</span><span class="chip">${esc(it.cond)}</span><span class="chip">Frakt ${it.ship} kr</span></div>
        <p class="label">Beskrivning</p>
        <p>${esc(it.desc)}</p>
        <div class="facts">
          <div class="fact"><small>Material</small>${esc(it.material)}</div>
          <div class="fact"><small>Mått</small>${esc(it.measure)}</div>
          <div class="fact"><small>Färg</small>${esc(it.color)}</div>
          <div class="fact"><small>Upplagd</small>${esc(it.posted)}</div>
        </div>
        ${more.length ? `<div class="row-between" style="margin-bottom:10px"><p class="label" style="margin:0">Mer från ${esc(user(it.owner).name)}</p><button class="small" data-act="profile" data-user="${it.owner}">Visa alla</button></div>
        <div class="more">${more.map((m) => `<button data-act="open" data-id="${m.id}"><img src="${m.thumb || m.images[0]}" alt="">${kr(m.price)}</button>`).join('')}</div>` : ''}
      </div>
      <div class="sheet-foot" style="border:0">
        <button class="btn ghost" style="flex:1" data-act="dm" data-user="${it.owner}" data-item="${id}">Meddelande</button>
        <button class="btn" style="flex:1" data-act="bid" data-id="${id}" ${it.sold ? 'disabled' : ''}>Lägg bud</button>
      </div>`);
  }

  function bidSheet(id, opts = {}) {
    const it = item(id);
    const suggestions = [0.8, 0.9, 1].map((f) => Math.round((it.price * f) / 10) * 10);
    let amount = opts.amount || suggestions[1];
    openSheet(`
      <div class="sheet-head">${opts.title || 'Lägg bud'}</div>
      <div class="sheet-body" style="text-align:center">
        <p class="muted small" style="margin:0">${esc(it.title)} · ${esc(it.brand)} · utropspris ${kr(it.price)}</p>
        <div class="bid-price"><input id="amt" inputmode="numeric" value="${amount}" aria-label="Belopp"><span>kr</span></div>
        <div class="quick">${suggestions.map((s) => `<button class="chip ${s === amount ? 'sel' : ''}" data-q="${s}">${kr(s)}</button>`).join('')}</div>
        <p class="note">Köparskydd ingår. Du betalar först när säljaren accepterat.</p>
        <button class="btn block" id="sendbid">${opts.cta || 'Skicka bud'}</button>
      </div>`,
    (root) => {
      const input = $('#amt', root);
      root.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => {
        input.value = b.dataset.q;
        root.querySelectorAll('[data-q]').forEach((x) => x.classList.toggle('sel', x === b));
      }));
      $('#sendbid', root).addEventListener('click', () => {
        const v = parseInt(input.value.replace(/\D/g, ''), 10);
        if (!v) { toast('Ange ett belopp'); return; }
        closeSheet();
        (opts.onSend || placeBid)(it, v);
      });
    });
  }

  function placeBid(it, amount) {
    if (it.owner === ME) {
      toast('Det här är ditt eget plagg');
      return;
    }
    let t = S.threads.find((x) => x.with === it.owner && x.item === it.id);
    if (!t) {
      if (!USERS[it.owner].avatar) USERS[it.owner].avatar = IMG('av-sofia');
      t = { id: 'th-' + it.id, with: it.owner, role: 'seller', item: it.id, time: now(), messages: [] };
      S.threads.unshift(t);
    } else {
      S.threads.splice(S.threads.indexOf(t), 1); S.threads.unshift(t);
    }
    t.messages.push({ from: 'me', offer: { kind: 'Bud', amount, state: 'open' }, time: now() });
    t.time = now();
    stack = [{ name: 'messages', params: {} }, { name: 'chat', params: { id: t.id } }];
    render(true);
    toast('Bud skickat');
    sellerResponds(t, it, amount);
  }

  // Säljaren svarar automatiskt på bud i demon.
  function sellerResponds(t, it, amount) {
    setTimeout(() => { t.typing = true; refreshChat(t); }, 700);
    setTimeout(() => {
      t.typing = false;
      const bid = t.messages.filter((m) => m.offer && m.from === 'me').pop();
      if (amount >= it.price * 0.9) {
        bid.offer.state = 'accepted';
        t.messages.push({ from: 'them', text: `Det låter bra, ${kr(amount)} funkar!`, time: now() });
        dealDone(t, it, amount);
      } else {
        bid.offer.state = 'declined';
        const counter = Math.round((amount + it.price) / 2 / 10) * 10;
        t.messages.push({ from: 'them', text: `Tack för budet! Jag kan gå ner till ${kr(counter)}.`, time: now() });
        t.messages.push({ from: 'them', offer: { kind: 'Motbud', amount: counter, state: 'agreed' }, time: now() });
      }
      t.time = now();
      if (!isChatOpen(t)) t.unread = true;
      refreshChat(t);
    }, 2200);
  }

  function dealDone(t, it, amount) {
    it.sold = true;
    t.messages.push({ system: `Affär klar · ${kr(amount)} · köparskydd aktivt`, time: now() });
  }

  function autoReply(t, text) {
    const answers = [
      [/stor|size|mått/i, 'Den är som en vanlig M, lite oversize.'],
      [/ses|mötas|imorgon|träff/i, 'Imorgon kl 17 vid Slussen funkar för mig!'],
      [/frakt|skick/i, 'Jag kan skicka med PostNord, 59 kr.'],
      [/tack/i, 'Tack själv! 🙌'],
    ];
    const hit = answers.find(([re]) => re.test(text));
    setTimeout(() => { t.typing = true; refreshChat(t); }, 600);
    setTimeout(() => {
      t.typing = false;
      t.messages.push({ from: 'them', text: hit ? hit[1] : 'Låter bra!', time: now() });
      if (!isChatOpen(t)) t.unread = true;
      refreshChat(t);
    }, 1800);
  }

  const isChatOpen = (t) => cur().name === 'chat' && cur().params.id === t.id;
  function refreshChat(t) {
    if (isChatOpen(t)) {
      const input = $('#chatinput');
      const draft = input ? input.value : '';
      render();
      const again = $('#chatinput'); if (again) { again.value = draft; }
    } else if (cur().name === 'messages') render();
    else renderTabbar(cur().name);
  }

  // ---------- Stories ----------
  function openStory(i) {
    const f = FAVORITES[i];
    if (!f) return;
    S.seenStories[f.user] = true;
    const el = document.createElement('div');
    el.className = 'story';
    el.innerHTML = `<img src="${f.story}" alt=""><div class="progress"><i></i></div><div class="who">${avatar(f.user)}${f.user}</div><button class="close" aria-label="Stäng">${I.close}</button>`;
    app.appendChild(el);
    const done = (next) => { el.remove(); clearTimeout(timer); if (next && FAVORITES[i + 1]) openStory(i + 1); else render(); };
    const timer = setTimeout(() => done(true), 4000);
    el.addEventListener('click', (e) => done(!e.target.closest('.close')));
  }

  // ---------- Handlingar ----------
  const ACT = {
    tab: (el) => tab(el.dataset.to),
    back: () => back(),
    toast: (el) => toast(el.dataset.msg),
    story: (el) => openStory(+el.dataset.i),
    open: (el) => {
      const it = item(el.dataset.id);
      go(it.kind === 'sale' ? 'listing' : 'post', { id: it.id });
    },
    profile: (el) => { ui.profTab = 'Profil'; ui.profFilter = 'Alla'; go('profile', { user: el.dataset.user }); },
    slide: (el) => { if (Date.now() - (ui.swiped || 0) > 300) slide(+el.dataset.d); },
    like: (el) => { S.liked[el.dataset.id] = !S.liked[el.dataset.id]; render(); },
    save: (el) => { const v = S.saved[el.dataset.id] = !S.saved[el.dataset.id]; toast(v ? 'Sparat i din samling' : 'Borttaget från sparade'); render(); },
    heart: (el) => {
      const v = S.hearted[el.dataset.id] = !S.hearted[el.dataset.id];
      el.classList.toggle('on', v);
      toast(v ? 'Sparad i favoriter' : 'Borttagen från favoriter');
    },
    comments: (el) => commentsSheet(el.dataset.id),
    clike: (el) => { const k = el.dataset.id + el.dataset.i; S.likedComments[k] = !S.likedComments[k]; commentsSheet(el.dataset.id); },
    replyto: (el) => { const i = $('#cinput'); i.value = `@${el.dataset.name} `; i.focus(); },
    details: (el) => detailsSheet(el.dataset.id),
    bid: (el) => {
      const it = item(el.dataset.id);
      if (it.owner === ME) {
        const t = S.threads.find((x) => x.item === it.id);
        if (t) { closeSheet(true); toast('Ditt plagg — här är buden'); stack = [{ name: 'messages', params: {} }, { name: 'chat', params: { id: t.id } }]; render(true); }
        else toast('Det här är ditt eget plagg');
        return;
      }
      bidSheet(it.id);
    },
    closesheet: () => closeSheet(),
    filter: (el) => { ui.exploreFilter = ui.exploreFilter === el.dataset.f ? null : el.dataset.f; render(); },
    msgtab: (el) => { ui.msgTab = el.dataset.t; render(); },
    readall: () => { S.threads.forEach((t) => { t.unread = false; }); toast('Allt markerat som läst'); render(); },
    chat: (el) => go('chat', { id: el.dataset.id }),
    chatplus: () => toast('Bifoga bild kommer snart'),
    answer: (el) => {
      const t = S.threads[+el.dataset.t], m = t.messages[+el.dataset.m];
      const it = item(t.item);
      openSheet(`
        <div class="sheet-head">Bud på ${kr(m.offer.amount)}</div>
        <div class="sheet-body">
          <p class="muted small" style="text-align:center;margin:0 0 18px">${esc(user(t.with).name)} vill köpa ${esc(it.title)} (${kr(it.price)})</p>
          <button class="btn block" data-act="acceptbid" data-t="${el.dataset.t}" data-m="${el.dataset.m}">Acceptera ${kr(m.offer.amount)}</button>
          <div style="height:10px"></div>
          <button class="btn block ghost" data-act="counter" data-t="${el.dataset.t}" data-m="${el.dataset.m}">Ge motbud</button>
          <div style="height:10px"></div>
          <button class="btn block ghost" data-act="declinebid" data-t="${el.dataset.t}" data-m="${el.dataset.m}">Avböj</button>
        </div>`);
    },
    acceptbid: (el) => {
      const t = S.threads[+el.dataset.t], m = t.messages[+el.dataset.m];
      m.offer.state = 'accepted';
      closeSheet(true);
      dealDone(t, item(t.item), m.offer.amount);
      render(); toast('Bud accepterat');
    },
    declinebid: (el) => {
      const t = S.threads[+el.dataset.t], m = t.messages[+el.dataset.m];
      m.offer.state = 'declined';
      t.messages.push({ from: 'me', text: 'Tyvärr, det är för lågt för mig.', time: now() });
      closeSheet(true); render();
    },
    counter: (el) => {
      const t = S.threads[+el.dataset.t], m = t.messages[+el.dataset.m];
      const it = item(t.item);
      bidSheet(it.id, {
        title: 'Ge motbud', cta: 'Skicka motbud', amount: Math.round((m.offer.amount + it.price) / 2 / 10) * 10,
        onSend: (_, v) => {
          m.offer.state = 'answered';
          t.messages.push({ from: 'me', offer: { kind: 'Motbud', amount: v, state: 'open' }, time: now() });
          render();
          setTimeout(() => { t.typing = true; refreshChat(t); }, 600);
          setTimeout(() => {
            t.typing = false;
            const mine = t.messages[t.messages.length - 1];
            mine.offer.state = 'agreed';
            t.messages.push({ from: 'them', text: `Okej, ${kr(v)} kör vi på!`, time: now() });
            refreshChat(t);
          }, 1900);
        },
      });
    },
    accept: (el) => {
      const t = S.threads[+el.dataset.t], m = t.messages[+el.dataset.m];
      m.offer.state = 'accepted';
      dealDone(t, item(t.item), m.offer.amount);
      t.time = now();
      render(); toast('Affären är klar 🎉');
    },
    proftab: (el) => { ui.profTab = el.dataset.t; render(true); },
    proffilter: (el) => { ui.profFilter = el.dataset.f; render(); },
    follow: (el) => { const h = el.dataset.user; S.following[h] = !S.following[h]; toast(S.following[h] ? `Du följer ${user(h).name}` : `Du slutade följa ${user(h).name}`); render(); },
    share: () => { navigator.clipboard && navigator.clipboard.writeText(location.href).catch(() => {}); toast('Länk kopierad'); },
    dm: (el) => {
      const h = el.dataset.user;
      if (h === ME) { toast('Det här är din profil'); return; }
      let t = S.threads.find((x) => x.with === h);
      if (!t) { t = { id: 'dm-' + h, with: h, role: 'seller', item: el.dataset.item, time: now(), messages: [{ system: 'Säg hej 👋', time: now() }] }; S.threads.unshift(t); }
      if (!USERS[h].avatar) USERS[h].avatar = IMG('av-sofia');
      go('chat', { id: t.id });
    },
    camflip: () => { ui.camFlip = !ui.camFlip; $('.view', screen).classList.toggle('flip', ui.camFlip); },
    cammode: (el) => { ui.camMode = el.dataset.m; render(); },
    picker: () => { ui.pick = []; ui.multi = false; ui.postType = ui.camMode === 'Sälj plagg' ? 'Sälj' : ui.camMode; go('picker'); },
    multi: () => { ui.multi = !ui.multi; if (!ui.multi) ui.pick = ui.pick.slice(-1); render(); },
    pick: (el) => {
      const src = el.dataset.src, i = ui.pick.indexOf(src);
      if (ui.multi) { if (i >= 0) { if (ui.pick.length > 1) ui.pick.splice(i, 1); } else ui.pick.push(src); }
      else ui.pick = [src];
      const grid = $('.roll-grid', screen), top = grid.scrollTop;
      render(); $('.roll-grid', screen).scrollTop = top;
    },
    ptype: (el) => { ui.postType = el.dataset.t; render(); },
    next: () => {
      ui.draft = { type: ui.postType, images: ui.pick.slice(), caption: '', price: 600, brand: '', size: 'M', cond: 'Mycket gott', ship: 'PostNord · 59 kr', tagged: false, pickup: false };
      go('sell');
    },
    dtype: (el) => { ui.draft.type = el.dataset.t; render(); },
    dsize: (el) => { ui.draft.size = el.dataset.v; render(); },
    dcond: (el) => { ui.draft.cond = el.dataset.v; render(); },
    ship: () => {
      const opts = ['PostNord · 59 kr', 'Instabox · 49 kr', 'DHL · 79 kr', 'Endast upphämtning'];
      ui.draft.ship = opts[(opts.indexOf(ui.draft.ship) + 1) % opts.length]; render();
    },
    dtag: () => { ui.draft.tagged = !ui.draft.tagged; render(); },
    dpickup: () => { ui.draft.pickup = !ui.draft.pickup; render(); },
    publish: () => {
      const d = ui.draft;
      const sale = d.type === 'Sälj';
      if (sale && !(d.price > 0 && d.brand.trim())) { toast('Fyll i pris och märke'); return; }
      const id = 'new' + Date.now();
      const shipKr = parseInt((d.ship.match(/(\d+) kr/) || [])[1], 10) || 0;
      const condMap = { 'Ny med lapp': 'Ny med lapp', 'Mycket gott': 'Mycket gott skick', Gott: 'Gott skick', Använt: 'Använt' };
      S.items.unshift(sale
        ? { id, kind: 'sale', owner: ME, images: d.images, title: d.caption.trim().split(/[.\n]/)[0].slice(0, 28) || 'Plagg', brand: d.brand.trim(), price: d.price, size: d.size, cond: condMap[d.cond], ship: shipKr, desc: d.caption.trim() || 'Ingen beskrivning.', material: '—', measure: '—', color: '—', posted: 'Nyss' }
        : { id, kind: 'post', owner: ME, images: d.images, caption: d.caption.trim() || (d.type === 'OOTD' ? 'Dagens outfit.' : 'Nytt inlägg.'), likes: 0, saves: 0, time: 'nu' });
      S.feed.unshift(id);
      ui.profFilter = 'Alla'; ui.profTab = 'Profil';
      stack = [{ name: 'profile', params: { user: ME } }];
      render(true);
      toast(sale ? 'Ute till salu!' : 'Inlägget är delat');
    },
  };

  app.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || !app.contains(el)) return;
    const fn = ACT[el.dataset.act];
    if (fn) { e.preventDefault(); fn(el, e); }
  });

  $('#reset').addEventListener('click', () => {
    S = fresh(); stack = [{ name: 'home', params: {} }];
    Object.assign(ui, { slide: 0, exploreQuery: '', exploreFilter: null, msgTab: 'Alla', profTab: 'Profil', profFilter: 'Alla', camMode: 'Inlägg', pick: [], postType: 'Inlägg', draft: null, multi: false });
    closeSheet(true); render(true); toast('Demon är återställd');
  });

  render(true);
})();
