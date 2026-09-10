'use client';

import React, { useRef, useEffect } from 'react';
import { useSensing } from '@/lib/providers/DataProvider';

export function WaterfallSpectrogram() {
  const { state } = useSensing();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !state?.signal.spectrogram) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const spectrogram = state.signal.spectrogram;
    const numRows = spectrogram.length;
    const numCols = 51;

    const width = canvas.width;
    const height = canvas.height;

    const cellWidth = width / numCols;
    const cellHeight = height / numRows;

    // Palette: Deep Olive (#535E25) -> Spatial Lavender (#7D7897) -> Signal Lime (#B5D04D) -> Pure Light (#FEFEFE)
    const getColor = (val: number) => {
      const v = Math.min(1.0, Math.max(0.0, val));
      if (v < 0.3) {
        // Dark background to Deep Olive
        const t = v / 0.3;
        return `rgb(${Math.floor(17 + t * 66)}, ${Math.floor(19 + t * 75)}, ${Math.floor(15 + t * 22)})`;
      } else if (v < 0.7) {
        // Deep Olive to Spatial Lavender
        const t = (v - 0.3) / 0.4;
        return `rgb(${Math.floor(83 + t * 42)}, ${Math.floor(94 + t * 26)}, ${Math.floor(37 + t * 114)})`;
      } else if (v < 0.9) {
        // Lavender to Signal Lime
        const t = (v - 0.7) / 0.2;
        return `rgb(${Math.floor(125 + t * 56)}, ${Math.floor(120 + t * 88)}, ${Math.floor(151 - t * 74)})`;
      } else {
        // Signal Lime to Bright Highlight
        const t = (v - 0.9) / 0.1;
        return `rgb(${Math.floor(181 + t * 73)}, ${Math.floor(208 + t * 46)}, ${Math.floor(77 + t * 177)})`;
      }
    };

    for (let r = 0; r < numRows; r++) {
      const slice = spectrogram[r];
      for (let c = 0; c < numCols; c++) {
        const energy = slice[c] || 0.1;
        ctx.fillStyle = getColor(energy);
        ctx.fillRect(c * cellWidth, r * cellHeight, cellWidth + 0.5, cellHeight + 0.5);
      }
    }

    ctx.strokeStyle = 'rgba(46, 51, 40, 0.5)';
    ctx.lineWidth = 1;
    for (let c = 0; c < numCols; c += 10) {
      ctx.beginPath();
      ctx.moveTo(c * cellWidth, 0);
      ctx.lineTo(c * cellWidth, height);
      ctx.stroke();
    }
  }, [state?.signal.spectrogram]);

  return (
    <div className="ws-card p-5 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--ws-border)] text-xs font-sans">
        <span className="font-brand font-bold uppercase text-slate-800 dark:text-slate-200">
          TIME-FREQUENCY WATERFALL SPECTROGRAM
        </span>
        <span className="text-[10px] text-brand-olive dark:text-brand-lime font-mono font-bold">Rolling 3.0s Window</span>
      </div>

      <div className="relative flex-1 min-h-[180px] rounded-2xl overflow-hidden border border-[var(--ws-border)] bg-[#11130F]">
        <canvas
          ref={canvasRef}
          width={510}
          height={200}
          className="w-full h-full object-cover"
        />

        {/* X Axis Labels */}
        <div className="absolute bottom-1.5 left-2 right-2 flex justify-between text-[9px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded-md pointer-events-none">
          <span>SC -25 (5.18 GHz)</span>
          <span>SC 0 (2.4 GHz)</span>
          <span>SC +25 (5.30 GHz)</span>
        </div>
      </div>
    </div>
  );
}
