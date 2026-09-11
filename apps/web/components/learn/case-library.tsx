"use client";

import { useState } from "react";
import { CASES, type LearnCase } from "@/lib/learn-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Shield, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<LearnCase["category"], string> = {
  payment: "Payment",
  identity: "Identity",
  communication: "Communication",
  investment: "Investment",
  counterparty: "Counterparty",
};

const CATEGORY_COLORS: Record<LearnCase["category"], string> = {
  payment: "bg-purple-100 text-purple-700",
  identity: "bg-blue-100 text-blue-700",
  communication: "bg-amber-100 text-amber-700",
  investment: "bg-green-100 text-green-700",
  counterparty: "bg-orange-100 text-orange-700",
};

const FILTERS: Array<{ label: string; value: LearnCase["category"] | "all" }> = [
  { label: "All", value: "all" },
  { label: "Payment", value: "payment" },
  { label: "Identity", value: "identity" },
  { label: "Communication", value: "communication" },
  { label: "Investment", value: "investment" },
  { label: "Counterparty", value: "counterparty" },
];

function CaseCard({ c }: { c: LearnCase }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={cn("border-l-4", c.riskLevel === "CRITICAL" ? "border-l-red-500" : c.riskLevel === "HIGH" ? "border-l-amber-500" : "border-l-yellow-400")}>
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn("text-xs", CATEGORY_COLORS[c.category])}>
                {CATEGORY_LABELS[c.category]}
              </Badge>
              <Badge variant={c.riskLevel === "CRITICAL" ? "critical" : c.riskLevel === "HIGH" ? "high" : "medium"} className="text-xs">
                {c.riskLevel} RISK
              </Badge>
            </div>
            <CardTitle className="text-base leading-snug">{c.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{c.summary}</p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-5 pt-0">
          {/* Scenario */}
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Scenario</p>
            <p className="text-sm leading-relaxed">{c.scenario}</p>
          </div>

          {/* Warning Signs */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Warning Signs
            </p>
            <ul className="space-y-1.5">
              {c.warningSigns.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-500 font-bold mt-0.5 shrink-0">⚠</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What Could Go Wrong */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5 text-red-500" />
              What Could Go Wrong
            </p>
            <ul className="space-y-1.5">
              {c.whatCouldGoWrong.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                  <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What To Do */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              What To Do
            </p>
            <ol className="space-y-2">
              {c.whatToDo.map((w, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="bg-green-100 text-green-700 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{w}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* How VIGIL Helps */}
          <div className="bg-vigil-50 border border-vigil-100 rounded-lg p-4">
            <p className="text-xs font-semibold text-vigil-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              How VIGIL Helps
            </p>
            <ul className="space-y-1.5">
              {c.howVigilHelps.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-vigil-700">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-vigil-500" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {c.tags.map((t) => (
              <span key={t} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function CaseLibrary() {
  const [filter, setFilter] = useState<LearnCase["category"] | "all">("all");

  const filtered = filter === "all" ? CASES : CASES.filter((c) => c.category === filter);

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
            className="h-8 text-xs"
          >
            {f.label}
          </Button>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} case{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Cases */}
      <div className="space-y-3">
        {filtered.map((c) => (
          <CaseCard key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
}
