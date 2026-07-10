"use client";

import Link from "next/link";
import { AlertTriangle, X, Clock } from "lucide-react";
import { useState } from "react";
import { useBilling } from "@/hooks/useBilling";

export function TrialBanner() {
  const { billing } = useBilling();
  const [dismissed, setDismissed] = useState(false);

  if (!billing?.show_upgrade_banner || dismissed) return null;

  const isCritical = billing.upgrade_urgency === "critical";

  return (
    <div className={`px-4 py-2.5 flex items-center gap-3 text-sm ${
      isCritical
        ? "bg-red-600 text-white"
        : "bg-amber-500 text-white"
    }`}>
      {isCritical
        ? <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        : <Clock className="h-4 w-4 flex-shrink-0" />
      }

      <span className="flex-1 font-medium">{billing.upgrade_message}</span>

      <Link
        href="/billing"
        className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
          isCritical
            ? "bg-white text-red-600 hover:bg-red-50"
            : "bg-white text-amber-600 hover:bg-amber-50"
        }`}
      >
        Passer au Starter →
      </Link>

      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
