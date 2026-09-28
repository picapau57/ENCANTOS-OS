import React, { useState, useEffect } from 'react';
import { Save, FilePlus, Copy, Check, FileText } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export const EncantosPad: React.FC<{ fileId?: string }> = ({ fileId }) => {
  const { fs, createFile, updateFileContent, addNotification } = useSystem();
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('Untitled.txt');
  const [activeFileId, setActiveFileId] = useState<string | null>(fileId || null);

  useEffect(() => {
    if (activeFileId) {
      const file = fs.find(f => f.id === activeFileId);
      if (file) {
        setContent(file.content || '');
        setFileName(file.name);
      }
    }
  }, [activeFileId, fs]);

  const handleSave = () => {
    if (activeFileId) {
      updateFileContent(activeFileId, content);
      addNotification({
        title: 'File Saved',
        message: `Saved changes to ${fileName}`,
        type: 'info'
      });
    } else {
      createFile('desktop', fileName, content);
      addNotification({
        title: 'File Created & Saved',
        message: `Saved ${fileName} to Desktop`,
        type: 'success'
      });
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="flex flex-col h-full bg-slate-900/95 text-slate-200 select-none overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/60 text-xs">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-violet-400" />
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-violet-500 outline-none text-white font-medium px-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveFileId(null);
              setContent('');
              setFileName(`Note-${Date.now().toString().slice(-4)}.txt`);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="New File"
          >
            <FilePlus className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type notes, code, or markdown here..."
        className="flex-1 p-4 bg-[#0a0e17] text-slate-200 font-mono text-xs outline-none resize-none select-text"
      />

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 font-mono">
        <div>UTF-8 · LF · Plain Text</div>
        <div className="flex gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
      </div>
    </div>
  );
};
