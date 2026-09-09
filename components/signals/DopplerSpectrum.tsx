'use client';

import React, { useRef, useEffect } from 'react';
import { useSensing } from '@/lib/providers/DataProvider';

export function DopplerSpectrum() {
  const { state } = useSensing();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fft = state?.signal.fft;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fft) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#11130F';
    ctx.fillRect(0, 0, w, h);

    // Center zero line
    ctx.strokeStyle = '#2E3328';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();

    const freqs = fft.frequencies;
    const mags = fft.magnitudes;
    const n = freqs.length;
    const barWidth = w / n;

    // Draw Doppler Magnitude bars in Signal Lime / Spatial Lavender
    for (let i = 0; i < n; i++) {
      const mag = mags[i] || 0.05;
      const barHeight = (mag / 2.0) * (h - 20);
      const x = i * barWidth;
      const y = h - barHeight;

      const freq = freqs[i];
      const isPositive = freq >= 0;
      ctx.fillStyle = isPositive ? 'rgba(181, 208, 77, 0.85)' : 'rgba(125, 120, 151, 0.85)';

      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
    }
  }, [fft]);

  return (
    <div className="ws-card p-5 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--ws-border)] text-xs font-sans">
        <span className="font-brand font-bold uppercase text-slate-800 dark:text-slate-200">
          DOPPLER FREQUENCY SHIFT (FFT VELOCITY)
        </span>
        <span className="text-[10px] text-brand-lavender font-mono font-bold">5.24 GHz Carrier</span>
      </div>

      <div className="relative flex-1 min-h-[180px] rounded-2xl overflow-hidden border border-[var(--ws-border)] bg-[#11130F]">
        <canvas
          ref={canvasRef}
          width={510}
          height={180}
          className="w-full h-full object-fill"
        />
        <div className="absolute bottom-1.5 left-2 right-2 flex justify-between text-[9px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded-md pointer-events-none">
          <span>-50 Hz (Receding)</span>
          <span>0 Hz (Static Base)</span>
          <span>+50 Hz (Approaching)</span>
        </div>
      </div>
    </div>
  );
}

export function SubcarrierHeatmap() {
  const { state } = useSensing();
  const amplitude = state?.signal.amplitude || [];

  return (
    <div className="ws-card p-5 flex flex-col">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--ws-border)] text-xs font-sans">
        <span className="font-brand font-bold uppercase text-slate-800 dark:text-slate-200">
          51 OFDM SUBCARRIER ENERGY MATRIX
        </span>
        <span className="text-[10px] font-mono text-slate-500 dark:text-brand-gray">IEEE 802.11n/ac CSI</span>
      </div>

      <div className="grid grid-cols-17 gap-1.5 p-3 bg-[#11130F] rounded-2xl border border-[var(--ws-border)]">
        {amplitude.map((val, idx) => {
          const scIndex = idx - 25;
          const intensity = Math.min(1.0, Math.max(0.1, val / 60));

          return (
            <div
              key={idx}
              className="group relative flex flex-col items-center justify-center p-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
              style={{
                backgroundColor: `rgba(181, 208, 77, ${intensity * 0.85})`,
                border: '1px solid rgba(181, 208, 77, 0.5)',
              }}
              title={`SC ${scIndex >= 0 ? '+' : ''}${scIndex}: ${val.toFixed(1)} dB`}
            >
              <span className="text-[8px] font-mono text-slate-950 font-bold select-none">
                {scIndex}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
