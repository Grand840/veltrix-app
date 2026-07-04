"use client";

import { cn, agentStatusLabel } from "@/lib/utils";
import type { AgentStatus } from "@/types";

interface AgentStatusBadgeProps {
  status: AgentStatus;
  showDot?: boolean;
}

const STATUS_STYLES: Record<AgentStatus, string> = {
  online:   "bg-green-100 text-green-700 border-green-200",
  offline:  "bg-red-100 text-red-700 border-red-200",
  pending:  "bg-yellow-100 text-yellow-700 border-yellow-200",
  disabled: "bg-gray-100 text-gray-600 border-gray-200",
};

const DOT_STYLES: Record<AgentStatus, string> = {
  online:   "bg-green-500",
  offline:  "bg-red-500",
  pending:  "bg-yellow-500",
  disabled: "bg-gray-400",
};

export function AgentStatusBadge({ status, showDot = true }: AgentStatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border", STATUS_STYLES[status])}>
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", DOT_STYLES[status], status === "online" && "animate-pulse")} />
      )}
      {agentStatusLabel(status)}
    </span>
  );
}
