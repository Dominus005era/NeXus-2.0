import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Bot,
  GitBranch,
  TrendingUp,
  Package,
  DollarSign,
  Cpu,
  Layers,
  Activity,
  Terminal,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Sliders,
  Play,
  RotateCw,
  Copy,
  Check,
  Zap,
  Network,
  Database,
  ShieldCheck,
  Server,
  ArrowRight,
  ChevronRight,
  Info,
  X,
  Lock,
  ExternalLink,
  CheckCircle,
  Clock,
  UserCheck,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  LayoutGrid,
  RefreshCw,
  MousePointer,
  HelpCircle,
  GripHorizontal,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SwarmStudioProps {
  onBackToLanding: () => void;
  onSwitchToChat: () => void;
  activeView: 'chat' | 'swarm';
}

interface NodeData {
  id: string;
  type: 'ceo' | 'orchestrator' | 'sales' | 'inventory' | 'finance' | 'solver' | 'db';
  title: string;
  subtitle: string;
  role: string;
  model: string;
  modelProvider: 'Google' | 'OpenAI' | 'Nexus Formal' | 'Neon' | 'Executive';
  latency: string;
  x: number;
  y: number;
  width: number;
  height: number;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  accentGlow: string;
  stageNum: number;
}

const AVAILABLE_MODELS_BY_TYPE: Record<string, string[]> = {
  orchestrator: ['Gemini 3.6 Flash (Default)', 'Gemini 3.8 Flash (Turbo)', 'Gemini 2.5 Pro', 'GPT-4o'],
  sales: ['Gemini 3.6 Flash (High-Throughput)', 'GPT-4o Mini', 'Gemini 3.8 Flash'],
  inventory: ['GPT-4o Mini (Tactical)', 'Gemini 3.6 Flash', 'Claude 3.5 Sonnet'],
  finance: ['Gemini 1.5 Pro (2M Context)', 'Gemini 2.5 Pro', 'GPT-4o (Audit)'],
  solver: ['Google OR-Tools ILP v9.8 (Exact)', 'Nexus 3.1 Deep Think ILP', 'SciPy Linear Solver'],
};

