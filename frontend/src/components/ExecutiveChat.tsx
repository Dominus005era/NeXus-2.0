import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Send,
  Plus,
  Copy,
  Check,
  ChevronDown,
  Database,
  ShieldCheck,
  Flame,
  AlertTriangle,
  Menu,
  Settings,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  geminiService,
  ChatMessage,
  ChatSession,
  GEMINI_MODELS,
} from '../services/gemini';
import { ThemeToggle } from '../context/ThemeContext';
import { POSplitCard } from './chat/POSplitCard';
import { ThinkingProcessAccordion } from './chat/ThinkingProcessAccordion';
import { PromptSuggestions, SuggestedPromptItem } from './chat/PromptSuggestions';
import { ApiKeyModal } from './chat/ApiKeyModal';
import { renderFormattedMarkdown } from './chat/types';

interface ExecutiveChatProps {
  onBackToLanding: () => void;
  onSwitchToSwarm: () => void;
  activeView: 'chat' | 'swarm';
}

const getSuggestedPrompts = (company: string, product: string): SuggestedPromptItem[] => [
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

export const ExecutiveChat: React.FC<ExecutiveChatProps> = ({
  onBackToLanding,
  onSwitchToSwarm,
  activeView,
}) => {
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

  const userName = workspaceConfig?.userName || 'Rahul Singh';
  const userRole = workspaceConfig?.userRole || 'CEO & Founder';
  const authorityLevel = workspaceConfig?.authorityLevel || 'LEVEL_4_EXECUTIVE';
  const companyName = workspaceConfig?.companyName || 'TechMart Electronics';
  const primaryProduct = workspaceConfig?.primaryProduct || 'P100 Headphones';

  const suggestedPrompts = useMemo(
    () => getSuggestedPrompts(companyName, primaryProduct),
    [companyName, primaryProduct]
  );

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

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.6-flash');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingPhase, setStreamingPhase] = useState<{ step: number; phase: string; message: string } | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [executedPOs, setExecutedPOs] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('nexus_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('nexus_active_session_id', activeSessionId);
    } else {
      localStorage.removeItem('nexus_active_session_id');
    }
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, isLoading, streamingPhase]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const currentMessages = activeSession ? activeSession.messages : [];

  const handleCreateNewChat = () => {
    const newSessionId = `sess-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Executive Session',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setInputPrompt('');
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    if (activeSessionId === sessionId) {
      setActiveSessionId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleSendPrompt = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || inputPrompt).trim();
    if (!promptToSend || isLoading) return;

    let targetSessionId = activeSessionId;
    let targetSession = sessions.find((s) => s.id === targetSessionId);

    if (!targetSession) {
      const newSessionId = `sess-${Date.now()}`;
      const titleSnippet = promptToSend.length > 30 ? promptToSend.slice(0, 30) + '...' : promptToSend;
      const newSession: ChatSession = {
        id: newSessionId,
        title: titleSnippet,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSessionId);
      targetSessionId = newSessionId;
      targetSession = newSession;
    } else if (targetSession.messages.length === 0) {
      const titleSnippet = promptToSend.length > 30 ? promptToSend.slice(0, 30) + '...' : promptToSend;
      targetSession.title = titleSnippet;
    }

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === targetSessionId
          ? {
              ...s,
              updatedAt: new Date().toISOString(),
              messages: [...s.messages, userMessage],
            }
          : s
      )
    );

    setInputPrompt('');
    setIsLoading(true);
    setStreamingPhase({ step: 1, phase: 'Initializing', message: 'Nexus Swarm Orchestrator receiving prompt...' });

    try {
      const history = targetSession ? targetSession.messages : [];
      const response = await geminiService.sendMessageStream(
        promptToSend,
        history,
        selectedModel,
        (progress) => {
          setStreamingPhase(progress);
        }
      );

      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thinking: response.thinking,
        thinkingTimeSec: response.thinkingTimeSec,
        allocationPlan: response.allocationPlan,
        totalUpfrontCash: response.totalUpfrontCash,
        totalUnits: response.totalUnits,
        modelUsed: selectedModel,
        cloudDocsFetched: response.cloudDocsFetched,
        rbacStatus: response.rbacStatus,
        optimizationProof: response.optimizationProof,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? {
                ...s,
                updatedAt: new Date().toISOString(),
                messages: [...s.messages, assistantMessage],
              }
            : s
        )
      );
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error formulating multi-agent decision: ${err?.message || 'Gateway connection timeout'}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, messages: [...s.messages, errorMessage] }
            : s
        )
      );
    } finally {
      setIsLoading(false);
      setStreamingPhase(null);
    }
  };

  const handleCopy = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleExecutePOSplit = async (msgId: string) => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335'],
    });
    setExecutedPOs((prev) => ({ ...prev, [msgId]: true }));
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] dark:bg-[#0B0C0E] text-slate-900 dark:text-[#E3E3E3] overflow-hidden font-sans antialiased transition-colors duration-200">
      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? 'w-64 sm:w-72' : 'w-0 -translate-x-full'
        } transition-all duration-300 ease-in-out h-full border-r border-slate-200 dark:border-[#1E1F20] bg-white dark:bg-[#131314] flex flex-col z-20 shrink-0 overflow-hidden relative shadow-sm`}
      >
        <div className="p-3.5 flex items-center justify-between border-b border-slate-200 dark:border-[#1E1F20]">
          <div className="flex items-center space-x-2">
            <button
              onClick={onBackToLanding}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-[#888888] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E1F20] transition-colors"
              title="Return to Nexus 2.0 Landing"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-xs tracking-wider uppercase text-slate-700 dark:text-[#C4C7C5] font-heading">
              {companyName}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-[#888888] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E1F20] transition-colors"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={handleCreateNewChat}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E1F20] dark:hover:bg-[#252628] text-slate-900 dark:text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all border border-slate-200 dark:border-[#2D2E30] shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-600 dark:text-[#A8C7FA]" />
            <span>New Executive Chat</span>
          </button>
        </div>

        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#888888] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search chat sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#1A1A1C] text-xs text-slate-800 dark:text-[#E3E3E3] rounded-lg pl-8 pr-2 py-1.5 border border-transparent focus:border-blue-500 focus:outline-none placeholder-slate-400 dark:placeholder-[#666666]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 dark:text-[#666666] uppercase tracking-wider px-2 py-1.5">
            Operational Sessions
          </div>
          {filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-[#1E1F20] dark:text-[#A8C7FA] border border-blue-200 dark:border-[#4285F4]/30'
                    : 'text-slate-600 dark:text-[#C4C7C5] hover:bg-slate-100 dark:hover:bg-[#1A1A1C]'
                }`}
              >
                <span className="truncate flex-1">{session.title}</span>
                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 dark:hover:text-red-400 transition-opacity ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-[#1E1F20] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {userName ? userName.charAt(0).toUpperCase() : 'E'}
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-800 dark:text-white truncate max-w-[110px]">
                {userName}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-[#888888] font-mono">{authorityLevel}</div>
            </div>
          </div>
          <button
            onClick={() => setApiKeyModalOpen(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-[#888888] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E1F20] transition-colors"
            title="Configure Gemini API Key"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MAIN CHAT CANVAS */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-14 border-b border-slate-200 dark:border-[#1E1F20] bg-white/80 dark:bg-[#131314]/80 backdrop-blur-md px-4 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center space-x-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-[#888888] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E1F20] transition-colors"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-[#1E1F20] p-1 rounded-full border border-slate-200 dark:border-[#2D2E30]">
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

          <div className="flex items-center space-x-2.5">
            <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#1E1F20] border border-slate-200 dark:border-[#2D2E30] text-xs">
              <Database className="w-3.5 h-3.5 text-blue-500 dark:text-[#4285F4]" />
              <span className="text-slate-500 dark:text-[#888888]">Drive DB:</span>
              <span className="text-[10px] text-emerald-600 dark:text-[#34A853] font-mono font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span>Grounded</span>
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#1E1F20] border border-slate-200 dark:border-[#2D2E30] text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-[#34A853]" />
              <span className="text-slate-500 dark:text-[#888888]">Role:</span>
              <span className="font-semibold text-slate-800 dark:text-white truncate max-w-[130px]">{userRole}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-[#34A853]/15 text-emerald-700 dark:text-[#34A853] font-mono font-bold">
                {authorityLevel}
              </span>
            </div>

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

            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#1E1F20] border border-slate-200 dark:border-[#2D2E30] text-xs">
              <span className="text-slate-500 dark:text-[#888888]">Cash:</span>
              <span className="font-semibold text-emerald-600 dark:text-[#81C995]">₹8,50,000</span>
            </div>

            <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#1E1F20] border border-slate-200 dark:border-[#2D2E30] text-xs">
              <span className="text-slate-500 dark:text-[#888888]">Safe Cap:</span>
              <span className="font-semibold text-blue-600 dark:text-[#A8C7FA]">₹1,80,000</span>
            </div>

            <ThemeToggle />
          </div>
        </header>

        {/* CHAT DISPLAY BODY */}
        <div className="flex-1 overflow-y-auto relative flex flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 dark:from-[#1A73E8]/10 via-transparent dark:via-[#0B0C0E]/90 to-transparent dark:to-[#0B0C0E] pointer-events-none" />

          {currentMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto w-full z-10 py-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#2D2E30] mb-4 shadow-xl shadow-blue-500/10">
                  <Sparkles className="w-8 h-8 text-blue-500 dark:text-[#A8C7FA] animate-pulse" />
                </div>
                <h1 className="text-3xl md:text-4xl font-normal tracking-tight text-slate-900 dark:text-white font-heading">
                  The mic is yours,{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-[#A8C7FA] dark:via-[#4285F4] dark:to-[#A855F7] bg-clip-text text-transparent font-medium">
                    {userName ? userName.split(' ')[0] : 'Executive'}
                  </span>
                </h1>
                <p className="text-slate-500 dark:text-[#888888] text-sm mt-2 max-w-md mx-auto">
                  What supply chain allocation or liquidity optimization can Nexus assist you with today?
                </p>
              </div>

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

              <PromptSuggestions
                suggestions={suggestedPrompts}
                onSelectPrompt={(p) => handleSendPrompt(p)}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full space-y-6 z-10">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
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
                    <div className="w-full flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1A73E8] via-[#4285F4] to-[#A855F7] flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                        <Sparkles className="w-4 h-4" />
                      </div>

                      <div className="flex-1 space-y-3 max-w-3xl">
                        {msg.thinking && (
                          <ThinkingProcessAccordion
                            thinking={msg.thinking}
                            thinkingTimeSec={msg.thinkingTimeSec}
                          />
                        )}

                        <div className="bg-white dark:bg-[#1E1F20] text-sm text-slate-800 dark:text-[#E3E3E3] p-5 rounded-2xl border border-slate-200 dark:border-[#2D2E30] shadow-md space-y-3 leading-relaxed">
                          <div>{renderFormattedMarkdown(msg.content)}</div>

                          {msg.allocationPlan && (
                            <POSplitCard
                              messageId={msg.id}
                              allocationPlan={msg.allocationPlan}
                              totalUpfrontCash={msg.totalUpfrontCash}
                              isExecuted={executedPOs[msg.id]}
                              onExecute={handleExecutePOSplit}
                            />
                          )}

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
                    <span>
                      {streamingPhase
                        ? `[Step ${streamingPhase.step}] ${streamingPhase.message}`
                        : 'Orchestrating multi-agent integer linear programming solver...'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

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

      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
      />
    </div>
  );
};
