'use client';

import React from 'react';
import { useSensing } from '@/lib/providers/DataProvider';
import { Layers } from 'lucide-react';

export function OccupancyWidget() {
  const { state } = useSensing();
  const room = state?.room;
  const total = room?.total_people || 0;
  const maxCap = room?.max_capacity || 8;
  const breakdown = room?.zone_breakdown || { 'Zone A': 0, 'Zone B': 0, 'Zone C': 0 };

  return (
    <div className="ws-card p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--ws-border)]">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-brand-lavender" />
          <h3 className="font-brand text-xs uppercase font-bold tracking-wider text-slate-800 dark:text-slate-200">
            ROOM OCCUPANCY DISTRIBUTION
          </h3>
        </div>
        <span className="text-[10.5px] font-mono text-slate-500 dark:text-brand-gray">
          Capacity: {total}/{maxCap}
        </span>
      </div>

      {/* Zone Progress Bars */}
      <div className="space-y-3 my-1">
        {['Zone A', 'Zone B', 'Zone C'].map((zoneKey) => {
          const count = breakdown[zoneKey] || 0;
          const pct = (count / 3) * 100;

          return (
            <div key={zoneKey} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{zoneKey}</span>
                <span className="text-brand-olive dark:text-brand-lime font-mono font-bold">{count.toString().padStart(2, '0')} Occupants</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-olive to-brand-lime transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(count > 0 ? 30 : 0, pct))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Bar */}
      <div className="pt-3 border-t border-[var(--ws-border)] flex items-center justify-between text-[11px] font-sans text-slate-500 dark:text-brand-gray">
        <span>STATUS:</span>
        <span
          className={`font-semibold ${
            room?.room_status === 'EMPTY'
              ? 'text-slate-400'
              : room?.room_status === 'OVERCROWDED'
              ? 'text-status-warning'
              : 'text-status-safe'
          }`}
        >
          {room?.room_status || 'OCCUPIED'}
        </span>
      </div>
    </div>
  );
}
