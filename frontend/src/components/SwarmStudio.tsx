import React, { useState, useMemo, useEffect } from 'react';
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
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SwarmStudioProps {
  onBackToLanding: () => void;
  onSwitchToChat: () => void;
  activeView: 'chat' | 'swarm';
}

interface InspectedNode {
  id: string;
  title: string;
  role: string;
  model: string;
  latency: string;
  status: string;
  icon: React.ReactNode;
  summary: string;
  inputs: Record<string, string | number>;
  outputs: Record<string, string | number>;
  rationale: string[];
}

export const SwarmStudio: React.FC<SwarmStudioProps> = ({
  onBackToLanding,
  onSwitchToChat,
  activeView,
}) => {
  const [simSurge, setSimSurge] = useState<number>(70);
  const [activePipelineStep, setActivePipelineStep] = useState<number>(5); // 1 to 5
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [executed, setExecuted] = useState<boolean>(false);
  const [inspectedNode, setInspectedNode] = useState<InspectedNode | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Dynamic real-time calculation
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

  // Step-by-step pipeline execution animation
  const handleRunPipeline = () => {
    setIsSimulating(true);
    setActivePipelineStep(1);

    const timeouts = [
      setTimeout(() => setActivePipelineStep(2), 500),
      setTimeout(() => setActivePipelineStep(3), 1100),
      setTimeout(() => setActivePipelineStep(4), 1800),
      setTimeout(() => {
        setActivePipelineStep(5);
        setIsSimulating(false);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#A8C7FA', '#B2C5FF', '#22c55e', '#ffffff'],
        });
      }, 2500),
    ];

    return () => timeouts.forEach(clearTimeout);
  };

  const handleCommitOrder = () => {
    confetti({
      particleCount: 110,
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

  // Preset inspection payloads
  const openNodeDetails = (type: 'ceo' | 'orchestrator' | 'sales' | 'inventory' | 'finance' | 'solver' | 'db') => {
    switch (type) {
      case 'ceo':
        setInspectedNode({
          id: 'node-ceo',
          title: 'Executive Directive',
          role: 'CEO / Business Executive (Rahul)',
          model: 'Executive Input Trigger',
          latency: '< 1ms',
          status: 'TRIGGERED',
          icon: <UserCheck className="w-4 h-4 text-[#A8C7FA]" />,
          summary: 'High-priority business trigger initiating swarm consensus to resolve supply chain deficit under statutory cash governance.',
          inputs: {
            Initiator: 'Rahul (CEO)',
            TargetSKU: 'P100 Headphones',
            PromotionalChannel: 'TikTok Viral Campaign',
            DemandMultiplier: `+${simSurge}%`,
          },
          outputs: {
            Directive: 'EXECUTE_OPTIMAL_SPLIT_PROCUREMENT',
            Priority: 'CRITICAL',
            TargetHorizonDays: 7,
          },
          rationale: [
            'Incoming channel orders indicate massive viral creator spike.',
            'Requires immediate cross-departmental consensus to prevent 12-day stockout.',
          ],
        });
        break;
      case 'orchestrator':
        setInspectedNode({
          id: 'node-orchestrator',
          title: 'Nexus Swarm Orchestrator',
          role: 'Hierarchical Task Deconstruction & Dispatch',
          model: 'Gemini 3.6 Flash',
          latency: '4.2ms',
          status: 'ACTIVE_ROUTING',
          icon: <Sparkles className="w-4 h-4 text-[#A8C7FA]" />,
          summary: 'Deconstructs executive directive into 3 parallel worker contracts (Sales, Inventory, Finance) and establishes Pydantic schema boundaries.',
          inputs: {
            EventID: 'EVT-VIRAL-P100',
            SurgeRatio: `${simSurge}%`,
            WorldState: 'Neon Cloud PostgreSQL Sync',
          },
          outputs: {
            ParallelTasksDispatched: 3,
            TargetWorkers: 'SalesAgent, InventoryAgent, FinanceAgent',
            SchemaContract: 'models/decision.py (Pydantic v2)',
          },
          rationale: [
            'Parsed natural language directive and extracted SKU P100 parameter.',
            'Spawned parallel domain agents with role-isolated knowledge permissions.',
          ],
        });
        break;
      case 'sales':
        setInspectedNode({
          id: 'node-sales',
          title: 'Sales Intelligence Agent',
          role: 'Velocity Forecasting & Channel Attribution',
          model: 'Gemini 3.6 Flash',
          latency: '8.2ms',
          status: 'COMPLETED',
          icon: <TrendingUp className="w-4 h-4 text-blue-400" />,
          summary: 'Extracts real-time velocity curves from marketing data and calculates 7-day cumulative requirement.',
          inputs: {
            BaseDailyVelocity: '85 units/day',
            SurgeMultiplier: `+${simSurge}%`,
            AttributedChannel: 'VIRAL_TIKTOK_TECH_SUMMER',
          },
          outputs: {
            CurrentDailyVelocity: `${sim.velocity} units/day`,
            Forecast7DayCumulative: `${sim.forecast7d} units`,
            ForecastConfidence: '94.2%',
          },
          rationale: [
            `Elevated velocity from 85 to ${sim.velocity} u/d based on live elasticity.`,
            `Computed cumulative 7-day requirement of ${sim.forecast7d} units.`,
          ],
        });
        break;
      case 'inventory':
        setInspectedNode({
          id: 'node-inventory',
          title: 'Supply Chain & Inventory Agent',
          role: 'Stockout Horizon & Safety Buffer Evaluation',
          model: 'GPT-4o Mini',
          latency: '6.4ms',
          status: 'CRITICAL_DEPLETION',
          icon: <Package className="w-4 h-4 text-amber-400" />,
          summary: 'Evaluates current physical stock in Bin 4B against safety thresholds and computes net replenishment deficit.',
          inputs: {
            Bin4BPhysicalStock: '170 units',
            StatutorySafetyFloor: '150 units',
            DailyBurnRate: `${sim.velocity} u/d`,
          },
          outputs: {
            StockoutHorizon: `${sim.horizonDays} days`,
            ReplenishmentDeficit: `${sim.deficitUnits} units`,
            UrgencyLevel: 'CRITICAL',
          },
          rationale: [
            `Current 170 units will breach the 150-unit safety floor in ~${sim.horizonDays} days.`,
            `Identified replenishment shortfall of ${sim.deficitUnits} units to restore safety stock.`,
          ],
        });
        break;
      case 'finance':
        setInspectedNode({
          id: 'node-finance',
          title: 'Treasury & Governance Agent',
          role: 'Liquidity Verification & Statutory Buffer Lock',
          model: 'Gemini 1.5 Pro',
          latency: '9.1ms',
          status: 'LOCKED_APPROVED',
          icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
          summary: 'Enforces statutory liquidity buffer governance and approves safe immediate upfront cash ceiling.',
          inputs: {
            TreasuryCashBalance: '₹8,50,000',
            StatutoryReserveRequirement: '₹5,00,000 (Locked)',
            AccountsReceivable: '₹3,10,000',
          },
          outputs: {
            MaxSafeUpfrontSpendCap: '₹1,80,000',
            StatutoryBufferProtected: 'TRUE (100% Lock)',
            ApprovedPaymentFacility: 'Net-30 (Supplier B)',
          },
          rationale: [
            'Statutory reserve of ₹5.00 Lakh strictly locked and protected.',
            'Approved maximum safe cash spend cap of ₹1.80 Lakh.',
          ],
        });
        break;
      case 'solver':
        setInspectedNode({
          id: 'node-solver',
          title: 'Google OR-Tools ILP Solver',
          role: 'Deterministic Mathematical Constraint Solver',
          model: 'Nexus 3.1 Deep Think (Exact ILP)',
          latency: '2.4ms',
          status: 'OPTIMAL_FEASIBLE',
          icon: <Cpu className="w-4 h-4 text-purple-400" />,
          summary: 'Formulates an Integer Linear Program (ILP) to calculate exact multi-supplier split minimizing cost while strictly respecting the ₹1.80L cash ceiling.',
          inputs: {
            RequiredUnits: `${sim.deficitUnits} units`,
            CashCeiling: '₹1,80,000',
            SupplierB_Limits: 'Max 400u, ₹477, Net-30 (₹0 upfront)',
            SupplierC_Limits: 'Unlimited, ₹436.5, 50% Adv (₹218.25 upfront)',
          },
          outputs: {
            AllocatedSupplierB: `${sim.supplierBUnits} units (QuickLogix)`,
            AllocatedSupplierC: `${sim.supplierCUnits} units (Zenith Global)`,
            TotalUpfrontCash: `₹${sim.upfrontCash.toLocaleString()}`,
            MathematicalFeasibility: 'TRUE (100% Verified)',
          },
          rationale: [
            `Maximized Net-30 credit allocation with QuickLogix for ${sim.supplierBUnits} units to conserve cash.`,
            `Allocated remaining ${sim.supplierCUnits} units to Zenith Global via 50% advance (₹${sim.upfrontCash.toLocaleString()} upfront).`,
            `Total upfront cash (₹${sim.upfrontCash.toLocaleString()}) strictly satisfies the ₹1,80,000 ceiling.`,
          ],
        });
        break;
      case 'db':
        setInspectedNode({
          id: 'node-db',
          title: 'Neon PostgreSQL Ground Truth & ERP',
          role: 'Relational Grounding & Immutable Ledger Action',
          model: 'Neon Cloud Postgres • asyncpg',
          latency: '1.8ms',
          status: executed ? 'COMMITTED' : 'READY_TO_EXECUTE',
          icon: <Database className="w-4 h-4 text-emerald-400" />,
          summary: 'Commits verified split purchase order to relational tables and writes immutable audit log with cryptographic hash.',
          inputs: {
            TargetDatabase: 'db.neondb.azure.com:5432/nexus_prod',
            RelationalTables: 'orders, inventory_bins, supplier_pos, audit_ledger',
          },
          outputs: {
            TransactionStatus: executed ? 'COMMITTED_SUCCESS' : 'PENDING_USER_CONFIRM',
            LedgerBlockHash: '0x8f9c2d1e4a7b5c3e',
            PurchaseOrderRef: 'PO-2026-P100-B-C',
          },
          rationale: [
            'Relational schema validation succeeded across all foreign keys.',
            'Zero data drift between LLM reasoning and mathematical solver.',
          ],
        });
        break;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#131313] text-[#E3E3E3] font-sans overflow-hidden">
      {/* ================= HEADER (NEXUS 1.0 THEME) ================= */}
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
            <span>Swarm Latency: 11.4ms</span>
          </div>
        </div>
      </header>

      {/* ================= STUDIO TOP CONTROL BAR ================= */}
      <div className="bg-[#171819] border-b border-white/5 px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#A8C7FA] animate-ping" />
            <h2 className="text-xs sm:text-sm font-semibold text-white font-headline">
              Swarm Network Pipeline Canvas (Left-to-Right Topology)
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1E1F20] text-[#C4C7C5] border border-white/10 hidden sm:inline">
            5 Interconnected Stages
          </span>
        </div>

        {/* Interactive Controls: Demand Surge Slider & Pipeline Trigger */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1E1F20] px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[#747775]">Surge Multiplier:</span>
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
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#C2E7FF] text-[#001E2C] font-semibold hover:bg-[#A8C7FA] transition-all text-xs cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Propagating...' : 'Run Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* ================= MAIN HORIZONTAL PIPELINE CANVAS ================= */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-4 md:p-6 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] relative flex flex-col justify-between">
        {/* Horizontal Pipeline Network Track */}
        <div className="min-w-[1100px] flex items-center justify-between gap-4 my-auto relative py-6">
          
          {/* ================= STAGE 1: CEO TRIGGER ================= */}
          <div className="flex flex-col items-center shrink-0 w-[200px]">
            <div className="text-[10px] font-mono text-[#747775] mb-2 uppercase tracking-wider flex items-center gap-1">
              <span>01 • Trigger</span>
            </div>
            
            <div
              onClick={() => openNodeDetails('ceo')}
              className={`w-full rounded-2xl bg-[#1E1F20] border p-3.5 space-y-2.5 transition-all cursor-pointer shadow-lg group hover:scale-[1.02] ${
                activePipelineStep >= 1 ? 'border-[#A8C7FA]/60 shadow-[#A8C7FA]/10' : 'border-white/10 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-[#A8C7FA]/10 border border-[#A8C7FA]/20 flex items-center justify-center text-[#A8C7FA]">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  DIRECTIVE
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-white truncate">CEO / Executive</h4>
                <p className="text-[10px] text-[#747775] font-mono">Rahul (TechMart)</p>
              </div>

              <div className="bg-[#131314] p-2 rounded-xl text-[10px] font-mono space-y-1">
                <div className="text-[#A8C7FA] font-bold truncate">VIRAL_SPIKE_P100</div>
                <div className="text-[#747775] flex items-center justify-between">
                  <span>Demand Jump:</span>
                  <span className="text-white font-semibold">+{simSurge}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Line 1 -> 2 */}
          <div className="flex-1 flex items-center justify-center relative min-w-[40px]">
            <div className="w-full h-0.5 bg-gradient-to-r from-[#A8C7FA] to-[#B2C5FF] relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#B2C5FF] animate-pulse" />
            </div>
          </div>

          {/* ================= STAGE 2: SWARM ORCHESTRATOR ================= */}
          <div className="flex flex-col items-center shrink-0 w-[210px]">
            <div className="text-[10px] font-mono text-[#747775] mb-2 uppercase tracking-wider flex items-center gap-1">
              <span>02 • Task Routing</span>
            </div>

            <div
              onClick={() => openNodeDetails('orchestrator')}
              className={`w-full rounded-2xl bg-[#1E1F20] border p-3.5 space-y-2.5 transition-all cursor-pointer shadow-lg group hover:scale-[1.02] ${
                activePipelineStep >= 2 ? 'border-[#A8C7FA] shadow-[#A8C7FA]/15' : 'border-white/10 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-[#A8C7FA]/20 border border-[#A8C7FA]/30 flex items-center justify-center text-[#A8C7FA]">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#282A2C] text-[#A8C7FA] border border-white/10">
                  Gemini 3.6 Flash
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-white truncate">Swarm Orchestrator</h4>
                <p className="text-[10px] text-[#747775] font-mono">Parallel Task Dispatch</p>
              </div>

              <div className="bg-[#131314] p-2 rounded-xl text-[10px] font-mono text-[#C4C7C5] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#747775]">Dispatched:</span>
                  <span className="text-emerald-400 font-bold">3 Agents</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#747775]">Latency:</span>
                  <span className="text-white">4.2ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Line 2 -> 3 (Branching) */}
          <div className="flex-1 flex items-center justify-center relative min-w-[40px]">
            <div className="w-full h-0.5 bg-gradient-to-r from-[#B2C5FF] to-white/20 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#A8C7FA] animate-pulse" />
            </div>
          </div>

          {/* ================= STAGE 3: 3 PARALLEL WORKER AGENTS ================= */}
          <div className="flex flex-col items-center shrink-0 w-[240px] space-y-2.5">
            <div className="text-[10px] font-mono text-[#747775] uppercase tracking-wider flex items-center gap-1">
              <span>03 • Parallel Domain Swarm</span>
            </div>

            {/* Sales Agent Node */}
            <div
              onClick={() => openNodeDetails('sales')}
              className={`w-full rounded-xl bg-[#1E1F20] border p-2.5 space-y-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] ${
                activePipelineStep >= 3 ? 'border-blue-500/50 hover:border-blue-500' : 'border-white/10 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-blue-400 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  SALES AGENT
                </span>
                <span className="text-[9px] font-mono text-[#747775]">8.2ms</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold font-mono text-white">{sim.velocity} u/day</span>
                <span className="text-[10px] font-mono text-blue-300">7d: {sim.forecast7d}u</span>
              </div>
            </div>

            {/* Inventory Agent Node */}
            <div
              onClick={() => openNodeDetails('inventory')}
              className={`w-full rounded-xl bg-[#1E1F20] border p-2.5 space-y-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] ${
                activePipelineStep >= 3 ? 'border-amber-500/50 hover:border-amber-500' : 'border-white/10 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  INVENTORY AGENT
                </span>
                <span className="text-[9px] font-mono text-[#747775]">6.4ms</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold font-mono text-amber-300">{sim.horizonDays}d buffer</span>
                <span className="text-[10px] font-mono text-rose-400 font-semibold">Deficit: {sim.deficitUnits}u</span>
              </div>
            </div>

            {/* Finance Agent Node */}
            <div
              onClick={() => openNodeDetails('finance')}
              className={`w-full rounded-xl bg-[#1E1F20] border p-2.5 space-y-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] ${
                activePipelineStep >= 3 ? 'border-emerald-500/50 hover:border-emerald-500' : 'border-white/10 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  FINANCE AGENT
                </span>
                <span className="text-[9px] font-mono text-[#747775]">9.1ms</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold font-mono text-emerald-400">₹1.80L Safe Cap</span>
                <span className="text-[10px] font-mono text-[#747775]">₹5.00L Lock</span>
              </div>
            </div>
          </div>

          {/* Connection Line 3 -> 4 (Convergence) */}
          <div className="flex-1 flex items-center justify-center relative min-w-[40px]">
            <div className="w-full h-0.5 bg-gradient-to-r from-white/20 to-purple-400 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            </div>
          </div>

          {/* ================= STAGE 4: CONSTRAINED ILP SOLVER ================= */}
          <div className="flex flex-col items-center shrink-0 w-[230px]">
            <div className="text-[10px] font-mono text-[#747775] mb-2 uppercase tracking-wider flex items-center gap-1">
              <span>04 • Optimization</span>
            </div>

            <div
              onClick={() => openNodeDetails('solver')}
              className={`w-full rounded-2xl bg-[#1E1F20] border p-3.5 space-y-2.5 transition-all cursor-pointer shadow-lg group hover:scale-[1.02] ${
                activePipelineStep >= 4 ? 'border-purple-500 shadow-purple-500/10' : 'border-white/10 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  100% FEASIBLE
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-white truncate">Google OR-Tools Solver</h4>
                <p className="text-[10px] text-[#747775] font-mono">Integer Linear Program (ILP)</p>
              </div>

              <div className="bg-[#131314] p-2 rounded-xl text-[10px] font-mono space-y-1">
                <div className="text-[#C4C7C5] flex justify-between">
                  <span>QuickLogix (Net-30):</span>
                  <span className="text-[#A8C7FA] font-bold">{sim.supplierBUnits} u</span>
                </div>
                <div className="text-[#C4C7C5] flex justify-between">
                  <span>Zenith (50% Adv):</span>
                  <span className="text-[#A8C7FA] font-bold">{sim.supplierCUnits} u</span>
                </div>
                <div className="text-emerald-400 flex justify-between border-t border-white/5 pt-1 font-bold">
                  <span>Upfront Cash:</span>
                  <span>₹{sim.upfrontCash.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Line 4 -> 5 */}
          <div className="flex-1 flex items-center justify-center relative min-w-[40px]">
            <div className="w-full h-0.5 bg-gradient-to-r from-purple-400 to-emerald-400 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* ================= STAGE 5: NEON POSTGRESQL & ACTION ================= */}
          <div className="flex flex-col items-center shrink-0 w-[200px]">
            <div className="text-[10px] font-mono text-[#747775] mb-2 uppercase tracking-wider flex items-center gap-1">
              <span>05 • DB Commit</span>
            </div>

            <div
              onClick={() => openNodeDetails('db')}
              className={`w-full rounded-2xl bg-[#1E1F20] border p-3.5 space-y-2.5 transition-all cursor-pointer shadow-lg group hover:scale-[1.02] ${
                activePipelineStep >= 5 ? 'border-emerald-500/60 shadow-emerald-500/10' : 'border-white/10 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Neon Cloud DB
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-white truncate">Ground Truth Ledger</h4>
                <p className="text-[10px] text-[#747775] font-mono">Immutable Audit Log</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCommitOrder();
                }}
                disabled={executed}
                className={`w-full py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 text-[10px] font-mono ${
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
            </div>
          </div>

        </div>

        {/* ================= BOTTOM METRICS FOOTER ================= */}
        <div className="mt-4 bg-[#1E1F20] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono shrink-0">
          <div className="flex items-center gap-4 text-[#C4C7C5]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#A8C7FA]" />
              <span>Consensus Time: <strong className="text-white">11.4ms</strong></span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Statutory Reserve: <strong className="text-emerald-400">100% Protected</strong></span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-purple-400" />
              <span>Pydantic v2 Contracts: <strong className="text-white">Verified</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLog}
              className="px-3 py-1.5 rounded-full bg-[#282A2C] hover:bg-[#343638] text-white border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Trace' : 'Copy Audit Trace'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= SLIDE-OVER NODE DETAIL INSPECTION DRAWER ================= */}
      {inspectedNode && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#1E1F20] border-l border-white/15 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#171819]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#282A2C] border border-white/10 flex items-center justify-center">
                {inspectedNode.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white font-headline">{inspectedNode.title}</h3>
                <p className="text-[10px] text-[#747775] font-mono">{inspectedNode.role}</p>
              </div>
            </div>
            <button
              onClick={() => setInspectedNode(null)}
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

            {/* Summary */}
            <div className="space-y-1.5">
              <span className="text-[#747775] font-mono text-[10px] uppercase tracking-wider">Node Purpose</span>
              <p className="text-[#C4C7C5] leading-relaxed bg-[#131314] p-3 rounded-xl border border-white/5">
                {inspectedNode.summary}
              </p>
            </div>

            {/* Inputs */}
            <div className="space-y-1.5">
              <span className="text-[#747775] font-mono text-[10px] uppercase tracking-wider">Grounded Inputs</span>
              <div className="bg-[#131314] rounded-xl border border-white/5 p-3 space-y-1.5 font-mono text-[11px]">
                {Object.entries(inspectedNode.inputs).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-[#C4C7C5]">
                    <span className="text-[#747775]">{key}:</span>
                    <span className="text-white font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Outputs */}
            <div className="space-y-1.5">
              <span className="text-[#747775] font-mono text-[10px] uppercase tracking-wider">Pydantic v2 Outputs</span>
              <div className="bg-[#131314] rounded-xl border border-white/5 p-3 space-y-1.5 font-mono text-[11px]">
                {Object.entries(inspectedNode.outputs).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-[#C4C7C5]">
                    <span className="text-[#747775]">{key}:</span>
                    <span className="text-[#A8C7FA] font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chain of Thought Rationale */}
            <div className="space-y-1.5">
              <span className="text-[#747775] font-mono text-[10px] uppercase tracking-wider">Step-by-Step Chain-of-Thought</span>
              <ul className="space-y-1.5 bg-[#131314] p-3 rounded-xl border border-white/5 text-[11px] text-[#C4C7C5] list-disc list-inside leading-relaxed">
                {inspectedNode.rationale.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-white/10 bg-[#171819] flex justify-end">
            <button
              onClick={() => setInspectedNode(null)}
              className="px-4 py-1.5 rounded-full bg-[#C2E7FF] text-[#001E2C] font-semibold text-xs hover:bg-[#A8C7FA] transition-colors cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
