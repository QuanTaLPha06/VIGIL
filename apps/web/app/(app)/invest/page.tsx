import { Metadata } from "next";
import { InvestForm } from "@/components/invest/invest-form";
import { AllocationResult } from "@/components/invest/allocation-result";
import { SchemeChecker } from "@/components/invest/scheme-checker";

export const metadata: Metadata = {
  title: "VIGIL Invest — VIGIL",
};

export default function InvestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">VIGIL Invest</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Educational capital allocation guidance adjusted for your current cyber risk level
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <strong>Disclaimer:</strong> VIGIL Invest provides educational, informational guidance only.
        It does not constitute individualized regulated investment advice. Consult a SEBI-registered
        adviser before making investment decisions.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvestForm />
        <AllocationResult />
      </div>

      <SchemeChecker />
    </div>
  );
}
