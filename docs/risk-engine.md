# VIGIL Risk Engine

## Cyber Risk Index

Score range: **0–100**

| Range | Status |
|---|---|
| 0–29 | LOW |
| 30–54 | MEDIUM |
| 55–74 | HIGH |
| 75–100 | CRITICAL |

## Dimensions (20 pts each)

| Dimension | Source |
|---|---|
| Identity Risk | Watchtower verification failures |
| Transaction Risk | Payment assessor anomalies |
| Communication Risk | Scam checker results |
| Counterparty Risk | Unverified / reported entities |
| Deal Risk | DealLock breaches |

## Event Weight Table

| Event | Delta | Dimension |
|---|---|---|
| UNVERIFIED_COUNTERPARTY | +10 | Counterparty Risk |
| SUSPICIOUS_MESSAGE | +15 | Communication Risk |
| HIGH_VALUE_PAYMENT | +10 | Transaction Risk |
| DEALLOCK_BREACH | +15 | Deal Risk |
| SCAM_DETECTED | +18 | Communication Risk |
| GSTIN_VERIFIED | -5 | Identity Risk |
| BANK_ACCOUNT_VERIFIED | -5 | Counterparty Risk |
| DEALLOCK_ACTIVATED | -8 | Deal Risk |
| DEALLOCK_COMPLETED | -10 | Deal Risk |
| COUNTERPARTY_FULLY_VERIFIED | -8 | Counterparty Risk |

## Explainability

Every risk change includes:
- `eventType` — what happened
- `scoreDelta` — how much the score changed
- `evidence[]` — why (human-readable strings)
- `source` — which module produced the event
- `severity` — HIGH / MEDIUM / LOW

The index is a **risk-exposure indicator**, not a credit score or legal finding.

## Configuring Weights

Edit `functions/src/risk/calculator.ts` → `RISK_WEIGHTS` to adjust deltas for each event type.
