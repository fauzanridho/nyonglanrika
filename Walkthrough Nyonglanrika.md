
# Walkthrough: Nyonglanrika

*Next.js + Kaplay.js + Supabase + Vercel · Versi 1.0 · 17 November 2026*

## 0. Keputusan Final

- **Stack**: Next.js (App Router, TypeScript), Kaplay.js, Supabase (Auth, Postgres, Realtime), Vercel Hobby.
- **Login**: tamu dulu (anonymous sign-in), bisa ditautkan ke Google atau email kapan saja agar karakter tidak hilang.
- **Multiplayer**: asinkron. Realtime hanya dipakai di rumah bersama.
- **Party**: maksimal 2 pemain (kolom `max_members`, bisa dinaikkan sampai 4). Satu pemain hanya boleh di satu party, dijaga langsung oleh database.
- **Rumah**: 1 rumah pribadi per pemain + 1 rumah bersama per party.
- **Party bubar atau anggota keluar**: rumah bersama tetap milik pembuat party, yang keluar mendapat kompensasi koin. Pembuat tidak bisa 'keluar', hanya membubarkan party; rumah bersama lalu menjadi rumah tambahan miliknya.
- **Asset**: semua pixel art dan suara dibuat lewat kode, tanpa unduhan.
- **Hint kenangan**: teks pribadi disimpan di database (tertutup), bukan di kode atau repo.
- Cek dokumentasi Kaplay, Supabase, dan batas paket gratis versi terbaru sebelum menulis kode, karena API dan kuota bisa berubah.

## 1. Prinsip Anti-Revisi Besar

Analogi: membangun rumah. Pondasi dan jalur pipa dipasang lengkap di awal, sedangkan tembok dan cat boleh diganti kapan saja.

1. **Skema database dirancang lengkap sekali di Phase 0.** Semua fitur sudah punya tempat sejak awal.
2. **Konten adalah data, bukan logika.** Ikan, tanaman, resep, NPC, quest, dan peta ditulis di `src/data/`. Menambah konten berarti menambah baris.
3. **Tiga lapisan terpisah**: Kaplay (gambar dan input), Store (state di memori), Sync (bicara ke Supabase). Kaplay tidak pernah memanggil Supabase langsung.
4. **Aksi yang menyangkut uang, item, dan waktu selalu lewat RPC server.** Klien tidak pernah menulis langsung ke tabel.
5. **Satu sumber kebenaran katalog**: `src/data/*.ts` di-seed ke tabel `catalog` lewat script, sehingga klien dan server memakai data yang sama.
6. **Setiap save punya `schema_version`** agar migrasi di masa depan mudah.
7. **Ukuran tile konstan**: 16x16 piksel, tampil 3x.
8. **Satu fitur selesai dan teruji dulu sebelum lanjut.**

## 2. Struktur Folder

```
src/
  app/
    page.tsx                 menu utama
    play/page.tsx            halaman game
    join/[code]/page.tsx     terima undangan party
    api/health/route.ts      ping keep-alive
  game/
    engine/   init Kaplay, scenes, camera
    art/      palette.ts, generator.ts, sprites/*.ts
    audio/    sfx.ts
    systems/  fishing, farming, building, daynight, weather, quests
    ui/       HUD, inventory, dialog (React)
  data/       zones, items, fish, crops, recipes, npcs, quests
  store/      gameStore.ts (zustand)
  lib/        supabase/client.ts, supabase/server.ts, rpc.ts
supabase/
  migrations/ 0001_init.sql, 0002_rls.sql, 0003_rpc.sql
  private_seed.sql   (teks hint pribadi, MASUK .gitignore)
```

## Phase 0: Fondasi dan Database

**Tujuan**: pondasi proyek dan database lengkap, belum ada gameplay.

**Langkah**

