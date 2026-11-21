// ============================================================
// Data: Items catalog (buyable items, seeds, furniture)
// ============================================================

export interface ItemDef {
  id: string;
  name: string;
  kind: 'seed' | 'bait' | 'furniture' | 'tool' | 'food' | 'material';
  buy_price?: number;
  sell_price: number;
  buyable: boolean;
  description?: string;
}

export const ITEMS: ItemDef[] = [
  // ---- Bibit (beli di Pasar Wage) ----
  { id: 'singkong_seed', name: 'Bibit Singkong', kind: 'seed', buy_price: 5, sell_price: 2, buyable: true },
  { id: 'bayam_seed', name: 'Bibit Bayam', kind: 'seed', buy_price: 4, sell_price: 1, buyable: true },
  { id: 'cabai_seed', name: 'Bibit Cabai', kind: 'seed', buy_price: 8, sell_price: 3, buyable: true },
  { id: 'tomat_seed', name: 'Bibit Tomat', kind: 'seed', buy_price: 6, sell_price: 2, buyable: true },
  { id: 'stroberi_seed', name: 'Bibit Stroberi', kind: 'seed', buy_price: 20, sell_price: 8, buyable: true },
  { id: 'kopi_seed', name: 'Bibit Kopi', kind: 'seed', buy_price: 30, sell_price: 12, buyable: true },
  { id: 'kelapa_seed', name: 'Bibit Kelapa', kind: 'seed', buy_price: 25, sell_price: 10, buyable: true },
  { id: 'kacang_panjang_seed', name: 'Bibit Kacang Panjang', kind: 'seed', buy_price: 4, sell_price: 1, buyable: true },

  // ---- Umpan ----
  { id: 'umpan_cacing', name: 'Umpan Cacing', kind: 'bait', buy_price: 3, sell_price: 1, buyable: true },
  { id: 'umpan_roti', name: 'Umpan Roti', kind: 'bait', buy_price: 5, sell_price: 2, buyable: true },

  // ---- Furnitur ----
  { id: 'kursi_kayu', name: 'Kursi Kayu', kind: 'furniture', buy_price: 20, sell_price: 8, buyable: true },
  { id: 'meja_kayu', name: 'Meja Kayu', kind: 'furniture', buy_price: 25, sell_price: 10, buyable: true },
  { id: 'lemari_kecil', name: 'Lemari Kecil', kind: 'furniture', buy_price: 40, sell_price: 16, buyable: true },
  { id: 'kasur_sederhana', name: 'Kasur Sederhana', kind: 'furniture', buy_price: 50, sell_price: 20, buyable: true },
  { id: 'lampu_meja', name: 'Lampu Meja', kind: 'furniture', buy_price: 15, sell_price: 6, buyable: true },
  { id: 'karpet_anyaman', name: 'Karpet Anyaman', kind: 'furniture', buy_price: 30, sell_price: 12, buyable: true },
  { id: 'rak_buku', name: 'Rak Buku', kind: 'furniture', buy_price: 35, sell_price: 14, buyable: true },
  { id: 'pot_bunga', name: 'Pot Bunga', kind: 'furniture', buy_price: 10, sell_price: 4, buyable: true },
  { id: 'kompor_tanah', name: 'Kompor Tanah Liat', kind: 'furniture', buy_price: 60, sell_price: 24, buyable: true, description: 'Diperlukan untuk memasak' },

  // ---- Alat ----
  { id: 'pancing_bambu', name: 'Pancing Bambu', kind: 'tool', buy_price: 30, sell_price: 10, buyable: true },
  { id: 'ember', name: 'Ember', kind: 'tool', buy_price: 10, sell_price: 4, buyable: true, description: 'Untuk menyiram tanaman' },
];
