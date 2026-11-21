'use client';

import { useEffect, useState } from 'react';
import { signInAnonymously, getSession, getPlayer, linkWithGoogle } from '@/lib/rpc';
import { useGameStore } from '@/store/gameStore';
import GameCanvas from '@/game/engine/GameCanvas';

export default function PlayPage() {
  const [authReady, setAuthReady] = useState(false);
  const [hasCharacter, setHasCharacter] = useState<boolean | null>(null);
  const setPlayer = useGameStore((s) => s.setPlayer);
  const setIsLoading = useGameStore((s) => s.setIsLoading);

  useEffect(() => {
    async function init() {
      try {
        let session = await getSession();
        if (!session) {
          await signInAnonymously();
          session = await getSession();
        }

        setAuthReady(true);

        const player = await getPlayer();
        if (player) {
          setPlayer({
            id: player.id,
            name: player.name,
            look: player.look as Record<string, string>,
            coins: player.coins,
            zone: player.zone,
            posX: player.pos_x,
            posY: player.pos_y,
          });
          setHasCharacter(true);
        } else {
          setHasCharacter(false);
        }
      } catch (err) {
        console.error('Init error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [setPlayer, setIsLoading]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#141828] flex items-center justify-center text-white font-mono">
        <p className="animate-pulse">Menyambungkan ke Purwokerto...</p>
      </div>
    );
  }

  if (hasCharacter === false) {
    return <CreateCharacterScreen />;
  }

  return (
    <div className="min-h-screen bg-[#141828] flex items-center justify-center">
      <GameCanvas />
    </div>
  );
}

// ---- Layar Buat Karakter Lengkap (Gender, Rambut, Pakaian, Google OAuth) ----
function CreateCharacterScreen() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [hairStyle, setHairStyle] = useState('short');
  const [outfit, setOutfit] = useState('casual');
  const [hairColor, setHairColor] = useState('#4a2800');
  const [skinColor, setSkinColor] = useState('#e8b88a');
  const [shirtColor, setShirtColor] = useState('#2d6b2d');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const handleGenderSelect = (g: 'male' | 'female') => {
    setGender(g);
    if (g === 'female') {
      setHairStyle('long');
      setOutfit('kebaya');
      setShirtColor('#b83256');
    } else {
      setHairStyle('short');
      setOutfit('casual');
      setShirtColor('#2d6b2d');
    }
  };

  const handleCreate = async () => {
    setError('');
    if (name.length < 3 || name.length > 16) {
      setError('Nama harus 3-16 karakter');
      return;
    }

    setCreating(true);
    try {
      const { createCharacter } = await import('@/lib/rpc');
      await createCharacter(name.trim(), {
        gender,
        hairStyle,
        outfit,
        hair: hairColor,
        skin: skinColor,
        shirt: shirtColor,
      });
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('NAME_TAKEN')) setError('Nama sudah dipakai pemain lain');
      else if (msg.includes('NAME_BANNED')) setError('Nama tidak diperbolehkan');
      else setError(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141828] flex items-center justify-center text-white font-mono p-4">
      <div className="bg-gray-800/95 p-6 rounded-lg border-2 border-gray-600 w-full max-w-md shadow-2xl backdrop-blur-md">
        <h2 className="text-xl mb-1 text-center font-bold text-yellow-300">
          Buat Karakter Baru
        </h2>
        <p className="text-xs text-center text-gray-400 mb-4">
          Tentukan identitas dan gaya petualangmu di Banyumas
        </p>

        {/* Input Nama */}
        <label className="block mb-1 text-xs text-gray-300">Nama Karakter (3-16 karakter)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={16}
          className="w-full bg-gray-700 border border-gray-500 px-3 py-1.5 rounded mb-3 text-white text-sm focus:outline-none focus:border-yellow-400"
          placeholder="Nama panggilanmu..."
        />

        {/* Pilihan Gender */}
        <label className="block mb-1 text-xs text-gray-300">Pilih Karakter / Gender:</label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => handleGenderSelect('male')}
            className={`py-2 text-xs rounded border transition-colors flex items-center justify-center gap-1.5 ${
              gender === 'male'
                ? 'bg-sky-700 border-sky-400 text-white font-bold'
                : 'bg-gray-700 border-gray-600 text-gray-400'
            }`}
          >
            <span>👦</span>
            <span>Nyong (Laki-laki)</span>
          </button>

          <button
            type="button"
            onClick={() => handleGenderSelect('female')}
            className={`py-2 text-xs rounded border transition-colors flex items-center justify-center gap-1.5 ${
              gender === 'female'
                ? 'bg-pink-700 border-pink-400 text-white font-bold'
                : 'bg-gray-700 border-gray-600 text-gray-400'
            }`}
          >
            <span>👧</span>
            <span>Rika (Perempuan)</span>
          </button>
        </div>

        {/* Model Rambut & Model Baju */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="block mb-1 text-[11px] text-gray-300">Model Rambut:</label>
            <select
              value={hairStyle}
              onChange={(e) => setHairStyle(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
            >
              <option value="short">Pendek Rapi</option>
              <option value="spiky">Spiky Keren</option>
              <option value="long">Panjang Bergelombang</option>
              <option value="hijab">Hijab Santun</option>
              <option value="bun">Sanggul Tradisional</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-[11px] text-gray-300">Model Pakaian:</label>
            <select
              value={outfit}
              onChange={(e) => setOutfit(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
            >
              <option value="casual">Kemeja Santai</option>
              <option value="kebaya">Kebaya Banyumasan</option>
              <option value="batik">Batik Lurik</option>
            </select>
          </div>
        </div>

        {/* Warna Palette */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div>
            <label className="block mb-1 text-[10px] text-gray-400">Warna Rambut</label>
            <input
              type="color"
              value={hairColor}
              onChange={(e) => setHairColor(e.target.value)}
              className="w-full h-7 rounded cursor-pointer bg-transparent"
            />
          </div>
          <div>
            <label className="block mb-1 text-[10px] text-gray-400">Warna Kulit</label>
            <input
              type="color"
              value={skinColor}
              onChange={(e) => setSkinColor(e.target.value)}
              className="w-full h-7 rounded cursor-pointer bg-transparent"
            />
          </div>
          <div>
            <label className="block mb-1 text-[10px] text-gray-400">Warna Pakaian</label>
            <input
              type="color"
              value={shirtColor}
              onChange={(e) => setShirtColor(e.target.value)}
              className="w-full h-7 rounded cursor-pointer bg-transparent"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-xs mb-3 text-center">{error}</p>}

        {/* Tombol Mulai */}
        <button
          onClick={handleCreate}
          disabled={creating || name.trim().length < 3}
          className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 py-2.5 rounded font-bold transition-colors shadow mb-3"
        >
          {creating ? 'Mempersiapkan Karakter...' : '✦ Mulai Petualangan'}
        </button>

        {/* Login Google */}
        <div className="pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={linkWithGoogle}
            className="w-full bg-white hover:bg-gray-100 text-gray-800 text-xs py-2 rounded font-bold transition-colors shadow flex items-center justify-center gap-2"
          >
            <span>🌐</span>
            <span>Masuk / Tautkan Akun Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
