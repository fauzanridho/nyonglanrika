// ============================================================
// Data: Crops catalog
// ============================================================

export interface CropDef {
  id: string;
  name: string;
  /** Jam tumbuh (dari tanam sampai panen) */
  grow_hours: number;
  /** Jumlah tahap visual pertumbuhan */
  stages: number;
  sell_price: number;
  /** Jumlah hasil panen */
  yield: number;
}

export const CROPS: CropDef[] = [
  { id: 'singkong', name: 'Singkong', grow_hours: 8, stages: 4, sell_price: 10, yield: 3 },
  { id: 'bayam', name: 'Bayam', grow_hours: 4, stages: 3, sell_price: 8, yield: 2 },
  { id: 'cabai', name: 'Cabai Rawit', grow_hours: 12, stages: 4, sell_price: 15, yield: 4 },
  { id: 'tomat', name: 'Tomat', grow_hours: 6, stages: 3, sell_price: 12, yield: 2 },
  { id: 'stroberi', name: 'Stroberi Baturaden', grow_hours: 24, stages: 5, sell_price: 35, yield: 2 },
  { id: 'kopi', name: 'Kopi Robusta', grow_hours: 48, stages: 5, sell_price: 60, yield: 3 },
  { id: 'kelapa', name: 'Kelapa', grow_hours: 72, stages: 5, sell_price: 40, yield: 2 },
  { id: 'kacang_panjang', name: 'Kacang Panjang', grow_hours: 6, stages: 3, sell_price: 10, yield: 3 },
];
