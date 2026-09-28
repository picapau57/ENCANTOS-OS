import React, { useState } from 'react';
import { HardDrive, AlertTriangle, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export const EncantosDiskUtility: React.FC = () => {
  const { addNotification } = useSystem();
  const [selectedDisk, setSelectedDisk] = useState<string>('nvme0n1');
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [formatTarget, setFormatTarget] = useState<string>('nvme0n1p3');
  const [formatFs, setFormatFs] = useState<'ext4' | 'btrfs' | 'fat32'>('ext4');
  const [confirmName, setConfirmName] = useState('');

  const disks = [
    {
      id: 'nvme0n1',
      name: 'Samsung SSD 990 PRO 512GB (nvme0n1)',
      size: '512.1 GB',
      type: 'NVMe Internal Solid State Drive',
      health: 'Passed (100% Health)',
      temp: '34 °C',
      partitions: [
        { id: 'nvme0n1p1', name: 'EFI System Partition', mount: '/boot/efi', fs: 'FAT32', size: '512 MB', used: '64 MB' },
        { id: 'nvme0n1p2', name: 'Encantos Root', mount: '/', fs: 'Ext4', size: '480.0 GB', used: '14.8 GB' },
        { id: 'nvme0n1p3', name: 'Encantos Recovery', mount: '/recovery', fs: 'Btrfs', size: '31.5 GB', used: '4.2 GB' },
      ]
    },
    {
      id: 'sda',
      name: 'SanDisk Ultra USB 3.2 64GB (sda)',
      size: '62.8 GB',
      type: 'External USB Removable Flash Drive',
      health: 'Passed (Healthy)',
      temp: '28 °C',
      partitions: [
        { id: 'sda1', name: 'ENCANTOS_LIVE_USB', mount: '/run/live/medium', fs: 'ISO9660', size: '4.8 GB', used: '4.8 GB' },
        { id: 'sda2', name: 'USB_STORAGE', mount: '/media/encantos/USB_STORAGE', fs: 'exFAT', size: '58.0 GB', used: '12.4 GB' },
      ]
    }
  ];

  const currentDisk = disks.find(d => d.id === selectedDisk) || disks[0];

  const handleFormat = () => {
    if (confirmName !== 'FORMAT') return;
    setShowFormatModal(false);
    setConfirmName('');
    addNotification({
      title: 'Partition Formatted',
      message: `Partition ${formatTarget} formatted successfully to ${formatFs.toUpperCase()}.`,
      type: 'warning'
    });
  };

  return (
    <div className="flex h-full bg-slate-900/95 text-slate-200 select-none overflow-hidden">
      {/* Disks sidebar */}
      <div className="w-56 bg-slate-950/60 border-r border-slate-800 p-3 flex flex-col gap-1 text-xs shrink-0">
        <div className="px-3 py-1.5 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Storage Devices</div>
        {disks.map(disk => (
          <button
            key={disk.id}
            onClick={() => setSelectedDisk(disk.id)}
            className={`flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all ${
              selectedDisk === disk.id 
                ? 'bg-violet-600 text-white font-semibold shadow-md shadow-violet-600/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <HardDrive className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="overflow-hidden">
              <div className="truncate text-xs font-medium">{disk.id}</div>
              <div className="text-[10px] opacity-75">{disk.size} · {disk.type.split(' ')[0]}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">{currentDisk.name}</h2>
          <p className="text-xs text-slate-400">{currentDisk.type} · Total Capacity: {currentDisk.size}</p>
        </div>

        {/* SMART Health */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <span>S.M.A.R.T. Self-Test: {currentDisk.health}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-mono">Good</span>
              </div>
              <div className="text-[11px] text-slate-500">Internal temperature: {currentDisk.temp} · Zero reallocated sectors</div>
            </div>
          </div>
          <button
            onClick={() => addNotification({ title: 'SMART Check Completed', message: 'All self-test parameters within nominal thresholds.', type: 'info' })}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Run Diagnostic
          </button>
        </div>

        {/* Partition Graphic Visualization */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300">Partition Layout (GPT Table)</div>
          <div className="flex h-10 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-1 gap-1">
            {currentDisk.partitions.map((part, i) => (
              <div
                key={part.id}
                className={`h-full rounded-lg flex items-center justify-center text-[10px] font-semibold text-white transition-opacity ${
                  i === 0 ? 'bg-indigo-600/80' : i === 1 ? 'bg-violet-600' : 'bg-emerald-600'
                }`}
                style={{ flex: i === 0 ? '0.1' : i === 1 ? '0.75' : '0.15' }}
                title={`${part.name} (${part.fs})`}
              >
                <span className="truncate px-2">{part.id} ({part.fs})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Partitions Table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40 text-xs">
          <div className="grid grid-cols-12 py-2 px-3 bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
            <span className="col-span-3">Partition</span>
            <span className="col-span-3">Mount Point</span>
            <span className="col-span-2">Filesystem</span>
            <span className="col-span-2">Capacity</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>

          <div className="divide-y divide-slate-800/40">
            {currentDisk.partitions.map(part => (
              <div key={part.id} className="grid grid-cols-12 items-center py-2.5 px-3 text-slate-300 hover:bg-slate-800/30 transition-colors">
                <div className="col-span-3 font-medium text-white truncate">{part.id} <span className="text-[11px] text-slate-500">({part.name})</span></div>
                <div className="col-span-3 font-mono text-slate-400 truncate">{part.mount}</div>
                <div className="col-span-2 font-mono text-cyan-400">{part.fs}</div>
                <div className="col-span-2 font-mono">{part.used} / {part.size}</div>
                <div className="col-span-2 flex justify-end gap-1.5">
                  <button
                    onClick={() => {
                      setFormatTarget(part.id);
                      setShowFormatModal(true);
                    }}
                    disabled={part.mount === '/'}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-rose-900/60 disabled:opacity-30 disabled:pointer-events-none text-rose-300 rounded text-[11px] transition-colors"
                  >
                    Format
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Format Confirmation Modal */}
      {showFormatModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-bold text-white">WARNING: Erase Partition Data</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Formatting partition <strong className="text-white">{formatTarget}</strong> will permanently erase all files and documents contained within it. This action cannot be reversed.
            </p>

            <div className="space-y-3 mb-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Filesystem</label>
                <select
                  value={formatFs}
                  onChange={(e) => setFormatFs(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                >
                  <option value="ext4">Ext4 (Default Linux Filesystem)</option>
                  <option value="btrfs">Btrfs (Snapshots & Subvolumes)</option>
                  <option value="fat32">FAT32 (Cross-Platform Compatible)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Type <strong>FORMAT</strong> to confirm destruction:</label>
                <input
                  type="text"
                  placeholder="FORMAT"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowFormatModal(false)}
                className="px-3 py-1.5 text-slate-400 hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleFormat}
                disabled={confirmName !== 'FORMAT'}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-semibold rounded-lg shadow-sm"
              >
                Erase & Format
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
