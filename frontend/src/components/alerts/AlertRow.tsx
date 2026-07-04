"use client";

import { AlertTriangle, Info, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, timeAgo, severityBadgeVariant } from "@/lib/utils";
import type { Alert } from "@/types";

interface AlertRowProps {
  alert: Alert;
  onAck?: (id: string) => void;
}

const METRIC_LABELS: Record<string, string> = {
  cpu_usage:       "CPU",
  memory_usage:    "RAM",
  disk_usage:      "Disque",
  agent_down:      "Agent hors ligne",
  network_latency: "Latence réseau",
};

export function AlertRow({ alert, onAck }: AlertRowProps) {
  const Icon = alert.severity === "critical" || alert.severity === "warning" ? AlertTriangle : Info;

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border text-sm",
      alert.severity === "critical" ? "bg-red-50 border-red-200" :
      alert.severity === "warning" ? "bg-yellow-50 border-yellow-200" : "bg-blue-50 border-blue-200"
    )}>
      <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0",
        alert.severity === "critical" ? "text-red-500" :
        alert.severity === "warning" ? "text-yellow-500" : "text-blue-500"
      )} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 truncate">{alert.title}</span>
          <Badge variant={severityBadgeVariant(alert.severity)}>{alert.severity}</Badge>
          <Badge variant="outline">{METRIC_LABELS[alert.metric] || alert.metric}</Badge>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span className="truncate">Agent : <strong>{alert.agent_name}</strong></span>
          {alert.current_value !== null && <span>Valeur : {alert.current_value?.toFixed(1)}%</span>}
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(alert.fired_at)}</span>
        </div>
      </div>

      {alert.status === "firing" && onAck && (
        <button onClick={(e) => { e.preventDefault(); onAck(alert.id); }}
          className="flex-shrink-0 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-2 py-1 hover:bg-white transition-colors">
          Acquitter
        </button>
      )}
    </div>
  );
}
