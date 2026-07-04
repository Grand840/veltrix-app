"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import type { MetricPoint } from "@/types";

interface MetricChartProps {
  points: MetricPoint[];
  isLoading?: boolean;
  color?: string;
  label?: string;
  unit?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  yDomain?: [number, number];
}

function CustomTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-xs">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="font-bold text-gray-900">
        {typeof value === "number" ? value.toFixed(1) : "—"}{unit}
      </p>
    </div>
  );
}

export function MetricChart({
  points, isLoading = false, color = "#3b82f6", label,
  unit = "%", warningThreshold, criticalThreshold, yDomain = [0, 100],
}: MetricChartProps) {
  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-lg" />;
  }

  if (!points.length) {
    return (
      <div className="h-40 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <p className="text-sm text-gray-400">Aucune donnée disponible</p>
      </div>
    );
  }

  const chartData = points.map((p) => ({
    time: format(new Date(p.timestamp), "HH:mm", { locale: fr }),
    value: parseFloat(p.value.toFixed(1)),
    fullTime: format(new Date(p.timestamp), "dd/MM HH:mm", { locale: fr }),
  }));

  const totalPoints = chartData.length;
  const maxLabels = 6;
  const tickInterval = Math.max(1, Math.floor(totalPoints / maxLabels));

  return (
    <div>
      {label && <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>}
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false} tickLine={false} interval={tickInterval} />
          <YAxis domain={yDomain} tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false} tickLine={false} tickFormatter={(v) => `${v}${unit}`} />
          <Tooltip content={<CustomTooltip unit={unit} />}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullTime || ""} />
          {warningThreshold && <ReferenceLine y={warningThreshold} stroke="#eab308" strokeDasharray="4 4" strokeWidth={1} />}
          {criticalThreshold && <ReferenceLine y={criticalThreshold} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />}
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2}
            fill={`url(#grad-${color.replace("#", "")})`} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
