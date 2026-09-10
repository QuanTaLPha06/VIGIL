import { Metadata } from "next";
import { DealLockCreateForm } from "@/components/deallock/create-form";
import { DealLockList } from "@/components/deallock/deal-list";

export const metadata: Metadata = {
  title: "DealLock — VIGIL",
};

export default function DealLockPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">DealLock</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Blockchain-protected B2B deal agreements on Polygon Amoy testnet
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DealLockCreateForm />
        <DealLockList />
      </div>
    </div>
  );
}
