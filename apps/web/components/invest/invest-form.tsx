"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateAllocation } from "@/lib/functions";
import { formatINRShort } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import type { InvestmentAllocationResult } from "@vigil/types";

interface InvestFormProps {
  onResult?: (result: InvestmentAllocationResult) => void;
}

export function InvestForm({ onResult }: InvestFormProps) {
  const [form, setForm] = useState({
    availableCash: "",
    workingCapitalBuffer: "",
    upcomingObligations: "",
  });
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await calculateAllocation({
        availableCash: parseFloat(form.availableCash),
        workingCapitalBuffer: parseFloat(form.workingCapitalBuffer),
        upcomingObligations: parseFloat(form.upcomingObligations),
      });
      onResult?.(res.data);
    } finally {
      setLoading(false);
    }
  };

  const deployable =
    form.availableCash && form.workingCapitalBuffer && form.upcomingObligations
      ? Math.max(
          0,
          parseFloat(form.availableCash) -
            parseFloat(form.workingCapitalBuffer) -
            parseFloat(form.upcomingObligations)
        )
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cash Flow Analysis</CardTitle>
        <CardDescription>
          Your current cyber risk level will adjust the deployable surplus calculation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cash">Available cash (₹)</Label>
            <Input
              id="cash"
              type="number"
              placeholder="2000000"
              value={form.availableCash}
              onChange={(e) => setForm({ ...form, availableCash: e.target.value })}
              required
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buffer">Working capital buffer (₹)</Label>
            <Input
              id="buffer"
              type="number"
              placeholder="1000000"
              value={form.workingCapitalBuffer}
              onChange={(e) => setForm({ ...form, workingCapitalBuffer: e.target.value })}
              required
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="obligations">Upcoming obligations (₹)</Label>
            <Input
              id="obligations"
              type="number"
              placeholder="400000"
              value={form.upcomingObligations}
              onChange={(e) => setForm({ ...form, upcomingObligations: e.target.value })}
              required
              min="0"
            />
          </div>

          {deployable !== null && (
            <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available cash</span>
                <span>{formatINRShort(parseFloat(form.availableCash))}</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>Working capital</span>
                <span>- {formatINRShort(parseFloat(form.workingCapitalBuffer))}</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>Obligations</span>
                <span>- {formatINRShort(parseFloat(form.upcomingObligations))}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                <span>Pre-risk surplus</span>
                <span className={deployable > 0 ? "text-green-600" : "text-red-600"}>
                  {formatINRShort(deployable)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Cyber-risk reserve will be deducted based on your current risk level
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            <TrendingUp className="h-4 w-4 mr-2" />
            {loading ? "Calculating..." : "Calculate Allocation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
