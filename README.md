# VIGIL

> **AI-powered continuous cyber risk quantification and investment optimization platform for MSMEs.**

VIGIL continuously monitors cyber and transaction risk, quantifies business exposure, protects B2B deals via blockchain, and guides safer capital allocation.

---

## Core Loop

```
OBSERVE → ANALYZE → QUANTIFY → PROTECT → RECOVER → OPTIMIZE
```

| Module | Purpose |
|---|---|
| **Cyber Risk Engine** | Continuously calculates the VIGIL Cyber Risk Index from all signals |
| **Company Watchtower** | Verify counterparties via GSTIN / PAN / Bank evidence checklist |
| **Scam Checker** | AI + rule-based analysis of suspicious messages, emails, invoices |
| **Payment Risk** | Contextual risk for individual payments vs. monthly outflow |
| **DealLock** | Blockchain-enforced B2B deal protection on Polygon Amoy |
| **Case Tracker** | Evidence-backed case management + Samadhaan complaint drafts |
| **VIGIL Invest** | Educational capital allocation guidance adjusted for cyber risk |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| Backend | Firebase Cloud Functions (TypeScript) |
| Database | Firestore |
| Auth | Firebase Authentication |
| AI | Google Gemini Flash (free tier) |
| Blockchain | Solidity, Hardhat, Polygon Amoy testnet |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
VIGIL/
├── apps/
│   └── web/                  # Next.js frontend
├── functions/                # Firebase Cloud Functions (backend)
├── blockchain/
│   └── deallock/             # Hardhat project — DealLock smart contract
├── packages/
│   ├── types/                # Shared TypeScript interfaces
│   ├── validation/           # Shared Zod schemas
│   ├── constants/            # Shared enums and constants
│   └── config/               # Shared configuration
├── firestore/
│   ├── firestore.rules       # Security rules
│   └── firestore.indexes.json
├── scripts/                  # Demo seed / reset scripts
├── docs/                     # Architecture and feature docs
├── firebase.json
├── .firebaserc
└── pnpm-workspace.yaml
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8 (`npm install -g pnpm`)
- Firebase CLI (`npm install -g firebase-tools`)
- Java 11+ (required for Firebase emulators)

### Setup

```bash
# 1. Clone
git clone https://github.com/QuanTaLPha06/VIGIL.git
cd VIGIL

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env.local
# Fill in your Firebase project values

# 4. Start Firebase emulators
pnpm emulate

# 5. Start the web app (separate terminal)
pnpm dev
```

### Blockchain (DealLock)

```bash
# Compile contract
pnpm blockchain:compile

# Run tests
pnpm blockchain:test

# Deploy to Polygon Amoy testnet
# Make sure PRIVATE_KEY is set in .env.local
pnpm blockchain:deploy
```

---

## Demo Flow (5 minutes)

1. **Verify counterparty** — Watchtower → Evidence Checklist
2. **Create protected deal** — DealLock → Hash → Polygon Amoy proof
3. **Simulate risk events** — Payment + suspicious message → Risk 32 → 61
4. **Simulate DealLock breach** — Penalty logic → on-chain proof
5. **Case + recovery** — Evidence package + interest calc + Samadhaan draft
6. **Investment optimization** — Available cash → risk reserve → deployable surplus

---

## Environment Variables

See `.env.example` for all required variables.

Key ones:
- `NEXT_PUBLIC_FIREBASE_*` — Firebase client SDK config
- `GEMINI_API_KEY` — Google AI Studio (free): https://aistudio.google.com/app/apikey
- `PRIVATE_KEY` — Test wallet for Polygon Amoy (never use a real funded wallet)
- `NEXT_PUBLIC_DEALLOCK_CONTRACT_ADDRESS` — Set after deploying DealLock.sol

---

## What This Is NOT

- ❌ Not a production financial system
- ❌ Not real-money escrow
- ❌ Not regulated investment advice
- ❌ Not a WhatsApp bot
- ❌ Not connected to live government APIs

This is a **hackathon prototype** demonstrating the concept.

---

## Team

| Developer | Responsibility |
|---|---|
| Dev 1 | Next.js dashboard + UI |
| Dev 2 | Firebase Functions + Firestore |
| Dev 3 | DealLock + Solidity + Polygon |
| Dev 4 | Scam Checker + Gemini AI integration |
| Dev 5 | Watchtower + Risk Engine + VIGIL Invest |
