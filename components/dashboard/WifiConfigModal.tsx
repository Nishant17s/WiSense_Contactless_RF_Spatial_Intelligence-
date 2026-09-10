'use client';

import React, { useState } from 'react';
import { X, Wifi } from 'lucide-react';

export function WifiConfigModal({ isOpen, onClose, nodeId }: { isOpen: boolean; onClose: () => void; nodeId: string | null }) {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const res = await fetch('http://localhost:8080/api/v1/config/wifi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id: nodeId, ssid, password }),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setStatus('Configuration sent. Node will restart shortly.');
        setTimeout(() => { onClose(); setStatus(''); }, 2000);
      } else {
        setStatus('Error: ' + data.message);
      }
    } catch (err) {
      setStatus('Failed to connect to backend.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--ws-surface-elevated)] border border-[var(--ws-border)] rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-brand-lime/10 flex items-center justify-center">
            <Wifi className="w-5 h-5 text-brand-lime" />
          </div>
          <div>
            <h3 className="font-brand font-bold text-lg text-white">Configure Wi-Fi</h3>
            <p className="text-xs text-brand-gray font-mono">Node: {nodeId}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">SSID (Network Name)</label>
            <input type="text" value={ssid} onChange={e => setSsid(e.target.value)} required className="w-full bg-[var(--ws-surface)] border border-[var(--ws-border)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-lime transition-colors" placeholder="e.g. MyWiFiNetwork" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-[var(--ws-surface)] border border-[var(--ws-border)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-lime transition-colors" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-brand-lime text-slate-900 font-bold py-2.5 rounded-lg hover:bg-brand-lime/90 transition-colors">
            Update Credentials
          </button>
          {status && <p className="text-xs text-center mt-2 font-mono text-brand-lavender">{status}</p>}
        </form>
      </div>
    </div>
  );
}
