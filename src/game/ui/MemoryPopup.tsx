'use client';

import { sfx } from '@/game/audio/sfx';

export interface MemoryPopupProps {
  hintText: string;
  onClose: () => void;
}

export default function MemoryPopup({ hintText, onClose }: MemoryPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md font-mono select-none animate-fade-in">
      <div className="bg-[#151928] border-2 border-indigo-400/80 rounded-lg w-[90%] max-w-md p-6 text-white shadow-2xl text-center relative overflow-hidden">
        {/* Dekorasi Cahaya Misterius */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl" />

        <div className="text-3xl mb-3 animate-pulse">✨ 📜 ✨</div>

        <h3 className="text-sm font-bold text-amber-300 tracking-widest uppercase mb-3 pb-2 border-b border-white/10">
          Kenangan Tersembunyi Ditemukan
        </h3>

        <p className="text-xs text-gray-200 italic leading-relaxed my-4 px-2 py-3 bg-black/40 rounded border border-white/5 font-serif">
          "{hintText}"
        </p>

        <p className="text-[10px] text-gray-400 mb-4">
          Catatan kenangan ini telah disimpan di Jurnal Temuan Anda.
        </p>

        <button
          onClick={() => {
            sfx.playClick();
            onClose();
          }}
          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded border border-indigo-400 font-bold transition-colors shadow-lg"
        >
          Simpan ke Hati 💖
        </button>
      </div>
    </div>
  );
}
