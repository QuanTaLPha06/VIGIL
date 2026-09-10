"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { analyzeScam } from "@/lib/functions";
import { AlertTriangle, CheckCircle, Shield, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ScamAnalysisResult } from "@vigil/types";

const RISK_COLOR = {
  LOW: "text-green-600",
  MEDIUM: "text-amber-600",
  HIGH: "text-red-600",
  CRITICAL: "text-red-800",
};

export function ScamCheckerForm() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeScam({ text, type: "MESSAGE" });
      setResult(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Analyze Content</CardTitle>
        <CardDescription>
          Paste a suspicious message, email, invoice text or payment request
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scam-text">Content to analyze</Label>
            <textarea
              id="scam-text"
              className="w-full min-h-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              placeholder="Paste the suspicious message here...&#10;&#10;Example: Dear Sir, your KYC has expired. Click here to update immediately or your account will be blocked..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !text.trim()}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Analyze for Scam Signals
              </>
            )}
          </Button>
        </form>

        {result && (
          <div className="mt-6 space-y-4">
            <div className={`flex items-center gap-3 p-4 rounded-lg border ${
              result.riskLevel === "LOW" ? "bg-green-50 border-green-200" :
              result.riskLevel === "HIGH" || result.riskLevel === "CRITICAL"
                ? "bg-red-50 border-red-200"
                : "bg-amber-50 border-amber-200"
            }`}>
              {result.riskLevel === "LOW"
                ? <CheckCircle className="h-6 w-6 text-green-500" />
                : <AlertTriangle className="h-6 w-6 text-red-500" />
              }
              <div>
                <p className={`font-bold text-lg ${RISK_COLOR[result.riskLevel]}`}>
                  {result.riskLevel} RISK
                </p>
                <p className="text-xs text-muted-foreground">
                  Confidence: {Math.round(result.confidence * 100)}%
                </p>
              </div>
            </div>

            {result.signals && result.signals.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Signals detected:</p>
                <div className="space-y-1.5">
                  {result.signals.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.explanation && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-1">AI Analysis</p>
                <p className="text-muted-foreground">{result.explanation}</p>
              </div>
            )}

            {result.recommendedAction && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p className="font-medium text-blue-800 mb-1">Recommended action</p>
                <p className="text-blue-700">{result.recommendedAction}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
