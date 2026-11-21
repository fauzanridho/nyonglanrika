'use client';

import { useEffect, useState } from 'react';
import { getCollection } from '@/lib/rpc';
import { FISH } from '@/data/fish';
import { sfx } from '@/game/audio/sfx';

export interface CollectionModalProps {
  onClose: () => void;
}

export default function CollectionModal({ onClose }: CollectionModalProps) {
  const [collection, setCollection] = useState<Array<{ entry_id: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCollection()
      .then((data) => {
        setCollection(data.filter((d: any) => d.kind === 'fish'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalFish = FISH.length;
  const caughtFishCount = collection.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm font-mono select-none">
      <div className="bg-[#1b2032] border-2 border-sky-600/70 rounded w-[90%] max-w-lg p-4 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-sky-300 font-bold text-base">📖 Album Koleksi Ikan</span>
            <span className="text-xs bg-gray-800 text-sky-200 px-2 py-0.5 rounded border border-sky-500/30">
              {caughtFishCount} / {totalFish} Ditemukan
            </span>
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

        {/* Grid Ikan */}
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400 animate-pulse">
            Membuka lembaran album...
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto p-1">
            {FISH.map((fish) => {
              const record = collection.find((c) => c.entry_id === fish.id);
              const isCaught = !!record;

              return (
                <div
                  key={fish.id}
                  className={`border rounded p-2.5 flex flex-col items-center justify-center relative transition-all ${
                    isCaught
                      ? 'bg-black/40 border-sky-500/40'
                      : 'bg-black/20 border-white/5 opacity-40 grayscale'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {isCaught ? '🐟' : '❓'}
                  </div>
                  <div className="text-[11px] font-bold text-center text-gray-200 truncate w-full">
                    {isCaught ? fish.name : '???'}
                  </div>
                  <div className="text-[9px] text-gray-400 capitalize">
                    {isCaught ? fish.rarity : 'Belum Pernah'}
                  </div>
                  {isCaught && (
                    <span className="mt-1 text-[9px] text-amber-300">
                      Tertangkap: {record.count}x
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
