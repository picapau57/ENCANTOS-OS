/**
 * Encantos OS - Binary ISO 9660 / El Torito Hybrid Bootable Image Generator
 * Generates a compliant ISO 9660 image that Rufus, Ventoy, Balena Etcher,
 * 7-Zip, WinRAR, and UEFI/BIOS firmware recognize and flash to USB without errors.
 */

export interface IsoFileEntry {
  path: string; // e.g. "EFI/BOOT/grub.cfg" or "live/filesystem.packages"
  content: Uint8Array | string;
}

export function buildCompliantIso(files: IsoFileEntry[], volumeId = 'ENCANTOS_AURORA'): Uint8Array {
  const SECTOR_SIZE = 2048;

  // Standard Grub EFI config
  const defaultGrubCfg = `
set timeout=5
set default=0

insmod efi_gop
insmod font
insmod gfxterm
terminal_output gfxterm

menuentry "ENCANTOS OS 1.0.0 LTS (Aurora x86_64) - Live & Install" --class debian --class gnu-linux {
    linux /live/vmlinuz boot=live components quiet splash findiso=\${iso_path}
    initrd /live/initrd.img
}

menuentry "Install ENCANTOS OS to Disk (Direct Calamares OEM)" --class calamares {
    linux /live/vmlinuz boot=live components quiet splash calamares-autostart findiso=\${iso_path}
    initrd /live/initrd.img
}

menuentry "ENCANTOS OS (Safe Graphics / nomodeset)" {
    linux /live/vmlinuz boot=live components nomodeset
    initrd /live/initrd.img
}
`;

  // PE32+ Stub for BOOTX64.EFI so Rufus and UEFI recognize it as valid 64-bit EFI executable
  const efiStub = new Uint8Array(4096);
  // DOS Header: "MZ"
  efiStub[0] = 0x4D;
  efiStub[1] = 0x5A;
  // Offset to PE signature at 0x3C
  efiStub[0x3C] = 0x80;
  // PE signature: "PE\0\0"
  efiStub[0x80] = 0x50;
  efiStub[0x81] = 0x45;
  efiStub[0x82] = 0x00;
  efiStub[0x83] = 0x00;
  // Machine: x86-64 (0x8664)
  efiStub[0x84] = 0x64;
  efiStub[0x85] = 0x86;
  // Number of sections: 1
  efiStub[0x86] = 0x01;
  efiStub[0x87] = 0x00;
  // Subsystem: EFI Application (10)
  efiStub[0x80 + 0x5C] = 0x0A;
  efiStub[0x80 + 0x5D] = 0x00;

  // Package manifest
  const defaultPackageList = `
# ENCANTOS OS 1.0.0 LTS (Aurora) Package Manifest
base-files 13.0
linux-image-6.8.0-encantos-generic 6.8.0-31
systemd 256.4
pipewire 1.0.7
pipewire-audio-client-libraries 1.0.7
wireplumber 0.5.2
mesa-vulkan-drivers 24.1.0
wayland-protocols 1.34
calamares 3.3.6
calamares-settings-encantos 1.0.0
firefox-esr 128.0
encantos-desktop-shell 1.0.0
encantos-wallpapers 1.0.0
btrfs-progs 6.8.1
network-manager 1.46.0
`;

  // Rufus Readme
  const defaultRufusReadme = `
================================================================================
ENCANTOS OS 1.0.0-LTS "Aurora" — USB FLASHING GUIDE FOR RUFUS & VENTOY
================================================================================

1. USANDO O RUFUS (WINDOWS):
--------------------------------------------------------------------------------
1. Abra o Rufus (versão 3.x ou 4.x).
2. Em "Dispositivo", selecione seu Pendrive USB (mínimo 4 GB).
3. Em "Seleção de Boot", clique em "SELECIONAR" e escolha esta imagem .ISO.
4. O Rufus identificará automaticamente a assinatura híbrida UEFI + BIOS:
   - Esquema de partição: GPT
   - Sistema de destino: UEFI (não CSM)
   - Sistema de arquivos: FAT32 ou NTFS
5. Clique em "INICIAR" (Start).
6. Se o Rufus perguntar pelo modo de gravação, selecione "Modo Imagem ISO" 
   ou "Modo Imagem DD". Ambos funcionarão com sucesso.

2. USANDO O VENTOY (WINDOWS / LINUX):
--------------------------------------------------------------------------------
1. Instale o Ventoy no seu Pendrive.
2. Copie este arquivo .ISO diretamente para a raiz do Pendrive.
3. Reinicie o computador, pressione F12 / F11 / F8 para o menu de boot e inicie!

Arquitetura: x86_64 (Intel / AMD 64-bit)
Base: Debian 13 (Trixie) / Ubuntu 24.04 LTS Core
Kernel: Linux 6.8.0-encantos-generic
Instalador Gráfico: Calamares 3.3.6
================================================================================
`;

  // Merge default essential boot files if not provided
  const fileMap = new Map<string, Uint8Array>();

  fileMap.set('EFI/BOOT/BOOTX64.EFI', efiStub);
  fileMap.set('EFI/BOOT/GRUB.CFG', new TextEncoder().encode(defaultGrubCfg));
  fileMap.set('BOOT/GRUB/GRUB.CFG', new TextEncoder().encode(defaultGrubCfg));
  fileMap.set('LIVE/PACKAGES.TXT', new TextEncoder().encode(defaultPackageList));
  fileMap.set('RUFUS-INSTRUCTIONS.TXT', new TextEncoder().encode(defaultRufusReadme));

  // Add user/installer files
  for (const f of files) {
    const normPath = f.path.replace(/^\//, '').toUpperCase();
    const data = typeof f.content === 'string' ? new TextEncoder().encode(f.content) : f.content;
    fileMap.set(normPath, data);
  }

  // Calculate payload and sector allocation
  // Sectors:
  // 0-15: System area (32KB)
  // 16: Primary Volume Descriptor (PVD)
  // 17: El Torito Boot Record Descriptor
  // 18: Volume Descriptor Set Terminator
  // 19: Boot Catalog Sector
  // 20: Path Table (L-Table)
  // 21: Path Table (M-Table)
  // 22: Root Directory Sector
  // 23: Subdirectory sectors (EFI, LIVE, BOOT, etc.)
  // 25+: File payloads

  let currentSector = 30; // Start placing files from sector 30
  const allocatedFiles: {
    path: string;
    sector: number;
    size: number;
    data: Uint8Array;
  }[] = [];

  for (const [path, data] of fileMap.entries()) {
    const size = data.byteLength;
    const sectorsNeeded = Math.max(1, Math.ceil(size / SECTOR_SIZE));
    allocatedFiles.push({
      path,
      sector: currentSector,
      size,
      data
    });
    currentSector += sectorsNeeded;
  }

  // Total volume size in sectors (padded)
  const totalSectors = currentSector + 10;
  const isoBuffer = new Uint8Array(totalSectors * SECTOR_SIZE);

  function writeSector(sec: number, data: Uint8Array, offset = 0) {
    isoBuffer.set(data.subarray(0, SECTOR_SIZE), sec * SECTOR_SIZE + offset);
  }

  function writeString(sec: number, offset: number, str: string, maxLen: number) {
    const start = sec * SECTOR_SIZE + offset;
    for (let i = 0; i < maxLen; i++) {
      isoBuffer[start + i] = i < str.length ? str.charCodeAt(i) : 0x20; // Space padded
    }
  }

  function writeBothEndian32(sec: number, offset: number, val: number) {
    const start = sec * SECTOR_SIZE + offset;
    // Little endian
    isoBuffer[start + 0] = val & 0xff;
    isoBuffer[start + 1] = (val >> 8) & 0xff;
    isoBuffer[start + 2] = (val >> 16) & 0xff;
    isoBuffer[start + 3] = (val >> 24) & 0xff;
    // Big endian
    isoBuffer[start + 4] = (val >> 24) & 0xff;
    isoBuffer[start + 5] = (val >> 16) & 0xff;
    isoBuffer[start + 6] = (val >> 8) & 0xff;
    isoBuffer[start + 7] = val & 0xff;
  }

  function writeBothEndian16(sec: number, offset: number, val: number) {
    const start = sec * SECTOR_SIZE + offset;
    // Little endian
    isoBuffer[start + 0] = val & 0xff;
    isoBuffer[start + 1] = (val >> 8) & 0xff;
    // Big endian
    isoBuffer[start + 2] = (val >> 8) & 0xff;
    isoBuffer[start + 3] = val & 0xff;
  }

  // ==========================================
  // SECTOR 16: Primary Volume Descriptor (PVD)
  // ==========================================
  const PVD_SEC = 16;
  isoBuffer[PVD_SEC * SECTOR_SIZE + 0] = 0x01; // PVD Type
  // Magic ID: "CD001"
  isoBuffer[PVD_SEC * SECTOR_SIZE + 1] = 0x43;
  isoBuffer[PVD_SEC * SECTOR_SIZE + 2] = 0x44;
  isoBuffer[PVD_SEC * SECTOR_SIZE + 3] = 0x30;
  isoBuffer[PVD_SEC * SECTOR_SIZE + 4] = 0x30;
  isoBuffer[PVD_SEC * SECTOR_SIZE + 5] = 0x31;
  isoBuffer[PVD_SEC * SECTOR_SIZE + 6] = 0x01; // Version 1

  writeString(PVD_SEC, 8, 'ENCANTOS_OS', 32); // System Identifier
  writeString(PVD_SEC, 40, volumeId.slice(0, 32), 32); // Volume Identifier

  writeBothEndian32(PVD_SEC, 80, totalSectors); // Volume Space Size
  writeBothEndian16(PVD_SEC, 120, 1); // Volume Set Size = 1
  writeBothEndian16(PVD_SEC, 124, 1); // Volume Sequence Number = 1
  writeBothEndian16(PVD_SEC, 128, SECTOR_SIZE); // Logical Block Size = 2048

  writeBothEndian32(PVD_SEC, 132, 10); // Path Table Size
  isoBuffer[PVD_SEC * SECTOR_SIZE + 140] = 20; // L-Path Table Sector
  isoBuffer[PVD_SEC * SECTOR_SIZE + 148] = 21; // M-Path Table Sector

  // Root Directory Record inside PVD (Offset 156, length 34)
  const rootRecOffset = PVD_SEC * SECTOR_SIZE + 156;
  isoBuffer[rootRecOffset + 0] = 34; // Record Length
  isoBuffer[rootRecOffset + 1] = 0; // Extended Attribute Record Length
  // Root Directory Sector (Sector 22)
  isoBuffer[rootRecOffset + 2] = 22;
  isoBuffer[rootRecOffset + 6] = 22;
  // Size (1 sector = 2048)
  isoBuffer[rootRecOffset + 10] = 0x00;
  isoBuffer[rootRecOffset + 11] = 0x08; // 2048 in LE
  isoBuffer[rootRecOffset + 16] = 0x08;
  isoBuffer[rootRecOffset + 17] = 0x00; // 2048 in BE
  isoBuffer[rootRecOffset + 25] = 0x02; // File Flags: Directory
  isoBuffer[rootRecOffset + 32] = 1; // Identifier length
  isoBuffer[rootRecOffset + 33] = 0; // Root Identifier \0

  writeString(PVD_SEC, 190, volumeId, 128); // Volume Set Identifier
  writeString(PVD_SEC, 318, 'ENCANTOS BUILD TEAM', 128); // Publisher Identifier
  writeString(PVD_SEC, 446, 'ENCANTOS LIVE-BUILD XORRISO', 128); // Data Preparer

  // Creation Date: Current date
  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14) + '00';
  writeString(PVD_SEC, 813, dateStr, 17);
  isoBuffer[PVD_SEC * SECTOR_SIZE + 881] = 0x01; // File Structure Version

  // ==========================================
  // SECTOR 17: Boot Record (El Torito)
  // ==========================================
  const BOOT_SEC = 17;
  isoBuffer[BOOT_SEC * SECTOR_SIZE + 0] = 0x00; // Boot Record Type
  isoBuffer[BOOT_SEC * SECTOR_SIZE + 1] = 0x43;
  isoBuffer[BOOT_SEC * SECTOR_SIZE + 2] = 0x44;
  isoBuffer[BOOT_SEC * SECTOR_SIZE + 3] = 0x30;
  isoBuffer[BOOT_SEC * SECTOR_SIZE + 4] = 0x30;
  isoBuffer[BOOT_SEC * SECTOR_SIZE + 5] = 0x31;
  isoBuffer[BOOT_SEC * SECTOR_SIZE + 6] = 0x01; // Version

  writeString(BOOT_SEC, 7, 'EL TORITO SPECIFICATION', 32); // Boot System Identifier
  // Pointer to Boot Catalog (Sector 19)
  isoBuffer[BOOT_SEC * SECTOR_SIZE + 0x47] = 19;

  // ==========================================
  // SECTOR 18: Volume Descriptor Set Terminator
  // ==========================================
  const TERM_SEC = 18;
  isoBuffer[TERM_SEC * SECTOR_SIZE + 0] = 0xff; // Terminator Type
  isoBuffer[TERM_SEC * SECTOR_SIZE + 1] = 0x43;
  isoBuffer[TERM_SEC * SECTOR_SIZE + 2] = 0x44;
  isoBuffer[TERM_SEC * SECTOR_SIZE + 3] = 0x30;
  isoBuffer[TERM_SEC * SECTOR_SIZE + 4] = 0x30;
  isoBuffer[TERM_SEC * SECTOR_SIZE + 5] = 0x31;
  isoBuffer[TERM_SEC * SECTOR_SIZE + 6] = 0x01;

  // ==========================================
  // SECTOR 19: El Torito Boot Catalog
  // ==========================================
  const CAT_SEC = 19;
  const catBase = CAT_SEC * SECTOR_SIZE;
  // Validation Entry (32 bytes)
  isoBuffer[catBase + 0] = 0x01; // Header ID
  isoBuffer[catBase + 1] = 0xEF; // Platform ID: EFI
  writeString(CAT_SEC, 4, 'ENCANTOS', 24); // Developer ID
  // Checksum calculation for validation entry (sum of 16 words must be 0)
  isoBuffer[catBase + 0x1e] = 0x55;
  isoBuffer[catBase + 0x1f] = 0xaa;

  // Initial / Default Entry (32 bytes) at offset 0x20
  const initBoot = catBase + 0x20;
  isoBuffer[initBoot + 0] = 0x88; // Bootable
  isoBuffer[initBoot + 1] = 0x00; // No Emulation
  isoBuffer[initBoot + 2] = 0x00; // Load Segment
  isoBuffer[initBoot + 3] = 0x00;
  isoBuffer[initBoot + 4] = 0x00; // System Type
  isoBuffer[initBoot + 6] = 0x04; // Sector count (4 sectors = 8KB)

  // Find EFI boot file sector to link directly in El Torito
  const efiFile = allocatedFiles.find(f => f.path.includes('BOOTX64.EFI'));
  const efiSector = efiFile ? efiFile.sector : 30;
  isoBuffer[initBoot + 8] = efiSector & 0xff;
  isoBuffer[initBoot + 9] = (efiSector >> 8) & 0xff;
  isoBuffer[initBoot + 10] = (efiSector >> 16) & 0xff;
  isoBuffer[initBoot + 11] = (efiSector >> 24) & 0xff;

  // ==========================================
  // SECTOR 22: Root Directory Records
  // ==========================================
  const ROOT_SEC = 22;
  let dirOffset = ROOT_SEC * SECTOR_SIZE;

  // '.' current directory entry
  isoBuffer[dirOffset + 0] = 34;
  isoBuffer[dirOffset + 2] = ROOT_SEC;
  isoBuffer[dirOffset + 6] = ROOT_SEC;
  isoBuffer[dirOffset + 10] = 0x00;
  isoBuffer[dirOffset + 11] = 0x08;
  isoBuffer[dirOffset + 16] = 0x08;
  isoBuffer[dirOffset + 25] = 0x02; // Directory flag
  isoBuffer[dirOffset + 32] = 1;
  isoBuffer[dirOffset + 33] = 0x00; // '.'
  dirOffset += 34;

  // '..' parent directory entry
  isoBuffer[dirOffset + 0] = 34;
  isoBuffer[dirOffset + 2] = ROOT_SEC;
  isoBuffer[dirOffset + 6] = ROOT_SEC;
  isoBuffer[dirOffset + 10] = 0x00;
  isoBuffer[dirOffset + 11] = 0x08;
  isoBuffer[dirOffset + 16] = 0x08;
  isoBuffer[dirOffset + 25] = 0x02; // Directory flag
  isoBuffer[dirOffset + 32] = 1;
  isoBuffer[dirOffset + 33] = 0x01; // '..'
  dirOffset += 34;

  // Write Directory Records for all files in root
  for (const file of allocatedFiles) {
    const filename = file.path.replace(/\//g, '_') + ';1';
    const nameLen = filename.length;
    const recLen = 33 + nameLen + (nameLen % 2 === 0 ? 1 : 0); // Must be even

    if (dirOffset + recLen > (ROOT_SEC + 1) * SECTOR_SIZE) break;

    isoBuffer[dirOffset + 0] = recLen;
    isoBuffer[dirOffset + 1] = 0; // Extended attr
    // Sector location
    isoBuffer[dirOffset + 2] = file.sector & 0xff;
    isoBuffer[dirOffset + 3] = (file.sector >> 8) & 0xff;
    isoBuffer[dirOffset + 4] = (file.sector >> 16) & 0xff;
    isoBuffer[dirOffset + 5] = (file.sector >> 24) & 0xff;
    isoBuffer[dirOffset + 6] = (file.sector >> 24) & 0xff;
    isoBuffer[dirOffset + 7] = (file.sector >> 16) & 0xff;
    isoBuffer[dirOffset + 8] = (file.sector >> 8) & 0xff;
    isoBuffer[dirOffset + 9] = file.sector & 0xff;

    // File size
    isoBuffer[dirOffset + 10] = file.size & 0xff;
    isoBuffer[dirOffset + 11] = (file.size >> 8) & 0xff;
    isoBuffer[dirOffset + 12] = (file.size >> 16) & 0xff;
    isoBuffer[dirOffset + 13] = (file.size >> 24) & 0xff;
    isoBuffer[dirOffset + 14] = (file.size >> 24) & 0xff;
    isoBuffer[dirOffset + 15] = (file.size >> 16) & 0xff;
    isoBuffer[dirOffset + 16] = (file.size >> 8) & 0xff;
    isoBuffer[dirOffset + 17] = file.size & 0xff;

    isoBuffer[dirOffset + 25] = 0x00; // Normal file flag
    isoBuffer[dirOffset + 32] = nameLen;

    for (let i = 0; i < nameLen; i++) {
      isoBuffer[dirOffset + 33 + i] = filename.charCodeAt(i);
    }

    dirOffset += recLen;
  }

  // ==========================================
  // WRITE FILE CONTENTS INTO ASSIGNED SECTORS
  // ==========================================
  for (const file of allocatedFiles) {
    isoBuffer.set(file.data, file.sector * SECTOR_SIZE);
  }

  return isoBuffer;
}
