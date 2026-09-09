import React, { useState } from 'react';
import { Sparkles, ArrowRight, Building, User, Database, CheckCircle2, ShieldCheck, Globe, Lock, Cpu, Layers } from 'lucide-react';
import { api } from '../services/api';

export interface WorkspaceConfig {
  userName: string;
  userRole: string;
  authorityLevel: string;
  companyName: string;
  companyStructure: string;
  cloudDocsLink: string;
}

interface OnboardingWizardProps {
  onComplete: (config: WorkspaceConfig) => void;
}

const ROLES_LIST = [
  {
    role: 'CEO & Founder',
    authority: 'LEVEL_4_EXECUTIVE',
    description: 'Full Enterprise Authority: Unrestricted strategy, statutory locks, and PO approvals',
    badge: 'Full Access'
  },
  {
    role: 'Finance VP / CFO',
    authority: 'LEVEL_3_FINANCE',
    description: 'Treasury & Liquidity: Balance sheet audit, spend ceilings, payment terms approval',
    badge: 'Treasury'
  },
  {
    role: 'Supply Chain Director',
    authority: 'LEVEL_3_SUPPLY',
    description: 'Operations & Inventory: Stockout horizon, reorder calculations, vendor allocation',
    badge: 'Logistics'
  },
  {
    role: 'Sales & Growth Director',
    authority: 'LEVEL_2_SALES',
    description: 'Commercial & Demand: Promotional elasticity, affiliate campaigns, velocity spikes',
    badge: 'Commercial'
  },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [userName, setUserName] = useState('');
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(0);
  const [companyName, setCompanyName] = useState('');
  const [companyStructure, setCompanyStructure] = useState(
    'CEO -> Swarm Orchestrator\n  ├── Sales Intelligence (Promotional Elasticity)\n  ├── Inventory & Logistics (Bin 4B Stockout Horizon)\n  └── Treasury & Governance (Statutory Reserve Lock)'
  );
  const [cloudDocsLink, setCloudDocsLink] = useState('https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs7');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const extractFolderId = (url: string) => {
    const match = url.match(/folders\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };
  const activeFolderId = extractFolderId(cloudDocsLink);

  const handleFinish = async () => {
    setIsSubmitting(true);
    const chosenRoleObj = ROLES_LIST[selectedRoleIndex];
    const config: WorkspaceConfig = {
      userName: userName.trim() || 'Executive User',
      userRole: chosenRoleObj.role,
      authorityLevel: chosenRoleObj.authority,
      companyName: companyName.trim() || 'TechMart Electronics',
      companyStructure: companyStructure.trim(),
      cloudDocsLink: cloudDocsLink.trim(),
    };

    // Save to local storage for instant access
    localStorage.setItem('nexus_workspace_config', JSON.stringify(config));

    // Register with backend persistence
    try {
      await api.onboardWorkspace({
        user_name: config.userName,
        user_role: config.userRole,
        authority_level: config.authorityLevel,
        company_name: config.companyName,
        company_structure: config.companyStructure,
        cloud_docs_link: config.cloudDocsLink,
      });
    } catch (err) {
      console.warn('Backend onboard sync non-blocking error:', err);
    } finally {
      setIsSubmitting(false);
      onComplete(config);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#1E1F20] border border-[#3A3B3E] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 text-[#E3E3E3] my-8">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-[#2D2E30] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1A73E8] via-[#4285F4] to-[#A8C7FA] flex items-center justify-center shadow-lg shadow-[#1A73E8]/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading">
                Enterprise Setup Wizard
              </h2>
              <p className="text-xs text-[#888888]">
                Step {step} of 3 • Autonomous Operating System Initialization
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  step === s
                    ? 'bg-[#4285F4] w-6'
                    : step > s
                    ? 'bg-[#34A853]'
                    : 'bg-[#2D2E30]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: IDENTITY & ROLE AUTHORITY */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-xs text-[#A8C7FA] font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>1. Executive Profile & Role Authority</span>
              <span className="text-[10px] text-[#34A853] bg-[#34A853]/10 px-2 py-0.5 rounded-full">RBAC Governed</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#888888] flex items-center space-x-1 mb-1">
                  <User className="w-3.5 h-3.5 text-[#4285F4]" />
                  <span>Executive Full Name</span>
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Rahul Singh"
                  className="w-full bg-[#131314] text-xs text-white p-3 rounded-xl border border-[#2D2E30] focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div>
                <label className="text-xs text-[#888888] flex items-center space-x-1 mb-1">
                  <Building className="w-3.5 h-3.5 text-[#4285F4]" />
                  <span>Company Name</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. TechMart Electronics"
                  className="w-full bg-[#131314] text-xs text-white p-3 rounded-xl border border-[#2D2E30] focus:outline-none focus:border-[#4285F4]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#888888] flex items-center space-x-1 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4285F4]" />
                <span>Select Your Role & Authority Level (Governs AI Access)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROLES_LIST.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedRoleIndex(idx)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedRoleIndex === idx
                        ? 'border-[#4285F4] bg-[#4285F4]/10 shadow-sm'
                        : 'border-[#2D2E30] bg-[#131314] hover:border-[#3A3B3E]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">{item.role}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2D2E30] text-[#A8C7FA] font-mono">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#888888] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: COMPANY STRUCTURE & AGENT INITIALIZATION */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-xs text-[#A8C7FA] font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>2. Department Hierarchy & Swarm Agents</span>
              <span className="text-[10px] text-[#4285F4] bg-[#4285F4]/10 px-2 py-0.5 rounded-full">DAG Generation</span>
            </div>
            <p className="text-xs text-[#888888]">
              Swarm Studio will automatically construct parallel agent nodes matching your enterprise departments:
            </p>

            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="p-2.5 rounded-xl bg-[#131314] border border-[#2D2E30] text-center">
                <Cpu className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <div className="text-[11px] font-semibold text-white">Sales Intelligence</div>
                <div className="text-[9px] text-[#888888]">Velocity & Surge</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#131314] border border-[#2D2E30] text-center">
                <Layers className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <div className="text-[11px] font-semibold text-white">Supply Chain</div>
                <div className="text-[9px] text-[#888888]">Bin Stockout Horizon</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#131314] border border-[#2D2E30] text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-[11px] font-semibold text-white">Treasury Audit</div>
                <div className="text-[9px] text-[#888888]">₹5.00L Statutory Lock</div>
              </div>
            </div>

            <textarea
              rows={4}
              value={companyStructure}
              onChange={(e) => setCompanyStructure(e.target.value)}
              placeholder="e.g. CEO -> Swarm Orchestrator..."
              className="w-full bg-[#131314] text-xs font-mono text-[#C4C7C5] p-3 rounded-xl border border-[#2D2E30] focus:outline-none focus:border-[#4285F4] resize-none leading-relaxed"
            />
          </div>
        )}

        {/* STEP 3: CLOUD DATABASE & GOOGLE DRIVE */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-xs text-[#A8C7FA] font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>3. Enterprise Cloud Database (Google Drive Link)</span>
              <span className="text-[10px] text-[#34A853] bg-[#34A853]/10 px-2 py-0.5 rounded-full">Ground Truth</span>
            </div>
            <p className="text-xs text-[#888888]">
              Connect your department records (Sales reports, Inventory ledgers, Finance reserve policies). All AI agents ground their calculations in these files:
            </p>

            <div>
              <label className="text-xs text-[#888888] flex items-center space-x-1 mb-1">
                <Globe className="w-3.5 h-3.5 text-[#34A853]" />
                <span>Google Drive Shared Folder Link</span>
              </label>
              <input
                type="text"
                value={cloudDocsLink}
                onChange={(e) => setCloudDocsLink(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/your_folder_id"
                className="w-full bg-[#131314] text-xs text-white p-3 rounded-xl border border-[#2D2E30] focus:outline-none focus:border-[#4285F4]"
              />

              <div className="mt-3 p-3 rounded-xl bg-[#131314] border border-[#2D2E30] space-y-1.5">
                <div className="text-[11px] font-semibold text-white flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853]" />
                  <span>Recognized Departmental Documents:</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-[#A8C7FA] font-mono">
                  <div>• q3_promotional_calendar.md</div>
                  <div>• bin_4b_stock_ledger.csv</div>
                  <div>• cash_reserve_governance.md</div>
                  <div>• supplier_contracts_master.json</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2D2E30]">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl bg-[#2A2B2D] text-xs font-medium text-[#C4C7C5] hover:text-white"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-[#4285F4] text-xs font-semibold text-white flex items-center space-x-1.5 shadow-md"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1A73E8] via-[#4285F4] to-[#A855F7] text-xs font-bold text-white flex items-center space-x-2 shadow-lg shadow-[#1A73E8]/30 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Initializing Swarm...' : 'Launch Operating System'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};