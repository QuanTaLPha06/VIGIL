import { Metadata } from "next";
import { RiskIndexCard } from "@/components/risk/risk-index-card";
import { RiskDimensionsCard } from "@/components/risk/risk-dimensions-card";
import { RiskTrendChart } from "@/components/charts/risk-trend-chart";
import { RiskEventsTimeline } from "@/components/risk/risk-events-timeline";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AlertsBanner } from "@/components/dashboard/alerts-banner";

export const metadata: Metadata = {
  title: "Dashboard — VIGIL",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Risk Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your live cyber risk exposure and intelligence overview
        </p>
      </div>

      {/* Alert banner — shown when risk is elevated */}
      <AlertsBanner />

      {/* Top row: Risk Index + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RiskIndexCard />
        </div>
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
      </div>

      {/* Risk trend chart */}
      <RiskTrendChart />

      {/* Risk dimensions + recent events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskDimensionsCard />
        <RiskEventsTimeline />
      </div>
    </div>
  );
}
