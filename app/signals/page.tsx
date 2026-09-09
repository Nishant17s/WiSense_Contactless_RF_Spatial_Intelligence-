'use client';

import React, { useState } from 'react';
import { AmplitudePhasePlot } from '@/components/signals/AmplitudePhasePlot';
import { WaterfallSpectrogram } from '@/components/signals/WaterfallSpectrogram';
import { DopplerSpectrum, SubcarrierHeatmap } from '@/components/signals/DopplerSpectrum';
import { SignalTelemetryPanel } from '@/components/signals/SignalTelemetryPanel';
import { Waves } from 'lucide-react';

export default function SignalsPage() {
  const [selectedLink, setSelectedLink] = useState<'TX_RX1' | 'TX_RX2'>('TX_RX1');

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1700px] mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ws-card p-5">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-2xl bg-brand-lime/15 text-brand-olive dark:text-brand-lime">
            <Waves className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-brand text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              CSI SIGNAL LAB & RF SPECTRAL INSPECTION
            </h1>
            <p className="text-xs text-slate-500 dark:text-brand-gray font-sans">
              Raw 51-subcarrier Channel State Information, Doppler velocity shift, and DSP sanitization
            </p>
          </div>
        </div>

        {/* Link Path Selector */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-slate-400 text-[11px] uppercase">RF Link:</span>
          <button
            onClick={() => setSelectedLink('TX_RX1')}
            className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer font-sans text-xs ${
              selectedLink === 'TX_RX1'
                ? 'bg-brand-lime text-slate-950 font-bold border-brand-lime shadow-sm'
                : 'bg-[var(--ws-surface-elevated)] border-[var(--ws-border)] text-slate-600 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            TX-01 → RX-01 (Path A)
          </button>
          <button
            onClick={() => setSelectedLink('TX_RX2')}
            className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer font-sans text-xs ${
              selectedLink === 'TX_RX2'
                ? 'bg-brand-lavender text-white font-bold border-brand-lavender shadow-sm'
                : 'bg-[var(--ws-surface-elevated)] border-[var(--ws-border)] text-slate-600 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            TX-01 → RX-02 (Path B)
          </button>
        </div>
      </div>

      {/* Top Row: 51 Subcarrier Amplitude & Phase + DSP Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <AmplitudePhasePlot />
        </div>
        <div className="lg:col-span-4">
          <SignalTelemetryPanel />
        </div>
      </div>

      {/* Subcarrier Heatmap */}
      <SubcarrierHeatmap />

      {/* Bottom Row: Doppler FFT Spectrum + Rolling Spectrogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DopplerSpectrum />
        <WaterfallSpectrogram />
      </div>
    </div>
  );
}
