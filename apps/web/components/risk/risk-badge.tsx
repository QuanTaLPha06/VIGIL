"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { subscribeToRiskProfile } from "@/lib/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { getRiskLevel, getRiskColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function RiskBadge() {
  const { user } = useAuth();
  const [risk, setRisk] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToRiskProfile(user.uid, (p: unknown) => {
      const profile = p as { overallRisk?: number };
      setRisk(profile?.overallRisk ?? 0);
    });
    return unsub;
  }, [user]);

  const level = getRiskLevel(risk);

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Shield className={cn("h-4 w-4", getRiskColor(level))} />
      <span className="text-muted-foreground">Risk:</span>
      <span className={cn("font-semibold tabular-nums", getRiskColor(level))}>
        {risk}
      </span>
      <span className={cn("text-xs", getRiskColor(level))}>({level})</span>
    </div>
  );
}
