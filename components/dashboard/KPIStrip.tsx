'use client';

import React from 'react';
import { useSensing } from '@/lib/providers/DataProvider';
import { User, Activity, MapPin, ShieldCheck, ShieldAlert, Gauge } from 'lucide-react';
import { formatPercent } from '@/lib/utils/formatters';

export function KPIStrip() {
  const { state } = useSensing();

  const peopleCount = state?.people_count ?? 0;
  const primaryPerson = state?.people[0];
  const primaryActivity = primaryPerson?.activity ?? (peopleCount === 0 ? 'None' : 'Standing');
  const primaryZone = primaryPerson?.zone ?? (peopleCount === 0 ? 'None' : 'B2');
  const confidence = primaryPerson?.confidence ?? (peopleCount === 0 ? 99.0 : 92.5);
  const isFall = state?.safety.fall_detected ?? false;
  const isAlert = state?.safety.system_state === 'ALERT';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
      {/* 1. PEOPLE */}
      <div className="ws-card p-4 sm:p-5 flex items-center justify-between ws-card-interactive">
        <div>
          <span className="text-[11px] font-sans font-bold tracking-wider text-slate-500 dark:text-brand-gray uppercase block">
            PEOPLE
          </span>
          <div className="my-1 text-3xl font-brand font-bold text-slate-900 dark:text-white">
            {peopleCount.toString().padStart(2, '0')}
          </div>
          <span className="text-[11px] font-sans text-slate-500 dark:text-brand-gray">
            {peopleCount === 0 ? 'Empty Room' : 'In Room'}
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-brand-lime/15 dark:bg-brand-lime/20 flex items-center justify-center text-brand-olive dark:text-brand-lime flex-shrink-0">
          <User className="w-6 h-6" />
        </div>
      </div>

      {/* 2. ACTIVITY */}
      <div className={`ws-card p-4 sm:p-5 flex items-center justify-between ws-card-interactive ${
        isFall ? 'ws-card-alert' : ''
      }`}>
        <div>
          <span className="text-[11px] font-sans font-bold tracking-wider text-slate-500 dark:text-brand-gray uppercase block">
            ACTIVITY
          </span>
          <div className={`my-1 text-2xl font-brand font-bold truncate ${
            isFall ? 'text-status-alert' : 'text-slate-900 dark:text-white'
          }`}>
            {primaryActivity}
          </div>
          <span className="text-[11px] font-sans text-slate-500 dark:text-brand-gray">
            {isFall ? 'Emergency' : 'Primary Target'}
          </span>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
          isFall
            ? 'bg-status-alert/15 text-status-alert'
            : 'bg-brand-lime/15 dark:bg-brand-lime/20 text-brand-olive dark:text-brand-lime'
        }`}>
          <Activity className="w-6 h-6" />
        </div>
      </div>

      {/* 3. FALL STATUS */}
      <div className={`ws-card p-4 sm:p-5 flex items-center justify-between ws-card-interactive ${
        isAlert ? 'ws-card-alert' : ''
      }`}>
        <div>
          <span className="text-[11px] font-sans font-bold tracking-wider text-slate-500 dark:text-brand-gray uppercase block">
            FALL STATUS
          </span>
          <div className={`my-1 text-2xl font-brand font-bold truncate ${
            isAlert ? 'text-status-alert' : 'text-slate-900 dark:text-white'
          }`}>
            {isFall ? 'Fall Detected' : 'No Fall'}
          </div>
          <span className="text-[11px] font-sans text-slate-500 dark:text-brand-gray">
            {isFall ? 'Alert Active' : 'All Clear'}
          </span>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
          isAlert
            ? 'bg-status-alert/15 text-status-alert animate-bounce'
            : 'bg-brand-lime/15 dark:bg-brand-lime/20 text-brand-olive dark:text-brand-lime'
        }`}>
          {isAlert ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
        </div>
      </div>

      {/* 4. LOCATION */}
      <div className="ws-card p-4 sm:p-5 flex items-center justify-between ws-card-interactive">
        <div>
          <span className="text-[11px] font-sans font-bold tracking-wider text-slate-500 dark:text-brand-gray uppercase block">
            LOCATION
          </span>
          <div className="my-1 text-2xl font-brand font-bold text-slate-900 dark:text-white truncate">
            {peopleCount === 0 ? 'Clear' : `Zone ${primaryZone}`}
          </div>
          <span className="text-[11px] font-sans text-slate-500 dark:text-brand-gray font-mono">
            Confidence {formatPercent(confidence)}
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-brand-lime/15 dark:bg-brand-lime/20 flex items-center justify-center text-brand-olive dark:text-brand-lime flex-shrink-0">
          <MapPin className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