1. `npx create-next-app@latest nyonglanrika` (TypeScript, App Router, Tailwind). Lalu `npm i kaplay @supabase/supabase-js @supabase/ssr zustand`.
2. Buat project Supabase. Di menu Authentication aktifkan **Anonymous sign-ins**.
3. Isi `.env.local` dengan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Kunci anon aman di klien karena dilindungi RLS. **Service role key tidak boleh masuk kode klien.**
4. Jalankan SQL skema di bawah (simpan sebagai `0001_init.sql`).
5. Jalankan SQL RLS dan RPC (`0002`, `0003`).
6. Buat script seed yang memasukkan `src/data/*.ts` ke tabel `catalog`.

**Skema (0001\_init.sql)**

```sql
create extension if not exists pgcrypto;

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
create table catalog (
  kind text, id text, data jsonb not null,
  primary key (kind, id)
);
create table inventory (
  player_id uuid references players(id) on delete cascade,
  item_id text not null,
  qty int not null check (qty >= 0),
  primary key (player_id, item_id)
);
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
create table house_items (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  item_id text not null,
  x int not null, y int not null, rot int not null default 0,
  placed_by uuid references players(id),
  unique (house_id, x, y)
);
create table plots (
  house_id uuid not null references houses(id) on delete cascade,
  slot int not null,
  crop_id text, planted_at timestamptz, last_watered date,
  primary key (house_id, slot)
);
create table collection (
  player_id uuid references players(id) on delete cascade,
  kind text not null, entry_id text not null,
  count int not null default 1,
  first_at timestamptz not null default now(),
  primary key (player_id, kind, entry_id)
);
create table quest_progress (
  player_id uuid references players(id) on delete cascade,
  quest_id text not null,
  state jsonb not null default '{}', done boolean not null default false,
  primary key (player_id, quest_id)
);
create table hint_texts (
  hint_id text primary key, zone text not null,
  x int not null, y int not null, radius int not null default 24,
  hour_from int, hour_to int, body text not null
);
create table discoveries (
  player_id uuid references players(id) on delete cascade,
  hint_id text references hint_texts(hint_id),
  found_at timestamptz not null default now(),
  primary key (player_id, hint_id)
);
```

**RLS (0002\_rls.sql)**: aktifkan RLS di SEMUA tabel, lalu hanya buat policy SELECT. Tidak ada policy INSERT, UPDATE, atau DELETE, jadi klien tidak bisa menulis apa pun secara langsung.

```sql
-- alter table <nama> enable row level security;  (ulangi untuk semua tabel)
create function my_party_id() returns uuid
  language sql security definer stable set search_path = public
  as $$ select party_id from party_members where player_id = auth.uid() $$;

create function can_see_house(h uuid) returns boolean
  language sql security definer stable set search_path = public
  as $$ select exists (select 1 from houses where id = h
    and (owner_player = auth.uid() or owner_party = my_party_id())) $$;

create policy p_players on players for select
  using (id = auth.uid() or id in
    (select player_id from party_members where party_id = my_party_id()));
create policy p_inventory on inventory for select using (player_id = auth.uid());
create policy p_party on parties for select using (id = my_party_id());
create policy p_members on party_members for select using (party_id = my_party_id());
create policy p_houses on houses for select using (can_see_house(id));
create policy p_items on house_items for select using (can_see_house(house_id));
create policy p_plots on plots for select using (can_see_house(house_id));
create policy p_collection on collection for select using (player_id = auth.uid());
create policy p_quest on quest_progress for select using (player_id = auth.uid());
create policy p_disc on discoveries for select using (player_id = auth.uid());
create policy p_catalog on catalog for select using (true);
-- hint_texts dan party_invites: RLS aktif TANPA policy = tertutup untuk klien

alter publication supabase_realtime add table house_items, plots;
```

**Daftar RPC (0003\_rpc.sql)**: semuanya `security definer`, selalu memakai `auth.uid()`, tidak pernah menerima user id dari klien.

