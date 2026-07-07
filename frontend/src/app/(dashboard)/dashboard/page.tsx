"use client";

import { useCallback } from "react";
import Link from "next/link";
import { RefreshCw, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { AgentCard, AgentCardSkeleton } from "@/components/agents/AgentCard";
import { AlertRow } from "@/components/alerts/AlertRow";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useOrgStats } from "@/hooks/useOrganization";
import { useAgents, useMetricsOverview } from "@/hooks/useAgents";
import { useAlerts } from "@/hooks/useAlerts";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuthStore } from "@/store/auth.store";
import { alertsApi } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { stats, isLoading: statsLoading, refresh: refreshStats } = useOrgStats();
  const { agents, isLoading: agentsLoading, refresh: refreshAgents } = useAgents();
  const { summaries } = useMetricsOverview();
  const { alerts, totalFiring, refresh: refreshAlerts } = useAlerts({ status: "firing", per_page: 5 });
  const { showOnboarding, dismissOnboarding } = useOnboarding();

  const summaryMap = Object.fromEntries(summaries.map((s) => [s.agent_id, s]));

  const handleRefresh = () => { refreshStats(); refreshAgents(); refreshAlerts(); };

  const handleAck = useCallback(async (alertId: string) => {
    try { await alertsApi.acknowledge(alertId); refreshAlerts(); refreshStats(); }
    catch (err) { console.error("Acquittement échoué", err); }
  }, [refreshAlerts, refreshStats]);

  return (
    <>
      {showOnboarding && <OnboardingWizard onDismiss={dismissOnboarding} />}

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bonjour{user?.full_name ? `, ${user.full_name}` : ""}</h1>
            <p className="text-gray-500 mt-1 text-sm">Vue d'ensemble — rafraîchissement toutes les 30s</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Actualiser
          </Button>
        </div>

        <StatsCards stats={stats} isLoading={statsLoading} />

        {(totalFiring > 0 || alerts.length > 0) && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Alertes actives
                {totalFiring > 0 && <span className="ml-2 bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">{totalFiring}</span>}
              </h2>
              <Link href="/alerts" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                Tout voir <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {alerts.map((alert) => <AlertRow key={alert.id} alert={alert} onAck={handleAck} />)}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Agents
              {stats && <span className="ml-2 text-sm font-normal text-gray-500">{stats.agents_total}/{stats.max_agents}</span>}
            </h2>
            <div className="flex items-center gap-2">
              <Link href="/agents"><Button variant="outline" size="sm" className="gap-1">Tout voir <ArrowRight className="h-3 w-3" /></Button></Link>
              <Link href="/agents/new"><Button size="sm" className="gap-1"><Plus className="h-3 w-3" /> Ajouter</Button></Link>
            </div>
          </div>

          {agentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <AgentCardSkeleton key={i} />)}
            </div>
          ) : agents.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-500 font-medium mb-2">Aucun agent configuré</p>
              <p className="text-sm text-gray-400 mb-4">Ajoutez votre premier serveur pour commencer le monitoring</p>
              <Link href="/agents/new"><Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Ajouter un agent</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => <AgentCard key={agent.id} agent={agent} summary={summaryMap[agent.id]} />)}
            </div>
          )}
        </section>

        {stats && (
          <section className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Utilisation du plan{" "}<span className="font-bold uppercase text-blue-600">{stats.plan}</span>
              </span>
              <span className="text-sm text-gray-500">{stats.agents_total}/{stats.max_agents} agents</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${stats.plan_usage_percent >= 90 ? "bg-red-500" : stats.plan_usage_percent >= 70 ? "bg-yellow-500" : "bg-blue-500"}`}
                style={{ width: `${Math.min(stats.plan_usage_percent, 100)}%` }} />
            </div>
            {stats.plan_usage_percent >= 90 && (
              <p className="text-xs text-red-600 mt-1">Limite presque atteinte — pensez à passer au plan supérieur</p>
            )}
          </section>
        )}
      </div>
    </>
  );
}
