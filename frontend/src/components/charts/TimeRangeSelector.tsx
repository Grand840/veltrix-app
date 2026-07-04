"use client";

import { cn } from "@/lib/utils";
import type { TimeRange } from "@/hooks/useMetricHistory";

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const RANGES: { value: TimeRange; label: string }[] = [
  { value: "1h",  label: "1h"  },
  { value: "24h", label: "24h" },
  { value: "7d",  label: "7j"  },
];

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
      {RANGES.map((r) => (
        <button key={r.value} onClick={() => onChange(r.value)}
          className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors",
            value === r.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}>
          {r.label}
        </button>
      ))}
    </div>
  );
}
