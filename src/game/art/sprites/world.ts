// ============================================================
// Sprite World & Lingkungan (16x16 tiles)
// ============================================================

import type { KAPLAYCtx } from 'kaplay';
import { makeSprite } from '../generator';
import { DEFAULT_PALETTE } from '../palette';

export function loadWorldSprites(k: KAPLAYCtx) {
  // Tile Pohon Rindang (T) 16x16
  makeSprite(
    k,
    'tree',
    [
      '.....tttttt.....',
      '...ttTTTTTTtt...',
      '..tTTTTTTTTTTt..',
      '.tTTTTTTTTTTTTt.',
      '.tTTTTTTTTTTTTt.',
      'tTTTTTTTTTTTTTTt',
      'tTTTTTTTTTTTTTTt',
      'tTTTTTTTTTTTTTTt',
      '.tTTTTTTTTTTTTt.',
      '..tTTTT..TTTTt..',
      '....tt.dd.tt....',
      '.......dd.......',
      '.......dd.......',
      '.......dd.......',
      '......dddd......',
      '.....dddddd.....',
    ],
    DEFAULT_PALETTE
  );

  // Bangku Taman (b) 16x16
  makeSprite(
    k,
    'bench',
    [
      '................',
      '................',
      '................',
      '..YYYYYYYYYYYY..',
      '..YYYYYYYYYYYY..',
      '..yy.yy..yy.yy..',
      '..YYYYYYYYYYYY..',
      '..YYYYYYYYYYYY..',
      '..d..........d..',
      '..d..........d..',
      '..d..........d..',
      '..d..........d..',
      '................',
      '................',
      '................',
      '................',
    ],
    DEFAULT_PALETTE
  );

  // Lentera Jalan (L) 16x16
  makeSprite(
    k,
    'lamp',
    [
      '......bbbb......',
      '.....bLLLLb.....',
      '.....bLLLLb.....',
      '.....bLLLLb.....',
      '......bbbb......',
      '.......bb.......',
      '.......bb.......',
      '.......bb.......',
      '.......bb.......',
      '.......bb.......',
      '.......bb.......',
      '.......bb.......',
      '.......bb.......',
      '......bbbb......',
      '.....bbbbbb.....',
      '....bbbbbbbb....',
    ],
    DEFAULT_PALETTE
  );

  // Air Sungai (W / R) 16x16
  makeSprite(
    k,
    'water',
    [
      'wwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwww',
      'wwWWWWwwwwWWWWww',
      'wwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwww',
      'wwwwWWWWwwwwWWWW',
      'wwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwww',
      'wwWWWWwwwwWWWWww',
      'wwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwww',
      'wwwwWWWWwwwwWWWW',
      'wwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwww',
    ],
    DEFAULT_PALETTE
  );

  // Rumput Alun-alun / Dasar (16x16)
  makeSprite(
    k,
    'grass',
    [
      'GGGGGGGGGGGGGGGG',
      'GGGGGGgGGGGGGGGG',
      'GGGGGGGGGGGGGGGG',
      'GGGGGGGGGGgGGGGG',
      'GGgGGGGGGGGGGGGG',
      'GGGGGGGGGGGGgGGG',
      'GGGGGGGGGGGGGGGG',
      'GGGGgGGGGGGGGGGG',
      'GGGGGGGGGGGGGGGG',
      'GGGGGGGGgGGGGGGG',
      'GGGGGGGGGGGGGGGG',
      'GGgGGGGGGGGGGGGG',
      'GGGGGGGGGGGGgGGG',
      'GGGGGGGGGGGGGGGG',
      'GGGGgGGGGGGGGGGG',
      'GGGGGGGGGGGGGGGG',
    ],
    DEFAULT_PALETTE
  );

  // Pinus Hutan Baturraden (P) 16x16
  makeSprite(
    k,
    'pine',
    [
      '.......FF.......',
      '......FFFF......',
      '.....FFFFFF.....',
      '....FFFFFFFF....',
      '.....FFFFFF.....',
      '....FFFFFFFF....',
      '...FFFFFFFFFF...',
      '..FFFFFFFFFFFF..',
      '...FFFFFFFFFF...',
      '..FFFFFFFFFFFF..',
      '.FFFFFFFFFFFFFF.',
      '.......dd.......',
      '.......dd.......',
      '.......dd.......',
      '......dddd......',
      '.....dddddd.....',
    ],
    DEFAULT_PALETTE
  );

  // Paving / Batu Jalan (B) 16x16
  makeSprite(
    k,
    'paving',
    [
      'BBBBBBBBBBBBBBBB',
      'B..............B',
      'B.bbbbbbbbbbbb.B',
      'B.bbbbbbbbbbbb.B',
      'B..............B',
      'BBBBBBBBBBBBBBBB',
      'B..............B',
      'B.bbbbbbbbbbbb.B',
      'B.bbbbbbbbbbbb.B',
      'B..............B',
      'BBBBBBBBBBBBBBBB',
      'B..............B',
      'B.bbbbbbbbbbbb.B',
      'B.bbbbbbbbbbbb.B',
      'B..............B',
      'BBBBBBBBBBBBBBBB',
    ],
    DEFAULT_PALETTE
  );
}
