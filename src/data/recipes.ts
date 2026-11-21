// ============================================================
// Data: Recipes catalog
// ============================================================

export interface RecipeDef {
  id: string;
  name: string;
  /** { item_id: jumlah } */
  ingredients: Record<string, number>;
  sell_price: number;
  /** Efek buff (opsional) */
  buff?: {
    type: 'fishing_window' | 'speed' | 'luck';
    value: number;
    duration_minutes: number;
  };
}

export const RECIPES: RecipeDef[] = [
  {
    id: 'mendoan',
    name: 'Mendoan',
    ingredients: { kacang_panjang: 1, cabai: 1 },
    sell_price: 30,
    buff: { type: 'fishing_window', value: 0.3, duration_minutes: 10 },
  },
  {
    id: 'soto_sokaraja',
    name: 'Soto Sokaraja',
    ingredients: { bayam: 2, cabai: 1, tomat: 1 },
    sell_price: 45,
    buff: { type: 'speed', value: 0.15, duration_minutes: 15 },
  },
  {
    id: 'getuk_goreng',
    name: 'Getuk Goreng',
    ingredients: { singkong: 2, kelapa: 1 },
    sell_price: 35,
    buff: { type: 'luck', value: 0.1, duration_minutes: 10 },
  },
  {
    id: 'nasi_liwet',
    name: 'Nasi Liwet',
    ingredients: { bayam: 1, tomat: 1 },
    sell_price: 25,
  },
  {
    id: 'pecel',
    name: 'Pecel',
    ingredients: { bayam: 2, kacang_panjang: 1, cabai: 1 },
    sell_price: 28,
  },
  {
    id: 'es_stroberi',
    name: 'Es Stroberi Baturaden',
    ingredients: { stroberi: 3 },
    sell_price: 50,
    buff: { type: 'fishing_window', value: 0.5, duration_minutes: 20 },
  },
  {
    id: 'kopi_tubruk',
    name: 'Kopi Tubruk',
    ingredients: { kopi: 2 },
    sell_price: 40,
    buff: { type: 'speed', value: 0.2, duration_minutes: 20 },
  },
  {
    id: 'ikan_bakar',
    name: 'Ikan Bakar',
    ingredients: { ikan_nila: 1, cabai: 1, tomat: 1 },
    sell_price: 55,
    buff: { type: 'luck', value: 0.15, duration_minutes: 15 },
  },
];
