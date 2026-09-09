'use client';

import React from 'react';
import { useSensing } from '@/lib/providers/DataProvider';
import { History, AlertTriangle } from 'lucide-react';

export function RecentEventsWidget() {
  const { state } = useSensing();
  const events = state?.events || [];

  return (
    <div className="ws-card p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--ws-border)]">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-brand-lavender" />
          <h3 className="font-brand text-xs uppercase font-bold tracking-wider text-slate-800 dark:text-slate-200">
            RECENT SPATIAL EVENT LOG
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] text-slate-500 dark:text-brand-gray">
          100 Hz Ingestion
        </span>
      </div>

      {/* Events List */}
      <div className="flex-1 space-y-2 overflow-y-auto max-h-[220px] pr-1">
        {events.slice(0, 6).map((evt) => {
          const isCritical = evt.severity === 'CRITICAL';
          const isWarn = evt.severity === 'WARNING';

          return (
            <div
              key={evt.id}
              className={`p-2.5 rounded-xl border text-xs font-sans flex items-start space-x-2.5 transition-all ${
                isCritical
                  ? 'bg-status-alert/15 border-status-alert text-red-900 dark:text-red-200'
                  : isWarn
                  ? 'bg-status-warning/15 border-status-warning text-amber-900 dark:text-amber-200'
                  : 'bg-[var(--ws-surface-elevated)] border-[var(--ws-border)] text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isCritical ? (
                  <AlertTriangle className="w-4 h-4 text-status-alert animate-bounce" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-brand-lime mt-1" />
                )}
              </div>

              <div className="flex-1 truncate">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-brand-gray font-mono font-bold">{evt.timestamp}</span>
                  {evt.location && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--ws-surface)] border border-[var(--ws-border)] text-brand-olive dark:text-brand-lime font-mono font-bold">
                      {evt.location}
                    </span>
                  )}
                </div>
                <div className="text-[11.5px] text-slate-800 dark:text-slate-200 truncate mt-0.5">{evt.message}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
