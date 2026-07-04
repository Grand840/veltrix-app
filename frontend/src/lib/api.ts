import axios, { AxiosError } from "axios";
import type { TokenResponse, UserResponse, OrganizationStats, Agent, AgentListResponse, AgentInstallCommand, AgentMetricsSummary, MetricSeries, AlertListResponse, Alert } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PREFIX = `${API_URL}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_PREFIX,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("veltrix_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("veltrix_token");
      localStorage.removeItem("veltrix_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; full_name?: string; organization_name: string }) =>
    apiClient.post<TokenResponse>("/auth/register", data),
  login: (email: string, password: string) =>
    apiClient.post<TokenResponse>("/auth/login", { email, password }),
  me: () => apiClient.get<UserResponse>("/auth/me"),
  logout: () => apiClient.post("/auth/logout"),
};

export const orgApi = {
  getStats: () => apiClient.get<OrganizationStats>("/organizations/me/stats"),
};

export const agentsApi = {
  list: (params?: { page?: number; per_page?: number; status?: string }) =>
    apiClient.get<AgentListResponse>("/agents", { params }),
  get: (id: string) => apiClient.get<Agent>(`/agents/${id}`),
  create: (data: { name: string; description?: string }) =>
    apiClient.post<AgentInstallCommand>("/agents", data),
  update: (id: string, data: { name?: string; description?: string }) =>
    apiClient.patch<Agent>(`/agents/${id}`, data),
  delete: (id: string) => apiClient.delete(`/agents/${id}`),
};

export const metricsApi = {
  overview: () => apiClient.get<AgentMetricsSummary[]>("/metrics/overview"),
  summary: (agentId: string) => apiClient.get<AgentMetricsSummary>(`/metrics/agents/${agentId}/summary`),
  history: (agentId: string, metric: string, params?: { start?: string; step?: string }) =>
    apiClient.get<MetricSeries>(`/metrics/agents/${agentId}/history/${metric}`, { params }),
};

export const alertsApi = {
  list: (params?: { page?: number; per_page?: number; status?: string; severity?: string }) =>
    apiClient.get<AlertListResponse>("/alerts", { params }),
  acknowledge: (id: string, comment?: string) =>
    apiClient.post<Alert>(`/alerts/${id}/acknowledge`, { comment }),
};

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.response?.data?.detail || error.message || "Une erreur est survenue";
  }
  return "Une erreur inattendue est survenue";
}
