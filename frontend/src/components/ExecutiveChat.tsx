import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Sliders,
  Send,
  Plus,
  Bot,
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Database,
  ShieldCheck,
  TrendingUp,
  Package,
  DollarSign,
  Cpu,
  Layers,
  Activity,
  Terminal,
  FileText,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Zap,
  Menu,
  X,
  Settings,
  HelpCircle,
  ExternalLink,
  Lock,
  Share2,
  Mic,
  BarChart3,
  GitBranch,
  Network
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  geminiService,
  ChatMessage,
  ChatSession,
  GEMINI_MODELS,
} from '../services/gemini';
import { OverviewMetrics, AgentModelConfig } from '../types';

interface ExecutiveChatProps {
  onBackToLanding: () => void;
  onSwitchToSwarm: () => void;
  activeView: 'chat' | 'swarm';
}

const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: 'sess-1',
    title: 'Viral Demand Spike Analysis (P100)',
    createdAt: 'Just now',
    updatedAt: 'Just now',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Analyze high creator promotional surge (+70%) on P100 Headphones. Formulate optimal supplier split within ₹1.80L cash cap.',
        timestamp: '11:15 AM',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `### Executive Operations Brief: P100 Demand Spike Allocation

Based on multi-agent analysis of live order velocity and warehouse stock levels, here is the verified operational plan:

#### 1. Demand & Stockout Horizon
- **Elevated Velocity**: **145 units/day** (+70% surge detected from active influencer campaign).
- **Current Inventory**: **170 units** in Bin 4B.
- **Safety Floor Depletion**: Expected in **1.17 days** without expedited intervention.
- **7-Day Cumulative Deficit**: **845 units** required to replenish buffer.

#### 2. Liquidity & Statutory Governance
- **Ledger Cash Balance**: ₹8,50,000.
- **Statutory Reserve Lock**: **₹5,00,000 (Locked & Protected)**.
- **Safe Spend Ceiling**: **₹1,80,000**.
- **Optimization Feasibility**: 100% verified via Google OR-Tools Integer Linear Programming (ILP).

#### 3. Recommended Split Purchase Order
- **QuickLogix Logistics (Supplier B)**: **400 units** via **Net-30 credit** at ₹477/unit (₹0 upfront cash, 3-day lead time).
- **Zenith Global Air Freight (Supplier C)**: **445 units** via **50% advance** at ₹436.50/unit (₹97,121 upfront cash, 2-day lead time).
- **Total Upfront Cash Impact**: **₹97,121** (Comfortably within the ₹1,80,000 ceiling).`,
        timestamp: '11:15 AM',
        thinking: `1. [SALES AGENT] Order velocity verified at 144.5 u/d (+70% promotional surge).
2. [INVENTORY AGENT] Bin 4B stock (170 units) will deplete below 150-unit safety floor in 1.17 days. Replenishment deficit: 845 units.
3. [FINANCE AGENT] Verified ₹8.50L ledger with ₹5.00L protected reserve. Safe spend cap of ₹1.80L approved.
4. [OR-TOOLS SOLVER] Allocated: 400 u (QuickLogix, Net-30, ₹0 Upfront) + 445 u (Zenith, 50% Adv, ₹97,121 Upfront). Total upfront: ₹97,121 <= ₹1,80,000 Cap. Feasibility: 100%.`,
        thinkingTimeSec: 2.18,
        modelUsed: 'Gemini 3.6 Flash',
        totalUnits: 845,
        totalUpfrontCash: 97121,
        allocationPlan: [
          {
            supplier: 'QuickLogix Logistics (Supplier B)',
            units: 400,
            unitCost: 477,
            upfrontCash: 0,
            leadTime: '3 days',
            paymentTerms: 'Net-30 Credit (Zero Upfront)',
          },
          {
            supplier: 'Zenith Global Air Freight (Supplier C)',
            units: 445,
            unitCost: 436.5,
            upfrontCash: 97121,
            leadTime: '2 days',
            paymentTerms: '50% Advance Required',
          },
        ],
      },
    ],
  },
  {
    id: 'sess-2',
    title: 'Supplier B vs C Cost & Terms Audit',
    createdAt: 'Yesterday',
    updatedAt: 'Yesterday',
    messages: [],
  },
  {
    id: 'sess-3',
    title: 'Q3 Statutory Cash Reserve Lock',
    createdAt: '2 days ago',
    updatedAt: '2 days ago',
    messages: [],
  },
];

