import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Activity, CheckCircle2, ChevronRight, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  NodeData,
  SwarmScenario,
  getInitialNodes,
  getScenarios,
  RANDOM_ENTERPRISE_COMMANDS,
} from './swarm/types';
import { SimulationControls } from './swarm/SimulationControls';
import { SwarmCanvas } from './swarm/SwarmCanvas';
import { NodeInspectDrawer } from './swarm/NodeInspectDrawer';

interface SwarmStudioProps {
  onBackToLanding: () => void;
  onSwitchToChat: () => void;
  activeView: 'chat' | 'swarm';
}

export const SwarmStudio: React.FC<SwarmStudioProps> = ({
  onBackToLanding,
  onSwitchToChat,
}) => {
  const workspaceConfig = useMemo(() => {
    const saved = localStorage.getItem('nexus_workspace_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  }, []);

  const companyName = workspaceConfig?.companyName || 'TechMart Electronics';
  const userName = workspaceConfig?.userName || 'Executive User';
  const userRole = workspaceConfig?.userRole || 'CEO & Founder';
  const authorityLevel = workspaceConfig?.authorityLevel || 'LEVEL_4_EXECUTIVE';
  const primaryProduct = workspaceConfig?.primaryProduct || 'P100 Headphones';

  const initialNodes = useMemo(
    () => getInitialNodes(userName, userRole, authorityLevel, companyName, primaryProduct),
    [userName, userRole, authorityLevel, companyName, primaryProduct]
  );

  const scenarios = useMemo(
    () => getScenarios(companyName, primaryProduct),
    [companyName, primaryProduct]
  );

  const [nodes, setNodes] = useState<NodeData[]>(initialNodes);
  const [currentScenario, setCurrentScenario] = useState<SwarmScenario>(scenarios[0]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed] = useState<number>(1.8);
  const [customPromptInput, setCustomPromptInput] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [pan, setPan] = useState({ x: 30, y: 10 });
  const [zoom, setZoom] = useState(0.85);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [activeThoughts, setActiveThoughts] = useState<Record<string, string>>({});
  const [activeTelemetry, setActiveTelemetry] = useState<Record<string, string>>({});
  const [completedNodeIds, setCompletedNodeIds] = useState<Set<string>>(new Set());

  const timerRef = useRef<any>(null);

  const currentStep =
    activeStepIndex >= 0 && activeStepIndex < currentScenario.steps.length
      ? currentScenario.steps[activeStepIndex]
      : undefined;

  useEffect(() => {
    if (activeStepIndex < 0 || activeStepIndex >= currentScenario.steps.length) return;
    const step = currentScenario.steps[activeStepIndex];

    if (step.sourceThought) {
      setActiveThoughts((prev) => ({ ...prev, [step.sourceId]: step.sourceThought! }));
    }
    if (step.targetThought) {
      setActiveThoughts((prev) => ({ ...prev, [step.targetId]: step.targetThought }));
    }
    if (step.telemetryBadge) {
      setActiveTelemetry((prev) => ({ ...prev, [step.targetId]: step.telemetryBadge! }));
    }

    setCompletedNodeIds((prev) => new Set([...prev, step.sourceId, step.targetId]));
  }, [activeStepIndex, currentScenario]);

  const handleNextStep = useCallback(() => {
    setActiveStepIndex((prev) => {
      if (prev + 1 >= currentScenario.steps.length) {
        setIsPlaying(false);
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335'],
        });
        return currentScenario.steps.length;
      }
      return prev + 1;
    });
  }, [currentScenario.steps.length]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        handleNextStep();
      }, 1600 / playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, handleNextStep]);

  const handleTogglePlay = () => {
    if (activeStepIndex >= currentScenario.steps.length) {
      setActiveStepIndex(0);
      setActiveThoughts({});
      setActiveTelemetry({});
      setCompletedNodeIds(new Set());
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setActiveStepIndex(0);
    setActiveThoughts({});
    setActiveTelemetry({});
    setCompletedNodeIds(new Set());
  };

  const handleSelectScenario = (sc: SwarmScenario) => {
    setIsPlaying(false);
    setCurrentScenario(sc);
    setActiveStepIndex(0);
    setActiveThoughts({});
    setActiveTelemetry({});
    setCompletedNodeIds(new Set());
  };

  const handleTriggerRandomDirective = () => {
    const randomItem = RANDOM_ENTERPRISE_COMMANDS[Math.floor(Math.random() * RANDOM_ENTERPRISE_COMMANDS.length)];
    handleApplyCustomPrompt(randomItem.prompt, randomItem.scenarioType);
  };

  const handleApplyCustomPrompt = (prompt: string, targetScenarioId: string = 'collab_surge_milp') => {
    setIsPlaying(false);
    const base = scenarios.find((s) => s.id === targetScenarioId) || scenarios[0];
    const customScenario: SwarmScenario = {
      ...base,
      id: `custom-${Date.now()}`,
      title: `Custom Directive`,
      prompt: prompt,
      steps: base.steps.map((step, idx) => {
        if (idx === 0) {
          return {
            ...step,
            sourceThought: `Executive dispatched custom directive: "${prompt.slice(0, 48)}..."`,
            targetThought: `Orchestrator decomposing: "${prompt.slice(0, 52)}..."`,
            telemetryBadge: `Directive: "${prompt.slice(0, 24)}..."`,
          };
        }
        return step;
      }),
    };

    setCurrentScenario(customScenario);
    setActiveStepIndex(0);
    setActiveThoughts({});
    setActiveTelemetry({});
    setCompletedNodeIds(new Set());
    setIsPlaying(true);
  };

  const handleCustomPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPromptInput.trim()) return;
    handleApplyCustomPrompt(customPromptInput.trim());
    setCustomPromptInput('');
  };

  const handleNodePointerDown = (nodeId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;
    setDragOffset({
      x: e.clientX / zoom - targetNode.x,
      y: e.clientY / zoom - targetNode.y,
    });
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.target !== e.currentTarget && (e.target as HTMLElement).closest('.node-card')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    setSelectedNodeId(null);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingNodeId) {
      const newX = e.clientX / zoom - dragOffset.x;
      const newY = e.clientY / zoom - dragOffset.y;
      setNodes((prev) =>
        prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
      );
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handlePointerUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleResetLayout = () => {
    setNodes(initialNodes);
    setPan({ x: 30, y: 10 });
    setZoom(0.85);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAFC] dark:bg-[#0B0C0E] text-slate-900 dark:text-[#E3E3E3] font-sans overflow-hidden transition-colors duration-200">
      <SimulationControls
        companyName={companyName}
        currentScenario={currentScenario}
        scenarios={scenarios}
        activeStepIndex={activeStepIndex}
        isPlaying={isPlaying}
        customPromptInput={customPromptInput}
        onBackToLanding={onBackToLanding}
        onSwitchToChat={onSwitchToChat}
        onTogglePlay={handleTogglePlay}
        onNextStep={handleNextStep}
        onRestart={handleRestart}
        onSelectScenario={handleSelectScenario}
        onTriggerRandomDirective={handleTriggerRandomDirective}
        onCustomPromptChange={setCustomPromptInput}
        onCustomPromptSubmit={handleCustomPromptSubmit}
      />

      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Telemetry & Step Progression Panel */}
        <aside className="w-72 border-r border-slate-200 dark:border-[#2D2E30] bg-white/90 dark:bg-[#1E1F20]/70 backdrop-blur-md p-4 space-y-4 shrink-0 overflow-y-auto z-20 shadow-sm">
          <div>
            <h3 className="text-xs font-bold text-blue-600 dark:text-[#A8C7FA] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Executive Directive</span>
              <Activity className="w-3.5 h-3.5 text-blue-500" />
            </h3>

            <div className="p-3 bg-slate-50 dark:bg-[#131314] rounded-2xl border border-slate-200 dark:border-[#2D2E30] text-xs space-y-2">
              <div className="text-slate-900 dark:text-white font-medium leading-relaxed">
                "{currentScenario.prompt}"
              </div>
              <div className="text-[10.5px] text-slate-500 dark:text-[#888888] pt-1 border-t border-slate-200 dark:border-[#2D2E30]">
                {currentScenario.description}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-[#C4C7C5] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Workflow Execution Trace</span>
              <span className="text-[10px] font-mono font-normal text-blue-600 dark:text-[#A8C7FA]">
                {activeStepIndex}/{currentScenario.steps.length}
              </span>
            </h3>

            <div className="space-y-2">
              {currentScenario.steps.map((step, idx) => {
                const isCompleted = activeStepIndex > idx;
                const isCurrent = activeStepIndex === idx;

                return (
                  <div
                    key={step.id}
                    className={`p-2.5 rounded-xl border text-xs transition-all ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-400 dark:border-blue-500/60 shadow-sm'
                        : isCompleted
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/40 text-slate-600 dark:text-[#81C995]'
                        : 'bg-slate-50 dark:bg-[#131314] border-slate-200 dark:border-[#2D2E30] opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span className="truncate">{step.label}</span>
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      {isCurrent && <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />}
                    </div>
                    {isCurrent && step.targetThought && (
                      <p className="text-[11px] text-slate-600 dark:text-[#C4C7C5] leading-relaxed mt-1 font-mono">
                        {step.targetThought}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Central SVG & Node Graph Canvas */}
        <SwarmCanvas
          nodes={nodes}
          currentScenario={currentScenario}
          activeStepIndex={activeStepIndex}
          currentStep={currentStep}
          completedNodeIds={completedNodeIds}
          activeThoughts={activeThoughts}
          activeTelemetry={activeTelemetry}
          selectedNodeId={selectedNodeId}
          draggingNodeId={draggingNodeId}
          zoom={zoom}
          pan={pan}
          isInteracting={isPanning || !!draggingNodeId}
          onZoomChange={setZoom}
          onResetLayout={handleResetLayout}
          onNodePointerDown={handleNodePointerDown}
          onCanvasPointerDown={handleCanvasPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        {/* Right Node Inspector Drawer */}
        <NodeInspectDrawer
          selectedNode={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onModelChange={(nodeId, newModel) => {
            setNodes((prev) =>
              prev.map((n) => (n.id === nodeId ? { ...n, model: newModel } : n))
            );
          }}
        />
      </div>
    </div>
  );
};
