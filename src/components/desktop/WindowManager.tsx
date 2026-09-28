import React, { useRef, useState, useEffect } from 'react';
import { 
  Minus, Square, Copy, X, Folder, ShoppingBag, Settings as SettingsIcon, 
  Terminal, Activity, HardDrive, Disc, RefreshCw, Shield, FileText, 
  Calculator, Image as ImageIcon, Cpu
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { WindowId, WindowState } from '../../types';

import { EncantosFiles } from '../apps/EncantosFiles';
import { EncantosStore } from '../apps/EncantosStore';
import { EncantosSettings } from '../apps/EncantosSettings';
import { EncantosTerminal } from '../apps/EncantosTerminal';
import { EncantosSystemMonitor } from '../apps/EncantosSystemMonitor';
import { EncantosDiskUtility } from '../apps/EncantosDiskUtility';
import { EncantosInstaller } from '../apps/EncantosInstaller';
import { EncantosUpdateCenter } from '../apps/EncantosUpdateCenter';
import { EncantosBackup } from '../apps/EncantosBackup';
import { EncantosPad } from '../apps/EncantosPad';
import { EncantosCalculator } from '../apps/EncantosCalculator';
import { EncantosImageViewer } from '../apps/EncantosImageViewer';
import { EncantosIsoStudio } from '../apps/EncantosIsoStudio';
import { EncantosIsoGenerator } from '../apps/EncantosIsoGenerator';

export const WindowManager: React.FC = () => {
  const { 
    windows, 
    activeWindowId, 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow, 
    bringToFront, 
    updateWindowPosition, 
    updateWindowSize,
    settings 
  } = useSystem();

  const [draggingId, setDraggingId] = useState<WindowId | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [resizingId, setResizingId] = useState<WindowId | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Handle Dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingId) {
        const nextX = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.x));
        const nextY = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y));
        updateWindowPosition(draggingId, { x: nextX, y: nextY });
      }

      if (resizingId) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const nextWidth = Math.max(380, Math.min(window.innerWidth, resizeStart.width + deltaX));
        const nextHeight = Math.max(280, Math.min(window.innerHeight - 48, resizeStart.height + deltaY));
        updateWindowSize(resizingId, { width: nextWidth, height: nextHeight });
      }
    };

    const handleMouseUp = () => {
      if (draggingId) setDraggingId(null);
      if (resizingId) setResizingId(null);
    };

    if (draggingId || resizingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, resizingId, dragOffset, resizeStart]);

  const handleTitleBarMouseDown = (e: React.MouseEvent, id: WindowId) => {
    if (windows[id].isMaximized) return;
    bringToFront(id);
    setDraggingId(id);
    setDragOffset({
      x: e.clientX - windows[id].position.x,
      y: e.clientY - windows[id].position.y
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, id: WindowId) => {
    e.stopPropagation();
    bringToFront(id);
    setResizingId(id);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: windows[id].size.width,
      height: windows[id].size.height
    });
  };

  const renderAppContent = (win: WindowState) => {
    switch (win.id) {
      case 'files': return <EncantosFiles />;
      case 'store': return <EncantosStore />;
      case 'settings': return <EncantosSettings />;
      case 'terminal': return <EncantosTerminal />;
      case 'system-monitor': return <EncantosSystemMonitor />;
      case 'disk-utility': return <EncantosDiskUtility />;
      case 'installer': return <EncantosInstaller />;
      case 'update-center': return <EncantosUpdateCenter />;
      case 'backup': return <EncantosBackup />;
      case 'pad': return <EncantosPad fileId={win.extraProps?.fileId} />;
      case 'calculator': return <EncantosCalculator />;
      case 'image-viewer': return <EncantosImageViewer />;
      case 'iso-studio': return <EncantosIsoStudio />;
      case 'iso-generator': return <EncantosIsoGenerator />;
      default: return null;
    }
  };

  const getWindowIcon = (id: WindowId) => {
    switch (id) {
      case 'files': return <Folder className="w-3.5 h-3.5 text-amber-400" />;
      case 'store': return <ShoppingBag className="w-3.5 h-3.5 text-violet-400" />;
      case 'settings': return <SettingsIcon className="w-3.5 h-3.5 text-slate-300" />;
      case 'terminal': return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
      case 'system-monitor': return <Activity className="w-3.5 h-3.5 text-cyan-400" />;
      case 'disk-utility': return <HardDrive className="w-3.5 h-3.5 text-indigo-400" />;
      case 'installer': return <Disc className="w-3.5 h-3.5 text-rose-400" />;
      case 'update-center': return <RefreshCw className="w-3.5 h-3.5 text-sky-400" />;
      case 'backup': return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      case 'pad': return <FileText className="w-3.5 h-3.5 text-sky-400" />;
      case 'calculator': return <Calculator className="w-3.5 h-3.5 text-amber-400" />;
      case 'image-viewer': return <ImageIcon className="w-3.5 h-3.5 text-pink-400" />;
      case 'iso-studio': return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
      case 'iso-generator': return <Disc className="w-3.5 h-3.5 text-violet-400" />;
      default: return null;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ bottom: '48px' }}>
      {(Object.keys(windows) as WindowId[]).map(winId => {
        const win = windows[winId];
        if (!win.isOpen || win.isMinimized) return null;

        const isActive = activeWindowId === winId;

        return (
          <div
            key={winId}
            onClick={() => bringToFront(winId)}
            className={`absolute flex flex-col rounded-2xl overflow-hidden pointer-events-auto transition-shadow duration-150 ${
              settings.theme === 'dark' ? 'glass-window' : 'glass-window-light'
            } ${
              isActive 
                ? 'shadow-2xl shadow-black/80 ring-1 ring-white/20' 
                : 'shadow-lg shadow-black/40 opacity-95'
            }`}
            style={{
              zIndex: win.zIndex,
              left: `${win.position.x}px`,
              top: `${win.position.y}px`,
              width: win.isMaximized ? '100vw' : `${win.size.width}px`,
              height: win.isMaximized ? 'calc(100vh - 48px)' : `${win.size.height}px`,
              borderRadius: win.isMaximized ? '0px' : '16px',
            }}
          >
            {/* Title Bar */}
            <div
              onMouseDown={(e) => handleTitleBarMouseDown(e, winId)}
              onDoubleClick={() => maximizeWindow(winId)}
              className={`h-10 px-3.5 flex items-center justify-between select-none cursor-move border-b ${
                settings.theme === 'dark' 
                  ? 'bg-slate-950/70 border-slate-800/80 text-slate-200' 
                  : 'bg-slate-200/80 border-slate-300 text-slate-800'
              }`}
            >
              {/* Left: Icon & Title */}
              <div className="flex items-center gap-2 text-xs font-semibold tracking-tight truncate pr-4">
                {getWindowIcon(winId)}
                <span className="truncate">{win.title}</span>
              </div>

              {/* Right: Window Controls */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Minimize */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    minimizeWindow(winId);
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                  title="Minimize"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                {/* Maximize / Restore */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    maximizeWindow(winId);
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                  title={win.isMaximized ? "Restore" : "Maximize"}
                >
                  {win.isMaximized ? <Copy className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                </button>

                {/* Close */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(winId);
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 transition-colors"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Window Content */}
            <div className="flex-1 overflow-hidden relative">
              {renderAppContent(win)}
            </div>

            {/* Resize handle (bottom-right) */}
            {!win.isMaximized && (
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, winId)}
                className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 opacity-40 hover:opacity-100 transition-opacity"
              >
                <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
