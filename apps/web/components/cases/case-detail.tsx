"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDocument, COLLECTIONS } from "@/lib/firestore";
import { generateSamadhaanDraft, calculateInterest } from "@/lib/functions";
import { formatINR } from "@/lib/utils";
import { FileText, Calculator, CheckCircle, Download } from "lucide-react";
import type { Case } from "@vigil/types";

export function CaseDetail({ caseId }: { caseId: string }) {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [interest, setInterest] = useState<{ interest: number; totalClaim: number; breakdown: string } | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);

  useEffect(() => {
    getDocument<Case>(COLLECTIONS.CASES, caseId)
      .then(setCaseData)
      .finally(() => setLoading(false));
  }, [caseId]);

  const handleCalcInterest = async () => {
    if (!caseData) return;
    setCalcLoading(true);
    try {
      const res = await calculateInterest({
        principal: caseData.amount ?? 0,
        daysOverdue: caseData.daysOverdue ?? 0,
        rbiRate: 6.5, // Configurable RBI rate
      });
      setInterest(res.data);
    } finally {
      setCalcLoading(false);
    }
  };

  const handleGenerateDraft = async () => {
    setDraftLoading(true);
    try {
      const res = await generateSamadhaanDraft({ caseId });
      setDraft(res.data.draft);
    } finally {
      setDraftLoading(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground text-center py-8">Loading case...</p>;
  if (!caseData) return <p className="text-sm text-muted-foreground text-center py-8">Case not found.</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Case details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Case #{caseId.slice(-6)}</CardTitle>
            <Badge variant={caseData.status === "RESOLVED" ? "low" : caseData.status === "OPEN" ? "high" : "medium"}>
              {caseData.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium">{caseData.type}</p>
            </div>
            {caseData.amount && (
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">{formatINR(caseData.amount)}</p>
              </div>
            )}
            {caseData.dueDate && (
              <div>
                <p className="text-muted-foreground">Due date</p>
                <p className="font-medium">{caseData.dueDate}</p>
              </div>
            )}
            {caseData.daysOverdue && (
              <div>
                <p className="text-muted-foreground">Days overdue</p>
                <p className="font-medium text-red-600">{caseData.daysOverdue} days</p>
              </div>
            )}
          </div>

          {/* Evidence checklist */}
          {caseData.evidence && caseData.evidence.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Evidence Package</p>
              <div className="space-y-1.5">
                {caseData.evidence.map((e: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    <span>{e}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-4">
        {/* Interest calculator */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Interest Claim Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            {interest ? (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-muted-foreground">Interest</p>
                    <p className="font-bold">{formatINR(interest.interest)}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-muted-foreground">Total Claim</p>
                    <p className="font-bold">{formatINR(interest.totalClaim)}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{interest.breakdown}</p>
                <p className="text-xs text-muted-foreground italic">
                  Verify final figures with applicable statutory rates. Not legal advice.
                </p>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCalcInterest}
                disabled={calcLoading || !caseData.amount}
              >
                <Calculator className="h-4 w-4 mr-2" />
                {calcLoading ? "Calculating..." : "Calculate Statutory Interest"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Samadhaan draft */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              MSME Samadhaan Draft
            </CardTitle>
          </CardHeader>
          <CardContent>
            {draft ? (
              <div className="space-y-3">
                <div className="bg-muted rounded-lg p-4 text-sm max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-xs">
                  {draft}
                </div>
                <Button variant="outline" className="w-full" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Draft
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Generate a pre-filled Samadhaan complaint draft using your case evidence.
                  Submit via the official MSME Samadhaan portal.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGenerateDraft}
                  disabled={draftLoading}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {draftLoading ? "Generating..." : "Generate Complaint Draft"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
