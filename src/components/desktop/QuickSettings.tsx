import React from 'react';
import { 
  Wifi, Bluetooth, Moon, Volume2, Sun, Battery, 
  ShieldCheck, Settings, Power, VolumeX
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export const QuickSettings: React.FC = () => {
  const { settings, updateSettings, openWindow, setQuickSettingsOpen, battery, toggleCharging, setPowerMenuOpen } = useSystem();

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-14 right-3 w-80 bg-slate-900/90 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl z-50 text-xs text-slate-200 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      {/* 2x2 Quick Toggle Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Wi-Fi */}
        <button
          onClick={() => updateSettings({ wifiEnabled: !settings.wifiEnabled })}
          className={`p-3 rounded-xl border flex flex-col justify-between h-20 transition-all ${
            settings.wifiEnabled 
              ? 'bg-violet-600/30 border-violet-500 text-white' 
              : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}
        >
          <Wifi className={`w-4 h-4 ${settings.wifiEnabled ? 'text-violet-400' : ''}`} />
          <div className="text-left">
            <div className="font-semibold text-xs text-white">Wi-Fi</div>
            <div className="text-[10px] text-slate-400 truncate">
              {settings.wifiEnabled ? (settings.wifiConnectedSsid || 'Enabled') : 'Off'}
            </div>
          </div>
        </button>

        {/* Bluetooth */}
        <button
          onClick={() => updateSettings({ bluetoothEnabled: !settings.bluetoothEnabled })}
          className={`p-3 rounded-xl border flex flex-col justify-between h-20 transition-all ${
            settings.bluetoothEnabled 
              ? 'bg-violet-600/30 border-violet-500 text-white' 
              : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}
        >
          <Bluetooth className={`w-4 h-4 ${settings.bluetoothEnabled ? 'text-violet-400' : ''}`} />
          <div className="text-left">
            <div className="font-semibold text-xs text-white">Bluetooth</div>
            <div className="text-[10px] text-slate-400 truncate">
              {settings.bluetoothEnabled ? (settings.bluetoothConnectedDevice || 'Enabled') : 'Off'}
            </div>
          </div>
        </button>

        {/* Night Light */}
        <button
          onClick={() => updateSettings({ nightLight: !settings.nightLight })}
          className={`p-3 rounded-xl border flex flex-col justify-between h-20 transition-all ${
            settings.nightLight 
              ? 'bg-amber-500/20 border-amber-500 text-white' 
              : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}
        >
          <Moon className={`w-4 h-4 ${settings.nightLight ? 'text-amber-400' : ''}`} />
          <div className="text-left">
            <div className="font-semibold text-xs text-white">Night Light</div>
            <div className="text-[10px] text-slate-400">{settings.nightLight ? 'Active' : 'Off'}</div>
          </div>
        </button>

        {/* Firewall Status */}
        <button
          onClick={() => updateSettings({ firewallEnabled: !settings.firewallEnabled })}
          className={`p-3 rounded-xl border flex flex-col justify-between h-20 transition-all ${
            settings.firewallEnabled 
              ? 'bg-emerald-500/20 border-emerald-500 text-white' 
              : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}
        >
          <ShieldCheck className={`w-4 h-4 ${settings.firewallEnabled ? 'text-emerald-400' : ''}`} />
          <div className="text-left">
            <div className="font-semibold text-xs text-white">Firewall</div>
            <div className="text-[10px] text-slate-400">{settings.firewallEnabled ? 'UFW Active' : 'Disabled'}</div>
          </div>
        </button>
      </div>

      {/* Sliders: Volume & Brightness */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        {/* Volume */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              {settings.isMuted || settings.volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-slate-300" />}
              <span>Volume</span>
            </div>
            <span className="font-mono">{settings.isMuted ? 'Muted' : `${settings.volume}%`}</span>
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

        {/* Brightness */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Display Brightness</span>
            </div>
            <span className="font-mono">{settings.brightness}%</span>
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
      </div>

      {/* Footer: Battery & Settings Shortcut */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
        <button
          onClick={toggleCharging}
          className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer text-left"
          title="Click to toggle charger plugged/unplugged"
        >
          <div className="relative">
            <Battery className={`w-4 h-4 ${battery.isCharging ? 'text-emerald-400' : battery.level <= 20 ? 'text-rose-400' : 'text-slate-300'}`} />
          </div>
          <span>
            <strong className="text-white font-mono">{battery.level}%</strong> · {battery.isCharging ? 'Charging' : 'Discharging'} ({battery.powerMode})
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              openWindow('settings');
              setQuickSettingsOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setQuickSettingsOpen(false);
              setPowerMenuOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Power Menu (Sleep, Hibernate, Restart, Shutdown)"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
