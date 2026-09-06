import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ExecutiveChat } from './components/ExecutiveChat';
import { SwarmStudio } from './components/SwarmStudio';
import { OnboardingWizard, WorkspaceConfig } from './components/OnboardingWizard';

export const App: React.FC = () => {
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

  const handleLaunchWorkspace = (targetView: 'chat' | 'swarm' = 'chat') => {
    if (!workspaceConfig) {
      setShowOnboarding(true);
    } else {
      setCurrentView(targetView);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0C0E] text-[#E3E3E3] font-sans antialiased selection:bg-[#A8C7FA]/30 selection:text-white">
      {currentView === 'landing' && (
        <LandingPage
          onGetStarted={() => handleLaunchWorkspace('chat')}
          onOpenDeploymentGuide={() => handleLaunchWorkspace('chat')}
          onSelectModel={(modelId, targetView) => {
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
