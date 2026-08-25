'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { AgentNode, type AgentNodeData } from './AgentNode';
import { DataPacketEdge } from './DataPacketEdge';
import { NodeInspector } from './NodeInspector';

const nodeTypes = {
  agentNode: AgentNode,
};

const edgeTypes = {
  dataPacket: DataPacketEdge,
};

interface AgentNetworkProps {
  agents: Array<{
    id: string;
    role: string;
    status: string;
    token_budget?: number;
    tokens_used?: number;
  }>;
  tasks?: Array<{
    id: string;
    role: string;
    status: string;
    depends_on: string[];
  }>;
  onNodeClick?: (agentData: AgentNodeData) => void;
}

export function AgentNetwork({ agents, tasks, onNodeClick }: AgentNetworkProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AgentNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentNodeData | null>(null);

  // Generate graph layout based on agent roles & dependencies
  useEffect(() => {
    if (!agents || agents.length === 0) return;

    // Define positions in an organic, governed hierarchy:
    // Left: Research, Product
    // Center: AI Architect, System Architect, Privacy/Risk
    // Right: Reviewer, Solutions Officer
    const rolePositions: Record<string, { x: number; y: number }> = {
      mission_interpreter: { x: 50, y: 150 },
      research_analyst: { x: 50, y: 320 },
      product_strategist: { x: 280, y: 220 },
      ai_architect: { x: 520, y: 120 },
      system_architect: { x: 520, y: 320 },
      privacy_risk: { x: 520, y: 480 },
      consistency_reviewer: { x: 780, y: 220 },
      solutions_officer: { x: 1020, y: 220 },
    };

    const initialNodes: Node<AgentNodeData>[] = agents.map((agt, i) => {
      const pos = rolePositions[agt.role] || {
        x: 200 + (i % 3) * 240,
        y: 100 + Math.floor(i / 3) * 180,
      };

      return {
        id: agt.id || `node_${agt.role}`,
        type: 'agentNode',
        position: pos,
        data: {
          role: agt.role,
          status: agt.status || 'PENDING',
          tokensUsed: agt.tokens_used || 0,
          tokenBudget: agt.token_budget || 5000,
          taskCount: 1,
        },
      };
    });

    // Generate edges connecting the governance workflow
    const edgeConnections = [
      { source: 'research_analyst', target: 'product_strategist' },
      { source: 'product_strategist', target: 'ai_architect' },
      { source: 'product_strategist', target: 'system_architect' },
      { source: 'system_architect', target: 'privacy_risk' },
      { source: 'ai_architect', target: 'consistency_reviewer' },
      { source: 'system_architect', target: 'consistency_reviewer' },
      { source: 'privacy_risk', target: 'consistency_reviewer' },
      { source: 'consistency_reviewer', target: 'solutions_officer' },
    ];

    const initialEdges: Edge[] = [];
    edgeConnections.forEach((conn, idx) => {
      const srcNode = initialNodes.find((n) => n.data.role === conn.source);
      const tgtNode = initialNodes.find((n) => n.data.role === conn.target);
      if (srcNode && tgtNode) {
        initialEdges.push({
          id: `e_${srcNode.id}_${tgtNode.id}`,
          source: srcNode.id,
          target: tgtNode.id,
          type: 'dataPacket',
          data: {
            active: srcNode.data.status === 'ACTIVE' || tgtNode.data.status === 'ACTIVE' || srcNode.data.status === 'COMPLETED',
          },
        });
      }
    });

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [agents, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_: any, node: Node<AgentNodeData>) => {
      setSelectedAgent(node.data);
      if (onNodeClick) onNodeClick(node.data);
    },
    [onNodeClick]
  );

  return (
    <div className="relative w-full h-[640px] rounded-2xl overflow-hidden glass-thick border border-white/10 shadow-2xl flex">
      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="rgba(124, 58, 237, 0.12)" size={1} gap={24} />
          <Controls className="!bg-black/60 !border-white/10 !text-white !rounded-xl !p-1" />
          <MiniMap
            nodeColor={(n) => {
              const status = (n.data as AgentNodeData)?.status;
              if (status === 'ACTIVE') return '#7c3aed';
              if (status === 'COMPLETED') return '#10b981';
              if (status === 'REVIEW') return '#06b6d4';
              return '#475569';
            }}
            className="!bg-black/60 !border-white/10 !rounded-xl"
          />
        </ReactFlow>
      </div>

      {/* Right Rail Inspector */}
      {selectedAgent && (
        <NodeInspector agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
    </div>
  );
}
