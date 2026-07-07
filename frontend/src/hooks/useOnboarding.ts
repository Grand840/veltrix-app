"use client";

import { useCallback, useEffect, useState } from "react";
import { useOrgStats } from "@/hooks/useOrganization";

const STORAGE_KEY = "veltrix_onboarding_dismissed";

export function useOnboarding() {
  const { stats, isLoading } = useOrgStats();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isLoading || !stats) return;
    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
    setShow(stats.agents_total === 0 && !dismissed);
  }, [stats, isLoading]);

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setShow(false);
  }, []);

  return { showOnboarding: show, dismissOnboarding: dismiss, isLoading };
}
