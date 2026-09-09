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
  CheckCircle2,
  AlertTriangle,
  Flame,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
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
  RefreshCw,
  Send,
  Radio,
  Sliders,
  ChevronDown
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

export interface DynamicPipelineStep {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  color: string;
  stepType: 'dispatch' | 'decompose' | 'consult' | 'peer_consult' | 'solve' | 'deliver';
  sourceThought?: string;
  targetThought: string;
  telemetryBadge?: string;
}

export interface SwarmScenario {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  prompt: string;
  description: string;
  steps: DynamicPipelineStep[];
  participatingNodeIds: string[];
}

const AVAILABLE_MODELS_BY_TYPE: Record<string, string[]> = {
  orchestrator: ['Gemini 3.6 Flash (Default)', 'Gemini 3.8 Flash (Turbo)', 'Gemini 2.5 Pro', 'GPT-4o'],
  sales: ['Gemini 3.6 Flash (High-Throughput)', 'GPT-4o Mini', 'Gemini 3.8 Flash'],
  inventory: ['GPT-4o Mini (Tactical)', 'Gemini 3.6 Flash', 'Claude 3.5 Sonnet'],
  finance: ['Gemini 1.5 Pro (2M Context)', 'Gemini 2.5 Pro', 'GPT-4o (Audit)'],
  solver: ['SciPy HiGHS MILP Engine (Exact)', 'Google OR-Tools ILP v9.8', 'Nexus 3.1 Deep Think'],
  db: ['SQLite / Neon Postgres (SQLAlchemy)', 'Google Drive Cloud Docs API', 'Supabase Realtime'],
};

