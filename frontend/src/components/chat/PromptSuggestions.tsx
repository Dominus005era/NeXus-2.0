import React from 'react';
import { ArrowUpRight, LucideIcon } from 'lucide-react';

export interface SuggestedPromptItem {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  prompt: string;
}

interface PromptSuggestionsProps {
  suggestions: SuggestedPromptItem[];
  onSelectPrompt: (prompt: string) => void;
}

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({
  suggestions,
  onSelectPrompt,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
      {suggestions.map((item, idx) => {
        const Icon = item.icon;
        return (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
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
  );
};
