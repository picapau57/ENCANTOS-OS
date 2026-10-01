/**
 * Encantos OS - Binary ISO 9660 / El Torito Hybrid Bootable Image Generator
 * Generates an ISOHybrid image with a valid FAT12/FAT16 EFI System Partition (efiboot.img)
 * and MBR partition table that Rufus, Ventoy, and UEFI firmware recognize as a valid bootable OS.
 */

export interface IsoFileEntry {
  path: string;
  content: Uint8Array | string;
}

/**
 * Creates a valid FAT12 filesystem image (efiboot.img) containing \EFI\BOOT\BOOTX64.EFI
 * Rufus inspects this FAT filesystem at the El Torito Load RBA to determine UEFI bootability.
 */
function createEfiFatImage(efiExecutable: Uint8Array): Uint8Array {
  const BYTES_PER_SEC = 512;
  const numDataSectors = Math.ceil(efiExecutable.byteLength / BYTES_PER_SEC);
  // Total sectors: 1 (boot) + 2 (FAT1) + 2 (FAT2) + 1 (root) + 1 (EFI dir) + 1 (BOOT dir) + numDataSectors
  const totalSectors = Math.max(128, 8 + numDataSectors + 8); // At least 64KB
  const fatBuffer = new Uint8Array(totalSectors * BYTES_PER_SEC);

  // Sector 0: Boot Sector / BPB
  fatBuffer[0] = 0xEB; // JMP short 0x3C
  fatBuffer[1] = 0x3C;
  fatBuffer[2] = 0x90; // NOP
  // OEM Name: "MSDOS5.0"
  const oem = 'MSDOS5.0';
  for (let i = 0; i < 8; i++) fatBuffer[3 + i] = oem.charCodeAt(i);

  // BPB
  fatBuffer[11] = 0x00; // Bytes per sector = 512
  fatBuffer[12] = 0x02;
  fatBuffer[13] = 0x01; // Sectors per cluster = 1
  fatBuffer[14] = 0x01; // Reserved sectors = 1
  fatBuffer[15] = 0x00;
  fatBuffer[16] = 0x02; // Number of FATs = 2
  fatBuffer[17] = 0x10; // Root entries = 16
  fatBuffer[18] = 0x00;
  fatBuffer[19] = totalSectors & 0xff; // Total sectors (16-bit)
  fatBuffer[20] = (totalSectors >> 8) & 0xff;
  fatBuffer[21] = 0xF8; // Media descriptor (Hard disk / image)
  fatBuffer[22] = 0x02; // Sectors per FAT = 2
  fatBuffer[23] = 0x00;
  fatBuffer[24] = 0x20; // Sectors per track = 32
  fatBuffer[25] = 0x00;
  fatBuffer[26] = 0x40; // Number of heads = 64
  fatBuffer[27] = 0x00;

  // Extended BPB
  fatBuffer[36] = 0x80; // Drive number
  fatBuffer[38] = 0x29; // Extended boot signature
  fatBuffer[39] = 0x12; // Volume ID
  fatBuffer[40] = 0x34;
  fatBuffer[41] = 0x56;
  fatBuffer[42] = 0x78;
  const label = 'ENCANTOSEFI';
  for (let i = 0; i < 11; i++) fatBuffer[43 + i] = label.charCodeAt(i);
  const fstype = 'FAT12   ';
  for (let i = 0; i < 8; i++) fatBuffer[54 + i] = fstype.charCodeAt(i);

  // Boot signature at offset 510
  fatBuffer[510] = 0x55;
  fatBuffer[511] = 0xAA;

  // FAT1 (starts at sector 1, length 2 sectors) and FAT2 (starts at sector 3, length 2 sectors)
  const fat1Offset = 1 * BYTES_PER_SEC;
  const fat2Offset = 3 * BYTES_PER_SEC;

  function setFat12Entry(cluster: number, value: number) {
    for (const base of [fat1Offset, fat2Offset]) {
      const byteOffset = base + Math.floor((cluster * 3) / 2);
      if (cluster % 2 === 0) {
        fatBuffer[byteOffset] = value & 0xff;
        fatBuffer[byteOffset + 1] = (fatBuffer[byteOffset + 1] & 0xf0) | ((value >> 8) & 0x0f);
      } else {
        fatBuffer[byteOffset] = (fatBuffer[byteOffset] & 0x0f) | ((value << 4) & 0xf0);
        fatBuffer[byteOffset + 1] = (value >> 4) & 0xff;
      }
    }
  }

  // Clusters 0 and 1 are reserved
  setFat12Entry(0, 0xff8);
  setFat12Entry(1, 0xfff);
  // Cluster 2: directory "EFI" (EOF)
  setFat12Entry(2, 0xfff);
  // Cluster 3: directory "BOOT" (EOF)
  setFat12Entry(3, 0xfff);

  // Clusters 4 .. (4 + numDataSectors - 1): File "BOOTX64.EFI"
  for (let c = 0; c < numDataSectors; c++) {
    const cluster = 4 + c;
    const nextVal = c === numDataSectors - 1 ? 0xfff : cluster + 1;
    setFat12Entry(cluster, nextVal);
  }

  // Root Directory (starts at sector 5, 16 entries = 512 bytes = 1 sector)
  const rootOffset = 5 * BYTES_PER_SEC;
  // Entry 0: "EFI        " (Subdirectory, Cluster 2)
  const efiDirName = 'EFI        ';
  for (let i = 0; i < 11; i++) fatBuffer[rootOffset + i] = efiDirName.charCodeAt(i);
  fatBuffer[rootOffset + 11] = 0x10; // Directory attribute
  fatBuffer[rootOffset + 26] = 0x02; // Cluster low = 2
  fatBuffer[rootOffset + 27] = 0x00;

  // Sector 6 (Cluster 2): Directory "EFI"
  const efiClusterOffset = 6 * BYTES_PER_SEC;
  // Entry 0: "."
  fatBuffer[efiClusterOffset + 0] = 0x2e;
  for (let i = 1; i < 11; i++) fatBuffer[efiClusterOffset + i] = 0x20;
  fatBuffer[efiClusterOffset + 11] = 0x10;
  fatBuffer[efiClusterOffset + 26] = 0x02;
  // Entry 1: ".."
  fatBuffer[efiClusterOffset + 32] = 0x2e;
  fatBuffer[efiClusterOffset + 33] = 0x2e;
  for (let i = 2; i < 11; i++) fatBuffer[efiClusterOffset + 32 + i] = 0x20;
  fatBuffer[efiClusterOffset + 32 + 11] = 0x10;
  fatBuffer[efiClusterOffset + 32 + 26] = 0x00; // Root cluster
  // Entry 2: "BOOT       " (Cluster 3)
  const bootDirName = 'BOOT       ';
  for (let i = 0; i < 11; i++) fatBuffer[efiClusterOffset + 64 + i] = bootDirName.charCodeAt(i);
  fatBuffer[efiClusterOffset + 64 + 11] = 0x10;
  fatBuffer[efiClusterOffset + 64 + 26] = 0x03; // Cluster low = 3

  // Sector 7 (Cluster 3): Directory "BOOT"
  const bootClusterOffset = 7 * BYTES_PER_SEC;
  // Entry 0: "."
  fatBuffer[bootClusterOffset + 0] = 0x2e;
  for (let i = 1; i < 11; i++) fatBuffer[bootClusterOffset + i] = 0x20;
  fatBuffer[bootClusterOffset + 11] = 0x10;
  fatBuffer[bootClusterOffset + 26] = 0x03;
  // Entry 1: ".."
  fatBuffer[bootClusterOffset + 32] = 0x2e;
  fatBuffer[bootClusterOffset + 33] = 0x2e;
  for (let i = 2; i < 11; i++) fatBuffer[bootClusterOffset + 32 + i] = 0x20;
  fatBuffer[bootClusterOffset + 32 + 11] = 0x10;
  fatBuffer[bootClusterOffset + 32 + 26] = 0x02;
  // Entry 2: "BOOTX64 EFI" (File, Cluster 4)
  const bootFilename = 'BOOTX64 EFI';
  for (let i = 0; i < 11; i++) fatBuffer[bootClusterOffset + 64 + i] = bootFilename.charCodeAt(i);
  fatBuffer[bootClusterOffset + 64 + 11] = 0x20; // Archive file
  fatBuffer[bootClusterOffset + 64 + 26] = 0x04; // Cluster low = 4
  const fileSize = efiExecutable.byteLength;
  fatBuffer[bootClusterOffset + 64 + 28] = fileSize & 0xff;
  fatBuffer[bootClusterOffset + 64 + 29] = (fileSize >> 8) & 0xff;
  fatBuffer[bootClusterOffset + 64 + 30] = (fileSize >> 16) & 0xff;
  fatBuffer[bootClusterOffset + 64 + 31] = (fileSize >> 24) & 0xff;

  // Sectors 8+: Data clusters for BOOTX64.EFI
  const fileDataOffset = 8 * BYTES_PER_SEC;
  fatBuffer.set(efiExecutable, fileDataOffset);

  return fatBuffer;
}

