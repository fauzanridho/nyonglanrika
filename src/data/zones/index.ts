// ============================================================
// Data: Zones
// ============================================================

export interface Portal {
  /** Target zone ID */
  to: string;
  /** Spawn position in target zone */
  spawnX: number;
  spawnY: number;
  /** Portal position in this zone (tile coords) */
  x: number;
  y: number;
}

export interface ZoneDef {
  id: string;
  name: string;
  /** Grid teks untuk addLevel. T=tree, W=water, b=bench, dll */
  grid: string[];
  spawnX: number;
  spawnY: number;
  portals: Portal[];
  fishSpots?: { id: string; x: number; y: number }[];
  npcs?: string[]; // NPC IDs dari npcs.ts
}

export const ZONES: Record<string, ZoneDef> = {
  alun_alun: {
    id: 'alun_alun',
    name: 'Alun-alun Purwokerto',
    grid: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T............................T',
      'T............................T',
      'T..bb..........bb............T',
      'T............................T',
      'T............L...............T',
      'T............................T',
      'T............................T',
      'T..bb..........bb............T',
      'T............................T',
      'T............................T',
      'T............................T',
      'T............................T',
      'T............L...............T',
      'T............................T',
      'TTTT..TTTTTTTTTTTTTTTTTT..TTTT',
    ],
    spawnX: 15 * 16,
    spawnY: 8 * 16,
    portals: [
      { to: 'pasar_wage', x: 4, y: 15, spawnX: 15 * 16, spawnY: 1 * 16 },
      { to: 'sungai_serayu', x: 25, y: 15, spawnX: 2 * 16, spawnY: 1 * 16 },
    ],
    npcs: ['npc_pak_camat'],
  },

  pasar_wage: {
    id: 'pasar_wage',
    name: 'Pasar Wage',
    grid: [
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
      'W............................W',
      'W....S.....S.....S..........W',
      'W............................W',
      'W............................W',
      'W....S.....S.....S..........W',
      'W............................W',
      'W............................W',
      'W....S.....S.....S..........W',
      'W............................W',
      'W............................W',
      'WWWW..WWWWWWWWWWWWWWWWWW..WWWW',
    ],
    spawnX: 15 * 16,
    spawnY: 1 * 16,
    portals: [
      { to: 'alun_alun', x: 4, y: 0, spawnX: 4 * 16, spawnY: 14 * 16 },
      { to: 'stasiun', x: 25, y: 0, spawnX: 2 * 16, spawnY: 8 * 16 },
    ],
    npcs: ['npc_pedagang'],
  },

  sungai_serayu: {
    id: 'sungai_serayu',
    name: 'Tepi Sungai Serayu',
    grid: [
      'TTTT..TTTTTTTTTTTTTTTTTTTTTTTT',
      'T............................T',
      'T............................T',
      'T............................T',
      'T............................T',
      'T............................T',
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
      'T............................T',
      'T............................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ],
    spawnX: 2 * 16,
    spawnY: 1 * 16,
    portals: [
      { to: 'alun_alun', x: 4, y: 0, spawnX: 25 * 16, spawnY: 14 * 16 },
      { to: 'baturraden', x: 28, y: 5, spawnX: 1 * 16, spawnY: 8 * 16 },
    ],
    fishSpots: [
      { id: 'serayu_1', x: 8, y: 5 },
      { id: 'serayu_2', x: 20, y: 5 },
    ],
  },

  stasiun: {
    id: 'stasiun',
    name: 'Stasiun Purwokerto',
    grid: [
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
      'W............................W',
      'W..BBBBBBBBBBBBBBBBBBBB......W',
      'W............................W',
      'W............................W',
      'W..rrrrrrrrrrrrrrrrrrrr......W',
      'W..rrrrrrrrrrrrrrrrrrrr......W',
      'W............................W',
      'W............................W',
      'WW..WWWWWWWWWWWWWWWWWWWWWWWWWW',
    ],
    spawnX: 2 * 16,
    spawnY: 8 * 16,
    portals: [
      { to: 'pasar_wage', x: 2, y: 9, spawnX: 25 * 16, spawnY: 1 * 16 },
      { to: 'baturraden', x: 28, y: 4, spawnX: 1 * 16, spawnY: 5 * 16 },
    ],
    npcs: ['npc_masinis'],
  },

  baturraden: {
    id: 'baturraden',
    name: 'Baturraden',
    grid: [
      'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
      'P............................P',
      'P....P....P....P....P........P',
      'P............................P',
      'P............................P',
      'P....P....P....P....P........P',
      'P............................P',
      'P............................P',
      'P..RRRRRRRRRR................P',
      'P..RRRRRRRRRR................P',
      'P............................P',
      'P............................P',
      'P............................P',
      'P............RRRRRR..........P',
      'P............RRRRRR..........P',
      'PPPP..PPPPPPPPPPPPPPPPPPPPPPP',
    ],
    spawnX: 1 * 16,
    spawnY: 5 * 16,
    portals: [
      { to: 'sungai_serayu', x: 0, y: 8, spawnX: 28 * 16, spawnY: 5 * 16 },
    ],
    fishSpots: [
      { id: 'telaga_sunyi', x: 14, y: 13 },
    ],
    npcs: ['npc_kakek_hutan'],
  },
};

export const ZONE_IDS = Object.keys(ZONES);
