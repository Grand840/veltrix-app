import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import type { HealthStatus, AgentStatus, AlertSeverity } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "jamais";
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr });
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: fr });
}

export function healthColor(health: HealthStatus): string {
  switch (health) {
    case "ok": return "text-green-600";
    case "warning": return "text-yellow-600";
    case "critical": return "text-red-600";
    default: return "text-gray-400";
  }
}

export function healthBg(health: HealthStatus): string {
  switch (health) {
    case "ok": return "bg-green-50 border-green-200";
    case "warning": return "bg-yellow-50 border-yellow-200";
    case "critical": return "bg-red-50 border-red-200";
    default: return "bg-gray-50 border-gray-200";
  }
}

export function agentStatusColor(status: AgentStatus): string {
  switch (status) {
    case "online": return "bg-green-500";
    case "offline": return "bg-red-500";
    case "pending": return "bg-yellow-500";
    case "disabled": return "bg-gray-400";
  }
}

export function agentStatusLabel(status: AgentStatus): string {
  switch (status) {
    case "online": return "En ligne";
    case "offline": return "Hors ligne";
    case "pending": return "En attente";
    case "disabled": return "Désactivé";
  }
}

export function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(1)}%`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B/s";
  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function severityColor(severity: string): string {
  switch (severity) {
    case "critical": return "text-red-700 bg-red-50 border-red-200";
    case "warning": return "text-yellow-700 bg-yellow-50 border-yellow-200";
    default: return "text-blue-700 bg-blue-50 border-blue-200";
  }
}

export function severityBadgeVariant(severity: AlertSeverity): "destructive" | "secondary" | "default" {
  switch (severity) {
    case "critical": return "destructive";
    case "warning": return "secondary";
    default: return "default";
  }
}
