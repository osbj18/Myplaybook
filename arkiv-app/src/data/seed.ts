export const ME = 'duandersson';

export type Img = string; // 'a:<namn>' bundlad bild, 'f:<sökväg>' fil i dokumentmappen, annars en URI

export type User = { name: string; avatar: Img | null; initials?: string; online?: boolean; bio?: string };

type Base = { id: string; owner: string; images: Img[]; thumb?: Img; createdAt: number };
export type Post = Base & { kind: 'post'; caption: string; likes: number; saves: number; time: string };
export type Sale = Base & {
  kind: 'sale'; title: string; brand: string; price: number; size: string; cond: string; ship: number;
  desc: string; material: string; measure: string; color: string; posted: string; explore?: boolean; sold?: boolean;
};
export type Item = Post | Sale;

export type Offer = { kind: 'Bud' | 'Motbud'; amount: number; state: 'open' | 'answered' | 'agreed' | 'accepted' | 'declined' };
export type Message = { id: string; from: 'me' | 'them'; time: string; text?: string; offer?: Offer; system?: string };
export type Thread = { id: string; with: string; role: 'buyer' | 'seller'; item?: string; time: string; unread?: boolean; typing?: boolean; messages: Message[] };
export type Comment = { user: string; text: string; time: string; likes: number; reply?: boolean; creator?: boolean };
export type Review = { user: string; stars: number; when: string; text: string };

export const USERS: Record<string, User> = {
  duandersson: { name: 'Du Andersson', avatar: null, initials: 'DU', bio: 'Kurerat ur egen garderob. Skickar inom ett dygn.' },
  sofialbrandz: { name: 'Sofia Brandt', avatar: 'a:av-sofia' },
  ameliacmode: { name: 'Amelia C', avatar: 'a:av-amelia' },
  filipberg: { name: 'Filip Berg', avatar: 'a:av-lucas2' },
  emilynparis: { name: 'Emily N', avatar: 'a:emily' },
  linnahlborg: { name: 'Linn Ahlborg', avatar: 'a:av-hanna' },
  milostrand: { name: 'Milo Strand', avatar: 'a:av-daniel' },
  elladella: { name: 'Ella Della', avatar: 'a:av-emma' },
  oscarhed: { name: 'Oscar Hed', avatar: 'a:av-oskar' },
  sofia: { name: 'Sofia Lindgren', avatar: 'a:av-sofia', online: true },
  erik: { name: 'Erik Johansson', avatar: 'a:av-erik2' },
  maja: { name: 'Maja Karlsson', avatar: 'a:av-maja2' },
  lucas: { name: 'Lucas Berg', avatar: 'a:av-lucas2' },
  emma: { name: 'Emma Nilsson', avatar: 'a:av-emma' },
  daniel: { name: 'Daniel Lund', avatar: 'a:av-daniel' },
  hanna: { name: 'Hanna Sjöberg', avatar: 'a:av-hanna' },
  oskar: { name: 'Oskar Vik', avatar: 'a:av-oskar' },
};

export const FAVORITES = [
  { user: 'emilynparis', img: 'a:fav-emilynparis', story: 'a:emily' },
  { user: 'linnahlborg', img: 'a:fav-linnahlborg', story: 'a:plant' },
  { user: 'milostrand', img: 'a:fav-milostrand', story: 'a:fav-milostrand' },
  { user: 'elladella', img: 'a:fav-elladella', story: 'a:fav-elladella' },
  { user: 'oscarhed', img: 'a:fav-oscarhed', story: 'a:fav-oscarhed' },
];

export const REVIEWS: Review[] = [
  { user: 'sofia', stars: 5, when: '3 dagar sedan', text: 'Precis som beskrivet och supersnabb frakt. Rekommenderas varmt.' },
  { user: 'erik', stars: 5, when: '1 vecka sedan', text: 'Smidig affär, svarade snabbt på alla frågor om måtten.' },
  { user: 'emma', stars: 4, when: '2 veckor sedan', text: 'Fint plagg, paketet dröjde en dag extra.' },
  { user: 'oskar', stars: 5, when: '1 månad sedan', text: 'Ännu bättre skick än på bilderna.' },
];

const sale = (o: Omit<Sale, 'kind' | 'createdAt'>, i: number): Sale => ({ kind: 'sale', createdAt: 1000 - i, ...o });
const post = (o: Omit<Post, 'kind' | 'createdAt'>, i: number): Post => ({ kind: 'post', createdAt: 1000 - i, ...o });

