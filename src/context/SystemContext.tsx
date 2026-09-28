import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { WindowId, WindowState, FsItem, StoreApp, SystemSettings, ProcessItem, SystemNotification, AccentColor, BatteryState, SystemMetrics } from '../types';

import auroraWallpaper from '../assets/images/wallpaper_aurora_magic_1790397248671.jpg';
import daylightWallpaper from '../assets/images/wallpaper_daylight_flow_1790397265019.jpg';
import darkCrystalWallpaper from '../assets/images/wallpaper_dark_crystal_1790397275587.jpg';
import encantosLogo from '../assets/images/encantos_os_logo_1790397284449.jpg';

export const WALLPAPERS = [
  { id: 'aurora', name: 'Aurora Magic (Default)', url: auroraWallpaper, category: 'Luminous' },
  { id: 'daylight', name: 'Dawn Ribbon Flow', url: daylightWallpaper, category: 'Minimalist' },
  { id: 'crystal', name: 'Obsidian Prism', url: darkCrystalWallpaper, category: 'Dark' },
  { id: 'deep-space', name: 'Cosmic Indigo Gradient', url: 'linear-gradient(135deg, #090d16 0%, #171938 50%, #0d2b45 100%)', isGradient: true, category: 'Clean' },
  { id: 'emerald-aurora', name: 'Northern Emerald', url: 'linear-gradient(135deg, #021b1a 0%, #064e3b 50%, #042f2e 100%)', isGradient: true, category: 'Clean' }
];

export const ACCENT_COLORS: AccentColor[] = [
  { id: 'violet', name: 'Mystic Violet', hex: '#8b5cf6', tailwindClass: 'bg-violet-600', glowClass: 'shadow-violet-500/30' },
  { id: 'cyan', name: 'Celestial Cyan', hex: '#06b6d4', tailwindClass: 'bg-cyan-500', glowClass: 'shadow-cyan-500/30' },
  { id: 'emerald', name: 'Verdant Green', hex: '#10b981', tailwindClass: 'bg-emerald-500', glowClass: 'shadow-emerald-500/30' },
  { id: 'amber', name: 'Solar Amber', hex: '#f59e0b', tailwindClass: 'bg-amber-500', glowClass: 'shadow-amber-500/30' },
  { id: 'rose', name: 'Rose Radiance', hex: '#f43f5e', tailwindClass: 'bg-rose-500', glowClass: 'shadow-rose-500/30' },
];

const INITIAL_WINDOWS: Record<WindowId, WindowState> = {
  'files': {
    id: 'files',
    title: 'Encantos Files',
    iconName: 'Folder',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 120, y: 70 },
    size: { width: 880, height: 560 }
  },
  'store': {
    id: 'store',
    title: 'Encantos Store',
    iconName: 'ShoppingBag',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 11,
    position: { x: 160, y: 90 },
    size: { width: 940, height: 600 }
  },
  'settings': {
    id: 'settings',
    title: 'Encantos Settings',
    iconName: 'Settings',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 12,
    position: { x: 200, y: 80 },
    size: { width: 860, height: 570 }
  },
  'terminal': {
    id: 'terminal',
    title: 'Encantos Terminal',
    iconName: 'Terminal',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 13,
    position: { x: 180, y: 110 },
    size: { width: 780, height: 480 }
  },
  'system-monitor': {
    id: 'system-monitor',
    title: 'Encantos System Monitor',
    iconName: 'Activity',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 14,
    position: { x: 220, y: 100 },
    size: { width: 820, height: 540 }
  },
  'disk-utility': {
    id: 'disk-utility',
    title: 'Encantos Disk Utility',
    iconName: 'HardDrive',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 15,
    position: { x: 240, y: 120 },
    size: { width: 840, height: 530 }
  },
  'installer': {
    id: 'installer',
    title: 'Install ENCANTOS OS (Calamares)',
    iconName: 'Disc',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 16,
    position: { x: 210, y: 60 },
    size: { width: 920, height: 600 }
  },
  'update-center': {
    id: 'update-center',
    title: 'Encantos Update Center',
    iconName: 'RefreshCw',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 17,
    position: { x: 260, y: 130 },
    size: { width: 760, height: 510 }
  },
  'backup': {
    id: 'backup',
    title: 'Encantos Backup',
    iconName: 'Shield',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 18,
    position: { x: 280, y: 140 },
    size: { width: 780, height: 520 }
  },
  'pad': {
    id: 'pad',
    title: 'Encantos Pad',
    iconName: 'FileText',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 19,
    position: { x: 250, y: 100 },
    size: { width: 720, height: 490 }
  },
  'calculator': {
    id: 'calculator',
    title: 'Calculator',
    iconName: 'Calculator',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 20,
    position: { x: 340, y: 120 },
    size: { width: 360, height: 510 }
  },
  'image-viewer': {
    id: 'image-viewer',
    title: 'Encantos Photos',
    iconName: 'Image',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 21,
    position: { x: 230, y: 90 },
    size: { width: 800, height: 540 }
  },
  'iso-studio': {
    id: 'iso-studio',
    title: 'Encantos OS ISO Lab & Source Explorer',
    iconName: 'Cpu',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 22,
    position: { x: 190, y: 80 },
    size: { width: 900, height: 580 }
  },
  'iso-generator': {
    id: 'iso-generator',
    title: 'Encantos ISO Generator Wizard',
    iconName: 'Disc3',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 23,
    position: { x: 170, y: 50 },
    size: { width: 940, height: 630 }
  }
};

