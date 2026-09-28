# ENCANTOS OS — Official Installation Guide

## System Requirements

### Minimum Specifications
- **Processor:** 64-bit Dual-Core x86_64 CPU (1.8 GHz or faster)
- **Memory (RAM):** 4 GB DDR3/DDR4
- **Storage:** 25 GB free disk space (SSD recommended)
- **Graphics:** Intel HD Graphics 4000, AMD Radeon R5, or NVIDIA GeForce 600 series (DirectX 11 / OpenGL 3.3 compatible)
- **Display:** 1280 x 720 resolution
- **Boot:** UEFI or Legacy BIOS bootable USB port

### Recommended Specifications
- **Processor:** 64-bit Quad-Core CPU (Intel Core i5 / AMD Ryzen 5 or better)
- **Memory (RAM):** 8 GB or 16 GB DDR4/DDR5
- **Storage:** 50 GB NVMe PCIe SSD
- **Graphics:** Modern Intel Iris Xe / AMD Radeon Vega / NVIDIA GTX 1050+ (Vulkan 1.3 support)
- **Display:** 1920 x 1080 (Full HD) or higher

---

## 1. Creating Bootable USB Media

### On Linux (Terminal via dd)
Replace `/dev/sdX` with your USB drive's block device name (use `lsblk` to verify):
```bash
sudo dd if=encantos-os-1.0.0-amd64.iso of=/dev/sdX bs=4M status=progress conv=fdatasync
```

### On Windows
1. Download **Rufus** (or **Ventoy**).
2. Insert your USB flash drive (minimum 8 GB).
3. Select `encantos-os-1.0.0-amd64.iso`.
4. Partition scheme: **GPT** (for UEFI) or **MBR** (for older BIOS).
5. Click **Start** in ISO Image mode.

---

## 2. Booting ENCANTOS OS

1. Insert the bootable USB flash drive into your computer.
2. Turn on the machine and repeatedly press your motherboard's Boot Menu key:
   - **ASUS / F8**
   - **Dell / F12**
   - **HP / F9 or Esc**
   - **Lenovo / F12 or Novo Button**
   - **Acer / F12**
3. Select your USB device prefixed with **UEFI:**.
4. Select **"ENCANTOS OS 1.0.0 Live"** in the bootloader menu.

---

## 3. The Installation Wizard (Calamares)

Once booted into the Live Desktop, you can explore the system without altering your hard drive. When you are ready:

1. Double-click the **"Install ENCANTOS OS"** icon on the desktop.
2. **Language**: Choose your preferred language (English, Português do Brasil, Español).
3. **Time Zone**: Select your location on the interactive world map.
4. **Keyboard**: Choose your keyboard model and layout (e.g., ABNT2, US-International).
5. **Partitions**:
   - **Erase disk**: Automatically formats the entire drive with an EFI partition (512MB FAT32), root partition (Ext4), and optional swap.
   - **Install alongside**: Shrinks an existing Windows or Linux partition to install Encantos OS in dual-boot mode.
   - **Manual partitioning**: Custom partition setup with Btrfs/Ext4 subvolumes.
6. **User Account**: Enter your name, username, computer name, and secure password. Choose whether to require a password to log in and whether this account has administrator (sudo) privileges.
7. **Summary & Install**: Review your settings, then click **Install Now**.
8. **Reboot**: Once completed, remove the USB drive and press Enter to boot into your new ENCANTOS OS installation!
