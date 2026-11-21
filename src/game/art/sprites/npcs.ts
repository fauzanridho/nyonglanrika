// ============================================================
// Sprite NPC (16x16)
// ============================================================

import type { KAPLAYCtx } from 'kaplay';
import { makeSprite } from '../generator';
import { DEFAULT_PALETTE } from '../palette';

export function loadNpcSprites(k: KAPLAYCtx) {
  // Pak Camat - Seragam dinas cokelat & peci hitam
  makeSprite(
    k,
    'npc_pak_camat',
    [
      '.....EEEEEE.....',
      '....EEEEEEEE....',
      '....EESSSSE.....',
      '....ESSESSE.....',
      '....SSSSSSS.....',
      '.....SSSSSS.....',
      '....dYdYdYd.....',
      '...ddddddddd....',
      '...dYdddddYd....',
      '...ddddddddd....',
      '....ddddddd.....',
      '....bbbbbbb.....',
      '....bb...bb.....',
      '....bb...bb.....',
      '...EEE...EEE....',
      '................',
    ],
    DEFAULT_PALETTE
  );

  // Bu Warni (Pedagang Pasar) - Kebaya bunga oranye & sanggul
  makeSprite(
    k,
    'npc_pedagang',
    [
      '.....HHHHHH.....',
      '....HHHHHHHHH...',
      '....HHSSSSH.H...',
      '....HSSSESSH....',
      '....SSSSSSSH....',
      '.....SSSSSS.....',
      '....RRRRRRR.....',
      '...RRRYRYRRR....',
      '...RSRRRRRSR....',
      '...RRRYRYRRR....',
      '....YYYYYYY.....',
      '....yyyyyyy.....',
      '....yyyyyyy.....',
      '....yyyyyyy.....',
      '...EEE...EEE....',
      '................',
    ],
    DEFAULT_PALETTE
  );

  // Pak Darto (Masinis Stasiun) - Topi masinis biru tua & rompi kerja
  makeSprite(
    k,
    'npc_masinis',
    [
      '....bbbbbbbb....',
      '....bbbbbbbb....',
      '....bbSSSEbb....',
      '....bSSSEbb.....',
      '....SSSSSS......',
      '.....SSSSSS.....',
      '....bLbbLbb.....',
      '...bbbbbbbbb....',
      '...bLbbbbbLb....',
      '...bbbbbbbbb....',
      '....bbbbbbb.....',
      '....PPPPPPP.....',
      '....PP...PP.....',
      '....PP...PP.....',
      '...EEE...EEE....',
      '................',
    ],
    DEFAULT_PALETTE
  );

  // Mbah Gito (Kakek Hutan Baturraden) - Rambut putih, janggut, baju lurik tua
  makeSprite(
    k,
    'npc_kakek_hutan',
    [
      '.....W_W_W_.....',
      '....W_W_W_W_....',
      '....W_SSSW_.....',
      '....W_SSESW_....',
      '....W_W_W_W_....',
      '.....W_W_W_.....',
      '....bdbdbdb.....',
      '...bbbbbbbbb....',
      '...bSbbbbSb.....',
      '...bbbbbbbbb....',
      '....bbbbbbb.....',
      '....ddddddd.....',
      '....dd...dd.....',
      '....dd...dd.....',
      '...EEE...EEE....',
      '................',
    ],
    DEFAULT_PALETTE
  );
}
