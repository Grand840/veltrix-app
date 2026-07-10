"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Server, Bell, Settings, LogOut, Activity, CreditCard } from "lucide-react";
import { TrialBanner } from "@/components/billing/TrialBanner";
import { useAuthStore } from "@/store/auth.store";
import { useAuth } from "@/hooks/useAuth";
import { useAlerts } from "@/hooks/useAlerts";
import { cn } from "@/lib/utils";

function AlertsBadge() {
  const { totalFiring } = useAlerts({ status: "firing" });
  if (!totalFiring) return null;
  return (
    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
      {totalFiring > 99 ? "99+" : totalFiring}
    </span>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, hydrated } = useAuthStore();
  const { logout } = useAuth();

  useEffect(() => { if (hydrated && !isAuthenticated) router.push("/login"); }, [hydrated, isAuthenticated, router]);
  if (!hydrated) return null;

  const NAV_ITEMS = [
    { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, badge: null },
    { href: "/agents",    label: "Agents",          icon: Server,          badge: null },
    { href: "/alerts",    label: "Alertes",          icon: Bell,            badge: <AlertsBadge /> },
    { href: "/settings",  label: "Paramètres",       icon: Settings,        badge: null },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Veltrix</p>
              <p className="text-xs text-gray-500 truncate max-w-[140px]">{user?.organization_name}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}>
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
                {badge}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-700">
                {(user?.full_name?.[0] || user?.email?.[0] || "?").toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name || user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-full px-2 py-1 rounded hover:bg-gray-100 transition-colors">
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto flex flex-col">
        <TrialBanner />
        <div className="p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
