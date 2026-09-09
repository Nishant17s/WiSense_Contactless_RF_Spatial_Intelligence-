'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Box, 
  Waves, 
  Network, 
  History, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Sparkles
} from 'lucide-react';
import { useSensing } from '@/lib/providers/DataProvider';

const NAV_ITEMS = [
  {
    name: 'Command Center',
    path: '/dashboard',
    icon: LayoutDashboard,
    badge: 'Live',
    desc: 'Real-time spatial overview',
  },
  {
    name: 'Spatial Intelligence',
    path: '/spatial',
    icon: Box,
    badge: '3D',
    desc: 'Cinematic 3D RF observatory',
  },
  {
    name: 'CSI Signal Lab',
    path: '/signals',
    icon: Waves,
    badge: '51 SC',
    desc: 'Doppler & Phase Spectrogram',
  },
  {
    name: 'Nodes',
    path: '/nodes',
    icon: Network,
    badge: '3 Nodes',
    desc: 'ESP32-S3 Hardware Topology',
  },
  {
    name: 'History',
    path: '/history',
    icon: History,
    badge: null,
    desc: 'Spatial analytics timeline',
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
    badge: null,
    desc: 'System, DSP & AI thresholds',
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { state } = useSensing();

  const isAlert = state?.safety.system_state === 'ALERT';

  return (
    <aside
      className={`relative flex flex-col border-r border-[var(--ws-border)] bg-[var(--ws-surface)] transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path === '/dashboard' && pathname === '/');

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`group flex items-center ${
                collapsed ? 'justify-center px-0' : 'px-3.5'
              } py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? 'ws-nav-active'
                  : 'text-slate-600 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white hover:bg-[var(--ws-surface-elevated)]'
              }`}
              title={collapsed ? `${item.name} - ${item.desc}` : undefined}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-brand-olive dark:text-brand-lime' : 'text-slate-500 dark:text-slate-400 group-hover:text-brand-lime'
                }`}
              />
              {!collapsed && (
                <div className="ml-3 flex-1 flex items-center justify-between truncate">
                  <div className="truncate font-sans">
                    <div className="text-xs font-semibold">{item.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.desc}</div>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md uppercase font-bold ${
                        isActive
                          ? 'bg-brand-lime text-slate-950'
                          : 'bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] text-slate-500 dark:text-brand-gray'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Brand Values / System Status Pill */}
      {!collapsed && (
        <div className="m-3 p-3.5 rounded-2xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] text-xs space-y-2.5">
          <div className="flex items-center justify-between font-mono text-[10.5px]">
            <span className="text-slate-500 dark:text-brand-gray uppercase">SENSING STATUS</span>
            <span className="flex items-center space-x-1 font-bold">
              {isAlert ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-status-alert animate-bounce" />
                  <span className="text-status-alert">ALERT</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-status-safe" />
                  <span className="text-status-safe">SYSTEM SAFE</span>
                </>
              )}
            </span>
          </div>

          <div className="pt-2 border-t border-[var(--ws-border)] grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div>
              <span className="text-slate-400 block">HARDWARE:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">3 × ESP32-S3</span>
            </div>
            <div>
              <span className="text-slate-400 block">RATE:</span>
              <span className="font-semibold text-brand-olive dark:text-brand-lime">100.0 Hz</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-[var(--ws-border)] flex items-center justify-between">
        {!collapsed && (
          <span className="text-[10px] font-mono text-slate-400">WiSense • Privacy First</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-[var(--ws-surface-elevated)] hover:bg-[var(--ws-border)] border border-[var(--ws-border)] text-slate-500 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
