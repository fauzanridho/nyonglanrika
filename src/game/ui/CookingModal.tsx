'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { cook, getInventory } from '@/lib/rpc';
import { RECIPES } from '@/data/recipes';
import { sfx } from '@/game/audio/sfx';

export interface CookingModalProps {
  onClose: () => void;
}

export default function CookingModal({ onClose }: CookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const inventory = useGameStore((s) => s.inventory);
  const setInventory = useGameStore((s) => s.setInventory);
  const setActiveBuff = useGameStore((s) => s.setActiveBuff);

  const canCookRecipe = (ingredients: Record<string, number>) => {
    return Object.entries(ingredients).every(([itemId, requiredQty]) => {
      const invItem = inventory.find((i) => i.item_id === itemId);
      return invItem && invItem.qty >= requiredQty;
    });
  };

  const handleCook = async (recipeId: string) => {
    setLoading(true);
    setMsg('');
    try {
      const res = await cook(recipeId);
      sfx.playCoin();
      setMsg(`Berhasil memasak ${res.name}! Masuk ke inventaris.`);

      // Ambil definisi buff jika resep memiliki efek
      const recipeDef = RECIPES.find((r) => r.id === recipeId);
      if (recipeDef?.buff) {
        const expiresAt = Date.now() + recipeDef.buff.duration_minutes * 60 * 1000;
        setActiveBuff({
          type: recipeDef.buff.type,
          value: recipeDef.buff.value,
          expiresAt,
        });
        setMsg(`Berhasil memasak ${res.name}! Buff aktif selama ${recipeDef.buff.duration_minutes} menit!`);
      }

      const updatedInv = await getInventory();
      setInventory(updatedInv);
    } catch (e: any) {
      setMsg(e.message || 'Gagal memasak resep');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm font-mono select-none">
      <div className="bg-[#1b2032] border-2 border-orange-600/70 rounded w-[90%] max-w-lg p-4 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-orange-300 font-bold text-base">🍳 Dapur Masakan Banyumasan</span>
          </div>
          <button
            onClick={() => {
              sfx.playClick();
              onClose();
            }}
            className="text-gray-400 hover:text-white px-2 py-1 text-sm bg-gray-800 rounded hover:bg-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Message Banner */}
        {msg && (
          <div className="mb-2 text-xs py-1 px-2 rounded bg-black/40 text-center text-orange-200 border border-orange-500/30">
            {msg}
          </div>
        )}

        {/* List Resep */}
        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
          {RECIPES.map((recipe) => {
            const isReady = canCookRecipe(recipe.ingredients);

            return (
              <div
                key={recipe.id}
                className={`border rounded p-3 flex flex-col justify-between transition-colors ${
                  isReady
                    ? 'bg-orange-950/20 border-orange-500/40'
                    : 'bg-black/30 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold text-yellow-300">
                      🍲 {recipe.name}
                    </span>
                    {recipe.buff && (
                      <span className="ml-2 text-[9px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        Buff: {recipe.buff.type.replace('_', ' ')} (+{Math.round(recipe.buff.value * 100)}%)
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-amber-300 font-bold">
                    💰 {recipe.sell_price}
                  </span>
                </div>

                {/* Bahan-bahan */}
                <div className="text-[10px] text-gray-300 mb-2 flex flex-wrap gap-2">
                  <span className="text-gray-400">Bahan:</span>
                  {Object.entries(recipe.ingredients).map(([item, qty]) => {
                    const have = inventory.find((i) => i.item_id === item)?.qty || 0;
                    const sufficient = have >= qty;

                    return (
                      <span
                        key={item}
                        className={`px-1.5 py-0.5 rounded border ${
                          sufficient
                            ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300'
                            : 'bg-red-950/40 border-red-600/40 text-red-300'
                        }`}
                      >
                        {item.replace(/_/g, ' ')} ({have}/{qty})
                      </span>
                    );
                  })}
                </div>

                {/* Tombol Masak */}
                <div className="flex justify-end">
                  <button
                    disabled={loading || !isReady}
                    onClick={() => handleCook(recipe.id)}
                    className="text-xs bg-orange-600 hover:bg-orange-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed px-4 py-1.5 rounded text-white font-bold transition-colors"
                  >
                    Masak Hidangan
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