| RPC | Fungsi | Validasi utama |
| --- | --- | --- |
| `create_character(name, look)` | buat player dan rumah pribadi | nama unik wajar, bukan kata terlarang, belum punya karakter |
| `save_state(zone, x, y)` | simpan posisi | zona valid, batas rate |
| `get_weather()` | cuaca per jam (sumber tunggal) | deterministik berdasar tanggal dan jam WIB |
| `sell_item(item, qty)` | jual ke pasar | stok cukup, harga dari katalog |
| `buy_item(item, qty)` | beli | koin cukup |
| `start_cast(spot)` dan `catch_fish(spot)` | memancing | jeda minimal sejak lempar, hasil diundi di server |
| `plant_crop`, `water_plot`, `harvest_plot` | berkebun | akses rumah, jam server |
| `cook(recipe)` | masak | bahan cukup |
| `place_furniture`, `remove_furniture` | dekor | anggota rumah, item ada, tile kosong, dalam batas tier |
| `create_party`, `create_invite`, `join_party`, `leave_party`, `dissolve_party` | sistem party | lihat contoh di bawah |
| `discover_hint(hint_id, zone, x, y)` | buka petunjuk | jarak, jam, mengembalikan teks |

**Contoh RPC `join_party`** (inti aturan tidak boleh dual party):

```sql
create or replace function join_party(p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_inv party_invites; v_count int; v_max int;
begin
  select * into v_inv from party_invites
    where code = p_code and used_by is null and expires_at > now() for update;
  if not found then raise exception 'INVITE_INVALID'; end if;
  if exists (select 1 from party_members where player_id = auth.uid()) then
    raise exception 'ALREADY_IN_PARTY'; end if;
  if exists (select 1 from players where id = auth.uid()
    and party_cooldown_until > now()) then raise exception 'COOLDOWN'; end if;
  select max_members into v_max from parties where id = v_inv.party_id;
  select count(*) into v_count from party_members where party_id = v_inv.party_id;
  if v_count >= v_max then raise exception 'PARTY_FULL'; end if;
  insert into party_members(party_id, player_id) values (v_inv.party_id, auth.uid());
  update party_invites set used_by = auth.uid() where code = p_code;
  return v_inv.party_id;
end $$;
```

Kode undangan dibuat di `create_invite` dari 6 karakter acak tanpa huruf yang mirip (tanpa O, 0, I, 1), kedaluwarsa 24 jam, sekali pakai.

**Selesai jika**

- Login tamu berhasil dan baris `auth.users` muncul.
- Dari dua akun uji, `create_party` lalu `join_party` berhasil, dan akun yang sama gagal masuk party kedua.
- Percobaan `update players set coins = 9999` dari klien ditolak.
- `catalog` terisi dari script seed.

## Phase 1: Karakter dan Alun-alun

**Tujuan**: karakter bisa dibuat, disimpan, dan berjalan di Alun-alun.

**Langkah**

1. **Mount Kaplay di Next** sebagai komponen klien dengan cleanup (penting karena React Strict Mode memasang dua kali):

```tsx
'use client';
import { useEffect, useRef } from 'react';

export default function GameCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let k: any;
    (async () => {
      const { default: kaplay } = await import('kaplay');
      k = kaplay({ canvas: ref.current!, width: 480, height: 270,
        scale: 3, crisp: true, global: false, background: [20, 24, 40] });
      // daftarkan sprite, scene, lalu k.go('world')
    })();
    return () => { k?.quit(); };
  }, []);
  return <canvas ref={ref} />;
}
```

2. **Generator sprite dari teks** (inti 'tanpa asset'). Tiap huruf mewakili satu warna di palet:

```ts
export function makeSprite(k: any, name: string, rows: string[],
    palette: Record<string, string>) {
  const c = document.createElement('canvas');
  c.width = rows[0].length; c.height = rows.length;
  const g = c.getContext('2d')!;
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== '.') { g.fillStyle = palette[ch]; g.fillRect(x, y, 1, 1); }
  }));
  k.loadSprite(name, c.toDataURL());
}
```

Untuk animasi jalan, gambar beberapa frame berdampingan dalam satu canvas lalu `loadSprite` dengan `sliceX` dan `anims`.

