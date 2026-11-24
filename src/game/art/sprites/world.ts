// ============================================================
// Sprite World & Lingkungan (16x16 tiles)
// Polished pixel art — setiap tile konsisten 16 karakter per baris
// ============================================================

import type { KAPLAYCtx } from 'kaplay';
import { makeSprite } from '../generator';
import { DEFAULT_PALETTE } from '../palette';

export function loadWorldSprites(k: KAPLAYCtx) {
  // Tile Pohon Rindang (T) 16x16 — dedaunan rimbun dua warna + batang
  makeSprite(
    k,
    'tree',
    [
      '......ttttt.....',
      '....ttTTTTttt...',
      '...tTTtTTtTTt...',
      '..tTTTTTTTTTTt..',
      '.tTTtTTTTTTtTTt.',
      'tTTTTTTTTTTTTTTt',
      'tTTtTTTTTTTTtTTt',
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

  // Bangku Taman (b) 16x16 — kaki kayu gelap, dudukan terang
  makeSprite(
    k,
    'bench',
    [
      '................',
      '................',
      '................',
      '..YYYYYYYYYYyy..',
      '..YyYyYyYyYyYy..',
      '..yy........yy..',
      '..YYYYYYYYYYyy..',
      '..YyYyYyYyYyYy..',
      '..d..........d..',
      '..d..........d..',
      '..d..........d..',
      '..dd........dd..',
      '................',
      '................',
      '................',
      '................',
    ],
    DEFAULT_PALETTE
  );

  // Lentera Jalan (L) 16x16 — cahaya kuning hangat
  makeSprite(
    k,
    'lamp',
    [
      '......LLLL......',
      '.....LLLLLL.....',
      '.....LYLLYL.....',
      '.....LLLLLL.....',
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

  // Air Sungai (W / R) 16x16 — gelombang air dua warna
  makeSprite(
    k,
    'water',
    [
      'wwwwwwwwwwwwwwww',
      'wwWWwwwwWWwwwwww',
      'wWWWWwwWWWWwwwww',
      'wwWWwwwwWWwwwwww',
      'wwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwww',
      'wwwwwWWwwwwWWwww',
      'wwwwWWWWwwWWWWww',
      'wwwwwWWwwwwWWwww',
      'wwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwww',
      'wwWWwwwwWWwwwwww',
      'wWWWWwwWWWWwwwww',
      'wwWWwwwwWWwwwwww',
      'wwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwww',
    ],
    DEFAULT_PALETTE
  );

  // Rumput Alun-alun / Dasar (16x16) — rumput dengan variasi bunga kecil
  makeSprite(
    k,
    'grass',
    [
      'GGGGGGGGGgGGGGGG',
      'GGGgGGGGGGGGGGGG',
      'GGGGGGGGGGGGGGGG',
      'GGGGGGgGGGGGGGGG',
      'GGgGGGGGGGGGGGGG',
      'GGGGGGGGGGGGGGGG',
      'GGGGGGGGGGGGGGGG',
      'GGGGgGGGGgGGGGGG',
      'GGGGGGGGGGGGGGGG',
      'GGGGGGGGGGGGgGGG',
      'GGGGGGGGgGGGGGGG',
      'GGgGGGGGGGGGGGGG',
      'GGGGGGGGGGGGGGGG',
      'GGGGGGgGGGGGGGGG',
      'GGGGgGGGGGGGGGGG',
      'GGGGGGGGGGGGGGGG',
    ],
    DEFAULT_PALETTE
  );

  // Rumput dengan bunga (tile dekoratif untuk alun-alun)
  makeSprite(
    k,
    'grass_flower',
    [
      'GGGGGgGGGGGGGGGG',
      'GGGgGGGGGGGGGGGG',
      'GGGGGGGGfGGGGGGG',
      'GGGGGGgGGGGGGGGG',
      'GGGGGGGGGGGGGgGG',
      'GGGGGGGGGGGGGGGG',
      'GGGGfGGGGGGGGGGG',
      'GGGGGGGGGgGGGGGG',
      'GGGGGGGGGGGGGGGG',
      'GGgGGGGGGGGGfGGG',
      'GGGGGGGGGGGGGGGG',
      'GGGGGGGGGGGGGGGG',
      'GGGGGfGGGGGGGGGG',
      'GGGGGGGgGGGGGGGG',
      'GGGGGGGGGGGGGGGG',
      'GGGgGGGGGGGGGGGG',
    ],
    DEFAULT_PALETTE
  );

  // Pinus Hutan Baturraden (P) 16x16 — berlapis kerucut
  makeSprite(
    k,
    'pine',
    [
      '.......FF.......',
      '......FFFF......',
      '.....FfFFfF.....',
      '....FFFFFFfF....',
      '.....FFFFFF.....',
      '....FfFFFFfF....',
      '...FFFFFFFFfF...',
      '..FFfFFFFFFFFF..',
      '...FFFFFFFFFF...',
      '..FFfFFFFFFFFF..',
      '.FFFFFFfFFFFFFF.',
      '.......dd.......',
      '.......dd.......',
      '.......dd.......',
      '......dddd......',
      '.....dddddd.....',
    ],
    DEFAULT_PALETTE
  );

  // Paving / Batu Jalan (B) 16x16 — pola ubin bervariasi
  makeSprite(
    k,
    'paving',
    [
      'BBBBBbBBBBBBBBBB',
      'B..............B',
      'B.bbbbbb.bbbbb.B',
      'B.bbbbbb.bbbbb.B',
      'B..............B',
      'BBBBBBBBBbBBBBBB',
      'B..............B',
      'B.bbbbb.bbbbbb.B',
      'B.bbbbb.bbbbbb.B',
      'B..............B',
      'BBBBBbBBBBBBBBBB',
      'B..............B',
      'B.bbbbbb.bbbbb.B',
      'B.bbbbbb.bbbbb.B',
      'B..............B',
      'BBBBBBBBBbBBBBBB',
    ],
    DEFAULT_PALETTE
  );

  // Pagar Kayu (fence) 16x16
  makeSprite(
    k,
    'fence',
    [
      '................',
      '..kk..kk..kk..kk',
      '..kk..kk..kk..kk',
      '..kk..kk..kk..kk',
      '.kkkkkkkkkkkkkkkk',
      '..kk..kk..kk..kk',
      '.kkkkkkkkkkkkkkkk',
      '..kk..kk..kk..kk',
      '..kk..kk..kk..kk',
      '..kk..kk..kk..kk',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
    DEFAULT_PALETTE
  );

  // Papan Tanda (sign) 16x16 — papan kayu dengan tiang
  makeSprite(
    k,
    'sign',
    [
      '................',
      '................',
      '..YYYYYYYYYYYY..',
      '..YkkkkkkkkkkY..',
      '..YkkkkkkkkkkY..',
      '..YkkkkkkkkkkY..',
      '..YYYYYYYYYYYY..',
      '.......YY.......',
      '.......YY.......',
      '.......YY.......',
      '.......YY.......',
      '......dddd......',
      '................',
      '................',
      '................',
      '................',
    ],
    DEFAULT_PALETTE
  );

  // Batu Besar / Boulder 16x16
  makeSprite(
    k,
    'boulder',
    [
      '................',
      '................',
      '......BBBB......',
      '....BBBBBBBB....',
      '...BBbBBBBBBBB..',
      '..BBBBBBBBBbBBB.',
      '..BBbBBBBBBBBBB.',
      '..BBBBBBBBBBBBB.',
      '..BBBBBBBbBBBBB.',
      '...BBBBBBBBBBB..',
      '....BBBBBBBB....',
      '......BBBB......',
      '................',
      '................',
      '................',
      '................',
    ],
    DEFAULT_PALETTE
  );

  // Rel Kereta (double rail) 16x16
  makeSprite(
    k,
    'rail',
    [
      'rrrrrrrrrrrrrrrr',
      'r..rr......rr..r',
      'rrrrrrrrrrrrrrrr',
      '................',
      'rrrrrrrrrrrrrrrr',
      'r..rr......rr..r',
      'rrrrrrrrrrrrrrrr',
      '................',
      'rrrrrrrrrrrrrrrr',
      'r..rr......rr..r',
      'rrrrrrrrrrrrrrrr',
      '................',
      'rrrrrrrrrrrrrrrr',
      'r..rr......rr..r',
      'rrrrrrrrrrrrrrrr',
      '................',
    ],
    DEFAULT_PALETTE
  );

  // Stall / Kios Pasar 16x16
  makeSprite(
    k,
    'stall',
    [
      '..RRRRRRRRRRRR..',
      '.RRRRRRRRRRRRRR.',
      'RRRRRRRRRRRRRRRR',
      '..YY........YY..',
      '..YY........YY..',
      '..YYYYYYYYYYYY..',
      '..YYkkkkkkkkYY..',
      '..YYkkkkkkkkYY..',
      '..YYkkkkkkkkYY..',
      '..YYkkkkkkkkYY..',
      '..YYYYYYYYYYYY..',
      '..YY........YY..',
      '..YY........YY..',
      '..YY........YY..',
      '..dd........dd..',
      '..dd........dd..',
    ],
    DEFAULT_PALETTE
  );

  // Tanah / Jalan Setapak 16x16
  makeSprite(
    k,
    'path',
    [
      'DDDDDDDDDDDDDDDD',
      'DDDDDDDdDDDDDDDDD',
      'DDdDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDD',
      'DDDDDDDDDDdDDDDDD',
      'DDDDDDDDDDDDDDDD',
      'DDDDdDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDD',
      'DDDDDDDDDdDDDDDDD',
      'DDDDDDDDDDDDDDDD',
      'DDdDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDdDDDDD',
      'DDDDDDDDDDDDDDDD',
      'DDDDDdDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDD',
    ],
    DEFAULT_PALETTE
  );
}
