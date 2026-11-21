-- ============================================================
-- Nyonglanrika: 0001_init.sql
-- Skema database lengkap - Phase 0
-- ============================================================

create extension if not exists pgcrypto;

-- ---- Players ----
create table players (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 3 and 16),
  look jsonb not null default '{}',
  coins int not null default 100 check (coins >= 0),
  zone text not null default 'alun_alun',
  pos_x int not null default 0,
  pos_y int not null default 0,
  party_cooldown_until timestamptz,
  schema_version int not null default 1,
  created_at timestamptz not null default now()
);

-- ---- Catalog (konten game dari seed) ----
create table catalog (
  kind text, id text, data jsonb not null,
  primary key (kind, id)
);

-- ---- Inventory ----
create table inventory (
  player_id uuid references players(id) on delete cascade,
  item_id text not null,
  qty int not null check (qty >= 0),
  primary key (player_id, item_id)
);

-- ---- Party system ----
create table parties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references players(id),
  max_members int not null default 2 check (max_members between 2 and 4)
);

create table party_members (
  party_id uuid not null references parties(id) on delete cascade,
  player_id uuid not null unique references players(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (party_id, player_id)
);

create table party_invites (
  code text primary key,
  party_id uuid not null references parties(id) on delete cascade,
  created_by uuid not null references players(id),
  expires_at timestamptz not null,
  used_by uuid references players(id)
);

-- ---- Houses ----
create table houses (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('personal','shared','annex')),
  owner_player uuid references players(id) on delete cascade,
  owner_party uuid references parties(id),
  tier int not null default 1,
  check ((owner_player is not null) <> (owner_party is not null))
);
create unique index one_personal on houses(owner_player) where kind = 'personal';
create unique index one_shared on houses(owner_party) where kind = 'shared';

-- ---- House Items (furniture) ----
create table house_items (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  item_id text not null,
  x int not null, y int not null, rot int not null default 0,
  placed_by uuid references players(id),
  unique (house_id, x, y)
);

-- ---- Farm Plots ----
create table plots (
  house_id uuid not null references houses(id) on delete cascade,
  slot int not null,
  crop_id text, planted_at timestamptz, last_watered date,
  primary key (house_id, slot)
);

-- ---- Collection / Album ----
create table collection (
  player_id uuid references players(id) on delete cascade,
  kind text not null, entry_id text not null,
  count int not null default 1,
  first_at timestamptz not null default now(),
  primary key (player_id, kind, entry_id)
);

-- ---- Quest Progress ----
create table quest_progress (
  player_id uuid references players(id) on delete cascade,
  quest_id text not null,
  state jsonb not null default '{}', done boolean not null default false,
  primary key (player_id, quest_id)
);

-- ---- Hint Texts (private) ----
create table hint_texts (
  hint_id text primary key, zone text not null,
  x int not null, y int not null, radius int not null default 24,
  hour_from int, hour_to int, body text not null
);

-- ---- Discoveries ----
create table discoveries (
  player_id uuid references players(id) on delete cascade,
  hint_id text references hint_texts(hint_id),
  found_at timestamptz not null default now(),
  primary key (player_id, hint_id)
);
