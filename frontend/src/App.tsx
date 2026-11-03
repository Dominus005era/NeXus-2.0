import React, { useEffect, useState, Suspense, lazy } from 'react';
import { WorkspaceConfig } from './components/OnboardingWizard';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { ThemeProvider } from './context/ThemeContext';
import { api } from './services/api';

// Code Splitting via React.lazy for optimized bundle size & fast initial paint
const LandingPage = lazy(() =>
  import('./components/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const ExecutiveChat = lazy(() =>
  import('./components/ExecutiveChat').then((m) => ({ default: m.ExecutiveChat }))
);
const SwarmStudio = lazy(() =>
  import('./components/SwarmStudio').then((m) => ({ default: m.SwarmStudio }))
);
const OnboardingWizard = lazy(() =>
  import('./components/OnboardingWizard').then((m) => ({ default: m.OnboardingWizard }))
);

type TargetView = 'chat' | 'swarm';

const ViewLoadingFallback = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0C0E]">
    <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-[#888888] font-mono">
      <span className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      <span>Loading Nexus Module...</span>
    </div>
  </div>
);

const AuthenticatedApp: React.FC = () => {
  const { session, loading, openAuth } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | TargetView>('landing');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [pendingTarget, setPendingTarget] = useState<TargetView | null>(null);
  const [workspaceReady, setWorkspaceReady] = useState<boolean>(false);
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
    if (!session?.user) {
      setWorkspaceReady(true);
      return;
    }

    setWorkspaceReady(false);
    api
      .getCurrentWorkspace()
      .then((data) => {
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
      })
      .finally(() => {
        if (active) setWorkspaceReady(true);
      });

    return () => {
      active = false;
    };
  }, [session?.user.id]);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      setCurrentView('landing');
      setShowOnboarding(false);
      setWorkspaceConfig(null);
      setPendingTarget(null);
    }
  }, [session, loading]);

  useEffect(() => {
    if (!session?.user || !workspaceReady) return;
    const stored = pendingTarget || (sessionStorage.getItem('nexus_pending_target') as TargetView | null);
    if (!stored) return;

    sessionStorage.removeItem('nexus_pending_target');
    setPendingTarget(null);
    if (!workspaceConfig) {
      setShowOnboarding(true);
    } else {
      setCurrentView(stored);
    }
  }, [session?.user.id, workspaceReady, pendingTarget, workspaceConfig]);

  const handleLaunchWorkspace = (target: TargetView = 'chat') => {
    if (!session?.user) {
      sessionStorage.setItem('nexus_pending_target', target);
      setPendingTarget(target);
      openAuth('signin');
      return;
    }
    if (!workspaceReady) {
      sessionStorage.setItem('nexus_pending_target', target);
      setPendingTarget(target);
      return;
    }
    if (!workspaceConfig) {
      setShowOnboarding(true);
    } else {
      setCurrentView(target);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0C0E]">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#888888]">
          <span className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Loading Nexus...
        </div>
      </div>
    );
  }

  const activeView = session ? currentView : 'landing';

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0B0C0E] text-slate-900 dark:text-[#E3E3E3] font-sans antialiased selection:bg-[#4285F4]/20 dark:selection:bg-[#A8C7FA]/30 selection:text-slate-900 dark:selection:text-white transition-colors duration-200">
      <Suspense fallback={<ViewLoadingFallback />}>
        {activeView === 'landing' && (
          <LandingPage
            onGetStarted={() => handleLaunchWorkspace('chat')}
            onSignIn={() => handleLaunchWorkspace('chat')}
            isAuthenticated={Boolean(session)}
            onOpenDeploymentGuide={() => handleLaunchWorkspace('chat')}
            onSelectModel={(_modelId, targetView) => {
              handleLaunchWorkspace(targetView === 'flow' ? 'swarm' : 'chat');
            }}
          />
        )}

        {activeView === 'chat' && (
          <ExecutiveChat
            onBackToLanding={() => setCurrentView('landing')}
            onSwitchToSwarm={() => setCurrentView('swarm')}
            activeView={activeView}
          />
        )}

        {activeView === 'swarm' && (
          <SwarmStudio
            onBackToLanding={() => setCurrentView('landing')}
            onSwitchToChat={() => setCurrentView('chat')}
            activeView={activeView}
          />
        )}

        {showOnboarding && session && (
          <OnboardingWizard
            onComplete={(config) => {
              setWorkspaceConfig(config);
              setShowOnboarding(false);
              setCurrentView('chat');
            }}
          />
        )}
      </Suspense>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ThemeProvider>
  );
};
