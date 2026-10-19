export type Profile = {
  id: string;
  handle: string;
  name: string;
  bio: string;
  city: string;
  avatar_path: string | null;
  created_at: string;
};

export type Media = { path: string; type: 'image' | 'video'; poster?: string; width?: number; height?: number };

export type Tag = 'Inlägg' | 'OOTD' | 'Review' | 'Sälj';

export type Item = {
  id: string;
  owner_id: string;
  kind: 'post' | 'sale';
  tag: Tag;
  caption: string;
  media: Media[];
  title: string | null;
  brand: string | null;
  price: number | null;
  size: string | null;
  condition: string | null;
  shipping: string | null;
  pickup: boolean;
  sold: boolean;
  created_at: string;
  owner?: Profile;
  likes?: { count: number }[];
  comments?: { count: number }[];
};

export type Comment = { id: string; item_id: string; user_id: string; body: string; created_at: string; user?: Profile };

export type Thread = {
  id: string;
  item_id: string | null;
  buyer_id: string;
  seller_id: string;
  last_message: string;
  last_sender_id: string | null;
  created_at: string;
  updated_at: string;
  item?: Item | null;
  buyer?: Profile;
  seller?: Profile;
};

export type Message = {
  id: string;
  thread_id: string;
  sender_id: string | null;
  body: string | null;
  offer_kind: 'Bud' | 'Motbud' | null;
  offer_amount: number | null;
  offer_state: 'open' | 'accepted' | 'declined' | 'countered' | null;
  system: boolean;
  created_at: string;
};

export type Review = { id: string; thread_id: string; seller_id: string; reviewer_id: string; stars: number; body: string; created_at: string; reviewer?: Profile };
