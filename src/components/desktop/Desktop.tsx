import React, { useState } from 'react';
import { 
  Disc, Folder, ShoppingBag, Settings as SettingsIcon, Terminal, 
  Activity, HardDrive, Cpu, FileText, Plus, RefreshCw, Palette, 
  Monitor, Info, Check
} from 'lucide-react';
import { useSystem, WALLPAPERS } from '../../context/SystemContext';
import { WindowId } from '../../types';
import { SystemMonitorWidget } from './SystemMonitorWidget';

export const Desktop: React.FC = () => {
  const { 
    settings, 
    openWindow, 
    createFolder, 
    createFile, 
    fs, 
    setStartMenuOpen, 
    setQuickSettingsOpen, 
    setCalendarOpen, 
    setSearchOpen,
    setPowerMenuOpen,
    setControlCenterOpen,
    brandLogo,
    showSystemMonitorWidget,
    setShowSystemMonitorWidget
  } = useSystem();

  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);

  const activeWp = WALLPAPERS.find(w => w.id === settings.wallpaper) || WALLPAPERS[0];

  const handleDesktopClick = () => {
    setContextMenuPos(null);
    setSelectedIconId(null);
    setStartMenuOpen(false);
    setQuickSettingsOpen(false);
    setControlCenterOpen(false);
    setCalendarOpen(false);
    setSearchOpen(false);
    setPowerMenuOpen(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({
      x: Math.min(window.innerWidth - 220, e.clientX),
      y: Math.min(window.innerHeight - 260, e.clientY)
    });
  };

  const desktopShortcuts: { id: string; label: string; icon: React.ReactNode; action: () => void; isInstaller?: boolean }[] = [
    {
      id: 'installer',
      label: 'Install ENCANTOS OS',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/25 ring-2 ring-white/30 animate-pulse">
          <Disc className="w-6 h-6 text-white" />
        </div>
      ),
      action: () => openWindow('installer'),
      isInstaller: true
    },
    {
      id: 'files',
      label: 'Encantos Files',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shadow-lg">
          <Folder className="w-6 h-6 text-amber-400" />
        </div>
      ),
      action: () => openWindow('files')
    },
    {
      id: 'store',
      label: 'Encantos Store',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shadow-lg">
          <ShoppingBag className="w-6 h-6 text-violet-400" />
        </div>
      ),
      action: () => openWindow('store')
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shadow-lg">
          <Terminal className="w-6 h-6 text-emerald-400" />
        </div>
      ),
      action: () => openWindow('terminal')
    },
    {
      id: 'system-monitor',
      label: 'System Monitor',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shadow-lg">
          <Activity className="w-6 h-6 text-cyan-400" />
        </div>
      ),
      action: () => openWindow('system-monitor')
    },
    {
      id: 'disk-utility',
      label: 'Disk Utility',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shadow-lg">
          <HardDrive className="w-6 h-6 text-indigo-400" />
        </div>
      ),
      action: () => openWindow('disk-utility')
    },
    {
      id: 'iso-generator',
      label: 'ISO Generator',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25 ring-1 ring-white/30">
          <Disc className="w-6 h-6 text-white" />
        </div>
      ),
      action: () => openWindow('iso-generator')
    },
    {
      id: 'iso-studio',
      label: 'ISO Lab & Studio',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Cpu className="w-6 h-6 text-white" />
        </div>
      ),
      action: () => openWindow('iso-studio')
    },
    {
      id: 'welcome-doc',
      label: 'Welcome.txt',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shadow-lg">
          <FileText className="w-6 h-6 text-sky-400" />
        </div>
      ),
      action: () => openWindow('pad', { fileId: 'f-welcome' })
    }
  ];

  return (
    <div
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
      className="absolute inset-0 select-none overflow-hidden"
      style={{
        background: activeWp.isGradient ? activeWp.url : `url(${activeWp.url}) center/cover no-repeat fixed`,
        bottom: '48px'
      }}
    >
      {/* Night Light Tint Overlay */}
      {settings.nightLight && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {/* Desktop Icons Grid */}
      <div className="p-4 grid grid-flow-col grid-rows-6 gap-3 w-fit auto-cols-max">
        {desktopShortcuts.map(item => {
          const isSelected = selectedIconId === item.id;
          return (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIconId(item.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                item.action();
              }}
              className={`flex flex-col items-center justify-center w-24 p-2 rounded-xl cursor-pointer transition-all group ${
                isSelected 
                  ? 'bg-violet-600/30 ring-1 ring-violet-400 shadow-md backdrop-blur-sm' 
                  : 'hover:bg-black/20 hover:backdrop-blur-sm'
              }`}
            >
              <div className="transition-transform group-hover:scale-105 shrink-0">
                {item.icon}
              </div>
              <span className={`text-[11px] font-medium text-center mt-1.5 line-clamp-2 px-1 rounded shadow-sm text-shadow-sm ${
                item.isInstaller 
                  ? 'text-rose-200 font-bold' 
                  : 'text-white'
              }`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Right-Click Desktop Context Menu */}
      {contextMenuPos && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 w-52 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-xl p-1.5 shadow-2xl text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100"
          style={{ left: `${contextMenuPos.x}px`, top: `${contextMenuPos.y}px` }}
        >
          <button
            onClick={() => {
              createFolder('desktop', `New-Folder-${Date.now().toString().slice(-4)}`);
              setContextMenuPos(null);
            }}
            className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-violet-600 hover:text-white transition-colors text-left"
          >
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            <span>New Folder</span>
          </button>

          <button
            onClick={() => {
              createFile('desktop', `Document-${Date.now().toString().slice(-4)}.txt`, 'Created from Encantos desktop');
              setContextMenuPos(null);
            }}
            className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-violet-600 hover:text-white transition-colors text-left"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>New Text Document</span>
          </button>

          <div className="my-1 border-t border-slate-800" />

          <button
            onClick={() => {
              openWindow('image-viewer');
              setContextMenuPos(null);
            }}
            className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-violet-600 hover:text-white transition-colors text-left"
          >
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            <span>Change Wallpaper...</span>
          </button>

          <button
            onClick={() => {
              openWindow('settings');
              setContextMenuPos(null);
            }}
            className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-violet-600 hover:text-white transition-colors text-left"
          >
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            <span>Display Settings...</span>
          </button>

          <button
            onClick={() => {
              openWindow('terminal');
              setContextMenuPos(null);
            }}
            className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-violet-600 hover:text-white transition-colors text-left"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open in Terminal</span>
          </button>

          <div className="my-1 border-t border-slate-800" />

          <button
            onClick={() => {
              setShowSystemMonitorWidget(!showSystemMonitorWidget);
              setContextMenuPos(null);
            }}
            className="w-full px-3 py-1.5 rounded-lg flex items-center justify-between hover:bg-violet-600 hover:text-white transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-violet-400" />
              <span>System Monitor Widget</span>
            </div>
            {showSystemMonitorWidget && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              openWindow('system-monitor');
              setContextMenuPos(null);
            }}
            className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-violet-600 hover:text-white transition-colors text-left"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open System Monitor Window</span>
          </button>

          <div className="my-1 border-t border-slate-800" />

          <button
            onClick={() => {
              openWindow('iso-studio');
              setContextMenuPos(null);
            }}
            className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-violet-600 hover:text-white transition-colors text-left"
          >
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>About ENCANTOS OS</span>
          </button>
        </div>
      )}

      {/* Real-time System Monitor Dashboard Widget */}
      <SystemMonitorWidget />
    </div>
  );
};
