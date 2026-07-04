/**
 * Types TypeScript — miroir des schémas Pydantic du backend.
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
export interface UserResponse {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "owner" | "admin" | "member";
  is_verified: boolean;
  organization_id: string;
  organization_name: string;
}
export interface OrganizationStats {
  organization_id: string;
  organization_name: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  max_agents: number;
  agents_total: number;
  agents_online: number;
  agents_offline: number;
  agents_pending: number;
  alerts_firing: number;
  alerts_critical: number;
  plan_usage_percent: number;
}
export type AgentStatus = "online" | "offline" | "pending" | "disabled";
export interface Agent {
  id: string;
  name: string;
  description: string | null;
  status: AgentStatus;
  hostname: string | null;
  os_info: string | null;
  ip_address: string | null;
  last_seen_at: string | null;
  is_active: boolean;
  organization_id: string;
  created_at: string;
  api_key: null;
}
export interface AgentListResponse {
  agents: Agent[];
  total: number;
  page: number;
  per_page: number;
}
export interface AgentInstallCommand {
  agent_id: string;
  install_command: string;
  api_key: string;
  note: string;
}
export type HealthStatus = "ok" | "warning" | "critical" | "unknown";
export interface AgentMetricsSummary {
  agent_id: string;
  hostname: string;
  status: AgentStatus;
  last_seen_at: string | null;
  cpu_usage_percent: number | null;
  memory_usage_percent: number | null;
  disk_usage_percent: number | null;
  cpu_health: HealthStatus;
  memory_health: HealthStatus;
  disk_health: HealthStatus;
}
export interface MetricPoint {
  timestamp: string;
  value: number;
}
export interface MetricSeries {
  metric_name: string;
  agent_id: string;
  hostname: string;
  points: MetricPoint[];
}
export type AlertSeverity = "info" | "warning" | "critical";
export type AlertStatus = "firing" | "acknowledged" | "resolved";
export type AlertMetric = "cpu_usage" | "memory_usage" | "disk_usage" | "agent_down";
export interface Alert {
  id: string;
  title: string;
  message: string | null;
  metric: AlertMetric;
  severity: AlertSeverity;
  status: AlertStatus;
  threshold_value: number | null;
  current_value: number | null;
  fired_at: string | null;
  resolved_at: string | null;
  acknowledged_at: string | null;
  sms_sent: boolean;
  email_sent: boolean;
  agent_id: string;
  agent_name: string;
  acknowledged_by_email: string | null;
}
export interface AlertListResponse {
  alerts: Alert[];
  total: number;
  total_critical: number;
  total_firing: number;
  page: number;
  per_page: number;
}
export interface ApiError {
  error: string;
  message: string;
  detail: string | null;
  status_code: number;
}