3. **Karakter kustom lewat palet**: rambut, kulit, dan baju memakai huruf palet berbeda, jadi mengganti warna tidak butuh gambar baru. Pilihan tampilan disimpan di `players.look` (JSON).
4. **Peta dari grid teks** dengan `addLevel` (ukuran tile 16):

```ts
k.addLevel([
  'TTTTTTTTTT',
  'T........T',
  'T..b.....T',
  'T........T',
  'TTTT..TTTT',
], { tileWidth: 16, tileHeight: 16, tiles: {
  T: () => [k.sprite('tree'), k.area(), k.body({ isStatic: true })],
  b: () => [k.sprite('bench'), k.area(), k.body({ isStatic: true })],
}});
```

5. **Gerak 4 arah**, tabrakan, kamera mengikuti pemain, animasi jalan.
6. **Layar buat karakter** (React): nama (3 sampai 16 karakter), pratinjau, tombol mulai, memanggil `create_character`.
7. **Autosave**: `save_state` setiap 15 detik saat bergerak dan saat pindah zona atau menutup tab.
8. **Muat ulang**: saat membuka game, ambil `players` dan lanjut dari posisi terakhir.

**Selesai jika**: refresh browser tidak mereset karakter, nama dan penampilan tetap, posisi terakhir dipulihkan.

## Phase 2: Dunia, Waktu, dan Cuaca

**Tujuan**: kota terasa hidup dan nyata.

**Langkah**

1. **Registry zona** di `src/data/zones/`: tiap zona punya grid teks, spawn point, dan daftar portal (tujuan zona dan koordinat). Pindah zona = `k.go('zone', { id, spawn })`.
2. **Zona awal**: Alun-alun, Pasar Wage, tepi Sungai Serayu, stasiun (fast travel antarzona yang sudah dibuka).
3. **Siklus siang-malam mengikuti jam WIB asli** (`Intl` dengan zona `Asia/Jakarta`). Lapisan warna berubah: pagi hangat, siang terang, senja oranye, malam biru gelap. Lampu jalan menyala saat gelap.
4. **Cuaca dari server**: klien memanggil `get_weather()` sekali per jam. Fungsi ini deterministik (hash tanggal dan jam) sehingga semua pemain melihat cuaca sama. Peluang hujan dibuat lebih besar karena Purwokerto kota hujan. Efek: partikel hujan, suara hujan (Web Audio), kabut pagi di dataran tinggi.
5. **Suara**: modul `sfx.ts` dengan bunyi langkah, klik, dan koin dari osilator Web Audio. Musik latar loop sederhana, ada tombol bisukan.
6. **NPC dan dialog**: NPC didefinisikan di `data/npcs.ts` (posisi, sprite, baris dialog). Satu komponen dialog dipakai semua NPC.

**Selesai jika**: bisa berjalan antara tiga zona, malam dan hujan terlihat, dua pemain di jam yang sama melihat cuaca yang sama.

## Phase 3: Loop Inti (Memancing, Ekonomi, Inventaris)

**Tujuan**: kegiatan inti yang membuat orang betah.

**Langkah**

1. **Inventaris**: tabel `inventory`, panel React dengan grid item, dibuka dengan satu tombol.
2. **Memancing**, mesin status: `idle`, lempar, menunggu (2 sampai 6 detik acak), ikan menggigit (jendela 0,8 detik), tarik (minigame timing), hasil.
3. **Anti-curang memancing**: saat lempar klien memanggil `start_cast(spot)`. Saat berhasil, `catch_fish(spot)` dipanggil. Server memeriksa jeda minimal sejak lempar dan mengundi spesies berdasarkan bobot katalog, jam, dan cuaca. Klien tidak menentukan ikan apa yang didapat.
4. **Katalog ikan** di `data/fish.ts`: nama, kelangkaan, harga, spot, jam aktif.
5. **Ekonomi**: jual di Pasar Wage (`sell_item`), beli bekal (`buy_item`). Harga dibaca dari katalog di server.
6. **Koleksi**: tiap spesies baru masuk tabel `collection`, ditampilkan sebagai album dengan siluet untuk yang belum didapat.

