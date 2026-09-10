import { Timestamp } from "firebase/firestore";

export interface EvidenceItem {
  label: string;
  status: "VERIFIED" | "WARNING" | "FAILED" | "NOT_PROVIDED";
  detail?: string;
}

export interface VerificationRequest {
  gstin?: string;
  pan?: string;
  bankAccount?: string;
  ifsc?: string;
}

export interface VerificationResult {
  id?: string;
  requestedBy?: string;
  gstin?: string;
  pan?: string;
  bankAccount?: string;
  ifsc?: string;
  businessName?: string | null;
  status: "VERIFIED" | "PARTIAL" | "FAILED";
  evidence: EvidenceItem[];
  communityReports: number;
  recommendation: string;
  createdAt?: Timestamp;
}

export interface Company {
  id?: string;
  gstin?: string;
  panHash?: string;
  businessName: string;
  status: "ACTIVE" | "SUSPENDED" | "CANCELLED";
  verificationStatus: "VERIFIED" | "PARTIAL" | "UNVERIFIED";
  createdAt?: Timestamp;
}
