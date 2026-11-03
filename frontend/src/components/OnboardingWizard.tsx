import React, { useState } from 'react';
import { Sparkles, ArrowRight, Building, User, Database, CheckCircle2, ShieldCheck, Globe, Lock, Cpu, Layers, Package, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { api, DriveDatabaseSummary, DriveFileRecord } from '../services/api';

export interface WorkspaceConfig {
  userName: string;
  userRole: string;
  authorityLevel: string;
  companyName: string;
  primaryProduct: string;
  industry: string;
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
  const [primaryProduct, setPrimaryProduct] = useState('P100 UltraGlide Headphones');
  const [industry, setIndustry] = useState('Consumer Technology & Electronics');
  const [companyStructure, setCompanyStructure] = useState(
    'CEO -> Swarm Orchestrator\n  ├── Sales Intelligence (Promotional Elasticity)\n  ├── Inventory & Logistics (Bin 4B Stockout Horizon)\n  └── Treasury & Governance (Statutory Reserve Lock)'
  );
  const [cloudDocsLink, setCloudDocsLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewSummary, setPreviewSummary] = useState<DriveDatabaseSummary | null>(null);

  const extractFolderId = (url: string) => {
    const match = url.match(/folders\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };
  const activeFolderId = extractFolderId(cloudDocsLink);

  const buildConfig = (): WorkspaceConfig => {
    const chosenRoleObj = ROLES_LIST[selectedRoleIndex];
    return {
      userName: userName.trim() || 'Executive User',
      userRole: chosenRoleObj.role,
      authorityLevel: chosenRoleObj.authority,
      companyName: companyName.trim() || 'TechMart Electronics',
      primaryProduct: primaryProduct.trim() || 'High-Demand Product Line',
      industry: industry,
      companyStructure: companyStructure.trim(),
      cloudDocsLink: cloudDocsLink.trim(),
    };
  };

  const handlePreview = async () => {
    setIsPreviewing(true);
    setPreviewError(null);
    setPreviewSummary(null);
    const config = buildConfig();
    try {
      const summary = await api.previewWorkspace({
        company_name: config.companyName,
        primary_product: config.primaryProduct,
        industry: config.industry,
        cloud_docs_link: config.cloudDocsLink,
      });
      if (!summary) {
        setPreviewError('Could not reach the Drive preview service. Check the link and try again.');
        return;
      }
      setPreviewSummary(summary);
      setStep(4);
    } catch (err: any) {
      setPreviewError(err?.message || 'Failed to preview Drive folder.');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    const config = buildConfig();

    // Save to local storage for instant access
    localStorage.setItem('nexus_workspace_config', JSON.stringify(config));

    // Register with backend persistence
    try {
      await api.onboardWorkspace({
        user_name: config.userName,
        user_role: config.userRole,
        authority_level: config.authorityLevel,
        company_name: config.companyName,
        primary_product: config.primaryProduct,
        industry: config.industry,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-md p-4 overflow-y-auto transition-colors duration-200">
      <div className="bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#3A3B3E] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 text-slate-800 dark:text-[#E3E3E3] my-8">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2D2E30] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1A73E8] via-[#4285F4] to-[#A8C7FA] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Enterprise Setup Wizard
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#888888]">
                Step {step} of 4 • Autonomous Operating System Initialization
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  step === s
                    ? 'bg-blue-600 dark:bg-[#4285F4] w-6'
                    : step > s
                    ? 'bg-emerald-500 dark:bg-[#34A853]'
                    : 'bg-slate-200 dark:bg-[#2D2E30]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: IDENTITY & ROLE AUTHORITY */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-xs text-blue-600 dark:text-[#A8C7FA] font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>1. Executive Profile & Role Authority</span>
              <span className="text-[10px] text-emerald-700 dark:text-[#34A853] bg-emerald-50 dark:bg-[#34A853]/10 border border-emerald-200 dark:border-transparent px-2 py-0.5 rounded-full font-medium">RBAC Governed</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-[#888888] flex items-center space-x-1 mb-1">
                  <User className="w-3.5 h-3.5 text-blue-500 dark:text-[#4285F4]" />
                  <span>Executive Full Name</span>
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Rahul Singh"
                  className="w-full bg-slate-50 dark:bg-[#131314] text-xs text-slate-900 dark:text-white p-3 rounded-xl border border-slate-200 dark:border-[#2D2E30] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-[#888888] flex items-center space-x-1 mb-1">
                  <Building className="w-3.5 h-3.5 text-blue-500 dark:text-[#4285F4]" />
                  <span>Company Name</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. TechMart Electronics"
                  className="w-full bg-slate-50 dark:bg-[#131314] text-xs text-slate-900 dark:text-white p-3 rounded-xl border border-slate-200 dark:border-[#2D2E30] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-[#888888] flex items-center space-x-1 mb-1">
                  <Package className="w-3.5 h-3.5 text-blue-500 dark:text-[#4285F4]" />
                  <span>Primary Product Line / SKU</span>
                </label>
                <input
                  type="text"
                  value={primaryProduct}
                  onChange={(e) => setPrimaryProduct(e.target.value)}
                  placeholder="e.g. P100 Headphones, Solar Inverters..."
                  className="w-full bg-slate-50 dark:bg-[#131314] text-xs text-slate-900 dark:text-white p-3 rounded-xl border border-slate-200 dark:border-[#2D2E30] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-[#888888] flex items-center space-x-1 mb-1">
                  <Building className="w-3.5 h-3.5 text-blue-500 dark:text-[#4285F4]" />
                  <span>Industry / Sector</span>
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#131314] text-xs text-slate-900 dark:text-white p-3 rounded-xl border border-slate-200 dark:border-[#2D2E30] focus:outline-none focus:border-blue-500"
                >
                  <option value="Consumer Technology & Electronics">Consumer Tech & Electronics</option>
                  <option value="Fashion, Apparel & Footwear">Fashion & Apparel</option>
                  <option value="Clean Energy & Industrial Hardware">Clean Energy & Hardware</option>
                  <option value="Healthcare & Pharmaceuticals">Healthcare & Pharmaceuticals</option>
                  <option value="Food & Fast-Moving Consumer Goods">Food & Consumer Goods</option>
                  <option value="Automotive & Aerospace Logistics">Automotive & Logistics</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 dark:text-[#888888] flex items-center space-x-1 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 dark:text-[#4285F4]" />
                <span>Select Your Role & Authority Level (Governs AI Access)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROLES_LIST.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedRoleIndex(idx)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRoleIndex === idx
                        ? 'border-blue-500 bg-blue-50 dark:bg-[#4285F4]/10 shadow-sm ring-1 ring-blue-500/30'
                        : 'border-slate-200 dark:border-[#2D2E30] bg-slate-50 dark:bg-[#131314] hover:border-slate-300 dark:hover:border-[#3A3B3E]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">{item.role}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#2D2E30] text-blue-600 dark:text-[#A8C7FA] font-mono">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-[#888888] line-clamp-2 leading-relaxed">
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
            <div className="text-xs text-blue-600 dark:text-[#A8C7FA] font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>2. Department Hierarchy & Swarm Agents</span>
              <span className="text-[10px] text-blue-700 dark:text-[#4285F4] bg-blue-50 dark:bg-[#4285F4]/10 border border-blue-200 dark:border-transparent px-2 py-0.5 rounded-full font-medium">DAG Generation</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#888888]">
              Swarm Studio will automatically construct parallel agent nodes matching your enterprise departments:
            </p>

            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#2D2E30] text-center shadow-sm">
                <Cpu className="w-4 h-4 text-blue-500 dark:text-blue-400 mx-auto mb-1" />
                <div className="text-[11px] font-semibold text-slate-900 dark:text-white">Sales Intelligence</div>
                <div className="text-[9px] text-slate-500 dark:text-[#888888]">Velocity & Surge</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#2D2E30] text-center shadow-sm">
                <Layers className="w-4 h-4 text-amber-500 dark:text-amber-400 mx-auto mb-1" />
                <div className="text-[11px] font-semibold text-slate-900 dark:text-white">Supply Chain</div>
                <div className="text-[9px] text-slate-500 dark:text-[#888888]">Bin Stockout Horizon</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#2D2E30] text-center shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mx-auto mb-1" />
                <div className="text-[11px] font-semibold text-slate-900 dark:text-white">Treasury Audit</div>
                <div className="text-[9px] text-slate-500 dark:text-[#888888]">₹5.00L Statutory Lock</div>
              </div>
            </div>

            <textarea
              rows={4}
              value={companyStructure}
              onChange={(e) => setCompanyStructure(e.target.value)}
              placeholder="e.g. CEO -> Swarm Orchestrator..."
              className="w-full bg-slate-50 dark:bg-[#131314] text-xs font-mono text-slate-800 dark:text-[#C4C7C5] p-3 rounded-xl border border-slate-200 dark:border-[#2D2E30] focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
            />
          </div>
        )}

        {/* STEP 3: CLOUD DATABASE & GOOGLE DRIVE */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-xs text-blue-600 dark:text-[#A8C7FA] font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>3. Enterprise Cloud Database (Google Drive Link)</span>
              <span className="text-[10px] text-emerald-700 dark:text-[#34A853] bg-emerald-50 dark:bg-[#34A853]/10 border border-emerald-200 dark:border-transparent px-2 py-0.5 rounded-full font-medium">Ground Truth</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#888888]">
              Connect your department records (Sales reports, Inventory ledgers, Finance reserve policies). All AI agents ground their calculations in these files:
            </p>

            <div>
              <label className="text-xs text-slate-500 dark:text-[#888888] flex items-center space-x-1 mb-1">
                <Globe className="w-3.5 h-3.5 text-emerald-500 dark:text-[#34A853]" />
                <span>Google Drive Shared Folder Link</span>
              </label>
              <input
                type="text"
                value={cloudDocsLink}
                onChange={(e) => setCloudDocsLink(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/your_folder_id"
                className="w-full bg-slate-50 dark:bg-[#131314] text-xs text-slate-900 dark:text-white p-3 rounded-xl border border-slate-200 dark:border-[#2D2E30] focus:outline-none focus:border-blue-500"
              />

              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#2D2E30] space-y-1.5 shadow-sm">
                <div className="text-[11px] font-semibold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-[#34A853]" />
                  <span>Recognized Departmental Documents:</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-blue-600 dark:text-[#A8C7FA] font-mono">
                  <div>• q3_promotional_calendar.md</div>
                  <div>• bin_4b_stock_ledger.csv</div>
                  <div>• cash_reserve_governance.md</div>
                  <div>• supplier_contracts_master.json</div>
                </div>
              </div>
            </div>

            {previewError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-transparent flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-700 dark:text-rose-300">{previewError}</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: REVIEW DISCOVERED FILES & EXTRACTED ENTITIES */}
        {step === 4 && previewSummary && (
          <div className="space-y-4">
            <div className="text-xs text-blue-600 dark:text-[#A8C7FA] font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>4. Review Drive Ingestion</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                previewSummary.status === 'CONNECTED'
                  ? 'text-emerald-700 dark:text-[#34A853] bg-emerald-50 dark:bg-[#34A853]/10 border-emerald-200 dark:border-transparent'
                  : previewSummary.status === 'PARTIAL'
                  ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-transparent'
                  : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-transparent'
              }`}>
                {previewSummary.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#2D2E30] text-center">
                <div className="text-sm font-bold text-slate-900 dark:text-white">{previewSummary.files_indexed}</div>
                <div className="text-[9px] text-slate-500 dark:text-[#888888]">Files Scanned</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#2D2E30] text-center">
                <div className="text-sm font-bold text-slate-900 dark:text-white">{previewSummary.products_count}</div>
                <div className="text-[9px] text-slate-500 dark:text-[#888888]">Products</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#2D2E30] text-center">
                <div className="text-sm font-bold text-slate-900 dark:text-white">{previewSummary.suppliers_count}</div>
                <div className="text-[9px] text-slate-500 dark:text-[#888888]">Suppliers</div>
              </div>
            </div>

            {previewSummary.files && previewSummary.files.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-[#2D2E30] bg-slate-50 dark:bg-[#131314] p-2 space-y-1">
                {previewSummary.files.map((file: DriveFileRecord) => (
                  <div key={file.id} className="flex items-center justify-between text-[10px] p-1.5 rounded-lg bg-white dark:bg-[#1E1F20] border border-slate-100 dark:border-[#2D2E30]">
                    <div className="flex items-center space-x-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-blue-500 dark:text-[#4285F4] shrink-0" />
                      <span className="truncate text-slate-700 dark:text-[#C4C7C5]">{file.name}</span>
                    </div>
                    <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
                      file.status === 'parsed'
                        ? 'bg-emerald-50 dark:bg-[#34A853]/10 text-emerald-600 dark:text-[#34A853]'
                        : file.status === 'failed'
                        ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'bg-slate-100 dark:bg-[#2D2E30] text-slate-500 dark:text-[#888888]'
                    }`}>
                      {file.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {previewSummary.errors && previewSummary.errors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-transparent space-y-1">
                <div className="flex items-center space-x-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Extraction Notes</span>
                </div>
                {previewSummary.errors.map((err, idx) => (
                  <div key={idx} className="text-[10px] text-rose-600 dark:text-rose-300">• {err}</div>
                ))}
              </div>
            )}

            <p className="text-[10px] text-slate-500 dark:text-[#888888]">
              Review the discovered files above. Click <strong>Launch Operating System</strong> to create your isolated workspace.
            </p>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-[#2D2E30]">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#2A2B2D] text-xs font-medium text-slate-700 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white flex items-center space-x-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : step === 3 ? (
            <button
              onClick={handlePreview}
              disabled={isPreviewing || !activeFolderId}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white flex items-center space-x-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isPreviewing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning Drive...</span>
                </>
              ) : (
                <>
                  <span>Review Extracted Data</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1A73E8] via-[#4285F4] to-[#A855F7] text-xs font-bold text-white flex items-center space-x-2 shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all cursor-pointer hover:brightness-110 active:scale-95"
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