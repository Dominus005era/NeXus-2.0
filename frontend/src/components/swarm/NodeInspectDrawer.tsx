import React from 'react';
import { Bot, X } from 'lucide-react';
import { NodeData, AVAILABLE_MODELS_BY_TYPE } from './types';

interface NodeInspectDrawerProps {
  selectedNode: NodeData | null;
  onClose: () => void;
  onModelChange: (nodeId: string, newModel: string) => void;
}

export const NodeInspectDrawer: React.FC<NodeInspectDrawerProps> = ({
  selectedNode,
  onClose,
  onModelChange,
}) => {
  if (!selectedNode) return null;

  return (
    <aside className="w-80 border-l border-slate-200 dark:border-[#2D2E30] bg-white dark:bg-[#1E1F20] p-5 space-y-4 shrink-0 overflow-y-auto z-20 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2D2E30] pb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-7 h-7 rounded-lg ${selectedNode.iconBg} flex items-center justify-center`}>
            <Bot className={`w-4 h-4 ${selectedNode.iconColor}`} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{selectedNode.title}</h4>
            <span className="text-[10px] text-slate-500 dark:text-[#888888]">{selectedNode.department}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2D2E30]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <label className="text-[10px] text-slate-500 dark:text-[#888888] uppercase font-bold tracking-wider block mb-1">
            Active Model Runtime
          </label>
          <select
            value={selectedNode.model}
            onChange={(e) => onModelChange(selectedNode.id, e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#131314] text-xs text-slate-800 dark:text-white p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2E30] focus:outline-none focus:border-blue-500"
          >
            {(AVAILABLE_MODELS_BY_TYPE[selectedNode.type] || [selectedNode.model]).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-500 dark:text-[#888888] uppercase font-bold tracking-wider block mb-1">
            Operational Mission
          </label>
          <p className="text-xs text-slate-700 dark:text-[#D8D8D8] bg-slate-50 dark:bg-[#131314] p-3 rounded-xl border border-slate-200 dark:border-[#2D2E30] leading-relaxed">
            {selectedNode.role}
          </p>
        </div>

        <div>
          <label className="text-[10px] text-slate-500 dark:text-[#888888] uppercase font-bold tracking-wider block mb-1">
            Grounded Knowledge Records
          </label>
          <div className="bg-slate-50 dark:bg-[#131314] p-3 rounded-xl border border-slate-200 dark:border-[#2D2E30] space-y-1 text-[11px] font-mono text-blue-600 dark:text-[#A8C7FA]">
            <div>• q3_promotional_calendar.md</div>
            <div>• bin_4b_stock_ledger.csv</div>
            <div>• statutory_reserve_governance.md</div>
            <div>• supplier_contracts_master.json</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
