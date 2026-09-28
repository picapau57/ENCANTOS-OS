import React from 'react';
import { 
  Wifi, Bluetooth, Moon, Sun, Bell, BellOff, Volume2, VolumeX, 
  SlidersHorizontal, Battery, Plug, Settings, Power, ShieldCheck, 
  Eye, Volume1, ChevronRight, Music
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

interface ControlCenterProps {
  onClose: () => void;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({ onClose }) => {
  const { 
    settings, 
    updateSettings, 
    openWindow, 
    battery, 
    toggleCharging, 
    setPowerMenuOpen, 
    playTestAudio,
    addNotification 
  } = useSystem();

  // 1. Wi-Fi Toggle
  const toggleWifi = () => {
    updateSettings({ wifiEnabled: !settings.wifiEnabled });
  };

  // 2. Bluetooth Toggle
  const toggleBluetooth = () => {
    updateSettings({ bluetoothEnabled: !settings.bluetoothEnabled });
  };

  // 3. Dark Mode Toggle
  const toggleDarkMode = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
    if (!settings.doNotDisturb) {
      addNotification({
        title: 'Theme Changed',
        message: `System appearance set to ${nextTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}.`,
        type: 'info'
      });
    }
  };

  // 4. Do Not Disturb Toggle
  const toggleDoNotDisturb = () => {
    const nextDnd = !settings.doNotDisturb;
    updateSettings({ doNotDisturb: nextDnd });
    if (!nextDnd) {
      addNotification({
        title: 'Do Not Disturb Off',
        message: 'Notification banners and alert sounds are now active.',
        type: 'info'
      });
    }
  };

  const isDarkMode = settings.theme === 'dark';

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-14 right-3 w-88 max-w-[calc(100vw-24px)] bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl z-50 text-xs text-slate-200 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150 select-none"
    >
      {/* Control Center Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-600/20 text-violet-400 ring-1 ring-violet-500/30">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Control Center</span>
              {settings.doNotDisturb && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                  DND ON
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">ENCANTOS OS Quick Controls</div>
          </div>
        </div>

        {/* Battery & Power summary badge */}
        <button
          onClick={toggleCharging}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 transition-colors cursor-pointer"
          title={`Battery: ${battery.level}% - Click to toggle charger`}
        >
          <Battery className={`w-3.5 h-3.5 ${battery.isCharging ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span className="font-mono font-medium">{battery.level}%</span>
        </button>
      </div>

      {/* Primary 4 Quick Action Buttons Grid */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Quick Actions</div>
        <div className="grid grid-cols-2 gap-2">
          {/* Quick Action 1: Wi-Fi */}
          <button
            onClick={toggleWifi}
            className={`p-3 rounded-xl border flex flex-col justify-between h-20 transition-all text-left cursor-pointer group ${
              settings.wifiEnabled 
                ? 'bg-violet-600/25 border-violet-500/80 text-white shadow-sm ring-1 ring-violet-500/30' 
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
            title="Toggle Wi-Fi Network"
          >
            <div className="flex items-center justify-between w-full">
              <div className={`p-1.5 rounded-lg ${settings.wifiEnabled ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Wifi className="w-4 h-4" />
              </div>
              <span className={`w-2 h-2 rounded-full ${settings.wifiEnabled ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-700'}`} />
            </div>
            <div>
              <div className="font-bold text-xs text-white">Wi-Fi</div>
              <div className="text-[10px] text-slate-400 truncate">
                {settings.wifiEnabled ? (settings.wifiConnectedSsid || 'Connected') : 'Turned Off'}
              </div>
            </div>
          </button>

          {/* Quick Action 2: Bluetooth */}
          <button
            onClick={toggleBluetooth}
            className={`p-3 rounded-xl border flex flex-col justify-between h-20 transition-all text-left cursor-pointer group ${
              settings.bluetoothEnabled 
                ? 'bg-sky-600/25 border-sky-500/80 text-white shadow-sm ring-1 ring-sky-500/30' 
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
            title="Toggle Bluetooth"
          >
            <div className="flex items-center justify-between w-full">
              <div className={`p-1.5 rounded-lg ${settings.bluetoothEnabled ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Bluetooth className="w-4 h-4" />
              </div>
              <span className={`w-2 h-2 rounded-full ${settings.bluetoothEnabled ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-700'}`} />
            </div>
            <div>
              <div className="font-bold text-xs text-white">Bluetooth</div>
              <div className="text-[10px] text-slate-400 truncate">
                {settings.bluetoothEnabled ? (settings.bluetoothConnectedDevice || 'Enabled') : 'Turned Off'}
              </div>
            </div>
          </button>

          {/* Quick Action 3: Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-xl border flex flex-col justify-between h-20 transition-all text-left cursor-pointer group ${
              isDarkMode 
                ? 'bg-purple-600/25 border-purple-500/80 text-white shadow-sm ring-1 ring-purple-500/30' 
                : 'bg-amber-500/20 border-amber-500/70 text-amber-200 shadow-sm ring-1 ring-amber-500/30'
            }`}
            title="Toggle Dark / Light Theme Mode"
          >
            <div className="flex items-center justify-between w-full">
              <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-purple-600 text-white' : 'bg-amber-500 text-slate-950'}`}>
                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-purple-950/80 text-purple-300' : 'bg-amber-950/80 text-amber-300'}`}>
                {isDarkMode ? 'Dark' : 'Light'}
              </span>
            </div>
            <div>
              <div className="font-bold text-xs text-white">Dark Mode</div>
              <div className="text-[10px] text-slate-400">
                {isDarkMode ? 'Obsidian Glass Active' : 'Light Pearl Mode'}
              </div>
            </div>
          </button>

          {/* Quick Action 4: Do Not Disturb */}
          <button
            onClick={toggleDoNotDisturb}
            className={`p-3 rounded-xl border flex flex-col justify-between h-20 transition-all text-left cursor-pointer group ${
              settings.doNotDisturb 
                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/40' 
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
            title="Toggle Do Not Disturb"
          >
            <div className="flex items-center justify-between w-full">
              <div className={`p-1.5 rounded-lg ${settings.doNotDisturb ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {settings.doNotDisturb ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              </div>
              <span className={`w-2 h-2 rounded-full ${settings.doNotDisturb ? 'bg-indigo-400 shadow-sm shadow-indigo-400/50' : 'bg-slate-700'}`} />
            </div>
            <div>
              <div className="font-bold text-xs text-white">Do Not Disturb</div>
              <div className="text-[10px] text-slate-400 truncate">
                {settings.doNotDisturb ? 'Muting all alerts' : 'Notifications on'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Secondary Toggles Row (Night Light & Firewall) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => updateSettings({ nightLight: !settings.nightLight })}
          className={`px-3 py-2 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
            settings.nightLight 
              ? 'bg-amber-500/20 border-amber-500/70 text-white' 
              : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700'
          }`}
          title="Toggle Night Light (warm color filter)"
        >
          <Eye className={`w-3.5 h-3.5 ${settings.nightLight ? 'text-amber-400' : 'text-slate-400'}`} />
          <div className="text-left">
            <div className="font-semibold text-[11px] text-white">Night Light</div>
            <div className="text-[9px] text-slate-400">{settings.nightLight ? 'Warm Tint' : 'Standard'}</div>
          </div>
        </button>

        <button
          onClick={() => updateSettings({ firewallEnabled: !settings.firewallEnabled })}
          className={`px-3 py-2 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
            settings.firewallEnabled 
              ? 'bg-emerald-500/20 border-emerald-500/70 text-white' 
              : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700'
          }`}
          title="Toggle UFW Firewall Protection"
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${settings.firewallEnabled ? 'text-emerald-400' : 'text-slate-400'}`} />
          <div className="text-left">
            <div className="font-semibold text-[11px] text-white">UFW Shield</div>
            <div className="text-[9px] text-slate-400">{settings.firewallEnabled ? 'Protected' : 'Disabled'}</div>
          </div>
        </button>
      </div>

      {/* Sliders: Display Brightness & Audio Volume */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        {/* Brightness Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Display Brightness</span>
            </div>
            <span className="font-mono text-white">{settings.brightness}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={settings.brightness}
            onChange={(e) => updateSettings({ brightness: Number(e.target.value) })}
            className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Volume Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <button
              onClick={() => updateSettings({ isMuted: !settings.isMuted })}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              title="Click to Mute/Unmute"
            >
              {settings.isMuted || settings.volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : settings.volume < 40 ? (
                <Volume1 className="w-3.5 h-3.5 text-slate-300" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-slate-300" />
              )}
              <span>System Volume</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={playTestAudio}
                className="text-[10px] text-violet-400 hover:text-violet-300 underline cursor-pointer"
                title="Play test audio chime"
              >
                Test Chime
              </button>
              <span className="font-mono text-white">{settings.isMuted ? 'Muted' : `${settings.volume}%`}</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.isMuted ? 0 : settings.volume}
            onChange={(e) => updateSettings({ volume: Number(e.target.value), isMuted: false })}
            className="w-full accent-violet-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <button
          onClick={() => {
            onClose();
            openWindow('settings');
          }}
          className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 transition-colors cursor-pointer font-medium"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>All Settings</span>
          <ChevronRight className="w-3 h-3" />
        </button>

        <button
          onClick={() => {
            onClose();
            setPowerMenuOpen(true);
          }}
          className="flex items-center gap-1.5 hover:text-rose-400 transition-colors cursor-pointer"
          title="Open Power Menu (Sleep, Hibernate, Restart, Shutdown)"
        >
          <Power className="w-3.5 h-3.5 text-slate-400 hover:text-rose-400" />
          <span>Power</span>
        </button>
      </div>
    </div>
  );
};
