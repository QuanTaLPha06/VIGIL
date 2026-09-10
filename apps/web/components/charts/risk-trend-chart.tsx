"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { subscribeToRiskEvents } from "@/lib/firestore";
import { useAuth } from "@/components/providers/auth-provider";

interface TrendPoint {
  time: string;
  risk: number;
  event?: string;
}

// Build running-total from risk events
function buildTrend(events: Array<{ scoreDelta: number; eventType: string; createdAt: { toDate?: () => Date } }>): TrendPoint[] {
  if (!events.length) return [];

  const sorted = [...events].reverse(); // oldest first
  let running = 0;

  return sorted.map((e) => {
    running = Math.max(0, Math.min(100, running + (e.scoreDelta ?? 0)));
    const date = e.createdAt?.toDate?.() ?? new Date();
    return {
      time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      risk: running,
      event: e.eventType.replace(/_/g, " "),
    };
  });
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: TrendPoint }>; label?: string }) => {
  if (active && payload?.length) {
    const point = payload[0].payload;
    return (
      <div className="bg-card border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground">Risk: <span className="font-bold text-foreground">{payload[0].value}</span></p>
        {point.event && <p className="text-xs text-muted-foreground mt-1">{point.event}</p>}
      </div>
    );
  }
  return null;
};

export function RiskTrendChart() {
  const { user } = useAuth();
  const [data, setData] = useState<TrendPoint[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToRiskEvents(user.uid, (events) => {
      setData(buildTrend(events as Array<{ scoreDelta: number; eventType: string; createdAt: { toDate?: () => Date } }>));
    });
    return unsub;
  }, [user]);

  // Show demo data if no real events
  const chartData = data.length > 0 ? data : [
    { time: "Start", risk: 32 },
    { time: "+1h", risk: 44 },
    { time: "+2h", risk: 61 },
    { time: "+3h", risk: 49 },
    { time: "+4h", risk: 43 },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Risk Trend</CardTitle>
          <span className="text-xs text-muted-foreground">Live — updates with each risk event</span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={75} stroke="#dc2626" strokeDasharray="3 3" label={{ value: "Critical", fontSize: 10, fill: "#dc2626" }} />
            <ReferenceLine y={55} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "High", fontSize: 10, fill: "#f59e0b" }} />
            <Area
              type="monotone"
              dataKey="risk"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#riskGradient)"
              dot={{ r: 4, fill: "#ef4444" }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
