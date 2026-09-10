"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { subscribeToRiskProfile } from "@/lib/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { simulateRiskEvent } from "@/lib/functions";
import { getRiskLevel, getRiskColor, cn } from "@/lib/utils";
import type { RiskProfile } from "@vigil/types";

export function RiskIndexCard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<RiskProfile | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToRiskProfile(user.uid, (p) =>
      setProfile(p as RiskProfile)
    );
    return unsub;
  }, [user]);

  const score = profile?.overallRisk ?? 0;
  const level = getRiskLevel(score);
  const trend = profile?.trend ?? "STABLE";

  const handleSimulate = async (eventType: string) => {
    if (!user) return;
    setSimulating(true);
    try {
      await simulateRiskEvent({ companyId: user.uid, eventType });
    } finally {
      setSimulating(false);
    }
  };

  // SVG gauge
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  const gaugeColor =
    level === "LOW" ? "#22c55e"
    : level === "MEDIUM" ? "#f59e0b"
    : level === "HIGH" ? "#ef4444"
    : "#dc2626";

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">VIGIL Cyber Risk Index</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gauge */}
        <div className="flex flex-col items-center gap-2">
          <svg width="140" height="80" viewBox="0 0 140 80">
            {/* Background arc */}
            <path
              d="M 10 70 A 60 60 0 0 1 130 70"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Risk arc */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={gaugeColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset + circumference / 2}
              transform="rotate(-180 70 70)"
              className="risk-gauge-fill"
            />
            {/* Score text */}
            <text x="70" y="65" textAnchor="middle" fontSize="24" fontWeight="bold" fill="currentColor">
              {score}
            </text>
            <text x="70" y="78" textAnchor="middle" fontSize="10" fill="#6b7280">
              / 100
            </text>
          </svg>

          <div className="flex items-center gap-2">
            <Badge variant={level.toLowerCase() as "low" | "medium" | "high" | "critical"}>
              {level}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              {trend === "DETERIORATING" ? (
                <TrendingUp className="h-3 w-3 text-red-500" />
              ) : trend === "IMPROVING" ? (
                <TrendingDown className="h-3 w-3 text-green-500" />
              ) : (
                <Minus className="h-3 w-3 text-muted-foreground" />
              )}
              {trend}
            </span>
          </div>
        </div>

        {/* Demo simulation buttons */}
        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Demo: Simulate event</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Suspicious msg", event: "SUSPICIOUS_MESSAGE" },
              { label: "Large payment", event: "HIGH_VALUE_PAYMENT" },
              { label: "DealLock active", event: "DEALLOCK_ACTIVATED" },
            ].map((s) => (
              <Button
                key={s.event}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                disabled={simulating}
                onClick={() => handleSimulate(s.event)}
              >
                {simulating ? <RefreshCw className="h-3 w-3 animate-spin" /> : s.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