export function seedItems(): Item[] {
  let i = 0;
  return [
    sale({ id: 'linne', owner: 'sofialbrandz', images: ['a:linneskjorta'], title: 'Linneskjorta', brand: 'Our Legacy', price: 750, size: 'M', cond: 'Mycket gott skick', ship: 59, desc: 'Tvättat linne, rak passform. Använd en sommar.', material: 'Linne', measure: 'Axel 47 · Längd 76 cm', color: 'Sand', posted: '1 dag sedan' }, i++),
    sale({ id: 'gron', owner: 'sofialbrandz', images: ['a:gron-overshirt'], title: 'Overshirt i ull', brand: 'Norse Projects', price: 900, size: 'L', cond: 'Gott skick', ship: 59, desc: 'Tjock ullkvalitet, perfekt som lätt jacka på hösten.', material: 'Ull', measure: 'Axel 50 · Längd 75 cm', color: 'Mossgrön', posted: '2 dagar sedan' }, i++),
    post({ id: 'amelia', owner: 'ameliacmode', images: ['a:amelia-post', 'a:amelia-sitting', 'a:amelia-feed', 'a:fav-emilynparis'], caption: 'Svart på svart inför hösten. Kavajen är vintage och säljs i min garderob.', likes: 4100, saves: 492, time: '2 min' }, i++),
    post({ id: 'filip', owner: 'filipberg', images: ['a:filip-feed', 'a:fav-oscarhed'], caption: 'Lång rock, lång promenad. Gamla stan i oktober.', likes: 1820, saves: 133, time: '1 tim' }, i++),
    sale({ id: 'overshirt', owner: ME, images: ['a:overshirt-big'], thumb: 'a:overshirt', title: 'Overshirt', brand: 'Arket', price: 600, size: 'M', cond: 'Mycket gott skick', ship: 59, desc: 'Använd ett fåtal gånger, inga fläckar eller hål. Sitter lite oversize – passar S–M. Kan mötas i Stockholm.', material: 'Ullblandning', measure: 'Axel 48 · Längd 74 cm', color: 'Olivbrun', posted: '3 dagar sedan' }, i++),
    post({ id: 'promenad', owner: ME, images: ['a:promenad'], caption: 'Mjukt stickat och vida byxor. Väskan är taggad i bilden.', likes: 312, saves: 28, time: '4 dagar' }, i++),
    sale({ id: 'nb', owner: ME, images: ['a:nb-sneakers'], title: '990v6', brand: 'New Balance', price: 1100, size: '43', cond: 'Gott skick', ship: 79, desc: 'Gråa klassiker, mycket sula kvar.', material: 'Mocka/mesh', measure: 'EU 43', color: 'Grå', posted: '5 dagar sedan' }, i++),
    post({ id: 'svartjacka', owner: ME, images: ['a:svart-jacka'], caption: 'Mörk jacka, ljus polo.', likes: 241, saves: 19, time: '1 v' }, i++),
    sale({ id: 'linne2', owner: ME, images: ['a:linneskjorta'], title: 'Linneskjorta', brand: 'COS', price: 450, size: 'M', cond: 'Mycket gott skick', ship: 59, desc: 'Ljus linneskjorta med två bröstfickor.', material: 'Linne', measure: 'Axel 46 · Längd 74 cm', color: 'Natur', posted: '1 v sedan' }, i++),
    sale({ id: 'gron2', owner: ME, images: ['a:gron-overshirt'], title: 'Overshirt', brand: 'Sunflower', price: 1200, size: 'M', cond: 'Gott skick', ship: 59, desc: 'Grön ull-overshirt, kraftig kvalitet.', material: 'Ull', measure: 'Axel 48 · Längd 73 cm', color: 'Grön', posted: '1 v sedan' }, i++),
    sale({ id: 'byxor', owner: ME, images: ['a:svarta-byxor'], thumb: 'a:byxor', title: 'Vida byxor', brand: 'Totême', price: 400, size: 'S', cond: 'Gott skick', ship: 59, desc: 'Svarta vida byxor med pressveck.', material: 'Ullblandning', measure: 'Midja 74 · Innerben 80 cm', color: 'Svart', posted: '2 v sedan' }, i++),
    post({ id: 'acne', owner: ME, images: ['a:acne-stickat'], caption: 'Favoritstickan sedan 2019.', likes: 198, saves: 11, time: '2 v' }, i++),
    sale({ id: 'vaska', owner: ME, images: ['a:svart-vaska'], thumb: 'a:vaska', title: 'Skinnväska', brand: 'Filippa K', price: 700, size: 'One size', cond: 'Mycket gott skick', ship: 79, desc: 'Svart skinn, rymmer en laptop.', material: 'Läder', measure: '38 × 30 cm', color: 'Svart', posted: '3 v sedan' }, i++),
    sale({ id: 'sneakers', owner: ME, images: ['a:sneakers-du'], title: 'Låga sneakers', brand: 'Rick Owens', price: 550, size: '42', cond: 'Använt', ship: 79, desc: 'Kontrastsula, välvårdade.', material: 'Läder/canvas', measure: 'EU 42', color: 'Brun/kräm', posted: '3 v sedan' }, i++),
    sale({ id: 'xt6', owner: 'milostrand', images: ['a:salomon'], title: 'XT-6', brand: 'Salomon', price: 1400, size: '42', cond: 'Mycket gott skick', ship: 79, desc: 'Använda ett fåtal gånger, kartong finns.', material: 'Mesh', measure: 'EU 42', color: 'Vintage khaki', posted: '6 tim sedan', explore: true }, i++),
    sale({ id: 'nike', owner: 'oscarhed', images: ['a:nike-keps'], title: 'Dunk Low', brand: 'Nike', price: 990, size: 'One size', cond: 'Gott skick', ship: 49, desc: 'Keps i tvättad bomull, justerbar.', material: 'Bomull', measure: 'Justerbar', color: 'Mörkgrön', posted: '1 dag sedan', explore: true }, i++),
    sale({ id: 'levis', owner: 'linnahlborg', images: ['a:levis-stickat'], title: 'Kabelstickad tröja', brand: "Levi's", price: 520, size: 'M', cond: 'Mycket gott skick', ship: 59, desc: 'Varm och mjuk, ingen nopprighet.', material: 'Ullblandning', measure: 'Bröst 56 · Längd 66 cm', color: 'Beige', posted: '2 dagar sedan', explore: true }, i++),
    sale({ id: 'stussy', owner: 'elladella', images: ['a:stussy-keps'], title: 'Ram-keps', brand: 'Stüssy', price: 450, size: 'One size', cond: 'Ny med lapp', ship: 49, desc: 'Oanvänd, lappen kvar.', material: 'Bomull', measure: 'Justerbar', color: 'Svart', posted: '3 dagar sedan', explore: true }, i++),
  ];
}

