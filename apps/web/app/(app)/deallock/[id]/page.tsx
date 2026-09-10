import { Metadata } from "next";
import { DealLockDetail } from "@/components/deallock/deal-detail";

export const metadata: Metadata = {
  title: "Deal Detail — VIGIL",
};

export default function DealLockDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deal Detail</h1>
        <p className="text-muted-foreground text-sm mt-1">
          On-chain proof and deal status
        </p>
      </div>
      <DealLockDetail dealId={params.id} />
    </div>
  );
}
