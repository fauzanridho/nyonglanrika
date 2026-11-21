// ============================================================
// Sprite Alat & Ikan (16x16)
// ============================================================

import type { KAPLAYCtx } from 'kaplay';
import { makeSprite } from '../generator';
import { DEFAULT_PALETTE } from '../palette';

export function loadFishingSprites(k: KAPLAYCtx) {
  // Pancing Bambu
  makeSprite(
    k,
    'item_pancing',
    [
      '.............YY.',
      '............YY..',
      '...........YY...',
      '..........YY....',
      '.........YY.....',
      '........YY......',
      '.......YY.......',
      '......YY........',
      '.....YY.........',
      '....YY..........',
      '...YY...........',
      '..YY............',
      '.YY.............',
      'YY..............',
      '................',
      '................',
    ],
    DEFAULT_PALETTE
  );

  // Spot Mancing (Ripples kontras kuning/putih terang di air)
  makeSprite(
    k,
    'fish_spot',
    [
      '....YYYYYYYY....',
      '..YYWWWWWWWWYY..',
      '.YYW........WYY.',
      'YYW..........WYY',
      'YW....YYYY....WY',
      'YW...YWWWWY...WY',
      'YW...YWWWWY...WY',
      'YW....YYYY....WY',
      'YYW..........WYY',
      '.YYW........WYY.',
      '..YYWWWWWWWWYY..',
      '....YYYYYYYY....',
      '................',
      '................',
      '................',
      '................',
    ],
    DEFAULT_PALETTE
  );

  // Ikan Common (Nila / Lele)
  makeSprite(
    k,
    'fish_common',
    [
      '................',
      '......BBBB......',
      '....BBBBBBBB....',
      '..BBBBBBBBBBBB..',
      '..BEBBBBBBBBBBBB',
      'BBBBBBBBBBBBBBBB',
      'BBBBBBBBBBBBBB..',
      '..BBBBBBBBBBBB..',
      '....BBBBBBBB....',
      '......BBBB......',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
    DEFAULT_PALETTE
  );

  // Ikan Rare / Legendary (Ikan Mas / Dewa)
  makeSprite(
    k,
    'fish_rare',
    [
      '................',
      '......YYYY......',
      '....YYYYYYYY....',
      '..YYYYYYYYYYYY..',
      '..YEYYYYYYYYYYYY',
      'YYYYYYYYYYYYYYYY',
      'YYYYYYYYYYYYYY..',
      '..YYYYYYYYYYYY..',
      '....YYYYYYYY....',
      '......YYYY......',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
    DEFAULT_PALETTE
  );
}
