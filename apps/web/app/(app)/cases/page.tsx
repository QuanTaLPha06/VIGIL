import { Metadata } from "next";
import { CaseList } from "@/components/cases/case-list";
import { CreateCaseButton } from "@/components/cases/create-case-button";

export const metadata: Metadata = {
  title: "Case Tracker — VIGIL",
};

export default function CasesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Case Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track fraud cases, disputes and delayed payments with evidence packages
          </p>
        </div>
        <CreateCaseButton />
      </div>

      <CaseList />
    </div>
  );
}
