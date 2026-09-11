import { Metadata } from "next";
import { LearnTabs } from "@/components/learn/learn-tabs";

export const metadata: Metadata = {
  title: "Learn & Respond — VIGIL",
};

export default function LearnPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Learn & Respond</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Understand cyber risks in plain language and know exactly what to do next
        </p>
      </div>
      <LearnTabs />
    </div>
  );
}
