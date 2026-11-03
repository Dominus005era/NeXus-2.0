import React from 'react';

// Helper function to parse inline markdown (bold **text**, `code`, etc.)
export const parseInlineFormatting = (text: string) => {
  if (!text) return '';
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
export const renderFormattedMarkdown = (content: string) => {
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
