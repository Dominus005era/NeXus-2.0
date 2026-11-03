import React, { useEffect, useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ExecutiveChat } from './components/ExecutiveChat';
import { SwarmStudio } from './components/SwarmStudio';
import { OnboardingWizard, WorkspaceConfig } from './components/OnboardingWizard';
import { AuthGate, useAuth } from './components/AuthGate';
import { ThemeProvider } from './context/ThemeContext';
import { api } from './services/api';

const AuthenticatedApp: React.FC = () => {
  const { session } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'chat' | 'swarm'>('landing');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [workspaceConfig, setWorkspaceConfig] = useState<WorkspaceConfig | null>(() => {
    const saved = localStorage.getItem('nexus_workspace_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    let active = true;
    api.getCurrentWorkspace().then((data) => {
      if (!active || !data) return;
      if (!data.configured) {
        localStorage.removeItem('nexus_workspace_config');
        setWorkspaceConfig(null);
        return;
      }
      const config: WorkspaceConfig = {
        userName: data.user_name,
        userRole: data.user_role,
        authorityLevel: data.authority_level,
        companyName: data.company_name,
        primaryProduct: data.primary_product,
        industry: data.industry,
        companyStructure: data.company_structure || '',
        cloudDocsLink: data.cloud_docs_link || '',
      };
      localStorage.setItem('nexus_workspace_config', JSON.stringify(config));
      setWorkspaceConfig(config);
    });
    return () => {
      active = false;
    };
  }, [session?.user.id]);

  const handleLaunchWorkspace = (targetView: 'chat' | 'swarm' = 'chat') => {
    if (!workspaceConfig) {
      setShowOnboarding(true);
    } else {
      setCurrentView(targetView);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0B0C0E] text-slate-900 dark:text-[#E3E3E3] font-sans antialiased selection:bg-[#4285F4]/20 dark:selection:bg-[#A8C7FA]/30 selection:text-slate-900 dark:selection:text-white transition-colors duration-200">
      {currentView === 'landing' && (
        <LandingPage
          onGetStarted={() => handleLaunchWorkspace('chat')}
          onOpenDeploymentGuide={() => handleLaunchWorkspace('chat')}
          onSelectModel={(_modelId, targetView) => {
            handleLaunchWorkspace(targetView === 'flow' ? 'swarm' : 'chat');
          }}
        />
      )}

      {currentView === 'chat' && (
        <ExecutiveChat
          onBackToLanding={() => setCurrentView('landing')}
          onSwitchToSwarm={() => setCurrentView('swarm')}
          activeView={currentView}
        />
      )}

      {currentView === 'swarm' && (
        <SwarmStudio
          onBackToLanding={() => setCurrentView('landing')}
          onSwitchToChat={() => setCurrentView('chat')}
          activeView={currentView}
        />
      )}

      {showOnboarding && (
        <OnboardingWizard
          onComplete={(config) => {
            setWorkspaceConfig(config);
            setShowOnboarding(false);
            setCurrentView('chat');
          }}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthGate>
        <AuthenticatedApp />
      </AuthGate>
    </ThemeProvider>
  );
};
