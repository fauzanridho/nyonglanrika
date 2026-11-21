'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { registerWorldScene } from './worldScene';

export default function GameCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const player = useGameStore((s) => s.player);

  useEffect(() => {
    let k: any; // eslint-disable-line @typescript-eslint/no-explicit-any

    (async () => {
      const { default: kaplay } = await import('kaplay');

      k = kaplay({
        canvas: ref.current!,
        width: 480,
        height: 270,
        scale: 2.5,
        crisp: true,
        global: false,
        background: [20, 24, 40],
      });

      // Daftarkan scene world
      registerWorldScene(k);

      // Jalankan scene world dengan data posisi dan look tersimpan pemain
      k.go('world', {
        zoneId: player?.zone || 'alun_alun',
        spawnX: player?.posX || undefined,
        spawnY: player?.posY || undefined,
        look: player?.look || {},
        playerName: player?.name || 'Player',
      });
    })();

    return () => {
      k?.quit();
    };
  }, [player]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Top Bar Info */}
      <div className="absolute top-2 left-2 z-20 flex gap-3 text-xs bg-black/60 px-3 py-1.5 rounded text-white font-mono backdrop-blur-sm border border-white/10">
        <div>👤 <span className="text-yellow-300 font-bold">{player?.name}</span></div>
        <div>💰 <span className="text-amber-400 font-bold">{player?.coins ?? 0}</span> koin</div>
        <div>📍 <span className="text-emerald-400">{player?.zone || 'alun_alun'}</span></div>
      </div>

      <canvas
        ref={ref}
        style={{ imageRendering: 'pixelated' }}
        className="border-2 border-gray-700 shadow-2xl rounded-sm"
      />

      {/* Control Hint Bar */}
      <div className="mt-2 text-xs text-gray-400 font-mono">
        Gunakan tombol <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-200 rounded border border-gray-600">W</kbd> <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-200 rounded border border-gray-600">A</kbd> <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-200 rounded border border-gray-600">S</kbd> <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-200 rounded border border-gray-600">D</kbd> atau panah untuk bergerak
      </div>
    </div>
  );
}
