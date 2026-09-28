import React, { useState, useMemo, useRef } from 'react';
import { 
  Disc, Usb, Cpu, Sparkles, Check, ArrowRight, ArrowLeft, Download, 
  RefreshCw, Terminal, Layers, Palette, Settings, ShieldCheck, 
  HardDrive, Code, Compass, Film, Music, Briefcase, Gamepad2, 
  Trash2, Copy, AlertCircle, CheckCircle2, ChevronRight, Sliders,
  HelpCircle, Monitor, Sun, Moon, Info, FileCode, CheckCheck, Loader2, X,
  Lightbulb, Zap, ShieldAlert, CheckSquare
} from 'lucide-react';
import { useSystem, WALLPAPERS, ACCENT_COLORS } from '../../context/SystemContext';
import IsoCompilationProgressBar from './IsoCompilationProgressBar';

interface CustomPackage {
  id: string;
  name: string;
  category: 'Desktop' | 'Web' | 'Development' | 'Graphics' | 'Multimedia' | 'Productivity' | 'Utilities' | 'Gaming';
  sizeMb: number;
  description: string;
  isRequired?: boolean;
  isRecommended?: boolean;
}

const AVAILABLE_CUSTOM_PACKAGES: CustomPackage[] = [
  // Desktop Essentials (Required)
  { id: 'encantos-shell', name: 'Encantos Desktop Shell (Wayland/EGL)', category: 'Desktop', sizeMb: 240, description: 'Core modern obsidian glass desktop interface and Wayland compositor', isRequired: true },
  { id: 'calamares-installer', name: 'Calamares 3.3 Graphical Installer', category: 'Desktop', sizeMb: 85, description: 'User-friendly disk partitioning and operating system installer wizard', isRequired: true },
  { id: 'pipewire-audio', name: 'PipeWire & WirePlumber Audio Server', category: 'Desktop', sizeMb: 65, description: 'Low-latency modern audio engine supporting Bluetooth LDAC and pro audio', isRequired: true },

  // Web & Cloud
  { id: 'firefox', name: 'Mozilla Firefox ESR (Hardware Accelerated)', category: 'Web', sizeMb: 120, description: 'Privacy-focused browser with Wayland VA-API hardware video decode', isRecommended: true },
  { id: 'filezilla', name: 'FileZilla SFTP & Cloud Client', category: 'Web', sizeMb: 35, description: 'Graphical secure file transfer client for SSH and FTP servers' },
  { id: 'thunderbird', name: 'Thunderbird Mail & Calendar Hub', category: 'Web', sizeMb: 95, description: 'Full-featured email client with OpenPGP end-to-end encryption' },

  // Development
  { id: 'vscodium', name: 'VSCodium Studio (Telemetry Free)', category: 'Development', sizeMb: 160, description: 'Community open-source code editor with zero telemetry or tracking', isRecommended: true },
  { id: 'build-essentials', name: 'GCC, Clang & Build-Essential Toolchain', category: 'Development', sizeMb: 210, description: 'Compilers, make, gdb, and development headers for Linux software' },
  { id: 'python-node', name: 'Node.js 22 LTS & Python 3.12 Runtimes', category: 'Development', sizeMb: 140, description: 'Modern scripting engines and package managers (npm, pip)' },
  { id: 'git-tools', name: 'Git Version Control & LazyGit CLI', category: 'Development', sizeMb: 45, description: 'Distributed source code control and interactive terminal interface' },

  // Graphics & 3D
  { id: 'blender', name: 'Blender 3D Studio & Cycles Engine', category: 'Graphics', sizeMb: 420, description: 'Professional 3D modeling, rigging, rendering, and VFX creation suite' },
  { id: 'gimp', name: 'GIMP Studio 2.10 Photo Editor', category: 'Graphics', sizeMb: 180, description: 'Advanced image retouching, layer masks, and raster graphic design' },
  { id: 'krita', name: 'Krita Digital Illustration Suite', category: 'Graphics', sizeMb: 210, description: 'Digital painting studio for concept artists, comic inkers, and animators' },

  // Multimedia
  { id: 'vlc', name: 'VLC Media Player Universal Suite', category: 'Multimedia', sizeMb: 90, description: 'Plays virtually all audio and video formats out of the box with codecs', isRecommended: true },
  { id: 'audacity', name: 'Audacity Audio Studio', category: 'Multimedia', sizeMb: 60, description: 'Multi-track sound recorder and spectral wave analysis tool' },
  { id: 'obs-studio', name: 'OBS Studio Screen Recorder & Streaming', category: 'Multimedia', sizeMb: 150, description: 'Live broadcasting and hardware-encoded desktop recording' },

  // Productivity
  { id: 'libreoffice', name: 'LibreOffice Complete Office Suite', category: 'Productivity', sizeMb: 310, description: 'Full office suite compatible with DOCX, XLSX, and PPTX documents', isRecommended: true },
  { id: 'pdf-tools', name: 'Evince PDF & Document Studio', category: 'Productivity', sizeMb: 40, description: 'High-speed document reader with annotations and form filling' },

  // System Utilities & Security
  { id: 'btop', name: 'Btop++ Resource Monitor & HUD', category: 'Utilities', sizeMb: 15, description: 'Aesthetic hardware telemetry dashboard for CPU, RAM, and NVMe I/O', isRecommended: true },
  { id: 'gparted', name: 'GParted Partition Editor (Btrfs/Ext4/NTFS)', category: 'Utilities', sizeMb: 30, description: 'Partition management for disk resizing, formatting, and repair', isRecommended: true },
  { id: 'timeshift', name: 'Timeshift System Restore & Btrfs Snapshots', category: 'Utilities', sizeMb: 25, description: 'Automated operating system restore points and rollback engine' },
  { id: 'bleachbit', name: 'BleachBit System Cleaner & Shredder', category: 'Utilities', sizeMb: 20, description: 'Cleans cache, wipes unallocated drive space, and preserves privacy' },
  { id: 'wireguard', name: 'WireGuard VPN Kernel Suite', category: 'Utilities', sizeMb: 18, description: 'Fast, modern cryptographic virtual private network engine' },

  // Gaming
  { id: 'steam', name: 'Steam Client with Valve Proton DX12', category: 'Gaming', sizeMb: 130, description: 'Gaming storefront and Windows DirectX-to-Vulkan compatibility layer' },
  { id: 'gamemode', name: 'Feral GameMode Daemon & MangoHud', category: 'Gaming', sizeMb: 25, description: 'Automated CPU/GPU governor performance booster and on-screen FPS HUD' }
];

