// ============================================================
// Data: Zones & Portals (Konsisten Koordinat Grid 30x16 Tile 16x16)
// ============================================================

export interface Portal {
  to: string;
  spawnX: number;
  spawnY: number;
  x: number;
  y: number;
  label: string;
}

export interface MemoryObjectDef {
  hint_id: string;
  x: number;
  y: number;
  sprite: string;
}

export interface ZoneDef {
  id: string;
  name: string;
  grid: string[];
  spawnX: number;
  spawnY: number;
  portals: Portal[];
  fishSpots?: { id: string; x: number; y: number }[];
  npcs?: string[];
  memoryObjects?: MemoryObjectDef[];
}

export const ZONES: Record<string, ZoneDef> = {
  // ============================================================
  // 1. ALUN-ALUN PURWOKERTO (Pusat Kota)
  // Taman kota dengan pepohonan rindang, bangku, lentera
  // ============================================================
  alun_alun: {
    id: 'alun_alun',
    name: 'Alun-alun Purwokerto',
    grid: [
      'TTTTTTTTTTTTTT..TTTTTTTTTTTTTT', // y:0 (Portal ke Stasiun)
      'T............................T', // y:1
      'T............................T', // y:2
      'T..b.......L.....bb..........T', // y:3
      'T............................T', // y:4
      'T.........T..........T.......T', // y:5
      'T............................T', // y:6
      'T............................T', // y:7
      'T..bb......L.....bb..........T', // y:8
      'T............................T', // y:9
      'T............................T', // y:10
      'T.........T..........T.......T', // y:11
      'T............L...............T', // y:12
      'T............................T', // y:13
      'T............................T', // y:14
      'TTTT..TTTTTTTTTTTTTTTTTT..TTTT', // y:15 (Portal Pasar Wage & Serayu)
    ],
    spawnX: 15 * 16,
    spawnY: 7 * 16,
    portals: [
      { to: 'stasiun', x: 15, y: 0, spawnX: 15 * 16, spawnY: 13 * 16, label: 'Ke Stasiun Purwokerto' },
      { to: 'pasar_wage', x: 5, y: 15, spawnX: 15 * 16, spawnY: 2 * 16, label: 'Ke Pasar Wage' },
      { to: 'sungai_serayu', x: 25, y: 15, spawnX: 15 * 16, spawnY: 2 * 16, label: 'Ke Tepi Sungai Serayu' },
    ],
    npcs: ['npc_pak_camat'],
    memoryObjects: [
      { hint_id: 'hint_bench_01', x: 5, y: 3, sprite: 'bench' },
      { hint_id: 'hint_lantern_01', x: 13, y: 5, sprite: 'lamp' },
    ],
  },

  // ============================================================
  // 2. PASAR WAGE (Pusat Perbelanjaan & Ekonomi)
  // Pasar tradisional dengan kios-kios berderet
  // ============================================================
  pasar_wage: {
    id: 'pasar_wage',
    name: 'Pasar Wage',
    grid: [
      'BBBBBBBBBBBBTT..TTBBBBBBBBBBBB', // y:0 (Pintu kembali ke Alun-alun)
      'B............................B', // y:1
      'B............................B', // y:2 (Spawn dari Alun-alun)
      'B....S.....S.....S.....S.....B', // y:3 Kios pedagang
      'B............................B', // y:4
      'B............................B', // y:5
      'B....S.....S.....S.....S.....B', // y:6 Kios
      'B............................B', // y:7
      'B............................B', // y:8
      'B....S.....S.....S.....S.....B', // y:9 Kios
      'B............................B', // y:10
      'B............................B', // y:11
      'B............................B', // y:12
      'B............................B', // y:13
      'B............................B', // y:14
      'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', // y:15
    ],
    spawnX: 15 * 16,
    spawnY: 2 * 16,
    portals: [
      { to: 'alun_alun', x: 15, y: 0, spawnX: 5 * 16, spawnY: 13 * 16, label: 'Kembali ke Alun-alun' },
    ],
    npcs: ['npc_pedagang'],
  },

  // ============================================================
  // 3. TEPI SUNGAI SERAYU (Spot Mancing & Suasana Alam)
  // ============================================================
  sungai_serayu: {
    id: 'sungai_serayu',
    name: 'Tepi Sungai Serayu',
    grid: [
      'TTTTTTTTTTTTTT..TTTTTTTTTTTTTT', // y:0 (Portal ke Alun-alun)
      'T............................T', // y:1
      'T............................T', // y:2 (Spawn dari Alun-alun)
      'T.............................', // y:3 (Jalan ke Baturraden)
      'T.............................', // y:4
      'T............................T', // y:5 Tepian rumput
      'T..b.......b.......b.......b.T', // y:6 Bangku memancing
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // y:7 Sungai
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // y:8
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // y:9
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // y:10
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // y:11
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // y:12
      'T............................T', // y:13
      'T............................T', // y:14
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // y:15
    ],
    spawnX: 15 * 16,
    spawnY: 2 * 16,
    portals: [
      { to: 'alun_alun', x: 15, y: 0, spawnX: 25 * 16, spawnY: 13 * 16, label: 'Kembali ke Alun-alun' },
      { to: 'baturraden', x: 29, y: 3, spawnX: 2 * 16, spawnY: 5 * 16, label: 'Menuju Baturraden' },
    ],
    fishSpots: [
      { id: 'serayu_1', x: 8, y: 7 },
      { id: 'serayu_2', x: 20, y: 7 },
    ],
    memoryObjects: [
      { hint_id: 'hint_bottle_01', x: 10, y: 6, sprite: 'memory_bottle' },
    ],
  },

  // ============================================================
  // 4. STASIUN PURWOKERTO
  // ============================================================
  stasiun: {
    id: 'stasiun',
    name: 'Stasiun Purwokerto',
    grid: [
      'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', // y:0
      'B............................B', // y:1
      'B..BBBBBBBBBBBBBBBBBBBBBBBB..B', // y:2 Peron
      'B............................B', // y:3
      'B..rrrrrrrrrrrrrrrrrrrrrrrr..B', // y:4 Rel kereta 1
      'B..rrrrrrrrrrrrrrrrrrrrrrrr..B', // y:5 Rel kereta 2
      'B............................B', // y:6
      'B............................B', // y:7
      'B............................B', // y:8
      'B............................B', // y:9
      'B............................B', // y:10
      'B............................B', // y:11
      'B............................B', // y:12
      'B............................B', // y:13
      'B.............BB.............B', // y:14
      'BBBBBBBBBBBBTT..TTBBBBBBBBBBBB', // y:15
    ],
    spawnX: 15 * 16,
    spawnY: 13 * 16,
    portals: [
      { to: 'alun_alun', x: 15, y: 15, spawnX: 15 * 16, spawnY: 2 * 16, label: 'Kembali ke Alun-alun' },
    ],
    npcs: ['npc_masinis'],
  },

  // ============================================================
  // 5. BATURRADEN (Dataran Tinggi & Telaga Sunyi)
  // ============================================================
  baturraden: {
    id: 'baturraden',
    name: 'Baturraden',
    grid: [
      'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPP', // y:0
      'P............................P', // y:1
      'P....P....P....P....P........P', // y:2
      'P............................P', // y:3
      'P............................P', // y:4
      '.....P....P....P....P........P', // y:5 (Jalan masuk dari Serayu)
      'P............................P', // y:6
      'P............................P', // y:7
      'P..WWWWWWWWWW................P', // y:8 Curug Cipendok
      'P..WWWWWWWWWW................P', // y:9
      'P............................P', // y:10
      'P............................P', // y:11
      'P............WWWWWW..........P', // y:12 Telaga Sunyi
      'P............WWWWWW..........P', // y:13
      'P............WWWWWW..........P', // y:14
      'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPP', // y:15
    ],
    spawnX: 2 * 16,
    spawnY: 5 * 16,
    portals: [
      { to: 'sungai_serayu', x: 0, y: 5, spawnX: 28 * 16, spawnY: 3 * 16, label: 'Kembali ke Sungai Serayu' },
    ],
    fishSpots: [
      { id: 'telaga_sunyi', x: 15, y: 13 },
    ],
    memoryObjects: [
      { hint_id: 'hint_pine_01', x: 6, y: 2, sprite: 'pine' },
      { hint_id: 'hint_telaga_01', x: 13, y: 12, sprite: 'memory_stone' },
    ],
    npcs: ['npc_kakek_hutan'],
  },
};

export const ZONE_IDS = Object.keys(ZONES);
