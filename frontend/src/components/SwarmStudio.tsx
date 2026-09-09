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
  ChevronDown,
  Key,
  Globe,
  Send,
  Radio,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { ThemeToggle } from '../context/ThemeContext';

interface SwarmStudioProps {
  onBackToLanding: () => void;
  onSwitchToChat: () => void;
  activeView: 'chat' | 'swarm';
}

export interface NodeData {
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

interface DynamicWire {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  color: string;
  requiredForRoutes: SwarmRouteType[];
  stageStep: number; // In which stage this wire transmits
}

type SwarmRouteType = 'full_surge_milp' | 'treasury_audit' | 'inventory_deficit' | 'sales_velocity' | 'db_catalog';

const ROUTE_INFO: Record<SwarmRouteType, { title: string; desc: string; color: string; badge: string }> = {
  full_surge_milp: {
    title: 'Full Surge & MILP Allocation DAG',
    desc: 'Parallel routing to Sales, Inventory & Treasury feeding SciPy HiGHS Solver',
    color: '#4285F4',
    badge: 'Multi-Agent + MILP'
  },
  treasury_audit: {
    title: 'Treasury & Statutory Lock Audit',
    desc: 'Direct compliance path through DB & Treasury; Sales and Inventory Standby',
    color: '#10B981',
    badge: 'Governance Audit'
  },
  inventory_deficit: {
    title: 'Supply Chain & Stockout Horizon',
    desc: 'Targeted logistics query to DB & Inventory; Solver & Finance Standby',
    color: '#F59E0B',
    badge: 'Logistics Stream'
  },
  sales_velocity: {
    title: 'Demand Surge & Forecast Curve',
    desc: 'Commercial routing to DB & Sales Intelligence Agent',
    color: '#3B82F6',
    badge: 'Demand Analytics'
  },
  db_catalog: {
    title: 'Google Drive Database Retrieval',
    desc: 'Direct grounding extraction across connected Drive datasets',
    color: '#8B5CF6',
    badge: 'Knowledge RAG'
  }
};

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
  const primaryProduct = workspaceConfig?.primaryProduct || 'P100 Headphones';

