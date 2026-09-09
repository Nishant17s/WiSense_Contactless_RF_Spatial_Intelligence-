'use client';

import React from 'react';
import { useSensing } from '@/lib/providers/DataProvider';
import { Cpu, ShieldAlert, Activity, UserCheck } from 'lucide-react';
import { formatPercent } from '@/lib/utils/formatters';

export function AIIntelligencePanel() {
  const { state } = useSensing();
  const people = state?.people || [];

  return (
    <div className="ws-card p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--ws-border)]">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-brand-olive dark:text-brand-lime animate-pulse" />
          <h3 className="font-brand text-xs uppercase font-bold tracking-wider text-slate-800 dark:text-slate-200">
            EDGE AI INFERENCE & TARGETS
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-brand-lime/15 text-brand-olive dark:text-brand-lime border border-brand-lime/30 font-bold">
          XGBoost + Random Forest
        </span>
      </div>

      {/* Target Cards List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
        {people.length === 0 ? (
          <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-[var(--ws-surface-elevated)] border border-dashed border-[var(--ws-border)]">
            <UserCheck className="w-8 h-8 text-slate-400 mb-2" />
            <div className="font-brand text-xs text-slate-700 dark:text-slate-300 font-bold">NO ACTIVE TARGETS</div>
            <div className="text-[11px] text-slate-500 dark:text-brand-gray font-mono mt-1">
              Ambient RF field baseline calibrated.
            </div>
          </div>
        ) : (
          people.map((person) => {
            const isFall = person.fall_detected;

            return (
              <div
                key={person.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isFall
                    ? 'bg-status-alert/15 border-status-alert shadow-sm'
                    : 'bg-[var(--ws-surface-elevated)] border-[var(--ws-border)] hover:border-brand-lime/50'
                }`}
              >
                {/* Person Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg ${
                        isFall
                          ? 'bg-status-alert text-white'
                          : 'bg-brand-lime text-slate-950'
                      }`}
                    >
                      {person.id}
                    </span>
                    <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-200">
                      Zone {person.zone}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs font-mono">
                    <span className="text-slate-500 dark:text-brand-gray text-[11px]">Conf:</span>
                    <span className={`font-bold ${isFall ? 'text-status-alert' : 'text-brand-olive dark:text-brand-lime'}`}>
                      {formatPercent(person.confidence)}
                    </span>
                  </div>
                </div>

                {/* Details Row */}
                <div className="mt-2.5 grid grid-cols-3 gap-2 text-[11px] font-sans border-t border-[var(--ws-border)] pt-2 text-slate-600 dark:text-brand-gray">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-mono">Activity:</span>
                    <span className={`font-bold uppercase ${isFall ? 'text-status-alert' : 'text-slate-900 dark:text-white'}`}>
                      {person.activity}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-mono">Direction:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{person.direction}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-mono">Velocity:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-mono font-semibold">
                      {person.velocity > 0 ? `${person.velocity.toFixed(2)} m/s` : 'Static'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
