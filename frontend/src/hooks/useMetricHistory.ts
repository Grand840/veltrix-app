"use client";

import useSWR from "swr";
import { metricsApi } from "@/lib/api";
import type { MetricSeries } from "@/types";

export type TimeRange = "1h" | "24h" | "7d";

const RANGE_CONFIG: Record<TimeRange, { start: string; step: string }> = {
  "1h":  { start: "1h",  step: "30s" },
  "24h": { start: "24h", step: "5m"  },
  "7d":  { start: "7d",  step: "1h"  },
};

interface UseMetricHistoryOptions {
  agentId: string | null;
  metric: string;
  range: TimeRange;
}

export function useMetricHistory({ agentId, metric, range }: UseMetricHistoryOptions) {
  const config = RANGE_CONFIG[range];
  const { data, error, isLoading } = useSWR<MetricSeries>(
    agentId ? `history-${agentId}-${metric}-${range}` : null,
    () => metricsApi.history(agentId!, metric, config).then((r) => r.data),
    {
      refreshInterval: 60_000,
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );
  return { series: data, points: data?.points ?? [], isLoading, error };
}
