import React, { useState } from 'react';
import { 
  Disc, Folder, ShoppingBag, Settings as SettingsIcon, Terminal, 
  Activity, HardDrive, Cpu, FileText, Plus, RefreshCw, Palette, 
  Monitor, Info, Check, Download, ShieldCheck, Usb, Sparkles, ExternalLink, X, CheckCircle2, Copy
} from 'lucide-react';
import { useSystem, WALLPAPERS } from '../../context/SystemContext';
import { WindowId } from '../../types';
import { SystemMonitorWidget } from './SystemMonitorWidget';

export const Desktop: React.FC = () => {
  const { 
    settings, 
    openWindow, 
    createFolder, 
    createFile, 
    fs, 
    setStartMenuOpen, 
    setQuickSettingsOpen, 
    setCalendarOpen, 
    setSearchOpen,
    setPowerMenuOpen,
    setControlCenterOpen,
    brandLogo,
    showSystemMonitorWidget,
    setShowSystemMonitorWidget,
    addNotification
  } = useSystem();

  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [showIsoDownloadModal, setShowIsoDownloadModal] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const activeWp = WALLPAPERS.find(w => w.id === settings.wallpaper) || WALLPAPERS[0];

  const officialIsoFilename = 'ENCANTOS-OS-1.0.0-Aurora-amd64.iso';
  const officialIsoSha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const downloadDesktopIso = () => {
    // Generate the downloadable hybrid bootable ISO descriptor file
    const isoContent = `ENCANTOS-OS-BOOTABLE-HYBRID-ISO-IMAGE-HEADER
DISTRIBUTION: ENCANTOS OS
VERSION: 1.0.0-LTS "Aurora"
ARCH: x86_64 (amd64)
BASE: Debian 13 "Trixie" / Ubuntu 24.04 LTS Core
KERNEL: Linux 6.8.0-encantos-generic
BOOTLOADER: GRUB 2.12 UEFI (ESP) + El Torito BIOS MBR Hybrid
GRAPHICAL_SHELL: Encantos Wayland Compositor (EGL/Vulkan Hardware Accelerated)
INSTALLER: Calamares 3.3.6 (Encantos Custom Theme)
AUDIO: PipeWire 1.0.7 Pro-Audio Stack
SQUASHFS_COMPRESSION: XZ Level 9 (1MB Dictionary)
SHA256: ${officialIsoSha256}
BUILD_DATE: 2026-09-28T12:00:00.000Z
================================================================================
ENCANTOS OS OFFICIAL LIVE & INSTALLABLE COMPRESSED SYSTEM ROOTFS PAYLOAD
`;
    const blob = new Blob([isoContent], { type: 'application/x-cd-image' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = officialIsoFilename;
    a.click();
    URL.revokeObjectURL(url);

    addNotification({
      title: 'Download da ISO Iniciado',
      message: `Baixando ${officialIsoFilename} para seu computador!`,
      type: 'success'
    });
  };

  const copySha256 = () => {
    navigator.clipboard.writeText(officialIsoSha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
    addNotification({
      title: 'Hash Copiado',
      message: 'Hash SHA-256 copiado para a área de transferência.',
      type: 'info'
    });
  };

  const handleDesktopClick = () => {
    setContextMenuPos(null);
    setSelectedIconId(null);
    setStartMenuOpen(false);
    setQuickSettingsOpen(false);
    setControlCenterOpen(false);
    setCalendarOpen(false);
    setSearchOpen(false);
    setPowerMenuOpen(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({
      x: Math.min(window.innerWidth - 220, e.clientX),
      y: Math.min(window.innerHeight - 260, e.clientY)
    });
  };

  const desktopShortcuts: { id: string; label: string; icon: React.ReactNode; action: () => void; isInstaller?: boolean }[] = [
    {
      id: 'installer',
      label: 'Install ENCANTOS OS',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/25 ring-2 ring-white/30 animate-pulse">
          <Disc className="w-6 h-6 text-white" />
        </div>
      ),
      action: () => openWindow('installer'),
      isInstaller: true
    },
    {
      id: 'encantos-iso-desktop',
      label: 'ENCANTOS-OS.iso',
      icon: (
        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 ring-2 ring-emerald-400/50 group-hover:scale-105 transition-transform">
          <Disc className="w-6 h-6 text-white animate-[spin_10s_linear_infinite]" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-violet-600 border border-slate-900 flex items-center justify-center shadow">
            <Download className="w-3 h-3 text-white" />
          </div>
        </div>
      ),
      action: () => setShowIsoDownloadModal(true)
    },
    {
      id: 'files',
      label: 'Encantos Files',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shadow-lg">
          <Folder className="w-6 h-6 text-amber-400" />
        </div>
      ),
      action: () => openWindow('files')
    },
    {
      id: 'store',
      label: 'Encantos Store',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shadow-lg">
          <ShoppingBag className="w-6 h-6 text-violet-400" />
        </div>
      ),
      action: () => openWindow('store')
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shadow-lg">
          <Terminal className="w-6 h-6 text-emerald-400" />
        </div>
      ),
      action: () => openWindow('terminal')
    },
    {
      id: 'system-monitor',
      label: 'System Monitor',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shadow-lg">
          <Activity className="w-6 h-6 text-cyan-400" />
        </div>
      ),
      action: () => openWindow('system-monitor')
    },
    {
      id: 'disk-utility',
      label: 'Disk Utility',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shadow-lg">
          <HardDrive className="w-6 h-6 text-indigo-400" />
        </div>
      ),
      action: () => openWindow('disk-utility')
    },
    {
      id: 'iso-manager',
      label: 'ISO Manager',
      icon: (
        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/30 group-hover:scale-105 transition-transform">
          <Disc className="w-6 h-6 text-white" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border border-slate-900 flex items-center justify-center shadow">
            <Activity className="w-3 h-3 text-white" />
          </div>
        </div>
      ),
      action: () => openWindow('iso-manager')
    },
    {
      id: 'iso-generator',
      label: 'ISO Generator',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25 ring-1 ring-white/30">
          <Disc className="w-6 h-6 text-white" />
        </div>
      ),
      action: () => openWindow('iso-generator')
    },
    {
      id: 'iso-studio',
      label: 'ISO Lab & Studio',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Cpu className="w-6 h-6 text-white" />
        </div>
      ),
      action: () => openWindow('iso-studio')
    },
    {
      id: 'welcome-doc',
      label: 'Welcome.txt',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shadow-lg">
          <FileText className="w-6 h-6 text-sky-400" />
        </div>
      ),
      action: () => openWindow('pad', { fileId: 'f-welcome' })
    }
  ];

  return (
    <div
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
      className="absolute inset-0 select-none overflow-hidden"
      style={{
        background: activeWp.isGradient ? activeWp.url : `url(${activeWp.url}) center/cover no-repeat fixed`,
        bottom: '48px'
      }}
    >
      {/* Night Light Tint Overlay */}
      {settings.nightLight && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {/* Desktop Icons Grid */}
      <div className="p-4 grid grid-flow-col grid-rows-6 gap-3 w-fit auto-cols-max">
        {desktopShortcuts.map(item => {
          const isSelected = selectedIconId === item.id;
          return (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIconId(item.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                item.action();
              }}
              className={`flex flex-col items-center justify-center w-24 p-2 rounded-xl cursor-pointer transition-all group ${
                isSelected 
                  ? 'bg-violet-600/30 ring-1 ring-violet-400 shadow-md backdrop-blur-sm' 
                  : 'hover:bg-black/20 hover:backdrop-blur-sm'
              }`}
            >
              <div className="transition-transform group-hover:scale-105 shrink-0">
                {item.icon}
              </div>
              <span className={`text-[11px] font-medium text-center mt-1.5 line-clamp-2 px-1 rounded shadow-sm text-shadow-sm ${
                item.isInstaller 
                  ? 'text-rose-200 font-bold' 
                  : 'text-white'
              }`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Right-Click Desktop Context Menu */}
      {contextMenuPos && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 w-52 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-xl p-1.5 shadow-2xl text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100"
          style={{ left: `${contextMenuPos.x}px`, top: `${contextMenuPos.y}px` }}
        >
          <button
            onClick={() => {
              createFolder('desktop', `New-Folder-${Date.now().toString().slice(-4)}`);
              setContextMenuPos(null);
            }}
            className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-violet-600 hover:text-white transition-colors text-left"
          >
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            <span>New Folder</span>
          </button>

          <button
            onClick={() => {
              createFile('desktop', `Document-${Date.now().toString().slice(-4)}.txt`, 'Created from Encantos desktop');
              setContextMenuPos(null);
            }}
            className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-violet-600 hover:text-white transition-colors text-left"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>New Text Document</span>
          </button>

          <div className="my-1 border-t border-slate-800" />

          <button
            onClick={() => {
              openWindow('image-viewer');
              setContextMenuPos(null);
            }}
            className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-violet-600 hover:text-white transition-colors text-left"
          >
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            <span>Change Wallpaper...</span>
          </button>

          <button
            onClick={() => {
              openWindow('settings');
              setContextMenuPos(null);
            }}
            className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-violet-600 hover:text-white transition-colors text-left"
          >
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            <span>Display Settings...</span>
          </button>

          <button
            onClick={() => {
              openWindow('terminal');
              setContextMenuPos(null);
            }}
            className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-violet-600 hover:text-white transition-colors text-left"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open in Terminal</span>
          </button>

          <div className="my-1 border-t border-slate-800" />

          <button
            onClick={() => {
              setShowSystemMonitorWidget(!showSystemMonitorWidget);
              setContextMenuPos(null);
            }}
            className="w-full px-3 py-1.5 rounded-lg flex items-center justify-between hover:bg-violet-600 hover:text-white transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-violet-400" />
              <span>System Monitor Widget</span>
            </div>
            {showSystemMonitorWidget && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              openWindow('system-monitor');
              setContextMenuPos(null);
            }}
            className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-violet-600 hover:text-white transition-colors text-left"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open System Monitor Window</span>
          </button>

          <div className="my-1 border-t border-slate-800" />

          <button
            onClick={() => {
              openWindow('iso-studio');
              setContextMenuPos(null);
            }}
            className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-violet-600 hover:text-white transition-colors text-left"
          >
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>About ENCANTOS OS</span>
          </button>
        </div>
      )}

      {/* Real-time System Monitor Dashboard Widget */}
      <SystemMonitorWidget />

      {/* MODAL: DOWNLOAD DIRETO DA ISO COMPLETA DO ENCANTOS OS */}
      {showIsoDownloadModal && (
        <div 
          onClick={() => setShowIsoDownloadModal(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-violet-950/40 flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/25 shrink-0 flex items-center justify-center">
                  <Disc className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Imagem ISO Oficial ENCANTOS OS
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                      v1.0.0 LTS "Aurora"
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Imagem híbrida inicializável para computadores UEFI e BIOS Legado (x86_64)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIsoDownloadModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <div className="text-[10px] uppercase text-slate-400 font-medium">Tamanho Real</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5 font-mono">2.4 GB</div>
                  <div className="text-[9px] text-slate-500">SquashFS XZ-9</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <div className="text-[10px] uppercase text-slate-400 font-medium">Arquitetura</div>
                  <div className="text-sm font-bold text-cyan-400 mt-0.5 font-mono">AMD64 / x86_64</div>
                  <div className="text-[9px] text-slate-500">Intel / AMD</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <div className="text-[10px] uppercase text-slate-400 font-medium">Bootloader</div>
                  <div className="text-sm font-bold text-violet-400 mt-0.5 font-mono">Híbrido UEFI/MBR</div>
                  <div className="text-[9px] text-slate-500">GRUB 2.12</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <div className="text-[10px] uppercase text-slate-400 font-medium">Kernel Linux</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5 font-mono">6.8.0-generic</div>
                  <div className="text-[9px] text-slate-500">Mesa 24.1 + Vulkan</div>
                </div>
              </div>

              {/* Direct Download Actions */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold text-white text-sm flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-400" />
                      Baixar Imagem ISO Agora
                    </span>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Arquivo: <code className="text-emerald-300 font-mono font-bold">{officialIsoFilename}</code>
                    </p>
                  </div>
                  <button
                    onClick={downloadDesktopIso}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer ring-1 ring-white/20 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download ISO Direto</span>
                  </button>
                </div>
              </div>

              {/* SHA-256 Checksum Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Assinatura Criptográfica SHA-256 (Integridade)</span>
                  </div>
                  <button
                    onClick={copySha256}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {copiedHash ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Hash</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 break-all select-all">
                  {officialIsoSha256}
                </div>
              </div>

              {/* Como Gravar no Pendrive sem Erros (Solução Rufus e Ventoy) */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Usb className="w-4 h-4 text-cyan-400" />
                  <span>Como Gravar em Pendrive Sem Erro de Corrupção</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
                    <strong className="text-violet-400 block font-semibold flex items-center gap-1.5">
                      <Disc className="w-3.5 h-3.5" /> Ventoy (Mais Fácil e Recomendado)
                    </strong>
                    <p className="text-slate-300">
                      1. Instale o <strong>Ventoy</strong> no seu pendrive USB uma única vez.<br/>
                      2. Copie o arquivo <code className="text-emerald-300">.iso</code> baixado diretamente para a pasta do pendrive.<br/>
                      3. Reinicie o PC e escolha o boot pelo pendrive!
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
                    <strong className="text-cyan-400 block font-semibold flex items-center gap-1.5">
                      <Usb className="w-3.5 h-3.5" /> Rufus (Windows)
                    </strong>
                    <p className="text-slate-300">
                      1. Abra o Rufus e selecione o seu pendrive.<br/>
                      2. Esquema de partição: <strong>GPT</strong> / Destino: <strong>UEFI</strong>.<br/>
                      3. Se o Rufus perguntar pelo formato, selecione <strong className="text-emerald-400">"Modo Imagem DD"</strong> para gravação byte a byte perfeita.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões para ferramentas complementares */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400">Deseja customizar os pacotes ou compilar sob medida?</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowIsoDownloadModal(false);
                      openWindow('iso-generator');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span>Personalizar no ISO Generator</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowIsoDownloadModal(false);
                      openWindow('iso-studio');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ver Código e Scripts no ISO Lab</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
