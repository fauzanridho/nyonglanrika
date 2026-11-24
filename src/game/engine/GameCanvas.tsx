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
import Minimap from '../ui/Minimap';
import { QUESTS } from '@/data/quests';
import { sfx } from '../audio/sfx';
import { getInventory, getMyHouse, getMyParty, getQuestsAndDiscoveries } from '@/lib/rpc';

export default function GameCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const kRef = useRef<any>(null);
  const isInitializingRef = useRef(false);
  const player = useGameStore((s) => s.player);
  const showDialog = useGameStore((s) => s.showDialog);
  const dialogNpcName = useGameStore((s) => s.dialogNpcName);
  const dialogLines = useGameStore((s) => s.dialogLines);
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
  const [wibClock, setWibClock] = useState<string>('--:--');

  useEffect(() => {
    const updateClock = () => {
      const nowStr = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date());
      setWibClock(nowStr);
    };
    updateClock();
    const timer = setInterval(updateClock, 5000);
    return () => clearInterval(timer);
  }, []);

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

    if (isInitializingRef.current || kRef.current) return;
    isInitializingRef.current = true;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      if (!isInput) {
        const moveKeys = ['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'e', 'E'];
        if (moveKeys.includes(e.key)) {
          if (ref.current && document.activeElement !== ref.current) {
            ref.current.focus();
          }
        }
      }

      if (e.key === 'b' || e.key === 'B' || e.key === 'i' || e.key === 'I') {
        sfx.playClick();
        useGameStore.getState().toggleInventory();
        setTimeout(() => ref.current?.focus(), 30);
      }
      if (e.key === 'k' || e.key === 'K') {
        sfx.playClick();
        setShowFarming((prev) => !prev);
        setTimeout(() => ref.current?.focus(), 30);
      }
      if (e.key === 'c' || e.key === 'C') {
        sfx.playClick();
        setShowCooking((prev) => !prev);
        setTimeout(() => ref.current?.focus(), 30);
      }
      if (e.key === 'p' || e.key === 'P') {
        sfx.playClick();
        setShowParty((prev) => !prev);
        setTimeout(() => ref.current?.focus(), 30);
      }
      if (e.key === 'q' || e.key === 'Q' || e.key === 'j' || e.key === 'J') {
        sfx.playClick();
        setShowQuests((prev) => !prev);
        setTimeout(() => ref.current?.focus(), 30);
      }
    };

    const handlePointerUp = () => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
      ref.current?.focus();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerup', handlePointerUp);

    (async () => {
      const { default: kaplay } = await import('kaplay');
      if (!active || !ref.current || kRef.current) {
        isInitializingRef.current = false;
        return;
      }

      const k = kaplay({
        canvas: ref.current,
        width: 640,
        height: 360,
        letterbox: true,
        crisp: true,
        global: false,
        background: [14, 17, 23],
      });

      kRef.current = k;
      isInitializingRef.current = false;

      // Muat semua sprite statis SEKALI saat inisialisasi (mencegah lag saat pindah zona)
      const { loadWorldSprites } = await import('../art/sprites/world');
      const { loadNpcSprites } = await import('../art/sprites/npcs');
      const { loadFishingSprites } = await import('../art/sprites/fishing');
      const { loadMemorySprites } = await import('../art/sprites/memories');
      loadWorldSprites(k);
      loadNpcSprites(k);
      loadFishingSprites(k);
      loadMemorySprites(k);

      registerWorldScene(k);

      const currentPlayer = useGameStore.getState().player;
      k.go('world', {
        zoneId: currentPlayer?.zone || 'alun_alun',
        spawnX: currentPlayer?.posX || undefined,
        spawnY: currentPlayer?.posY || undefined,
        look: currentPlayer?.look || {},
        playerName: currentPlayer?.name || 'Player',
        myPlayerId: currentPlayer?.id,
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
      window.removeEventListener('pointerup', handlePointerUp);
      isInitializingRef.current = false;
      if (kRef.current) {
        try {
          kRef.current.quit();
        } catch (e) {}
        kRef.current = null;
      }
    };
  }, []);

  const getWeatherIcon = (wName?: string) => {
    switch (wName) {
      case 'rain': return '🌧️ Hujan';
      case 'drizzle': return '🌦️ Gerimis';
      case 'fog': return '🌫️ Kabut';
      case 'clear': return '☀️ Cerah';
      default: return '🌤️ Purwokerto';
    }
  };

  const focusGameCanvas = () => {
    setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
      }
    }, 30);
  };

  // Cari quest aktif pertama yang belum selesai
  const doneQuestIds = new Set(questList.filter((q) => q.done).map((q) => q.quest_id));
  const activeQuest = QUESTS.find(
    (q) => !doneQuestIds.has(q.id) && (!q.prerequisite || doneQuestIds.has(q.prerequisite))
  );

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#0e1117] overflow-hidden select-none font-mono flex items-center justify-center">
      {/* ═══ TOP HUD BAR ═══ */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-2 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-b from-black/90 via-black/70 to-transparent pointer-events-none">
        {/* Left: Player Info */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs pointer-events-auto">
          <div className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full border border-yellow-500/30">
            <span className="text-yellow-400">👤</span>
            <span className="text-yellow-200 font-bold truncate max-w-[70px] sm:max-w-none">{player?.name || 'Player'}</span>
          </div>
          <div className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full border border-amber-500/30">
            <span className="text-amber-400">💰</span>
            <span className="text-amber-200 font-bold">{player?.coins ?? 0}</span>
          </div>
        </div>

        {/* Center: Zone */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs pointer-events-auto">
          <div className="bg-black/50 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            <span className="text-emerald-300 font-bold">📍 {currentZoneTitle}</span>
          </div>
        </div>

        {/* Right: Weather & Time */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs pointer-events-auto">
          <div className="bg-black/50 px-2 py-0.5 rounded-full border border-sky-500/30">
            <span className="text-sky-200">{getWeatherIcon(weather?.weather)}</span>
          </div>
          <div className="bg-black/50 px-2 py-0.5 rounded-full border border-orange-500/30">
            <span className="text-orange-200">🕒 {wibClock} WIB</span>
          </div>
          {activeBuff && activeBuff.expiresAt > Date.now() && (
            <div className="bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-400/40 animate-pulse">
              <span className="text-emerald-300 text-[9px] sm:text-[10px]">✨ Buff</span>
            </div>
          )}
        </div>
      </div>

      {/* ═══ ACTIVE QUEST TRACKER (Top Left) ═══ */}
      {activeQuest && (
        <button
          onClick={() => { sfx.playClick(); setShowQuests(true); }}
          className="absolute top-10 left-2 sm:top-12 sm:left-3 z-20 text-left bg-black/75 hover:bg-black/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-amber-500/30 shadow-xl max-w-[210px] sm:max-w-[260px] transition-colors cursor-pointer"
          title="Klik untuk buka buku quest (Q)"
        >
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-300 truncate">
            <span>🧭</span>
            <span className="truncate">{activeQuest.name}</span>
          </div>
          <div className="text-[9px] sm:text-[10px] text-gray-300 truncate mt-0.5">
            • {activeQuest.steps[0]?.description}
          </div>
        </button>
      )}

      {/* ═══ RIGHT SIDE ACTION BUTTONS ═══ */}
      <div className="absolute top-10 right-1.5 sm:top-12 sm:right-2 z-20 flex flex-col gap-1 sm:gap-1.5">
        {[
          { icon: '👗', label: 'Lemari', cls: 'text-pink-300', onClick: () => setShowWardrobe(true) },
          { icon: '📜', label: 'Quest', cls: 'text-amber-300', onClick: () => setShowQuests(true) },
          { icon: '👥', label: 'Party', cls: 'text-indigo-300', onClick: () => setShowParty(true) },
          { icon: '🌱', label: 'Kebun', cls: 'text-emerald-300', onClick: () => setShowFarming(true) },
          { icon: '🍳', label: 'Masak', cls: 'text-orange-300', onClick: () => setShowCooking(true) },
          { icon: '🎒', label: 'Tas', cls: 'text-yellow-300', onClick: () => toggleInventory() },
          { icon: '📖', label: 'Album', cls: 'text-sky-300', onClick: () => setShowAlbum(true) },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={() => { sfx.playClick(); btn.onClick(); }}
            className={`bg-black/75 hover:bg-black/95 ${btn.cls} text-[10px] sm:text-[11px] pl-1.5 pr-2 py-1 sm:py-1.5 rounded-l-lg border border-r-0 border-white/15 transition-all hover:translate-x-[-2px] shadow-lg cursor-pointer flex items-center gap-1 whitespace-nowrap`}
            title={btn.label}
          >
            <span>{btn.icon}</span>
            <span className="hidden sm:inline">{btn.label}</span>
          </button>
        ))}
        <button
          onClick={toggleSound}
          className="bg-black/70 hover:bg-black/90 text-white text-[10px] sm:text-[11px] pl-1.5 pr-2 py-1 sm:py-1.5 rounded-l-lg border border-r-0 border-white/10 transition-all hover:translate-x-[-2px] shadow-lg cursor-pointer flex items-center gap-1"
          title="Suara"
        >
          <span>{isMuted ? '🔇' : '🔊'}</span>
        </button>
      </div>

      {/* Fishing Action Banner */}
      {fishingBanner && (
        <div className={`absolute top-10 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-lg shadow-2xl text-[11px] sm:text-xs font-bold border ${
          fishingBanner.status === 'bite'
            ? 'bg-red-600/90 text-white border-red-400 animate-bounce'
            : fishingBanner.status === 'result'
            ? 'bg-emerald-700/90 text-white border-emerald-400'
            : 'bg-sky-800/90 text-sky-100 border-sky-400'
        }`}>
          {fishingBanner.msg}
        </div>
      )}

      {/* Canvas Kaplay Game (Fullscreen Letterbox Responsive) */}
      <canvas
        ref={ref}
        tabIndex={0}
        onClick={focusGameCanvas}
        style={{ imageRendering: 'pixelated' }}
        className="w-full h-full max-w-full max-h-full block object-contain outline-none focus:outline-none cursor-default"
      />

      {/* Modals & Dialogs (Auto Re-focus Canvas on Close) */}
      {showDialog && (
        <DialogBox
          npcName={dialogNpcName}
          lines={dialogLines}
          isShop={isShopNpc}
          onClose={() => {
            closeDialog();
            focusGameCanvas();
          }}
          onOpenShop={() => setShowShop(true)}
        />
      )}

      <InventoryModal />

      {showShop && (
        <ShopModal
          onClose={() => {
            setShowShop(false);
            focusGameCanvas();
          }}
        />
      )}

      {showAlbum && (
        <CollectionModal
          onClose={() => {
            setShowAlbum(false);
            focusGameCanvas();
          }}
        />
      )}

      {showFarming && houseData && (
        <FarmingModal
          houseId={houseData.id}
          initialPlots={houseData.plots}
          onClose={() => {
            setShowFarming(false);
            focusGameCanvas();
          }}
          onRefresh={refreshHouse}
        />
      )}

      {showCooking && (
        <CookingModal
          onClose={() => {
            setShowCooking(false);
            focusGameCanvas();
          }}
        />
      )}

      {showParty && (
        <PartyModal
          partyData={partyData}
          onClose={() => {
            setShowParty(false);
            focusGameCanvas();
          }}
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
            focusGameCanvas();
          }}
        />
      )}

      {showQuests && (
        <QuestModal
          questList={questList}
          discoveriesCount={discoveriesCount}
          onClose={() => {
            setShowQuests(false);
            focusGameCanvas();
          }}
          onRefresh={refreshQuests}
        />
      )}

      {showWardrobe && (
        <WardrobeModal
          onClose={() => {
            setShowWardrobe(false);
            focusGameCanvas();
          }}
          onSaved={() => {
            if (kRef.current) {
              const p = useGameStore.getState().player;
              kRef.current.go('world', {
                zoneId: p?.zone || 'alun_alun',
                spawnX: p?.posX || undefined,
                spawnY: p?.posY || undefined,
                look: p?.look || {},
                playerName: p?.name || 'Player',
                myPlayerId: p?.id,
              });
            }
          }}
        />
      )}

      {discoveredMemoryText && (
        <MemoryPopup
          hintText={discoveredMemoryText}
          onClose={() => {
            setDiscoveredMemoryText(null);
            focusGameCanvas();
          }}
        />
      )}

      {/* Minimap (Desktop) */}
      <Minimap />

      {/* Kontrol Layar Sentuh Mobile / HP */}
      <MobileControls
        onActionPress={() => {
          window.dispatchEvent(new KeyboardEvent('keypress', { key: ' ' }));
        }}
        onSecondaryPress={() => {
          window.dispatchEvent(new KeyboardEvent('keypress', { key: 'e' }));
        }}
      />

      {/* Control Hint Bar (Desktop only, bottom center) */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 text-[9px] sm:text-[10px] text-gray-500 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5 hidden md:flex items-center gap-2 pointer-events-none">
        <span>WASD <span className="text-gray-400">gerak</span></span>
        <span className="text-gray-600">•</span>
        <span>E/Spasi <span className="text-gray-400">aksi</span></span>
        <span className="text-gray-600">•</span>
        <span>Q <span className="text-gray-400">quest</span></span>
        <span className="text-gray-600">•</span>
        <span>B <span className="text-gray-400">tas</span></span>
        <span className="text-gray-600">•</span>
        <span>K <span className="text-gray-400">kebun</span></span>
        <span className="text-gray-600">•</span>
        <span>C <span className="text-gray-400">masak</span></span>
        <span className="text-gray-600">•</span>
        <span>P <span className="text-gray-400">party</span></span>
      </div>
    </div>
  );
}
