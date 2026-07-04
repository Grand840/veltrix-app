"use client";

import { useAuthStore } from "@/store/auth.store";

export default function DashboardPage() {
  const { user } = useAuthStore();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bonjour, {user?.full_name || user?.email}</h1>
        <p className="text-gray-500 mt-1">Vue d'ensemble de votre infrastructure</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-600 font-medium">Dashboard en construction</p>
        <p className="text-gray-400 text-sm mt-1">Les metriques arrivent au Jour 15</p>
      </div>
    </div>
  );
}
