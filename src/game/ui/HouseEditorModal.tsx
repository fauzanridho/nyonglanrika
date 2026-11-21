'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import {
  placeFurniture,
  removeFurniture,
  getInventory,
} from '@/lib/rpc';
import { createClient } from '@/lib/supabase/client';
import { ITEMS } from '@/data/items';
import { sfx } from '@/game/audio/sfx';

export interface PlacedItem {
  id: string;
  item_id: string;
  x: number;
  y: number;
  rot: number;
  placed_by?: string;
}

export interface HouseEditorModalProps {
  houseId: string;
  isShared: boolean;
  onClose: () => void;
}

const GRID_COLS = 12;
const GRID_ROWS = 8;

export default function HouseEditorModal({
  houseId,
  isShared,
  onClose,
}: HouseEditorModalProps) {
  const [items, setItems] = useState<PlacedItem[]>([]);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const inventory = useGameStore((s) => s.inventory);
  const setInventory = useGameStore((s) => s.setInventory);

  const furnitureItems = inventory.filter(
    (i) => i.qty > 0 && ITEMS.some((itemDef) => itemDef.id === i.item_id && itemDef.kind === 'furniture')
  );

  // Muat perabotan awal & subscribe Realtime untuk rumah bersama
  useEffect(() => {
    const supabase = createClient();

    // Fetch initial items
    supabase
      .from('house_items')
      .select('*')
      .eq('house_id', houseId)
      .then(({ data, error }) => {
        if (!error && data) {
          setItems(data);
        }
      });

    // Supabase Realtime Subscription jika di rumah bersama
    let channel: any = null;
    if (isShared) {
      channel = supabase
        .channel(`house_${houseId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'house_items', filter: `house_id=eq.${houseId}` },
          () => {
            // Re-fetch saat pasangan mengubah perabotan
            supabase
              .from('house_items')
              .select('*')
              .eq('house_id', houseId)
              .then(({ data }) => {
                if (data) setItems(data);
              });
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [houseId, isShared]);

  const handleTileClick = async (x: number, y: number) => {
    const existing = items.find((i) => i.x === x && i.y === y);

    // 1. Ambil kembali furnitur jika tile sudah terisi
    if (existing) {
      setLoading(true);
      setMsg('');
      try {
        await removeFurniture(existing.id);
        sfx.playClick();
        setItems((prev) => prev.filter((i) => i.id !== existing.id));
        const updatedInv = await getInventory();
        setInventory(updatedInv);
        setMsg(`Perabot ${existing.item_id.replace(/_/g, ' ')} diambil.`);
      } catch (e: any) {
        setMsg(e.message || 'Gagal mengambil furnitur');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Letakkan perabot yang dipilih dari inventaris
    if (selectedInventoryItem) {
      setLoading(true);
      setMsg('');
      try {
        const newId = await placeFurniture(houseId, selectedInventoryItem, x, y, 0);
        sfx.playClick();
        setItems((prev) => [
          ...prev,
          { id: newId, item_id: selectedInventoryItem, x, y, rot: 0 },
        ]);
        const updatedInv = await getInventory();
        setInventory(updatedInv);
        setMsg(`Perabot diletakkan pada (${x}, ${y})!`);
      } catch (e: any) {
        setMsg(e.message || 'Gagal meletakkan perabot');
      } finally {
        setLoading(false);
      }
    }
  };

  const getFurnitureIcon = (itemId: string) => {
    switch (itemId) {
      case 'kursi_kayu': return '🪑';
      case 'meja_kayu': return '🪵';
      case 'lemari_kecil': return '🚪';
      case 'kasur_sederhana': return '🛏️';
      case 'lampu_meja': return '💡';
      case 'karpet_anyaman': return '🧶';
      case 'rak_buku': return '📚';
      case 'pot_bunga': return '🪴';
      case 'kompor_tanah': return '🍳';
      default: return '📦';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm font-mono select-none">
      <div className="bg-[#1b2032] border-2 border-amber-600/70 rounded w-[95%] max-w-2xl p-4 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-amber-300 font-bold text-base">
              🏡 Mode Dekorasi Rumah {isShared ? 'Bersama (Realtime)' : 'Pribadi'}
            </span>
          </div>
          <button
            onClick={() => {
              sfx.playClick();
              onClose();
            }}
            className="text-gray-400 hover:text-white px-2 py-1 text-sm bg-gray-800 rounded hover:bg-gray-700"
          >
            ✕ Tutup
          </button>
        </div>

        {/* Message Banner */}
        {msg && (
          <div className="mb-2 text-xs py-1 px-2 rounded bg-black/40 text-center text-amber-200 border border-amber-500/30">
            {msg}
          </div>
        )}

        {/* Room Grid (12 Kolom x 8 Baris) */}
        <div className="bg-amber-950/20 border-2 border-amber-900/60 rounded p-2 mb-3 overflow-x-auto">
          <div
            className="grid gap-1 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, minmax(36px, 1fr))`,
              width: 'max-content',
            }}
          >
            {Array.from({ length: GRID_ROWS }).map((_, y) =>
              Array.from({ length: GRID_COLS }).map((_, x) => {
                const placed = items.find((i) => i.x === x && i.y === y);

                return (
                  <button
                    key={`${x}-${y}`}
                    disabled={loading}
                    onClick={() => handleTileClick(x, y)}
                    title={`Tile (${x}, ${y})`}
                    className={`w-9 h-9 border rounded flex items-center justify-center text-sm transition-all relative ${
                      placed
                        ? 'bg-amber-900/40 border-amber-500/60 hover:bg-red-950/60 hover:border-red-500'
                        : selectedInventoryItem
                        ? 'bg-black/40 border-white/10 hover:border-emerald-400 hover:bg-emerald-950/30'
                        : 'bg-black/20 border-white/5'
                    }`}
                  >
                    {placed ? (
                      <span>{getFurnitureIcon(placed.item_id)}</span>
                    ) : (
                      <span className="text-[8px] text-gray-700">·</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Pemilihan Furnitur dari Tas */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Pilih Furnitur dari Tas untuk Diletakkan:</span>
            {selectedInventoryItem && (
              <button
                onClick={() => setSelectedInventoryItem(null)}
                className="text-[10px] text-red-400 hover:underline"
              >
                Batalkan Pilihan
              </button>
            )}
          </div>

          {furnitureItems.length === 0 ? (
            <div className="text-xs text-gray-500 py-2">
              Tidak ada perabotan di tas. Beli furnitur di Toko Bu Warni (Pasar Wage)!
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-[80px] overflow-y-auto">
              {furnitureItems.map((f) => (
                <button
                  key={f.item_id}
                  onClick={() => {
                    sfx.playClick();
                    setSelectedInventoryItem(
                      selectedInventoryItem === f.item_id ? null : f.item_id
                    );
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded border transition-colors flex items-center gap-1.5 ${
                    selectedInventoryItem === f.item_id
                      ? 'bg-amber-700 border-amber-400 text-white font-bold'
                      : 'bg-black/40 border-white/10 text-gray-300 hover:border-white/30'
                  }`}
                >
                  <span>{getFurnitureIcon(f.item_id)}</span>
                  <span className="capitalize">{f.item_id.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] text-amber-300">x{f.qty}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-2 text-[10px] text-gray-400">
            * Tips: Klik tile kosong untuk menaruh furnitur. Klik furnitur yang terpasang untuk menyimpannya kembali ke tas.
          </div>
        </div>
      </div>
    </div>
  );
}
