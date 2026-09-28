import React, { useState } from 'react';
import { 
  Search, Power, RotateCw, Lock, LogOut, Moon, 
  Folder, Settings, ShoppingBag, Terminal, Activity, HardDrive, 
  Disc, RefreshCw, Shield, FileText, Calculator, Image as ImageIcon, 
  Compass, Code, Palette, Film, Briefcase, Box, Gamepad2, ChevronRight
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { WindowId } from '../../types';

export const StartMenu: React.FC = () => {
  const { openWindow, setStartMenuOpen, setSessionState, settings, brandLogo } = useSystem();
  const [activeTab, setActiveTab] = useState<'pinned' | 'all'>('pinned');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPowerMenu, setShowPowerMenu] = useState(false);

  const pinnedApps: { id: WindowId; name: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'installer', name: 'Install ENCANTOS', icon: <Disc className="w-5 h-5 text-rose-400" />, desc: 'System Installer' },
    { id: 'iso-generator', name: 'ISO Generator', icon: <Disc className="w-5 h-5 text-cyan-400" />, desc: 'Custom USB Builder' },
    { id: 'files', name: 'Encantos Files', icon: <Folder className="w-5 h-5 text-amber-400" />, desc: 'File Manager' },
    { id: 'store', name: 'Encantos Store', icon: <ShoppingBag className="w-5 h-5 text-violet-400" />, desc: 'Software Center' },
    { id: 'settings', name: 'Settings', icon: <Settings className="w-5 h-5 text-slate-300" />, desc: 'System Preferences' },
    { id: 'terminal', name: 'Terminal', icon: <Terminal className="w-5 h-5 text-emerald-400" />, desc: 'POSIX Command Shell' },
    { id: 'system-monitor', name: 'System Monitor', icon: <Activity className="w-5 h-5 text-cyan-400" />, desc: 'Task Manager' },
    { id: 'disk-utility', name: 'Disk Utility', icon: <HardDrive className="w-5 h-5 text-indigo-400" />, desc: 'Drive Partitioning' },
    { id: 'update-center', name: 'Update Center', icon: <RefreshCw className="w-5 h-5 text-sky-400" />, desc: 'Software Updates' },
    { id: 'backup', name: 'Backup & Recovery', icon: <Shield className="w-5 h-5 text-emerald-400" />, desc: 'System Snapshots' },
    { id: 'pad', name: 'Encantos Pad', icon: <FileText className="w-5 h-5 text-sky-400" />, desc: 'Text & Code Editor' },
    { id: 'calculator', name: 'Calculator', icon: <Calculator className="w-5 h-5 text-amber-400" />, desc: 'Scientific Calc' },
    { id: 'image-viewer', name: 'Encantos Photos', icon: <ImageIcon className="w-5 h-5 text-pink-400" />, desc: 'Image Viewer' },
  ];

  const appCategories = [
    { name: 'Internet', items: [{ name: 'Firefox Browser', windowId: null }, { name: 'Encantos Web', windowId: null }] },
    { name: 'Development', items: [{ name: 'Encantos Terminal', windowId: 'terminal' }, { name: 'Encantos Pad', windowId: 'pad' }, { name: 'ISO Lab', windowId: 'iso-studio' }] },
    { name: 'Graphics', items: [{ name: 'Encantos Photos', windowId: 'image-viewer' }, { name: 'Wallpaper Studio', windowId: 'settings' }] },
    { name: 'Multimedia', items: [{ name: 'PipeWire Audio Control', windowId: 'settings' }] },
    { name: 'Utilities', items: [{ name: 'Calculator', windowId: 'calculator' }, { name: 'Encantos Backup', windowId: 'backup' }] },
    { name: 'System', items: [{ name: 'ISO Generator', windowId: 'iso-generator' }, { name: 'System Settings', windowId: 'settings' }, { name: 'System Monitor', windowId: 'system-monitor' }, { name: 'Disk Utility', windowId: 'disk-utility' }, { name: 'Update Center', windowId: 'update-center' }, { name: 'Install ENCANTOS OS', windowId: 'installer' }] },
  ];

  const handleLaunchApp = (winId: WindowId) => {
    openWindow(winId);
    setStartMenuOpen(false);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-14 left-3 w-96 max-h-[580px] bg-slate-900/90 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden text-xs text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      {/* Top Search Bar */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/60">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Type here to search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      {/* Tabs: Pinned vs All Apps */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-xs font-semibold text-slate-400">
          {activeTab === 'pinned' ? 'Pinned Applications' : 'All Applications'}
        </span>
        <button
          onClick={() => setActiveTab(activeTab === 'pinned' ? 'all' : 'pinned')}
          className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
        >
          {activeTab === 'pinned' ? 'All apps >' : '< Back to pinned'}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'pinned' ? (
          <div className="grid grid-cols-3 gap-3">
            {pinnedApps.map(app => (
              <button
                key={app.id}
                onClick={() => handleLaunchApp(app.id)}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/40 hover:bg-violet-600/20 hover:border-violet-500/40 border border-slate-800/60 transition-all text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                  {app.icon}
                </div>
                <span className="text-xs font-medium text-white truncate w-full group-hover:text-violet-300 transition-colors">
                  {app.name}
                </span>
                <span className="text-[10px] text-slate-500 truncate w-full mt-0.5">
                  {app.desc}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {appCategories.map(cat => (
              <div key={cat.name} className="space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">{cat.name}</div>
                <div className="divide-y divide-slate-800/40">
                  {cat.items.map(item => (
                    <button
                      key={item.name}
                      onClick={() => {
                        if (item.windowId) handleLaunchApp(item.windowId as WindowId);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="text-xs text-slate-200">{item.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Profile & Power Bar */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between relative">
        {/* User profile */}
        <div className="flex items-center gap-2.5">
          <img
            src={brandLogo}
            alt="User"
            className="w-7 h-7 rounded-full object-cover ring-1 ring-violet-500/50"
          />
          <div>
            <div className="text-xs font-semibold text-white">{settings.username}</div>
            <div className="text-[10px] text-emerald-400">Live Session (Encantos Aurora)</div>
          </div>
        </div>

        {/* Power Menu Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowPowerMenu(!showPowerMenu)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600/20 hover:text-rose-400 text-slate-300 flex items-center justify-center transition-colors"
            title="Power Menu"
          >
            <Power className="w-4 h-4" />
          </button>

          {/* Power Options Popover */}
          {showPowerMenu && (
            <div className="absolute right-0 bottom-10 w-44 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl z-50 space-y-0.5">
              <button
                onClick={() => setSessionState('locked')}
                className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-800 text-slate-300 text-left"
              >
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lock Screen</span>
              </button>
              <button
                onClick={() => setSessionState('restarting')}
                className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-800 text-slate-300 text-left"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Restart</span>
              </button>
              <button
                onClick={() => setSessionState('shutting_down')}
                className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-rose-600 hover:text-white text-rose-400 text-left"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Shut Down</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
