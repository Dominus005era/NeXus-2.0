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
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Image as ImageIcon,
  Video,
  FolderKanban,
  Paperclip,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  geminiService,
  ChatMessage,
  ChatSession,
  GEMINI_MODELS,
} from '../services/gemini';
import { OverviewMetrics, AgentModelConfig } from '../types';
import { api } from '../services/api';
import { ThemeToggle } from '../context/ThemeContext';

interface ExecutiveChatProps {
  onBackToLanding: () => void;
  onSwitchToSwarm: () => void;
  activeView: 'chat' | 'swarm';
}

// Dynamic Suggestion Prompts Generator based on Company, Primary Product, and Drive Database
const getSuggestedPrompts = (company: string, product: string) => [
  {
    title: 'Google Drive Database',
    subtitle: 'Verify products, inventory & vendors from Drive',
    icon: Database,
    prompt: `List our Google Drive database catalog, current stock levels, and active suppliers for ${company}.`,
  },
  {
    title: `Analyze ${product} Surge`,
    subtitle: `+70% promotional spike & supplier split`,
    icon: Flame,
    prompt: `Analyze high creator promotional surge (+70%) on ${product} for ${company}. Formulate optimal supplier split within ₹1.80L cash cap.`,
  },
  {
    title: 'Audit Statutory Reserves',
    subtitle: `Verify ${company} ₹5.00L statutory cash lock & spend ceiling`,
    icon: ShieldCheck,
    prompt: `Audit ${company} treasury liquidity, statutory reserve lock compliance (₹5.00L), and verify maximum safe spend ceiling.`,
  },
  {
    title: `${product} Stockout Horizon`,
    subtitle: 'Inventory velocity & safety stock floor',
    icon: AlertTriangle,
    prompt: `Calculate exact stockout horizon for ${product} inventory based on elevated daily burn rate from Google Drive records.`,
  },
];

