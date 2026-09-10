import { Metadata } from "next";
import { EvidenceChecklist } from "@/components/watchtower/evidence-checklist";

export const metadata: Metadata = {
  title: "Verification Result — VIGIL",
};

export default function VerificationResultPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verification Result</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Evidence checklist for verification #{params.id}
        </p>
      </div>
      <EvidenceChecklist verificationId={params.id} />
    </div>
  );
}
