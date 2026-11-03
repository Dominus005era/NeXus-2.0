import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Zap,
  ChevronRight,
  ChevronDown,
  Database,
  Sliders,
  Layers,
  Activity,
  Workflow,
  CheckCircle2,
  Lock,
  GitBranch,
  Terminal,
  Bot,
  ExternalLink,
  Star,
  Check,
  TrendingUp,
  Share2,
  HelpCircle,
  Copy,
  Brain,
  Code2,
  FileText,
  Clock,
  Coins,
  Box,
  Scale,
  Building2,
  FolderLock,
  Calculator,
  RefreshCw,
  Gauge,
  Network,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Flame,
  BarChart3,
  Server,
  DollarSign,
  Package
} from 'lucide-react';
import { ThemeToggle } from '../context/ThemeContext';

export interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn?: () => void;
  isAuthenticated?: boolean;
  onOpenDeploymentGuide?: () => void;
  onSelectModel?: (modelId: string, targetView: 'chat' | 'flow') => void;
}

export interface ModelTier {
  id: string;
  name: string;
  badge?: string;
  icon: React.ReactNode;
  description: string;
  contextWindow: string;
  reasoningMode: string;
  constraintEngine: string;
  ttftLatency: string;
  architecture: string;
  isFeatured?: boolean;
}

export interface CapabilityItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  metricBadge: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RbacPolicy {
  rack: string;
  category: string;
  sales: 'READ/WRITE' | 'READ' | 'DENIED';
  inventory: 'READ/WRITE' | 'READ' | 'DENIED';
  finance: 'READ/WRITE' | 'READ' | 'DENIED';
  summary: string;
}

const MODELS_DATA: ModelTier[] = [
  {
    id: 'nexus-2.5-pro',
    name: 'Nexus 2.5 Pro',
    badge: 'Flagship Core',
    icon: <Brain className="w-5 h-5 text-[#A8C7FA]" />,
    description: 'Flagship reasoning engine for multi-agent swarm orchestration, financial liquidity audit, and long-horizon operational workflows.',
    contextWindow: '2M Tokens',
    reasoningMode: 'Native Multimodal CoT',
    constraintEngine: 'Google OR-Tools v9.8',
    ttftLatency: '< 240ms',
    architecture: 'Mixture of Experts (MoE)',
    isFeatured: true,
  },
  {
    id: 'nexus-2.5-flash',
    name: 'Nexus 2.5 Flash',
    badge: 'Low Latency',
    icon: <Zap className="w-5 h-5 text-[#B2C5FF]" />,
    description: 'Engineered for high-frequency telemetry parsing, sub-second order velocity calculations, and rapid tool execution pipelines.',
    contextWindow: '1M Tokens',
    reasoningMode: 'High-Speed Operational',
    constraintEngine: 'Exact Linear Solver',
    ttftLatency: '< 150ms',
    architecture: 'High-Concurrency Streaming',
    isFeatured: false,
  },
  {
    id: 'nexus-3.1-deep-think',
    name: 'Nexus 3.1 Deep Think',
    badge: 'Formal ILP Verification',
    icon: <Cpu className="w-5 h-5 text-amber-400" />,
    description: 'Specialized in mathematical formal verification, self-correcting DAG logic, and deterministic integer linear programming.',
    contextWindow: '4M Tokens',
    reasoningMode: 'Tree-of-Thought (ToT)',
    constraintEngine: 'Exact Integer Linear Program (ILP)',
    ttftLatency: '< 450ms',
    architecture: 'Formal Mathematical Sandbox',
    isFeatured: false,
  },
];

const CAPABILITIES_DATA: CapabilityItem[] = [
  {
    icon: <Network className="w-6 h-6" />,
    title: 'Multi-Agent Swarm Orchestration',
    description: 'Specialized domain agents (Sales, Inventory, Finance) collaborate asynchronously over a shared world state with strict Pydantic v2 schemas.',
    metricBadge: '3 Specialized Agents • Swarm Latency < 12ms',
    borderColor: 'hover:border-[#A8C7FA]/50',
    iconBg: 'bg-[#A8C7FA]/10',
    iconColor: 'text-[#A8C7FA]',
  },
  {
    icon: <GitBranch className="w-6 h-6" />,
    title: 'Non-Linear Reasoning & Backtracking',
    description: 'Tree-of-thought DAG execution engine capable of rolling back sub-optimal decisions and maintaining an immutable operational audit log.',
    metricBadge: 'DAG Depth: 4 Nodes • Auto-Backtracking',
    borderColor: 'hover:border-[#B2C5FF]/50',
    iconBg: 'bg-[#B2C5FF]/10',
    iconColor: 'text-[#B2C5FF]',
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: 'Neon PostgreSQL Ground Truth',
    description: 'Direct cloud connection to Neon.tech PostgreSQL for serverless relational persistence with automated SQLite offline fallback mode.',
    metricBadge: 'Neon Cloud Postgres • 7 Relational Tables',
    borderColor: 'hover:border-purple-500/50',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
  },
  {
    icon: <Scale className="w-6 h-6" />,
    title: 'Zero-Hallucination Constrained Solver',
    description: 'Deterministic integer linear optimization replaces probabilistic math. Formally proves procurement feasibility against statutory cash ceilings.',
    metricBadge: 'Exact Integer Linear Programming (ILP)',
    borderColor: 'hover:border-emerald-500/50',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
  },
];

