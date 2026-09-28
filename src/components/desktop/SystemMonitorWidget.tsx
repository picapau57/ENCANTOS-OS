import React, { useState, useEffect, useId } from 'react';
import { 
  Activity, Cpu, HardDrive, Wifi, Zap, Flame, 
  ExternalLink, Minimize2, Maximize2, X, RefreshCw,
  Gauge, TrendingUp, Layers, ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { useSystem } from '../../context/SystemContext';

interface MetricPoint {
  time: string;
  cpu: number;
  ram: number;
  diskRead: number;
  diskWrite: number;
  netDown: number;
}

export const SystemMonitorWidget: React.FC = () => {
  const { 
    systemMetrics, 
    boostSystemLoad, 
    openWindow, 
    showSystemMonitorWidget, 
    setShowSystemMonitorWidget 
  } = useSystem();

  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'cpu' | 'memory' | 'disk'>('overview');
  const [history, setHistory] = useState<MetricPoint[]>([]);
  const [stressActive, setStressActive] = useState(false);
  const chartId = useId();

  // Populate rolling 20-sample history buffer
  useEffect(() => {
    const now = new Date();
    const timeLabel = `${now.getMinutes()}:${now.getSeconds().toString().padStart(2, '0')}`;

    const newPoint: MetricPoint = {
      time: timeLabel,
      cpu: systemMetrics.cpuPercent,
      ram: systemMetrics.ramPercent,
      diskRead: systemMetrics.diskReadMb,
      diskWrite: systemMetrics.diskWriteMb,
      netDown: Math.round(systemMetrics.netDownloadKb / 10) / 10
    };

    setHistory(prev => {
      const updated = [...prev, newPoint];
      return updated.length > 20 ? updated.slice(updated.length - 20) : updated;
    });
  }, [systemMetrics]);

  if (!showSystemMonitorWidget) return null;

  const handleStressTest = () => {
    setStressActive(true);
    boostSystemLoad(45);
    setTimeout(() => setStressActive(false), 2500);
  };

  // Pie chart data for memory
  const ramUsed = systemMetrics.ramUsedGb;
  const ramFree = Math.max(0.5, Math.round((systemMetrics.ramTotalGb - ramUsed) * 10) / 10);
  const ramPieData = [
    { name: 'Used', value: ramUsed, color: '#06b6d4' },
    { name: 'Available', value: ramFree, color: '#1e293b' }
  ];

  // Pie chart data for disk
  const diskUsed = systemMetrics.diskUsageGb;
  const diskFree = Math.max(1, Math.round((systemMetrics.totalDiskGb - diskUsed) * 10) / 10);
  const diskPieData = [
    { name: 'Used', value: diskUsed, color: '#10b981' },
    { name: 'Free', value: diskFree, color: '#1e293b' }
  ];

  return (
    <div 
      className={`fixed top-4 right-16 z-20 select-none transition-all duration-300 ${
        isMinimized ? 'w-64' : 'w-88 md:w-96'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-slate-950/80 backdrop-blur-2xl border border-slate-700/60 rounded-2xl shadow-2xl p-3.5 text-slate-200 ring-1 ring-white/10 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/25">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-xs tracking-wide">SYSTEM MONITOR</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Real-time Performance</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Stress Test Boost Button */}
            <button
              onClick={handleStressTest}
              className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                stressActive 
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-bounce' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/50'
              }`}
              title="Simulate CPU Stress Spike"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            </button>

            {/* Launch full window */}
            <button
              onClick={() => openWindow('system-monitor')}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Open full System Monitor window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Minimize / Expand Toggle */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isMinimized ? 'Expand widget' : 'Collapse widget'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close Widget */}
            <button
              onClick={() => setShowSystemMonitorWidget(false)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-800 text-slate-500 transition-colors cursor-pointer"
              title="Hide Desktop Widget (Re-enable from Desktop context menu)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Minimized Compact View */}
        {isMinimized ? (
          <div className="pt-2.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Cpu className="w-3 h-3 text-violet-400" /> CPU
              </span>
              <span className="font-mono text-violet-400 font-bold">{systemMetrics.cpuPercent}%</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-violet-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${systemMetrics.cpuPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Layers className="w-3 h-3 text-cyan-400" /> RAM
              </span>
              <span className="font-mono text-cyan-400 font-bold">{systemMetrics.ramPercent}%</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${systemMetrics.ramPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <HardDrive className="w-3 h-3 text-emerald-400" /> Disk
              </span>
              <span className="font-mono text-emerald-400 font-bold">{systemMetrics.diskPercent}%</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${systemMetrics.diskPercent}%` }}
              />
            </div>
          </div>
        ) : (
          /* Expanded Full Dashboard View */
          <div className="pt-2.5 space-y-3">
            {/* View Filter Pills */}
            <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px]">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-1 rounded font-medium transition-colors cursor-pointer ${
                  activeTab === 'overview' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('cpu')}
                className={`py-1 rounded font-medium transition-colors cursor-pointer ${
                  activeTab === 'cpu' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                CPU
              </button>
              <button
                onClick={() => setActiveTab('memory')}
                className={`py-1 rounded font-medium transition-colors cursor-pointer ${
                  activeTab === 'memory' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                RAM
              </button>
              <button
                onClick={() => setActiveTab('disk')}
                className={`py-1 rounded font-medium transition-colors cursor-pointer ${
                  activeTab === 'disk' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Disk
              </button>
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                {/* 3 Metric Cards with Micro Radial / Bar Gauges */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {/* CPU Box */}
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-400">
                      <Cpu className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-[10px] font-mono text-slate-500">{systemMetrics.cpuTemp}°C</span>
                    </div>
                    <div className="my-1.5">
                      <div className="text-[10px] text-slate-400 font-medium">CPU Usage</div>
                      <div className="text-base font-bold font-mono text-white leading-tight">
                        {systemMetrics.cpuPercent}%
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-violet-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${systemMetrics.cpuPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* RAM Box */}
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px] font-mono text-slate-500">16 GB</span>
                    </div>
                    <div className="my-1.5">
                      <div className="text-[10px] text-slate-400 font-medium">RAM In-Use</div>
                      <div className="text-base font-bold font-mono text-cyan-400 leading-tight">
                        {systemMetrics.ramPercent}%
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${systemMetrics.ramPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Disk Box */}
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-400">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] font-mono text-slate-500">NVMe</span>
                    </div>
                    <div className="my-1.5">
                      <div className="text-[10px] text-slate-400 font-medium">Storage</div>
                      <div className="text-base font-bold font-mono text-emerald-400 leading-tight">
                        {systemMetrics.diskPercent}%
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${systemMetrics.diskPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Real-time Recharts Area Chart: Combined Activity */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-violet-400" />
                      Real-Time CPU Activity (Last 30s)
                    </span>
                    <span className="font-mono text-violet-400 font-semibold">{systemMetrics.cpuFrequencyGhz} GHz</span>
                  </div>

                  <div className="h-28 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`${chartId}-cpuGrad`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-slate-900/95 border border-slate-700 px-2 py-1 rounded shadow-lg text-[10px] font-mono">
                                  <div className="text-violet-400">CPU: {payload[0].value}%</div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="cpu" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill={`url(#${chartId}-cpuGrad)`} 
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Network & I/O Telemetry Footer */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                  <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-sky-400" />
                      <span>Net In/Out:</span>
                    </div>
                    <span className="font-mono text-sky-400 font-semibold">
                      {systemMetrics.netDownloadKb} KB/s
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-emerald-400" />
                      <span>Disk R/W:</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {systemMetrics.diskReadMb}/{systemMetrics.diskWriteMb} MB/s
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CPU LIVE */}
            {activeTab === 'cpu' && (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-violet-400" />
                        <span>Intel Core i7-13700H</span>
                      </div>
                      <div className="text-[10px] text-slate-400">14 Cores (6P + 8E) · 20 Threads</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-violet-400 font-bold text-sm">{systemMetrics.cpuPercent}%</div>
                      <div className="text-[10px] text-slate-500 font-mono">Load: {systemMetrics.loadAverage.join(', ')}</div>
                    </div>
                  </div>

                  <div className="h-32 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`${chartId}-cpuTab`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.7}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-violet-300">
                                  Load: {payload[0].value}%
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="cpu" 
                          stroke="#a855f7" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill={`url(#${chartId}-cpuTab)`} 
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-800/80 text-[10px] text-center">
                    <div>
                      <div className="text-slate-500">Frequency</div>
                      <div className="font-mono text-slate-200 font-semibold">{systemMetrics.cpuFrequencyGhz} GHz</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Temperature</div>
                      <div className="font-mono text-amber-400 font-semibold">{systemMetrics.cpuTemp} °C</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Governor</div>
                      <div className="font-mono text-emerald-400 font-semibold">schedutil</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MEMORY (RAM) */}
            {activeTab === 'memory' && (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      LPDDR5X Dual-Channel
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {ramUsed} / {systemMetrics.ramTotalGb} GB
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-1">
                    {/* Donut Chart using Recharts PieChart */}
                    <div className="w-24 h-24 shrink-0 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={ramPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={26}
                            outerRadius={40}
                            paddingAngle={3}
                            dataKey="value"
                            isAnimationActive={false}
                          >
                            {ramPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-[11px] font-mono font-bold text-white leading-none">
                          {systemMetrics.ramPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" /> Active:
                        </span>
                        <span className="font-mono text-white font-medium">{ramUsed} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-indigo-400" /> Buffer/Cache:
                        </span>
                        <span className="font-mono text-white font-medium">3.8 GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-slate-600" /> Free Memory:
                        </span>
                        <span className="font-mono text-slate-300 font-medium">{ramFree} GB</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800">
                        <span className="text-slate-500">ZRAM Swap:</span>
                        <span className="font-mono text-emerald-400">0.4 / 8.0 GB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DISK */}
            {activeTab === 'disk' && (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                      NVMe SSD (Btrfs /root)
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {diskUsed} / {systemMetrics.totalDiskGb} GB
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-1">
                    {/* Donut Chart using Recharts PieChart */}
                    <div className="w-24 h-24 shrink-0 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={diskPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={26}
                            outerRadius={40}
                            paddingAngle={3}
                            dataKey="value"
                            isAnimationActive={false}
                          >
                            {diskPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-[11px] font-mono font-bold text-white leading-none">
                          {systemMetrics.diskPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Read Throughput:</span>
                        <span className="font-mono text-emerald-400 font-semibold">{systemMetrics.diskReadMb} MB/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Write Throughput:</span>
                        <span className="font-mono text-amber-400 font-semibold">{systemMetrics.diskWriteMb} MB/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Drive Health:</span>
                        <span className="font-mono text-emerald-400 font-semibold">100% SMART OK</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800">
                        <span className="text-slate-500">File System:</span>
                        <span className="font-mono text-slate-300">Btrfs + Zstd:1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
