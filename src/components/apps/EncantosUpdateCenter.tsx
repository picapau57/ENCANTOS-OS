import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, ShieldCheck, Download, Loader2 } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export const EncantosUpdateCenter: React.FC = () => {
  const { addNotification } = useSystem();
  const [checking, setChecking] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [upToDate, setUpToDate] = useState(false);

  const updates = [
    { id: 'u1', title: 'Linux Kernel 6.8.0-encantos-generic', type: 'Security & Stability', size: '42.1 MB' },
    { id: 'u2', title: 'Encantos Desktop Compositor 1.0.4', type: 'Desktop Environment', size: '12.8 MB' },
    { id: 'u3', title: 'PipeWire Audio Subsystem 1.0.8', type: 'Audio Patch', size: '8.4 MB' },
    { id: 'u4', title: 'Mesa 3D Graphics Driver 24.1.2', type: 'Vulkan / OpenGL Driver', size: '65.0 MB' },
  ];

  const handleCheck = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      addNotification({
        title: 'Update Check Completed',
        message: 'Found 4 pending security and system updates.',
        type: 'info'
      });
    }, 1500);
  };

  const handleInstallAll = () => {
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      setUpToDate(true);
      addNotification({
        title: 'System Updated Successfully',
        message: 'All kernel and desktop patches have been applied.',
        type: 'success'
      });
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 text-slate-200 select-none overflow-hidden p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white">Encantos Update Center</h2>
          <p className="text-xs text-slate-400">Keep your system core, drivers, and desktop environment secure and modern.</p>
        </div>
        <button
          onClick={handleCheck}
          disabled={checking || updating}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-violet-400' : ''}`} />
          <span>{checking ? 'Checking Repositories...' : 'Check for Updates'}</span>
        </button>
      </div>

      {upToDate ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">Your System is Completely Up to Date</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Last checked today at {new Date().toLocaleTimeString()}. Encantos OS 1.0.0 "Aurora" has all latest security advisories applied.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Pending System Updates (4)</span>
            <button
              onClick={handleInstallAll}
              disabled={updating}
              className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold shadow-md shadow-violet-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{updating ? 'Applying Patches...' : 'Install All Updates'}</span>
            </button>
          </div>

          <div className="space-y-2">
            {updates.map(u => (
              <div key={u.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  <div>
                    <div className="font-semibold text-white">{u.title}</div>
                    <div className="text-[11px] text-slate-500">{u.type}</div>
                  </div>
                </div>
                <span className="font-mono text-slate-400">{u.size}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
