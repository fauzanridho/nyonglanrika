'use client';

import { useEffect, useState } from 'react';
import { joinParty, signInAnonymously, getSession } from '@/lib/rpc';
import { useParams, useRouter } from 'next/navigation';

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function handleJoin() {
      try {
        // Pastikan sudah login
        let session = await getSession();
        if (!session) {
          await signInAnonymously();
        }

        await joinParty(code);
        setStatus('success');
        setTimeout(() => router.push('/play'), 2000);
      } catch (err: unknown) {
        setStatus('error');
        const msg = err instanceof Error ? err.message : String(err);
        const friendlyErrors: Record<string, string> = {
          INVITE_INVALID: 'Undangan tidak valid atau sudah kedaluwarsa.',
          ALREADY_IN_PARTY: 'Kamu sudah bergabung dengan party lain.',
          PARTY_FULL: 'Party sudah penuh.',
          COOLDOWN: 'Kamu baru keluar dari party. Tunggu 24 jam.',
        };
        setErrorMsg(friendlyErrors[msg] || msg);
      }
    }
    handleJoin();
  }, [code, router]);

  return (
    <div className="min-h-screen bg-[#141828] flex items-center justify-center text-white font-mono">
      <div className="bg-gray-800 p-8 rounded border-2 border-gray-600 w-80 text-center">
        <h2 className="text-xl mb-4 text-yellow-300">Undangan Party</h2>
        <p className="text-gray-400 mb-4">Kode: <span className="text-white font-bold">{code}</span></p>

        {status === 'loading' && <p className="animate-pulse text-green-400">Bergabung...</p>}
        {status === 'success' && (
          <div>
            <p className="text-green-400 mb-2">✅ Berhasil bergabung!</p>
            <p className="text-gray-400 text-sm">Mengalihkan ke game...</p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <p className="text-red-400 mb-4">{errorMsg}</p>
            <button
              onClick={() => router.push('/play')}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-sm border border-gray-500"
            >
              Kembali ke Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
