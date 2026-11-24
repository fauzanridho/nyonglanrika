// ============================================================
// Scene World: Alun-alun, Gerak Pemain, Kamera, Tabrakan, Autosave,
// Cuaca, Waktu WIB, SFX, NPC, Mancing, Kenangan & REALTIME MULTIPLAYER
// ============================================================

import type { KAPLAYCtx } from 'kaplay';
import { ZONES } from '@/data/zones';
import { NPCS } from '@/data/npcs';
import { loadWorldSprites } from '../art/sprites/world';
import { loadPlayerSprite, PlayerLook } from '../art/sprites/player';
import { loadNpcSprites } from '../art/sprites/npcs';
import { loadFishingSprites } from '../art/sprites/fishing';
import { loadMemorySprites } from '../art/sprites/memories';
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

/**
 * Helper untuk membuat label teks yang tajam dan selalu terbaca
 * dengan latar belakang pill gelap semi-transparan.
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
  const padX = 5;
  const approxWidth = Math.max(24, text.length * 4.4 + padX * 2);
  const bg = k.add([
    k.rect(approxWidth, 10, { radius: 2 }),
    k.pos(x, y),
    k.anchor('center'),
    k.color(10, 14, 24),
    k.opacity(initialOpacity * 0.78),
    k.z(zIndex),
  ]);

  const label = k.add([
    k.text(text, { size: 7 }),
    k.pos(x, y),
    k.anchor('center'),
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
      bg.width = Math.max(24, newText.length * 4.4 + padX * 2);
    },
    setOpacity(op: number) {
      label.opacity = op;
      bg.opacity = op * 0.78;
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

    // Muat semua kumpulan sprites
    loadWorldSprites(k);
    const localSpriteKey = `player_${opts.myPlayerId || 'me'}`;
    loadPlayerSprite(k, opts.look, localSpriteKey);
    loadNpcSprites(k);
    loadFishingSprites(k);
    loadMemorySprites(k);

    const SPEED = 85;
    const TILE_SIZE = 16;

    // 1. RENDER BASE GROUND LAYER DI BAWAH SEMUA TILE (z=0)
    // Ini memastikan tidak ada background hitam/biru gelap di sekitar pohon, bangku, lampu, kios, dll!
    const isUrbanPaving = currentZoneId === 'pasar_wage' || currentZoneId === 'stasiun';
    const baseSprite = isUrbanPaving ? 'paving' : 'grass';
    const rows = zoneDef.grid.length;
    const cols = zoneDef.grid[0]?.length || 30;

    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        // Variasi bunga kecil deterministik di area rumput
        const isFlower = !isUrbanPaving && ((gx * 7 + gy * 13) % 19 === 0);
        k.add([
          k.sprite(isFlower ? 'grass_flower' : baseSprite),
          k.pos(gx * TILE_SIZE, gy * TILE_SIZE),
          k.z(0),
        ]);
      }
    }

    // 2. RENDER OBJEK & RINTANGAN DI ATAS GROUND (z=2)
    const tileConfig: Record<string, () => any[]> = {
      'T': () => [k.sprite('tree'), k.area(), k.body({ isStatic: true }), k.z(2), 'obstacle'],
      'b': () => [k.sprite('bench'), k.area(), k.body({ isStatic: true }), k.z(2), 'obstacle', 'bench'],
      'L': () => [k.sprite('lamp'), k.area(), k.body({ isStatic: true }), k.z(2), 'obstacle', 'lamp'],
      'W': () => [k.sprite('water'), k.area(), k.body({ isStatic: true }), k.z(1), 'obstacle', 'water'],
      'R': () => [k.sprite('water'), k.area(), k.body({ isStatic: true }), k.z(1), 'obstacle', 'water'],
      'P': () => [k.sprite('pine'), k.area(), k.body({ isStatic: true }), k.z(2), 'obstacle'],
      'B': () => [k.sprite('paving'), k.z(1)],
      'S': () => [k.sprite('stall'), k.area(), k.body({ isStatic: true }), k.z(2), 'obstacle'],
      'r': () => [k.sprite('rail'), k.z(1)],
      // '.' dan ' ' tidak perlu spawn lagi karena base ground sudah dirender di z=0
    };

    k.addLevel(zoneDef.grid, {
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      pos: k.vec2(0, 0),
      tiles: tileConfig,
    });

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

    // Catat zona saat ini di DB agar quest kunjungan tercatat
    saveState(currentZoneId, Math.round(startX), Math.round(startY)).catch(() => {});

    const player = k.add([
      k.sprite(localSpriteKey, { anim: 'idle-down' }),
      k.pos(startX, startY),
      k.area({ shape: new k.Rect(k.vec2(2, 6), 12, 10) }),
      k.body(),
      k.anchor('center'),
      k.z(10),
      'player',
    ]);

    // Name Tag Pemain Lokal (Tajam + Pill Gelap)
    const getLocalPlayerName = () => useGameStore.getState().player?.name || opts.playerName || 'Player';
    const localTag = createReadableLabel(
      k,
      getLocalPlayerName(),
      player.pos.x,
      player.pos.y - 14,
      [255, 255, 180],
      20,
      1
    );
    localTag.label.onUpdate(() => {
      if (!player?.pos) return;
      localTag.setPos(player.pos.x, player.pos.y - 14);
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
        op.tag.setPos(pData.pos_x, pData.pos_y - 14);
        op.tag.setText(pData.name);
        return;
      }

      loadPlayerSprite(k, pData.look, spriteKey);

      const otherBody = k.add([
        k.sprite(spriteKey, { anim: 'idle-down' }),
        k.pos(pData.pos_x, pData.pos_y),
        k.area({ shape: new k.Rect(k.vec2(2, 6), 12, 10) }),
        k.anchor('center'),
        k.z(9),
        'other_player',
      ]);

      const otherTag = createReadableLabel(
        k,
        pData.name,
        pData.pos_x,
        pData.pos_y - 14,
        [140, 240, 255],
        18,
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
          k.z(8),
          'memory_object',
          { hintId: mo.hint_id, targetX: mo.x * TILE_SIZE, targetY: mo.y * TILE_SIZE },
        ]);

        const promptLabel = createReadableLabel(
          k,
          'E: Periksa',
          mo.x * TILE_SIZE + 8,
          mo.y * TILE_SIZE - 8,
          [160, 225, 255],
          25,
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

    // Kamera mengikuti pemain & update spot pancing
    player.onUpdate(() => {
      if (!player?.pos) return;
      k.setCamPos(player.pos);
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
        k.z(9),
        'npc',
        { def: npcDef },
      ]);

      createReadableLabel(
        k,
        npcDef.name,
        npcDef.x,
        npcDef.y - 14,
        [255, 240, 140],
        18,
        1
      );

      const interactLabel = createReadableLabel(
        k,
        'E: Bicara',
        npcDef.x,
        npcDef.y - 25,
        [255, 230, 80],
        24,
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
          26,
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

    // Sync broadcast posisi berkala (tiap 1.5 detik jika bergerak)
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
