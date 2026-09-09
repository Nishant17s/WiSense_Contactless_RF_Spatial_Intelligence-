'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSensing } from '@/lib/providers/DataProvider';
import { useTheme } from '@/lib/providers/ThemeProvider';
import { SCENARIOS } from '@/lib/simulation/scenarios';
import { ScenarioId } from '@/lib/types/sensing';
import { WiSenseLogo } from '@/components/brand/WiSenseLogo';
import { 
  Sun, 
  Moon, 
  Play, 
  ChevronDown, 
  ShieldAlert, 
  Activity, 
  Radio, 
  Wifi, 
  Cpu 
} from 'lucide-react';

export function AppNavbar() {
  const pathname = usePathname();
  const { state, mode, setMode, scenario, setScenario, acknowledgeFall } = useSensing();
  const { theme, toggleTheme } = useTheme();

  const isAlert = state?.safety.system_state === 'ALERT';
  const hasFall = state?.safety.fall_detected;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--ws-border)] bg-[var(--ws-surface)]/95 backdrop-blur-md transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Official WiSense Brand Lockup */}
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center group">
            <WiSenseLogo variant="compact" size={36} />
          </Link>

          {/* Quick Top Navigation Links (as shown in reference image navbar) */}
          <nav className="hidden xl:flex items-center space-x-1 pl-4 border-l border-[var(--ws-border)] text-xs font-sans">
            {[
              { name: 'Command Center', path: '/dashboard' },
              { name: 'Spatial', path: '/spatial' },
              { name: 'Signals', path: '/signals' },
              { name: 'Nodes', path: '/nodes' },
            ].map((item) => {
              const isActive = pathname === item.path || (item.path === '/dashboard' && pathname === '/');
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                    isActive
                      ? 'bg-brand-lime/20 text-slate-900 dark:text-brand-lime font-bold border border-brand-lime/30'
                      : 'text-slate-600 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Scenario Selector & Telemetry */}
        <div className="hidden lg:flex items-center space-x-3">
          {mode === 'DEMO' ? (
            <div className="flex items-center space-x-2 bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-xl px-3 py-1.5 shadow-sm">
              <div className="flex items-center space-x-1.5 text-xs text-brand-olive dark:text-brand-lime font-medium">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="font-mono uppercase text-[11px] font-bold">Scenario:</span>
              </div>
              <div className="relative">
                <select
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value as ScenarioId)}
                  aria-label="Simulation scenario"
                  className="bg-[var(--ws-surface)] border border-[var(--ws-border)] text-slate-900 dark:text-white text-xs font-mono rounded-lg px-2.5 py-1 pr-7 focus:outline-none focus:ring-1 focus:ring-brand-lime cursor-pointer appearance-none transition-colors"
                >
                  {SCENARIOS.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[var(--ws-surface)] text-slate-900 dark:text-white py-1">
                      [{s.badge}] {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-[var(--ws-surface-elevated)] border border-status-safe/40 rounded-xl px-3 py-1.5 font-mono text-xs">
              <div className="w-2 h-2 rounded-full bg-status-safe animate-ping" />
              <span className="text-status-safe font-bold">LIVE SENSOR DATA</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">100.0 Hz</span>
            </div>
          )}

          {/* Telemetry Pills */}
          <div className="flex items-center space-x-2 text-xs font-mono">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] text-slate-700 dark:text-slate-300">
              <Wifi className="w-3.5 h-3.5 text-brand-lime" />
              <span>3/3 Nodes</span>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] text-slate-700 dark:text-slate-300">
              <Activity className="w-3.5 h-3.5 text-brand-lavender" />
              <span>51 SC</span>
            </div>
          </div>
        </div>

        {/* Right: Mode Toggle + Theme Toggle + Fall Acknowledge */}
        <div className="flex items-center space-x-2.5">
          {/* Fall Alert Acknowledge Button */}
          {hasFall && (
            <button
              onClick={acknowledgeFall}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md ${
                state?.safety.acknowledged
                  ? 'bg-status-safe/20 text-status-safe border border-status-safe/40'
                  : 'bg-status-alert text-white animate-bounce hover:bg-red-700'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{state?.safety.acknowledged ? 'ACKNOWLEDGED' : 'ACKNOWLEDGE FALL'}</span>
            </button>
          )}

          {/* DEMO / LIVE Mode Selector (following official design reference) */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] font-mono text-xs">
            <button
              onClick={() => setMode('DEMO')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                mode === 'DEMO'
                  ? 'bg-brand-lime text-slate-950 font-bold shadow-sm'
                  : 'text-slate-500 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${mode === 'DEMO' ? 'bg-slate-950' : 'bg-slate-400'}`} />
              <span>DEMO</span>
            </button>
            <button
              onClick={() => setMode('LIVE')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                mode === 'LIVE'
                  ? 'bg-status-safe text-white font-bold shadow-sm'
                  : 'text-slate-500 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${mode === 'LIVE' ? 'bg-white' : 'bg-slate-400'}`} />
              <span>LIVE</span>
            </button>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[var(--ws-surface-elevated)] hover:bg-[var(--ws-border)] border border-[var(--ws-border)] text-slate-700 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-brand-lime" /> : <Moon className="w-4 h-4 text-brand-olive" />}
          </button>
        </div>
      </div>
    </header>
  );
}
