import React from 'react';
import { Bot, CheckCircle2, Zap } from 'lucide-react';
import { NodeData } from './types';

interface NodeCardProps {
  node: NodeData;
  isParticipating: boolean;
  isTargetOfActive: boolean;
  isSourceOfActive: boolean;
  isPeerConsulting: boolean;
  hasCompleted: boolean;
  isDragging: boolean;
  isSelected: boolean;
  liveThought?: string;
  telemetry?: string;
  onPointerDown: (nodeId: string, e: React.PointerEvent) => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  isParticipating,
  isTargetOfActive,
  isPeerConsulting,
  hasCompleted,
  isDragging,
  isSelected,
  liveThought,
  telemetry,
  onPointerDown,
}) => {
  return (
    <div
      onPointerDown={(e) => onPointerDown(node.id, e)}
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
        width: `${node.width}px`,
        minHeight: `${node.height}px`,
      }}
      className={`node-card absolute rounded-3xl cursor-grab active:cursor-grabbing select-none ${
        isDragging ? 'is-dragging shadow-2xl scale-[1.02]' : ''
      } ${
        !isParticipating
          ? 'bg-slate-100/70 dark:bg-[#1E1F20]/40 border-dashed border-slate-300 dark:border-[#2D2E30] opacity-50'
          : isTargetOfActive
          ? `bg-white dark:bg-[#1E1F20] ${node.borderColor} ring-2 ring-blue-500 shadow-2xl shadow-blue-500/30 scale-[1.01] animate-active-node`
          : isPeerConsulting
          ? 'bg-white dark:bg-[#1E1F20] border-purple-500 ring-2 ring-purple-500/40 shadow-xl shadow-purple-500/20'
          : hasCompleted
          ? 'bg-white dark:bg-[#1E1F20] border-emerald-400 dark:border-emerald-500/60 shadow-md ring-1 ring-emerald-400/20'
          : isSelected
          ? 'bg-white dark:bg-[#1E1F20] border-blue-500 ring-2 ring-blue-500/30 shadow-xl'
          : 'bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#2D2E30] hover:border-slate-300 dark:hover:border-[#3A3B3E] shadow-sm hover:shadow-md'
      }`}
    >
      {/* Left Input Anchor Port */}
      <div
        className={`absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center pointer-events-none ${
          isTargetOfActive
            ? 'bg-blue-500 border-white shadow-md'
            : isParticipating
            ? 'bg-slate-300 dark:bg-[#2D2E30] border-white dark:border-[#1E1F20]'
            : 'bg-slate-200 dark:bg-[#1E1F20] border-slate-400 opacity-40'
        }`}
        title="Input Port"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-400" />
      </div>

      {/* Right Output Anchor Port */}
      <div
        className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center pointer-events-none ${
          isTargetOfActive || isPeerConsulting
            ? 'bg-blue-500 border-white shadow-md'
            : isParticipating
            ? 'bg-slate-300 dark:bg-[#2D2E30] border-white dark:border-[#1E1F20]'
            : 'bg-slate-200 dark:bg-[#1E1F20] border-slate-400 opacity-40'
        }`}
        title="Output Port"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-400" />
      </div>

      {/* Live Thought Bubble */}
      {liveThought && (
        <div className="absolute -top-12 left-0 right-0 z-30 flex justify-center animate-bounce">
          <div
            className={`px-3 py-1.5 rounded-xl text-white text-[10.5px] font-semibold shadow-xl flex items-center space-x-1.5 truncate max-w-[95%] ${
              isPeerConsulting
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-500/30'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30'
            }`}
          >
            <Zap className="w-3 h-3 shrink-0 text-amber-300 animate-pulse" />
            <span className="truncate">{liveThought}</span>
          </div>
        </div>
      )}

      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-xl ${node.iconBg} flex items-center justify-center`}>
              <Bot className={`w-4 h-4 ${node.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {node.title}
                </h4>
                {!isParticipating && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-[#2D2E30] text-slate-500 dark:text-[#888888] font-mono">
                    Standby
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-[#888888]">{node.department}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {isTargetOfActive && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-semibold flex items-center space-x-1 border border-blue-300 dark:border-blue-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                <span>Thinking...</span>
              </span>
            )}
            {isPeerConsulting && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-semibold border border-purple-300 dark:border-purple-500/40">
                Consulting
              </span>
            )}
            {hasCompleted && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-[#34A853]" />
            )}
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#131314] text-blue-600 dark:text-[#A8C7FA] font-mono border border-slate-200 dark:border-[#2D2E30]">
              {node.latency}
            </span>
          </div>
        </div>

        {telemetry && (
          <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#2D2E30] text-[10.5px] font-mono text-emerald-600 dark:text-[#81C995] flex items-center space-x-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="truncate">{telemetry}</span>
          </div>
        )}

        <p className="text-[11px] text-slate-600 dark:text-[#C4C7C5] line-clamp-2 leading-relaxed">
          {node.role}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#2D2E30]/70 text-[10px]">
          <span className="text-slate-400 dark:text-[#888888]">Engine:</span>
          <span className="text-blue-600 dark:text-[#A8C7FA] font-mono font-medium truncate max-w-[170px]">
            {node.model}
          </span>
        </div>
      </div>
    </div>
  );
};
