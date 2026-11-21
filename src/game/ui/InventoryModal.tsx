'use client';

import { useGameStore } from '@/store/gameStore';
import { sfx } from '@/game/audio/sfx';

export default function InventoryModal() {
  const showInventory = useGameStore((s) => s.showInventory);
  const toggleInventory = useGameStore((s) => s.toggleInventory);
  const inventory = useGameStore((s) => s.inventory);
  const player = useGameStore((s) => s.player);

  if (!showInventory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm font-mono select-none">
      <div className="bg-[#1b2032] border-2 border-[#4b597b] rounded w-[90%] max-w-md p-4 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-yellow-300 font-bold text-base">🎒 Tas Inventaris</span>
            <span className="text-xs bg-gray-800 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              💰 {player?.coins ?? 0} Koin
            </span>
          </div>
          <button
            onClick={() => {
              sfx.playClick();
              toggleInventory();
            }}
            className="text-gray-400 hover:text-white px-2 py-1 text-sm bg-gray-800 rounded hover:bg-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Item Grid */}
        <div className="grid grid-cols-4 gap-2.5 max-h-[260px] overflow-y-auto p-1">
          {inventory.length === 0 ? (
            <div className="col-span-4 text-center py-8 text-xs text-gray-400">
              Tas Anda masih kosong.<br />Mancing di Sungai Serayu atau berkebun untuk mendapatkan barang!
            </div>
          ) : (
            inventory.map((item) => (
              <div
                key={item.item_id}
                className="bg-black/40 border border-white/10 rounded p-2 flex flex-col items-center justify-center relative hover:border-emerald-500/60 transition-colors"
              >
                <div className="text-xl mb-1">
                  {item.item_id.startsWith('ikan_') ? '🐟' :
                   item.item_id.endsWith('_seed') ? '🌱' :
                   item.item_id.startsWith('umpan_') ? '🪱' : '📦'}
                </div>
                <div className="text-[10px] text-gray-300 text-center capitalize truncate w-full">
                  {item.item_id.replace(/_/g, ' ')}
                </div>
                <span className="absolute top-1 right-1 text-[10px] bg-emerald-800/80 text-emerald-200 px-1 rounded font-bold">
                  x{item.qty}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-gray-400 text-center">
          Tekan tombol <kbd className="px-1 bg-gray-800 text-gray-200 rounded">B</kbd> atau <kbd className="px-1 bg-gray-800 text-gray-200 rounded">I</kbd> untuk menutup tas
        </div>
      </div>
    </div>
  );
}