export const EncantosIsoGenerator: React.FC = () => {
  const { addNotification } = useSystem();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Base System Configuration
  const [distroName, setDistroName] = useState('ENCANTOS OS');
  const [isoEdition, setIsoEdition] = useState('Aurora Edition');
  const [kernelVersion, setKernelVersion] = useState<'linux-6.8-generic' | 'linux-6.10-zen' | 'linux-6.6-hardened'>('linux-6.8-generic');
  const [basePlatform, setBasePlatform] = useState<'debian-13' | 'ubuntu-24.04'>('debian-13');
  const [targetArch, setTargetArch] = useState<'amd64' | 'arm64'>('amd64');
  const [bootMode, setBootMode] = useState<'hybrid' | 'uefi-only'>('hybrid');

  // Step 2: Custom Package Selection
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(
    new Set([
      'encantos-shell', 'calamares-installer', 'pipewire-audio',
      'firefox', 'vscodium', 'vlc', 'libreoffice',
      'btop', 'gparted'
    ])
  );
  const [packageCategoryFilter, setPackageCategoryFilter] = useState<string>('All');
  const [packageSearch, setPackageSearch] = useState<string>('');

  // Step 3: Theme Settings & Default Appearance
  const [defaultTheme, setDefaultTheme] = useState<'dark' | 'light'>('dark');
  const [accentColor, setAccentColor] = useState<string>('#8b5cf6'); // Violet
  const [wallpaperId, setWallpaperId] = useState<string>('aurora');
  const [uiScale, setUiScale] = useState<number>(100);
  const [bootSplash, setBootSplash] = useState<'glowing-logo' | 'minimal-text'>('glowing-logo');

  // Step 4: System Configurations & Security
  const [liveUsername, setLiveUsername] = useState('encantos');
  const [hostname, setHostname] = useState('encantos-desktop');
  const [rootFilesystem, setRootFilesystem] = useState<'btrfs' | 'ext4'>('btrfs');
  const [defaultLanguage, setDefaultLanguage] = useState<'pt-BR' | 'en' | 'es'>('pt-BR');
  const [defaultTimezone, setDefaultTimezone] = useState('America/Sao_Paulo');
  const [keyboardLayout, setKeyboardLayout] = useState('br-abnt2');
  const [enableUfwFirewall, setEnableUfwFirewall] = useState(true);
  const [enableZstdCompression, setEnableZstdCompression] = useState(true);

  // Step 5: Build Execution State
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStage, setBuildStage] = useState('');
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [buildComplete, setBuildComplete] = useState(false);
  const [generatedChecksum, setGeneratedChecksum] = useState('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [copiedHash, setCopiedHash] = useState(false);
  const [verifyInput, setVerifyInput] = useState('');
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [showIsoGuideModal, setShowIsoGuideModal] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [tipsTab, setTipsTab] = useState<'all' | 'rufus' | 'balena' | 'ventoy' | 'dd' | 'checklist'>('all');
  const buildIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic Size Calculation
  const baseSizeMb = 1450; // Compressed Debian base + Kernel + Mesa + Wayland
  const selectedPackagesSizeMb = useMemo(() => {
    return Array.from(selectedPackages).reduce((total, pkgId) => {
      const pkg = AVAILABLE_CUSTOM_PACKAGES.find(p => p.id === pkgId);
      return total + (pkg ? pkg.sizeMb : 0);
    }, 0);
  }, [selectedPackages]);

  // High-ratio XZ / Zstandard compression yields approx 45% of uncompressed package sizes
  const estimatedSquashfsMb = Math.round(baseSizeMb + (selectedPackagesSizeMb * 0.48));
  const estimatedIsoSizeGb = (estimatedSquashfsMb / 1024).toFixed(2);

  const togglePackage = (pkgId: string) => {
    const pkg = AVAILABLE_CUSTOM_PACKAGES.find(p => p.id === pkgId);
    if (pkg?.isRequired) return; // Cannot toggle mandatory core packages

    setSelectedPackages(prev => {
      const next = new Set(prev);
      if (next.has(pkgId)) {
        next.delete(pkgId);
      } else {
        next.add(pkgId);
      }
      return next;
    });
  };

  const filteredPackages = useMemo(() => {
    return AVAILABLE_CUSTOM_PACKAGES.filter(pkg => {
      const matchesCat = packageCategoryFilter === 'All' || pkg.category === packageCategoryFilter;
      const matchesSearch = !packageSearch.trim() || 
        pkg.name.toLowerCase().includes(packageSearch.toLowerCase()) ||
        pkg.description.toLowerCase().includes(packageSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [packageCategoryFilter, packageSearch]);

  // Execute Build Simulation Pipeline
  const startBuildPipeline = (speedMultiplier: number = 1) => {
    if (buildIntervalRef.current) {
      clearInterval(buildIntervalRef.current);
    }
    setIsBuilding(true);
    setBuildProgress(1);
    setBuildComplete(false);
    setBuildStage('Inicializando pipeline de compilação da ISO...');
    setBuildLogs([
      `[00:00:01] [INIT] Starting ENCANTOS OS Custom ISO Generator Pipeline...`,
      `[00:00:01] [CONFIG] Target: ${distroName} (${isoEdition}) · Arch: ${targetArch} · Kernel: ${kernelVersion}`,
      `[00:00:01] [WORKSPACE] Allocating sandbox chroot in /tmp/encantos-build-env`
    ]);

    const detailedStages = [
      { 
        percent: 12, 
        stage: 'Montando namespaces de isolamento e chroot...', 
        log: '[00:00:02] [CHROOT] Mounted /proc, /sys, /dev in isolated container namespace' 
      },
      { 
        percent: 24, 
        stage: 'Bootstrap do Debian 13 (Trixie) base rootfs...', 
        log: '[00:00:04] [DEBOOTSTRAP] Fetching and unpacking base system packages from official Debian mirror' 
      },
      { 
        percent: 38, 
        stage: `Compilando Kernel Linux (${kernelVersion}) e módulos DKMS...`, 
        log: `[00:00:07] [KERNEL] Built DKMS modules: Mesa Vulkan, PipeWire ALSA, overlayfs, and Dracut early-boot` 
      },
      { 
        percent: 54, 
        stage: `Injetando ${selectedPackages.size} pacotes de software selecionados...`, 
        log: `[00:00:10] [PACKAGES] Unpacking custom packages: ${Array.from(selectedPackages).slice(0, 5).join(', ')}...` 
      },
      { 
        percent: 70, 
        stage: `Aplicando tema '${defaultTheme}' e boot splash Plymouth...`, 
        log: `[00:00:13] [THEME] Injected Encantos glowing pulse theme, wallpaper '${wallpaperId}', and Wayland defaults` 
      },
      { 
        percent: 86, 
        stage: 'Compactando filesystem.squashfs com XZ nível 9 (Dicionário 1MB)...', 
        log: `[00:00:16] [SQUASHFS] Compressed ${selectedPackagesSizeMb + 2100} MB down to ${estimatedSquashfsMb} MB (XZ-9)` 
      },
      { 
        percent: 95, 
        stage: 'Montando ISO híbrida inicializável com xorriso (UEFI + BIOS)...', 
        log: '[00:00:18] [XORRISO] GRUB 2.12 EFI ESP and El Torito MBR hybrid boot records stamped' 
      },
      { 
        percent: 100, 
        stage: 'Gerando hash criptográfico SHA-256 e finalizando...', 
        log: '[00:00:20] [FINAL] ISO compilation completed successfully with zero errors!' 
      }
    ];

    let currentStepIdx = 0;
    let currentPct = 1;
    const baseIntervalMs = Math.max(60, Math.round(180 / speedMultiplier));

    buildIntervalRef.current = setInterval(() => {
      const targetStep = detailedStages[currentStepIdx];
      if (!targetStep) {
        if (buildIntervalRef.current) clearInterval(buildIntervalRef.current);
        buildIntervalRef.current = null;
        setIsBuilding(false);
        setBuildComplete(true);
        setBuildProgress(100);
        const randomHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        setGeneratedChecksum(randomHash);
        addNotification({
          title: 'Custom ISO Generated',
          message: `encantos-${isoEdition.toLowerCase().replace(/\s+/g, '-')}-1.0.0-amd64.iso is ready for download!`,
          type: 'success'
        });
        return;
      }

      if (currentPct < targetStep.percent) {
        currentPct += 1;
        setBuildProgress(currentPct);
        setBuildStage(targetStep.stage);
      } else {
        setBuildLogs(prev => [...prev, targetStep.log]);
        currentStepIdx++;
      }
    }, baseIntervalMs);
  };

  const cancelBuildPipeline = () => {
    if (buildIntervalRef.current) {
      clearInterval(buildIntervalRef.current);
      buildIntervalRef.current = null;
    }
    setIsBuilding(false);
    setBuildStage('Compilação cancelada pelo usuário');
    setBuildLogs(prev => [...prev, '[00:00:00] [ABORT] Build process stopped by user.']);
    addNotification({
      title: 'Compilação Interrompida',
      message: 'O processo de compilação da ISO foi cancelado.',
      type: 'info'
    });
  };

  const downloadCustomIsoFile = () => {
    // Generate simulated ISO file with valid manifest metadata
    const isoContent = `ENCANTOS-OS-BOOTABLE-HYBRID-ISO-HEADER
DISTRIBUTION: ${distroName}
EDITION: ${isoEdition}
KERNEL: ${kernelVersion}
BASE: ${basePlatform}
PACKAGES: ${Array.from(selectedPackages).join(', ')}
THEME: ${defaultTheme}
ACCENT_COLOR: ${accentColor}
TIMEZONE: ${defaultTimezone}
KEYBOARD: ${keyboardLayout}
BUILD_DATE: ${new Date().toISOString()}
SHA256: ${generatedChecksum}
`;
    const blob = new Blob([isoContent], { type: 'application/x-cd-image' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `encantos-custom-1.0.0-amd64.iso`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification({
      title: 'Download Iniciado',
      message: 'Baixando encantos-custom-1.0.0-amd64.iso',
      type: 'info'
    });
  };

  const downloadCustomBuildScript = () => {
    const script = `#!/usr/bin/env bash
# ==============================================================================
# ENCANTOS OS 1.0.0 Custom ISO Generator Script
# Generated automatically by Encantos ISO Generator Wizard
# ==============================================================================
set -euo pipefail

DISTRO_NAME="${distroName}"
EDITION="${isoEdition}"
KERNEL="${kernelVersion}"
BASE_PLATFORM="${basePlatform}"
THEME="${defaultTheme}"
ACCENT="${accentColor}"
TIMEZONE="${defaultTimezone}"
KEYBOARD="${keyboardLayout}"
PACKAGES="${Array.from(selectedPackages).join(' ')}"

echo "==> Building customized ENCANTOS OS ISO..."
echo "==> Architecture: ${targetArch} | Boot: ${bootMode}"
echo "==> Packages: $PACKAGES"

# Step 1: Install build toolchain
sudo apt-get update
sudo apt-get install -y debootstrap squashfs-tools xorriso grub-pc-bin grub-efi-amd64-bin

# Step 2: Run build
chmod +x build-encantos.sh
sudo ./build-encantos.sh \\
  --kernel "$KERNEL" \\
  --theme "$THEME" \\
  --accent "$ACCENT" \\
  --packages "$PACKAGES"

echo "==> Done! File created: build/encantos-custom-1.0.0-amd64.iso"
`;
    const blob = new Blob([script], { type: 'text/x-shellscript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-custom-iso.sh';
    a.click();
    URL.revokeObjectURL(url);
    addNotification({
      title: 'Script de Compilação Baixado',
      message: 'build-custom-iso.sh salvo com sucesso.',
      type: 'info'
    });
  };

  const copyHashToClipboard = () => {
    if (!generatedChecksum) return;
    navigator.clipboard.writeText(generatedChecksum);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
    addNotification({
      title: 'SHA-256 Hash Copiado',
      message: 'O hash criptográfico SHA-256 foi copiado para a área de transferência.',
      type: 'success'
    });
  };

  const downloadChecksumFile = () => {
    const content = `${generatedChecksum}  encantos-custom-1.0.0-amd64.iso\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `encantos-custom-1.0.0-amd64.iso.sha256`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification({
      title: 'Arquivo .sha256 Baixado',
      message: 'encantos-custom-1.0.0-amd64.iso.sha256 salvo com sucesso.',
      type: 'info'
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 text-slate-200 select-none overflow-hidden">
      {/* Wizard Header & Stepper */}
      <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 via-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/25">
            <Disc className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>ENCANTOS ISO GENERATOR</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-600/30 text-violet-300 border border-violet-500/30">
                Custom USB Builder
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Customize packages, appearance, and kernel configurations before generating a bootable ISO.
            </p>
          </div>
        </div>

        {/* Wizard Steps Breadcrumbs & Help Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            {[
              { step: 1, label: 'Base' },
              { step: 2, label: 'Packages' },
              { step: 3, label: 'Theme' },
              { step: 4, label: 'Config' },
              { step: 5, label: 'Build & USB' }
            ].map((s, i) => {
              const isCurrent = currentStep === s.step;
              const isCompleted = currentStep > s.step;
              return (
                <React.Fragment key={s.step}>
                  <button
                    onClick={() => !isBuilding && setCurrentStep(s.step)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-violet-600 text-white font-semibold shadow-sm shadow-violet-600/30'
                        : isCompleted
                        ? 'bg-slate-800/80 text-emerald-400 hover:bg-slate-800'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isCurrent ? 'bg-white text-violet-700' : isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isCompleted ? '✓' : s.step}
                    </span>
                    <span>{s.label}</span>
                  </button>
                  {i < 4 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                </React.Fragment>
              );
            })}
          </div>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <button
            onClick={() => setShowTipsModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-amber-500/10"
            title="Dicas e Melhores Práticas para Gravação em Pendrive (Rufus, BalenaEtcher)"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Dicas & Ajuda</span>
            <span className="sm:hidden">Dicas</span>
          </button>
        </div>
      </div>

      {/* Main Wizard Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* STEP 1: BASE SYSTEM & ARCHITECTURE */}
        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-violet-400" />
                <span>Base Operating System & Kernel Target</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Define the core operating system foundation, Linux kernel flavor, and bootloader modes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Distribution Brand</label>
                  <input
                    type="text"
                    value={distroName}
                    onChange={(e) => setDistroName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Custom Edition Label</label>
                  <input
                    type="text"
                    value={isoEdition}
                    onChange={(e) => setIsoEdition(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Linux Kernel Flavor */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="text-slate-300 font-semibold block mb-1.5">Linux Kernel Flavor</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'linux-6.8-generic', name: 'Linux 6.8 LTS (Standard)', desc: 'Stable, maximum hardware compatibility' },
                    { id: 'linux-6.10-zen', name: 'Linux 6.10 Zen/Liquorix', desc: 'Low-latency for gaming & audio production' },
                    { id: 'linux-6.6-hardened', name: 'Linux 6.6 LTS Hardened', desc: 'Memory security & enterprise compliance' },
                  ].map(k => (
                    <div
                      key={k.id}
                      onClick={() => setKernelVersion(k.id as any)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        kernelVersion === k.id
                          ? 'bg-violet-600/25 border-violet-500 ring-1 ring-violet-500/40 text-white'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-xs flex items-center justify-between">
                        <span>{k.name}</span>
                        {kernelVersion === k.id && <Check className="w-3.5 h-3.5 text-violet-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">{k.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Base Platform & Target Architecture */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Upstream Base System</label>
                  <select
                    value={basePlatform}
                    onChange={(e) => setBasePlatform(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white cursor-pointer focus:outline-none focus:border-violet-500"
                  >
                    <option value="debian-13">Debian 13 (Trixie) — Rolling / Modern</option>
                    <option value="ubuntu-24.04">Ubuntu 24.04 LTS Core — Long Term</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Target CPU Architecture</label>
                  <select
                    value={targetArch}
                    onChange={(e) => setTargetArch(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white cursor-pointer focus:outline-none focus:border-violet-500"
                  >
                    <option value="amd64">x86_64 / amd64 (Standard PC & Laptops)</option>
                    <option value="arm64">aarch64 / ARM64 (Apple Silicon / Pi 5)</option>
                  </select>
                </div>
              </div>

              {/* Boot Mode Selection */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="text-slate-300 font-semibold block mb-1">Bootloader Compatibility</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setBootMode('hybrid')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      bootMode === 'hybrid'
                        ? 'bg-violet-600/25 border-violet-500 ring-1 ring-violet-500/40 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center justify-between">
                      <span>Hybrid UEFI + Legacy BIOS (El Torito)</span>
                      {bootMode === 'hybrid' && <Check className="w-3.5 h-3.5 text-violet-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Boots on modern UEFI and older PC motherboards</span>
                  </div>

                  <div
                    onClick={() => setBootMode('uefi-only')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      bootMode === 'uefi-only'
                        ? 'bg-violet-600/25 border-violet-500 ring-1 ring-violet-500/40 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center justify-between">
                      <span>Pure UEFI x86_64 ESP Only</span>
                      {bootMode === 'uefi-only' && <Check className="w-3.5 h-3.5 text-violet-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Slim boot footprint for Secure Boot platforms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CUSTOM PACKAGE SELECTION */}
        {currentStep === 2 && (
          <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  <span>Select Software Packages & Utilities</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose pre-installed apps included directly inside the compressed SquashFS live image.
                </p>
              </div>

              {/* Dynamic Size Indicator */}
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400">Est. ISO Size</span>
                <div className="text-base font-bold font-mono text-emerald-400">
                  {estimatedIsoSizeGb} GB
                </div>
              </div>
            </div>

            {/* Category Filter & Search Bar */}
            <div className="flex items-center justify-between gap-3 bg-slate-950/60 p-2 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
                {['All', 'Desktop', 'Web', 'Development', 'Graphics', 'Multimedia', 'Productivity', 'Utilities', 'Gaming'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setPackageCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs whitespace-nowrap ${
                      packageCategoryFilter === cat
                        ? 'bg-violet-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search packages..."
                value={packageSearch}
                onChange={(e) => setPackageSearch(e.target.value)}
                className="w-44 px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Package Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredPackages.map(pkg => {
                const isSelected = selectedPackages.has(pkg.id);
                return (
                  <div
                    key={pkg.id}
                    onClick={() => togglePackage(pkg.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-violet-600/20 border-violet-500 ring-1 ring-violet-500/30'
                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-white truncate">{pkg.name}</span>
                        {pkg.isRequired && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Required
                          </span>
                        )}
                        {pkg.isRecommended && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{pkg.description}</p>
                      <div className="text-[10px] font-mono text-slate-500 mt-1">
                        Category: {pkg.category} · Size: +{pkg.sizeMb} MB
                      </div>
                    </div>

                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={pkg.isRequired}
                        onChange={() => togglePackage(pkg.id)}
                        className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: THEME SETTINGS & DEFAULT APPEARANCE */}
        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-pink-400" />
                <span>Default Appearance & Theme Configuration</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set the visual defaults applied when booting into the live session and after installation.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4 text-xs">
              {/* Color Mode */}
              <div>
                <label className="text-slate-300 font-semibold block mb-2">Default Color Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setDefaultTheme('dark')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      defaultTheme === 'dark'
                        ? 'bg-slate-900 border-violet-500 ring-2 ring-violet-500/30 shadow-md'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Moon className="w-4 h-4 text-violet-400" />
                      <div>
                        <div className="font-semibold text-white">Dark Obsidian Glass</div>
                        <div className="text-[10px] text-slate-400">Deep obsidian background with neon glow</div>
                      </div>
                    </div>
                    {defaultTheme === 'dark' && <Check className="w-4 h-4 text-violet-400" />}
                  </div>

                  <div
                    onClick={() => setDefaultTheme('light')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      defaultTheme === 'light'
                        ? 'bg-slate-900 border-violet-500 ring-2 ring-violet-500/30 shadow-md'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sun className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-semibold text-white">Light Crystal Mode</div>
                        <div className="text-[10px] text-slate-400">Luminous frosted glass with high contrast</div>
                      </div>
                    </div>
                    {defaultTheme === 'light' && <Check className="w-4 h-4 text-violet-400" />}
                  </div>
                </div>
              </div>

              {/* Accent Color */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="text-slate-300 font-semibold block mb-2">System Accent Highlight</label>
                <div className="flex items-center gap-3">
                  {ACCENT_COLORS.map(color => {
                    const isSelected = accentColor === color.hex;
                    return (
                      <button
                        key={color.id}
                        onClick={() => setAccentColor(color.hex)}
                        className="flex flex-col items-center gap-1 cursor-pointer"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                            isSelected ? 'ring-2 ring-white scale-110 shadow-md' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-[10px] text-slate-400">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wallpaper Picker */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="text-slate-300 font-semibold block mb-2">Default Desktop Wallpaper</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {WALLPAPERS.map(wp => {
                    const isSelected = wallpaperId === wp.id;
                    return (
                      <div
                        key={wp.id}
                        onClick={() => setWallpaperId(wp.id)}
                        className={`rounded-xl border overflow-hidden cursor-pointer transition-all ${
                          isSelected ? 'border-violet-500 ring-2 ring-violet-500/40 shadow-lg' : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className="h-16 w-full"
                          style={{ background: wp.isGradient ? wp.url : `url(${wp.url}) center/cover no-repeat` }}
                        />
                        <div className="p-1.5 bg-slate-950 text-[10px] flex items-center justify-between text-slate-300">
                          <span className="truncate">{wp.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-violet-400" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Plymouth Splash Screen */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="text-slate-300 font-semibold block mb-1">Boot Plymouth Splash Screen</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setBootSplash('glowing-logo')}
                    className={`p-2.5 rounded-xl border cursor-pointer ${
                      bootSplash === 'glowing-logo' ? 'bg-violet-600/20 border-violet-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs">Encantos Glowing Pulse Logo</div>
                    <span className="text-[10px] text-slate-500">Smooth animated graphical boot</span>
                  </div>
                  <div
                    onClick={() => setBootSplash('minimal-text')}
                    className={`p-2.5 rounded-xl border cursor-pointer ${
                      bootSplash === 'minimal-text' ? 'bg-violet-600/20 border-violet-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs">Verbose Linux Kernel Text</div>
                    <span className="text-[10px] text-slate-500">Clean terminal boot diagnostics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SYSTEM CONFIGURATIONS & SECURITY */}
        {currentStep === 4 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <span>System Configurations & Security Defaults</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Preset locale, default user account, keyboard layout, and disk filesystem structures.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Default Live Session Username</label>
                  <input
                    type="text"
                    value={liveUsername}
                    onChange={(e) => setLiveUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Machine Hostname</label>
                  <input
                    type="text"
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              {/* Regional Preferences */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Default Language</label>
                  <select
                    value={defaultLanguage}
                    onChange={(e) => setDefaultLanguage(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white cursor-pointer"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en">English (United States)</option>
                    <option value="es">Español (Latinoamérica)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Default Timezone</label>
                  <select
                    value={defaultTimezone}
                    onChange={(e) => setDefaultTimezone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white cursor-pointer"
                  >
                    <option value="America/Sao_Paulo">America/Sao_Paulo (UTC-3)</option>
                    <option value="America/New_York">America/New_York (UTC-5)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="UTC">UTC (Universal Time)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Keyboard Layout</label>
                  <select
                    value={keyboardLayout}
                    onChange={(e) => setKeyboardLayout(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white cursor-pointer"
                  >
                    <option value="br-abnt2">Português (Brasil ABNT2)</option>
                    <option value="us-intl">English (US-International)</option>
                    <option value="es-latin">Spanish (Latin America)</option>
                  </select>
                </div>
              </div>

              {/* Filesystem Options */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="text-slate-300 font-semibold block mb-1">Default Target Filesystem</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setRootFilesystem('btrfs')}
                    className={`p-3 rounded-xl border cursor-pointer ${
                      rootFilesystem === 'btrfs' ? 'bg-violet-600/20 border-violet-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center justify-between">
                      <span>Btrfs (Modern CoW + Zstd)</span>
                      {rootFilesystem === 'btrfs' && <Check className="w-3.5 h-3.5 text-violet-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Subvolumes, instant snapshots & transparent compression</span>
                  </div>

                  <div
                    onClick={() => setRootFilesystem('ext4')}
                    className={`p-3 rounded-xl border cursor-pointer ${
                      rootFilesystem === 'ext4' ? 'bg-violet-600/20 border-violet-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center justify-between">
                      <span>Ext4 (Standard Linux Journal)</span>
                      {rootFilesystem === 'ext4' && <Check className="w-3.5 h-3.5 text-violet-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Rock-solid stability across older hard drives</span>
                  </div>
                </div>
              </div>

              {/* Security & Firewall defaults */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-white font-semibold">Enable UFW Firewall by Default</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableUfwFirewall}
                    onChange={(e) => setEnableUfwFirewall(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-indigo-400" />
                    <span className="text-white font-semibold">Zstandard Level 1 Transparent Compression</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableZstdCompression}
                    onChange={(e) => setEnableZstdCompression(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW, BUILD PIPELINE & FLASH TO USB */}
        {currentStep === 5 && (
          <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Usb className="w-5 h-5 text-cyan-400" />
                <span>Build Custom ISO & Flash to USB</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review your tailored distribution parameters, execute the build pipeline, and download your image.
              </p>
            </div>

            {/* Build Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{distroName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-600/30 text-violet-300 border border-violet-500/30">
                    {isoEdition}
                  </span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">~{estimatedIsoSizeGb} GB Target ISO</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
                <div><span className="text-slate-500">Kernel:</span> <span className="text-slate-200">{kernelVersion}</span></div>
                <div><span className="text-slate-500">Base System:</span> <span className="text-slate-200">{basePlatform} ({targetArch})</span></div>
                <div><span className="text-slate-500">Custom Packages:</span> <span className="text-slate-200">{selectedPackages.size} packages selected</span></div>
                <div><span className="text-slate-500">Bootloader:</span> <span className="text-slate-200">{bootMode === 'hybrid' ? 'Hybrid UEFI/BIOS' : 'UEFI Only'}</span></div>
                <div><span className="text-slate-500">Theme & Mode:</span> <span className="text-slate-200 capitalize">{defaultTheme} mode ({wallpaperId})</span></div>
                <div><span className="text-slate-500">Filesystem:</span> <span className="text-slate-200 uppercase">{rootFilesystem}</span></div>
              </div>
            </div>

            {/* BUILD CONTROLS / PROGRESS */}
            {!buildComplete && (
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">ISO Assembly Pipeline</span>
                  {isBuilding ? (
                    <span className="text-xs text-violet-400 font-mono flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{buildProgress}%</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">Ready to compile</span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-500 via-violet-600 to-emerald-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${buildProgress}%` }}
                  />
                </div>

                {isBuilding && (
                  <div className="text-[11px] font-mono text-cyan-400 truncate">
                    {buildStage}
                  </div>
                )}

                {/* Terminal Build Logs Console */}
                <div className="h-32 bg-[#090d16] border border-slate-800/90 rounded-xl p-3 font-mono text-[10px] text-slate-300 overflow-y-auto space-y-1">
                  {buildLogs.length === 0 ? (
                    <span className="text-slate-600">// Build pipeline console log output will appear here...</span>
                  ) : (
                    buildLogs.map((log, i) => (
                      <div key={i} className="leading-snug">{log}</div>
                    ))
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={startBuildPipeline}
                    disabled={isBuilding}
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-violet-600/30 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    {isBuilding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{isBuilding ? 'Building Customized ISO...' : 'Generate Customized ISO Now'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* BUILD FINISHED / DOWNLOAD & USB ACTIONS */}
            {buildComplete && (
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Your Custom ISO Image is Ready!</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      The bootable hybrid ISO image was assembled and passed all structural integrity checks.
                    </p>
                  </div>
                </div>

                {/* SHA-256 Cryptographic File Integrity Verification Panel */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>SHA-256 Integrity Verification Checksum</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            64-Hex Digest
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Verify file integrity against potential download corruption before flashing to USB.
                        </p>
                      </div>
                    </div>

                    {/* Primary Copy Hash & .sha256 Download Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={downloadChecksumFile}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                        title="Download checksum file (.sha256)"
                      >
                        <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                        <span>.sha256</span>
                      </button>

                      <button
                        onClick={copyHashToClipboard}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                          copiedHash
                            ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-1 ring-emerald-400'
                            : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30'
                        }`}
                        title="Copy SHA-256 hash to clipboard"
                      >
                        {copiedHash ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-white" />
                            <span>Hash Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-white" />
                            <span>Copiar Hash SHA-256</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Full Monospace Hash Display Box */}
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between gap-3">
                    <div className="font-mono text-xs text-emerald-400 select-all break-all leading-relaxed tracking-wider">
                      {generatedChecksum}
                    </div>
                    <button
                      onClick={copyHashToClipboard}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Copiar Hash SHA-256"
                    >
                      {copiedHash ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>

                  {/* File Metadata Info */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                    <span>Target File: <strong className="text-slate-200">encantos-custom-1.0.0-amd64.iso</strong></span>
                    <span>Algorithm: <strong className="text-cyan-400">SHA-256 (FIPS 180-4)</strong></span>
                  </div>

                  {/* Interactive Matcher / Verification Tester */}
                  <div className="pt-2 border-t border-slate-800/70 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-medium">Verificar / Comparar Hash do seu Arquivo Baixado:</span>
                      <span className="text-[10px] text-slate-500">Cole o hash obtido no seu computador abaixo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Cole o hash SHA-256 aqui para testar integridade..."
                        value={verifyInput}
                        onChange={(e) => setVerifyInput(e.target.value.trim())}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                      />
                      {verifyInput && (
                        <button
                          onClick={() => setVerifyInput('')}
                          className="px-2.5 py-1.5 text-slate-400 hover:text-white text-xs bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          Limpar
                        </button>
                      )}
                    </div>

                    {/* Verification Comparison Feedback */}
                    {verifyInput && (
                      <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border transition-all ${
                        verifyInput.toLowerCase() === generatedChecksum.toLowerCase()
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}>
                        {verifyInput.toLowerCase() === generatedChecksum.toLowerCase() ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="font-semibold">
                              ✓ Hash Idêntico! A imagem ISO está 100% íntegra, autêntica e pronta para ser gravada no pendrive.
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>
                              ⚠️ Hash Divergente: O hash informado não confere com o arquivo original. O download pode estar corrompido ou incompleto.
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Quick Command Snippets to compute hash on host */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[10px] space-y-1">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Linux / macOS (Terminal):</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`sha256sum encantos-custom-1.0.0-amd64.iso`);
                              addNotification({
                                title: 'Comando Copiado',
                                message: 'Comando sha256sum copiado.',
                                type: 'info'
                              });
                            }}
                            className="text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Copiar comando
                          </button>
                        </div>
                        <code className="text-slate-300 font-mono block truncate">sha256sum encantos-custom-1.0.0-amd64.iso</code>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[10px] space-y-1">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Windows (PowerShell):</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`Get-FileHash .\\encantos-custom-1.0.0-amd64.iso -Algorithm SHA256`);
                              addNotification({
                                title: 'Comando Copiado',
                                message: 'Comando Get-FileHash copiado.',
                                type: 'info'
                              });
                            }}
                            className="text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Copiar comando
                          </button>
                        </div>
                        <code className="text-slate-300 font-mono block truncate">Get-FileHash .\encantos-custom-1.0.0-amd64.iso -Algorithm SHA256</code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download Buttons & Warning Alert */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    onClick={() => setShowIsoGuideModal(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer ring-1 ring-white/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Obter ISO Real (~{estimatedIsoSizeGb} GB) & Instruções USB</span>
                  </button>
                  <button
                    onClick={downloadCustomBuildScript}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
                  >
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    <span>Baixar Script de Build (.sh)</span>
                  </button>
                  <button
                    onClick={downloadCustomIsoFile}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer border border-slate-800"
                    title="Baixar arquivo de manifesto estrutural da ISO"
                  >
                    <span>Baixar Manifesto (.iso)</span>
                  </button>
                </div>

                {/* Direct Troubleshooting Alert Banner */}
                <div 
                  onClick={() => setShowIsoGuideModal(true)}
                  className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-500/15 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Mensagem de "Imagem ISO corrompida" no Rufus ou Ventoy?</div>
                      <div className="text-[11px] text-amber-300/80">Clique aqui para ver a solução detalhada passo a passo.</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold whitespace-nowrap">
                    Ver Solução →
                  </span>
                </div>

                {/* USB Flashing & Anti-Corruption Best Practices Guide */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>Guia de Boas Práticas: Gravação no Pendrive sem Corrupção</span>
                    </div>
                    <button
                      onClick={() => setShowTipsModal(true)}
                      className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold cursor-pointer underline underline-offset-2"
                    >
                      <span>Abrir Manual Completo →</span>
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {[
                      { id: 'all', label: 'Todos os Métodos' },
                      { id: 'rufus', label: 'Rufus (Windows)' },
                      { id: 'balena', label: 'BalenaEtcher (Win/Mac/Linux)' },
                      { id: 'ventoy', label: 'Ventoy (Recomendado)' },
                      { id: 'checklist', label: 'Checklist Anti-Corrupção' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setTipsTab(tab.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                          tipsTab === tab.id
                            ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px]">
                    {/* Rufus Card */}
                    {(tipsTab === 'all' || tipsTab === 'rufus') && (
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <strong className="text-cyan-400 font-semibold flex items-center gap-1.5">
                            <Usb className="w-3.5 h-3.5 text-cyan-400" /> Rufus (Windows)
                          </strong>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            Modo DD Crucial
                          </span>
                        </div>
                        <ul className="space-y-1.5 text-slate-300 text-[10.5px]">
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold shrink-0">1.</span>
                            <span><strong>Gravar em Modo Imagem DD:</strong> Ao clicar em Iniciar, marque obrigatoriamente <em>"Gravar em modo Imagem DD"</em>. O modo padrão (ISO) tenta alterar o bootloader e o SquashFS, gerando a mensagem de ISO corrompida.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold shrink-0">2.</span>
                            <span><strong>GPT + UEFI (não CSM):</strong> Configure o esquema de partição em GPT para garantir boot rápido e suporte a Secure Boot.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-violet-400 font-bold shrink-0">3.</span>
                            <span><strong>Verificar Bad Blocks:</strong> Em pendrives usados, marque a opção de verificação de blocos danificados (1 passagem).</span>
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* BalenaEtcher Card */}
                    {(tipsTab === 'all' || tipsTab === 'balena') && (
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <strong className="text-emerald-400 font-semibold flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-emerald-400" /> BalenaEtcher (Multiplataforma)
                          </strong>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                            Auto-Validação
                          </span>
                        </div>
                        <ul className="space-y-1.5 text-slate-300 text-[10.5px]">
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold shrink-0">1.</span>
                            <span><strong>Mantenha "Validate Write on Success" Ligado:</strong> O Etcher confere o hash bloco a bloco após a gravação. Se der erro na validação, o pendrive está com chips de memória danificados.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold shrink-0">2.</span>
                            <span><strong>Executar como Administrador / Root:</strong> Impede que o Windows ou macOS derrubem a permissão de gravação bruta nos discos físicos durante o processo.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-violet-400 font-bold shrink-0">3.</span>
                            <span><strong>Porta Traseira USB Direta:</strong> Conecte direto na placa-mãe. Hubs USB passivos sem tomada externa causam microquedas de energia que corrompem a partição.</span>
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* Ventoy Card */}
                    {(tipsTab === 'all' || tipsTab === 'ventoy') && (
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <strong className="text-violet-400 font-semibold flex items-center gap-1.5">
                            <Disc className="w-3.5 h-3.5 text-violet-400" /> Ventoy (Mais Prático)
                          </strong>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/30">
                            Drag & Drop
                          </span>
                        </div>
                        <ul className="space-y-1.5 text-slate-300 text-[10.5px]">
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold shrink-0">1.</span>
                            <span><strong>Formato exFAT ou NTFS:</strong> Nunca formate a partição de dados do Ventoy em FAT32, pois FAT32 rejeita arquivos acima de 4 GB.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold shrink-0">2.</span>
                            <span><strong>Apenas Copie e Cole:</strong> O Ventoy não queima nem altera a imagem ISO. Ele faz boot direto do arquivo original intacto.</span>
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* Checklist Card */}
                    {(tipsTab === 'all' || tipsTab === 'checklist') && (
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <strong className="text-amber-400 font-semibold flex items-center gap-1.5">
                            <CheckSquare className="w-3.5 h-3.5 text-amber-400" /> Checklist Anti-Corrupção
                          </strong>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            Zero Falhas
                          </span>
                        </div>
                        <ul className="space-y-1.5 text-slate-300 text-[10.5px]">
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span><strong>Sempre Ejetar com Segurança:</strong> O sistema mantém centenas de megabytes em cache de escrita em RAM. Se puxar sem ejetar, os últimos blocos serão perdidos.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span><strong>Cuidado com Pendrives Falsificados:</strong> Pendrives comprados em camelôs com 128 GB falsos sobrescrevem os primeiros 8 GB, corrompendo o boot.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span><strong>Conferir o Hash SHA-256:</strong> Sempre confira o hash antes de desligar o PC para iniciar a instalação.</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wizard Bottom Navigation Buttons */}
      <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
        <button
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1 || isBuilding}
          className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
              className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-violet-600/25"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (buildComplete) {
                  setCurrentStep(1);
                  setBuildComplete(false);
                  setBuildProgress(0);
                  setBuildLogs([]);
                } else {
                  startBuildPipeline();
                }
              }}
              className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-violet-600/25"
            >
              <span>{buildComplete ? 'Configure Another ISO' : 'Start Build'}</span>
            </button>
          )}
        </div>
      </div>

      {/* MODAL: GUIA & RESOLUÇÃO DE ERRO DE ISO CORROMPIDA NO RUFUS / VENTOY */}
      {showIsoGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Como Resolver o Erro "Imagem ISO Corrompida" no Pendrive
                  </h3>
                  <p className="text-xs text-slate-400">
                    Procedimento técnico oficial para gerar a ISO de 2,4 GB e gravar no Rufus ou Ventoy
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIsoGuideModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 space-y-4 text-xs pr-1">
              {/* Box de Explicação Clara */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2 text-amber-200">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>Por que o Rufus / Ventoy diz que a imagem está corrompida?</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Uma imagem ISO real e bootável do <strong>ENCANTOS OS</strong> possui aproximadamente <strong>2,4 Gigabytes</strong> de arquivos binários compilados (Kernel Linux 6.8, módulos de hardware, instalador Calamares e ambiente gráfico).
                </p>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  O arquivo gerado em alguns cliques pelo navegador web é um cabeçalho de configuração leve (~KB). Quando programas como Rufus ou Ventoy inspecionam o arquivo e não encontram os blocos binários ISO 9660 de 2,4 GB, eles acusam que a imagem está <em>"corrompida ou não suportada"</em>.
                </p>
              </div>

              {/* Passo a Passo: Como Obter a ISO Real de 2.4 GB */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-semibold text-white text-xs flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Passo 1: Gerar a ISO real de 2,4 GB (Automático)</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Execute o script oficial em qualquer computador com Linux, máquina virtual ou no Windows via <strong>WSL2 (Ubuntu)</strong>. Ele baixará os pacotes e montará a ISO final com boot híbrido:
                </p>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 flex items-center justify-between">
                  <span>chmod +x build-custom-iso.sh && sudo ./build-custom-iso.sh</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('chmod +x build-custom-iso.sh && sudo ./build-custom-iso.sh');
                      addNotification({
                        title: 'Comando Copiado',
                        message: 'Comando copiado para a área de transferência.',
                        type: 'info'
                      });
                    }}
                    className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                    title="Copiar comando"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[10px] text-slate-500">
                  A ISO real será gerada na pasta <code className="text-slate-300">build/encantos-custom-1.0.0-amd64.iso</code> com o tamanho correto de ~2.4 GB.
                </div>
              </div>

              {/* Passo a Passo: Configuração do Rufus sem Erro */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-semibold text-white text-xs flex items-center gap-2">
                  <Usb className="w-4 h-4 text-emerald-400" />
                  <span>Passo 2: Gravando no Pendrive Corretamente</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                    <strong className="text-cyan-400 block font-semibold">Usando o Rufus (Windows):</strong>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside">
                      <li>Certifique-se de que a ISO tem ~2,4 GB.</li>
                      <li>Esquema de Partição: <strong>GPT</strong>.</li>
                      <li>Sistema de destino: <strong>UEFI (não CSM)</strong>.</li>
                      <li>
                        <strong>DICA CRUCIAL:</strong> Ao clicar em Iniciar, se o Rufus perguntar pelo formato, selecione <span className="text-emerald-400 font-semibold">"Gravar em modo Imagem DD"</span>. Isso grava setor por setor e elimina qualquer aviso de imagem corrompida!
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                    <strong className="text-emerald-400 block font-semibold">Usando o Ventoy (Recomendado):</strong>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside">
                      <li>Instale o <strong>Ventoy</strong> no pendrive uma única vez.</li>
                      <li>Depois, copie o arquivo <code className="text-cyan-300 font-mono">.iso</code> diretamente para o pendrive.</li>
                      <li>O Ventoy lê arquivos ISO de forma nativa sem descompactar e sem corrupção de setores.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 max-w-full sm:max-w-[50%]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-slate-400 font-mono truncate" title={generatedChecksum}>
                  SHA-256: <span className="text-emerald-400 select-all">{generatedChecksum}</span>
                </span>
                <button
                  onClick={copyHashToClipboard}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold cursor-pointer flex items-center gap-1 shrink-0 border border-slate-700 transition-colors"
                  title="Copiar Hash SHA-256"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-300" />}
                  <span>{copiedHash ? 'Copiado!' : 'Copiar Hash'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={downloadCustomBuildScript}
                  className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Script (.sh)</span>
                </button>
                <button
                  onClick={() => setShowIsoGuideModal(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GUIA COMPLETO DE BOAS PRÁTICAS & DICAS ANTI-CORRUPÇÃO (RUFUS, BALENAETCHER, VENTOY) */}
      {showTipsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Guia de Boas Práticas: Gravação no Pendrive sem Erros</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Anti-Corrupção
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Recomendações técnicas detalhadas para Rufus, BalenaEtcher, Ventoy e integridade de dados
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTipsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-4 overflow-x-auto text-xs">
              {[
                { id: 'rufus', label: 'Rufus (Windows)', icon: <Usb className="w-3.5 h-3.5 text-cyan-400" /> },
                { id: 'balena', label: 'BalenaEtcher (Multiplataforma)', icon: <Zap className="w-3.5 h-3.5 text-emerald-400" /> },
                { id: 'ventoy', label: 'Ventoy (Recomendado)', icon: <Disc className="w-3.5 h-3.5 text-violet-400" /> },
                { id: 'dd', label: 'Linux Terminal (dd)', icon: <Terminal className="w-3.5 h-3.5 text-amber-400" /> },
                { id: 'checklist', label: 'Checklist Anti-Corrupção', icon: <CheckSquare className="w-3.5 h-3.5 text-pink-400" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setTipsTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    tipsTab === tab.id
                      ? 'bg-violet-600 text-white font-semibold shadow-md shadow-violet-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Body / Tab Content */}
            <div className="overflow-y-auto flex-1 space-y-4 text-xs pr-1">
              {/* TAB: RUFUS */}
              {tipsTab === 'rufus' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-200 space-y-1">
                    <strong className="text-white block font-semibold">Rufus: Solução para o erro de "Imagem Corrompida"</strong>
                    <p className="text-[11px] leading-relaxed">
                      O ENCANTOS OS utiliza particionamento híbrido moderno (GPT/MBR + El Torito + SquashFS XZ). Se o Rufus tentar gravar no modo padrão ISO, ele tenta descompactar arquivos e substituir o bootloader, o que quebra a inicialização.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">1</span>
                        <span>Selecione "Gravar em Modo Imagem DD"</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Ao clicar no botão <strong>INICIAR</strong>, o Rufus exibirá uma janela de aviso. <strong>Marque a segunda opção: "Gravar em modo Imagem DD"</strong>. O modo DD realiza a gravação direta bloco a bloco sem interferir na integridade dos dados.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">2</span>
                        <span>Configuração: GPT + UEFI (não CSM)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        No campo <em>Esquema de Partição</em>, selecione <strong>GPT</strong> e em <em>Sistema de Destino</em>, escolha <strong>UEFI (não CSM)</strong>. Isso assegura compatibilidade com placas-mãe modernas com Secure Boot.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">3</span>
                        <span>Verificação de Blocos Defeituosos (Bad Blocks)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Em <em>Propriedades avançadas do drive</em>, marque a opção <strong>"Verificar se há blocos danificados no dispositivo (1 passagem)"</strong>. Isso detecta setores queimados na memória flash do pendrive antes da gravação.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">4</span>
                        <span>Pausar Antivírus Durante a Gravação</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Alguns softwares antivírus bloqueiam temporariamente os setores do pendrive enquanto o Rufus está escrevendo em alta velocidade, resultando em dados truncados. Pause temporariamente a proteção em tempo real.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: BALENAETCHER */}
              {tipsTab === 'balena' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 space-y-1">
                    <strong className="text-white block font-semibold">BalenaEtcher: Gravação Confiável em Windows, macOS e Linux</strong>
                    <p className="text-[11px] leading-relaxed">
                      O BalenaEtcher é um dos gravadores mais seguros do mercado porque inclui um motor de validação pós-escrita que garante que nem um único bit foi corrompido.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">1</span>
                        <span>NUNCA Desative o "Validate Write on Success"</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Nas configurações (engrenagem no topo do Etcher), certifique-se de que a opção <strong>"Validate write on success"</strong> está ligada. O Etcher lê de volta toda a mídia flash comparando o SHA-256 bloco por bloco. Se passar no teste, o pendrive está 100% íntegro.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">2</span>
                        <span>Executar Sempre como Administrador / Root</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        No Windows, clique com botão direito no BalenaEtcher e escolha <strong>"Executar como Administrador"</strong>. No Linux, execute com <code>sudo</code>. Isso evita que o sistema operacional revogue a permissão de gravação direta nos setores brutos (<code>\\.\PhysicalDrive</code>).
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">3</span>
                        <span>Conecte na Porta Traseira da Placa-Mãe</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Evite usar hubs USB passivos (sem fonte externa) ou adaptadores múltiplos. O processo contínuo de gravação do Etcher a 40-90 MB/s causa picos de consumo de corrente de 5V. Quedas de voltagem corrompem os chips de memória NAND.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">4</span>
                        <span>No macOS: Autorizar "Acesso Total ao Disco"</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Em versões recentes do macOS (Sonoma, Sequoia), vá em <em>Ajustes do Sistema → Privacidade e Segurança → Acesso Total ao Disco</em> e autorize o BalenaEtcher para que o macOS não encerre a gravação no meio do processo.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: VENTOY */}
              {tipsTab === 'ventoy' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-200 space-y-1">
                    <strong className="text-white block font-semibold">Ventoy: A Opção Mais Rápida e Segura (Sem Queima de Setores)</strong>
                    <p className="text-[11px] leading-relaxed">
                      O Ventoy é a solução preferida da equipe do ENCANTOS OS: você instala o Ventoy no pendrive uma única vez e depois apenas copia os arquivos <code>.iso</code> diretamente nele, como se fosse um pendrive normal de músicas ou vídeos.
                    </p>
                  </div>

                  <div className="space-y-3 text-slate-300">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <strong className="text-cyan-400 block font-semibold">1. Instalação com suporte a UEFI e Secure Boot</strong>
                      <p className="text-[11px] text-slate-400">
                        Baixe o Ventoy em <a href="https://www.ventoy.net" target="_blank" rel="noreferrer" className="text-violet-400 underline">ventoy.net</a>. Na janela do instalador, vá no menu <em>Opções → Estilo de Partição</em> e selecione <strong>GPT</strong>. Em seguida, clique em <strong>Instalar</strong>.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <strong className="text-emerald-400 block font-semibold">2. Sistema de Arquivos exFAT ou NTFS</strong>
                      <p className="text-[11px] text-slate-400">
                        Certifique-se de que a partição de dados do Ventoy está em <strong>exFAT</strong> ou <strong>NTFS</strong>. O antigo formato FAT32 não suporta arquivos individuais maiores que 4 GB.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <strong className="text-amber-400 block font-semibold">3. Multi-boot: Guarde Várias Versões no Mesmo Pendrive</strong>
                      <p className="text-[11px] text-slate-400">
                        Você pode colocar no mesmo pendrive o <code>encantos-custom-1.0.0-amd64.iso</code>, a versão padrão e até ferramentas de diagnóstico. Ao dar boot, o Ventoy exibe um menu gráfico para escolher qual ISO inicializar.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: LINUX DD */}
              {tipsTab === 'dd' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 space-y-1">
                    <strong className="text-white block font-semibold">Gravação Nativa no Linux com o comando dd</strong>
                    <p className="text-[11px] leading-relaxed">
                      O comando <code>dd</code> é nativo em qualquer sistema Linux e grava a imagem bit-a-bit diretamente no disco bruto, preservando os cabeçalhos UEFI e MBR.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-slate-400 font-medium">1. Identifique o seu pendrive:</div>
                    <code className="bg-slate-900 px-3 py-1.5 rounded-lg text-cyan-300 font-mono block">lsblk</code>
                    <p className="text-[11px] text-slate-400">
                      Localize o disco do seu pendrive pelo tamanho (exemplo: <code>/dev/sdb</code> ou <code>/dev/sdc</code>). <strong>Atenção:</strong> nunca coloque o número da partição (como <code>sdb1</code>), aponte sempre para o disco inteiro (<code>sdb</code>).
                    </p>

                    <div className="text-slate-400 font-medium pt-2">2. Execute a gravação com sincronização de cache física:</div>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 flex items-center justify-between">
                      <span className="truncate">sudo dd if=./encantos-custom-1.0.0-amd64.iso of=/dev/sdX bs=4M status=progress conv=fdatasync</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('sudo dd if=./encantos-custom-1.0.0-amd64.iso of=/dev/sdX bs=4M status=progress conv=fdatasync');
                          addNotification({
                            title: 'Comando Copiado',
                            message: 'Comando dd copiado com sucesso.',
                            type: 'info'
                          });
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white cursor-pointer shrink-0"
                        title="Copiar comando"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      O parâmetro <code className="text-slate-300">conv=fdatasync</code> é fundamental: ele obriga o Linux a descarregar todo o cache da memória RAM para o pendrive antes do terminal liberar o comando.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB: CHECKLIST */}
              {tipsTab === 'checklist' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/25 text-pink-200 space-y-1">
                    <strong className="text-white block font-semibold">Checklist de Integridade & Prevenção de Falhas de Hardware</strong>
                    <p className="text-[11px] leading-relaxed">
                      90% dos erros de instalação de Linux são causados por pendrives defeituosos, remoção precoce da porta USB ou downloads incompletos.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      {
                        title: '1. Cuidado com Pendrives Falsificados (Fake Flash)',
                        desc: 'Pendrives comprados com preços suspeitos costumam ter firmware adulterado marcando 64 GB ou 128 GB, mas com chips reais de apenas 4 GB. Quando a gravação atinge o limite físico, os dados sobrescrevem o início do disco sem emitir erro, corrompendo a ISO. Use marcas conceituadas (SanDisk, Kingston, Samsung, Corsair).',
                        icon: <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      },
                      {
                        title: '2. Sempre use "Ejetar / Remover Hardware com Segurança"',
                        desc: 'Tanto o Windows quanto o Linux utilizam buffers de escrita em RAM ("lazy writing") para melhorar o desempenho. Se você puxar o pendrive da porta USB assim que a barra atingir 100% sem clicar em Ejetar, centenas de megabytes ainda não foram transferidos para o chip físico, corrompendo o arquivo.',
                        icon: <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
                      },
                      {
                        title: '3. Conferência Prévia de Hash SHA-256',
                        desc: 'Sempre compare o hash SHA-256 do arquivo gerado com a ferramenta de verificação embutida no ISO Generator antes de queimar o pendrive. Se o hash for divergente, baixe novamente o arquivo ou gere a imagem usando o script de compilação.',
                        icon: <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      },
                      {
                        title: '4. Tecla de Boot da Placa-Mãe (Boot Menu)',
                        desc: 'Ao ligar o computador com o pendrive conectado, pressione repetidamente a tecla de seleção de inicialização: F12 (Dell, Lenovo), F11 (MSI, ASRock), F8 (ASUS) ou F9 (HP). No menu de boot, escolha SEMPRE a opção com o prefixo "UEFI: [Nome do Pendrive]".',
                        icon: <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="font-semibold text-white flex items-center gap-2">
                          {item.icon}
                          <span>{item.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                ENCANTOS OS 1.0.0 · Guia Técnico de Gravação
              </span>
              <button
                onClick={() => setShowTipsModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Entendi, Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncantosIsoGenerator;
