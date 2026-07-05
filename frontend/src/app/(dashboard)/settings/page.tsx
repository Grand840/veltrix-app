"use client";

import { User, Building2, Shield, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth.store";
import { useOrgStats } from "@/hooks/useOrganization";

const PLAN_LABELS: Record<string, string> = {
  free: "Gratuit", starter: "Starter", pro: "Pro", enterprise: "Enterprise",
};

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-700", starter: "bg-blue-100 text-blue-700",
  pro: "bg-purple-100 text-purple-700", enterprise: "bg-amber-100 text-amber-700",
};

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { stats } = useOrgStats();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez votre compte et votre organisation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4 text-gray-500" /> Profil utilisateur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-blue-700">{(user?.full_name?.[0] || user?.email?.[0] || "?").toUpperCase()}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.full_name || "Nom non défini"}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Statut email</p>
                <p className="font-medium">{user?.is_verified ? <span className="text-green-600">Vérifié</span> : <span className="text-yellow-600">En attente</span>}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Building2 className="h-4 w-4 text-gray-500" /> Organisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{stats.organization_name}</p>
                  <p className="text-sm text-gray-500">ID : {stats.organization_id.slice(0, 8)}...</p>
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${PLAN_COLORS[stats.plan] || PLAN_COLORS.free}`}>
                  {PLAN_LABELS[stats.plan] || stats.plan}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-100 space-y-3">
                <p className="text-sm font-medium text-gray-700">Utilisation du plan</p>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Agents</span>
                    <span className="font-medium">{stats.agents_total} / {stats.max_agents}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${stats.plan_usage_percent >= 90 ? "bg-red-500" : stats.plan_usage_percent >= 70 ? "bg-yellow-500" : "bg-blue-500"}`}
                      style={{ width: `${Math.min(stats.plan_usage_percent, 100)}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  {[
                    { label: "En ligne", value: stats.agents_online, color: "text-green-600" },
                    { label: "Hors ligne", value: stats.agents_offline, color: "text-red-600" },
                    { label: "En attente", value: stats.agents_pending, color: "text-yellow-600" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className={`text-lg font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-24 flex items-center justify-center text-gray-400 text-sm">Chargement...</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4 text-gray-500" /> Sécurité</CardTitle>
          <CardDescription className="text-sm">Gestion de l'authentification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Mot de passe</p>
              <p className="text-xs text-gray-500">Dernière modification inconnue</p>
            </div>
            <button className="text-sm text-blue-600 hover:underline">Modifier (Semaine 3)</button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-blue-900"><CreditCard className="h-4 w-4" /> Plan actuel : {stats ? PLAN_LABELS[stats.plan] : "..."}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-800 mb-3">
            {stats?.plan === "free"
              ? "Vous êtes sur le plan gratuit. Passez au plan Starter pour surveiller jusqu'à 10 agents."
              : "Merci d'utiliser Veltrix !"}
          </p>
          {stats?.plan === "free" && (
            <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Passer au plan Starter (disponible en Semaine 4)
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
