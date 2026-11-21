// ============================================================
// Sprite Generator Karakter Pemain (Gender, Model Rambut, Model Pakaian)
// ============================================================

import type { KAPLAYCtx } from 'kaplay';
import { makeAnimatedSprite } from '../generator';
import { DEFAULT_PALETTE } from '../palette';

export interface PlayerLook {
  gender?: 'male' | 'female'; // 'male' (Nyong) atau 'female' (Rika)
  hairStyle?: 'short' | 'spiky' | 'long' | 'hijab' | 'bun';
  hair?: string;
  outfit?: 'casual' | 'batik' | 'kebaya' | 'jacket';
  skin?: string;
  shirt?: string;
}

/**
 * Helper untuk menyusun grid frame 16x16 secara modular berdasarkan gender & pilihan style
 */
export function buildPlayerFrame(
  dir: 'down' | 'up' | 'side',
  step: 0 | 1 | 2,
  look?: PlayerLook
): string[] {
  const gender = look?.gender || 'male';
  const hairStyle = look?.hairStyle || (gender === 'female' ? 'long' : 'short');
  const outfit = look?.outfit || (gender === 'female' ? 'kebaya' : 'casual');

  // Matrix baris 16x16
  const rows: string[] = [];

  // Baris 0 - 5: Bagian Kepala & Rambut
  if (dir === 'down') {
    if (hairStyle === 'hijab') {
      rows.push('.....HHHHHH.....');
      rows.push('....HHHHHHHH....');
      rows.push('....HHSSSSH.....');
      rows.push('....HSSSESSH....');
      rows.push('....HSSSSSSH....');
      rows.push('....HHHHHHHH....');
    } else if (hairStyle === 'long') {
      rows.push('.....HHHHHH.....');
      rows.push('....HHHHHHHH....');
      rows.push('....HHSSSSH.....');
      rows.push('....HSSSESSH....');
      rows.push('...HHSSSSSSHH...');
      rows.push('...HH.SSSS.HH...');
    } else if (hairStyle === 'bun') {
      rows.push('......HHHH......');
      rows.push('....HHHHHHHH....');
      rows.push('....HHSSSSH.....');
      rows.push('....HSSSESSH....');
      rows.push('....SSSSSSSH....');
      rows.push('.....SSSSSS.....');
    } else if (hairStyle === 'spiky') {
      rows.push('...H.H.HH.H.H...');
      rows.push('....HHHHHHHH....');
      rows.push('....HHSSSSH.....');
      rows.push('....HSSSESSH....');
      rows.push('....SSSSSSSH....');
      rows.push('.....SSSSSS.....');
    } else {
      // Short default
      rows.push('.....HHHHHH.....');
      rows.push('....HHHHHHHH....');
      rows.push('....HHSSSSH.....');
      rows.push('....HSSSESSH....');
      rows.push('....SSSSSSSH....');
      rows.push('.....SSSSSS.....');
    }
  } else if (dir === 'up') {
    if (hairStyle === 'hijab') {
      rows.push('.....HHHHHH.....');
      rows.push('....HHHHHHHH....');
      rows.push('....HHHHHHHH....');
      rows.push('....HHHHHHHH....');
      rows.push('....HHHHHHHH....');
      rows.push('....HHHHHHHH....');
    } else if (hairStyle === 'long') {
      rows.push('.....HHHHHH.....');
      rows.push('....HHHHHHHH....');
      rows.push('....HHHHHHHH....');
      rows.push('...HHHHHHHHHH...');
      rows.push('...HHHHHHHHHH...');
      rows.push('....HHHHHHHH....');
    } else if (hairStyle === 'bun') {
      rows.push('......HHHH......');
      rows.push('....HHHHHHHH....');
      rows.push('....HHHHHHHH....');
      rows.push('....HHHHHHHH....');
      rows.push('....HHHHHHHH....');
      rows.push('.....SSSSSS.....');
    } else {
      rows.push('.....HHHHHH.....');
      rows.push('....HHHHHHHH....');
      rows.push('....HHHHHHHH....');
      rows.push('....HHHHHHHH....');
      rows.push('....HHHHHHHH....');
      rows.push('.....SSSSSS.....');
    }
  } else {
    // Side view
    if (hairStyle === 'hijab') {
      rows.push('.....HHHHH......');
      rows.push('....HHHHHHH.....');
      rows.push('....HHSSSS......');
      rows.push('....HSSSE.......');
      rows.push('....HSSSH.......');
      rows.push('....HHHHH.......');
    } else if (hairStyle === 'long') {
      rows.push('.....HHHHH......');
      rows.push('....HHHHHHH.....');
      rows.push('....HHSSSS......');
      rows.push('....HSSSE.......');
      rows.push('...HHSSSSS......');
      rows.push('...HH.SSSS......');
    } else {
      rows.push('.....HHHHH......');
      rows.push('....HHHHHHH.....');
      rows.push('....HHSSSS......');
      rows.push('....HSSSE.......');
      rows.push('....SSSSSS......');
      rows.push('.....SSSS.......');
    }
  }

  // Baris 6 - 10: Badan / Baju / Kebaya / Batik
  if (dir === 'side') {
    if (outfit === 'kebaya') {
      rows.push('....RCRCR.......');
      rows.push('...CCCCCCC......');
      rows.push('...CSCCCCS......');
      rows.push('...CCCCCCC......');
      rows.push('....YYYYY.......');
    } else if (outfit === 'batik') {
      rows.push('....dYdYd.......');
      rows.push('...dYdYdYd......');
      rows.push('...dYdYdYd......');
      rows.push('...dYdYdYd......');
      rows.push('....dYdYd.......');
    } else {
      rows.push('....CCCCC.......');
      rows.push('...CCCCCCC......');
      rows.push('...CCCCCCC......');
      rows.push('...CCCCCCC......');
      rows.push('....CCCCC.......');
    }
  } else {
    // Front / Back
    if (outfit === 'kebaya') {
      rows.push('....RRRCRRR.....');
      rows.push('...CCCCCCCCCC...');
      rows.push('...CSCCCCCCSC...');
      rows.push('...CCCCCCCCCC...');
      rows.push('....YYYYYYYY....'); // Jarik batik bawah
    } else if (outfit === 'batik') {
      rows.push('....dYdYdYd.....');
      rows.push('...dYdYdYdYd....');
      rows.push('...dYSdYdYSd....');
      rows.push('...dYdYdYdYd....');
      rows.push('....dYdYdYd.....');
    } else {
      rows.push('....CCCCCCC.....');
      rows.push('...CCCCCCCCC....');
      rows.push('...CSCCCCCSS....');
      rows.push('...CCCCCCCCC....');
      rows.push('....CCCCCCC.....');
    }
  }

  // Baris 11 - 15: Kaki / Celana / Animasi Langkah
  if (dir === 'side') {
    if (step === 0) {
      rows.push('....PPPPP.......');
      rows.push('....PP.PP.......');
      rows.push('....PP.PP.......');
      rows.push('...EEE.EEE......');
      rows.push('................');
    } else if (step === 1) {
      rows.push('....PPPPP.......');
      rows.push('...PPP..PP......');
      rows.push('..EEEE...EE.....');
      rows.push('................');
      rows.push('................');
    } else {
      rows.push('....PPPPP.......');
      rows.push('....PP..PPP.....');
      rows.push('....EE...EEEE...');
      rows.push('................');
      rows.push('................');
    }
  } else {
    // Down & Up
    if (step === 0) {
      rows.push('....PPPPPPP.....');
      rows.push('....PP...PP.....');
      rows.push('....PP...PP.....');
      rows.push('...EEE...EEE....');
      rows.push('................');
    } else if (step === 1) {
      rows.push('....PPPPPPP.....');
      rows.push('....PPP..PP.....');
      rows.push('...PPPP.........');
      rows.push('...EEEE..EEE....');
      rows.push('................');
    } else {
      rows.push('....PPPPPPP.....');
      rows.push('....PP..PPP.....');
      rows.push('.........PPPP...');
      rows.push('...EEE...EEEE...');
      rows.push('................');
    }
  }

  return rows;
}

export function loadPlayerSprite(k: KAPLAYCtx, look?: PlayerLook) {
  const palette: Record<string, string> = {
    ...DEFAULT_PALETTE,
    ...(look?.hair ? { 'H': look.hair } : {}),
    ...(look?.skin ? { 'S': look.skin } : {}),
    ...(look?.shirt ? { 'C': look.shirt } : {}),
  };

  const frames = [
    buildPlayerFrame('down', 0, look), // 0: idle down
    buildPlayerFrame('down', 1, look), // 1: walk down 1
    buildPlayerFrame('down', 2, look), // 2: walk down 2
    buildPlayerFrame('up', 0, look),   // 3: idle up
    buildPlayerFrame('up', 1, look),   // 4: walk up 1
    buildPlayerFrame('up', 2, look),   // 5: walk up 2
    buildPlayerFrame('side', 0, look), // 6: idle side
    buildPlayerFrame('side', 1, look), // 7: walk side 1
    buildPlayerFrame('side', 2, look), // 8: walk side 2
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
