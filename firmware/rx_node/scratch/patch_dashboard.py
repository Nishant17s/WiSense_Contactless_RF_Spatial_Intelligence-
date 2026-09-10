import os

modal_code = """'use client';

import React, { useState } from 'react';
import { X, Wifi } from 'lucide-react';

export function WifiConfigModal({ isOpen, onClose, nodeId }) {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
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
"""

with open("/Users/nishant/Documents/sih-dashboard/contactless-spatial-intelligence/components/dashboard/WifiConfigModal.tsx", "w") as f:
    f.write(modal_code)

strip_path = "/Users/nishant/Documents/sih-dashboard/contactless-spatial-intelligence/components/dashboard/NodeSummaryStrip.tsx"
with open(strip_path, "r") as f:
    strip_content = f.read()

import_idx = strip_content.find("export function NodeSummaryStrip() {")
strip_content = strip_content[:import_idx] + "import { WifiConfigModal } from './WifiConfigModal';\nimport { useState } from 'react';\n" + strip_content[import_idx:]

state_idx = strip_content.find("const nodes = state?.nodes || [];")
strip_content = strip_content[:state_idx] + "const [configNode, setConfigNode] = useState<string | null>(null);\n  " + strip_content[state_idx:]

return_idx = strip_content.rfind("</div>\n    </div>\n  );")
strip_content = strip_content[:return_idx] + """</div>
      </div>
      <WifiConfigModal 
        isOpen={configNode !== null} 
        onClose={() => setConfigNode(null)} 
        nodeId={configNode} 
      />
    </div>
  );"""

button_insert = strip_content.find("</div>\n\n                <div className=\"text-right font-mono\">")
strip_content = strip_content[:button_insert] + """
                  <button onClick={() => setConfigNode(node.id)} className="ml-2 text-[10px] bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded transition-colors" title="Configure Wi-Fi">
                    <Wifi className="w-3 h-3" />
                  </button>
""" + strip_content[button_insert:]


with open(strip_path, "w") as f:
    f.write(strip_content)

print("Dashboard patched successfully.")
