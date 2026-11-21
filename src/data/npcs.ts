// ============================================================
// Data: NPCs
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
    x: 15 * 16,
    y: 6 * 16,
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
    x: 10 * 16,
    y: 4 * 16,
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
    x: 10 * 16,
    y: 4 * 16,
    dialog: [
      { text: 'Stasiun Purwokerto! Mau ke mana? Dari sini bisa ke Baturraden.' },
      { text: 'Hati-hati di hutan pinus. Kabutnya tebal kalau pagi-pagi.' },
    ],
  },
  {
    id: 'npc_kakek_hutan',
    name: 'Mbah Gito',
    zone: 'baturraden',
    x: 8 * 16,
    y: 4 * 16,
    dialog: [
      { text: 'Ah, jarang ada anak muda datang ke sini...' },
      { text: 'Telaga Sunyi di timur. Konon ikan langka ada di sana, tapi hanya muncul malam hari.' },
      { text: 'Perhatikan benda-benda kecil di sekitar hutan. Siapa tahu ada yang menarik.' },
    ],
    questId: 'quest_telaga',
  },
];
