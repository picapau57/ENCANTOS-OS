import React, { useState, useEffect, useRef } from 'react';
import { 
  Disc, Download, Play, Pause, RotateCcw, CheckCircle2, 
  AlertCircle, Terminal, HardDrive, Cpu, Activity, Clock, 
  ShieldCheck, Layers, Sparkles, Copy, FileText, Check, 
  Usb, ArrowRight, Zap, RefreshCw, X, FolderCheck
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export interface BuildStage {
  id: string;
  name: string;
  desc: string;
  weight: number; // percentage portion of the 100% total
}

const BUILD_STAGES: BuildStage[] = [
  { id: 'preflight', name: 'Pre-flight Validation', desc: 'Verifying debootstrap, xorriso, squashfs-tools & disk space', weight: 10 },
  { id: 'rootfs', name: 'Debootstrap RootFS', desc: 'Fetching core base packages (Debian 13 / Ubuntu 24.04 Core)', weight: 20 },
  { id: 'kernel', name: 'Kernel & Firmware', desc: 'Compiling Linux 6.8.0-encantos-generic with Mesa Vulkan drivers', weight: 15 },
  { id: 'desktop', name: 'Desktop Environment', desc: 'Packaging Encantos Wayland shell, themes & PipeWire audio stack', weight: 20 },
  { id: 'installer', name: 'Calamares Installer', desc: 'Configuring Calamares OEM installer & automated live session', weight: 10 },
  { id: 'squashfs', name: 'SquashFS Compression', desc: 'Compressing system rootfs into filesystem.squashfs (XZ Level 9)', weight: 15 },
  { id: 'bootloader', name: 'Hybrid Bootloader', desc: 'Building GRUB 2.12 UEFI ESP + El Torito MBR Hybrid Boot structure', weight: 5 },
  { id: 'checksum', name: 'Checksum & Assembly', desc: 'Finalizing ISO image and generating cryptographic SHA-256 hash', weight: 5 },
];

export const EncantosIsoManager: React.FC = () => {
  const { addNotification, createFile } = useSystem();

  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'paused' | 'completed' | 'cancelled'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [activeTaskText, setActiveTaskText] = useState<string>('Ready to start OS ISO build task.');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [selectedProfile, setSelectedProfile] = useState<'standard' | 'developer' | 'minimal'>('standard');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [autoScrollLogs, setAutoScrollLogs] = useState<boolean>(true);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [copiedLogs, setCopiedLogs] = useState<boolean>(false);
  const [logFilter, setLogFilter] = useState<'all' | 'stages' | 'errors'>('all');

  const [logs, setLogs] = useState<{ id: string; time: string; type: 'info' | 'stage' | 'success' | 'warn'; text: string }[]>([
    { id: 'log-0', time: '00:00:00', type: 'info', text: 'Encantos ISO Manager supervisor initialized.' },
    { id: 'log-1', time: '00:00:00', type: 'info', text: 'Ready. Choose profile and click "Start ISO Build" to begin packaging.' }
  ]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  const isoFilename = selectedProfile === 'developer' 
    ? 'ENCANTOS-OS-1.0.0-Developer-amd64.iso' 
    : selectedProfile === 'minimal' 
      ? 'ENCANTOS-OS-1.0.0-Minimal-amd64.iso' 
      : 'ENCANTOS-OS-1.0.0-Aurora-amd64.iso';

  const isoSize = selectedProfile === 'developer' ? '3.8 GB' : selectedProfile === 'minimal' ? '1.2 GB' : '2.4 GB';
  const isoSha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const addLog = (text: string, type: 'info' | 'stage' | 'success' | 'warn' = 'info') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setLogs(prev => [...prev, { id: `log-${Date.now()}-${Math.random()}`, time: timeStr, type, text }]);
  };

  // Autoscroll terminal
  useEffect(() => {
    if (autoScrollLogs && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScrollLogs]);

  // Elapsed seconds timer
  useEffect(() => {
    if (buildStatus === 'building') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [buildStatus]);

  // Progress Pipeline Worker Simulation
  useEffect(() => {
    if (buildStatus !== 'building') {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const intervalTime = Math.max(120, Math.floor(600 / speedMultiplier));

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          setBuildStatus('completed');
          addLog(`[BUILD COMPLETE] ${isoFilename} generated successfully! Ready for download.`, 'success');
          addNotification({
            title: 'ISO Concluída com Sucesso!',
            message: `${isoFilename} está pronta para download no ISO Manager.`,
            type: 'success'
          });
          return 100;
        }

        const next = Math.min(100, prev + Math.floor(Math.random() * 3 + 1) * speedMultiplier);

        // Calculate active stage according to progress
        let accumulated = 0;
        let activeIdx = 0;
        for (let i = 0; i < BUILD_STAGES.length; i++) {
          accumulated += BUILD_STAGES[i].weight;
          if (next <= accumulated) {
            activeIdx = i;
            break;
          }
        }
        if (next >= 100) activeIdx = BUILD_STAGES.length - 1;

        if (activeIdx !== currentStageIndex) {
          setCurrentStageIndex(activeIdx);
          const stage = BUILD_STAGES[activeIdx];
          addLog(`>>> [STAGE ${activeIdx + 1}/${BUILD_STAGES.length}] ${stage.name}: ${stage.desc}`, 'stage');
        }

        // Generate lively progress task messages
        const currentStage = BUILD_STAGES[activeIdx];
        if (activeIdx === 0) {
          setActiveTaskText(`Verifying host toolchain: xorriso, debootstrap, mtools, squashfs-tools...`);
        } else if (activeIdx === 1) {
          setActiveTaskText(`Unpacking base Debian/Ubuntu rootfs packages (chroot /tmp/encantos-rootfs)...`);
        } else if (activeIdx === 2) {
          setActiveTaskText(`Installing kernel 6.8.0-encantos-generic and Mesa 24.1 Vulkan drivers...`);
        } else if (activeIdx === 3) {
          setActiveTaskText(`Compiling Encantos Wayland shell, Calamares branding and PipeWire audio...`);
        } else if (activeIdx === 4) {
          setActiveTaskText(`Setting up Calamares OEM installer and live session desktop configuration...`);
        } else if (activeIdx === 5) {
          setActiveTaskText(`Compressing squashfs layer with XZ (block size 1MB, level 9)...`);
        } else if (activeIdx === 6) {
          setActiveTaskText(`Injecting GRUB 2.12 EFI system partition and El Torito MBR hybrid boot header...`);
        } else {
          setActiveTaskText(`Computing SHA-256 integrity checksum and writing hybrid ISO superblock...`);
        }

        if (Math.random() > 0.65) {
          const detailMessages = [
            `Writing sector ${Math.floor(next * 52400)} of 5242880...`,
            `Compressing filesystem.squashfs: ratio 3.42:1 (${Math.floor(next)}% done)`,
            `Verifying EFI /EFI/BOOT/BOOTX64.EFI signed GRUB image...`,
            `Injecting Plymouth splash theme "encantos-aurora"...`,
            `Validating kernel initramfs hooks (zstd compressed)...`
          ];
          const randomMsg = detailMessages[Math.floor(Math.random() * detailMessages.length)];
          addLog(randomMsg, 'info');
        }

        return next;
      });
    }, intervalTime);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [buildStatus, speedMultiplier, currentStageIndex, isoFilename, addNotification]);

  // Actions
  const handleStartBuild = () => {
    if (progress >= 100) {
      setProgress(0);
      setCurrentStageIndex(0);
      setElapsedSeconds(0);
    }
    setBuildStatus('building');
    addLog(`Initiating OS build for profile: ${selectedProfile.toUpperCase()}`, 'stage');
    addLog(`Target ISO: ${isoFilename} (${isoSize})`, 'info');
  };

  const handlePauseResume = () => {
    if (buildStatus === 'building') {
      setBuildStatus('paused');
      addLog('Build task paused by user.', 'warn');
    } else if (buildStatus === 'paused') {
      setBuildStatus('building');
      addLog('Build task resumed.', 'info');
    }
  };

  const handleCancel = () => {
    setBuildStatus('cancelled');
    addLog('Build task cancelled.', 'warn');
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  const handleReset = () => {
    setBuildStatus('idle');
    setProgress(0);
    setCurrentStageIndex(0);
    setElapsedSeconds(0);
    setActiveTaskText('Ready to start OS ISO build task.');
    addLog('Build session reset to initial state.', 'info');
  };

  const handleInstantComplete = () => {
    setProgress(100);
    setCurrentStageIndex(BUILD_STAGES.length - 1);
    setBuildStatus('completed');
    addLog(`[FAST-FORWARD] Fast-tracked ISO generation pipeline directly to 100% complete!`, 'success');
    addNotification({
      title: 'ISO Concluída!',
      message: `${isoFilename} gerada e pronta para download!`,
      type: 'success'
    });
  };

  // Download Trigger
  const handleDownloadIso = () => {
    const isoContent = `ENCANTOS-OS-BOOTABLE-HYBRID-ISO-IMAGE-HEADER
DISTRIBUTION: ENCANTOS OS
VERSION: 1.0.0-LTS "Aurora"
PROFILE: ${selectedProfile.toUpperCase()}
ARCH: x86_64 (amd64)
BASE: Debian 13 "Trixie" / Ubuntu 24.04 LTS Core
KERNEL: Linux 6.8.0-encantos-generic
BOOTLOADER: GRUB 2.12 UEFI (ESP) + El Torito BIOS MBR Hybrid
GRAPHICAL_SHELL: Encantos Wayland Compositor (EGL/Vulkan Hardware Accelerated)
INSTALLER: Calamares 3.3.6 (Encantos Custom Theme)
AUDIO: PipeWire 1.0.7 Pro-Audio Stack
SQUASHFS_COMPRESSION: XZ Level 9 (1MB Dictionary)
SHA256: ${isoSha256}
BUILD_DATE: ${new Date().toISOString()}
================================================================================
ENCANTOS OS OFFICIAL LIVE & INSTALLABLE COMPRESSED SYSTEM ROOTFS PAYLOAD
`;
    const blob = new Blob([isoContent], { type: 'application/x-cd-image' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isoFilename;
    a.click();
    URL.revokeObjectURL(url);

    addNotification({
      title: 'Download Iniciado',
      message: `Baixando ${isoFilename} para o seu computador!`,
      type: 'success'
    });
  };

  const handleDownloadSha256 = () => {
    const content = `${isoSha256}  ${isoFilename}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${isoFilename}.sha256`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToDesktop = () => {
    createFile('desktop', isoFilename, `ENCANTOS-OS-ISO-IMAGE\nSHA256: ${isoSha256}\n`);
    addNotification({
      title: 'Salvo na Área de Trabalho',
      message: `${isoFilename} adicionado à pasta Desktop do sistema.`,
      type: 'success'
    });
  };

  const handleCopySha256 = () => {
    navigator.clipboard.writeText(isoSha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
    addNotification({
      title: 'Hash Copiado',
      message: 'Hash SHA-256 copiado para a área de transferência.',
      type: 'info'
    });
  };

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.time}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const calculateEta = () => {
    if (buildStatus !== 'building' || progress === 0) return '--:--';
    const remainingPercent = 100 - progress;
    const rate = progress / Math.max(1, elapsedSeconds);
    const estSeconds = Math.round(remainingPercent / Math.max(0.01, rate));
    return formatSeconds(estSeconds);
  };

  const filteredLogs = logs.filter(l => {
    if (logFilter === 'stages') return l.type === 'stage' || l.type === 'success';
    if (logFilter === 'errors') return l.type === 'warn';
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Banner / Toolbar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-violet-500/20 flex items-center justify-center shrink-0">
            <Disc className={`w-5 h-5 text-white ${buildStatus === 'building' ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
            {buildStatus === 'completed' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">ISO Manager</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                buildStatus === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                  : buildStatus === 'building'
                    ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                    : buildStatus === 'paused'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {buildStatus.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                {selectedProfile.toUpperCase()} • x86_64
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-md">
              Supervisor de compilação, telemetria de progresso e download de ISO
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* THE PROMINENT DOWNLOAD BUTTON ONCE FINISHED */}
          {buildStatus === 'completed' ? (
            <button
              onClick={handleDownloadIso}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer ring-2 ring-emerald-400/50 hover:scale-105 active:scale-95 animate-bounce"
            >
              <Download className="w-4 h-4" />
              <span>Download ISO ({isoSize})</span>
            </button>
          ) : (
            <button
              disabled
              title="O download estará disponível assim que a geração da ISO terminar"
              className="px-4 py-2 bg-slate-800/60 text-slate-500 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-not-allowed opacity-60"
            >
              <Download className="w-4 h-4" />
              <span>Download ISO (Aguardando)</span>
            </button>
          )}

          {buildStatus === 'idle' || buildStatus === 'cancelled' ? (
            <button
              onClick={handleStartBuild}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-violet-600/30 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Iniciar Compilação</span>
            </button>
          ) : buildStatus === 'building' ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePauseResume}
                className="px-3 py-2 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pausar</span>
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancelar</span>
              </button>
            </div>
          ) : buildStatus === 'paused' ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePauseResume}
                className="px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Retomar</span>
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancelar</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Nova Compilação</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* SUCCESS CELEBRATION CARD - When completed, provides the primary Download button */}
        {buildStatus === 'completed' && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 shadow-xl space-y-3 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 p-0.5 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      Geração da ISO Finalizada com Sucesso!
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                      100% PRONTA
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    O arquivo de imagem híbrido inicializável foi construído e empacotado.
                  </p>
                </div>
              </div>

              {/* DOWNLOAD BUTTON */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadIso}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer ring-2 ring-white/30 hover:scale-105 active:scale-95"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Download Imagem ISO</span>
                </button>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                onClick={handleCopySha256}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedHash ? 'Hash Copiado!' : 'Copiar Hash SHA-256'}</span>
              </button>

              <button
                onClick={handleDownloadSha256}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Baixar Assinatura .sha256</span>
              </button>

              <button
                onClick={handleSaveToDesktop}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FolderCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Salvar Atalho no Desktop</span>
              </button>
            </div>
          </div>
        )}

        {/* PROGRESS HERO & TELEMETRY HUD */}
        <div className="p-4.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          {/* Header of HUD */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Activity className="w-4 h-4 text-violet-400" />
                <span>Monitoramento do Processo em Tempo Real</span>
              </div>
              <div className="text-sm font-bold text-white mt-0.5 truncate max-w-xl flex items-center gap-2">
                <span>{activeTaskText}</span>
              </div>
            </div>

            {/* Time Telemetry */}
            <div className="flex items-center gap-3 self-start sm:self-center">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Tempo Decorrido</div>
                <div className="text-xs font-bold font-mono text-cyan-400 mt-0.5">{formatSeconds(elapsedSeconds)}</div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Previsão Restante</div>
                <div className="text-xs font-bold font-mono text-violet-400 mt-0.5">{calculateEta()}</div>
              </div>
            </div>
          </div>

          {/* Large Animated Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Progresso Geral:</span>
                <span className="text-white font-mono font-bold">{progress}%</span>
              </span>
              <span className="text-slate-400 text-[11px] font-mono">
                Etapa {Math.min(BUILD_STAGES.length, currentStageIndex + 1)} de {BUILD_STAGES.length}
              </span>
            </div>

            <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
              <div
                className={`h-full rounded-full transition-all duration-300 relative overflow-hidden ${
                  buildStatus === 'completed'
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-md shadow-emerald-500/50'
                    : 'bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 shadow-md shadow-violet-500/50'
                }`}
                style={{ width: `${progress}%` }}
              >
                {buildStatus === 'building' && (
                  <div className="absolute inset-0 bg-white/20 animate-[pulse_1.5s_infinite]" />
                )}
              </div>
            </div>
          </div>

          {/* Real-time Hardware Performance Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU Load</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {buildStatus === 'building' ? `${(65 + (progress % 28)).toFixed(1)}%` : '4.2%'}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-cyan-500 h-full rounded-full transition-all" 
                  style={{ width: buildStatus === 'building' ? `${65 + (progress % 28)}%` : '8%' }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-violet-400" /> RAM Alocada</span>
                <span className="font-mono text-violet-300 font-bold">
                  {buildStatus === 'building' ? `${(3.8 + (progress * 0.02)).toFixed(1)} GB` : '1.8 GB'}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-violet-500 h-full rounded-full transition-all" 
                  style={{ width: buildStatus === 'building' ? `${35 + (progress * 0.3)}%` : '15%' }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-emerald-400" /> I/O Escrita</span>
                <span className="font-mono text-emerald-300 font-bold">
                  {buildStatus === 'building' ? `${(80 + (progress % 60)).toFixed(0)} MB/s` : '0.0 MB/s'}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all" 
                  style={{ width: buildStatus === 'building' ? `${50 + (progress % 45)}%` : '0%' }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-amber-400" /> Compressão</span>
                <span className="font-mono text-amber-300 font-bold">
                  {buildStatus === 'building' ? 'XZ 3.4x' : 'N/A'}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all" 
                  style={{ width: buildStatus === 'building' ? '68%' : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* PROFILE & SPEED SELECTOR BAR */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Perfil da ISO:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                disabled={buildStatus === 'building'}
                onClick={() => setSelectedProfile('standard')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedProfile === 'standard' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Oficial Aurora (2.4 GB)
              </button>
              <button
                disabled={buildStatus === 'building'}
                onClick={() => setSelectedProfile('developer')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedProfile === 'developer' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Developer (3.8 GB)
              </button>
              <button
                disabled={buildStatus === 'building'}
                onClick={() => setSelectedProfile('minimal')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedProfile === 'minimal' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Minimal Core (1.2 GB)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Velocidade:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSpeedMultiplier(1)}
                className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                  speedMultiplier === 1 ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1x Real
              </button>
              <button
                onClick={() => setSpeedMultiplier(3)}
                className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                  speedMultiplier === 3 ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3x Turbo
              </button>
              <button
                onClick={handleInstantComplete}
                className="px-2 py-1 rounded-lg text-[11px] font-medium text-emerald-400 hover:bg-emerald-950/40 transition-colors cursor-pointer flex items-center gap-1"
                title="Completar imediatamente para teste do download"
              >
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>Instantâneo</span>
              </button>
            </div>
          </div>
        </div>

        {/* STEP PIPELINE VISUALIZER */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>Etapas do Pipeline de Construção ({BUILD_STAGES.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Status: <span className="text-slate-200 font-medium">{buildStatus === 'completed' ? 'Todas etapas concluídas' : BUILD_STAGES[currentStageIndex]?.name}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {BUILD_STAGES.map((stage, idx) => {
              const isPast = progress >= (idx + 1) * 12 || buildStatus === 'completed';
              const isCurrent = idx === currentStageIndex && buildStatus !== 'completed' && buildStatus !== 'idle';
              const isPending = !isPast && !isCurrent;

              return (
                <div
                  key={stage.id}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    isPast
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : isCurrent
                        ? 'bg-violet-950/30 border-violet-500/50 text-white ring-1 ring-violet-500/50 shadow-md shadow-violet-500/10'
                        : 'bg-slate-950/50 border-slate-800/60 text-slate-400 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-slate-400">0{idx + 1}</span>
                    <div>
                      {isPast ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-700" />
                      )}
                    </div>
                  </div>
                  <div className="font-bold text-xs truncate text-white">{stage.name}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5 leading-tight">{stage.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LIVE TERMINAL LOG CONSOLE */}
        <div className="rounded-2xl bg-slate-950 border border-slate-800/90 overflow-hidden shadow-2xl flex flex-col">
          {/* Console Header */}
          <div className="px-3.5 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-mono">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>live-build-supervisor.log</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setLogFilter('all')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${logFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setLogFilter('stages')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${logFilter === 'stages' ? 'bg-slate-800 text-violet-300' : 'text-slate-400'}`}
                >
                  Etapas
                </button>
                <button
                  onClick={() => setLogFilter('errors')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${logFilter === 'errors' ? 'bg-slate-800 text-amber-300' : 'text-slate-400'}`}
                >
                  Alertas
                </button>
              </div>

              <div className="h-3 w-px bg-slate-800" />

              <button
                onClick={handleCopyLogs}
                className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer text-[11px]"
                title="Copiar log do terminal"
              >
                {copiedLogs ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span className="hidden sm:inline">{copiedLogs ? 'Copiado' : 'Copiar'}</span>
              </button>

              <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoScrollLogs}
                  onChange={(e) => setAutoScrollLogs(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-violet-600 focus:ring-0 w-3 h-3"
                />
                <span className="hidden sm:inline">Autoscroll</span>
              </label>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-3.5 font-mono text-[11px] max-h-56 min-h-36 overflow-y-auto space-y-1 bg-black/80">
            {filteredLogs.map(log => (
              <div key={log.id} className="leading-relaxed flex items-start gap-2">
                <span className="text-slate-600 select-none shrink-0">{log.time}</span>
                <span className={`shrink-0 font-bold ${
                  log.type === 'stage' 
                    ? 'text-violet-400' 
                    : log.type === 'success' 
                      ? 'text-emerald-400' 
                      : log.type === 'warn' 
                        ? 'text-amber-400' 
                        : 'text-cyan-500'
                }`}>
                  [{log.type.toUpperCase()}]
                </span>
                <span className={`${
                  log.type === 'stage' 
                    ? 'text-violet-200 font-semibold' 
                    : log.type === 'success' 
                      ? 'text-emerald-200 font-bold' 
                      : log.type === 'warn' 
                        ? 'text-amber-200' 
                        : 'text-slate-300'
                }`}>
                  {log.text}
                </span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
