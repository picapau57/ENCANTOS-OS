import React, { useState } from 'react';
import { 
  Battery, BatteryCharging, BatteryWarning, BatteryMedium, BatteryLow, 
  Zap, Plug, Power, Sliders, ChevronRight, ShieldCheck, Clock
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export const BatteryIndicator: React.FC = () => {
  const { battery, toggleCharging, setPowerMode, openWindow } = useSystem();
  const [showPopover, setShowPopover] = useState(false);

  // Dynamic time estimate calculation based on level, charging state, and powerMode
  const calculateTimeEstimate = () => {
    if (battery.isCharging) {
      if (battery.level >= 100) return 'Fully charged';
      const minsToFull = Math.max(5, Math.round((100 - battery.level) * 1.2));
      const hrs = Math.floor(minsToFull / 60);
      const mins = minsToFull % 60;
      return hrs > 0 ? `${hrs}h ${mins}m until full` : `${mins}m until full`;
    } else {
      // Discharging: hours left depends on powerMode
      const multiplier = battery.powerMode === 'power-saver' ? 7.5 : battery.powerMode === 'performance' ? 4.0 : 6.0;
      const totalMinutes = Math.round((battery.level / 100) * multiplier * 60);
      const hrs = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${hrs}h ${mins}m remaining`;
    }
  };

  // Color scheme based on state
  const getBatteryColor = () => {
    if (battery.isCharging) return 'text-emerald-400';
    if (battery.level <= 15) return 'text-rose-400 animate-pulse';
    if (battery.level <= 30) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getBatteryFillColor = () => {
    if (battery.isCharging) return 'bg-emerald-400';
    if (battery.level <= 15) return 'bg-rose-500';
    if (battery.level <= 30) return 'bg-amber-400';
    return 'bg-emerald-400';
  };

  return (
    <div className="relative">
      {/* Taskbar Button Trigger */}
      <button
        onClick={() => setShowPopover(!showPopover)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-xl transition-all cursor-pointer ${
          showPopover 
            ? 'bg-slate-800 ring-1 ring-violet-400/40 text-white' 
            : 'hover:bg-slate-800/80 text-slate-300'
        }`}
        title={`Battery: ${battery.level}% (${battery.isCharging ? 'Charging' : 'Discharging'})`}
      >
        {/* Custom High-Precision Battery Glyph */}
        <div className="relative flex items-center">
          <div className="w-5 h-3 rounded-[3px] border border-slate-400/80 p-[1.5px] flex items-center bg-slate-900/60 relative">
            <div
              className={`h-full rounded-[1px] transition-all duration-300 ${getBatteryFillColor()}`}
              style={{ width: `${Math.max(8, battery.level)}%` }}
            />
            {battery.isCharging && (
              <Zap className="w-2.5 h-2.5 text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fill-white stroke-[2.5]" />
            )}
          </div>
          {/* Battery positive nipple terminal */}
          <div className="w-[2px] h-1.5 bg-slate-400/80 rounded-r-[1px] -ml-[0.5px]" />
        </div>

        {/* Dynamic percentage label with tabular figures */}
        <span className={`text-[11px] font-mono tabular-nums font-medium ${getBatteryColor()}`}>
          {battery.level}%
        </span>
      </button>

      {/* Flyout Popover */}
      {showPopover && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-12 right-0 w-80 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl z-50 text-xs text-slate-200 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150 select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${battery.isCharging ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                {battery.isCharging ? <Zap className="w-4 h-4 fill-current" /> : <Battery className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">Power & Battery</div>
                <div className="text-[10px] text-slate-400">
                  {battery.isCharging ? 'AC Adapter Connected' : 'Running on Battery'}
                </div>
              </div>
            </div>

            <span className="text-sm font-bold font-mono text-white tabular-nums">
              {battery.level}%
            </span>
          </div>

          {/* Progress Bar & Estimation */}
          <div className="space-y-2">
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 p-[1px]">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${getBatteryFillColor()}`}
                style={{ width: `${battery.level}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{calculateTimeEstimate()}</span>
              </div>
              <span className="font-mono text-slate-500">{battery.voltage}</span>
            </div>
          </div>

          {/* Interactive Charger Toggle */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Plug className={`w-4 h-4 ${battery.isCharging ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div>
                <div className="text-xs font-semibold text-white">
                  {battery.isCharging ? 'Fast Charging (65W USB-PD)' : 'Charger Disconnected'}
                </div>
                <div className="text-[10px] text-slate-500">Click button to toggle charger</div>
              </div>
            </div>

            <button
              onClick={toggleCharging}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                battery.isCharging 
                  ? 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
              }`}
            >
              {battery.isCharging ? 'Unplug' : 'Plug In'}
            </button>
          </div>

          {/* Power Mode Segmented Selector */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-400">Power Profile</div>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
              <button
                onClick={() => setPowerMode('power-saver')}
                className={`py-1.5 rounded-lg transition-colors font-medium text-center ${
                  battery.powerMode === 'power-saver' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Saver
              </button>
              <button
                onClick={() => setPowerMode('balanced')}
                className={`py-1.5 rounded-lg transition-colors font-medium text-center ${
                  battery.powerMode === 'balanced' 
                    ? 'bg-violet-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Balanced
              </button>
              <button
                onClick={() => setPowerMode('performance')}
                className={`py-1.5 rounded-lg transition-colors font-medium text-center ${
                  battery.powerMode === 'performance' 
                    ? 'bg-amber-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Performance
              </button>
            </div>
          </div>

          {/* Battery Health & Settings Link */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Health: {battery.health}% (Normal)</span>
            </div>
            <button
              onClick={() => {
                openWindow('settings');
                setShowPopover(false);
              }}
              className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-0.5"
            >
              <span>Power Settings</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
