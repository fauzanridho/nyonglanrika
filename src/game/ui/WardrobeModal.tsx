'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { updateCharacterLook, linkWithGoogle } from '@/lib/rpc';
import { sfx } from '@/game/audio/sfx';

export interface WardrobeModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function WardrobeModal({ onClose, onSaved }: WardrobeModalProps) {
  const player = useGameStore((s) => s.player);
  const setPlayer = useGameStore((s) => s.setPlayer);

  const initialLook = (player?.look as any) || {};

  const [gender, setGender] = useState<'male' | 'female'>(initialLook.gender || 'male');
  const [hairStyle, setHairStyle] = useState(initialLook.hairStyle || (initialLook.gender === 'female' ? 'long' : 'short'));
  const [outfit, setOutfit] = useState(initialLook.outfit || (initialLook.gender === 'female' ? 'kebaya' : 'casual'));
  const [hairColor, setHairColor] = useState(initialLook.hair || '#4a2800');
  const [skinColor, setSkinColor] = useState(initialLook.skin || '#e8b88a');
  const [shirtColor, setShirtColor] = useState(initialLook.shirt || '#2d6b2d');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setMsg('');
    const newLook = {
      gender,
      hairStyle,
      outfit,
      hair: hairColor,
      skin: skinColor,
      shirt: shirtColor,
    };

    try {
      await updateCharacterLook(newLook);
      sfx.playCoin();
      if (player) {
        setPlayer({
          ...player,
          look: newLook,
        });
      }
      setMsg('Penampilan karakter berhasil diperbarui!');
      onSaved();
      setTimeout(onClose, 1200);
    } catch (e: any) {
      setMsg(e.message || 'Gagal menyimpan penampilan');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkGoogle = async () => {
    try {
      sfx.playClick();
      await linkWithGoogle();
    } catch (e: any) {
      alert(e.message || 'Gagal menyambungkan Google');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm font-mono select-none">
      <div className="bg-[#1b2032] border-2 border-pink-500/70 rounded w-[90%] max-w-lg p-5 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-pink-300 font-bold text-base">👗 Lemari Pakaian & Akun ({player?.name})</span>
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

        {/* Message */}
        {msg && (
          <div className="mb-2 text-xs py-1 px-2 rounded bg-black/40 text-center text-emerald-200 border border-emerald-500/30">
            {msg}
          </div>
        )}

        {/* Opsi Gender */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">Gender / Karakter:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setGender('male');
                setHairStyle('short');
                setOutfit('casual');
              }}
              className={`py-1.5 text-xs rounded border transition-colors ${
                gender === 'male'
                  ? 'bg-sky-700 border-sky-400 text-white font-bold'
                  : 'bg-black/30 border-white/10 text-gray-400'
              }`}
            >
              👦 Nyong (Laki-laki)
            </button>
            <button
              type="button"
              onClick={() => {
                setGender('female');
                setHairStyle('long');
                setOutfit('kebaya');
              }}
              className={`py-1.5 text-xs rounded border transition-colors ${
                gender === 'female'
                  ? 'bg-pink-700 border-pink-400 text-white font-bold'
                  : 'bg-black/30 border-white/10 text-gray-400'
              }`}
            >
              👧 Rika (Perempuan)
            </button>
          </div>
        </div>

        {/* Model Rambut & Model Baju */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Gaya Rambut:</label>
            <select
              value={hairStyle}
              onChange={(e) => setHairStyle(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded px-2 py-1 text-xs text-white"
            >
              <option value="short">Pendek Rapi</option>
              <option value="spiky">Spiky Keren</option>
              <option value="long">Panjang Bergelombang</option>
              <option value="hijab">Hijab Santun</option>
              <option value="bun">Sanggul Tradisional</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Model Pakaian:</label>
            <select
              value={outfit}
              onChange={(e) => setOutfit(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded px-2 py-1 text-xs text-white"
            >
              <option value="casual">Kemeja Santai</option>
              <option value="kebaya">Kebaya Banyumasan</option>
              <option value="batik">Batik Lurik Tradisional</option>
            </select>
          </div>
        </div>

        {/* Pilihan Warna */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">Warna Rambut</label>
            <input
              type="color"
              value={hairColor}
              onChange={(e) => setHairColor(e.target.value)}
              className="w-full h-7 rounded cursor-pointer bg-transparent"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">Warna Kulit</label>
            <input
              type="color"
              value={skinColor}
              onChange={(e) => setSkinColor(e.target.value)}
              className="w-full h-7 rounded cursor-pointer bg-transparent"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">Warna Pakaian</label>
            <input
              type="color"
              value={shirtColor}
              onChange={(e) => setShirtColor(e.target.value)}
              className="w-full h-7 rounded cursor-pointer bg-transparent"
            />
          </div>
        </div>

        {/* Tombol Simpan & Tautkan Google */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <button
            disabled={loading}
            onClick={handleSave}
            className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 py-2 rounded text-white font-bold transition-colors shadow flex items-center justify-center gap-1"
          >
            💾 Simpan Penampilan Baru
          </button>

          <button
            type="button"
            onClick={handleLinkGoogle}
            className="w-full text-xs bg-white hover:bg-gray-100 text-gray-800 py-2 rounded font-bold transition-colors shadow flex items-center justify-center gap-2"
          >
            <span>🌐</span>
            <span>Tautkan ke Akun Google (Karakter Aman)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
