export const METRICS = {
  CPU:         "veltrix_cpu_pct",
  MEMORY:      "veltrix_mem_used_pct",
  DISK:        "veltrix_disk_used_pct",
  NET_SENT:    "veltrix_network_bytes_sent",
  NET_RECV:    "veltrix_network_bytes_recv",
} as const;

export type MetricName = (typeof METRICS)[keyof typeof METRICS];

export const METRIC_LABELS: Record<string, string> = {
  [METRICS.CPU]:             "CPU",
  [METRICS.MEMORY]:          "RAM",
  [METRICS.DISK]:            "Disque",
  [METRICS.NET_SENT]:        "Réseau ↑",
  [METRICS.NET_RECV]:        "Réseau ↓",
};

export const THRESHOLDS = {
  cpu:    { warning: 70, critical: 85 },
  memory: { warning: 75, critical: 90 },
  disk:   { warning: 80, critical: 90 },
};
