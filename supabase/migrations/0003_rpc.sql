-- ============================================================
-- Nyonglanrika: 0003_rpc.sql
-- Remote Procedure Calls - semua security definer
-- ============================================================

-- ============================================================
-- DAFTAR KATA TERLARANG (sederhana)
-- ============================================================
create or replace function is_name_banned(p_name text) returns boolean
  language sql immutable as $$
  select lower(p_name) = any(array[
    'admin','moderator','system','server','gm','gamemaster',
    'fuck','shit','ass','dick','bitch','bastard',
    'kontol','memek','anjing','bangsat','babi','tolol','goblok'
  ])
$$;

-- ============================================================
-- CREATE CHARACTER
-- ============================================================
create or replace function create_character(p_name text, p_look jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  v_id := auth.uid();
  if v_id is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if exists (select 1 from players where id = v_id) then
    raise exception 'ALREADY_HAS_CHARACTER';
  end if;
  if char_length(p_name) < 3 or char_length(p_name) > 16 then
    raise exception 'NAME_LENGTH_INVALID';
  end if;
  if is_name_banned(p_name) then
    raise exception 'NAME_BANNED';
  end if;
  if exists (select 1 from players where lower(name) = lower(p_name)) then
    raise exception 'NAME_TAKEN';
  end if;

  insert into players(id, name, look) values (v_id, p_name, p_look);
  insert into houses(kind, owner_player) values ('personal', v_id);

  return v_id;
end $$;

-- ============================================================
-- SAVE STATE
-- ============================================================
create or replace function save_state(p_zone text, p_x int, p_y int)
returns void language plpgsql security definer set search_path = public as $$
begin
  update players set zone = p_zone, pos_x = p_x, pos_y = p_y
    where id = auth.uid();
end $$;

-- ============================================================
-- GET WEATHER (deterministik dari tanggal + jam WIB)
-- ============================================================
create or replace function get_weather()
returns jsonb language plpgsql security definer stable set search_path = public as $$
declare
  v_now timestamptz;
  v_date text;
  v_hour int;
  v_hash int;
  v_weather text;
  v_intensity int;
begin
  v_now := now() at time zone 'Asia/Jakarta';
  v_date := to_char(v_now, 'YYYY-MM-DD');
  v_hour := extract(hour from v_now)::int;

  -- Hash deterministik: semua pemain di jam yang sama mendapat cuaca sama
  v_hash := abs(hashtext(v_date || '-' || v_hour::text));

  -- Purwokerto kota hujan: 40% hujan, 15% gerimis, 10% kabut, 35% cerah
  if (v_hash % 100) < 40 then
    v_weather := 'rain';
    v_intensity := (v_hash % 3) + 1; -- 1-3
  elsif (v_hash % 100) < 55 then
    v_weather := 'drizzle';
    v_intensity := 1;
  elsif (v_hash % 100) < 65 then
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
    'date', v_date
  );
end $$;

-- ============================================================
-- SELL ITEM
-- ============================================================
create or replace function sell_item(p_item text, p_qty int)
returns int language plpgsql security definer set search_path = public as $$
declare
  v_price int;
  v_total int;
  v_current_qty int;
begin
  if p_qty <= 0 then raise exception 'INVALID_QTY'; end if;

  select (data->>'sell_price')::int into v_price
    from catalog where kind in ('fish','crop','food','item') and id = p_item;
  if v_price is null then raise exception 'ITEM_NOT_SELLABLE'; end if;

  select qty into v_current_qty from inventory
    where player_id = auth.uid() and item_id = p_item for update;
  if v_current_qty is null or v_current_qty < p_qty then
    raise exception 'NOT_ENOUGH_ITEMS';
  end if;

  v_total := v_price * p_qty;

  update inventory set qty = qty - p_qty
    where player_id = auth.uid() and item_id = p_item;
  delete from inventory where player_id = auth.uid() and item_id = p_item and qty = 0;

  update players set coins = coins + v_total where id = auth.uid();

  return v_total;
end $$;

-- ============================================================
-- BUY ITEM
-- ============================================================
create or replace function buy_item(p_item text, p_qty int)
returns int language plpgsql security definer set search_path = public as $$
declare
  v_price int;
  v_total int;