**Selesai jika**: bisa memancing, menjual, uang bertambah, album terisi, dan memanggil RPC langsung dengan data palsu ditolak.

## Phase 4: Berkebun dan Masak

**Tujuan**: loop kedua yang saling melengkapi dengan memancing.

**Langkah**

1. **Lahan** ada di tabel `plots` (per rumah, per slot). Tahap tumbuh dihitung dari `now() - planted_at` dibagi durasi tanaman di katalog, jadi tidak perlu timer di klien dan tetap jalan saat pemain offline.
2. **Menyiram**: satu siraman per hari (tanggal WIB) menyimpan `last_watered`. Hari hujan dianggap otomatis tersiram. Tanaman yang tidak disiram tumbuh lebih lambat, tidak pernah mati, supaya ramah pemain santai.
3. **Tanaman lokal**: stroberi, kopi, sayur dataran tinggi, singkong, kelapa. Tiap tanaman punya jumlah tahap, durasi, harga jual, dan tinggi benih di katalog.
4. **Rumah bersama**: kebun di rumah party bisa disiram dan dipanen kedua anggota (aturan akses lewat `can_see_house`).
5. **Masak**: resep di `data/recipes.ts` (mendoan, soto, getuk goreng, dan seterusnya). `cook(recipe)` mengurangi bahan dan menambah makanan. Makan memberi buff kecil (misalnya jendela gigitan ikan lebih lebar).

**Selesai jika**: tanam, tutup tab, buka lagi besok, tanaman sudah tumbuh sesuai waktu server.

## Phase 5: Party dan Rumah

**Tujuan**: fitur pembeda game ini.

**Langkah**

1. **Alur party (UI)**: buat party, buat undangan (kode dan link `/join/KODE`), halaman join. Jika belum login, halaman join membuat akun tamu dulu lalu memanggil `join_party`. Pesan error dipetakan ke teks ramah (INVITE\_INVALID, ALREADY\_IN\_PARTY, PARTY\_FULL, COOLDOWN).
2. **Keluar dan bubar**: anggota biasa memanggil `leave_party` (cooldown 24 jam, kompensasi koin sebesar 50% nilai furnitur yang ia taruh, rumah tetap milik pembuat). Pembuat memanggil `dissolve_party` (rumah bersama berubah jadi `annex` miliknya, anggota lain mendapat kompensasi).
3. **Editor rumah**: grid 12x8 untuk tier 1. Mode dekor: pilih furnitur dari inventaris, pratinjau hijau atau merah, klik untuk menaruh. Tier 2 dan 3 memperluas grid dan membuka lahan kebun.
4. **Validasi di server** (`place_furniture`): pemain anggota rumah, item ada di inventaris, tile kosong (dijaga `unique (house_id, x, y)`), dalam batas tier.
5. **Realtime**: di dalam rumah bersama, klien berlangganan perubahan `house_items` dan `plots` untuk `house_id` tersebut. Saat dua orang mengedit bersamaan, yang terakhir menang dan tile bentrok menolak yang kedua (klien menampilkan pesan lalu menyegarkan).
6. **Keadaan offline**: perubahan pasangan yang terjadi saat kamu offline muncul sebagai ringkasan 'Sejak kamu pergi...'.

**Selesai jika**: dua akun beda browser bisa join party dengan kode, melihat furnitur dan kebun yang sama secara langsung, dan akun ketiga gagal join party penuh.

## Phase 6: Baturraden, Quest, dan Kenangan Tersembunyi

**Tujuan**: konten jangka panjang dan sentuhan pribadi.

**Langkah**

