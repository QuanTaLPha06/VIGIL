import { Timestamp } from "firebase/firestore";

export interface ScamAnalysisRequest {
  text: string;
  type?: "MESSAGE" | "EMAIL" | "INVOICE" | "LINK";
  companyId?: string;
}

export interface ScamAnalysisResult {
  id?: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  signals: string[];
  ruleScore: number;
  explanation: string;
  recommendedAction: string;
}

export interface ScamReport extends ScamAnalysisResult {
  userId?: string;
  companyId?: string;
  text?: string;
  type?: string;
  createdAt?: Timestamp;
}
