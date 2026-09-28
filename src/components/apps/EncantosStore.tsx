import React, { useState, useMemo } from 'react';
import { 
  Search, Download, Trash2, CheckCircle2, Shield, 
  ExternalLink, Loader2, Sparkles, Star, Layers,
  Compass, Code, Palette, Film, Briefcase, Box, Radio, 
  Gamepad2, Activity, HardDrive, RotateCcw, Package, 
  Wifi, Music, Mail, Filter, Grid, List, RefreshCw, 
  Check, X, SlidersHorizontal, ArrowRight, Eye, Info,
  Cpu, Wrench, ShieldCheck, Zap
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { StoreApp } from '../../types';

export const EncantosStore: React.FC = () => {
  const { apps, installApp, uninstallApp, openWindow, addNotification } = useSystem();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'utilities' | 'installed' | 'updates'>('discover');
  const [formatFilter, setFormatFilter] = useState<'all' | 'Flatpak' | 'Native (.deb)'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'downloads' | 'name' | 'size'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null);
  const [detailTab, setDetailTab] = useState<'about' | 'permissions' | 'specs'>('about');
  const [checkingUpdates, setCheckingUpdates] = useState(false);

  const categories = [
    { id: 'All', name: 'All Software', icon: Layers },
    { id: 'Utilities', name: 'System Utilities', icon: Wrench, highlight: true },
    { id: 'Development', name: 'Development', icon: Code },
    { id: 'Internet', name: 'Internet & Cloud', icon: Compass },
    { id: 'Graphics', name: 'Graphics & Design', icon: Palette },
    { id: 'Multimedia', name: 'Multimedia & Audio', icon: Film },
    { id: 'Productivity', name: 'Productivity', icon: Briefcase },
    { id: 'Security', name: 'Security & Privacy', icon: ShieldCheck },
    { id: 'Games', name: 'Games & Steam', icon: Gamepad2 }
  ];

  // Quick stats
  const totalAppsCount = apps.length;
  const installedCount = apps.filter(a => a.installed).length;
  const utilitiesCount = apps.filter(a => a.category === 'Utilities' || a.isUtility).length;

  const filteredApps = useMemo(() => {
    let result = apps.filter(app => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        app.name.toLowerCase().includes(q) ||
        app.tagline.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.developer.toLowerCase().includes(q);

      // Category matching
      let matchesCat = true;
      if (activeTab === 'utilities') {
        matchesCat = app.category === 'Utilities' || !!app.isUtility;
      } else if (selectedCategory !== 'All') {
        matchesCat = app.category === selectedCategory;
      }

      // Format matching
      const matchesFormat = formatFilter === 'all' || app.format === formatFilter;

      if (activeTab === 'installed') {
        return matchesSearch && app.installed && matchesFormat;
      }

      return matchesSearch && matchesCat && matchesFormat;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return parseFloat(a.size) - parseFloat(b.size);
      if (sortBy === 'downloads') {
        const parseDownloads = (str?: string) => {
          if (!str) return 0;
          if (str.includes('M')) return parseFloat(str) * 1000000;
          if (str.includes('K')) return parseFloat(str) * 1000;
          return parseFloat(str) || 0;
        };
        return parseDownloads(b.downloadsCount) - parseDownloads(a.downloadsCount);
      }
      return 0;
    });

    return result;
  }, [apps, searchQuery, selectedCategory, activeTab, formatFilter, sortBy]);

  const getAppCategoryIcon = (app: StoreApp) => {
    switch (app.icon) {
      case 'Activity': return <Activity className="w-5 h-5 text-emerald-400" />;
      case 'HardDrive': return <HardDrive className="w-5 h-5 text-indigo-400" />;
      case 'RotateCcw': return <RotateCcw className="w-5 h-5 text-amber-400" />;
      case 'Trash2': return <Trash2 className="w-5 h-5 text-rose-400" />;
      case 'Shield': return <Shield className="w-5 h-5 text-teal-400" />;
      case 'Package': return <Package className="w-5 h-5 text-amber-500" />;
      case 'Wifi': return <Wifi className="w-5 h-5 text-sky-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-sky-400" />;
      case 'Download': return <Download className="w-5 h-5 text-emerald-400" />;
      case 'Code': return <Code className="w-5 h-5 text-emerald-400" />;
      case 'Palette': return <Palette className="w-5 h-5 text-pink-400" />;
      case 'Box': return <Box className="w-5 h-5 text-cyan-400" />;
      case 'Film': return <Film className="w-5 h-5 text-violet-400" />;
      case 'Music': return <Music className="w-5 h-5 text-rose-400" />;
      case 'Radio': return <Radio className="w-5 h-5 text-indigo-400" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-amber-400" />;
      case 'Mail': return <Mail className="w-5 h-5 text-sky-400" />;
      case 'Gamepad2': return <Gamepad2 className="w-5 h-5 text-violet-400" />;
      default: return <Package className="w-5 h-5 text-slate-400" />;
    }
  };

  const getIconBackground = (category: string) => {
    switch (category) {
      case 'Utilities': return 'from-teal-600/30 to-emerald-600/30 border-teal-500/40 text-teal-300';
      case 'Development': return 'from-emerald-600/30 to-teal-600/30 border-emerald-500/40 text-emerald-300';
      case 'Internet': return 'from-sky-600/30 to-blue-600/30 border-sky-500/40 text-sky-300';
      case 'Graphics': return 'from-pink-600/30 to-purple-600/30 border-pink-500/40 text-pink-300';
      case 'Multimedia': return 'from-violet-600/30 to-indigo-600/30 border-violet-500/40 text-violet-300';
      case 'Productivity': return 'from-amber-600/30 to-orange-600/30 border-amber-500/40 text-amber-300';
      case 'Security': return 'from-cyan-600/30 to-teal-600/30 border-cyan-500/40 text-cyan-300';
      case 'Games': return 'from-purple-600/30 to-rose-600/30 border-purple-500/40 text-purple-300';
      default: return 'from-slate-800 to-slate-700 border-slate-700 text-slate-300';
    }
  };

  const renderInstallButton = (app: StoreApp, isCompact = false) => {
    if (app.isInstalling) {
      let phaseLabel = 'Downloading...';
      if (app.installPhase === 'installing') phaseLabel = 'Unpacking...';
      if (app.installPhase === 'configuring') phaseLabel = 'Configuring...';

      return (
        <div className="flex flex-col gap-1 w-28 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] text-violet-400 font-medium">
            <Loader2 className="w-3 h-3 animate-spin shrink-0" />
            <span className="truncate">{phaseLabel}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-violet-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${app.installProgress || 15}%` }}
            />
          </div>
        </div>
      );
    }

    if (app.installed) {
      return (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (app.id === 'btop' || app.id === 'htop-pro') {
                openWindow('system-monitor');
              } else if (app.id === 'gparted') {
                openWindow('disk-utility');
              } else if (app.windowId) {
                openWindow(app.windowId);
              } else {
                addNotification({
                  title: `${app.name} Started`,
                  message: `Launched ${app.name} (${app.version}) in the Wayland session.`,
                  type: 'info'
                });
              }
            }}
            className="px-3 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Open</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              uninstallApp(app.id);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Uninstall package"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          installApp(app.id);
        }}
        className={`px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold shadow-sm shadow-violet-600/30 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
          isCompact ? 'py-0.5 text-[11px]' : ''
        }`}
      >
        <Download className="w-3 h-3" />
        <span>Install</span>
      </button>
    );
  };

  const handleCheckUpdates = () => {
    setCheckingUpdates(true);
    setTimeout(() => {
      setCheckingUpdates(false);
      addNotification({
        title: 'Package Repositories Synchronized',
        message: 'All package repositories (Flathub, Debian 13, and Encantos Core) are up to date.',
        type: 'success'
      });
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col bg-slate-900/95 text-slate-200 select-none overflow-hidden">
      {/* Top Main Navigation Header */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-800 bg-slate-950/70 gap-4">
        <div className="flex items-center gap-5">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/20 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-xs tracking-wider">ENCANTOS APP STORE</span>
              <div className="text-[10px] text-slate-400 font-mono -mt-0.5">Software & Utilities Hub</div>
            </div>
          </div>

          {/* Navigation Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                setActiveTab('discover');
                setSelectedCategory('All');
              }}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'discover' 
                  ? 'bg-violet-600 text-white font-medium shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => {
                setActiveTab('utilities');
                setSelectedCategory('Utilities');
              }}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'utilities' 
                  ? 'bg-violet-600 text-white font-medium shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3 h-3 text-teal-400" />
              <span>Utilities ({utilitiesCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('installed')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'installed' 
                  ? 'bg-violet-600 text-white font-medium shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Installed ({installedCount})
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'updates' 
                  ? 'bg-violet-600 text-white font-medium shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Updates
            </button>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search utilities, packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Visual Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'compact' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Compact View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Categories & Package Types */}
        {(activeTab === 'discover' || activeTab === 'utilities') && (
          <div className="w-52 bg-slate-950/50 border-r border-slate-800/80 p-3 flex flex-col gap-3 text-xs shrink-0 overflow-y-auto">
            {/* Category Navigation */}
            <div>
              <span className="px-3 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Catalog Categories
              </span>
              <div className="flex flex-col gap-0.5 mt-1">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = activeTab === 'utilities' ? cat.id === 'Utilities' : selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (cat.id === 'Utilities') {
                          setActiveTab('utilities');
                          setSelectedCategory('Utilities');
                        } else {
                          setActiveTab('discover');
                          setSelectedCategory(cat.id);
                        }
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-violet-600 text-white font-semibold shadow-md shadow-violet-600/25 ring-1 ring-violet-500/40' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      {cat.id === 'Utilities' && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-teal-500/20 text-teal-400'
                        }`}>
                          {utilitiesCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter by Package Format */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="px-3 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Package Format
              </span>
              <div className="flex flex-col gap-1 mt-1 px-1">
                {[
                  { id: 'all', label: 'All Formats' },
                  { id: 'Native (.deb)', label: 'Native (.deb / APT)' },
                  { id: 'Flatpak', label: 'Flatpak Sandbox' }
                ].map(fmt => (
                  <button
                    key={fmt.id}
                    onClick={() => setFormatFilter(fmt.id as any)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[11px] transition-colors cursor-pointer ${
                      formatFilter === fmt.id
                        ? 'bg-slate-800 text-violet-300 font-medium'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <span>{fmt.label}</span>
                    {formatFilter === fmt.id && <Check className="w-3 h-3 text-violet-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Repository Info Widget */}
            <div className="mt-auto p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[10px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Repositories</span>
              </div>
              <p className="text-slate-500 leading-tight">
                Flathub, Debian 13 Trixie, and Encantos Official Packages.
              </p>
            </div>
          </div>
        )}

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/40">
          {/* Controls Bar: Sort & Filter Summary */}
          <div className="px-6 py-2.5 bg-slate-950/30 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white">
                {activeTab === 'utilities' ? 'System Utilities Catalog' : activeTab === 'installed' ? 'Installed Applications' : selectedCategory}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ({filteredApps.length} packages found)
              </span>
            </div>

            {/* Sorting Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="rating">Top Rated ⭐</option>
                <option value="downloads">Most Popular 🚀</option>
                <option value="name">Name (A-Z)</option>
                <option value="size">Size (Small to Large)</option>
              </select>
            </div>
          </div>

          {/* Catalog Canvas */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* UPDATES TAB VIEW */}
            {activeTab === 'updates' ? (
              <div className="max-w-xl mx-auto space-y-4 pt-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">System Packages are Up to Date</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    All installed utilities, core packages, and Flatpak runtimes match the latest upstream security revisions.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={handleCheckUpdates}
                    disabled={checkingUpdates}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 mx-auto transition-colors cursor-pointer border border-slate-700"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdates ? 'animate-spin text-violet-400' : ''}`} />
                    <span>{checkingUpdates ? 'Synchronizing Repositories...' : 'Check for Updates Now'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Featured Banner in Discover Tab */}
                {activeTab === 'discover' && selectedCategory === 'All' && !searchQuery && (
                  <div className="relative rounded-2xl overflow-hidden mb-6 p-6 border border-slate-700/70 bg-gradient-to-r from-violet-950/70 via-slate-900 to-indigo-950/60 shadow-2xl">
                    <div className="relative z-10 max-w-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-violet-600/30 text-violet-300 border border-violet-500/40">
                          Featured System Utility
                        </span>
                        <span className="text-[11px] text-amber-400 flex items-center gap-1 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" /> 4.9 (3,840 reviews)
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-white">Btop++ Resource Telemetry HUD</h2>
                      <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        Aesthetic C++ hardware monitor featuring real-time responsive graphs for CPU cores, RAM allocation, NVMe I/O throughput, and process management.
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={() => installApp('btop')}
                          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-violet-500/25 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Install Free Utility</span>
                        </button>
                        <span className="text-xs text-slate-400 font-mono">4.8 MB · Native Package</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {filteredApps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500">
                    <Package className="w-14 h-14 stroke-[1.2] mb-3 opacity-30 text-slate-400" />
                    <h4 className="text-sm font-semibold text-slate-300">No applications found</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Try searching with a different keyword or resetting your category filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setFormatFilter('all');
                      }}
                      className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : viewMode === 'grid' ? (
                  /* VISUAL GRID VIEW */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredApps.map(app => (
                      <div
                        key={app.id}
                        onClick={() => {
                          setSelectedApp(app);
                          setDetailTab('about');
                        }}
                        className="p-4 rounded-2xl border border-slate-800/90 bg-slate-950/50 hover:bg-slate-900/70 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-600/10 transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          {/* App Card Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {/* Colored Gradient App Icon */}
                              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${getIconBackground(app.category)} border flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                                {getAppCategoryIcon(app)}
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-sm text-white group-hover:text-violet-300 transition-colors truncate">
                                  {app.name}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] text-slate-400 truncate">{app.category}</span>
                                  {app.isUtility && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                      Utility
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Rating Stars */}
                            <div className="flex items-center gap-1 text-[11px] text-amber-400 shrink-0 font-medium">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{app.rating}</span>
                            </div>
                          </div>

                          {/* App Tagline */}
                          <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                            {app.tagline}
                          </p>
                        </div>

                        {/* Card Footer: Metadata & Action Button */}
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-300">
                              {app.format}
                            </span>
                            <span>·</span>
                            <span className="font-mono">{app.size}</span>
                          </div>

                          {renderInstallButton(app)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* COMPACT LIST VIEW */
                  <div className="divide-y divide-slate-800/70 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40 text-xs">
                    {filteredApps.map(app => (
                      <div
                        key={app.id}
                        onClick={() => {
                          setSelectedApp(app);
                          setDetailTab('about');
                        }}
                        className="p-3 flex items-center justify-between hover:bg-slate-900/60 transition-colors cursor-pointer gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getIconBackground(app.category)} border flex items-center justify-center shrink-0`}>
                            {getAppCategoryIcon(app)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-white text-xs truncate hover:text-violet-300">
                                {app.name}
                              </h4>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                                {app.format}
                              </span>
                              {app.isUtility && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
                                  System Utility
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{app.tagline}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 shrink-0 text-slate-400 text-[11px] font-mono">
                          <span className="text-amber-400 flex items-center gap-1 font-sans font-medium">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {app.rating}
                          </span>
                          <span>{app.size}</span>
                          <span>{app.developer}</span>
                          {renderInstallButton(app, true)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Package Details Inspector Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 w-full max-w-xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${getIconBackground(selectedApp.category)} border flex items-center justify-center shrink-0 shadow-lg`}>
                  {getAppCategoryIcon(selectedApp)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{selectedApp.name}</h2>
                    {selectedApp.isUtility && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        System Utility
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{selectedApp.developer} · {selectedApp.category}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedApp.format}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">v{selectedApp.version}</span>
                    <span className="text-amber-400 flex items-center gap-1 text-[11px] font-medium ml-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {selectedApp.rating} ({selectedApp.reviewsCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 mb-3 text-xs">
              <button
                onClick={() => setDetailTab('about')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  detailTab === 'about' ? 'bg-violet-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setDetailTab('permissions')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  detailTab === 'permissions' ? 'bg-violet-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Security & Sandbox
              </button>
              <button
                onClick={() => setDetailTab('specs')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  detailTab === 'specs' ? 'bg-violet-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Technical Package Specs
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 pr-2 text-xs space-y-4">
              {detailTab === 'about' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-200 mb-1">About this application</h4>
                    <p className="text-slate-400 leading-relaxed">{selectedApp.description}</p>
                  </div>

                  {selectedApp.features && selectedApp.features.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-200 mb-2">Key Highlights & Capabilities</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                        {selectedApp.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px]">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'permissions' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-2 text-slate-300 font-semibold mb-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Security Model & Sandbox Permissions</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mb-3">
                      This package runs in an isolated bubble managed by bubblewrap/systemd namespaces.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApp.permissions.map(perm => (
                        <span key={perm} className="px-2.5 py-1 bg-slate-900 rounded-md text-[11px] text-slate-300 border border-slate-800 flex items-center gap-1.5 font-mono">
                          <Check className="w-3 h-3 text-teal-400" />
                          <span>{perm}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'specs' && (
                <div className="grid grid-cols-2 gap-3 text-slate-400 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80 font-mono text-[11px]">
                  <div><span className="text-slate-500">Package Version:</span> <span className="text-slate-200 font-semibold">{selectedApp.version}</span></div>
                  <div><span className="text-slate-500">Software License:</span> <span className="text-slate-200">{selectedApp.license}</span></div>
                  <div><span className="text-slate-500">Download Size:</span> <span className="text-slate-200">{selectedApp.size}</span></div>
                  <div><span className="text-slate-500">Total Downloads:</span> <span className="text-emerald-400 font-semibold">{selectedApp.downloadsCount || '500K+'}</span></div>
                  <div><span className="text-slate-500">Architecture:</span> <span className="text-slate-200">x86_64 / amd64</span></div>
                  <div><span className="text-slate-500">Sandbox Engine:</span> <span className="text-slate-200">Bubblewrap + AppArmor</span></div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified safe by Encantos Package Trust Engine</span>
              </span>
              {renderInstallButton(selectedApp)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
