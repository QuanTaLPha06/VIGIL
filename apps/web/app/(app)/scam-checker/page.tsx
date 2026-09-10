import { Metadata } from "next";
import { ScamCheckerForm } from "@/components/scam-checker/scam-checker-form";
import { ScamCheckerHistory } from "@/components/scam-checker/scam-checker-history";

export const metadata: Metadata = {
  title: "Scam Checker — VIGIL",
};

export default function ScamCheckerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scam Checker</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Analyze suspicious messages, emails, invoices and payment requests
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScamCheckerForm />
        <ScamCheckerHistory />
      </div>
    </div>
  );
}
