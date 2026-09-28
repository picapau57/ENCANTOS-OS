import React, { useState } from 'react';
import { Search, Folder, AppWindow, Settings, ArrowRight, Disc, HardDrive, Terminal } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { WindowId } from '../../types';

export const GlobalSearch: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { openWindow, fs, apps } = useSystem();
  const [query, setQuery] = useState('');

  const searchItems: { id: string; name: string; type: string; category: string; icon: React.ReactNode; action: () => void }[] = [
    {
      id: 'app-installer',
      name: 'Install ENCANTOS OS',
      type: 'Application',
      category: 'System',
      icon: <Disc className="w-4 h-4 text-rose-400" />,
      action: () => { openWindow('installer'); onClose(); }
    },
    {
      id: 'app-files',
      name: 'Encantos Files',
      type: 'Application',
      category: 'System',
      icon: <Folder className="w-4 h-4 text-amber-400" />,
      action: () => { openWindow('files'); onClose(); }
    },
    {
      id: 'app-store',
      name: 'Encantos Store',
      type: 'Application',
      category: 'Software Center',
      icon: <AppWindow className="w-4 h-4 text-violet-400" />,
      action: () => { openWindow('store'); onClose(); }
    },
    {
      id: 'app-settings',
      name: 'System Settings',
      type: 'Application',
      category: 'System',
      icon: <Settings className="w-4 h-4 text-slate-300" />,
      action: () => { openWindow('settings'); onClose(); }
    },
    {
      id: 'app-terminal',
      name: 'Terminal',
      type: 'Application',
      category: 'System',
      icon: <Terminal className="w-4 h-4 text-emerald-400" />,
      action: () => { openWindow('terminal'); onClose(); }
    },
    {
      id: 'app-disk',
      name: 'Disk Utility',
      type: 'Application',
      category: 'Utilities',
      icon: <HardDrive className="w-4 h-4 text-indigo-400" />,
      action: () => { openWindow('disk-utility'); onClose(); }
    },
    // Files
    ...fs.filter(f => f.type === 'file').map(f => ({
      id: `file-${f.id}`,
      name: f.name,
      type: 'Document',
      category: f.path,
      icon: <Folder className="w-4 h-4 text-sky-400" />,
      action: () => { openWindow('pad', { fileId: f.id }); onClose(); }
    }))
  ];

  const filtered = searchItems.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    item.type.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 p-4"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-violet-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type to search apps, files, settings, and utilities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-800 rounded border border-slate-700">ESC</kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-800/40 text-xs">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No matching applications or files found for "{query}"
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                onClick={item.action}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-violet-600/20 hover:text-white cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-white group-hover:text-violet-300 transition-colors">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{item.category}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-500 group-hover:text-violet-300">
                  <span className="text-[10px] font-mono">{item.type}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
