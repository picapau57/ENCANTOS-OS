# ENCANTOS OS — Architecture Blueprint & Technical Specification

> **Version:** 1.0.0-LTS  
> **Target Release:** Encantos OS "Aurora" (Based on Debian 13 "Trixie" / Ubuntu 24.04 LTS Core)  
> **Architecture:** x86_64 (AMD64) with UEFI & BIOS Hybrid Boot

---

## 1. Executive Summary & Base Distribution Choice

ENCANTOS OS is an independent, production-grade Linux desktop operating system engineered to offer a seamless, modern, intuitive computing experience inspired by familiar desktop ergonomics (taskbar, launcher, quick controls, coherent window management), while maintaining an original visual identity, custom glassmorphism shell, native application suite, and streamlined software delivery.

### Why Debian 13 / Ubuntu 24.04 LTS as the Foundation?
Instead of developing an unmaintainable scratch kernel or reinventing low-level device drivers, Encantos OS is built on an enterprise-grade Linux kernel and systemd foundation:
1. **Hardware Compatibility**: Out-of-the-box support for modern Intel/AMD CPUs, NVIDIA/AMD/Intel GPUs, Wi-Fi 6E/7, Bluetooth 5.4, USB-C/Thunderbolt docks, NVMe SSDs, and Realtek/Broadcom network controllers.
2. **Long-Term Stability**: Multi-year security patch lifecycle, proven package repository ecosystem (over 65,000 verified packages), and kernel 6.8+ with upstream LTS maintenance.
3. **Calamares Compatibility**: Full support for the Calamares universal installer framework with native Qt6/C++ and Python3 module hooks.
4. **Dual Packaging Architecture**: Native Debian packages (`.deb` via `apt`) for kernel, drivers, and low-level system services, paired with sandboxed Flatpak (`flathub.org`) for desktop applications to ensure system immutability and user safety.

---

## 2. Operating System Layered Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ENCANTOS OS USER SPACE APPLICATIONS                  │
│  Files · Store · Settings · Terminal · System Monitor · Disk Utility · Pad  │
├─────────────────────────────────────────────────────────────────────────────┤
│                       ENCANTOS DESKTOP ENVIRONMENT (EDE)                    │
│  Encantos Shell (Panel, Start Menu, Quick Settings, Notifications, Dock)     │
│  Window Manager / Compositor (Wayland / KWin / Labwc / Custom Glass Shell)   │
├─────────────────────────────────────────────────────────────────────────────┤
│                         DESKTOP SERVICES & APIS                             │
│  PipeWire (Audio/Video) · NetworkManager · BlueZ · UDisk2 · Polkit-1        │
│  Flatpak Portal · PackageKit Abstraction · FreeDesktop Standards            │
├─────────────────────────────────────────────────────────────────────────────┤
│                          GRAPHICAL SUBSYSTEM                                │
│  Wayland Compositor (Primary) / XWayland Fallback · Mesa 3D Drivers (Vulkan) │
├─────────────────────────────────────────────────────────────────────────────┤
│                       CORE OPERATING SYSTEM & INIT                          │
│  systemd (PID 1, journald, logind, resolved, udev, timesyncd)               │
├─────────────────────────────────────────────────────────────────────────────┤
│                       LINUX KERNEL & HARDWARE DRIVERS                       │
│  Linux Kernel 6.8.0-encantos-amd64 (Hardware Abstraction, DRM, KMS, ACPI)   │
├─────────────────────────────────────────────────────────────────────────────┤
│                       FIRMWARE & BOOTLOADER SUBSYSTEM                       │
│  GRUB 2.12 (Hybrid EFI x86_64 + BIOS MBR) · Plymouth Graphical Splash       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Subsystem Breakdown

### 3.1 Boot & Init Subsystem
- **Bootloader**: GRUB 2.12 with custom Encantos high-DPI theme (`grub-theme-encantos`), supporting secure NVMe boot, UEFI Boot Services, and Legacy BIOS MBR fallback via El Torito hybrid header.
- **Boot Splash**: Custom Plymouth graphical animation displaying the Encantos glowing compass emblem with subtle pulse effects, suppressing noisy kernel dmesg output unless `splash=silent` is removed or `Esc` is pressed.
- **Display Manager / Greeter**: LightDM with a custom WebKit/Qt6 greeter (`encantos-greeter`), featuring user avatars, multi-user switching, session switching (Encantos Wayland, Encantos X11, Recovery Shell), and system power controls.

### 3.2 Display Server & Window Management
- **Primary Compositor**: Wayland with hardware-accelerated EGL/Vulkan composition.
- **Window Management**: Encantos Compositor with automatic window snapping (half-screen, quadrants), fluid gesture handling, glassmorphic titlebar blur (via background-filter shaders), and low-latency buffer submission.
- **X11 Fallback**: Seamless XWayland integration for legacy Linux software and wine/gaming payloads.

