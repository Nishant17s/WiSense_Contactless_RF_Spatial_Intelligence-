'use client';

import React from 'react';
import { useSensing } from '@/lib/providers/DataProvider';
import { Network, Radio, Wifi } from 'lucide-react';
import { formatDbm } from '@/lib/utils/formatters';

import { WifiConfigModal } from './WifiConfigModal';
import { useState } from 'react';
export function NodeSummaryStrip() {
  const { state } = useSensing();
  const [configNode, setConfigNode] = useState<string | null>(null);
  const nodes = state?.nodes || [];

  return (
    <div className="ws-card p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center space-x-2.5">
          <Network className="w-4 h-4 text-brand-lime" />
          <span className="font-brand text-xs uppercase font-bold tracking-wider text-slate-800 dark:text-slate-200">
            ESP32-S3 HARDWARE TOPOLOGY:
          </span>
        </div>

        {/* Nodes Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-1 md:max-w-3xl">
          {nodes.map((node) => {
            const isTx = node.role === 'TX';
            const isOnline = node.status === 'ONLINE';

            return (
              <div
                key={node.id}
                className="p-3 rounded-2xl bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] flex items-center justify-between font-mono text-xs shadow-sm"
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-status-safe animate-ping' : 'bg-status-warning'}`} />
                  <div>
                    <div className="flex items-center space-x-1.5 font-bold font-sans">
                      <span className="text-slate-900 dark:text-white">{node.id}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
                        isTx ? 'bg-brand-lime/20 text-brand-olive dark:text-brand-lime font-bold' : 'bg-brand-lavender/20 text-brand-lavender font-bold'
                      }`}>
                        {node.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-brand-gray font-mono">{node.ip_address}</div>
                  </div>
                
                  <button onClick={() => setConfigNode(node.id)} className="ml-2 text-[10px] bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded transition-colors" title="Configure Wi-Fi">
                    <Wifi className="w-3 h-3" />
                  </button>
</div>

                <div className="text-right font-mono">
                  <div className="text-brand-olive dark:text-brand-lime font-bold">{formatDbm(node.rssi)}</div>
                  <div className="text-[10px] text-slate-500 dark:text-brand-gray">{node.packet_rate} Hz</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <WifiConfigModal 
        isOpen={configNode !== null} 
        onClose={() => setConfigNode(null)} 
        nodeId={configNode} 
      />
    </div>
  );
}