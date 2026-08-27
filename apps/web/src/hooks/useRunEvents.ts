'use client';

import { useEffect, useState, useRef } from 'react';
import type { FeedEvent } from '@/components/ui/LiveEventFeed';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '';
  }
  return process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
};

const API_BASE_URL = getApiBaseUrl();

export interface AgentState {
  id: string;
  role: string;
  status: string;
  tokenBudget: number;
  tokensUsed: number;
  taskCount: number;
  mandate?: string;
  permittedTools?: string[];
  confidence?: number;
}

export interface TaskState {
  id: string;
  role: string;
  status: string;
  dependsOn: string[];
  outputSchema: string;
  riskLevel: string;
  tokensUsed: number;
}

export function useRunEvents(runId: string) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [agents, setAgents] = useState<Record<string, AgentState>>({});
  const [tasks, setTasks] = useState<Record<string, TaskState>>({});
  const [runStatus, setRunStatus] = useState<string>('RUNNING');
  const [tokensUsed, setTokensUsed] = useState<number>(0);
  const [costUsd, setCostUsd] = useState<number>(0.0);
  const [connected, setConnected] = useState<boolean>(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!runId) return;

    const url = `${API_BASE_URL}/api/runs/${runId}/events`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnected(true);
    };

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'stream_end') {
          setRunStatus(data.status || 'COMPLETED');
          es.close();
          return;
        }

        const feedEvt: FeedEvent = {
          id: data.id || `evt_${Date.now()}_${Math.random()}`,
          sequence: data.sequence ?? 0,
          type: data.type || 'unknown_event',
          actor: data.actor || 'system',
          summary: data.payload ? JSON.stringify(data.payload).substring(0, 80) : undefined,
          hash: data.hash || '000000000000',
          timestamp: data.timestamp || new Date().toISOString(),
        };

        setEvents((prev) => {
          if (prev.some((p) => p.sequence === feedEvt.sequence && p.id === feedEvt.id)) {
            return prev;
          }
          return [...prev, feedEvt];
        });

        // Update state based on event types
        if (data.type === 'task_started' && data.actor) {
          setAgents((prev) => ({
            ...prev,
            [data.actor]: {
              ...(prev[data.actor] || {
                id: data.actor_id || `agt_${data.actor}`,
                role: data.actor,
                tokenBudget: 5000,
                tokensUsed: 0,
                taskCount: 1,
              }),
              status: 'ACTIVE',
            },
          }));
        } else if (data.type === 'task_completed' && data.actor) {
          const used = data.payload?.tokens_used || 800;
          setTokensUsed((prev) => prev + used);
          setCostUsd((prev) => prev + used * 0.0000005);
          setAgents((prev) => ({
            ...prev,
            [data.actor]: {
              ...(prev[data.actor] || {
                id: data.actor_id || `agt_${data.actor}`,
                role: data.actor,
                tokenBudget: 5000,
                tokensUsed: 0,
                taskCount: 1,
              }),
              status: 'COMPLETED',
              tokensUsed: (prev[data.actor]?.tokensUsed || 0) + used,
            },
          }));
        } else if (data.type === 'run_completed') {
          setRunStatus('COMPLETED');
        }
      } catch (err) {
        console.warn('Failed to parse SSE event:', err);
      }
    };

    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
    };
  }, [runId]);

  return {
    events,
    agents,
    tasks,
    runStatus,
    tokensUsed,
    costUsd,
    connected,
    setAgents,
  };
}
