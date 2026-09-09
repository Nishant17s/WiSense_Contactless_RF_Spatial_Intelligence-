'use client';

import React from 'react';
import { useSensing } from '@/lib/providers/DataProvider';
import { ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatPercent } from '@/lib/utils/formatters';

export function SafetyPanel() {
  const { state, acknowledgeFall } = useSensing();
  const safety = state?.safety;
  const isFall = safety?.fall_detected;
  const isAcknowledged = safety?.acknowledged;

  return (
    <div
      className={`ws-card p-5 flex flex-col justify-between transition-all ${
        isFall && !isAcknowledged
          ? 'ws-card-alert border-status-alert'
          : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--ws-border)]">
        <div className="flex items-center space-x-2">
          {isFall ? (
            <ShieldAlert className="w-4 h-4 text-status-alert animate-bounce" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-status-safe" />
          )}
          <h3 className="font-brand text-xs uppercase font-bold tracking-wider text-slate-800 dark:text-slate-200">
            SAFETY & FALL MONITOR
          </h3>
        </div>
        <span
          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase border ${
            isFall
              ? 'bg-status-alert text-white border-transparent'
              : 'bg-status-safe/15 text-status-safe border-status-safe/30'
          }`}
        >
          {isFall ? 'ALERT ACTIVE' : '✓ SYSTEM SAFE'}
        </span>
      </div>

      {/* Main Status Display */}
      <div className="my-2">
        {isFall ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-status-alert/15 border border-status-alert/40">
              <AlertTriangle className="w-6 h-6 text-status-alert flex-shrink-0 animate-bounce" />
              <div>
                <div className="font-brand text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                  POTENTIAL FALL DETECTED IN {safety?.location || 'ZONE B2'}
                </div>
                <div className="text-xs text-slate-600 dark:text-red-200 font-mono mt-0.5">
                  Target: {safety?.fall_person_id || 'P01'} • Confidence: {formatPercent(safety?.confidence || 96.8)}
                </div>
              </div>
            </div>

            <button
              onClick={acknowledgeFall}
              className={`w-full py-2.5 px-4 rounded-xl font-sans text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md ${
                isAcknowledged
                  ? 'bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] text-slate-400 cursor-default'
                  : 'bg-status-alert hover:bg-red-700 text-white cursor-pointer active:scale-95'
              }`}
              disabled={isAcknowledged}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAcknowledged ? 'ALERT ACKNOWLEDGED' : 'ACKNOWLEDGE & LOG INCIDENT'}</span>
            </button>
          </div>
        ) : (
          <div className="py-2 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-lime/15 text-brand-olive dark:text-brand-lime flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-status-safe" />
            </div>
            <div>
              <div className="font-brand text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                ALL MONITORED ZONES SECURE
              </div>
              <div className="text-xs text-slate-500 dark:text-brand-gray font-sans mt-0.5">
                Zero fall events detected. Continuous RF phase Doppler baseline normal.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[var(--ws-border)] text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <span>RF-ONLY SAFETY AUDIT</span>
        <span>NO OPTICAL CAMERAS</span>
      </div>
    </div>
  );
}
