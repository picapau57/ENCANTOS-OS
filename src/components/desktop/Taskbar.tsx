import React, { useState, useEffect } from 'react';
import { 
  Search, Wifi, Bluetooth, Volume2, VolumeX, Battery, Bell, 
  Folder, ShoppingBag, Terminal, Activity, HardDrive, Settings as SettingsIcon, 
  Disc, RefreshCw, Shield, FileText, Calculator, Image as ImageIcon, Cpu,
  Power, User, SlidersHorizontal
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { WindowId } from '../../types';

import { StartMenu } from './StartMenu';
import { QuickSettings } from './QuickSettings';
import { ControlCenter } from './ControlCenter';
import { CalendarWidget } from './CalendarWidget';
import { NotificationCenter } from './NotificationCenter';
import { GlobalSearch } from './GlobalSearch';
import { BatteryIndicator } from './BatteryIndicator';
import { DigitalClock } from './DigitalClock';
import { PowerMenu } from './PowerMenu';

export const Taskbar: React.FC = () => {
  const { 
    windows, 
    activeWindowId, 
    openWindow, 
    minimizeWindow, 
    bringToFront, 
    settings, 
    notifications,
    startMenuOpen, 
    setStartMenuOpen, 
    quickSettingsOpen, 
    setQuickSettingsOpen, 
    controlCenterOpen,
    setControlCenterOpen,
    calendarOpen, 
    setCalendarOpen, 
    searchOpen, 
    setSearchOpen,
    powerMenuOpen,
    setPowerMenuOpen,
    brandLogo 
  } = useSystem();

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const pinnedWindowIds: WindowId[] = [
    'installer',
    'files',
    'store',
    'terminal',
    'system-monitor',
    'disk-utility',
    'settings',
    'iso-studio'
  ];

  // Combine pinned apps with any other open windows
  const openNonPinnedIds = (Object.keys(windows) as WindowId[]).filter(
    id => windows[id].isOpen && !pinnedWindowIds.includes(id)
  );
  const taskbarIds: WindowId[] = [...pinnedWindowIds, ...openNonPinnedIds];

  const handleTaskbarItemClick = (id: WindowId) => {
    const win = windows[id];
    if (!win.isOpen) {
      openWindow(id);
    } else if (win.isMinimized) {
      bringToFront(id);
    } else if (activeWindowId === id) {
      minimizeWindow(id);
    } else {
      bringToFront(id);
    }
  };

  const getTaskbarIcon = (id: WindowId) => {
    switch (id) {
      case 'installer': return <Disc className="w-5 h-5 text-rose-400" />;
      case 'files': return <Folder className="w-5 h-5 text-amber-400" />;
      case 'store': return <ShoppingBag className="w-5 h-5 text-violet-400" />;
      case 'terminal': return <Terminal className="w-5 h-5 text-emerald-400" />;
      case 'system-monitor': return <Activity className="w-5 h-5 text-cyan-400" />;
      case 'disk-utility': return <HardDrive className="w-5 h-5 text-indigo-400" />;
      case 'settings': return <SettingsIcon className="w-5 h-5 text-slate-300" />;
      case 'iso-studio': return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'update-center': return <RefreshCw className="w-5 h-5 text-sky-400" />;
      case 'backup': return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'pad': return <FileText className="w-5 h-5 text-sky-400" />;
      case 'calculator': return <Calculator className="w-5 h-5 text-amber-400" />;
      case 'image-viewer': return <ImageIcon className="w-5 h-5 text-pink-400" />;
      default: return <Folder className="w-5 h-5 text-slate-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Popovers */}
      {startMenuOpen && <StartMenu />}
      {quickSettingsOpen && <QuickSettings />}
      {controlCenterOpen && <ControlCenter onClose={() => setControlCenterOpen(false)} />}
      {calendarOpen && <CalendarWidget />}
      {notificationsOpen && <NotificationCenter onClose={() => setNotificationsOpen(false)} />}
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
      {powerMenuOpen && <PowerMenu onClose={() => setPowerMenuOpen(false)} />}

      {/* Main Bottom Taskbar */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-0 inset-x-0 h-12 bg-slate-950/80 backdrop-blur-2xl border-t border-slate-800/80 z-40 flex items-center justify-between px-2 select-none"
      >
        {/* Left Section: Start Button & Global Search */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Encantos Start Orb */}
          <button
            onClick={() => {
              setStartMenuOpen(!startMenuOpen);
              setQuickSettingsOpen(false);
              setControlCenterOpen(false);
              setCalendarOpen(false);
              setSearchOpen(false);
              setPowerMenuOpen(false);
            }}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-xl transition-all ${
              startMenuOpen 
                ? 'bg-violet-600/30 ring-1 ring-violet-500 shadow-md shadow-violet-500/20' 
                : 'hover:bg-slate-800/80'
            }`}
            title="Encantos Application Launcher"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center ring-1 ring-violet-400/40">
              <img src={brandLogo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide hidden sm:inline">ENCANTOS</span>
          </button>

          {/* Search trigger button */}
          <button
            onClick={() => {
              setSearchOpen(!searchOpen);
              setStartMenuOpen(false);
              setQuickSettingsOpen(false);
              setControlCenterOpen(false);
              setCalendarOpen(false);
              setPowerMenuOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 text-xs text-slate-400 transition-colors"
            title="Search applications and files (Ctrl+Space)"
          >
            <Search className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden md:inline">Search...</span>
          </button>
        </div>

        {/* Center: Running & Pinned Application Icons */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-xl px-2">
          {taskbarIds.map(id => {
            const win = windows[id];
            const isOpen = win?.isOpen;
            const isActive = activeWindowId === id && !win?.isMinimized;

            return (
              <button
                key={id}
                onClick={() => handleTaskbarItemClick(id)}
                className={`relative p-2 rounded-xl flex items-center justify-center transition-all group ${
                  isActive 
                    ? 'bg-violet-600/25 ring-1 ring-violet-400/40 shadow-sm' 
                    : isOpen 
                    ? 'bg-slate-900/60 hover:bg-slate-800/60' 
                    : 'hover:bg-slate-800/40 opacity-80 hover:opacity-100'
                }`}
                title={win?.title || id}
              >
                <div className="transition-transform group-hover:scale-110">
                  {getTaskbarIcon(id)}
                </div>

                {/* Active/Open indicator bar */}
                {isOpen && (
                  <div 
                    className={`absolute bottom-0.5 h-0.5 rounded-full transition-all ${
                      isActive ? 'w-4 bg-violet-400' : 'w-1.5 bg-slate-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Section: System Tray */}
        <div className="flex items-center gap-1.5 shrink-0 text-xs text-slate-300">
          {/* Network & Sound Status Button -> Opens Control Center */}
          <button
            onClick={() => {
              setControlCenterOpen(!controlCenterOpen);
              setQuickSettingsOpen(false);
              setStartMenuOpen(false);
              setCalendarOpen(false);
              setSearchOpen(false);
              setNotificationsOpen(false);
              setPowerMenuOpen(false);
            }}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer ${
              controlCenterOpen ? 'bg-slate-800 ring-1 ring-violet-400/30 text-white' : ''
            }`}
            title="Network & Sound (Wi-Fi, Volume) — Control Center"
          >
            <Wifi className={`w-3.5 h-3.5 ${settings.wifiEnabled ? 'text-slate-300' : 'text-slate-500'}`} />
            {settings.isMuted || settings.volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-slate-300" />
            )}
          </button>

          {/* Dedicated Control Center Button */}
          <button
            onClick={() => {
              setControlCenterOpen(!controlCenterOpen);
              setQuickSettingsOpen(false);
              setStartMenuOpen(false);
              setCalendarOpen(false);
              setSearchOpen(false);
              setNotificationsOpen(false);
              setPowerMenuOpen(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              controlCenterOpen 
                ? 'bg-violet-600/30 ring-1 ring-violet-500 text-white shadow-sm' 
                : 'hover:bg-slate-800/80 text-slate-300'
            }`}
            title="Control Center (Wi-Fi, Bluetooth, Dark Mode, Do Not Disturb)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {settings.doNotDisturb && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            )}
          </button>

          {/* Dynamic Battery Status Indicator */}
          <BatteryIndicator />

          {/* User Profile & Power Menu Trigger */}
          <button
            onClick={() => {
              setPowerMenuOpen(!powerMenuOpen);
              setQuickSettingsOpen(false);
              setControlCenterOpen(false);
              setStartMenuOpen(false);
              setCalendarOpen(false);
              setSearchOpen(false);
              setNotificationsOpen(false);
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-xl transition-all cursor-pointer ${
              powerMenuOpen 
                ? 'bg-slate-800 ring-1 ring-violet-400/40 text-white shadow-sm' 
                : 'hover:bg-slate-800/80 text-slate-300'
            }`}
            title={`User Profile (${settings.username}) — Power Menu (Sleep, Hibernate, Restart, Shutdown)`}
          >
            <div className="relative">
              <img
                src={brandLogo}
                alt={settings.username}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-violet-400/40"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full ring-1 ring-slate-950" />
            </div>
            <span className="text-[11px] font-medium hidden md:inline text-slate-300">
              {settings.username}
            </span>
          </button>

          {/* Dedicated Power Icon Trigger */}
          <button
            onClick={() => {
              setPowerMenuOpen(!powerMenuOpen);
              setQuickSettingsOpen(false);
              setControlCenterOpen(false);
              setStartMenuOpen(false);
              setCalendarOpen(false);
              setSearchOpen(false);
              setNotificationsOpen(false);
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              powerMenuOpen ? 'bg-slate-800 ring-1 ring-violet-400/30 text-white' : 'hover:bg-slate-800/80 text-slate-300'
            }`}
            title="Power Menu (Sleep, Hibernate, Restart, Shutdown)"
          >
            <Power className="w-3.5 h-3.5 text-slate-300 hover:text-rose-400 transition-colors" />
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setQuickSettingsOpen(false);
              setControlCenterOpen(false);
              setStartMenuOpen(false);
              setCalendarOpen(false);
              setSearchOpen(false);
              setPowerMenuOpen(false);
            }}
            className={`relative p-2 rounded-xl hover:bg-slate-800/80 transition-colors ${
              notificationsOpen ? 'bg-slate-800 ring-1 ring-violet-400/30' : ''
            }`}
            title="Notification Center"
          >
            <Bell className="w-3.5 h-3.5 text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full ring-2 ring-slate-950" />
            )}
          </button>

          {/* Real-time Digital Clock & Calendar Trigger */}
          <DigitalClock
            isActive={calendarOpen}
            onClick={() => {
              setCalendarOpen(!calendarOpen);
              setStartMenuOpen(false);
              setQuickSettingsOpen(false);
              setControlCenterOpen(false);
              setSearchOpen(false);
              setNotificationsOpen(false);
              setPowerMenuOpen(false);
            }}
          />

          {/* Show Desktop Strip */}
          <div
            onClick={() => {
              // Minimize all windows or restore
              Object.keys(windows).forEach(k => minimizeWindow(k as WindowId));
            }}
            className="w-1.5 h-8 bg-slate-800 hover:bg-violet-400 rounded-sm ml-1 cursor-pointer transition-colors"
            title="Show Desktop"
          />
        </div>
      </div>
    </>
  );
};
