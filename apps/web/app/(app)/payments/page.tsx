import { Metadata } from "next";
import { PaymentRiskForm } from "@/components/payments/payment-risk-form";
import { PaymentRiskHistory } from "@/components/payments/payment-risk-history";

export const metadata: Metadata = {
  title: "Payment Risk — VIGIL",
};

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Single-Payment Risk Assessor</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Assess contextual risk for individual payments based on your typical business outflow
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentRiskForm />
        <PaymentRiskHistory />
      </div>
    </div>
  );
}
