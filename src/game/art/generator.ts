// ============================================================
// Generator Sprite dari Teks & Canvas
// ============================================================

import type { KAPLAYCtx } from 'kaplay';

/**
 * Membuat sprite statis dari representasi string grid.
 */
export function makeSprite(
  k: KAPLAYCtx,
  name: string,
  rows: string[],
  palette: Record<string, string>
) {
  if (typeof document === 'undefined') return;
  const c = document.createElement('canvas');
  c.width = rows[0].length;
  c.height = rows.length;
  const ctx = c.getContext('2d')!;

  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const color = palette[ch];
      if (ch !== '.' && color && color !== 'transparent') {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    });
  });

  k.loadSprite(name, c.toDataURL());
}

export interface AnimFrameConfig {
  frames: string[][]; // Array of string rows (tiap frame punya ukuran sama)
  palette: Record<string, string>;
  anims: Record<string, { from: number; to: number; loop?: boolean; speed?: number }>;
}

/**
 * Membuat animated sprite dengan menyusun frame-frame secara horizontal di canvas.
 */
export function makeAnimatedSprite(
  k: KAPLAYCtx,
  name: string,
  config: AnimFrameConfig
) {
  if (typeof document === 'undefined') return;
  const { frames, palette, anims } = config;
  const frameWidth = frames[0][0].length;
  const frameHeight = frames[0].length;
  const totalFrames = frames.length;

  const c = document.createElement('canvas');
  c.width = frameWidth * totalFrames;
  c.height = frameHeight;
  const ctx = c.getContext('2d')!;

  frames.forEach((frameRows, frameIdx) => {
    const offsetX = frameIdx * frameWidth;
    frameRows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        const color = palette[ch];
        if (ch !== '.' && color && color !== 'transparent') {
          ctx.fillStyle = color;
          ctx.fillRect(offsetX + x, y, 1, 1);
        }
      });
    });
  });

  k.loadSprite(name, c.toDataURL(), {
    sliceX: totalFrames,
    sliceY: 1,
    anims,
  });
}
