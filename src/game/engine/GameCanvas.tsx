'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { registerWorldScene } from './worldScene';
import DialogBox from '../ui/DialogBox';
import InventoryModal from '../ui/InventoryModal';
import ShopModal from '../ui/ShopModal';
import CollectionModal from '../ui/CollectionModal';
import FarmingModal, { PlotData } from '../ui/FarmingModal';
import CookingModal from '../ui/CookingModal';
import PartyModal, { PartyData } from '../ui/PartyModal';
import HouseEditorModal from '../ui/HouseEditorModal';
import QuestModal, { QuestProgressItem } from '../ui/QuestModal';
import MemoryPopup from '../ui/MemoryPopup';
import MobileControls from '../ui/MobileControls';
import WardrobeModal from '../ui/WardrobeModal';
import { sfx } from '../audio/sfx';
import { getInventory, getMyHouse, getMyParty, getQuestsAndDiscoveries } from '@/lib/rpc';

export default function GameCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const kRef = useRef<any>(null);
  const player = useGameStore((s) => s.player);
  const showDialog = useGameStore((s) => s.showDialog);
  const dialogNpcName = useGameStore((s) => s.dialogNpcName);
  const dialogLines = useGameStore((s) => s.dialogLines);
  const openDialog = useGameStore((s) => s.openDialog);
  const closeDialog = useGameStore((s) => s.closeDialog);
  const weather = useGameStore((s) => s.weather);
  const toggleInventory = useGameStore((s) => s.toggleInventory);
  const setInventory = useGameStore((s) => s.setInventory);
  const activeBuff = useGameStore((s) => s.activeBuff);

  const [currentZoneTitle, setCurrentZoneTitle] = useState('Alun-alun Purwokerto');
  const [isMuted, setIsMuted] = useState(false);
  const [isShopNpc, setIsShopNpc] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showAlbum, setShowAlbum] = useState(false);
  const [showFarming, setShowFarming] = useState(false);
  const [showCooking, setShowCooking] = useState(false);
  const [showParty, setShowParty] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [showHouseEditor, setShowHouseEditor] = useState<string | null>(null);

  const [houseData, setHouseData] = useState<{ id: string; plots: PlotData[] } | null>(null);
  const [partyData, setPartyData] = useState<PartyData | null>(null);
  const [questList, setQuestList] = useState<QuestProgressItem[]>([]);
  const [discoveriesCount, setDiscoveriesCount] = useState(0);
  const [discoveredMemoryText, setDiscoveredMemoryText] = useState<string | null>(null);
  const [fishingBanner, setFishingBanner] = useState<{ status: string; msg?: string } | null>(null);

  const refreshHouse = () => {
    getMyHouse()
      .then((h) => {
        if (h && h.id) {
          setHouseData({ id: h.id, plots: h.plots || [] });
        }
      })
      .catch((e) => {
        console.warn('House not ready yet:', e?.message);
      });
  };

  const refreshParty = () => {
    getMyParty()
      .then((p) => {
        setPartyData(p);
      })
      .catch(console.error);
  };

  const refreshQuests = () => {
    getQuestsAndDiscoveries()
      .then((qd) => {
        setQuestList(qd.quests || []);
        setDiscoveriesCount(qd.discoveries?.length || 0);
      })
      .catch(console.error);
  };

  useEffect(() => {
    getInventory().then(setInventory).catch(console.error);
    refreshHouse();
    refreshParty();
    refreshQuests();
  }, [setInventory]);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sfx.setMuted(nextMuted);
    if (!nextMuted) sfx.playClick();
  };

  useEffect(() => {
    let active = true;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'b' || e.key === 'B' || e.key === 'i' || e.key === 'I') {
        sfx.playClick();
        toggleInventory();
      }
      if (e.key === 'k' || e.key === 'K') {
        sfx.playClick();
        setShowFarming((prev) => !prev);
      }
      if (e.key === 'c' || e.key === 'C') {
        sfx.playClick();
        setShowCooking((prev) => !prev);
      }
      if (e.key === 'p' || e.key === 'P') {
        sfx.playClick();
        setShowParty((prev) => !prev);
      }
      if (e.key === 'q' || e.key === 'Q' || e.key === 'j' || e.key === 'J') {
        sfx.playClick();
        setShowQuests((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    (async () => {
      const { default: kaplay } = await import('kaplay');
      if (!active || !ref.current) return;
      if (kRef.current) return;

      const k = kaplay({
        canvas: ref.current,
        width: 480,
        height: 270,
        scale: 2.5,
        crisp: true,
        global: false,
        background: [20, 24, 40],
      });

      kRef.current = k;
      registerWorldScene(k);

      // Daftarkan scene world jika belum
      registerWorldScene(k);

      const currentPlayer = useGameStore.getState().player;
      k.go('world', {
        zoneId: currentPlayer?.zone || 'alun_alun',
        spawnX: currentPlayer?.posX || undefined,
        spawnY: currentPlayer?.posY || undefined,
        look: currentPlayer?.look || {},
        playerName: currentPlayer?.name || 'Player',
        onOpenDialog: (npcName: string, lines: string[], isShop?: boolean) => {
          setIsShopNpc(!!isShop);
          useGameStore.getState().openDialog(npcName, lines);
        },
        onWeatherChange: (w: { weather: string; intensity: number; hour: number; date: string }) => {
          useGameStore.getState().setWeather(w);
        },
        onFishingStatus: (status: 'idle' | 'waiting' | 'bite' | 'result', msg?: string) => {
          setFishingBanner(status === 'idle' ? null : { status, msg });
        },
        onZoneChange: (zoneName: string) => {
          setCurrentZoneTitle(zoneName);
        },
        onDiscoverMemory: (text: string) => {
          setDiscoveredMemoryText(text);
          refreshQuests();
        },
      });
    })();

    return () => {
      active = false;
      window.removeEventListener('keydown', handleKeyDown);
      if (kRef.current) {
        try {
          kRef.current.quit();
        } catch (e) {}
        kRef.current = null;
      }
    };
  }, [toggleInventory]);

  const getWeatherIcon = (wName?: string) => {
    switch (wName) {
      case 'rain': return '🌧️ Hujan';
      case 'drizzle': return '🌦️ Gerimis';
      case 'fog': return '🌫️ Kabut';
      case 'clear': return '☀️ Cerah';
      default: return '🌤️ Purwokerto';
    }
  };

  return (
    <div className="relative flex flex-col items-center select-none font-mono">
      {/* Top Bar Info & Status Cuaca/WIB */}
      <div className="absolute top-2 left-2 z-20 flex flex-wrap gap-2 text-xs bg-black/70 px-3 py-1.5 rounded text-white backdrop-blur-sm border border-white/10 shadow-lg">
        <div>👤 <span className="text-yellow-300 font-bold">{player?.name || 'Player'}</span></div>
        <div className="border-l border-white/20 pl-2">💰 <span className="text-amber-400 font-bold">{player?.coins ?? 0}</span></div>
        <div className="border-l border-white/20 pl-2">📍 <span className="text-emerald-400 font-bold">{currentZoneTitle}</span></div>
        <div className="border-l border-white/20 pl-2 text-sky-300">{getWeatherIcon(weather?.weather)}</div>
        <div className="border-l border-white/20 pl-2 text-amber-200">
          🕒 {weather?.hour !== undefined ? `${String(weather.hour).padStart(2, '0')}:00 WIB` : 'WIB'}
        </div>
        {activeBuff && activeBuff.expiresAt > Date.now() && (
          <div className="border-l border-white/20 pl-2 text-emerald-300 animate-pulse">
            ✨ Buff {activeBuff.type.replace('_', ' ')}
          </div>
        )}
      </div>

      {/* Top Right Action Buttons */}
      <div className="absolute top-2 right-2 z-20 flex gap-1.5">
        <button
          onClick={() => {
            sfx.playClick();
            setShowWardrobe(true);
          }}
          className="bg-black/70 hover:bg-black/90 text-pink-300 text-xs px-2 py-1.5 rounded border border-white/10 transition-colors shadow-lg"
          title="Lemari Pakaian & Akun"
        >
          👗 Lemari
        </button>

        <button
          onClick={() => {
            sfx.playClick();
            setShowQuests(true);
          }}
          className="bg-black/70 hover:bg-black/90 text-amber-300 text-xs px-2 py-1.5 rounded border border-white/10 transition-colors shadow-lg"
          title="Buku Quest & Jurnal Kenangan (Q)"
        >
          📜 Quest
        </button>

        <button
          onClick={() => {
            sfx.playClick();
            setShowParty(true);
          }}
          className="bg-black/70 hover:bg-black/90 text-indigo-300 text-xs px-2 py-1.5 rounded border border-white/10 transition-colors shadow-lg"
          title="Party & Rumah Bersama (P)"
        >
          👥 Party
        </button>

        <button
          onClick={() => {
            sfx.playClick();
            setShowFarming(true);
          }}
          className="bg-black/70 hover:bg-black/90 text-emerald-300 text-xs px-2 py-1.5 rounded border border-white/10 transition-colors shadow-lg"
          title="Kebun Rumah (K)"
        >
          🌱 Kebun
        </button>

        <button
          onClick={() => {
            sfx.playClick();
            setShowCooking(true);
          }}
          className="bg-black/70 hover:bg-black/90 text-orange-300 text-xs px-2 py-1.5 rounded border border-white/10 transition-colors shadow-lg"
          title="Dapur Masak (C)"
        >
          🍳 Masak
        </button>

        <button
          onClick={() => {
            sfx.playClick();
            toggleInventory();
          }}
          className="bg-black/70 hover:bg-black/90 text-yellow-300 text-xs px-2 py-1.5 rounded border border-white/10 transition-colors shadow-lg"
          title="Buka Tas (B)"
        >
          🎒 Tas
        </button>

        <button
          onClick={() => {
            sfx.playClick();
            setShowAlbum(true);
          }}
          className="bg-black/70 hover:bg-black/90 text-sky-300 text-xs px-2 py-1.5 rounded border border-white/10 transition-colors shadow-lg"
          title="Album Koleksi"
        >
          📖 Album
        </button>

        <button
          onClick={toggleSound}
          className="bg-black/70 hover:bg-black/90 text-white text-xs px-2.5 py-1.5 rounded border border-white/10 transition-colors shadow-lg"
          title="Bisukan / Nyalakan Suara"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Fishing Action Banner */}
      {fishingBanner && (
        <div className={`absolute top-12 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded shadow-2xl text-xs font-bold border ${
          fishingBanner.status === 'bite'
            ? 'bg-red-600/90 text-white border-red-400 animate-bounce'
            : fishingBanner.status === 'result'
            ? 'bg-emerald-700/90 text-white border-emerald-400'
            : 'bg-sky-800/90 text-sky-100 border-sky-400'
        }`}>
          {fishingBanner.msg}
        </div>
      )}

      {/* Canvas Kaplay Game */}
      <canvas
        ref={ref}
        style={{ imageRendering: 'pixelated' }}
        className="border-2 border-gray-700 shadow-2xl rounded-sm"
      />

      {/* Modals & Dialogs */}
      {showDialog && (
        <DialogBox
          npcName={dialogNpcName}
          lines={dialogLines}
          isShop={isShopNpc}
          onClose={closeDialog}
          onOpenShop={() => setShowShop(true)}
        />
      )}

      <InventoryModal />

      {showShop && <ShopModal onClose={() => setShowShop(false)} />}

      {showAlbum && <CollectionModal onClose={() => setShowAlbum(false)} />}

      {showFarming && houseData && (
        <FarmingModal
          houseId={houseData.id}
          initialPlots={houseData.plots}
          onClose={() => setShowFarming(false)}
          onRefresh={refreshHouse}
        />
      )}

      {showCooking && <CookingModal onClose={() => setShowCooking(false)} />}

      {showParty && (
        <PartyModal
          partyData={partyData}
          onClose={() => setShowParty(false)}
          onRefresh={() => {
            refreshParty();
            refreshHouse();
          }}
          onOpenHouseEditor={(houseId) => {
            setShowParty(false);
            setShowHouseEditor(houseId);
          }}
        />
      )}

      {showHouseEditor && (
        <HouseEditorModal
          houseId={showHouseEditor}
          isShared={true}
          onClose={() => {
            setShowHouseEditor(null);
            refreshParty();
          }}
        />
      )}

      {showQuests && (
        <QuestModal
          questList={questList}
          discoveriesCount={discoveriesCount}
          onClose={() => setShowQuests(false)}
          onRefresh={refreshQuests}
        />
      )}

      {showWardrobe && (
        <WardrobeModal
          onClose={() => setShowWardrobe(false)}
          onSaved={() => {
            if (kRef.current) {
              const p = useGameStore.getState().player;
              kRef.current.go('world', {
                zoneId: p?.zone || 'alun_alun',
                spawnX: p?.posX || undefined,
                spawnY: p?.posY || undefined,
                look: p?.look || {},
                playerName: p?.name || 'Player',
              });
            }
          }}
        />
      )}

      {discoveredMemoryText && (
        <MemoryPopup
          hintText={discoveredMemoryText}
          onClose={() => setDiscoveredMemoryText(null)}
        />
      )}

      {/* Kontrol Layar Sentuh Mobile / HP */}
      <MobileControls
        onActionPress={() => {
          window.dispatchEvent(new KeyboardEvent('keypress', { key: ' ' }));
        }}
        onSecondaryPress={() => {
          window.dispatchEvent(new KeyboardEvent('keypress', { key: 'e' }));
        }}
      />

      {/* Control Hint Bar */}
      <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
        <span>Gerak: <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-200 rounded border border-gray-600">WASD</kbd></span>
        <span>•</span>
        <span>Aksi: <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-200 rounded border border-gray-600">E / Spasi</kbd></span>
        <span>•</span>
        <span>Lemari: 👗</span>
        <span>•</span>
        <span>Quest: <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-200 rounded border border-gray-600">Q</kbd></span>
        <span>•</span>
        <span>Party: <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-200 rounded border border-gray-600">P</kbd></span>
        <span>•</span>
        <span>Kebun: <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-200 rounded border border-gray-600">K</kbd></span>
        <span>•</span>
        <span>Masak: <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-200 rounded border border-gray-600">C</kbd></span>
        <span>•</span>
        <span>Tas: <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-200 rounded border border-gray-600">B</kbd></span>
      </div>
    </div>
  );
}
