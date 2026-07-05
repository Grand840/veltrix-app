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

  const { summary, isLoading: summaryLoading } = useAgentSummary(agentId);

  const { points: cpuPoints, isLoading: cpuLoading } = useMetricHistory({ agentId, metric: "veltrix_cpu_pct", range });
  const { points: ramPoints, isLoading: ramLoading } = useMetricHistory({ agentId, metric: "veltrix_mem_used_pct", range });
  const { points: diskPoints, isLoading: diskLoading } = useMetricHistory({ agentId, metric: "veltrix_disk_used_pct", range });

  if (agentLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Agent introuvable</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Retour</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Server className="h-5 w-5 text-gray-600" />
          </div>
          <div className="min-w-0">
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
            <div className="flex items-center gap-2 text-gray-600">
              <Monitor className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Hostname :</span>
              <span className="text-gray-900 truncate">{agent.hostname || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <HardDrive className="h-4 w-4 text-gray-400" />
              <span className="font-medium">OS :</span>
              <span className="text-gray-900 truncate">{agent.os_info || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Wifi className="h-4 w-4 text-gray-400" />
              <span className="font-medium">IP :</span>
              <span className="text-gray-900">{agent.ip_address || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Ajouté le :</span>
              <span className="text-gray-900">{formatDate(agent.created_at)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Métriques actuelles</CardTitle>
          </CardHeader>
          <CardContent>
            {agent.status === "online" && summary ? (
              <div className="flex justify-around py-2">
                <MetricGauge label="CPU" value={summary.cpu_usage_percent} health={summary.cpu_health} size="md" />
                <MetricGauge label="RAM" value={summary.memory_usage_percent} health={summary.memory_health} size="md" />
                <MetricGauge label="Disk" value={summary.disk_usage_percent} health={summary.disk_health} size="md" />
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
            <CardTitle className="text-sm font-semibold text-gray-700">Historique des métriques</CardTitle>
            <TimeRangeSelector value={range} onChange={setRange} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">CPU</span>
              {summary?.cpu_usage_percent !== null && <span className="text-xs text-gray-400">Actuel : {summary?.cpu_usage_percent?.toFixed(1)}%</span>}
            </div>
            <MetricChart points={cpuPoints} isLoading={cpuLoading} color="#3b82f6" unit="%" warningThreshold={70} criticalThreshold={85} />
          </div>
          <div className="border-t border-gray-100" />
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">RAM</span>
              {summary?.memory_usage_percent !== null && <span className="text-xs text-gray-400">Actuel : {summary?.memory_usage_percent?.toFixed(1)}%</span>}
            </div>
            <MetricChart points={ramPoints} isLoading={ramLoading} color="#8b5cf6" unit="%" warningThreshold={75} criticalThreshold={90} />
          </div>
          <div className="border-t border-gray-100" />
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Disque</span>
              {summary?.disk_usage_percent !== null && <span className="text-xs text-gray-400">Actuel : {summary?.disk_usage_percent?.toFixed(1)}%</span>}
            </div>
            <MetricChart points={diskPoints} isLoading={diskLoading} color="#10b981" unit="%" warningThreshold={80} criticalThreshold={90} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
