-- ============================================================
-- Nyonglanrika: 0002_rls.sql
-- Row Level Security - hanya SELECT, tidak ada INSERT/UPDATE/DELETE
-- ============================================================

-- Enable RLS pada semua tabel
alter table players enable row level security;
alter table catalog enable row level security;
alter table inventory enable row level security;
alter table parties enable row level security;
alter table party_members enable row level security;
alter table party_invites enable row level security;
alter table houses enable row level security;
alter table house_items enable row level security;
alter table plots enable row level security;
alter table collection enable row level security;
alter table quest_progress enable row level security;
alter table hint_texts enable row level security;
alter table discoveries enable row level security;

-- ---- Helper functions ----

create or replace function my_party_id() returns uuid
  language sql security definer stable set search_path = public
  as $$ select party_id from party_members where player_id = auth.uid() $$;

create or replace function can_see_house(h uuid) returns boolean
  language sql security definer stable set search_path = public
  as $$ select exists (select 1 from houses where id = h
    and (owner_player = auth.uid() or owner_party = my_party_id())) $$;

-- ---- SELECT policies ----

create policy p_players on players for select
  using (id = auth.uid() or id in
    (select player_id from party_members where party_id = my_party_id()));

create policy p_inventory on inventory for select
  using (player_id = auth.uid());

create policy p_party on parties for select
  using (id = my_party_id());

create policy p_members on party_members for select
  using (party_id = my_party_id());

create policy p_houses on houses for select
  using (can_see_house(id));

create policy p_items on house_items for select
  using (can_see_house(house_id));

create policy p_plots on plots for select
  using (can_see_house(house_id));

create policy p_collection on collection for select
  using (player_id = auth.uid());

create policy p_quest on quest_progress for select
  using (player_id = auth.uid());

create policy p_disc on discoveries for select
  using (player_id = auth.uid());

create policy p_catalog on catalog for select
  using (true);

-- hint_texts dan party_invites: RLS aktif TANPA policy = tertutup untuk klien

-- ---- Realtime ----
alter publication supabase_realtime add table house_items, plots;
