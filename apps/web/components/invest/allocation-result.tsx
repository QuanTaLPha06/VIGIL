"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINRShort } from "@/lib/utils";
import { TrendingUp, Info } from "lucide-react";
import type { InvestmentAllocationResult } from "@vigil/types";

// This component receives its data via parent (invest/page.tsx)
// Uses a simple prop + useState approach to avoid double-calling the function
export function AllocationResult() {
  // Placeholder state — parent page will pass result down
  const result: InvestmentAllocationResult | null = null;

  if (!result) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Allocation Guidance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground text-sm space-y-2">
            <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground/50" />
            <p>Fill in the cash flow form to see your potential deployable surplus and educational allocation bands.</p>
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
          <Badge variant={result.liquidityPriority === "HIGH" ? "high" : result.liquidityPriority === "MEDIUM" ? "medium" : "low"}>
            Liquidity: {result.liquidityPriority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted rounded-lg p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Available cash</span>
            <span>{formatINRShort(result.availableCash)}</span>
          </div>
          <div className="flex justify-between text-red-500">
            <span>Working capital</span>
            <span>- {formatINRShort(result.workingCapitalBuffer)}</span>
          </div>
          <div className="flex justify-between text-red-500">
            <span>Obligations</span>
            <span>- {formatINRShort(result.upcomingObligations)}</span>
          </div>
          <div className="flex justify-between text-red-500">
            <span>Cyber-risk reserve</span>
            <span>- {formatINRShort(result.cyberRiskReserve)}</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Potential surplus</span>
            <span className={result.deployableSurplus > 0 ? "text-green-600" : "text-red-600"}>
              {formatINRShort(result.deployableSurplus)}
            </span>
          </div>
        </div>

        {result.deployableSurplus > 0 && result.allocationBands && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Educational allocation bands</p>
            {result.allocationBands.map((band, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-2 rounded-full bg-blue-200 flex-1">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${band.maxPercent}%` }}
                  />
                </div>
                <div className="text-right text-sm w-48 shrink-0">
                  <p className="font-medium">{band.category}</p>
                  <p className="text-xs text-muted-foreground">{band.minPercent}–{band.maxPercent}%</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 border border-blue-100 p-3 rounded-lg">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
          <p>
            Educational guidance only. Not individualized investment advice. Consult a
            SEBI-registered adviser for personalized recommendations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