const DEFAULT_NODES: NodeData[] = [
  {
    id: 'node-ceo',
    type: 'ceo',
    title: 'Executive Directive',
    subtitle: 'Business Demand Trigger',
    role: 'CEO / Business Executive (Rahul)',
    model: 'Executive Directive Stream',
    modelProvider: 'Executive',
    latency: '< 1ms',
    x: 60,
    y: 280,
    width: 240,
    height: 180,
    iconBg: 'bg-[#A8C7FA]/10',
    iconColor: 'text-[#A8C7FA]',
    borderColor: 'border-[#A8C7FA]/40',
    accentGlow: 'rgba(168, 199, 250, 0.2)',
    stageNum: 1,
  },
  {
    id: 'node-orchestrator',
    type: 'orchestrator',
    title: 'Nexus Swarm Orchestrator',
    subtitle: 'Hierarchical Task Dispatch',
    role: 'DAG Planner & Sub-Agent Coordinator',
    model: 'Gemini 3.6 Flash (Default)',
    modelProvider: 'Google',
    latency: '4.2ms',
    x: 360,
    y: 260,
    width: 260,
    height: 220,
    iconBg: 'bg-[#A8C7FA]/20',
    iconColor: 'text-[#A8C7FA]',
    borderColor: 'border-[#A8C7FA]',
    accentGlow: 'rgba(168, 199, 250, 0.35)',
    stageNum: 2,
  },
  {
    id: 'node-sales',
    type: 'sales',
    title: 'Sales Intelligence Agent',
    subtitle: 'Velocity & Attribution',
    role: 'Forecast & Growth Elasticity',
    model: 'Gemini 3.6 Flash (High-Throughput)',
    modelProvider: 'Google',
    latency: '8.2ms',
    x: 700,
    y: 90,
    width: 250,
    height: 175,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/50',
    accentGlow: 'rgba(59, 130, 246, 0.25)',
    stageNum: 3,
  },
  {
    id: 'node-inventory',
    type: 'inventory',
    title: 'Supply Chain & Inventory',
    subtitle: 'Depletion & Safety Buffers',
    role: 'Stockout Horizon & Reorder Deficit',
    model: 'GPT-4o Mini (Tactical)',
    modelProvider: 'OpenAI',
    latency: '6.4ms',
    x: 700,
    y: 290,
    width: 250,
    height: 175,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    borderColor: 'border-amber-500/50',
    accentGlow: 'rgba(245, 158, 11, 0.25)',
    stageNum: 3,
  },
  {
    id: 'node-finance',
    type: 'finance',
    title: 'Treasury & Governance',
    subtitle: 'Liquidity & Statutory Caps',
    role: 'Ledger Audit & Reserve Lock',
    model: 'Gemini 1.5 Pro (2M Context)',
    modelProvider: 'Google',
    latency: '9.1ms',
    x: 700,
    y: 490,
    width: 250,
    height: 175,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/50',
    accentGlow: 'rgba(34, 197, 94, 0.25)',
    stageNum: 3,
  },
  {
    id: 'node-solver',
    type: 'solver',
    title: 'Google OR-Tools ILP Solver',
    subtitle: 'Deterministic Optimization',
    role: 'Integer Linear Programming Matrix',
    model: 'Google OR-Tools ILP v9.8 (Exact)',
    modelProvider: 'Nexus Formal',
    latency: '2.4ms',
    x: 1030,
    y: 250,
    width: 270,
    height: 240,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/60',
    accentGlow: 'rgba(168, 85, 247, 0.3)',
    stageNum: 4,
  },
  {
    id: 'node-db',
    type: 'db',
    title: 'Neon PostgreSQL Ground Truth',
    subtitle: 'Immutable Ledger Action',
    role: 'Relational DB Sync & PO Execution',
    model: 'Neon Cloud Postgres (asyncpg)',
    modelProvider: 'Neon',
    latency: '1.8ms',
    x: 1380,
    y: 280,
    width: 250,
    height: 200,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/60',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
    stageNum: 5,
  },
];