const INITIAL_FS: FsItem[] = [
  // Core directories
  { id: 'root', name: '/', type: 'folder', parentId: null, path: '/', modified: '2026-09-25 10:00', isProtected: true },
  { id: 'home', name: 'home', type: 'folder', parentId: 'root', path: '/home', modified: '2026-09-25 10:00', isProtected: true },
  { id: 'user', name: 'encantos', type: 'folder', parentId: 'home', path: '/home/encantos', modified: '2026-09-25 10:00' },
  
  // User directories
  { id: 'desktop', name: 'Desktop', type: 'folder', parentId: 'user', path: '/home/encantos/Desktop', modified: '2026-09-25 10:05' },
  { id: 'documents', name: 'Documents', type: 'folder', parentId: 'user', path: '/home/encantos/Documents', modified: '2026-09-25 10:05' },
  { id: 'downloads', name: 'Downloads', type: 'folder', parentId: 'user', path: '/home/encantos/Downloads', modified: '2026-09-25 10:05' },
  { id: 'pictures', name: 'Pictures', type: 'folder', parentId: 'user', path: '/home/encantos/Pictures', modified: '2026-09-25 10:05' },
  { id: 'music', name: 'Music', type: 'folder', parentId: 'user', path: '/home/encantos/Music', modified: '2026-09-25 10:05' },
  { id: 'videos', name: 'Videos', type: 'folder', parentId: 'user', path: '/home/encantos/Videos', modified: '2026-09-25 10:05' },
  { id: 'trash', name: 'Trash', type: 'folder', parentId: 'user', path: '/home/encantos/.local/share/Trash', modified: '2026-09-25 10:05' },

  // Nested Subdirectories for Directory Tree
  { id: 'projects', name: 'Projects', type: 'folder', parentId: 'documents', path: '/home/encantos/Documents/Projects', modified: '2026-09-25 11:00' },
  { id: 'specs', name: 'Specifications', type: 'folder', parentId: 'documents', path: '/home/encantos/Documents/Specifications', modified: '2026-09-25 11:15' },
  { id: 'wallpapers', name: 'Wallpapers', type: 'folder', parentId: 'pictures', path: '/home/encantos/Pictures/Wallpapers', modified: '2026-09-25 10:30' },
  { id: 'screenshots', name: 'Screenshots', type: 'folder', parentId: 'pictures', path: '/home/encantos/Pictures/Screenshots', modified: '2026-09-25 10:35' },
  { id: 'scripts', name: 'Scripts', type: 'folder', parentId: 'desktop', path: '/home/encantos/Desktop/Scripts', modified: '2026-09-25 11:45' },

  // System Root Directories
  { id: 'etc', name: 'etc', type: 'folder', parentId: 'root', path: '/etc', modified: '2026-09-25 09:30', isProtected: true },
  { id: 'var', name: 'var', type: 'folder', parentId: 'root', path: '/var', modified: '2026-09-25 09:30', isProtected: true },
  { id: 'usr', name: 'usr', type: 'folder', parentId: 'root', path: '/usr', modified: '2026-09-25 09:30', isProtected: true },
  { id: 'var-log', name: 'log', type: 'folder', parentId: 'var', path: '/var/log', modified: '2026-09-25 09:30', isProtected: true },

  // User files
  { 
    id: 'f-welcome', 
    name: 'Welcome-To-Encantos.txt', 
    type: 'file', 
    parentId: 'desktop', 
    path: '/home/encantos/Desktop/Welcome-To-Encantos.txt', 
    size: '1.4 KB', 
    modified: '2026-09-25 10:15',
    content: `Welcome to ENCANTOS OS 1.0.0 "Aurora"!

Encantos OS is a complete Linux distribution engineered for beauty, speed, and uncompromising reliability.

Key Features:
- Custom Encantos Desktop Shell with GPU-accelerated composition
- Sandboxed Flatpak & Native APT dual package manager
- Low-latency PipeWire Pro-Audio pipeline
- Universal Calamares system installer
- Out-of-the-box support for modern UEFI hardware

To install Encantos OS permanently to your disk, launch the "Install ENCANTOS OS" icon on the desktop.`
  },
  { 
    id: 'f-arch', 
    name: 'Encantos-Architecture.md', 
    type: 'file', 
    parentId: 'documents', 
    path: '/home/encantos/Documents/Encantos-Architecture.md', 
    size: '3.8 KB', 
    modified: '2026-09-25 11:20',
    content: `# Encantos OS Architecture Overview
Base: Debian 13 "Trixie" / Ubuntu 24.04 LTS Noble Core
Kernel: 6.8.0-encantos-amd64
Init: systemd 256.4
Display: Wayland with XWayland compatibility
Audio: PipeWire 1.0.7
Installer: Calamares 3.3.6 Custom Branding
`
  },
  { 
    id: 'f-encantos-iso-desktop', 
    name: 'ENCANTOS-OS-1.0.0-Aurora-amd64.iso', 
    type: 'file', 
    parentId: 'desktop', 
    path: '/home/encantos/Desktop/ENCANTOS-OS-1.0.0-Aurora-amd64.iso', 
    size: '2.4 GB', 
    modified: '2026-09-28 12:00',
    content: `ENCANTOS-OS-BOOTABLE-HYBRID-ISO-IMAGE
DISTRIBUTION: ENCANTOS OS 1.0.0-LTS "Aurora"
ARCH: x86_64 (amd64)
KERNEL: Linux 6.8.0-encantos-generic
BOOTLOADER: GRUB 2.12 UEFI (ESP) + El Torito BIOS MBR Hybrid
SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
INSTALLER: Calamares 3.3.6
READY FOR USB FLASHING (RUFUS / VENTOY / BALENA ETCHER)
`
  },
  { 
    id: 'f-encantos-iso-downloads', 
    name: 'ENCANTOS-OS-1.0.0-Aurora-amd64.iso', 
    type: 'file', 
    parentId: 'downloads', 
    path: '/home/encantos/Downloads/ENCANTOS-OS-1.0.0-Aurora-amd64.iso', 
    size: '2.4 GB', 
    modified: '2026-09-28 12:00',
    content: `ENCANTOS-OS-BOOTABLE-HYBRID-ISO-IMAGE
DISTRIBUTION: ENCANTOS OS 1.0.0-LTS "Aurora"
ARCH: x86_64 (amd64)
KERNEL: Linux 6.8.0-encantos-generic
SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
`
  },
  { 
    id: 'f-build-script', 
    name: 'build-encantos.sh', 
    type: 'file', 
    parentId: 'desktop', 
    path: '/home/encantos/Desktop/build-encantos.sh', 
    size: '5.2 KB', 
    modified: '2026-09-25 12:00',
    content: `#!/usr/bin/env bash\n# ENCANTOS OS Automated ISO Generator\n# Run with: ./build-encantos.sh\necho "Building ENCANTOS-OS-1.0.0-amd64.iso..."\n`
  },
  {
    id: 'f-project-manifest',
    name: 'app-manifest.json',
    type: 'file',
    parentId: 'projects',
    path: '/home/encantos/Documents/Projects/app-manifest.json',
    size: '2.1 KB',
    modified: '2026-09-25 11:05',
    content: `{\n  "name": "encantos-shell",\n  "version": "1.0.0",\n  "framework": "React 19 + Vite",\n  "style": "Tailwind CSS",\n  "license": "GPL-3.0"\n}`
  },
  {
    id: 'f-syslog',
    name: 'syslog',
    type: 'file',
    parentId: 'var-log',
    path: '/var/log/syslog',
    size: '4.8 KB',
    modified: '2026-09-26 04:30',
    content: `Sep 26 04:30:01 encantos-desktop systemd[1]: Starting Encantos Wayland Compositor...\nSep 26 04:30:02 encantos-desktop kernel: [0.000000] Linux version 6.8.0-encantos-generic\nSep 26 04:30:03 encantos-desktop pipewire[842]: Audio server started successfully.`
  },
  {
    id: 'f-fstab',
    name: 'fstab',
    type: 'file',
    parentId: 'etc',
    path: '/etc/fstab',
    size: '0.8 KB',
    modified: '2026-09-25 09:30',
    content: `# /etc/fstab: static file system information\nUUID=7a8b9c-1234-5678-abcd / btrfs defaults,compress=zstd:1 0 1\nUUID=1234-5678 /boot/efi vfat umask=0077 0 2\n`
  }
];

