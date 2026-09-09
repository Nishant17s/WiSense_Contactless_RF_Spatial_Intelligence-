'use client';

import React, { useState } from 'react';
import { useSensing } from '@/lib/providers/DataProvider';
import { History, Download, Search, AlertTriangle, ShieldCheck, User, Activity } from 'lucide-react';

export default function HistoryPage() {
  const { state } = useSensing();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const rawEvents = state?.events || [];

  const filteredEvents = rawEvents.filter((evt) => {
    if (filterType !== 'ALL') {
      if (filterType === 'FALL' && evt.type !== 'FALL') return false;
      if (filterType === 'ACTIVITY' && evt.type !== 'ACTIVITY') return false;
      if (filterType === 'ZONE' && evt.type !== 'ZONE_CHANGE') return false;
      if (filterType === 'SYSTEM' && evt.type !== 'SYSTEM' && evt.type !== 'NODE_STATUS') return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return evt.message.toLowerCase().includes(q) || (evt.location && evt.location.toLowerCase().includes(q)) || (evt.person_id && evt.person_id.toLowerCase().includes(q));
    }
    return true;
  });

  const exportCsv = () => {
    const header = 'Timestamp,Type,Severity,Target,Location,Message\n';
    const rows = filteredEvents.map(e => `"${e.timestamp}","${e.type}","${e.severity}","${e.person_id || ''}","${e.location || ''}","${e.message.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wisense-spatial-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="ws-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-2xl bg-brand-lime/15 text-brand-olive dark:text-brand-lime">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-brand text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              HISTORICAL SPATIAL INTELLIGENCE & AUDIT LOGS
            </h1>
            <p className="text-xs text-slate-500 dark:text-brand-gray font-sans">
              Complete chronological audit trail of human presence, fall events, and zone transitions
            </p>
          </div>
        </div>

        <button
          onClick={exportCsv}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[var(--ws-surface-elevated)] hover:bg-[var(--ws-border)] border border-[var(--ws-border)] text-xs font-sans font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-brand-olive dark:text-brand-lime" />
          <span>EXPORT CSV</span>
        </button>
      </div>

      {/* Historical Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="ws-card p-5">
          <div className="flex items-center justify-between text-xs font-sans text-slate-500 dark:text-brand-gray mb-1">
            <span className="font-bold uppercase">TOTAL EVENTS</span>
            <Activity className="w-4 h-4 text-brand-lime" />
          </div>
          <div className="text-2xl font-brand font-bold text-slate-900 dark:text-white">1,428</div>
          <div className="text-[10.5px] font-sans text-slate-400 mt-1">Logged over 24hr session</div>
        </div>

        <div className="ws-card p-5">
          <div className="flex items-center justify-between text-xs font-sans text-slate-500 dark:text-brand-gray mb-1">
            <span className="font-bold uppercase">FALL DETECTIONS</span>
            <AlertTriangle className="w-4 h-4 text-status-alert" />
          </div>
          <div className="text-2xl font-brand font-bold text-status-alert">2 Incidents</div>
          <div className="text-[10.5px] font-sans text-slate-400 mt-1">Resolved & logged</div>
        </div>

        <div className="ws-card p-5">
          <div className="flex items-center justify-between text-xs font-sans text-slate-500 dark:text-brand-gray mb-1">
            <span className="font-bold uppercase">AVG CONFIDENCE</span>
            <ShieldCheck className="w-4 h-4 text-status-safe" />
          </div>
          <div className="text-2xl font-brand font-bold text-status-safe">94.8%</div>
          <div className="text-[10.5px] font-sans text-slate-400 mt-1">Across all spatial zones</div>
        </div>

        <div className="ws-card p-5">
          <div className="flex items-center justify-between text-xs font-sans text-slate-500 dark:text-brand-gray mb-1">
            <span className="font-bold uppercase">PEAK OCCUPANCY</span>
            <User className="w-4 h-4 text-brand-lavender" />
          </div>
          <div className="text-2xl font-brand font-bold text-slate-900 dark:text-white">5 People</div>
          <div className="text-[10.5px] font-sans text-slate-400 mt-1">Zone B2 highest density</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="ws-card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 font-sans text-xs w-full sm:w-auto">
          {['ALL', 'FALL', 'ACTIVITY', 'ZONE', 'SYSTEM'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                filterType === cat
                  ? 'bg-brand-lime text-slate-950 font-bold border-brand-lime shadow-sm'
                  : 'bg-[var(--ws-surface-elevated)] border-[var(--ws-border)] text-slate-600 dark:text-brand-gray hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search event logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-xl pl-9 pr-3 py-1.5 text-xs font-sans text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-lime"
          />
        </div>
      </div>

      {/* Events Log Table */}
      <div className="ws-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-[var(--ws-border)] bg-[var(--ws-surface-elevated)] text-slate-500 dark:text-brand-gray text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4 font-mono">Timestamp</th>
                <th className="py-3.5 px-4">Event Category</th>
                <th className="py-3.5 px-4">Target</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Event Details</th>
                <th className="py-3.5 px-4 font-mono">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ws-border)] text-slate-700 dark:text-slate-300">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    No matching historical events found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
                  const isFall = evt.type === 'FALL';
                  const isWarn = evt.severity === 'WARNING';

                  return (
                    <tr
                      key={evt.id}
                      className={`hover:bg-[var(--ws-surface-elevated)] transition-colors ${
                        isFall ? 'bg-status-alert/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500 dark:text-brand-gray whitespace-nowrap">
                        {evt.timestamp}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                            isFall
                              ? 'bg-status-alert/20 border-status-alert text-status-alert'
                              : isWarn
                              ? 'bg-status-warning/20 border-status-warning text-status-warning'
                              : 'bg-brand-lime/15 border-brand-lime/40 text-brand-olive dark:text-brand-lime'
                          }`}
                        >
                          {evt.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-brand">
                        {evt.person_id || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {evt.location ? (
                          <span className="px-1.5 py-0.2 rounded bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] text-slate-800 dark:text-slate-200">
                            {evt.location}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200">
                        {evt.message}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-olive dark:text-brand-lime">
                        {evt.confidence ? `${evt.confidence.toFixed(1)}%` : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
