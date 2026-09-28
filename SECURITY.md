# ENCANTOS OS — Security Architecture & Policy

ENCANTOS OS is architected following the principle of least privilege, strict process isolation, and verified package integrity.

---

## 1. Security Foundations

- **Kernel Hardening**: Linux kernel boots with `slab_nomerge`, `init_on_alloc=1`, `pti=on`, and `lockdown=integrity` for UEFI secure mode.
- **Firewall by Default**: Encantos OS enables `ufw` (Uncomplicated Firewall) out of the box with `default deny incoming` and `default allow outgoing`.
- **Sandboxed Applications**: Desktop applications installed via Encantos Store utilize Flatpak bubblewrap (`bwrap`) containers. Applications cannot access private user folders, webcam, microphone, or network without explicit portal permission grants.
- **Privilege Elevation**: No user runs as root by default. Administrative actions require explicit Polkit-1 GUI elevation or `sudo` authentication with PAM time-outs.
- **Immutable System Core**: System libraries in `/usr` are strictly managed by APT/DPKG package managers and marked read-only during normal desktop usage.

---

## 2. Privacy Policy

- **Zero Telemetry**: Encantos OS does not collect, transmit, or monetize user usage statistics, keystrokes, application launches, or hardware telemetry.
- **No Remote Identifiers**: The system generates no persistent hardware GUIDs sent to third-party servers.
- **Encrypted Local Credentials**: User passwords are stored using SHA-512 with random cryptographic salt via shadow password hashing.
