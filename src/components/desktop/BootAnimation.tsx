import React, { useState, useEffect } from 'react';
import { Loader2, Terminal, ChevronRight } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export const BootAnimation: React.FC = () => {
  const { setSessionState, brandLogo } = useSystem();
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    'Loading Linux 6.8.0-encantos-generic...',
    'Loading initial ramdisk...',
    '[    0.000000] Linux version 6.8.0-encantos (buildd@encantos) (gcc-13)',
    '[    0.214022] Command line: BOOT_IMAGE=/live/vmlinuz boot=live quiet splash',
    '[    0.412891] ACPI: Core revision 20240322',
    '[    0.620188] systemd[1]: Starting systemd 256.4...',
    '[    0.891024] systemd[1]: Mounted EFI System Partition /boot/efi.',
    '[    1.120482] systemd[1]: Starting NetworkManager.service...',
    '[    1.340911] systemd[1]: Starting PipeWire Sound Server...',
    '[    1.512099] systemd[1]: Starting Encantos Wayland Compositor...',
    '[    1.804212] systemd[1]: Reached target Graphical Interface.',
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowLogs(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Automatically transition to desktop after 2.8s
    const timer = setTimeout(() => {
      setSessionState('desktop');
    }, 2800);
    return () => clearTimeout(timer);
  }, [setSessionState]);

  return (
    <div className="fixed inset-0 z-50 bg-[#070a12] text-white flex flex-col items-center justify-between p-8 select-none">
      <div className="w-full flex justify-between items-center text-xs text-slate-500 font-mono">
        <span>UEFI x86_64 Bootloader</span>
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="hover:text-slate-300 underline"
        >
          {showLogs ? 'Hide boot log (Esc)' : 'Show boot log (Esc)'}
        </button>
      </div>

      {showLogs ? (
        <div className="w-full max-w-3xl bg-black/80 border border-slate-800 p-4 rounded-xl font-mono text-xs text-slate-300 space-y-1 h-80 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="text-emerald-400">{log}</div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-6 my-auto">
          {/* Glowing Emblem */}
          <div className="relative">
            <div className="absolute inset-0 bg-violet-600/30 blur-2xl rounded-full animate-pulse" />
            <div className="w-24 h-24 rounded-3xl overflow-hidden ring-2 ring-violet-500/40 shadow-2xl relative z-10">
              <img src={brandLogo} alt="Encantos OS" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-wider text-white">ENCANTOS OS</h1>
            <p className="text-xs text-slate-400 font-mono tracking-widest">VERSION 1.0.0 "AURORA"</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-violet-400 font-mono pt-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Initializing desktop session...</span>
          </div>
        </div>
      )}

      <div className="text-center text-[11px] text-slate-600 font-mono">
        Technology with a touch of magic · Press Esc for verbose boot messages
      </div>
    </div>
  );
};
