// ============================================================
// Seed Script: masukkan data dari src/data/*.ts ke tabel catalog
// Jalankan: npx tsx scripts/seed-catalog.ts
// ============================================================

import { FISH } from '../src/data/fish';
import { CROPS } from '../src/data/crops';
import { ITEMS } from '../src/data/items';
import { RECIPES } from '../src/data/recipes';
import { NPCS } from '../src/data/npcs';
import { QUESTS } from '../src/data/quests';

// Gunakan service role key untuk seed (bukan anon key)
// Set SUPABASE_SERVICE_ROLE_KEY di environment sebelum menjalankan script ini
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Set NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

interface CatalogRow {
  kind: string;
  id: string;
  data: Record<string, unknown>;
}

const rows: CatalogRow[] = [];

// Fish
for (const f of FISH) {
  rows.push({
    kind: 'fish',
    id: f.id,
    data: {
      name: f.name,
      rarity: f.rarity,
      sell_price: f.sell_price,
      spot: f.spot,
      weight: f.weight,
      hour_from: f.hour_from ?? null,
      hour_to: f.hour_to ?? null,
    },
  });
}

// Crops
for (const c of CROPS) {
  rows.push({
    kind: 'crop',
    id: c.id,
    data: {
      name: c.name,
      grow_hours: c.grow_hours,
      stages: c.stages,
      sell_price: c.sell_price,
      yield: c.yield,
    },
  });
}

// Items
for (const item of ITEMS) {
  rows.push({
    kind: item.kind,
    id: item.id,
    data: {
      name: item.name,
      buy_price: item.buy_price ?? null,
      sell_price: item.sell_price,
      buyable: item.buyable,
      description: item.description ?? null,
    },
  });
}

// Recipes
for (const r of RECIPES) {
  rows.push({
    kind: 'recipe',
    id: r.id,
    data: {
      name: r.name,
      ingredients: r.ingredients,
      sell_price: r.sell_price,
      buff: r.buff ?? null,
    },
  });
}

// NPCs
for (const npc of NPCS) {
  rows.push({
    kind: 'npc',
    id: npc.id,
    data: {
      name: npc.name,
      zone: npc.zone,
      x: npc.x,
      y: npc.y,
      dialog: npc.dialog,
      questId: npc.questId ?? null,
      isShop: npc.isShop ?? false,
    },
  });
}

// Quests
for (const q of QUESTS) {
  rows.push({
    kind: 'quest',
    id: q.id,
    data: {
      name: q.name,
      giver: q.giver,
      description: q.description,
      steps: q.steps,
      reward: q.reward,
      prerequisite: q.prerequisite ?? null,
    },
  });
}

async function seed() {
  console.log(`📦 Seeding ${rows.length} catalog entries...`);

  // Upsert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    const res = await fetch(`${SUPABASE_URL}/rest/v1/catalog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY!,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(batch),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`❌ Batch ${i / batchSize + 1} gagal:`, err);
      process.exit(1);
    }

    console.log(`  ✅ Batch ${i / batchSize + 1}: ${batch.length} rows`);
  }

  console.log('✅ Seed selesai!');
}

seed().catch(console.error);