export const SwarmStudio: React.FC<SwarmStudioProps> = ({
  onBackToLanding,
  onSwitchToChat,
  activeView,
}) => {
  // Canvas State: Pan & Zoom
  const [nodes, setNodes] = useState<NodeData[]>(DEFAULT_NODES);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 30, y: 20 });
  const [zoom, setZoom] = useState<number>(0.92);
  const [isPanMode, setIsPanMode] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Simulation & Pipeline State
  const [simSurge, setSimSurge] = useState<number>(70);
  const [activeStep, setActiveStep] = useState<number>(5);
  const [isPropagating, setIsPropagating] = useState<boolean>(false);
  const [executed, setExecuted] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic real-time calculations
  const sim = useMemo(() => {
    const baseDemand = 85;
    const velocity = Math.round(baseDemand * (1 + simSurge / 100));
    const forecast7d = velocity * 7;
    const currentStock = 170;
    const safetyStock = 150;
    const rawHorizon = (currentStock - safetyStock) / velocity;
    const horizonDays = Number(Math.max(0.1, rawHorizon).toFixed(2));
    const deficitUnits = Math.max(0, forecast7d + safetyStock - currentStock);

    const supplierBUnits = Math.min(400, deficitUnits);
    const supplierCUnits = Math.max(0, deficitUnits - supplierBUnits);
    const costB = supplierBUnits * 477;
    const costC = supplierCUnits * 436.5;
    const upfrontCash = Math.round(supplierCUnits * 218.25);
    const totalSpend = costB + costC;

    return {
      velocity,
      forecast7d,
      horizonDays,
      deficitUnits,
      supplierBUnits,
      supplierCUnits,
      costB,
      costC,
      totalSpend,
      upfrontCash,
      isFeasible: upfrontCash <= 180000,
    };
  }, [simSurge]);

  // =========================================================================
  // ROBUST DRAG & DROP MECHANICS (GLOBAL WINDOW EVENT LISTENERS - NO STICKING)
  // =========================================================================
  const handleNodePointerDown = (nodeId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    
    // Prevent default drag behaviors
    const startX = e.clientX;
    const startY = e.clientY;
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;

    const initialX = targetNode.x;
    const initialY = targetNode.y;
    let isDragging = false;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;

      // 5px threshold to distinguish click from drag
      if (!isDragging && Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) > 5) {
        isDragging = true;
      }

      if (isDragging) {
        setNodes((prevNodes) =>
          prevNodes.map((n) =>
            n.id === nodeId ? { ...n, x: Math.round(initialX + dx), y: Math.round(initialY + dy) } : n
          )
        );
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (!isDragging) {
        // Toggle or select node inspector drawer on click
        setSelectedNodeId(nodeId);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Canvas Pan Handler
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.target !== canvasContainerRef.current && !(e.target as HTMLElement).classList.contains('canvas-bg')) {
      return;
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const initialPanX = pan.x;
    const initialPanY = pan.y;

    const onPanMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setPan({ x: initialPanX + dx, y: initialPanY + dy });
    };

    const onPanUp = () => {
      window.removeEventListener('pointermove', onPanMove);
      window.removeEventListener('pointerup', onPanUp);
    };

    window.addEventListener('pointermove', onPanMove);
    window.addEventListener('pointerup', onPanUp);
  };

  // Canvas Wheel Zoom Handler
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => Math.min(1.8, Math.max(0.4, prev * zoomFactor)));
    } else {
      setPan((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  // Auto Layout Alignment
  const handleResetLayout = () => {
    setNodes(DEFAULT_NODES);
    setPan({ x: 30, y: 20 });
    setZoom(0.92);
  };

  // Pipeline Propagation Simulation Trigger
  const handleRunPropagation = () => {
    if (isPropagating) return;
    setIsPropagating(true);
    setExecuted(false);
    setActiveStep(1);

    const steps = [1, 2, 3, 4, 5];
    steps.forEach((step, index) => {
      setTimeout(() => {
        setActiveStep(step);
        if (step === 5) {
          setIsPropagating(false);
          setExecuted(true);
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
      }, (index + 1) * 750);
    });
  };

  // Model update handler in inspector drawer
  const handleUpdateNodeModel = (nodeId: string, newModel: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, model: newModel } : n))
    );
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // SVG Connection helper (Cubic Bezier path)
  const renderConnection = (fromId: string, toId: string, activeStageTarget: number) => {
    const fromNode = nodes.find((n) => n.id === fromId);
    const toNode = nodes.find((n) => n.id === toId);
    if (!fromNode || !toNode) return null;

    const x1 = fromNode.x + fromNode.width;
    const y1 = fromNode.y + fromNode.height / 2;
    const x2 = toNode.x;
    const y2 = toNode.y + toNode.height / 2;

    const dx = Math.max(40, (x2 - x1) * 0.45);
    const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

    const isPathActive = activeStep >= activeStageTarget;

    return (
      <g key={`${fromId}-${toId}`}>
        {/* Outer Glow Path */}
        <path
          d={pathD}
          fill="none"
          stroke={isPathActive ? '#4285F4' : '#2D2E30'}
          strokeWidth={isPathActive ? 3 : 1.5}
          strokeOpacity={isPathActive ? 0.8 : 0.4}
        />
        {/* Animated Dashed Flow Line */}
        {isPathActive && (
          <path
            d={pathD}
            fill="none"
            stroke="#A8C7FA"
            strokeWidth={2.5}
            strokeDasharray="6,6"
            className="animate-pulse"
          />
        )}
      </g>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0B0C0E] text-[#E3E3E3] font-sans overflow-hidden select-none">
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE HEADER BAR (PRESERVED NEXUS 2.0 HEADER)                     */}
      {/* ========================================================================= */}
      <header className="h-14 border-b border-[#2D2E30]/70 bg-[#131314]/90 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToLanding}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1E1F20] hover:bg-[#2A2B2D] text-[#C4C7C5] hover:text-white text-xs font-medium border border-[#2D2E30] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </button>

          {/* Toggle Switch between Executive Chat & Agent Swarm Studio */}
          <div className="flex items-center bg-[#1E1F20] p-0.5 rounded-full border border-[#2D2E30]">
            <button
              onClick={onSwitchToChat}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeView === 'chat'
                  ? 'bg-[#1A73E8] text-white shadow-md'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              Executive Chat
            </button>
            <button
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeView === 'swarm'
                  ? 'bg-[#1A73E8] text-white shadow-md'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              Agent Swarm Studio
            </button>
          </div>
        </div>

        {/* Live KPI Indicators & Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#1E1F20] border border-[#2D2E30] text-xs">
            <span className="text-[#888888]">Order Velocity:</span>
            <span className="font-semibold text-blue-400">{sim.velocity} u/d</span>
          </div>

          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#1E1F20] border border-[#2D2E30] text-xs">
            <span className="text-[#888888]">Safe Cap:</span>
            <span className="font-semibold text-[#A8C7FA]">₹1,80,000</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#1E1F20] border border-[#2D2E30] text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
            <span className="text-[#C4C7C5] font-medium">DAG Swarm Online</span>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN SWARM CANVAS & CONTROLS CONTAINER                                 */}
      {/* ========================================================================= */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* LEFT SIMULATION CONTROLS OVERLAY PANEL */}
        <div className="absolute top-4 left-4 z-20 w-72 bg-[#1E1F20]/90 backdrop-blur-xl border border-[#3A3B3E] rounded-2xl p-4 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#2D2E30] pb-2.5">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#A8C7FA]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Surge Simulation
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#131314] text-[#A8C7FA] border border-[#2D2E30]">
              P100 Headphones
            </span>
          </div>

          {/* Surge Multiplier Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#888888]">Demand Spike Surge:</span>
              <span className="font-bold text-amber-400 font-mono">+{simSurge}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={simSurge}
              onChange={(e) => setSimSurge(Number(e.target.value))}
              className="w-full h-1.5 bg-[#2D2E30] rounded-lg appearance-none cursor-pointer accent-[#1A73E8]"
            />
          </div>

          {/* Real-Time Metrics Table */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="bg-[#131314] p-2 rounded-xl border border-[#2D2E30]">
              <div className="text-[10px] text-[#888888]">Velocity</div>
              <div className="font-semibold text-white mt-0.5">{sim.velocity} u/day</div>
            </div>

            <div className="bg-[#131314] p-2 rounded-xl border border-[#2D2E30]">
              <div className="text-[10px] text-[#888888]">Stockout Floor</div>
              <div className="font-semibold text-amber-400 mt-0.5">{sim.horizonDays} days</div>
            </div>

            <div className="bg-[#131314] p-2 rounded-xl border border-[#2D2E30]">
              <div className="text-[10px] text-[#888888]">Deficit Reorder</div>
              <div className="font-semibold text-blue-400 mt-0.5">{sim.deficitUnits} units</div>
            </div>

            <div className="bg-[#131314] p-2 rounded-xl border border-[#2D2E30]">
              <div className="text-[10px] text-[#888888]">Upfront Cash</div>
              <div className="font-semibold text-[#81C995] mt-0.5">₹{sim.upfrontCash.toLocaleString()}</div>
            </div>
          </div>

          {/* Trigger Simulation Button */}
          <button
            onClick={handleRunPropagation}
            disabled={isPropagating}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg ${
              isPropagating
                ? 'bg-[#1A73E8]/50 text-white cursor-not-allowed'
                : 'bg-[#1A73E8] hover:bg-[#4285F4] text-white'
            }`}
          >
            {isPropagating ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Propagating Swarm Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Swarm Pipeline Simulation</span>
              </>
            )}
          </button>
        </div>

        {/* INTERACTIVE CANVAS FIELD */}
        <div
          ref={canvasContainerRef}
          onPointerDown={handleCanvasPointerDown}
          onWheel={handleWheel}
          className={`canvas-bg flex-1 w-full h-full relative overflow-hidden bg-[#0B0C0E] cursor-${
            isPanMode ? 'grab' : 'default'
          }`}
          style={{
            backgroundImage: showGrid
              ? 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)'
              : 'none',
            backgroundSize: '24px 24px',
          }}
        >
          {/* CANVAS TRANSFORM CONTAINER (PAN & ZOOM SCALED) */}
          <div
            className="absolute inset-0 origin-top-left transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* SVG PIPELINE CONNECTING LINES LAYER */}
            <svg className="absolute top-0 left-0 w-[3000px] h-[2000px] pointer-events-none z-0">
              {/* Stage 1 -> 2 */}
              {renderConnection('node-ceo', 'node-orchestrator', 2)}

              {/* Stage 2 -> 3 (Parallel Sub-Agents) */}
              {renderConnection('node-orchestrator', 'node-sales', 3)}
              {renderConnection('node-orchestrator', 'node-inventory', 3)}
              {renderConnection('node-orchestrator', 'node-finance', 3)}

              {/* Stage 3 -> 4 */}
              {renderConnection('node-sales', 'node-solver', 4)}
              {renderConnection('node-inventory', 'node-solver', 4)}
              {renderConnection('node-finance', 'node-solver', 4)}

              {/* Stage 4 -> 5 */}
              {renderConnection('node-solver', 'node-db', 5)}
            </svg>

            {/* NODES LAYER */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isStageActive = activeStep >= node.stageNum;

              return (
                <div
                  key={node.id}
                  onPointerDown={(e) => handleNodePointerDown(node.id, e)}
                  style={{
                    transform: `translate(${node.x}px, ${node.y}px)`,
                    width: `${node.width}px`,
                    height: `${node.height}px`,
                  }}
                  className={`absolute z-10 rounded-2xl bg-[#1E1F20]/95 backdrop-blur-xl border transition-all duration-150 cursor-grab active:cursor-grabbing shadow-2xl ${
                    isSelected
                      ? 'border-[#4285F4] ring-2 ring-[#4285F4]/40 scale-[1.02]'
                      : isStageActive
                      ? node.borderColor
                      : 'border-[#2D2E30] opacity-80'
                  }`}
                >
                  {/* Node Header Drag Handle */}
                  <div className="p-3.5 border-b border-[#2D2E30]/70 flex items-center justify-between bg-[#18191A]/80 rounded-t-2xl">
                    <div className="flex items-center space-x-2.5 truncate">
                      <div
                        className={`w-7 h-7 rounded-lg ${node.iconBg} ${node.iconColor} flex items-center justify-center shrink-0 border border-white/10`}
                      >
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate font-heading">
                          {node.title}
                        </div>
                        <div className="text-[10px] text-[#888888] truncate">{node.subtitle}</div>
                      </div>
                    </div>

                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#131314] text-[#A8C7FA] border border-[#2D2E30]">
                      STAGE {node.stageNum}
                    </span>
                  </div>

                  {/* Node Body Details */}
                  <div className="p-3 space-y-2 text-xs">
                    <div className="text-[11px] text-[#C4C7C5] leading-tight line-clamp-2">
                      {node.role}
                    </div>

                    {/* AI Model Badge */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#2D2E30]/50 text-[10px]">
                      <span className="text-[#888888]">Model:</span>
                      <span className="font-mono font-semibold text-[#A8C7FA] truncate max-w-[130px]">
                        {node.model}
                      </span>
                    </div>

                    {/* Latency & Status */}
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#888888]">Latency:</span>
                      <span className="font-mono text-emerald-400">{node.latency}</span>
                    </div>
                  </div>

                  {/* Active Propagation Glow Pulse */}
                  {isStageActive && (
                    <div
                      className="absolute inset-0 rounded-2xl pointer-events-none border border-[#4285F4]/30"
                      style={{ boxShadow: `0 0 20px ${node.accentGlow}` }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* BOTTOM-LEFT FLOATING CANVAS TOOLBAR */}
          <div className="absolute bottom-6 left-6 z-30 flex items-center space-x-1.5 bg-[#1E1F20]/90 backdrop-blur-xl border border-[#3A3B3E] rounded-full px-3 py-1.5 shadow-2xl">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
              className="p-1.5 rounded-full text-[#888888] hover:text-white hover:bg-[#2D2E30] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-medium text-[#A8C7FA] px-2">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))}
              className="p-1.5 rounded-full text-[#888888] hover:text-white hover:bg-[#2D2E30] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-[#2D2E30] mx-1" />

            <button
              onClick={handleResetLayout}
              className="p-1.5 rounded-full text-[#888888] hover:text-white hover:bg-[#2D2E30] transition-colors"
              title="Reset View"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-full transition-colors ${
                showGrid ? 'text-[#4285F4] bg-[#4285F4]/10' : 'text-[#888888] hover:text-white'
              }`}
              title="Toggle Canvas Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE NODE INSPECTOR DRAWER */}
        {selectedNode && (
          <aside className="w-80 border-l border-[#2D2E30]/70 bg-[#1E1F20] z-20 flex flex-col h-full shadow-2xl">
            <div className="p-4 border-b border-[#2D2E30] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-[#A8C7FA]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Node Inspector
                </h3>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="p-1 text-[#888888] hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="text-[10px] text-[#888888] uppercase tracking-wider">
                  Node Title
                </label>
                <div className="text-sm font-bold text-white mt-0.5">{selectedNode.title}</div>
                <div className="text-xs text-[#A8C7FA] mt-0.5">{selectedNode.subtitle}</div>
              </div>

              {/* Model Switcher for this specific Node */}
              {AVAILABLE_MODELS_BY_TYPE[selectedNode.type] && (
                <div className="space-y-1">
                  <label className="text-[10px] text-[#888888] uppercase tracking-wider">
                    Assigned AI Model
                  </label>
                  <select
                    value={selectedNode.model}
                    onChange={(e) => handleUpdateNodeModel(selectedNode.id, e.target.value)}
                    className="w-full bg-[#131314] text-xs text-white p-2.5 rounded-xl border border-[#2D2E30] focus:outline-none focus:border-[#4285F4]"
                  >
                    {AVAILABLE_MODELS_BY_TYPE[selectedNode.type].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] text-[#888888] uppercase tracking-wider">
                  Operational Role
                </label>
                <div className="p-3 rounded-xl bg-[#131314] text-[#C4C7C5] border border-[#2D2E30] mt-1 leading-relaxed">
                  {selectedNode.role}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#888888] uppercase tracking-wider">
                  Telemetry & Performance
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="p-2.5 rounded-xl bg-[#131314] border border-[#2D2E30]">
                    <div className="text-[10px] text-[#888888]">Latency</div>
                    <div className="font-mono text-emerald-400 font-bold mt-0.5">
                      {selectedNode.latency}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#131314] border border-[#2D2E30]">
                    <div className="text-[10px] text-[#888888]">Provider</div>
                    <div className="font-mono text-[#A8C7FA] font-bold mt-0.5">
                      {selectedNode.modelProvider}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};