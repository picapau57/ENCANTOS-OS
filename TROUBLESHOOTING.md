# ENCANTOS OS — Troubleshooting & Diagnostics Guide

This document resolves common issues encountered during ISO creation, virtual machine testing, and physical PC hardware installation.

---

## 1. Virtual Machine Diagnostics

### VirtualBox
- **Black Screen or Freeze on Boot:**
  * Go to **Settings > System > Motherboard** and check **Enable EFI (special OSes only)**.
  * Go to **Settings > Display** and increase Video Memory to **128 MB**. Set Graphics Controller to **VBoxSVGA** (with 3D Acceleration enabled).
- **Audio Distortion:**
  * Set Audio Controller to **Intel HD Audio**.

### VMware Workstation / Player
- **Resolution Stuck in Low-DPI Mode:**
  * Ensure `open-vm-tools-desktop` is loaded in the guest. Encantos OS automatically detects VMware hypervisors and starts the guest service daemon.
- **Enable UEFI Boot:**
  * Open the `.vmx` file and append: `firmware = "efi"`.

### QEMU / KVM
- If boot fails with missing OVMF firmware:
  ```bash
  sudo apt-get install ovmf
  ./test-qemu.sh
  ```

---

## 2. Physical PC & Hardware Diagnostics

### Black Screen after GRUB Bootloader
If your graphics card (e.g. newer NVIDIA RTX series or hybrid dual-GPU laptops) displays a black screen:
1. In the GRUB menu, highlight **ENCANTOS OS 1.0.0 Live**.
2. Press `e` to edit boot parameters.
3. Locate the line ending with `quiet splash`.
4. Append `nomodeset` or `nouveau.modeset=0`.
5. Press `F10` or `Ctrl+X` to boot with generic VESA/Framebuffer fallback.
6. Once on the desktop, open **Encantos Store > Drivers** to install proprietary NVIDIA modules.

### Wi-Fi Adapter Not Detected
Encantos OS bundles the `non-free-firmware` repository (Realtek, Intel, Broadcom, Atheros). If an older Broadcom card is present:
```bash
sudo apt update
sudo apt install -y broadcom-sta-dkms
sudo modprobe wl
```

### USB Flash Drive Does Not Boot
- Ensure the USB drive was written with `dd` or **Rufus** using the **DD Image** mode (or Ventoy with UEFI support enabled).
- Verify that your BIOS/UEFI has disabled **Intel RST / RAID** in favor of **AHCI/NVMe** mode.
