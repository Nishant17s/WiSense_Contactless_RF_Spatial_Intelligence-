'use client';

import React from 'react';
import { useSensing } from '@/lib/providers/DataProvider';
import { SCENARIOS } from '@/lib/simulation/scenarios';
import { ScenarioId } from '@/lib/types/sensing';
import { CameraViewPreset } from './CameraController';
import { 
  Activity, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  Sparkles, 
  Layers, 
  Waves, 
  Navigation,
  ShieldAlert,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { formatDbm, formatPercent } from '@/lib/utils/formatters';

interface SpatialHUDProps {
  cameraPreset: CameraViewPreset;
  setCameraPreset: (p: CameraViewPreset) => void;
  autoRotate: boolean;
  setAutoRotate: (r: boolean) => void;
  showWaveField: boolean;
  setShowWaveField: (w: boolean) => void;
  showParticles: boolean;
  setShowParticles: (p: boolean) => void;
  showHeatmap: boolean;
  setShowHeatmap: (h: boolean) => void;
  showTrails: boolean;
  setShowTrails: (t: boolean) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export function SpatialHUD({
  cameraPreset,
  setCameraPreset,
  autoRotate,
  setAutoRotate,
  showWaveField,
  setShowWaveField,
  showParticles,
  setShowParticles,
  showHeatmap,
  setShowHeatmap,
  showTrails,
  setShowTrails,
  isFullscreen,
  toggleFullscreen,
}: SpatialHUDProps) {
  const { state, scenario, setScenario, mode } = useSensing();

  const isAlert = state?.safety.system_state === 'ALERT';
  const hasFall = state?.safety.fall_detected;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20 select-none">
      {/* 1. TOP HUD STRIP */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Top Left Title */}
        <div className="ws-card rounded-2xl px-4 py-2.5 flex items-center space-x-3 shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-lime animate-ping" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-brand text-xs font-bold tracking-wider uppercase text-slate-900 dark:text-white">
                3D SPATIAL OBSERVATORY
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-brand-lime/20 text-brand-olive dark:text-brand-lime font-mono font-bold">
                100 Hz CSI
              </span>
            </div>
            <div className="text-[10px] font-sans text-slate-500 dark:text-brand-gray">
              3 Nodes Active • 51 Subcarriers • Invisible Signals
            </div>
          </div>
        </div>

        {/* Top Center Scenario Selector */}
        <div className="hidden md:flex items-center space-x-2 ws-card rounded-2xl px-3.5 py-1.5 shadow-lg">
          <span className="font-mono text-[10px] text-slate-500 dark:text-brand-gray uppercase font-bold">Scenario:</span>
          <div className="relative">
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as ScenarioId)}
              aria-label="3D spatial simulation scenario"
              className="bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] text-xs font-mono text-slate-900 dark:text-white rounded-lg px-2.5 py-0.5 pr-6 focus:outline-none focus:ring-1 focus:ring-brand-lime cursor-pointer appearance-none"
            >
              {SCENARIOS.map((s) => (
                <option key={s.id} value={s.id} className="bg-[var(--ws-surface)] text-slate-900 dark:text-white">
                  [{s.badge}] {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1.5 pointer-events-none" />
          </div>
        </div>

        {/* Top Right Fullscreen & Mode Badge */}
        <div className="flex items-center space-x-2">
          <div className="ws-card rounded-2xl px-3 py-1.5 font-mono text-xs text-brand-olive dark:text-brand-lime font-bold">
            {mode === 'DEMO' ? 'SIMULATION MODE' : 'LIVE SENSOR STREAM'}
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-2xl ws-card hover:border-brand-lime text-slate-600 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-lg"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. MIDDLE ROW (LEFT TARGET INTELLIGENCE + RIGHT RF TELEMETRY) */}
      <div className="flex items-center justify-between flex-1 py-4">
        {/* Left Target Card */}
        <div className="w-72 ws-card rounded-3xl p-4 pointer-events-auto space-y-3 shadow-2xl backdrop-blur-lg">
          <div className="flex items-center justify-between border-b border-[var(--ws-border)] pb-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-brand-olive dark:text-brand-lime" />
              <span className="font-brand text-xs font-bold uppercase text-slate-900 dark:text-slate-200">
                LIVE TARGET TRACKING
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-brand-olive dark:text-brand-lime">
              {state?.people_count || 0} Targets
            </span>
          </div>

          {state?.people && state.people.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {state.people.map((p) => (
                <div
                  key={p.id}
                  className={`p-2.5 rounded-2xl border text-xs font-sans ${
                    p.fall_detected
                      ? 'bg-status-alert/15 border-status-alert text-red-900 dark:text-red-200 animate-pulse'
                      : 'bg-[var(--ws-surface-elevated)] border-[var(--ws-border)] text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-olive dark:text-brand-lime font-brand">{p.id} ({p.zone})</span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-brand-gray">
                      {formatPercent(p.confidence)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className={p.fall_detected ? 'text-status-alert font-bold uppercase' : 'text-slate-600 dark:text-slate-300 font-semibold'}>
                      {p.activity}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-brand-gray">
                      {p.velocity > 0 ? `${p.velocity.toFixed(1)} m/s` : 'Static'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center font-sans text-xs text-slate-400">
              No targets in room. Calibrated.
            </div>
          )}

          {/* Safety Status */}
          <div
            className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs font-sans font-semibold ${
              hasFall
                ? 'bg-status-alert/15 border-status-alert text-status-alert font-bold animate-bounce'
                : 'bg-status-safe/10 border-status-safe/30 text-status-safe'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              {hasFall ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{hasFall ? 'CRITICAL FALL ALERT' : 'SAFETY WATCH OK'}</span>
            </div>
            <span className="font-mono">{hasFall ? 'ALERT' : '100%'}</span>
          </div>
        </div>

        {/* Right RF Telemetry Card */}
        <div className="w-72 ws-card rounded-3xl p-4 pointer-events-auto space-y-3 shadow-2xl backdrop-blur-lg">
          <div className="flex items-center justify-between border-b border-[var(--ws-border)] pb-2">
            <div className="flex items-center space-x-2">
              <Waves className="w-4 h-4 text-brand-lavender" />
              <span className="font-brand text-xs font-bold uppercase text-slate-900 dark:text-slate-200">
                RF SIGNAL TELEMETRY
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-status-safe/15 text-status-safe font-bold">
              LIVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-2xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)]">
              <span className="text-slate-400 block text-[9px] uppercase font-sans">RSSI:</span>
              <span className="font-bold text-brand-olive dark:text-brand-lime">{formatDbm(state?.signal.rssi || -48)}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)]">
              <span className="text-slate-400 block text-[9px] uppercase font-sans">CSI Variance:</span>
              <span className="font-bold text-slate-900 dark:text-white">{state?.signal.variance.toFixed(2) || '0.12'}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)]">
              <span className="text-slate-400 block text-[9px] uppercase font-sans">Subcarriers:</span>
              <span className="font-bold text-slate-900 dark:text-white">51 OFDM</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)]">
              <span className="text-slate-400 block text-[9px] uppercase font-sans">Motion:</span>
              <span className={`font-bold ${state?.signal.motion === 'HIGH' ? 'text-brand-olive dark:text-brand-lime' : 'text-slate-700 dark:text-slate-300'}`}>
                {state?.signal.motion || 'NONE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM CONTROL BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Layer Toggles */}
        <div className="flex items-center space-x-1.5 ws-card rounded-2xl p-1.5 shadow-lg">
          <button
            onClick={() => setShowWaveField(!showWaveField)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer ${
              showWaveField
                ? 'bg-brand-lime text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>RF WAVES</span>
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer ${
              showHeatmap
                ? 'bg-brand-lavender text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>HEATMAP</span>
          </button>

          <button
            onClick={() => setShowTrails(!showTrails)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer ${
              showTrails
                ? 'bg-brand-olive text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>TRAILS</span>
          </button>

          <button
            onClick={() => setShowParticles(!showParticles)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer ${
              showParticles
                ? 'bg-brand-lime/30 text-slate-900 dark:text-brand-lime font-bold'
                : 'text-slate-600 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>PARTICLES</span>
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer ${
              autoRotate
                ? 'bg-brand-lavender/30 text-brand-lavender font-bold'
                : 'text-slate-600 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>ORBIT</span>
          </button>
        </div>

        {/* Camera View Presets */}
        <div className="flex items-center space-x-1 ws-card rounded-2xl p-1.5 shadow-lg">
          {(['perspective', 'top_down', 'side', 'isometric'] as CameraViewPreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => setCameraPreset(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-sans uppercase transition-all cursor-pointer ${
                cameraPreset === preset
                  ? 'bg-[var(--ws-border)] text-slate-900 dark:text-white font-bold'
                  : 'text-slate-500 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {preset.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
