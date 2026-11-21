'use client';

import { useEffect, useRef } from 'react';

export default function GameCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let k: any; // eslint-disable-line @typescript-eslint/no-explicit-any

    (async () => {
      const { default: kaplay } = await import('kaplay');

      k = kaplay({
        canvas: ref.current!,
        width: 480,
        height: 270,
        scale: 3,
        crisp: true,
        global: false,
        background: [20, 24, 40],
      });

      // Placeholder scene - akan diganti di Phase 1
      k.scene('world', () => {
        k.add([
          k.text('Nyonglanrika', { size: 16 }),
          k.pos(240, 100),
          k.anchor('center'),
          k.color(255, 255, 255),
        ]);

        k.add([
          k.text('Phase 0 selesai! Siap untuk Phase 1.', { size: 8 }),
          k.pos(240, 140),
          k.anchor('center'),
          k.color(150, 200, 150),
        ]);
      });

      k.go('world');
    })();

    return () => {
      k?.quit();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ imageRendering: 'pixelated' }}
      className="border-2 border-gray-700"
    />
  );
}
