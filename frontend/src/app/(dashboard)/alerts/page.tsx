"use client";

import { useState, useCallback } from "react";
import { Bell, CheckCheck, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertRow } from "@/components/alerts/AlertRow";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlerts } from "@/hooks/useAlerts";
import { alertsApi } from "@/lib/api";

const STATUS_FILTERS = [
  { value: "",             label: "Toutes"       },
  { value: "firing",       label: "Actives"      },
  { value: "acknowledged", label: "Acquittées"   },
  { value: "resolved",     label: "Résolues"     },
];

const SEVERITY_FILTERS = [
  { value: "",         label: "Toutes sévérités" },
  { value: "critical", label: "Critique"          },
  { value: "warning",  label: "Avertissement"     },
  { value: "info",     label: "Info"              },
];

export default function AlertsPage() {
  const [statusFilter, setStatusFilter] = useState("firing");
  const [severityFilter, setSeverityFilter] = useState("");
  const [page, setPage] = useState(1);

  const { alerts, total, totalFiring, totalCritical, isLoading, refresh } =
    useAlerts({ status: statusFilter || undefined, severity: severityFilter || undefined, page });

  const handleAck = useCallback(async (alertId: string) => {
    try { await alertsApi.acknowledge(alertId); refresh(); }
    catch (err) { console.error("Acquittement échoué", err); }
  }, [refresh]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Alertes
            {totalFiring > 0 && <Badge variant="destructive" className="text-xs">{totalFiring} active{totalFiring > 1 ? "s" : ""}</Badge>}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalCritical > 0
              ? `${totalCritical} alerte${totalCritical > 1 ? "s" : ""} critique${totalCritical > 1 ? "s" : ""} — action requise`
              : "Surveillance des seuils CPU, RAM, Disque"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refresh()} className="gap-2">
          <Bell className="h-4 w-4" /> Actualiser
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button key={f.value} onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                statusFilter === f.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}>{f.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {SEVERITY_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{ [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />) }</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <CheckCheck className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">{statusFilter === "firing" ? "Aucune alerte active" : "Aucune alerte"}</p>
          <p className="text-sm text-gray-400 mt-1">{statusFilter === "firing" ? "Tous vos services fonctionnent normalement" : "Essayez un autre filtre"}</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">{alerts.map((alert) => <AlertRow key={alert.id} alert={alert} onAck={alert.status === "firing" ? handleAck : undefined} />)}</div>
          {total > 20 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500">{(page - 1) * 20 + 1}–{Math.min(page * 20, total)} sur {total}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
                <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
