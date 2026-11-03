import React, { useState } from 'react';
import { Cpu, ChevronDown, ChevronRight } from 'lucide-react';

interface ThinkingProcessAccordionProps {
  thinking: string;
  thinkingTimeSec?: number;
  initiallyExpanded?: boolean;
}

export const ThinkingProcessAccordion: React.FC<ThinkingProcessAccordionProps> = ({
  thinking,
  thinkingTimeSec = 2.18,
  initiallyExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  if (!thinking) return null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[#2D2E30] bg-slate-50/80 dark:bg-[#1E1F20]/80 overflow-hidden shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-xs text-blue-600 dark:text-[#A8C7FA] hover:bg-slate-100 dark:hover:bg-[#252628] transition-colors cursor-pointer"
      >
        <div className="flex items-center space-x-2">
          <Cpu className="w-3.5 h-3.5 text-blue-500 dark:text-[#4285F4]" />
          <span>
            Thought for {thinkingTimeSec.toFixed(2)}s • Multi-Agent Consensus Breakdown
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>

      {isExpanded && (
        <div className="p-3 bg-white dark:bg-[#131314] text-[11px] font-mono text-slate-700 dark:text-[#C4C7C5] border-t border-slate-200 dark:border-[#2D2E30] whitespace-pre-wrap leading-relaxed">
          {thinking}
        </div>
      )}
    </div>
  );
};
