import React from 'react';
import {
  ArrowLeft,
  Network,
  Radio,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Bot,
  Sparkles,
  Send,
} from 'lucide-react';
import { ThemeToggle } from '../../context/ThemeContext';
import { SwarmScenario } from './types';

interface SimulationControlsProps {
  companyName: string;
  currentScenario: SwarmScenario;
  scenarios: SwarmScenario[];
  activeStepIndex: number;
  isPlaying: boolean;
  customPromptInput: string;
  onBackToLanding: () => void;
  onSwitchToChat: () => void;
  onTogglePlay: () => void;
  onNextStep: () => void;
  onRestart: () => void;
  onSelectScenario: (scenario: SwarmScenario) => void;
  onTriggerRandomDirective: () => void;
  onCustomPromptChange: (val: string) => void;
  onCustomPromptSubmit: (e: React.FormEvent) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  companyName,
  currentScenario,
  scenarios,
  activeStepIndex,
  isPlaying,
  customPromptInput,
  onBackToLanding,
  onSwitchToChat,
  onTogglePlay,
  onNextStep,
  onRestart,
  onSelectScenario,
  onTriggerRandomDirective,
  onCustomPromptChange,
  onCustomPromptSubmit,
}) => {
  return (
    <>
      {/* Top Header */}
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

        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#131314] border border-slate-200 dark:border-[#2D2E30] text-xs">
            <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span className="text-slate-500 dark:text-[#888888]">Mode:</span>
            <span className="font-semibold text-blue-600 dark:text-[#A8C7FA] truncate max-w-xs">
              {currentScenario.badge}
            </span>
          </div>

          <button
            onClick={onTogglePlay}
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

          <button
            onClick={onNextStep}
            disabled={activeStepIndex >= currentScenario.steps.length}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#2A2B2D] hover:bg-slate-200 dark:hover:bg-[#35373A] text-slate-700 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center space-x-1.5 border border-slate-200 dark:border-[#3A3B3E]/60 transition-all cursor-pointer disabled:opacity-40"
            title="Advance One Step Manually"
          >
            <SkipForward className="w-3.5 h-3.5 text-blue-500 dark:text-[#A8C7FA]" />
            <span className="hidden sm:inline">Step Next</span>
          </button>

          <button
            onClick={onRestart}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#2A2B2D] hover:bg-slate-200 dark:hover:bg-[#35373A] text-slate-600 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#3A3B3E]/60 transition-all cursor-pointer"
            title="Restart Active Scenario"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <ThemeToggle />

          <button
            onClick={onSwitchToChat}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#2A2B2D] hover:bg-slate-200 dark:hover:bg-[#35373A] text-slate-700 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-white text-xs font-medium flex items-center space-x-1.5 border border-slate-200 dark:border-[#3A3B3E]/60 transition-all cursor-pointer shadow-sm"
          >
            <Bot className="w-3.5 h-3.5 text-blue-500 dark:text-[#A8C7FA]" />
            <span className="hidden md:inline">Executive Chat</span>
          </button>
        </div>
      </header>

      {/* Scenarios & Query Input Bar */}
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
                onClick={() => onSelectScenario(sc)}
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

          <button
            onClick={onTriggerRandomDirective}
            className="text-xs px-2.5 py-1 rounded-lg border border-purple-300 dark:border-purple-500/50 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-100 font-medium transition-all cursor-pointer flex items-center space-x-1 shrink-0"
            title="Simulate Random Real-World Enterprise Directive"
          >
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span>🎲 Random Directive</span>
          </button>
        </div>

        <form onSubmit={onCustomPromptSubmit} className="flex items-center space-x-1.5 flex-1 max-w-md ml-auto">
          <input
            type="text"
            placeholder="Type any custom executive directive..."
            value={customPromptInput}
            onChange={(e) => onCustomPromptChange(e.target.value)}
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
    </>
  );
};
