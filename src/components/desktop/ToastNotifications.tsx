import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, AlertTriangle, AlertCircle, Info, X, 
  Wifi, WifiOff, Battery, BatteryWarning, BatteryCharging, 
  Zap, Package, ArrowRight, ExternalLink, Bluetooth
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { SystemNotification } from '../../types';

interface ToastItemProps {
  toast: SystemNotification;
  onDismiss: (id: string) => void;
  onAction?: (targetWindowId?: any) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss, onAction }) => {
  const duration = toast.duration || 5500;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);

  useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now();
    const intervalTime = 50;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed);
      const newProgress = (currentRemaining / duration) * 100;
      setProgress(newProgress);

      if (currentRemaining <= 0) {
        clearInterval(timer);
        onDismiss(toast.id);
      }
    }, intervalTime);

    return () => {
      clearInterval(timer);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    };
  }, [isPaused, duration, onDismiss, toast.id]);

  // Determine icon & color palette based on category and type
  const getToastMetadata = () => {
    if (toast.category === 'battery') {
      if (toast.type === 'error' || toast.type === 'warning') {
        return {
          icon: <BatteryWarning className="w-4 h-4 text-amber-400" />,
          categoryLabel: 'Battery Alert',
          accentBorder: 'border-amber-500/50 shadow-amber-950/40',
          barColor: 'bg-amber-400',
          iconBg: 'bg-amber-500/15 border-amber-500/30'
        };
      }
      return {
        icon: <Zap className="w-4 h-4 text-emerald-400" />,
        categoryLabel: 'Power State',
        accentBorder: 'border-emerald-500/50 shadow-emerald-950/40',
        barColor: 'bg-emerald-400',
        iconBg: 'bg-emerald-500/15 border-emerald-500/30'
      };
    }

    if (toast.category === 'network') {
      if (toast.type === 'warning' || toast.type === 'error') {
        return {
          icon: <WifiOff className="w-4 h-4 text-amber-400" />,
          categoryLabel: 'Network Connectivity',
          accentBorder: 'border-amber-500/50 shadow-amber-950/40',
          barColor: 'bg-amber-400',
          iconBg: 'bg-amber-500/15 border-amber-500/30'
        };
      }
      return {
        icon: <Wifi className="w-4 h-4 text-sky-400" />,
        categoryLabel: 'Network Connectivity',
        accentBorder: 'border-sky-500/50 shadow-sky-950/40',
        barColor: 'bg-sky-400',
        iconBg: 'bg-sky-500/15 border-sky-500/30'
      };
    }

    if (toast.category === 'app') {
      return {
        icon: <Package className="w-4 h-4 text-violet-400" />,
        categoryLabel: 'Application Status',
        accentBorder: 'border-violet-500/50 shadow-violet-950/40',
        barColor: 'bg-violet-400',
        iconBg: 'bg-violet-500/15 border-violet-500/30'
      };
    }

    // Default by type
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          categoryLabel: 'System Notification',
          accentBorder: 'border-emerald-500/50 shadow-emerald-950/40',
          barColor: 'bg-emerald-400',
          iconBg: 'bg-emerald-500/15 border-emerald-500/30'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          categoryLabel: 'System Warning',
          accentBorder: 'border-amber-500/50 shadow-amber-950/40',
          barColor: 'bg-amber-400',
          iconBg: 'bg-amber-500/15 border-amber-500/30'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
          categoryLabel: 'System Alert',
          accentBorder: 'border-rose-500/50 shadow-rose-950/40',
          barColor: 'bg-rose-400',
          iconBg: 'bg-rose-500/15 border-rose-500/30'
        };
      default:
        return {
          icon: <Info className="w-4 h-4 text-sky-400" />,
          categoryLabel: 'System Notification',
          accentBorder: 'border-slate-700/80 shadow-slate-950/40',
          barColor: 'bg-violet-400',
          iconBg: 'bg-sky-500/15 border-sky-500/30'
        };
    }
  };

  const meta = getToastMetadata();

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto w-full bg-slate-900/95 backdrop-blur-2xl border ${meta.accentBorder} rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-in slide-in-from-right-8 fade-in-0 duration-200 group select-none`}
      role="alert"
    >
      <div className="p-3.5 space-y-2">
        {/* Header row: category badge + time + close button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${meta.iconBg} flex items-center justify-center shrink-0`}>
              {meta.icon}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              {meta.categoryLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono">{toast.timestamp}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content row: Title & Message */}
        <div className="pl-0.5 space-y-1">
          <h4 className="text-xs font-bold text-white leading-tight">
            {toast.title}
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {toast.message}
          </p>
        </div>

        {/* Action Button (if target window or label exists) */}
        {(toast.targetWindowId || toast.actionLabel) && (
          <div className="pt-1 flex justify-end">
            <button
              onClick={() => {
                if (onAction) {
                  onAction(toast.targetWindowId);
                }
                onDismiss(toast.id);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-violet-600 border border-slate-700 hover:border-violet-500 text-[11px] text-slate-200 hover:text-white font-medium flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span>{toast.actionLabel || 'View Details'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Auto-dismiss countdown progress bar */}
      <div className="w-full bg-slate-950/60 h-1 overflow-hidden">
        <div 
          className={`h-full ${meta.barColor} transition-all duration-75`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastNotifications: React.FC = () => {
  const { toasts, dismissToast, openWindow } = useSystem();

  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <div 
      className="fixed top-4 right-4 z-[99999] flex flex-col gap-2.5 max-w-sm w-[360px] pointer-events-none"
      aria-live="polite"
    >
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
          onAction={(windowId) => {
            if (windowId) {
              openWindow(windowId);
            }
          }}
        />
      ))}
    </div>
  );
};
