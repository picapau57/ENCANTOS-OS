import React, { useEffect } from 'react';
import { Power, RotateCw, Moon, Save, Zap } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export const ShutdownScreen: React.FC<{ mode: 'shutting_down' | 'restarting' | 'sleeping' | 'hibernating' }> = ({ mode }) => {
  const { setSessionState, brandLogo } = useSystem();

  // For sleep mode: allow waking up with any keypress or click
  useEffect(() => {
    if (mode === 'sleeping') {
      const handleWake = () => {
        setSessionState('desktop');
      };
      window.addEventListener('keydown', handleWake);
      window.addEventListener('mousedown', handleWake);
      return () => {
        window.removeEventListener('keydown', handleWake);
        window.removeEventListener('mousedown', handleWake);
      };
    }
  }, [mode, setSessionState]);

  // For restarting mode: auto-reboot to booting after 2.2 seconds
  useEffect(() => {
    if (mode === 'restarting') {
      const timer = setTimeout(() => {
        setSessionState('booting');
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [mode, setSessionState]);

  if (mode === 'sleeping') {
    return (
      <div 
        onClick={() => setSessionState('desktop')}
        className="fixed inset-0 z-50 bg-[#04060a] text-white flex flex-col items-center justify-center space-y-6 select-none cursor-pointer"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center animate-pulse shadow-2xl shadow-indigo-500/20">
            <Moon className="w-8 h-8" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold tracking-wider text-slate-200">System in Sleep Mode</h2>
          <p className="text-xs text-slate-500 font-mono">Suspended to RAM (S3 State) · Hardware in ultra-low power</p>
          <p className="text-[11px] text-indigo-400 font-medium pt-2 animate-bounce">Click anywhere or press any key to wake</p>
        </div>
      </div>
    );
  }

  if (mode === 'hibernating') {
    return (
      <div className="fixed inset-0 z-50 bg-[#05070d] text-white flex flex-col items-center justify-center space-y-6 select-none p-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-2xl">
          <Save className="w-8 h-8" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold tracking-wider text-white">System Hibernated</h2>
          <p className="text-xs text-slate-400 font-mono">Session image saved to swap storage (/dev/nvme0n1p2)</p>
          <p className="text-[11px] text-emerald-400">Zero power draw · Running applications safely frozen</p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => setSessionState('desktop')}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Resume Encantos OS Session</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#070a12] text-white flex flex-col items-center justify-center space-y-6 select-none">
      <div className="w-16 h-16 rounded-2xl overflow-hidden ring-1 ring-violet-500/30">
        <img src={brandLogo} alt="Encantos OS" className="w-full h-full object-cover" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold tracking-wider">
          {mode === 'shutting_down' ? 'ENCANTOS OS is Shutting Down...' : 'Restarting Encantos OS...'}
        </h2>
        <p className="text-xs text-slate-400 font-mono">Flushing memory caches and unmounting filesystems...</p>
      </div>

      <div className="pt-6">
        <button
          onClick={() => setSessionState('booting')}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
        >
          <Power className="w-4 h-4" />
          <span>Power On / Boot Again</span>
        </button>
      </div>
    </div>
  );
};
