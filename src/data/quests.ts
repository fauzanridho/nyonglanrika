// ============================================================
// Data: Quests
// ============================================================

export type QuestStepType = 'collect' | 'deliver' | 'visit' | 'cook' | 'catch' | 'discover';

export interface QuestStep {
  type: QuestStepType;
  target: string;
  qty?: number;
  description: string;
}

export interface QuestDef {
  id: string;
  name: string;
  /** NPC yang memberikan quest */
  giver: string;
  description: string;
  steps: QuestStep[];
  /** Hadiah */
  reward: {
    coins?: number;
    items?: { id: string; qty: number }[];
  };
  /** Quest yang harus selesai dulu sebelum ini tersedia */
  prerequisite?: string;
}

export const QUESTS: QuestDef[] = [
  {
    id: 'quest_welcome',
    name: 'Selamat Datang!',
    giver: 'npc_pak_camat',
    description: 'Pak Camat memintamu mengenal kota. Kunjungi Pasar Wage dan Sungai Serayu.',
    steps: [
      { type: 'visit', target: 'pasar_wage', description: 'Kunjungi Pasar Wage' },
      { type: 'visit', target: 'sungai_serayu', description: 'Kunjungi tepi Sungai Serayu' },
    ],
    reward: { coins: 50 },
  },
  {
    id: 'quest_first_fish',
    name: 'Ikan Pertama',
    giver: 'npc_pak_camat',
    description: 'Tangkap ikan pertamamu di Sungai Serayu.',
    steps: [
      { type: 'catch', target: 'any_fish', qty: 1, description: 'Tangkap 1 ikan' },
      { type: 'deliver', target: 'npc_pak_camat', description: 'Laporkan ke Pak Camat' },
    ],
    reward: { coins: 30, items: [{ id: 'umpan_cacing', qty: 5 }] },
    prerequisite: 'quest_welcome',
  },
  {
    id: 'quest_first_harvest',
    name: 'Panen Pertama',
    giver: 'npc_pedagang',
    description: 'Bu Warni memintamu menanam dan memanen bayam.',
    steps: [
      { type: 'collect', target: 'bayam', qty: 2, description: 'Panen 2 bayam' },
      { type: 'deliver', target: 'npc_pedagang', description: 'Bawa ke Bu Warni' },
    ],
    reward: { coins: 40, items: [{ id: 'cabai_seed', qty: 3 }] },
    prerequisite: 'quest_welcome',
  },
  {
    id: 'quest_cook_mendoan',
    name: 'Mendoan Spesial',
    giver: 'npc_pedagang',
    description: 'Bu Warni ingin kamu belajar memasak mendoan.',
    steps: [
      { type: 'cook', target: 'mendoan', description: 'Masak mendoan' },
      { type: 'deliver', target: 'npc_pedagang', description: 'Tunjukkan ke Bu Warni' },
    ],
    reward: { coins: 60, items: [{ id: 'kompor_tanah', qty: 1 }] },
    prerequisite: 'quest_first_harvest',
  },
  {
    id: 'quest_telaga',
    name: 'Rahasia Telaga Sunyi',
    giver: 'npc_kakek_hutan',
    description: 'Mbah Gito memintamu menangkap ikan langka di Telaga Sunyi.',
    steps: [
      { type: 'catch', target: 'ikan_dewa', qty: 1, description: 'Tangkap Ikan Dewa Telaga' },
      { type: 'deliver', target: 'npc_kakek_hutan', description: 'Tunjukkan ke Mbah Gito' },
    ],
    reward: { coins: 500 },
    prerequisite: 'quest_first_fish',
  },
  {
    id: 'quest_kenangan',
    name: 'Kenangan',
    giver: 'npc_kakek_hutan',
    description: 'Temukan petunjuk-petunjuk tersembunyi di seluruh kota...',
    steps: [
      { type: 'discover', target: 'hints', qty: 5, description: 'Temukan 5 petunjuk tersembunyi' },
      { type: 'visit', target: 'baturraden_secret', description: 'Kunjungi lokasi rahasia' },
    ],
    reward: { coins: 1000 },
    prerequisite: 'quest_telaga',
  },
];