1. **Zona Baturraden**: hutan pinus, Pancuran Pitu, Telaga Sunyi (spot pancing langka), Curug Cipendok, kabut pagi, kebun dataran tinggi.
2. **Mesin quest berbasis data**: `data/quests.ts` berisi pemberi, syarat, langkah (`collect`, `deliver`, `visit`, `cook`), dan hadiah. Progres di `quest_progress`.
3. **Hint kenangan, aman dan privat**:
   - Objek di peta (bangku, lentera, botol surat) memakai sprite netral di `data/zones`, jadi terlihat biasa bagi pemain lain.
   - **Teks pribadi hanya ada di tabel `hint_texts`** dan diisi lewat `supabase/private_seed.sql` yang masuk `.gitignore`. Tabel ini tertutup RLS.
   - Klien memanggil `discover_hint(hint_id, zone, x, y)`. Server memeriksa jarak, rentang jam (misalnya lentera hanya malam), lalu mengembalikan teks dan mencatat di `discoveries`.
4. **Misi akhir 'Kenangan'**: terbuka setelah sejumlah hint ditemukan (misalnya 5 dari 7), mengarah ke satu lokasi rahasia di Baturraden dengan adegan penutup dan teks akhir dari database.
5. **Pemain lain** tetap menikmatinya sebagai quest misteri biasa tanpa tahu maknanya.

**Selesai jika**: hint tidak bisa dibuka dari jauh, teks tidak ada di bundle JavaScript maupun repo, dan misi akhir terbuka sesuai syarat.

## Phase 7: Polish, Deploy, dan Jangka Panjang

**Langkah**

1. **Deploy Vercel**: impor repo GitHub, isi environment variables, lalu di Supabase atur **Site URL dan Redirect URLs** (domain Vercel dan localhost).
2. **Keep-alive**: paket gratis Supabase dapat menjeda proyek yang lama tidak aktif. Buat `api/health` yang melakukan query ringan dan jadwalkan lewat Vercel Cron (harian).
3. **Kontrol mobile**: joystick virtual dan tombol aksi di layar sentuh, plus orientasi lanskap.
4. **PWA**: manifest dan ikon agar bisa dipasang di layar utama.
5. **Performa**: sprite digabung dalam satu atlas, hapus objek di luar layar, target 60 FPS di HP menengah.
6. **Moderasi nama**: daftar kata terlarang dicek di `create_character`.
7. **Batas penyalahgunaan**: jeda minimal per RPC (misalnya `save_state`, `catch_fish`) dan batas pembuatan undangan.
8. **Event musiman** dari data (rentang tanggal): 17 Agustusan, musim hujan, dan sebagainya.
9. **Migrasi dan cadangan**: pakai `schema_version`; ekspor database manual berkala karena paket gratis tidak punya pemulihan titik waktu.
10. **Cek batas gratis** (ukuran database, koneksi Realtime, aturan non-komersial Vercel Hobby) sebelum membuka ke publik.

## 3. Peta Risiko

| Risiko | Pencegahan |
| --- | --- |
| Karakter hilang karena akun tamu | Tombol 'Amankan akunmu' sejak Phase 1 |
| Curang lewat console | RLS hanya SELECT, semua tulis lewat RPC |
| Dual party | `unique (player_id)` di `party_members` |
| Rumah hilang saat party bubar | Aturan annex dan kompensasi |
| Teks pribadi bocor | Disimpan di tabel tertutup, bukan di repo |
| Proyek Supabase dijeda | Cron keep-alive |
| Revisi besar akibat salah skema | Skema lengkap di Phase 0, konten berbasis data |

## 4. Template Prompt untuk Tiap Sesi Vibe Coding

Salin ini di awal setiap sesi:

> Proyek: Nyonglanrika (Next.js App Router + TypeScript, Kaplay.js, Supabase, Vercel). Ikuti dokumen Walkthrough: struktur folder, prinsip anti-revisi, skema dan RPC yang sudah ditetapkan. Sekarang kita di **Phase X**, langkah nomor **N**. Tugas: ... Keluarkan file lengkap satu per satu (tidak dipotong), sebutkan path-nya, jangan ubah skema database tanpa membahasnya dulu. Setelah selesai, berikan daftar tes manual untuk bagian 'Selesai jika'.

Aturan kerja: satu langkah per sesi, tes dulu, baru lanjut. Jangan menggabungkan dua phase dalam satu sesi.
