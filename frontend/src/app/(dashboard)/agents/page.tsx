"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgentCard, AgentCardSkeleton } from "@/components/agents/AgentCard";
import { useAgents, useMetricsOverview } from "@/hooks/useAgents";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "",         label: "Tous"        },
  { value: "online",   label: "En ligne"    },
  { value: "offline",  label: "Hors ligne"  },
  { value: "pending",  label: "En attente"  },
];

export default function AgentsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const { agents, total, isLoading } = useAgents({ status: statusFilter || undefined });
  const { summaries } = useMetricsOverview();
  const summaryMap = Object.fromEntries(summaries.map((s) => [s.agent_id, s]));

  const filtered = agents.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.name.toLowerCase().includes(q) || (a.hostname || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-gray-500 text-sm mt-1">{total} agent{total > 1 ? "s" : ""} configuré{total > 1 ? "s" : ""}</p>
        </div>
        <Link href="/agents/new"><Button className="gap-2"><Plus className="h-4 w-4" /> Ajouter</Button></Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Rechercher un agent..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                statusFilter === f.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <AgentCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">
            {search ? "Aucun agent ne correspond à votre recherche" : "Aucun agent"}
          </p>
          {!search && <Link href="/agents/new"><Button size="sm" className="mt-4 gap-2"><Plus className="h-4 w-4" /> Ajouter un agent</Button></Link>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agent) => <AgentCard key={agent.id} agent={agent} summary={summaryMap[agent.id]} />)}
        </div>
      )}
    </div>
  );
}
