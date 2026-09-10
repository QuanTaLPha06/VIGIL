import { Timestamp } from "firebase/firestore";

export type CaseType =
  | "SCAM"
  | "SUSPICIOUS_PAYMENT"
  | "DELAYED_PAYMENT"
  | "DEALLOCK_BREACH"
  | "COUNTERPARTY_DISPUTE";

export type CaseStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface Case {
  id?: string;
  companyId: string;
  type: CaseType;
  status: CaseStatus;
  description?: string;
  dealId?: string;
  amount?: number;
  dueDate?: string;
  daysOverdue?: number;
  evidence?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