### 3.3 Audio & Multimedia
- **Server**: PipeWire 1.0+ with `wireplumber` session manager.
- **Subsystem Compatibility**: Full ALSA, PulseAudio, and JACK emulations, enabling low-latency pro-audio routing and automatic Bluetooth codec negotiation (LDAC, AAC, aptX HD, SBC-XQ).

### 3.4 Hardware & Network Management
- **Networking**: NetworkManager 1.46+ managing Wi-Fi (802.11ax/ac/n), Gigabit Ethernet, WireGuard VPNs, and mobile broadband.
- **Bluetooth**: BlueZ 5.72+ with automated pairing agent and battery telemetry.
- **Storage & Auto-Mount**: `udisks2` and `gvfs` for automatic USB thumb drive, external SSD, and camera mounting with user desktop notifications.

---

## 4. Software Center & Package Management Architecture

The **ENCANTOS STORE** abstracts low-level Linux package management commands so users never need to open a terminal to install software, while retaining complete system integrity:

```
                  ┌───────────────────────────────┐
                  │        ENCANTOS STORE UI       │
                  │ (Search, Browse, 1-Click Ops) │
                  └───────────────┬───────────────┘
                                  │
                  ┌───────────────▼───────────────┐
                  │    Encantos Packaging Engine   │
                  │   (PackageKit & Flatpak D-Bus)│
                  └───────┬───────────────┬───────┘
                          │               │
       ┌──────────────────▼──┐         ┌──▼──────────────────┐
       │   Flatpak Runtime   │         │   APT / DPKG Core   │
       │  (Desktop Apps)     │         │ (System & Drivers)  │
       │  - Flathub Repo     │         │ - Encantos OS Repo  │
       │  - Sandboxed        │         │ - Debian 13 Base    │
       │  - Zero Conflicts   │         │ - Kernel Updates    │
       └─────────────────────┘         └─────────────────────┘
```

---

## 5. File Manager Architecture (ENCANTOS FILES)

- Built compliant with FreeDesktop.org (XDG) specifications: `~/.config/user-dirs.dirs`.
- Supports virtual filesystem mounts (`gvfs`, `mtp`, `sftp`, `smb`), archive creation/extraction (zip, tar.xz, 7z), metadata preview extraction, and Trash management adhering to the FreeDesktop Trash specification.

---

## 6. Installer Architecture (Calamares Integration)

Encantos OS uses a customized Calamares 3.3+ installer engine with an original QML/C++ theme:
1. **Language & Locale**: Real-time timezone and locale synchronization.
2. **Keyboard Layout**: Interactive test field with visual keyboard mapping.
3. **Partitioning**:
   - Automated: "Erase entire disk" with GPT partitioning (512MB EFI FAT32 + root Ext4/Btrfs + swap).
   - Dual-Boot: "Install alongside existing OS" with safe non-destructive partition shrinking.
   - Manual: Advanced GParted-style custom mountpoint assigner.
4. **User Creation**: Password hashing with SHA-512 crypt, optional sudo/admin privilege assignment, and optional automatic login.
5. **Execution Sequence**:
   - `mount` target disk mounts
   - `unpackfs` extracts squashfs rootfs image to target disk
   - `machineid` / `fstab` generation
   - `chroot` hooks: configure locales, keyboard, users, network
   - `grub` install to EFI partition or MBR
   - `umount` clean unmount and reboot prompt

---

## 7. Component Complexity & Module Readiness

| Module | Core Technology | Complexity | Status |
|:---|:---|:---:|:---:|
| **ISO Build Pipeline** | debootstrap + live-build + xorriso | High | Ready & Automated |
| **Bootloader & Splash** | GRUB 2.12 + Plymouth custom theme | Medium | Ready |
| **Desktop Shell** | Encantos Shell (Wayland/Qt/HTML5 WebKit) | High | Ready & Interactive |
| **Encantos Files** | VFS + FreeDesktop MIME + File watcher | Medium | Ready |
| **Encantos Store** | Flatpak D-Bus + PackageKit daemon | High | Ready |
| **Encantos Settings** | systemd-logind + NetworkManager + BlueZ | Medium | Ready |
| **Encantos Terminal** | PTY shell + POSIX command parser | Medium | Ready |
| **System Monitor** | /proc & /sys parser + task manager | Low | Ready |
| **Disk Utility** | parted + udisks2 + SMART monitoring | Medium | Ready |
| **Calamares Installer** | Calamares 3.3 QML/C++ profile | High | Ready |
