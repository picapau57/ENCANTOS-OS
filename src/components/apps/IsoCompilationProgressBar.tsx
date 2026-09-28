import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, Loader2, Terminal, Copy, Check, Clock, Activity, 
  HardDrive, ShieldCheck, Cpu, Layers, Sparkles, X, RotateCcw, 
  ChevronDown, ChevronUp, Zap, Disc, FileCode, CheckCheck 
} from 'lucide-react';

export interface CompilationStage {
  id: number;
  name: string;
  shortName: string;
  description: string;
  command: string;
  targetPercent: number;
  category: 'setup' | 'base' | 'kernel' | 'packages' | 'theme' | 'squashfs' | 'iso' | 'finalize';
}

export const COMPILATION_STAGES: CompilationStage[] = [
  {
    id: 1,
    name: 'Ambiente Chroot & Workspace',
    shortName: 'Chroot Init',
    description: 'Montando namespaces de isolamento e diretórios em /tmp/encantos-build',
    command: 'mount -t proc /proc /tmp/build/proc && mount -o bind /dev /tmp/build/dev',
    targetPercent: 12,
    category: 'setup'
  },
  {
    id: 2,
    name: 'Bootstrap do Sistema Base',
    shortName: 'Base RootFS',
    description: 'Descompactando repositórios oficiais e pacotes essenciais do Debian/Ubuntu',
    command: 'debootstrap --variant=minbase --arch=amd64 trixie /tmp/build/rootfs',
    targetPercent: 24,
    category: 'base'
  },
  {
    id: 3,
    name: 'Kernel Linux & Initramfs',
    shortName: 'Kernel DKMS',
    description: 'Compilando módulos DKMS, drivers de hardware e Dracut early-boot',
    command: 'dracut --kver 6.8.0-encantos-lts --force /tmp/build/boot/initrd.img',
    targetPercent: 38,
    category: 'kernel'
  },
  {
    id: 4,
    name: 'Injeção de Pacotes & Desktop',
    shortName: 'Softwares',
    description: 'Instalando ambiente gráfico Wayland, PipeWire e softwares selecionados',
    command: 'apt-get install -y --no-install-recommends encantos-desktop pipewire calamares',
    targetPercent: 54,
    category: 'packages'
  },
  {
    id: 5,
    name: 'Estilização & Plymouth Splash',
    shortName: 'Personalização',
    description: 'Aplicando paleta de cores, ícones, wallpapers e tema de inicialização',
    command: 'plymouth-set-default-theme encantos-pulse -R && gsettings set defaults',
    targetPercent: 70,
    category: 'theme'
  },
  {
    id: 6,
    name: 'Compressão SquashFS XZ-9',
    shortName: 'SquashFS XZ',
    description: 'Compactando imagem do sistema com compressão máxima de dicionário 1MB',
    command: 'mksquashfs /tmp/build/rootfs /tmp/build/live/filesystem.squashfs -comp xz -b 1M',
    targetPercent: 86,
    category: 'squashfs'
  },
  {
    id: 7,
    name: 'Montagem de ISO Híbrida UEFI/MBR',
    shortName: 'Hybrid ISO',
    description: 'Criando imagem ISO inicializável com xorriso e cabeçalhos El Torito + EFI',
    command: 'xorriso -as mkisofs -iso-level 3 -r -V "ENCANTOS_LIVE" -e EFI/boot.img -no-emul-boot',
    targetPercent: 95,
    category: 'iso'
  },
  {
    id: 8,
    name: 'Checksum Criptográfico SHA-256',
    shortName: 'SHA-256 Check',
    description: 'Calculando hash de verificação de integridade e gravando manifesto',
    command: 'sha256sum encantos-custom-1.0.0-amd64.iso > encantos-custom-1.0.0-amd64.iso.sha256',
    targetPercent: 100,
    category: 'finalize'
  }
];

interface IsoCompilationProgressBarProps {
  isBuilding: boolean;
  progress: number;
  stageName: string;
  logs: string[];
  buildComplete: boolean;
  estimatedIsoSizeGb: string;
  selectedPackagesCount: number;
  kernelVersion: string;
  distroName: string;
  isoEdition: string;
  onStartBuild: (speedMultiplier?: number) => void;
  onCancelBuild: () => void;
}

