import { Timestamp } from "firebase/firestore";

export interface PaymentRiskRequest {
  amount: number;
  monthlyOutflow: number;
  counterparty?: string;
  purpose?: string;
}

export interface PaymentRiskResult {
  id?: string;
  amount: number;
  monthlyOutflow: number;
  outflowRatio: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reasoning: string;
  recommendation: string;
}

export interface PaymentRiskAssessment extends PaymentRiskResult {
  userId?: string;
  companyId?: string;
  counterparty?: string;
  purpose?: string;
  createdAt?: Timestamp;
}
