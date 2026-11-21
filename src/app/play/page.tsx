'use client';

import { useEffect, useState } from 'react';
import { signInAnonymously, getSession, getPlayer } from '@/lib/rpc';
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
        // Cek sesi yang sudah ada atau buat akun tamu
        let session = await getSession();
        if (!session) {
          await signInAnonymously();
          session = await getSession();
        }

        setAuthReady(true);

        // Cek apakah sudah punya karakter
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
        <p className="animate-pulse">Menyambungkan...</p>
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

// ---- Layar Buat Karakter ----
function CreateCharacterScreen() {
  const [name, setName] = useState('');
  const [hairColor, setHairColor] = useState('#4a2800');
  const [skinColor, setSkinColor] = useState('#e8b88a');
  const [shirtColor, setShirtColor] = useState('#2d6b2d');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setError('');
    if (name.length < 3 || name.length > 16) {
      setError('Nama harus 3-16 karakter');
      return;
    }

    setCreating(true);
    try {
      const { createCharacter } = await import('@/lib/rpc');
      await createCharacter(name, { hair: hairColor, skin: skinColor, shirt: shirtColor });
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('NAME_TAKEN')) setError('Nama sudah dipakai');
      else if (msg.includes('NAME_BANNED')) setError('Nama tidak diperbolehkan');
      else setError(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141828] flex items-center justify-center text-white font-mono">
      <div className="bg-gray-800 p-8 rounded border-2 border-gray-600 w-80">
        <h2 className="text-xl mb-6 text-center text-yellow-300">Buat Karakter</h2>

        <label className="block mb-1 text-sm text-gray-400">Nama (3-16 karakter)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={16}
          className="w-full bg-gray-700 border border-gray-500 px-3 py-2 rounded-sm mb-4 text-white"
          placeholder="Masukkan nama..."
        />

        <label className="block mb-1 text-sm text-gray-400">Rambut</label>
        <input type="color" value={hairColor} onChange={(e) => setHairColor(e.target.value)}
          className="w-full h-8 mb-3 cursor-pointer" />

        <label className="block mb-1 text-sm text-gray-400">Kulit</label>
        <input type="color" value={skinColor} onChange={(e) => setSkinColor(e.target.value)}
          className="w-full h-8 mb-3 cursor-pointer" />

        <label className="block mb-1 text-sm text-gray-400">Baju</label>
        <input type="color" value={shirtColor} onChange={(e) => setShirtColor(e.target.value)}
          className="w-full h-8 mb-4 cursor-pointer" />

        {/* Preview karakter (placeholder - akan diganti sprite di Phase 1) */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-16 border border-gray-500 flex flex-col items-center justify-center"
               style={{ imageRendering: 'pixelated' }}>
            <div className="w-6 h-3 rounded-t" style={{ backgroundColor: hairColor }} />
            <div className="w-4 h-3" style={{ backgroundColor: skinColor }} />
            <div className="w-6 h-5" style={{ backgroundColor: shirtColor }} />
            <div className="w-6 h-3 bg-gray-600" />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={creating || name.length < 3}
          className="w-full bg-green-700 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed py-2 rounded-sm border border-green-500 transition-colors"
        >
          {creating ? 'Membuat...' : '✦ Mulai Petualangan'}
        </button>
      </div>
    </div>
  );
}
