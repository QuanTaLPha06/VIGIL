"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { assessPaymentRisk } from "@/lib/functions";
import { formatINR, getRiskLevel, getRiskColor } from "@/lib/utils";
import { CreditCard, AlertTriangle, CheckCircle } from "lucide-react";
import type { PaymentRiskResult } from "@vigil/types";

export function PaymentRiskForm() {
  const [monthlyOutflow, setMonthlyOutflow] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentRiskResult | null>(null);

  const handleAssess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await assessPaymentRisk({
        amount: parseFloat(paymentAmount),
        monthlyOutflow: parseFloat(monthlyOutflow),
        counterparty,
        purpose,
      });
      setResult(res.data);
    } finally {
      setLoading(false);
    }
  };

  const ratio = monthlyOutflow && paymentAmount
    ? ((parseFloat(paymentAmount) / parseFloat(monthlyOutflow)) * 100).toFixed(0)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Assess Payment Risk</CardTitle>
        <CardDescription>
          A payment&apos;s risk depends on its size relative to your typical business outflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAssess} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="outflow">Typical monthly outflow (₹)</Label>
            <Input
              id="outflow"
              type="number"
              placeholder="500000"
              value={monthlyOutflow}
              onChange={(e) => setMonthlyOutflow(e.target.value)}
              required
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Payment amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="200000"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
              min="1"
            />
          </div>

          {ratio && (
            <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
              This payment is <strong>{ratio}%</strong> of your monthly outflow
              {parseFloat(ratio) > 30 && (
                <span className="ml-2 text-amber-600 font-medium">⚠ Elevated</span>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="counterparty">Counterparty (optional)</Label>
            <Input
              id="counterparty"
              placeholder="Vendor / company name"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose (optional)</Label>
            <Input
              id="purpose"
              placeholder="Invoice #, description..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            <CreditCard className="h-4 w-4 mr-2" />
            {loading ? "Assessing..." : "Assess Risk"}
          </Button>
        </form>

        {result && (
          <div className="mt-6 space-y-3">
            <div className={`p-4 rounded-lg border ${
              result.riskLevel === "LOW" ? "bg-green-50 border-green-200" :
              result.riskLevel === "HIGH" ? "bg-red-50 border-red-200" :
              "bg-amber-50 border-amber-200"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.riskLevel === "LOW"
                  ? <CheckCircle className="h-5 w-5 text-green-500" />
                  : <AlertTriangle className="h-5 w-5 text-amber-500" />
                }
                <span className={`font-bold ${getRiskColor(result.riskLevel as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL")}`}>
                  {result.riskLevel} RISK
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{result.reasoning}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-muted-foreground">Payment</p>
                <p className="font-semibold">{formatINR(result.amount)}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-muted-foreground">% of outflow</p>
                <p className="font-semibold">{result.outflowRatio?.toFixed(1)}%</p>
              </div>
            </div>

            {result.recommendation && (
              <p className="text-sm text-muted-foreground italic">{result.recommendation}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
