'use client';

import { useEffect, useRef } from 'react';
import { ZONES } from '@/data/zones';
import { NPCS } from '@/data/npcs';
import { useGameStore } from '@/store/gameStore';

export default function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const livePos = useGameStore((s) => s.livePos);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const zone = ZONES[livePos.zone] || ZONES['alun_alun'];
    const grid = zone.grid;
    const rows = grid.length;
    const cols = grid[0]?.length || 48;
    const scale = 2; // 48*2 = 96px, 28*2 = 56px

    canvas.width = cols * scale;
    canvas.height = rows * scale;

    const isUrban = livePos.zone === 'pasar_wage' || livePos.zone === 'stasiun';

    // 1. Gambar tile peta
    for (let y = 0; y < rows; y++) {
      const row = grid[y];
      for (let x = 0; x < cols; x++) {
        const ch = row[x];
        if (ch === 'W' || ch === 'R') {
          ctx.fillStyle = '#3b82f6';
        } else if (ch === 'T' || ch === 'P') {
          ctx.fillStyle = '#164e27';
        } else if (ch === 'S') {
          ctx.fillStyle = '#c2410c';
        } else if (ch === 'B') {
          ctx.fillStyle = '#64748b';
        } else if (ch === 'r') {
          ctx.fillStyle = '#78350f';
        } else if (ch === 'b' || ch === 'L') {
          ctx.fillStyle = '#eab308';
        } else {
          ctx.fillStyle = isUrban ? '#475569' : '#3f7d2b';
        }
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }

    // 2. Gambar portal keluar (kuning terang)
    zone.portals.forEach((p) => {
      ctx.fillStyle = '#fde047';
      ctx.fillRect(p.x * scale - 1, p.y * scale - 1, 4, 4);
    });

    // 3. Gambar spot pancing (biru muda)
    zone.fishSpots?.forEach((f) => {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(f.x * scale, f.y * scale, 3, 3);
    });

    // 4. Gambar NPC (pink/cyan)
    const zoneNpcIds = zone.npcs || [];
    NPCS.filter((n) => zoneNpcIds.includes(n.id) || n.zone === zone.id).forEach((n) => {
      const nx = Math.round(n.x / 16) * scale;
      const ny = Math.round(n.y / 16) * scale;
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(nx - 1, ny - 1, 3, 3);
    });

    // 5. Gambar posisi player (titik putih + outline hijau)
    const px = Math.round(livePos.x / 16) * scale;
    const py = Math.round(livePos.y / 16) * scale;
    ctx.fillStyle = '#000000';
    ctx.fillRect(px - 2, py - 2, 5, 5);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(px - 1, py - 1, 3, 3);
  }, [livePos]);

  const zoneName = ZONES[livePos.zone]?.name || 'Purwokerto';

  return (
    <div className="hidden md:flex flex-col gap-1 absolute bottom-3 left-3 z-20 bg-black/80 backdrop-blur-md p-2 rounded-lg border border-white/15 shadow-2xl pointer-events-none">
      <div className="flex items-center justify-between gap-2 text-[9px] text-gray-300 font-bold">
        <span className="truncate max-w-[90px]">🗺️ {zoneName}</span>
        <span className="text-yellow-300 text-[8px]">■ Portal</span>
      </div>
      <canvas
        ref={canvasRef}
        style={{ imageRendering: 'pixelated' }}
        className="w-[120px] h-[70px] rounded border border-white/10"
      />
      <div className="flex items-center justify-between text-[8px] text-gray-400">
        <span className="text-emerald-400">● Kamu</span>
        <span className="text-pink-400">● NPC</span>
        <span className="text-sky-400">● Ikan</span>
      </div>
    </div>
  );
}