const INITIAL_APPS: StoreApp[] = [
  // SYSTEM UTILITIES
  {
    id: 'btop',
    name: 'Btop++ Resource Monitor',
    tagline: 'Modern, aesthetic processor, memory, and disk telemetry HUD',
    category: 'Utilities',
    isUtility: true,
    description: 'High-performance C++ hardware monitor featuring real-time responsive graphs for CPU cores, RAM allocation, NVMe I/O throughput, processes tree, and packet networking.',
    features: ['Real-time CPU per-core frequency & temp', 'Process tree tree-view & signal termination', 'NVMe / SSD IOPS read/write graphing', 'Zero overhead C++20 engine'],
    version: '1.3.2',
    size: '4.8 MB',
    developer: 'Aristocratos Open Source',
    license: 'Apache 2.0',
    format: 'Native (.deb)',
    permissions: ['Kernel Telemetry Access', 'Process Management'],
    installed: true,
    icon: 'Activity',
    rating: 4.9,
    reviewsCount: 3840,
    downloadsCount: '1.2M+'
  },
  {
    id: 'gparted',
    name: 'GParted Partition Editor',
    tagline: 'Graphical storage partition manager for Btrfs, Ext4, and NTFS',
    category: 'Utilities',
    isUtility: true,
    description: 'Comprehensive partition management tool allowing you to resize, copy, move, check, and create partitions without data loss across NVMe, SATA, and USB drives.',
    features: ['Resize Btrfs / Ext4 filesystems live', 'Partition UUID & label manipulation', 'Bad sector verification check', 'SMART drive health diagnostics'],
    version: '1.6.0',
    size: '18.4 MB',
    developer: 'GParted Project',
    license: 'GPLv2',
    format: 'Native (.deb)',
    permissions: ['Block Storage Device Access', 'Root Administrator'],
    installed: false,
    icon: 'HardDrive',
    rating: 4.8,
    reviewsCount: 2950,
    downloadsCount: '850K+'
  },
  {
    id: 'timeshift',
    name: 'Timeshift Snapshot Hub',
    tagline: 'Automated incremental system restore and Btrfs snapshots',
    category: 'Utilities',
    isUtility: true,
    description: 'Protects your system by creating incremental snapshots of the operating system at regular intervals. Can be restored from a live USB or desktop session.',
    features: ['Instant Btrfs subvolume snapshot creation', 'Scheduled daily/hourly rollbacks', 'Bootloader integration entries', 'Zero disk duplication overhead'],
    version: '24.06.1',
    size: '14.2 MB',
    developer: 'Linux Mint Team & Teejee',
    license: 'GPLv3',
    format: 'Native (.deb)',
    permissions: ['Root Filesystem Access', 'Cron Scheduler'],
    installed: true,
    icon: 'RotateCcw',
    rating: 4.9,
    reviewsCount: 4120,
    downloadsCount: '2.1M+'
  },
  {
    id: 'bleachbit',
    name: 'BleachBit Cleaner',
    tagline: 'Free disk space, shred cache logs, and guard privacy',
    category: 'Utilities',
    isUtility: true,
    description: 'Cleans system cache, deletes cookies, clears browser history, shreds temporary logs, and wipes unallocated disk space to keep the OS pristine.',
    features: ['Deep system cache purge', 'Military-grade file shredding', 'Vacuum browser SQLite databases', 'Reclaim gigabytes of space'],
    version: '4.6.0',
    size: '12.6 MB',
    developer: 'Andrew Ziem & Contributors',
    license: 'GPLv3',
    format: 'Native (.deb)',
    permissions: ['System Temp Files Access'],
    installed: false,
    icon: 'Trash2',
    rating: 4.7,
    reviewsCount: 1820,
    downloadsCount: '920K+'
  },
  {
    id: 'wireguard',
    name: 'WireGuard VPN Suite',
    tagline: 'Extremely simple, fast, and modern kernel-level VPN utility',
    category: 'Utilities',
    isUtility: true,
    description: 'Next-generation VPN utilizing state-of-the-art cryptography. Outperforms legacy IPsec and OpenVPN with instant handshakes and minimal battery consumption.',
    features: ['ChaCha20Poly1305 encryption', 'Zero-handshake roaming support', 'NetworkManager GUI integration', 'High-throughput UDP stream'],
    version: '1.0.2024',
    size: '8.1 MB',
    developer: 'Jason A. Donenfeld',
    license: 'GPLv2',
    format: 'Native (.deb)',
    permissions: ['Kernel TUN/TAP Interface', 'Network Routing'],
    installed: false,
    icon: 'Shield',
    rating: 5.0,
    reviewsCount: 5640,
    downloadsCount: '3.4M+'
  },
  {
    id: 'peazip',
    name: 'PeaZip Archive Utility',
    tagline: 'Universal compression utility supporting 200+ archive formats',
    category: 'Utilities',
    isUtility: true,
    description: 'Powerful file archiver supporting 7Z, TAR, Zstandard, ZIP, RAR, and ISO images. Features strong AES-256 encryption and benchmark tools.',
    features: ['High-speed Zstandard / 7Z multi-threading', 'Encrypted password manager vaults', 'Archive integrity verification', 'Split & merge file tool'],
    version: '9.8.0',
    size: '32.5 MB',
    developer: 'Giorgio Tani',
    license: 'LGPLv3',
    format: 'Flatpak',
    permissions: ['Read/Write Filesystem'],
    installed: false,
    icon: 'Package',
    rating: 4.7,
    reviewsCount: 1420,
    downloadsCount: '650K+'
  },
  {
    id: 'wireshark',
    name: 'Wireshark Protocol Analyzer',
    tagline: 'World’s foremost network protocol and packet telemetry analyzer',
    category: 'Utilities',
    isUtility: true,
    description: 'Deep inspection of hundreds of network protocols, live packet capturing, offline analysis, and detailed VoIP/TLS diagnostic decoding.',
    features: ['Live packet capture on wlan0 & eth0', 'Color-coded filter expressions', 'Export capture to PCAP / PCAPNG', 'TCP stream reconstruction'],
    version: '4.2.6',
    size: '56.2 MB',
    developer: 'Wireshark Foundation',
    license: 'GPLv2',
    format: 'Native (.deb)',
    permissions: ['Raw Socket Capture', 'Promiscuous Mode'],
    installed: false,
    icon: 'Wifi',
    rating: 4.9,
    reviewsCount: 3200,
    downloadsCount: '1.8M+'
  },

  // SOFTWARE PACKAGES: INTERNET & DEVELOPMENT
  {
    id: 'firefox',
    name: 'Firefox Browser',
    tagline: 'Fast, private, and independent web browser',
    category: 'Internet',
    description: 'The premier open-source web browser providing privacy protections, tab containers, WebRender graphics pipeline, and extensive add-on support.',
    features: ['Total Cookie Protection', 'Multi-Account Containers', 'Wayland hardware video decode', 'Custom theme engine'],
    version: '128.2.0 ESR',
    size: '84.2 MB',
    developer: 'Mozilla Foundation',
    license: 'MPL 2.0',
    format: 'Flatpak',
    permissions: ['Network Access', 'Pulseaudio Sound', 'Wayland Display'],
    installed: true,
    icon: 'Compass',
    rating: 4.8,
    reviewsCount: 1420,
    downloadsCount: '15M+'
  },
  {
    id: 'filezilla',
    name: 'FileZilla SFTP Client',
    tagline: 'Fast and reliable cross-platform FTP, FTPS, and SFTP client',
    category: 'Internet',
    description: 'Intuitive graphical interface for secure remote server administration, cloud file synchronization, and bulk file transfers with transfer queue resume.',
    features: ['SSH File Transfer Protocol (SFTP)', 'Site Manager with key authentication', 'Synchronized directory browsing', 'Remote file search'],
    version: '3.67.0',
    size: '22.8 MB',
    developer: 'Tim Kosse & Team',
    license: 'GPLv2',
    format: 'Native (.deb)',
    permissions: ['Network Sockets', 'Local Storage Access'],
    installed: false,
    icon: 'Download',
    rating: 4.6,
    reviewsCount: 1890,
    downloadsCount: '4.2M+'
  },
  {
    id: 'vscode',
    name: 'Code Studio (VSCodium)',
    tagline: 'Powerful open-source code editor with zero telemetry',
    category: 'Development',
    description: 'Community-driven, freely licensed binary distribution of Microsoft’s editor VS Code with all tracking telemetry stripped out.',
    features: ['Built-in Git integration', 'Interactive terminal splits', 'Extension marketplace support', 'TypeScript / Rust / Python language server'],
    version: '1.92.2',
    size: '112.5 MB',
    developer: 'VSCodium Community',
    license: 'MIT',
    format: 'Flatpak',
    permissions: ['Filesystem Access', 'Terminal Subprocesses'],
    installed: true,
    icon: 'Code',
    rating: 4.9,
    reviewsCount: 2310,
    downloadsCount: '6.8M+'
  },

  // GRAPHICS & MULTIMEDIA
  {
    id: 'gimp',
    name: 'GIMP Studio',
    tagline: 'Advanced image manipulation and photo retouching suite',
    category: 'Graphics',
    description: 'High-end photo manipulation, original artwork creation, graphic design elements, and multi-channel color workflow.',
    features: ['Customizable brush engine', 'Full layer masks & blending modes', 'GEGL high bit-depth color pipeline', 'PSD / RAW / WebP format support'],
    version: '2.10.38',
    size: '148.0 MB',
    developer: 'The GIMP Team',
    license: 'GPLv3',
    format: 'Native (.deb)',
    permissions: ['Read/Write Photos', 'OpenGL Acceleration'],
    installed: false,
    icon: 'Palette',
    rating: 4.6,
    reviewsCount: 890,
    downloadsCount: '5.1M+'
  },
  {
    id: 'krita',
    name: 'Krita Digital Painting',
    tagline: 'Professional creative suite for concept artists and illustrators',
    category: 'Graphics',
    description: 'Designed for concept art, comics, textures, matte painting, and 2D frame-by-frame animation with pressure-sensitive stylus stabilization.',
    features: ['Brush stabilizer for smooth lines', 'Built-in 2D animation timeline', 'Seamless tiling texture mode', 'Full CMYK color management'],
    version: '5.2.2',
    size: '186.2 MB',
    developer: 'Krita Foundation',
    license: 'GPLv3',
    format: 'Flatpak',
    permissions: ['Graphics Tablet Access', 'GPU Rendering'],
    installed: false,
    icon: 'Palette',
    rating: 4.9,
    reviewsCount: 3410,
    downloadsCount: '2.9M+'
  },
  {
    id: 'blender',
    name: 'Blender 3D Studio',
    tagline: 'Open source 3D modeling, animation, rendering, and VFX',
    category: 'Graphics',
    description: 'Complete 3D creation suite supporting modeling, rigging, animation, simulation, rendering, compositing, motion tracking, and video editing.',
    features: ['Cycles real-time raytracing engine', 'Geometry Nodes procedural modeling', 'Grease Pencil 2D in 3D', 'Vulkan backend support'],
    version: '4.2.1 LTS',
    size: '340.8 MB',
    developer: 'Blender Foundation',
    license: 'GPLv3',
    format: 'Flatpak',
    permissions: ['Full GPU Acceleration', 'Filesystem Access'],
    installed: false,
    icon: 'Box',
    rating: 5.0,
    reviewsCount: 4200,
    downloadsCount: '8.4M+'
  },
  {
    id: 'vlc',
    name: 'VLC Media Player',
    tagline: 'Plays virtually all audio and video formats out of the box',
    category: 'Multimedia',
    description: 'Universal media player and framework that plays files, discs, webcams, devices, and streams without requiring external codec packs.',
    features: ['Hardware-accelerated decoding', 'Spatial 360 audio & video', 'Subtitle auto-synchronization', 'Network streaming client'],
    version: '3.0.21',
    size: '64.5 MB',
    developer: 'VideoLAN',
    license: 'GPLv2',
    format: 'Native (.deb)',
    permissions: ['Hardware Video Decoding', 'Audio Output'],
    installed: true,
    icon: 'Film',
    rating: 4.9,
    reviewsCount: 3100,
    downloadsCount: '22M+'
  },
  {
    id: 'audacity',
    name: 'Audacity Audio Studio',
    tagline: 'Multi-track audio editor and high-fidelity sound recorder',
    category: 'Multimedia',
    description: 'Easy-to-use, multi-track sound recording and editing software. Features noise reduction, frequency spectrum analysis, and VST3 plugin compatibility.',
    features: ['Live 32-bit float audio capture', 'Real-time spectral editing', 'Noise gate & de-clicker effects', 'PipeWire low-latency routing'],
    version: '3.6.1',
    size: '48.2 MB',
    developer: 'Muse Group & Audacity Team',
    license: 'GPLv3',
    format: 'Flatpak',
    permissions: ['Microphone Capture', 'Audio Output Device'],
    installed: false,
    icon: 'Music',
    rating: 4.7,
    reviewsCount: 2150,
    downloadsCount: '7.3M+'
  },
  {
    id: 'obs-studio',
    name: 'OBS Studio',
    tagline: 'Live streaming and screen recording software',
    category: 'Multimedia',
    description: 'Free and open source software for video recording and live streaming on Twitch, YouTube, and more with high-performance real-time video/audio capturing.',
    features: ['Wayland pipewire screen capture', 'Multi-view production monitoring', 'NVENC / VA-API hardware encoding', 'Studio transition controls'],
    version: '30.2.2',
    size: '128.4 MB',
    developer: 'OBS Project',
    license: 'GPLv2',
    format: 'Flatpak',
    permissions: ['Screen Capture', 'Audio In/Out', 'Camera Access'],
    installed: false,
    icon: 'Radio',
    rating: 4.8,
    reviewsCount: 980,
    downloadsCount: '4.8M+'
  },

  // PRODUCTIVITY & SECURITY
  {
    id: 'libreoffice',
    name: 'LibreOffice Suite',
    tagline: 'Complete office productivity suite compatible with MS Office',
    category: 'Productivity',
    description: 'Full-featured office suite with Writer (word processor), Calc (spreadsheets), Impress (presentations), Draw (vector diagrams), and Base (database).',
    features: ['Native DOCX / XLSX / PPTX compatibility', 'PDF export with digital signing', 'Database engine integration', 'Macro scripting engine'],
    version: '24.2.5',
    size: '230.1 MB',
    developer: 'The Document Foundation',
    license: 'MPL 2.0',
    format: 'Native (.deb)',
    permissions: ['Documents Folder Access', 'Printing Services'],
    installed: true,
    icon: 'Briefcase',
    rating: 4.7,
    reviewsCount: 1650,
    downloadsCount: '12M+'
  },
  {
    id: 'thunderbird',
    name: 'Thunderbird Mail & Hub',
    tagline: 'Open-source email, calendar, contacts, and newsfeed client',
    category: 'Productivity',
    description: 'Clean modern email client with PGP end-to-end encryption, unified inboxes, calendar synchronization (CalDAV), and extensive privacy filters.',
    features: ['OpenPGP automated key management', 'Multiple email account aggregation', 'Integrated calendar & tasks', 'Phishing protection shield'],
    version: '128.1.0 ESR',
    size: '78.6 MB',
    developer: 'MZLA Technologies',
    license: 'MPL 2.0',
    format: 'Flatpak',
    permissions: ['Network Communication', 'Local Storage'],
    installed: false,
    icon: 'Mail',
    rating: 4.8,
    reviewsCount: 2280,
    downloadsCount: '5.9M+'
  },
  {
    id: 'bitwarden',
    name: 'Bitwarden Vault',
    tagline: 'Secure open-source password manager and passkey authenticator',
    category: 'Security',
    description: 'Zero-knowledge end-to-end encrypted password vault. Securely generate, store, and auto-fill passwords and two-factor TOTP authentication codes.',
    features: ['Zero-knowledge AES-256 encryption', 'Passkey biometric authentication', 'Built-in 2FA authenticator', 'Password strength health reports'],
    version: '2024.7.1',
    size: '95.4 MB',
    developer: 'Bitwarden Inc.',
    license: 'GPLv3',
    format: 'Flatpak',
    permissions: ['Secure Memory Storage', 'Network Sync'],
    installed: false,
    icon: 'Shield',
    rating: 4.9,
    reviewsCount: 4890,
    downloadsCount: '4.1M+'
  },

  // GAMES
  {
    id: 'steam',
    name: 'Steam & Proton Gaming',
    tagline: 'Ultimate gaming platform with native Linux and Proton translation',
    category: 'Games',
    description: 'Instant access to thousands of games with Valve Proton compatibility layer, gamepad configurations, and community overlays.',
    features: ['Valve Proton DX12-to-Vulkan translation', 'Big Picture mode UI', 'Steam Cloud game saves', 'Full gamepad controller mapping'],
    version: '1.0.0.79',
    size: '88.0 MB',
    developer: 'Valve Corporation',
    license: 'Proprietary / Open Components',
    format: 'Flatpak',
    permissions: ['DirectX/Vulkan Passthrough', 'Controller Access'],
    installed: false,
    icon: 'Gamepad2',
    rating: 4.9,
    reviewsCount: 5120,
    downloadsCount: '18M+'
  }
];

