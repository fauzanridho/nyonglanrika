// ============================================================
// Data: NPCs (Koordinat disesuaikan dengan peta 48x28)
// ============================================================

export interface DialogLine {
  text: string;
  /** Kondisi opsional: quest tertentu selesai, item dimiliki, dll */
  condition?: string;
}

export interface NpcDef {
  id: string;
  name: string;
  zone: string;
  x: number;
  y: number;
  dialog: DialogLine[];
  /** Quest yang diberikan NPC ini */
  questId?: string;
  /** Apakah NPC ini adalah pedagang */
  isShop?: boolean;
}

export const NPCS: NpcDef[] = [
  {
    id: 'npc_pak_camat',
    name: 'Pak Camat',
    zone: 'alun_alun',
    x: 24 * 16,
    y: 12 * 16,
    dialog: [
      { text: 'Selamat datang di Purwokerto, nak! Kota kecil tapi hangat.' },
      { text: 'Kalau mau cari uang, coba mancing di Sungai Serayu atau berkebun di rumahmu.' },
      { text: 'Pasar Wage ada di selatan. Di sana kamu bisa jual hasil tangkapan.' },
    ],
    questId: 'quest_welcome',
  },
  {
    id: 'npc_pedagang',
    name: 'Bu Warni',
    zone: 'pasar_wage',
    x: 24 * 16,
    y: 8 * 16,
    dialog: [
      { text: 'Mau beli apa, nak? Bibit, umpan, atau perabotan rumah ada semua!' },
      { text: 'Kalau punya ikan atau sayuran, bawa ke sini. Saya beli.' },
    ],
    isShop: true,
  },
  {
    id: 'npc_masinis',
    name: 'Pak Darto',
    zone: 'stasiun',
    x: 20 * 16,
    y: 5 * 16,
    dialog: [
      { text: 'Stasiun Purwokerto! Mau ke mana? Dari Sungai Serayu bisa ke Baturraden.' },
      { text: 'Hati-hati di hutan pinus. Kabutnya tebal kalau pagi-pagi.' },
    ],
  },
  {
    id: 'npc_kakek_hutan',
    name: 'Mbah Gito',
    zone: 'baturraden',
    x: 16 * 16,
    y: 8 * 16,
    dialog: [
      { text: 'Ah, jarang ada anak muda datang ke sini...' },
      { text: 'Telaga Sunyi di selatan hutan. Konon ikan langka ada di sana, tapi hanya muncul malam hari.' },
      { text: 'Perhatikan benda-benda kecil di sekitar hutan. Siapa tahu ada yang menarik.' },
    ],
    questId: 'quest_telaga',
  },
];
