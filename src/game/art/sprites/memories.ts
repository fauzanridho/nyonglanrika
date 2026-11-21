// ============================================================
// Sprite Objek Kenangan Tersembunyi (16x16)
// ============================================================

import type { KAPLAYCtx } from 'kaplay';
import { makeSprite } from '../generator';
import { DEFAULT_PALETTE } from '../palette';

export function loadMemorySprites(k: KAPLAYCtx) {
  // Botol Surat di Tepi Air (hint_bottle_01)
  makeSprite(
    k,
    'memory_bottle',
    [
      '................',
      '................',
      '................',
      '................',
      '.......dd.......',
      '......dYYd......',
      '......dYYd......',
      '.....dYYYYd.....',
      '.....dYYYYd.....',
      '.....dYYYYd.....',
      '.....dYYYYd.....',
      '......dddd......',
      '................',
      '................',
      '................',
      '................',
    ],
    DEFAULT_PALETTE
  );

  // Monumen Batu / Lentera Kenangan Kuno
  makeSprite(
    k,
    'memory_stone',
    [
      '......BBBB......',
      '.....BBBBBB.....',
      '....BBBBBBBB....',
      '....BBYYYYBB....',
      '....BBYYYYBB....',
      '....BBBBBBBB....',
      '.....BBBBBB.....',
      '.....BBBBBB.....',
      '....BBBBBBBB....',
      '...BBBBBBBBBB...',
      '..BBBBBBBBBBBB..',
      '.BBBBBBBBBBBBBB.',
      'BBBBBBBBBBBBBBBB',
      'BBBBBBBBBBBBBBBB',
      '................',
      '................',
    ],
    DEFAULT_PALETTE
  );
}
