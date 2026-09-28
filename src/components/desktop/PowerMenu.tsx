import React from 'react';
import { 
  Moon, Save, RotateCw, Power, Lock, LogOut, 
  User, ShieldCheck, ChevronRight, Settings as SettingsIcon
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

interface PowerMenuProps {
  onClose: () => void;
}

export const PowerMenu: React.FC<PowerMenuProps> = ({ onClose }) => {
  const { setSessionState, settings, brandLogo, openWindow, addNotification } = useSystem();

  const handleAction = (action: 'sleep' | 'hibernate' | 'restart' | 'shutdown' | 'lock' | 'logout') => {
    onClose();
    switch (action) {
      case 'sleep':
        addNotification({
          title: 'Entering Sleep Mode',
          message: 'System suspending to RAM (S3 state).',
          type: 'info'
        });
        setSessionState('sleeping');
        break;
      case 'hibernate':
        addNotification({
          title: 'Hibernating System',
          message: 'Writing session state to disk swap partition.',
          type: 'info'
        });
        setSessionState('hibernating');
        break;
      case 'restart':
        setSessionState('restarting');
        break;
      case 'shutdown':
        setSessionState('shutting_down');
        break;
      case 'lock':
        setSessionState('locked');
        break;
      case 'logout':
        setSessionState('locked');
        break;
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-14 right-3 w-80 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl z-50 text-xs text-slate-200 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150 select-none"
    >
      {/* User Profile Header Card */}
      <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-violet-500/50 shadow-md">
              <img src={brandLogo} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
          </div>

          <div>
            <div className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>{settings.username}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-600/30 text-violet-300 font-mono">sudo</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{settings.hostname}</div>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            openWindow('settings');
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Account Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Power Actions Grid */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 pb-1">Power Controls</div>

        {/* 1. Sleep */}
        <button
          onClick={() => handleAction('sleep')}
          className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between hover:bg-slate-800/80 text-slate-200 transition-all group text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white text-xs">Sleep</div>
              <div className="text-[10px] text-slate-400">Suspend to RAM · Instant wake-up</div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
        </button>

        {/* 2. Hibernate */}
        <button
          onClick={() => handleAction('hibernate')}
          className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between hover:bg-slate-800/80 text-slate-200 transition-all group text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Save className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white text-xs">Hibernate</div>
              <div className="text-[10px] text-slate-400">Save session to disk · Zero power draw</div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
        </button>

        {/* 3. Restart */}
        <button
          onClick={() => handleAction('restart')}
          className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between hover:bg-slate-800/80 text-slate-200 transition-all group text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <RotateCw className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white text-xs">Restart</div>
              <div className="text-[10px] text-slate-400">Reboot Encantos OS</div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
        </button>

        {/* 4. Shutdown */}
        <button
          onClick={() => handleAction('shutdown')}
          className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between hover:bg-rose-950/40 text-slate-200 transition-all group text-left cursor-pointer border border-transparent hover:border-rose-900/50"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Power className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-rose-200 text-xs">Shut Down</div>
              <div className="text-[10px] text-rose-400/80">Turn off computer completely</div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-rose-300 transition-colors" />
        </button>
      </div>

      {/* Session Lock & Logout options */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <button
          onClick={() => handleAction('lock')}
          className="flex items-center gap-1.5 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
        >
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Lock Screen</span>
        </button>
        <button
          onClick={() => handleAction('logout')}
          className="flex items-center gap-1.5 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};
