"use client";

import { cn, healthColor } from "@/lib/utils";
import type { HealthStatus } from "@/types";

interface MetricGaugeProps {
  label: string;
  value: number | null;
  health: HealthStatus;
  size?: "sm" | "md";
}

const STROKE_COLORS: Record<HealthStatus, string> = {
  ok:       "#22c55e",
  warning:  "#eab308",
  critical: "#ef4444",
  unknown:  "#d1d5db",
};

export function MetricGauge({ label, value, health, size = "md" }: MetricGaugeProps) {
  const dim = size === "sm" ? 56 : 72;
  const radius = (dim - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = value ?? 0;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={dim} height={dim} className="-rotate-90">
        <circle cx={dim / 2} cy={dim / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle
          cx={dim / 2} cy={dim / 2} r={radius} fill="none"
          stroke={STROKE_COLORS[health]} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="relative" style={{ marginTop: -(dim + 4) }}>
        <div style={{ width: dim, height: dim }} className="flex flex-col items-center justify-center">
          <span className={cn("font-bold leading-none", size === "sm" ? "text-xs" : "text-sm", healthColor(health))}>
            {value !== null ? `${Math.round(value)}%` : "—"}
          </span>
        </div>
      </div>
      <span className="text-xs text-gray-400 mt-1">{label}</span>
    </div>
  );
}