// Realistic Random Enterprise Directives (Unscripted & independent of hardcoded databases)
const RANDOM_ENTERPRISE_COMMANDS = [
  {
    prompt: 'Audit cross-border supplier tariffs and import duties across active vendor contracts.',
    scenarioType: 'dual_governance' as const,
  },
  {
    prompt: 'Formulate weekend flash-sale discount ceiling without degrading minimum gross margin.',
    scenarioType: 'single_sales' as const,
  },
  {
    prompt: 'Analyze critical component shortage on assembly line and negotiate expedited emergency supplier allocation.',
    scenarioType: 'emergency_stockout' as const,
  },
  {
    prompt: 'Stress-test 30-day corporate burn rate against worst-case creator promotional dropoff.',
    scenarioType: 'collab_surge_milp' as const,
  },
  {
    prompt: 'Evaluate automated warehouse robotics picking throughput and bin replenishment cycles.',
    scenarioType: 'emergency_stockout' as const,
  },
  {
    prompt: 'Model customer acquisition velocity vs fulfillment SLA guarantees for tier-1 distribution hubs.',
    scenarioType: 'single_sales' as const,
  }
];

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

  // Dynamic Initial Nodes formulated from company structure (Clean 5-tier architecture)
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
      x: 430,
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
      x: 880,
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
      x: 880,
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
      role: 'Ledger Audit & Spend Ceiling Guard',
      model: 'Gemini 1.5 Pro (2M Context)',
      department: 'Treasury & Compliance',
      modelProvider: 'Google',
      latency: '6.1ms',
      x: 880,
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
      id: 'node-db',
      type: 'db',
      title: 'Enterprise DB & Cloud Docs',
      subtitle: `${companyName} Data Store`,
      role: 'SQLAlchemy Persistence & Google Drive RAG',
      model: 'SQLite / Neon Postgres (SQLAlchemy)',
      department: 'Enterprise Data Layer',
      modelProvider: 'Neon',
      latency: '1.2ms',
      x: 880,
      y: 770,
      width: 300,
      height: 200,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500 dark:text-purple-400',
      borderColor: 'border-purple-500/50',
      accentGlow: 'rgba(168, 85, 247, 0.25)',
      stageNum: 2,
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
      x: 1310,
      y: 250,
      width: 320,
      height: 245,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500 dark:text-purple-400',
      borderColor: 'border-purple-500/60',
      accentGlow: 'rgba(168, 85, 247, 0.3)',
      stageNum: 4,
    },
  ], [userName, userRole, authorityLevel, companyName, primaryProduct]);

  // Comprehensive Scenarios showcasing True Agenting Workflow & Inter-Agent Peer Consultation
  const scenarios: SwarmScenario[] = useMemo(() => [
    {
      id: 'collab_surge_milp',
      title: 'Collaborative Swarm (Peer Consultation)',
      badge: 'Multi-Agent + Peer Consult',
      badgeColor: 'border-blue-400 bg-blue-500/10 text-blue-600 dark:text-[#A8C7FA]',
      prompt: `Analyze sudden demand surge (+70%) on ${primaryProduct}, consult inventory & finance covenants, and formulate optimal supplier PO split within liquidity cap.`,
      description: 'Executive directive flows to Orchestrator -> Sales -> Peer consults Inventory -> Peer consults Finance -> SciPy Solver proves optimal integer split -> Delivered to Executive.',
      participatingNodeIds: ['node-ceo', 'node-orchestrator', 'node-sales', 'node-inventory', 'node-finance', 'node-solver'],
      steps: [
        {
          id: 'step-1-ceo-to-orchestrator',
          sourceId: 'node-ceo',
          targetId: 'node-orchestrator',
          label: '1. Executive Directive Dispatch',
          color: '#4285F4',
          stepType: 'dispatch',
          sourceThought: 'Executive dispatched urgent growth & replenishment mandate.',
          targetThought: `Decomposing directive: Requires Sales surge forecast, Warehouse stock verification, and Statutory spend limits for ${primaryProduct}.`,
          telemetryBadge: 'Directive: Formulate surge PO split',
        },
        {
          id: 'step-2-orchestrator-to-sales',
          sourceId: 'node-orchestrator',
          targetId: 'node-sales',
          label: '2. Task: Sales Velocity Analytics',
          color: '#3B82F6',
          stepType: 'consult',
          sourceThought: 'Orchestrator delegating commercial analytics to Sales Agent.',
          targetThought: `Promo surge modeling complete: Daily velocity elevated to 145 u/d (+70%). 7-day projected demand = 1,015 units.`,
          telemetryBadge: 'Sales: Velocity 145 u/d (+70%)',
        },
        {
          id: 'step-3-sales-to-inventory-peer',
          sourceId: 'node-sales',
          targetId: 'node-inventory',
          label: '3. Peer Consult: Request Bin Stock',
          color: '#F59E0B',
          stepType: 'peer_consult',
          sourceThought: 'Sales Agent querying Supply Chain Agent for buffer stock...',
          targetThought: `Warehouse Bin-4B audited: 170 units on hand (Safety floor: 150u). Net deficit = 960 units urgently needed!`,
          telemetryBadge: 'Inventory: Net Deficit 960 units',
        },
        {
          id: 'step-4-inventory-to-finance-peer',
          sourceId: 'node-inventory',
          targetId: 'node-finance',
          label: '4. Peer Consult: Check Cash Ceiling',
          color: '#10B981',
          stepType: 'peer_consult',
          sourceThought: 'Inventory Agent consulting Treasury for maximum upfront cash disbursement...',
          targetThought: `Treasury covenant check: ₹5.00L statutory reserve locked. Upfront cash disbursement capped at ₹1.80L.`,
          telemetryBadge: 'Finance: ₹1.80L Spend Cap Approved',
        },
        {
          id: 'step-5-finance-to-solver',
          sourceId: 'node-finance',
          targetId: 'node-solver',
          label: '5. Submit Multi-Agent Constraints to MILP',
          color: '#A855F7',
          stepType: 'solve',
          sourceThought: 'Passing demand objective (1,015u), deficit constraint (960u), and ₹1.80L cash cap to Decision Solver.',
          targetThought: `SciPy HiGHS Solver: Min Cost s.t. 960u deficit & ₹1.80L cap -> Optimal: 160u (Beta) + 800u (Gamma) = ₹1,74,600. Solved in 3.9ms!`,
          telemetryBadge: 'HiGHS: 160u Beta + 800u Gamma (Feasible)',
        },
        {
          id: 'step-6-solver-to-orchestrator',
          sourceId: 'node-solver',
          targetId: 'node-orchestrator',
          label: '6. Mathematical Proof Verification',
          color: '#4285F4',
          stepType: 'solve',
          sourceThought: 'Transmitting exact integer solution proof to Swarm Orchestrator.',
          targetThought: `Proof verified against statutory liquidity reserve. Formatting executive synthesis brief.`,
          telemetryBadge: 'Orchestrator: Solution verified',
        },
        {
          id: 'step-7-orchestrator-to-ceo',
          sourceId: 'node-orchestrator',
          targetId: 'node-ceo',
          label: '7. Final Verified Brief Delivery',
          color: '#10B981',
          stepType: 'deliver',
          sourceThought: 'Delivering verified multi-agent procurement brief to Executive.',
          targetThought: `Executive Directive Fulfilled: Optimal 2-supplier PO split verified and ready for board dispatch.`,
          telemetryBadge: 'Executive: Brief Received & Verified',
        },
      ],
    },
    {
      id: 'single_sales',
      title: 'Single-Agent Direct Flow (Sales Only)',
      badge: 'Single-Agent Direct',
      badgeColor: 'border-blue-400 bg-blue-500/10 text-blue-600 dark:text-[#A8C7FA]',
      prompt: `Project quarterly regional sales run-rate and creator campaign velocity for ${primaryProduct}.`,
      description: 'Orchestrator identifies task only requires Commercial Sales Agent. Other agents remain idle with zero lines.',
      participatingNodeIds: ['node-ceo', 'node-orchestrator', 'node-sales', 'node-solver'],
      steps: [
        {
          id: 'step-1-ceo-to-orchestrator',
          sourceId: 'node-ceo',
          targetId: 'node-orchestrator',
          label: '1. Executive Directive Dispatch',
          color: '#4285F4',
          stepType: 'dispatch',
          targetThought: `Prompt decomposed: Commercial forecast inquiry. Routing directly to Sales Intelligence Agent.`,
          telemetryBadge: 'Executive: Sales velocity forecast requested',
        },
        {
          id: 'step-2-orchestrator-to-sales',
          sourceId: 'node-orchestrator',
          targetId: 'node-sales',
          label: '2. Direct Commercial Routing',
          color: '#3B82F6',
          stepType: 'consult',
          targetThought: `Sales velocity curve calculated: Projected quarterly run-rate = 4,200 units across regional tier-1 channels.`,
          telemetryBadge: 'Sales: 4,200 units quarterly forecast',
        },
        {
          id: 'step-3-sales-to-solver',
          sourceId: 'node-sales',
          targetId: 'node-solver',
          label: '3. Statistical Bounds Validation',
          color: '#A855F7',
          stepType: 'solve',
          targetThought: `Deterministic confidence interval computed: 95% certainty bounds [3,950u - 4,450u]. No constraint violations.`,
          telemetryBadge: 'Solver: Statistical confidence verified',
        },
        {
          id: 'step-4-solver-to-orchestrator',
          sourceId: 'node-solver',
          targetId: 'node-orchestrator',
          label: '4. Return Validated Commercial Forecast',
          color: '#4285F4',
          stepType: 'solve',
          targetThought: `Synthesizing executive commercial brief with confidence metrics.`,
          telemetryBadge: 'Orchestrator: Forecast approved',
        },
        {
          id: 'step-5-orchestrator-to-ceo',
          sourceId: 'node-orchestrator',
          targetId: 'node-ceo',
          label: '5. Deliver Executive Sales Report',
          color: '#10B981',
          stepType: 'deliver',
          targetThought: `Commercial report delivered to Executive: Projected revenue growth +32% YoY.`,
          telemetryBadge: 'Executive: Commercial report delivered',
        },
      ],
    },
    {
      id: 'dual_governance',
      title: 'Dual-Agent Governance (DB + Treasury)',
      badge: 'Dual-Agent Audit',
      badgeColor: 'border-emerald-400 bg-emerald-500/10 text-emerald-600 dark:text-[#34A853]',
      prompt: `Audit statutory liquidity covenants and SEBI reserve compliance against connected cloud records for ${companyName}.`,
      description: 'Orchestrator activates Enterprise DB and Treasury Agent. DB streams bank records directly to Treasury via peer consultation.',
      participatingNodeIds: ['node-ceo', 'node-orchestrator', 'node-db', 'node-finance', 'node-solver'],
      steps: [
        {
          id: 'step-1-ceo-to-orchestrator',
          sourceId: 'node-ceo',
          targetId: 'node-orchestrator',
          label: '1. Compliance Directive Dispatch',
          color: '#4285F4',
          stepType: 'dispatch',
          targetThought: `Decomposing directive: Requires cloud ledger extraction from DB and Treasury statutory audit.`,
          telemetryBadge: 'Executive: Statutory covenant audit initiated',
        },
        {
          id: 'step-2-orchestrator-to-db',
          sourceId: 'node-orchestrator',
          targetId: 'node-db',
          label: '2. Query Cloud Ledger & Escrow Records',
          color: '#10B981',
          stepType: 'consult',
          targetThought: `Google Drive RAG: Extracted verified bank statements, escrow balances, and statutory reserve agreements.`,
          telemetryBadge: 'DB: Escrow ledger extracted',
        },
        {
          id: 'step-3-db-to-finance-peer',
          sourceId: 'node-db',
          targetId: 'node-finance',
          label: '3. Peer Channel: Stream Records to Treasury',
          color: '#10B981',
          stepType: 'peer_consult',
          targetThought: `Auditing statutory accounts: ₹5.00L statutory lock confirmed 100% intact. Operational buffer = ₹1.80L.`,
          telemetryBadge: 'Finance: ₹5.00L Lock Confirmed',
        },
        {
          id: 'step-4-finance-to-solver',
          sourceId: 'node-finance',
          targetId: 'node-solver',
          label: '4. Prove Covenant Compliance',
          color: '#A855F7',
          stepType: 'solve',
          targetThought: `HiGHS Solver verified: 0 covenant violations. Solvency coverage ratio = 2.45x (exceeds SEBI statutory threshold).`,
          telemetryBadge: 'Solver: Solvency ratio 2.45x compliant',
        },
        {
          id: 'step-5-solver-to-orchestrator',
          sourceId: 'node-solver',
          targetId: 'node-orchestrator',
          label: '5. Compliance Certificate Delivered',
          color: '#4285F4',
          stepType: 'solve',
          targetThought: `Audit verification complete. Assembling formal governance certificate.`,
          telemetryBadge: 'Orchestrator: Audit certificate approved',
        },
        {
          id: 'step-6-orchestrator-to-ceo',
          sourceId: 'node-orchestrator',
          targetId: 'node-ceo',
          label: '6. Deliver Governance Brief',
          color: '#10B981',
          stepType: 'deliver',
          targetThought: `Governance certification delivered to Executive. Company in 100% regulatory compliance.`,
          telemetryBadge: 'Executive: Compliance certified',
        },
      ],
    },
    {
      id: 'emergency_stockout',
      title: 'Emergency Stockout (Inventory ↔ Finance)',
      badge: 'Emergency Mitigation',
      badgeColor: 'border-amber-400 bg-amber-500/10 text-amber-600 dark:text-amber-400',
      prompt: `Warehouse safety stock floor breached for ${primaryProduct}. Formulate emergency restocking authorization.`,
      description: 'Inventory Agent detects critical safety stock breach, peer-consults Finance Agent for emergency PO funding.',
      participatingNodeIds: ['node-ceo', 'node-orchestrator', 'node-inventory', 'node-finance', 'node-solver'],
      steps: [
        {
          id: 'step-1-ceo-to-orchestrator',
          sourceId: 'node-ceo',
          targetId: 'node-orchestrator',
          label: '1. Emergency Directive Dispatch',
          color: '#4285F4',
          stepType: 'dispatch',
          targetThought: `Emergency stockout directive received. Routing priority task to Supply Chain & Inventory Agent.`,
          telemetryBadge: 'Executive: Stockout emergency declared',
        },
        {
          id: 'step-2-orchestrator-to-inventory',
          sourceId: 'node-orchestrator',
          targetId: 'node-inventory',
          label: '2. Task: Audit Safety Stock Floor',
          color: '#F59E0B',
          stepType: 'consult',
          targetThought: `Critical stock alert: Stock dropped below 150u threshold (Current: 170u). Stockout horizon is under 3.5 hours!`,
          telemetryBadge: 'Inventory: Stockout in 3.5 hours!',
        },
        {
          id: 'step-3-inventory-to-finance-peer',
          sourceId: 'node-inventory',
          targetId: 'node-finance',
          label: '3. Peer Consult: Request Emergency PO Budget',
          color: '#10B981',
          stepType: 'peer_consult',
          targetThought: `Emergency PO funding evaluated: Authorized expedited emergency tranche of ₹1.25L from operational reserves.`,
          telemetryBadge: 'Finance: Authorized emergency ₹1.25L',
        },
        {
          id: 'step-4-finance-to-solver',
          sourceId: 'node-finance',
          targetId: 'node-solver',
          label: '4. Solve Minimum Lead Time Restock',
          color: '#A855F7',
          stepType: 'solve',
          targetThought: `HiGHS Solved: 300 units from Supplier Beta (3-day delivery). Total cost = ₹1.19L. Lead time minimized!`,
          telemetryBadge: 'Solver: 300u expedited via Beta',
        },
        {
          id: 'step-5-solver-to-orchestrator',
          sourceId: 'node-solver',
          targetId: 'node-orchestrator',
          label: '5. Emergency Mitigation Proof',
          color: '#4285F4',
          stepType: 'solve',
          targetThought: `Restocking allocation feasible. Packaging immediate action dispatch.`,
          telemetryBadge: 'Orchestrator: Mitigation plan proved',
        },
        {
          id: 'step-6-orchestrator-to-ceo',
          sourceId: 'node-orchestrator',
          targetId: 'node-ceo',
          label: '6. Emergency Action Plan Delivered',
          color: '#10B981',
          stepType: 'deliver',
          targetThought: `Emergency PO split authorized. Expedited restock order dispatched to supplier.`,
          telemetryBadge: 'Executive: Emergency PO authorized',
        },
      ],
    },
  ], [companyName, primaryProduct, userName, userRole]);

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

  // Dynamic Pipeline Simulation State
  const [currentScenario, setCurrentScenario] = useState<SwarmScenario>(scenarios[0]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1); // -1 = Idle, not started
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [customPromptInput, setCustomPromptInput] = useState<string>('');

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const wheelTimerRef = useRef<any>(null);

  // Active step in the running pipeline
  const currentStep = useMemo(() => {
    if (activeStepIndex >= 0 && activeStepIndex < currentScenario.steps.length) {
      return currentScenario.steps[activeStepIndex];
    }
    return null;
  }, [activeStepIndex, currentScenario]);

  // Node lookup map for O(1) wire coordinate calculations
  const nodeMap = useMemo(() => {
    const map = new Map<string, NodeData>();
    for (const node of nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [nodes]);

  // Completed nodes in current run
  const completedNodeIds = useMemo(() => {
    const set = new Set<string>();
    if (activeStepIndex <= 0) return set;
    const limit = Math.min(activeStepIndex, currentScenario.steps.length);
    for (let i = 0; i < limit; i++) {
      set.add(currentScenario.steps[i].sourceId);
      set.add(currentScenario.steps[i].targetId);
    }
    return set;
  }, [activeStepIndex, currentScenario]);

  // Active real-time thoughts per node
  const activeThoughts = useMemo(() => {
    const map: Record<string, string> = {};
    if (currentStep) {
      map[currentStep.targetId] = currentStep.targetThought;
      if (currentStep.sourceThought) {
        map[currentStep.sourceId] = currentStep.sourceThought;
      }
    }
    return map;
  }, [currentStep]);

  // Active telemetry labels for finished hops
  const activeTelemetry = useMemo(() => {
    const map: Record<string, string> = {};
    const limit = Math.min(activeStepIndex, currentScenario.steps.length - 1);
    for (let i = 0; i <= limit; i++) {
      const step = currentScenario.steps[i];
      if (step.telemetryBadge) {
        map[step.targetId] = step.telemetryBadge;
      }
    }
    return map;
  }, [activeStepIndex, currentScenario]);

  // Auto-play timer loop for smooth animated step progression
  useEffect(() => {
    if (!isPlaying) return;

    if (activeStepIndex >= currentScenario.steps.length) {
      setIsPlaying(false);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      return;
    }

    const duration = Math.round(1800 / playbackSpeed);
    const timer = setTimeout(() => {
      setActiveStepIndex((prev) => {
        const next = prev + 1;
        if (next >= currentScenario.steps.length) {
          setIsPlaying(false);
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        return next;
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [isPlaying, activeStepIndex, currentScenario, playbackSpeed]);

  // Auto-trigger simulation if navigated from Executive Chat
  useEffect(() => {
    const shouldTrigger = localStorage.getItem('nexus_trigger_swarm_sim');
    const savedPrompt = localStorage.getItem('nexus_active_prompt');
    if (savedPrompt) {
      handleApplyCustomPrompt(savedPrompt);
    }
    if (shouldTrigger === 'true') {
      localStorage.removeItem('nexus_trigger_swarm_sim');
      setActiveStepIndex(0);
      setIsPlaying(true);
    }
  }, [activeView]);

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
      // S is clearly to the left of T (Forward flow)
      p1x = sRight;
      p2x = tLeft;
      const dx = p2x - p1x;
      const curvature = Math.max(40, Math.min(180, dx * 0.45));
      cx1 = p1x + curvature;
      cx2 = p2x - curvature;
    } else if (tRight + 20 <= sLeft) {
      // T is clearly to the left of S (Reversed flow)
      p1x = sLeft;
      p2x = tRight;
      const dx = p1x - p2x;
      const curvature = Math.max(40, Math.min(180, dx * 0.45));
      cx1 = p1x - curvature;
      cx2 = p2x + curvature;
    } else {
      // Overlapping or vertically stacked (Peer-to-peer vertical consultation flow!)
      const sCenterX = s.x + s.width / 2;
      const tCenterX = t.x + t.width / 2;

      if (sCenterX <= tCenterX) {
        // Loop on the outer right flank
        p1x = sRight;
        p2x = tRight;
        const curvature = 75;
        cx1 = Math.max(p1x, p2x) + curvature;
        cx2 = Math.max(p1x, p2x) + curvature;
      } else {
        // Loop on the outer left flank
        p1x = sLeft;
        p2x = tLeft;
        const curvature = 75;
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

  // Simulation Playback Controls
  const handleTogglePlay = () => {
    if (activeStepIndex < 0 || activeStepIndex >= currentScenario.steps.length) {
      setActiveStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    setActiveStepIndex((prev) => {
      const next = prev + 1;
      if (next >= currentScenario.steps.length) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        return currentScenario.steps.length;
      }
      return next;
    });
  };

  const handleRestart = () => {
    setActiveStepIndex(0);
    setIsPlaying(true);
  };

  const handleResetSimulation = () => {
    setActiveStepIndex(-1);
    setIsPlaying(false);
  };

  const handleSelectScenario = (scenario: SwarmScenario) => {
    setCurrentScenario(scenario);
    setActiveStepIndex(0);
    setIsPlaying(true);
  };

  // Random Unscripted Enterprise Directive Generator
  const handleTriggerRandomDirective = () => {
    const randomCmd = RANDOM_ENTERPRISE_COMMANDS[Math.floor(Math.random() * RANDOM_ENTERPRISE_COMMANDS.length)];
    const base = scenarios.find((s) => s.id === randomCmd.scenarioType) || scenarios[0];
    const dynamicScenario: SwarmScenario = {
      ...base,
      id: `random-${Date.now()}`,
      title: 'Dynamic Directive',
      prompt: randomCmd.prompt,
      steps: base.steps.map((step, idx) => {
        if (idx === 0) {
          return {
            ...step,
            sourceThought: `Executive dispatched unscripted directive: "${randomCmd.prompt.slice(0, 48)}..."`,
            targetThought: `Orchestrator decomposing: "${randomCmd.prompt.slice(0, 52)}..."`,
            telemetryBadge: `Directive: "${randomCmd.prompt.slice(0, 24)}..."`,
          };
        }
        return step;
      }),
    };

    setCurrentScenario(dynamicScenario);
    setActiveStepIndex(0);
    setIsPlaying(true);
  };

  // Custom User Prompt Dispatcher
  const handleApplyCustomPrompt = (prompt: string) => {
    const lower = prompt.toLowerCase();
    let targetScenarioId = 'collab_surge_milp';
    if (
      lower.includes('covenant') ||
      lower.includes('reserve') ||
      lower.includes('treasury') ||
      lower.includes('sebi') ||
      lower.includes('compliance') ||
      lower.includes('audit')
    ) {
      targetScenarioId = 'dual_governance';
    } else if (
      lower.includes('stockout') ||
      lower.includes('shortage') ||
      lower.includes('emergency') ||
      lower.includes('warehouse')
    ) {
      targetScenarioId = 'emergency_stockout';
    } else if (
      lower.includes('sales') ||
      lower.includes('velocity') ||
      lower.includes('promo') ||
      lower.includes('roi') ||
      lower.includes('revenue')
    ) {
      targetScenarioId = 'single_sales';
    }

    const base = scenarios.find((s) => s.id === targetScenarioId) || scenarios[0];
    const customScenario: SwarmScenario = {
      ...base,
      id: `custom-${Date.now()}`,
      title: `Custom Directive`,
      prompt: prompt,
      steps: base.steps.map((step, idx) => {
        if (idx === 0) {
          return {
            ...step,
            sourceThought: `Executive dispatched custom directive: "${prompt.slice(0, 48)}..."`,
            targetThought: `Orchestrator decomposing: "${prompt.slice(0, 52)}..."`,
            telemetryBadge: `Directive: "${prompt.slice(0, 24)}..."`,
          };
        }
        return step;
      }),
    };

    setCurrentScenario(customScenario);
    setActiveStepIndex(0);
    setIsPlaying(true);
  };

  const handleCustomPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPromptInput.trim()) return;
    handleApplyCustomPrompt(customPromptInput.trim());
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
                  <span>Dynamic Agenting DAG</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#2D2E30] text-blue-600 dark:text-[#A8C7FA] font-mono border border-slate-200 dark:border-white/5">
                  {companyName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Active Query & Dynamic Pipeline Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Active Route Badge */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#131314] border border-slate-200 dark:border-[#2D2E30] text-xs">
            <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span className="text-slate-500 dark:text-[#888888]">Mode:</span>
            <span className="font-semibold text-blue-600 dark:text-[#A8C7FA] truncate max-w-xs">
              {currentScenario.badge}
            </span>
          </div>

          {/* Primary Play/Pause Button */}
          <button
            onClick={handleTogglePlay}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1A73E8] via-[#4285F4] to-[#A855F7] text-white font-semibold text-xs flex items-center space-x-2 shadow-md shadow-blue-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>
              {isPlaying
                ? `Step ${activeStepIndex + 1}/${currentScenario.steps.length}: Traveling...`
                : activeStepIndex >= 0 && activeStepIndex < currentScenario.steps.length
                ? 'Resume Workflow'
                : 'Simulate Swarm Travel'}
            </span>
          </button>

          {/* Next Step Manual Advance */}
          <button
            onClick={handleNextStep}
            disabled={activeStepIndex >= currentScenario.steps.length}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#2A2B2D] hover:bg-slate-200 dark:hover:bg-[#35373A] text-slate-700 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center space-x-1.5 border border-slate-200 dark:border-[#3A3B3E]/60 transition-all cursor-pointer disabled:opacity-40"
            title="Advance One Step Manually"
          >
            <SkipForward className="w-3.5 h-3.5 text-blue-500 dark:text-[#A8C7FA]" />
            <span className="hidden sm:inline">Step Next</span>
          </button>

          {/* Restart Button */}
          <button
            onClick={handleRestart}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#2A2B2D] hover:bg-slate-200 dark:hover:bg-[#35373A] text-slate-600 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#3A3B3E]/60 transition-all cursor-pointer"
            title="Restart Active Scenario"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Switch to Chat */}
          <button
            onClick={onSwitchToChat}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#2A2B2D] hover:bg-slate-200 dark:hover:bg-[#35373A] text-slate-700 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-white text-xs font-medium flex items-center space-x-1.5 border border-slate-200 dark:border-[#3A3B3E]/60 transition-all cursor-pointer shadow-sm"
          >
            <Bot className="w-3.5 h-3.5 text-blue-500 dark:text-[#A8C7FA]" />
            <span className="hidden md:inline">Executive Chat</span>
          </button>
        </div>
      </header>

      {/* Dynamic Scenario Bar + Random Directive + Custom Test Query Input */}
      <div className="bg-white/80 dark:bg-[#131314]/90 border-b border-slate-200 dark:border-[#2D2E30] px-4 py-2 flex flex-wrap items-center justify-between gap-2 z-20 backdrop-blur-sm">
        <div className="flex items-center space-x-2 overflow-x-auto py-0.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-[#888888] uppercase tracking-wider shrink-0">
            Scenarios:
          </span>

          {scenarios.map((sc) => {
            const isSelected = currentScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? `${sc.badgeColor} font-semibold shadow-sm`
                    : 'bg-slate-50 dark:bg-[#1E1F20] text-slate-600 dark:text-[#C4C7C5] border-slate-200 dark:border-[#2D2E30] hover:bg-slate-100 dark:hover:bg-[#282A2C]'
                }`}
              >
                {sc.title}
              </button>
            );
          })}

          {/* Random Enterprise Directive Generator */}
          <button
            onClick={handleTriggerRandomDirective}
            className="text-xs px-2.5 py-1 rounded-lg border border-purple-300 dark:border-purple-500/50 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-100 font-medium transition-all cursor-pointer flex items-center space-x-1 shrink-0"
            title="Simulate Random Real-World Enterprise Directive"
          >
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span>🎲 Random Directive</span>
          </button>
        </div>

        {/* Custom Test Query Input */}
        <form onSubmit={handleCustomPromptSubmit} className="flex items-center space-x-1.5 flex-1 max-w-md ml-auto">
          <input
            type="text"
            placeholder="Type any custom executive directive..."
            value={customPromptInput}
            onChange={(e) => setCustomPromptInput(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-[#1E1F20] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#747775] text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2D2E30] focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs flex items-center space-x-1 shadow-sm transition-all"
          >
            <Send className="w-3 h-3" />
            <span>Dispatch</span>
          </button>
        </form>
      </div>

      {/* Main Studio Canvas Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Telemetry & Step Progression Panel */}
        <aside className="w-72 border-r border-slate-200 dark:border-[#2D2E30] bg-white/90 dark:bg-[#1E1F20]/70 backdrop-blur-md p-4 space-y-4 shrink-0 overflow-y-auto z-20 shadow-sm">
          {/* Active Directive Info */}
          <div>
            <h3 className="text-xs font-bold text-blue-600 dark:text-[#A8C7FA] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Executive Directive</span>
              <Activity className="w-3.5 h-3.5 text-blue-500" />
            </h3>

            <div className="p-3 bg-slate-50 dark:bg-[#131314] rounded-2xl border border-slate-200 dark:border-[#2D2E30] text-xs space-y-2">
              <div className="text-slate-900 dark:text-white font-medium leading-relaxed">
                "{currentScenario.prompt}"
              </div>
              <div className="text-[10.5px] text-slate-500 dark:text-[#888888] pt-1 border-t border-slate-200 dark:border-[#2D2E30]">
                {currentScenario.description}
              </div>
            </div>
          </div>

          {/* Dynamic Live Step Progression */}
          <div>
            <h3 className="text-xs font-bold text-blue-600 dark:text-[#A8C7FA] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Dynamic Pipeline Path</span>
              <GitBranch className="w-3.5 h-3.5 text-blue-500" />
            </h3>

            <div className="space-y-1.5 text-xs">
              {currentScenario.steps.map((step, idx) => {
                const isStepActive = activeStepIndex === idx;
                const isStepDone = activeStepIndex > idx;
                const isPeerConsult = step.stepType === 'peer_consult';

                return (
                  <div
                    key={step.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isStepActive
                        ? isPeerConsult
                          ? 'bg-purple-50 dark:bg-purple-900/25 border-purple-400 dark:border-purple-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-purple-400/40'
                          : 'bg-blue-50 dark:bg-[#4285F4]/15 border-blue-400 dark:border-[#4285F4] text-slate-900 dark:text-white shadow-sm ring-1 ring-blue-400/30'
                        : isStepDone
                        ? 'bg-slate-50 dark:bg-[#131314] border-emerald-300 dark:border-[#34A853]/40 text-slate-700 dark:text-[#C4C7C5]'
                        : 'bg-slate-50 dark:bg-[#131314] border-slate-200 dark:border-[#2D2E30] text-slate-400 dark:text-[#888888] opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-[11px]">
                      <span className="flex items-center space-x-1.5">
                        {isPeerConsult && (
                          <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                        )}
                        <span>{step.label}</span>
                      </span>
                      {isStepActive && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                      )}
                      {isStepDone && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-[#34A853]" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-[#888888] mt-0.5 line-clamp-2">
                      {step.targetThought}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multi-Agent Network Statistics */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#2D2E30] text-[11px] space-y-1.5">
            <div className="text-blue-600 dark:text-[#A8C7FA] font-semibold flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-[#34A853]" />
              <span>Authority: {authorityLevel}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-[#888888] pt-1 border-t border-slate-200 dark:border-[#2D2E30]">
              <div>
                <span>Active Nodes:</span>
                <span className="block font-mono text-slate-900 dark:text-white font-semibold">
                  {currentScenario.participatingNodeIds.length} / 7
                </span>
              </div>
              <div>
                <span>Peer Channels:</span>
                <span className="block font-mono text-purple-600 dark:text-purple-400 font-semibold">
                  {currentScenario.steps.filter((s) => s.stepType === 'peer_consult').length} Active
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Dynamic Interactive Canvas */}
        <div
          ref={canvasContainerRef}
          onPointerDown={handleCanvasPointerDown}
          onWheel={handleWheel}
          className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
          style={{
            backgroundImage: showGrid ? undefined : 'none',
          }}
        >
          {/* Canvas Dot Pattern via CSS class */}
          <div className="absolute inset-0 bg-canvas-dots pointer-events-none opacity-80" />

          {/* Active Flow Notification Pill at top center */}
          {activeStepIndex >= 0 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <div className="px-4 py-2 rounded-2xl bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-md border border-blue-400/40 dark:border-blue-500/40 shadow-xl flex items-center space-x-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  Step {activeStepIndex + 1}/{currentScenario.steps.length}:
                </span>
                <span className="text-blue-600 dark:text-[#A8C7FA] font-medium">
                  {currentStep ? currentStep.label : 'Workflow Completed'}
                </span>
              </div>
            </div>
          )}

          {/* Canvas Zoom & Layout Controls */}
          <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 bg-white/90 dark:bg-[#1E1F20]/90 backdrop-blur-md border border-slate-200 dark:border-[#2D2E30] p-1.5 rounded-2xl shadow-lg">
            <button
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))}
              className="p-1.5 rounded-lg text-slate-600 dark:text-[#888888] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2D2E30]"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-blue-600 dark:text-[#A8C7FA] px-1 font-semibold">
              {Math.round(zoom * 100)}%
            </span>
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
            {/* NO DORMANT SPIDERWEBS! ONLY RENDER ACTIVE & COMPLETED WIRES */}
            <svg className="absolute inset-0 w-[3000px] h-[1500px] pointer-events-none">
              <defs>
                <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4285F4" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#A855F7" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Dynamically render ONLY active and completed wires for current scenario */}
              {currentScenario.steps.map((step, idx) => {
                const isCompleted = activeStepIndex > idx;
                const isTransmitting = activeStepIndex === idx;

                // Do not render wires that have not been reached yet!
                if (!isCompleted && !isTransmitting) return null;

                const { path: pathD, midX, midY } = getDynamicWirePath(step.sourceId, step.targetId);
                if (!pathD) return null;

                const isPeerConsult = step.stepType === 'peer_consult';

                return (
                  <g key={step.id}>
                    {/* Outer Glow Halo for Active Transmitting Wires */}
                    {isTransmitting && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke={step.color}
                        strokeWidth={isPeerConsult ? '10' : '8'}
                        strokeOpacity="0.28"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Main Connection Wire */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={step.color}
                      strokeWidth={isTransmitting ? '3.5' : '2.5'}
                      strokeOpacity={isTransmitting ? 1.0 : 0.75}
                      strokeDasharray={isTransmitting ? '6 4' : isPeerConsult ? '5 3' : 'none'}
                      strokeLinecap="round"
                      className={isTransmitting ? 'flow-wire-animated' : ''}
                    />

                    {/* Mid-wire Transmission Label Badge */}
                    {isTransmitting && !draggingNodeId && (
                      <g transform={`translate(${midX}, ${midY})`} className="pointer-events-none">
                        <rect
                          x={-Math.min(190, step.label.length * 4.4 + 24) / 2}
                          y="-12"
                          width={Math.min(190, step.label.length * 4.4 + 24)}
                          height="24"
                          rx="12"
                          fill="rgba(15, 23, 42, 0.95)"
                          stroke={step.color}
                          strokeWidth="1.5"
                          className="shadow-xl"
                        />
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="9.5"
                          fontWeight="600"
                          fontFamily="sans-serif"
                        >
                          {step.label}
                        </text>
                      </g>
                    )}

                    {/* PHYSICAL TRAVELING PACKET: Animated dot flowing along the exact bezier path */}
                    {isTransmitting && pathD && !draggingNodeId && (
                      <g>
                        <circle r={isPeerConsult ? '7' : '6'} fill={step.color} className="packet-glow">
                          <animateMotion
                            path={pathD}
                            dur="1.1s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        {/* Secondary trailing particle */}
                        <circle r="3.5" fill="#FFFFFF" opacity="0.95">
                          <animateMotion
                            path={pathD}
                            dur="1.1s"
                            begin="0.12s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Dynamic Agent Node Cards with Connection Ports, Live Thought Bubbles & Telemetry */}
            {nodes.map((node) => {
              const isParticipating = currentScenario.participatingNodeIds.includes(node.id);
              const isTargetOfActive = currentStep?.targetId === node.id;
              const isSourceOfActive = currentStep?.sourceId === node.id;
              const isPeerConsulting = isSourceOfActive && currentStep?.stepType === 'peer_consult';
              const hasCompleted = completedNodeIds.has(node.id) && !isTargetOfActive;
              const isDragging = draggingNodeId === node.id;
              const liveThought = activeThoughts[node.id];
              const telemetry = activeTelemetry[node.id];

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
                      ? 'bg-slate-100/70 dark:bg-[#1E1F20]/40 border-dashed border-slate-300 dark:border-[#2D2E30] opacity-50'
                      : isTargetOfActive
                      ? `bg-white dark:bg-[#1E1F20] ${node.borderColor} ring-2 ring-blue-500 shadow-2xl shadow-blue-500/30 scale-[1.01] animate-active-node`
                      : isPeerConsulting
                      ? 'bg-white dark:bg-[#1E1F20] border-purple-500 ring-2 ring-purple-500/40 shadow-xl shadow-purple-500/20'
                      : hasCompleted
                      ? 'bg-white dark:bg-[#1E1F20] border-emerald-400 dark:border-emerald-500/60 shadow-md ring-1 ring-emerald-400/20'
                      : selectedNodeId === node.id
                      ? 'bg-white dark:bg-[#1E1F20] border-blue-500 ring-2 ring-blue-500/30 shadow-xl'
                      : 'bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#2D2E30] hover:border-slate-300 dark:hover:border-[#3A3B3E] shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Left Connection Anchor Port */}
                  <div
                    className={`absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center pointer-events-none ${
                      isTargetOfActive
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
                      isTargetOfActive || isPeerConsulting
                        ? 'bg-blue-500 border-white shadow-md'
                        : isParticipating
                        ? 'bg-slate-300 dark:bg-[#2D2E30] border-white dark:border-[#1E1F20]'
                        : 'bg-slate-200 dark:bg-[#1E1F20] border-slate-400 opacity-40'
                    }`}
                    title="Output Port"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-400" />
                  </div>

                  {/* Live Thought Floating Bubble */}
                  {liveThought && (
                    <div className="absolute -top-12 left-0 right-0 z-30 flex justify-center animate-bounce">
                      <div
                        className={`px-3 py-1.5 rounded-xl text-white text-[10.5px] font-semibold shadow-xl flex items-center space-x-1.5 truncate max-w-[95%] ${
                          isPeerConsulting
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-500/30'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30'
                        }`}
                      >
                        <Zap className="w-3 h-3 shrink-0 text-amber-300 animate-pulse" />
                        <span className="truncate">{liveThought}</span>
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
                        {isTargetOfActive && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-semibold flex items-center space-x-1 border border-blue-300 dark:border-blue-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                            <span>Thinking...</span>
                          </span>
                        )}
                        {isPeerConsulting && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-semibold border border-purple-300 dark:border-purple-500/40">
                            Consulting
                          </span>
                        )}
                        {hasCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-[#34A853]" />
                        )}
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#131314] text-blue-600 dark:text-[#A8C7FA] font-mono border border-slate-200 dark:border-[#2D2E30]">
                          {node.latency}
                        </span>
                      </div>
                    </div>

                    {/* Telemetry Result Banner if Completed */}
                    {telemetry && (
                      <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#2D2E30] text-[10.5px] font-mono text-emerald-600 dark:text-[#81C995] flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{telemetry}</span>
                      </div>
                    )}

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
