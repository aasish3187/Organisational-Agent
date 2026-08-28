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
    title?: string;
  }>;
  tasks?: Array<{
    id: string;
    role: string;
    status: string;
    depends_on: string[];
  }>;
  onNodeClick?: (agentData: AgentNodeData) => void;
  projectDomain?: string;
  projectTitle?: string;
}

export function AgentNetwork({ agents, tasks, onNodeClick, projectDomain, projectTitle }: AgentNetworkProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AgentNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentNodeData | null>(null);

  // Generate graph layout based on agent roles & dependencies
  useEffect(() => {
    if (!agents || agents.length === 0) return;

    // Dynamically calculate positions in an organic multi-tier hierarchy
    const totalAgents = agents.length;
    const initialNodes: Node<AgentNodeData>[] = agents.map((agt, i) => {
      // Calculate level based on role heuristics or index
      let x = 100;
      let y = 200;

      const lower = agt.role.toLowerCase();
      if (lower.includes('research') || lower.includes('intelligence') || lower.includes('market') || lower.includes('interpreter')) {
        x = 60;
        y = 140 + (i % 2) * 200;
      } else if (lower.includes('product') || lower.includes('strategist') || lower.includes('operations')) {
        x = 280;
        y = 220;
      } else if (lower.includes('ai') || lower.includes('model') || lower.includes('rag')) {
        x = 520;
        y = 100;
      } else if (lower.includes('system') || lower.includes('infra') || lower.includes('ledger') || lower.includes('iot')) {
        x = 520;
        y = 280;
      } else if (lower.includes('privacy') || lower.includes('risk') || lower.includes('compliance') || lower.includes('guard')) {
        x = 520;
        y = 460;
      } else if (lower.includes('reviewer') || lower.includes('auditor') || lower.includes('consistency')) {
        x = 780;
        y = 220;
      } else if (lower.includes('solution') || lower.includes('director') || lower.includes('officer') || lower.includes('lead')) {
        x = 1020;
        y = 220;
      } else {
        // Organic grid distribution
        const col = Math.floor((i / totalAgents) * 4);
        const row = i % 3;
        x = 80 + col * 260;
        y = 120 + row * 180;
      }

      return {
        id: agt.id || `node_${agt.role}`,
        type: 'agentNode',
        position: { x, y },
        data: {
          role: agt.role,
          status: agt.status || 'PENDING',
          tokensUsed: agt.tokens_used || 0,
          tokenBudget: agt.token_budget || 5000,
          taskCount: 1,
        },
      };
    });

    // Generate dynamic edges from task dependencies or sequential pipeline
    const initialEdges: Edge[] = [];
    if (tasks && tasks.length > 0) {
      tasks.forEach((t) => {
        const targetNode = initialNodes.find((n) => n.data.role === t.role || n.id === t.id);
        if (targetNode && t.depends_on) {
          t.depends_on.forEach((depId) => {
            const srcTask = tasks.find((tk) => tk.id === depId);
            const srcRole = srcTask ? srcTask.role : depId;
            const srcNode = initialNodes.find((n) => n.data.role === srcRole || n.id === depId);
            if (srcNode && targetNode && srcNode.id !== targetNode.id) {
              const edgeId = `e_${srcNode.id}_${targetNode.id}`;
              if (!initialEdges.some((e) => e.id === edgeId)) {
                initialEdges.push({
                  id: edgeId,
                  source: srcNode.id,
                  target: targetNode.id,
                  type: 'dataPacket',
                  data: {
                    active:
                      srcNode.data.status === 'ACTIVE' ||
                      targetNode.data.status === 'ACTIVE' ||
                      srcNode.data.status === 'COMPLETED',
                  },
                });
              }
            }
          });
        }
      });
    }

    // Fallback pipeline edges if no task edges generated
    if (initialEdges.length === 0 && initialNodes.length > 1) {
      for (let i = 0; i < initialNodes.length - 1; i++) {
        initialEdges.push({
          id: `e_${initialNodes[i].id}_${initialNodes[i + 1].id}`,
          source: initialNodes[i].id,
          target: initialNodes[i + 1].id,
          type: 'dataPacket',
          data: {
            active: initialNodes[i].data.status === 'ACTIVE' || initialNodes[i].data.status === 'COMPLETED',
          },
        });
      }
    }

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [agents, tasks, setNodes, setEdges]);

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
        <NodeInspector
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          projectDomain={projectDomain}
          projectTitle={projectTitle}
        />
      )}
    </div>
  );
}
