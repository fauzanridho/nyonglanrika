// ============================================================
// Sistem Memancing (State Machine, Timing Minigame, RPC Validasi)
// ============================================================

import type { KAPLAYCtx } from 'kaplay';
import { startCast, catchFish, getPlayer, getInventory } from '@/lib/rpc';
import { useGameStore } from '@/store/gameStore';
import { sfx } from '../audio/sfx';

export interface FishingSystemCallbacks {
  onBite: () => void;
  onCatchResult: (res: { caught: boolean; name?: string; rarity?: string }) => void;
}

export class FishingSystem {
  private k: KAPLAYCtx;
  private currentSpot: string | null = null;
  private castTimeout: any = null;
  private biteWindowTimeout: any = null;
  private isBiting: boolean = false;
  private isWaiting: boolean = false;
  private spotPrompt: any = null;

  constructor(k: KAPLAYCtx) {
    this.k = k;
  }

  public init(spots: { id: string; x: number; y: number }[]) {
    const TILE_SIZE = 16;

    spots.forEach((spot) => {
      // Objek spot pancing di dunia game
      this.k.add([
        this.k.sprite('fish_spot'),
        this.k.pos(spot.x * TILE_SIZE, spot.y * TILE_SIZE),
        this.k.area(),
        this.k.z(10), // Di atas air
        'fishing_spot',
        { spotId: spot.id },
      ]);
    });

    // Prompt mengambang di atas spot saat pemain mendekat
    this.spotPrompt = this.k.add([
      this.k.text('Spasi: Mulai Mancing', { size: 6 }),
      this.k.pos(0, 0),
      this.k.anchor('center'),
      this.k.color(255, 255, 100),
      this.k.opacity(0),
      this.k.z(20),
      'spot_prompt',
    ]);
  }

  public update(playerPos: any, spots: { id: string; x: number; y: number }[]) {
    const TILE_SIZE = 16;
    let nearSpot: { id: string; x: number; y: number } | null = null;
    let minDist = 48; // Jangkauan luas (3 tile radius)

    spots.forEach((s) => {
      // Perhitungan jarak dari pusat tile spot
      const spotCenterX = s.x * TILE_SIZE + TILE_SIZE / 2;
      const spotCenterY = s.y * TILE_SIZE + TILE_SIZE / 2;
      const dist = Math.hypot(playerPos.x - spotCenterX, playerPos.y - spotCenterY);
      if (dist < minDist) {
        minDist = dist;
        nearSpot = s;
      }
    });

    if (nearSpot !== null && !this.isWaiting && !this.isBiting) {
      const activeSpot: { id: string; x: number; y: number } = nearSpot;
      this.currentSpot = activeSpot.id;
      this.spotPrompt.pos = this.k.vec2(activeSpot.x * TILE_SIZE + 8, activeSpot.y * TILE_SIZE - 10);
      this.spotPrompt.opacity = 1;
    } else {
      if (!this.isWaiting && !this.isBiting) {
        this.currentSpot = null;
        if (this.spotPrompt) {
          this.spotPrompt.opacity = 0;
        }
      }
    }
  }

  /**
   * Pemain menekan Spasi: Lempar kail atau tarik kail
   */
  public async handleActionKey(
    onStatusChange: (status: 'idle' | 'waiting' | 'bite' | 'result', msg?: string) => void
  ) {
    // 1. Sedang ada ikan menyambar (Bite): Pemain menarik kail!
    if (this.isBiting && this.currentSpot) {
      this.isBiting = false;
      clearTimeout(this.biteWindowTimeout);

      onStatusChange('result', 'Menarik kail...');
      sfx.playStep();

      try {
        const result = await catchFish(this.currentSpot);
        if (result.caught) {
          sfx.playCoin();
          onStatusChange('result', `Berhasil menangkap ${result.name} (${result.rarity})!`);

          // Update store inventory & player
          const [updatedPlayer, updatedInv] = await Promise.all([getPlayer(), getInventory()]);
          if (updatedPlayer) {
            useGameStore.getState().setPlayer({
              id: updatedPlayer.id,
              name: updatedPlayer.name,
              look: updatedPlayer.look as Record<string, string>,
              coins: updatedPlayer.coins,
              zone: updatedPlayer.zone,
              posX: updatedPlayer.pos_x,
              posY: updatedPlayer.pos_y,
            });
          }
          useGameStore.getState().setInventory(updatedInv);
        } else {
          onStatusChange('result', 'Ikan terlepas!');
        }
      } catch (e: any) {
        onStatusChange('result', `Gagal: ${e.message}`);
      } finally {
        this.isWaiting = false;
        setTimeout(() => onStatusChange('idle'), 2500);
      }
      return;
    }

    // 2. Jika sedang menunggu gigitan ikan, jangan lempar lagi
    if (this.isWaiting) {
      return;
    }

    // 3. Mulai melempar pancing jika berada di dekat spot
    if (this.currentSpot) {
      try {
        await startCast(this.currentSpot);
        this.isWaiting = true;
        if (this.spotPrompt) this.spotPrompt.opacity = 0;
        sfx.playClick();
        onStatusChange('waiting', 'Kail dilempar... Menunggu ikan menyambar (2-5 detik)');

        // Jeda acak 2.5 s/d 5.5 detik sebelum ikan menyambar
        const waitTime = Math.random() * 3000 + 2500;

        this.castTimeout = setTimeout(() => {
          if (!this.isWaiting) return;
          this.isBiting = true;
          sfx.playCoin();
          onStatusChange('bite', '❗ IKAN MENYAMBAR! TEKAN SPASI SEKARANG!');

          // Jendela timing tarik ikan (1.2 detik agar lebih ramah)
          this.biteWindowTimeout = setTimeout(() => {
            if (this.isBiting) {
              this.isBiting = false;
              this.isWaiting = false;
              onStatusChange('result', 'Terlambat! Ikan kabur membawa umpan.');
              setTimeout(() => onStatusChange('idle'), 2000);
            }
          }, 1200);
        }, waitTime);
      } catch (e: any) {
        onStatusChange('result', e.message);
        setTimeout(() => onStatusChange('idle'), 2000);
      }
    }
  }

  public destroy() {
    clearTimeout(this.castTimeout);
    clearTimeout(this.biteWindowTimeout);
  }
}
