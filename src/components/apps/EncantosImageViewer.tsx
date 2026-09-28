import React, { useState } from 'react';
import { Image as ImageIcon, ZoomIn, ZoomOut, Check, Sparkles } from 'lucide-react';
import { useSystem, WALLPAPERS } from '../../context/SystemContext';

export const EncantosImageViewer: React.FC = () => {
  const { updateSettings, addNotification } = useSystem();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [zoom, setZoom] = useState(1);

  const currentWp = WALLPAPERS[selectedIdx];

  const handleSetWallpaper = () => {
    updateSettings({ wallpaper: currentWp.id });
    addNotification({
      title: 'Wallpaper Updated',
      message: `Set "${currentWp.name}" as desktop wallpaper.`,
      type: 'success'
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 text-slate-200 select-none overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/60 text-xs">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-violet-400" />
          <span className="font-semibold text-white">{currentWp.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-[11px] text-slate-500">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleSetWallpaper}
            className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-semibold flex items-center gap-1.5 ml-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Set as Wallpaper</span>
          </button>
        </div>
      </div>

      {/* Main Preview */}
      <div className="flex-1 overflow-hidden flex items-center justify-center p-6 bg-[#080c14]">
        {currentWp.isGradient ? (
          <div 
            className="w-full h-full max-w-2xl max-h-[400px] rounded-2xl shadow-2xl transition-transform duration-200"
            style={{ background: currentWp.url, transform: `scale(${zoom})` }}
          />
        ) : (
          <img
            src={currentWp.url}
            alt={currentWp.name}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          />
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="flex items-center gap-3 p-3 border-t border-slate-800 bg-slate-950/80 overflow-x-auto">
        {WALLPAPERS.map((wp, i) => (
          <button
            key={wp.id}
            onClick={() => {
              setSelectedIdx(i);
              setZoom(1);
            }}
            className={`w-20 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
              selectedIdx === i ? 'border-violet-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            {wp.isGradient ? (
              <div className="w-full h-full" style={{ background: wp.url }} />
            ) : (
              <img src={wp.url} alt={wp.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
