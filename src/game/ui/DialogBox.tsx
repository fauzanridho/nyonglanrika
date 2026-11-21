'use client';

import { useState, useEffect } from 'react';
import { sfx } from '@/game/audio/sfx';

export interface DialogBoxProps {
  npcName: string;
  lines: string[];
  isShop?: boolean;
  onClose: () => void;
  onOpenShop?: () => void;
}

export default function DialogBox({
  npcName,
  lines,
  isShop,
  onClose,
  onOpenShop,
}: DialogBoxProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const handleNext = () => {
    sfx.playClick();
    if (currentLineIndex < lines.length - 1) {
      setCurrentLineIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  // Dengarkan tombol E, Spasi, Enter, Escape agar interaksi terasa mulus tanpa harus klik mouse
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKey, { capture: true });
    return () => window.removeEventListener('keydown', handleKey, { capture: true });
  }, [currentLineIndex, lines]);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-30 font-mono">
      <div className="bg-[#181d2f]/95 border-2 border-[#546282] rounded shadow-2xl p-4 text-white backdrop-blur-md">
        {/* Header NPC Name */}
        <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/10">
          <span className="text-yellow-300 font-bold text-sm tracking-wide">
            💬 {npcName}
          </span>
          <span className="text-[10px] text-gray-400">
            {currentLineIndex + 1} / {lines.length} (E / Spasi untuk lanjut)
          </span>
        </div>

        {/* Dialog Text */}
        <p className="text-sm text-gray-200 min-h-[44px] leading-relaxed">
          {lines[currentLineIndex]}
        </p>

        {/* Footer Buttons */}
        <div className="mt-3 flex items-center justify-between">
          <div>
            {isShop && onOpenShop && (
              <button
                onClick={() => {
                  sfx.playClick();
                  onClose();
                  onOpenShop();
                }}
                className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded border border-amber-400 font-bold shadow flex items-center gap-1 cursor-pointer"
              >
                🏪 Buka Toko Pasar
              </button>
            )}
          </div>

          <button
            onClick={handleNext}
            className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded border border-emerald-500 transition-colors shadow flex items-center gap-1 cursor-pointer"
          >
            {currentLineIndex < lines.length - 1 ? 'Lanjut ▶ (Spasi)' : 'Selesai ✕ (Spasi)'}
          </button>
        </div>
      </div>
    </div>
  );
}
