-- ============================================================
-- Nyonglanrika: 0004_weather_and_gameplay.sql
-- 1. Fix get_weather(): ganti tiap 10 menit + probabilitas seimbang (55% cerah)
-- 2. Pastikan semua gameplay RPC (update_character_look, get_my_house,
--    get_my_party, get_quests_and_discoveries, complete_quest) tersedia
-- 3. Track visited zones di save_state untuk quest_welcome
-- ============================================================

-- 1. GET WEATHER: berubah tiap 10 menit WIB, 55% cerah, 20% hujan, 15% gerimis, 10% kabut
create or replace function get_weather()
returns jsonb language plpgsql security definer stable set search_path = public as $$
declare
  v_now timestamptz;
  v_date text;
  v_hour int;
  v_minute int;
  v_slot int;
  v_hash int;
  v_weather text;
  v_intensity int;
begin
  v_now := now() at time zone 'Asia/Jakarta';
  v_date := to_char(v_now, 'YYYY-MM-DD');
  v_hour := extract(hour from v_now)::int;
  v_minute := extract(minute from v_now)::int;
  v_slot := floor(v_minute / 10)::int;

  v_hash := abs(hashtext(v_date || '-' || v_hour::text || '-' || v_slot::text));

  if (v_hash % 100) < 20 then
    v_weather := 'rain';
    v_intensity := (v_hash % 2) + 1;
  elsif (v_hash % 100) < 35 then
    v_weather := 'drizzle';
    v_intensity := 1;
  elsif (v_hash % 100) < 45 then
    v_weather := 'fog';
    v_intensity := (v_hash % 2) + 1;
  else
    v_weather := 'clear';
    v_intensity := 0;
  end if;

  return jsonb_build_object(
    'weather', v_weather,
    'intensity', v_intensity,
    'hour', v_hour,
    'minute', v_minute,
    'date', v_date
  );
end $$;

-- 2. SAVE STATE + catat zona yang dikunjungi untuk quest_welcome
create or replace function save_state(p_zone text, p_x int, p_y int)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_state jsonb;
  v_visited jsonb;
begin
  if v_uid is null then return; end if;

  update players set zone = p_zone, pos_x = p_x, pos_y = p_y
    where id = v_uid;

  select state into v_state from quest_progress
    where player_id = v_uid and quest_id = 'quest_welcome';

  v_visited := coalesce(v_state->'visited', '[]'::jsonb);
  if not (v_visited ? p_zone) then
    v_visited := v_visited || jsonb_build_array(p_zone);
    insert into quest_progress(player_id, quest_id, state, done)
      values (v_uid, 'quest_welcome', jsonb_build_object('visited', v_visited), false)
      on conflict (player_id, quest_id)
      do update set state = jsonb_set(coalesce(quest_progress.state, '{}'::jsonb), '{visited}', v_visited);
  end if;
end $$;

-- 3. UPDATE CHARACTER LOOK (Lemari Pakaian)
create or replace function update_character_look(p_look jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;
  update players
    set look = coalesce(look, '{}'::jsonb) || p_look
    where id = auth.uid();
end $$;

-- 4. GET MY HOUSE (untuk Kebun)
create or replace function get_my_house()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_house houses;
  v_plots jsonb;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;

  select * into v_house from houses
    where kind = 'personal' and owner_player = auth.uid()
    limit 1;

  if not found then
    insert into houses(kind, owner_player)
      values ('personal', auth.uid())
      returning * into v_house;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'slot', slot,
    'crop_id', crop_id,
    'planted_at', planted_at,
    'last_watered', last_watered
  ) order by slot), '[]'::jsonb)
  into v_plots
  from plots where house_id = v_house.id;

  return jsonb_build_object(
    'id', v_house.id,
    'kind', v_house.kind,
    'tier', v_house.tier,
    'plots', v_plots
  );
end $$;

-- 5. GET MY PARTY (untuk Party & Rumah Bersama)
create or replace function get_my_party()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_party parties;
  v_members jsonb;
  v_house houses;
  v_items jsonb;
begin
  if auth.uid() is null then return null; end if;

  select p.* into v_party
    from parties p
    join party_members pm on pm.party_id = p.id
    where pm.player_id = auth.uid()
    limit 1;

  if not found then return null; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'player_id', pl.id,
    'name', pl.name,
    'is_owner', (pl.id = v_party.owner_id)
  )), '[]'::jsonb)
  into v_members
  from party_members pm
  join players pl on pl.id = pm.player_id
  where pm.party_id = v_party.id;

  select * into v_house from houses
    where kind = 'shared' and owner_party = v_party.id
    limit 1;

  if v_house.id is not null then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', id,
      'item_id', item_id,
      'x', x,
      'y', y,
      'rot', rot,
      'placed_by', placed_by
    )), '[]'::jsonb)
    into v_items
    from house_items where house_id = v_house.id;
  else
    v_items := '[]'::jsonb;
  end if;

  return jsonb_build_object(
    'party_id', v_party.id,
    'party_name', v_party.name,
    'owner_id', v_party.owner_id,
    'is_owner', (v_party.owner_id = auth.uid()),
    'members', v_members,
    'shared_house_id', v_house.id,
    'house_items', v_items
  );
