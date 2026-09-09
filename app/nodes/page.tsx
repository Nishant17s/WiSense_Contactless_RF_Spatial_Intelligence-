'use client';

import React, { useState } from 'react';
import { useSensing } from '@/lib/providers/DataProvider';
import { Network, Radio, Power } from 'lucide-react';
import { formatDbm } from '@/lib/utils/formatters';

export default function NodesPage() {
  const { state } = useSensing();
  const nodes = state?.nodes || [];
  const [nodeOverrides, setNodeOverrides] = useState<Record<string, 'ONLINE' | 'WARNING' | 'OFFLINE'>>({});

  const toggleNodeStatus = (id: string) => {
    setNodeOverrides((prev) => {
      const current = prev[id] || 'ONLINE';
      const next = current === 'ONLINE' ? 'WARNING' : current === 'WARNING' ? 'OFFLINE' : 'ONLINE';
      return { ...prev, [id]: next };
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="ws-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-2xl bg-brand-lime/15 text-brand-olive dark:text-brand-lime">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-brand text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              ESP32-S3 SENSOR TOPOLOGY & HARDWARE HEALTH
            </h1>
            <p className="text-xs text-slate-500 dark:text-brand-gray font-sans">
              1 Transmitter (TX-01) + 2 Receiver (RX-01, RX-02) 2.4/5GHz Sensing Cluster
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-slate-400 text-[10px]">NETWORK STATUS:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-status-safe/15 text-status-safe font-bold border border-status-safe/30">
            3/3 MESH NODES SYNCHRONIZED
          </span>
        </div>
      </div>

      {/* Visual Network Topology Diagram */}
      <div className="ws-card p-6 text-center relative overflow-hidden">
        <div className="text-xs font-brand font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider">
          TRIANGULATION TOPOLOGY MESH
        </div>

        <div className="max-w-xl mx-auto flex flex-col items-center justify-between min-h-[180px] relative">
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line x1="50%" y1="20%" x2="20%" y2="80%" stroke="#B5D04D" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
            <line x1="50%" y1="20%" x2="80%" y2="80%" stroke="#7D7897" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
            <line x1="20%" y1="80%" x2="80%" y2="80%" stroke="#BEBEC1" strokeWidth="1.5" strokeDasharray="2 4" />
          </svg>

          {/* TX Node (Top) */}
          <div className="z-10 p-3.5 rounded-2xl bg-[var(--ws-surface)] border-2 border-brand-lime shadow-md flex flex-col items-center">
            <Radio className="w-5 h-5 text-brand-olive dark:text-brand-lime mb-1 animate-pulse" />
            <span className="font-brand text-xs font-bold text-slate-900 dark:text-white">TX-01 (Transmitter)</span>
            <span className="font-mono text-[10px] text-brand-olive dark:text-brand-lime font-bold">5.24 GHz • 100 Hz Sync</span>
          </div>

          {/* Bottom RX Nodes Row */}
          <div className="w-full flex items-center justify-between z-10 px-6">
            <div className="p-3.5 rounded-2xl bg-[var(--ws-surface)] border-2 border-brand-lavender shadow-md flex flex-col items-center">
              <Radio className="w-5 h-5 text-brand-lavender mb-1" />
              <span className="font-brand text-xs font-bold text-slate-900 dark:text-white">RX-01 (Receiver A)</span>
              <span className="font-mono text-[10px] text-brand-lavender font-bold">-48.2 dBm • 51 SC</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--ws-surface)] border-2 border-brand-lavender shadow-md flex flex-col items-center">
              <Radio className="w-5 h-5 text-brand-lavender mb-1" />
              <span className="font-brand text-xs font-bold text-slate-900 dark:text-white">RX-02 (Receiver B)</span>
              <span className="font-mono text-[10px] text-brand-lavender font-bold">-50.1 dBm • 51 SC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Node Hardware Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nodes.map((node) => {
          const override = nodeOverrides[node.id];
          const effectiveStatus = override || node.status;
          const isOnline = effectiveStatus === 'ONLINE';
          const isWarning = effectiveStatus === 'WARNING';
          const isTx = node.role === 'TX';

          return (
            <div
              key={node.id}
              className={`ws-card p-5 flex flex-col justify-between transition-all ${
                effectiveStatus === 'OFFLINE'
                  ? 'border-status-alert/50 bg-status-alert/10'
                  : isWarning
                  ? 'border-status-warning/50 bg-status-warning/10'
                  : ''
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--ws-border)]">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-3 h-3 rounded-full ${
                    isOnline ? 'bg-status-safe animate-ping' : isWarning ? 'bg-status-warning' : 'bg-status-alert'
                  }`} />
                  <div>
                    <h3 className="font-brand text-sm font-bold text-slate-900 dark:text-white">{node.id}</h3>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-brand-gray">{node.chipset}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                    isOnline
                      ? 'bg-status-safe/10 border-status-safe/30 text-status-safe'
                      : isWarning
                      ? 'bg-status-warning/10 border-status-warning/30 text-status-warning'
                      : 'bg-status-alert/10 border-status-alert/30 text-status-alert'
                  }`}
                >
                  {effectiveStatus}
                </span>
              </div>

              {/* Hardware Specs */}
              <div className="my-3 space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-[var(--ws-border)]">
                  <span className="text-slate-400">ROLE:</span>
                  <span className={isTx ? 'text-brand-olive dark:text-brand-lime font-bold' : 'text-brand-lavender font-bold'}>
                    {isTx ? 'TRANSMITTER (TX)' : 'RECEIVER (RX)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--ws-border)]">
                  <span className="text-slate-400">IP ADDRESS:</span>
                  <span className="text-slate-800 dark:text-slate-200">{node.ip_address}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--ws-border)]">
                  <span className="text-slate-400">MAC ADDRESS:</span>
                  <span className="text-slate-600 dark:text-brand-gray">{node.mac_address}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--ws-border)]">
                  <span className="text-slate-400">ANTENNA:</span>
                  <span className="text-slate-800 dark:text-slate-200">{node.antenna}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--ws-border)]">
                  <span className="text-slate-400">PACKET RATE:</span>
                  <span className="text-brand-olive dark:text-brand-lime font-bold">{node.packet_rate} Hz</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">RSSI:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{formatDbm(node.rssi)}</span>
                </div>
              </div>

              {/* Fault Injection Button */}
              <div className="pt-3 border-t border-[var(--ws-border)]">
                <button
                  onClick={() => toggleNodeStatus(node.id)}
                  className="w-full py-2 px-3 rounded-xl bg-[var(--ws-surface-elevated)] hover:bg-[var(--ws-border)] border border-[var(--ws-border)] font-sans text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Power className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cycle State: {effectiveStatus}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
