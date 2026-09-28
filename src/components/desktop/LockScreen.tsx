import React, { useState } from 'react';
import { Lock, ArrowRight, Power, RotateCw, User } from 'lucide-react';
import { useSystem, WALLPAPERS } from '../../context/SystemContext';

export const LockScreen: React.FC = () => {
  const { unlockScreen, settings, setSessionState, brandLogo } = useSystem();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const activeWp = WALLPAPERS.find(w => w.id === settings.wallpaper) || WALLPAPERS[0];
  const now = new Date();

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    unlockScreen(password);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-between p-10 select-none overflow-hidden"
      style={{
        background: activeWp.isGradient ? activeWp.url : `url(${activeWp.url}) center/cover no-repeat fixed`
      }}
    >
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-md" />

      {/* Clock Top */}
      <div className="relative z-10 text-center pt-8">
        <div className="text-6xl font-extralight text-white font-mono tracking-tight">
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-sm font-medium text-slate-300 mt-2">
          {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Center Login Box */}
      <div className="relative z-10 w-full max-w-xs mx-auto text-center space-y-4">
        <div className="w-20 h-20 rounded-full mx-auto overflow-hidden ring-2 ring-violet-400/50 shadow-2xl">
          <img src={brandLogo} alt="User" className="w-full h-full object-cover" />
        </div>

        <div className="text-sm font-bold text-white tracking-wide">
          {settings.username}
        </div>

        <form onSubmit={handleUnlock} className="relative">
          <input
            type="password"
            autoFocus
            placeholder="Enter password (or press Enter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 shadow-xl"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-[11px] text-slate-400">Live session password: press Enter to unlock</p>
      </div>

      {/* Bottom Power Controls */}
      <div className="relative z-10 flex justify-end gap-3 text-slate-300">
        <button
          onClick={() => setSessionState('restarting')}
          className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors"
          title="Restart"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setSessionState('shutting_down')}
          className="p-2 rounded-xl bg-slate-900/60 hover:bg-rose-600 transition-colors"
          title="Shut Down"
        >
          <Power className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