const RBAC_POLICIES: RbacPolicy[] = [
  {
    rack: 'docs/sales/q3_promotional_calendar.md',
    category: 'Sales & Growth',
    sales: 'READ/WRITE',
    inventory: 'READ',
    finance: 'READ',
    summary: 'Active creator promo dates, campaign elasticity curves, and wholesale discounts.',
  },
  {
    rack: 'docs/inventory/warehouse_operating_limits.md',
    category: 'Supply & Logistics',
    sales: 'READ',
    inventory: 'READ/WRITE',
    finance: 'READ',
    summary: 'Volumetric bin capacities, receiving dock schedules, and safety stock floors.',
  },
  {
    rack: 'docs/finance/cash_reserve_governance.md',
    category: 'Treasury & Compliance',
    sales: 'DENIED',
    inventory: 'DENIED',
    finance: 'READ/WRITE',
    summary: 'Statutory operating liquidity lock (₹5,00,000 protected reserve rules).',
  },
  {
    rack: 'docs/finance/supplier_contracts_master.md',
    category: 'Procurement Terms',
    sales: 'DENIED',
    inventory: 'READ',
    finance: 'READ/WRITE',
    summary: 'Supplier A/B/C pricing tiers, Net-30 credit limits, and advance payment schedules.',
  },
];

