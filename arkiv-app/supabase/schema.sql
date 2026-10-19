-- ARKIV – databas för Supabase.
-- Kör hela filen en gång i Supabase → SQL Editor → New query → Run.

-- ============================================================
-- Tabeller
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle text not null unique check (handle ~ '^[a-z0-9_.]{3,24}$'),
  name text not null check (char_length(name) between 1 and 40),
  bio text not null default '' check (char_length(bio) <= 160),
  city text not null default '' check (char_length(city) <= 40),
  avatar_path text,
  created_at timestamptz not null default now()
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('post', 'sale')),
  tag text not null default 'Inlägg' check (tag in ('Inlägg', 'OOTD', 'Review', 'Sälj')),
  caption text not null default '' check (char_length(caption) <= 1000),
  -- [{ "path": "...", "type": "image" | "video", "poster": "...", "width": 1080, "height": 1350 }]
  media jsonb not null check (jsonb_typeof(media) = 'array' and jsonb_array_length(media) between 1 and 10),
  title text check (char_length(title) <= 60),
  brand text check (char_length(brand) <= 40),
  price integer check (price between 1 and 1000000),
  size text check (char_length(size) <= 20),
  condition text check (char_length(condition) <= 30),
  shipping text check (char_length(shipping) <= 40),
  pickup boolean not null default false,
  sold boolean not null default false,
  created_at timestamptz not null default now(),
  check (kind = 'post' or (price is not null and brand is not null and title is not null))
);
create index items_created_idx on public.items (created_at desc);
create index items_owner_idx on public.items (owner_id, created_at desc);

