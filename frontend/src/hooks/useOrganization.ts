"use client";

import useSWR from "swr";
import { orgApi } from "@/lib/api";
import type { OrganizationStats } from "@/types";

const fetcher = () => orgApi.getStats().then((r) => r.data);

export function useOrgStats() {
  const { data, error, isLoading, mutate } = useSWR<OrganizationStats>(
    "org-stats",
    fetcher,
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
      dedupingInterval: 5_000,
    }
  );

  return { stats: data, error, isLoading, refresh: mutate };
}
