"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDeals, COLLECTIONS } from "@/lib/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { formatINR, timeAgo, truncateAddress } from "@/lib/utils";
import { ExternalLink, Lock } from "lucide-react";
import Link from "next/link";
import { getExplorerUrl } from "@/lib/blockchain";
import type { Deal } from "@vigil/types";

const STATUS_VARIANT = {
  LOCKED: "medium",
  CONFIRMED: "low",
  BREACHED: "high",
  COMPLETED: "low",
  DISPUTED: "high",
} as const;

export function DealLockList() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getDeals(user.uid)
      .then((d) => setDeals(d as Deal[]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Active DealLocks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
        ) : deals.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No deals yet. Create your first DealLock.
          </p>
        ) : (
          <div className="space-y-3">
            {deals.map((deal) => (
              <Link key={deal.id} href={`/deallock/${deal.id}`}>
                <div className="p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{deal.sellerName}</p>
                    <Badge variant={STATUS_VARIANT[deal.status as keyof typeof STATUS_VARIANT] ?? "outline"} className="text-xs shrink-0">
                      {deal.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{deal.amount} MATIC</span>
                    <span>{deal.createdAt ? timeAgo(deal.createdAt.toDate?.() ?? new Date()) : ""}</span>
                  </div>
                  {deal.blockchainTxHash && (
                    <a
                      href={getExplorerUrl(deal.blockchainTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      On-chain proof <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
