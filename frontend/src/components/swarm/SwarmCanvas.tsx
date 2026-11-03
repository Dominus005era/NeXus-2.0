import React from 'react';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { NodeData, DynamicPipelineStep, SwarmScenario } from './types';
import { NodeCard } from './NodeCard';

interface SwarmCanvasProps {
  nodes: NodeData[];
  currentScenario: SwarmScenario;
  activeStepIndex: number;
  currentStep?: DynamicPipelineStep;
  completedNodeIds: Set<string>;
  activeThoughts: Record<string, string>;
  activeTelemetry: Record<string, string>;
  selectedNodeId: string | null;
  draggingNodeId: string | null;
  zoom: number;
  pan: { x: number; y: number };
  isInteracting: boolean;
  onZoomChange: (newZoom: number) => void;
  onResetLayout: () => void;
  onNodePointerDown: (nodeId: string, e: React.PointerEvent) => void;
  onCanvasPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
}

export const SwarmCanvas: React.FC<SwarmCanvasProps> = ({
  nodes,
  currentScenario,
  activeStepIndex,
  currentStep,
  completedNodeIds,
  activeThoughts,
  activeTelemetry,
  selectedNodeId,
  draggingNodeId,
  zoom,
  pan,
  isInteracting,
  onZoomChange,
  onResetLayout,
  onNodePointerDown,
  onCanvasPointerDown,
  onPointerMove,
  onPointerUp,
}) => {
  const nodeMap = React.useMemo(() => {
    const map = new Map<string, NodeData>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  const getDynamicWirePath = (sourceId: string, targetId: string) => {
    const sourceNode = nodeMap.get(sourceId);
    const targetNode = nodeMap.get(targetId);
    if (!sourceNode || !targetNode) return { path: '', midX: 0, midY: 0 };

    let startX: number;
    let startY = sourceNode.y + sourceNode.height / 2;
    let endX: number;
    let endY = targetNode.y + targetNode.height / 2;

    if (sourceNode.x < targetNode.x) {
      startX = sourceNode.x + sourceNode.width;
      endX = targetNode.x;
    } else if (sourceNode.x > targetNode.x) {
      startX = sourceNode.x;
      endX = targetNode.x + targetNode.width;
    } else {
      startX = sourceNode.x + sourceNode.width / 2;
      endX = targetNode.x + targetNode.width / 2;
      startY = sourceNode.y < targetNode.y ? sourceNode.y + sourceNode.height : sourceNode.y;
      endY = sourceNode.y < targetNode.y ? targetNode.y : targetNode.y + targetNode.height;
    }

    const deltaX = Math.abs(endX - startX);
    const curvature = Math.max(50, deltaX * 0.45);
    const cp1x = sourceNode.x <= targetNode.x ? startX + curvature : startX - curvature;
    const cp1y = startY;
    const cp2x = sourceNode.x <= targetNode.x ? endX - curvature : endX + curvature;
    const cp2y = endY;

    const path = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    return { path, midX, midY };
  };

  return (
    <div
      onPointerDown={onCanvasPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="flex-1 h-full relative overflow-hidden bg-slate-50/50 dark:bg-[#0B0C0E] select-none cursor-grab active:cursor-grabbing"
    >
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating Canvas Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 bg-white/90 dark:bg-[#1E1F20]/90 backdrop-blur-md border border-slate-200 dark:border-[#2D2E30] p-1.5 rounded-2xl shadow-lg">
        <button
          onClick={() => onZoomChange(Math.min(2.0, zoom + 0.1))}
          className="p-1.5 rounded-lg text-slate-600 dark:text-[#888888] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2D2E30]"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono text-blue-600 dark:text-[#A8C7FA] px-1 font-semibold">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => onZoomChange(Math.max(0.3, zoom - 0.1))}
          className="p-1.5 rounded-lg text-slate-600 dark:text-[#888888] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2D2E30]"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={onResetLayout}
          className="p-1.5 rounded-lg text-slate-600 dark:text-[#888888] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2D2E30] flex items-center space-x-1"
          title="Reset Agent Layout & View"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-[10px] font-medium hidden sm:inline">Reset Layout</span>
        </button>
      </div>

      {/* Transform Canvas Layer */}
      <div
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: isInteracting ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <svg className="absolute inset-0 w-[3000px] h-[1500px] pointer-events-none">
          {currentScenario.steps.map((step, idx) => {
            const isCompleted = activeStepIndex > idx;
            const isTransmitting = activeStepIndex === idx;

            if (!isCompleted && !isTransmitting) return null;

            const { path: pathD, midX, midY } = getDynamicWirePath(step.sourceId, step.targetId);
            if (!pathD) return null;

            const isPeerConsult = step.stepType === 'peer_consult';

            return (
              <g key={step.id}>
                {isTransmitting && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={step.color}
                    strokeWidth={isPeerConsult ? '10' : '8'}
                    strokeOpacity="0.28"
                    strokeLinecap="round"
                  />
                )}

                <path
                  d={pathD}
                  fill="none"
                  stroke={step.color}
                  strokeWidth={isTransmitting ? '3.5' : '2.5'}
                  strokeOpacity={isTransmitting ? 1.0 : 0.75}
                  strokeDasharray={isTransmitting ? '6 4' : isPeerConsult ? '5 3' : 'none'}
                  strokeLinecap="round"
                  className={isTransmitting ? 'flow-wire-animated' : ''}
                />

                {isTransmitting && !draggingNodeId && (
                  <g transform={`translate(${midX}, ${midY})`} className="pointer-events-none">
                    <rect
                      x={-Math.min(190, step.label.length * 4.4 + 24) / 2}
                      y="-12"
                      width={Math.min(190, step.label.length * 4.4 + 24)}
                      height="24"
                      rx="12"
                      fill="rgba(15, 23, 42, 0.95)"
                      stroke={step.color}
                      strokeWidth="1.5"
                      className="shadow-xl"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="sans-serif"
                    >
                      {step.label}
                    </text>
                  </g>
                )}

                {isTransmitting && pathD && !draggingNodeId && (
                  <g>
                    <circle r={isPeerConsult ? '7' : '6'} fill={step.color} className="packet-glow">
                      <animateMotion path={pathD} dur="1.1s" repeatCount="indefinite" />
                    </circle>
                    <circle r="3.5" fill="#FFFFFF" opacity="0.95">
                      <animateMotion path={pathD} dur="1.1s" begin="0.12s" repeatCount="indefinite" />
                    </circle>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {nodes.map((node) => {
          const isParticipating = currentScenario.participatingNodeIds.includes(node.id);
          const isTargetOfActive = currentStep?.targetId === node.id;
          const isSourceOfActive = currentStep?.sourceId === node.id;
          const isPeerConsulting = isSourceOfActive && currentStep?.stepType === 'peer_consult';
          const hasCompleted = completedNodeIds.has(node.id) && !isTargetOfActive;
          const isDragging = draggingNodeId === node.id;
          const liveThought = activeThoughts[node.id];
          const telemetry = activeTelemetry[node.id];

          return (
            <NodeCard
              key={node.id}
              node={node}
              isParticipating={isParticipating}
              isTargetOfActive={isTargetOfActive}
              isSourceOfActive={isSourceOfActive}
              isPeerConsulting={isPeerConsulting}
              hasCompleted={hasCompleted}
              isDragging={isDragging}
              isSelected={selectedNodeId === node.id}
              liveThought={liveThought}
              telemetry={telemetry}
              onPointerDown={onNodePointerDown}
            />
          );
        })}
      </div>
    </div>
  );
};
