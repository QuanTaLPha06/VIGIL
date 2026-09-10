"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkInvestmentScheme } from "@/lib/functions";
import { Search, CheckCircle, AlertTriangle } from "lucide-react";
import type { VerificationResult } from "@vigil/types";

export function SchemeChecker() {
  const [schemeName, setSchemeName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await checkInvestmentScheme({
        schemeName,
        organizationName: orgName,
      });
      setResult(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Investment Scheme Checker</CardTitle>
        <CardDescription>
          Before considering a scheme, verify the offering organization using Watchtower-style checks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCheck} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Scheme name</Label>
              <Input
                placeholder="e.g. XYZ Fixed Deposit"
                value={schemeName}
                onChange={(e) => setSchemeName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Organization name</Label>
              <Input
                placeholder="e.g. XYZ Finance Ltd."
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} variant="outline">
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Checking..." : "Check Scheme"}
          </Button>
        </form>

        {result && (
          <div className={`mt-4 p-4 rounded-lg border ${
            result.status === "VERIFIED" ? "bg-green-50 border-green-200" :
            result.status === "FAILED" ? "bg-red-50 border-red-200" :
            "bg-amber-50 border-amber-200"
          }`}>
            <div className="flex items-center gap-2">
              {result.status === "VERIFIED"
                ? <CheckCircle className="h-5 w-5 text-green-500" />
                : <AlertTriangle className="h-5 w-5 text-amber-500" />
              }
              <p className="font-semibold text-sm">{result.status}</p>
            </div>
            {result.recommendation && (
              <p className="text-sm text-muted-foreground mt-2">{result.recommendation}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
