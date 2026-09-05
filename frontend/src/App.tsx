import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  OrchestratorResponse,
  AgentModelConfig,
  AvailableModel,
  TimelineLogItem,
  OverviewMetrics,
  ChatSession,
} from './types';
import { api } from './services/api';
import { LandingPage } from './components/LandingPage';
import {
  Sparkles,
  ArrowLeft,
  Activity,
  Layers,
  Cpu,
  Database,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Send,
  Sliders,
  DollarSign,
  Package,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>({
    name: 'Rahul',
    role: 'CEO',
    company: 'TechMart Electronics',
    isLoggedIn: true,
  });

  const [currentView, setCurrentView] = useState<'landing' | 'workspace'>('landing');
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [response, setResponse] = useState<OrchestratorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [surgePct, setSurgePct] = useState(70);

  const [modelConfig, setModelConfig] = useState<AgentModelConfig>({
    sales_agent_model: 'gemini-2.0-flash',
    inventory_agent_model: 'gpt-4o-mini',
    finance_agent_model: 'gemini-1.5-pro',
    orchestrator_model: 'gemini-2.0-flash',
    temperature: 0.2,
  });

  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);

  useEffect(() => {
    const initData = async () => {
      const ov = await api.getOverview();
      setMetrics(ov);

      const cfg = await api.getModelConfig();
      if (cfg.active_config) setModelConfig(cfg.active_config);
      if (cfg.available_models) setAvailableModels(cfg.available_models);
    };
    initData();
  }, []);

  const handleRunSimulation = async () => {
    setIsLoading(true);
    try {
      const res = await api.triggerOrchestrator('P100', 'VIRAL_DEMAND_SPIKE_P100', surgePct);
      setResponse(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#131313] text-[#E3E3E3] font-sans">
      {currentView === 'landing' ? (
        <LandingPage
          onGetStarted={() => {
            setCurrentView('workspace');
            if (!response) handleRunSimulation();
          }}
          onOpenDeploymentGuide={() => setCurrentView('workspace')}
        />
      ) : (
        <div className="min-h-screen flex flex-col">
          {/* Top Bar in Workspace */}
          <header className="sticky top-0 z-40 bg-[#131313]/90 backdrop-blur-md border-b border-white/[0.08] px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('landing')}
                className="flex items-center gap-1.5 text-xs text-[#C4C7C5] hover:text-white bg-[#1E1F20] px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Landing Page</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#A8C7FA] text-lg">spark</span>
                <span className="text-base font-semibold text-white font-headline">Nexus AI Workspace</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1E1F20] text-[#A8C7FA] border border-white/10 font-semibold">
                  v2.0 Active
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="hidden md:flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 bg-[#1E1F20] px-3 py-1 rounded-full border border-white/10">
                <span className="text-[#747775]">Cash Balance:</span>
                <span className="text-emerald-400 font-semibold">?{metrics?.cash_balance.toLocaleString() || '8,50,000'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#1E1F20] px-3 py-1 rounded-full border border-white/10">
                <span className="text-[#747775]">Safe Budget:</span>
                <span className="text-blue-400 font-semibold">?{metrics?.safe_procurement_budget.toLocaleString() || '1,80,000'}</span>
              </div>
            </div>
          </header>

          {/* Workspace Body */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
            {/* Simulation Trigger Bar */}
            <div className="rounded-2xl bg-[#1E1F20] border border-white/10 p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white font-headline">Autonomous Multi-Agent Operational Console</h2>
                  <p className="text-xs text-[#C4C7C5]">Simulate real-time demand surges, evaluate stockout horizons, and solve optimal split procurement.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-[#282A2C] px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono">
                    <span>Surge:</span>
                    <input
                      type="range"
                      min="20"
                      max="150"
                      value={surgePct}
                      onChange={(e) => setSurgePct(Number(e.target.value))}
                      className="w-24 accent-[#A8C7FA]"
                    />
                    <span className="text-[#A8C7FA] font-bold">+{surgePct}%</span>
                  </div>
                  <button
                    onClick={handleRunSimulation}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#C2E7FF] text-[#001E2C] hover:bg-[#A8C7FA] font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">{isLoading ? 'progress_activity' : 'bolt'}</span>
                    <span>{isLoading ? 'Solving...' : 'Run Swarm Simulation'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Agent Results Stage */}
            {response && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sales Evidence */}
                <div className="rounded-2xl bg-[#1E1F20] border border-blue-500/30 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-blue-400 font-semibold">SALES AGENT</span>
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {response.sales_evidence.current_daily_velocity} <span className="text-xs font-normal text-[#C4C7C5]">units/day</span>
                  </div>
                  <p className="text-xs text-[#C4C7C5] leading-relaxed">
                    Forecast 7-day cumulative requirement: <strong>{response.sales_evidence.forecast_7d_total} units</strong>.
                  </p>
                  <ul className="text-[11px] text-[#747775] space-y-1 list-disc list-inside">
                    {response.sales_evidence.rationale.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Inventory Evidence */}
                <div className="rounded-2xl bg-[#1E1F20] border border-amber-500/30 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-amber-400 font-semibold">INVENTORY AGENT</span>
                    <Package className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {response.inventory_evidence.stockout_horizon_days} <span className="text-xs font-normal text-[#C4C7C5]">days buffer</span>
                  </div>
                  <p className="text-xs text-[#C4C7C5] leading-relaxed">
                    Recommended replenishment deficit: <strong>{response.inventory_evidence.recommended_reorder_qty} units</strong>.
                  </p>
                  <ul className="text-[11px] text-[#747775] space-y-1 list-disc list-inside">
                    {response.inventory_evidence.rationale.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Finance Evidence */}
                <div className="rounded-2xl bg-[#1E1F20] border border-emerald-500/30 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400 font-semibold">FINANCE AGENT</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    ?{response.finance_evidence.max_procurement_budget.toLocaleString()} <span className="text-xs font-normal text-[#C4C7C5]">safe spend cap</span>
                  </div>
                  <p className="text-xs text-[#C4C7C5] leading-relaxed">
                    Statutory reserve: <strong>?{response.finance_evidence.statutory_buffer.toLocaleString()}</strong> locked & protected.
                  </p>
                  <ul className="text-[11px] text-[#747775] space-y-1 list-disc list-inside">
                    {response.finance_evidence.rationale.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Constrained Optimization Output */}
            {response && (
              <div className="rounded-2xl bg-[#1E1F20] border border-purple-500/40 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-400">precision_manufacturing</span>
                    <h3 className="text-base font-semibold text-white font-headline">Constrained Optimization Solver Output</h3>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    Feasibility: 100% Guaranteed
                  </span>
                </div>

                <p className="text-xs text-[#C4C7C5] leading-relaxed">
                  {response.decision_output.optimization_explanation}
                </p>

                {/* Allocation Table */}
                <div className="overflow-x-auto text-xs font-mono">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-[#747775]">
                        <th className="pb-2">Supplier</th>
                        <th className="pb-2">Units</th>
                        <th className="pb-2">Unit Price</th>
                        <th className="pb-2">Upfront Cash</th>
                        <th className="pb-2">Lead Time</th>
                        <th className="pb-2">Payment Terms</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[#C4C7C5]">
                      {response.decision_output.allocation_plan.map((alloc, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 text-white font-medium">{alloc.supplier_name}</td>
                          <td className="py-2.5 text-[#A8C7FA] font-bold">{alloc.allocated_units}</td>
                          <td className="py-2.5">?{alloc.unit_cost}</td>
                          <td className="py-2.5 text-emerald-400">?{alloc.upfront_cash_required.toLocaleString()}</td>
                          <td className="py-2.5">{alloc.lead_time_days} days</td>
                          <td className="py-2.5">{alloc.payment_terms}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};
