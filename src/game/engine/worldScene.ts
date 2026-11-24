// ============================================================
// Scene World: Alun-alun, Gerak Pemain, Kamera Pro (Zoom + Clamp),
// Optimasi Ground Baking, Cuaca, Waktu WIB, NPC, Mancing & Multiplayer
// ============================================================

import type { KAPLAYCtx } from 'kaplay';
import { ZONES } from '@/data/zones';
import { NPCS } from '@/data/npcs';
import { loadPlayerSprite, PlayerLook } from '../art/sprites/player';
import { DEFAULT_PALETTE } from '../art/palette';
import { DayNightWeatherSystem } from '../systems/daynight';
import { FishingSystem } from '../systems/fishing';
import { sfx } from '../audio/sfx';
import { saveState, discoverHint } from '@/lib/rpc';
import { createClient } from '@/lib/supabase/client';
import { useGameStore } from '@/store/gameStore';

export interface WorldSceneOptions {
  zoneId?: string;
  spawnX?: number;
  spawnY?: number;
  look?: PlayerLook;
  playerName?: string;
  myPlayerId?: string;
  onOpenDialog?: (npcName: string, lines: string[], isShop?: boolean) => void;
  onWeatherChange?: (w: { weather: string; intensity: number; hour: number; date: string }) => void;
  onFishingStatus?: (status: 'idle' | 'waiting' | 'bite' | 'result', msg?: string) => void;
  onZoneChange?: (zoneName: string) => void;
  onDiscoverMemory?: (text: string) => void;
}

const CAM_SCALE = 2.5;
const TILE_SIZE = 16;

/**
 * Menggambar seluruh lantai 30x16 ke dalam 1 canvas (480x256) lalu dimuat
 * sebagai 1 sprite tunggal — menghilangkan 480 entity & mencegah lag!
 */
