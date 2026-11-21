'use client';

import { useEffect, useRef } from 'react';
import { buildPlayerFrame, PlayerLook } from '@/game/art/sprites/player';
import { DEFAULT_PALETTE } from '@/game/art/palette';

export interface PlayerPreviewProps {
  look: PlayerLook;
  scale?: number;
}

export default function PlayerPreview({ look, scale = 4 }: PlayerPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ambil frame idle depan 16x16
    const rows = buildPlayerFrame('down', 0, look);
    const palette: Record<string, string> = {
      ...DEFAULT_PALETTE,
      ...(look?.hair ? { H: look.hair } : {}),
      ...(look?.skin ? { S: look.skin } : {}),
      ...(look?.shirt ? { C: look.shirt } : {}),
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        const color = palette[ch];
        if (ch !== '.' && color && color !== 'transparent') {
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      });
    });
  }, [look, scale]);

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-black/40 border border-white/10 rounded-lg shadow-inner">
      <canvas
        ref={canvasRef}
        width={16 * scale}
        height={16 * scale}
        style={{ imageRendering: 'pixelated' }}
        className="drop-shadow-md"
      />
      <span className="text-[10px] text-gray-400 mt-2 font-mono">
        Pratinjau Pixel Art
      </span>
    </div>
  );
}
