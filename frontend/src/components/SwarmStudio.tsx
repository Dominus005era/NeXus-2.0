import React, { useState, useMemo } from 'react';
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
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SwarmStudioProps {
  onBackToLanding: () => void;
  onSwitchToChat: () => void;
  activeView: 'chat' | 'swarm';
}

export const SwarmStudio: React.FC<SwarmStudioProps> = ({
  onBackToLanding,
  onSwitchToChat,
  activeView,
}) => {
  const [simSurge, setSimSurge] = useState<number>(70);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executed, setExecuted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dag' | 'telemetry' | 'schema'>('dag');
  const [copied, setCopied] = useState<boolean>(false);

  // Dynamic calculations
  const sim = useMemo(() => {
    const baseDemand = 85;
    const velocity = Math.round(baseDemand * (1 + simSurge / 100));
    const forecast7d = velocity * 7;
    const currentStock = 170;
    const safetyStock = 150;
    const rawHorizon = (currentStock - safetyStock) / velocity;
    const horizonDays = Number(Math.max(0.1, rawHorizon).toFixed(2));
    const deficitUnits = Math.max(0, forecast7d + safetyStock - currentStock);
    
    // Supplier allocation
    const supplierBUnits = Math.min(400, deficitUnits);
    const supplierCUnits = Math.max(0, deficitUnits - supplierBUnits);
    const upfrontCash = Math.round(supplierCUnits * 218.25);

    return {
      velocity,
      forecast7d,
      horizonDays,
      deficitUnits,
      supplierBUnits,
      supplierCUnits,
      upfrontCash,
      isFeasible: upfrontCash <= 180000,
    };
  }, [simSurge]);

  const handleTriggerSimulation = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#A8C7FA', '#B2C5FF', '#22c55e'],
      });
    }, 800);
  };

  const handleCommitOrder = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#A8C7FA', '#ffffff'],
    });
    setExecuted(true);
  };

  const handleCopyLog = () => {
    navigator.clipboard.writeText(
      `[SWARM EXECUTION TRACE]\nOrchestrator -> Sales (+${simSurge}%: ${sim.velocity} u/d) -> Inventory (${sim.horizonDays}d stockout) -> Finance (₹1.80L safe cap)\nSolver: 400 u (QuickLogix, Net-30) + ${sim.supplierCUnits} u (Zenith, 50% Adv, ₹${sim.upfrontCash.toLocaleString()} upfront)`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#131313] text-[#E3E3E3] font-sans overflow-hidden">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-20 bg-[#131313]/95 backdrop-blur-md border-b border-white/10 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0">
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
            <span>DAG Engine Active</span>
          </div>
        </div>
      </header>

      {/* ================= SWARM STUDIO WORKSPACE ================= */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Top Control Deck: Simulation Multiplier */}
        <div className="bg-[#1E1F20] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white font-headline">
                Autonomous Multi-Agent DAG Simulation
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#282A2C] text-[#A8C7FA] border border-white/10">
                P100 Headphones
              </span>
            </div>
            <p className="text-xs text-[#C4C7C5] mt-1">
              Adjust creator promotional demand surge to witness real-time multi-agent consensus and deterministic integer linear solving.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-[#282A2C] px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-[#747775]">Demand Surge:</span>
              <input
                type="range"
                min="20"
                max="150"
                step="5"
                value={simSurge}
                onChange={(e) => setSimSurge(Number(e.target.value))}
                className="w-28 accent-[#A8C7FA] cursor-pointer"
              />
              <span className="text-[#A8C7FA] font-bold">+{simSurge}%</span>
            </div>

            <button
              onClick={handleTriggerSimulation}
              disabled={isExecuting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#C2E7FF] text-[#001E2C] font-semibold hover:bg-[#A8C7FA] transition-all text-xs cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isExecuting ? 'Simulating...' : 'Trigger Swarm'}</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs inside Studio */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab('dag')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dag'
                  ? 'bg-[#282A2C] text-white font-semibold border border-white/10'
                  : 'text-[#747775] hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-[#A8C7FA]" />
              <span>Swarm DAG Flowchart</span>
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'telemetry'
                  ? 'bg-[#282A2C] text-white font-semibold border border-white/10'
                  : 'text-[#747775] hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Micro-Agent Telemetry</span>
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'schema'
                  ? 'bg-[#282A2C] text-white font-semibold border border-white/10'
                  : 'text-[#747775] hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Pydantic v2 Contract</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#747775]">
            <span>Swarm Latency: <strong className="text-emerald-400">11.4ms</strong></span>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE AGENT SWARM DAG */}
        {activeTab === 'dag' && (
          <div className="space-y-6">
            {/* Orchestrator Root Node */}
            <div className="flex flex-col items-center">
              <div className="bg-[#1E1F20] border border-[#A8C7FA]/40 rounded-2xl p-4 max-w-md w-full shadow-lg text-center space-y-2 relative group hover:border-[#A8C7FA] transition-all">
                <div className="w-10 h-10 mx-auto rounded-xl bg-[#A8C7FA]/10 border border-[#A8C7FA]/20 flex items-center justify-center text-[#A8C7FA]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Nexus Swarm Orchestrator</h3>
                  <p className="text-[11px] text-[#747775] font-mono">Gemini 3.6 Flash • Dynamic Task Routing</p>
                </div>
                <div className="text-[11px] bg-[#131314] p-2 rounded-xl text-[#C4C7C5] font-mono">
                  Event: <span className="text-[#A8C7FA]">VIRAL_DEMAND_SPIKE_P100</span> (+{simSurge}%)
                </div>
              </div>

              {/* Connecting Line */}
              <div className="w-0.5 h-8 bg-gradient-to-b from-[#A8C7FA] to-white/20" />
            </div>

            {/* 3 Domain Agent Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Sales Agent */}
              <div className="bg-[#1E1F20] border border-blue-500/30 rounded-2xl p-5 space-y-3 hover:border-blue-500/60 transition-all shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-blue-400 font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    SALES AGENT
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300">
                    Gemini 3.6 Flash
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {sim.velocity} <span className="text-xs font-normal text-[#C4C7C5]">units/day</span>
                  </div>
                  <p className="text-xs text-[#C4C7C5] mt-1">
                    7-Day Forecast: <strong>{sim.forecast7d} units</strong> requirement.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-[#747775] border-t border-white/5 pt-2 space-y-1">
                  <div>• Attributed channel: TikTok Viral</div>
                  <div>• Base velocity: 85 u/d</div>
                </div>
              </div>

              {/* Inventory Agent */}
              <div className="bg-[#1E1F20] border border-amber-500/30 rounded-2xl p-5 space-y-3 hover:border-amber-500/60 transition-all shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    INVENTORY AGENT
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300">
                    GPT-4o Mini
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-amber-300">
                    {sim.horizonDays} <span className="text-xs font-normal text-[#C4C7C5]">days stockout buffer</span>
                  </div>
                  <p className="text-xs text-[#C4C7C5] mt-1">
                    Deficit to safety floor: <strong className="text-rose-400">{sim.deficitUnits} units</strong>.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-[#747775] border-t border-white/5 pt-2 space-y-1">
                  <div>• Bin 4B Stock: 170 units</div>
                  <div>• Safety threshold: 150 units</div>
                </div>
              </div>

              {/* Finance Agent */}
              <div className="bg-[#1E1F20] border border-emerald-500/30 rounded-2xl p-5 space-y-3 hover:border-emerald-500/60 transition-all shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    FINANCE AGENT
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">
                    Gemini 1.5 Pro
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-white">
                    ₹1,80,000 <span className="text-xs font-normal text-[#C4C7C5]">safe spend cap</span>
                  </div>
                  <p className="text-xs text-[#C4C7C5] mt-1">
                    Statutory buffer: <strong className="text-emerald-400">₹5,00,000 Locked</strong>.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-[#747775] border-t border-white/5 pt-2 space-y-1">
                  <div>• Ledger Balance: ₹8,50,000</div>
                  <div>• Approved terms: Net-30</div>
                </div>
              </div>
            </div>

            {/* Connecting Convergence Lines */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-8 bg-gradient-to-b from-white/20 to-purple-400" />
            </div>

            {/* Convergence Node: Constrained Integer Linear Solver */}
            <div className="bg-[#1E1F20] border border-purple-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white font-headline">
                      Google OR-Tools Integer Linear Program (ILP) Solver Output
                    </h3>
                    <p className="text-[11px] text-[#747775] font-mono">
                      Mathematical optimization: min ∑(Cost) subject to TotalUnits ≥ {sim.deficitUnits}, UpfrontCash ≤ ₹1,80,000
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold self-start sm:self-auto">
                  Status: OPTIMAL_FEASIBLE
                </span>
              </div>

              {/* Allocation Table */}
              <div className="overflow-x-auto font-mono text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[#747775] text-[11px]">
                      <th className="pb-2">Supplier Entity</th>
                      <th className="pb-2">Allocated Units</th>
                      <th className="pb-2">Unit Price</th>
                      <th className="pb-2">Upfront Cash Required</th>
                      <th className="pb-2">Transit Lead Time</th>
                      <th className="pb-2">Payment Terms</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[#C4C7C5]">
                    <tr>
                      <td className="py-2.5 text-white font-medium">QuickLogix Logistics (Supplier B)</td>
                      <td className="py-2.5 text-[#A8C7FA] font-bold">{sim.supplierBUnits} units</td>
                      <td className="py-2.5">₹477.00</td>
                      <td className="py-2.5 text-emerald-400 font-bold">₹0 (Zero Upfront)</td>
                      <td className="py-2.5">3 days</td>
                      <td className="py-2.5 text-[#747775]">Net-30 Credit Facility</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-white font-medium">Zenith Global Air Freight (Supplier C)</td>
                      <td className="py-2.5 text-[#A8C7FA] font-bold">{sim.supplierCUnits} units</td>
                      <td className="py-2.5">₹436.50</td>
                      <td className="py-2.5 text-purple-300 font-bold">₹{sim.upfrontCash.toLocaleString()}</td>
                      <td className="py-2.5">2 days</td>
                      <td className="py-2.5 text-[#747775]">50% Advance Required</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bottom Commit Action */}
              <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="text-[#C4C7C5]">
                  Total Upfront Spend: <strong className="text-white">₹{sim.upfrontCash.toLocaleString()}</strong> / ₹1,80,000 Safe Cap
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCommitOrder}
                    disabled={executed}
                    className={`px-5 py-2 rounded-full font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-md ${
                      executed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-[#C2E7FF] text-[#001E2C] hover:bg-[#A8C7FA]'
                    }`}
                  >
                    {executed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Order Executed in Neon PostgreSQL ✓</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Execute Split PO to Neon DB</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MICRO-AGENT TELEMETRY */}
        {activeTab === 'telemetry' && (
          <div className="bg-[#0F0F10] border border-white/10 rounded-2xl p-5 font-mono text-xs space-y-3 text-[#C4C7C5]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[#747775]">
              <span>LIVE TELEMETRY LOG // NEON CLOUD DB CONNECTION POOL</span>
              <button
                onClick={handleCopyLog}
                className="text-xs hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Trace'}</span>
              </button>
            </div>
            <div className="space-y-1.5 leading-relaxed overflow-x-auto">
              <p className="text-emerald-400">$ nexus swarm execute --event VIRAL_DEMAND_SPIKE_P100 --surge {simSurge}%</p>
              <p className="text-[#747775]">[12:30:01.002] Connecting to Neon.tech Cloud PostgreSQL (pool_size=10, ssl=require)</p>
              <p className="text-[#A8C7FA]">[12:30:01.005] [SALES AGENT] Querying orders table -&gt; Calculated current velocity: {sim.velocity} u/d</p>
              <p className="text-amber-300">[12:30:01.009] [INVENTORY AGENT] Evaluating stock 170 units against 150 safety stock -&gt; Stockout in {sim.horizonDays} days</p>
              <p className="text-emerald-300">[12:30:01.012] [FINANCE AGENT] Verifying treasury ledger ₹8,50,000 - ₹5,00,000 reserve = ₹3,50,000 free cash</p>
              <p className="text-purple-300">[12:30:01.018] [OR-TOOLS SOLVER] Initializing ILP Matrix solver...</p>
              <p className="text-purple-300">[12:30:01.022] [OR-TOOLS SOLVER] Decision: QuickLogix={sim.supplierBUnits}, Zenith={sim.supplierCUnits}</p>
              <p className="text-white font-bold">[12:30:01.025] [STATUS] Consensus reached in 11.4ms. 100% Feasible.</p>
            </div>
          </div>
        )}

        {/* TAB 3: PYDANTIC V2 CONTRACT */}
        {activeTab === 'schema' && (
          <div className="bg-[#0F0F10] border border-white/10 rounded-2xl p-5 font-mono text-xs space-y-3 text-[#A8C7FA] overflow-x-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[#747775]">
              <span>PYDANTIC V2 WORLD STATE SCHEMA // models/decision.py</span>
              <button
                onClick={handleCopyLog}
                className="text-xs hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Schema</span>
              </button>
            </div>
            <pre>
{`class SupplierAllocation(BaseModel):
    supplier_name: str
    allocated_units: int
    unit_cost: float
    upfront_cash_required: float
    lead_time_days: int
    payment_terms: str

class SwarmDecisionOutput(BaseModel):
    event_id: str = "EVT-894102"
    product_id: str = "P100"
    surge_multiplier_pct: int = ${simSurge}
    daily_velocity: int = ${sim.velocity}
    stockout_horizon_days: float = ${sim.horizonDays}
    replenishment_deficit_units: int = ${sim.deficitUnits}
    mathematical_feasibility: bool = True
    total_upfront_cash_impact: float = ${sim.upfrontCash}
    statutory_buffer_preserved: bool = True
    allocation_plan: List[SupplierAllocation]`}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
};