const INITIAL_PROCESSES: ProcessItem[] = [
  { pid: 1, name: 'systemd', cpu: 0.1, memoryMb: 24, user: 'root', status: 'Running' },
  { pid: 312, name: 'systemd-journald', cpu: 0.2, memoryMb: 36, user: 'root', status: 'Running' },
  { pid: 489, name: 'NetworkManager', cpu: 0.1, memoryMb: 42, user: 'root', status: 'Running' },
  { pid: 512, name: 'pipewire', cpu: 0.8, memoryMb: 58, user: 'encantos', status: 'Running' },
  { pid: 515, name: 'wireplumber', cpu: 0.3, memoryMb: 32, user: 'encantos', status: 'Running' },
  { pid: 620, name: 'encantos-compositor', cpu: 2.1, memoryMb: 165, user: 'encantos', status: 'Running' },
  { pid: 680, name: 'encantos-shell', cpu: 1.4, memoryMb: 110, user: 'encantos', status: 'Running' },
  { pid: 742, name: 'udisksd', cpu: 0.0, memoryMb: 28, user: 'root', status: 'Sleeping' },
  { pid: 810, name: 'packagekitd', cpu: 0.0, memoryMb: 45, user: 'root', status: 'Sleeping' },
  { pid: 924, name: 'encantos-settings-daemon', cpu: 0.1, memoryMb: 38, user: 'encantos', status: 'Running' }
];

