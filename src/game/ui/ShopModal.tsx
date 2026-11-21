'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { sellItem, buyItem, getPlayer } from '@/lib/rpc';
import { ITEMS } from '@/data/items';
import { FISH } from '@/data/fish';
import { sfx } from '@/game/audio/sfx';

export interface ShopModalProps {
  onClose: () => void;
}

export default function ShopModal({ onClose }: ShopModalProps) {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const inventory = useGameStore((s) => s.inventory);
  const player = useGameStore((s) => s.player);
  const setInventory = useGameStore((s) => s.setInventory);
  const setPlayer = useGameStore((s) => s.setPlayer);

  const buyableItems = ITEMS.filter((i) => i.buyable);

  const handleBuy = async (itemId: string) => {
    setLoading(true);
    setMsg('');
    try {
      await buyItem(itemId, 1);
      sfx.playCoin();
      // Refresh inventory & player
      const updatedPlayer = await getPlayer();
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
      const { getInventory } = await import('@/lib/rpc');
      const updatedInv = await getInventory();
      setInventory(updatedInv);
      setMsg('Berhasil membeli 1 item!');
    } catch (e: any) {
      setMsg(e.message || 'Gagal membeli item');
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async (itemId: string) => {
    setLoading(true);
    setMsg('');
    try {
      await sellItem(itemId, 1);
      sfx.playCoin();
      const updatedPlayer = await getPlayer();
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
      const { getInventory } = await import('@/lib/rpc');
      const updatedInv = await getInventory();
      setInventory(updatedInv);
      setMsg('Berhasil menjual 1 item!');
    } catch (e: any) {
      setMsg(e.message || 'Gagal menjual item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm font-mono select-none">
      <div className="bg-[#1b2032] border-2 border-amber-600/70 rounded w-[90%] max-w-lg p-4 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-amber-300 font-bold text-base">🏪 Toko Bu Warni (Pasar Wage)</span>
            <span className="text-xs bg-gray-800 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/30">
              💰 {player?.coins ?? 0}
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

        {/* Tabs */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => {
              sfx.playClick();
              setTab('buy');
              setMsg('');
            }}
            className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
              tab === 'buy' ? 'bg-amber-700 border-amber-500 text-white font-bold' : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            Beli Barang
          </button>
          <button
            onClick={() => {
              sfx.playClick();
              setTab('sell');
              setMsg('');
            }}
            className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
              tab === 'sell' ? 'bg-emerald-700 border-emerald-500 text-white font-bold' : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            Jual Tangkapan / Hasil
          </button>
        </div>

        {/* Message Banner */}
        {msg && (
          <div className="mb-2 text-xs py-1 px-2 rounded bg-black/40 text-center text-amber-200 border border-white/10">
            {msg}
          </div>
        )}

        {/* Content Tab */}
        <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1">
          {tab === 'buy' ? (
            buyableItems.map((item) => (
              <div
                key={item.id}
                className="bg-black/30 border border-white/10 rounded p-2 flex items-center justify-between hover:border-amber-500/50"
              >
                <div>
                  <div className="text-xs font-bold text-gray-200">{item.name}</div>
                  <div className="text-[10px] text-gray-400 capitalize">{item.kind}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-yellow-300 font-bold">💰 {item.buy_price}</span>
                  <button
                    disabled={loading || (player?.coins ?? 0) < (item.buy_price ?? 0)}
                    onClick={() => handleBuy(item.id)}
                    className="text-xs bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:cursor-not-allowed px-3 py-1 rounded text-white font-bold"
                  >
                    Beli
                  </button>
                </div>
              </div>
            ))
          ) : (
            inventory.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                Tidak ada item di tas yang dapat dijual.
              </div>
            ) : (
              inventory.map((inv) => {
                const fishDef = FISH.find((f) => f.id === inv.item_id);
                const itemDef = ITEMS.find((i) => i.id === inv.item_id);
                const sellPrice = fishDef?.sell_price || itemDef?.sell_price || 0;

                return (
                  <div
                    key={inv.item_id}
                    className="bg-black/30 border border-white/10 rounded p-2 flex items-center justify-between hover:border-emerald-500/50"
                  >
                    <div>
                      <div className="text-xs font-bold text-gray-200 capitalize">
                        {fishDef?.name || itemDef?.name || inv.item_id.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[10px] text-emerald-400">Punya: {inv.qty} unit</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-amber-300 font-bold">💰 +{sellPrice}/unit</span>
                      <button
                        disabled={loading || sellPrice === 0}
                        onClick={() => handleSell(inv.item_id)}
                        className="text-xs bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:cursor-not-allowed px-3 py-1 rounded text-white font-bold"
                      >
                        Jual 1
                      </button>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
}
