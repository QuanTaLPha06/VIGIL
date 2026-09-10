/**
 * Mock / sandbox verification data.
 *
 * In the prototype we use synthetic data.
 * NEVER use real personal financial identifiers in demo data.
 *
 * Production roadmap: replace with actual GST API, Aadhaar XML,
 * bank account penny-drop, and NSDL PAN verification.
 */

export interface MockCompany {
  gstin: string;
  businessName: string;
  status: "ACTIVE" | "SUSPENDED" | "CANCELLED";
  panVerified: boolean;
  addressState: string;
  registeredDate: string;
  communityReports: number;
}

// Synthetic GSTIN records (format: 2-digit state + PAN + 1 digit + Z + 1 digit)
export const MOCK_COMPANIES: MockCompany[] = [
  {
    gstin: "27AABCU9603R1ZP",
    businessName: "Sharma Textiles Pvt Ltd",
    status: "ACTIVE",
    panVerified: true,
    addressState: "Maharashtra",
    registeredDate: "2018-03-15",
    communityReports: 0,
  },
  {
    gstin: "07AAACR5055K1ZB",
    businessName: "Raj Constructions",
    status: "ACTIVE",
    panVerified: true,
    addressState: "Delhi",
    registeredDate: "2019-07-22",
    communityReports: 2, // Triggers a community-reports warning
  },
  {
    gstin: "33AADCE4773M1Z5",
    businessName: "Chennai Components",
    status: "SUSPENDED",
    panVerified: false,
    addressState: "Tamil Nadu",
    registeredDate: "2020-01-10",
    communityReports: 5, // High-risk entity
  },
  {
    gstin: "29AABCS1429B1Z2",
    businessName: "Bangalore Tech Solutions",
    status: "ACTIVE",
    panVerified: true,
    addressState: "Karnataka",
    registeredDate: "2021-05-30",
    communityReports: 0,
  },
  {
    gstin: "24AAGCA8719R1ZL",
    businessName: "Gujarat Agro Industries",
    status: "ACTIVE",
    panVerified: true,
    addressState: "Gujarat",
    registeredDate: "2017-11-08",
    communityReports: 1,
  },
];

// Synthetic IFSC validation (just format check in prototype)
export const VALID_IFSC_PREFIXES = ["SBIN", "HDFC", "ICIC", "AXIS", "KKBK", "UBIN", "BARB"];

/**
 * Look up a mock company by GSTIN.
 * Returns null if not found (simulates unknown counterparty).
 */
export function lookupByGSTIN(gstin: string): MockCompany | null {
  return MOCK_COMPANIES.find(
    (c) => c.gstin.toUpperCase() === gstin.toUpperCase()
  ) ?? null;
}

/**
 * Validate GSTIN format (not real API check).
 * Format: 2 digits + 10 char PAN + 1 digit + Z + 1 alphanumeric
 */
export function isValidGSTINFormat(gstin: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    gstin.toUpperCase()
  );
}

/**
 * Validate PAN format.
 */
export function isValidPANFormat(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());
}

/**
 * Validate IFSC format.
 */
export function isValidIFSCFormat(ifsc: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase());
}
