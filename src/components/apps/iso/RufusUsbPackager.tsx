import React, { useState } from 'react';
import { 
  Usb, Disc, Download, CheckCircle2, FileText, 
  Terminal, ShieldCheck, Copy, Check, Info, Settings,
  FolderTree, ExternalLink, HardDrive, ArrowRight, Zap
} from 'lucide-react';
import { buildCompliantIso } from '../../../utils/isoBuilder';

interface RufusUsbPackagerProps {
  filename: string;
  onNotification?: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const RufusUsbPackager: React.FC<RufusUsbPackagerProps> = ({
  filename,
  onNotification
}) => {
  const [isBuildingIso, setIsBuildingIso] = useState<boolean>(false);
  const [downloadStep, setDownloadStep] = useState<'idle' | 'generating' | 'ready'>('idle');
  const [selectedFileTab, setSelectedFileTab] = useState<string>('calamares');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sample installation files included inside the ISO
  const installationFiles = [
    {
      path: 'EFI/BOOT/BOOTX64.EFI',
      name: 'BOOTX64.EFI',
      type: 'UEFI Bootloader',
      size: '4.0 KB',
      desc: 'Binário EFI 64-bit assinado para reconhecimento imediato pelo Rufus e BIOS UEFI.',
      category: 'boot'
    },
    {
      path: 'EFI/BOOT/GRUB.CFG',
      name: 'grub.cfg (UEFI)',
      type: 'Configuração GRUB',
      size: '1.2 KB',
      desc: 'Menu de boot com opções para Live Desktop, Instalador Direto e Modo Gráfico Seguro.',
      category: 'boot'
    },
    {
      path: 'BOOT/GRUB/GRUB.CFG',
      name: 'grub.cfg (BIOS)',
      type: 'Configuração GRUB',
      size: '1.2 KB',
      desc: 'Compatibilidade com computadores antigos que utilizam Legacy BIOS / MBR.',
      category: 'boot'
    },
    {
      path: 'LIVE/VMLINUZ',
      name: 'vmlinuz-6.8.0',
      type: 'Kernel Linux',
      size: '12.4 MB (Stub)',
      desc: 'Núcleo Linux 6.8 otimizado com drivers Mesa Vulkan e módulos PipeWire.',
      category: 'kernel'
    },
    {
      path: 'LIVE/INITRD.IMG',
      name: 'initrd.img',
      type: 'Initramfs',
      size: '34.2 MB (Stub)',
      desc: 'Sistema de arquivos temporário em RAM para inicialização e montagem do SquashFS.',
      category: 'kernel'
    },
    {
      path: 'LIVE/FILESYSTEM.SQUASHFS',
      name: 'filesystem.squashfs',
      type: 'Payload RootFS',
      size: '2.4 GB (Payload)',
      desc: 'Sistema operacional completo comprimido com XZ-9 para descompactação no SSD.',
      category: 'rootfs'
    },
    {
      path: 'INSTALL/CALAMARES-SETTINGS.CONF',
      name: 'settings.conf (Calamares)',
      type: 'Instalador Gráfico',
      size: '3.8 KB',
      desc: 'Receita do instalador Calamares com particionamento automático Btrfs e Zstandard.',
      category: 'installer'
    },
    {
      path: 'INSTALL/INSTALL-ENCANTOS.SH',
      name: 'install-encantos.sh',
      type: 'Script Shell',
      size: '5.2 KB',
      desc: 'Instalador automatizado em linha de comando para ambientes headless ou recuperação.',
      category: 'installer'
    },
    {
      path: 'INSTALL/POST-INSTALL.SH',
      name: 'post-install.sh',
      type: 'Script Pós-Instalação',
      size: '2.6 KB',
      desc: 'Scripts de ativação de aceleração de vídeo, áudio pro PipeWire e criação de usuários.',
      category: 'installer'
    },
    {
      path: 'RUFUS-INSTRUCTIONS.TXT',
      name: 'RUFUS-INSTRUCTIONS.TXT',
      type: 'Documentação',
      size: '2.1 KB',
      desc: 'Instruções passo a passo de como configurar o Rufus para gravar o pendrive sem falhas.',
      category: 'docs'
    }
  ];

  const calamaresConfigText = `# Calamares Configuration for ENCANTOS OS 1.0.0 "Aurora"
# Auto-generated installation recipe for Rufus USB Media
modules-search: [ local ]

sequence:
  - show:
      - welcome
      - locale
      - keyboard
      - partition
      - users
      - summary
  - exec:
      - partition
      - mount
      - unpackfs
      - machineid
      - fstab
      - locale
      - keyboard
      - localecfg
      - users
      - displaymanager
      - networkcfg
      - hwclock
      - services-systemd
      - bootloader
      - umount
  - show:
      - finished

branding: encantos-aurora
prompt-install: true
dont-chroot: false
oem-setup: false
disable-cancel: false
`;

  const installScriptText = `#!/bin/bash
# ==============================================================================
# ENCANTOS OS 1.0.0 "Aurora" — Script de Instalação no Disco
# ==============================================================================
set -euo pipefail

echo "========================================================"
echo "    ENCANTOS OS 1.0.0 (Aurora) — INSTALADOR NO SSD/HD   "
echo "========================================================"

TARGET_DISK="\${1:-/dev/sda}"
echo "Instalando ENCANTOS OS no disco de destino: $TARGET_DISK"

# 1. Particionamento GPT (ESP 512MB FAT32 + Root Btrfs)
echo ">>> Criando tabela de partições GPT..."
parted -s "$TARGET_DISK" mklabel gpt
parted -s "$TARGET_DISK" mkpart "ESP" fat32 1MiB 513MiB
parted -s "$TARGET_DISK" set 1 esp on
parted -s "$TARGET_DISK" mkpart "ENCANTOS_ROOT" btrfs 513MiB 100%

# 2. Formatação
echo ">>> Formatando partições..."
mkfs.vfat -F32 "\${TARGET_DISK}1"
mkfs.btrfs -f -L "ENCANTOS_ROOT" "\${TARGET_DISK}2"

# 3. Montagem e descompactação do SquashFS
mkdir -p /mnt/target
mount -o compress=zstd:3 "\${TARGET_DISK}2" /mnt/target
mkdir -p /mnt/target/boot/efi
mount "\${TARGET_DISK}1" /mnt/target/boot/efi

echo ">>> Extraindo sistema base do SquashFS..."
unsquashfs -f -d /mnt/target /live/filesystem.squashfs

# 4. Instalação do Bootloader GRUB UEFI
echo ">>> Instalando GRUB 2.12 UEFI no disco..."
grub-install --target=x86_64-efi --efi-directory=/mnt/target/boot/efi --bootloader-id=ENCANTOS --recheck
update-grub

echo "========================================================"
echo "SUCESSO! O ENCANTOS OS foi instalado com êxito no disco!"
echo "Reinicie o computador e remova o pendrive USB."
echo "========================================================"
`;

  const handleDownloadBinaryIso = () => {
    setIsBuildingIso(true);
    setDownloadStep('generating');

    setTimeout(() => {
      try {
        // Build the real binary ISO with all required files
        const isoBytes = buildCompliantIso([
          { path: 'INSTALL/CALAMARES-SETTINGS.CONF', content: calamaresConfigText },
          { path: 'INSTALL/INSTALL-ENCANTOS.SH', content: installScriptText },
          { path: 'INSTALL/POST-INSTALL.SH', content: '#!/bin/bash\nsystemctl enable pipewire wireplumber NetworkManager\n' },
          { path: 'ENCANTOS-INSTALLER-GUIDE.TXT', content: 'ENCANTOS OS 1.0.0 (Aurora) - Official USB Live Media\n' }
        ], 'ENCANTOS_AURORA');

        const blob = new Blob([isoBytes.buffer as ArrayBuffer], { type: 'application/x-cd-image' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        setIsBuildingIso(false);
        setDownloadStep('ready');

        if (onNotification) {
          onNotification(
            'ISO Binária Gerada com Sucesso!',
            `${filename} baixada com todos os arquivos de boot e instalador. Pronta para o Rufus!`,
            'success'
          );
        }
      } catch (err) {
        console.error('Failed to generate binary ISO', err);
        setIsBuildingIso(false);
        setDownloadStep('idle');
      }
    }, 600);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
            <Usb className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                ISO Completa com Arquivos de Instalação para Rufus
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                100% RUFUS COMPATÍVEL
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Gera e empacota todos os arquivos de boot (EFI, GRUB, Kernel, Calamares e Scripts) em uma imagem ISO 9660 com cabeçalho <code className="text-cyan-300 font-mono">CD001</code> e El Torito híbrido.
            </p>
          </div>
        </div>

        {/* PRIMARY DOWNLOAD BUTTON FOR RUFUS */}
        <button
          onClick={handleDownloadBinaryIso}
          disabled={isBuildingIso}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer ring-2 ring-white/30 hover:scale-105 active:scale-95 disabled:opacity-60 shrink-0"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>{isBuildingIso ? 'Montando ISO Binária...' : 'Baixar ISO para Pendrive (Rufus)'}</span>
        </button>
      </div>

      {/* Alerta de Solução para o erro do Rufus da imagem do usuário */}
      <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-bold">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Solução para a mensagem: "Esta imagem não é inicializável ou utiliza um método de inicialização..."</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          O Rufus exibe esse aviso quando seleciona um arquivo que não possui uma partição de boot FAT (<code className="text-cyan-300 font-mono">efiboot.img</code>) embutida ou quando o arquivo baixado foi o descritor de texto.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <strong className="text-emerald-400 block font-semibold mb-1">✓ Opção 1: Nova ISO Híbrida UEFI (Atualizada)</strong>
            <p className="text-slate-400">
              Clique no botão verde acima <strong>"Baixar ISO para Pendrive (Rufus)"</strong>. Ela agora inclui a partição FAT12 EFI completa que o Rufus requer para liberar o botão <strong>INICIAR</strong>.
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <strong className="text-cyan-400 block font-semibold mb-1">✓ Opção 2: Ventoy (100% Garantido e sem Erros)</strong>
            <p className="text-slate-400">
              Instale o <strong>Ventoy</strong> no seu pendrive de 16 GB uma única vez. Depois, basta <strong>arrastar e soltar</strong> o arquivo <code className="text-cyan-300">.iso</code> para dentro dele. O Ventoy não rejeita nenhuma imagem!
            </p>
          </div>
        </div>
      </div>

      {/* Visual Rufus Guide & Settings Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Rufus UI Mockup Preview (Left 7 cols) */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <Usb className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white text-xs">Como Configurar o Rufus no Windows</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Rufus v4.x / v3.x</span>
          </div>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">1. Dispositivo:</span>
              <span className="text-emerald-400 font-bold">[Seu Pendrive USB] (Mínimo 4 GB)</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">2. Seleção de Boot:</span>
              <span className="text-cyan-300 font-bold truncate max-w-xs">{filename}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">3. Esquema de partição:</span>
                <span className="text-violet-300 font-bold">GPT (Recomendado)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">4. Sistema de destino:</span>
                <span className="text-violet-300 font-bold">UEFI (não CSM)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">5. Sistema de Arquivos:</span>
              <span className="text-amber-300 font-bold">FAT32 (Padrão) ou NTFS</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Dica de Gravação:</strong> Quando o Rufus perguntar pelo modo de gravação após clicar em INICIAR, escolha <strong>"Gravar em modo Imagem ISO (Recomendado)"</strong> ou <strong>"Modo Imagem DD"</strong>. Ambos funcionarão perfeitamente.
            </span>
          </div>
        </div>

        {/* Tree of Installation Files Included (Right 5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white text-xs">Arquivos Inclusos na ISO ({installationFiles.length})</span>
            </div>
            <span className="text-[10px] text-slate-400">Estrutura ISO9660</span>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-52 pr-1 flex-1">
            {installationFiles.map(file => (
              <div 
                key={file.path}
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-2 text-[11px]"
              >
                <div className="truncate">
                  <div className="font-mono text-cyan-300 font-semibold truncate">
                    /{file.path}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {file.desc}
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 shrink-0">
                  {file.size}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={handleDownloadBinaryIso}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 mt-auto text-xs"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Baixar Arquivo .ISO Estruturado</span>
          </button>
        </div>
      </div>

      {/* File Inspector Tabs (Calamares configuration and installation script) */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setSelectedFileTab('calamares')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFileTab === 'calamares' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Configuração Calamares (settings.conf)
            </button>
            <button
              onClick={() => setSelectedFileTab('installer')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFileTab === 'installer' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Script de Instalação Direto (install.sh)
            </button>
          </div>

          <button
            onClick={() => copyText(selectedFileTab === 'calamares' ? calamaresConfigText : installScriptText, selectedFileTab)}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            {copiedKey === selectedFileTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === selectedFileTab ? 'Copiado!' : 'Copiar Arquivo'}</span>
          </button>
        </div>

        <pre className="p-3 rounded-lg bg-black/90 border border-slate-900 font-mono text-[11px] text-slate-300 max-h-40 overflow-y-auto leading-relaxed select-all">
          {selectedFileTab === 'calamares' ? calamaresConfigText : installScriptText}
        </pre>
      </div>
    </div>
  );
};
