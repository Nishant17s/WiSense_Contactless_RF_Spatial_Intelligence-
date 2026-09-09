'use client';

import React, { useRef, useEffect } from 'react';
import { useSensing } from '@/lib/providers/DataProvider';

export function AmplitudePhasePlot() {
  const { state } = useSensing();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const amplitude = state?.signal.amplitude || [];
  const phase = state?.signal.phase || [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || amplitude.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#11130F';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#24291F';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let x = 0; x < w; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    const n = amplitude.length; // 51
    const step = w / (n - 1);

    // 1. Draw Amplitude Curve in Signal Lime (#B5D04D)
    ctx.beginPath();
    ctx.strokeStyle = '#B5D04D';
    ctx.lineWidth = 2.5;

    for (let i = 0; i < n; i++) {
      const val = amplitude[i]; // 10 to 60
      const normY = h - ((val - 10) / 55) * (h - 20) - 10;
      if (i === 0) ctx.moveTo(0, normY);
      else ctx.lineTo(i * step, normY);
    }
    ctx.stroke();

    // 2. Draw Phase Unwrapped Curve in Spatial Lavender (#7D7897)
    ctx.beginPath();
    ctx.strokeStyle = '#7D7897';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    for (let i = 0; i < n; i++) {
      const pVal = phase[i];
      const normY = h / 2 - (pVal / Math.PI) * (h / 3);
      if (i === 0) ctx.moveTo(0, normY);
      else ctx.lineTo(i * step, normY);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }, [amplitude, phase]);

  return (
    <div className="ws-card p-5 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--ws-border)] text-xs font-sans">
        <span className="font-brand font-bold uppercase text-slate-800 dark:text-slate-200">
          51 SUBCARRIER CSI AMPLITUDE & PHASE PROFILE
        </span>
        <div className="flex items-center space-x-3 text-[10.5px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 rounded-full bg-brand-lime" />
            <span className="text-brand-olive dark:text-brand-lime font-bold">Amplitude (|H_k|)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 rounded-full bg-brand-lavender" />
            <span className="text-brand-lavender font-bold">Phase (∠H_k)</span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] rounded-2xl overflow-hidden border border-[var(--ws-border)] bg-[#11130F]">
        <canvas
          ref={canvasRef}
          width={600}
          height={220}
          className="w-full h-full object-fill"
        />
        <div className="absolute bottom-1.5 left-2 right-2 flex justify-between text-[9px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded-md pointer-events-none">
          <span>Subcarrier #1 (-25)</span>
          <span>Center Carrier #26 (0)</span>
          <span>Subcarrier #51 (+25)</span>
        </div>
      </div>
    </div>
  );
}
