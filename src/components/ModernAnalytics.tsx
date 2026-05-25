/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Coins, 
  Activity, 
  RotateCw, 
  Sliders, 
  Compass, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  RefreshCcw, 
  Info 
} from 'lucide-react';
import { JobCard } from '../types';

interface ModernAnalyticsProps {
  tasks: JobCard[];
  onSelectEmployee?: (empId: string) => void;
}

export function ModernAnalytics({ tasks }: ModernAnalyticsProps) {
  type TabMode = 'orders' | 'gold' | 'profit';
  const [activeTab, setActiveTab] = useState<TabMode>('orders');
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '12M'>('7D');

  // Realtime Live Spot Gold rate states
  const [baseGoldPrice, setBaseGoldPrice] = useState(78.45);
  const [tickingFeedback, setTickingFeedback] = useState<'up' | 'down' | null>(null);

  // Quick estimator states
  const [estimatorKarat, setEstimatorKarat] = useState<number>(24);
  const [estimatorWeight, setEstimatorWeight] = useState<string>('15');
  const [estimatorValue, setEstimatorValue] = useState<number>(0);

  // --- 3D INTERACTIVE PARAMETERS ---
  const [pitch, setPitch] = useState<number>(30); // Vertical tilt angle (deg)
  const [yaw, setYaw] = useState<number>(25);   // Horizontal perspective rotation (deg)
  const [autoRotate, setAutoRotate] = useState<boolean>(true); // Slow aesthetic radar-like spin
  const [hovered3DIndex, setHovered3DIndex] = useState<number | null>(null);

  // Slow continuous orbital animation effect for the 3D canvas
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setYaw(y => (y + 0.4) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Simulate market ticker updates
  useEffect(() => {
    const handleTicker = setInterval(() => {
      const delta = (Math.random() - 0.45) * 0.20;
      const isUp = delta >= 0;
      setBaseGoldPrice(prev => {
        const nextPrice = Math.max(70.0, prev + delta);
        return parseFloat(nextPrice.toFixed(2));
      });
      setTickingFeedback(isUp ? 'up' : 'down');
      setTimeout(() => setTickingFeedback(null), 1400);
    }, 4000);

    return () => clearInterval(handleTicker);
  }, []);

  // Quick gold estimator
  useEffect(() => {
    const weightGrams = parseFloat(estimatorWeight) || 0;
    const purityMultiplier = estimatorKarat / 24;
    const calculated = weightGrams * baseGoldPrice * purityMultiplier;
    setEstimatorValue(parseFloat(calculated.toFixed(2)));
  }, [baseGoldPrice, estimatorKarat, estimatorWeight]);

  // Metrics Generator based on timeframe & real task count data
  const computingMetrics = useMemo(() => {
    const activeTasksCount = tasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled').length;
    
    let labels: string[] = [];
    let defaultOrdersSeed: number[] = [];
    let defaultRevenueSeed: number[] = [];
    let defaultOverheadSeed: number[] = [];

    if (timeframe === '7D') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      defaultOrdersSeed = [3, 5, 4, 7, 5, 8, 6];
      defaultRevenueSeed = [3400, 4900, 4300, 6400, 5600, 8100, 7100];
      defaultOverheadSeed = [2200, 3100, 2900, 4000, 3500, 4800, 4300];
    } else if (timeframe === '30D') {
      labels = ['W1', 'W2', 'W3', 'W4'];
      defaultOrdersSeed = [19, 27, 24, 33];
      defaultRevenueSeed = [19000, 25000, 22500, 30000];
      defaultOverheadSeed = [12000, 16000, 14200, 18500];
    } else {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      defaultOrdersSeed = [85, 98, 112, 107, 131, 145, 138, 153, 165, 178, 172, 199];
      defaultRevenueSeed = [77000, 86000, 101000, 93000, 114000, 127000, 121000, 133000, 147000, 160000, 152000, 178000];
      defaultOverheadSeed = [49000, 54000, 62000, 58000, 70000, 77000, 74050, 81000, 89000, 96000, 92000, 107000];
    }

    const multiplier = 1 + (tasks.length * 0.05);
    const orders = defaultOrdersSeed.map(val => Math.round(val * multiplier));
    const revenue = defaultRevenueSeed.map(val => Math.round(val * multiplier));
    const overhead = defaultOverheadSeed.map(val => Math.round(val * multiplier));
    const profits = revenue.map((rev, i) => Math.max(0, rev - overhead[i]));

    const totalRevenue = revenue.reduce((a, b) => a + b, 0);
    const totalOverhead = overhead.reduce((a, b) => a + b, 0);
    const totalProfit = totalRevenue - totalOverhead;
    const profitMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 39;

    return {
      activeTasksCount,
      labels,
      orders,
      revenue,
      overhead,
      profits,
      totalRevenue,
      totalOverhead,
      totalProfit,
      profitMargin
    };
  }, [tasks, timeframe]);

  // Active dataset select
  const currentDetails = useMemo(() => {
    let rawSeries: number[] = [];
    let hexColor = '#d4af37'; // gold
    let hexLeft = '#bb9b30';
    let hexRight = '#a38421';
    let label = '';
    let suffix = '';

    if (activeTab === 'orders') {
      rawSeries = computingMetrics.orders;
      hexColor = '#f3e5ab';
      hexLeft = '#d4af37';
      hexRight = '#aa7c11';
      label = 'Artisan Task Output';
      suffix = ' jobs';
    } else if (activeTab === 'gold') {
      const count = computingMetrics.labels.length;
      rawSeries = Array.from({ length: count }, (_, idx) => {
        const offset = idx / (count - 1 || 1);
        const wave = Math.sin(offset * Math.PI * 1.6) * 3;
        return parseFloat((baseGoldPrice - 4 + wave + (idx * 0.25)).toFixed(2));
      });
      hexColor = '#f59e0b';
      hexLeft = '#d97706';
      hexRight = '#b45309';
      label = 'Spot Locked Gold Index';
      suffix = '/g';
    } else {
      rawSeries = computingMetrics.profits;
      hexColor = '#10b981';
      hexLeft = '#059669';
      hexRight = '#047857';
      label = 'Net Laboratory Yield';
      suffix = ' USD';
    }

    return { rawSeries, hexColor, hexLeft, hexRight, label, suffix };
  }, [activeTab, computingMetrics, baseGoldPrice]);

  // --- MATHEMATICAL 3D ISOMETRIC PARSER CODES ---
  const width = 600;
  const height = 280;
  const center = { x: width / 2, y: height / 2 + 10 };

  // Convert localized 3D points relative to the dynamic Pitch and Yaw matrices
  const transform3D = (relX: number, relY: number, relZ: number) => {
    const yawRad = (yaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;

    // Apply HORIZONTAL YAW ROTATION (Orbiting)
    const rotX = relX * Math.cos(yawRad) - relZ * Math.sin(yawRad);
    const rotZ = relX * Math.sin(yawRad) + relZ * Math.cos(yawRad);

    // Apply VERTICAL PITCH TILT
    const finalX = rotX;
    const finalY = relY * Math.cos(pitchRad) - rotZ * Math.sin(pitchRad);

    // project coordinates centrally on index canvas
    return {
      x: center.x + finalX,
      y: center.y - finalY
    };
  };

  // Build coordinate sequence corresponding to indices
  const chart3DModel = useMemo(() => {
    const data = currentDetails.rawSeries;
    const count = data.length;
    const maxVal = Math.max(...data) * 1.12 || 100;
    const minVal = Math.min(...data) * 0.88 || 0;
    const spanVal = maxVal - minVal || 1;

    // Standard width of isometric grid on center stage
    const gridBreadth = 280;
    const spacingX = gridBreadth / (count - 1 || 1);

    // Map each data point to its isometric prism projection coordinate
    // Coordinates are represented in relSpace: X (horizontal offset), Y (vertical metric height), Z (depth offset)
    const items = data.map((pt, idx) => {
      const relX = -gridBreadth / 2 + idx * spacingX;
      const relZ = 0; // standard flat alignment line transformed back
      const relativeHeight = ((pt - minVal) / spanVal) * 90 + 15; // metric heights

      // Base nodes
      const baseNode = transform3D(relX, 0, relZ);
      // Top nodes
      const topNode = transform3D(relX, relativeHeight, relZ);

      // Width block size
      const sizeW = Math.min(18, gridBreadth / (count * 1.5));

      // Calculate the specific faces corners for 3D render depth
      const p1 = transform3D(relX - sizeW, 0, relZ - sizeW); // Front corner
      const p2 = transform3D(relX + sizeW, 0, relZ - sizeW); // Right Corner
      const p3 = transform3D(relX + sizeW, 0, relZ + sizeW); // Back Corner
      const p4 = transform3D(relX - sizeW, 0, relZ + sizeW); // Left Corner

      const t1 = transform3D(relX - sizeW, relativeHeight, relZ - sizeW);
      const t2 = transform3D(relX + sizeW, relativeHeight, relZ - sizeW);
      const t3 = transform3D(relX + sizeW, relativeHeight, relZ + sizeW);
      const t4 = transform3D(relX - sizeW, relativeHeight, relZ + sizeW);

      return {
        index: idx,
        rawValue: pt,
        labelName: computingMetrics.labels[idx] || '',
        baseNode,
        topNode,
        meshCorners: { p1, p2, p3, p4, t1, t2, t3, t4 }
      };
    });

    // Draw background guide grid lines corresponding to the pitch/yaw parameters
    const planeGridLines: string[] = [];
    const stepLinesCount = 5;
    for (let i = 0; i <= stepLinesCount; i++) {
      const ratio = i / stepLinesCount;
      const rx = -gridBreadth / 2 + ratio * gridBreadth;
      
      const lineStart = transform3D(rx, 0, -50);
      const lineEnd = transform3D(rx, 0, 50);
      planeGridLines.push(`M ${lineStart.x} ${lineStart.y} L ${lineEnd.x} ${lineEnd.y}`);

      const lineCrossStart = transform3D(-gridBreadth / 2, 0, -50 + ratio * 100);
      const lineCrossEnd = transform3D(gridBreadth / 2, 0, -50 + ratio * 100);
      planeGridLines.push(`M ${lineCrossStart.x} ${lineCrossStart.y} L ${lineCrossEnd.x} ${lineCrossEnd.y}`);
    }

    return { items, planeGridLines };
  }, [currentDetails, yaw, pitch, computingMetrics]);

  return (
    <div id="dia-trendz-modern-analytics-3d" className="grid grid-cols-1 xl:grid-cols-3 gap-6 bg-transparent p-0">
      
      {/* Dynamic 3D Model Coordinate Stage */}
      <div className="xl:col-span-2 p-6 bg-[#0b152d]/95 backdrop-blur-xl border border-[#1f3460] rounded-3xl text-left flex flex-col justify-between shadow-2xl relative overflow-hidden group">
        
        {/* Subtle decorative glow lights */}
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-[radial-gradient(circle,rgba(31,58,138,0.22)_0%,transparent_70%)] pointer-events-none blur-2xl" />
        <div className="absolute bottom-0 left-10 w-64 h-24 bg-[radial-gradient(circle,rgba(212,175,55,0.06)_0%,transparent_70%)] pointer-events-none blur-2xl" />

        {/* 3D Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#1f3460] gap-4 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#d4af37] animate-ping" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#f3e5ab] font-sans flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#d4af37] animate-spin-slow" /> Real-time 3D Matrix Laboratory Yield Projection
              </h4>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 tracking-wide">
              Isometric 3D simulation reflecting workstation output volumes, spot indices, and net parameters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Chart Tabs */}
            <div className="bg-[#04091a]/95 p-0.5 rounded-lg border border-[#1f3460] flex text-[9px] font-bold">
              <button
                onClick={() => { setActiveTab('orders'); setHovered3DIndex(null); }}
                className={`px-3 py-1 rounded transition flex items-center gap-1 uppercase ${
                  activeTab === 'orders' 
                    ? 'bg-[#1f3460] text-white border-b-2 border-[#d4af37]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Jobs
              </button>
              <button
                onClick={() => { setActiveTab('gold'); setHovered3DIndex(null); }}
                className={`px-3 py-1 rounded transition flex items-center gap-1 uppercase ${
                  activeTab === 'gold' 
                    ? 'bg-[#1f3460] text-white border-b-2 border-amber-500' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Gold
              </button>
              <button
                onClick={() => { setActiveTab('profit'); setHovered3DIndex(null); }}
                className={`px-3 py-1 rounded transition flex items-center gap-1 uppercase ${
                  activeTab === 'profit' 
                    ? 'bg-[#1f3460] text-white border-b-2 border-emerald-500' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Profit
              </button>
            </div>

            {/* Timeframe Selectors */}
            <div className="bg-[#04091a]/95 p-0.5 rounded-lg border border-[#1f3460] flex text-[9px] font-bold">
              {(['7D', '30D', '12M'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => { setTimeframe(tf); setHovered3DIndex(null); }}
                  className={`px-2 py-1 rounded transition-all uppercase ${
                    timeframe === tf 
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Model Manual Orbit & Control Handles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-3 p-3 bg-[#04091a]/75 border border-[#1f3460] rounded-2xl z-10 text-[10px] items-center">
          
          {/* Pitch Regulator Slider */}
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-slate-400 font-semibold uppercase tracking-wider w-12 text-[9px]">3D Pitch:</span>
            <input 
              type="range" 
              min="10" 
              max="65" 
              value={pitch} 
              onChange={(e) => { setPitch(parseInt(e.target.value)); setAutoRotate(false); }}
              className="flex-1 accent-[#d4af37] bg-[#121214] h-1 rounded-lg cursor-pointer"
            />
            <span className="text-white font-mono font-bold w-6 text-right">{pitch}°</span>
          </div>

          {/* Yaw Regulator Slider */}
          <div className="flex items-center gap-2">
            <RotateCw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400 font-semibold uppercase tracking-wider w-12 text-[9px]">3D Yaw:</span>
            <input 
              type="range" 
              min="0" 
              max="359" 
              value={Math.round(yaw)} 
              onChange={(e) => { setYaw(parseInt(e.target.value)); setAutoRotate(false); }}
              className="flex-1 accent-indigo-500 bg-[#121214] h-1 rounded-lg cursor-pointer"
            />
            <span className="text-white font-mono font-bold w-10 text-right">{Math.round(yaw)}°</span>
          </div>

          {/* Active Auto Rotation Toggler */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-bold tracking-widest uppercase transition-all duration-200 border w-full md:w-auto text-center flex items-center justify-center gap-1.5 ${
                autoRotate 
                  ? 'bg-indigo-950/70 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10' 
                  : 'bg-[#121214] border-[#1f3460] text-slate-400 hover:text-white'
              }`}
            >
              <Info className={`w-3 h-3 ${autoRotate ? 'animate-spin-slow' : ''}`} />
              {autoRotate ? 'Auto-Orbiting ON' : 'Manual Viewport Mode'}
            </button>
          </div>
        </div>

        {/* Dynamic Telemetry HUD highlights representing focused 3D indices */}
        <div className="relative pt-2 w-full select-none flex justify-center items-center">
          
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              <linearGradient id="glowG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4af37" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#04091a" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Plot 3D background isometric projection grid rules */}
            <g stroke="#1f3460" strokeOpacity="0.32" strokeWidth="0.8">
              {chart3DModel.planeGridLines.map((linePath, index) => (
                <path key={index} d={linePath} fill="none" />
              ))}
            </g>

            {/* Render 3D Prism columns with depth sorting based on active view angle / yaw */}
            <g>
              {chart3DModel.items.map((item) => {
                const c = item.meshCorners;
                const isHovered = hovered3DIndex === item.index;

                // Build svg rendering lines representing polygons for Left, Right, and Top faces of each coordinate box
                const topFacePoints = `${c.t1.x},${c.t1.y} ${c.t2.x},${c.t2.y} ${c.t3.x},${c.t3.y} ${c.t4.x},${c.t4.y}`;
                const leftFacePoints = `${c.p1.x},${c.p1.y} ${c.p4.x},${c.p4.y} ${c.t4.x},${c.t4.y} ${c.t1.x},${c.t1.y}`;
                const rightFacePoints = `${c.p4.x},${c.p4.y} ${c.p3.x},${c.p3.y} ${c.t3.x},${c.t3.y} ${c.t4.x},${c.t4.y}`;

                return (
                  <g 
                    key={item.index}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHovered3DIndex(item.index)}
                    onMouseLeave={() => setHovered3DIndex(null)}
                  >
                    {/* Ghost vector core guide connecting base of 3D boxes */}
                    <line 
                      x1={item.baseNode.x} 
                      y1={item.baseNode.y} 
                      x2={item.topNode.x} 
                      y2={item.topNode.y} 
                      stroke={currentDetails.hexColor}
                      strokeOpacity={isHovered ? 0.8 : 0.2}
                      strokeWidth={isHovered ? "2.5" : "1"}
                      strokeDasharray="2,2"
                    />

                    {/* Left Facing Isometric Shadow block */}
                    <polygon
                      points={leftFacePoints}
                      fill={isHovered ? currentDetails.hexLeft : '#1a2e5c'}
                      fillOpacity={isHovered ? 0.95 : 0.65}
                      stroke="#1f3460"
                      strokeWidth="0.5"
                    />

                    {/* Right Facing Isometric Shadow block */}
                    <polygon
                      points={rightFacePoints}
                      fill={isHovered ? currentDetails.hexRight : '#0f1d3d'}
                      fillOpacity={isHovered ? 0.95 : 0.65}
                      stroke="#1f3460"
                      strokeWidth="0.5"
                    />

                    {/* Top Accent Facing Isometric Face */}
                    <polygon
                      points={topFacePoints}
                      fill={isHovered ? '#fff' : currentDetails.hexColor}
                      fillOpacity={isHovered ? 1.0 : 0.78}
                      stroke="#fff"
                      strokeWidth={isHovered ? "1" : "0.5"}
                    />

                    {/* Floor anchor ring indicators */}
                    <ellipse
                      cx={item.baseNode.x}
                      cy={item.baseNode.y}
                      rx="12"
                      ry="4"
                      fill="none"
                      stroke={currentDetails.hexColor}
                      strokeOpacity={isHovered ? 0.6 : 0.15}
                      strokeWidth="0.8"
                    />
                  </g>
                );
              })}
            </g>

            {/* Glowing 3D interconnecting node cord spline */}
            <path
              d={`M ${chart3DModel.items.map(it => `${it.topNode.x},${it.topNode.y}`).join(' L ')}`}
              fill="none"
              stroke="#d4af37"
              strokeWidth="2"
              strokeOpacity="0.45"
              pointerEvents="none"
            />

            {/* Custom Interactive Text labels relative on transformed index nodes */}
            {chart3DModel.items.map((item) => {
              const isHovered = hovered3DIndex === item.index;
              if (!isHovered) return null;

              // Display coordinate data floating above the 3D Prism columns
              return (
                <g key={`lbl-${item.index}`} pointerEvents="none" className="animate-fade-in">
                  <rect
                    x={item.topNode.x - 55}
                    y={item.topNode.y - 45}
                    width="110"
                    height="32"
                    fill="#060c1c"
                    stroke="#1f3460"
                    strokeWidth="1.2"
                    rx="6"
                  />
                  <text
                    x={item.topNode.x}
                    y={item.topNode.y - 33}
                    fill="#f3e5ab"
                    fontSize="8.5px"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {item.labelName}: {item.rawValue.toLocaleString()}{currentDetails.suffix}
                  </text>
                  <text
                    x={item.topNode.x}
                    y={item.topNode.y - 21}
                    fill="#94a3b8"
                    fontSize="7.5px"
                    textAnchor="middle"
                  >
                    Workspace Coordinate Metric
                  </text>
                  <path 
                    d={`M ${item.topNode.x} ${item.topNode.y - 13} L ${item.topNode.x} ${item.topNode.y - 5}`}
                    stroke="#1f3460"
                    strokeWidth="1"
                  />
                </g>
              );
            })}

            {/* Standard static category markers labeled nicely underneath the bases */}
            {chart3DModel.items.map((item, idx) => {
              // Renders labeled coordinate titles spaced correctly
              const isLead = idx % 2 === 0 || chart3DModel.items.length < 8;
              if (!isLead) return null;
              return (
                <text
                  key={`cat-${idx}`}
                  x={item.baseNode.x}
                  y={item.baseNode.y + 14}
                  fill="#94a3b8"
                  fontSize="7.5px"
                  textAnchor="middle"
                  className="pointer-events-none uppercase font-mono tracking-tighter"
                >
                  {item.labelName}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Dynamic lower instructions and active legend tracking */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#1f3460] mt-1 gap-2 text-[10px] tracking-wide text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 uppercase font-bold text-[#f3e5ab]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" /> Active 3D Trace
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 uppercase font-mono text-[9px]">
            <Info className="w-3 h-3 text-[#d4af37]" /> Hover on 3D columns to inspect spatial coordinate metrics
          </div>
        </div>

      </div>

      {/* Col 3: Live Precious Metal fluctuation panel */}
      <div className="p-6 bg-[#0b152d]/95 backdrop-blur-xl border border-[#1f3460] rounded-3xl text-left flex flex-col justify-between shadow-2xl relative">
        
        {/* Spot Pricing Ticker Header */}
        <div className="pb-3.5 border-b border-[#1f3460] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#f3e5ab] flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-[#d4af37]" /> Spot Precious Metals
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time laboratory and gold base indices</p>
          </div>
          
          <div className="flex items-center">
            {tickingFeedback === 'up' && (
              <span className="text-[8px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-0.5 animate-bounce">
                <TrendingUp className="w-2.5 h-2.5" /> UP 
              </span>
            )}
            {tickingFeedback === 'down' && (
              <span className="text-[8px] font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-500/20 flex items-center gap-0.5 animate-bounce">
                <TrendingDown className="w-2.5 h-2.5" /> DIP
              </span>
            )}
            {!tickingFeedback && (
              <span className="text-[8px] font-mono text-slate-500 flex items-center gap-1">
                <RefreshCcw className="w-2.5 h-2.5 animate-spin text-[#d4af37]" /> SYNC
              </span>
            )}
          </div>
        </div>

        {/* Precious elements and Alloys ticker grids */}
        <div className="space-y-3 my-4">
          <div className="p-3 bg-[#04091a]/80 border border-[#1f3460] hover:border-[#d4af37]/40 rounded-2xl transition duration-200 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">24K Pure Aurum</span>
              <span className="text-xs text-white font-medium">99.9% Assay Fine Metal</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-400 font-mono">${baseGoldPrice}</span>
              <span className="text-[8px] text-slate-500 block">USD per gram</span>
            </div>
          </div>

          <div className="p-3 bg-[#04091a]/80 border border-[#1f3460] hover:border-[#d4af37]/40 rounded-2xl transition duration-200 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">22K Crown Alloy</span>
              <span className="text-xs text-white font-medium">91.6% Casting Matrix</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#f3e5ab] font-mono">${(baseGoldPrice * 0.916).toFixed(2)}</span>
              <span className="text-[8px] text-slate-500 block">USD per gram</span>
            </div>
          </div>

          <div className="p-3 bg-[#04091a]/80 border border-[#1f3460] hover:border-[#d4af37]/40 rounded-2xl transition duration-200 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Platinum 950 Blend</span>
              <span className="text-xs text-white font-medium">95.0% Premium White Noble</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-blue-300 font-mono">${(baseGoldPrice * 1.38).toFixed(2)}</span>
              <span className="text-[8px] text-slate-500 block text-right">USD per gram</span>
            </div>
          </div>
        </div>

        {/* Assay rapid tool with high typography */}
        <div className="p-4 bg-[#04091a]/80 rounded-2xl border border-[#1f3460] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#d4af37] flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Rapid Alloy Assayer Tool
            </span>
            <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
              MES Calculators
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[8px] uppercase tracking-widest text-slate-400 font-extrabold block mb-1">Weight (Grams)</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={estimatorWeight}
                onChange={(e) => setEstimatorWeight(e.target.value)}
                className="w-full bg-[#0b152d] border border-[#1f3460] rounded-xl text-xs font-mono font-bold text-white p-2 text-center focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37]/35"
              />
            </div>

            <div>
              <label className="text-[8px] uppercase tracking-widest text-slate-400 font-extrabold block mb-1">Standard Purity</label>
              <select
                value={estimatorKarat}
                onChange={(e) => setEstimatorKarat(parseInt(e.target.value))}
                className="w-full bg-[#0b152d] border border-[#1f3460] rounded-xl text-xs font-mono font-bold text-[#f3e5ab] p-2 text-center cursor-pointer focus:border-[#d4af37] focus:outline-none"
              >
                <option value="24">24 Karat (99.9%)</option>
                <option value="22">22 Karat (91.6%)</option>
                <option value="18">18 Karat (75.0%)</option>
                <option value="14">14 Karat (58.3%)</option>
              </select>
            </div>
          </div>

          {/* Quick computed assay valuation line */}
          <div className="bg-[#1f3460]/40 border border-[#1f3460] rounded-xl p-3 flex items-center justify-between">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Metal raw valuation:</span>
            <span className="text-xs font-bold text-[#d4af37] font-mono">${estimatorValue}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
