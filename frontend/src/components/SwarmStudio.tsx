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
    width: 245,
    height: 190,
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
    x: 375,
    y: 260,
    width: 265,
    height: 225,
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
    x: 720,
    y: 90,
    width: 255,
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
    x: 720,
    y: 290,
    width: 255,
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
    x: 720,
    y: 490,
    width: 255,
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
    x: 1060,
    y: 250,
    width: 275,
    height: 245,
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
    x: 1415,
    y: 280,
    width: 255,
    height: 205,
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
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Simulation & Pipeline State
  const [simSurge, setSimSurge] = useState<number>(70);
  const [activeStep, setActiveStep] = useState<number>(5);
  const [isPropagating, setIsPropagating] = useState<boolean>(false);
  const [executed, setExecuted] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showModelRoster, setShowModelRoster] = useState<boolean>(true);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Robust Ref to track Drag & Pan mechanics without dropping locks
  const dragTracker = useRef<{
    isDraggingNode: boolean;
    nodeId: string | null;
    isPanning: boolean;
    startX: number;
    startY: number;
    initialNodeX: number;
    initialNodeY: number;
    initialPanX: number;
    initialPanY: number;
    hasMoved: boolean;
  }>({
    isDraggingNode: false,
    nodeId: null,
    isPanning: false,
    startX: 0,
    startY: 0,
    initialNodeX: 0,
    initialNodeY: 0,
    initialPanX: 0,
    initialPanY: 0,
    hasMoved: false,
  });

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
    
    // Split PO allocation
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

  // Selected node inspection object
  const inspectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  // Zoom controls
  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(1.8, Math.max(0.4, Number((prev + delta).toFixed(2)))));
  };

  const handleResetCanvas = () => {
    setPan({ x: 30, y: 20 });
    setZoom(0.92);
    setNodes(DEFAULT_NODES);
  };

  // Change model for a specific agent node
  const handleModelChange = (nodeId: string, newModel: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, model: newModel } : n))
    );
  };

  // Global Window Mouse Listeners for 100% Reliable Drag & Pan
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const tracker = dragTracker.current;
      if (tracker.isDraggingNode && tracker.nodeId) {
        const dx = (e.clientX - tracker.startX) / zoom;
        const dy = (e.clientY - tracker.startY) / zoom;
        if (Math.hypot(dx, dy) > 4) {
          tracker.hasMoved = true;
        }

        setNodes((prevNodes) =>
          prevNodes.map((n) => {
            if (n.id === tracker.nodeId) {
              return {
                ...n,
                x: Math.round(tracker.initialNodeX + dx),
                y: Math.round(tracker.initialNodeY + dy),
              };
            }
            return n;
          })
        );
      } else if (tracker.isPanning) {
        const dx = e.clientX - tracker.startX;
        const dy = e.clientY - tracker.startY;
        if (Math.hypot(dx, dy) > 4) {
          tracker.hasMoved = true;
        }
        setPan({
          x: tracker.initialPanX + dx,
          y: tracker.initialPanY + dy,
        });
      }
    };

    const handleGlobalMouseUp = () => {
      const tracker = dragTracker.current;
      if (tracker.isDraggingNode && tracker.nodeId && !tracker.hasMoved) {
        // Pure click without movement: open node inspector
        setSelectedNodeId(tracker.nodeId);
      }

      tracker.isDraggingNode = false;
      tracker.nodeId = null;
      tracker.isPanning = false;
      setDraggingNodeId(null);
      setIsPanning(false);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [zoom]);

  // Mouse Wheel Pan & Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = e.deltaY < 0 ? 0.08 : -0.08;
      handleZoom(zoomFactor);
    } else {
      setPan((prev) => ({
        x: prev.x - e.deltaX * 0.7,
        y: prev.y - e.deltaY * 0.7,
      }));
    }
  };

  // Start Canvas Pan
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary left click
    const tracker = dragTracker.current;
    tracker.isPanning = true;
    tracker.isDraggingNode = false;
    tracker.nodeId = null;
    tracker.hasMoved = false;
    tracker.startX = e.clientX;
    tracker.startY = e.clientY;
    tracker.initialPanX = pan.x;
    tracker.initialPanY = pan.y;
    setIsPanning(true);
  };

  // Start Node Drag
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const tracker = dragTracker.current;
    tracker.isDraggingNode = true;
    tracker.nodeId = nodeId;
    tracker.isPanning = false;
    tracker.hasMoved = false;
    tracker.startX = e.clientX;
    tracker.startY = e.clientY;
    tracker.initialNodeX = node.x;
    tracker.initialNodeY = node.y;
    setDraggingNodeId(nodeId);
  };

  // Step-by-step pipeline execution
  const handleRunPipeline = () => {
    setIsPropagating(true);
    setActiveStep(1);

    const t1 = setTimeout(() => setActiveStep(2), 500);
    const t2 = setTimeout(() => setActiveStep(3), 1100);
    const t3 = setTimeout(() => setActiveStep(4), 1800);
    const t4 = setTimeout(() => {
      setActiveStep(5);
      setIsPropagating(false);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#A8C7FA', '#B2C5FF', '#22c55e', '#ffffff'],
      });
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  };

  const handleCommitOrder = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#A8C7FA', '#ffffff'],
    });
    setExecuted(true);
  };

  const handleCopyLog = () => {
    navigator.clipboard.writeText(
      `[NEXUS SWARM PIPELINE TRACE]\nStep 1 (CEO): Directive VIRAL_DEMAND_SPIKE_P100 (+${simSurge}%)\nStep 2 (Orchestrator): Deconstructed into 3 worker tasks (4.2ms)\nStep 3 (Workers): Sales (${sim.velocity} u/d) | Inventory (${sim.horizonDays}d stockout) | Finance (₹1.80L cap)\nStep 4 (ILP Solver): Feasible. Allocated 400u (QuickLogix, Net-30) + ${sim.supplierCUnits}u (Zenith, 50% Adv, ₹${sim.upfrontCash.toLocaleString()} upfront)\nStep 5 (Neon DB): Transaction Verified & Committed.`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to compute smooth Bézier curves between node sockets
  const getNodeSocket = (nodeId: string, side: 'left' | 'right') => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return {
      x: side === 'left' ? node.x : node.x + node.width,
      y: node.y + node.height / 2,
    };
  };

  const getBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.max(40, Math.abs(x2 - x1) * 0.45);
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };

  // Define active pipeline links
  const links = useMemo(() => {
    return [
      { from: 'node-ceo', to: 'node-orchestrator', active: activeStep >= 2, color: '#A8C7FA' },
      { from: 'node-orchestrator', to: 'node-sales', active: activeStep >= 3, color: '#60A5FA' },
      { from: 'node-orchestrator', to: 'node-inventory', active: activeStep >= 3, color: '#FBBF24' },
      { from: 'node-orchestrator', to: 'node-finance', active: activeStep >= 3, color: '#34D399' },
      { from: 'node-sales', to: 'node-solver', active: activeStep >= 4, color: '#60A5FA' },
      { from: 'node-inventory', to: 'node-solver', active: activeStep >= 4, color: '#FBBF24' },
      { from: 'node-finance', to: 'node-solver', active: activeStep >= 4, color: '#34D399' },
      { from: 'node-solver', to: 'node-db', active: activeStep >= 5, color: '#A855F7' },
    ];
  }, [activeStep]);

  return (
    <div className="flex flex-col h-screen w-full bg-[#131313] text-[#E3E3E3] font-sans overflow-hidden select-none">
      {/* ================= TOP HEADER ================= */}
      <header className="sticky top-0 z-30 bg-[#131313]/95 backdrop-blur-md border-b border-white/10 px-4 md:px-6 py-2.5 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 text-xs text-[#C4C7C5] hover:text-white bg-[#1E1F20] hover:bg-[#282A2C] px-3 py-1.5 rounded-full border border-white/10 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Landing Page</span>
          </button>

          {/* Mode Switcher Toggle */}
          <div className="flex items-center bg-[#1E1F20] p-1 rounded-full border border-white/10 font-mono text-xs">
            <button
              onClick={onSwitchToChat}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[#C4C7C5] hover:text-white transition-all cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-[#A8C7FA]" />
              <span className="hidden sm:inline">Executive Chat</span>
            </button>
            <button
              onClick={() => {}}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C2E7FF] text-[#001E2C] font-semibold shadow-sm transition-all cursor-pointer"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Agent Swarm Studio</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <div className="hidden md:flex items-center gap-1.5 bg-[#1E1F20] px-3 py-1 rounded-full border border-white/10">
            <span className="text-[#747775]">Cash:</span>
            <span className="text-emerald-400 font-semibold">₹8,50,000</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 bg-[#1E1F20] px-3 py-1 rounded-full border border-white/10">
            <span className="text-[#747775]">Safe Spend:</span>
            <span className="text-blue-400 font-semibold">₹1,80,000</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#1E1F20] px-2.5 py-1 rounded-full border border-emerald-500/20 text-emerald-400 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive Canvas Mode</span>
          </div>
        </div>
      </header>

      {/* ================= FLOATING CANVAS TOOLBAR & MODEL ROSTER ================= */}
      <div className="bg-[#171819] border-b border-white/5 px-4 md:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-[#A8C7FA]" />
            <span className="text-xs font-semibold text-white font-headline">
              Interactive Swarm Network Graph
            </span>
          </div>
          
          <button
            onClick={() => setShowModelRoster(!showModelRoster)}
            className={`text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
              showModelRoster ? 'bg-[#A8C7FA]/10 text-[#A8C7FA] border-[#A8C7FA]/30' : 'bg-[#1E1F20] text-[#747775] border-white/10'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>Active Model Lineup</span>
          </button>
        </div>

        {/* Demand Surge Slider & Pipeline Trigger */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1E1F20] px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[#747775]">Demand Surge:</span>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={simSurge}
              onChange={(e) => setSimSurge(Number(e.target.value))}
              className="w-24 sm:w-32 accent-[#A8C7FA] cursor-pointer h-1.5 bg-[#282A2C] rounded-lg"
            />
            <span className="text-[#A8C7FA] font-bold">+{simSurge}%</span>
          </div>

          <button
            onClick={handleRunPipeline}
            disabled={isPropagating}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#C2E7FF] text-[#001E2C] font-semibold hover:bg-[#A8C7FA] transition-all text-xs cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isPropagating ? 'animate-spin' : ''}`} />
            <span>{isPropagating ? 'Propagating Signal...' : 'Run Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* ================= MODEL ROSTER RIBBON ================= */}
      {showModelRoster && (
        <div className="bg-[#131314] border-b border-white/5 px-4 md:px-6 py-2 overflow-x-auto shrink-0 flex items-center gap-3 text-[11px] font-mono">
          <span className="text-[#747775] uppercase text-[10px] shrink-0">Model Lineup:</span>
          
          <div className="flex items-center gap-1.5 bg-[#1E1F20] px-2.5 py-0.5 rounded-md border border-white/10 shrink-0">
            <span className="text-[#747775]">Orchestrator:</span>
            <span className="text-[#A8C7FA] font-semibold">Gemini 3.6 Flash</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#1E1F20] px-2.5 py-0.5 rounded-md border border-white/10 shrink-0">
            <span className="text-[#747775]">Sales:</span>
            <span className="text-blue-400 font-semibold">Gemini 3.6 Flash</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#1E1F20] px-2.5 py-0.5 rounded-md border border-white/10 shrink-0">
            <span className="text-[#747775]">Inventory:</span>
            <span className="text-amber-400 font-semibold">GPT-4o Mini</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#1E1F20] px-2.5 py-0.5 rounded-md border border-white/10 shrink-0">
            <span className="text-[#747775]">Finance:</span>
            <span className="text-emerald-400 font-semibold">Gemini 1.5 Pro</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#1E1F20] px-2.5 py-0.5 rounded-md border border-white/10 shrink-0">
            <span className="text-[#747775]">Solver:</span>
            <span className="text-purple-400 font-semibold">Google OR-Tools ILP</span>
          </div>
        </div>
      )}

      {/* ================= INFINITE PAN & ZOOM CANVAS ================= */}
      <div
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleCanvasMouseDown}
        className={`flex-1 w-full h-full relative overflow-hidden ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        } ${
          showGrid
            ? 'bg-[radial-gradient(#ffffff15_1.2px,transparent_1.2px)] [background-size:24px_24px]'
            : 'bg-[#131313]'
        }`}
        style={{
          backgroundColor: '#131313',
        }}
      >
        {/* Transformable Canvas Layer */}
        <div
          className="absolute inset-0 origin-top-left transition-transform duration-75 ease-out pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: '2400px',
            height: '1400px',
          }}
        >
          {/* ================= ANIMATED SVG PIPELINE CONNECTIONS ================= */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <defs>
              {/* Glow Filters */}
              <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render Links */}
            {links.map((link, i) => {
              const src = getNodeSocket(link.from, 'right');
              const dst = getNodeSocket(link.to, 'left');
              const pathD = getBezierPath(src.x, src.y, dst.x, dst.y);

              return (
                <g key={i}>
                  {/* Background Path Track */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#282A2C"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Active Animated Glowing Flow Conduit */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={link.color}
                    strokeWidth={link.active ? '2.5' : '1.5'}
                    strokeDasharray={link.active ? '6 6' : '3 6'}
                    style={{
                      animation: link.active ? 'dash 1.2s linear infinite' : 'none',
                    }}
                  />

                  {/* Flowing Pulse Particle */}
                  {link.active && (
                    <circle r="3.5" fill="#ffffff" filter="url(#glow-blue)">
                      <animateMotion path={pathD} dur="2.4s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* ================= DRAGGABLE / INTERACTIVE NODE CARDS ================= */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isNodeActive = activeStep >= node.stageNum;
            const availableModels = AVAILABLE_MODELS_BY_TYPE[node.type];

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                className={`absolute rounded-2xl bg-[#1E1F20]/95 backdrop-blur-xl border transition-shadow duration-200 pointer-events-auto cursor-grab active:cursor-grabbing flex flex-col justify-between p-3.5 shadow-2xl ${
                  isSelected
                    ? 'border-[#A8C7FA] ring-2 ring-[#A8C7FA]/30 shadow-[#A8C7FA]/20'
                    : isNodeActive
                    ? `${node.borderColor} hover:border-white/40`
                    : 'border-white/10 opacity-60'
                }`}
                style={{
                  transform: `translate(${node.x}px, ${node.y}px)`,
                  width: `${node.width}px`,
                  minHeight: `${node.height}px`,
                  boxShadow: isSelected ? `0 10px 30px ${node.accentGlow}` : undefined,
                }}
              >
                {/* Left Input Port Socket Handle */}
                {node.type !== 'ceo' && (
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#131314] border-2 border-[#A8C7FA] flex items-center justify-center shadow-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#A8C7FA]" />
                  </div>
                )}

                {/* Right Output Port Socket Handle */}
                {node.type !== 'db' && (
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#131314] border-2 border-[#A8C7FA] flex items-center justify-center shadow-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#A8C7FA]" />
                  </div>
                )}

                {/* Card Drag Handle & Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="text-[#747775] hover:text-white cursor-grab active:cursor-grabbing p-0.5">
                        <GripHorizontal className="w-3.5 h-3.5" />
                      </div>
                      <div className={`w-6 h-6 rounded-lg border border-white/10 flex items-center justify-center ${node.iconBg} ${node.iconColor}`}>
                        {node.type === 'ceo' && <UserCheck className="w-3 h-3" />}
                        {node.type === 'orchestrator' && <Sparkles className="w-3 h-3" />}
                        {node.type === 'sales' && <TrendingUp className="w-3 h-3" />}
                        {node.type === 'inventory' && <Package className="w-3 h-3" />}
                        {node.type === 'finance' && <DollarSign className="w-3 h-3" />}
                        {node.type === 'solver' && <Cpu className="w-3 h-3" />}
                        {node.type === 'db' && <Database className="w-3 h-3" />}
                      </div>
                      <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider truncate max-w-[100px]">
                        {node.subtitle}
                      </span>
                    </div>

                    {/* Info / Inspect Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(node.id);
                      }}
                      className="text-[#747775] hover:text-[#A8C7FA] p-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
                      title="Inspect Node Details"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-xs font-semibold text-white font-headline truncate">
                    {node.title}
                  </h3>

                  {/* Model Selector Dropdown on Card */}
                  {availableModels && availableModels.length > 0 ? (
                    <div className="relative mt-1 mb-2">
                      <select
                        value={node.model}
                        onChange={(e) => handleModelChange(node.id, e.target.value)}
                        className="w-full bg-[#131314] hover:bg-[#282A2C] border border-white/10 text-white text-[10px] font-mono rounded-lg px-2 py-1 pr-6 appearance-none cursor-pointer focus:outline-none focus:border-[#A8C7FA]"
                      >
                        {availableModels.map((m) => (
                          <option key={m} value={m} className="bg-[#1E1F20] text-white">
                            {m}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-[#747775] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#747775] font-mono truncate mb-2">
                      {node.model}
                    </p>
                  )}
                </div>

                {/* Dynamic Node Body Content */}
                <div className="bg-[#131314]/90 rounded-xl p-2 font-mono text-[10px] space-y-1 border border-white/5">
                  {node.type === 'ceo' && (
                    <>
                      <div className="flex justify-between text-[#C4C7C5]">
                        <span className="text-[#747775]">SKU:</span>
                        <span className="text-[#A8C7FA] font-bold">P100 (Headphones)</span>
                      </div>
                      <div className="flex justify-between text-[#C4C7C5]">
                        <span className="text-[#747775]">Surge Signal:</span>
                        <span className="text-amber-400 font-bold">+{simSurge}% Viral</span>
                      </div>
                    </>
                  )}

                  {node.type === 'orchestrator' && (
                    <>
                      <div className="flex justify-between text-[#C4C7C5]">
                        <span className="text-[#747775]">Task Routing:</span>
                        <span className="text-emerald-400 font-bold">3 Workers</span>
                      </div>
                      <div className="flex justify-between text-[#C4C7C5]">
                        <span className="text-[#747775]">Contract:</span>
                        <span className="text-white">Pydantic v2</span>
                      </div>
                    </>
                  )}

                  {node.type === 'sales' && (
                    <>
                      <div className="flex justify-between text-[#C4C7C5]">
                        <span className="text-[#747775]">Velocity:</span>
                        <span className="text-white font-bold">{sim.velocity} u/day</span>
                      </div>
                      <div className="flex justify-between text-[#C4C7C5]">
                        <span className="text-[#747775]">7d Demand:</span>
                        <span className="text-blue-300 font-bold">{sim.forecast7d} units</span>
                      </div>
                    </>
                  )}

                  {node.type === 'inventory' && (
                    <>
                      <div className="flex justify-between text-[#C4C7C5]">
                        <span className="text-[#747775]">Stockout:</span>
                        <span className="text-amber-300 font-bold">{sim.horizonDays} days</span>
                      </div>
                      <div className="flex justify-between text-[#C4C7C5]">
                        <span className="text-[#747775]">Deficit:</span>
                        <span className="text-rose-400 font-bold">{sim.deficitUnits} units</span>
                      </div>
                    </>
                  )}

                  {node.type === 'finance' && (
                    <>
                      <div className="flex justify-between text-[#C4C7C5]">
                        <span className="text-[#747775]">Safe Cap:</span>
                        <span className="text-emerald-400 font-bold">₹1,80,000</span>
                      </div>
                      <div className="flex justify-between text-[#C4C7C5]">
                        <span className="text-[#747775]">Reserve:</span>
                        <span className="text-white">₹5.00L Lock</span>
                      </div>
                    </>
                  )}

                  {node.type === 'solver' && (
                    <>
                      <div className="flex justify-between text-[#C4C7C5]">
                        <span>QuickLogix (B):</span>
                        <span className="text-[#A8C7FA] font-bold">{sim.supplierBUnits} u (Net-30)</span>
                      </div>
                      <div className="flex justify-between text-[#C4C7C5]">
                        <span>Zenith (C):</span>
                        <span className="text-[#A8C7FA] font-bold">{sim.supplierCUnits} u (50% Adv)</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-bold border-t border-white/5 pt-1">
                        <span>Upfront Cash:</span>
                        <span>₹{sim.upfrontCash.toLocaleString()}</span>
                      </div>
                    </>
                  )}

                  {node.type === 'db' && (
                    <>
                      <div className="flex justify-between text-[#C4C7C5]">
                        <span className="text-[#747775]">Database:</span>
                        <span className="text-emerald-400 font-bold">Neon PostgreSQL</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCommitOrder();
                        }}
                        disabled={executed}
                        className={`w-full mt-1 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 text-[10px] font-mono ${
                          executed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-[#C2E7FF] text-[#001E2C] hover:bg-[#A8C7FA]'
                        }`}
                      >
                        {executed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Committed ✓</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3" />
                            <span>Commit PO</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= FLOATING CANVAS CONTROLS (BOTTOM LEFT) ================= */}
        <div className="absolute bottom-6 left-6 z-20 flex items-center gap-1.5 bg-[#1E1F20]/90 backdrop-blur-md border border-white/10 p-1.5 rounded-full shadow-2xl">
          <button
            onClick={() => handleZoom(0.1)}
            className="p-2 rounded-full text-[#C4C7C5] hover:text-white hover:bg-[#282A2C] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-[#747775] px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-2 rounded-full text-[#C4C7C5] hover:text-white hover:bg-[#282A2C] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/10 mx-0.5" />
          <button
            onClick={handleResetCanvas}
            className="p-2 rounded-full text-[#C4C7C5] hover:text-white hover:bg-[#282A2C] transition-colors cursor-pointer"
            title="Reset View & Node Layout"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              showGrid ? 'text-[#A8C7FA] bg-[#282A2C]' : 'text-[#747775] hover:text-white'
            }`}
            title="Toggle Dot Grid"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* ================= BOTTOM RIGHT TELEMETRY PILL ================= */}
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3 bg-[#1E1F20]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-2xl text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#C4C7C5]">
            <Clock className="w-3.5 h-3.5 text-[#A8C7FA]" />
            <span>Consensus: <strong className="text-white">11.4ms</strong></span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <button
            onClick={handleCopyLog}
            className="text-xs text-[#A8C7FA] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Trace'}</span>
          </button>
        </div>
      </div>

      {/* ================= SLIDE-OVER NODE DETAIL INSPECTION DRAWER ================= */}
      {inspectedNode && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#1E1F20] border-l border-white/15 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#171819]">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl border border-white/10 flex items-center justify-center ${inspectedNode.iconBg} ${inspectedNode.iconColor}`}>
                {inspectedNode.type === 'ceo' && <UserCheck className="w-4 h-4" />}
                {inspectedNode.type === 'orchestrator' && <Sparkles className="w-4 h-4" />}
                {inspectedNode.type === 'sales' && <TrendingUp className="w-4 h-4" />}
                {inspectedNode.type === 'inventory' && <Package className="w-4 h-4" />}
                {inspectedNode.type === 'finance' && <DollarSign className="w-4 h-4" />}
                {inspectedNode.type === 'solver' && <Cpu className="w-4 h-4" />}
                {inspectedNode.type === 'db' && <Database className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white font-headline">{inspectedNode.title}</h3>
                <p className="text-[10px] text-[#747775] font-mono">{inspectedNode.role}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="p-1.5 rounded-lg text-[#747775] hover:text-white hover:bg-[#282A2C] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* Metadata Pills */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-[#131314] p-2.5 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-[#747775]">Foundation Model</span>
                <div className="text-white font-semibold truncate">{inspectedNode.model}</div>
              </div>
              <div className="bg-[#131314] p-2.5 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-[#747775]">Execution Latency</span>
                <div className="text-emerald-400 font-semibold">{inspectedNode.latency}</div>
              </div>
            </div>

            {/* Live Parameter State */}
            <div className="space-y-1.5">
              <span className="text-[#747775] font-mono text-[10px] uppercase tracking-wider">Live Node Parameters</span>
              <div className="bg-[#131314] rounded-xl border border-white/5 p-3 space-y-2 font-mono text-[11px]">
                {inspectedNode.type === 'ceo' && (
                  <>
                    <div className="flex justify-between"><span className="text-[#747775]">SKU:</span><span className="text-white font-bold">P100 Headphones</span></div>
                    <div className="flex justify-between"><span className="text-[#747775]">Demand Surge:</span><span className="text-amber-400 font-bold">+{simSurge}%</span></div>
                    <div className="flex justify-between"><span className="text-[#747775]">Trigger Channel:</span><span className="text-blue-400">Viral TikTok Campaign</span></div>
                  </>
                )}
                {inspectedNode.type === 'orchestrator' && (
                  <>
                    <div className="flex justify-between"><span className="text-[#747775]">Event ID:</span><span className="text-white font-bold">EVT-894102</span></div>
                    <div className="flex justify-between"><span className="text-[#747775]">Sub-Agents Dispatched:</span><span className="text-emerald-400 font-bold">3 Parallel Tasks</span></div>
                    <div className="flex justify-between"><span className="text-[#747775]">Schema Protocol:</span><span className="text-[#A8C7FA]">Pydantic v2 Contract</span></div>
                  </>
                )}
                {inspectedNode.type === 'sales' && (
                  <>
                    <div className="flex justify-between"><span className="text-[#747775]">Current Velocity:</span><span className="text-white font-bold">{sim.velocity} units/day</span></div>
                    <div className="flex justify-between"><span className="text-[#747775]">7-Day Total Demand:</span><span className="text-blue-300 font-bold">{sim.forecast7d} units</span></div>
                    <div className="flex justify-between"><span className="text-[#747775]">Confidence Score:</span><span className="text-emerald-400 font-bold">94.2%</span></div>
                  </>
                )}
                {inspectedNode.type === 'inventory' && (
                  <>
                    <div className="flex justify-between"><span className="text-[#747775]">Physical Stock:</span><span className="text-white font-bold">170 units (Bin 4B)</span></div>
                    <div className="flex justify-between"><span className="text-[#747775]">Safety Floor:</span><span className="text-amber-300 font-bold">150 units</span></div>
                    <div className="flex justify-between"><span className="text-[#747775]">Stockout Horizon:</span><span className="text-rose-400 font-bold">{sim.horizonDays} days</span></div>
                    <div className="flex justify-between"><span className="text-[#747775]">Replenishment Deficit:</span><span className="text-rose-400 font-bold">{sim.deficitUnits} units</span></div>
                  </>
                )}
                {inspectedNode.type === 'finance' && (
                  <>
                    <div className="flex justify-between"><span className="text-[#747775]">Treasury Balance:</span><span className="text-white font-bold">₹8,50,000</span></div>
                    <div className="flex justify-between"><span className="text-[#747775]">Statutory Reserve Lock:</span><span className="text-emerald-400 font-bold">₹5,00,000 (100% Protected)</span></div>
                    <div className="flex justify-between"><span className="text-[#747775]">Safe Immediate Spend Cap:</span><span className="text-emerald-400 font-bold">₹1,80,000</span></div>
                  </>
                )}
                {inspectedNode.type === 'solver' && (
                  <>
                    <div className="flex justify-between"><span className="text-[#747775]">QuickLogix Allocation:</span><span className="text-[#A8C7FA] font-bold">{sim.supplierBUnits} u (Net-30)</span></div>
                    <div className="flex justify-between"><span className="text-[#747775]">Zenith Allocation:</span><span className="text-[#A8C7FA] font-bold">{sim.supplierCUnits} u (50% Adv)</span></div>
                    <div className="flex justify-between"><span className="text-[#747775]">Total Upfront Cash Impact:</span><span className="text-emerald-400 font-bold">₹{sim.upfrontCash.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-[#747775]">Mathematical Feasibility:</span><span className="text-emerald-400 font-bold">100% Feasible</span></div>
                  </>
                )}
                {inspectedNode.type === 'db' && (
                  <>
                    <div className="flex justify-between"><span className="text-[#747775]">Target DB:</span><span className="text-white font-bold">Neon Cloud PostgreSQL</span></div>
                    <div className="flex justify-between"><span className="text-[#747775]">Status:</span><span className="text-emerald-400 font-bold">{executed ? 'COMMITTED' : 'READY'}</span></div>
                    <div className="flex justify-between"><span className="text-[#747775]">Audit Block Hash:</span><span className="text-purple-300">0x8f9c2d1e4a7b5c3e</span></div>
                  </>
                )}
              </div>
            </div>

            {/* Step-by-Step Chain of Thought Rationale */}
            <div className="space-y-1.5">
              <span className="text-[#747775] font-mono text-[10px] uppercase tracking-wider">Step-by-Step Chain-of-Thought</span>
              <div className="bg-[#131314] p-3 rounded-xl border border-white/5 text-[11px] text-[#C4C7C5] leading-relaxed font-mono whitespace-pre-wrap">
                {inspectedNode.type === 'ceo' && `• Dispatched high-priority directive to resolve viral surge.
• Target: Restore SKU P100 inventory safety buffer within statutory treasury limits.`}
                {inspectedNode.type === 'orchestrator' && `• Deconstructed high-level prompt into domain sub-tasks.
• Bound Sales, Inventory, and Finance to Pydantic v2 validation contracts.`}
                {inspectedNode.type === 'sales' && `• Evaluated marketing promo elasticity curve.
• Order velocity climbed from 85 u/d to ${sim.velocity} u/d.
• 7-day total requirement: ${sim.forecast7d} units.`}
                {inspectedNode.type === 'inventory' && `• Bin 4B physical stock (170 units) will deplete below 150-unit safety floor in ~${sim.horizonDays} days.
• Recommended split procurement deficit: ${sim.deficitUnits} units.`}
                {inspectedNode.type === 'finance' && `• Statutory reserve of ₹5,00,000 strictly locked.
• Safe immediate cash spend ceiling approved at ₹1,80,000.
• Approved Net-30 credit facility for Supplier B.`}
                {inspectedNode.type === 'solver' && `• Formulated Integer Linear Program (ILP) via Google OR-Tools.
• Solved split: ${sim.supplierBUnits} u (QuickLogix, Net-30, ₹0 upfront) + ${sim.supplierCUnits} u (Zenith, 50% advance, ₹${sim.upfrontCash.toLocaleString()} upfront).
• Total upfront cash strictly within the ₹1,80,000 safe cap.`}
                {inspectedNode.type === 'db' && `• Relational schema validation succeeded across orders, supplier_pos, and audit_ledger.
• Zero hallucination guarantee.`}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-white/10 bg-[#171819] flex justify-end">
            <button
              onClick={() => setSelectedNodeId(null)}
              className="px-4 py-1.5 rounded-full bg-[#C2E7FF] text-[#001E2C] font-semibold text-xs hover:bg-[#A8C7FA] transition-colors cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

      {/* Global CSS for animated dashed flow lines */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -24;
          }
        }
      `}</style>
    </div>
  );
};
