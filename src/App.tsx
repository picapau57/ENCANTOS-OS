import React, { useEffect } from 'react';
import { SystemProvider, useSystem } from './context/SystemContext';
import { Desktop } from './components/desktop/Desktop';
import { WindowManager } from './components/desktop/WindowManager';
import { Taskbar } from './components/desktop/Taskbar';
import { BootAnimation } from './components/desktop/BootAnimation';
import { LockScreen } from './components/desktop/LockScreen';
import { ShutdownScreen } from './components/desktop/ShutdownScreen';
import { ToastNotifications } from './components/desktop/ToastNotifications';
import { WindowId } from './types';

const OperatingSystemShell: React.FC = () => {
  const { 
    sessionState, 
    startMenuOpen, 
    setStartMenuOpen, 
    searchOpen, 
    setSearchOpen, 
    openWindow,
    activeWindowId,
    closeWindow
  } = useSystem();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Super/Meta key opens start menu
      if (e.key === 'Meta') {
        setStartMenuOpen(prev => !prev);
      }
      // Ctrl+Space opens Global Search
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      // Ctrl+Alt+T opens Terminal
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        openWindow('terminal');
      }
      // Alt+F4 closes active window
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        if (activeWindowId) {
          closeWindow(activeWindowId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setStartMenuOpen, setSearchOpen, openWindow, activeWindowId, closeWindow]);

  if (sessionState === 'booting') {
    return <BootAnimation />;
  }

  if (sessionState === 'locked') {
    return <LockScreen />;
  }

  if (sessionState === 'shutting_down' || sessionState === 'restarting' || sessionState === 'sleeping' || sessionState === 'hibernating') {
    return <ShutdownScreen mode={sessionState} />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-black">
      <Desktop />
      <WindowManager />
      <Taskbar />
      <ToastNotifications />
    </div>
  );
};

export function App() {
  return (
    <SystemProvider>
      <OperatingSystemShell />
    </SystemProvider>
  );
}

export default App;