const bakedGroundCache = new Set<string>();
function ensureZoneGroundSprite(k: KAPLAYCtx, zoneId: string, cols: number, rows: number): string {
  const spriteKey = `ground_baked_${zoneId}`;
  if (bakedGroundCache.has(spriteKey) || typeof document === 'undefined') {
    return spriteKey;
  }

  const isUrban = zoneId === 'pasar_wage' || zoneId === 'stasiun';
  const canvas = document.createElement('canvas');
  canvas.width = cols * TILE_SIZE;
  canvas.height = rows * TILE_SIZE;
  const ctx = canvas.getContext('2d')!;

  const gLight = DEFAULT_PALETTE['G'];
  const gDark = DEFAULT_PALETTE['g'];
  const gFlower = DEFAULT_PALETTE['f'];
  const pLight = DEFAULT_PALETTE['B'];
  const pDark = DEFAULT_PALETTE['b'];

  for (let ty = 0; ty < rows; ty++) {
    for (let tx = 0; tx < cols; tx++) {
      const ox = tx * TILE_SIZE;
      const oy = ty * TILE_SIZE;

      if (isUrban) {
        ctx.fillStyle = pLight;
        ctx.fillRect(ox, oy, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = pDark;
        ctx.fillRect(ox + 2, oy + 2, 5, 2);
        ctx.fillRect(ox + 9, oy + 2, 5, 2);
        ctx.fillRect(ox + 2, oy + 7, 5, 2);
        ctx.fillRect(ox + 9, oy + 7, 5, 2);
        ctx.fillRect(ox + 2, oy + 12, 5, 2);
        ctx.fillRect(ox + 9, oy + 12, 5, 2);
      } else {
        ctx.fillStyle = gLight;
        ctx.fillRect(ox, oy, TILE_SIZE, TILE_SIZE);
        // Tekstur rumput halus deterministik
        ctx.fillStyle = gDark;
        ctx.fillRect(ox + ((tx * 5 + ty * 3) % 12) + 1, oy + ((tx * 3 + ty * 7) % 12) + 1, 1, 1);
        ctx.fillRect(ox + ((tx * 9 + ty * 5) % 12) + 2, oy + ((tx * 7 + ty * 2) % 12) + 2, 1, 1);
        if ((tx * 7 + ty * 13) % 19 === 0) {
          ctx.fillStyle = gFlower;
          ctx.fillRect(ox + 6, oy + 5, 2, 2);
          ctx.fillRect(ox + 11, oy + 10, 1, 1);
        }
      }
    }
  }

  k.loadSprite(spriteKey, canvas.toDataURL());
  bakedGroundCache.add(spriteKey);
  return spriteKey;
}

/**
 * Label teks tajam (14px sans-serif di-scale 0.34x) + pill gelap agar selalu terbaca jelas.
 */
function createReadableLabel(
  k: KAPLAYCtx,
  text: string,
  x: number,
  y: number,
  textColor: [number, number, number],
  zIndex: number,
  initialOpacity = 1
) {
  const TEXT_SCALE = 0.34;
  const FONT_SIZE = 14;
  const approxWidth = Math.max(18, text.length * 3.1 + 6);

  const bg = k.add([
    k.rect(approxWidth, 7.5, { radius: 1.5 }),
    k.pos(x, y),
    k.anchor('center'),
    k.color(8, 12, 22),
    k.opacity(initialOpacity * 0.82),
    k.z(zIndex),
  ]);

  const label = k.add([
    k.text(text, { size: FONT_SIZE, font: 'sans-serif' }),
    k.pos(x, y),
    k.anchor('center'),
    k.scale(TEXT_SCALE),
    k.color(...textColor),
    k.opacity(initialOpacity),
    k.z(zIndex + 1),
  ]);

  return {
    bg,
    label,
    setPos(nx: number, ny: number) {
      bg.pos = k.vec2(nx, ny);
      label.pos = k.vec2(nx, ny);
    },
    setText(newText: string) {
      if (label.text === newText) return;
      label.text = newText;
      bg.width = Math.max(18, newText.length * 3.1 + 6);
    },
    setOpacity(op: number) {
      label.opacity = op;
      bg.opacity = op * 0.82;
    },
    destroy() {
      try {
        bg.destroy();
        label.destroy();
      } catch (e) {}
    },
  };
}

export function registerWorldScene(k: KAPLAYCtx) {
  k.scene('world', (opts: WorldSceneOptions = {}) => {
    const currentZoneId = opts.zoneId || 'alun_alun';
    const zoneDef = ZONES[currentZoneId] || ZONES['alun_alun'];

    if (opts.onZoneChange) {
      opts.onZoneChange(zoneDef.name);
    }

    // Set camera zoom 2.5x agar tampilan proporsional (Stardew-style) & tidak keluar map
    k.setCamScale(CAM_SCALE);

    // Load sprite player lokal (sprite dunia/NPC sudah di-load 1x di GameCanvas)
    const localSpriteKey = `player_${opts.myPlayerId || 'me'}`;
    loadPlayerSprite(k, opts.look, localSpriteKey);

    const SPEED = 85;
    const rows = zoneDef.grid.length;
    const cols = zoneDef.grid[0]?.length || 30;
    const mapW = cols * TILE_SIZE;
    const mapH = rows * TILE_SIZE;

    // 1. RENDER 1 SPRITE LANTAI TERPANGGANG (z=0) -> 0 lag!
    const groundKey = ensureZoneGroundSprite(k, currentZoneId, cols, rows);
    k.add([
      k.sprite(groundKey),
      k.pos(0, 0),
      k.z(0),
    ]);

    // 2. RENDER OBJEK & RINTANGAN DENGAN OPTIMASI COLLIDER
    // Hanya beri collider pada tile air/rintangan yang berbatasan dengan area jalan
    const isWalkableChar = (ch: string | undefined) => ch === '.' || ch === ' ' || ch === 'B' || ch === 'r';

    for (let gy = 0; gy < rows; gy++) {
      const rowStr = zoneDef.grid[gy];
      for (let gx = 0; gx < cols; gx++) {
        const ch = rowStr[gx];
        if (ch === '.' || ch === ' ') continue;

        const px = gx * TILE_SIZE;
        const py = gy * TILE_SIZE;

        if (ch === 'W' || ch === 'R') {
          // Cek apakah air ini bersebelahan dengan tanah/jalan
          const touchesWalkable =
            isWalkableChar(zoneDef.grid[gy - 1]?.[gx]) ||
            isWalkableChar(zoneDef.grid[gy + 1]?.[gx]) ||
            isWalkableChar(zoneDef.grid[gy]?.[gx - 1]) ||
            isWalkableChar(zoneDef.grid[gy]?.[gx + 1]);

          if (touchesWalkable) {
            k.add([k.sprite('water'), k.pos(px, py), k.area(), k.body({ isStatic: true }), k.z(1), 'obstacle', 'water']);
          } else {
            k.add([k.sprite('water'), k.pos(px, py), k.z(1)]);
          }
        } else if (ch === 'T') {
          k.add([k.sprite('tree'), k.pos(px, py), k.area(), k.body({ isStatic: true }), k.z(py + 16), 'obstacle']);
        } else if (ch === 'b') {
          k.add([k.sprite('bench'), k.pos(px, py), k.area(), k.body({ isStatic: true }), k.z(py + 16), 'obstacle', 'bench']);
        } else if (ch === 'L') {
          k.add([k.sprite('lamp'), k.pos(px, py), k.area(), k.body({ isStatic: true }), k.z(py + 16), 'obstacle', 'lamp']);
        } else if (ch === 'P') {
          k.add([k.sprite('pine'), k.pos(px, py), k.area(), k.body({ isStatic: true }), k.z(py + 16), 'obstacle']);
        } else if (ch === 'B') {
          k.add([k.sprite('paving'), k.pos(px, py), k.z(1)]);
        } else if (ch === 'S') {
          k.add([k.sprite('stall'), k.pos(px, py), k.area(), k.body({ isStatic: true }), k.z(py + 16), 'obstacle']);
        } else if (ch === 'r') {
          k.add([k.sprite('rail'), k.pos(px, py), k.z(1)]);
        }
      }
    }

    // Inisialisasi Siklus Waktu & Cuaca Server
    const weatherSys = new DayNightWeatherSystem(k);
    weatherSys.init((wData) => {
      if (opts.onWeatherChange) {
        opts.onWeatherChange(wData);
      }
    }).then((wData) => {
      if (wData && opts.onWeatherChange) {
        opts.onWeatherChange(wData);
      }
    });

    // Inisialisasi Sistem Memancing
    const fishingSys = new FishingSystem(k);
    if (zoneDef.fishSpots && zoneDef.fishSpots.length > 0) {
      fishingSys.init(zoneDef.fishSpots);
    }

    // Spawn Player Saya (Local)
    const startX = opts.spawnX ?? zoneDef.spawnX ?? 15 * 16;
    const startY = opts.spawnY ?? zoneDef.spawnY ?? 7 * 16;

    saveState(currentZoneId, Math.round(startX), Math.round(startY)).catch(() => {});
    useGameStore.getState().setLivePos(currentZoneId, Math.round(startX), Math.round(startY));

    const player = k.add([
      k.sprite(localSpriteKey, { anim: 'idle-down' }),
      k.pos(startX, startY),
      k.area({ shape: new k.Rect(k.vec2(2, 6), 12, 10) }),
      k.body(),
      k.anchor('center'),
      k.z(startY + 8),
      'player',
    ]);

    // Fungsi clamp kamera agar TIDAK PERNAH melihat keluar batas peta!
    const updateClampedCamera = () => {
      if (!player?.pos) return;
      const viewW = k.width() / CAM_SCALE;
      const viewH = k.height() / CAM_SCALE;
      const camX = mapW <= viewW ? mapW / 2 : Math.max(viewW / 2, Math.min(mapW - viewW / 2, player.pos.x));
      const camY = mapH <= viewH ? mapH / 2 : Math.max(viewH / 2, Math.min(mapH - viewH / 2, player.pos.y));
      k.setCamPos(camX, camY);
    };
    updateClampedCamera();

    // Name Tag Pemain Lokal
    const getLocalPlayerName = () => useGameStore.getState().player?.name || opts.playerName || 'Player';
    const localTag = createReadableLabel(
      k,
      getLocalPlayerName(),
      player.pos.x,
      player.pos.y - 12,
      [255, 255, 180],
      1100,
      1
    );
    localTag.label.onUpdate(() => {
      if (!player?.pos) return;
      localTag.setPos(player.pos.x, player.pos.y - 12);
      localTag.setText(getLocalPlayerName());
    });

    // ============================================================
    // SISTEM REALTIME MULTIPLAYER — PRESENCE-BASED
    // ============================================================
    const otherPlayersMap = new Map<
      string,
      { body: any; tag: ReturnType<typeof createReadableLabel>; look?: any }
    >();
    const supabase = createClient();

    function spawnOrUpdateOtherPlayer(pData: {
      id: string;
      name: string;
      pos_x: number;
      pos_y: number;
      look?: any;
      zone?: string;
    }) {
      if (!pData.id || pData.id === opts.myPlayerId) return;
      if (pData.zone && pData.zone !== currentZoneId) {
        removeOtherPlayer(pData.id);
        return;
      }

      const spriteKey = `player_${pData.id}`;

      if (otherPlayersMap.has(pData.id)) {
        const op = otherPlayersMap.get(pData.id)!;
        const dx = pData.pos_x - op.body.pos.x;
        const dy = pData.pos_y - op.body.pos.y;

        if (pData.look && JSON.stringify(pData.look) !== JSON.stringify(op.look)) {
          loadPlayerSprite(k, pData.look, spriteKey);
          op.look = pData.look;
        }

        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          if (Math.abs(dx) > Math.abs(dy)) {
            if (op.body.curAnim() !== 'walk-side') op.body.play('walk-side');
            op.body.flipX = dx < 0;
          } else if (dy > 0) {
            if (op.body.curAnim() !== 'walk-down') op.body.play('walk-down');
            op.body.flipX = false;
          } else {
            if (op.body.curAnim() !== 'walk-up') op.body.play('walk-up');
            op.body.flipX = false;
          }
        } else {
          if (op.body.curAnim() !== 'idle-down') op.body.play('idle-down');
        }

        op.body.pos = k.vec2(pData.pos_x, pData.pos_y);
        op.body.z = pData.pos_y + 8;
        op.tag.setPos(pData.pos_x, pData.pos_y - 12);
        op.tag.setText(pData.name);
        return;
      }

      loadPlayerSprite(k, pData.look, spriteKey);

      const otherBody = k.add([
        k.sprite(spriteKey, { anim: 'idle-down' }),
        k.pos(pData.pos_x, pData.pos_y),
        k.area({ shape: new k.Rect(k.vec2(2, 6), 12, 10) }),
        k.anchor('center'),
        k.z(pData.pos_y + 8),
        'other_player',
      ]);

      const otherTag = createReadableLabel(
        k,
        pData.name,
        pData.pos_x,
        pData.pos_y - 12,
        [140, 240, 255],
        1050,
        1
      );

      otherPlayersMap.set(pData.id, { body: otherBody, tag: otherTag, look: pData.look });
    }

    function removeOtherPlayer(playerId: string) {
      if (otherPlayersMap.has(playerId)) {
        const op = otherPlayersMap.get(playerId)!;
        try {
          op.body.destroy();
          op.tag.destroy();
        } catch (e) {}
        otherPlayersMap.delete(playerId);
      }
    }

    const presenceChannel = supabase.channel(`presence_zone_${currentZoneId}`, {
      config: { presence: { key: opts.myPlayerId || 'unknown' } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState<{
          id: string;
          name: string;
          pos_x: number;
          pos_y: number;
          look?: any;
          zone?: string;
        }>();

        const onlineIds = new Set<string>();

        for (const [key, entries] of Object.entries(presenceState)) {
          if (key === opts.myPlayerId) continue;
          const latest = entries[entries.length - 1];
          if (latest && latest.zone === currentZoneId) {
            onlineIds.add(key);
            spawnOrUpdateOtherPlayer(latest);
          }
        }

        for (const [existingId] of otherPlayersMap) {
          if (!onlineIds.has(existingId)) {
            removeOtherPlayer(existingId);
          }
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key && key !== opts.myPlayerId) {
          removeOtherPlayer(key);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const freshPlayer = useGameStore.getState().player;
          await presenceChannel.track({
            id: opts.myPlayerId,
            name: freshPlayer?.name || opts.playerName || 'Player',
            pos_x: startX,
            pos_y: startY,
            look: freshPlayer?.look || opts.look || {},
            zone: currentZoneId,
          });
        }
      });

    const worldChannel = supabase
      .channel(`world_zone_${currentZoneId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        (payload: any) => {
          const newRow = payload.new;
          if (!newRow || newRow.id === opts.myPlayerId) return;

          if (newRow.zone === currentZoneId) {
            spawnOrUpdateOtherPlayer(newRow);
          } else {
            removeOtherPlayer(newRow.id);
          }
        }
      )
      .subscribe();

    // Spawn Objek Kenangan Tersembunyi (Private Hints)
    const memoryObjList: any[] = [];
    if (zoneDef.memoryObjects) {
      zoneDef.memoryObjects.forEach((mo) => {
        k.add([
          k.sprite(mo.sprite),
          k.pos(mo.x * TILE_SIZE, mo.y * TILE_SIZE),
          k.area(),
          k.z(mo.y * TILE_SIZE + 16),
          'memory_object',
          { hintId: mo.hint_id, targetX: mo.x * TILE_SIZE, targetY: mo.y * TILE_SIZE },
        ]);

        const promptLabel = createReadableLabel(
          k,
          'E: Periksa',
          mo.x * TILE_SIZE + 8,
          mo.y * TILE_SIZE - 8,
          [160, 225, 255],
          1150,
          0
        );

        promptLabel.label.onUpdate(() => {
          if (!player?.pos) return;
          const dist = Math.hypot(player.pos.x - (mo.x * TILE_SIZE + 8), player.pos.y - (mo.y * TILE_SIZE + 8));
          promptLabel.setOpacity(dist < 32 ? 1 : 0);
        });

        memoryObjList.push({ hintId: mo.hint_id, x: mo.x * TILE_SIZE, y: mo.y * TILE_SIZE });
      });
    }

    // Kamera mengikuti pemain (TERCLAMP), Y-sorting dinamis, & update spot pancing
    let minimapSyncTimer = 0;
    player.onUpdate(() => {
      if (!player?.pos) return;
      player.z = player.pos.y + 8;
      updateClampedCamera();

      minimapSyncTimer += k.dt();
      if (minimapSyncTimer >= 0.25) {
        minimapSyncTimer = 0;
        useGameStore.getState().setLivePos(currentZoneId, Math.round(player.pos.x), Math.round(player.pos.y));
      }

      if (zoneDef.fishSpots && zoneDef.fishSpots.length > 0) {
        fishingSys.update(player.pos, zoneDef.fishSpots);
      }
    });

    // Spawn NPC di zona ini
    const zoneNpcIds = zoneDef.npcs || [];
    const zoneNpcs = NPCS.filter((n) => zoneNpcIds.includes(n.id) || n.zone === currentZoneId);

    zoneNpcs.forEach((npcDef) => {
      k.add([
        k.sprite(npcDef.id),
        k.pos(npcDef.x, npcDef.y),
        k.area({ shape: new k.Rect(k.vec2(2, 4), 12, 12) }),
        k.body({ isStatic: true }),
        k.anchor('center'),
        k.z(npcDef.y + 8),
        'npc',
        { def: npcDef },
      ]);

      createReadableLabel(
        k,
        npcDef.name,
        npcDef.x,
        npcDef.y - 12,
        [255, 240, 140],
        1050,
        1
      );

      const interactLabel = createReadableLabel(
        k,
        'E: Bicara',
        npcDef.x,
        npcDef.y - 21,
        [255, 230, 80],
        1150,
        0
      );

      interactLabel.label.onUpdate(() => {
        if (!player?.pos) return;
        const dist = Math.hypot(player.pos.x - npcDef.x, player.pos.y - npcDef.y);
        interactLabel.setOpacity(dist < 28 ? 1 : 0);
      });
    });

    // Handle Interaksi Tombol (E & Spasi)
    const handleInteractE = async () => {
      if (useGameStore.getState().showDialog) return;

      let nearestMemory: any = null;
      let minMemDist = 36;
      memoryObjList.forEach((m) => {
        const dist = Math.hypot(player.pos.x - (m.x + 8), player.pos.y - (m.y + 8));
        if (dist < minMemDist) {
          minMemDist = dist;
          nearestMemory = m;
        }
      });

      if (nearestMemory && opts.onDiscoverMemory) {
        try {
          sfx.playClick();
          const hintText = await discoverHint(
            nearestMemory.hintId,
            currentZoneId,
            Math.round(player.pos.x),
            Math.round(player.pos.y)
          );
          sfx.playCoin();
          opts.onDiscoverMemory(hintText);
          return;
        } catch (e: any) {
          console.warn('Hint status:', e.message);
        }
      }

      let nearestNpc: any = null;
      let minDist = 32;
      k.get('npc').forEach((npcObj: any) => {
        const dist = Math.hypot(player.pos.x - npcObj.pos.x, player.pos.y - npcObj.pos.y);
        if (dist < minDist) {
          minDist = dist;
          nearestNpc = npcObj;
        }
      });

      if (nearestNpc && opts.onOpenDialog) {
        sfx.playClick();
        const lines = nearestNpc.def.dialog.map((d: any) => d.text);
        opts.onOpenDialog(nearestNpc.def.name, lines, nearestNpc.def.isShop);
      }
    };

    const handleSpaceAction = () => {
      if (zoneDef.fishSpots && zoneDef.fishSpots.length > 0) {
        fishingSys.handleActionKey((status, msg) => {
          if (opts.onFishingStatus) opts.onFishingStatus(status, msg);
        });
      } else {
        handleInteractE();
      }
    };

    k.onKeyPress('e', handleInteractE);
    k.onKeyPress('space', handleSpaceAction);

    // Kontrol Gerak 4 Arah & SFX Langkah
    let isMoving = false;
    let lastDir = 'down';
    let stepTimer = 0;

    function handleMovement() {
      if (!player?.pos) return;
      if (useGameStore.getState().showDialog) {
        if (isMoving) {
          const idleAnim = lastDir === 'side' ? 'idle-side' : `idle-${lastDir}`;
          player.play(idleAnim);
          isMoving = false;
        }
        return;
      }

      let moveX = 0;
      let moveY = 0;

      if (k.isKeyDown('left') || k.isKeyDown('a')) moveX -= 1;
      if (k.isKeyDown('right') || k.isKeyDown('d')) moveX += 1;
      if (k.isKeyDown('up') || k.isKeyDown('w')) moveY -= 1;
      if (k.isKeyDown('down') || k.isKeyDown('s')) moveY += 1;

      if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.7071;
        moveY *= 0.7071;
      }

      if (moveX !== 0 || moveY !== 0) {
        player.move(moveX * SPEED, moveY * SPEED);

        stepTimer += k.dt();
        if (stepTimer > 0.32) {
          sfx.playStep();
          stepTimer = 0;
        }

        let targetAnim = 'walk-down';
        if (moveY < 0) {
          targetAnim = 'walk-up';
          lastDir = 'up';
          player.flipX = false;
        } else if (moveY > 0) {
          targetAnim = 'walk-down';
          lastDir = 'down';
          player.flipX = false;
        } else if (moveX < 0) {
          targetAnim = 'walk-side';
          lastDir = 'side';
          player.flipX = true;
        } else if (moveX > 0) {
          targetAnim = 'walk-side';
          lastDir = 'side';
          player.flipX = false;
        }

        if (player.curAnim() !== targetAnim) {
          player.play(targetAnim);
        }
        isMoving = true;
      } else {
        stepTimer = 0;
        if (isMoving) {
          const idleAnim = lastDir === 'side' ? 'idle-side' : `idle-${lastDir}`;
          player.play(idleAnim);
          isMoving = false;
        }
      }
    }

    k.onUpdate(() => {
      handleMovement();
    });

    // Papan / Sign Portal Antar-Zona
    if (zoneDef.portals && zoneDef.portals.length > 0) {
      zoneDef.portals.forEach((p) => {
        k.add([
          k.rect(TILE_SIZE * 2, 4),
          k.pos((p.x - 0.5) * TILE_SIZE, p.y * TILE_SIZE + 6),
          k.color(255, 230, 100),
          k.opacity(0.35),
          k.z(2),
        ]);

        const portalLabel = createReadableLabel(
          k,
          p.label,
          p.x * TILE_SIZE,
          p.y * TILE_SIZE - (p.y === 0 ? -14 : 10),
          [255, 240, 160],
          1200,
          0
        );

        const portalObj = k.add([
          k.rect(TILE_SIZE * 1.5, TILE_SIZE * 1.5),
          k.pos((p.x - 0.25) * TILE_SIZE, (p.y - 0.25) * TILE_SIZE),
          k.area(),
          k.opacity(0),
          'portal',
          { targetZone: p.to, targetX: p.spawnX, targetY: p.spawnY },
        ]);

        portalObj.onUpdate(() => {
          if (!player?.pos) return;
          const dist = Math.hypot(player.pos.x - p.x * TILE_SIZE, player.pos.y - p.y * TILE_SIZE);
          portalLabel.setOpacity(dist < 32 ? 1 : 0);
        });

        let isTeleporting = false;
        portalObj.onCollide('player', () => {
          if (isTeleporting) return;
          isTeleporting = true;
          sfx.playClick();
          saveState(p.to, Math.round(p.spawnX), Math.round(p.spawnY)).catch(console.error);
          weatherSys.destroy();
          fishingSys.destroy();
          supabase.removeChannel(worldChannel);
          presenceChannel.untrack().then(() => supabase.removeChannel(presenceChannel)).catch(() => {});
          const freshPlayer = useGameStore.getState().player;
          k.go('world', {
            zoneId: p.to,
            spawnX: p.spawnX,
            spawnY: p.spawnY,
            look: (freshPlayer?.look as PlayerLook) || opts.look,
            playerName: freshPlayer?.name || opts.playerName,
            myPlayerId: freshPlayer?.id || opts.myPlayerId,
            onOpenDialog: opts.onOpenDialog,
            onWeatherChange: opts.onWeatherChange,
            onFishingStatus: opts.onFishingStatus,
            onZoneChange: opts.onZoneChange,
            onDiscoverMemory: opts.onDiscoverMemory,
          });
        });
      });
    }

    // Sync broadcast posisi berkala
    let lastSavedX = player?.pos?.x ?? 0;
    let lastSavedY = player?.pos?.y ?? 0;
    const saveInterval = setInterval(() => {
      if (!player?.pos) return;
      const dist = Math.hypot(player.pos.x - lastSavedX, player.pos.y - lastSavedY);
      if (dist > 8) {
        lastSavedX = player.pos.x;
        lastSavedY = player.pos.y;
        saveState(currentZoneId, Math.round(player.pos.x), Math.round(player.pos.y)).catch(console.error);
        const freshPlayer = useGameStore.getState().player;
        presenceChannel.track({
          id: opts.myPlayerId,
          name: freshPlayer?.name || opts.playerName || 'Player',
          pos_x: Math.round(player.pos.x),
          pos_y: Math.round(player.pos.y),
          look: freshPlayer?.look || opts.look || {},
          zone: currentZoneId,
        }).catch(() => {});
      }
    }, 1500);

    const handleBeforeUnload = () => {
      if (!player?.pos) return;
      saveState(currentZoneId, Math.round(player.pos.x), Math.round(player.pos.y)).catch(console.error);
      presenceChannel.untrack().catch(() => {});
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    k.onDestroy(() => {
      presenceChannel.untrack().then(() => supabase.removeChannel(presenceChannel)).catch(() => {});
      supabase.removeChannel(worldChannel);
      weatherSys.destroy();
      fishingSys.destroy();
      clearInterval(saveInterval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
    });
  });
}
