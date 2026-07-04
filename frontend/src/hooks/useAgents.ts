"use client";

import useSWR from "swr";
import { agentsApi, metricsApi } from "@/lib/api";
import type { Agent, AgentListResponse, AgentMetricsSummary } from "@/types";

export function useAgents(params?: { status?: string; page?: number }) {
  const key = params?.status
    ? `agents-${params.status}-${params.page || 1}`
    : `agents-all-${params?.page || 1}`;

  const { data, error, isLoading, mutate } = useSWR<AgentListResponse>(
    key,
    () => agentsApi.list(params).then((r) => r.data),
    { refreshInterval: 30_000, revalidateOnFocus: true }
  );

  return {
    agents: data?.agents ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useMetricsOverview() {
  const { data, error, isLoading, mutate } = useSWR<AgentMetricsSummary[]>(
    "metrics-overview",
    () => metricsApi.overview().then((r) => r.data),
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
      keepPreviousData: true,
    }
  );

  return {
    summaries: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useAgentSummary(agentId: string | null) {
  const { data, error, isLoading } = useSWR<AgentMetricsSummary>(
    agentId ? `agent-summary-${agentId}` : null,
    () => metricsApi.summary(agentId!).then((r) => r.data),
    { refreshInterval: 30_000 }
  );

  return { summary: data, isLoading, error };
}
