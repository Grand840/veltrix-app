"use client";

import Link from "next/link";
import { Server, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AgentStatusBadge } from "./AgentStatusBadge";
import { MetricGauge } from "./MetricGauge";
import { timeAgo } from "@/lib/utils";
import type { Agent, AgentMetricsSummary } from "@/types";

interface AgentCardProps {
  agent: Agent;
  summary?: AgentMetricsSummary;
}

export function AgentCard({ agent, summary }: AgentCardProps) {
  return (
    <Link href={`/agents/${agent.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <Server className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate text-sm">{agent.name}</p>
                <p className="text-xs text-gray-400 truncate">{agent.hostname || "hostname inconnu"}</p>
              </div>
            </div>
            <AgentStatusBadge status={agent.status} />
          </div>

          {agent.status === "online" && summary ? (
            <div className="flex justify-around mt-2">
              <MetricGauge label="CPU" value={summary.cpu_usage_percent} health={summary.cpu_health} size="sm" />
              <MetricGauge label="RAM" value={summary.memory_usage_percent} health={summary.memory_health} size="sm" />
              <MetricGauge label="Disk" value={summary.disk_usage_percent} health={summary.disk_health} size="sm" />
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
              <Clock className="h-3 w-3" />
              {agent.status === "pending"
                ? "En attente de la première connexion"
                : `Hors ligne depuis ${timeAgo(agent.last_seen_at)}`}
            </div>
          )}

          {agent.last_seen_at && agent.status === "online" && (
            <p className="text-xs text-gray-400 mt-3 text-right">Vu {timeAgo(agent.last_seen_at)}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function AgentCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex justify-around mt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="h-14 w-14 rounded-full" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
