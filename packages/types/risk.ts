import { Timestamp } from "firebase/firestore";

export interface RiskProfile {
  id?: string;
  companyId: string;
  identityRisk: number;
  transactionRisk: number;
  communicationRisk: number;
  counterpartyRisk: number;
  dealRisk: number;
  overallRisk: number;
  trend: "IMPROVING" | "STABLE" | "DETERIORATING";
  status: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  updatedAt?: Timestamp;
}

export interface RiskEvent {
  id?: string;
  companyId: string;
  eventType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  source: string;
  scoreDelta: number;
  evidence?: string[];
  createdAt?: Timestamp;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RiskTrend = "IMPROVING" | "STABLE" | "DETERIORATING";

export interface RiskRecalculateResult {
  success: boolean;
  profile: RiskProfile;
}
