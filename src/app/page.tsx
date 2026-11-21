'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#141828] flex flex-col items-center justify-center text-white font-mono">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold tracking-wider mb-2"
            style={{ fontFamily: 'monospace', imageRendering: 'pixelated' }}>
          <span className="text-green-400">Nyong</span>
          <span className="text-yellow-300">lanrika</span>
        </h1>
        <p className="text-gray-400 text-sm tracking-widest">
          Purwokerto · Pixel · Kenangan
        </p>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-4 w-64">
        <Link
          href="/play"
          className="bg-green-700 hover:bg-green-600 text-white text-center py-3 px-6 rounded-sm border-2 border-green-500 transition-colors tracking-wider"
        >
          ▶ MULAI
        </Link>
        <button
          className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-center py-3 px-6 rounded-sm border-2 border-gray-500 transition-colors tracking-wider"
          disabled
        >
          ⚙ PENGATURAN
        </button>
      </div>

      {/* Footer */}
      <p className="mt-16 text-gray-600 text-xs">
        Next.js · Kaplay.js · Supabase · v1.0
      </p>
    </main>
  );
}
