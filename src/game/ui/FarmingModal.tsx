'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import {
  plantCrop,
  waterPlot,
  harvestPlot,
  getInventory,
  getPlayer,
} from '@/lib/rpc';
import { CROPS } from '@/data/crops';
import { sfx } from '@/game/audio/sfx';

export interface PlotData {
  slot: number;
  crop_id: string | null;
  planted_at: string | null;
  last_watered: string | null;
}

export interface FarmingModalProps {
  houseId: string;
  initialPlots: PlotData[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function FarmingModal({
  houseId,
  initialPlots,
  onClose,
  onRefresh,
}: FarmingModalProps) {
  const [plots, setPlots] = useState<PlotData[]>(initialPlots);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const inventory = useGameStore((s) => s.inventory);
  const setInventory = useGameStore((s) => s.setInventory);
  const setPlayer = useGameStore((s) => s.setPlayer);

  // Bibit yang dimiliki pemain
  const seedItems = inventory.filter(
    (i) => i.item_id.endsWith('_seed') && i.qty > 0
  );

  // Format 4 slot default jika belum ada di database
  const displayPlots: PlotData[] = [0, 1, 2, 3].map((slotIdx) => {
    const existing = plots.find((p) => p.slot === slotIdx);
    return existing || { slot: slotIdx, crop_id: null, planted_at: null, last_watered: null };
  });

  const getCropStatus = (plot: PlotData) => {
    if (!plot.crop_id || !plot.planted_at) {
      return { status: 'empty', label: 'Petak Kosong', progress: 0, ready: false };
    }
    const cropDef = CROPS.find((c) => c.id === plot.crop_id);
    if (!cropDef) {
      return { status: 'unknown', label: plot.crop_id, progress: 0, ready: false };
    }

    const plantedMs = new Date(plot.planted_at).getTime();
    const nowMs = Date.now();
    const elapsedHours = (nowMs - plantedMs) / (1000 * 60 * 60);
    const progress = Math.min(100, Math.round((elapsedHours / cropDef.grow_hours) * 100));
    const ready = elapsedHours >= cropDef.grow_hours;

    return {
      status: ready ? 'ready' : 'growing',
      label: cropDef.name,
      progress,
      ready,
      growHours: cropDef.grow_hours,
      yield: cropDef.yield,
    };
  };

  const handlePlant = async (slot: number, seedItemId: string) => {
    const cropId = seedItemId.replace('_seed', '');
    setLoading(true);
    setMsg('');
    try {
      await plantCrop(houseId, slot, cropId);
      sfx.playClick();
      setMsg(`Berhasil menanam ${cropId}!`);
      const updatedInv = await getInventory();
      setInventory(updatedInv);
      onRefresh();
      // Update local plots
      setPlots((prev) => [
        ...prev.filter((p) => p.slot !== slot),
        { slot, crop_id: cropId, planted_at: new Date().toISOString(), last_watered: null },
      ]);
      setSelectedSlot(null);
    } catch (e: any) {
      setMsg(e.message || 'Gagal menanam bibit');
    } finally {
      setLoading(false);
    }
  };

  const handleWater = async (slot: number) => {
    setLoading(true);
    setMsg('');
    try {
      await waterPlot(houseId, slot);
      sfx.playClick();
      setMsg('Petak berhasil disiram air!');
      onRefresh();
      const today = new Date().toISOString().split('T')[0];
      setPlots((prev) =>
        prev.map((p) => (p.slot === slot ? { ...p, last_watered: today } : p))
      );
    } catch (e: any) {
      setMsg(e.message || 'Gagal menyiram');
    } finally {
      setLoading(false);
    }
  };

  const handleHarvest = async (slot: number) => {
    setLoading(true);
    setMsg('');
    try {
      const res = await harvestPlot(houseId, slot);
      sfx.playCoin();
      setMsg(`Panen berhasil! Mendapatkan ${res.yield} ${res.crop_id}`);

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
      setInventory(updatedInv);
      onRefresh();
      setPlots((prev) =>
        prev.map((p) =>
          p.slot === slot
            ? { slot, crop_id: null, planted_at: null, last_watered: null }
            : p
        )
      );
    } catch (e: any) {
      setMsg(e.message || 'Belum siap panen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm font-mono select-none">
      <div className="bg-[#1b2032] border-2 border-emerald-600/70 rounded w-[90%] max-w-lg p-4 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-emerald-300 font-bold text-base">🌱 Kebun Pekarangan Rumah</span>
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
          <div className="mb-2 text-xs py-1 px-2 rounded bg-black/40 text-center text-emerald-200 border border-emerald-500/30">
            {msg}
          </div>
        )}

        {/* Grid 4 Petak Kebun */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {displayPlots.map((plot) => {
            const { status, label, progress, ready } = getCropStatus(plot);
            const isWateredToday = !!plot.last_watered;

            return (
              <div
                key={plot.slot}
                className={`border rounded p-3 flex flex-col justify-between transition-colors ${
                  status === 'empty'
                    ? 'bg-amber-950/20 border-amber-800/40'
                    : ready
                    ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-900/20'
                    : 'bg-black/30 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-200">
                    Petak #{plot.slot + 1}
                  </span>
                  <span className="text-[10px]">
                    {isWateredToday ? '💧 Lembap' : '🍂 Kering'}
                  </span>
                </div>

                {status === 'empty' ? (
                  <div className="my-3 text-center">
                    <div className="text-2xl mb-1">🟫</div>
                    <div className="text-xs text-gray-400">Petak Siap Ditanami</div>
                  </div>
                ) : (
                  <div className="my-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{ready ? '🍅' : '🌿'}</span>
                      <div>
                        <div className="text-xs font-bold text-yellow-300">{label}</div>
                        <div className="text-[10px] text-gray-400">
                          {ready ? 'Siap dipanen!' : `Tumbuh: ${progress}%`}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden border border-white/10">
                      <div
                        className={`h-full transition-all ${
                          ready ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Tombol Aksi per Petak */}
                <div className="mt-2 flex gap-1.5 pt-2 border-t border-white/10">
                  {status === 'empty' ? (
                    <button
                      disabled={loading || seedItems.length === 0}
                      onClick={() => setSelectedSlot(plot.slot)}
                      className="w-full text-xs bg-amber-700 hover:bg-amber-600 disabled:bg-gray-700 disabled:cursor-not-allowed py-1 rounded text-white font-bold"
                    >
                      Tanam Bibit
                    </button>
                  ) : ready ? (
                    <button
                      disabled={loading}
                      onClick={() => handleHarvest(plot.slot)}
                      className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 py-1 rounded text-white font-bold animate-pulse"
                    >
                      Panen Hasil 🧺
                    </button>
                  ) : (
                    <button
                      disabled={loading || isWateredToday}
                      onClick={() => handleWater(plot.slot)}
                      className="w-full text-xs bg-sky-700 hover:bg-sky-600 disabled:bg-gray-800 disabled:text-gray-500 py-1 rounded text-white font-bold"
                    >
                      {isWateredToday ? 'Sudah Disiram' : 'Siram Air 💧'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Pemilihan Bibit saat Tanam */}
        {selectedSlot !== null && (
          <div className="mt-3 p-3 bg-black/60 rounded border border-amber-500/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-yellow-300">
                Pilih Bibit untuk Petak #{selectedSlot + 1}:
              </span>
              <button
                onClick={() => setSelectedSlot(null)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Batal
              </button>
            </div>
            {seedItems.length === 0 ? (
              <div className="text-xs text-gray-400 py-2">
                Anda tidak memiliki bibit. Beli bibit di Toko Bu Warni (Pasar Wage)!
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {seedItems.map((seed) => (
                  <button
                    key={seed.item_id}
                    onClick={() => handlePlant(selectedSlot, seed.item_id)}
                    className="text-xs bg-gray-800 hover:bg-emerald-800 border border-white/10 hover:border-emerald-500 p-2 rounded text-left flex items-center justify-between"
                  >
                    <span className="capitalize">{seed.item_id.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-amber-300 font-bold">x{seed.qty}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
