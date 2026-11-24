'use client';

import { useGameStore } from '@/store/gameStore';
import { QUESTS } from '@/data/quests';
import { completeQuest, getPlayer, getInventory } from '@/lib/rpc';
import { sfx } from '@/game/audio/sfx';

export interface QuestProgressItem {
  quest_id: string;
  state: Record<string, unknown>;
  done: boolean;
}

export interface QuestModalProps {
  questList: QuestProgressItem[];
  discoveriesCount: number;
  onClose: () => void;
  onRefresh: () => void;
}

export default function QuestModal({
  questList,
  discoveriesCount,
  onClose,
  onRefresh,
}: QuestModalProps) {
  const inventory = useGameStore((s) => s.inventory);
  const setPlayer = useGameStore((s) => s.setPlayer);

  const isQuestDone = (questId: string) => {
    return questList.some((q) => q.quest_id === questId && q.done);
  };

  const handleClaim = async (questId: string) => {
    try {
      const res = await completeQuest(questId);
      sfx.playCoin();
      const [updatedPlayer, updatedInv] = await Promise.all([getPlayer(), getInventory()]);
      if (updatedPlayer) {
        setPlayer({
          id: updatedPlayer.id,
          name: updatedPlayer.name,
          look: updatedPlayer.look as Record<string, string>,
          coins: updatedPlayer.coins,
          zone: updatedPlayer.zone,
          posX: updatedPlayer.pos_x,
          posY: updatedPlayer.pos_y,
        });
      }
      useGameStore.getState().setInventory(updatedInv);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Gagal klaim hadiah');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm font-mono select-none">
      <div className="bg-[#1b2032] border-2 border-amber-500/70 rounded w-[90%] max-w-lg p-4 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-amber-300 font-bold text-base">📜 Buku Jurnal & Misi Kota</span>
            <span className="text-xs bg-gray-800 text-amber-200 px-2 py-0.5 rounded border border-amber-500/30">
              💎 {discoveriesCount} / 7 Kenangan
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

        {/* Quest List */}
        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
          {QUESTS.map((q) => {
            const completed = isQuestDone(q.id);

            return (
              <div
                key={q.id}
                className={`border rounded p-3 transition-colors ${
                  completed
                    ? 'bg-black/30 border-emerald-500/30 opacity-70'
                    : 'bg-black/40 border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{completed ? '✅' : '🧭'}</span>
                    <span className="text-xs font-bold text-yellow-300">{q.name}</span>
                  </div>
                  {q.reward.coins && (
                    <span className="text-xs text-amber-300 font-bold">
                      +{q.reward.coins} Koin
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-gray-300 mb-2 leading-relaxed">
                  {q.description}
                </p>

                {/* Langkah-langkah */}
                <div className="space-y-1 mb-2 bg-black/30 p-2 rounded border border-white/5">
                  {q.steps.map((step, idx) => (
                    <div key={idx} className="text-[10px] text-gray-400 flex items-center gap-1.5">
                      <span>•</span>
                      <span>{step.description}</span>
                    </div>
                  ))}
                </div>

                {/* Action Claim */}
                <div className="flex justify-end">
                  {completed ? (
                    <span className="text-[10px] text-emerald-400 font-bold">Telah Selesai</span>
                  ) : (
                    <button
                      onClick={() => handleClaim(q.id)}
                      className="text-xs bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded text-white font-bold"
                    >
                      Selesaikan & Klaim
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
