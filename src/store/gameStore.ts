// ============================================================
// Zustand Game Store - satu sumber kebenaran state di memori
// ============================================================

import { create } from 'zustand';

export interface PlayerState {
  id: string;
  name: string;
  look: Record<string, string>;
  coins: number;
  zone: string;
  posX: number;
  posY: number;
}

export interface InventoryItem {
  item_id: string;
  qty: number;
}

export interface BuffState {
  type: string;
  value: number;
  expiresAt: number; // timestamp ms
}

export interface GameState {
  // ---- Player ----
  player: PlayerState | null;
  setPlayer: (p: PlayerState | null) => void;

  // ---- Inventory ----
  inventory: InventoryItem[];
  setInventory: (items: InventoryItem[]) => void;
  addItem: (itemId: string, qty: number) => void;
  removeItem: (itemId: string, qty: number) => void;

  // ---- UI state ----
  showInventory: boolean;
  toggleInventory: () => void;
  showDialog: boolean;
  dialogLines: string[];
  dialogNpcName: string;
  openDialog: (npcName: string, lines: string[]) => void;
  closeDialog: () => void;

  // ---- Weather ----
  weather: { weather: string; intensity: number; hour: number; date: string } | null;
  setWeather: (w: GameState['weather']) => void;

  // ---- Fishing state ----
  fishingState: 'idle' | 'casting' | 'waiting' | 'bite' | 'reeling' | 'result';
  setFishingState: (s: GameState['fishingState']) => void;
  lastCatch: { caught: boolean; fish_id?: string; name?: string; rarity?: string } | null;
  setLastCatch: (c: GameState['lastCatch']) => void;

  // ---- Buff ----
  activeBuff: BuffState | null;
  setActiveBuff: (b: BuffState | null) => void;

  // ---- Collection ----
  collection: Array<{ kind: string; entry_id: string; count: number }>;
  setCollection: (c: GameState['collection']) => void;

  // ---- Live Position for Minimap ----
  livePos: { zone: string; x: number; y: number };
  setLivePos: (zone: string, x: number, y: number) => void;

  // ---- Loading ----
  isLoading: boolean;
  setIsLoading: (l: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Player
  player: null,
  setPlayer: (p) => set({ player: p }),

  // Inventory
  inventory: [],
  setInventory: (items) => set({ inventory: items }),
  addItem: (itemId, qty) =>
    set((state) => {
      const existing = state.inventory.find((i) => i.item_id === itemId);
      if (existing) {
        return {
          inventory: state.inventory.map((i) =>
            i.item_id === itemId ? { ...i, qty: i.qty + qty } : i
          ),
        };
      }
      return { inventory: [...state.inventory, { item_id: itemId, qty }] };
    }),
  removeItem: (itemId, qty) =>
    set((state) => ({
      inventory: state.inventory
        .map((i) => (i.item_id === itemId ? { ...i, qty: i.qty - qty } : i))
        .filter((i) => i.qty > 0),
    })),

  // UI
  showInventory: false,
  toggleInventory: () => set((s) => ({ showInventory: !s.showInventory })),
  showDialog: false,
  dialogLines: [],
  dialogNpcName: '',
  openDialog: (npcName, lines) =>
    set({ showDialog: true, dialogNpcName: npcName, dialogLines: lines }),
  closeDialog: () => set({ showDialog: false, dialogLines: [], dialogNpcName: '' }),

  // Weather
  weather: null,
  setWeather: (w) => set({ weather: w }),

  // Fishing
  fishingState: 'idle',
  setFishingState: (s) => set({ fishingState: s }),
  lastCatch: null,
  setLastCatch: (c) => set({ lastCatch: c }),

  // Buff
  activeBuff: null,
  setActiveBuff: (b) => set({ activeBuff: b }),

  // Collection
  collection: [],
  setCollection: (c) => set({ collection: c }),

  // Live Position for Minimap
  livePos: { zone: 'alun_alun', x: 24 * 16, y: 13 * 16 },
  setLivePos: (zone, x, y) => set({ livePos: { zone, x, y } }),

  // Loading
  isLoading: true,
  setIsLoading: (l) => set({ isLoading: l }),
}));
