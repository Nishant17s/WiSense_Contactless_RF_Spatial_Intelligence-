'use client';

import React from 'react';
import Link from 'next/link';
import { useSensing } from '@/lib/providers/DataProvider';
import { Maximize2, Radio, User, ShieldAlert, WifiOff, RefreshCw } from 'lucide-react';
import { ZoneId } from '@/lib/types/sensing';

const ZONES: { id: ZoneId; row: string; col: string; name: string; xPct: number; yPct: number; wPct: number; hPct: number }[] = [
  { id: 'A1', row: 'A', col: '1', name: 'Zone A1', xPct: 6, yPct: 6, wPct: 29.3, hPct: 29.3 },
  { id: 'A2', row: 'A', col: '2', name: 'Zone A2', xPct: 35.3, yPct: 6, wPct: 29.3, hPct: 29.3 },
  { id: 'A3', row: 'A', col: '3', name: 'Zone A3', xPct: 64.6, yPct: 6, wPct: 29.3, hPct: 29.3 },
  { id: 'B1', row: 'B', col: '1', name: 'Zone B1', xPct: 6, yPct: 35.3, wPct: 29.3, hPct: 29.3 },
  { id: 'B2', row: 'B', col: '2', name: 'Zone B2', xPct: 35.3, yPct: 35.3, wPct: 29.3, hPct: 29.3 },
  { id: 'B3', row: 'B', col: '3', name: 'Zone B3', xPct: 64.6, yPct: 35.3, wPct: 29.3, hPct: 29.3 },
  { id: 'C1', row: 'C', col: '1', name: 'Zone C1', xPct: 6, yPct: 64.6, wPct: 29.3, hPct: 29.3 },
  { id: 'C2', row: 'C', col: '2', name: 'Zone C2', xPct: 35.3, yPct: 64.6, wPct: 29.3, hPct: 29.3 },
  { id: 'C3', row: 'C', col: '3', name: 'Zone C3', xPct: 64.6, yPct: 64.6, wPct: 29.3, hPct: 29.3 },
];

