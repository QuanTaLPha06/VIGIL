"use client";

import { getActionCard, getRelatedCases } from "@/lib/learn-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, CheckCircle, FileText,
  ArrowRight, BookOpen, Shield,
} from "lucide-react";
import Link from "next/link";

interface ActionCardProps {
  eventType: string;
  compact?: boolean; // compact = inline on dashboard, full = standalone
}

export function ActionGuidanceCard({ eventType, compact = false }: ActionCardProps) {
  const card = getActionCard(eventType);
  const relatedCases = getRelatedCases(eventType).slice(0, 2);

  if (!card) return null;

  if (compact) {
    return (
      <div className="border rounded-lg p-3 bg-amber-50 border-amber-200 space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm font-semibold text-amber-800">{card.title}</p>
        </div>
        <ol className="space-y-1">
          {card.steps.slice(0, 3).map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
              <span className="font-bold shrink-0">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <Link href="/learn">
          <Button variant="outline" size="sm" className="h-7 text-xs w-full mt-1 border-amber-300 text-amber-700 hover:bg-amber-100">
            <BookOpen className="h-3 w-3 mr-1.5" />
            See full guidance
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Card className="border-amber-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-base">{card.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Why */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Why am I seeing this?
          </p>
          <ul className="space-y-1.5">
            {card.why.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            What should I do?
          </p>
          <ol className="space-y-2">
            {card.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="bg-primary/10 text-primary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Preserve Evidence */}
        {card.preserveEvidence && card.preserveEvidence.length > 0 && (
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Preserve Evidence
            </p>
            <ul className="space-y-1">
              {card.preserveEvidence.map((e, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Escalate */}
        {card.escalateTo && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-red-700 mb-1">Escalate / Report</p>
            <p className="text-xs text-red-600">{card.escalateTo}</p>
          </div>
        )}

        {/* Related cases */}
        {relatedCases.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Related Cases
            </p>
            <div className="space-y-1.5">
              {relatedCases.map((c) => (
                <Link key={c.id} href={`/learn?case=${c.id}`}>
                  <div className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    {c.title}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
