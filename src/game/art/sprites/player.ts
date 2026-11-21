// ============================================================
// Sprite Generator Karakter Pemain (Animasi 4-Arah)
// ============================================================

import type { KAPLAYCtx } from 'kaplay';
import { makeAnimatedSprite } from '../generator';
import { DEFAULT_PALETTE } from '../palette';

export interface PlayerLook {
  hair?: string;
  skin?: string;
  shirt?: string;
}

/**
 * Frame data karakter 16x16:
 * - 0: Idle Down
 * - 1: Walk Down 1
 * - 2: Walk Down 2
 * - 3: Idle Up
 * - 4: Walk Up 1
 * - 5: Walk Up 2
 * - 6: Idle Left
 * - 7: Walk Left
 * - 8: Idle Right
 * - 9: Walk Right
 */

const FRAME_IDLE_DOWN = [
  '.....HHHHHH.....',
  '....HHHHHHHH....',
  '....HHSSSSH.....',
  '....HSSSESSH....',
  '....SSSSSSSH....',
  '.....SSSSSS.....',
  '....CCCCCCC.....',
  '...CCCCCCCCC....',
  '...CSCCCCCSS....',
  '...CCCCCCCCC....',
  '....CCCCCCC.....',
  '....PPPPPPP.....',
  '....PP...PP.....',
  '....PP...PP.....',
  '...EEE...EEE....',
  '................',
];

const FRAME_WALK_DOWN_1 = [
  '.....HHHHHH.....',
  '....HHHHHHHH....',
  '....HHSSSSH.....',
  '....HSSSESSH....',
  '....SSSSSSSH....',
  '.....SSSSSS.....',
  '....CCCCCCC.....',
  '...CCCCCCCCC....',
  '...CSCCCCCSS....',
  '...CCCCCCCCC....',
  '....CCCCCCC.....',
  '....PPPPPPP.....',
  '....PPP..PP.....',
  '...PPPP.........',
  '...EEEE..EEE....',
  '................',
];

const FRAME_WALK_DOWN_2 = [
  '.....HHHHHH.....',
  '....HHHHHHHH....',
  '....HHSSSSH.....',
  '....HSSSESSH....',
  '....SSSSSSSH....',
  '.....SSSSSS.....',
  '....CCCCCCC.....',
  '...CCCCCCCCC....',
  '...CSCCCCCSS....',
  '...CCCCCCCCC....',
  '....CCCCCCC.....',
  '....PPPPPPP.....',
  '....PP..PPP.....',
  '.........PPPP...',
  '...EEE...EEEE...',
  '................',
];

const FRAME_IDLE_UP = [
  '.....HHHHHH.....',
  '....HHHHHHHH....',
  '....HHHHHHHH....',
  '....HHHHHHHH....',
  '....HHHHHHHH....',
  '.....SSSSSS.....',
  '....CCCCCCC.....',
  '...CCCCCCCCC....',
  '...CCCCCCCCC....',
  '...CCCCCCCCC....',
  '....CCCCCCC.....',
  '....PPPPPPP.....',
  '....PP...PP.....',
  '....PP...PP.....',
  '...EEE...EEE....',
  '................',
];

const FRAME_WALK_UP_1 = [
  '.....HHHHHH.....',
  '....HHHHHHHH....',
  '....HHHHHHHH....',
  '....HHHHHHHH....',
  '....HHHHHHHH....',
  '.....SSSSSS.....',
  '....CCCCCCC.....',
  '...CCCCCCCCC....',
  '...CCCCCCCCC....',
  '...CCCCCCCCC....',
  '....CCCCCCC.....',
  '....PPPPPPP.....',
  '....PPP..PP.....',
  '...PPPP.........',
  '...EEEE..EEE....',
  '................',
];

const FRAME_WALK_UP_2 = [
  '.....HHHHHH.....',
  '....HHHHHHHH....',
  '....HHHHHHHH....',
  '....HHHHHHHH....',
  '....HHHHHHHH....',
  '.....SSSSSS.....',
  '....CCCCCCC.....',
  '...CCCCCCCCC....',
  '...CCCCCCCCC....',
  '...CCCCCCCCC....',
  '....CCCCCCC.....',
  '....PPPPPPP.....',
  '....PP..PPP.....',
  '.........PPPP...',
  '...EEE...EEEE...',
  '................',
];

const FRAME_IDLE_SIDE = [
  '.....HHHHH......',
  '....HHHHHHH.....',
  '....HHSSSS......',
  '....HSSSE.......',
  '....SSSSSS......',
  '.....SSSS.......',
  '....CCCCC.......',
  '...CCCCCCC......',
  '...CCCCCCC......',
  '...CCCCCCC......',
  '....CCCCC.......',
  '....PPPPP.......',
  '....PP.PP.......',
  '....PP.PP.......',
  '...EEE.EEE......',
  '................',
];

const FRAME_WALK_SIDE_1 = [
  '.....HHHHH......',
  '....HHHHHHH.....',
  '....HHSSSS......',
  '....HSSSE.......',
  '....SSSSSS......',
  '.....SSSS.......',
  '....CCCCC.......',
  '...CCCCCCC......',
  '...CCCCCCC......',
  '...CCCCCCC......',
  '....CCCCC.......',
  '....PPPPP.......',
  '...PPP..PP......',
  '..EEEE...EE.....',
  '................',
  '................',
];

const FRAME_WALK_SIDE_2 = [
  '.....HHHHH......',
  '....HHHHHHH.....',
  '....HHSSSS......',
  '....HSSSE.......',
  '....SSSSSS......',
  '.....SSSS.......',
  '....CCCCC.......',
  '...CCCCCCC......',
  '...CCCCCCC......',
  '...CCCCCCC......',
  '....CCCCC.......',
  '....PPPPP.......',
  '....PP..PPP.....',
  '....EE...EEEE...',
  '................',
  '................',
];

export function loadPlayerSprite(k: KAPLAYCtx, look?: PlayerLook) {
  const palette: Record<string, string> = {
    ...DEFAULT_PALETTE,
    ...(look?.hair ? { 'H': look.hair } : {}),
    ...(look?.skin ? { 'S': look.skin } : {}),
    ...(look?.shirt ? { 'C': look.shirt } : {}),
  };

  const frames = [
    FRAME_IDLE_DOWN,   // 0
    FRAME_WALK_DOWN_1, // 1
    FRAME_WALK_DOWN_2, // 2
    FRAME_IDLE_UP,     // 3
    FRAME_WALK_UP_1,   // 4
    FRAME_WALK_UP_2,   // 5
    FRAME_IDLE_SIDE,   // 6
    FRAME_WALK_SIDE_1, // 7
    FRAME_WALK_SIDE_2, // 8
  ];

  makeAnimatedSprite(k, 'player', {
    frames,
    palette,
    anims: {
      'idle-down': { from: 0, to: 0 },
      'walk-down': { from: 1, to: 2, loop: true, speed: 6 },
      'idle-up': { from: 3, to: 3 },
      'walk-up': { from: 4, to: 5, loop: true, speed: 6 },
      'idle-side': { from: 6, to: 6 },
      'walk-side': { from: 7, to: 8, loop: true, speed: 6 },
    },
  });
}
