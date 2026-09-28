import React, { useState } from 'react';
import { Shield, HardDrive, Clock, CheckCircle2, RotateCcw, Plus, Loader2 } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export const EncantosBackup: React.FC = () => {
  const { addNotification } = useSystem();
  const [snapshots, setSnapshots] = useState([
    { id: 'snap-1', date: '2026-09-24 18:30', name: 'Fresh Installation Baseline', type: 'System Image', size: '4.2 GB' },
    { id: 'snap-2', date: '2026-09-25 09:15', name: 'Pre-Update Automated Snapshot', type: 'Btrfs Snapshot', size: '680 MB' },
  ]);
  const [creating, setCreating] = useState(false);

  const handleCreateSnapshot = () => {
    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      const newSnap = {
        id: `snap-${Date.now()}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        name: `Manual User Snapshot #${snapshots.length + 1}`,
        type: 'Btrfs CoW Snapshot',
        size: '180 MB'
      };
      setSnapshots([newSnap, ...snapshots]);
      addNotification({
        title: 'Restore Point Created',
        message: 'System snapshot saved successfully on recovery partition.',
        type: 'success'
      });
    }, 1800);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 text-slate-200 select-none overflow-hidden p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white">Encantos Backup & Recovery</h2>
          <p className="text-xs text-slate-400">Create instant Btrfs / Timeshift-style system snapshots and backup user folders.</p>
        </div>
        <button
          onClick={handleCreateSnapshot}
          disabled={creating}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-violet-600/25 transition-all cursor-pointer"
        >
          {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{creating ? 'Creating Snapshot...' : 'Create Restore Point'}</span>
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-slate-300">Available Restore Points ({snapshots.length})</h3>
        <div className="space-y-2">
          {snapshots.map(s => (
            <div key={s.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-semibold text-white">{s.name}</div>
                  <div className="text-[11px] text-slate-500">{s.date} · {s.type}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-400">{s.size}</span>
                <button
                  onClick={() => addNotification({ title: 'System Restore Prepared', message: `Restoration to "${s.name}" ready upon restart.`, type: 'info' })}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