export const ExecutiveChat: React.FC<ExecutiveChatProps> = ({
  onBackToLanding,
  onSwitchToSwarm,
  activeView,
}) => {
  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>(INITIAL_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>('sess-1');

  // Active Model & Prompt State
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.6-flash');
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [surgeSliderOpen, setSurgeSliderOpen] = useState<boolean>(false);
  const [surgeMultiplier, setSurgeMultiplier] = useState<number>(70);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({ 'msg-2': false });
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Settings Modal State
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(geminiService.getApiKey());
  const [apiKeySaved, setApiKeySaved] = useState(false);

  // Auto-scroll ref
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isLoading]);

  // Adjust textarea height dynamically
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleCreateNewChat = () => {
    const newSessionId = `sess-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Operations Query',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      messages: [],
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSessionId);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length === 1) return;
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id) {
      setActiveSessionId(remaining[0].id);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const promptToSend = customText || inputPrompt;
    if (!promptToSend.trim() || isLoading) return;

    const userMessageId = `msg-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: promptToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update active session messages
    const updatedMessages = [...activeSession.messages, userMessage];
    const isFirstMessage = activeSession.messages.length === 0;
    const updatedTitle = isFirstMessage
      ? promptToSend.slice(0, 32) + (promptToSend.length > 32 ? '...' : '')
      : activeSession.title;

    setSessions(
      sessions.map((s) =>
        s.id === activeSessionId
          ? { ...s, title: updatedTitle, messages: updatedMessages, updatedAt: 'Just now' }
          : s
      )
    );

    setInputPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      const response = await geminiService.sendMessage(
        promptToSend,
        updatedMessages,
        selectedModel,
        surgeMultiplier
      );

      const assistantMessage: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thinking: response.thinking,
        thinkingTimeSec: response.thinkingTimeSec,
        allocationPlan: response.allocationPlan,
        totalUpfrontCash: response.totalUpfrontCash,
        totalUnits: response.totalUnits,
        modelUsed: GEMINI_MODELS.find((m) => m.id === selectedModel)?.name || 'Gemini 3.6 Flash',
      };

      setSessions((prevSessions) =>
        prevSessions.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...updatedMessages, assistantMessage], updatedAt: 'Just now' }
            : s
        )
      );
    } catch (err) {
      console.error('Failed to get response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteProcurement = (msgId: string) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#A8C7FA', '#C2E7FF', '#22c55e', '#ffffff'],
    });

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: s.messages.map((m) =>
                m.id === msgId ? { ...m, isExecuted: true } : m
              ),
            }
          : s
      )
    );
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    geminiService.setApiKey(customApiKey);
    setApiKeySaved(true);
    setTimeout(() => {
      setApiKeySaved(false);
      setSettingsOpen(false);
    }, 1200);
  };

  return (
    <div className="flex h-screen w-full bg-[#131313] text-[#E3E3E3] font-sans overflow-hidden">
      {/* ================= GEMINI COLLAPSIBLE SIDEBAR ================= */}
      <aside
        className={`flex flex-col bg-[#1E1F20] border-r border-white/10 transition-all duration-300 ease-in-out z-30 shrink-0 ${
          sidebarOpen ? 'w-72' : 'w-0 -translate-x-full lg:w-16 lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 flex items-center justify-between border-b border-white/5 min-h-[60px]">
          {sidebarOpen ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-[#C4C7C5] hover:text-white hover:bg-[#282A2C] transition-colors cursor-pointer"
                title="Collapse Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="text-sm font-semibold text-white font-headline">Nexus Operations</span>
            </div>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="mx-auto p-1.5 rounded-lg text-[#C4C7C5] hover:text-white hover:bg-[#282A2C] transition-colors cursor-pointer"
              title="Expand Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          {sidebarOpen ? (
            <button
              onClick={handleCreateNewChat}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#282A2C] hover:bg-[#343638] text-white border border-white/10 transition-all text-xs font-semibold shadow-sm cursor-pointer group"
            >
              <Plus className="w-4 h-4 text-[#A8C7FA] group-hover:rotate-90 transition-transform duration-200" />
              <span>New Operational Chat</span>
            </button>
          ) : (
            <button
              onClick={handleCreateNewChat}
              className="w-10 h-10 mx-auto rounded-full bg-[#282A2C] hover:bg-[#343638] text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer"
              title="New Chat"
            >
              <Plus className="w-4 h-4 text-[#A8C7FA]" />
            </button>
          )}
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {sidebarOpen && (
            <div className="px-2 py-1 text-[11px] font-mono text-[#747775] uppercase tracking-wider">
              Recent Inquiries
            </div>
          )}
          {sessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            if (!sidebarOpen) {
              return (
                <button
                  key={sess.id}
                  onClick={() => setActiveSessionId(sess.id)}
                  className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isActive ? 'bg-[#A8C7FA]/20 text-[#A8C7FA] border border-[#A8C7FA]/30' : 'text-[#747775] hover:text-white hover:bg-[#282A2C]'
                  }`}
                  title={sess.title}
                >
                  <Bot className="w-4 h-4" />
                </button>
              );
            }

            return (
              <div
                key={sess.id}
                onClick={() => setActiveSessionId(sess.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#282A2C] text-white font-medium border border-white/10'
                    : 'text-[#C4C7C5] hover:text-white hover:bg-[#282A2C]/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
                  <Bot className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#A8C7FA]' : 'text-[#747775]'}`} />
                  <span className="truncate">{sess.title}</span>
                </div>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteSession(sess.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-[#747775] hover:text-rose-400 transition-opacity p-1"
                    title="Delete session"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer: User Profile & Status */}
        <div className="p-3 border-t border-white/5 space-y-2 bg-[#171819]">
          {sidebarOpen ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-full bg-[#A8C7FA]/20 border border-[#A8C7FA]/30 text-[#A8C7FA] flex items-center justify-center font-bold text-xs shrink-0">
                    R
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white truncate">Rahul</div>
                    <div className="text-[10px] text-[#747775] font-mono truncate">CEO • TechMart Electronics</div>
                  </div>
                </div>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="p-1.5 rounded-lg text-[#747775] hover:text-white hover:bg-[#282A2C] transition-colors cursor-pointer"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[#747775]">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Gemini 3.6 Flash Active</span>
                </div>
                <span>v2.5</span>
              </div>
            </>
          ) : (
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-10 h-10 mx-auto rounded-full bg-[#282A2C] text-[#C4C7C5] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* ================= MAIN CHAT CONTENT STAGE ================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* ================= EXECUTIVE HEADER (NEXUS 1.0 THEME) ================= */}
        <header className="sticky top-0 z-20 bg-[#131313]/95 backdrop-blur-md border-b border-white/10 px-4 md:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-[#C4C7C5] hover:text-white hover:bg-[#1E1F20] transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={onBackToLanding}
              className="flex items-center gap-1.5 text-xs text-[#C4C7C5] hover:text-white bg-[#1E1F20] hover:bg-[#282A2C] px-3 py-1.5 rounded-full border border-white/10 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Landing Page</span>
            </button>

            {/* Mode Switcher Toggle: Executive Chat ⟷ Swarm Studio */}
            <div className="flex items-center bg-[#1E1F20] p-1 rounded-full border border-white/10 font-mono text-xs">
              <button
                onClick={() => {}}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C2E7FF] text-[#001E2C] font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Executive Chat</span>
              </button>
              <button
                onClick={onSwitchToSwarm}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[#C4C7C5] hover:text-white transition-all cursor-pointer"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#B2C5FF]" />
                <span className="hidden sm:inline">Agent Swarm Studio</span>
              </button>
            </div>
          </div>

          {/* Model Switcher & Live KPI Badges */}
          <div className="flex items-center gap-2.5">
            {/* Model Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-[#1E1F20] hover:bg-[#282A2C] border border-white/10 text-white text-xs font-mono rounded-full px-3 py-1.5 pr-7 appearance-none cursor-pointer focus:outline-none focus:border-[#A8C7FA]"
              >
                {GEMINI_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#1E1F20] text-white">
                    {m.name} ({m.badge})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#747775] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Live Financial KPIs */}
            <div className="hidden xl:flex items-center gap-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 bg-[#1E1F20] px-3 py-1 rounded-full border border-white/10">
                <span className="text-[#747775]">Cash:</span>
                <span className="text-emerald-400 font-semibold">₹8,50,000</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#1E1F20] px-3 py-1 rounded-full border border-white/10">
                <span className="text-[#747775]">Safe Cap:</span>
                <span className="text-blue-400 font-semibold">₹1,80,000</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#1E1F20] px-2.5 py-1 rounded-full border border-emerald-500/20 text-emerald-400 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Neon DB Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* ================= CHAT MESSAGE STREAM ================= */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 max-w-4xl w-full mx-auto pb-36">
          {/* Empty State: Gemini Style Welcome */}
          {activeSession.messages.length === 0 ? (
            <div className="pt-8 sm:pt-16 flex flex-col items-center text-center space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-[#A8C7FA]/10 border border-[#A8C7FA]/20 flex items-center justify-center shadow-lg shadow-[#A8C7FA]/10">
                <Sparkles className="w-7 h-7 text-[#A8C7FA]" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#A8C7FA] via-[#C2E7FF] to-[#E3E3E3]">
                  Hello, Rahul
                </h1>
                <p className="text-sm sm:text-base text-[#C4C7C5] max-w-lg mx-auto">
                  How can I help coordinate operations, verify liquidity, and optimize split purchase orders today?
                </p>
              </div>

              {/* 4 Interactive Starter Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-2xl pt-4 text-left">
                <div
                  onClick={() =>
                    handleSendMessage('Analyze viral creator demand spike (+70%) on P100 Headphones and compute stockout horizon.')
                  }
                  className="p-4 rounded-2xl bg-[#1E1F20] border border-white/10 hover:border-[#A8C7FA]/50 hover:bg-[#282A2C] transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span className="flex items-center gap-2 text-[#A8C7FA]">
                      <Flame className="w-4 h-4 text-amber-400" />
                      Viral Demand Surge
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#747775] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-[#C4C7C5] leading-relaxed">
                    Simulate a 70% demand spike on SKU P100 and evaluate inventory burn rate vs. safety stock floor.
                  </p>
                </div>

                <div
                  onClick={() =>
                    handleSendMessage('Formulate Google OR-Tools integer solver for Supplier B vs Supplier C split under ₹1.80L cash cap.')
                  }
                  className="p-4 rounded-2xl bg-[#1E1F20] border border-white/10 hover:border-emerald-500/50 hover:bg-[#282A2C] transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span className="flex items-center gap-2 text-emerald-400">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      Integer Linear Solver
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#747775] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-[#C4C7C5] leading-relaxed">
                    Solve deterministic split PO across QuickLogix (Net-30) and Zenith (50% Advance).
                  </p>
                </div>

                <div
                  onClick={() =>
                    handleSendMessage('Verify statutory cash reserve compliance: confirm ₹5,00,000 lock before issuing advance procurement.')
                  }
                  className="p-4 rounded-2xl bg-[#1E1F20] border border-white/10 hover:border-blue-500/50 hover:bg-[#282A2C] transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span className="flex items-center gap-2 text-blue-400">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      Statutory Reserve Audit
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#747775] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-[#C4C7C5] leading-relaxed">
                    Verify statutory operating reserve lock and compute maximum safe cash expenditure ceiling.
                  </p>
                </div>

                <div
                  onClick={() =>
                    handleSendMessage('Inspect SKU P100 stock on hand (170 units) in Neon Cloud PostgreSQL and review reorder threshold.')
                  }
                  className="p-4 rounded-2xl bg-[#1E1F20] border border-white/10 hover:border-purple-500/50 hover:bg-[#282A2C] transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span className="flex items-center gap-2 text-purple-400">
                      <Database className="w-4 h-4 text-purple-400" />
                      Neon Cloud DB Grounding
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#747775] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-[#C4C7C5] leading-relaxed">
                    Query relational Ground Truth tables across 7 live enterprise databases.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Message List
            activeSession.messages.map((msg) => {
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex items-start justify-end gap-3">
                    <div className="bg-[#282A2C] text-white border border-white/10 rounded-2xl rounded-tr-sm px-5 py-3.5 text-xs sm:text-sm max-w-2xl leading-relaxed shadow-sm">
                      {msg.content}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#343638] text-[#C4C7C5] flex items-center justify-center font-bold text-xs shrink-0">
                      R
                    </div>
                  </div>
                );
              }

              // Assistant Message (Gemini Style)
              const isThinkingOpen = expandedThinking[msg.id] ?? false;

              return (
                <div key={msg.id} className="flex items-start gap-3.5 max-w-4xl">
                  <div className="w-8 h-8 rounded-full bg-[#A8C7FA]/20 border border-[#A8C7FA]/30 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-[#A8C7FA]" />
                  </div>

                  <div className="space-y-4 flex-1 overflow-hidden">
                    {/* Expandable Thinking Process Accordion */}
                    {msg.thinking && (
                      <div className="border border-[#A8C7FA]/20 bg-[#1E1F20]/70 rounded-xl overflow-hidden text-xs font-mono">
                        <button
                          onClick={() =>
                            setExpandedThinking((prev) => ({
                              ...prev,
                              [msg.id]: !isThinkingOpen,
                            }))
                          }
                          className="w-full flex items-center justify-between px-3.5 py-2 text-[#A8C7FA] hover:bg-white/[0.02] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 animate-pulse text-[#A8C7FA]" />
                            <span>
                              Thought for {msg.thinkingTimeSec || 2.1}s • Multi-Agent Consensus Breakdown
                            </span>
                          </div>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isThinkingOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isThinkingOpen && (
                          <div className="px-4 py-3 border-t border-white/5 bg-[#131314] text-[#C4C7C5] whitespace-pre-wrap leading-relaxed text-[11px]">
                            {msg.thinking}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Main Assistant Body */}
                    <div className="bg-[#1E1F20] border border-white/10 rounded-2xl p-5 sm:p-6 text-xs sm:text-sm text-[#E3E3E3] leading-relaxed space-y-4 shadow-md">
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Structured Allocation Table Widget (If Generated) */}
                      {msg.allocationPlan && msg.allocationPlan.length > 0 && (
                        <div className="mt-4 rounded-xl bg-[#131314] border border-white/10 p-4 space-y-3 font-mono">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-[#A8C7FA] font-semibold">
                              <Cpu className="w-4 h-4 text-[#A8C7FA]" />
                              <span>Integer Linear Solver Split Allocation (ILP)</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                              100% Feasible
                            </span>
                          </div>

                          <div className="overflow-x-auto text-[11px]">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-white/10 text-[#747775]">
                                  <th className="pb-2">Supplier</th>
                                  <th className="pb-2">Units</th>
                                  <th className="pb-2">Unit Cost</th>
                                  <th className="pb-2">Upfront Cash</th>
                                  <th className="pb-2">Lead Time</th>
                                  <th className="pb-2">Payment Terms</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 text-[#C4C7C5]">
                                {msg.allocationPlan.map((alloc, idx) => (
                                  <tr key={idx}>
                                    <td className="py-2 text-white font-medium">{alloc.supplier}</td>
                                    <td className="py-2 text-[#A8C7FA] font-bold">{alloc.units}</td>
                                    <td className="py-2">₹{alloc.unitCost}</td>
                                    <td className="py-2 text-emerald-400 font-bold">
                                      ₹{alloc.upfrontCash.toLocaleString()}
                                    </td>
                                    <td className="py-2">{alloc.leadTime}</td>
                                    <td className="py-2 text-xs text-[#747775]">{alloc.paymentTerms}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Purchase Order Execution Trigger */}
                          <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <span className="text-[#747775] text-[11px]">
                              Total Upfront Spend: <strong className="text-white">₹{msg.totalUpfrontCash?.toLocaleString()}</strong> / ₹1,80,000 Cap
                            </span>
                            <button
                              onClick={() => handleExecuteProcurement(msg.id)}
                              disabled={msg.isExecuted}
                              className={`px-4 py-1.5 rounded-full font-semibold transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
                                msg.isExecuted
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-[#C2E7FF] text-[#001E2C] hover:bg-[#A8C7FA] shadow-md'
                              }`}
                            >
                              {msg.isExecuted ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Committed to Neon DB ✓</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>Execute Split PO in Neon DB</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action Toolbar */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-[#747775]">
                        <span className="font-mono text-[10px]">
                          Model: {msg.modelUsed || 'Gemini 3.6 Flash'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="p-1.5 rounded-md hover:text-white hover:bg-[#282A2C] transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                            title="Copy Response"
                          >
                            {copiedMessageId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedMessageId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>
                          <button
                            onClick={onSwitchToSwarm}
                            className="p-1.5 rounded-md hover:text-[#B2C5FF] hover:bg-[#282A2C] transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                            title="Inspect in Swarm Studio DAG"
                          >
                            <GitBranch className="w-3.5 h-3.5" />
                            <span>Inspect DAG</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3.5 max-w-4xl">
              <div className="w-8 h-8 rounded-full bg-[#A8C7FA]/20 border border-[#A8C7FA]/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#A8C7FA] animate-spin" />
              </div>
              <div className="bg-[#1E1F20] border border-white/10 rounded-2xl p-4 space-y-2 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#A8C7FA] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#A8C7FA] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#A8C7FA] animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs font-mono text-[#A8C7FA] ml-2">
                  Gemini Orchestrator formulating multi-agent decision...
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </main>

        {/* ================= FLOATING GEMINI BOTTOM PROMPT BAR ================= */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#131313] via-[#131313]/90 to-transparent pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto space-y-2">
            {/* Quick Demand Surge Drawer Popover */}
            {surgeSliderOpen && (
              <div className="bg-[#1E1F20] border border-[#A8C7FA]/30 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono mb-2">
                <div className="flex items-center gap-2 text-white">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Demand Surge Multiplier:</span>
                  <span className="text-[#A8C7FA] font-bold text-sm">+{surgeMultiplier}%</span>
                </div>
                <div className="flex items-center gap-3 flex-1 max-w-md">
                  <span className="text-[10px] text-[#747775]">+20%</span>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    step="5"
                    value={surgeMultiplier}
                    onChange={(e) => setSurgeMultiplier(Number(e.target.value))}
                    className="flex-1 accent-[#A8C7FA] h-2 bg-[#282A2C] rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-[#747775]">+150%</span>
                </div>
                <button
                  onClick={() => {
                    setSurgeSliderOpen(false);
                    handleSendMessage(`Run solver under +${surgeMultiplier}% viral demand spike on SKU P100.`);
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#C2E7FF] text-[#001E2C] font-semibold hover:bg-[#A8C7FA] transition-all cursor-pointer"
                >
                  Apply & Run
                </button>
              </div>
            )}

            {/* Main Rounded Input Bar */}
            <div className="bg-[#1E1F20]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-2.5 sm:p-3 flex items-end gap-2 shadow-2xl focus-within:border-[#A8C7FA]/60 transition-all">
              {/* Attachment / Action Tools */}
              <div className="flex items-center gap-1 pb-1 pl-1">
                <button
                  onClick={() => setSurgeSliderOpen(!surgeSliderOpen)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    surgeSliderOpen ? 'bg-[#A8C7FA] text-[#001E2C]' : 'text-[#C4C7C5] hover:text-white hover:bg-[#282A2C]'
                  }`}
                  title="Simulate Demand Surge Slider"
                >
                  <Sliders className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSendMessage('Query inventory stock on hand in Neon PostgreSQL and evaluate safety buffers.')}
                  className="p-2 rounded-full text-[#C4C7C5] hover:text-white hover:bg-[#282A2C] transition-colors cursor-pointer hidden sm:inline-flex"
                  title="Query Ground Truth Database"
                >
                  <Database className="w-4 h-4" />
                </button>
              </div>

              {/* Textarea Input */}
              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask Nexus to run demand spike solver, audit statutory reserves, or allocate purchase orders..."
                rows={1}
                className="flex-1 bg-transparent text-white text-xs sm:text-sm px-2 py-1.5 focus:outline-none resize-none max-h-36 leading-relaxed placeholder:text-[#747775]"
              />

              {/* Trailing Controls & Send Button */}
              <div className="flex items-center gap-1.5 pb-1 pr-1">
                <div className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[#282A2C] border border-white/10 text-[#747775] text-[10px] font-mono">
                  Enter ↵
                </div>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputPrompt.trim() || isLoading}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    inputPrompt.trim() && !isLoading
                      ? 'bg-[#C2E7FF] text-[#001E2C] hover:bg-[#A8C7FA] shadow-md scale-100'
                      : 'bg-[#282A2C] text-[#747775] cursor-not-allowed opacity-60'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Disclaimer Subtitle */}
            <p className="text-center text-[#747775] text-[11px] font-mono">
              Nexus 2.0 AI generates verifiable operations intelligence grounded in Neon Cloud PostgreSQL.
            </p>
          </div>
        </div>
      </div>

      {/* ================= SETTINGS MODAL ================= */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1F20] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#A8C7FA]" />
                <h3 className="text-sm font-semibold text-white font-headline">Enterprise Configuration</h3>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-[#747775] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-[#C4C7C5] block">Google Gemini API Key:</label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="Enter Gemini API key..."
                  className="w-full bg-[#131314] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#A8C7FA]"
                />
                <p className="text-[10px] text-[#747775]">
                  Active key: {customApiKey ? `••••${customApiKey.slice(-6)}` : 'Default Key'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#C4C7C5] block">Neon PostgreSQL Ground Truth:</label>
                <div className="bg-[#131314] border border-white/10 rounded-xl p-3 text-[11px] text-emerald-400 flex items-center justify-between">
                  <span>db.neondb.azure.com:5432</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="px-4 py-2 rounded-full bg-[#282A2C] text-[#C4C7C5] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#C2E7FF] text-[#001E2C] font-semibold hover:bg-[#A8C7FA] transition-all"
                >
                  {apiKeySaved ? 'Saved ✓' : 'Save Config'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
