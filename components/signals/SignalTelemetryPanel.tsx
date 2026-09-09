'use client';

import React from 'react';
import { useSensing } from '@/lib/providers/DataProvider';
import { Sliders } from 'lucide-react';
import { formatDbm } from '@/lib/utils/formatters';

export function SignalTelemetryPanel() {
  const { state, dspSettings, setDspSettings } = useSensing();
  const signal = state?.signal;

  const toggleHampel = () => {
    setDspSettings((prev) => ({ ...prev, hampel: !prev.hampel }));
  };

  const toggleButterworth = () => {
    setDspSettings((prev) => ({ ...prev, butterworth: !prev.butterworth }));
  };

  return (
    <div className="ws-card p-5 flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--ws-border)]">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-brand-olive dark:text-brand-lime" />
          <h3 className="font-brand text-xs uppercase font-bold tracking-wider text-slate-800 dark:text-slate-200">
            DSP FILTERS & SIGNAL METRICS
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-brand-lime/15 text-brand-olive dark:text-brand-lime font-bold">
          100.0 Hz Stream
        </span>
      </div>

      {/* Signal Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-3 rounded-2xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)]">
          <span className="text-slate-400 block text-[9px] uppercase font-sans">RSSI LEVEL:</span>
          <span className="font-bold text-brand-olive dark:text-brand-lime text-sm">{formatDbm(signal?.rssi || -48)}</span>
        </div>
        <div className="p-3 rounded-2xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)]">
          <span className="text-slate-400 block text-[9px] uppercase font-sans">CSI VARIANCE (σ²):</span>
          <span className="font-bold text-slate-900 dark:text-white text-sm">{signal?.variance.toFixed(2) || '0.15'}</span>
        </div>
        <div className="p-3 rounded-2xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)]">
          <span className="text-slate-400 block text-[9px] uppercase font-sans">NOISE FLOOR:</span>
          <span className="font-bold text-slate-600 dark:text-brand-gray text-sm">-93.5 dBm</span>
        </div>
        <div className="p-3 rounded-2xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)]">
          <span className="text-slate-400 block text-[9px] uppercase font-sans">ACTIVE SUBCARRIERS:</span>
          <span className="font-bold text-slate-900 dark:text-white text-sm">{dspSettings.subcarrierCount} / 51 SC</span>
        </div>
      </div>

      {/* DSP Sanitization Controls */}
      <div className="p-3.5 rounded-2xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] space-y-2">
        <div className="text-[10px] font-brand font-bold text-slate-500 dark:text-brand-gray uppercase">
          REAL-TIME SIGNAL PIPELINE:
        </div>

        <div className="space-y-1.5 text-xs font-sans">
          <button
            onClick={toggleHampel}
            className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-[var(--ws-surface)] transition-colors text-left"
          >
            <span className="text-slate-700 dark:text-slate-300">1. Hampel Outlier Filter (k=7)</span>
            {dspSettings.hampel ? (
              <span className="text-status-safe font-bold font-mono text-[10px] px-2 py-0.5 rounded-md bg-status-safe/10 border border-status-safe/30">
                ACTIVE
              </span>
            ) : (
              <span className="text-slate-400 font-mono text-[10px] px-2 py-0.5 rounded-md bg-[var(--ws-surface)]">
                BYPASS
              </span>
            )}
          </button>

          <button
            onClick={toggleButterworth}
            className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-[var(--ws-surface)] transition-colors text-left"
          >
            <span className="text-slate-700 dark:text-slate-300">2. Butterworth LPF (fc=15Hz)</span>
            {dspSettings.butterworth ? (
              <span className="text-status-safe font-bold font-mono text-[10px] px-2 py-0.5 rounded-md bg-status-safe/10 border border-status-safe/30">
                ACTIVE
              </span>
            ) : (
              <span className="text-slate-400 font-mono text-[10px] px-2 py-0.5 rounded-md bg-[var(--ws-surface)]">
                BYPASS
              </span>
            )}
          </button>

          <div className="flex items-center justify-between p-2 text-slate-700 dark:text-slate-300">
            <span>3. Linear Phase Unwrapping</span>
            <span className="text-brand-lavender font-bold font-mono text-[10px] px-2 py-0.5 rounded-md bg-brand-lavender/15 border border-brand-lavender/30">
              LOCKED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
