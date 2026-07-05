"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Server, Wifi, WifiOff, Clock, Monitor, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AgentStatusBadge } from "@/components/agents/AgentStatusBadge";
import { MetricGauge } from "@/components/agents/MetricGauge";
import { MetricChart } from "@/components/charts/MetricChart";
import { TimeRangeSelector } from "@/components/charts/TimeRangeSelector";
import { useAgentSummary } from "@/hooks/useAgents";
import { useMetricHistory, type TimeRange } from "@/hooks/useMetricHistory";
import { formatDate, timeAgo } from "@/lib/utils";
import { METRICS, THRESHOLDS } from "@/lib/metrics";
import useSWR from "swr";
import { agentsApi } from "@/lib/api";
import type { Agent } from "@/types";

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  const [range, setRange] = useState<TimeRange>("1h");

  const { data: agent, isLoading: agentLoading } = useSWR<Agent>(
    `agent-${agentId}`,
    () => agentsApi.get(agentId).then((r) => r.data),
    { refreshInterval: 30_000 }
  );

  const { summary } = useAgentSummary(agentId);

  const { points: cpuPoints,  isLoading: cpuLoading  } = useMetricHistory({ agentId, metric: METRICS.CPU,    range });
  const { points: ramPoints,  isLoading: ramLoading  } = useMetricHistory({ agentId, metric: METRICS.MEMORY, range });
  const { points: diskPoints, isLoading: diskLoading } = useMetricHistory({ agentId, metric: METRICS.DISK,   range });

  if (agentLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Agent introuvable</p>
        <Button variant="outline" onClick={() => router.back()}>Retour</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />Retour
        </Button>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Server className="h-5 w-5 text-gray-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-gray-900 truncate">{agent.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <AgentStatusBadge status={agent.status} />
              {agent.last_seen_at && <span className="text-xs text-gray-400">Vu {timeAgo(agent.last_seen_at)}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Informations système</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { icon: Monitor,    label: "Hostname", value: agent.hostname   },
              { icon: HardDrive,  label: "OS",       value: agent.os_info   },
              { icon: Wifi,       label: "IP",        value: agent.ip_address },
              { icon: Clock,      label: "Ajouté le", value: formatDate(agent.created_at) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 text-gray-600">
                <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="font-medium">{label} :</span>
                <span className="text-gray-900 truncate">{value || "—"}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Métriques actuelles</CardTitle>
          </CardHeader>
          <CardContent>
            {agent.status === "online" && summary ? (
              <div className="flex justify-around py-2">
                <MetricGauge label="CPU"    value={summary.cpu_usage_percent}    health={summary.cpu_health}    size="md" />
                <MetricGauge label="RAM"    value={summary.memory_usage_percent} health={summary.memory_health} size="md" />
                <MetricGauge label="Disque" value={summary.disk_usage_percent}   health={summary.disk_health}   size="md" />
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-gray-400 text-sm gap-2">
                <WifiOff className="h-4 w-4" />
                {agent.status === "pending" ? "En attente de la première connexion" : "Agent hors ligne"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-700">Historique</CardTitle>
            <TimeRangeSelector value={range} onChange={setRange} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { label: "CPU",    points: cpuPoints,  loading: cpuLoading,  color: "#3b82f6", t: THRESHOLDS.cpu    },
            { label: "RAM",    points: ramPoints,  loading: ramLoading,  color: "#8b5cf6", t: THRESHOLDS.memory },
            { label: "Disque", points: diskPoints, loading: diskLoading, color: "#10b981", t: THRESHOLDS.disk   },
          ].map(({ label, points, loading, color, t }, i) => (
            <div key={label}>
              {i > 0 && <div className="border-t border-gray-100 mb-6" />}
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{label}</p>
              <MetricChart points={points} isLoading={loading} color={color} unit="%"
                warningThreshold={t.warning} criticalThreshold={t.critical} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
