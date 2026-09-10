"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { verifyCompany } from "@/lib/functions";
import { Search, AlertCircle } from "lucide-react";
import type { VerificationResult } from "@vigil/types";

export function WatchtowerVerifyForm() {
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gstin && !pan) {
      setError("Please enter at least a GSTIN or PAN.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await verifyCompany({ gstin, pan, bankAccount, ifsc });
      setResult(res.data);
    } catch {
      setError("Verification failed. Please check your inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Verify Counterparty</CardTitle>
        <CardDescription>
          Enter GSTIN, PAN or bank details. Company name is never used as the primary identity key.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input
              id="gstin"
              placeholder="22AAAAA0000A1Z5"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              maxLength={15}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pan">PAN</Label>
            <Input
              id="pan"
              placeholder="AAAAA0000A"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              maxLength={10}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="bank">Bank Account</Label>
              <Input
                id="bank"
                placeholder="Account number"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifsc">IFSC</Label>
              <Input
                id="ifsc"
                placeholder="SBIN0000001"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                maxLength={11}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Verifying..." : "Verify Counterparty"}
          </Button>
        </form>

        {result && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-semibold">Verification ID: {result.id}</p>
            <p className="text-sm text-muted-foreground">
              Status: <span className="font-medium text-foreground">{result.status}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              View full evidence checklist →
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
