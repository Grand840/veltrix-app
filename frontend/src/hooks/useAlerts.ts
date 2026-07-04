"use client";

import useSWR from "swr";
import { alertsApi } from "@/lib/api";
import type { AlertListResponse } from "@/types";

export function useAlerts(params?: {
  status?: string;
  severity?: string;
  page?: number;
  per_page?: number;
}) {
  const key = `alerts-${params?.status}-${params?.severity}-${params?.page || 1}`;

  const { data, error, isLoading, mutate } = useSWR<AlertListResponse>(
    key,
    () => alertsApi.list(params).then((r) => r.data),
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
    }
  );

  return {
    alerts: data?.alerts ?? [],
    total: data?.total ?? 0,
    totalFiring: data?.total_firing ?? 0,
    totalCritical: data?.total_critical ?? 0,
    isLoading,
    error,
    refresh: mutate,
  };
}
