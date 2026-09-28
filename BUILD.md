# ENCANTOS OS — ISO Build & Toolchain Guide

This document describes how to compile, configure, and output the bootable `encantos-os-1.0.0-amd64.iso` image using the automated build script.

---

## 1. Build Host Requirements

- **Operating System:** Debian 12/13, Ubuntu 22.04/24.04 LTS, or Arch Linux
- **Architecture:** x86_64 host with root/sudo privileges
- **Storage:** At least 25 GB free disk space in the build volume
- **Internet Connection:** High-speed connection to fetch upstream Debian packages

---

## 2. Installing Host Toolchain

```bash
sudo apt-get update
sudo apt-get install -y \
    debootstrap \
    squashfs-tools \
    xorriso \
    grub-pc-bin \
    grub-efi-amd64-bin \
    isolinux \
    syslinux-common \
    dosfstools \
    parted \
    qemu-system-x86 \
    ovmf
```

---

## 3. Running the Automated Build

Execute the build script with root privileges:

```bash
chmod +x build-encantos.sh
sudo ./build-encantos.sh
```

### Build Pipeline Stages:
1. `check_dependencies`: Validates that `debootstrap`, `mksquashfs`, `xorriso`, and GRUB binaries are installed.
2. `init_dirs`: Prepares `build_work/chroot`, `build_work/binary/live`, and `build/`.
3. `bootstrap_system`: Downloads the minimal Debian root filesystem.
4. `configure_rootfs`: Installs the Linux 6.8 kernel, systemd init, NetworkManager, PipeWire, graphics drivers, Plymouth theme, Calamares installer, and Encantos Desktop Environment.
5. `build_squashfs`: Compresses the root filesystem using high-ratio XZ compression.
6. `configure_bootloader`: Generates GRUB 2.12 UEFI/BIOS hybrid configs with Encantos graphical theme.
7. `generate_iso`: Invokes `xorriso` to create an EFI-bootable hybrid ISO and generates `encantos-os-1.0.0-amd64.iso.sha256`.

---

## 4. Validating the ISO in QEMU

Run the built ISO immediately:

```bash
chmod +x test-qemu.sh
./test-qemu.sh
```
