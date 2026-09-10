"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { queryDocuments, COLLECTIONS, where, orderBy, limit } from "@/lib/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { formatINR, timeAgo } from "@/lib/utils";
import type { PaymentRiskAssessment } from "@vigil/types";

export function PaymentRiskHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    queryDocuments<PaymentRiskAssessment>(
      COLLECTIONS.PAYMENTS,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    )
      .then(setPayments)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Assessments</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No assessments yet.
          </p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{formatINR(p.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.outflowRatio?.toFixed(1)}% of monthly outflow
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={p.riskLevel === "LOW" ? "low" : p.riskLevel === "HIGH" ? "high" : "medium"}
                    className="text-xs"
                  >
                    {p.riskLevel}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {p.createdAt ? timeAgo(p.createdAt.toDate?.() ?? new Date()) : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