export function RoomOverview2D() {
  const { state, mode, isLiveConnected, liveError, reconnectLive } = useSensing();
  const people = state?.people || [];
  const probabilities = state?.room.zone_probabilities || ({} as Record<ZoneId, number>);
  const isAlert = state?.safety.system_state === 'ALERT';

  const isLiveOffline = mode === 'LIVE' && !isLiveConnected;

  return (
    <div className="ws-card p-5 relative overflow-hidden flex flex-col h-full bg-[var(--ws-surface)] border border-[var(--ws-border)]">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--ws-border)]">
        <div className="flex items-center space-x-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${mode === 'LIVE' ? (isLiveConnected ? 'bg-status-safe animate-ping' : 'bg-status-alert') : 'bg-brand-lime animate-pulse'}`} />
          <h3 className="font-brand text-xs uppercase font-bold tracking-wider text-slate-800 dark:text-slate-200">
            2D SPATIAL RADAR & COORDINATE GRID
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] text-slate-500 dark:text-brand-gray">
            8.0m × 6.0m RF Grid
          </span>
          {mode === 'LIVE' && (
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${isLiveConnected ? 'bg-status-safe/20 text-status-safe border border-status-safe/40' : 'bg-status-alert/20 text-status-alert border border-status-alert/40'}`}>
              {isLiveConnected ? 'LIVE FEED ACTIVE' : 'LIVE OFFLINE'}
            </span>
          )}
        </div>

        {mode !== 'LIVE' && (
          <Link
            href="/spatial"
            className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[var(--ws-surface-elevated)] hover:bg-brand-lime/15 border border-[var(--ws-border)] hover:border-brand-lime/50 text-xs font-sans font-semibold text-slate-800 dark:text-brand-lime transition-all group"
          >
            <span>LAUNCH 3D OBSERVATORY</span>
            <Maximize2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </Link>
        )}
      </div>

      {/* Main Spatial Grid Plane */}
      <div className="relative flex-1 min-h-[420px] w-full rounded-2xl bg-[#0b0d0a] border border-[#23271e] overflow-hidden flex items-center justify-center p-3 select-none">
        
        {/* SVG Precision Coordinate Radar Background */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Minor Sub-grid Pattern */}
            <pattern id="subgrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1d2218" strokeWidth="0.75" />
            </pattern>
            {/* Medium Grid Pattern */}
            <pattern id="medgrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect width="60" height="60" fill="url(#subgrid)" />
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#2c3324" strokeWidth="1" />
            </pattern>
            {/* Radial Gradient for Active Presence */}
            <radialGradient id="presenceGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#B5D04D" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#B5D04D" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#B5D04D" stopOpacity="0" />
            </radialGradient>
            {/* Radial Gradient for Fall Alert */}
            <radialGradient id="fallGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D32F2F" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#D32F2F" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#D32F2F" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Fill Minor Subgrid */}
          <rect width="100%" height="100%" fill="url(#medgrid)" />

          {/* Major Coordinate Crosshairs and Dividers (3x3 Zones: 6%, 35.3%, 64.6%, 94%) */}
          {/* Vertical Lines */}
          <line x1="6%" y1="6%" x2="6%" y2="94%" stroke="#3e4834" strokeWidth="1.5" />
          <line x1="35.33%" y1="6%" x2="35.33%" y2="94%" stroke="#4f5c42" strokeWidth="1.2" strokeDasharray="6 3" />
          <line x1="64.66%" y1="6%" x2="64.66%" y2="94%" stroke="#4f5c42" strokeWidth="1.2" strokeDasharray="6 3" />
          <line x1="94%" y1="6%" x2="94%" y2="94%" stroke="#3e4834" strokeWidth="1.5" />

          {/* Horizontal Lines */}
          <line x1="6%" y1="6%" x2="94%" y2="6%" stroke="#3e4834" strokeWidth="1.5" />
          <line x1="6%" y1="35.33%" x2="94%" y2="35.33%" stroke="#4f5c42" strokeWidth="1.2" strokeDasharray="6 3" />
          <line x1="6%" y1="64.66%" x2="94%" y2="64.66%" stroke="#4f5c42" strokeWidth="1.2" strokeDasharray="6 3" />
          <line x1="6%" y1="94%" x2="94%" y2="94%" stroke="#3e4834" strokeWidth="1.5" />

          {/* Precision Crosshair '+' markers at major 4x4 coordinate intersections */}
          {[
            { x: '6%', y: '6%' }, { x: '35.33%', y: '6%' }, { x: '64.66%', y: '6%' }, { x: '94%', y: '6%' },
            { x: '6%', y: '35.33%' }, { x: '35.33%', y: '35.33%' }, { x: '64.66%', y: '35.33%' }, { x: '94%', y: '35.33%' },
            { x: '6%', y: '64.66%' }, { x: '35.33%', y: '64.66%' }, { x: '64.66%', y: '64.66%' }, { x: '94%', y: '64.66%' },
            { x: '6%', y: '94%' }, { x: '35.33%', y: '94%' }, { x: '64.66%', y: '94%' }, { x: '94%', y: '94%' },
          ].map((pt, i) => (
            <g key={`cross-${i}`}>
              <line x1={`calc(${pt.x} - 6px)`} y1={pt.y} x2={`calc(${pt.x} + 6px)`} y2={pt.y} stroke="#B5D04D" strokeWidth="1.5" opacity="0.85" />
              <line x1={pt.x} y1={`calc(${pt.y} - 6px)`} x2={pt.x} y2={`calc(${pt.y} + 6px)`} stroke="#B5D04D" strokeWidth="1.5" opacity="0.85" />
            </g>
          ))}

          {/* Center Quadrant Target Reference Dots */}
          {[
            { x: '20.66%', y: '20.66%' }, { x: '50%', y: '20.66%' }, { x: '79.33%', y: '20.66%' },
            { x: '20.66%', y: '50%' }, { x: '50%', y: '50%' }, { x: '79.33%', y: '50%' },
            { x: '20.66%', y: '79.33%' }, { x: '50%', y: '79.33%' }, { x: '79.33%', y: '79.33%' },
          ].map((dot, idx) => (
            <circle key={`dot-${idx}`} cx={dot.x} cy={dot.y} r="2" fill="#7D7897" opacity="0.4" />
          ))}

          {/* RF Fresnel Beam Propagation Links from TX-01 (Top Center: 50%, 6%) */}
          {/* TX-01 to RX-01 (10%, 90%) */}
          <line
            x1="50%"
            y1="6%"
            x2="10%"
            y2="90%"
            stroke="#B5D04D"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.65"
          />
          {/* TX-01 to RX-02 (90%, 90%) */}
          <line
            x1="50%"
            y1="6%"
            x2="90%"
            y2="90%"
            stroke="#B5D04D"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.65"
          />
          {/* Baseline RX-01 to RX-02 */}
          <line
            x1="10%"
            y1="90%"
            x2="90%"
            y2="90%"
            stroke="#7D7897"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.4"
          />

          {/* Concentric RF Waves from TX-01 */}
          <circle cx="50%" cy="6%" r="35" fill="none" stroke="#B5D04D" strokeWidth="1" opacity="0.3" strokeDasharray="3 3" />
          <circle cx="50%" cy="6%" r="75" fill="none" stroke="#B5D04D" strokeWidth="0.8" opacity="0.2" strokeDasharray="3 3" />
          <circle cx="50%" cy="6%" r="130" fill="none" stroke="#7D7897" strokeWidth="0.6" opacity="0.15" strokeDasharray="4 4" />
        </svg>

        {/* 3x3 Zones Ambient Glow and Identifier Layer */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {ZONES.map((zone) => {
            const prob = probabilities[zone.id] || 0;
            const hasPersonInZone = people.some((p) => p.zone === zone.id);
            const isFallZone = people.some((p) => p.zone === zone.id && p.fall_detected);

            return (
              <div
                key={zone.id}
                className="absolute transition-all duration-300 flex flex-col justify-between p-2.5"
                style={{
                  left: `${zone.xPct}%`,
                  top: `${zone.yPct}%`,
                  width: `${zone.wPct}%`,
                  height: `${zone.hPct}%`,
                }}
              >
                {/* Zone Area Heat / Glow Background when occupied */}
                {isFallZone ? (
                  <div className="absolute inset-1 rounded-xl bg-status-alert/20 border border-status-alert/60 animate-pulse" />
                ) : hasPersonInZone ? (
                  <div className="absolute inset-1 rounded-xl bg-brand-lime/10 border border-brand-lime/40 shadow-[inset_0_0_20px_rgba(181,208,77,0.15)]" />
                ) : prob > 15 ? (
                  <div
                    className="absolute inset-1 rounded-xl bg-brand-lavender/5 border border-brand-lavender/20"
                    style={{ opacity: prob / 100 }}
                  />
                ) : null}

                {/* Top Corner: Zone Identifier & RF Probability */}
                <div className="relative z-10 flex items-center justify-between text-[11px] font-mono">
                  <span className={`font-bold px-1.5 py-0.5 rounded ${
                    isFallZone
                      ? 'bg-status-alert text-white'
                      : hasPersonInZone
                      ? 'bg-brand-lime text-slate-950 font-extrabold'
                      : 'text-[#6e7762]'
                  }`}>
                    {zone.id}
                  </span>

                  {prob > 5 && (
                    <span className={`text-[10px] font-mono px-1 rounded ${
                      isFallZone
                        ? 'text-status-alert font-bold'
                        : hasPersonInZone
                        ? 'text-brand-lime font-bold'
                        : 'text-slate-500'
                    }`}>
                      {prob.toFixed(0)}%
                    </span>
                  )}
                </div>

                {/* Bottom Center Status Tag (if occupied or alert) */}
                <div className="relative z-10 text-center font-mono">
                  {isFallZone ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-status-alert text-white text-[10px] font-bold animate-bounce shadow-lg">
                      <ShieldAlert className="w-3 h-3" />
                      <span>FALL DETECTED</span>
                    </span>
                  ) : hasPersonInZone ? (
                    <span className="inline-block px-2 py-0.5 rounded bg-brand-lime/20 border border-brand-lime/40 text-brand-lime text-[10px] font-bold tracking-wider">
                      OCCUPIED
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Motion Breadcrumb Trails */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          {people.map((person) => {
            if (!person.trail || person.trail.length < 2) return null;
            const pointsStr = person.trail
              .map((pt) => {
                const x = ((pt.x + 4.0) / 8.0) * 88 + 6;
                const y = ((pt.z + 3.0) / 6.0) * 88 + 6;
                return `${x}%,${y}%`;
              })
              .join(' ');

            return (
              <polyline
                key={`trail-${person.id}`}
                points={pointsStr}
                fill="none"
                stroke={person.fall_detected ? '#D32F2F' : '#B5D04D'}
                strokeWidth="2"
                strokeDasharray="2 3"
                opacity="0.75"
              />
            );
          })}
        </svg>

        {/* Real-Time Anonymous Target Beacons & Holographic HUD Tags */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-30">
          {people.map((person) => {
            // Map room coordinates: X: [-4.0, +4.0] -> [6%, 94%], Z: [-3.0, +3.0] -> [6%, 94%]
            const leftPercent = Math.min(93, Math.max(7, ((person.x + 4.0) / 8.0) * 88 + 6));
            const topPercent = Math.min(93, Math.max(7, ((person.z + 3.0) / 6.0) * 88 + 6));

            return (
              <div
                key={person.id}
                className="absolute transition-all duration-200 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
              >
                {/* Target Pin Beacon */}
                <div className="relative flex items-center justify-center">
                  {/* Outer Pulsing Wave Ring */}
                  <div
                    className={`absolute w-10 h-10 rounded-full animate-ping opacity-60 ${
                      person.fall_detected ? 'bg-status-alert' : 'bg-brand-lime'
                    }`}
                  />
                  {/* Secondary Halo */}
                  <div
                    className={`absolute w-7 h-7 rounded-full opacity-40 ${
                      person.fall_detected ? 'bg-status-alert animate-pulse' : 'bg-brand-lime'
                    }`}
                  />
                  {/* Center Blip */}
                  <div
                    className={`relative w-5 h-5 rounded-full flex items-center justify-center shadow-2xl border-2 ${
                      person.fall_detected
                        ? 'bg-status-alert text-white border-white'
                        : 'bg-brand-lime text-slate-950 border-white shadow-[0_0_15px_#B5D04D]'
                    }`}
                  >
                    <User className="w-3 h-3 font-bold" />
                  </div>
                </div>

                {/* Target HUD Pill */}
                <div
                  className={`mt-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md border text-[10px] font-mono whitespace-nowrap shadow-xl flex items-center space-x-1.5 ${
                    person.fall_detected
                      ? 'bg-status-alert text-white border-white animate-bounce'
                      : 'bg-[#181a15]/95 border-[#3e4535] text-white'
                  }`}
                >
                  <span className={person.fall_detected ? 'font-extrabold text-white' : 'font-bold text-brand-lime'}>
                    {person.id}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className={person.fall_detected ? 'text-white uppercase font-bold' : 'text-slate-300'}>
                    {person.activity}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className={person.fall_detected ? 'text-white' : 'text-brand-lime'}>
                    {person.velocity > 0 ? `${person.velocity.toFixed(2)}m/s` : 'Stationary'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hardware Node Beacons at Room Edges */}
        {/* TX-01 (Transmitter: Top Center) */}
        <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-[#181a15]/90 border border-brand-lime/50 text-[10px] font-mono text-brand-lime shadow-md">
          <Radio className="w-3 h-3 animate-pulse" />
          <span className="font-bold">TX-01</span>
          <span className="text-[8px] text-slate-400 px-1 py-0.2 rounded bg-black/40">2.4 GHz</span>
        </div>

        {/* RX-01 (Receiver: Bottom Left) */}
        <div className="absolute bottom-1.5 left-4 z-20 flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-[#181a15]/90 border border-brand-lavender/50 text-[10px] font-mono text-brand-lavender shadow-md">
          <Radio className="w-3 h-3" />
          <span className="font-bold">RX-01</span>
          <span className="text-[8px] text-slate-400 px-1 py-0.2 rounded bg-black/40">100 Hz</span>
        </div>

        {/* RX-02 (Receiver: Bottom Right) */}
        <div className="absolute bottom-1.5 right-4 z-20 flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-[#181a15]/90 border border-brand-lavender/50 text-[10px] font-mono text-brand-lavender shadow-md">
          <Radio className="w-3 h-3" />
          <span className="font-bold">RX-02</span>
          <span className="text-[8px] text-slate-400 px-1 py-0.2 rounded bg-black/40">100 Hz</span>
        </div>

        {/* Offline / Standby Overlay in LIVE Mode */}
        {isLiveOffline && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-40 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-status-alert/20 border border-status-alert/40 flex items-center justify-center text-status-alert mb-3">
              <WifiOff className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-brand font-bold text-white uppercase tracking-wider mb-1">
              LIVE SENSOR CONNECTION OFFLINE
            </h4>
            <p className="text-xs font-mono text-slate-400 max-w-md mb-4">
              {liveError || 'Hardware Gateway (ws://localhost:8000/ws/sensing) is not responding. Ensure ESP32-S3 gateway is running.'}
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={reconnectLive}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-status-safe hover:bg-emerald-600 text-white font-mono text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RECONNECT TO HARDWARE</span>
              </button>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-3">
              Simulation is paused in LIVE mode per zero-mock integrity policy.
            </span>
          </div>
        )}
      </div>

      {/* Footer Calibration Bar & Legend */}
      <div className="mt-3 pt-3 border-t border-[var(--ws-border)] flex flex-wrap items-center justify-between text-[11px] font-sans text-slate-500 dark:text-brand-gray gap-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-lime" />
            <span>Target Blip</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-lavender" />
            <span>Fresnel Channel</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-alert" />
            <span>Fall Alert</span>
          </div>
        </div>

        <div className="text-[10.5px] font-mono text-slate-400">
          X: [-4.0m, +4.0m] • Z: [-3.0m, +3.0m] • 51 Subcarriers @ 100Hz
        </div>
      </div>
    </div>
  );
}
