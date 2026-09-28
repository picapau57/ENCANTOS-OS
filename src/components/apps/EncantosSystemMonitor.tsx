import React, { useState, useEffect, useId } from 'react';
import { 
  Activity, Cpu, HardDrive, Wifi, ShieldAlert, XCircle, 
  Search, Flame, RefreshCw, Layers, Gauge, TrendingUp, Info
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { useSystem } from '../../context/SystemContext';

interface ChartSample {
  time: string;
  cpu: number;
  ram: number;
  diskRead: number;
  netDown: number;
}

export const EncantosSystemMonitor: React.FC = () => {
  const { processes, killProcess, systemMetrics, boostSystemLoad } = useSystem();
  const [activeTab, setActiveTab] = useState<'resources' | 'processes'>('resources');
  const [processSearch, setProcessSearch] = useState('');
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [chartHistory, setChartHistory] = useState<ChartSample[]>([]);
  const [stressActive, setStressActive] = useState(false);
  const chartId = useId();

  // Populate rolling 25-sample history for Recharts
  useEffect(() => {
    const now = new Date();
    const timeLabel = `${now.getSeconds()}s`;

    const point: ChartSample = {
      time: timeLabel,
      cpu: systemMetrics.cpuPercent,
      ram: systemMetrics.ramPercent,
      diskRead: systemMetrics.diskReadMb,
      netDown: Math.round(systemMetrics.netDownloadKb / 10) / 10
    };

    setChartHistory(prev => {
      const next = [...prev, point];
      return next.length > 25 ? next.slice(next.length - 25) : next;
    });
  }, [systemMetrics]);

  const handleBenchmark = () => {
    setStressActive(true);
    boostSystemLoad(40);
    setTimeout(() => setStressActive(false), 2000);
  };

  const filteredProcesses = processes.filter(p => 
    p.name.toLowerCase().includes(processSearch.toLowerCase()) || 
    p.pid.toString().includes(processSearch)
  );

  // Pie chart data for memory
  const ramUsed = systemMetrics.ramUsedGb;
  const ramFree = Math.max(0.5, Math.round((systemMetrics.ramTotalGb - ramUsed) * 10) / 10);
  const ramPieData = [
    { name: 'Used', value: ramUsed, color: '#06b6d4' },
    { name: 'Free', value: ramFree, color: '#1e293b' }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900/95 text-slate-200 select-none overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-400" />
          <span className="font-bold text-white text-xs">ENCANTOS SYSTEM MONITOR</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBenchmark}
            className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              stressActive
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/40'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Spike</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'resources' ? 'bg-violet-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Resources & Visualizations
            </button>
            <button
              onClick={() => setActiveTab('processes')}
              className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'processes' ? 'bg-violet-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Processes ({processes.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main View */}
      <div className="flex-1 p-5 overflow-y-auto">
        {activeTab === 'resources' ? (
          <div className="space-y-5">
            {/* 4 Performance Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CPU */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <Cpu className="w-3.5 h-3.5 text-violet-400" />
                    <span>CPU Usage</span>
                  </div>
                  <span className="font-mono text-violet-400 font-bold">{systemMetrics.cpuPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-violet-500 h-full rounded-full transition-all duration-300" style={{ width: `${systemMetrics.cpuPercent}%` }} />
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>14 Cores · {systemMetrics.cpuFrequencyGhz} GHz</span>
                  <span className="text-amber-400">{systemMetrics.cpuTemp}°C</span>
                </div>
              </div>

              {/* Memory */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Memory (RAM)</span>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold">{ramUsed} / {systemMetrics.ramTotalGb} GB</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full transition-all duration-300" style={{ width: `${systemMetrics.ramPercent}%` }} />
                </div>
                <div className="text-[10px] text-slate-500">{systemMetrics.ramPercent}% in use · {ramFree} GB Available</div>
              </div>

              {/* Storage */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Root Storage</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">{systemMetrics.diskUsageGb} / {systemMetrics.totalDiskGb} GB</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${systemMetrics.diskPercent}%` }} />
                </div>
                <div className="text-[10px] text-slate-500">Btrfs SSD · {systemMetrics.diskPercent}% used</div>
              </div>

              {/* Network */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <Wifi className="w-3.5 h-3.5 text-amber-400" />
                    <span>Network Bandwidth</span>
                  </div>
                  <span className="font-mono text-amber-400 font-bold">{systemMetrics.netDownloadKb} KB/s</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, systemMetrics.netDownloadKb / 10)}%` }} />
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between font-mono">
                  <span>↓ {systemMetrics.netDownloadKb} KB/s</span>
                  <span>↑ {systemMetrics.netUploadKb} KB/s</span>
                </div>
              </div>
            </div>

            {/* Recharts CPU Real-Time Visualization Timeline */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  <span className="font-bold text-white text-xs">CPU Performance History (Recharts D3 Visualization)</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">Load Avg: <span className="font-mono text-white">{systemMetrics.loadAverage.join(', ')}</span></span>
                  <span className="font-mono text-violet-400 font-bold">{systemMetrics.cpuPercent}%</span>
                </div>
              </div>

              <div className="h-44 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`${chartId}-appCpu`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-xs shadow-xl font-mono">
                              <div className="text-violet-400 font-bold">CPU Load: {payload[0].value}%</div>
                              <div className="text-slate-400 text-[10px]">Freq: {systemMetrics.cpuFrequencyGhz} GHz</div>
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
                      fill={`url(#${chartId}-appCpu)`} 
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hardware Telemetry Detail */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs">
              <h4 className="font-semibold text-white mb-2">Compositor Performance & Kernel</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-400">
                <div><span className="text-slate-500">Frame Timing:</span> <span className="font-mono text-slate-200">8.33 ms (120 FPS)</span></div>
                <div><span className="text-slate-500">GPU Renderer:</span> <span className="font-mono text-slate-200">Intel Iris Xe / Mesa 24.1</span></div>
                <div><span className="text-slate-500">Vulkan Extension:</span> <span className="font-mono text-emerald-400">VK_KHR_wayland_surface</span></div>
                <div><span className="text-slate-500">Kernel Scheduler:</span> <span className="font-mono text-slate-200">EEVDF (LTS 6.8)</span></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Search and End Process Action */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter processes..."
                  value={processSearch}
                  onChange={(e) => setProcessSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              {selectedPid && (
                <button
                  onClick={() => {
                    killProcess(selectedPid);
                    setSelectedPid(null);
                  }}
                  className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/50 text-rose-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Kill PID {selectedPid}</span>
                </button>
              )}
            </div>

            {/* Process Table */}
            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">Process Name</th>
                    <th className="py-2.5 px-3">PID</th>
                    <th className="py-2.5 px-3">CPU %</th>
                    <th className="py-2.5 px-3">Memory</th>
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {filteredProcesses.map(p => {
                    const isSelected = selectedPid === p.pid;
                    return (
                      <tr 
                        key={p.pid}
                        onClick={() => setSelectedPid(p.pid)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-violet-600/20 text-white' : 'hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        <td className="py-2 px-3 font-sans font-medium text-white flex items-center gap-2">
                          <Activity className="w-3 h-3 text-violet-400" />
                          <span>{p.name}</span>
                        </td>
                        <td className="py-2 px-3 text-slate-400">{p.pid}</td>
                        <td className="py-2 px-3 text-violet-400">{p.cpu}%</td>
                        <td className="py-2 px-3 text-cyan-400">{p.memoryMb} MB</td>
                        <td className="py-2 px-3 text-slate-400">{p.user}</td>
                        <td className="py-2 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
