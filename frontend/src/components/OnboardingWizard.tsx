import React, { useState } from 'react';
import { Sparkles, ArrowRight, Building, User, Database, CheckCircle2, ShieldCheck, Globe } from 'lucide-react';

export interface WorkspaceConfig {
  userName: string;
  userRole: string;
  companyName: string;
  companyStructure: string;
  cloudDocsLink: string;
}

interface OnboardingWizardProps {
  onComplete: (config: WorkspaceConfig) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [userName, setUserName] = useState('Rahul Singh');
  const [userRole, setUserRole] = useState('CEO & Founder');
  const [companyName, setCompanyName] = useState('TechMart Electronics');
  const [companyStructure, setCompanyStructure] = useState(
    `CEO (Rahul) -> Swarm Orchestrator\n  ├── Sales Intelligence (Promotions & Velocity)\n  ├── Inventory & Supply Chain (Bin 4B & Safety Stock)\n  └── Treasury & Governance (Statutory Reserve & Cash Cap)`
  );
  const [cloudDocsLink, setCloudDocsLink] = useState('https://drive.google.com/drive/folders/1D8_pTP908E-N5CYrxtavhaJzDcBs3gQc?usp=sharing');

  const handleFinish = () => {
    const config: WorkspaceConfig = {
      userName: userName.trim() || 'Rahul Singh',
      userRole: userRole.trim() || 'CEO',
      companyName: companyName.trim() || 'TechMart Electronics',
      companyStructure: companyStructure.trim(),
      cloudDocsLink: cloudDocsLink.trim(),
    };
    localStorage.setItem('nexus_workspace_config', JSON.stringify(config));
    onComplete(config);
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
                Step {step} of 3 • Cloud Database Registration
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

        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-xs text-[#A8C7FA] font-semibold uppercase tracking-wider">
              1. Executive Profile & Enterprise Identity
            </div>

            <div>
              <label className="text-xs text-[#888888] flex items-center space-x-1 mb-1">
                <User className="w-3.5 h-3.5 text-[#4285F4]" />
                <span>Executive Full Name</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-[#131314] text-xs text-white p-3 rounded-xl border border-[#2D2E30] focus:outline-none focus:border-[#4285F4]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#888888] flex items-center space-x-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4285F4]" />
                  <span>Executive Role</span>
                </label>
                <input
                  type="text"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
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
                  className="w-full bg-[#131314] text-xs text-white p-3 rounded-xl border border-[#2D2E30] focus:outline-none focus:border-[#4285F4]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: COMPANY STRUCTURE */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-xs text-[#A8C7FA] font-semibold uppercase tracking-wider">
              2. Company Structure Hierarchy (AI Swarm DAG Input)
            </div>
            <p className="text-xs text-[#888888]">
              Paste your organizational hierarchy text below. Swarm Studio will construct parallel agent nodes matching your structure.
            </p>
            <textarea
              rows={5}
              value={companyStructure}
              onChange={(e) => setCompanyStructure(e.target.value)}
              className="w-full bg-[#131314] text-xs font-mono text-[#C4C7C5] p-3 rounded-xl border border-[#2D2E30] focus:outline-none focus:border-[#4285F4] resize-none leading-relaxed"
            />
          </div>
        )}

        {/* STEP 3: GOOGLE DRIVE LINK */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-xs text-[#A8C7FA] font-semibold uppercase tracking-wider">
              3. Enterprise Shared Cloud Database & Docs Link
            </div>
            <p className="text-xs text-[#888888]">
              Provide your publicly shared Google Drive folder link containing company records, sales reports, and inventory ledgers.
            </p>

            <div>
              <label className="text-xs text-[#888888] flex items-center space-x-1 mb-1">
                <Globe className="w-3.5 h-3.5 text-[#34A853]" />
                <span>Shared Google Drive Folder Link</span>
              </label>
              <input
                type="text"
                value={cloudDocsLink}
                onChange={(e) => setCloudDocsLink(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full bg-[#131314] text-xs text-white p-3 rounded-xl border border-[#2D2E30] focus:outline-none focus:border-[#4285F4]"
              />
              <div className="text-[10px] text-[#34A853] mt-2 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Google Drive Shared Link Active (Tech Folder ID: 1D8_pTP908E-N5CYrxtavhaJzDcBs3gQc)</span>
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1A73E8] via-[#4285F4] to-[#A855F7] text-xs font-bold text-white flex items-center space-x-2 shadow-lg shadow-[#1A73E8]/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Launch Workspace</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};