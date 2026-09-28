import React, { useState, useEffect, useMemo } from 'react';
import { 
  Folder, FolderOpen, FileText, ChevronRight, ChevronDown, 
  ArrowLeft, ArrowRight, ArrowUp, RotateCw, Grid, List, Search, 
  HardDrive, Trash2, Plus, Eye, Info, FileCode, Music, Film, 
  Image as ImageIcon, CornerUpLeft, Edit3, Check, X, Home,
  Download, Monitor, FileSpreadsheet, FileArchive, SlidersHorizontal,
  FolderTree, Compass, Layers
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { FsItem } from '../../types';

interface TreeNodeProps {
  item: FsItem;
  fs: FsItem[];
  currentFolderId: string;
  expandedFolders: Set<string>;
  onToggleExpand: (folderId: string) => void;
  onNavigate: (folderId: string) => void;
  depth?: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  item,
  fs,
  currentFolderId,
  expandedFolders,
  onToggleExpand,
  onNavigate,
  depth = 0
}) => {
  // Get direct folder children
  const children = useMemo(() => {
    return fs.filter(f => f.parentId === item.id && f.type === 'folder');
  }, [fs, item.id]);

  const hasChildren = children.length > 0;
  const isExpanded = expandedFolders.has(item.id);
  const isCurrent = currentFolderId === item.id;

  // Choose icon based on folder identity
  const getFolderIcon = () => {
    if (item.id === 'root') return <HardDrive className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
    if (item.id === 'user' || item.id === 'home') return <Home className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    if (item.id === 'desktop') return <Monitor className="w-3.5 h-3.5 text-violet-400 shrink-0" />;
    if (item.id === 'documents') return <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
    if (item.id === 'downloads') return <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    if (item.id === 'pictures') return <ImageIcon className="w-3.5 h-3.5 text-pink-400 shrink-0" />;
    if (item.id === 'music') return <Music className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
    if (item.id === 'videos') return <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    if (item.id === 'trash') return <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />;

    if (isExpanded) {
      return <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
    return <Folder className="w-3.5 h-3.5 text-amber-400/90 shrink-0" />;
  };

  const displayName = item.id === 'root' ? '/ (Root)' : item.name;

  return (
    <div className="select-none text-xs">
      <div 
        className={`group flex items-center gap-1.5 py-1 px-1.5 rounded-lg transition-colors cursor-pointer ${
          isCurrent 
            ? 'bg-violet-600/30 text-white font-semibold ring-1 ring-violet-500/40' 
            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        }`}
        style={{ paddingLeft: `${Math.max(6, depth * 14)}px` }}
        onClick={() => onNavigate(item.id)}
      >
        {/* Expand / Collapse Chevron */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(item.id);
            }}
            className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-100 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        ) : (
          <span className="w-4 h-4 inline-block" />
        )}

        {/* Folder Icon */}
        {getFolderIcon()}

        {/* Folder Name */}
        <span className="truncate flex-1 text-[11px]">{displayName}</span>

        {/* Child items count indicator */}
        {children.length > 0 && (
          <span className="text-[9px] font-mono text-slate-500 px-1 rounded bg-slate-900/60 group-hover:text-slate-300">
            {children.length}
          </span>
        )}
      </div>

      {/* Render Nested Children if Expanded */}
      {isExpanded && hasChildren && (
        <div className="relative border-l border-slate-800/80 ml-3 my-0.5">
          {children.map(child => (
            <TreeNode
              key={child.id}
              item={child}
              fs={fs}
              currentFolderId={currentFolderId}
              expandedFolders={expandedFolders}
              onToggleExpand={onToggleExpand}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileManager: React.FC = () => {
  const { 
    fs, 
    createFile, 
    createFolder, 
    deleteItem, 
    restoreFromTrash, 
    emptyTrash, 
    renameItem, 
    openWindow, 
    systemMetrics 
  } = useSystem();

  const [currentFolderId, setCurrentFolderId] = useState<string>('desktop');
  const [history, setHistory] = useState<string[]>(['desktop']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'tree' | 'bookmarks'>('tree');
  
  // Sort state
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [previewContent, setPreviewContent] = useState<{ title: string; text: string } | null>(null);

  // Address bar manual editing
  const [isEditingPath, setIsEditingPath] = useState(false);
  const [manualPathInput, setManualPathInput] = useState('');

  // Directory Tree expanded nodes state
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['root', 'home', 'user', 'documents', 'pictures'])
  );

  // Auto-expand tree parents when navigating
  useEffect(() => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      let curr = fs.find(i => i.id === currentFolderId);
      while (curr && curr.parentId) {
        next.add(curr.parentId);
        curr = fs.find(i => i.id === curr?.parentId);
      }
      return next;
    });
  }, [currentFolderId, fs]);

  const handleToggleExpand = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const navigateTo = (folderId: string) => {
    const target = fs.find(i => i.id === folderId);
    if (!target && folderId !== 'trash') return;

    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(folderId);
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
    setCurrentFolderId(folderId);
    setSelectedItemId(null);
    setSearchQuery('');
    setIsEditingPath(false);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentFolderId(history[historyIndex - 1]);
      setSelectedItemId(null);
      setIsEditingPath(false);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentFolderId(history[historyIndex + 1]);
      setSelectedItemId(null);
      setIsEditingPath(false);
    }
  };

  const goUp = () => {
    const current = fs.find(i => i.id === currentFolderId);
    if (current && current.parentId) {
      navigateTo(current.parentId);
    }
  };

  const currentFolder = fs.find(i => i.id === currentFolderId) || { 
    id: 'desktop', 
    name: 'Desktop', 
    path: '/home/encantos/Desktop' 
  };

  // Generate interactive breadcrumb segments
  const breadcrumbs = useMemo(() => {
    const trail: { id: string; name: string }[] = [];
    let curr: FsItem | undefined = fs.find(i => i.id === currentFolderId);

    while (curr) {
      trail.unshift({ id: curr.id, name: curr.id === 'root' ? '/' : curr.name });
      curr = curr.parentId ? fs.find(i => i.id === curr?.parentId) : undefined;
    }
    return trail;
  }, [currentFolderId, fs]);

  // Current folder items with search and sorting
  const items = useMemo(() => {
    let result = fs.filter(item => {
      if (searchQuery.trim()) {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase()) && item.parentId !== 'trash';
      }
      return item.parentId === currentFolderId;
    });

    // Sort items (folders first, then files)
    result.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }

      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'date') {
        comparison = a.modified.localeCompare(b.modified);
      } else if (sortBy === 'size') {
        const sizeA = parseFloat(a.size || '0');
        const sizeB = parseFloat(b.size || '0');
        comparison = sizeA - sizeB;
      } else if (sortBy === 'type') {
        comparison = a.type.localeCompare(b.type);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [fs, currentFolderId, searchQuery, sortBy, sortOrder]);

  const selectedItem = fs.find(i => i.id === selectedItemId);

  const handleItemDoubleClick = (item: FsItem) => {
    if (item.type === 'folder') {
      navigateTo(item.id);
    } else {
      // Launch or preview file
      if (item.name.endsWith('.iso')) {
        // Direct download trigger for ISO file
        const blob = new Blob([item.content || 'ENCANTOS-OS-ISO-IMAGE'], { type: 'application/x-cd-image' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.name;
        a.click();
        URL.revokeObjectURL(url);
        openWindow('iso-studio');
      } else if (item.name.endsWith('.txt') || item.name.endsWith('.md') || item.name.endsWith('.sh') || item.name.endsWith('.json')) {
        openWindow('pad', { fileId: item.id });
      } else if (item.name.endsWith('.png') || item.name.endsWith('.jpg')) {
        openWindow('image-viewer');
      } else {
        setPreviewContent({
          title: item.name,
          text: item.content || 'Binary or unsupported file format preview.'
        });
      }
    }
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      createFolder(currentFolderId, newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      createFile(currentFolderId, newFileName.trim(), newFileContent);
      setNewFileName('');
      setNewFileContent('');
      setShowNewFileModal(false);
    }
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemId && renameValue.trim()) {
      renameItem(selectedItemId, renameValue.trim());
      setShowRenameModal(false);
      setRenameValue('');
    }
  };

  const handleManualPathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = fs.find(i => i.type === 'folder' && (i.path === manualPathInput || i.path === manualPathInput.replace(/\/$/, '')));
    if (match) {
      navigateTo(match.id);
    } else {
      alert(`Directory not found: ${manualPathInput}`);
    }
    setIsEditingPath(false);
  };

  const getFileIcon = (item: FsItem, size = 'large') => {
    const isLg = size === 'large';
    const cls = isLg ? 'w-9 h-9' : 'w-4 h-4 shrink-0';

    if (item.type === 'folder') {
      return <Folder className={`${cls} text-amber-400 fill-amber-400/20`} />;
    }
    if (item.name.endsWith('.md') || item.name.endsWith('.txt')) {
      return <FileText className={`${cls} text-sky-400`} />;
    }
    if (item.name.endsWith('.sh') || item.name.endsWith('.ts') || item.name.endsWith('.py') || item.name.endsWith('.json')) {
      return <FileCode className={`${cls} text-emerald-400`} />;
    }
    if (item.name.endsWith('.mp3') || item.name.endsWith('.flac')) {
      return <Music className={`${cls} text-rose-400`} />;
    }
    if (item.name.endsWith('.mp4') || item.name.endsWith('.mkv')) {
      return <Film className={`${cls} text-violet-400`} />;
    }
    if (item.name.endsWith('.jpg') || item.name.endsWith('.png')) {
      return <ImageIcon className={`${cls} text-indigo-400`} />;
    }
    if (item.name.endsWith('.zip') || item.name.endsWith('.tar') || item.name.endsWith('.gz')) {
      return <FileArchive className={`${cls} text-amber-500`} />;
    }
    return <FileText className={`${cls} text-slate-400`} />;
  };

  // Root item for the Directory Tree
  const rootItem = fs.find(i => i.id === 'root') || {
    id: 'root',
    name: '/',
    type: 'folder' as const,
    parentId: null,
    path: '/',
    modified: '2026-09-25 10:00'
  };

  return (
    <div className="flex h-full flex-col bg-slate-900/95 text-slate-200 select-none overflow-hidden">
      {/* Top Action & Navigation Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/70 gap-2.5">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button 
            onClick={goBack} 
            disabled={historyIndex === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Back (Alt+Left)"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={goForward} 
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Forward (Alt+Right)"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={goUp}
            disabled={!currentFolder.path || currentFolder.path === '/'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Up one folder"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateTo(currentFolderId)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh Directory"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Interactive Breadcrumb Address Bar */}
        <div className="flex-1 flex items-center bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 gap-1 overflow-hidden min-w-[150px]">
          <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0 mr-1" />
          
          {isEditingPath ? (
            <form onSubmit={handleManualPathSubmit} className="flex-1 flex items-center">
              <input
                type="text"
                autoFocus
                value={manualPathInput}
                onChange={(e) => setManualPathInput(e.target.value)}
                onBlur={() => setIsEditingPath(false)}
                className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
              />
            </form>
          ) : (
            <div 
              className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5 cursor-text flex-1"
              onDoubleClick={() => {
                setManualPathInput(currentFolder.path || '/');
                setIsEditingPath(true);
              }}
              title="Click crumbs to jump, double-click to edit path directly"
            >
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.id}>
                  <button
                    onClick={() => navigateTo(crumb.id)}
                    className="hover:text-white hover:bg-slate-800/80 px-1 py-0.5 rounded transition-colors text-slate-300 font-mono text-[11px] cursor-pointer"
                  >
                    {crumb.name}
                  </button>
                  {idx < breadcrumbs.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative w-44 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-6 py-1 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 border-l border-slate-800 pl-2 shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid' 
                ? 'bg-violet-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'list' 
                ? 'bg-violet-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area: Left Directory Tree Sidebar + Right File List */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Directory Tree / Navigation Sidebar */}
        <div className="w-64 bg-slate-950/50 border-r border-slate-800/80 flex flex-col text-xs shrink-0 overflow-hidden">
          {/* Sidebar Tab Switcher */}
          <div className="flex items-center p-2 border-b border-slate-800/80 bg-slate-950/40 gap-1">
            <button
              onClick={() => setSidebarTab('tree')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                sidebarTab === 'tree'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Directory Tree</span>
            </button>
            <button
              onClick={() => setSidebarTab('bookmarks')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                sidebarTab === 'bookmarks'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Bookmarks</span>
            </button>
          </div>

          {/* TAB 1: Hierarchical Directory Tree View */}
          {sidebarTab === 'tree' ? (
            <div className="flex-1 p-2 overflow-y-auto space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-500 tracking-wider flex items-center justify-between">
                <span>Filesystem Hierarchy</span>
                <button
                  onClick={() => {
                    const allFolderIds = fs.filter(i => i.type === 'folder').map(i => i.id);
                    setExpandedFolders(new Set(allFolderIds));
                  }}
                  className="text-[9px] text-violet-400 hover:underline cursor-pointer lowercase"
                >
                  expand all
                </button>
              </div>

              {/* Render Root Directory Tree */}
              <div className="space-y-0.5">
                <TreeNode
                  item={rootItem}
                  fs={fs}
                  currentFolderId={currentFolderId}
                  expandedFolders={expandedFolders}
                  onToggleExpand={handleToggleExpand}
                  onNavigate={navigateTo}
                  depth={0}
                />
              </div>

              {/* Special Trash Node in Tree */}
              <div className="pt-2 border-t border-slate-800/80 mt-2">
                <button
                  onClick={() => navigateTo('trash')}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    currentFolderId === 'trash'
                      ? 'bg-rose-500/20 text-rose-300 font-semibold ring-1 ring-rose-500/30'
                      : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/50'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[11px]">Trash</span>
                  {fs.filter(i => i.parentId === 'trash').length > 0 && (
                    <span className="ml-auto text-[9px] font-mono bg-rose-950/60 text-rose-400 px-1 rounded">
                      {fs.filter(i => i.parentId === 'trash').length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* TAB 2: Quick Access Bookmarks */
            <div className="flex-1 p-2.5 overflow-y-auto space-y-4">
              <div>
                <div className="px-2 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider">Quick Locations</div>
                <div className="flex flex-col gap-0.5 mt-1">
                  {[
                    { id: 'desktop', name: 'Desktop', icon: Monitor, color: 'text-violet-400' },
                    { id: 'documents', name: 'Documents', icon: FileText, color: 'text-sky-400' },
                    { id: 'projects', name: 'Projects', icon: Folder, color: 'text-amber-400' },
                    { id: 'downloads', name: 'Downloads', icon: Download, color: 'text-emerald-400' },
                    { id: 'pictures', name: 'Pictures', icon: ImageIcon, color: 'text-pink-400' },
                    { id: 'music', name: 'Music', icon: Music, color: 'text-rose-400' },
                    { id: 'videos', name: 'Videos', icon: Film, color: 'text-amber-400' },
                  ].map(dir => {
                    const IconComp = dir.icon;
                    const isActive = currentFolderId === dir.id;
                    return (
                      <button
                        key={dir.id}
                        onClick={() => navigateTo(dir.id)}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                          isActive 
                            ? 'bg-violet-600/25 text-violet-200 font-semibold ring-1 ring-violet-500/30' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                      >
                        <IconComp className={`w-3.5 h-3.5 ${dir.color}`} />
                        <span className="text-[11px]">{dir.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="px-2 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider">Storage Volumes</div>
                <div className="flex flex-col gap-0.5 mt-1">
                  <button
                    onClick={() => navigateTo('root')}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                      currentFolderId === 'root' 
                        ? 'bg-violet-600/25 text-violet-200 font-semibold ring-1 ring-violet-500/30' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                    <div>
                      <div className="text-[11px] text-white">ENCANTOS Root NVMe</div>
                      <div className="text-[9px] text-slate-500 font-mono">Btrfs / 512 GB</div>
                    </div>
                  </button>
                  <button
                    onClick={() => navigateTo('trash')}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                      currentFolderId === 'trash' 
                        ? 'bg-rose-500/20 text-rose-300 font-semibold' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-[11px]">Trash Bin</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Tools Footer */}
          <div className="p-2 border-t border-slate-800/80 bg-slate-950/60 flex flex-col gap-1.5">
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-violet-600 hover:text-white text-slate-200 rounded-lg transition-colors font-medium text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Folder</span>
            </button>
            <button
              onClick={() => setShowNewFileModal(true)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors text-xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>New File</span>
            </button>
            {currentFolderId === 'trash' && (
              <button
                onClick={emptyTrash}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-rose-950/40 border border-rose-900/60 hover:bg-rose-900 text-rose-300 rounded-lg transition-colors text-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Trash</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Content Area: Items Grid or List */}
        <div 
          className="flex-1 flex flex-col overflow-hidden bg-slate-900/50"
          onClick={() => setSelectedItemId(null)}
        >
          {/* Header Bar within current folder */}
          <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-xs">{currentFolder.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">({items.length} items)</span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-white text-[11px] focus:outline-none cursor-pointer"
              >
                <option value="name">Name</option>
                <option value="date">Date Modified</option>
                <option value="size">Size</option>
                <option value="type">Type</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer font-mono"
                title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                {sortOrder === 'asc' ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {/* Items Canvas */}
          <div className="flex-1 p-4 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-56 text-slate-500">
                <Folder className="w-14 h-14 stroke-[1.2] mb-3 opacity-30 text-slate-400" />
                <p className="text-sm font-medium text-slate-400">This directory is empty</p>
                <p className="text-xs text-slate-600 mt-1">Create a new folder or file to get started</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowNewFolderModal(true)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    + New Folder
                  </button>
                  <button
                    onClick={() => setShowNewFileModal(true)}
                    className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    + New File
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {items.map(item => {
                  const isSelected = selectedItemId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItemId(item.id);
                      }}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                      className={`flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all border text-center group ${
                        isSelected 
                          ? 'bg-violet-600/30 border-violet-500 ring-1 ring-violet-400/50 shadow-lg shadow-violet-500/15' 
                          : 'bg-slate-800/25 hover:bg-slate-800/60 border-transparent hover:border-slate-700/60'
                      }`}
                    >
                      <div className="mb-2 shrink-0 group-hover:scale-105 transition-transform">
                        {getFileIcon(item, 'large')}
                      </div>
                      <span className="text-xs font-medium text-slate-200 line-clamp-2 break-all w-full leading-snug">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1 font-mono">
                        {item.type === 'folder' ? 'Folder' : item.size || 'File'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="divide-y divide-slate-800/60 text-xs">
                <div className="grid grid-cols-12 py-2 px-3 text-slate-400 font-semibold border-b border-slate-800 bg-slate-950/40 rounded-t-lg">
                  <span className="col-span-5">Name</span>
                  <span className="col-span-3">Date Modified</span>
                  <span className="col-span-2">Type</span>
                  <span className="col-span-2 text-right">Size</span>
                </div>
                {items.map(item => {
                  const isSelected = selectedItemId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItemId(item.id);
                      }}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                      className={`grid grid-cols-12 items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-violet-600/25 text-white font-medium ring-1 ring-violet-500/40' 
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className="col-span-5 flex items-center gap-2.5 truncate pr-2">
                        {getFileIcon(item, 'small')}
                        <span className="truncate">{item.name}</span>
                      </div>
                      <span className="col-span-3 text-slate-400 font-mono text-[11px]">{item.modified}</span>
                      <span className="col-span-2 text-slate-400 capitalize">{item.type}</span>
                      <span className="col-span-2 text-right text-slate-400 font-mono text-[11px]">{item.size || '—'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Status bar */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/90 text-xs text-slate-400 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-300">{items.length} items</span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] text-slate-500 font-mono">Btrfs NVMe: 42.8 GB / 512 GB Used</span>
          {selectedItem && (
            <>
              <span className="text-slate-600">|</span>
              <span className="text-violet-400 font-medium truncate max-w-[200px]">{selectedItem.name}</span>
              <span className="text-[11px] text-slate-400 font-mono">{selectedItem.size || (selectedItem.type === 'folder' ? 'Folder' : '')}</span>
            </>
          )}
        </div>

        {/* Action Controls for Selected Item */}
        {selectedItem && (
          <div className="flex items-center gap-2">
            {currentFolderId === 'trash' ? (
              <button
                onClick={() => restoreFromTrash(selectedItem.id)}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors cursor-pointer"
              >
                <CornerUpLeft className="w-3.5 h-3.5" />
                <span>Restore</span>
              </button>
            ) : null}

            <button
              onClick={() => {
                setRenameValue(selectedItem.name);
                setShowRenameModal(true);
              }}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Rename</span>
            </button>

            <button
              onClick={() => setShowPropertiesModal(true)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-violet-400" />
              <span>Properties</span>
            </button>

            <button
              onClick={() => deleteItem(selectedItem.id)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-rose-950/40 border border-rose-900/60 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal: New Folder */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateFolder} className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-84 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Folder className="w-4 h-4 text-amber-400" />
              <span>Create New Folder</span>
            </div>
            <input
              type="text"
              autoFocus
              placeholder="Folder Name (e.g. My-Project)"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-violet-500"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowNewFolderModal(false)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium cursor-pointer"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: New File */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateFile} className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-96 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Create New Text File</span>
            </div>
            <div>
              <label className="text-[11px] text-slate-400">File Name with extension</label>
              <input
                type="text"
                autoFocus
                placeholder="document.txt / script.sh"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Initial Content (Optional)</label>
              <textarea
                placeholder="Enter initial content here..."
                rows={4}
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowNewFileModal(false)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium cursor-pointer"
              >
                Create File
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Rename Item */}
      {showRenameModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleRename} className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-84 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Edit3 className="w-4 h-4 text-violet-400" />
              <span>Rename Item</span>
            </div>
            <input
              type="text"
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-violet-500"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowRenameModal(false)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Item Properties */}
      {showPropertiesModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-96 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-semibold text-white text-sm">
                <Info className="w-4 h-4 text-violet-400" />
                <span>Item Properties</span>
              </div>
              <button 
                onClick={() => setShowPropertiesModal(false)} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Name:</span>
                <span className="font-semibold text-white">{selectedItem.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Type:</span>
                <span className="capitalize">{selectedItem.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Location:</span>
                <span className="font-mono text-slate-300 truncate max-w-[210px]">{selectedItem.path}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Size:</span>
                <span className="font-mono">{selectedItem.size || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Modified:</span>
                <span className="font-mono">{selectedItem.modified}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Permissions:</span>
                <span className="font-mono text-emerald-400">
                  {selectedItem.type === 'folder' ? 'drwxr-xr-x (0755)' : '-rw-r--r-- (0644)'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Owner / Group:</span>
                <span className="font-mono text-slate-300">encantos / encantos</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPropertiesModal(false)}
                className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: File Preview */}
      {previewContent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Eye className="w-4 h-4 text-violet-400" />
                <span>{previewContent.title}</span>
              </div>
              <button 
                onClick={() => setPreviewContent(null)} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-200 bg-slate-950 p-4 rounded-xl overflow-auto flex-1 whitespace-pre-wrap border border-slate-800">
              {previewContent.text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