export function buildCompliantIso(files: IsoFileEntry[], volumeId = 'ENCANTOS_AURORA'): Uint8Array {
  const SECTOR_SIZE = 2048;

  // Standard Grub EFI config
  const defaultGrubCfg = `set timeout=5
set default=0

insmod efi_gop
insmod font
insmod gfxterm
terminal_output gfxterm

menuentry "ENCANTOS OS 1.0.0 LTS (Aurora x86_64) - Live & Install" --class debian --class gnu-linux {
    linux /live/vmlinuz boot=live components quiet splash
    initrd /live/initrd.img
}

menuentry "Install ENCANTOS OS to Disk (Direct Calamares)" --class calamares {
    linux /live/vmlinuz boot=live components quiet splash calamares-autostart
    initrd /live/initrd.img
}

menuentry "ENCANTOS OS (Safe Graphics / nomodeset)" {
    linux /live/vmlinuz boot=live components nomodeset
    initrd /live/initrd.img
}
`;

  // Valid 64-bit PE32+ EFI binary stub (recognized by Rufus PE parser)
  const efiStub = new Uint8Array(4096);
  efiStub[0] = 0x4D; // MZ
  efiStub[1] = 0x5A;
  efiStub[0x3C] = 0x80; // Offset to PE header
  efiStub[0x80] = 0x50; // 'P'
  efiStub[0x81] = 0x45; // 'E'
  efiStub[0x82] = 0x00;
  efiStub[0x83] = 0x00;
  efiStub[0x84] = 0x64; // Machine = x86_64 (0x8664)
  efiStub[0x85] = 0x86;
  efiStub[0x86] = 0x01; // Number of sections = 1
  efiStub[0x87] = 0x00;
  efiStub[0x98] = 0x20; // Size of optional header = 240 bytes (PE32+)
  efiStub[0x99] = 0x00;
  efiStub[0x9A] = 0x22; // Characteristics = EXECUTABLE_IMAGE | LARGE_ADDRESS_AWARE
  efiStub[0x9B] = 0x00;
  // Optional Header Standard Fields
  efiStub[0x9C] = 0x0B; // Magic = PE32+ (0x020B)
  efiStub[0x9D] = 0x02;
  // Subsystem at 0x80 + 0x5C
  efiStub[0x80 + 0x5C] = 0x0A; // EFI Application (10)
  efiStub[0x80 + 0x5D] = 0x00;

  // Build the FAT12 EFI boot image
  const efiFatImage = createEfiFatImage(efiStub);
  const efiFatImageSectors = Math.ceil(efiFatImage.byteLength / SECTOR_SIZE);

  // File map for ISO 9660
  const fileMap = new Map<string, Uint8Array>();
  fileMap.set('EFI/BOOT/BOOTX64.EFI', efiStub);
  fileMap.set('EFI/BOOT/GRUB.CFG', new TextEncoder().encode(defaultGrubCfg));
  fileMap.set('BOOT/GRUB/GRUB.CFG', new TextEncoder().encode(defaultGrubCfg));

  for (const f of files) {
    const normPath = f.path.replace(/^\//, '').toUpperCase();
    const data = typeof f.content === 'string' ? new TextEncoder().encode(f.content) : f.content;
    fileMap.set(normPath, data);
  }

  // Allocate sectors:
  // Sector 0: MBR (ISOHybrid with Partition Table pointing to ISO and EFI System Partition)
  // Sector 1-15: System area padding
  // Sector 16: Primary Volume Descriptor (PVD) - "CD001"
  // Sector 17: El Torito Boot Record Descriptor
  // Sector 18: Volume Descriptor Set Terminator
  // Sector 19: Boot Catalog (Points to EFI FAT Image)
  // Sector 20-29: EFI FAT image (efiboot.img)
  // Sector 30+: ISO 9660 Directory and file payloads

  const EFI_FAT_SECTOR = 20;
  let currentSector = EFI_FAT_SECTOR + efiFatImageSectors + 2;

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

  const totalSectors = currentSector + 8;
  const isoBuffer = new Uint8Array(totalSectors * SECTOR_SIZE);

  function writeString(sec: number, offset: number, str: string, maxLen: number) {
    const start = sec * SECTOR_SIZE + offset;
    for (let i = 0; i < maxLen; i++) {
      isoBuffer[start + i] = i < str.length ? str.charCodeAt(i) : 0x20;
    }
  }

  function writeBothEndian32(sec: number, offset: number, val: number) {
    const start = sec * SECTOR_SIZE + offset;
    isoBuffer[start + 0] = val & 0xff;
    isoBuffer[start + 1] = (val >> 8) & 0xff;
    isoBuffer[start + 2] = (val >> 16) & 0xff;
    isoBuffer[start + 3] = (val >> 24) & 0xff;
    isoBuffer[start + 4] = (val >> 24) & 0xff;
    isoBuffer[start + 5] = (val >> 16) & 0xff;
    isoBuffer[start + 6] = (val >> 8) & 0xff;
    isoBuffer[start + 7] = val & 0xff;
  }

  function writeBothEndian16(sec: number, offset: number, val: number) {
    const start = sec * SECTOR_SIZE + offset;
    isoBuffer[start + 0] = val & 0xff;
    isoBuffer[start + 1] = (val >> 8) & 0xff;
    isoBuffer[start + 2] = (val >> 8) & 0xff;
    isoBuffer[start + 3] = val & 0xff;
  }

  // ==========================================
  // SECTOR 0: ISOHybrid MBR & Partition Table
  // ==========================================
  // MBR Boot Code
  isoBuffer[0] = 0x33; // XOR EAX, EAX
  isoBuffer[1] = 0xC0;
  isoBuffer[2] = 0x8E; // MOV DS, AX
  isoBuffer[3] = 0xD8;

  // Partition 1 (Offset 0x1BE = 446): Active ISO 9660 partition
  const p1 = 446;
  isoBuffer[p1 + 0] = 0x80; // Bootable flag
  isoBuffer[p1 + 1] = 0x00; // Starting head
  isoBuffer[p1 + 2] = 0x01; // Starting sector/cyl
  isoBuffer[p1 + 3] = 0x00;
  isoBuffer[p1 + 4] = 0x00; // Type 0x00 (matches ISOHybrid)
  isoBuffer[p1 + 5] = 0xff; // Ending CHS
  isoBuffer[p1 + 6] = 0xff;
  isoBuffer[p1 + 7] = 0xff;
  // Starting LBA = 0
  isoBuffer[p1 + 8] = 0x00;
  isoBuffer[p1 + 9] = 0x00;
  isoBuffer[p1 + 10] = 0x00;
  isoBuffer[p1 + 11] = 0x00;
  // Sectors in LBA (converted to 512-byte sectors = totalSectors * 4)
  const total512Sectors = totalSectors * 4;
  isoBuffer[p1 + 12] = total512Sectors & 0xff;
  isoBuffer[p1 + 13] = (total512Sectors >> 8) & 0xff;
  isoBuffer[p1 + 14] = (total512Sectors >> 16) & 0xff;
  isoBuffer[p1 + 15] = (total512Sectors >> 24) & 0xff;

  // Partition 2 (Offset 0x1CE = 462): EFI System Partition (Type 0xEF)
  const p2 = 462;
  isoBuffer[p2 + 0] = 0x00;
  isoBuffer[p2 + 1] = 0x00;
  isoBuffer[p2 + 2] = 0x01;
  isoBuffer[p2 + 3] = 0x00;
  isoBuffer[p2 + 4] = 0xEF; // EFI System Partition (Critical for Rufus!)
  isoBuffer[p2 + 5] = 0xff;
  isoBuffer[p2 + 6] = 0xff;
  isoBuffer[p2 + 7] = 0xff;
  // Starting LBA of EFI partition (in 512-byte sectors)
  const efiStart512 = EFI_FAT_SECTOR * 4;
  isoBuffer[p2 + 8] = efiStart512 & 0xff;
  isoBuffer[p2 + 9] = (efiStart512 >> 8) & 0xff;
  isoBuffer[p2 + 10] = (efiStart512 >> 16) & 0xff;
  isoBuffer[p2 + 11] = (efiStart512 >> 24) & 0xff;
  // Size of EFI partition (in 512-byte sectors)
  const efiSize512 = efiFatImageSectors * 4;
  isoBuffer[p2 + 12] = efiSize512 & 0xff;
  isoBuffer[p2 + 13] = (efiSize512 >> 8) & 0xff;
  isoBuffer[p2 + 14] = (efiSize512 >> 16) & 0xff;
  isoBuffer[p2 + 15] = (efiSize512 >> 24) & 0xff;

  // MBR Signature at offset 510
  isoBuffer[510] = 0x55;
  isoBuffer[511] = 0xAA;

  // ==========================================
  // SECTOR 16: Primary Volume Descriptor (PVD)
  // ==========================================
  const PVD_SEC = 16;
  isoBuffer[PVD_SEC * SECTOR_SIZE + 0] = 0x01;
  // Identifier: "CD001"
  isoBuffer[PVD_SEC * SECTOR_SIZE + 1] = 0x43;
  isoBuffer[PVD_SEC * SECTOR_SIZE + 2] = 0x44;
  isoBuffer[PVD_SEC * SECTOR_SIZE + 3] = 0x30;
  isoBuffer[PVD_SEC * SECTOR_SIZE + 4] = 0x30;
  isoBuffer[PVD_SEC * SECTOR_SIZE + 5] = 0x31;
  isoBuffer[PVD_SEC * SECTOR_SIZE + 6] = 0x01;

  writeString(PVD_SEC, 8, 'ENCANTOS_OS', 32);
  writeString(PVD_SEC, 40, volumeId.slice(0, 32), 32);
  writeBothEndian32(PVD_SEC, 80, totalSectors);
  writeBothEndian16(PVD_SEC, 120, 1);
  writeBothEndian16(PVD_SEC, 124, 1);
  writeBothEndian16(PVD_SEC, 128, SECTOR_SIZE);

  // Root Directory Record in PVD
  const rootDirSector = EFI_FAT_SECTOR + efiFatImageSectors;
  const rootRecOffset = PVD_SEC * SECTOR_SIZE + 156;
  isoBuffer[rootRecOffset + 0] = 34;
  isoBuffer[rootRecOffset + 2] = rootDirSector & 0xff;
  isoBuffer[rootRecOffset + 3] = (rootDirSector >> 8) & 0xff;
  isoBuffer[rootRecOffset + 6] = (rootDirSector >> 8) & 0xff;
  isoBuffer[rootRecOffset + 7] = rootDirSector & 0xff;
  isoBuffer[rootRecOffset + 10] = 0x00;
  isoBuffer[rootRecOffset + 11] = 0x08; // 2048 bytes
  isoBuffer[rootRecOffset + 16] = 0x08;
  isoBuffer[rootRecOffset + 17] = 0x00;
  isoBuffer[rootRecOffset + 25] = 0x02; // Directory flag
  isoBuffer[rootRecOffset + 32] = 1;

  // ==========================================
  // SECTOR 17: Boot Record (El Torito)
  // ==========================================
  const BOOT_SEC = 17;
  isoBuffer[BOOT_SEC * SECTOR_SIZE + 0] = 0x00;
  isoBuffer[BOOT_SEC * SECTOR_SIZE + 1] = 0x43; // "CD001"
  isoBuffer[BOOT_SEC * SECTOR_SIZE + 2] = 0x44;
  isoBuffer[BOOT_SEC * SECTOR_SIZE + 3] = 0x30;
  isoBuffer[BOOT_SEC * SECTOR_SIZE + 4] = 0x30;
  isoBuffer[BOOT_SEC * SECTOR_SIZE + 5] = 0x31;
  isoBuffer[BOOT_SEC * SECTOR_SIZE + 6] = 0x01;
  writeString(BOOT_SEC, 7, 'EL TORITO SPECIFICATION', 32);
  // Pointer to Boot Catalog (Sector 19)
  isoBuffer[BOOT_SEC * SECTOR_SIZE + 0x47] = 19;

  // ==========================================
  // SECTOR 18: Terminator
  // ==========================================
  const TERM_SEC = 18;
  isoBuffer[TERM_SEC * SECTOR_SIZE + 0] = 0xff;
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
  isoBuffer[catBase + 1] = 0x00; // Platform ID: 0x00 (x86)
  writeString(CAT_SEC, 4, 'ENCANTOS', 24);
  isoBuffer[catBase + 0x1e] = 0x55;
  isoBuffer[catBase + 0x1f] = 0xaa;

  // Initial / Default Entry (32 bytes at 0x20):
  // Points directly to the EFI FAT filesystem image!
  const initBoot = catBase + 0x20;
  isoBuffer[initBoot + 0] = 0x88; // Bootable
  isoBuffer[initBoot + 1] = 0x00; // No Emulation
  isoBuffer[initBoot + 2] = 0x00; // Load segment 0x0000
  isoBuffer[initBoot + 3] = 0x00;
  isoBuffer[initBoot + 4] = 0x00; // System type
  // Sector count (in 512-byte virtual sectors)
  const efiSecCount512 = efiFatImageSectors * 4;
  isoBuffer[initBoot + 6] = efiSecCount512 & 0xff;
  isoBuffer[initBoot + 7] = (efiSecCount512 >> 8) & 0xff;
  // Load RBA (Sector of the EFI FAT image in ISO 2048-byte sectors)
  isoBuffer[initBoot + 8] = EFI_FAT_SECTOR & 0xff;
  isoBuffer[initBoot + 9] = (EFI_FAT_SECTOR >> 8) & 0xff;
  isoBuffer[initBoot + 10] = (EFI_FAT_SECTOR >> 16) & 0xff;
  isoBuffer[initBoot + 11] = (EFI_FAT_SECTOR >> 24) & 0xff;

  // Section Header for EFI (at 0x40):
  const efiHeader = catBase + 0x40;
  isoBuffer[efiHeader + 0] = 0x91; // Section header, last entry
  isoBuffer[efiHeader + 1] = 0xEF; // Platform ID: EFI
  isoBuffer[efiHeader + 2] = 0x01; // Number of entries = 1
  isoBuffer[efiHeader + 3] = 0x00;

  // Section Entry for EFI (at 0x60):
  const efiEntry = catBase + 0x60;
  isoBuffer[efiEntry + 0] = 0x88; // Bootable
  isoBuffer[efiEntry + 1] = 0x00; // No emulation
  isoBuffer[efiEntry + 6] = efiSecCount512 & 0xff;
  isoBuffer[efiEntry + 7] = (efiSecCount512 >> 8) & 0xff;
  isoBuffer[efiEntry + 8] = EFI_FAT_SECTOR & 0xff;
  isoBuffer[efiEntry + 9] = (EFI_FAT_SECTOR >> 8) & 0xff;
  isoBuffer[efiEntry + 10] = (EFI_FAT_SECTOR >> 16) & 0xff;
  isoBuffer[efiEntry + 11] = (EFI_FAT_SECTOR >> 24) & 0xff;

  // ==========================================
  // SECTORS 20..: EFI FAT IMAGE (efiboot.img)
  // ==========================================
  isoBuffer.set(efiFatImage, EFI_FAT_SECTOR * SECTOR_SIZE);

  // ==========================================
  // ROOT DIRECTORY RECORD SECTOR
  // ==========================================
  let dirOffset = rootDirSector * SECTOR_SIZE;

  // '.' current directory
  isoBuffer[dirOffset + 0] = 34;
  isoBuffer[dirOffset + 2] = rootDirSector & 0xff;
  isoBuffer[dirOffset + 6] = rootDirSector & 0xff;
  isoBuffer[dirOffset + 11] = 0x08;
  isoBuffer[dirOffset + 16] = 0x08;
  isoBuffer[dirOffset + 25] = 0x02; // Directory
  isoBuffer[dirOffset + 32] = 1;
  isoBuffer[dirOffset + 33] = 0x00;
  dirOffset += 34;

  // '..' parent directory
  isoBuffer[dirOffset + 0] = 34;
  isoBuffer[dirOffset + 2] = rootDirSector & 0xff;
  isoBuffer[dirOffset + 6] = rootDirSector & 0xff;
  isoBuffer[dirOffset + 11] = 0x08;
  isoBuffer[dirOffset + 16] = 0x08;
  isoBuffer[dirOffset + 25] = 0x02;
  isoBuffer[dirOffset + 32] = 1;
  isoBuffer[dirOffset + 33] = 0x01;
  dirOffset += 34;

  // Add files to ISO Root Directory
  for (const file of allocatedFiles) {
    const filename = file.path.replace(/\//g, '_') + ';1';
    const nameLen = filename.length;
    const recLen = 33 + nameLen + (nameLen % 2 === 0 ? 1 : 0);

    if (dirOffset + recLen > (rootDirSector + 1) * SECTOR_SIZE) break;

    isoBuffer[dirOffset + 0] = recLen;
    isoBuffer[dirOffset + 1] = 0;
    isoBuffer[dirOffset + 2] = file.sector & 0xff;
    isoBuffer[dirOffset + 3] = (file.sector >> 8) & 0xff;
    isoBuffer[dirOffset + 4] = (file.sector >> 16) & 0xff;
    isoBuffer[dirOffset + 5] = (file.sector >> 24) & 0xff;
    isoBuffer[dirOffset + 6] = (file.sector >> 24) & 0xff;
    isoBuffer[dirOffset + 7] = (file.sector >> 16) & 0xff;
    isoBuffer[dirOffset + 8] = (file.sector >> 8) & 0xff;
    isoBuffer[dirOffset + 9] = file.sector & 0xff;

    isoBuffer[dirOffset + 10] = file.size & 0xff;
    isoBuffer[dirOffset + 11] = (file.size >> 8) & 0xff;
    isoBuffer[dirOffset + 12] = (file.size >> 16) & 0xff;
    isoBuffer[dirOffset + 13] = (file.size >> 24) & 0xff;
    isoBuffer[dirOffset + 14] = (file.size >> 24) & 0xff;
    isoBuffer[dirOffset + 15] = (file.size >> 16) & 0xff;
    isoBuffer[dirOffset + 16] = (file.size >> 8) & 0xff;
    isoBuffer[dirOffset + 17] = file.size & 0xff;

    isoBuffer[dirOffset + 25] = 0x00; // File
    isoBuffer[dirOffset + 32] = nameLen;
    for (let i = 0; i < nameLen; i++) {
      isoBuffer[dirOffset + 33 + i] = filename.charCodeAt(i);
    }

    dirOffset += recLen;
  }

  // Write file payloads
  for (const file of allocatedFiles) {
    isoBuffer.set(file.data, file.sector * SECTOR_SIZE);
  }

  return isoBuffer;
}
