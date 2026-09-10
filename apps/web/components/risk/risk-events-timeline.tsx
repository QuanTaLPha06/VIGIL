"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subscribeToRiskEvents } from "@/lib/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { timeAgo } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, TrendingUp } from "lucide-react";
import type { RiskEvent } from "@vigil/types";

const severityIcon = (severity: string) => {
  switch (severity) {
    case "HIGH": return <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />;
    case "MEDIUM": return <TrendingUp className="h-4 w-4 text-amber-500 shrink-0" />;
    case "LOW": return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
    default: return <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />;
  }
};

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
        <CardTitle className="text-base">Recent Risk Events</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No risk events yet. Use the simulator on the dashboard to generate events.
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                {severityIcon(event.severity)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.eventType.replace(/_/g, " ")}</p>
                  {event.evidence?.map((e, i) => (
                    <p key={i} className="text-xs text-muted-foreground truncate">{e}</p>
                  ))}
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-semibold ${
                      (event.scoreDelta ?? 0) > 0 ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {(event.scoreDelta ?? 0) > 0 ? "+" : ""}
                    {event.scoreDelta}
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    {event.createdAt ? timeAgo(event.createdAt.toDate?.() ?? new Date()) : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
