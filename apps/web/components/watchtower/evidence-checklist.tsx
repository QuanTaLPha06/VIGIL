"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, XCircle, ExternalLink } from "lucide-react";
import { getDocument, COLLECTIONS } from "@/lib/firestore";
import type { VerificationResult, EvidenceItem } from "@vigil/types";

function EvidenceRow({ item }: { item: EvidenceItem }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      {item.status === "VERIFIED" ? (
        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
      ) : item.status === "WARNING" ? (
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <p className="text-sm font-medium">{item.label}</p>
        {item.detail && (
          <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
        )}
      </div>
      <Badge
        variant={
          item.status === "VERIFIED" ? "low"
          : item.status === "WARNING" ? "medium"
          : "high"
        }
        className="text-xs"
      >
        {item.status}
      </Badge>
    </div>
  );
}

export function EvidenceChecklist({ verificationId }: { verificationId: string }) {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocument<VerificationResult>(COLLECTIONS.VERIFICATION_CHECKS, verificationId)
      .then(setResult)
      .finally(() => setLoading(false));
  }, [verificationId]);

  if (loading) {
    return <div className="text-sm text-muted-foreground p-8 text-center">Loading verification data...</div>;
  }

  if (!result) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground text-sm">
          Verification not found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Evidence Checklist</CardTitle>
          <Badge variant={result.status === "VERIFIED" ? "low" : result.status === "PARTIAL" ? "medium" : "high"}>
            {result.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{result.businessName || "Unknown entity"}</p>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {result.evidence?.map((item, i) => (
            <EvidenceRow key={i} item={item} />
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
          <p className="font-medium">Recommendation</p>
          <p className="text-muted-foreground mt-1">{result.recommendation}</p>
        </div>

        {result.communityReports > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{result.communityReports} community report(s) found for this entity.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
