"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { subscribeToRiskEvents } from "@/lib/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { timeAgo } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, TrendingUp, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { ActionGuidanceCard } from "@/components/learn/action-card";
import { getActionCard } from "@/lib/learn-data";
import type { RiskEvent } from "@vigil/types";

const severityIcon = (severity: string) => {
  switch (severity) {
    case "HIGH":   return <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />;
    case "MEDIUM": return <TrendingUp className="h-4 w-4 text-amber-500 shrink-0" />;
    case "LOW":    return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
    default:       return <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />;
  }
};

function EventRow({ event }: { event: RiskEvent }) {
  const [showAction, setShowAction] = useState(false);
  const hasAction = !!getActionCard(event.eventType);

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {severityIcon(event.severity)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {event.eventType.replace(/_/g, " ")}
          </p>
          {event.evidence?.map((e, i) => (
            <p key={i} className="text-xs text-muted-foreground truncate">{e}</p>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className={`text-xs font-semibold ${(event.scoreDelta ?? 0) > 0 ? "text-red-500" : "text-green-600"}`}>
              {(event.scoreDelta ?? 0) > 0 ? "+" : ""}{event.scoreDelta}
            </span>
            <p className="text-[10px] text-muted-foreground">
              {event.createdAt ? timeAgo(event.createdAt.toDate?.() ?? new Date()) : ""}
            </p>
          </div>
          {hasAction && (event.scoreDelta ?? 0) > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-600 hover:bg-amber-50"
              onClick={() => setShowAction(!showAction)}
              title="What should I do?"
            >
              {showAction ? <ChevronUp className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Inline action guidance */}
      {showAction && (
        <div className="ml-7">
          <ActionGuidanceCard eventType={event.eventType} compact />
        </div>
      )}
    </div>
  );
}

export function RiskEventsTimeline() {
  const { user } = useAuth();
  const [events, setEvents] = useState<RiskEvent[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToRiskEvents(user.uid, (e) =>
      setEvents(e as RiskEvent[])
    );
    return unsub;
  }, [user]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent Risk Events</CardTitle>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Click <BookOpen className="h-3 w-3 inline mx-0.5" /> for guidance
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No risk events yet. Use the simulator on the dashboard to generate events.
          </p>
        ) : (
          <div className="divide-y">
            {events.map((event) => (
              <div key={event.id} className="py-3 first:pt-0 last:pb-0">
                <EventRow event={event} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
