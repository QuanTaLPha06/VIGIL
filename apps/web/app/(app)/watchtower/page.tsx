import { Metadata } from "next";
import { WatchtowerVerifyForm } from "@/components/watchtower/verify-form";
import { VerificationHistory } from "@/components/watchtower/verification-history";

export const metadata: Metadata = {
  title: "Company Watchtower — VIGIL",
};

export default function WatchtowerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Company Watchtower</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Verify counterparties before transactions using GSTIN, PAN and bank evidence
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WatchtowerVerifyForm />
        <VerificationHistory />
      </div>
    </div>
  );
}
