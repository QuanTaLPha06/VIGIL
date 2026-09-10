import { Metadata } from "next";
import { CaseDetail } from "@/components/cases/case-detail";

export const metadata: Metadata = {
  title: "Case Detail — VIGIL",
};

export default function CaseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Case #{params.id}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Evidence package, interest calculation and Samadhaan complaint draft
        </p>
      </div>
      <CaseDetail caseId={params.id} />
    </div>
  );
}
