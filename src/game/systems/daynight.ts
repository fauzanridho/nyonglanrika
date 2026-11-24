// ============================================================
// Sistem Siklus Waktu WIB (Asia/Jakarta) & Cuaca Server
// ============================================================

import type { KAPLAYCtx } from 'kaplay';
import { getWeather } from '@/lib/rpc';
import { sfx } from '../audio/sfx';

export interface WeatherData {
  weather: string;
  intensity: number;
  hour: number;
  date: string;
}

export class DayNightWeatherSystem {
  private k: KAPLAYCtx;
  private overlay: any = null;
  private rainParticles: any[] = [];
  private updateTimer: number | null = null;
  private onUpdateCallback?: (data: WeatherData) => void;

  constructor(k: KAPLAYCtx) {
    this.k = k;
  }

  public async init(onUpdate?: (data: WeatherData) => void): Promise<WeatherData | null> {
    this.onUpdateCallback = onUpdate;

    // Buat layer overlay full canvas untuk tint warna waktu
    this.overlay = this.k.add([
      this.k.rect(this.k.width(), this.k.height()),
      this.k.pos(0, 0),
      this.k.color(0, 0, 0),
      this.k.opacity(0),
      this.k.fixed(),
      this.k.z(2000),
      'daynight_overlay',
    ]);

    const data = await this.fetchAndApplyWeather();

    // Polling cuaca & waktu setiap 60 detik agar selalu sinkron dengan waktu sekarang
    this.updateTimer = window.setInterval(() => {
      this.fetchAndApplyWeather();
    }, 60000);

    return data;
  }

  public async fetchAndApplyWeather(): Promise<WeatherData | null> {
    try {
      const data = await getWeather();
      this.applyDayNightTint(data.hour);
      this.applyWeatherEffects(data.weather, data.intensity);
      if (this.onUpdateCallback) {
        this.onUpdateCallback(data);
      }
      return data;
    } catch (e) {
      console.warn('Gagal memuat cuaca server, menggunakan waktu lokal WIB:', e);
      const nowWIB = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      const hour = nowWIB.getHours();
      this.applyDayNightTint(hour);
      return null;
    }
  }

  /**
   * Warna nuansa berdasarkan jam WIB asli:
   * - 05:00 - 08:59 Pagi hangat
   * - 09:00 - 14:59 Siang terang normal
   * - 15:00 - 17:59 Senja oranye Banyumasan
   * - 18:00 - 04:59 Malam biru gelap
   */
  public applyDayNightTint(hour: number) {
    if (!this.overlay) return;

    if (hour >= 5 && hour < 9) {
      this.overlay.color = this.k.rgb(255, 200, 120);
      this.overlay.opacity = 0.12;
    } else if (hour >= 9 && hour < 15) {
      this.overlay.color = this.k.rgb(255, 255, 255);
      this.overlay.opacity = 0;
    } else if (hour >= 15 && hour < 18) {
      this.overlay.color = this.k.rgb(240, 120, 40);
      this.overlay.opacity = 0.25;
    } else {
      this.overlay.color = this.k.rgb(15, 20, 55);
      this.overlay.opacity = 0.42;
    }
  }

  public applyWeatherEffects(weather: string, intensity: number) {
    this.clearParticles();

    if (weather === 'rain' || weather === 'drizzle') {
      sfx.startRain(intensity);
      const dropCount = Math.min(24, weather === 'rain' ? 14 * intensity : 10);

      for (let i = 0; i < dropCount; i++) {
        const drop = this.k.add([
          this.k.rect(1, this.k.rand(4, 7)),
          this.k.pos(this.k.rand(0, this.k.width()), this.k.rand(0, this.k.height())),
          this.k.color(180, 215, 255),
          this.k.opacity(this.k.rand(0.3, 0.7)),
          this.k.fixed(),
          this.k.z(2001),
          'rain_drop',
        ]);

        drop.onUpdate(() => {
          drop.pos.y += 320 * this.k.dt();
          drop.pos.x -= 80 * this.k.dt();
          if (drop.pos.y > this.k.height()) {
            drop.pos.y = -10;
            drop.pos.x = this.k.rand(0, this.k.width() + 100);
          }
        });

        this.rainParticles.push(drop);
      }
    } else if (weather === 'fog') {
      sfx.stopRain();
      if (this.overlay) {
        this.overlay.color = this.k.rgb(220, 230, 240);
        this.overlay.opacity = Math.max(this.overlay.opacity, 0.3);
      }
    } else {
      sfx.stopRain();
    }
  }

  private clearParticles() {
    this.rainParticles.forEach((p) => {
      try {
        p.destroy();
      } catch (e) {}
    });
    this.rainParticles = [];
  }

  public destroy() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    this.clearParticles();
    sfx.stopRain();
  }
}
