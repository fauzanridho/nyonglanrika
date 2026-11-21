'use client';

import { useEffect, useState } from 'react';
import { getSession, getPlayer, linkWithGoogle } from '@/lib/rpc';
import { createClient } from '@/lib/supabase/client';
import { useGameStore } from '@/store/gameStore';
import GameCanvas from '@/game/engine/GameCanvas';
import PlayerPreview from '@/game/ui/PlayerPreview';

export default function PlayPage() {
  const [session, setSession] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  const [hasCharacter, setHasCharacter] = useState<boolean | null>(null);
  const setPlayer = useGameStore((s) => s.setPlayer);
  const setIsLoading = useGameStore((s) => s.setIsLoading);

  const supabase = createClient();

  useEffect(() => {
    async function checkAuthAndCharacter() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (currentSession) {
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
        } else {
          setHasCharacter(false);
        }
      } catch (err) {
        console.error('Init error:', err);
        setHasCharacter(false);
      } finally {
        setAuthReady(true);
        setIsLoading(false);
      }
    }

    checkAuthAndCharacter();

    // Dengarkan perubahan auth state (misal setelah redirect Google OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
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
      } else {
        setHasCharacter(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setPlayer, setIsLoading]);

  if (!authReady || hasCharacter === null) {
    return (
      <div className="min-h-screen bg-[#141828] flex items-center justify-center text-white font-mono">
        <p className="animate-pulse">Menghubungkan ke Purwokerto...</p>
      </div>
    );
  }

  // 1. Jika belum login Google: Tampilkan Layar Login Wajib
  if (!session) {
    return <GoogleLoginGateScreen />;
  }

  // 2. Jika sudah login Google tapi belum buat karakter: Tampilkan Form Buat Karakter dengan Live Pixel Preview
  if (!hasCharacter) {
    return <CreateCharacterScreen userEmail={session.user?.email} />;
  }

  // 3. Masuk ke Game Dunia Nyonglanrika
  return (
    <div className="min-h-screen bg-[#141828] flex items-center justify-center">
      <GameCanvas />
    </div>
  );
}

// ============================================================
// Layar Login Google Wajib (Anonymous dimatikan agar save data aman)
// ============================================================
function GoogleLoginGateScreen() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await linkWithGoogle();
    } catch (e: any) {
      alert(e.message || 'Gagal login Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141828] flex items-center justify-center text-white font-mono p-4">
      <div className="bg-gray-800/90 p-8 rounded-xl border-2 border-gray-600 w-full max-w-sm text-center shadow-2xl backdrop-blur-md">
        <div className="text-4xl mb-3">🏡</div>
        <h1 className="text-2xl font-bold text-yellow-300 mb-1">Nyonglanrika</h1>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          Masuk dengan Akun Google untuk memulai petualangan. Karakter, rumah, koin, dan kebun Anda tersimpan permanen di cloud.
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
        </button>

        <p className="mt-6 text-[10px] text-gray-500">
          Akun terlindungi dengan enkripsi Supabase Auth
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Layar Buat Karakter dengan Live Pixel Art Preview
// ============================================================
function CreateCharacterScreen({ userEmail }: { userEmail?: string }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [hairStyle, setHairStyle] = useState<'short' | 'spiky' | 'long' | 'hijab' | 'bun'>('short');
  const [outfit, setOutfit] = useState<'casual' | 'kebaya' | 'batik'>('casual');
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
    if (name.trim().length < 3 || name.trim().length > 16) {
      setError('Nama karakter harus 3-16 karakter');
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
      <div className="bg-gray-800/95 p-6 rounded-xl border-2 border-gray-600 w-full max-w-xl shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-yellow-300">Buat Karakter Baru</h2>
            <p className="text-[11px] text-gray-400">
              Masuk sebagai: <span className="text-emerald-300 font-bold">{userEmail}</span>
            </p>
          </div>
        </div>

        {/* Layout 2 Kolom: Form Kiri & Live Pixel Preview Kanan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          {/* Kolom Form (2/3) */}
          <div className="md:col-span-2 space-y-3">
            <div>
              <label className="block text-xs text-gray-300 mb-1">Nama Karakter (3-16 karakter):</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={16}
                className="w-full bg-gray-700 border border-gray-500 px-3 py-1.5 rounded text-white text-sm focus:outline-none focus:border-yellow-400"
                placeholder="Contoh: Raden..."
              />
            </div>

            {/* Pilihan Gender */}
            <div>
              <label className="block text-xs text-gray-300 mb-1">Karakter / Gender:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleGenderSelect('male')}
                  className={`py-1.5 text-xs rounded border transition-colors flex items-center justify-center gap-1.5 ${
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
                  className={`py-1.5 text-xs rounded border transition-colors flex items-center justify-center gap-1.5 ${
                    gender === 'female'
                      ? 'bg-pink-700 border-pink-400 text-white font-bold'
                      : 'bg-gray-700 border-gray-600 text-gray-400'
                  }`}
                >
                  <span>👧</span>
                  <span>Rika (Perempuan)</span>
                </button>
              </div>
            </div>

            {/* Model Rambut & Pakaian */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-gray-300 mb-1">Gaya Rambut:</label>
                <select
                  value={hairStyle}
                  onChange={(e) => setHairStyle(e.target.value as any)}
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
                <label className="block text-[11px] text-gray-300 mb-1">Model Pakaian:</label>
                <select
                  value={outfit}
                  onChange={(e) => setOutfit(e.target.value as any)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="casual">Kemeja Santai</option>
                  <option value="kebaya">Kebaya Banyumasan</option>
                  <option value="batik">Batik Lurik</option>
                </select>
              </div>
            </div>

            {/* Warna Palet */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Rambut</label>
                <input
                  type="color"
                  value={hairColor}
                  onChange={(e) => setHairColor(e.target.value)}
                  className="w-full h-7 rounded cursor-pointer bg-transparent"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Kulit</label>
                <input
                  type="color"
                  value={skinColor}
                  onChange={(e) => setSkinColor(e.target.value)}
                  className="w-full h-7 rounded cursor-pointer bg-transparent"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Pakaian</label>
                <input
                  type="color"
                  value={shirtColor}
                  onChange={(e) => setShirtColor(e.target.value)}
                  className="w-full h-7 rounded cursor-pointer bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Kolom Preview Pixel Art (1/3) */}
          <div className="flex flex-col items-center justify-center border-l border-white/10 pl-2">
            <PlayerPreview
              look={{
                gender,
                hairStyle,
                outfit,
                hair: hairColor,
                skin: skinColor,
                shirt: shirtColor,
              }}
              scale={5}
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-xs mb-3 text-center">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={creating || name.trim().length < 3}
          className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 py-2.5 rounded font-bold transition-colors shadow"
        >
          {creating ? 'Mempersiapkan Karakter...' : '✦ Mulai Petualangan'}
        </button>
      </div>
    </div>
  );
}
