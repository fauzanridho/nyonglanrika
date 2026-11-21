'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import {
  createParty,
  createInvite,
  leaveParty,
  dissolveParty,
  getPlayer,
} from '@/lib/rpc';
import { sfx } from '@/game/audio/sfx';

export interface PartyData {
  party_id: string;
  party_name: string;
  owner_id: string;
  is_owner: boolean;
  members: Array<{ player_id: string; name: string; is_owner: boolean }>;
  shared_house_id: string | null;
  house_items: any[];
}

export interface PartyModalProps {
  partyData: PartyData | null;
  onClose: () => void;
  onRefresh: () => void;
  onOpenHouseEditor: (houseId: string) => void;
}

export default function PartyModal({
  partyData,
  onClose,
  onRefresh,
  onOpenHouseEditor,
}: PartyModalProps) {
  const [newPartyName, setNewPartyName] = useState('');
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const setPlayer = useGameStore((s) => s.setPlayer);

  const handleCreateParty = async () => {
    if (!newPartyName.trim()) return;
    setLoading(true);
    setMsg('');
    try {
      await createParty(newPartyName.trim());
      sfx.playCoin();
      setMsg('Berhasil mendirikan Party!');
      onRefresh();
    } catch (e: any) {
      setMsg(e.message || 'Gagal membuat party');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = async () => {
    if (!partyData) return;
    setLoading(true);
    setMsg('');
    try {
      const code = await createInvite(partyData.party_id);
      sfx.playClick();
      setInviteCode(code);
      setMsg(`Kode Undangan dibuat: ${code}`);
    } catch (e: any) {
      setMsg(e.message || 'Gagal membuat undangan');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveOrDissolve = async () => {
    if (!partyData) return;
    const isOwner = partyData.is_owner;
    const confirmMsg = isOwner
      ? 'Apakah Anda yakin ingin membubarkan party? Rumah bersama akan menjadi milik Anda dan anggota lain mendapat kompensasi koin.'
      : 'Apakah Anda yakin ingin keluar dari party? Anda akan mendapatkan kompensasi koin 50% dari perabotan Anda.';

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    setMsg('');
    try {
      if (isOwner) {
        await dissolveParty();
        setMsg('Party berhasil dibubarkan.');
      } else {
        await leaveParty();
        setMsg('Berhasil keluar dari party.');
      }
      sfx.playClick();

      // Refresh player coins
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
      onRefresh();
      setTimeout(onClose, 1500);
    } catch (e: any) {
      setMsg(e.message || 'Gagal memproses aksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm font-mono select-none">
      <div className="bg-[#1b2032] border-2 border-indigo-500/70 rounded w-[90%] max-w-md p-4 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-indigo-300 font-bold text-base">👥 Sistem Party & Rumah Bersama</span>
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
          <div className="mb-3 text-xs py-1 px-2 rounded bg-black/40 text-center text-indigo-200 border border-indigo-500/30">
            {msg}
          </div>
        )}

        {!partyData ? (
          // ================= Belum Punya Party =================
          <div>
            <p className="text-xs text-gray-300 mb-3 leading-relaxed">
              Anda belum bergabung dalam Party. Dirikan party bersama pasangan atau teman untuk membangun <span className="text-yellow-300 font-bold">Rumah Bersama</span> (maksimal 2 pemain)!
            </p>

            <div className="space-y-2">
              <label className="block text-[11px] text-gray-400">Nama Party Baru:</label>
              <input
                type="text"
                value={newPartyName}
                onChange={(e) => setNewPartyName(e.target.value)}
                placeholder="Contoh: Gubuk Nyong & Rika"
                maxLength={24}
                className="w-full bg-black/40 border border-white/20 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
              />

              <button
                disabled={loading || !newPartyName.trim()}
                onClick={handleCreateParty}
                className="w-full text-xs bg-indigo-700 hover:bg-indigo-600 disabled:bg-gray-800 disabled:text-gray-500 py-2 rounded text-white font-bold transition-colors shadow"
              >
                ✦ Dirikan Party & Buat Rumah Bersama
              </button>
            </div>
          </div>
        ) : (
          // ================= Sudah Memiliki Party =================
          <div className="space-y-3">
            <div className="p-2.5 bg-black/40 rounded border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Nama Party:</span>
                <span className="text-xs font-bold text-yellow-300">{partyData.party_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Peran Anda:</span>
                <span className="text-xs font-bold text-emerald-400">
                  {partyData.is_owner ? '👑 Ketua (Pembuat)' : '🤝 Anggota'}
                </span>
              </div>
            </div>

            {/* Daftar Anggota */}
            <div>
              <span className="text-[11px] text-gray-400 block mb-1.5">Anggota ({partyData.members.length} / 2):</span>
              <div className="space-y-1">
                {partyData.members.map((m) => (
                  <div
                    key={m.player_id}
                    className="flex items-center justify-between px-2.5 py-1.5 bg-gray-800/80 rounded border border-white/5 text-xs"
                  >
                    <span>{m.name}</span>
                    <span className="text-[10px] text-amber-300">
                      {m.is_owner ? '👑 Ketua' : 'Anggota'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kode Undangan Party */}
            {partyData.members.length < 2 && partyData.is_owner && (
              <div className="p-2.5 bg-indigo-950/40 rounded border border-indigo-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-indigo-200">Undang Pasangan / Teman:</span>
                  <button
                    disabled={loading}
                    onClick={handleGenerateInvite}
                    className="text-[11px] bg-indigo-600 hover:bg-indigo-500 px-2 py-0.5 rounded text-white font-bold"
                  >
                    Buat Kode
                  </button>
                </div>

                {inviteCode && (
                  <div className="mt-1 text-xs bg-black/60 p-2 rounded border border-white/10">
                    <div>Kode: <span className="text-yellow-300 font-bold tracking-widest">{inviteCode}</span></div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      Bagikan link: <code className="text-emerald-300">{typeof window !== 'undefined' ? `${window.location.origin}/join/${inviteCode}` : `/join/${inviteCode}`}</code>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tombol Akses Rumah Bersama & Keluar/Bubar */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              {partyData.shared_house_id && (
                <button
                  onClick={() => {
                    sfx.playClick();
                    onOpenHouseEditor(partyData.shared_house_id!);
                  }}
                  className="w-full text-xs bg-emerald-700 hover:bg-emerald-600 py-2 rounded text-white font-bold transition-colors flex items-center justify-center gap-1 shadow"
                >
                  🏡 Masuk & Dekorasi Rumah Bersama
                </button>
              )}

              <button
                disabled={loading}
                onClick={handleLeaveOrDissolve}
                className="w-full text-[11px] bg-red-950/60 hover:bg-red-800/80 border border-red-800/50 py-1.5 rounded text-red-200 font-bold transition-colors"
              >
                {partyData.is_owner ? '💥 Bubarkan Party' : '🚪 Keluar dari Party'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
