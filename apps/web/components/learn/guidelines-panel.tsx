"use client";

import { useState } from "react";
import { GUIDELINES, type GuidelineSection } from "@/lib/learn-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_CONFIG: Record<
  GuidelineSection["category"],
  { label: string; color: string; bg: string }
> = {
  cybersecurity: { label: "Cybersecurity Basics", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  business:      { label: "Business Risk",         color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  financial:     { label: "Financial Safety",      color: "text-green-700", bg: "bg-green-50 border-green-200" },
};

function GuideCard({ g }: { g: GuidelineSection }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{g.icon}</span>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold">{g.title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{g.summary}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-4 border-t">
          {g.points.map((p, i) => (
            <div key={i} className="space-y-1">
              <p className="text-sm font-semibold">{p.heading}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.detail}</p>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

export function GuidelinesPanel() {
  const categories: GuidelineSection["category"][] = ["cybersecurity", "business", "financial"];

  return (
    <div className="space-y-8">
      {categories.map((cat) => {
        const cfg = CATEGORY_CONFIG[cat];
        const guides = GUIDELINES.filter((g) => g.category === cat);
        return (
          <div key={cat}>
            <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-4", cfg.bg, cfg.color)}>
              {cfg.label}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {guides.map((g) => (
                <GuideCard key={g.id} g={g} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
