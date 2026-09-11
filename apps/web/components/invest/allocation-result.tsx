"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINRShort } from "@/lib/utils";
import { TrendingUp, Info } from "lucide-react";
import type { InvestmentAllocationResult } from "@vigil/types";

interface AllocationResultProps {
  result: InvestmentAllocationResult | null;
}

export function AllocationResult({ result }: AllocationResultProps) {
  if (!result) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Allocation Guidance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground text-sm space-y-3">
            <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p>
              Fill in the cash flow form to see your potential deployable surplus
              and educational allocation bands.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Allocation Guidance</CardTitle>
          <Badge
            variant={
              result.liquidityPriority === "HIGH"
                ? "high"
                : result.liquidityPriority === "MEDIUM"
                ? "medium"
                : "low"
            }
          >
            Liquidity: {result.liquidityPriority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Surplus breakdown */}
        <div className="bg-muted rounded-lg p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Available cash</span>
            <span>{formatINRShort(result.availableCash)}</span>
          </div>
          <div className="flex justify-between text-red-500">
            <span>Working capital</span>
            <span>− {formatINRShort(result.workingCapitalBuffer)}</span>
          </div>
          <div className="flex justify-between text-red-500">
            <span>Upcoming obligations</span>
            <span>− {formatINRShort(result.upcomingObligations)}</span>
          </div>
          <div className="flex justify-between text-red-500">
            <span>
              Cyber-risk reserve{" "}
              <span className="text-xs text-muted-foreground">
                ({result.riskStatus} risk → {result.riskStatus === "CRITICAL" ? 50 : result.riskStatus === "HIGH" ? 30 : result.riskStatus === "MEDIUM" ? 15 : 5}%)
              </span>
            </span>
            <span>− {formatINRShort(result.cyberRiskReserve)}</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-2 mt-1">
            <span>Potential surplus</span>
            <span className={result.deployableSurplus > 0 ? "text-green-600" : "text-red-600"}>
              {formatINRShort(result.deployableSurplus)}
            </span>
          </div>
        </div>

        {/* Allocation bands */}
        {result.deployableSurplus > 0 && result.allocationBands?.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Educational allocation bands</p>
            {result.allocationBands.map((band, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{band.category}</span>
                  <span className="font-medium tabular-nums">
                    {band.minPercent}–{band.maxPercent}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${band.maxPercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{band.rationale}</p>
              </div>
            ))}
          </div>
        ) : result.deployableSurplus <= 0 ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            No deployable surplus after reserves. Consider reducing obligations
            or improving your cyber risk profile first.
          </div>
        ) : null}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 border border-blue-100 p-3 rounded-lg">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
          <p>{result.disclaimer}</p>
        </div>
      </CardContent>
    </Card>
  );
}
