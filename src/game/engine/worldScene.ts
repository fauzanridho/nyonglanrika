// ============================================================
// Scene World: Alun-alun, Gerak Pemain, Kamera, Tabrakan, Autosave
// ============================================================

import type { KAPLAYCtx } from 'kaplay';
import { ZONES } from '@/data/zones';
import { loadWorldSprites } from '../art/sprites/world';
import { loadPlayerSprite, PlayerLook } from '../art/sprites/player';
import { saveState } from '@/lib/rpc';

export interface WorldSceneOptions {
  zoneId?: string;
  spawnX?: number;
  spawnY?: number;
  look?: PlayerLook;
  playerName?: string;
}

export function registerWorldScene(k: KAPLAYCtx) {
  k.scene('world', (opts: WorldSceneOptions = {}) => {
    const currentZoneId = opts.zoneId || 'alun_alun';
    const zoneDef = ZONES[currentZoneId] || ZONES['alun_alun'];

    // Muat sprites
    loadWorldSprites(k);
    loadPlayerSprite(k, opts.look);

    const SPEED = 85;
    const TILE_SIZE = 16;

    // Render Grid Peta menggunakan addLevel
    const tileConfig: Record<string, () => any[]> = {
      'T': () => [k.sprite('tree'), k.area(), k.body({ isStatic: true }), 'obstacle'],
      'b': () => [k.sprite('bench'), k.area(), k.body({ isStatic: true }), 'obstacle', 'bench'],
      'L': () => [k.sprite('lamp'), k.area(), k.body({ isStatic: true }), 'obstacle', 'lamp'],
      'R': () => [k.sprite('water'), k.area(), k.body({ isStatic: true }), 'obstacle', 'water'],
      'W': () => [k.sprite('water'), k.area(), k.body({ isStatic: true }), 'obstacle', 'water'],
      'P': () => [k.sprite('pine'), k.area(), k.body({ isStatic: true }), 'obstacle'],
      'B': () => [k.sprite('paving')],
      '.': () => [k.sprite('grass')],
    };

    const level = k.addLevel(zoneDef.grid, {
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      pos: k.vec2(0, 0),
      tiles: tileConfig,
    });

    // Spawn Player
    const startX = opts.spawnX ?? zoneDef.spawnX ?? 15 * 16;
    const startY = opts.spawnY ?? zoneDef.spawnY ?? 8 * 16;

    const player = k.add([
      k.sprite('player', { anim: 'idle-down' }),
      k.pos(startX, startY),
      k.area({ shape: new k.Rect(k.vec2(2, 6), 12, 10) }), // Area tabrakan di bagian kaki
      k.body(),
      k.anchor('center'),
      k.z(10),
      'player',
    ]);

    // Name Tag di atas kepala player
    if (opts.playerName) {
      const tag = k.add([
        k.text(opts.playerName, { size: 6 }),
        k.pos(player.pos.x, player.pos.y - 12),
        k.anchor('center'),
        k.color(255, 255, 200),
        k.z(11),
      ]);
      tag.onUpdate(() => {
        tag.pos = k.vec2(player.pos.x, player.pos.y - 12);
      });
    }

    // Kamera mengikuti pemain
    player.onUpdate(() => {
      k.setCamPos(player.pos);
    });

    // Kontrol Gerak 4 Arah
    let isMoving = false;
    let lastDir = 'down';

    function handleMovement() {
      let moveX = 0;
      let moveY = 0;

      if (k.isKeyDown('left') || k.isKeyDown('a')) moveX -= 1;
      if (k.isKeyDown('right') || k.isKeyDown('d')) moveX += 1;
      if (k.isKeyDown('up') || k.isKeyDown('w')) moveY -= 1;
      if (k.isKeyDown('down') || k.isKeyDown('s')) moveY += 1;

      if (moveX !== 0 && moveY !== 0) {
        // Normalisasi diagonal speed
        moveX *= 0.7071;
        moveY *= 0.7071;
      }

      if (moveX !== 0 || moveY !== 0) {
        player.move(moveX * SPEED, moveY * SPEED);

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
          player.flipX = true; // Balik kiri
        } else if (moveX > 0) {
          targetAnim = 'walk-side';
          lastDir = 'side';
          player.flipX = false; // Hadap kanan
        }

        if (player.curAnim() !== targetAnim) {
          player.play(targetAnim);
        }
        isMoving = true;
      } else {
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

    // Logika Portal Antar-Zona
    if (zoneDef.portals && zoneDef.portals.length > 0) {
      zoneDef.portals.forEach((p) => {
        const portalObj = k.add([
          k.rect(TILE_SIZE, TILE_SIZE),
          k.pos(p.x * TILE_SIZE, p.y * TILE_SIZE),
          k.area(),
          k.opacity(0), // Tidak terlihat
          'portal',
          { targetZone: p.to, targetX: p.spawnX, targetY: p.spawnY },
        ]);

        portalObj.onCollide('player', () => {
          // Trigger autosave posisi zona baru
          saveState(p.to, Math.round(p.spawnX), Math.round(p.spawnY)).catch(console.error);
          k.go('world', {
            zoneId: p.to,
            spawnX: p.spawnX,
            spawnY: p.spawnY,
            look: opts.look,
            playerName: opts.playerName,
          });
        });
      });
    }

    // Autosave Posisi setiap 15 detik saat pemain bergerak
    let lastSavedX = player.pos.x;
    let lastSavedY = player.pos.y;
    const saveInterval = setInterval(() => {
      const dist = Math.hypot(player.pos.x - lastSavedX, player.pos.y - lastSavedY);
      if (dist > 10) {
        lastSavedX = player.pos.x;
        lastSavedY = player.pos.y;
        saveState(currentZoneId, Math.round(player.pos.x), Math.round(player.pos.y)).catch(console.error);
      }
    }, 15000);

    // Save state saat unload/tutup tab
    const handleBeforeUnload = () => {
      saveState(currentZoneId, Math.round(player.pos.x), Math.round(player.pos.y)).catch(console.error);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    k.onDestroy(() => {
      clearInterval(saveInterval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
    });
  });
}
