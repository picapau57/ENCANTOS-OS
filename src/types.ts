export type WindowId = 
  | 'files'
  | 'store'
  | 'settings'
  | 'terminal'
  | 'system-monitor'
  | 'disk-utility'
  | 'installer'
  | 'update-center'
  | 'backup'
  | 'pad'
  | 'calculator'
  | 'image-viewer'
  | 'iso-studio'
  | 'iso-generator';

export interface WindowState {
  id: WindowId;
  title: string;
  iconName: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  prevBounds?: { x: number; y: number; width: number; height: number };
  extraProps?: Record<string, any>;
}

export interface FsItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  path: string;
  size?: string;
  modified: string;
  content?: string;
  icon?: string;
  isProtected?: boolean;
}

export interface StoreApp {
  id: string;
  name: string;
  tagline: string;
  category: 'Internet' | 'Development' | 'Graphics' | 'Multimedia' | 'Productivity' | 'Utilities' | 'Games' | 'Security';
  description: string;
  features?: string[];
  version: string;
  size: string;
  developer: string;
  license: string;
  format: 'Flatpak' | 'Native (.deb)' | 'CLI Package';
  permissions: string[];
  installed: boolean;
  isInstalling?: boolean;
  installProgress?: number;
  installPhase?: 'downloading' | 'installing' | 'configuring' | 'completed';
  icon: string;
  rating: number;
  reviewsCount: number;
  downloadsCount?: string;
  isUtility?: boolean;
  windowId?: WindowId;
}

export type ThemeMode = 'dark' | 'light';

export interface AccentColor {
  id: string;
  name: string;
  hex: string;
  tailwindClass: string;
  glowClass: string;
}

export interface SystemSettings {
  theme: ThemeMode;
  accentColor: string;
  wallpaper: string;
  volume: number;
  isMuted: boolean;
  brightness: number;
  wifiEnabled: boolean;
  wifiConnectedSsid: string | null;
  bluetoothEnabled: boolean;
  bluetoothConnectedDevice: string | null;
  nightLight: boolean;
  nightLightIntensity: number;
  doNotDisturb: boolean;
  resolution: string;
  refreshRate: string;
  uiScale: number;
  language: 'en' | 'pt-BR' | 'es' | 'fr' | 'de' | 'ja';
  timezone: string;
  timeFormat: '12h' | '24h';
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  autoTimeSync: boolean;
  firstDayOfWeek: 'monday' | 'sunday';
  firewallEnabled: boolean;
  soundOutputDevice: string;
  soundInputDevice: string;
  taskbarPosition: 'bottom' | 'top';
  username: string;
  hostname: string;
}

export interface BatteryState {
  level: number; // 0 - 100
  isCharging: boolean;
  powerMode: 'balanced' | 'power-saver' | 'performance';
  health: number; // e.g. 98%
  voltage: string; // e.g. "11.4 V"
}

export interface ProcessItem {
  pid: number;
  name: string;
  cpu: number;
  memoryMb: number;
  user: string;
  status: 'Running' | 'Sleeping' | 'Idle';
}

export interface SystemMetrics {
  cpuPercent: number;
  ramPercent: number;
  ramUsedGb: number;
  ramTotalGb: number;
  diskUsageGb: number;
  totalDiskGb: number;
  diskPercent: number;
  diskReadMb: number;
  diskWriteMb: number;
  netDownloadKb: number;
  netUploadKb: number;
  cpuTemp: number;
  cpuFrequencyGhz: number;
  loadAverage: [number, number, number];
  uptimeSeconds: number;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category?: 'battery' | 'network' | 'app' | 'system' | 'security';
  appIcon?: string;
  targetWindowId?: WindowId;
  actionLabel?: string;
  read: boolean;
  duration?: number;
}
