// ============================================================
// Data: Zones & Portals (Grid 48x28 Tile 16x16 = 768x448 px)
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
  // 1. ALUN-ALUN PURWOKERTO (48x28)
  // ============================================================
  alun_alun: {
    id: 'alun_alun',
    name: 'Alun-alun Purwokerto',
    grid: [
      'TTTTTTTTTTTTTTTTTTTTTTT..TTTTTTTTTTTTTTTTTTTTTTT', // y:0 (Portal Stasiun x:23-24)
      'T......................BB......................T', // y:1
      'T......................BB......................T', // y:2
      'T..b.......L...........BB...........L......bb..T', // y:3
      'T......................BB......................T', // y:4
      'T.......T..............BB..............T.......T', // y:5
      'T......................BB......................T', // y:6
      'T..........L...........BB...........L..........T', // y:7
      'T......................BB......................T', // y:8
      'T....BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB....T', // y:9
      'T....B....................................B....T', // y:10
      'T....B........bb........L.......bb........B....T', // y:11
      'T....B....................................B....T', // y:12
      'T....B....T..........................T....B....T', // y:13
      'T....B....................................B....T', // y:14
      'T....B........bb........L.......bb........B....T', // y:15
      'T....B....................................B....T', // y:16
      'T....BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB....T', // y:17
      'T.......BB............................BB.......T', // y:18
      'T.......BB.............L..............BB.......T', // y:19
      'T.......BB............................BB.......T', // y:20
      'T....T..BB............................BB..T....T', // y:21
      'T.......BB....bb................bb....BB.......T', // y:22
      'T.......BB............................BB.......T', // y:23
      'T.......BB............................BB.......T', // y:24
      'T.......BB............................BB.......T', // y:25
      'T.......BB............................BB.......T', // y:26
      'TTTTTTT..TTTTTTTTTTTTTTTTTTTTTTTTTTTTT..TTTTTTTT', // y:27 (Pasar Wage x:7-8, Serayu x:38-39)
    ],
    spawnX: 24 * 16,
    spawnY: 13 * 16,
    portals: [
      { to: 'stasiun', x: 24, y: 0, spawnX: 24 * 16, spawnY: 25 * 16, label: 'Ke Stasiun Purwokerto' },
      { to: 'pasar_wage', x: 8, y: 27, spawnX: 24 * 16, spawnY: 2 * 16, label: 'Ke Pasar Wage' },
      { to: 'sungai_serayu', x: 39, y: 27, spawnX: 24 * 16, spawnY: 2 * 16, label: 'Ke Tepi Sungai Serayu' },
    ],
    npcs: ['npc_pak_camat'],
    memoryObjects: [
      { hint_id: 'hint_bench_01', x: 5, y: 3, sprite: 'bench' },
      { hint_id: 'hint_lantern_01', x: 8, y: 2, sprite: 'lamp' },
    ],
  },

  // ============================================================
  // 2. PASAR WAGE (48x28)
  // ============================================================
  pasar_wage: {
    id: 'pasar_wage',
    name: 'Pasar Wage',
    grid: [
      'BBBBBBBBBBBBBBBBBBBBBBT..TBBBBBBBBBBBBBBBBBBBBBB', // y:0 (Kembali ke Alun-alun)
      'B..............................................B', // y:1
      'B..............................................B', // y:2
      'B....S.....S.....S............S.....S.....S....B', // y:3
      'B..............................................B', // y:4
      'B..........L........................L..........B', // y:5
      'B..............................................B', // y:6
      'B....S.....S.....S............S.....S.....S....B', // y:7
      'B..............................................B', // y:8
      'B..............................................B', // y:9
      'B..........b........................b..........B', // y:10
      'B..............................................B', // y:11
      'B....S.....S.....S............S.....S.....S....B', // y:12
      'B..............................................B', // y:13
      'B..........L........................L..........B', // y:14
      'B..............................................B', // y:15
      'B....S.....S.....S............S.....S.....S....B', // y:16
      'B..............................................B', // y:17
      'B..............................................B', // y:18
      'B..........b........................b..........B', // y:19
      'B..............................................B', // y:20
      'B....S.....S.....S............S.....S.....S....B', // y:21
      'B..............................................B', // y:22
      'B..........L........................L..........B', // y:23
      'B..............................................B', // y:24
      'B..............................................B', // y:25
      'B..............................................B', // y:26
      'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', // y:27
    ],
    spawnX: 24 * 16,
    spawnY: 2 * 16,
    portals: [
      { to: 'alun_alun', x: 24, y: 0, spawnX: 8 * 16, spawnY: 25 * 16, label: 'Kembali ke Alun-alun' },
    ],
    npcs: ['npc_pedagang'],
  },

  // ============================================================
  // 3. TEPI SUNGAI SERAYU (48x28)
  // ============================================================
  sungai_serayu: {
    id: 'sungai_serayu',
    name: 'Tepi Sungai Serayu',
    grid: [
      'TTTTTTTTTTTTTTTTTTTTTTT..TTTTTTTTTTTTTTTTTTTTTTT', // y:0 (Portal ke Alun-alun)
      'T..............................................T', // y:1
      'T..............................................T', // y:2
      'T.......T..............................T.......T', // y:3
      'T..............................................T', // y:4
      'T............L....................L............T', // y:5
      'T...............................................', // y:6 (Jalan ke Baturraden x:47)
      'T...............................................', // y:7
      'T....T....................................T....T', // y:8
      'T..............................................T', // y:9
      'T........b.......b............b.......b........T', // y:10
      'T..............................................T', // y:11 Tepian pancing
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // y:12 Sungai Serayu
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // y:13
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // y:14
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // y:15
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // y:16
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // y:17
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // y:18
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // y:19
      'T..............................................T', // y:20 Seberang sungai
      'T.....T................T................T......T', // y:21
      'T..............................................T', // y:22
      'T..........b........................b..........T', // y:23
      'T..............................................T', // y:24
      'T....T....................................T....T', // y:25
      'T..............................................T', // y:26
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // y:27
    ],
    spawnX: 24 * 16,
    spawnY: 2 * 16,
    portals: [
      { to: 'alun_alun', x: 24, y: 0, spawnX: 39 * 16, spawnY: 25 * 16, label: 'Kembali ke Alun-alun' },
      { to: 'baturraden', x: 47, y: 6, spawnX: 2 * 16, spawnY: 6 * 16, label: 'Menuju Baturraden' },
    ],
    fishSpots: [
      { id: 'serayu_1', x: 14, y: 12 },
      { id: 'serayu_2', x: 34, y: 12 },
    ],
    memoryObjects: [
      { hint_id: 'hint_bottle_01', x: 10, y: 4, sprite: 'memory_bottle' },
    ],
  },

  // ============================================================
  // 4. STASIUN PURWOKERTO (48x28)
  // ============================================================
  stasiun: {
    id: 'stasiun',
    name: 'Stasiun Purwokerto',
    grid: [
      'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', // y:0
      'B..............................................B', // y:1
      'B....L..........b..............b..........L....B', // y:2
      'B..............................................B', // y:3
      'B..BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB..B', // y:4 Peron Utara
      'B..............................................B', // y:5
      'B..rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr..B', // y:6 Rel 1
      'B..rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr..B', // y:7
      'B..............................................B', // y:8
      'B..rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr..B', // y:9 Rel 2
      'B..rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr..B', // y:10
      'B..............................................B', // y:11
      'B..BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB..B', // y:12 Peron Selatan
      'B..............................................B', // y:13
      'B.......b..........L........L..........b.......B', // y:14
      'B..............................................B', // y:15
      'B..............................................B', // y:16
      'B.......b..............................b.......B', // y:17
      'B..............................................B', // y:18
      'B..................L........L..................B', // y:19
      'B..............................................B', // y:20
      'B..............................................B', // y:21
      'B..............................................B', // y:22
      'B......................BB......................B', // y:23
      'B......................BB......................B', // y:24
      'B......................BB......................B', // y:25
      'B......................BB......................B', // y:26
      'BBBBBBBBBBBBBBBBBBBBBBT..TBBBBBBBBBBBBBBBBBBBBBB', // y:27 (Portal Alun-alun)
    ],
    spawnX: 24 * 16,
    spawnY: 25 * 16,
    portals: [
      { to: 'alun_alun', x: 24, y: 27, spawnX: 24 * 16, spawnY: 2 * 16, label: 'Kembali ke Alun-alun' },
    ],
    npcs: ['npc_masinis'],
  },

  // ============================================================
  // 5. BATURRADEN (48x28)
  // ============================================================
  baturraden: {
    id: 'baturraden',
    name: 'Baturraden',
    grid: [
      'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP', // y:0
      'P..............................................P', // y:1
      'P....P......P......P........P......P......P....P', // y:2
      'P..............................................P', // y:3
      'P..............................................P', // y:4
      'P.......P..............P..............P........P', // y:5
      '...............................................P', // y:6 (Jalan masuk dari Serayu x:0)
      '...............................................P', // y:7
      'P............L....................L............P', // y:8
      'P..............................................P', // y:9
      'P....WWWWWWWWWWWW..............................P', // y:10 Curug Cipendok
      'P....WWWWWWWWWWWW.........P..........P.........P', // y:11
      'P....WWWWWWWWWWWW..............................P', // y:12
      'P..............................................P', // y:13
      'P........b.....................................P', // y:14
      'P.........................P....................P', // y:15
      'P..............................................P', // y:16
      'P..............................................P', // y:17
      'P......................WWWWWWWWWW..............P', // y:18 Telaga Sunyi
      'P......................WWWWWWWWWW..............P', // y:19
      'P......................WWWWWWWWWW..............P', // y:20
      'P......................WWWWWWWWWW..............P', // y:21
      'P..............................................P', // y:22
      'P......P..........b..................P.........P', // y:23
      'P..............................................P', // y:24
      'P...........P..............P...................P', // y:25
      'P..............................................P', // y:26
      'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP', // y:27
    ],
    spawnX: 2 * 16,
    spawnY: 6 * 16,
    portals: [
      { to: 'sungai_serayu', x: 0, y: 6, spawnX: 45 * 16, spawnY: 6 * 16, label: 'Kembali ke Sungai Serayu' },
    ],
    fishSpots: [
      { id: 'telaga_sunyi', x: 27, y: 18 },
    ],
    memoryObjects: [
      { hint_id: 'hint_pine_01', x: 6, y: 2, sprite: 'pine' },
      { hint_id: 'hint_telaga_01', x: 22, y: 18, sprite: 'memory_stone' },
    ],
    npcs: ['npc_kakek_hutan'],
  },
};

export const ZONE_IDS = Object.keys(ZONES);
