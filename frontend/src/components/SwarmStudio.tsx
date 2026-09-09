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
import { api } from '../services/api';

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
  department: string;
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
  solver: ['SciPy HiGHS MILP Engine (Exact)', 'Google OR-Tools ILP v9.8', 'Nexus 3.1 Deep Think'],
  db: ['SQLite / Neon Postgres (SQLAlchemy)', 'Google Drive Cloud Docs API', 'Supabase Realtime'],
};

export const SwarmStudio: React.FC<SwarmStudioProps> = ({
  onBackToLanding,
  onSwitchToChat,
  activeView,
}) => {
  // Read dynamic company config from localStorage
  const workspaceConfig = useMemo(() => {
    const saved = localStorage.getItem('nexus_workspace_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  }, []);

  const companyName = workspaceConfig?.companyName || 'TechMart Electronics';
  const userName = workspaceConfig?.userName || 'Executive User';
  const userRole = workspaceConfig?.userRole || 'CEO & Founder';
  const authorityLevel = workspaceConfig?.authorityLevel || 'LEVEL_4_EXECUTIVE';

  const primaryProduct = workspaceConfig?.primaryProduct || 'Primary Catalog Line';

  // Dynamic Nodes formulated from company structure
  const initialNodes: NodeData[] = useMemo(() => [
    {
      id: 'node-ceo',
      type: 'ceo',
      title: 'Executive Directive',
      subtitle: `${userName} (${userRole})`,
      role: `Business Executive Authority (${authorityLevel})`,
      model: 'Operational Directive Stream',
      department: 'Executive Governance',
      modelProvider: 'Executive',
      latency: '< 1ms',
      x: 60,
      y: 280,
      width: 290,
      height: 200,
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
      subtitle: 'Hierarchical Task & Constraint Router',
      role: 'Prompt Decomposer, Agent Router & Solution Verifier',
      model: 'Gemini 3.6 Flash (Default)',
      department: 'AI Operations Command',
      modelProvider: 'Google',
      latency: '3.8ms',
      x: 450,
      y: 250,
      width: 310,
      height: 240,
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
      subtitle: 'Promotions & Demand Forecasting',
      role: `Demand Surge Analytics for ${primaryProduct}`,
      model: 'Gemini 3.6 Flash (High-Throughput)',
      department: 'Commercial & Sales',
      modelProvider: 'Google',
      latency: '5.4ms',
      x: 900,
      y: 50,
      width: 300,
      height: 195,
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
      subtitle: `${primaryProduct} Stockout Horizon`,
      role: `Burn Rate & Net Deficit Formulation for ${primaryProduct}`,
      model: 'GPT-4o Mini (Tactical)',
      department: 'Logistics & Warehouse',
      modelProvider: 'OpenAI',
      latency: '4.9ms',
      x: 900,
      y: 290,
      width: 300,
      height: 195,
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
      subtitle: 'Statutory Reserve & Safe Cash Cap',
      role: 'Ledger Audit & ₹1.80L Spend Ceiling Guard',
      model: 'Gemini 1.5 Pro (2M Context)',
      department: 'Treasury & Compliance',
      modelProvider: 'Google',
      latency: '6.1ms',
      x: 900,
      y: 530,
      width: 300,
      height: 195,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/50',
      accentGlow: 'rgba(34, 197, 94, 0.25)',
      stageNum: 3,
    },
    {
      id: 'node-solver',
      type: 'solver',
      title: 'SciPy HiGHS Decision Solver',
      subtitle: 'Deterministic MILP Optimization',
      role: 'Mixed-Integer Linear Supplier Split Formulation',
      model: 'SciPy HiGHS MILP Engine (Exact)',
      department: 'Operations Optimization',
      modelProvider: 'Nexus Formal',
      latency: '3.9ms',
      x: 1350,
      y: 250,
      width: 310,
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
      title: 'Enterprise DB & Cloud Docs',
      subtitle: `${companyName} Data Store`,
      role: 'SQLAlchemy Persistence & Google Drive RAG',
      model: 'SQLite / Neon Postgres (SQLAlchemy)',
      department: 'Enterprise Data Layer',
      modelProvider: 'Neon',
      latency: '1.2ms',
      x: 1800,
      y: 270,
      width: 300,
      height: 230,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/60',
      accentGlow: 'rgba(16, 185, 129, 0.25)',
      stageNum: 5,
    },
  ], [userName, userRole, authorityLevel, companyName]);

  const [nodes, setNodes] = useState<NodeData[]>(initialNodes);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [zoom, setZoom] = useState<number>(0.72);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);

  // Simulation & Pipeline Loop State
  const [simSurge, setSimSurge] = useState<number>(70);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [simulationPhase, setSimulationPhase] = useState<'idle' | 'forward' | 'consultation' | 'solver' | 'return' | 'complete'>('idle');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeQueryPrompt, setActiveQueryPrompt] = useState<string>(`Analyze ${primaryProduct} demand surge (+70%) & formulate split PO`);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const wheelTimerRef = useRef<any>(null);

  // Auto-trigger live visualization if requested from chat
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

  // Real-time formal metrics calculation
  const sim = useMemo(() => {
    const baseDemand = 85;
    const velocity = Math.round(baseDemand * (1 + simSurge / 100));
    const forecast7d = velocity * 7;
    const currentStock = 170;
    const safetyStock = 150;
    const rawHorizon = (currentStock - safetyStock) / velocity;
    const horizonDays = Number(Math.max(0.1, rawHorizon).toFixed(2));
    const deficitUnits = Math.max(0, forecast7d + safetyStock - currentStock);

    // Exact SciPy MILP outcome for default suppliers
    const supplierCUnits = Math.min(800, deficitUnits);
    const supplierBUnits = Math.max(0, deficitUnits - supplierCUnits);
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
    setIsInteracting(true);
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
      setIsInteracting(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (!isDragging) {
        setSelectedNodeId(nodeId);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Canvas Smooth Pan Handler
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.node-card') ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('textarea') ||
      target.closest('aside')
    ) {
      return;
    }

    setIsInteracting(true);
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
      setIsInteracting(false);
      window.removeEventListener('pointermove', onPanMove);
      window.removeEventListener('pointerup', onPanUp);
    };

    window.addEventListener('pointermove', onPanMove);
    window.addEventListener('pointerup', onPanUp);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setIsInteracting(true);
    if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = setTimeout(() => setIsInteracting(false), 180);

    const container = canvasContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const deltaZoom = -e.deltaY * 0.0018;
    setZoom((prevZoom) => {
      const nextZoom = Math.min(2.2, Math.max(0.3, prevZoom * (1 + deltaZoom)));
      const scaleRatio = nextZoom / prevZoom;
      setPan((prevPan) => ({
        x: cursorX - (cursorX - prevPan.x) * scaleRatio,
        y: cursorY - (cursorY - prevPan.y) * scaleRatio,
      }));
      return nextZoom;
    });
  };

  // Live Swarm Workflow Trigger: Visualizes Prompt Traveling across the Pipeline
  const handleRunSwarmPipeline = () => {
    if (simulationPhase !== 'idle' && simulationPhase !== 'complete') return;

    // Stage 1: User Directive -> Orchestrator
    setSimulationPhase('forward');
    setActiveStage(1);

    // Stage 2: Orchestrator decomposes query -> dispatches to Sales, Inventory, Finance
    setTimeout(() => {
      setActiveStage(2);
    }, 750);

    // Stage 3: Sub-Agents execute & consult on constraints
    setTimeout(() => {
      setActiveStage(3);
      setSimulationPhase('consultation');
    }, 1500);

    // Stage 4: Dispatched to SciPy HiGHS MILP Decision Solver
    setTimeout(() => {
      setActiveStage(4);
      setSimulationPhase('solver');
    }, 2300);

    // Stage 5: Decision Solver returns proof to Orchestrator for Executive Verification
    setTimeout(() => {
      setSimulationPhase('return');
      setActiveStage(5);
    }, 3100);

    // Stage 6: Orchestrator verifies compliance & delivers brief to User
    setTimeout(() => {
      setSimulationPhase('complete');
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
      });
    }, 3800);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="flex flex-col h-screen w-full bg-[#0B0C0E] text-[#E3E3E3] font-sans overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b border-[#2D2E30] bg-[#1E1F20]/90 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToLanding}
            className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-[#2D2E30] transition-colors"
            title="Back to Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#1A73E8] via-[#4285F4] to-[#A8C7FA] flex items-center justify-center shadow-md">
              <Network className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-white font-heading">Swarm Studio</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30 font-semibold">
                  Autonomous Multi-Agent DAG
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#2D2E30] text-[#A8C7FA] font-mono">
                  {companyName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Active Query & Pipeline Controls */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-[#131314] border border-[#2D2E30] text-xs">
            <span className="text-[#888888]">Active Inquiry:</span>
            <span className="text-[#A8C7FA] font-medium truncate max-w-xs">{activeQueryPrompt}</span>
          </div>

          <button
            onClick={handleRunSwarmPipeline}
            disabled={simulationPhase !== 'idle' && simulationPhase !== 'complete'}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#1A73E8] via-[#4285F4] to-[#A855F7] text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-[#1A73E8]/20 disabled:opacity-50 hover:brightness-110"
          >
            <Play className={`w-3.5 h-3.5 ${simulationPhase !== 'idle' && simulationPhase !== 'complete' ? 'animate-spin' : ''}`} />
            <span>
              {simulationPhase === 'idle' || simulationPhase === 'complete' ? 'Simulate Swarm Travel' : `Stage ${activeStage}: Processing...`}
            </span>
          </button>

          <button
            onClick={onSwitchToChat}
            className="px-3 py-1.5 rounded-xl bg-[#2A2B2D] hover:bg-[#35373A] text-[#C4C7C5] hover:text-white text-xs font-medium flex items-center space-x-1.5 border border-[#3A3B3E]/60 transition-all"
          >
            <Bot className="w-3.5 h-3.5 text-[#A8C7FA]" />
            <span>Switch to Executive Chat</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Parameter Panel (Collapsible) */}
        <aside className="w-72 border-r border-[#2D2E30] bg-[#1E1F20]/70 backdrop-blur-md p-4 space-y-4 shrink-0 overflow-y-auto z-20">
          <div>
            <h3 className="text-xs font-bold text-[#A8C7FA] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Telemetry & Surge Input</span>
              <Activity className="w-3.5 h-3.5 text-[#4285F4]" />
            </h3>

            <div className="space-y-3 bg-[#131314] p-3 rounded-2xl border border-[#2D2E30]">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#888888]">Simulated Demand Surge:</span>
                  <span className="text-[#4285F4] font-bold font-mono">+{simSurge}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={200}
                  step={5}
                  value={simSurge}
                  onChange={(e) => setSimSurge(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#2D2E30] rounded-lg appearance-none cursor-pointer accent-[#4285F4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#2D2E30]/60">
                <div>
                  <span className="text-[#888888] block">Order Velocity:</span>
                  <span className="text-white font-mono font-semibold">{sim.velocity} u/d</span>
                </div>
                <div>
                  <span className="text-[#888888] block">Stockout Horizon:</span>
                  <span className="text-amber-400 font-mono font-semibold">{sim.horizonDays} days</span>
                </div>
                <div>
                  <span className="text-[#888888] block">Buffer Deficit:</span>
                  <span className="text-white font-mono font-semibold">{sim.deficitUnits} units</span>
                </div>
                <div>
                  <span className="text-[#888888] block">Upfront Cash:</span>
                  <span className={`font-mono font-semibold ${sim.isFeasible ? 'text-[#34A853]' : 'text-red-400'}`}>
                    ₹{sim.upfrontCash.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Multi-Agent Travel Stage Legend */}
          <div>
            <h3 className="text-xs font-bold text-[#A8C7FA] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Live Prompt Travel Stages</span>
              <GitBranch className="w-3.5 h-3.5 text-[#A8C7FA]" />
            </h3>

            <div className="space-y-1.5 text-xs">
              {[
                { stage: 1, label: '1. Executive Dispatch', desc: 'User prompt -> Orchestrator' },
                { stage: 2, label: '2. Task Breakdown', desc: 'Orchestrator fans out tasks' },
                { stage: 3, label: '3. Agent Consensus', desc: 'Sales, Inventory & Finance negotiate' },
                { stage: 4, label: '4. SciPy MILP Solver', desc: 'Optimal supplier matrix calculation' },
                { stage: 5, label: '5. Verification Loop', desc: 'Orchestrator validates & delivers' },
              ].map((item) => (
                <div
                  key={item.stage}
                  className={`p-2 rounded-xl border transition-all ${
                    activeStage === item.stage
                      ? 'bg-[#4285F4]/15 border-[#4285F4] text-white'
                      : activeStage > item.stage
                      ? 'bg-[#131314] border-[#34A853]/40 text-[#C4C7C5]'
                      : 'bg-[#131314] border-[#2D2E30] text-[#888888]'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-[11px]">
                    <span>{item.label}</span>
                    {activeStage === item.stage && (
                      <span className="w-2 h-2 rounded-full bg-[#4285F4] animate-ping" />
                    )}
                    {activeStage > item.stage && (
                      <CheckCircle2 className="w-3 h-3 text-[#34A853]" />
                    )}
                  </div>
                  <div className="text-[10px] text-[#888888]">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick RBAC Info */}
          <div className="p-3 rounded-2xl bg-[#131314] border border-[#2D2E30] text-[11px] space-y-1">
            <div className="text-[#A8C7FA] font-semibold flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34A853]" />
              <span>Active Authority: {authorityLevel}</span>
            </div>
            <p className="text-[10px] text-[#888888] leading-relaxed">
              Logged in as {userName} ({userRole}). Department models respect Role-Based Access Control tokens.
            </p>
          </div>
        </aside>

        {/* Dynamic Interactive Canvas */}
        <div
          ref={canvasContainerRef}
          onPointerDown={handleCanvasPointerDown}
          onWheel={handleWheel}
          className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
          style={{
            backgroundImage: showGrid
              ? 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)'
              : 'none',
            backgroundSize: '24px 24px',
          }}
        >
          {/* Zoom & Canvas Controls */}
          <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 bg-[#1E1F20]/90 backdrop-blur-md border border-[#2D2E30] p-1.5 rounded-2xl shadow-lg">
            <button
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))}
              className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-[#2D2E30]"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-[#A8C7FA] px-1">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
              className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-[#2D2E30]"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setPan({ x: 20, y: 20 }); setZoom(0.72); }}
              className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-[#2D2E30]"
              title="Reset View"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Transform Canvas Layer */}
          <div
            className="absolute inset-0 origin-top-left"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: isInteracting ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            {/* SVG Connecting Paths with Traveling Pulse */}
            <svg className="absolute inset-0 w-[2400px] h-[1000px] pointer-events-none">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4285F4" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#A855F7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#34A853" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Path 1: CEO -> Orchestrator */}
              <path
                d={`M 350 380 C 400 380, 400 370, 450 370`}
                fill="none"
                stroke={activeStage >= 1 ? '#4285F4' : '#2D2E30'}
                strokeWidth={activeStage >= 1 ? '3' : '1.5'}
                strokeDasharray={activeStage === 1 ? '6 4' : 'none'}
                className={activeStage === 1 ? 'animate-pulse' : ''}
              />

              {/* Path 2a: Orchestrator -> Sales */}
              <path
                d={`M 760 370 C 830 370, 830 145, 900 145`}
                fill="none"
                stroke={activeStage >= 2 ? '#3B82F6' : '#2D2E30'}
                strokeWidth={activeStage >= 2 ? '2.5' : '1.5'}
              />

              {/* Path 2b: Orchestrator -> Inventory */}
              <path
                d={`M 760 370 C 830 370, 830 385, 900 385`}
                fill="none"
                stroke={activeStage >= 2 ? '#F59E0B' : '#2D2E30'}
                strokeWidth={activeStage >= 2 ? '2.5' : '1.5'}
              />

              {/* Path 2c: Orchestrator -> Finance */}
              <path
                d={`M 760 370 C 830 370, 830 625, 900 625`}
                fill="none"
                stroke={activeStage >= 2 ? '#10B981' : '#2D2E30'}
                strokeWidth={activeStage >= 2 ? '2.5' : '1.5'}
              />

              {/* Path 3: Sub-Agents -> SciPy MILP Solver */}
              <path
                d={`M 1200 145 C 1280 145, 1280 370, 1350 370`}
                fill="none"
                stroke={activeStage >= 3 ? '#A855F7' : '#2D2E30'}
                strokeWidth={activeStage >= 3 ? '2.5' : '1.5'}
              />
              <path
                d={`M 1200 385 C 1280 385, 1280 370, 1350 370`}
                fill="none"
                stroke={activeStage >= 3 ? '#A855F7' : '#2D2E30'}
                strokeWidth={activeStage >= 3 ? '2.5' : '1.5'}
              />
              <path
                d={`M 1200 625 C 1280 625, 1280 370, 1350 370`}
                fill="none"
                stroke={activeStage >= 3 ? '#A855F7' : '#2D2E30'}
                strokeWidth={activeStage >= 3 ? '2.5' : '1.5'}
              />

              {/* Path 4: SciPy Solver -> Enterprise DB & Back to Orchestrator */}
              <path
                d={`M 1660 370 C 1730 370, 1730 385, 1800 385`}
                fill="none"
                stroke={activeStage >= 4 ? '#10B981' : '#2D2E30'}
                strokeWidth={activeStage >= 4 ? '2.5' : '1.5'}
              />
            </svg>

            {/* Dynamic Agent Node Cards */}
            {nodes.map((node) => {
              const isNodeActive = activeStage === node.stageNum;
              return (
                <div
                  key={node.id}
                  onPointerDown={(e) => handleNodePointerDown(node.id, e)}
                  style={{
                    transform: `translate(${node.x}px, ${node.y}px)`,
                    width: `${node.width}px`,
                  }}
                  className={`node-card absolute rounded-3xl bg-[#1E1F20] border transition-shadow cursor-pointer ${
                    selectedNodeId === node.id
                      ? 'border-[#4285F4] ring-2 ring-[#4285F4]/30 shadow-2xl'
                      : isNodeActive
                      ? `${node.borderColor} ring-2 ring-[#4285F4]/50 shadow-xl shadow-[#1A73E8]/20`
                      : 'border-[#2D2E30] hover:border-[#3A3B3E] shadow-lg'
                  }`}
                >
                  <div className="p-4 space-y-2.5">
                    {/* Node Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-8 h-8 rounded-xl ${node.iconBg} flex items-center justify-center`}>
                          <Bot className={`w-4 h-4 ${node.iconColor}`} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">{node.title}</h4>
                          <span className="text-[10px] text-[#888888]">{node.department}</span>
                        </div>
                      </div>

                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#131314] text-[#A8C7FA] font-mono border border-[#2D2E30]">
                        {node.latency}
                      </span>
                    </div>

                    {/* Role Description */}
                    <p className="text-[11px] text-[#C4C7C5] line-clamp-2 leading-relaxed">
                      {node.role}
                    </p>

                    {/* Model Info Badge */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#2D2E30]/70 text-[10px]">
                      <span className="text-[#888888]">Engine:</span>
                      <span className="text-[#A8C7FA] font-mono font-medium truncate max-w-[170px]">
                        {node.model}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Node Detail Inspector Drawer */}
        {selectedNode && (
          <aside className="w-80 border-l border-[#2D2E30] bg-[#1E1F20] p-5 space-y-4 shrink-0 overflow-y-auto z-20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2D2E30] pb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-7 h-7 rounded-lg ${selectedNode.iconBg} flex items-center justify-center`}>
                  <Bot className={`w-4 h-4 ${selectedNode.iconColor}`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{selectedNode.title}</h4>
                  <span className="text-[10px] text-[#888888]">{selectedNode.department}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="p-1 rounded-lg text-[#888888] hover:text-white hover:bg-[#2D2E30]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-[#888888] uppercase font-bold tracking-wider block mb-1">
                  Active Model Runtime
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
                  {(AVAILABLE_MODELS_BY_TYPE[selectedNode.type] || [selectedNode.model]).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#888888] uppercase font-bold tracking-wider block mb-1">
                  Operational Mission
                </label>
                <p className="text-xs text-[#D8D8D8] bg-[#131314] p-3 rounded-xl border border-[#2D2E30] leading-relaxed">
                  {selectedNode.role}
                </p>
              </div>

              <div>
                <label className="text-[10px] text-[#888888] uppercase font-bold tracking-wider block mb-1">
                  Grounded Knowledge Records
                </label>
                <div className="bg-[#131314] p-3 rounded-xl border border-[#2D2E30] space-y-1 text-[11px] font-mono text-[#A8C7FA]">
                  <div>• q3_promotional_calendar.md</div>
                  <div>• bin_4b_stock_ledger.csv</div>
                  <div>• statutory_reserve_governance.md</div>
                  <div>• supplier_contracts_master.json</div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};