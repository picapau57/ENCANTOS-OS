import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Maximize2, Minimize2, Copy } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

interface CommandOutput {
  id: string;
  command: string;
  output: string | React.ReactNode;
  time: string;
}

export const EncantosTerminal: React.FC = () => {
  const { fs, createFile, deleteItem, openWindow } = useSystem();
  const [currentDir, setCurrentDir] = useState('/home/encantos');
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [outputs, setOutputs] = useState<CommandOutput[]>([
    {
      id: 'init-1',
      command: '',
      output: (
        <div className="text-slate-400 space-y-1">
          <div className="text-violet-400 font-bold">ENCANTOS OS 1.0.0 "Aurora" (x86_64 Linux 6.8.0-encantos)</div>
          <div>Type <span className="text-amber-400">help</span> for a list of available commands or <span className="text-cyan-400">neofetch</span> for system telemetry.</div>
        </div>
      ),
      time: new Date().toLocaleTimeString()
    }
  ]);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputs]);

  const runCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) {
      setOutputs(prev => [...prev, { id: `${Date.now()}`, command: '', output: '', time: new Date().toLocaleTimeString() }]);
      return;
    }

    setHistory(prev => [...prev, trimmed]);
    setHistoryIdx(-1);

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    let result: React.ReactNode = '';

    switch (cmd) {
      case 'help':
        result = (
          <div className="space-y-1 text-slate-300">
            <div className="text-violet-400 font-semibold mb-1">Standard Encantos OS Shell Commands:</div>
            <div><span className="text-cyan-400 font-mono w-28 inline-block">ls [path]</span> List files and directories in current folder</div>
            <div><span className="text-cyan-400 font-mono w-28 inline-block">cd &lt;dir&gt;</span> Change current working directory</div>
            <div><span className="text-cyan-400 font-mono w-28 inline-block">pwd</span> Print current working directory path</div>
            <div><span className="text-cyan-400 font-mono w-28 inline-block">cat &lt;file&gt;</span> Concatenate and display text file content</div>
            <div><span className="text-cyan-400 font-mono w-28 inline-block">touch &lt;file&gt;</span> Create a new empty file in current folder</div>
            <div><span className="text-cyan-400 font-mono w-28 inline-block">rm &lt;file&gt;</span> Delete file or send to trash</div>
            <div><span className="text-cyan-400 font-mono w-28 inline-block">clear</span> Clear terminal screen output buffer</div>
            <div><span className="text-cyan-400 font-mono w-28 inline-block">uname -a</span> Display kernel version and architecture</div>
            <div><span className="text-cyan-400 font-mono w-28 inline-block">neofetch</span> Print Encantos OS visual badge & hardware info</div>
            <div><span className="text-cyan-400 font-mono w-28 inline-block">apt [args]</span> Debian package manager bridge</div>
            <div><span className="text-cyan-400 font-mono w-28 inline-block">./build-encantos.sh</span> Launch ISO builder pipeline</div>
          </div>
        );
        break;

      case 'clear':
        setOutputs([]);
        return;

      case 'pwd':
        result = <div>{currentDir}</div>;
        break;

      case 'whoami':
        result = <div>encantos</div>;
        break;

      case 'date':
        result = <div>{new Date().toString()}</div>;
        break;

      case 'uptime':
        result = <div> 21:30:12 up 2:45, 1 user, load average: 0.14, 0.18, 0.12</div>;
        break;

      case 'uname':
        if (args.includes('-a') || args.includes('-r')) {
          result = <div>Linux encantos-desktop 6.8.0-encantos-generic #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux</div>;
        } else {
          result = <div>Linux</div>;
        }
        break;

      case 'ls': {
        const folder = fs.find(i => i.path === currentDir && i.type === 'folder');
        const items = folder ? fs.filter(i => i.parentId === folder.id) : [];
        if (items.length === 0) {
          result = <div className="text-slate-500 italic">total 0</div>;
        } else {
          result = (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1">
              {items.map(item => (
                <span 
                  key={item.id} 
                  className={item.type === 'folder' ? 'text-amber-400 font-semibold' : item.name.endsWith('.sh') ? 'text-emerald-400' : 'text-slate-200'}
                >
                  {item.name}{item.type === 'folder' ? '/' : ''}
                </span>
              ))}
            </div>
          );
        }
        break;
      }

      case 'cd': {
        const target = args[0];
        if (!target || target === '~') {
          setCurrentDir('/home/encantos');
        } else if (target === '..') {
          const parts = currentDir.split('/').filter(Boolean);
          if (parts.length > 0) parts.pop();
          setCurrentDir('/' + parts.join('/'));
        } else {
          const newPath = target.startsWith('/') ? target : `${currentDir}/${target}`;
          const found = fs.find(i => i.path === newPath && i.type === 'folder');
          if (found) {
            setCurrentDir(newPath);
          } else {
            result = <div className="text-rose-400">cd: no such file or directory: {target}</div>;
          }
        }
        break;
      }

      case 'cat': {
        const fileName = args[0];
        if (!fileName) {
          result = <div className="text-amber-400">Usage: cat &lt;filename&gt;</div>;
        } else {
          const file = fs.find(i => i.name === fileName && i.type === 'file');
          if (file) {
            result = <pre className="whitespace-pre-wrap font-mono text-slate-300">{file.content || '(empty file)'}</pre>;
          } else {
            result = <div className="text-rose-400">cat: {fileName}: No such file or directory</div>;
          }
        }
        break;
      }

      case 'touch': {
        const fileName = args[0];
        if (!fileName) {
          result = <div className="text-amber-400">Usage: touch &lt;filename&gt;</div>;
        } else {
          const currentFolder = fs.find(i => i.path === currentDir && i.type === 'folder');
          if (currentFolder) {
            createFile(currentFolder.id, fileName, '');
            result = <div className="text-emerald-400">Created file: {fileName}</div>;
          }
        }
        break;
      }

      case 'rm': {
        const fileName = args[0];
        const file = fs.find(i => i.name === fileName);
        if (file) {
          deleteItem(file.id);
          result = <div className="text-slate-400">Removed '{fileName}'</div>;
        } else {
          result = <div className="text-rose-400">rm: cannot remove '{fileName}': No such file or directory</div>;
        }
        break;
      }

      case 'neofetch':
        result = (
          <div className="flex flex-col sm:flex-row gap-6 py-2 text-xs">
            <div className="text-violet-400 font-mono font-bold leading-tight select-none">
              <pre>{`
    .---.      
   /     \\     
  | () () |    
   \\  ^  /     ENCANTOS OS
    '|||'      ───────────
   '     '     `}</pre>
            </div>
            <div className="space-y-1 font-mono text-slate-300">
              <div><span className="text-violet-400 font-bold">encantos</span>@<span className="text-violet-400 font-bold">desktop</span></div>
              <div className="text-slate-600">─────────────────────────</div>
              <div><span className="text-cyan-400 font-bold">OS:</span> ENCANTOS OS 1.0.0 LTS x86_64</div>
              <div><span className="text-cyan-400 font-bold">Host:</span> Encantos Workstation X1</div>
              <div><span className="text-cyan-400 font-bold">Kernel:</span> 6.8.0-encantos-generic</div>
              <div><span className="text-cyan-400 font-bold">Uptime:</span> 2 hours, 45 mins</div>
              <div><span className="text-cyan-400 font-bold">Shell:</span> bash 5.2.21</div>
              <div><span className="text-cyan-400 font-bold">DE:</span> Encantos Desktop Shell (Wayland)</div>
              <div><span className="text-cyan-400 font-bold">WM:</span> Encantos Compositor (EGL/Vulkan)</div>
              <div><span className="text-cyan-400 font-bold">Terminal:</span> encantos-terminal</div>
              <div><span className="text-cyan-400 font-bold">CPU:</span> 13th Gen Intel Core i7-13700H (14 cores)</div>
              <div><span className="text-cyan-400 font-bold">Memory:</span> 4520MiB / 16384MiB (27%)</div>
              <div className="flex gap-1.5 pt-2">
                <span className="w-3.5 h-3.5 bg-slate-900 rounded-sm inline-block"></span>
                <span className="w-3.5 h-3.5 bg-rose-500 rounded-sm inline-block"></span>
                <span className="w-3.5 h-3.5 bg-emerald-500 rounded-sm inline-block"></span>
                <span className="w-3.5 h-3.5 bg-amber-500 rounded-sm inline-block"></span>
                <span className="w-3.5 h-3.5 bg-cyan-500 rounded-sm inline-block"></span>
                <span className="w-3.5 h-3.5 bg-violet-500 rounded-sm inline-block"></span>
              </div>
            </div>
          </div>
        );
        break;

      case 'apt':
        if (args[0] === 'update') {
          result = (
            <div className="space-y-0.5 text-slate-400 font-mono">
              <div>Hit:1 http://deb.debian.org/debian trixie InRelease</div>
              <div>Hit:2 http://security.debian.org/debian-security trixie-security InRelease</div>
              <div>Hit:3 https://repo.encantos-os.org/stable aurora InRelease</div>
              <div className="text-emerald-400">Reading package lists... Done (65,420 packages indexed)</div>
            </div>
          );
        } else {
          result = <div className="text-slate-400 font-mono">Encantos APT Wrapper: All packages up to date. Use Encantos Store for 1-click sandboxed apps.</div>;
        }
        break;

      case './build-encantos.sh':
      case 'build-encantos.sh':
        result = (
          <div className="space-y-1 font-mono text-xs">
            <div className="text-cyan-400">[ENCANTOS BUILD] Initializing build workspace in /build_work...</div>
            <div className="text-cyan-400">[ENCANTOS BUILD] Bootstrapping Debian trixie root filesystem...</div>
            <div className="text-cyan-400">[ENCANTOS BUILD] Generating SquashFS image with xz compression...</div>
            <div className="text-cyan-400">[ENCANTOS BUILD] Embedding GRUB 2.12 UEFI/BIOS hybrid loader...</div>
            <div className="text-emerald-400 font-bold">[ENCANTOS BUILD] SUCCESS: encantos-os-1.0.0-amd64.iso ready!</div>
          </div>
        );
        openWindow('iso-studio');
        break;

      default:
        result = (
          <div className="text-rose-400">
            command not found: {cmd}. Type <span className="text-violet-400 underline">help</span> for available commands.
          </div>
        );
        break;
    }

    setOutputs(prev => [...prev, {
      id: `${Date.now()}`,
      command: cmdStr,
      output: result,
      time: new Date().toLocaleTimeString()
    }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      if (history.length > 0) {
        const nextIdx = historyIdx < history.length - 1 ? historyIdx + 1 : historyIdx;
        setHistoryIdx(nextIdx);
        setInputVal(history[history.length - 1 - nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInputVal(history[history.length - 1 - nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInputVal('');
      }
    }
  };

  return (
    <div 
      className="flex flex-col h-full bg-[#0b0f19] text-slate-100 font-mono text-xs p-4 overflow-hidden select-text cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {outputs.map(item => (
          <div key={item.id} className="space-y-1">
            {item.command && (
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-emerald-400 font-semibold">encantos@desktop</span>
                <span className="text-slate-600">:</span>
                <span className="text-cyan-400">{currentDir === '/home/encantos' ? '~' : currentDir}</span>
                <span className="text-violet-400 font-bold">$</span>
                <span className="text-slate-100">{item.command}</span>
              </div>
            )}
            <div>{item.output}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input Prompt */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 shrink-0">
        <span className="text-emerald-400 font-semibold">encantos@desktop</span>
        <span className="text-slate-600">:</span>
        <span className="text-cyan-400">{currentDir === '/home/encantos' ? '~' : currentDir}</span>
        <span className="text-violet-400 font-bold">$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-slate-100 caret-violet-400"
        />
      </div>
    </div>
  );
};