create table public.likes (
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  item_id uuid not null references public.items (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);
create index likes_item_idx on public.likes (item_id);

create table public.saves (
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  item_id uuid not null references public.items (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  followee_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);
create index follows_followee_idx on public.follows (followee_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index comments_item_idx on public.comments (item_id, created_at);

create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  item_id uuid references public.items (id) on delete set null,
  user_id uuid references public.profiles (id) on delete set null,
  comment_id uuid references public.comments (id) on delete set null,
  reason text not null check (char_length(reason) <= 200),
  created_at timestamptz not null default now()
);

create table public.threads (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.items (id) on delete set null,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  last_message text not null default '',
  last_sender_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (buyer_id <> seller_id),
  unique nulls not distinct (buyer_id, seller_id, item_id)
);
create index threads_buyer_idx on public.threads (buyer_id, updated_at desc);
create index threads_seller_idx on public.threads (seller_id, updated_at desc);

create table public.thread_reads (
  thread_id uuid not null references public.threads (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  read_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null default auth.uid(),
  body text check (char_length(body) <= 2000),
  offer_kind text check (offer_kind in ('Bud', 'Motbud')),
  offer_amount integer check (offer_amount between 1 and 1000000),
  offer_state text check (offer_state in ('open', 'accepted', 'declined', 'countered')),
  system boolean not null default false,
  created_at timestamptz not null default now(),
  check (body is not null or offer_kind is not null)
);
create index messages_thread_idx on public.messages (thread_id, created_at);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null unique references public.threads (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  stars integer not null check (stars between 1 and 5),
  body text not null default '' check (char_length(body) <= 500),
  created_at timestamptz not null default now()
);
create index reviews_seller_idx on public.reviews (seller_id, created_at desc);

-- ============================================================
-- Hjälpfunktioner
-- ============================================================

create or replace function public.is_participant(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from threads where id = t and auth.uid() in (buyer_id, seller_id));
$$;

-- Blockering åt något håll mellan två användare (läser förbi RLS på blocks).
create or replace function public.is_blocked_between(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from blocks where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a));
$$;

-- Håller trådens förhandsrad och tidsstämpel uppdaterad.
create or replace function public.on_message_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update threads set
    updated_at = new.created_at,
    last_sender_id = new.sender_id,
    last_message = case
      when new.offer_kind is not null then new.offer_kind || ' ' || new.offer_amount || ' kr'
      else left(new.body, 140)
    end
  where id = new.thread_id;
  return new;
end;
$$;
create trigger messages_after_insert after insert on public.messages
for each row execute function public.on_message_insert();

-- Köparen lägger ett bud i en tråd som gäller ett plagg.
create or replace function public.make_offer(p_thread uuid, p_amount integer) returns public.messages
language plpgsql security definer set search_path = public as $$
declare
  t threads;
  it items;
  m messages;
begin
  select * into t from threads where id = p_thread;
  if t.id is null or t.buyer_id <> auth.uid() then raise exception 'Bara köparen kan lägga bud'; end if;
  select * into it from items where id = t.item_id;
  if it.id is null or it.kind <> 'sale' then raise exception 'Plagget finns inte'; end if;
  if it.sold then raise exception 'Plagget är redan sålt'; end if;
  if public.is_blocked_between(t.buyer_id, t.seller_id) then raise exception 'Kan inte skicka bud'; end if;
  if p_amount < 1 then raise exception 'Ogiltigt belopp'; end if;
  update messages set offer_state = 'declined' where thread_id = p_thread and offer_state = 'open';
  insert into messages (thread_id, sender_id, offer_kind, offer_amount, offer_state)
  values (p_thread, auth.uid(), 'Bud', p_amount, 'open') returning * into m;
  return m;
end;
$$;

-- Mottagaren av ett bud/motbud accepterar, avböjer eller ger motbud.
create or replace function public.answer_offer(p_message uuid, p_action text, p_amount integer default null)
returns public.messages
language plpgsql security definer set search_path = public as $$
declare
  m messages;
  t threads;
  it items;
  r messages;
begin
  select * into m from messages where id = p_message for update;
  if m.id is null or m.offer_state <> 'open' then raise exception 'Budet är inte längre öppet'; end if;
  select * into t from threads where id = m.thread_id;
  if auth.uid() not in (t.buyer_id, t.seller_id) or m.sender_id = auth.uid() then
    raise exception 'Du kan inte svara på det här budet';
  end if;
  select * into it from items where id = t.item_id for update;
  if it.id is null or it.sold then raise exception 'Plagget är redan sålt'; end if;

  if p_action = 'accept' then
    update messages set offer_state = 'accepted' where id = m.id;
    update items set sold = true where id = it.id;
    insert into messages (thread_id, sender_id, body, system)
    values (t.id, auth.uid(), 'Affär klar · ' || m.offer_amount || ' kr', true) returning * into r;
  elsif p_action = 'decline' then
    update messages set offer_state = 'declined' where id = m.id returning * into r;
  elsif p_action = 'counter' then
    if p_amount is null or p_amount < 1 then raise exception 'Ogiltigt belopp'; end if;
    update messages set offer_state = 'countered' where id = m.id;
    insert into messages (thread_id, sender_id, offer_kind, offer_amount, offer_state)
    values (t.id, auth.uid(), 'Motbud', p_amount, 'open') returning * into r;
  else
    raise exception 'Okänd åtgärd';
  end if;
  return r;
end;
$$;

-- Köparen lämnar omdöme efter en avslutad affär.
create or replace function public.can_review(p_thread uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from threads t join messages m on m.thread_id = t.id
    where t.id = p_thread and t.buyer_id = auth.uid() and m.offer_state = 'accepted'
  );
$$;

-- Raderar kontot och allt innehåll (krävs av App Store). Filer i lagringen tas bort av appen först.
create or replace function public.delete_account() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Inte inloggad'; end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_account() from public, anon;
revoke execute on function public.make_offer(uuid, integer) from public, anon;
revoke execute on function public.answer_offer(uuid, text, integer) from public, anon;
grant execute on function public.delete_account() to authenticated;
grant execute on function public.make_offer(uuid, integer) to authenticated;
grant execute on function public.answer_offer(uuid, text, integer) to authenticated;

-- ============================================================
-- Behörigheter (Row Level Security)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.likes enable row level security;
alter table public.saves enable row level security;
alter table public.follows enable row level security;
alter table public.comments enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.threads enable row level security;
alter table public.thread_reads enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

create policy "profiler syns för inloggade" on public.profiles for select to authenticated using (true);
create policy "skapa egen profil" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "ändra egen profil" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "inlägg syns för inloggade" on public.items for select to authenticated using (true);
create policy "skapa egna inlägg" on public.items for insert to authenticated with check (owner_id = auth.uid() and sold = false);
create policy "ändra egna inlägg" on public.items for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "ta bort egna inlägg" on public.items for delete to authenticated using (owner_id = auth.uid());

create policy "gilla syns" on public.likes for select to authenticated using (true);
create policy "gilla själv" on public.likes for insert to authenticated with check (user_id = auth.uid());
create policy "ogilla själv" on public.likes for delete to authenticated using (user_id = auth.uid());

create policy "egna sparade" on public.saves for select to authenticated using (user_id = auth.uid());
create policy "spara själv" on public.saves for insert to authenticated with check (user_id = auth.uid());
create policy "ta bort sparad" on public.saves for delete to authenticated using (user_id = auth.uid());

create policy "följare syns" on public.follows for select to authenticated using (true);
create policy "följ själv" on public.follows for insert to authenticated with check (follower_id = auth.uid());
create policy "sluta följa" on public.follows for delete to authenticated using (follower_id = auth.uid());

create policy "kommentarer syns" on public.comments for select to authenticated using (true);
create policy "kommentera själv" on public.comments for insert to authenticated with check (user_id = auth.uid());
create policy "ta bort kommentar" on public.comments for delete to authenticated using (
  user_id = auth.uid() or exists (select 1 from items where items.id = item_id and items.owner_id = auth.uid())
);

create policy "egna blockeringar" on public.blocks for select to authenticated using (blocker_id = auth.uid());
create policy "blockera" on public.blocks for insert to authenticated with check (blocker_id = auth.uid());
create policy "avblockera" on public.blocks for delete to authenticated using (blocker_id = auth.uid());

create policy "rapportera" on public.reports for insert to authenticated with check (reporter_id = auth.uid());

create policy "egna trådar" on public.threads for select to authenticated using (auth.uid() in (buyer_id, seller_id));
create policy "starta tråd" on public.threads for insert to authenticated with check (
  auth.uid() in (buyer_id, seller_id) and not public.is_blocked_between(buyer_id, seller_id)
);

create policy "egen läsmarkering" on public.thread_reads for select to authenticated using (user_id = auth.uid());
create policy "markera läst" on public.thread_reads for insert to authenticated with check (user_id = auth.uid() and public.is_participant(thread_id));
create policy "uppdatera läst" on public.thread_reads for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "meddelanden i egna trådar" on public.messages for select to authenticated using (public.is_participant(thread_id));
create policy "skicka meddelande" on public.messages for insert to authenticated with check (
  sender_id = auth.uid() and public.is_participant(thread_id)
  and offer_kind is null and offer_amount is null and offer_state is null and system = false
  and not exists (select 1 from threads t where t.id = thread_id and public.is_blocked_between(t.buyer_id, t.seller_id))
);

create policy "omdömen syns" on public.reviews for select to authenticated using (true);
create policy "lämna omdöme" on public.reviews for insert to authenticated with check (
  reviewer_id = auth.uid() and public.can_review(thread_id)
  and seller_id = (select seller_id from threads where id = thread_id)
);

-- ============================================================
-- Realtid för chatten
-- ============================================================

alter publication supabase_realtime add table public.messages, public.threads;

-- ============================================================
-- Lagring av bilder och videor
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800, array['image/jpeg', 'image/png', 'image/heic', 'image/webp', 'video/mp4', 'video/quicktime'])
on conflict (id) do nothing;

create policy "ladda upp i egen mapp" on storage.objects for insert to authenticated
with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "ta bort i egen mapp" on storage.objects for delete to authenticated
using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "lista egen mapp" on storage.objects for select to authenticated
using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