interface SystemContextType {
  // Session
  sessionState: 'booting' | 'greeter' | 'desktop' | 'locked' | 'restarting' | 'shutting_down' | 'sleeping' | 'hibernating';
  setSessionState: (s: 'booting' | 'greeter' | 'desktop' | 'locked' | 'restarting' | 'shutting_down' | 'sleeping' | 'hibernating') => void;
  unlockScreen: (pass: string) => boolean;
  loginUser: (pass: string) => boolean;

  // Windows
  windows: Record<WindowId, WindowState>;
  activeWindowId: WindowId | null;
  openWindow: (id: WindowId, extraProps?: Record<string, any>) => void;
  closeWindow: (id: WindowId) => void;
  minimizeWindow: (id: WindowId) => void;
  maximizeWindow: (id: WindowId) => void;
  restoreWindow: (id: WindowId) => void;
  bringToFront: (id: WindowId) => void;
  updateWindowPosition: (id: WindowId, pos: { x: number; y: number }) => void;
  updateWindowSize: (id: WindowId, size: { width: number; height: number }) => void;
  snapWindow: (id: WindowId, side: 'left' | 'right') => void;

  // VFS
  fs: FsItem[];
  createFile: (parentId: string, name: string, content?: string) => void;
  createFolder: (parentId: string, name: string) => void;
  deleteItem: (id: string) => void;
  restoreFromTrash: (id: string) => void;
  emptyTrash: () => void;
  renameItem: (id: string, newName: string) => void;
  updateFileContent: (id: string, content: string) => void;

  // Store
  apps: StoreApp[];
  installApp: (id: string) => void;
  uninstallApp: (id: string) => void;

  // Settings
  settings: SystemSettings;
  updateSettings: (partial: Partial<SystemSettings>) => void;
  playTestAudio: () => void;

  // Processes & Monitor
  processes: ProcessItem[];
  killProcess: (pid: number) => void;
  systemMetrics: SystemMetrics;
  boostSystemLoad: (amount?: number) => void;
  showSystemMonitorWidget: boolean;
  setShowSystemMonitorWidget: (b: boolean | ((prev: boolean) => boolean)) => void;

  // Battery State & Controls
  battery: BatteryState;
  toggleCharging: () => void;
  setBatteryLevel: (level: number) => void;
  setPowerMode: (mode: 'balanced' | 'power-saver' | 'performance') => void;

  // Notifications & Toast Alerts
  notifications: SystemNotification[];
  toasts: SystemNotification[];
  addNotification: (n: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => void;
  dismissNotification: (id: string) => void;
  dismissToast: (id: string) => void;
  clearNotifications: () => void;

  // UI helpers
  startMenuOpen: boolean;
  setStartMenuOpen: (b: boolean | ((prev: boolean) => boolean)) => void;
  quickSettingsOpen: boolean;
  setQuickSettingsOpen: (b: boolean | ((prev: boolean) => boolean)) => void;
  controlCenterOpen: boolean;
  setControlCenterOpen: (b: boolean | ((prev: boolean) => boolean)) => void;
  calendarOpen: boolean;
  setCalendarOpen: (b: boolean | ((prev: boolean) => boolean)) => void;
  searchOpen: boolean;
  setSearchOpen: (b: boolean | ((prev: boolean) => boolean)) => void;
  powerMenuOpen: boolean;
  setPowerMenuOpen: (b: boolean | ((prev: boolean) => boolean)) => void;
  brandLogo: string;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionState, setSessionState] = useState<'booting' | 'greeter' | 'desktop' | 'locked' | 'restarting' | 'shutting_down' | 'sleeping' | 'hibernating'>('booting');
  const [windows, setWindows] = useState<Record<WindowId, WindowState>>(INITIAL_WINDOWS);
  const [activeWindowId, setActiveWindowId] = useState<WindowId | null>(null);
  const [topZ, setTopZ] = useState(25);

  const [fs, setFs] = useState<FsItem[]>(INITIAL_FS);
  const [apps, setApps] = useState<StoreApp[]>(INITIAL_APPS);
  const [processes, setProcesses] = useState<ProcessItem[]>(INITIAL_PROCESSES);

