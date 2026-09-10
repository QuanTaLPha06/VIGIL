"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { queryDocuments, COLLECTIONS, where, orderBy, limit } from "@/lib/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import type { VerificationResult } from "@vigil/types";

export function VerificationHistory() {
  const { user } = useAuth();
  const [checks, setChecks] = useState<VerificationResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    queryDocuments<VerificationResult>(
      COLLECTIONS.VERIFICATION_CHECKS,
      where("requestedBy", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    )
      .then(setChecks)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Verifications</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
        ) : checks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No verifications yet. Use the form to verify a counterparty.
          </p>
        ) : (
          <div className="space-y-2">
            {checks.map((c) => (
              <Link key={c.id} href={`/watchtower/${c.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.businessName || c.gstin || "—"}</p>
                    <p className="text-xs text-muted-foreground">{c.gstin}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={c.status === "VERIFIED" ? "low" : c.status === "PARTIAL" ? "medium" : "high"} className="text-xs">
                      {c.status}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {c.createdAt ? timeAgo(c.createdAt.toDate?.() ?? new Date()) : ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