export const IsoCompilationProgressBar: React.FC<IsoCompilationProgressBarProps> = ({
  isBuilding,
  progress,
  stageName,
  logs,
  buildComplete,
  estimatedIsoSizeGb,
  selectedPackagesCount,
  kernelVersion,
  distroName,
  isoEdition,
  onStartBuild,
  onCancelBuild
}) => {
  const [showConsole, setShowConsole] = useState(true);
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [buildSpeed, setBuildSpeed] = useState<1 | 2 | 3>(1);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Timer for elapsed seconds during build
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBuilding) {
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else if (!buildComplete) {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isBuilding, buildComplete]);

  // Auto-scroll console to bottom when new logs arrive
  useEffect(() => {
    if (consoleBottomRef.current && showConsole) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, showConsole]);

  // Determine current active stage index
  const currentStageIndex = COMPILATION_STAGES.findIndex(s => progress <= s.targetPercent);
  const activeStage = COMPILATION_STAGES[currentStageIndex !== -1 ? currentStageIndex : COMPILATION_STAGES.length - 1];

  // Calculated estimated time remaining (ETA)
  const totalEstimatedSeconds = Math.round(22 / buildSpeed);
  const remainingSeconds = Math.max(0, totalEstimatedSeconds - elapsedSeconds);

  // Format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Simulated throughput metric based on active stage
  const getSimulatedThroughput = () => {
    if (!isBuilding) return 'Idle';
    if (progress < 25) return 'Network: 88 MB/s · APT Mirror';
    if (progress < 50) return 'CPU: 96% · Compiling DKMS & Dracut';
    if (progress < 70) return 'I/O: 145 MB/s · Unpacking .deb archives';
    if (progress < 87) return 'XZ Multi-thread: 198 MB/s · Level 9';
    if (progress < 96) return 'Disk Write: 320 MB/s · xorriso Hybrid';
    return 'Finalizing SHA-256 Digest';
  };

  // Current written size accumulation simulation
  const targetGb = parseFloat(estimatedIsoSizeGb) || 2.14;
  const currentProcessedGb = ((progress / 100) * targetGb).toFixed(2);

  const copyConsoleLogs = () => {
    if (logs.length === 0) return;
    navigator.clipboard.writeText(logs.join('\n'));
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-5 space-y-4 shadow-xl">
      {/* Header with Title and Real-time Telemetry Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            buildComplete 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : isBuilding 
              ? 'bg-violet-600/20 text-violet-400 border border-violet-500/40 animate-pulse'
              : 'bg-slate-800 text-slate-400'
          }`}>
            {buildComplete ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : isBuilding ? (
              <Disc className="w-5 h-5 animate-spin text-cyan-400" />
            ) : (
              <Terminal className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Pipeline de Compilação & Geração da ISO
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                buildComplete
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : isBuilding
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {buildComplete ? 'Compilação Concluída' : isBuilding ? 'Compilando ao Vivo' : 'Aguardando Início'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isBuilding 
                ? activeStage.description
                : buildComplete 
                ? 'Todos os módulos foram empacotados com sucesso na imagem bootável.'
                : 'Clique em "Iniciar Compilação" para montar a ISO híbrida personalizada.'}
            </p>
          </div>
        </div>

        {/* Real-time Telemetry stats */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {isBuilding && (
            <>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{formatTime(elapsedSeconds)}</span>
                <span className="text-slate-500">/ ETA ~{formatTime(remainingSeconds)}</span>
              </div>

              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentProcessedGb} GB / {targetGb} GB</span>
              </div>
            </>
          )}

          {/* Speed Selector Toggle */}
          {!isBuilding && !buildComplete && (
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
              <button
                onClick={() => setBuildSpeed(1)}
                className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                  buildSpeed === 1 ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Velocidade normal de simulação"
              >
                1x Normal
              </button>
              <button
                onClick={() => setBuildSpeed(2)}
                className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                  buildSpeed === 2 ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Velocidade rápida (2x)"
              >
                2x Rápido
              </button>
              <button
                onClick={() => setBuildSpeed(3)}
                className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                  buildSpeed === 3 ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Modo Turbo (3x)"
              >
                3x Turbo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PROGRESS BAR COMPONENT CONTAINER */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Progresso Geral</span>
            {isBuilding && (
              <span className="text-[11px] font-mono text-cyan-400 animate-pulse">
                · {activeStage.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className={`text-sm font-bold ${
              buildComplete ? 'text-emerald-400' : isBuilding ? 'text-cyan-400' : 'text-slate-400'
            }`}>
              {progress}%
            </span>
          </div>
        </div>

        {/* HIGH-FIDELITY ANIMATED PROGRESS BAR */}
        <div className="relative w-full bg-slate-900 rounded-xl h-4 p-0.5 overflow-hidden border border-slate-800 shadow-inner">
          {/* Subtle Grid Track Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:8px_8px] opacity-25" />

          {/* Glowing Animated Bar */}
          <div
            className={`relative h-full rounded-lg transition-all duration-300 overflow-hidden shadow-lg ${
              buildComplete
                ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 shadow-emerald-500/25'
                : isBuilding
                ? 'bg-gradient-to-r from-cyan-500 via-violet-600 to-emerald-400 shadow-violet-500/30'
                : 'bg-slate-800'
            }`}
            style={{ width: `${progress}%` }}
          >
            {/* Animated Striped Pattern Shimmer (Candy Stripe Effect) */}
            {isBuilding && (
              <div 
                className="absolute inset-0 opacity-30 animate-pulse"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 0, rgba(255,255,255,0.2) 10px, transparent 10px, transparent 20px)'
                }}
              />
            )}

            {/* Glowing Leading Head Indicator */}
            {isBuilding && progress > 2 && progress < 100 && (
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-r-md shadow-[0_0_12px_#38bdf8] animate-pulse" />
            )}
          </div>
        </div>

        {/* Live Sub-metrics / Throughput & Active Command */}
        {isBuilding && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-slate-400 pt-1 gap-1">
            <div className="flex items-center gap-1.5 text-slate-300 truncate">
              <Activity className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span>{getSimulatedThroughput()}</span>
            </div>
            <div className="text-slate-500 truncate max-w-sm" title={activeStage.command}>
              <span className="text-slate-400 font-mono">$ {activeStage.command}</span>
            </div>
          </div>
        )}
      </div>

      {/* MULTI-STAGE VISUAL MILESTONE TRACKER */}
      <div className="pt-2">
        <div className="text-[11px] font-semibold text-slate-400 mb-2">
          Etapas do Pipeline de Construção ({COMPILATION_STAGES.filter(s => progress >= s.targetPercent).length}/{COMPILATION_STAGES.length})
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
          {COMPILATION_STAGES.map((s, idx) => {
            const isCompleted = progress >= s.targetPercent;
            const isCurrent = !isCompleted && (idx === 0 || progress >= COMPILATION_STAGES[idx - 1].targetPercent);

            return (
              <div
                key={s.id}
                className={`p-2 rounded-xl border text-[10px] transition-all flex flex-col justify-between min-h-[58px] ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : isCurrent
                    ? 'bg-violet-950/40 border-violet-500/50 text-violet-200 ring-1 ring-violet-500/30 shadow-md shadow-violet-950/50'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] opacity-75">{s.id}.</span>
                  {isCompleted ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-bold">
                      ✓
                    </span>
                  ) : isCurrent ? (
                    <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-800" />
                  )}
                </div>
                <div className="font-semibold truncate mt-1 text-slate-200">
                  {s.shortName}
                </div>
                <div className="text-[9px] opacity-60 font-mono">
                  {s.targetPercent}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TERMINAL CONSOLE LOGS (EXPANDABLE) */}
      <div className="pt-2">
        <div className="flex items-center justify-between pb-1.5 text-xs">
          <button
            onClick={() => setShowConsole(!showConsole)}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white font-medium cursor-pointer transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Saída do Console de Compilação ({logs.length} linhas)</span>
            {showConsole ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={copyConsoleLogs}
              disabled={logs.length === 0}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 transition-colors cursor-pointer disabled:opacity-30"
              title="Copiar log completo"
            >
              {copiedLogs ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLogs ? 'Copiado!' : 'Copiar Logs'}</span>
            </button>
          </div>
        </div>

        {showConsole && (
          <div className="h-36 bg-[#080c14] border border-slate-800/90 rounded-xl p-3 font-mono text-[10.5px] text-slate-300 overflow-y-auto space-y-1 shadow-inner select-text">
            {logs.length === 0 ? (
              <div className="text-slate-600 italic">
                // O console de compilação em tempo real exibirá a saída do kernel, squashfs e debootstrap aqui...
              </div>
            ) : (
              logs.map((log, i) => {
                const isSuccess = log.includes('successfully') || log.includes('Completed') || log.includes('stamped');
                const isStage = log.includes('Starting') || log.includes('Compressing') || log.includes('Bootstrapping');
                return (
                  <div 
                    key={i} 
                    className={`leading-relaxed ${
                      isSuccess 
                        ? 'text-emerald-400 font-semibold' 
                        : isStage 
                        ? 'text-cyan-300' 
                        : 'text-slate-300'
                    }`}
                  >
                    {log}
                  </div>
                );
              })
            )}
            <div ref={consoleBottomRef} />
          </div>
        )}
      </div>

      {/* ACTION BUTTONS: START / CANCEL / RESET */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/80">
        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <span>Target:</span>
          <span className="font-semibold text-slate-200">{distroName} ({isoEdition})</span>
          <span>·</span>
          <span>Kernel {kernelVersion}</span>
          <span>·</span>
          <span>{selectedPackagesCount} pacotes</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isBuilding ? (
            <button
              onClick={onCancelBuild}
              className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancelar Compilação</span>
            </button>
          ) : buildComplete ? (
            <button
              onClick={() => onStartBuild(buildSpeed)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recompilar Nova Imagem</span>
            </button>
          ) : (
            <button
              onClick={() => onStartBuild(buildSpeed)}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-600 hover:from-violet-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-600/30 flex items-center gap-2 transition-all cursor-pointer ring-1 ring-white/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Iniciar Compilação da ISO ({estimatedIsoSizeGb} GB)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IsoCompilationProgressBar;