  const [settings, setSettings] = useState<SystemSettings>({
    theme: 'dark',
    accentColor: '#8b5cf6',
    wallpaper: 'aurora',
    volume: 75,
    isMuted: false,
    brightness: 90,
    wifiEnabled: true,
    wifiConnectedSsid: 'Encantos_HighSpeed_5G',
    bluetoothEnabled: true,
    bluetoothConnectedDevice: 'Encantos Acoustic Pro',
    nightLight: false,
    nightLightIntensity: 45,
    doNotDisturb: false,
    resolution: '1920x1080 (16:9)',
    refreshRate: '120 Hz',
    uiScale: 100,
    language: 'en',
    timezone: 'America/New_York',
    timeFormat: '24h',
    dateFormat: 'YYYY-MM-DD',
    autoTimeSync: true,
    firstDayOfWeek: 'monday',
    firewallEnabled: true,
    soundOutputDevice: 'PipeWire - High Definition Audio Line Out',
    soundInputDevice: 'PipeWire - Studio Microphone Array',
    taskbarPosition: 'bottom',
    username: 'encantos',
    hostname: 'encantos-desktop'
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'notif-1',
      title: 'Welcome to ENCANTOS OS 1.0.0',
      message: 'Running in Live Session. Test the desktop environment or double-click "Install ENCANTOS OS" to install.',
      timestamp: 'Just now',
      type: 'info',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Hardware Acceleration Active',
      message: 'Vulkan/Mesa driver loaded with Wayland compositor hardware composition.',
      timestamp: '2 min ago',
      type: 'success',
      read: false
    }
  ]);

  // Active Toast Alerts displayed on desktop top right
  const [toasts, setToasts] = useState<SystemNotification[]>([]);
  const batteryAlertedRef = useRef<{ low20: boolean; crit10: boolean }>({ low20: false, crit10: false });
  const isInitialMountRef = useRef<boolean>(true);

  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [powerMenuOpen, setPowerMenuOpen] = useState(false);
  const [showSystemMonitorWidget, setShowSystemMonitorWidget] = useState(true);

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuPercent: 14.2,
    ramPercent: 28.1,
    ramUsedGb: 4.5,
    ramTotalGb: 16.0,
    diskUsageGb: 42.8,
    totalDiskGb: 512,
    diskPercent: 8.4,
    diskReadMb: 12.4,
    diskWriteMb: 4.2,
    netDownloadKb: 42.6,
    netUploadKb: 18.2,
    cpuTemp: 44,
    cpuFrequencyGhz: 3.4,
    loadAverage: [1.14, 0.98, 0.85],
    uptimeSeconds: 1420
  });

  // Dynamic Battery Management State
  const [battery, setBattery] = useState<BatteryState>({
    level: 86,
    isCharging: false,
    powerMode: 'balanced',
    health: 98,
    voltage: '11.4 V'
  });

  // Hardware / Simulated Battery Telemetry
  useEffect(() => {
    let batteryManager: any = null;
    let isCancelled = false;

    const syncBattery = () => {
      if (batteryManager && !isCancelled) {
        setBattery(prev => ({
          ...prev,
          level: Math.round(batteryManager.level * 100),
          isCharging: Boolean(batteryManager.charging)
        }));
      }
    };

    if (typeof navigator !== 'undefined' && 'getBattery' in (navigator as any)) {
      (navigator as any).getBattery().then((bm: any) => {
        if (isCancelled) return;
        batteryManager = bm;
        syncBattery();
        bm.addEventListener('levelchange', syncBattery);
        bm.addEventListener('chargingchange', syncBattery);
      }).catch(() => {
        // Battery API restriction fallback
      });
    }

    // Dynamic timer simulating realistic load-based discharge or charge
    const batteryTimer = setInterval(() => {
      setBattery(prev => {
        if (batteryManager) return prev;
        let newLevel = prev.level;
        if (prev.isCharging) {
          newLevel = Math.min(100, prev.level + 1);
        } else {
          const drainRate = prev.powerMode === 'performance' ? 0.4 : prev.powerMode === 'power-saver' ? 0.08 : 0.2;
          if (Math.random() < drainRate) {
            newLevel = Math.max(5, prev.level - 1);
          }
        }
        return { ...prev, level: newLevel };
      });
    }, 12000);

    return () => {
      isCancelled = true;
      clearInterval(batteryTimer);
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', syncBattery);
        batteryManager.removeEventListener('chargingchange', syncBattery);
      }
    };
  }, []);

  const toggleCharging = () => {
    setBattery(prev => {
      const nextCharging = !prev.isCharging;
      addNotification({
        title: nextCharging ? 'AC Power Connected' : 'Running on Battery Power',
        message: nextCharging 
          ? `USB-C Fast Charging connected. Battery at ${prev.level}%.` 
          : `Running on battery. ${prev.level}% power available.`,
        type: nextCharging ? 'success' : 'info',
        category: 'battery',
        targetWindowId: 'settings',
        actionLabel: 'Battery Settings'
      });
      return { ...prev, isCharging: nextCharging };
    });
  };

  // Monitor battery level for low and critical alerts
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    if (battery.isCharging) {
      batteryAlertedRef.current = { low20: false, crit10: false };
      return;
    }

    if (battery.level <= 10 && !batteryAlertedRef.current.crit10) {
      batteryAlertedRef.current.crit10 = true;
      batteryAlertedRef.current.low20 = true;
      addNotification({
        title: 'Critical Battery Level',
        message: `Battery is critically low at ${battery.level}%. Connect AC adapter immediately to prevent shutdown.`,
        type: 'error',
        category: 'battery',
        targetWindowId: 'settings',
        actionLabel: 'Power Settings',
        duration: 9000
      });
    } else if (battery.level <= 20 && !batteryAlertedRef.current.low20) {
      batteryAlertedRef.current.low20 = true;
      addNotification({
        title: 'Low Battery Warning',
        message: `Battery is down to ${battery.level}%. Consider plugging in your charger or switching to Power-Saver mode.`,
        type: 'warning',
        category: 'battery',
        targetWindowId: 'settings',
        actionLabel: 'Power Settings',
        duration: 7000
      });
    } else if (battery.level > 20) {
      batteryAlertedRef.current = { low20: false, crit10: false };
    }
  }, [battery.level, battery.isCharging]);

  const setBatteryLevel = (level: number) => {
    setBattery(prev => ({ ...prev, level: Math.max(1, Math.min(100, Math.round(level))) }));
  };

  const setPowerMode = (powerMode: 'balanced' | 'power-saver' | 'performance') => {
    setBattery(prev => ({ ...prev, powerMode }));
    addNotification({
      title: 'Power Profile Updated',
      message: `System switched to ${powerMode.toUpperCase()} mode.`,
      type: 'info',
      category: 'battery',
      targetWindowId: 'settings',
      actionLabel: 'Power Settings'
    });
  };

  // System metrics simulation tick
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemMetrics(prev => {
        // Natural oscillation back towards baseline
        const cpuDrift = (Math.random() * 8 - 4);
        const targetCpu = prev.cpuPercent > 45 ? prev.cpuPercent * 0.92 : prev.cpuPercent + cpuDrift;
        const nextCpu = Math.min(98, Math.max(5, targetCpu));

        const nextRamPercent = Math.min(90, Math.max(20, prev.ramPercent + (Math.random() * 0.8 - 0.4)));
        const nextRamUsed = Math.round((nextRamPercent / 100) * prev.ramTotalGb * 10) / 10;

        const nextNetDown = Math.max(4, Math.round(prev.netDownloadKb * (prev.netDownloadKb > 200 ? 0.85 : 1) + (Math.random() * 40 - 20)));
        const nextNetUp = Math.max(2, Math.round(prev.netUploadKb * 0.9 + (Math.random() * 15 - 7)));

        const nextRead = Math.max(1.2, Math.round((prev.diskReadMb * (prev.diskReadMb > 25 ? 0.85 : 1) + (Math.random() * 4 - 2)) * 10) / 10);
        const nextWrite = Math.max(0.6, Math.round((prev.diskWriteMb * (prev.diskWriteMb > 15 ? 0.85 : 1) + (Math.random() * 3 - 1.5)) * 10) / 10);

        const nextTemp = Math.round(40 + (nextCpu * 0.35));
        const nextFreq = Math.round((2.4 + (nextCpu * 0.026)) * 10) / 10;

        return {
          ...prev,
          cpuPercent: Math.round(nextCpu * 10) / 10,
          ramPercent: Math.round(nextRamPercent * 10) / 10,
          ramUsedGb: nextRamUsed,
          netDownloadKb: nextNetDown,
          netUploadKb: nextNetUp,
          diskReadMb: nextRead,
          diskWriteMb: nextWrite,
          cpuTemp: nextTemp,
          cpuFrequencyGhz: nextFreq,
          loadAverage: [
            Math.round((nextCpu / 30) * 100) / 100,
            Math.round((prev.loadAverage[0] * 0.95 + 0.05) * 100) / 100,
            prev.loadAverage[2]
          ],
          uptimeSeconds: prev.uptimeSeconds + 2
        };
      });
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const boostSystemLoad = (amount = 35) => {
    setSystemMetrics(prev => {
      const spikedCpu = Math.min(98, prev.cpuPercent + amount);
      const spikedNet = prev.netDownloadKb + 850;
      const spikedRam = Math.min(88, prev.ramPercent + 12);
      const spikedRead = prev.diskReadMb + 45;
      const spikedWrite = prev.diskWriteMb + 28;
      return {
        ...prev,
        cpuPercent: Math.round(spikedCpu * 10) / 10,
        ramPercent: Math.round(spikedRam * 10) / 10,
        ramUsedGb: Math.round((spikedRam / 100) * prev.ramTotalGb * 10) / 10,
        netDownloadKb: Math.round(spikedNet),
        diskReadMb: Math.round(spikedRead * 10) / 10,
        diskWriteMb: Math.round(spikedWrite * 10) / 10,
        cpuTemp: Math.min(82, prev.cpuTemp + 14),
        cpuFrequencyGhz: 4.8
      };
    });
  };

  // Window Management functions
  const openWindow = (id: WindowId, extraProps?: Record<string, any>) => {
    setTopZ(z => z + 1);
    setWindows(prev => {
      const target = prev[id];
      if (!target) return prev;
      return {
        ...prev,
        [id]: {
          ...target,
          isOpen: true,
          isMinimized: false,
          zIndex: topZ + 1,
          extraProps: extraProps || target.extraProps
        }
      };
    });
    setActiveWindowId(id);
    setStartMenuOpen(false);
    setSearchOpen(false);
  };

  const closeWindow = (id: WindowId) => {
    setWindows(prev => {
      const target = prev[id];
      if (!target) return prev;
      return {
        ...prev,
        [id]: { ...target, isOpen: false, isMinimized: false }
      };
    });
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const minimizeWindow = (id: WindowId) => {
    setWindows(prev => {
      const target = prev[id];
      if (!target) return prev;
      return {
        ...prev,
        [id]: { ...target, isMinimized: true }
      };
    });
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const maximizeWindow = (id: WindowId) => {
    setWindows(prev => {
      const target = prev[id];
      if (!target) return prev;
      if (target.isMaximized) {
        // Restore
        return {
          ...prev,
          [id]: {
            ...target,
            isMaximized: false,
            position: target.prevBounds ? { x: target.prevBounds.x, y: target.prevBounds.y } : target.position,
            size: target.prevBounds ? { width: target.prevBounds.width, height: target.prevBounds.height } : target.size
          }
        };
      } else {
        // Maximize
        return {
          ...prev,
          [id]: {
            ...target,
            isMaximized: true,
            prevBounds: { ...target.position, ...target.size },
            position: { x: 0, y: 0 },
            size: { width: window.innerWidth, height: window.innerHeight - 48 }
          }
        };
      }
    });
  };

  const restoreWindow = (id: WindowId) => {
    setTopZ(z => z + 1);
    setWindows(prev => {
      const target = prev[id];
      if (!target) return prev;
      return {
        ...prev,
        [id]: {
          ...target,
          isMinimized: false,
          zIndex: topZ + 1
        }
      };
    });
    setActiveWindowId(id);
  };

  const bringToFront = (id: WindowId) => {
    setTopZ(z => z + 1);
    setWindows(prev => {
      const target = prev[id];
      if (!target) return prev;
      return {
        ...prev,
        [id]: {
          ...target,
          isMinimized: false,
          zIndex: topZ + 1
        }
      };
    });
    setActiveWindowId(id);
  };

  const updateWindowPosition = (id: WindowId, pos: { x: number; y: number }) => {
    setWindows(prev => {
      const target = prev[id];
      if (!target) return prev;
      return {
        ...prev,
        [id]: { ...target, position: pos, isMaximized: false }
      };
    });
  };

  const updateWindowSize = (id: WindowId, size: { width: number; height: number }) => {
    setWindows(prev => {
      const target = prev[id];
      if (!target) return prev;
      return {
        ...prev,
        [id]: { ...target, size }
      };
    });
  };

  const snapWindow = (id: WindowId, side: 'left' | 'right') => {
    const halfWidth = Math.floor(window.innerWidth / 2);
    const height = window.innerHeight - 48;
    setTopZ(z => z + 1);
    setWindows(prev => {
      const target = prev[id];
      if (!target) return prev;
      return {
        ...prev,
        [id]: {
          ...target,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          zIndex: topZ + 1,
          position: { x: side === 'left' ? 0 : halfWidth, y: 0 },
          size: { width: halfWidth, height }
        }
      };
    });
    setActiveWindowId(id);
  };

  // VFS Operations
  const createFile = (parentId: string, name: string, content = '') => {
    const parent = fs.find(i => i.id === parentId);
    const path = parent ? `${parent.path}/${name}` : `/home/encantos/${name}`;
    const newItem: FsItem = {
      id: `file-${Date.now()}`,
      name,
      type: 'file',
      parentId,
      path,
      size: `${Math.max(1, Math.round(content.length / 1024))} KB`,
      modified: new Date().toISOString().slice(0, 16).replace('T', ' '),
      content
    };
    setFs(prev => [...prev, newItem]);
    addNotification({
      title: 'File Created',
      message: `Created ${name} in ${parent?.name || 'folder'}`,
      type: 'info'
    });
  };

  const createFolder = (parentId: string, name: string) => {
    const parent = fs.find(i => i.id === parentId);
    const path = parent ? `${parent.path}/${name}` : `/home/encantos/${name}`;
    const newItem: FsItem = {
      id: `folder-${Date.now()}`,
      name,
      type: 'folder',
      parentId,
      path,
      modified: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    setFs(prev => [...prev, newItem]);
  };

  const deleteItem = (id: string) => {
    const target = fs.find(i => i.id === id);
    if (!target || target.isProtected) return;

    if (target.parentId === 'trash') {
      // Permanent delete
      setFs(prev => prev.filter(i => i.id !== id));
      addNotification({
        title: 'Permanently Deleted',
        message: `${target.name} was removed from the system.`,
        type: 'warning'
      });
    } else {
      // Move to Trash
      setFs(prev => prev.map(i => i.id === id ? { ...i, parentId: 'trash' } : i));
      addNotification({
        title: 'Moved to Trash',
        message: `${target.name} moved to Trash.`,
        type: 'info'
      });
    }
  };

  const restoreFromTrash = (id: string) => {
    setFs(prev => prev.map(i => i.id === id ? { ...i, parentId: 'desktop' } : i));
  };

  const emptyTrash = () => {
    setFs(prev => prev.filter(i => i.parentId !== 'trash'));
    addNotification({
      title: 'Trash Emptied',
      message: 'All trashed items have been permanently removed.',
      type: 'info'
    });
  };

  const renameItem = (id: string, newName: string) => {
    setFs(prev => prev.map(i => {
      if (i.id === id) {
        const parts = i.path.split('/');
        parts[parts.length - 1] = newName;
        return { ...i, name: newName, path: parts.join('/') };
      }
      return i;
    }));
  };

  const updateFileContent = (id: string, content: string) => {
    setFs(prev => prev.map(i => {
      if (i.id === id) {
        return {
          ...i,
          content,
          size: `${Math.max(1, Math.round(content.length / 1024))} KB`,
          modified: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
      }
      return i;
    }));
  };

  // Store Application Lifecycle
  const installApp = (id: string) => {
    const target = apps.find(a => a.id === id);
    if (!target || target.installed || target.isInstalling) return;

    // Phase 1: Downloading
    setApps(prev => prev.map(a => a.id === id ? { ...a, isInstalling: true, installProgress: 15, installPhase: 'downloading' } : a));
    addNotification({
      title: 'Downloading Application',
      message: `Fetching ${target.name} ${target.version} from Encantos repository...`,
      type: 'info',
      category: 'app',
      targetWindowId: 'store',
      actionLabel: 'View in Store'
    });

    setTimeout(() => {
      // Phase 2: Installing
      setApps(prev => prev.map(a => a.id === id ? { ...a, installProgress: 55, installPhase: 'installing' } : a));

      setTimeout(() => {
        // Phase 3: Configuring
        setApps(prev => prev.map(a => a.id === id ? { ...a, installProgress: 88, installPhase: 'configuring' } : a));

        setTimeout(() => {
          // Completed
          setApps(prev => prev.map(a => a.id === id ? {
            ...a,
            isInstalling: false,
            installed: true,
            installProgress: 100,
            installPhase: 'completed'
          } : a));

          addNotification({
            title: 'Application Ready',
            message: `${target.name} ${target.version} has been successfully installed.`,
            type: 'success',
            category: 'app',
            targetWindowId: 'store',
            actionLabel: 'Open Store',
            duration: 7000
          });
        }, 800);
      }, 900);
    }, 900);
  };

  const uninstallApp = (id: string) => {
    const target = apps.find(a => a.id === id);
    if (!target) return;
    setApps(prev => prev.map(a => a.id === id ? { ...a, installed: false, installProgress: 0, installPhase: undefined } : a));
    addNotification({
      title: 'Application Removed',
      message: `${target.name} has been uninstalled.`,
      type: 'info',
      category: 'app'
    });
  };

  // Settings
  const updateSettings = (partial: Partial<SystemSettings>) => {
    setSettings(prev => {
      // Automatic Wi-Fi connectivity change notification
      if (partial.wifiEnabled !== undefined && partial.wifiEnabled !== prev.wifiEnabled) {
        if (partial.wifiEnabled) {
          addNotification({
            title: 'Wi-Fi Connected',
            message: `Connected to ${partial.wifiConnectedSsid || prev.wifiConnectedSsid || 'Encantos_HighSpeed_5G'} (Signal: 5GHz, Strong).`,
            type: 'success',
            category: 'network',
            targetWindowId: 'settings',
            actionLabel: 'Wi-Fi Settings'
          });
        } else {
          addNotification({
            title: 'Wi-Fi Disconnected',
            message: 'Wireless interface powered down. System is now offline.',
            type: 'warning',
            category: 'network',
            targetWindowId: 'settings',
            actionLabel: 'Wi-Fi Settings'
          });
        }
      }

      // Automatic Bluetooth connectivity change notification
      if (partial.bluetoothEnabled !== undefined && partial.bluetoothEnabled !== prev.bluetoothEnabled) {
        if (partial.bluetoothEnabled) {
          addNotification({
            title: 'Bluetooth Connected',
            message: `Connected to ${partial.bluetoothConnectedDevice || prev.bluetoothConnectedDevice || 'Encantos Acoustic Pro'}.`,
            type: 'info',
            category: 'network',
            targetWindowId: 'settings',
            actionLabel: 'Bluetooth Settings'
          });
        } else {
          addNotification({
            title: 'Bluetooth Disabled',
            message: 'Bluetooth controller turned off.',
            type: 'info',
            category: 'network'
          });
        }
      }

      return { ...prev, ...partial };
    });
  };

  // Sound Chime for Notification Banners
  const playNotificationChime = () => {
    if (settings.isMuted || settings.volume === 0 || settings.doNotDisturb) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const vol = Math.max(0.02, Math.min(0.2, (settings.volume / 100) * 0.16));

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(vol, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.19);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.08); // A5
      gain2.gain.setValueAtTime(vol * 0.9, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.33);
    } catch {
      // Audio fallback
    }
  };

  // Sound Synth via Web Audio API
  const playTestAudio = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.18); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.35); // C6

      gain.gain.setValueAtTime(0.18 * (settings.volume / 100), audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.52);
    } catch {
      // Audio fallback
    }
  };

  // Process Kill
  const killProcess = (pid: number) => {
    setProcesses(prev => prev.filter(p => p.pid !== pid));
    addNotification({
      title: 'Process Terminated',
      message: `PID ${pid} was successfully sent SIGKILL.`,
      type: 'warning',
      category: 'system'
    });
  };

  // Notifications & Toast Alerts
  const addNotification = (n: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newNotif: SystemNotification = {
      ...n,
      id,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // If Do Not Disturb is NOT active, display toast alert in top right corner
    if (!settings.doNotDisturb) {
      setToasts(prev => [newNotif, ...prev.slice(0, 3)]);
      playNotificationChime();
    }
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setToasts([]);
  };

  // Authentication helpers
  const unlockScreen = (_pass: string) => {
    setSessionState('desktop');
    return true;
  };

  const loginUser = (_pass: string) => {
    setSessionState('desktop');
    return true;
  };

  return (
    <SystemContext.Provider
      value={{
        sessionState,
        setSessionState,
        unlockScreen,
        loginUser,
        windows,
        activeWindowId,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        restoreWindow,
        bringToFront,
        updateWindowPosition,
        updateWindowSize,
        snapWindow,
        fs,
        createFile,
        createFolder,
        deleteItem,
        restoreFromTrash,
        emptyTrash,
        renameItem,
        updateFileContent,
        apps,
        installApp,
        uninstallApp,
        settings,
        updateSettings,
        playTestAudio,
        processes,
        killProcess,
        systemMetrics,
        boostSystemLoad,
        showSystemMonitorWidget,
        setShowSystemMonitorWidget,
        battery,
        toggleCharging,
        setBatteryLevel,
        setPowerMode,
        notifications,
        toasts,
        addNotification,
        dismissNotification,
        dismissToast,
        clearNotifications,
        startMenuOpen,
        setStartMenuOpen,
        quickSettingsOpen,
        setQuickSettingsOpen,
        controlCenterOpen,
        setControlCenterOpen,
        calendarOpen,
        setCalendarOpen,
        searchOpen,
        setSearchOpen,
        powerMenuOpen,
        setPowerMenuOpen,
        brandLogo: encantosLogo
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error('useSystem must be used within SystemProvider');
  return ctx;
};
