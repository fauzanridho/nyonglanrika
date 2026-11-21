// ============================================================
// Data: Fish catalog
// ============================================================

export interface FishDef {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  sell_price: number;
  /** Spot di mana ikan ini bisa ditangkap */
  spot: string;
  /** Bobot probabilitas (semakin tinggi semakin sering) */
  weight: number;
  /** Jam aktif (WIB), null = kapan saja */
  hour_from?: number;
  hour_to?: number;
}

export const FISH: FishDef[] = [
  // === Sungai Serayu ===
  { id: 'ikan_nila', name: 'Ikan Nila', rarity: 'common', sell_price: 15, spot: 'serayu_1', weight: 40 },
  { id: 'ikan_lele', name: 'Ikan Lele', rarity: 'common', sell_price: 12, spot: 'serayu_1', weight: 35 },
  { id: 'ikan_mas', name: 'Ikan Mas', rarity: 'uncommon', sell_price: 25, spot: 'serayu_1', weight: 15 },
  { id: 'ikan_patin', name: 'Ikan Patin', rarity: 'uncommon', sell_price: 30, spot: 'serayu_2', weight: 20 },
  { id: 'ikan_gurame', name: 'Ikan Gurame', rarity: 'rare', sell_price: 50, spot: 'serayu_2', weight: 8 },
  { id: 'ikan_bawal', name: 'Ikan Bawal', rarity: 'uncommon', sell_price: 28, spot: 'serayu_2', weight: 18 },
  { id: 'ikan_gabus', name: 'Ikan Gabus', rarity: 'rare', sell_price: 45, spot: 'serayu_1', weight: 6, hour_from: 18, hour_to: 23 },
  { id: 'ikan_sidat', name: 'Belut Sungai', rarity: 'rare', sell_price: 60, spot: 'serayu_2', weight: 5, hour_from: 20, hour_to: 4 },

  // === Telaga Sunyi (Baturraden) ===
  { id: 'ikan_wader', name: 'Ikan Wader', rarity: 'common', sell_price: 10, spot: 'telaga_sunyi', weight: 30 },
  { id: 'ikan_uceng', name: 'Ikan Uceng', rarity: 'uncommon', sell_price: 35, spot: 'telaga_sunyi', weight: 12 },
  { id: 'ikan_brek', name: 'Ikan Brek', rarity: 'rare', sell_price: 70, spot: 'telaga_sunyi', weight: 5, hour_from: 5, hour_to: 7 },
  { id: 'ikan_dewa', name: 'Ikan Dewa Telaga', rarity: 'legendary', sell_price: 200, spot: 'telaga_sunyi', weight: 1, hour_from: 0, hour_to: 3 },
];
