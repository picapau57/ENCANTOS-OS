import React, { useState, useEffect } from 'react';
import { 
  Laptop, Palette, Wifi, Bluetooth, Volume2, Monitor, Shield, 
  User, Globe, Info, RefreshCw, CheckCircle2, Sliders, Moon, Sun, 
  VolumeX, HardDrive, Check, Play, Bell, Clock, Calendar, 
  Sparkles, CheckCheck, ToggleLeft, ToggleRight, ArrowRight,
  ShieldCheck, Lock, Radio
} from 'lucide-react';
import { useSystem, WALLPAPERS, ACCENT_COLORS } from '../../context/SystemContext';

export const EncantosSettings: React.FC = () => {
  const { settings, updateSettings, playTestAudio, openWindow, addNotification } = useSystem();
  const [activeSection, setActiveSection] = useState<string>('general');
  const [wifiPasswordPrompt, setWifiPasswordPrompt] = useState<string | null>(null);
  const [enteredWifiPassword, setEnteredWifiPassword] = useState('');
  const [audioTesting, setAudioTesting] = useState(false);
  const [currentTimePreview, setCurrentTimePreview] = useState<Date>(new Date());

  // Clock tick for live preview in Regional settings
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimePreview(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sections = [
    { id: 'general', name: 'General Preferences', icon: Sliders },
    { id: 'personalization', name: 'Personalization & Theme', icon: Palette },
    { id: 'display', name: 'Display & Night Light', icon: Monitor },
    { id: 'sound', name: 'Sound & Audio', icon: Volume2 },
    { id: 'network', name: 'Network & Wi-Fi', icon: Wifi },
    { id: 'bluetooth', name: 'Bluetooth Devices', icon: Bluetooth },
    { id: 'accounts', name: 'User Accounts', icon: User },
    { id: 'security', name: 'Security & Firewall', icon: Shield },
    { id: 'about', name: 'System & About', icon: Laptop },
  ];

  const handleAudioTest = () => {
    setAudioTesting(true);
    playTestAudio();
    setTimeout(() => setAudioTesting(false), 600);
  };

  const handleThemeChange = (theme: 'dark' | 'light') => {
    updateSettings({ theme });
    addNotification({
      title: 'Theme Preference Applied',
      message: `System appearance updated to ${theme.toUpperCase()} mode.`,
      type: 'info'
    });
  };

  // Locale configuration helpers
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'pt-BR': 'pt-BR',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'ja': 'ja-JP'
  };
  const activeLocale = localeMap[settings.language] || 'en-US';

  // Format live preview according to current settings
  const is12Hour = settings.timeFormat === '12h';
  const previewTime = currentTimePreview.toLocaleTimeString(activeLocale, {
    timeZone: settings.timezone || undefined,
    hour: is12Hour ? 'numeric' : '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: is12Hour
  });

  const previewDate = currentTimePreview.toLocaleDateString(activeLocale, {
    timeZone: settings.timezone || undefined,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currencyMap: Record<string, string> = {
    'en': '$1,234.56 USD',
    'pt-BR': 'R$ 1.234,56 BRL',
    'es': '$1.234,56 USD / €',
    'fr': '1 234,56 € EUR',
    'de': '1.234,56 € EUR',
    'ja': '¥1,234 JPY'
  };

  return (
    <div className="flex h-full bg-slate-900/95 text-slate-200 select-none overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-60 bg-slate-950/70 border-r border-slate-800 p-3 flex flex-col gap-1 text-xs shrink-0 overflow-y-auto">
        <div className="px-3 py-2.5 text-xs font-bold text-white flex items-center gap-2 mb-1.5 border-b border-slate-800/80">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sliders className="w-3 h-3" />
          </div>
          <span className="tracking-wide">ENCANTOS SETTINGS</span>
        </div>

        {sections.map(sec => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                isActive 
                  ? 'bg-violet-600 text-white font-semibold shadow-md shadow-violet-600/25 ring-1 ring-violet-400/40' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{sec.name}</span>
            </button>
          );
        })}

        <div className="mt-auto pt-3 border-t border-slate-800/80 px-2 text-[10px] text-slate-500">
          ENCANTOS Desktop v1.0.0
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* SECTION: GENERAL PREFERENCES */}
        {activeSection === 'general' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-violet-400" />
                <span>General System Preferences</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage system appearance theme, user interface language, and regional date and time standards.
              </p>
            </div>

            {/* 1. SYSTEM THEME SELECTOR */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white text-xs">System Theme & Color Mode</h3>
                  <p className="text-[11px] text-slate-400">Choose between dark obsidian glass or high-contrast light mode</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold bg-violet-600/20 text-violet-300 border border-violet-500/30">
                  {settings.theme === 'dark' ? 'Dark Obsidian Active' : 'Light Crystal Active'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* Dark Theme Card */}
                <div
                  onClick={() => handleThemeChange('dark')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                    settings.theme === 'dark'
                      ? 'bg-slate-900 border-violet-500 ring-2 ring-violet-500/30 shadow-lg'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="h-16 rounded-lg bg-slate-950 border border-slate-800 p-2 flex flex-col justify-between mb-2.5 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <Moon className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 bg-slate-800 rounded w-3/4" />
                      <div className="h-1.5 bg-violet-600/50 rounded w-1/2" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-violet-400" />
                        <span>Dark Mode</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Deep obsidian glass & vibrant neon glow</span>
                    </div>
                    {settings.theme === 'dark' && (
                      <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Light Theme Card */}
                <div
                  onClick={() => handleThemeChange('light')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                    settings.theme === 'light'
                      ? 'bg-slate-900 border-violet-500 ring-2 ring-violet-500/30 shadow-lg'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="h-16 rounded-lg bg-slate-100 border border-slate-300 p-2 flex flex-col justify-between mb-2.5 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 bg-slate-300 rounded w-3/4" />
                      <div className="h-1.5 bg-sky-500/50 rounded w-1/2" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        <span>Light Mode</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Clean luminous glass & high readability</span>
                    </div>
                    {settings.theme === 'light' && (
                      <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. DISPLAY LANGUAGE PREFERENCE */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div>
                <h3 className="font-semibold text-white text-xs flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <span>Display Language & Localization</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Select the primary language for window titles, dialogs, desktop menus, and system applications.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'en', flag: '🇺🇸', name: 'English', region: 'United States', tag: 'en_US.UTF-8' },
                  { id: 'pt-BR', flag: '🇧🇷', name: 'Português', region: 'Brasil', tag: 'pt_BR.UTF-8' },
                  { id: 'es', flag: '🇪🇸', name: 'Español', region: 'Latinoamérica', tag: 'es_ES.UTF-8' },
                  { id: 'fr', flag: '🇫🇷', name: 'Français', region: 'France', tag: 'fr_FR.UTF-8' },
                  { id: 'de', flag: '🇩🇪', name: 'Deutsch', region: 'Deutschland', tag: 'de_DE.UTF-8' },
                  { id: 'ja', flag: '🇯🇵', name: '日本語', region: 'Japan (日本)', tag: 'ja_JP.UTF-8' },
                ].map(lang => {
                  const isSelected = settings.language === lang.id;
                  return (
                    <div
                      key={lang.id}
                      onClick={() => {
                        updateSettings({ language: lang.id as any });
                        addNotification({
                          title: 'Language Updated',
                          message: `System UI language changed to ${lang.name} (${lang.region}).`,
                          type: 'success'
                        });
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-violet-600/20 border-violet-500 ring-1 ring-violet-500/30'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl leading-none">{lang.flag}</span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center text-white text-[10px]">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="font-semibold text-white text-xs">{lang.name}</div>
                        <div className="text-[10px] text-slate-400">{lang.region}</div>
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">{lang.tag}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. REGIONAL TIME & DATE PREFERENCES */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div>
                <h3 className="font-semibold text-white text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Regional Time & Date Settings</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Configure time zone, 12h/24h time format, calendar standards, and network time synchronization.
                </p>
              </div>

              {/* Live Preview Box */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-indigo-950/40 border border-violet-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-semibold">
                    Current Regional Preview
                  </span>
                  <div className="text-lg font-bold font-mono text-white tracking-wide mt-0.5">
                    {previewTime}
                  </div>
                  <div className="text-xs text-slate-300 capitalize">
                    {previewDate}
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="text-[10px] text-slate-400 font-mono">
                    Timezone: <span className="text-white font-semibold">{settings.timezone}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Currency: <span className="text-emerald-400">{currencyMap[settings.language] || '$1,234.56'}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    First Day: <span className="text-cyan-400 capitalize">{settings.firstDayOfWeek}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5 pt-1 text-xs">
                {/* Timezone Selector */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">System Timezone</div>
                    <div className="text-[11px] text-slate-400">Local geographic reference zone</div>
                  </div>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSettings({ timezone: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="America/Sao_Paulo">America/Sao_Paulo (UTC-03:00 - Brasília)</option>
                    <option value="America/New_York">America/New_York (UTC-05:00 - Eastern Time)</option>
                    <option value="America/Chicago">America/Chicago (UTC-06:00 - Central Time)</option>
                    <option value="America/Denver">America/Denver (UTC-07:00 - Mountain Time)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (UTC-08:00 - Pacific Time)</option>
                    <option value="Europe/London">Europe/London (UTC+00:00 - Greenwich Mean Time)</option>
                    <option value="Europe/Paris">Europe/Paris (UTC+01:00 - Central European Time)</option>
                    <option value="Europe/Berlin">Europe/Berlin (UTC+01:00 - Central European Time)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (UTC+09:00 - Japan Standard Time)</option>
                    <option value="Asia/Shanghai">Asia/Shanghai (UTC+08:00 - China Standard Time)</option>
                    <option value="Australia/Sydney">Australia/Sydney (UTC+10:00 - Australian Eastern)</option>
                    <option value="UTC">UTC (Universal Coordinated Time +00:00)</option>
                  </select>
                </div>

                {/* 12-Hour vs 24-Hour Time Format */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div>
                    <div className="font-semibold text-white">Clock Time Format</div>
                    <div className="text-[11px] text-slate-400">Choose 24-hour military notation or 12-hour AM/PM</div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => updateSettings({ timeFormat: '24h' })}
                      className={`px-3 py-1 rounded-md transition-colors cursor-pointer text-xs font-mono ${
                        settings.timeFormat === '24h'
                          ? 'bg-violet-600 text-white font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      24-Hour (14:30)
                    </button>
                    <button
                      onClick={() => updateSettings({ timeFormat: '12h' })}
                      className={`px-3 py-1 rounded-md transition-colors cursor-pointer text-xs font-mono ${
                        settings.timeFormat === '12h'
                          ? 'bg-violet-600 text-white font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      12-Hour (2:30 PM)
                    </button>
                  </div>
                </div>

                {/* Date Format Standard */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div>
                    <div className="font-semibold text-white">Date Format Standard</div>
                    <div className="text-[11px] text-slate-400">Numerical order for calendar & taskbar tooltips</div>
                  </div>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => updateSettings({ dateFormat: e.target.value as any })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601 · 2026-09-26)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (European / Latin · 26/09/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard · 09/26/2026)</option>
                  </select>
                </div>

                {/* First Day of the Week */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div>
                    <div className="font-semibold text-white">First Day of the Week</div>
                    <div className="text-[11px] text-slate-400">Determines start column in Calendar widget</div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => updateSettings({ firstDayOfWeek: 'monday' })}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-xs ${
                        settings.firstDayOfWeek === 'monday'
                          ? 'bg-violet-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Monday
                    </button>
                    <button
                      onClick={() => updateSettings({ firstDayOfWeek: 'sunday' })}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-xs ${
                        settings.firstDayOfWeek === 'sunday'
                          ? 'bg-violet-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Sunday
                    </button>
                  </div>
                </div>

                {/* Automatic Network Time Sync */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">Automatic Network Time Sync (NTP)</div>
                      <div className="text-[11px] text-slate-400">
                        Synchronize clock with systemd-timesyncd (pool.ntp.org)
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoTimeSync}
                    onChange={(e) => updateSettings({ autoTimeSync: e.target.checked })}
                    className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: PERSONALIZATION & THEME */}
        {activeSection === 'personalization' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">Personalization & Appearance</h2>
              <p className="text-xs text-slate-400">Customize wallpapers, accent highlights, and taskbar layout.</p>
            </div>

            {/* Wallpapers */}
            <div className="space-y-3">
              <h3 className="font-semibold text-white text-xs">Desktop Wallpaper</h3>
              <div className="grid grid-cols-3 gap-3">
                {WALLPAPERS.map(wp => {
                  const isSelected = settings.wallpaper === wp.id;
                  return (
                    <div
                      key={wp.id}
                      onClick={() => {
                        updateSettings({ wallpaper: wp.id });
                        addNotification({
                          title: 'Wallpaper Updated',
                          message: `Background changed to "${wp.name}".`,
                          type: 'info'
                        });
                      }}
                      className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-violet-500 ring-2 ring-violet-500/40 shadow-lg' 
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div
                        className="h-24 w-full"
                        style={{
                          background: wp.isGradient ? wp.url : `url(${wp.url}) center/cover no-repeat`
                        }}
                      />
                      <div className="p-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="truncate text-slate-200">{wp.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accent Colors */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h3 className="font-semibold text-white text-xs">System Accent Color</h3>
              <div className="flex items-center gap-3">
                {ACCENT_COLORS.map(color => {
                  const isSelected = settings.accentColor === color.hex;
                  return (
                    <button
                      key={color.id}
                      onClick={() => updateSettings({ accentColor: color.hex })}
                      className="group relative flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                          isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : ''
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-[10px] text-slate-400">{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: DISPLAY */}
        {activeSection === 'display' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">Display & Visual Ergonomics</h2>
              <p className="text-xs text-slate-400">Wayland compositor resolution, refresh rate, and blue light filtration.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Display Resolution</div>
                  <div className="text-slate-500">Wayland native mode (16:9 Aspect Ratio)</div>
                </div>
                <select
                  value={settings.resolution}
                  onChange={(e) => updateSettings({ resolution: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="1920x1080 (16:9)">1920 x 1080 (FHD 16:9)</option>
                  <option value="2560x1440 (16:9)">2560 x 1440 (QHD 2K)</option>
                  <option value="3840x2160 (16:9)">3840 x 2160 (4K UHD)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Refresh Rate</div>
                  <div className="text-slate-500">Adaptive sync capability</div>
                </div>
                <select
                  value={settings.refreshRate}
                  onChange={(e) => updateSettings({ refreshRate: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="60 Hz">60 Hz (Standard)</option>
                  <option value="120 Hz">120 Hz (High Smoothness)</option>
                  <option value="144 Hz">144 Hz (Fluid Gaming)</option>
                </select>
              </div>

              {/* Night Light */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-semibold text-white">Night Light Filter</div>
                      <div className="text-slate-500">Reduces blue light output for reduced eye fatigue</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.nightLight}
                    onChange={(e) => updateSettings({ nightLight: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                {settings.nightLight && (
                  <div className="space-y-1 pl-6">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Color Warmth Intensity</span>
                      <span>{settings.nightLightIntensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={settings.nightLightIntensity}
                      onChange={(e) => updateSettings({ nightLightIntensity: Number(e.target.value) })}
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: SOUND & AUDIO */}
        {activeSection === 'sound' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">Sound & Audio Management</h2>
              <p className="text-xs text-slate-400">PipeWire and WirePlumber low-latency audio engine controls.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {settings.isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-violet-400" />}
                    <span className="font-semibold text-white">Master Output Volume</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateSettings({ isMuted: !settings.isMuted })}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {settings.isMuted ? 'Unmute' : 'Mute'}
                    </button>
                    <span className="font-mono text-violet-400 font-bold">{settings.isMuted ? 'MUTED' : `${settings.volume}%`}</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.isMuted ? 0 : settings.volume}
                  onChange={(e) => updateSettings({ volume: Number(e.target.value), isMuted: false })}
                  className="w-full accent-violet-600 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Test Audio Synthesizer</div>
                  <div className="text-slate-500">Play an electronic 3-tone harmonic test chime</div>
                </div>
                <button
                  onClick={handleAudioTest}
                  disabled={audioTesting}
                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>{audioTesting ? 'Testing...' : 'Play Test Sound'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: NETWORK & WI-FI */}
        {activeSection === 'network' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">Network & Wi-Fi</h2>
              <p className="text-xs text-slate-400">NetworkManager configuration and active wireless connection.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Wifi className="w-4 h-4 text-violet-400" />
                  <div>
                    <div className="font-semibold text-white">Wi-Fi Wireless Networking</div>
                    <div className="text-slate-500">{settings.wifiEnabled ? 'Active and broadcasting' : 'Turned off'}</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.wifiEnabled}
                  onChange={(e) => updateSettings({ wifiEnabled: e.target.checked })}
                  className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                />
              </div>

              {settings.wifiEnabled && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400">Available Wireless Networks</span>
                  <div className="divide-y divide-slate-800/60 rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60">
                    {[
                      { ssid: 'Encantos_HighSpeed_5G', signal: '100%', freq: '5 GHz', secured: true },
                      { ssid: 'Encantos_Campus_Fast', signal: '88%', freq: '5 GHz', secured: true },
                      { ssid: 'Starlink_Orbit_Guest', signal: '64%', freq: '2.4 GHz', secured: false }
                    ].map(net => {
                      const isConnected = settings.wifiConnectedSsid === net.ssid;
                      return (
                        <div key={net.ssid} className="p-3 flex items-center justify-between hover:bg-slate-800/40">
                          <div className="flex items-center gap-2.5">
                            <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
                            <div>
                              <div className="font-semibold text-white flex items-center gap-2">
                                <span>{net.ssid}</span>
                                {isConnected && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    Connected
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500">{net.freq} · Signal: {net.signal}</div>
                            </div>
                          </div>
                          {!isConnected && (
                            <button
                              onClick={() => {
                                updateSettings({ wifiConnectedSsid: net.ssid });
                                addNotification({
                                  title: 'Wi-Fi Connected',
                                  message: `Successfully connected to ${net.ssid}.`,
                                  type: 'success'
                                });
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-violet-600 hover:text-white rounded-lg text-[11px] transition-colors cursor-pointer"
                            >
                              Connect
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION: BLUETOOTH */}
        {activeSection === 'bluetooth' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">Bluetooth Devices</h2>
              <p className="text-xs text-slate-400">BlueZ 5.72 controller pairing and wireless audio devices.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Bluetooth className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="font-semibold text-white">Bluetooth Controller</div>
                    <div className="text-slate-500">Discoverable as "encantos-desktop"</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.bluetoothEnabled}
                  onChange={(e) => updateSettings({ bluetoothEnabled: e.target.checked })}
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
              </div>

              {settings.bluetoothEnabled && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400">Paired Peripherals</span>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>Encantos Acoustic Pro</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active (LDAC 96kHz)
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">Wireless Noise-Cancelling Headphones · Battery 92%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION: USER ACCOUNTS */}
        {activeSection === 'accounts' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">User Accounts & Credentials</h2>
              <p className="text-xs text-slate-400">System user profiles, sudo permissions, and machine identities.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-800/80">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  EN
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{settings.username}</h3>
                  <p className="text-slate-400 text-[11px]">System Administrator (sudo / wheel group)</p>
                  <p className="text-[10px] text-violet-400 font-mono mt-0.5">UID: 1000 · Shell: /usr/bin/zsh</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 text-[11px]">Machine Hostname</label>
                  <input
                    type="text"
                    value={settings.hostname}
                    onChange={(e) => updateSettings({ hostname: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px]">User Account</label>
                  <input
                    type="text"
                    value={settings.username}
                    onChange={(e) => updateSettings({ username: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: SECURITY & FIREWALL */}
        {activeSection === 'security' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">Security & Privacy</h2>
              <p className="text-xs text-slate-400">Zero-telemetry policy guarantee and packet filtration.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">UFW Uncomplicated Firewall</div>
                    <div className="text-slate-500">Default deny incoming, allow outgoing</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.firewallEnabled}
                  onChange={(e) => updateSettings({ firewallEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-emerald-300 text-xs leading-relaxed flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Zero-Telemetry Policy Active:</strong> Encantos OS does not collect usage logs, hardware metrics, or personal analytics. Your system runs completely private and offline-first.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: SYSTEM & ABOUT */}
        {activeSection === 'about' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">System Information</h2>
              <p className="text-xs text-slate-400">Specifications and software build details for this machine.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-800/80">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20 text-white font-bold text-xl">
                  EO
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">ENCANTOS OS 1.0.0 "Aurora"</h3>
                  <p className="text-xs text-slate-400">Modern Linux Desktop Environment · 64-bit</p>
                  <p className="text-[11px] text-violet-400 font-mono mt-0.5">Kernel: 6.8.0-encantos-generic (x86_64)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-500">Base System:</span> Debian 13 (Trixie) / Ubuntu 24.04 LTS Core</div>
                <div><span className="text-slate-500">Display Server:</span> Wayland (EGL / Vulkan 1.3)</div>
                <div><span className="text-slate-500">Audio Pipeline:</span> PipeWire 1.0.7 / WirePlumber</div>
                <div><span className="text-slate-500">Processor:</span> 14-Core Intel Core i7-13700H @ 4.8 GHz</div>
                <div><span className="text-slate-500">Total Memory:</span> 16.0 GB High-Speed LPDDR5X</div>
                <div><span className="text-slate-500">System Storage:</span> 512 GB PCIe 4.0 NVMe SSD (Btrfs)</div>
                <div><span className="text-slate-500">Firmware Type:</span> UEFI (Secure Boot Supported)</div>
                <div><span className="text-slate-500">Hostname:</span> {settings.hostname}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => openWindow('update-center')}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-medium flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check for Updates</span>
              </button>
              <button
                onClick={() => openWindow('iso-studio')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>View ISO Build Manifest</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