begin
  if p_qty <= 0 then raise exception 'INVALID_QTY'; end if;

  select (data->>'buy_price')::int into v_price
    from catalog where id = p_item and (data->>'buyable')::boolean = true;
  if v_price is null then raise exception 'ITEM_NOT_BUYABLE'; end if;

  v_total := v_price * p_qty;

  update players set coins = coins - v_total where id = auth.uid() and coins >= v_total;
  if not found then raise exception 'NOT_ENOUGH_COINS'; end if;

  insert into inventory(player_id, item_id, qty) values (auth.uid(), p_item, p_qty)
    on conflict (player_id, item_id) do update set qty = inventory.qty + p_qty;

  return v_total;
end $$;

-- ============================================================
-- FISHING: start_cast & catch_fish
-- ============================================================
create or replace function start_cast(p_spot text)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare v_now timestamptz;
begin
  v_now := now();
  -- Simpan waktu lempar di metadata player untuk validasi catch
  update players set look = look || jsonb_build_object(
    '_cast_spot', p_spot, '_cast_at', v_now
  ) where id = auth.uid();
  return v_now;
end $$;

create or replace function catch_fish(p_spot text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_cast_at timestamptz;
  v_cast_spot text;
  v_elapsed interval;
  v_weather jsonb;
  v_hour int;
  v_fish record;
  v_roll int;
  v_cumulative int := 0;
  v_total_weight int := 0;
  v_result jsonb;
begin
  -- Ambil data cast
  select (look->>'_cast_at')::timestamptz, look->>'_cast_spot'
    into v_cast_at, v_cast_spot
    from players where id = auth.uid();

  if v_cast_at is null then raise exception 'NO_ACTIVE_CAST'; end if;
  if v_cast_spot <> p_spot then raise exception 'WRONG_SPOT'; end if;

  v_elapsed := now() - v_cast_at;
  if v_elapsed < interval '2 seconds' then raise exception 'TOO_FAST'; end if;

  -- Ambil cuaca dan jam
  v_weather := get_weather();
  v_hour := (v_weather->>'hour')::int;

  -- Hitung total bobot ikan yang tersedia di spot ini
  select coalesce(sum((data->>'weight')::int), 0) into v_total_weight
    from catalog where kind = 'fish'
    and data->>'spot' = p_spot
    and (data->>'hour_from' is null or v_hour >= (data->>'hour_from')::int)
    and (data->>'hour_to' is null or v_hour <= (data->>'hour_to')::int);

  if v_total_weight = 0 then
    -- Tidak ada ikan tersedia: gagal
    v_result := jsonb_build_object('caught', false, 'reason', 'no_fish_available');
  else
    -- Roll acak
    v_roll := floor(random() * v_total_weight)::int;

    for v_fish in
      select id, data from catalog where kind = 'fish'
      and data->>'spot' = p_spot
      and (data->>'hour_from' is null or v_hour >= (data->>'hour_from')::int)
      and (data->>'hour_to' is null or v_hour <= (data->>'hour_to')::int)
      order by (data->>'weight')::int desc
    loop
      v_cumulative := v_cumulative + (v_fish.data->>'weight')::int;
      if v_roll < v_cumulative then
        -- Ikan tertangkap!
        insert into inventory(player_id, item_id, qty) values (auth.uid(), v_fish.id, 1)
          on conflict (player_id, item_id) do update set qty = inventory.qty + 1;

        -- Collection
        insert into collection(player_id, kind, entry_id) values (auth.uid(), 'fish', v_fish.id)
          on conflict (player_id, kind, entry_id) do update set count = collection.count + 1;

        v_result := jsonb_build_object(
          'caught', true,
          'fish_id', v_fish.id,
          'name', v_fish.data->>'name',
          'rarity', v_fish.data->>'rarity'
        );
        exit;
      end if;
    end loop;
  end if;

  -- Bersihkan data cast
  update players set look = look - '_cast_at' - '_cast_spot' where id = auth.uid();

  return v_result;
end $$;

-- ============================================================
-- FARMING: plant, water, harvest
-- ============================================================
create or replace function plant_crop(p_house_id uuid, p_slot int, p_crop_id text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not can_see_house(p_house_id) then raise exception 'NO_ACCESS'; end if;

  -- Cek apakah pemain punya bibit
  if not exists (select 1 from inventory where player_id = auth.uid()
    and item_id = p_crop_id || '_seed' and qty > 0) then
    raise exception 'NO_SEEDS';
  end if;

  -- Cek slot kosong
  if exists (select 1 from plots where house_id = p_house_id and slot = p_slot
    and crop_id is not null) then
    raise exception 'SLOT_OCCUPIED';
  end if;

  -- Tanam
  insert into plots(house_id, slot, crop_id, planted_at)
    values (p_house_id, p_slot, p_crop_id, now())
    on conflict (house_id, slot) do update
    set crop_id = p_crop_id, planted_at = now(), last_watered = null;

  -- Kurangi bibit
  update inventory set qty = qty - 1
    where player_id = auth.uid() and item_id = p_crop_id || '_seed';
  delete from inventory where player_id = auth.uid()
    and item_id = p_crop_id || '_seed' and qty = 0;
end $$;

create or replace function water_plot(p_house_id uuid, p_slot int)
returns void language plpgsql security definer set search_path = public as $$
declare v_today date;
begin
  if not can_see_house(p_house_id) then raise exception 'NO_ACCESS'; end if;

  v_today := (now() at time zone 'Asia/Jakarta')::date;

  update plots set last_watered = v_today
    where house_id = p_house_id and slot = p_slot
    and crop_id is not null
    and (last_watered is null or last_watered < v_today);

  if not found then raise exception 'NOTHING_TO_WATER'; end if;
end $$;

create or replace function harvest_plot(p_house_id uuid, p_slot int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_plot plots;
  v_crop_data jsonb;
  v_duration interval;
  v_elapsed interval;
  v_yield int;
begin
  if not can_see_house(p_house_id) then raise exception 'NO_ACCESS'; end if;

  select * into v_plot from plots
    where house_id = p_house_id and slot = p_slot and crop_id is not null
    for update;
  if not found then raise exception 'EMPTY_SLOT'; end if;

  select data into v_crop_data from catalog where kind = 'crop' and id = v_plot.crop_id;
  if v_crop_data is null then raise exception 'UNKNOWN_CROP'; end if;

  v_duration := ((v_crop_data->>'grow_hours')::int || ' hours')::interval;
  v_elapsed := now() - v_plot.planted_at;

  if v_elapsed < v_duration then raise exception 'NOT_READY'; end if;

  v_yield := coalesce((v_crop_data->>'yield')::int, 1);

  -- Tambah hasil panen ke inventaris
  insert into inventory(player_id, item_id, qty) values (auth.uid(), v_plot.crop_id, v_yield)
    on conflict (player_id, item_id) do update set qty = inventory.qty + v_yield;

  -- Collection
  insert into collection(player_id, kind, entry_id) values (auth.uid(), 'crop', v_plot.crop_id)
    on conflict (player_id, kind, entry_id) do update set count = collection.count + v_yield;

  -- Reset slot
  update plots set crop_id = null, planted_at = null, last_watered = null
    where house_id = p_house_id and slot = p_slot;

  return jsonb_build_object('crop_id', v_plot.crop_id, 'yield', v_yield);
end $$;

-- ============================================================
-- COOKING
-- ============================================================
create or replace function cook(p_recipe text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_recipe jsonb;
  v_ingredients jsonb;
  v_item record;
begin
  select data into v_recipe from catalog where kind = 'recipe' and id = p_recipe;
  if v_recipe is null then raise exception 'UNKNOWN_RECIPE'; end if;

  v_ingredients := v_recipe->'ingredients';

  -- Cek semua bahan cukup
  for v_item in select * from jsonb_each_text(v_ingredients)
  loop
    if not exists (select 1 from inventory
      where player_id = auth.uid() and item_id = v_item.key
      and qty >= v_item.value::int) then
      raise exception 'MISSING_INGREDIENT_%', v_item.key;
    end if;
  end loop;

  -- Kurangi bahan
  for v_item in select * from jsonb_each_text(v_ingredients)
  loop
    update inventory set qty = qty - v_item.value::int
      where player_id = auth.uid() and item_id = v_item.key;
    delete from inventory where player_id = auth.uid() and item_id = v_item.key and qty = 0;
  end loop;

  -- Tambah hasil masakan
  insert into inventory(player_id, item_id, qty) values (auth.uid(), p_recipe, 1)
    on conflict (player_id, item_id) do update set qty = inventory.qty + 1;

  return jsonb_build_object('cooked', p_recipe, 'name', v_recipe->>'name');
end $$;

-- ============================================================
-- FURNITURE: place & remove
-- ============================================================
create or replace function place_furniture(p_house_id uuid, p_item_id text, p_x int, p_y int, p_rot int default 0)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_house houses;
  v_new_id uuid;
begin
  if not can_see_house(p_house_id) then raise exception 'NO_ACCESS'; end if;

  select * into v_house from houses where id = p_house_id;

  -- Cek item di inventaris
  if not exists (select 1 from inventory where player_id = auth.uid()
    and item_id = p_item_id and qty > 0) then
    raise exception 'NO_ITEM';
  end if;

  -- Cek batas tier (tier 1 = 12x8 = 96 tiles max)
  declare v_count int;
  begin
    select count(*) into v_count from house_items where house_id = p_house_id;
    if v_count >= (v_house.tier * 96) then raise exception 'HOUSE_FULL'; end if;
  end;

  -- Insert (unique constraint menjaga tile tidak bentrok)
  insert into house_items(house_id, item_id, x, y, rot, placed_by)
    values (p_house_id, p_item_id, p_x, p_y, p_rot, auth.uid())
    returning id into v_new_id;

  -- Kurangi inventaris
  update inventory set qty = qty - 1
    where player_id = auth.uid() and item_id = p_item_id;
  delete from inventory where player_id = auth.uid() and item_id = p_item_id and qty = 0;

  return v_new_id;
end $$;

create or replace function remove_furniture(p_item_uuid uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_item house_items;
begin
  select * into v_item from house_items where id = p_item_uuid for update;
  if not found then raise exception 'ITEM_NOT_FOUND'; end if;
  if not can_see_house(v_item.house_id) then raise exception 'NO_ACCESS'; end if;

  delete from house_items where id = p_item_uuid;

  insert into inventory(player_id, item_id, qty) values (auth.uid(), v_item.item_id, 1)
    on conflict (player_id, item_id) do update set qty = inventory.qty + 1;
end $$;

-- ============================================================
-- PARTY SYSTEM
-- ============================================================
create or replace function create_party(p_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_party_id uuid;
begin
  if exists (select 1 from party_members where player_id = auth.uid()) then
    raise exception 'ALREADY_IN_PARTY';
  end if;
  if exists (select 1 from players where id = auth.uid()
    and party_cooldown_until > now()) then
    raise exception 'COOLDOWN';
  end if;

  insert into parties(name, owner_id) values (p_name, auth.uid())
    returning id into v_party_id;
  insert into party_members(party_id, player_id) values (v_party_id, auth.uid());

  -- Buat rumah bersama
  insert into houses(kind, owner_party) values ('shared', v_party_id);

  return v_party_id;
end $$;

create or replace function create_invite(p_party_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- tanpa O,0,I,1
begin
  -- Hanya owner boleh buat undangan
  if not exists (select 1 from parties where id = p_party_id and owner_id = auth.uid()) then
    raise exception 'NOT_PARTY_OWNER';
  end if;

  -- Generate kode 6 karakter
  v_code := '';
  for i in 1..6 loop
    v_code := v_code || substr(v_chars, floor(random() * length(v_chars))::int + 1, 1);
  end loop;

  insert into party_invites(code, party_id, created_by, expires_at)
    values (v_code, p_party_id, auth.uid(), now() + interval '24 hours');

  return v_code;
end $$;

create or replace function join_party(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_inv party_invites; v_count int; v_max int;
begin
  select * into v_inv from party_invites
    where code = p_code and used_by is null and expires_at > now() for update;
  if not found then raise exception 'INVITE_INVALID'; end if;
  if exists (select 1 from party_members where player_id = auth.uid()) then
    raise exception 'ALREADY_IN_PARTY';
  end if;
  if exists (select 1 from players where id = auth.uid()
    and party_cooldown_until > now()) then raise exception 'COOLDOWN'; end if;
  select max_members into v_max from parties where id = v_inv.party_id;
  select count(*) into v_count from party_members where party_id = v_inv.party_id;
  if v_count >= v_max then raise exception 'PARTY_FULL'; end if;

  insert into party_members(party_id, player_id) values (v_inv.party_id, auth.uid());
  update party_invites set used_by = auth.uid() where code = p_code;

  return v_inv.party_id;
end $$;

create or replace function leave_party()
returns void language plpgsql security definer set search_path = public as $$
declare v_party_id uuid; v_owner_id uuid; v_compensation int;
begin
  select pm.party_id, p.owner_id into v_party_id, v_owner_id
    from party_members pm join parties p on p.id = pm.party_id
    where pm.player_id = auth.uid();
  if not found then raise exception 'NOT_IN_PARTY'; end if;
  if v_owner_id = auth.uid() then raise exception 'OWNER_CANNOT_LEAVE'; end if;

  -- Kompensasi: 50% nilai furnitur yang dia taruh di rumah bersama
  select coalesce(sum((c.data->>'sell_price')::int), 0) / 2 into v_compensation
    from house_items hi
    join houses h on h.id = hi.house_id and h.owner_party = v_party_id
    join catalog c on c.id = hi.item_id
    where hi.placed_by = auth.uid();

  delete from party_members where player_id = auth.uid();
  update players set
    party_cooldown_until = now() + interval '24 hours',
    coins = coins + v_compensation
    where id = auth.uid();
end $$;

create or replace function dissolve_party()
returns void language plpgsql security definer set search_path = public as $$
declare v_party_id uuid; v_member record; v_compensation int;
begin
  select pm.party_id into v_party_id from party_members pm
    join parties p on p.id = pm.party_id and p.owner_id = auth.uid()
    where pm.player_id = auth.uid();
  if not found then raise exception 'NOT_PARTY_OWNER'; end if;

  -- Kompensasi untuk anggota lain
  for v_member in
    select player_id from party_members
    where party_id = v_party_id and player_id <> auth.uid()
  loop
    select coalesce(sum((c.data->>'sell_price')::int), 0) / 2 into v_compensation
      from house_items hi
      join houses h on h.id = hi.house_id and h.owner_party = v_party_id
      join catalog c on c.id = hi.item_id
      where hi.placed_by = v_member.player_id;

    update players set
      party_cooldown_until = now() + interval '24 hours',
      coins = coins + v_compensation
      where id = v_member.player_id;
  end loop;

  -- Rumah bersama jadi annex milik owner
  update houses set kind = 'annex', owner_player = auth.uid(), owner_party = null
    where owner_party = v_party_id and kind = 'shared';

  -- Hapus anggota lain
  delete from party_members where party_id = v_party_id and player_id <> auth.uid();
  delete from party_members where party_id = v_party_id;
  delete from parties where id = v_party_id;
end $$;

-- ============================================================
-- DISCOVER HINT
-- ============================================================
create or replace function discover_hint(p_hint_id text, p_zone text, p_x int, p_y int)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_hint hint_texts;
  v_hour int;
  v_dist float;
begin
  select * into v_hint from hint_texts where hint_id = p_hint_id;
  if not found then raise exception 'HINT_NOT_FOUND'; end if;

  if v_hint.zone <> p_zone then raise exception 'WRONG_ZONE'; end if;

  v_dist := sqrt(power(p_x - v_hint.x, 2) + power(p_y - v_hint.y, 2));
  if v_dist > v_hint.radius then raise exception 'TOO_FAR'; end if;

  v_hour := extract(hour from (now() at time zone 'Asia/Jakarta'))::int;
  if v_hint.hour_from is not null and v_hour < v_hint.hour_from then
    raise exception 'WRONG_TIME';
  end if;
  if v_hint.hour_to is not null and v_hour > v_hint.hour_to then
    raise exception 'WRONG_TIME';
  end if;

  -- Catat penemuan
  insert into discoveries(player_id, hint_id) values (auth.uid(), p_hint_id)
    on conflict do nothing;

  return v_hint.body;
end $$;
