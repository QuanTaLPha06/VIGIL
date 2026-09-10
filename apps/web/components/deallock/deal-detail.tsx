"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDocument, COLLECTIONS, updateDocument } from "@/lib/firestore";
import { getExplorerUrl } from "@/lib/blockchain";
import { ExternalLink, AlertTriangle, CheckCircle, Lock } from "lucide-react";
import type { Deal } from "@vigil/types";

export function DealLockDetail({ dealId }: { dealId: string }) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocument<Deal>(COLLECTIONS.DEALS, dealId)
      .then(setDeal)
      .finally(() => setLoading(false));
  }, [dealId]);

  const handleSimulateBreach = async () => {
    if (!deal) return;
    await updateDocument(COLLECTIONS.DEALS, dealId, { status: "BREACHED" });
    setDeal({ ...deal, status: "BREACHED" } as Deal);
  };

  if (loading) return <div className="text-sm text-muted-foreground p-8 text-center">Loading deal...</div>;
  if (!deal) return <div className="text-sm text-muted-foreground p-8 text-center">Deal not found.</div>;

  const penaltyAmount = ((deal.amount ?? 0) * (deal.penaltyPercent ?? 0)) / 100;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Deal with {deal.sellerName}
            </CardTitle>
            <Badge variant={deal.status === "BREACHED" ? "high" : deal.status === "COMPLETED" ? "low" : "medium"}>
              {deal.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-semibold">{deal.amount} MATIC</p>
            </div>
            <div>
              <p className="text-muted-foreground">Penalty</p>
              <p className="font-semibold">{deal.penaltyPercent}% ({penaltyAmount.toFixed(4)} MATIC)</p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment deadline</p>
              <p className="font-semibold">{deal.paymentDeadline}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Network</p>
              <p className="font-semibold">Polygon Amoy</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">On-chain proof</p>
            <div className="bg-muted rounded-lg p-3 space-y-2 text-xs">
              <div>
                <p className="text-muted-foreground">Terms hash (SHA-256)</p>
                <p className="font-mono break-all mt-0.5">{deal.termsHash}</p>
              </div>
              {deal.blockchainTxHash && (
                <div>
                  <p className="text-muted-foreground">Transaction</p>
                  <a
                    href={getExplorerUrl(deal.blockchainTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline mt-0.5 font-mono break-all"
                  >
                    {deal.blockchainTxHash} <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {deal.status === "BREACHED" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <p className="font-semibold">Breach Detected</p>
              </div>
              <p className="text-sm text-red-600">
                Penalty condition triggered: {penaltyAmount.toFixed(4)} MATIC
              </p>
              <p className="text-xs text-red-500">
                In a live deployment, the smart contract would automatically calculate
                and enforce the penalty payout.
              </p>
            </div>
          )}

          {deal.status === "LOCKED" && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleSimulateBreach}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Simulate Breach (Demo)
            </Button>
          )}

          {deal.status === "CONFIRMED" || deal.status === "COMPLETED" ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 p-3 rounded-lg text-sm">
              <CheckCircle className="h-4 w-4" />
              Deal completed successfully
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
