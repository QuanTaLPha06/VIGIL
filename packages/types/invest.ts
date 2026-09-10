export interface InvestmentAllocationRequest {
  availableCash: number;
  workingCapitalBuffer: number;
  upcomingObligations: number;
}

export interface AllocationBand {
  category: string;
  minPercent: number;
  maxPercent: number;
  rationale: string;
}

export interface InvestmentAllocationResult {
  availableCash: number;
  workingCapitalBuffer: number;
  upcomingObligations: number;
  cyberRiskReserve: number;
  deployableSurplus: number;
  overallRisk: number;
  riskStatus: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  liquidityPriority: "HIGH" | "MEDIUM" | "LOW";
  allocationBands: AllocationBand[];
  disclaimer: string;
}
