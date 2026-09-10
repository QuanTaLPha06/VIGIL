"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCases } from "@/lib/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { formatINR, timeAgo } from "@/lib/utils";
import Link from "next/link";
import type { Case } from "@vigil/types";

const TYPE_LABELS: Record<string, string> = {
  SCAM: "Scam",
  SUSPICIOUS_PAYMENT: "Suspicious Payment",
  DELAYED_PAYMENT: "Delayed Payment",
  DEALLOCK_BREACH: "DealLock Breach",
  COUNTERPARTY_DISPUTE: "Counterparty Dispute",
};

const STATUS_VARIANT: Record<string, "low" | "medium" | "high" | "outline"> = {
  OPEN: "high",
  IN_PROGRESS: "medium",
  RESOLVED: "low",
  CLOSED: "outline",
};

export function CaseList() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getCases(user.uid)
      .then((c) => setCases(c as Case[]))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>;

  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground text-sm">
            No cases yet. Cases are created when fraud or disputes are detected.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {cases.map((c) => (
        <Link key={c.id} href={`/cases/${c.id}`}>
          <Card className="hover:bg-muted transition-colors cursor-pointer">
            <CardContent className="py-4 px-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground font-mono">#{c.id?.slice(-6)}</span>
                    <Badge variant="outline" className="text-xs">
                      {TYPE_LABELS[c.type] || c.type}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{c.description || "Fraud case"}</p>
                  {c.amount && (
                    <p className="text-xs text-muted-foreground mt-0.5">{formatINR(c.amount)}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <Badge variant={STATUS_VARIANT[c.status] ?? "outline"} className="text-xs">
                    {c.status}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {c.createdAt ? timeAgo(c.createdAt.toDate?.() ?? new Date()) : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
