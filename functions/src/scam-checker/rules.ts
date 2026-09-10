/**
 * Deterministic scam detection rules.
 *
 * The rule engine is the PRIMARY layer.
 * Gemini is called AFTER rules to provide explanation and catch edge cases.
 * If Gemini is unavailable, the rules engine still produces a valid result.
 */

export interface RuleMatch {
  signal: string;
  weight: number; // contribution to risk score 0–100
}

// ── Keyword patterns ─────────────────────────────────────────

const URGENCY_PATTERNS = [
  /urgent/i, /immediate/i, /within 24 hours?/i, /act now/i,
  /last chance/i, /expires today/i, /deadline/i, /asap/i,
  /block(?:ed|ing)/i, /suspend(?:ed|ing)/i, /deactivat/i,
  /aaj tak/i, /turant/i, /abhi/i,
];

const PAYMENT_REQUEST_PATTERNS = [
  /pay\s+(?:now|immediately|urgently)/i,
  /transfer\s+(?:now|immediately)/i,
  /send\s+(?:money|funds|payment|amount)/i,
  /credit.*account/i,
  /neft|rtgs|imps|upi/i,
  /wallet.*(?:paytm|phonepe|gpay|googlepay)/i,
  /advance\s+payment/i,
  /processing\s+fee/i,
  /refund.*fee/i,
];

const KYC_IMPERSONATION_PATTERNS = [
  /kyc\s*(?:update|verification|expired|pending)/i,
  /aadhar|aadhaar/i,
  /pan\s*card/i,
  /bank.*update/i,
  /account.*verification/i,
  /re-?verify/i,
  /sbi\s*customer\s*care/i,
  /rbi\s*(?:notice|penalty|fine)/i,
  /income\s*tax\s*(?:notice|department)/i,
  /trai/i,
];

const SUSPICIOUS_LINK_PATTERNS = [
  /(?:click|tap|open|visit)\s+(?:here|link|below)/i,
  /http[s]?:\/\/(?!www\.gov\.in|\.nic\.in|\.org\.in)/i,
  /bit\.ly|tinyurl|t\.co|ow\.ly|short\.io/i,
  /0x[a-fA-F0-9]{4,}/i, // hex-encoded URLs
];

const SENSITIVE_INFO_PATTERNS = [
  /(?:share|send|provide|enter|give)\s+(?:your\s+)?(?:otp|password|pin|cvv|card\s*number)/i,
  /do not\s+(?:share|tell)\s+(?:otp|password)/i, // reverse psychology
  /one.?time.?password/i,
  /atm\s*pin/i,
];

const LOTTERY_PRIZE_PATTERNS = [
  /won\s+(?:a\s+)?(?:lottery|prize|reward|gift)/i,
  /congratulation/i,
  /you(?:'ve| have)\s+been\s+selected/i,
  /lucky\s+winner/i,
  /claim\s+(?:your\s+)?(?:prize|reward)/i,
];

const JOB_FRAUD_PATTERNS = [
  /work\s+from\s+home/i,
  /earn\s+(?:\d+\s*(?:k|lakh|thousand))\s*(?:per|a)\s*(?:day|month)/i,
  /no\s+experience\s+required/i,
  /part.?time.*income/i,
];

// ── Rule evaluation ──────────────────────────────────────────

export function evaluateRules(text: string): {
  signals: string[];
  ruleScore: number;
  matches: RuleMatch[];
} {
  const matches: RuleMatch[] = [];

  const check = (patterns: RegExp[], signal: string, weight: number) => {
    if (patterns.some((p) => p.test(text))) {
      matches.push({ signal, weight });
    }
  };

  check(URGENCY_PATTERNS,         "Urgency / pressure tactics",               18);
  check(PAYMENT_REQUEST_PATTERNS, "Unexpected payment request",               20);
  check(KYC_IMPERSONATION_PATTERNS, "KYC / identity impersonation language",  22);
  check(SUSPICIOUS_LINK_PATTERNS, "Suspicious link detected",                 15);
  check(SENSITIVE_INFO_PATTERNS,  "Request for sensitive information (OTP/PIN)", 25);
  check(LOTTERY_PRIZE_PATTERNS,   "Lottery / prize fraud pattern",            20);
  check(JOB_FRAUD_PATTERNS,       "Job or work-from-home fraud pattern",      15);

  // Cap rule score at 100
  const ruleScore = Math.min(
    100,
    matches.reduce((sum, m) => sum + m.weight, 0)
  );

  return {
    signals: matches.map((m) => m.signal),
    ruleScore,
    matches,
  };
}

/**
 * Convert a numeric rule score to a risk level.
 */
export function scoreToRiskLevel(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (score === 0) return "LOW";
  if (score < 20) return "LOW";
  if (score < 40) return "MEDIUM";
  if (score < 65) return "HIGH";
  return "CRITICAL";
}
