#!/usr/bin/env bash
# ==============================================================================
# ENCANTOS OS — QEMU / KVM Virtual Machine Test Runner
# Boots the generated ISO with UEFI OVMF, VirtIO graphics, and hardware acceleration
# ==============================================================================

set -euo pipefail

ISO_PATH="build/encantos-os-1.0.0-amd64.iso"
RAM="4096"
CPUS="4"
DISK_IMAGE="build/test-disk.qcow2"

echo "=== ENCANTOS OS VIRTUAL MACHINE TESTER ==="

if [ ! -f "${ISO_PATH}" ]; then
    echo "Warning: ISO file '${ISO_PATH}' not found. Please run ./build-encantos.sh first."
fi

# Create test virtual hard disk if missing (30GB sparse image)
if [ ! -f "${DISK_IMAGE}" ]; then
    echo "Creating virtual test hard drive (30GB qcow2)..."
    qemu-img create -f qcow2 "${DISK_IMAGE}" 30G
fi

# Detect KVM hardware acceleration
ACCEL=""
if [ -w /dev/kvm ]; then
    ACCEL="-enable-kvm -cpu host"
    echo "KVM hardware acceleration: ENABLED"
else
    ACCEL="-cpu qemu64"
    echo "KVM acceleration not available; falling back to software emulation."
fi

echo "Launching QEMU Virtual Machine with 4GB RAM, 4 vCPUs, VirtIO Network & Audio..."

exec qemu-system-x86_64 \
    ${ACCEL} \
    -m "${RAM}" \
    -smp "${CPUS}" \
    -vga virtio \
    -display gtk,gl=on \
    -device virtio-net-pci,netdev=net0 \
    -netdev user,id=net0 \
    -device intel-hda -device hda-duplex \
    -drive file="${DISK_IMAGE}",if=virtio,format=qcow2 \
    -cdrom "${ISO_PATH}" \
    -boot d \
    -name "ENCANTOS OS 1.0.0 Live Session"
