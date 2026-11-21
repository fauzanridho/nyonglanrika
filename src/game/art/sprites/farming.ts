// ============================================================
// Sprite Tanaman Kebun & Dapur (16x16)
// ============================================================

import type { KAPLAYCtx } from 'kaplay';
import { makeSprite } from '../generator';
import { DEFAULT_PALETTE } from '../palette';

export function loadFarmingSprites(k: KAPLAYCtx) {
  // Tanah Petak Kebun Kosong / Digali
  makeSprite(
    k,
    'plot_empty',
    [
      'dddddddddddddddd',
      'dDDDDDDDDDDDDDDd',
      'dDDDDDDDDDDDDDDd',
      'dDDDDDDDDDDDDDDd',
      'dDDDDDDDDDDDDDDd',
      'dDDDDDDDDDDDDDDd',
      'dDDDDDDDDDDDDDDd',
      'dDDDDDDDDDDDDDDd',
      'dDDDDDDDDDDDDDDd',
      'dDDDDDDDDDDDDDDd',
      'dDDDDDDDDDDDDDDd',
      'dDDDDDDDDDDDDDDd',
      'dDDDDDDDDDDDDDDd',
      'dDDDDDDDDDDDDDDd',
      'dDDDDDDDDDDDDDDd',
      'dddddddddddddddd',
    ],
    DEFAULT_PALETTE
  );

  // Tanah Basah Disiram
  makeSprite(
    k,
    'plot_watered',
    [
      'dddddddddddddddd',
      'dddddddddddddddd',
      'dddddddddddddddd',
      'dddddddddddddddd',
      'dddddddddddddddd',
      'dddddddddddddddd',
      'dddddddddddddddd',
      'dddddddddddddddd',
      'dddddddddddddddd',
      'dddddddddddddddd',
      'dddddddddddddddd',
      'dddddddddddddddd',
      'dddddddddddddddd',
      'dddddddddddddddd',
      'dddddddddddddddd',
      'dddddddddddddddd',
    ],
    DEFAULT_PALETTE
  );

  // Tahap Tunas Kecil (Sprout)
  makeSprite(
    k,
    'crop_sprout',
    [
      '................',
      '................',
      '................',
      '................',
      '................',
      '.......tt.......',
      '......tTTt......',
      '......tTTt......',
      '.......dd.......',
      '.......dd.......',
      '......dddd......',
      '.....dddddd.....',
      '................',
      '................',
      '................',
      '................',
    ],
    DEFAULT_PALETTE
  );

  // Tahap Tumbuh Sedang (Growing)
  makeSprite(
    k,
    'crop_growing',
    [
      '................',
      '................',
      '.....tt..tt.....',
      '....tTTttTTt....',
      '....tTTTTTTt....',
      '.....tTTTTt.....',
      '......tTTt......',
      '.......dd.......',
      '.......dd.......',
      '.......dd.......',
      '......dddd......',
      '.....dddddd.....',
      '................',
      '................',
      '................',
      '................',
    ],
    DEFAULT_PALETTE
  );

  // Tahap Siap Panen (Mature / Buah Merah)
  makeSprite(
    k,
    'crop_mature',
    [
      '................',
      '....RR....RR....',
      '...RRRR..RRRR...',
      '..tRRRRttRRRRt..',
      '..tTTTTTTTTTTt..',
      '...tTTTTTTTTt...',
      '....tTTTTTTt....',
      '.....tTTTTt.....',
      '......tTTt......',
      '.......dd.......',
      '.......dd.......',
      '......dddd......',
      '.....dddddd.....',
      '................',
      '................',
      '................',
    ],
    DEFAULT_PALETTE
  );

  // Kompor Masak Dapur Tradisional
  makeSprite(
    k,
    'stove_kitchen',
    [
      '..RRRRRRRRRRRR..',
      '.RRRRRRRRRRRRRR.',
      'RR..bb....bb..RR',
      'RR.bLLb..bLLb.RR',
      'RR.bLLb..bLLb.RR',
      'RR..bb....bb..RR',
      'RRRRRRRRRRRRRRRR',
      'RR..rrrrrrrr..RR',
      'RR.rLLLLLLLLr.RR',
      'RR.rLLYYYYLLr.RR',
      'RR.rLLLLLLLLr.RR',
      'RR..rrrrrrrr..RR',
      'RRRRRRRRRRRRRRRR',
      '.RRRRRRRRRRRRRR.',
      '..RRRRRRRRRRRR..',
      '................',
    ],
    DEFAULT_PALETTE
  );
}
