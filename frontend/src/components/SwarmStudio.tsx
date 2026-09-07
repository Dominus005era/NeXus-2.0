import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  ChevronDown,
  Key,
  Globe
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
  apiKey: string;
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
  db: ['Neon Cloud Postgres (asyncpg)', 'Google Drive Cloud Docs API', 'Supabase Realtime'],
};

const DEFAULT_NODES: NodeData[] = [
  {
    id: 'node-ceo',
    type: 'ceo',
    title: 'Executive Directive',
    subtitle: 'CEO & Business Trigger',
    role: 'CEO / Business Executive (Rahul)',
    model: 'Executive Directive Stream',
    apiKey: 'System Exec',
    modelProvider: 'Executive',
    latency: '< 1ms',
    x: 60,
    y: 280,
    width: 250,
    height: 185,
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
    subtitle: 'Hierarchical Task & Refinement',
    role: 'DAG Planner, Agent Router & Final Synthesizer',
    model: 'Gemini 3.6 Flash (Default)',
    apiKey: 'AQ.Ab8RN6Iwn8dy5gj95VOKNleCbeExj6tIQ9CJW9zp8J2ZAssXqQ',
    modelProvider: 'Google',
    latency: '4.2ms',
    x: 370,
    y: 260,
    width: 270,
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
    subtitle: 'Promotions & Order Velocity',
    role: 'Demand Forecast & Elasticity Analysis',
    model: 'Gemini 3.6 Flash (High-Throughput)',
    apiKey: 'AQ.Ab8RN...SalesKey01',
    modelProvider: 'Google',
    latency: '8.2ms',
    x: 720,
    y: 80,
    width: 260,
    height: 180,
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
    subtitle: 'Bin 4B Depletion & Safety Floor',
    role: 'Stockout Horizon & Reorder Deficit',
    model: 'GPT-4o Mini (Tactical)',
    apiKey: 'sk-proj-InventoryKey02',
    modelProvider: 'OpenAI',
    latency: '6.4ms',
    x: 720,
    y: 290,
    width: 260,
    height: 180,
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
    subtitle: 'Statutory Reserve & Cash Cap',
    role: 'Ledger Audit & Spend Cap Compliance',
    model: 'Gemini 1.5 Pro (2M Context)',
    apiKey: 'AQ.Ab8RN...FinanceKey03',
    modelProvider: 'Google',
    latency: '9.1ms',
    x: 720,
    y: 500,
    width: 260,
    height: 180,
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
    subtitle: 'Deterministic Matrix Optimization',
    role: 'Integer Linear Programming Supplier Split',
    model: 'Google OR-Tools ILP v9.8 (Exact)',
    apiKey: 'OR-Tools Native Engine',
    modelProvider: 'Nexus Formal',
    latency: '2.4ms',
    x: 1070,
    y: 250,
    width: 275,
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
    title: 'Neon DB & Enterprise Cloud Docs',
    subtitle: 'Shared Google Drive & Postgres Sync',
    role: 'Immutable Ledger Commit & Document Fetch',
    model: 'Neon Cloud Postgres (asyncpg)',
    apiKey: 'neon_db_secret_key_live',
    modelProvider: 'Neon',
    latency: '1.8ms',
    x: 1420,
    y: 270,
    width: 270,
    height: 215,
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
  const [nodes, setNodes] = useState<NodeData[]>(DEFAULT_NODES);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [zoom, setZoom] = useState<number>(0.88);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Simulation & Pipeline Loop State
  const [simSurge, setSimSurge] = useState<number>(70);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [simulationPhase, setSimulationPhase] = useState<'idle' | 'forward' | 'consultation' | 'return' | 'complete'>('idle');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Auto-trigger Live Swarm Pipeline Animation when switching tabs from Executive Chat
  const [activeQueryPrompt, setActiveQueryPrompt] = useState<string>('P100 Headphones');

  useEffect(() => {
    const shouldTrigger = localStorage.getItem('nexus_trigger_swarm_sim');
    const savedPrompt = localStorage.getItem('nexus_active_prompt');
    if (savedPrompt) {
      setActiveQueryPrompt(savedPrompt);
    }
    if (shouldTrigger === 'true') {
      localStorage.removeItem('nexus_trigger_swarm_sim');
      handleRunSwarmPipeline();
    }
  }, [activeView]);


  // Real-time metrics calculation
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

  // Pointer Down Drag Handler
  const handleNodePointerDown = (nodeId: string, e: React.PointerEvent) => {
    e.stopPropagation();
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

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => Math.min(1.8, Math.max(0.4, prev * zoomFactor)));
    } else {
      setPan((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const handleResetLayout = () => {
    setNodes(DEFAULT_NODES);
    setPan({ x: 20, y: 20 });
    setZoom(0.88);
  };

  // Live Bidirectional Swarm Workflow Trigger
  const handleRunSwarmPipeline = () => {
    if (simulationPhase !== 'idle' && simulationPhase !== 'complete') return;

    // Phase 1: Forward Dispatch (CEO -> Orchestrator -> Sub-Agents)
    setSimulationPhase('forward');
    setActiveStage(1);

    setTimeout(() => {
      setActiveStage(2);
    }, 700);

    setTimeout(() => {
      setActiveStage(3);
      setSimulationPhase('consultation');
    }, 1400);

    // Phase 2: Inter-Agent & Cloud DB Consultation
    setTimeout(() => {
      setActiveStage(4);
    }, 2200);

    // Phase 3: Return Loop to Orchestrator for Refinement
    setTimeout(() => {
      setSimulationPhase('return');
      setActiveStage(5);
    }, 3000);

    // Phase 4: Final Refinement back to User
    setTimeout(() => {
      setSimulationPhase('complete');
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 3800);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // SVG Direct Port-to-Port Bezier Connection Renderer
  const renderPortConnection = (
    fromId: string,
    toId: string,
    color: string,
    isReturnLoop = false
  ) => {
    const fromNode = nodes.find((n) => n.id === fromId);
    const toNode = nodes.find((n) => n.id === toId);
    if (!fromNode || !toNode) return null;

    // Direct Port coordinates (Right Output -> Left Input or Return Loop Left -> Right)
    const x1 = isReturnLoop ? fromNode.x : fromNode.x + fromNode.width;
    const y1 = fromNode.y + fromNode.height / 2;
    const x2 = isReturnLoop ? toNode.x + toNode.width : toNode.x;
    const y2 = toNode.y + toNode.height / 2;

    const dx = Math.max(50, Math.abs(x2 - x1) * 0.45);
    const pathD = isReturnLoop
      ? `M ${x1} ${y1} C ${x1 - dx} ${y1 + 40}, ${x2 + dx} ${y2 + 40}, ${x2} ${y2}`
      : `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

    const isRunning = simulationPhase !== 'idle';

    return (
      <g key={`${fromId}-${toId}-${isReturnLoop ? 'return' : 'fwd'}`}>
        <path
          d={pathD}
          fill="none"
          stroke={isRunning ? color : '#2D2E30'}
          strokeWidth={isRunning ? 2.5 : 1.5}
          strokeOpacity={isRunning ? 0.85 : 0.4}
        />
        {isRunning && (
          <path
            d={pathD}
            fill="none"
            stroke="#A8C7FA"
            strokeWidth={3}
            strokeDasharray="6,8"
            className="animate-pulse"
          />
        )}
      </g>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0B0C0E] text-[#E3E3E3] font-sans overflow-hidden select-none">
      {/* EXECUTIVE HEADER */}
      <header className="h-14 border-b border-[#2D2E30]/70 bg-[#131314]/90 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToLanding}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1E1F20] hover:bg-[#2A2B2D] text-[#C4C7C5] hover:text-white text-xs font-medium border border-[#2D2E30] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </button>

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

        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#1E1F20] border border-[#2D2E30] text-xs">
            <span className="text-[#888888]">Swarm State:</span>
            <span className="font-semibold text-[#A8C7FA] capitalize">
              {simulationPhase === 'idle' ? 'Ready' : simulationPhase}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#1E1F20] border border-[#2D2E30] text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
            <span className="text-[#C4C7C5] font-medium">Parallel Multi-Agent Network</span>
          </div>
        </div>
      </header>

      {/* MAIN CANVAS FIELD */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* OVERLAY CONTROLS PANEL */}
        <div className="absolute top-4 left-4 z-20 w-72 bg-[#1E1F20]/90 backdrop-blur-xl border border-[#3A3B3E] rounded-2xl p-4 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#2D2E30] pb-2.5">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#A8C7FA]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Swarm Simulation
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#131314] text-[#81C995] border border-[#2D2E30]">
              Bidirectional Loop
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#888888]">Promotional Surge:</span>
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

          <button
            onClick={handleRunSwarmPipeline}
            disabled={simulationPhase !== 'idle' && simulationPhase !== 'complete'}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 bg-[#1A73E8] hover:bg-[#4285F4] text-white shadow-lg"
          >
            {simulationPhase !== 'idle' && simulationPhase !== 'complete' ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span className="capitalize">{simulationPhase} Processing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Live Bidirectional Swarm</span>
              </>
            )}
          </button>
        </div>

        {/* CANVAS BG */}
        <div
          ref={canvasContainerRef}
          onPointerDown={handleCanvasPointerDown}
          onWheel={handleWheel}
          className="canvas-bg flex-1 w-full h-full relative overflow-hidden bg-[#0B0C0E]"
          style={{
            backgroundImage: showGrid
              ? 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)'
              : 'none',
            backgroundSize: '24px 24px',
          }}
        >
          <div
            className="absolute inset-0 origin-top-left transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* SVG PORT CONNECTIONS LAYER */}
            <svg className="absolute top-0 left-0 w-[3000px] h-[2000px] pointer-events-none z-0">
              {/* Forward Connections */}
              {renderPortConnection('node-ceo', 'node-orchestrator', '#4285F4')}
              {renderPortConnection('node-orchestrator', 'node-sales', '#3B82F6')}
              {renderPortConnection('node-orchestrator', 'node-inventory', '#F59E0B')}
              {renderPortConnection('node-orchestrator', 'node-finance', '#10B981')}

              {/* Inter-Agent & Cloud DB Connections */}
              {renderPortConnection('node-sales', 'node-[#node-inventory]', '#3B82F6')}
              {renderPortConnection('node-inventory', 'node-db', '#10B981')}
              {renderPortConnection('node-sales', 'node-solver', '#8B5CF6')}
              {renderPortConnection('node-inventory', 'node-solver', '#8B5CF6')}
              {renderPortConnection('node-finance', 'node-solver', '#8B5CF6')}
              {renderPortConnection('node-solver', 'node-db', '#10B981')}

              {/* Return Loop Back to Orchestrator & User */}
              {renderPortConnection('node-solver', 'node-orchestrator', '#A8C7FA', true)}
              {renderPortConnection('node-orchestrator', 'node-ceo', '#A8C7FA', true)}
            </svg>

            {/* NODES WITH PORT ANCHORS */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;

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
                      : node.borderColor
                  }`}
                >
                  {/* Left Input Port Dot */}
                  <div className="w-3 h-3 rounded-full bg-[#4285F4] border-2 border-[#1E1F20] absolute -left-1.5 top-1/2 -translate-y-1/2 shadow-md" />

                  {/* Right Output Port Dot */}
                  <div className="w-3 h-3 rounded-full bg-[#A8C7FA] border-2 border-[#1E1F20] absolute -right-1.5 top-1/2 -translate-y-1/2 shadow-md" />

                  <div className="p-3 border-b border-[#2D2E30]/70 flex items-center justify-between bg-[#18191A]/80 rounded-t-2xl">
                    <div className="flex items-center space-x-2 truncate">
                      <div className={`w-6 h-6 rounded-lg ${node.iconBg} ${node.iconColor} flex items-center justify-center shrink-0`}>
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white truncate font-heading">
                        {node.title}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 space-y-2 text-xs">
                    <div className="text-[11px] text-[#C4C7C5] line-clamp-2 leading-tight">
                      {node.role}
                    </div>

                    <div className="pt-1 border-t border-[#2D2E30]/50 space-y-1 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#888888]">AI Model:</span>
                        <span className="font-mono text-[#A8C7FA] font-medium truncate max-w-[120px]">
                          {node.model}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#888888]">API Key:</span>
                        <span className="font-mono text-[#81C995] truncate max-w-[110px]">
                          {node.apiKey.slice(0, 10)}...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BOTTOM-LEFT FLOATING CANVAS TOOLBAR */}
          <div className="absolute bottom-6 left-6 z-30 flex items-center space-x-1.5 bg-[#1E1F20]/90 backdrop-blur-xl border border-[#3A3B3E] rounded-full px-3 py-1.5 shadow-2xl">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
              className="p-1.5 rounded-full text-[#888888] hover:text-white hover:bg-[#2D2E30]"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-medium text-[#A8C7FA] px-2">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))}
              className="p-1.5 rounded-full text-[#888888] hover:text-white hover:bg-[#2D2E30]"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-[#2D2E30] mx-1" />
            <button
              onClick={handleResetLayout}
              className="p-1.5 rounded-full text-[#888888] hover:text-white hover:bg-[#2D2E30]"
              title="Reset View"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-full ${
                showGrid ? 'text-[#4285F4] bg-[#4285F4]/10' : 'text-[#888888] hover:text-white'
              }`}
              title="Toggle Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NODE INSPECTOR WITH CUSTOM MODEL & API KEY PER AGENT */}
        {selectedNode && (
          <aside className="w-80 border-l border-[#2D2E30]/70 bg-[#1E1F20] z-20 flex flex-col h-full shadow-2xl">
            <div className="p-4 border-b border-[#2D2E30] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-[#A8C7FA]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Agent Inspector & API Key
                </h3>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="p-1 text-[#888888] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="text-[10px] text-[#888888] uppercase tracking-wider">
                  Agent Title
                </label>
                <div className="text-sm font-bold text-white mt-0.5">{selectedNode.title}</div>
                <div className="text-xs text-[#A8C7FA]">{selectedNode.subtitle}</div>
              </div>

              {/* Swappable AI Model Selector */}
              {AVAILABLE_MODELS_BY_TYPE[selectedNode.type] && (
                <div className="space-y-1">
                  <label className="text-[10px] text-[#888888] uppercase tracking-wider">
                    Swappable AI Model
                  </label>
                  <select
                    value={selectedNode.model}
                    onChange={(e) => {
                      const newModel = e.target.value;
                      setNodes((prev) =>
                        prev.map((n) => (n.id === selectedNode.id ? { ...n, model: newModel } : n))
                      );
                    }}
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

              {/* Dedicated API Key for Parallel Execution */}
              <div className="space-y-1">
                <label className="text-[10px] text-[#888888] uppercase tracking-wider flex items-center space-x-1">
                  <Key className="w-3 h-3 text-[#34A853]" />
                  <span>Agent API Key (Parallel Processing)</span>
                </label>
                <input
                  type="password"
                  value={selectedNode.apiKey}
                  onChange={(e) => {
                    const newKey = e.target.value;
                    setNodes((prev) =>
                      prev.map((n) => (n.id === selectedNode.id ? { ...n, apiKey: newKey } : n))
                    );
                  }}
                  placeholder="Paste model API key for this agent..."
                  className="w-full bg-[#131314] text-xs text-white p-2.5 rounded-xl border border-[#2D2E30] focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#888888] uppercase tracking-wider">
                  Operational Role
                </label>
                <div className="p-3 rounded-xl bg-[#131314] text-[#C4C7C5] border border-[#2D2E30] mt-1 leading-relaxed">
                  {selectedNode.role}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};