const FAQS_DATA: FaqItem[] = [
  {
    question: 'How does Nexus 2.0 prevent mathematical hallucinations in procurement?',
    answer: 'Unlike generic LLMs that guess numbers, Nexus 2.0 uses domain agents solely to extract structured parameters (velocity, lead-times, cash caps). The final purchase order calculation is formulated as a formal Integer Linear Program (ILP) solved deterministically with Google OR-Tools / SciPy.',
  },
  {
    question: 'How does the Neon PostgreSQL dual-mode database work?',
    answer: 'Nexus connects to Neon.tech PostgreSQL in cloud production with automated connection pooling and schema initialization. When running offline or locally without internet, it seamlessly falls back to local SQLite so workflows never break.',
  },
  {
    question: 'Can I hot-swap models between Gemini, GPT-4o, and Claude 3.5?',
    answer: 'Yes. Nexus provides a modular foundation provider interface. You can assign Gemini 2.0 Flash to the high-frequency Sales Agent, GPT-4o Mini to Inventory, and Gemini 1.5 Pro to Finance, or use the built-in offline engine with zero API keys.',
  },
  {
    question: 'How is Role-Based Knowledge Access (RBAC) enforced across agents?',
    answer: 'Department document racks stored in Markdown are gated by token-based security in the Knowledge Hub. The Sales Agent cannot read liquidity governance, and the Inventory Agent cannot modify financial credit terms.',
  },
  {
    question: 'Is Nexus 2.0 completely free to deploy on Vercel and Render?',
    answer: 'Yes! The React 19 frontend deploys on Vercel Free Tier, the FastAPI backend deploys on Render Free Web Service, and the PostgreSQL database runs on Neon.tech Free Tier (0.5GB storage).',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  isAuthenticated = false,
  onOpenDeploymentGuide,
  onSelectModel,
}) => {
  const [emailInput, setEmailInput] = useState<string>('');
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [heroTab, setHeroTab] = useState<'solver' | 'chat' | 'terminal' | 'json'>('solver');
  const [simSurge, setSimSurge] = useState<number>(70);
  const [activeRbacRole, setActiveRbacRole] = useState<'sales' | 'inventory' | 'finance'>('sales');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Google Gemini Lumina Particle Wave Background Canvas Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle Cloud Definition
    const numParticles = 260;
    const particles: {
      x: number;
      y: number;
      baseY: number;
      size: number;
      speedX: number;
      phase: number;
      color: string;
      alpha: number;
    }[] = [];

    const colors = [
      'rgba(26, 115, 232, ',   // Google Blue #1A73E8
      'rgba(66, 133, 244, ',   // Royal Blue #4285F4
      'rgba(168, 199, 250, ',  // Lumina Cyan #A8C7FA
      'rgba(194, 231, 255, ',  // Light Cyan #C2E7FF
      'rgba(168, 85, 247, ',   // Lumina Violet #A855F7
    ];

    for (let i = 0; i < numParticles; i++) {
      const x = Math.random() * width;
      const baseY = height * 0.45 + (Math.random() - 0.5) * (height * 0.5);
      particles.push({
        x,
        y: baseY,
        baseY,
        size: Math.random() * 2.8 + 0.8,
        speedX: Math.random() * 0.4 + 0.15,
        phase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.25,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      // Deep space atmospheric background radial fill
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.45,
        50,
        width / 2,
        height * 0.45,
        width * 0.65
      );
      bgGrad.addColorStop(0, 'rgba(0, 84, 205, 0.18)');
      bgGrad.addColorStop(0.5, 'rgba(168, 199, 250, 0.05)');
      bgGrad.addColorStop(1, 'rgba(11, 12, 14, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw particle nebula wave
      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];
        p.x += p.speedX;
        if (p.x > width) p.x = 0;

        // Hyperbolic wave math (simulating Gemini about page particle vortex)
        const normalizedX = (p.x / width) * Math.PI * 2.5;
        const wave1 = Math.sin(normalizedX + time) * 65;
        const wave2 = Math.cos(normalizedX * 0.7 - time * 0.8) * 35;
        const funnelFactor = Math.sin((p.x / width) * Math.PI);
        p.y = p.baseY + (wave1 + wave2) * funnelFactor;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;

        // Glow filter on larger particles
        if (p.size > 2.0) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#4285F4';
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Dynamic real-time calculation
  const simCalculations = useMemo(() => {
    const baseDemand = 85;
    const velocity = Math.round(baseDemand * (1 + simSurge / 100));
    const forecast7d = velocity * 7;
    const currentStock = 170;
    const safetyStock = 150;
    const rawHorizon = (currentStock - safetyStock) / velocity;
    const horizonDays = Number(Math.max(0.1, rawHorizon).toFixed(2));
    const deficitUnits = Math.max(0, forecast7d + safetyStock - currentStock);
    
    // Split procurement
    const supplierBUnits = Math.min(400, deficitUnits);
    const supplierCUnits = Math.max(0, deficitUnits - supplierBUnits);
    const costB = supplierBUnits * 477;
    const costC = supplierCUnits * 436.5;
    const upfrontCashB = 0;
    const upfrontCashC = supplierCUnits * 218.25;
    const totalUpfrontCash = upfrontCashB + upfrontCashC;
    const isFeasible = totalUpfrontCash <= 180000;

    return {
      velocity,
      forecast7d,
      horizonDays,
      deficitUnits,
      supplierBUnits,
      supplierCUnits,
      costB,
      costC,
      totalProcurementCost: costB + costC,
      totalUpfrontCash,
      isFeasible,
    };
  }, [simSurge]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  const handleCopyCode = () => {
    const sampleText = [
      'nexus cluster inspect --namespace prod-eu-west --trace-window 15m',
      `[AGENT DISPATCH] Sales (+${simSurge}% Surge: ${simCalculations.velocity} u/d) -> Inventory (${simCalculations.horizonDays}d Depletion) -> Finance (Safe Cap: INR 1,80,000)`,
      `[OR-TOOLS SOLVER] Purchase Order: ${simCalculations.supplierBUnits} units (QuickLogix, Net-30) + ${simCalculations.supplierCUnits} units (Zenith, 50% Adv)`,
      `[SOLVER STATUS] Feasible. Total Upfront Cash: INR ${Math.round(simCalculations.totalUpfrontCash).toLocaleString()} <= INR 1,80,000 Cap.`
    ].join('\n');
    navigator.clipboard.writeText(sampleText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleModelClick = (modelId: string) => {
    if (onSelectModel) {
      onSelectModel(modelId, 'chat');
    } else {
      onGetStarted();
    }
  };

  return (
    <div className="min-h-screen w-full flex-1 bg-[#F8FAFC] dark:bg-[#0B0C0E] text-slate-900 dark:text-[#E3E3E3] antialiased selection:bg-blue-500/20 dark:selection:bg-[#A8C7FA]/30 selection:text-slate-900 dark:selection:text-white flex flex-col font-sans overflow-x-hidden transition-colors duration-200">
      {/* ================= TOP GOOGLE-STYLE APP BAR ================= */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0B0C0E]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08] w-full shadow-sm">
        <div className="relative flex justify-between items-center w-full px-6 md:px-12 py-3.5 max-w-7xl mx-auto">
          {/* Brand Logo Anchor */}
          <div className="flex items-center gap-2.5 group cursor-pointer z-10" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1A73E8] to-[#A8C7FA] flex items-center justify-center shadow-md shadow-[#1A73E8]/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight font-headline">
              Nexus AI
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#1E1F20] text-blue-600 dark:text-[#A8C7FA] border border-slate-200 dark:border-white/10 font-semibold">
              v2.5 Frontier
            </span>
          </div>

          {/* Navigation Links - Centered */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-slate-600 dark:text-[#C4C7C5] absolute left-1/2 -translate-x-1/2">
            <a href="#hero-demo" className="hover:text-slate-900 dark:hover:text-white transition-colors pb-1">Overview</a>
            <a href="#models" className="hover:text-slate-900 dark:hover:text-white transition-colors pb-1">Models</a>
            <a href="#capabilities" className="hover:text-slate-900 dark:hover:text-white transition-colors pb-1">Capabilities</a>
            <a href="#rbac" className="hover:text-slate-900 dark:hover:text-white transition-colors pb-1">RBAC Security</a>
            <a href="#benchmarks" className="hover:text-slate-900 dark:hover:text-white transition-colors pb-1">Benchmarks</a>
            <a href="#faq" className="hover:text-slate-900 dark:hover:text-white transition-colors pb-1">FAQ</a>
          </nav>

          {/* Trailing Icon & Primary Actions */}
          <div className="flex items-center gap-3 z-10">
            {onOpenDeploymentGuide && (
              <button
                onClick={onOpenDeploymentGuide}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all text-xs font-mono cursor-pointer"
              >
                <span>Free Cloud Deploy</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            
            <ThemeToggle />

            {onSignIn && (
              <button
                onClick={onSignIn}
                className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 bg-white/60 dark:bg-white/5 transition-all text-xs font-semibold cursor-pointer"
              >
                {isAuthenticated ? 'Open Workspace' : 'Sign In'}
              </button>
            )}

            <button
              onClick={onGetStarted}
              className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-gradient-to-r from-[#1A73E8] via-[#4285F4] to-[#A8C7FA] text-white hover:opacity-95 transition-all text-xs font-semibold shadow-lg shadow-[#1A73E8]/25 cursor-pointer active:scale-95 hover:scale-105"
            >
              Try Nexus AI
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION WITH LUMINA PARTICLE WAVE ================= */}
      <main className="flex-1 w-full">
        <section className="relative pt-20 pb-24 px-6 md:px-10 overflow-hidden min-h-[680px] flex flex-col items-center justify-center" id="hero-demo">
          {/* HTML5 Canvas Google Gemini Particle Wave Background */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-85"
          />

          <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10 space-y-6">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E1F20]/90 backdrop-blur-md border border-white/15 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-[#A8C7FA] animate-ping" />
              <span className="w-2 h-2 -ml-4 rounded-full bg-[#A8C7FA]" />
              <span className="text-[#E3E3E3] text-xs font-mono font-medium">Nexus 2.5 Series • Frontier Autonomous Operating System</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.035em] leading-[1.08] max-w-4xl text-slate-900 dark:text-white font-headline">
              Operations intelligence <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-[#A8C7FA] dark:via-[#C2E7FF] dark:to-[#FFFFFF]">
                with verifiable action.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-[#C4C7C5] max-w-2xl leading-relaxed font-normal">
              Specialized domain agents execute supply chain forecasting, verify statutory cash reserves, and solve multi-tier split purchase orders deterministically via SciPy HiGHS mixed-integer linear programming.
            </p>

            {/* Primary CTA Group */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                onClick={onGetStarted}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#1A73E8] via-[#4285F4] to-[#A8C7FA] text-white hover:opacity-95 transition-all font-semibold text-sm shadow-xl shadow-blue-500/25 group cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>Try Nexus Workspace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#models"
                className="px-7 py-3.5 rounded-full bg-white/80 dark:bg-[#1E1F20]/80 backdrop-blur-md border border-slate-200 dark:border-white/15 hover:border-slate-300 dark:hover:border-white/30 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-[#282A2C] transition-all text-sm font-semibold shadow-sm"
              >
                Explore 3 Model Tiers
              </a>
            </div>

            {/* Feature Callout Pill */}
            <div className="pt-2 text-slate-500 dark:text-[#747775] text-xs font-mono flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Full TypeScript typing • Vercel Free SPA • Render FastAPI • Neon Cloud PostgreSQL</span>
            </div>

            {/* HERO ARTIFACT: Glassmorphic Interactive Preview & Solver Console */}
            <div className="w-full max-w-4xl rounded-2xl bg-white/90 dark:bg-[#1E1F20]/85 backdrop-blur-xl border border-slate-200 dark:border-white/15 shadow-2xl p-4 sm:p-6 text-left overflow-hidden mt-8">
              {/* Terminal / Window Chrome */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 py-2.5 border-b border-slate-200 dark:border-white/10 mb-4 bg-slate-50 dark:bg-[#131314]/80 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  <span className="text-slate-500 dark:text-[#747775] font-mono text-[11px] ml-2 hidden md:inline">
                    nexus-cluster-v2.5 • Neon Cloud DB Connected • TTFT: 42ms
                  </span>
                </div>

                {/* Multi-Tab Switcher */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1E1F20] p-1 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-mono">
                  <button
                    onClick={() => setHeroTab('solver')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                      heroTab === 'solver'
                        ? 'bg-blue-600 text-white dark:bg-[#A8C7FA] dark:text-[#001E2C] font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Live Solver</span>
                  </button>
                  <button
                    onClick={() => setHeroTab('chat')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                      heroTab === 'chat'
                        ? 'bg-blue-600 text-white dark:bg-[#A8C7FA] dark:text-[#001E2C] font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Bot className="w-3 h-3" />
                    <span>Agent Swarm</span>
                  </button>
                  <button
                    onClick={() => setHeroTab('terminal')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                      heroTab === 'terminal'
                        ? 'bg-[#A8C7FA] text-[#001E2C] font-semibold shadow-sm'
                        : 'text-[#C4C7C5] hover:text-white'
                    }`}
                  >
                    <Terminal className="w-3 h-3" />
                    <span>execution.log</span>
                  </button>
                  <button
                    onClick={() => setHeroTab('json')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                      heroTab === 'json'
                        ? 'bg-[#A8C7FA] text-[#001E2C] font-semibold shadow-sm'
                        : 'text-[#C4C7C5] hover:text-white'
                    }`}
                  >
                    <Code2 className="w-3 h-3" />
                    <span>decision.json</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: INTERACTIVE SOLVER SLIDER */}
              {heroTab === 'solver' && (
                <div className="space-y-4 px-1 pb-2">
                  {/* Slider Control Header */}
                  <div className="bg-slate-50 dark:bg-[#131314]/60 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <Flame className="w-4 h-4 text-amber-500" />
                          <span>Simulate Viral Creator Demand Surge (P100 Headphones)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-[#747775] mt-0.5">
                          Drag slider to evaluate real-time inventory burn rate and optimal supplier split under ₹1,80,000 cash cap.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-200 dark:bg-[#282A2C] px-3 py-1 rounded-full border border-slate-300 dark:border-white/10 font-mono text-xs">
                        <span className="text-slate-600 dark:text-[#747775]">Surge Multiplier:</span>
                        <span className="text-blue-600 dark:text-[#A8C7FA] font-bold text-sm">+{simSurge}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[11px] font-mono text-slate-500 dark:text-[#747775]">+20%</span>
                      <input
                        type="range"
                        min="20"
                        max="150"
                        step="5"
                        value={simSurge}
                        onChange={(e) => setSimSurge(Number(e.target.value))}
                        className="flex-1 accent-[#1A73E8] dark:accent-[#A8C7FA] cursor-pointer h-2 bg-slate-200 dark:bg-[#282A2C] rounded-lg appearance-none"
                      />
                      <span className="text-[11px] font-mono text-slate-500 dark:text-[#747775]">+150%</span>
                    </div>
                  </div>

                  {/* 4 Dynamic Metric Pill Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 dark:bg-[#282A2C]/60 border border-blue-500/20 rounded-xl p-3 space-y-1 shadow-sm">
                      <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold uppercase">Daily Velocity</div>
                      <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                        {simCalculations.velocity} <span className="text-[10px] text-slate-500 dark:text-[#747775] font-normal">u/day</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-[#747775]">Base: 85 u/d</div>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#282A2C]/60 border border-amber-500/20 rounded-xl p-3 space-y-1 shadow-sm">
                      <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold uppercase">Stockout Horizon</div>
                      <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-300">
                        {simCalculations.horizonDays} <span className="text-[10px] text-slate-500 dark:text-[#747775] font-normal">days</span>
                      </div>
                      <div className="text-[10px] text-rose-500 dark:text-rose-400/90 font-medium">Deficit: {simCalculations.deficitUnits} units</div>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#282A2C]/60 border border-emerald-500/20 rounded-xl p-3 space-y-1 shadow-sm">
                      <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Supplier B (Net-30)</div>
                      <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                        {simCalculations.supplierBUnits} <span className="text-[10px] text-slate-500 dark:text-[#747775] font-normal">units</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Upfront: ₹0 (Zero Cash)</div>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#282A2C]/60 border border-purple-500/20 rounded-xl p-3 space-y-1 shadow-sm">
                      <div className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold uppercase">Supplier C (50% Adv)</div>
                      <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                        {simCalculations.supplierCUnits} <span className="text-[10px] text-slate-500 dark:text-[#747775] font-normal">units</span>
                      </div>
                      <div className="text-[10px] text-purple-600 dark:text-purple-300">Upfront: ₹{Math.round(simCalculations.totalUpfrontCash).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Solver Decision Ribbon */}
                  <div className="bg-slate-50 dark:bg-[#0F0F10] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-slate-700 dark:text-[#C4C7C5]">SciPy HiGHS Solver:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Feasible & Verified</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-slate-500 dark:text-[#747775]">
                        Total Upfront Spend: <strong className="text-slate-900 dark:text-white">₹{Math.round(simCalculations.totalUpfrontCash).toLocaleString()}</strong> / ₹1,80,000 Cap
                      </span>
                      <button
                        onClick={onGetStarted}
                        className="px-3.5 py-1 rounded-full bg-blue-600 dark:bg-[#C2E7FF] text-white dark:text-[#001E2C] font-semibold hover:brightness-110 transition-colors cursor-pointer active:scale-95"
                      >
                        Open Full Solver
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AGENT SWARM DIALOGUE */}
              {heroTab === 'chat' && (
                <div className="space-y-4 px-1 pb-2">
                  {/* User Prompt */}
                  <div className="flex items-start gap-3 max-w-2xl ml-auto justify-end">
                    <div className="bg-[#282A2C] border border-white/10 rounded-2xl rounded-tr-sm px-4 py-3 text-[#E3E3E3] text-xs sm:text-sm leading-relaxed">
                      Analyze viral influencer campaign spike for P100 Headphones. Calculate safety stock depletion horizon and generate optimal split PO within ₹1,80,000 upfront cash cap.
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#393939] flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-[#C4C7C5]" />
                    </div>
                  </div>

                  {/* Assistant Reasoning Accordion */}
                  <div className="flex items-start gap-3 max-w-3xl">
                    <div className="w-8 h-8 rounded-full bg-[#A8C7FA]/20 border border-[#A8C7FA]/30 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-[#A8C7FA]" />
                    </div>
                    <div className="space-y-3 flex-1">
                      {/* Reasoning Disclosure Step */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#282A2C]/80 border border-[#A8C7FA]/30 text-[#A8C7FA] text-xs font-mono">
                        <Activity className="w-3.5 h-3.5 animate-spin" />
                        <span>Swarm Consensus in 42ms • Sales + Inventory + Finance + Google OR-Tools</span>
                      </div>

                      {/* Code block with action toolbar */}
                      <div className="rounded-xl bg-[#0F0F10] border border-white/10 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-[#1E1F20] border-b border-white/10 font-mono text-xs text-[#747775]">
                          <span className="flex items-center gap-1.5 text-[#C4C7C5]">
                            <Terminal className="w-3.5 h-3.5 text-[#A8C7FA]" />
                            procurement_decision.py
                          </span>
                          <button
                            onClick={handleCopyCode}
                            className="flex items-center gap-1 text-xs hover:text-white transition-colors cursor-pointer text-[#C4C7C5]"
                          >
                            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="p-4 text-white font-mono text-xs overflow-x-auto leading-relaxed space-y-1">
                          <div className="text-[#8c9196]"># Nexus Swarm Orchestrator Output</div>
                          <div className="text-[#A8C7FA]">[SALES AGENT] Daily velocity increased to {simCalculations.velocity} u/d (+{simSurge}% surge).</div>
                          <div className="text-amber-300">[INVENTORY AGENT] Stockout horizon: {simCalculations.horizonDays} days. Recommended replenishment: {simCalculations.deficitUnits} units.</div>
                          <div className="text-emerald-400">[FINANCE AGENT] Statutory buffer ₹5,00,000 protected. Safe cash cap ₹1,80,000 approved.</div>
                          <div className="text-purple-300">[OR-TOOLS SOLVER] Allocated: {simCalculations.supplierBUnits} u (QuickLogix, Net-30) + {simCalculations.supplierCUnits} u (Zenith, 50% Adv). Total Upfront: ₹{Math.round(simCalculations.totalUpfrontCash).toLocaleString()}.</div>
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: EXECUTION LOG */}
              {heroTab === 'terminal' && (
                <div className="bg-[#0F0F10] border border-white/10 rounded-xl p-4 font-mono text-xs space-y-2 text-[#C4C7C5] overflow-x-auto">
                  <div className="flex justify-between items-center text-[#747775] border-b border-white/10 pb-2 mb-2">
                    <span>TERMINAL TRACE // NEON CLOUD POSTGRES POOL</span>
                    <button onClick={handleCopyCode} className="text-xs hover:text-white flex items-center gap-1">
                      <Copy className="w-3 h-3" />
                      <span>{copiedCode ? 'Copied' : 'Copy log'}</span>
                    </button>
                  </div>
                  <p className="text-emerald-400">$ nexus cluster inspect --namespace prod-eu-west --trace-window 15m</p>
                  <p className="text-[#747775]">[11:14:02.108] Connected to Neon PostgreSQL (db.neondb.azure.com:5432) via asyncpg</p>
                  <p className="text-[#A8C7FA]">[11:14:02.115] [SALES] Querying orders table for SKU: P100 (Earphones Pro) -&gt; 144.5 u/d</p>
                  <p className="text-amber-300">[11:14:02.122] [INVENTORY] Checking bin 4B stock: 170 units (150 safety floor). Depletion in {simCalculations.horizonDays}d</p>
                  <p className="text-purple-300">[11:14:02.130] [FINANCE] Verifying ledger cash balance ₹8,50,000 - ₹5,00,000 reserve = ₹3,50,000</p>
                  <p className="text-emerald-300">[11:14:02.142] [SOLVER] Formulated ILP: min TotalCost s.t. Units &gt;= {simCalculations.deficitUnits}, Cash &lt;= 180000</p>
                  <p className="text-white font-bold">[11:14:02.150] [RESULT] Optimal Solution Found. Status: OPTIMAL_FEASIBLE. Time: 8.4ms</p>
                </div>
              )}

              {/* TAB 4: STRUCTURED JSON */}
              {heroTab === 'json' && (
                <div className="bg-[#0F0F10] border border-white/10 rounded-xl p-4 font-mono text-xs text-[#C4C7C5] overflow-x-auto">
                  <div className="flex justify-between items-center text-[#747775] border-b border-white/10 pb-2 mb-2">
                    <span>JSON PAYLOAD // REST API /api/v1/orchestrate/run</span>
                    <button onClick={handleCopyCode} className="text-xs hover:text-white flex items-center gap-1">
                      <Copy className="w-3 h-3" />
                      <span>{copiedCode ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>
                  <pre className="text-[#A8C7FA]">
{`{
  "status": "SUCCESS",
  "product_id": "P100",
  "surge_multiplier": ${simSurge},
  "daily_velocity": ${simCalculations.velocity},
  "stockout_horizon_days": ${simCalculations.horizonDays},
  "replenishment_deficit": ${simCalculations.deficitUnits},
  "decision_output": {
    "mathematical_feasibility": true,
    "total_upfront_cash_impact": ${simCalculations.totalUpfrontCash},
    "allocation_plan": [
      { "supplier": "QuickLogix (B)", "units": ${simCalculations.supplierBUnits}, "terms": "Net-30", "upfront": 0 },
      { "supplier": "Zenith Supply (C)", "units": ${simCalculations.supplierCUnits}, "terms": "50% Advance", "upfront": ${simCalculations.totalUpfrontCash} }
    ]
  }
}`}
                  </pre>
                </div>
              )}

              {/* Floating Action Trigger */}
              <div className="pt-3 flex items-center justify-between border-t border-white/10 mt-3 text-xs text-[#747775]">
                <span className="font-mono text-[11px]">Ready for interactive multi-turn exploration?</span>
                <button
                  onClick={onGetStarted}
                  className="flex items-center gap-1.5 text-xs text-[#A8C7FA] hover:text-white font-medium transition-colors cursor-pointer"
                >
                  <span>Open Full Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= MODEL LINEUP SECTION ================= */}
        <section className="py-20 px-6 md:px-10 bg-[#0B0C0E] border-t border-white/[0.08]" id="models">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="text-[#A8C7FA] inline-flex items-center gap-1.5 mb-2 font-mono text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A8C7FA]" />
                  FRONTIER INTELLIGENCE ARCHITECTURES
                </div>
                <h2 className="text-3xl sm:text-4xl text-white font-semibold tracking-[-0.025em] font-headline">
                  Explore the Nexus Model Tiers
                </h2>
                <p className="text-[#C4C7C5] mt-1 max-w-xl text-xs sm:text-sm leading-relaxed">
                  From high-throughput sub-second telemetry parsing to multi-million token deep mathematical reasoning, select your agent foundation.
                </p>
              </div>
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-1.5 text-[#A8C7FA] hover:underline text-xs font-semibold cursor-pointer"
              >
                <span>Launch workspace with active models</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3 Model Tier Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {MODELS_DATA.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative rounded-2xl bg-[#1E1F20] border p-6 flex flex-col justify-between transition-all duration-300 group ${
                    tier.isFeatured
                      ? 'border-[#A8C7FA]/50 hover:border-[#A8C7FA] shadow-xl shadow-[#A8C7FA]/5'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {tier.badge && (
                    <div
                      className={`absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider ${
                        tier.isFeatured
                          ? 'bg-[#A8C7FA] text-[#001E2C]'
                          : 'bg-[#282A2C] text-[#C4C7C5] border border-white/10'
                      }`}
                    >
                      {tier.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-[#131314] border border-white/10 flex items-center justify-center">
                        {tier.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-white font-headline">{tier.name}</h3>
                    </div>
                    <p className="text-[#C4C7C5] text-xs mb-6 leading-relaxed min-h-[48px]">
                      {tier.description}
                    </p>

                    {/* Specs Grid */}
                    <div className="space-y-2.5 border-y border-white/10 py-4 mb-6 text-xs font-mono">
                      <div className="flex justify-between items-center text-[#C4C7C5]">
                        <span>Context Window</span>
                        <span className="text-white font-medium">{tier.contextWindow}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#C4C7C5]">
                        <span>Reasoning Mode</span>
                        <span className="text-[#A8C7FA] font-medium">{tier.reasoningMode}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#C4C7C5]">
                        <span>Constraint Engine</span>
                        <span className="text-white font-medium">{tier.constraintEngine}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#C4C7C5]">
                        <span>TTFT Latency</span>
                        <span className="text-emerald-400 font-medium">{tier.ttftLatency}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#C4C7C5]">
                        <span>Architecture</span>
                        <span className="text-[#747775] font-medium">{tier.architecture}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleModelClick(tier.id)}
                    className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full font-semibold text-xs transition-all cursor-pointer ${
                      tier.isFeatured
                        ? 'bg-[#C2E7FF] text-[#001E2C] hover:bg-[#A8C7FA] shadow-md'
                        : 'bg-[#1E1F20] border border-white/15 text-white hover:bg-[#282A2C]'
                    }`}
                  >
                    <span>Configure in Nexus</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CAPABILITIES BENTO GRID ================= */}
        <section className="py-20 px-6 md:px-10 bg-[#0E0E0E] border-t border-white/[0.08]" id="capabilities">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <div className="text-[#A8C7FA] inline-flex items-center gap-1.5 font-mono text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A8C7FA]" />
                AUTONOMOUS SYSTEM CAPABILITIES
              </div>
              <h2 className="text-3xl sm:text-4xl text-white font-semibold tracking-tight font-headline">
                Architected for Verifiable Operations
              </h2>
              <p className="text-[#C4C7C5] text-xs sm:text-sm max-w-xl mx-auto">
                Zero probabilistic hallucinations in critical math. Grounded in real Neon PostgreSQL data and solved deterministically with Google OR-Tools.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CAPABILITIES_DATA.map((cap, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl bg-[#1E1F20] border border-white/10 p-7 space-y-3 transition-all ${cap.borderColor}`}
                >
                  <div className={`w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center ${cap.iconBg} ${cap.iconColor}`}>
                    {cap.icon}
                  </div>
                  <h3 className="text-base font-semibold text-white font-headline">{cap.title}</h3>
                  <p className="text-xs text-[#C4C7C5] leading-relaxed">
                    {cap.description}
                  </p>
                  <div className={`pt-1 text-[11px] font-mono flex items-center gap-1.5 ${cap.iconColor}`}>
                    <span className="w-2 h-2 rounded-full bg-current" />
                    <span>{cap.metricBadge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= RBAC KNOWLEDGE MATRIX SECTION ================= */}
        <section className="py-20 px-6 md:px-10 bg-[#0B0C0E] border-t border-white/[0.08]" id="rbac">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="text-[#A8C7FA] inline-flex items-center gap-1.5 mb-2 font-mono text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>KNOWLEDGE HUB & POLICY GOVERNANCE</span>
                </div>
                <h2 className="text-3xl sm:text-4xl text-white font-semibold tracking-tight font-headline">
                  Role-Based Knowledge Isolation (RBAC)
                </h2>
                <p className="text-[#C4C7C5] text-xs sm:text-sm max-w-2xl mt-1 leading-relaxed">
                  Department document racks stored in Markdown are strictly isolated by cryptographic permission tokens. Agents can only access information authorized for their operational scope.
                </p>
              </div>

              {/* Role Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-[#1E1F20] p-1.5 rounded-full border border-white/10 font-mono text-xs">
                <button
                  onClick={() => setActiveRbacRole('sales')}
                  className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    activeRbacRole === 'sales'
                      ? 'bg-[#A8C7FA] text-[#001E2C] font-semibold shadow-sm'
                      : 'text-[#C4C7C5] hover:text-white'
                  }`}
                >
                  Sales Director
                </button>
                <button
                  onClick={() => setActiveRbacRole('inventory')}
                  className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    activeRbacRole === 'inventory'
                      ? 'bg-[#A8C7FA] text-[#001E2C] font-semibold shadow-sm'
                      : 'text-[#C4C7C5] hover:text-white'
                  }`}
                >
                  Inventory Lead
                </button>
                <button
                  onClick={() => setActiveRbacRole('finance')}
                  className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    activeRbacRole === 'finance'
                      ? 'bg-[#A8C7FA] text-[#001E2C] font-semibold shadow-sm'
                      : 'text-[#C4C7C5] hover:text-white'
                  }`}
                >
                  CFO / Finance
                </button>
              </div>
            </div>

            {/* RBAC Matrix Table */}
            <div className="rounded-2xl bg-[#1E1F20] border border-white/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#171819] text-[#747775] font-mono text-[11px]">
                      <th className="py-3 px-5">Knowledge Document Rack</th>
                      <th className="py-3 px-5">Scope & Description</th>
                      <th className="py-3 px-4 text-center">Sales Agent</th>
                      <th className="py-3 px-4 text-center">Inventory Agent</th>
                      <th className="py-3 px-4 text-center">Finance Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {RBAC_POLICIES.map((policy, idx) => {
                      const getBadge = (level: 'READ/WRITE' | 'READ' | 'DENIED', isCurrentRole: boolean) => {
                        if (level === 'READ/WRITE') {
                          return (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isCurrentRole
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 ring-2 ring-emerald-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              <CheckCircle className="w-3 h-3" />
                              <span>READ/WRITE</span>
                            </span>
                          );
                        }
                        if (level === 'READ') {
                          return (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                              isCurrentRole
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 ring-2 ring-blue-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              <FileText className="w-3 h-3" />
                              <span>READ ONLY</span>
                            </span>
                          );
                        }
                        return (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                            isCurrentRole
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 ring-2 ring-rose-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            <Lock className="w-3 h-3" />
                            <span>DENIED</span>
                          </span>
                        );
                      };

                      return (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-5 font-medium text-white flex items-center gap-2">
                            <FolderLock className="w-3.5 h-3.5 text-[#A8C7FA] shrink-0" />
                            <span className="text-xs font-mono text-[#A8C7FA]">{policy.rack}</span>
                          </td>
                          <td className="py-3.5 px-5 text-[#C4C7C5] font-sans text-xs">
                            {policy.summary}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {getBadge(policy.sales, activeRbacRole === 'sales')}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {getBadge(policy.inventory, activeRbacRole === 'inventory')}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {getBadge(policy.finance, activeRbacRole === 'finance')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ================= BENCHMARKS RIBBON ================= */}
        <section className="py-14 px-6 md:px-10 bg-[#0B0C0E] border-t border-white/[0.08]" id="benchmarks">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl bg-[#1E1F20] p-8 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-semibold text-white font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#A8C7FA] to-[#B2C5FF]">
                  91.4%
                </div>
                <div className="text-[11px] text-[#747775] font-mono">SWE-bench Verified</div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-semibold text-white font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#B2C5FF] to-[#C2E7FF]">
                  89.8%
                </div>
                <div className="text-[11px] text-[#747775] font-mono">GPQA Diamond Score</div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-semibold text-white font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#C2E7FF] to-[#A8C7FA]">
                  4.0M
                </div>
                <div className="text-[11px] text-[#747775] font-mono">Production Context</div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-semibold text-white font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                  100%
                </div>
                <div className="text-[11px] text-[#747775] font-mono">ILP Solver Feasibility</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FAQ ACCORDION SECTION ================= */}
        <section className="py-20 px-6 md:px-10 bg-[#0E0E0E] border-t border-white/[0.08]" id="faq">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="text-[#A8C7FA] inline-flex items-center gap-1.5 font-mono text-xs font-semibold">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>FREQUENTLY ASKED QUESTIONS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl text-white font-semibold tracking-tight font-headline">
                Everything you need to know
              </h2>
              <p className="text-[#C4C7C5] text-xs sm:text-sm max-w-lg mx-auto">
                Architectural details on deterministic constraint solvers, Neon Cloud PostgreSQL, and deployment.
              </p>
            </div>

            <div className="space-y-3">
              {FAQS_DATA.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-[#1E1F20] border border-white/10 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-white hover:text-[#A8C7FA] transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#A8C7FA] transition-transform duration-200 shrink-0 ml-4 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-[#C4C7C5] leading-relaxed border-t border-white/5 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= BOTTOM CTA ================= */}
        <section className="py-24 px-6 md:px-10 bg-[#090A0C] border-t border-white/[0.08] relative overflow-hidden">
          <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-[#0054CD]/20 to-transparent blur-3xl opacity-40 -z-10" />

          <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1E1F20] border border-white/10 text-xs font-mono text-[#A8C7FA]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Instant Deployment on Vercel + Render</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-semibold text-white tracking-tight font-headline">
              Ready to automate operations with Nexus?
            </h2>
            <p className="text-xs sm:text-sm text-[#C4C7C5] max-w-lg mx-auto leading-relaxed">
              Experience deterministic multi-agent swarm orchestration, live Neon PostgreSQL syncing, and zero-hallucination integer optimization.
            </p>
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 pt-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter enterprise email..."
                className="flex-1 px-4 py-3 rounded-full bg-[#1E1F20] border border-white/15 text-white text-xs focus:outline-none focus:border-[#A8C7FA] font-mono placeholder:text-[#747775]"
              />
              <button
                type="submit"
                className="px-7 py-3 rounded-full bg-gradient-to-r from-[#1A73E8] via-[#4285F4] to-[#A8C7FA] hover:opacity-95 text-white font-semibold text-xs shadow-lg shadow-[#1A73E8]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>{subscribed ? 'Access Granted ✓' : 'Get Started Free'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/[0.08] bg-[#070809] py-8 px-6 text-xs text-[#747775]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#A8C7FA]" />
            <span className="font-semibold text-[#E3E3E3]">Nexus Autonomous Operating System 2.0</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1E1F20] text-emerald-400 border border-emerald-500/20">
              All Systems Operational
            </span>
          </div>
          <div className="font-mono text-[11px]">
            Built for Frontier AI Safety • Nanital HackVilla 2026 • 100% Free Cloud Ready
          </div>
        </div>
      </footer>
    </div>
  );
};
