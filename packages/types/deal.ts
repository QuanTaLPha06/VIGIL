import { Timestamp } from "firebase/firestore";

export type DealStatus =
  | "LOCKED"
  | "CONFIRMED"
  | "BREACHED"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELLED";

export interface Deal {
  id?: string;
  buyerId: string;
  buyerName?: string;
  sellerName: string;
  sellerAddress?: string;
  amount: number;
  description?: string;
  paymentDeadline?: string;
  penaltyPercent?: number;
  termsHash?: string;
  blockchainTxHash?: string;
  status: DealStatus;
  network?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
