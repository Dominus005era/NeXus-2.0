import React from 'react';
import { CheckCircle2, Zap } from 'lucide-react';

export interface POSplitItem {
  supplier: string;
  units: number;
  unitCost: number;
  upfrontCash: number;
  leadTime: string;
  paymentTerms: string;
}

interface POSplitCardProps {
  messageId: string;
  allocationPlan: POSplitItem[];
  totalUpfrontCash?: number;
  isExecuted?: boolean;
  onExecute: (msgId: string) => void;
}

export const POSplitCard: React.FC<POSplitCardProps> = ({
  messageId,
  allocationPlan,
  totalUpfrontCash,
  isExecuted,
  onExecute,
}) => {
  return (
    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#2D2E30]">
      <div className="text-xs font-semibold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
        <span>Recommended PO Split Allocation</span>
        <span className="text-emerald-600 dark:text-[#81C995] font-mono font-bold">
          Total Upfront: ₹{totalUpfrontCash?.toLocaleString() || 0}
        </span>
      </div>

      <div className="space-y-2">
        {allocationPlan.map((po, pIdx) => (
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
          onClick={() => onExecute(messageId)}
          disabled={isExecuted}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-md cursor-pointer ${
            isExecuted
              ? 'bg-emerald-100 dark:bg-[#34A853]/20 text-emerald-700 dark:text-[#81C995] border border-emerald-300 dark:border-[#34A853]/40'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white'
          }`}
        >
          {isExecuted ? (
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
  );
};
