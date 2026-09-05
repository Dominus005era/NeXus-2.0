import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ExecutiveChat } from './components/ExecutiveChat';
import { SwarmStudio } from './components/SwarmStudio';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'chat' | 'swarm'>('landing');

  return (
    <div className="min-h-screen w-full bg-[#131313] text-[#E3E3E3] font-sans antialiased selection:bg-[#A8C7FA]/30 selection:text-white">
      {currentView === 'landing' && (
        <LandingPage
          onGetStarted={() => setCurrentView('chat')}
          onOpenDeploymentGuide={() => setCurrentView('chat')}
          onSelectModel={(modelId, targetView) => {
            if (targetView === 'flow') {
              setCurrentView('swarm');
            } else {
              setCurrentView('chat');
            }
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
    </div>
  );
};
