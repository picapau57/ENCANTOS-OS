import React, { useState, useEffect } from 'react';
import { 
  Disc, CheckCircle2, ChevronRight, ChevronLeft, HardDrive, 
  User, ShieldCheck, Globe, Wifi, Check, AlertCircle, Loader2, RotateCw
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

type InstallStep = 
  | 'welcome' 
  | 'language' 
  | 'keyboard' 
  | 'timezone' 
  | 'network' 
  | 'type' 
  | 'disk' 
  | 'user' 
  | 'summary' 
  | 'installing' 
  | 'finished';

export const EncantosInstaller: React.FC = () => {
  const { setSessionState, closeWindow, addNotification } = useSystem();
  const [currentStep, setCurrentStep] = useState<InstallStep>('welcome');

  // Form states
  const [language, setLanguage] = useState<'pt-BR' | 'en' | 'es'>('en');
  const [keyboardLayout, setKeyboardLayout] = useState('English (US)');
  const [timezone, setTimezone] = useState('America/Sao_Paulo (UTC-03:00)');
  const [installType, setInstallType] = useState<'erase' | 'alongside' | 'manual'>('erase');
  const [targetDisk, setTargetDisk] = useState('nvme0n1 (512 GB SSD)');
  const [fullName, setFullName] = useState('Encantos User');
  const [username, setUsername] = useState('encantos');
  const [password, setPassword] = useState('encantos');
  const [isAdmin, setIsAdmin] = useState(true);
  const [autoLogin, setAutoLogin] = useState(false);

  // Installation execution progress simulation
  const [progress, setProgress] = useState(0);
  const [installStatus, setInstallStatus] = useState('Preparing target drive partitions...');
  const [installLogs, setInstallLogs] = useState<string[]>([]);

  const stepsList: { id: InstallStep; title: string }[] = [
    { id: 'welcome', title: 'Welcome' },
    { id: 'language', title: 'Language' },
    { id: 'keyboard', title: 'Keyboard' },
    { id: 'timezone', title: 'Time Zone' },
    { id: 'network', title: 'Network' },
    { id: 'type', title: 'Install Type' },
    { id: 'disk', title: 'Target Disk' },
    { id: 'user', title: 'User Account' },
    { id: 'summary', title: 'Summary' },
    { id: 'installing', title: 'Installing' },
    { id: 'finished', title: 'Finish' }
  ];

  const handleStartInstallation = () => {
    setCurrentStep('installing');
    setProgress(5);
    setInstallStatus('Creating GPT partition table on target drive...');
    setInstallLogs(['[INFO] Calamares 3.3.6 starting system deployment...', '[INFO] Clearing partition metadata...']);

    // Sequence of steps
    setTimeout(() => {
      setProgress(20);
      setInstallStatus('Formatting Ext4 root filesystem (/dev/nvme0n1p2)...');
      setInstallLogs(prev => [...prev, '[INFO] mkfs.ext4 -F /dev/nvme0n1p2', '[INFO] Formatting EFI FAT32 partition on /dev/nvme0n1p1']);
    }, 1200);

    setTimeout(() => {
      setProgress(45);
      setInstallStatus('Unpacking root filesystem image (squashfs -> ext4)...');
      setInstallLogs(prev => [...prev, '[INFO] Unpacking filesystem.squashfs (128,450 files)...', '[INFO] Extracting core libraries and Wayland compositor...']);
    }, 2500);

    setTimeout(() => {
      setProgress(70);
      setInstallStatus('Configuring system locales, keyboard layout, and user accounts...');
      setInstallLogs(prev => [...prev, `[INFO] Generated user account: ${username}`, '[INFO] Encrypting credentials with SHA-512 crypt...']);
    }, 4000);

    setTimeout(() => {
      setProgress(88);
      setInstallStatus('Installing GRUB 2.12 EFI Bootloader to /boot/efi...');
      setInstallLogs(prev => [...prev, '[INFO] grub-install --target=x86_64-efi --efi-directory=/boot/efi', '[INFO] Generating /boot/grub/grub.cfg']);
    }, 5500);

    setTimeout(() => {
      setProgress(100);
      setInstallStatus('Installation complete! Encantos OS is ready.');
      setInstallLogs(prev => [...prev, '[SUCCESS] System successfully installed.', '[INFO] Syncing disk caches...']);
      setCurrentStep('finished');
      addNotification({
        title: 'ENCANTOS OS Installed',
        message: 'The system has been permanently installed to your disk.',
        type: 'success'
      });
    }, 7000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 text-slate-200 select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white">
            <Disc className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white text-xs tracking-tight">ENCANTOS OS INSTALLER</span>
            <span className="text-[10px] text-slate-400 ml-2">Powered by Calamares 3.3 Engine</span>
          </div>
        </div>
      </div>

      {/* Main Body: Steps Sidebar + Step View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Steps Navigation */}
        <div className="w-48 bg-slate-950/50 border-r border-slate-800 p-4 flex flex-col gap-1 text-xs shrink-0">
          {stepsList.map((st, idx) => {
            const isCurrent = currentStep === st.id;
            const isDone = stepsList.findIndex(s => s.id === currentStep) > idx;

            return (
              <div
                key={st.id}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                  isCurrent ? 'bg-violet-600 text-white font-semibold' : isDone ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isDone ? 'bg-emerald-500/20 text-emerald-400 font-bold' : isCurrent ? 'bg-white text-violet-600 font-bold' : 'border border-slate-700 text-slate-600'
                }`}>
                  {isDone ? '✓' : idx + 1}
                </div>
                <span>{st.title}</span>
              </div>
            );
          })}
        </div>

        {/* Step Content Viewport */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col justify-between">
          {/* STEP 1: WELCOME */}
          {currentStep === 'welcome' && (
            <div className="space-y-4 max-w-lg">
              <h2 className="text-xl font-bold text-white">Welcome to ENCANTOS OS 1.0.0</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                This installer will guide you through setting up ENCANTOS OS on your computer. You can test the operating system in Live Mode before making any permanent changes to your hard drive.
              </p>
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 text-white font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Hardware Compatibility Verified:</span>
                </div>
                <div className="pl-6 space-y-1">
                  <div>✓ UEFI x86_64 Firmware with ACPI support</div>
                  <div>✓ 16 GB Physical RAM (Minimum 4 GB satisfied)</div>
                  <div>✓ 512 GB High-Speed NVMe Storage detected</div>
                  <div>✓ Intel / AMD Graphics driver loaded</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LANGUAGE */}
          {currentStep === 'language' && (
            <div className="space-y-4 max-w-md">
              <h2 className="text-lg font-bold text-white">Select Installation Language</h2>
              <p className="text-xs text-slate-400">Choose the primary language for your desktop and applications.</p>
              <div className="space-y-2">
                {[
                  { id: 'en', label: 'English (United States)', sub: 'Default English' },
                  { id: 'pt-BR', label: 'Português (Brasil)', sub: 'Portuguese Brazil' },
                  { id: 'es', label: 'Español (Latinoamérica)', sub: 'Spanish Latin America' },
                ].map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id as any)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      language === lang.id ? 'border-violet-500 bg-violet-600/20 text-white font-semibold' : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{lang.label}</div>
                      <div className="text-[10px] text-slate-500">{lang.sub}</div>
                    </div>
                    {language === lang.id && <Check className="w-4 h-4 text-violet-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: KEYBOARD */}
          {currentStep === 'keyboard' && (
            <div className="space-y-4 max-w-md">
              <h2 className="text-lg font-bold text-white">Keyboard Layout</h2>
              <p className="text-xs text-slate-400">Select the layout matching your physical keyboard.</p>
              <select
                value={keyboardLayout}
                onChange={(e) => setKeyboardLayout(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
              >
                <option value="English (US)">English (US Standard)</option>
                <option value="English (US, altgr-intl)">English (US International with Dead Keys)</option>
                <option value="Portuguese (Brazil, ABNT2)">Português do Brasil (ABNT2)</option>
                <option value="Spanish (Latin America)">Español (Latinoamérica)</option>
              </select>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <label className="text-[11px] text-slate-400 block mb-1">Test your keyboard here:</label>
                <input
                  type="text"
                  placeholder="Type characters here to test (e.g. ç, ~, é, @, #)..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* STEP 4: TIMEZONE */}
          {currentStep === 'timezone' && (
            <div className="space-y-4 max-w-md">
              <h2 className="text-lg font-bold text-white">Time Zone & Region</h2>
              <p className="text-xs text-slate-400">Select your geographic region for accurate clock synchronization.</p>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
              >
                <option value="America/Sao_Paulo (UTC-03:00)">America / Sao Paulo (UTC-03:00)</option>
                <option value="America/New_York (UTC-05:00)">America / New York (UTC-05:00)</option>
                <option value="America/Los_Angeles (UTC-08:00)">America / Los Angeles (UTC-08:00)</option>
                <option value="Europe/London (UTC+00:00)">Europe / London (UTC+00:00)</option>
                <option value="Europe/Madrid (UTC+01:00)">Europe / Madrid (UTC+01:00)</option>
              </select>
            </div>
          )}

          {/* STEP 5: NETWORK */}
          {currentStep === 'network' && (
            <div className="space-y-4 max-w-md">
              <h2 className="text-lg font-bold text-white">Internet Connection</h2>
              <p className="text-xs text-slate-400">An active internet connection allows downloading the latest security updates during install.</p>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Wifi className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">Wi-Fi Connected</div>
                    <div className="text-slate-500">Connected to 'Encantos_HighSpeed_5G'</div>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">Online</span>
              </div>
            </div>
          )}

          {/* STEP 6: INSTALL TYPE */}
          {currentStep === 'type' && (
            <div className="space-y-4 max-w-lg">
              <h2 className="text-lg font-bold text-white">Installation Type</h2>
              <p className="text-xs text-slate-400">Choose how ENCANTOS OS should be installed on your storage device.</p>
              <div className="space-y-3">
                {[
                  { id: 'erase', title: 'Erase Disk and Install Encantos OS', desc: 'Replaces all contents of the selected disk with Encantos OS. Automatically configures EFI, root, and swap partitions.' },
                  { id: 'alongside', title: 'Install Alongside Existing System', desc: 'Shrinks an existing OS partition to create space for a dual-boot setup with a GRUB selection menu.' },
                  { id: 'manual', title: 'Manual Partitioning (Advanced)', desc: 'Custom partition configuration with GParted mount points and Btrfs subvolumes.' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setInstallType(opt.id as any)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      installType === opt.id ? 'border-violet-500 bg-violet-600/20 text-white font-semibold' : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{opt.title}</div>
                    <div className="text-[11px] text-slate-400 mt-1 font-normal">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: DISK SELECTION */}
          {currentStep === 'disk' && (
            <div className="space-y-4 max-w-md">
              <h2 className="text-lg font-bold text-white">Select Target Storage Disk</h2>
              <p className="text-xs text-slate-400">Select the drive where ENCANTOS OS will be deployed.</p>
              <div className="space-y-2">
                {[
                  { id: 'nvme0n1 (512 GB SSD)', name: 'NVMe Samsung 990 PRO 512GB', type: 'High Speed SSD' },
                  { id: 'sda (1000 GB HDD)', name: 'SATA Western Digital 1TB HDD', type: 'Mechanical Hard Drive' },
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => setTargetDisk(d.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      targetDisk === d.id ? 'border-violet-500 bg-violet-600/20 text-white font-semibold' : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <HardDrive className="w-4 h-4 text-violet-400" />
                      <div>
                        <div className="text-xs">{d.name}</div>
                        <div className="text-[10px] text-slate-500">{d.type}</div>
                      </div>
                    </div>
                    {targetDisk === d.id && <Check className="w-4 h-4 text-violet-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 8: USER ACCOUNT */}
          {currentStep === 'user' && (
            <div className="space-y-4 max-w-md text-xs">
              <h2 className="text-lg font-bold text-white">Create Primary User Account</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Username (for terminal and home directory)</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
                <div className="pt-2 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAdmin}
                      onChange={(e) => setIsAdmin(e.target.checked)}
                      className="accent-violet-600 rounded"
                    />
                    <span>Grant this account administrator (sudo) privileges</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoLogin}
                      onChange={(e) => setAutoLogin(e.target.checked)}
                      className="accent-violet-600 rounded"
                    />
                    <span>Log in automatically without asking for password</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: SUMMARY */}
          {currentStep === 'summary' && (
            <div className="space-y-4 max-w-lg text-xs">
              <h2 className="text-lg font-bold text-white">Installation Summary</h2>
              <p className="text-slate-400">Please review your installation parameters before proceeding:</p>
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-slate-300">
                <div><strong className="text-white">Language:</strong> {language.toUpperCase()}</div>
                <div><strong className="text-white">Keyboard:</strong> {keyboardLayout}</div>
                <div><strong className="text-white">Time Zone:</strong> {timezone}</div>
                <div><strong className="text-white">Target Disk:</strong> {targetDisk}</div>
                <div><strong className="text-white">Installation Mode:</strong> {installType.toUpperCase()}</div>
                <div><strong className="text-white">Primary User:</strong> {username} ({fullName})</div>
              </div>
              <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl text-amber-300 text-xs">
                ⚠️ Click <strong>Install Now</strong> to apply changes and write ENCANTOS OS to your disk.
              </div>
            </div>
          )}

          {/* STEP 10: INSTALLING (LIVE PROGRESS) */}
          {currentStep === 'installing' && (
            <div className="space-y-6 max-w-lg my-auto">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                <div>
                  <h2 className="text-base font-bold text-white">Installing ENCANTOS OS...</h2>
                  <p className="text-xs text-slate-400">{installStatus}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-violet-600 to-cyan-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                  <span>Progress</span>
                  <span className="text-violet-400 font-bold">{progress}%</span>
                </div>
              </div>

              {/* Live install console logs */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-400 h-32 overflow-y-auto space-y-1">
                {installLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 11: FINISHED */}
          {currentStep === 'finished' && (
            <div className="space-y-5 max-w-lg my-auto text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-white">Installation Complete!</h2>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                ENCANTOS OS 1.0.0 has been successfully installed on your computer. You may restart now to start your new operating system.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => closeWindow('installer')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Continue Testing in Live Mode
                </button>
                <button
                  onClick={() => setSessionState('restarting')}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-violet-500/25"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Restart Now</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Action Navigation Buttons */}
          {currentStep !== 'installing' && currentStep !== 'finished' && (
            <div className="flex justify-between items-center pt-6 border-t border-slate-800/80">
              <button
                onClick={() => {
                  const idx = stepsList.findIndex(s => s.id === currentStep);
                  if (idx > 0) setCurrentStep(stepsList[idx - 1].id);
                }}
                disabled={currentStep === 'welcome'}
                className="px-4 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              {currentStep === 'summary' ? (
                <button
                  onClick={handleStartInstallation}
                  className="px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/25 transition-all flex items-center gap-2"
                >
                  <span>Install Now</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    const idx = stepsList.findIndex(s => s.id === currentStep);
                    if (idx < stepsList.length - 1) setCurrentStep(stepsList[idx + 1].id);
                  }}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
