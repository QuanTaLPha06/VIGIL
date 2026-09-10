"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { queryDocuments, COLLECTIONS, where, orderBy, limit } from "@/lib/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { timeAgo } from "@/lib/utils";
import type { ScamReport } from "@vigil/types";

export function ScamCheckerHistory() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    queryDocuments<ScamReport>(
      COLLECTIONS.SCAM_REPORTS,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    )
      .then(setReports)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Analysis History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
        ) : reports.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No analyses yet. Use the form to analyze suspicious content.
          </p>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r.id} className="p-3 rounded-lg border space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm truncate text-muted-foreground flex-1">
                    {r.text?.slice(0, 60)}...
                  </p>
                  <Badge
                    variant={
                      r.riskLevel === "LOW" ? "low"
                      : r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL" ? "high"
                      : "medium"
                    }
                    className="text-xs shrink-0"
                  >
                    {r.riskLevel}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {r.createdAt ? timeAgo(r.createdAt.toDate?.() ?? new Date()) : ""}
                  {" · "}
                  {r.signals?.length ?? 0} signals
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
