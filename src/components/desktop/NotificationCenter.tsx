import React, { useState } from 'react';
import { 
  Bell, Trash2, CheckCircle2, Info, AlertTriangle, AlertCircle, 
  X, BatteryWarning, Wifi, Package, Sparkles, ArrowRight, Play
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export const NotificationCenter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { 
    notifications, 
    dismissNotification, 
    clearNotifications, 
    addNotification, 
    openWindow,
    setBatteryLevel
  } = useSystem();

  const [showSimulate, setShowSimulate] = useState(false);

  const getNotifIcon = (n: any) => {
    if (n.category === 'battery') {
      return <BatteryWarning className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    if (n.category === 'network') {
      return <Wifi className="w-4 h-4 text-sky-400 shrink-0" />;
    }
    if (n.category === 'app') {
      return <Package className="w-4 h-4 text-violet-400 shrink-0" />;
    }

    switch (n.type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      default: return <Info className="w-4 h-4 text-sky-400 shrink-0" />;
    }
  };

  const handleSimulateAlert = (type: 'battery' | 'wifi' | 'app') => {
    if (type === 'battery') {
      setBatteryLevel(14);
      addNotification({
        title: 'Low Battery Warning',
        message: 'Battery level reached 14%. Power-saving measures suggested.',
        type: 'warning',
        category: 'battery',
        targetWindowId: 'settings',
        actionLabel: 'Battery Settings'
      });
    } else if (type === 'wifi') {
      addNotification({
        title: 'Wi-Fi Reconnected',
        message: 'Connected to Encantos_Campus_Fast (Signal: 5GHz, Excellent).',
        type: 'success',
        category: 'network',
        targetWindowId: 'settings',
        actionLabel: 'Network Settings'
      });
    } else if (type === 'app') {
      addNotification({
        title: 'Application Updated',
        message: 'Encantos Pad v2.4.0 is now up to date with new features.',
        type: 'success',
        category: 'app',
        targetWindowId: 'pad',
        actionLabel: 'Launch Pad'
      });
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-14 right-3 w-88 max-h-[520px] bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl z-50 text-xs text-slate-200 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-150 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-violet-400" />
          <span className="font-bold text-white text-xs">Notification Center</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
            {notifications.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimulate(prev => !prev)}
            className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
              showSimulate 
                ? 'bg-violet-600/30 border-violet-500 text-violet-300' 
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle simulation test triggers"
          >
            Test Alerts
          </button>
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Simulation / Test Triggers Bar */}
      {showSimulate && (
        <div className="p-2.5 my-2 rounded-xl bg-slate-950/80 border border-violet-500/30 space-y-1.5">
          <div className="text-[10px] font-semibold text-violet-300 uppercase tracking-wider">
            Simulate System Events:
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleSimulateAlert('battery')}
              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <BatteryWarning className="w-3 h-3" />
              <span>Low Battery</span>
            </button>
            <button
              onClick={() => handleSimulateAlert('wifi')}
              className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Wifi className="w-3 h-3" />
              <span>Wi-Fi State</span>
            </button>
            <button
              onClick={() => handleSimulateAlert('app')}
              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Package className="w-3 h-3" />
              <span>App Status</span>
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 py-2 space-y-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-center">
            <Bell className="w-8 h-8 opacity-30 mb-2" />
            <p className="text-xs">No notifications</p>
            <p className="text-[10px] text-slate-600 mt-1">System events will appear here and toast in the top right</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className="py-2.5 px-2 hover:bg-slate-800/40 rounded-xl transition-colors relative group">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">{getNotifIcon(n)}</div>
                <div className="flex-1 overflow-hidden pr-4">
                  <div className="font-semibold text-white truncate text-xs">{n.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.message}</div>
                  
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                    {n.targetWindowId && (
                      <button
                        onClick={() => {
                          if (n.targetWindowId) {
                            openWindow(n.targetWindowId);
                          }
                          onClose();
                        }}
                        className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <span>{n.actionLabel || 'Open'}</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => dismissNotification(n.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-white rounded transition-opacity absolute right-2 top-2 cursor-pointer"
                  title="Remove notification"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
