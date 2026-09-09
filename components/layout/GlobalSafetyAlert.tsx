'use client';

import React, { useEffect, useRef } from 'react';
import { useSensing } from '@/lib/providers/DataProvider';
import { ShieldAlert, CheckCircle, Volume2, AlertTriangle } from 'lucide-react';

export function GlobalSafetyAlert() {
  const { state, acknowledgeFall } = useSensing();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastBeepTimeRef = useRef<number>(0);

  const hasFall = state?.safety.fall_detected;
  const isAcknowledged = state?.safety.acknowledged;

  // Synthesize warning beep for fall detection
  useEffect(() => {
    if (hasFall && !isAcknowledged) {
      const now = Date.now();
      if (now - lastBeepTimeRef.current > 3000) {
        lastBeepTimeRef.current = now;
        try {
          if (!audioCtxRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              audioCtxRef.current = new AudioContextClass();
            }
          }
          if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
          }
          if (audioCtxRef.current) {
            const osc = audioCtxRef.current.createOscillator();
            const gain = audioCtxRef.current.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(880, audioCtxRef.current.currentTime);
            osc.frequency.exponentialRampToValueAtTime(440, audioCtxRef.current.currentTime + 0.3);
            gain.gain.setValueAtTime(0.15, audioCtxRef.current.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(audioCtxRef.current.destination);
            osc.start();
            osc.stop(audioCtxRef.current.currentTime + 0.3);
          }
        } catch (e) {
          // Audio autoplay might be blocked before interaction, safely ignore
        }
      }
    }
  }, [hasFall, isAcknowledged]);

  if (!hasFall || isAcknowledged) {
    return null;
  }

  return (
    <div className="w-full bg-status-alert text-white border-b-2 border-red-300 px-4 py-2.5 shadow-[0_0_30px_rgba(255,23,68,0.5)] animate-pulse">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-full bg-white text-status-alert animate-ping">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 font-mono">
              <span className="font-bold text-sm tracking-wide">POTENTIAL FALL EVENT DETECTED</span>
              <span className="text-xs px-2 py-0.5 rounded bg-black/40 border border-white/30">
                {state.safety.location || 'Zone B2'}
              </span>
              <span className="text-xs font-semibold text-red-100">
                Confidence: {state.safety.confidence.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-red-100 font-mono">
              Timestamp: {state.safety.timestamp} • Target: {state.safety.fall_person_id || 'P01'} • CSI Doppler drop confirmed
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={acknowledgeFall}
            className="flex items-center space-x-2 px-4 py-1.5 rounded bg-white text-status-alert hover:bg-slate-100 font-mono text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>ACKNOWLEDGE ALERT</span>
          </button>
        </div>
      </div>
    </div>
  );
}
