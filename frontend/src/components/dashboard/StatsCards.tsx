"use client";

import { Server, Wifi, WifiOff, Bell, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrganizationStats } from "@/types";

interface StatsCardsProps {
  stats: OrganizationStats | undefined;
  isLoading: boolean;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}

function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
          </div>
          <div className={`p-3 rounded-full ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: "Agents en ligne",
      value: stats.agents_online,
      icon: <Wifi className="h-5 w-5 text-green-600" />,
      color: "bg-green-100",
      sub: `${stats.agents_total} agent${stats.agents_total > 1 ? "s" : ""} total`,
    },
    {
      label: "Agents hors ligne",
      value: stats.agents_offline,
      icon: <WifiOff className="h-5 w-5 text-red-600" />,
      color: "bg-red-100",
      sub: stats.agents_offline > 0 ? "Action requise" : "Tout va bien",
    },
    {
      label: "Agents en attente",
      value: stats.agents_pending,
      icon: <Clock className="h-5 w-5 text-yellow-600" />,
      color: "bg-yellow-100",
      sub: "Jamais connectés",
    },
    {
      label: "Alertes actives",
      value: stats.alerts_firing,
      icon: stats.alerts_critical > 0 ? (
        <AlertTriangle className="h-5 w-5 text-red-600" />
      ) : (
        <Bell className="h-5 w-5 text-blue-600" />
      ),
      color: stats.alerts_critical > 0 ? "bg-red-100" : "bg-blue-100",
      sub: stats.alerts_critical > 0
        ? `${stats.alerts_critical} critique${stats.alerts_critical > 1 ? "s" : ""}`
        : "Aucune critique",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
