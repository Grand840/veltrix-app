"use client";

import useSWR from "swr";
import { billingApi } from "@/lib/api";
import type { BillingStatus, PlanInfo } from "@/types";

export function useBilling() {
  const { data, error, isLoading, mutate } = useSWR<BillingStatus>(
    "billing-status",
    () => billingApi.status().then((r) => r.data),
    { refreshInterval: 60_000 }
  );
  return { billing: data, isLoading, error, refresh: mutate };
}

export function usePlans() {
  const { data, isLoading } = useSWR<PlanInfo[]>(
    "billing-plans",
    () => billingApi.plans().then((r) => r.data)
  );
  return { plans: data ?? [], isLoading };
}
