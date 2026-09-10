"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { subscribeToRiskProfile } from "@/lib/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import type { RiskProfile } from "@vigil/types";

const DIMENSIONS = [
  { key: "identityRisk", label: "Identity Risk", max: 20 },
  { key: "transactionRisk", label: "Transaction Risk", max: 20 },
  { key: "communicationRisk", label: "Communication Risk", max: 20 },
  { key: "counterpartyRisk", label: "Counterparty Risk", max: 20 },
  { key: "dealRisk", label: "Deal Risk", max: 20 },
] as const;

export function RiskDimensionsCard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<RiskProfile | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToRiskProfile(user.uid, (p) =>
      setProfile(p as RiskProfile)
    );
    return unsub;
  }, [user]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Risk Dimensions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {DIMENSIONS.map((d) => {
          const value = profile ? (profile[d.key] ?? 0) : 0;
          const pct = (value / d.max) * 100;
          return (
            <div key={d.key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="font-medium tabular-nums">
                  {value} <span className="text-muted-foreground font-normal">/ {d.max}</span>
                </span>
              </div>
              <Progress
                value={pct}
                className="h-2"
                style={{
                  ["--progress-color" as string]:
                    pct > 75 ? "#ef4444" : pct > 50 ? "#f59e0b" : "#22c55e",
                }}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
