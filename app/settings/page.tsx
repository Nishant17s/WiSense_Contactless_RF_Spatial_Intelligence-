'use client';

import React, { useState } from 'react';
import { useSensing } from '@/lib/providers/DataProvider';
import { Settings, Server, Radio, Sliders, Cpu, RefreshCw, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const { mode, setMode, dspSettings, setDspSettings, isLiveConnected, reconnectLive, liveError } = useSensing();
  const [apiUrl, setApiUrl] = useState('http://localhost:8000/api/v1');
  const [wsUrl, setWsUrl] = useState('ws://localhost:8000/ws/sensing');
  const [roomWidth, setRoomWidth] = useState('8.0');
  const [roomLength, setRoomLength] = useState('6.0');
  const [fallSensitivity, setFallSensitivity] = useState('High (0.85 Threshold)');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="ws-card p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-2xl bg-brand-lime/15 text-brand-olive dark:text-brand-lime">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-brand text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              WISENSE CONFIGURATION & CALIBRATION
            </h1>
            <p className="text-xs text-slate-500 dark:text-brand-gray font-sans">
              Room dimensions, RF DSP pipeline, Edge AI thresholds, and Gateway integration
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-status-safe/15 border border-status-safe/30 text-status-safe font-sans text-xs font-bold animate-pulse">
            <CheckCircle className="w-4 h-4" />
            <span>CALIBRATION SAVED</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Operating Mode & Backend Gateway */}
        <div className="ws-card p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[var(--ws-border)]">
            <Server className="w-4 h-4 text-brand-olive dark:text-brand-lime" />
            <h3 className="font-brand text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
              OPERATING MODE & BACKEND GATEWAY
            </h3>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div>
              <label className="text-slate-500 dark:text-brand-gray block mb-1 font-semibold uppercase text-[10px]">SYSTEM RUNTIME MODE:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode('DEMO')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    mode === 'DEMO'
                      ? 'bg-brand-lime text-slate-950 border-brand-lime shadow-sm'
                      : 'bg-[var(--ws-surface-elevated)] border-[var(--ws-border)] text-slate-600 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  SIMULATION / DEMO
                </button>
                <button
                  onClick={() => setMode('LIVE')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    mode === 'LIVE'
                      ? 'bg-status-safe text-white border-status-safe shadow-sm'
                      : 'bg-[var(--ws-surface-elevated)] border-[var(--ws-border)] text-slate-600 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  LIVE ESP32-S3 SENSOR
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-500 dark:text-brand-gray block mb-1 font-semibold uppercase text-[10px]">FASTAPI REST ENDPOINT:</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-xl p-2.5 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-brand-gray block mb-1 font-semibold uppercase text-[10px]">WEBSOCKET CSI STREAM URL:</label>
              <input
                type="text"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                className="w-full bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-xl p-2.5 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={reconnectLive}
                className="w-full py-2.5 px-3 rounded-xl bg-[var(--ws-surface-elevated)] hover:bg-[var(--ws-border)] border border-[var(--ws-border)] flex items-center justify-center space-x-2 text-slate-800 dark:text-slate-200 font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-brand-olive dark:text-brand-lime" />
                <span>TEST GATEWAY CONNECTION</span>
              </button>
            </div>

            {liveError && mode === 'LIVE' && (
              <div className="p-3 rounded-xl bg-status-alert/15 border border-status-alert/40 text-red-900 dark:text-red-200 text-[11px] font-mono">
                {liveError}
              </div>
            )}
          </div>
        </div>

        {/* 2. Room Calibration & Zone Geometry */}
        <div className="ws-card p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[var(--ws-border)]">
            <Radio className="w-4 h-4 text-brand-lavender" />
            <h3 className="font-brand text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
              ROOM GEOMETRY & ZONE CALIBRATION
            </h3>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 dark:text-brand-gray block mb-1 font-semibold uppercase text-[10px]">ROOM WIDTH (X):</label>
                <input
                  type="text"
                  value={roomWidth}
                  onChange={(e) => setRoomWidth(e.target.value)}
                  className="w-full bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-xl p-2.5 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-500 dark:text-brand-gray block mb-1 font-semibold uppercase text-[10px]">ROOM LENGTH (Z):</label>
                <input
                  type="text"
                  value={roomLength}
                  onChange={(e) => setRoomLength(e.target.value)}
                  className="w-full bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-xl p-2.5 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 dark:text-brand-gray block mb-1 font-semibold uppercase text-[10px]">SPATIAL SUB-GRID:</label>
              <div className="p-3 rounded-xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] text-slate-700 dark:text-slate-300 text-[11px] font-mono">
                3×3 Matrix: A1, A2, A3 • B1, B2, B3 • C1, C2, C3 (9 Zones)
              </div>
            </div>

            <div>
              <label className="text-slate-500 dark:text-brand-gray block mb-1 font-semibold uppercase text-[10px]">TX/RX SENSOR ANCHORS:</label>
              <div className="p-3 rounded-xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] text-slate-700 dark:text-slate-300 text-[11px] space-y-1 font-mono">
                <div>• TX-01: [0.0m, 1.2m, -4.2m] (North Wall)</div>
                <div>• RX-01: [-3.8m, 1.2m, +3.8m] (South-West Corner)</div>
                <div>• RX-02: [+3.8m, 1.2m, +3.8m] (South-East Corner)</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Signal DSP & Sampling */}
        <div className="ws-card p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[var(--ws-border)]">
            <Sliders className="w-4 h-4 text-brand-olive dark:text-brand-lime" />
            <h3 className="font-brand text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
              RF DSP SANITIZATION PARAMETERS
            </h3>
          </div>

          <div className="space-y-2.5 font-sans text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)]">
              <span>Hampel Window Size (k):</span>
              <span className="text-brand-olive dark:text-brand-lime font-mono font-bold">7 Samples</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)]">
              <span>Butterworth LPF Cutoff:</span>
              <span className="text-brand-olive dark:text-brand-lime font-mono font-bold">15.0 Hz</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)]">
              <span>CSI Sample Rate:</span>
              <span className="text-brand-olive dark:text-brand-lime font-mono font-bold">100.0 Hz (ESP32-S3)</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)]">
              <span>OFDM Subcarriers:</span>
              <span className="text-brand-olive dark:text-brand-lime font-mono font-bold">51 Active Channels</span>
            </div>
          </div>
        </div>

        {/* 4. Edge AI & Safety Thresholds */}
        <div className="ws-card p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[var(--ws-border)]">
            <Cpu className="w-4 h-4 text-brand-lavender" />
            <h3 className="font-brand text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
              EDGE AI & SAFETY SENSITIVITY
            </h3>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div>
              <label className="text-slate-500 dark:text-brand-gray block mb-1 font-semibold uppercase text-[10px]">FALL DETECTION SENSITIVITY:</label>
              <select
                value={fallSensitivity}
                onChange={(e) => setFallSensitivity(e.target.value)}
                className="w-full bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-xl p-2.5 text-slate-900 dark:text-white font-sans"
              >
                <option>High (0.85 Threshold - Recommended)</option>
                <option>Medium (0.90 Threshold)</option>
                <option>Low (0.95 Threshold)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)]">
              <span>Classifier:</span>
              <span className="text-brand-olive dark:text-brand-lime font-bold">Random Forest + XGBoost</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)]">
              <span>Inference Latency:</span>
              <span className="text-status-safe font-mono font-bold">&lt; 10 ms</span>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSave}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-lime hover:bg-brand-lime/90 text-slate-950 font-bold shadow-sm transition-all cursor-pointer"
              >
                SAVE & APPLY CALIBRATION
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
