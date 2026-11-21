'use client';

export interface MobileControlsProps {
  onActionPress: () => void;
  onSecondaryPress: () => void;
}

export default function MobileControls({
  onActionPress,
  onSecondaryPress,
}: MobileControlsProps) {
  const triggerKey = (key: string, type: 'keydown' | 'keyup') => {
    window.dispatchEvent(new KeyboardEvent(type, { key }));
  };

  return (
    <div className="md:hidden fixed inset-x-0 bottom-3 z-40 flex justify-between items-end px-6 pointer-events-none select-none font-mono">
      {/* Virtual D-Pad (Arah Panah) */}
      <div className="relative w-36 h-36 pointer-events-auto bg-black/40 backdrop-blur-md rounded-full border border-white/10 p-2 shadow-2xl flex items-center justify-center">
        {/* Atas */}
        <button
          onTouchStart={() => triggerKey('ArrowUp', 'keydown')}
          onTouchEnd={() => triggerKey('ArrowUp', 'keyup')}
          className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-800/90 active:bg-emerald-600 rounded-t border border-white/20 text-white font-bold text-sm flex items-center justify-center shadow"
        >
          ▲
        </button>

        {/* Bawah */}
        <button
          onTouchStart={() => triggerKey('ArrowDown', 'keydown')}
          onTouchEnd={() => triggerKey('ArrowDown', 'keyup')}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-800/90 active:bg-emerald-600 rounded-b border border-white/20 text-white font-bold text-sm flex items-center justify-center shadow"
        >
          ▼
        </button>

        {/* Kiri */}
        <button
          onTouchStart={() => triggerKey('ArrowLeft', 'keydown')}
          onTouchEnd={() => triggerKey('ArrowLeft', 'keyup')}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-800/90 active:bg-emerald-600 rounded-l border border-white/20 text-white font-bold text-sm flex items-center justify-center shadow"
        >
          ◀
        </button>

        {/* Kanan */}
        <button
          onTouchStart={() => triggerKey('ArrowRight', 'keydown')}
          onTouchEnd={() => triggerKey('ArrowRight', 'keyup')}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-800/90 active:bg-emerald-600 rounded-r border border-white/20 text-white font-bold text-sm flex items-center justify-center shadow"
        >
          ▶
        </button>
      </div>

      {/* Action Buttons (Aksi & Interaksi) */}
      <div className="flex gap-3 pointer-events-auto items-center">
        {/* Tombol Sekunder (Periksa / Bicara E) */}
        <button
          onTouchStart={onSecondaryPress}
          className="w-13 h-13 bg-amber-600/90 active:bg-amber-500 rounded-full border-2 border-amber-400 text-white font-bold text-xs shadow-2xl flex flex-col items-center justify-center"
        >
          <span>E</span>
          <span className="text-[8px] opacity-80">Bicara</span>
        </button>

        {/* Tombol Utama (Aksi / Mancing Spasi) */}
        <button
          onTouchStart={onActionPress}
          className="w-16 h-16 bg-emerald-600/90 active:bg-emerald-500 rounded-full border-2 border-emerald-400 text-white font-bold text-sm shadow-2xl flex flex-col items-center justify-center"
        >
          <span>ACT</span>
          <span className="text-[9px] opacity-90">Spasi</span>
        </button>
      </div>
    </div>
  );
}