  // Dynamic Initial Nodes formulated from company structure
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
      iconBg: 'bg-[#A8C7FA]/10 dark:bg-[#A8C7FA]/10',
      iconColor: 'text-blue-600 dark:text-[#A8C7FA]',
      borderColor: 'border-blue-400 dark:border-[#A8C7FA]/40',
      accentGlow: 'rgba(66, 133, 244, 0.2)',
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
      x: 440,
      y: 250,
      width: 320,
      height: 240,
      iconBg: 'bg-blue-500/10 dark:bg-[#A8C7FA]/20',
      iconColor: 'text-blue-600 dark:text-[#A8C7FA]',
      borderColor: 'border-blue-500 dark:border-[#A8C7FA]',
      accentGlow: 'rgba(66, 133, 244, 0.35)',
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
      x: 910,
      y: 50,
      width: 300,
      height: 200,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500 dark:text-blue-400',
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
      x: 910,
      y: 290,
      width: 300,
      height: 200,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500 dark:text-amber-400',
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
      x: 910,
      y: 530,
      width: 300,
      height: 200,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
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
      x: 1360,
      y: 250,
      width: 320,
      height: 245,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500 dark:text-purple-400',
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
      x: 1810,
      y: 270,
      width: 300,
      height: 230,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      borderColor: 'border-emerald-500/60',
      accentGlow: 'rgba(16, 185, 129, 0.25)',
      stageNum: 2,
    },
  ], [userName, userRole, authorityLevel, companyName, primaryProduct]);

  // Master Wire Definitions Linking Nodes
  const dynamicWires: DynamicWire[] = useMemo(() => [
    {
      id: 'wire-ceo-to-orchestrator',
      sourceId: 'node-ceo',
      targetId: 'node-orchestrator',
      label: 'Executive Query Dispatch',
      color: '#4285F4',
      requiredForRoutes: ['full_surge_milp', 'treasury_audit', 'inventory_deficit', 'sales_velocity', 'db_catalog'],
      stageStep: 1,
    },
    {
      id: 'wire-orchestrator-to-db',
      sourceId: 'node-orchestrator',
      targetId: 'node-db',
      label: 'Drive Grounding & Catalog RAG',
      color: '#10B981',
      requiredForRoutes: ['full_surge_milp', 'treasury_audit', 'inventory_deficit', 'sales_velocity', 'db_catalog'],
      stageStep: 2,
    },
    {
      id: 'wire-orchestrator-to-sales',
      sourceId: 'node-orchestrator',
      targetId: 'node-sales',
      label: 'Forecast Surge Demand (+70%)',
      color: '#3B82F6',
      requiredForRoutes: ['full_surge_milp', 'sales_velocity'],
      stageStep: 3,
    },
    {
      id: 'wire-orchestrator-to-inventory',
      sourceId: 'node-orchestrator',
      targetId: 'node-inventory',
      label: 'Compute Net Deficit & Burn',
      color: '#F59E0B',
      requiredForRoutes: ['full_surge_milp', 'inventory_deficit'],
      stageStep: 3,
    },
    {
      id: 'wire-orchestrator-to-finance',
      sourceId: 'node-orchestrator',
      targetId: 'node-finance',
      label: 'Check ₹1.80L Spend & Reserves',
      color: '#10B981',
      requiredForRoutes: ['full_surge_milp', 'treasury_audit'],
      stageStep: 3,
    },
    {
      id: 'wire-sales-to-solver',
      sourceId: 'node-sales',
      targetId: 'node-solver',
      label: '1,015 u Demand Objective',
      color: '#A855F7',
      requiredForRoutes: ['full_surge_milp'],
      stageStep: 4,
    },
    {
      id: 'wire-inventory-to-solver',
      sourceId: 'node-inventory',
      targetId: 'node-solver',
      label: '960 u Deficit Target Constraint',
      color: '#A855F7',
      requiredForRoutes: ['full_surge_milp'],
      stageStep: 4,
    },
    {
      id: 'wire-finance-to-solver',
      sourceId: 'node-finance',
      targetId: 'node-solver',
      label: '₹1.80L Cash Cap Constraint',
      color: '#A855F7',
      requiredForRoutes: ['full_surge_milp'],
      stageStep: 4,
    },
    {
      id: 'wire-solver-to-db',
      sourceId: 'node-solver',
      targetId: 'node-db',
      label: 'Persist Optimal PO Split',
      color: '#10B981',
      requiredForRoutes: ['full_surge_milp'],
      stageStep: 5,
    },
    {
      id: 'wire-solver-to-orchestrator',
      sourceId: 'node-solver',
      targetId: 'node-orchestrator',
      label: 'HiGHS Mathematical Solution Proof',
      color: '#4285F4',
      requiredForRoutes: ['full_surge_milp'],
      stageStep: 5,
    },
    {
      id: 'wire-orchestrator-to-ceo',
      sourceId: 'node-orchestrator',
      targetId: 'node-ceo',
      label: 'Final Verified Brief Delivery',
      color: '#4285F4',
      requiredForRoutes: ['full_surge_milp', 'treasury_audit', 'inventory_deficit', 'sales_velocity', 'db_catalog'],
      stageStep: 5,
    },
  ], []);

  const [nodes, setNodes] = useState<NodeData[]>(initialNodes);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [zoom, setZoom] = useState<number>(0.72);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const zoomRef = useRef<number>(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Dynamic Prompt & Intent State
  const [activeQueryPrompt, setActiveQueryPrompt] = useState<string>(
    `Analyze ${primaryProduct} demand surge (+70%) & formulate split PO`
  );
  const [simSurge, setSimSurge] = useState<number>(70);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [simulationPhase, setSimulationPhase] = useState<'idle' | 'running' | 'complete'>('idle');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [customPromptInput, setCustomPromptInput] = useState<string>('');
  const [activeTelemetryPayload, setActiveTelemetryPayload] = useState<Record<string, string>>({});

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const wheelTimerRef = useRef<any>(null);

  // Intent Classifier: Inspects prompt and tailors the active DAG route
  const currentRouteType: SwarmRouteType = useMemo(() => {
    const p = activeQueryPrompt.toLowerCase();
    if (
      p.includes('surge') ||
      p.includes('split') ||
      p.includes('supplier') ||
      p.includes('po') ||
      p.includes('milp') ||
      p.includes('optimize') ||
      p.includes('order')
    ) {
      return 'full_surge_milp';
    }
    if (
      p.includes('treasury') ||
      p.includes('reserve') ||
      p.includes('cash') ||
      p.includes('spend ceiling') ||
      p.includes('liquidity') ||
      p.includes('statutory') ||
      p.includes('covenant')
    ) {
      return 'treasury_audit';
    }
    if (
      p.includes('inventory') ||
      p.includes('stockout') ||
      p.includes('horizon') ||
      p.includes('burn rate') ||
      p.includes('warehouse') ||
      p.includes('bin') ||
      p.includes('stock')
    ) {
      return 'inventory_deficit';
    }
    if (
      p.includes('sales') ||
      p.includes('promo') ||
      p.includes('demand') ||
      p.includes('creator') ||
      p.includes('velocity')
    ) {
      return 'sales_velocity';
    }
    return 'db_catalog';
  }, [activeQueryPrompt]);

  // Which nodes participate in the current route
  const participatingNodeIds = useMemo(() => {
    switch (currentRouteType) {
      case 'full_surge_milp':
        return ['node-ceo', 'node-orchestrator', 'node-db', 'node-sales', 'node-inventory', 'node-finance', 'node-solver'];
      case 'treasury_audit':
        return ['node-ceo', 'node-orchestrator', 'node-db', 'node-finance'];
      case 'inventory_deficit':
        return ['node-ceo', 'node-orchestrator', 'node-db', 'node-inventory'];
      case 'sales_velocity':
        return ['node-ceo', 'node-orchestrator', 'node-db', 'node-sales'];
      case 'db_catalog':
        return ['node-ceo', 'node-orchestrator', 'node-db'];
      default:
        return ['node-ceo', 'node-orchestrator', 'node-db'];
    }
  }, [currentRouteType]);

  // Real-time formal metrics calculation for telemetry
  const sim = useMemo(() => {
    const baseDemand = 85;
    const velocity = Math.round(baseDemand * (1 + simSurge / 100));
    const forecast7d = velocity * 7;
    const currentStock = 170;
    const safetyStock = 150;
    const rawHorizon = (currentStock - safetyStock) / velocity;
    const horizonDays = Number(Math.max(0.1, rawHorizon).toFixed(2));
    const deficitUnits = Math.max(0, forecast7d + safetyStock - currentStock);

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

  // Auto-trigger simulation if navigated from chat
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

  const nodeMap = useMemo(() => {
    const map = new Map<string, NodeData>();
    for (const node of nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [nodes]);

  // Reset entire DAG node positions to pristine state
  const handleResetLayout = () => {
    setNodes(initialNodes);
    setPan({ x: 20, y: 20 });
    setZoom(0.72);
  };

  // DYNAMIC ANCHOR CALCULATION:
  // Dynamically computes bezier path connecting any 2 nodes using their real-time coordinates!
  const getDynamicWirePath = useCallback((sourceId: string, targetId: string) => {
    const s = nodeMap.get(sourceId);
    const t = nodeMap.get(targetId);
    if (!s || !t) return { path: '', midX: 0, midY: 0 };

    const sLeft = s.x;
    const sRight = s.x + s.width;
    const sCenterY = s.y + s.height / 2;

    const tLeft = t.x;
    const tRight = t.x + t.width;
    const tCenterY = t.y + t.height / 2;

    let p1x: number;
    let p1y = sCenterY;
    let p2x: number;
    let p2y = tCenterY;
    let cx1: number;
    let cx2: number;

    if (sRight + 20 <= tLeft) {
      // S is clearly to the left of T
      p1x = sRight;
      p2x = tLeft;
      const dx = p2x - p1x;
      const curvature = Math.max(40, Math.min(180, dx * 0.45));
      cx1 = p1x + curvature;
      cx2 = p2x - curvature;
    } else if (tRight + 20 <= sLeft) {
      // T is clearly to the left of S (reversed)
      p1x = sLeft;
      p2x = tRight;
      const dx = p1x - p2x;
      const curvature = Math.max(40, Math.min(180, dx * 0.45));
      cx1 = p1x - curvature;
      cx2 = p2x + curvature;
    } else {
      // Overlapping or vertically stacked - route via outer facing flank
      const sCenterX = s.x + s.width / 2;
      const tCenterX = t.x + t.width / 2;

      if (sCenterX <= tCenterX) {
        // S is slightly left of T: loop on the outer right
        p1x = sRight;
        p2x = tRight;
        const curvature = 65;
        cx1 = Math.max(p1x, p2x) + curvature;
        cx2 = Math.max(p1x, p2x) + curvature;
      } else {
        // S is slightly right of T: loop on the outer left
        p1x = sLeft;
        p2x = tLeft;
        const curvature = 65;
        cx1 = Math.min(p1x, p2x) - curvature;
        cx2 = Math.min(p1x, p2x) - curvature;
      }
    }

    const midX = Math.round(0.125 * p1x + 0.375 * cx1 + 0.375 * cx2 + 0.125 * p2x);
    const midY = Math.round(0.125 * p1y + 0.375 * p1y + 0.375 * p2y + 0.125 * p2y);

    return {
      path: `M ${p1x} ${p1y} C ${cx1} ${p1y}, ${cx2} ${p2y}, ${p2x} ${p2y}`,
      midX,
      midY,
    };
  }, [nodeMap]);

  // Node Drag Handler (Ultra-Smooth 120 FPS rAF & Pointer Capture)
  const handleNodePointerDown = (nodeId: string, e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.button !== 0) return;

    const currentTarget = e.currentTarget;
    try {
      currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    setIsInteracting(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const targetNode = nodeMap.get(nodeId);
    if (!targetNode) return;

    const initialX = targetNode.x;
    const initialY = targetNode.y;
    let isDragging = false;
    let rafId: number | null = null;
    let latestX = startX;
    let latestY = startY;

    const updatePosition = () => {
      rafId = null;
      const currentZoom = zoomRef.current || 1;
      const dx = (latestX - startX) / currentZoom;
      const dy = (latestY - startY) / currentZoom;
      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === nodeId
            ? { ...n, x: Math.round(initialX + dx), y: Math.round(initialY + dy) }
            : n
        )
      );
    };

    const onPointerMove = (moveEvent: PointerEvent) => {
      latestX = moveEvent.clientX;
      latestY = moveEvent.clientY;

      if (!isDragging && Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) > 2) {
        isDragging = true;
        setDraggingNodeId(nodeId);
      }

      if (isDragging && rafId === null) {
        rafId = requestAnimationFrame(updatePosition);
      }
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        updatePosition();
      }
      try {
        currentTarget.releasePointerCapture(upEvent.pointerId);
      } catch (_) {}

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      setDraggingNodeId(null);
      setIsInteracting(false);

      if (!isDragging) {
        setSelectedNodeId(nodeId);
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Canvas Pan Handler with rAF
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

    let panRafId: number | null = null;
    let latestPanX = startX;
    let latestPanY = startY;

    const updatePan = () => {
      panRafId = null;
      const dx = latestPanX - startX;
      const dy = latestPanY - startY;
      setPan({ x: Math.round(initialPanX + dx), y: Math.round(initialPanY + dy) });
    };

    const onPanMove = (moveEvent: PointerEvent) => {
      latestPanX = moveEvent.clientX;
      latestPanY = moveEvent.clientY;
      if (panRafId === null) {
        panRafId = requestAnimationFrame(updatePan);
      }
    };

    const onPanUp = () => {
      if (panRafId !== null) {
        cancelAnimationFrame(panRafId);
        updatePan();
      }
      setIsInteracting(false);
      window.removeEventListener('pointermove', onPanMove);
      window.removeEventListener('pointerup', onPanUp);
      window.removeEventListener('pointercancel', onPanUp);
    };

    window.addEventListener('pointermove', onPanMove, { passive: true });
    window.addEventListener('pointerup', onPanUp);
    window.addEventListener('pointercancel', onPanUp);
  };

  // Canvas Zoom Handler
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

  // Live Prompt Traveling Pipeline Execution
  const handleRunSwarmPipeline = () => {
    if (simulationPhase === 'running') return;

    setSimulationPhase('running');
    setActiveStage(1);
    setActiveTelemetryPayload({
      'node-ceo': `Directive: "${activeQueryPrompt.slice(0, 48)}..." dispatched`,
    });

    // Step 1 -> Step 2: Orchestrator queries DB Grounding
    setTimeout(() => {
      setActiveStage(2);
      setActiveTelemetryPayload((prev) => ({
        ...prev,
        'node-orchestrator': `Decomposed: Route "${ROUTE_INFO[currentRouteType].badge}". Querying Drive DB...`,
        'node-db': `Drive RAG: Loaded Bin-4B inventory (${simSurge}% surge context) & vendor contracts`,
      }));
    }, 900);

    // Step 2 -> Step 3: Concurrently Dispatches to Targeted Agents
    setTimeout(() => {
      setActiveStage(3);
      if (currentRouteType === 'full_surge_milp') {
        setActiveTelemetryPayload((prev) => ({
          ...prev,
          'node-sales': `Surge +${simSurge}%: Velocity ${sim.velocity} u/d. 7d Forecast: ${sim.forecast7d} u`,
          'node-inventory': `Stockout: ${sim.horizonDays} days! Net deficit: ${sim.deficitUnits} units needed`,
          'node-finance': `₹5.00L Statutory Lock confirmed. Upfront spend cap: ₹1.80L approved`,
        }));
      } else if (currentRouteType === 'treasury_audit') {
        setActiveTelemetryPayload((prev) => ({
          ...prev,
          'node-finance': `Audit Verified: ₹5.00L statutory lock active. Available cash cap: ₹1.80L`,
        }));
      } else if (currentRouteType === 'inventory_deficit') {
        setActiveTelemetryPayload((prev) => ({
          ...prev,
          'node-inventory': `Stockout Horizon: ${sim.horizonDays} days. Deficit: ${sim.deficitUnits} units`,
        }));
      } else if (currentRouteType === 'sales_velocity') {
        setActiveTelemetryPayload((prev) => ({
          ...prev,
          'node-sales': `Sales Velocity: ${sim.velocity} u/day under +${simSurge}% creator surge`,
        }));
      } else {
        setActiveTelemetryPayload((prev) => ({
          ...prev,
          'node-db': `Drive Catalog: Verified active models and inventory documents`,
        }));
      }
    }, 1900);

    // Step 3 -> Step 4: Dispatch to SciPy HiGHS Solver (if full surge) or return
    setTimeout(() => {
      setActiveStage(4);
      if (currentRouteType === 'full_surge_milp') {
        setActiveTelemetryPayload((prev) => ({
          ...prev,
          'node-solver': `HiGHS Solved (3.9ms): ${sim.supplierBUnits}u (Beta) + ${sim.supplierCUnits}u (Gamma) = ₹${sim.upfrontCash.toLocaleString()} (Feasible)`,
        }));
      }
    }, 2900);

    // Step 4 -> Step 5: Proof returned to Orchestrator -> Final Delivery to CEO
    setTimeout(() => {
      setActiveStage(5);
      setActiveTelemetryPayload((prev) => ({
        ...prev,
        'node-orchestrator': `Solution proof verified against statutory constraints. Delivering to Executive.`,
      }));
    }, 3800);

    // Completion
    setTimeout(() => {
      setSimulationPhase('complete');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 4600);
  };

  const handleApplyPreset = (prompt: string, surgeVal = 70) => {
    setActiveQueryPrompt(prompt);
    setSimSurge(surgeVal);
    setActiveStage(0);
    setSimulationPhase('idle');
    setActiveTelemetryPayload({});
  };

  const handleCustomPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPromptInput.trim()) return;
    setActiveQueryPrompt(customPromptInput.trim());
    setActiveStage(0);
    setSimulationPhase('idle');
    setActiveTelemetryPayload({});
    setCustomPromptInput('');
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAFC] dark:bg-[#0B0C0E] text-slate-900 dark:text-[#E3E3E3] font-sans overflow-hidden transition-colors duration-200">
      {/* Top Navigation & Route Status Header */}
      <header className="h-16 border-b border-slate-200 dark:border-[#2D2E30] bg-white/90 dark:bg-[#1E1F20]/90 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToLanding}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-[#888888] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2D2E30] transition-colors"
            title="Back to Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1A73E8] via-[#4285F4] to-[#A8C7FA] flex items-center justify-center shadow-md shadow-blue-500/20">
              <Network className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white font-headline">Swarm Studio</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-[#34A853]/15 text-emerald-700 dark:text-[#34A853] border border-emerald-300 dark:border-[#34A853]/30 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Dynamic Multi-Agent DAG</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#2D2E30] text-blue-600 dark:text-[#A8C7FA] font-mono border border-slate-200 dark:border-white/5">
                  {companyName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Active Query & Dynamic Pipeline Controls */}
        <div className="flex items-center space-x-3">
          {/* Active Route Badge */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#131314] border border-slate-200 dark:border-[#2D2E30] text-xs">
            <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span className="text-slate-500 dark:text-[#888888]">Routing:</span>
            <span className="font-semibold text-blue-600 dark:text-[#A8C7FA] truncate max-w-xs">
              {ROUTE_INFO[currentRouteType].badge}
            </span>
          </div>

          {/* Simulate Button */}
          <button
            onClick={handleRunSwarmPipeline}
            disabled={simulationPhase === 'running'}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1A73E8] via-[#4285F4] to-[#A855F7] text-white font-semibold text-xs flex items-center space-x-2 shadow-md shadow-blue-500/25 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${simulationPhase === 'running' ? 'animate-spin' : ''}`} />
            <span>
              {simulationPhase === 'running' ? `Stage ${activeStage}: Traveling...` : 'Simulate Swarm Travel'}
            </span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Switch to Chat */}
          <button
            onClick={onSwitchToChat}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#2A2B2D] hover:bg-slate-200 dark:hover:bg-[#35373A] text-slate-700 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-white text-xs font-medium flex items-center space-x-1.5 border border-slate-200 dark:border-[#3A3B3E]/60 transition-all cursor-pointer shadow-sm"
          >
            <Bot className="w-3.5 h-3.5 text-blue-500 dark:text-[#A8C7FA]" />
            <span>Executive Chat</span>
          </button>
        </div>
      </header>

      {/* Preset & Custom Prompt Bar */}
      <div className="bg-white/80 dark:bg-[#131314]/90 border-b border-slate-200 dark:border-[#2D2E30] px-4 py-2 flex flex-wrap items-center justify-between gap-2 z-20 backdrop-blur-sm">
        <div className="flex items-center space-x-2 overflow-x-auto py-0.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-[#888888] uppercase tracking-wider shrink-0">
            Presets:
          </span>
          <button
            onClick={() => handleApplyPreset(`Analyze ${primaryProduct} demand surge (+70%) & formulate split PO`, 70)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              currentRouteType === 'full_surge_milp'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-300 dark:border-blue-500/50 font-medium'
                : 'bg-slate-50 dark:bg-[#1E1F20] text-slate-600 dark:text-[#C4C7C5] border-slate-200 dark:border-[#2D2E30] hover:bg-slate-100 dark:hover:bg-[#282A2C]'
            }`}
          >
            🔥 +70% Surge & Split PO
          </button>
          <button
            onClick={() => handleApplyPreset(`Audit treasury liquidity, statutory reserve lock (₹5.00L) & spend ceiling`)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              currentRouteType === 'treasury_audit'
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/50 font-medium'
                : 'bg-slate-50 dark:bg-[#1E1F20] text-slate-600 dark:text-[#C4C7C5] border-slate-200 dark:border-[#2D2E30] hover:bg-slate-100 dark:hover:bg-[#282A2C]'
            }`}
          >
            🛡️ Treasury & Reserve Audit
          </button>
          <button
            onClick={() => handleApplyPreset(`Calculate exact stockout horizon for ${primaryProduct} warehouse stock`)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              currentRouteType === 'inventory_deficit'
                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-500/50 font-medium'
                : 'bg-slate-50 dark:bg-[#1E1F20] text-slate-600 dark:text-[#C4C7C5] border-slate-200 dark:border-[#2D2E30] hover:bg-slate-100 dark:hover:bg-[#282A2C]'
            }`}
          >
            📦 Inventory Stockout Risk
          </button>
          <button
            onClick={() => handleApplyPreset(`Forecast daily sales velocity and creator promo calendar for ${primaryProduct}`)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              currentRouteType === 'sales_velocity'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-300 dark:border-blue-500/50 font-medium'
                : 'bg-slate-50 dark:bg-[#1E1F20] text-slate-600 dark:text-[#C4C7C5] border-slate-200 dark:border-[#2D2E30] hover:bg-slate-100 dark:hover:bg-[#282A2C]'
            }`}
          >
            📈 Sales Velocity Forecast
          </button>
          <button
            onClick={() => handleApplyPreset(`List connected Google Drive database catalog & active vendor contracts`)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              currentRouteType === 'db_catalog'
                ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 border-purple-300 dark:border-purple-500/50 font-medium'
                : 'bg-slate-50 dark:bg-[#1E1F20] text-slate-600 dark:text-[#C4C7C5] border-slate-200 dark:border-[#2D2E30] hover:bg-slate-100 dark:hover:bg-[#282A2C]'
            }`}
          >
            📁 Drive DB Grounding
          </button>
        </div>

        {/* Custom Test Query Input */}
        <form onSubmit={handleCustomPromptSubmit} className="flex items-center space-x-1.5 flex-1 max-w-md ml-auto">
          <input
            type="text"
            placeholder="Type custom test prompt (e.g. audit cash, check stockout)..."
            value={customPromptInput}
            onChange={(e) => setCustomPromptInput(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-[#1E1F20] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#747775] text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2D2E30] focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs flex items-center space-x-1 shadow-sm transition-all"
          >
            <Send className="w-3 h-3" />
            <span>Apply</span>
          </button>
        </form>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Telemetry Panel */}
        <aside className="w-72 border-r border-slate-200 dark:border-[#2D2E30] bg-white/90 dark:bg-[#1E1F20]/70 backdrop-blur-md p-4 space-y-4 shrink-0 overflow-y-auto z-20 shadow-sm">
          <div>
            <h3 className="text-xs font-bold text-blue-600 dark:text-[#A8C7FA] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Telemetry & Surge Input</span>
              <Activity className="w-3.5 h-3.5 text-blue-500" />
            </h3>

            <div className="space-y-3 bg-slate-50 dark:bg-[#131314] p-3 rounded-2xl border border-slate-200 dark:border-[#2D2E30]">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-[#888888]">Demand Surge:</span>
                  <span className="text-blue-600 dark:text-[#4285F4] font-bold font-mono">+{simSurge}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={200}
                  step={5}
                  value={simSurge}
                  onChange={(e) => setSimSurge(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-[#2D2E30] rounded-lg appearance-none cursor-pointer accent-[#4285F4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200 dark:border-[#2D2E30]/60">
                <div>
                  <span className="text-slate-500 dark:text-[#888888] block">Order Velocity:</span>
                  <span className="text-slate-900 dark:text-white font-mono font-semibold">{sim.velocity} u/d</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-[#888888] block">Stockout Horizon:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono font-semibold">{sim.horizonDays} days</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-[#888888] block">Buffer Deficit:</span>
                  <span className="text-slate-900 dark:text-white font-mono font-semibold">{sim.deficitUnits} units</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-[#888888] block">Upfront Cash:</span>
                  <span className={`font-mono font-semibold ${sim.isFeasible ? 'text-emerald-600 dark:text-[#34A853]' : 'text-red-500'}`}>
                    ₹{sim.upfrontCash.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Route Step Progression */}
          <div>
            <h3 className="text-xs font-bold text-blue-600 dark:text-[#A8C7FA] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{ROUTE_INFO[currentRouteType].badge} Path</span>
              <GitBranch className="w-3.5 h-3.5 text-blue-500" />
            </h3>

            <div className="space-y-1.5 text-xs">
              {[
                { stage: 1, label: '1. Executive Dispatch', desc: 'Prompt routed to Orchestrator' },
                { stage: 2, label: '2. Drive DB Grounding', desc: 'Verify catalog & inventory records' },
                { stage: 3, label: '3. Targeted Agent Execution', desc: currentRouteType === 'full_surge_milp' ? 'Sales, Inventory & Treasury calculate' : 'Targeted sub-agent analyzes task' },
                { stage: 4, label: '4. Decision Formulation', desc: currentRouteType === 'full_surge_milp' ? 'SciPy HiGHS solves integer split' : 'Sub-agent formulates verified reply' },
                { stage: 5, label: '5. Verification & Delivery', desc: 'Orchestrator validates & delivers to CEO' },
              ].map((item) => (
                <div
                  key={item.stage}
                  className={`p-2 rounded-xl border transition-all ${
                    activeStage === item.stage
                      ? 'bg-blue-50 dark:bg-[#4285F4]/15 border-blue-400 dark:border-[#4285F4] text-slate-900 dark:text-white shadow-sm ring-1 ring-blue-400/30'
                      : activeStage > item.stage
                      ? 'bg-slate-50 dark:bg-[#131314] border-emerald-300 dark:border-[#34A853]/40 text-slate-700 dark:text-[#C4C7C5]'
                      : 'bg-slate-50 dark:bg-[#131314] border-slate-200 dark:border-[#2D2E30] text-slate-400 dark:text-[#888888]'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-[11px]">
                    <span>{item.label}</span>
                    {activeStage === item.stage && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    )}
                    {activeStage > item.stage && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-[#34A853]" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-[#888888]">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick RBAC Info */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#2D2E30] text-[11px] space-y-1">
            <div className="text-blue-600 dark:text-[#A8C7FA] font-semibold flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-[#34A853]" />
              <span>Authority: {authorityLevel}</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-[#888888] leading-relaxed">
              Drag nodes anywhere. Wires and animated packets dynamically track node positions in real-time.
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
              ? undefined
              : 'none',
          }}
        >
          {/* Canvas Dot Pattern via CSS class */}
          <div className="absolute inset-0 bg-canvas-dots pointer-events-none opacity-80" />

          {/* Canvas Zoom & Pan Controls */}
          <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 bg-white/90 dark:bg-[#1E1F20]/90 backdrop-blur-md border border-slate-200 dark:border-[#2D2E30] p-1.5 rounded-2xl shadow-lg">
            <button
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))}
              className="p-1.5 rounded-lg text-slate-600 dark:text-[#888888] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2D2E30]"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-blue-600 dark:text-[#A8C7FA] px-1 font-semibold">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
              className="p-1.5 rounded-lg text-slate-600 dark:text-[#888888] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2D2E30]"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetLayout}
              className="p-1.5 rounded-lg text-slate-600 dark:text-[#888888] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2D2E30] flex items-center space-x-1"
              title="Reset Agent Layout & View"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-[10px] font-medium hidden sm:inline">Reset Layout</span>
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
            {/* SVG Connecting Paths with Dynamic Anchoring & Animated Traveling Packets */}
            <svg className="absolute inset-0 w-[3000px] h-[1500px] pointer-events-none">
              <defs>
                <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4285F4" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#A855F7" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="dormantGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Render dynamic wires */}
              {dynamicWires.map((wire) => {
                const isWireRequired = wire.requiredForRoutes.includes(currentRouteType);
                const isWireActive = isWireRequired && activeStage >= wire.stageStep;
                const isWireTransmitting = isWireRequired && activeStage === wire.stageStep;
                const { path: pathD, midX, midY } = getDynamicWirePath(wire.sourceId, wire.targetId);

                if (!pathD) return null;

                return (
                  <g key={wire.id}>
                    {/* Outer Glow Halo for Active/Transmitting Wires */}
                    {isWireActive && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke={wire.color}
                        strokeWidth={isWireTransmitting ? '8' : '5'}
                        strokeOpacity={isWireTransmitting ? '0.25' : '0.12'}
                        strokeLinecap="round"
                      />
                    )}

                    {/* Main Connection Wire */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isWireActive ? wire.color : '#64748B'}
                      strokeWidth={isWireTransmitting ? '3.5' : isWireActive ? '2.5' : '1.5'}
                      strokeOpacity={isWireActive ? (isWireTransmitting ? 1.0 : 0.8) : 0.35}
                      strokeDasharray={isWireTransmitting ? '6 4' : 'none'}
                      strokeLinecap="round"
                      className={isWireTransmitting ? 'flow-wire-animated' : ''}
                    />

                    {/* Mid-wire Transmission Label Badge */}
                    {isWireTransmitting && !draggingNodeId && (
                      <g transform={`translate(${midX}, ${midY})`} className="pointer-events-none">
                        <rect
                          x="-70"
                          y="-11"
                          width="140"
                          height="22"
                          rx="11"
                          fill="rgba(15, 23, 42, 0.92)"
                          stroke={wire.color}
                          strokeWidth="1.5"
                        />
                        <text
                          x="0"
                          y="3.5"
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="9"
                          fontWeight="600"
                          fontFamily="sans-serif"
                        >
                          {wire.label.length > 22 ? wire.label.slice(0, 20) + '…' : wire.label}
                        </text>
                      </g>
                    )}

                    {/* PHYSICAL TRAVELING PACKET: Animated dot flowing along the exact bezier path (bypassed during drag for 120 FPS performance) */}
                    {isWireTransmitting && pathD && !draggingNodeId && (
                      <g>
                        <circle r="6" fill={wire.color} className="packet-glow">
                          <animateMotion
                            path={pathD}
                            dur="1.2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        {/* Secondary trailing particle */}
                        <circle r="3.5" fill="#FFFFFF" opacity="0.9">
                          <animateMotion
                            path={pathD}
                            dur="1.2s"
                            begin="0.15s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Dynamic Agent Node Cards with Connection Ports and Telemetry Bubbles */}
            {nodes.map((node) => {
              const isParticipating = participatingNodeIds.includes(node.id);
              const isNodeActive = activeStage === node.stageNum && isParticipating;
              const hasCompleted = activeStage > node.stageNum && isParticipating;
              const isDragging = draggingNodeId === node.id;
              const telemetry = activeTelemetryPayload[node.id];

              return (
                <div
                  key={node.id}
                  onPointerDown={(e) => handleNodePointerDown(node.id, e)}
                  style={{
                    transform: `translate(${node.x}px, ${node.y}px)`,
                    width: `${node.width}px`,
                    minHeight: `${node.height}px`,
                  }}
                  className={`node-card absolute rounded-3xl cursor-grab active:cursor-grabbing select-none ${
                    isDragging ? 'is-dragging shadow-2xl scale-[1.02]' : ''
                  } ${
                    !isParticipating
                      ? 'bg-slate-100/80 dark:bg-[#1E1F20]/50 border-dashed border-slate-300 dark:border-[#2D2E30] opacity-60'
                      : selectedNodeId === node.id
                      ? 'bg-white dark:bg-[#1E1F20] border-blue-500 ring-2 ring-blue-500/30 shadow-2xl scale-[1.01]'
                      : isNodeActive
                      ? `bg-white dark:bg-[#1E1F20] ${node.borderColor} ring-2 ring-blue-500/50 shadow-xl shadow-blue-500/20 animate-active-node`
                      : 'bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#2D2E30] hover:border-slate-300 dark:hover:border-[#3A3B3E] shadow-md hover:shadow-lg'
                  }`}
                >
                  {/* Left Connection Anchor Port */}
                  <div
                    className={`absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center pointer-events-none ${
                      isNodeActive
                        ? 'bg-blue-500 border-white shadow-md'
                        : isParticipating
                        ? 'bg-slate-300 dark:bg-[#2D2E30] border-white dark:border-[#1E1F20]'
                        : 'bg-slate-200 dark:bg-[#1E1F20] border-slate-400 opacity-40'
                    }`}
                    title="Input Port"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-400" />
                  </div>

                  {/* Right Connection Anchor Port */}
                  <div
                    className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center pointer-events-none ${
                      isNodeActive
                        ? 'bg-blue-500 border-white shadow-md'
                        : isParticipating
                        ? 'bg-slate-300 dark:bg-[#2D2E30] border-white dark:border-[#1E1F20]'
                        : 'bg-slate-200 dark:bg-[#1E1F20] border-slate-400 opacity-40'
                    }`}
                    title="Output Port"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-400" />
                  </div>

                  {/* Live Telemetry Floating Bubble */}
                  {telemetry && (
                    <div className="absolute -top-11 left-0 right-0 z-30 flex justify-center animate-bounce">
                      <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-semibold shadow-lg shadow-blue-500/30 flex items-center space-x-1.5 truncate max-w-full">
                        <Zap className="w-3 h-3 shrink-0 text-amber-300" />
                        <span className="truncate">{telemetry}</span>
                      </div>
                    </div>
                  )}

                  <div className="p-4 space-y-2.5">
                    {/* Node Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-8 h-8 rounded-xl ${node.iconBg} flex items-center justify-center`}>
                          <Bot className={`w-4 h-4 ${node.iconColor}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                              {node.title}
                            </h4>
                            {!isParticipating && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-[#2D2E30] text-slate-500 dark:text-[#888888] font-mono">
                                Standby
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-[#888888]">{node.department}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        {isNodeActive && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping mr-1" />
                        )}
                        {hasCompleted && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                        )}
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#131314] text-blue-600 dark:text-[#A8C7FA] font-mono border border-slate-200 dark:border-[#2D2E30]">
                          {node.latency}
                        </span>
                      </div>
                    </div>

                    {/* Role Description */}
                    <p className="text-[11px] text-slate-600 dark:text-[#C4C7C5] line-clamp-2 leading-relaxed">
                      {node.role}
                    </p>

                    {/* Model Info Badge */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#2D2E30]/70 text-[10px]">
                      <span className="text-slate-400 dark:text-[#888888]">Engine:</span>
                      <span className="text-blue-600 dark:text-[#A8C7FA] font-mono font-medium truncate max-w-[170px]">
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
          <aside className="w-80 border-l border-slate-200 dark:border-[#2D2E30] bg-white dark:bg-[#1E1F20] p-5 space-y-4 shrink-0 overflow-y-auto z-20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2D2E30] pb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-7 h-7 rounded-lg ${selectedNode.iconBg} flex items-center justify-center`}>
                  <Bot className={`w-4 h-4 ${selectedNode.iconColor}`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{selectedNode.title}</h4>
                  <span className="text-[10px] text-slate-500 dark:text-[#888888]">{selectedNode.department}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2D2E30]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 dark:text-[#888888] uppercase font-bold tracking-wider block mb-1">
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
                  className="w-full bg-slate-50 dark:bg-[#131314] text-xs text-slate-800 dark:text-white p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2E30] focus:outline-none focus:border-blue-500"
                >
                  {(AVAILABLE_MODELS_BY_TYPE[selectedNode.type] || [selectedNode.model]).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 dark:text-[#888888] uppercase font-bold tracking-wider block mb-1">
                  Operational Mission
                </label>
                <p className="text-xs text-slate-700 dark:text-[#D8D8D8] bg-slate-50 dark:bg-[#131314] p-3 rounded-xl border border-slate-200 dark:border-[#2D2E30] leading-relaxed">
                  {selectedNode.role}
                </p>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 dark:text-[#888888] uppercase font-bold tracking-wider block mb-1">
                  Grounded Knowledge Records
                </label>
                <div className="bg-slate-50 dark:bg-[#131314] p-3 rounded-xl border border-slate-200 dark:border-[#2D2E30] space-y-1 text-[11px] font-mono text-blue-600 dark:text-[#A8C7FA]">
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