export const FOLLOWING_FEED = ['linne', 'gron', 'amelia', 'filip', 'overshirt', 'promenad'];

export function seedComments(): Record<string, Comment[]> {
  return {
    amelia: [
      { user: 'erik', text: 'Är kavajen fortfarande till salu? Vilken storlek?', time: '1 tim', likes: 3 },
      { user: 'ameliacmode', text: 'Ja! Storlek M, den är taggad i bilden.', time: '52 min', reply: true, creator: true, likes: 5 },
      { user: 'maja', text: 'Snygg kombo med byxorna.', time: '40 min', likes: 1 },
      { user: 'lucas', text: 'Var är byxorna ifrån?', time: '12 min', likes: 0 },
    ],
    filip: [{ user: 'oskar', text: 'Vilken rock! Märke?', time: '20 min', likes: 2 }],
  };
}

let mid = 0;
const m = (o: Omit<Message, 'id'>): Message => ({ id: `s${mid++}`, ...o });

export function seedThreads(): Thread[] {
  return [
    { id: 'sofia', with: 'sofia', role: 'buyer', item: 'overshirt', time: '09:41', unread: true, messages: [
      m({ from: 'them', text: 'Hej! Är den här fortfarande till salu?', time: '09:12' }),
      m({ from: 'me', text: 'Hej! Ja, den finns kvar.', time: '09:13' }),
      m({ from: 'them', text: 'Toppen! Skulle du kunna tänka dig 500 kr?', time: '09:15' }),
      m({ from: 'them', offer: { kind: 'Bud', amount: 500, state: 'answered' }, time: '09:20' }),
      m({ from: 'me', text: 'Jag kan möta dig på 550 kr. Vad säger du?', time: '09:20' }),
      m({ from: 'me', offer: { kind: 'Motbud', amount: 550, state: 'agreed' }, time: '09:20' }),
      m({ from: 'them', text: 'Perfekt, då säger vi 550 kr! Kan vi ses imorgon?', time: '09:21' }),
    ] },
    { id: 'erik', with: 'erik', role: 'seller', time: 'Igår', messages: [m({ from: 'me', text: 'Swishar ikväll!', time: 'Igår' }), m({ from: 'them', text: 'Tack!', time: 'Igår' })] },
    { id: 'maja', with: 'maja', role: 'buyer', item: 'byxor', time: 'Igår', messages: [m({ from: 'them', text: 'Är den fortfarande kvar?', time: 'Igår' })] },
    { id: 'lucas', with: 'lucas', role: 'buyer', item: 'nb', time: 'Igår', messages: [m({ from: 'them', offer: { kind: 'Bud', amount: 950, state: 'open' }, time: 'Igår' })] },
    { id: 'emma', with: 'emma', role: 'seller', time: 'Tis', messages: [m({ from: 'me', text: 'Skickar den på torsdag.', time: 'Tis' }), m({ from: 'them', text: 'Super, hör av mig!', time: 'Tis' })] },
    { id: 'daniel', with: 'daniel', role: 'seller', time: 'Tis', messages: [m({ from: 'them', text: 'Kan mötas i veckan', time: 'Tis' })] },
    { id: 'hanna', with: 'hanna', role: 'buyer', item: 'vaska', time: 'Mån', messages: [m({ from: 'me', text: 'Paketet är skickat.', time: 'Mån' }), m({ from: 'them', text: 'Tack så mycket!', time: 'Mån' })] },
    { id: 'oskar', with: 'oskar', role: 'buyer', item: 'sneakers', time: 'Mån', messages: [m({ from: 'them', text: 'Är den i bra skick?', time: 'Mån' })] },
  ];
}
