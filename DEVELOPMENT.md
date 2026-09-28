# ENCANTOS OS — Development & Packaging Guide

This guide details how to develop custom applications, modify the Encantos Desktop Environment (EDE), customize branding, create Flatpaks, and build Debian `.deb` packages for ENCANTOS OS.

---

## 1. Directory Layout

```
encantos-os/
├── build/                # Output ISOs and sha256 checksums
├── build-encantos.sh     # Primary automated ISO build pipeline
├── test-qemu.sh          # QEMU / KVM test script
├── config/
│   ├── calamares/        # Calamares installer configuration & branding
│   └── live-build/       # Debootstrap hooks and package lists
├── src/                  # Encantos Desktop Environment (EDE) WebKit/Wayland Shell
│   ├── assets/           # High-resolution original wallpapers and vector logos
│   ├── components/
│   │   ├── apps/         # Native application suite (Files, Store, Settings, etc.)
│   │   └── desktop/      # Window manager, Taskbar, Start Menu, Panels
│   └── context/          # System session and virtual bus state
├── ARCHITECTURE.md       # Full architectural blueprint
├── BUILD.md              # ISO compilation documentation
├── INSTALLATION.md       # Physical and VM installation guide
├── SECURITY.md           # Security model and sandboxing policies
└── TROUBLESHOOTING.md    # Hardware and virtualization diagnostics
```

---

## 2. Packaging Desktop Applications

### Native Debian Package (`.deb`)
Native packages are built using `dpkg-deb`:
```bash
mkdir -p myapp-1.0.0/DEBIAN
mkdir -p myapp-1.0.0/usr/bin
mkdir -p myapp-1.0.0/usr/share/applications

cat <<EOF > myapp-1.0.0/DEBIAN/control
Package: myapp
Version: 1.0.0
Architecture: amd64
Maintainer: Encantos Developers <dev@encantos-os.org>
Description: High-performance native utility for Encantos OS
EOF

dpkg-deb --build myapp-1.0.0
```

### Flatpak Application Packaging
Desktop applications in the Encantos Store run in isolated bubblewrap containers using FreeDesktop SDK:
```bash
flatpak-builder --force-clean build-dir org.encantos.MyApp.yaml
flatpak build-export repo build-dir
flatpak install repo org.encantos.MyApp
```

---

## 3. Customizing Desktop Themes and Wallpapers
Wallpapers are stored in `/usr/share/encantos/wallpapers/` and registered with the XDG wallpaper portal.
Icons conform to the FreeDesktop Icon Theme Specification with SVG assets located in `/usr/share/icons/encantos-aurora/`.
