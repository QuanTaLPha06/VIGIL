"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { subscribeToRiskProfile } from "@/lib/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { getRiskLevel } from "@/lib/utils";

export function AlertsBanner() {
  const { user } = useAuth();
  const [risk, setRisk] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToRiskProfile(user.uid, (p: unknown) => {
      const profile = p as { overallRisk?: number };
      setRisk(profile?.overallRisk ?? 0);
      setDismissed(false); // Re-show when risk changes
    });
    return unsub;
  }, [user]);

  const level = getRiskLevel(risk);

  if (dismissed || level === "LOW") return null;

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border ${
        level === "CRITICAL"
          ? "bg-red-100 border-red-300 text-red-800"
          : level === "HIGH"
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-amber-50 border-amber-200 text-amber-700"
      }`}
    >
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium text-sm">
          {level === "CRITICAL"
            ? "Critical risk level detected"
            : level === "HIGH"
            ? "Elevated risk level — review required"
            : "Moderate risk — monitor closely"}
        </p>
        <p className="text-xs opacity-80 mt-0.5">
          Current index: {risk}/100. Review recent events and take recommended actions.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded hover:bg-black/10 transition-colors"
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