end $$;

-- 6. GET QUESTS AND DISCOVERIES
create or replace function get_quests_and_discoveries()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_quests jsonb;
  v_discoveries jsonb;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'quest_id', quest_id,
    'state', state,
    'done', done
  )), '[]'::jsonb)
  into v_quests
  from quest_progress where player_id = auth.uid();

  select coalesce(jsonb_agg(jsonb_build_object(
    'hint_id', hint_id,
    'found_at', found_at
  )), '[]'::jsonb)
  into v_discoveries
  from discoveries where player_id = auth.uid();

  return jsonb_build_object(
    'quests', v_quests,
    'discoveries', v_discoveries
  );
end $$;

-- 7. COMPLETE QUEST (validasi syarat & berikan hadiah koin + item)
create or replace function complete_quest(p_quest_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_done boolean;
  v_reward_coins int := 0;
  v_visited jsonb;
  v_count int;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;

  select done into v_done from quest_progress
    where player_id = v_uid and quest_id = p_quest_id;
  if coalesce(v_done, false) then
    raise exception 'QUEST_ALREADY_DONE';
  end if;

  if p_quest_id = 'quest_welcome' then
    select state->'visited' into v_visited from quest_progress
      where player_id = v_uid and quest_id = 'quest_welcome';
    if v_visited is null or not (v_visited ? 'pasar_wage' and v_visited ? 'sungai_serayu') then
      raise exception 'Kunjungi Pasar Wage dan Sungai Serayu terlebih dahulu!';
    end if;
    v_reward_coins := 50;

  elsif p_quest_id = 'quest_first_fish' then
    select coalesce(sum(count), 0) into v_count from collection
      where player_id = v_uid and kind = 'fish';
    if v_count < 1 then
      raise exception 'Tangkap minimal 1 ikan di Sungai Serayu terlebih dahulu!';
    end if;
    v_reward_coins := 30;
    insert into inventory(player_id, item_id, qty) values (v_uid, 'umpan_cacing', 5)
      on conflict (player_id, item_id) do update set qty = inventory.qty + 5;

  elsif p_quest_id = 'quest_first_harvest' then
    select coalesce(qty, 0) into v_count from inventory
      where player_id = v_uid and item_id = 'bayam';
    if v_count < 2 then
      raise exception 'Kamu butuh minimal 2 Bayam di tas!';
    end if;
    v_reward_coins := 40;
    insert into inventory(player_id, item_id, qty) values (v_uid, 'cabai_seed', 3)
      on conflict (player_id, item_id) do update set qty = inventory.qty + 3;

  elsif p_quest_id = 'quest_cook_mendoan' then
    select coalesce(qty, 0) into v_count from inventory
      where player_id = v_uid and item_id = 'mendoan';
    if v_count < 1 then
      raise exception 'Masak Mendoan terlebih dahulu di menu Masak!';
    end if;
    v_reward_coins := 60;
    insert into inventory(player_id, item_id, qty) values (v_uid, 'kompor_tanah', 1)
      on conflict (player_id, item_id) do update set qty = inventory.qty + 1;

  elsif p_quest_id = 'quest_telaga' then
    select coalesce(sum(count), 0) into v_count from collection
      where player_id = v_uid and kind = 'fish' and entry_id = 'ikan_dewa';
    if v_count < 1 then
      raise exception 'Tangkap Ikan Dewa di Telaga Sunyi (Baturraden) terlebih dahulu!';
    end if;
    v_reward_coins := 500;

  elsif p_quest_id = 'quest_kenangan' then
    select count(*) into v_count from discoveries where player_id = v_uid;
    if v_count < 5 then
      raise exception 'Temukan minimal 5 petunjuk kenangan tersembunyi terlebih dahulu!';
    end if;
    v_reward_coins := 1000;

  else
    raise exception 'UNKNOWN_QUEST';
  end if;

  update players set coins = coins + v_reward_coins where id = v_uid;

  insert into quest_progress(player_id, quest_id, state, done)
    values (v_uid, p_quest_id, '{}'::jsonb, true)
    on conflict (player_id, quest_id) do update set done = true;

  return jsonb_build_object('success', true, 'reward_coins', v_reward_coins);
end $$;