// Helper function to parse inline markdown (bold **text**, `code`, etc.)
const parseInlineFormatting = (text: string) => {
  if (!text) return '';
  // Split by bold (**...**) or code (`...`)
  const parts = text.split(/(\*\*[\s\S]*?\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#131314] font-mono text-[11px] text-blue-600 dark:text-[#A8C7FA] border border-slate-200 dark:border-[#2D2E30]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

// Rich Markdown Formatter for Assistant Briefs
const renderFormattedMarkdown = (content: string) => {
  if (!content) return null;
  const lines = content.split('\n');

  return (
    <div className="space-y-2 font-sans leading-relaxed text-slate-800 dark:text-[#E3E3E3]">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Headings (#, ##, ###, ####)
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-lg font-bold text-slate-900 dark:text-white mt-3 mb-1 pb-1 border-b border-slate-200 dark:border-[#2D2E30] font-heading">
              {parseInlineFormatting(trimmed.replace(/^#\s+/, ''))}
            </h1>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1 flex items-center space-x-2 font-heading">
              <span className="w-1.5 h-3.5 bg-[#4285F4] rounded-full inline-block"></span>
              <span>{parseInlineFormatting(trimmed.replace(/^##\s+/, ''))}</span>
            </h2>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-sm font-bold text-blue-600 dark:text-[#A8C7FA] mt-2 mb-1 uppercase tracking-wider font-heading">
              {parseInlineFormatting(trimmed.replace(/^###\s+/, ''))}
            </h3>
          );
        }
        if (trimmed.startsWith('#### ')) {
          return (
            <h4 key={idx} className="text-xs font-semibold text-blue-600 dark:text-[#A8C7FA] mt-2 mb-1">
              {parseInlineFormatting(trimmed.replace(/^####\s+/, ''))}
            </h4>
          );
        }

        // Bullet Lists (- or *)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletContent = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={idx} className="flex items-start space-x-2 my-1 pl-1 text-xs sm:text-sm text-slate-700 dark:text-[#C4C7C5]">
              <span className="text-[#4285F4] font-bold mt-1 text-xs shrink-0">•</span>
              <span className="flex-1">{parseInlineFormatting(bulletContent)}</span>
            </div>
          );
        }

        // Numbered Lists (1. 2. etc)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start space-x-2 my-1 pl-1 text-xs sm:text-sm text-slate-800 dark:text-[#E3E3E3]">
              <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#131314] text-blue-600 dark:text-[#A8C7FA] font-mono text-[10px] border border-slate-200 dark:border-[#2D2E30] font-bold shrink-0 mt-0.5">
                {numMatch[1]}
              </span>
              <span className="flex-1">{parseInlineFormatting(numMatch[2])}</span>
            </div>
          );
        }

        // Default Paragraph
        return (
          <p key={idx} className="my-1 text-xs sm:text-sm text-slate-800 dark:text-[#D8D8D8]">
            {parseInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const ExecutiveChat: React.FC<ExecutiveChatProps> = ({
  onBackToLanding,
  onSwitchToSwarm,
  activeView,
}) => {
  // Dynamic workspace config
  const workspaceConfig = React.useMemo(() => {
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

  const userName = workspaceConfig?.userName || 'Rahul Singh';
  const userRole = workspaceConfig?.userRole || 'CEO & Founder';
  const authorityLevel = workspaceConfig?.authorityLevel || 'LEVEL_4_EXECUTIVE';
  const companyName = workspaceConfig?.companyName || 'TechMart Electronics';
  const primaryProduct = workspaceConfig?.primaryProduct || 'P100 Headphones';

  const suggestedPrompts = React.useMemo(
    () => getSuggestedPrompts(companyName, primaryProduct),
    [companyName, primaryProduct]
  );

  // Sidebar & Sessions State (Starting completely fresh without dummy chats)
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('nexus_chat_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    return localStorage.getItem('nexus_active_session_id') || null;
  });

  // Current Input & Chat State
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.6-flash');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [executedPOs, setExecutedPOs] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Save active session id to localStorage
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('nexus_active_session_id', activeSessionId);
    } else {
      localStorage.removeItem('nexus_active_session_id');
    }
  }, [activeSessionId]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId, isLoading]);

  // Get active session messages
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const currentMessages = activeSession ? activeSession.messages : [];

  // Create New Chat Session
  const handleCreateNewChat = () => {
    const newSessionId = `sess-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Operational Inquiry',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      messages: [],
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSessionId);
  };

  // Delete Chat Session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    if (activeSessionId === sessionId) {
      setActiveSessionId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // Handle Send Prompt
  const handleSendPrompt = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || inputPrompt).trim();
    if (!promptToSend || isLoading) return;

    setInputPrompt('');

    let sessionId = activeSessionId;
    let targetSession = sessions.find((s) => s.id === sessionId);

    // If no active session exists, create one
    if (!sessionId || !targetSession) {
      sessionId = `sess-${Date.now()}`;
      const titleSnippet = promptToSend.length > 30 ? promptToSend.slice(0, 30) + '...' : promptToSend;
      targetSession = {
        id: sessionId,
        title: titleSnippet,
        createdAt: 'Just now',
        updatedAt: 'Just now',
        messages: [],
      };
      setSessions((prev) => [targetSession!, ...prev]);
      setActiveSessionId(sessionId);
    } else if (targetSession.messages.length === 0) {
      // Update session title based on first prompt
      const titleSnippet = promptToSend.length > 30 ? promptToSend.slice(0, 30) + '...' : promptToSend;
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: titleSnippet } : s))
      );
    }

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Save active prompt and flag to trigger live Swarm Studio visualization automatically when switching tabs
    localStorage.setItem('nexus_active_prompt', promptToSend);
    localStorage.setItem('nexus_trigger_swarm_sim', 'true');

    // Add user message to session
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, messages: [...s.messages, userMessage] } : s
      )
    );

    setIsLoading(true);

    try {
      // Get conversation history for Gemini API
      const history = targetSession ? targetSession.messages : [];
      const response = await geminiService.sendMessage(promptToSend, history, selectedModel);

      const assistantMessage: ChatMessage = {
        id: `msg-ast-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thinking: response.thinking,
        thinkingTimeSec: response.thinkingTimeSec,
        allocationPlan: response.allocationPlan,
        totalUpfrontCash: response.totalUpfrontCash,
        totalUnits: response.totalUnits,
        modelUsed: GEMINI_MODELS.find((m) => m.id === selectedModel)?.name || selectedModel,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, messages: [...s.messages, assistantMessage] } : s
        )
      );
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `**Execution Error**: Unable to complete multi-agent orchestration reasoning. Details: ${err.message || 'Network error'}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, messages: [...s.messages, errorMessage] } : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Copy Message Content
  const handleCopy = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Execute PO Split Action
  const handleExecutePOSplit = async (msgId: string) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setExecutedPOs((prev) => ({ ...prev, [msgId]: true }));
    try {
      await api.reviewDecision(msgId, 'APPROVED', `Purchase Order executed by ${userRole} (${userName})`);
    } catch (err) {
      console.warn('Backend decision audit sync error:', err);
    }
  };

  // Filter sessions by search
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-[#0B0C0E] text-[#E3E3E3] font-sans overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. LEFT SIDE PANEL (GEMINI INSPIRED COLLAPSIBLE / EXPANDABLE SIDEBAR)     */}
      {/* ========================================================================= */}
      <aside
        className={`flex flex-col border-r border-slate-200 dark:border-[#2D2E30]/70 bg-white/95 dark:bg-[#1E1F20] transition-all duration-300 ease-in-out z-20 shadow-sm ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        {/* Top Header of Side Panel */}
        <div className="flex items-center justify-between h-14 px-3 border-b border-slate-200 dark:border-[#2D2E30]/50">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1A73E8] via-[#4285F4] to-[#A8C7FA] flex items-center justify-center shadow-lg shadow-[#1A73E8]/20">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white font-heading">
                Nexus AI
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1A73E8] via-[#4285F4] to-[#A8C7FA] flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:text-[#999999] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2D2E30] transition-colors"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Action Button: New Chat */}
        <div className="p-3">
          <button
            onClick={handleCreateNewChat}
            className={`w-full flex items-center justify-center space-x-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#2A2B2D] dark:hover:bg-[#35373A] text-slate-800 dark:text-white py-2.5 px-4 font-medium text-sm transition-all border border-slate-200 dark:border-[#3A3B3E]/60 shadow-sm ${
              !sidebarOpen ? 'px-0 justify-center' : ''
            }`}
          >
            <Plus className="w-4 h-4 text-blue-600 dark:text-[#A8C7FA]" />
            {sidebarOpen && <span>New Operational Chat</span>}
          </button>
        </div>

        {/* Search Bar (Only Expanded) */}
        {sidebarOpen && (
          <div className="px-3 mb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-[#888888]" />
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#131314] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#777777] pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-[#2D2E30] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Recent Inquiries List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 py-1">
          {sidebarOpen && (
            <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-[#888888] uppercase tracking-wider">
              Recent Inquiries
            </div>
          )}

          {filteredSessions.length === 0 ? (
            sidebarOpen && (
              <div className="px-3 py-6 text-center text-xs text-slate-400 dark:text-[#777777] italic">
                No recent inquiries. Start a new chat above.
              </div>
            )
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <button
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`w-full flex items-center group relative rounded-xl px-2.5 py-2 text-xs transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-[#004A77]/40 text-blue-700 dark:text-[#A8C7FA] font-medium border border-blue-200 dark:border-[#1A73E8]/40'
                      : 'text-slate-600 dark:text-[#C4C7C5] hover:bg-slate-100 dark:hover:bg-[#2A2B2D] hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={session.title}
                >
                  <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600 dark:text-[#A8C7FA]' : 'text-slate-400 dark:text-[#888888]'}`} />
                  {sidebarOpen && (
                    <>
                      <span className="ml-2.5 truncate text-left flex-1">
                        {session.title}
                      </span>
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 dark:hover:text-red-400 text-slate-400 dark:text-[#888888] transition-opacity"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Bottom User Profile Section */}
        <div className="border-t border-slate-200 dark:border-[#2D2E30]/70 p-3 bg-slate-50 dark:bg-[#18191A]">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1A73E8] to-[#A8C7FA] flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {userName ? userName.charAt(0).toUpperCase() : 'E'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{userName}</div>
                  <div className="text-[10px] text-blue-600 dark:text-[#A8C7FA] font-medium truncate">{userRole} • {companyName}</div>
                </div>
              </div>
              <button
                onClick={() => {}}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:text-[#888888] dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#2D2E30] rounded-lg transition-colors"
                title="Workspace Information"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <button
                onClick={() => {}}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:text-[#888888] dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#2D2E30] rounded-lg transition-colors"
                title="Workspace Information"
              >
                <Settings className="w-4 h-4" />
              </button>
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#1A73E8] to-[#A8C7FA] flex items-center justify-center text-white font-bold text-[11px]">
                {userName ? userName.charAt(0).toUpperCase() : 'E'}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA (EXECUTIVE HEADER + GEMINI CHAT CONTAINER)           */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0B0C0E] relative overflow-hidden transition-colors duration-200">
        {/* EXECUTIVE HEADER BAR (PRESERVED NEXUS 2.0 HEADER) */}
        <header className="h-14 border-b border-slate-200 dark:border-[#2D2E30]/70 bg-white/90 dark:bg-[#131314]/90 backdrop-blur-md px-4 flex items-center justify-between z-10 shrink-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToLanding}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E1F20] dark:hover:bg-[#2A2B2D] text-slate-700 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-white text-xs font-medium border border-slate-200 dark:border-[#2D2E30] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Landing Page</span>
            </button>

            {/* Toggle Switch between Executive Chat & Agent Swarm Studio */}
            <div className="flex items-center bg-slate-100 dark:bg-[#1E1F20] p-0.5 rounded-full border border-slate-200 dark:border-[#2D2E30]">
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeView === 'chat'
                    ? 'bg-[#1A73E8] text-white shadow-md'
                    : 'text-slate-500 dark:text-[#888888] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Executive Chat
              </button>
              <button
                onClick={onSwitchToSwarm}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeView === 'swarm'
                    ? 'bg-[#1A73E8] text-white shadow-md'
                    : 'text-slate-500 dark:text-[#888888] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Agent Swarm Studio
              </button>
            </div>
          </div>

          {/* Model Switcher & Live KPI Badges */}
          <div className="flex items-center space-x-2.5">
            {/* Google Drive Database Status Badge */}
            <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#1E1F20] border border-slate-200 dark:border-[#2D2E30] text-xs">
              <Database className="w-3.5 h-3.5 text-blue-500 dark:text-[#4285F4]" />
              <span className="text-slate-500 dark:text-[#888888]">Drive DB:</span>
              <span className="text-[10px] text-emerald-600 dark:text-[#34A853] font-mono font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span>Grounded</span>
              </span>
            </div>

            {/* Active Role & Authority Badge */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#1E1F20] border border-slate-200 dark:border-[#2D2E30] text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-[#34A853]" />
              <span className="text-slate-500 dark:text-[#888888]">Role:</span>
              <span className="font-semibold text-slate-800 dark:text-white truncate max-w-[130px]">{userRole}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-[#34A853]/15 text-emerald-700 dark:text-[#34A853] font-mono font-bold">
                {authorityLevel}
              </span>
            </div>

            {/* Model Dropdown Selector */}
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="appearance-none bg-slate-100 dark:bg-[#1E1F20] text-xs font-medium text-slate-800 dark:text-[#E3E3E3] border border-slate-200 dark:border-[#2D2E30] rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {GEMINI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.badge})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#888888] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* KPI 1: Cash */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#1E1F20] border border-slate-200 dark:border-[#2D2E30] text-xs">
              <span className="text-slate-500 dark:text-[#888888]">Cash:</span>
              <span className="font-semibold text-emerald-600 dark:text-[#81C995]">₹8,50,000</span>
            </div>

            {/* KPI 2: Safe Cap */}
            <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#1E1F20] border border-slate-200 dark:border-[#2D2E30] text-xs">
              <span className="text-slate-500 dark:text-[#888888]">Safe Cap:</span>
              <span className="font-semibold text-blue-600 dark:text-[#A8C7FA]">₹1,80,000</span>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* CHAT DISPLAY BODY */}
        <div className="flex-1 overflow-y-auto relative flex flex-col">
          {/* Radial Ambient Glow (Subtle in light, atmospheric in dark) */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 dark:from-[#1A73E8]/10 via-transparent dark:via-[#0B0C0E]/90 to-transparent dark:to-[#0B0C0E] pointer-events-none" />

          {currentMessages.length === 0 ? (
            /* ========================================================================= */
            /* ZERO MESSAGES / GEMINI CENTERPIECE WELCOME VIEW                           */
            /* ========================================================================= */
            <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto w-full z-10 py-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#2D2E30] mb-4 shadow-xl shadow-blue-500/10">
                  <Sparkles className="w-8 h-8 text-blue-500 dark:text-[#A8C7FA] animate-pulse" />
                </div>
                <h1 className="text-3xl md:text-4xl font-normal tracking-tight text-slate-900 dark:text-white font-heading">
                  The mic is yours, <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-[#A8C7FA] dark:via-[#4285F4] dark:to-[#A855F7] bg-clip-text text-transparent font-medium">{userName ? userName.split(' ')[0] : 'Executive'}</span>
                </h1>
                <p className="text-slate-500 dark:text-[#888888] text-sm mt-2 max-w-md mx-auto">
                  What supply chain allocation or liquidity optimization can Nexus assist you with today?
                </p>
              </div>

              {/* CENTER FLOATING GEMINI-STYLE INPUT CAPSULE */}
              <div className="w-full max-w-2xl bg-white dark:bg-[#1E1F20]/90 backdrop-blur-xl border border-slate-200 dark:border-[#3A3B3E] rounded-3xl p-3 shadow-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <textarea
                  rows={2}
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendPrompt();
                    }
                  }}
                  placeholder="Ask Nexus to run demand spike solver, audit statutory reserves, or allocate POs..."
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#777777] resize-none focus:outline-none px-3 pt-1"
                />

                <div className="flex items-center justify-between pt-2 px-2 border-t border-slate-100 dark:border-[#2D2E30]/40">
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 rounded-full text-slate-400 dark:text-[#888888] hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2D2E30] transition-colors"
                      title="Attach context file"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#131314] text-[11px] text-blue-600 dark:text-[#A8C7FA] border border-slate-200 dark:border-[#2D2E30]">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-[#4285F4]" />
                      <span>{GEMINI_MODELS.find((m) => m.id === selectedModel)?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 rounded-full text-slate-400 dark:text-[#888888] hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2D2E30] transition-colors"
                      title="Voice Input"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSendPrompt()}
                      disabled={!inputPrompt.trim() || isLoading}
                      className="p-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 disabled:opacity-40 text-white transition-all shadow-md cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* QUICK PROMPT SUGGESTION CHIPS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
                {suggestedPrompts.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendPrompt(item.prompt)}
                      className="flex items-start p-3.5 rounded-2xl bg-white dark:bg-[#1E1F20]/60 hover:bg-slate-50 dark:hover:bg-[#252629] border border-slate-200 dark:border-[#2D2E30] hover:border-blue-400 dark:hover:border-[#4285F4]/40 text-left transition-all shadow-sm group cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-blue-50 dark:bg-[#131314] text-blue-600 dark:text-[#A8C7FA] group-hover:text-blue-700 dark:group-hover:text-white transition-colors mr-3 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-[#A8C7FA] transition-colors flex items-center justify-between">
                          <span>{item.title}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-blue-500" />
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-[#888888] mt-0.5">{item.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* ACTIVE CHAT MESSAGE STREAM                                               */
            /* ========================================================================= */
            <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full space-y-6 z-10">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* USER MESSAGE */}
                  {msg.role === 'user' ? (
                    <div className="flex items-start space-x-2 max-w-2xl">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#2A2B2D] dark:to-[#2A2B2D] text-white text-sm px-4 py-3 rounded-2xl rounded-tr-xs border border-blue-500/20 dark:border-[#3A3B3E]/60 shadow-md">
                        {msg.content}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1A73E8] to-[#A8C7FA] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                        {userName ? userName.charAt(0).toUpperCase() : 'E'}
                      </div>
                    </div>
                  ) : (
                    /* ASSISTANT MESSAGE */
                    <div className="w-full flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1A73E8] via-[#4285F4] to-[#A855F7] flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                        <Sparkles className="w-4 h-4" />
                      </div>

                      <div className="flex-1 space-y-3 max-w-3xl">
                        {/* Thinking Accordion Step */}
                        {msg.thinking && (
                          <div className="rounded-xl border border-slate-200 dark:border-[#2D2E30] bg-slate-50/80 dark:bg-[#1E1F20]/80 overflow-hidden shadow-sm">
                            <button
                              onClick={() =>
                                setExpandedThinking((prev) => ({
                                  ...prev,
                                  [msg.id]: !prev[msg.id],
                                }))
                              }
                              className="w-full px-3 py-2 flex items-center justify-between text-xs text-blue-600 dark:text-[#A8C7FA] hover:bg-slate-100 dark:hover:bg-[#252628] transition-colors cursor-pointer"
                            >
                              <div className="flex items-center space-x-2">
                                <Cpu className="w-3.5 h-3.5 text-blue-500 dark:text-[#4285F4]" />
                                <span>
                                  Thought for {msg.thinkingTimeSec || 2.18}s • Multi-Agent Consensus Breakdown
                                </span>
                              </div>
                              {expandedThinking[msg.id] ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {expandedThinking[msg.id] && (
                              <div className="p-3 bg-white dark:bg-[#131314] text-[11px] font-mono text-slate-700 dark:text-[#C4C7C5] border-t border-slate-200 dark:border-[#2D2E30] whitespace-pre-wrap leading-relaxed">
                                {msg.thinking}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Main Response Markdown Container */}
                        <div className="bg-white dark:bg-[#1E1F20] text-sm text-slate-800 dark:text-[#E3E3E3] p-5 rounded-2xl border border-slate-200 dark:border-[#2D2E30] shadow-md space-y-3 leading-relaxed">
                          <div>
                            {renderFormattedMarkdown(msg.content)}
                          </div>

                          {/* INTERACTIVE PO SPLIT ALLOCATION CARD */}
                          {msg.allocationPlan && (
                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#2D2E30]">
                              <div className="text-xs font-semibold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                                <span>Recommended PO Split Allocation</span>
                                <span className="text-emerald-600 dark:text-[#81C995] font-mono font-bold">
                                  Total Upfront: ₹{msg.totalUpfrontCash?.toLocaleString()}
                                </span>
                              </div>

                              <div className="space-y-2">
                                {msg.allocationPlan.map((po, pIdx) => (
                                  <div
                                    key={pIdx}
                                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#2D2E30] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
                                  >
                                    <div>
                                      <div className="font-semibold text-slate-900 dark:text-white">{po.supplier}</div>
                                      <div className="text-slate-500 dark:text-[#888888] text-[11px]">
                                        {po.units} units @ ₹{po.unitCost}/unit • {po.paymentTerms}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-blue-600 dark:text-[#A8C7FA] font-medium">
                                        Upfront: ₹{po.upfrontCash.toLocaleString()}
                                      </div>
                                      <div className="text-slate-400 dark:text-[#888888] text-[10px]">Lead Time: {po.leadTime}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-3 flex justify-end">
                                <button
                                  onClick={() => handleExecutePOSplit(msg.id)}
                                  disabled={executedPOs[msg.id]}
                                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-md cursor-pointer ${
                                    executedPOs[msg.id]
                                      ? 'bg-emerald-100 dark:bg-[#34A853]/20 text-emerald-700 dark:text-[#81C995] border border-emerald-300 dark:border-[#34A853]/40'
                                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white'
                                  }`}
                                >
                                  {executedPOs[msg.id] ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>PO Split Executed & Transmitted</span>
                                    </>
                                  ) : (
                                    <>
                                      <Zap className="w-3.5 h-3.5" />
                                      <span>Approve & Transmit PO Split</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Message Action Footer Bar */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#2D2E30]/40 text-xs text-slate-400 dark:text-[#888888]">
                            <div className="text-[11px] font-mono">
                              Model: {msg.modelUsed || selectedModel} • {msg.timestamp}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleCopy(msg.id, msg.content)}
                                className="p-1 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                                title="Copy response"
                              >
                                {copiedMsgId === msg.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1A73E8] to-[#A855F7] flex items-center justify-center text-white shrink-0 animate-spin">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-white dark:bg-[#1E1F20] px-4 py-3 rounded-2xl border border-slate-200 dark:border-[#2D2E30] text-xs text-blue-600 dark:text-[#A8C7FA] flex items-center space-x-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    <span>Orchestrating multi-agent integer linear programming solver...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* FLOATING BOTTOM INPUT CAPSULE (WHEN MESSAGES ARE ACTIVE) */}
        {currentMessages.length > 0 && (
          <div className="p-4 z-10 shrink-0 max-w-4xl mx-auto w-full">
            <div className="bg-white dark:bg-[#1E1F20]/90 backdrop-blur-xl border border-slate-200 dark:border-[#3A3B3E] rounded-3xl p-3 shadow-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <textarea
                rows={1}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendPrompt();
                  }
                }}
                placeholder="Ask Nexus to run demand spike solver, audit statutory reserves..."
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#777777] resize-none focus:outline-none px-3"
              />

              <div className="flex items-center justify-between pt-2 px-2 border-t border-slate-100 dark:border-[#2D2E30]/40">
                <div className="flex items-center space-x-2">
                  <button className="p-1.5 rounded-full text-slate-400 dark:text-[#888888] hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2D2E30] transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] text-blue-600 dark:text-[#A8C7FA] bg-slate-100 dark:bg-[#131314] px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#2D2E30]">
                    {GEMINI_MODELS.find((m) => m.id === selectedModel)?.name}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    className="p-1.5 rounded-full text-slate-400 dark:text-[#888888] hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2D2E30] transition-colors"
                    title="Voice Input"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSendPrompt()}
                    disabled={!inputPrompt.trim() || isLoading}
                    className="p-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 disabled:opacity-40 text-white transition-all shadow-md cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="text-center text-[10px] text-[#777777] mt-2">
              Nexus 2.0 AI generates verifiable operations intelligence grounded in Neon Cloud PostgreSQL.
            </div>
          </div>
        )}
      </main>

      {/* API KEY SETTINGS MODAL */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1E1F20] border border-[#3A3B3E] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Settings className="w-4 h-4 text-[#A8C7FA]" />
                <span>Gemini API Key Settings</span>
              </h3>
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="text-[#888888] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#888888] mb-4">
              Configure your Google Gemini API key to activate high-performance operational reasoning.
            </p>

            <input
              type="password"
              placeholder="Enter Gemini API Key..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full bg-[#131314] text-xs text-white p-3 rounded-xl border border-[#2D2E30] focus:outline-none focus:border-[#4285F4] mb-4"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#2A2B2D] text-xs text-[#C4C7C5] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (apiKeyInput.trim()) {
                    geminiService.setApiKey(apiKeyInput.trim());
                  }
                  setApiKeyModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#1A73E8] hover:bg-[#4285F4] text-xs text-white font-medium"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};