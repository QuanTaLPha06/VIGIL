/**
 * VIGIL Learn & Respond — Static content library
 * All cases, guidelines, and action cards live here.
 * No API needed — pure frontend content.
 */

// ── Types ─────────────────────────────────────────────────────

export interface LearnCase {
  id: string;
  title: string;
  category: "payment" | "identity" | "communication" | "investment" | "counterparty";
  riskLevel: "HIGH" | "CRITICAL" | "MEDIUM";
  summary: string;
  scenario: string;
  warningSigns: string[];
  whatCouldGoWrong: string[];
  whatToDo: string[];
  howVigilHelps: string[];
  relatedRiskEvents: string[]; // matches RISK_WEIGHTS keys
  tags: string[];
}

export interface GuidelineSection {
  id: string;
  category: "cybersecurity" | "business" | "financial";
  title: string;
  icon: string;
  summary: string;
  points: { heading: string; detail: string }[];
}

export interface ActionCard {
  triggerEvent: string; // RISK_WEIGHTS key
  title: string;
  why: string[];
  steps: string[];
  escalateTo?: string;
  preserveEvidence?: string[];
}

// ── Case Library ──────────────────────────────────────────────

export const CASES: LearnCase[] = [
  {
    id: "case-001",
    title: "Fake Supplier Bank Account Change",
    category: "payment",
    riskLevel: "CRITICAL",
    summary: "A fraudster impersonates a known supplier and requests a bank account change just before a large payment.",
    scenario: "Your company receives an email from what looks like a trusted supplier. The email says their bank account has changed and asks you to update payment details before the next invoice. The email looks authentic — it has the supplier's logo and correct formatting.",
    warningSigns: [
      "Email address is slightly different from the real supplier (e.g., supplier@gmail.com instead of supplier@company.in)",
      "Request arrives just before a scheduled large payment",
      "Urgency language — 'please update before tomorrow'",
      "No phone confirmation of the change",
      "New account is at a different bank than usual",
    ],
    whatCouldGoWrong: [
      "Payment is sent to a fraudster's account and is unrecoverable",
      "Supplier relationship is damaged if they are not paid",
      "Legal and compliance issues for your business",
      "Average losses in such fraud: ₹2L–₹50L per incident",
    ],
    whatToDo: [
      "Do NOT update bank details based on email alone",
      "Call the supplier on their registered phone number (not the one in the email)",
      "Confirm the change verbally with a known contact at the supplier",
      "Check previous invoices to compare account details",
      "Use Watchtower to verify the supplier's GSTIN and bank account",
      "If already paid, contact your bank immediately to recall the transfer",
    ],
    howVigilHelps: [
      "Watchtower verifies supplier GSTIN, PAN and bank account before payment",
      "Scam Checker detects urgency and impersonation language in the email",
      "Payment Risk Assessor flags unusually large payments to new recipients",
      "DealLock creates tamper-evident proof of agreed payment terms",
    ],
    relatedRiskEvents: ["UNVERIFIED_COUNTERPARTY", "HIGH_VALUE_PAYMENT", "SUSPICIOUS_MESSAGE"],
    tags: ["supplier", "bank account", "payment fraud", "BEC"],
  },
  {
    id: "case-002",
    title: "Fake Invoice Fraud",
    category: "payment",
    riskLevel: "HIGH",
    summary: "A fraudulent invoice is sent for goods or services never ordered, hoping it gets paid without scrutiny.",
    scenario: "Your accounts team receives an invoice for ₹85,000 from a company that looks familiar. The invoice number follows the normal sequence and the description is vague — 'Consulting Services Q3'. Nobody can confirm whether this was actually ordered.",
    warningSigns: [
      "Invoice for services with no corresponding purchase order",
      "Vague description of goods or services",
      "New vendor never used before",
      "Invoice amount is just below internal approval limits",
      "Follow-up emails creating urgency to pay quickly",
    ],
    whatCouldGoWrong: [
      "Payment made for goods/services never received",
      "Repeated fraudulent invoices from the same source",
      "Internal audit findings and compliance issues",
    ],
    whatToDo: [
      "Match every invoice against a purchase order before approving",
      "Verify the vendor via Watchtower before first payment",
      "Call the vendor on a known number — not the one on the invoice",
      "Implement a two-person approval process for all new vendors",
      "Flag the invoice in Scam Checker to analyze the communication",
    ],
    howVigilHelps: [
      "Watchtower checks the vendor's GSTIN and registration status",
      "Scam Checker analyzes invoice text for anomaly patterns",
      "Payment Risk Assessor flags payments to unverified recipients",
      "Case Tracker documents the incident with full evidence",
    ],
    relatedRiskEvents: ["UNVERIFIED_COUNTERPARTY", "INVOICE_ANOMALY", "HIGH_VALUE_PAYMENT"],
    tags: ["invoice", "fake vendor", "accounts payable"],
  },
  {
    id: "case-003",
    title: "Phishing Login Attack",
    category: "identity",
    riskLevel: "CRITICAL",
    summary: "An employee receives a fake login page that steals their business credentials.",
    scenario: "An employee gets an email: 'Your business banking session has expired. Click here to re-verify your account.' The link opens a page that looks identical to the bank's login page. The employee enters their credentials.",
    warningSigns: [
      "Email asks you to click a link to log in",
      "URL is slightly wrong (e.g., bankofbaroda-secure.com vs bankofbaroda.com)",
      "Creates urgency — 'account suspended', 'verify immediately'",
      "Login page looks real but the URL does not match the official domain",
      "Asks for OTP, password, or PIN on the same page",
    ],
    whatCouldGoWrong: [
      "Business banking credentials compromised",
      "Unauthorized transactions from business account",
      "Access to email and other systems if passwords are reused",
      "Identity theft and fraudulent GST filings",
    ],
    whatToDo: [
      "Never click login links in emails — go directly to the official website",
      "Check the URL carefully before entering any credentials",
      "If you entered credentials, change your password immediately",
      "Contact your bank to freeze the account if banking credentials were entered",
      "Enable two-factor authentication on all business accounts",
      "Report to Cybercrime helpline 1930",
    ],
    howVigilHelps: [
      "Scam Checker detects phishing link patterns and urgency language",
      "Risk Engine marks communication as PHISHING_ATTEMPT and updates risk index",
      "Case Tracker preserves the evidence for reporting",
    ],
    relatedRiskEvents: ["PHISHING_ATTEMPT", "SCAM_DETECTED", "SUSPICIOUS_MESSAGE"],
    tags: ["phishing", "login", "credentials", "banking"],
  },
  {
    id: "case-004",
    title: "CEO / Vendor Impersonation",
    category: "communication",
    riskLevel: "CRITICAL",
    summary: "A fraudster impersonates a senior employee or trusted vendor to authorise an urgent payment.",
    scenario: "An accounts employee receives a WhatsApp message from someone claiming to be the company director: 'I am in a meeting. Please transfer ₹3,00,000 to this account urgently for a deal. Do not tell anyone yet.' The profile photo matches the director.",
    warningSigns: [
      "Request comes via WhatsApp, SMS, or personal email rather than official channels",
      "Strong urgency and secrecy — 'do it now', 'don't tell anyone'",
      "Request bypasses normal approval processes",
      "Profile photo matches but the phone number is new or unregistered",
      "The 'director' cannot be reached on their official number",
    ],
    whatCouldGoWrong: [
      "Large unauthorized transfer to a fraudster's account",
      "No recourse once NEFT/IMPS transfer is complete",
      "Internal trust breakdown within the organization",
    ],
    whatToDo: [
      "Never transfer money based on a WhatsApp or SMS request alone",
      "Call the director on their registered office number to confirm",
      "Follow your company's standard payment authorization process — no exceptions",
      "If you have already transferred, call your bank immediately",
      "Report to Cybercrime helpline 1930",
    ],
    howVigilHelps: [
      "Scam Checker flags impersonation and urgency patterns",
      "Payment Risk Assessor flags abnormal transfer amounts",
      "DealLock ensures large deals have on-chain proof of authorization",
    ],
    relatedRiskEvents: ["SUSPICIOUS_MESSAGE", "HIGH_VALUE_PAYMENT", "SCAM_DETECTED"],
    tags: ["CEO fraud", "impersonation", "social engineering", "WhatsApp"],
  },
  {
    id: "case-005",
    title: "Fake GST / KYC Request",
    category: "identity",
    riskLevel: "HIGH",
    summary: "Fraudsters send official-looking messages claiming your GST or KYC details need urgent verification.",
    scenario: "You receive an SMS: 'Your GSTIN has been suspended due to non-compliance. Pay ₹4,999 immediately to reinstate or your business registration will be cancelled.' A link is provided to a website that looks like the GST portal.",
    warningSigns: [
      "Message claims your GST or bank account is suspended",
      "Asks for payment to restore access",
      "Link goes to a non-official domain (not gstn.gov.in)",
      "Creates extreme urgency and fear of business closure",
      "Asks for Aadhaar, PAN, or banking OTP",
    ],
    whatCouldGoWrong: [
      "Payment to fraudsters for fake 'reinstatement'",
      "Personal financial credentials stolen",
      "Aadhaar/PAN misused for fraudulent transactions",
    ],
    whatToDo: [
      "GST authorities never ask for payments via SMS or WhatsApp links",
      "Check your GST status directly at gstn.gov.in",
      "Do not click the link or enter any details",
      "Paste the message into VIGIL Scam Checker for analysis",
      "Report to Chakshu on the Sanchar Saathi portal",
    ],
    howVigilHelps: [
      "Scam Checker detects GST/Aadhaar impersonation language",
      "Watchtower verifies your own GST status independently",
      "Risk Engine flags KYC impersonation as a high-severity event",
    ],
    relatedRiskEvents: ["SUSPICIOUS_MESSAGE", "SCAM_DETECTED", "IDENTITY_UNVERIFIED"],
    tags: ["GST fraud", "KYC", "government impersonation", "SMS scam"],
  },
  {
    id: "case-006",
    title: "QR Code / UPI Payment Scam",
    category: "payment",
    riskLevel: "HIGH",
    summary: "A fraudster sends a QR code claiming it will receive a refund — but scanning it sends money instead.",
    scenario: "A customer complains about a product and the 'seller' sends a QR code saying 'Scan this to receive your ₹2,000 refund.' When scanned, the UPI app opens a payment screen to send money.",
    warningSigns: [
      "Someone sends you a QR code to 'receive' money",
      "UPI app shows a payment screen (not a collection screen) when scanned",
      "Urgency to scan quickly",
      "Refund offered by someone you don't know or didn't contact",
    ],
    whatCouldGoWrong: [
      "Money sent to fraudster instead of received",
      "Repeated scans for larger amounts",
      "Loss of trust if your business customers are targeted this way",
    ],
    whatToDo: [
      "Remember: you never scan a QR code to receive money — only to send it",
      "If a QR code opens a payment screen, close it immediately",
      "Verify refunds through your bank or official payment platform only",
      "Educate your team: a QR code to receive money does not exist in UPI",
    ],
    howVigilHelps: [
      "Scam Checker detects QR/payment fraud language patterns",
      "Payment Risk Assessor tracks unusual outgoing payment requests",
    ],
    relatedRiskEvents: ["SUSPICIOUS_MESSAGE", "HIGH_VALUE_PAYMENT"],
    tags: ["QR code", "UPI", "refund scam", "payment fraud"],
  },
  {
    id: "case-007",
    title: "Suspicious Investment Opportunity",
    category: "investment",
    riskLevel: "HIGH",
    summary: "A high-return investment scheme targets business owners with promises of guaranteed profits.",
    scenario: "You receive a message: 'Invest ₹5 lakh in our guaranteed scheme and earn 3% per month — 36% annual returns! Limited slots available. SEBI registered.' The website looks professional.",
    warningSigns: [
      "Guaranteed or assured returns (no investment is truly guaranteed)",
      "Returns significantly above fixed deposit rates (>8–10% p.a.)",
      "Pressure to invest quickly — 'limited slots'",
      "Difficulty verifying SEBI registration on the official SCORES portal",
      "Requires referrals to earn higher returns (Ponzi structure)",
    ],
    whatCouldGoWrong: [
      "Loss of principal investment — often total loss",
      "No legal recourse if the entity is unregistered",
      "Personal and business funds commingled and lost",
    ],
    whatToDo: [
      "Verify the organization on SEBI SCORES: scores.sebi.gov.in",
      "Check RBI's registered NBFC list for lending companies",
      "Use VIGIL Invest's Scheme Checker before considering any investment",
      "Never invest more than you can afford to lose in any single scheme",
      "Report suspicious schemes to SEBI at sebi.gov.in",
    ],
    howVigilHelps: [
      "VIGIL Invest Scheme Checker flags suspicious investment language",
      "Watchtower verifies the organization's registration",
      "Risk Engine adjusts deployable surplus based on current risk level",
    ],
    relatedRiskEvents: ["SUSPICIOUS_MESSAGE", "UNVERIFIED_COUNTERPARTY"],
    tags: ["investment scam", "Ponzi", "SEBI", "high returns"],
  },
  {
    id: "case-008",
    title: "Compromised Employee Account",
    category: "identity",
    riskLevel: "CRITICAL",
    summary: "An employee's business email or system credentials are stolen and used to commit fraud.",
    scenario: "Your finance manager's email was compromised after they clicked a phishing link. The attacker monitored emails for two weeks, then redirected an incoming payment of ₹8,00,000 to their own account by replying to the customer with updated payment details.",
    warningSigns: [
      "Customer reports they sent payment but you never received it",
      "Outgoing emails the employee doesn't remember sending",
      "Email filters or forwarding rules added without the employee's knowledge",
      "Login alerts from unfamiliar locations or devices",
    ],
    whatCouldGoWrong: [
      "Significant financial loss — customer paid but you were never credited",
      "Customer disputes and legal liability",
      "Reputational damage",
      "Ongoing access if the attacker is not locked out",
    ],
    whatToDo: [
      "Immediately change the compromised account's password",
      "Enable two-factor authentication on all email accounts",
      "Check email forwarding rules and filters for unauthorized changes",
      "Notify affected customers and your bank",
      "Preserve all email logs as evidence",
      "File a cybercrime report at cybercrime.gov.in",
    ],
    howVigilHelps: [
      "Case Tracker preserves evidence package for reporting",
      "Scam Checker can analyze suspicious emails for patterns",
      "Risk Engine flags identity-related events and updates the risk index",
    ],
    relatedRiskEvents: ["IDENTITY_UNVERIFIED", "SCAM_DETECTED", "CASE_OPENED"],
    tags: ["account compromise", "email fraud", "BEC", "insider"],
  },
  {
    id: "case-009",
    title: "Delayed Payment Dispute",
    category: "counterparty",
    riskLevel: "MEDIUM",
    summary: "A buyer delays payment beyond the agreed date, creating cash-flow problems for your MSME.",
    scenario: "You supplied goods worth ₹2,00,000 to a buyer on 30-day credit terms. 75 days have passed and despite multiple follow-ups, the payment has not been received. The buyer keeps promising payment 'next week'.",
    warningSigns: [
      "Payment overdue beyond agreed terms",
      "Buyer keeps deferring without clear reason",
      "No written acknowledgment of the debt",
      "Buyer avoiding direct communication",
      "Multiple invoices overdue simultaneously",
    ],
    whatCouldGoWrong: [
      "Cash-flow crisis affecting your ability to pay suppliers",
      "Goods delivered without payment — total loss if buyer defaults",
      "Missed opportunity to claim statutory interest under MSMED Act",
    ],
    whatToDo: [
      "Send a formal written demand notice with the invoice details",
      "Calculate statutory interest under the MSMED Act (3× RBI rate)",
      "File on MSME Samadhaan if the buyer is a larger enterprise: samadhaan.msme.gov.in",
      "Preserve all delivery proofs, invoices, and communication",
      "Consult a lawyer if the amount is significant",
      "Use DealLock for future deals to create blockchain-enforced payment terms",
    ],
    howVigilHelps: [
      "DealLock creates tamper-evident proof of payment terms for future deals",
      "Case Tracker manages the evidence package and tracks the case status",
      "Interest Calculator computes statutory interest under the MSMED Act",
      "Samadhaan Draft Generator prepares a complaint pre-filled with your case data",
    ],
    relatedRiskEvents: ["DEALLOCK_BREACH", "CASE_OPENED"],
    tags: ["delayed payment", "MSMED Act", "Samadhaan", "cash flow"],
  },
  {
    id: "case-010",
    title: "Counterparty Impersonation",
    category: "counterparty",
    riskLevel: "CRITICAL",
    summary: "A fraudster creates a company that closely mimics a legitimate supplier or customer to deceive you.",
    scenario: "You receive an order from 'Sharma Textiles Pvt Ltd' — a name identical to a company you have worked with. The GSTIN and bank account are slightly different but you don't notice. You supply goods worth ₹5,00,000 on credit and the payment never comes.",
    warningSigns: [
      "Company name is identical or very similar to a known counterparty",
      "GSTIN or PAN does not match previous records",
      "New bank account despite long relationship",
      "Order is unusually large for a first interaction",
      "Contact details are slightly different",
    ],
    whatCouldGoWrong: [
      "Goods delivered to fraudster with no payment",
      "Real counterparty's reputation used to deceive you",
      "Legal complexity when trying to recover goods or payment",
    ],
    whatToDo: [
      "Always verify using GSTIN — not just company name",
      "Use Watchtower to cross-check GSTIN, PAN, and bank account",
      "For large new orders, request a video call with a known contact",
      "Never rely on company name alone as the primary identifier",
      "Use DealLock for large orders to create on-chain proof of terms",
    ],
    howVigilHelps: [
      "Watchtower matches on GSTIN/PAN/bank — never company name alone",
      "Community reports in Watchtower flag known fraudulent entities",
      "DealLock creates immutable proof of the agreed counterparty",
      "Risk Engine flags unverified counterparties and raises the risk index",
    ],
    relatedRiskEvents: ["UNVERIFIED_COUNTERPARTY", "COUNTERPARTY_FULLY_VERIFIED"],
    tags: ["impersonation", "fake company", "counterparty", "GSTIN"],
  },
];

// ── Guidelines ────────────────────────────────────────────────

export const GUIDELINES: GuidelineSection[] = [
  // Cybersecurity
  {
    id: "guide-phishing",
    category: "cybersecurity",
    icon: "🎣",
    title: "Phishing",
    summary: "Fraudulent messages designed to steal your credentials or money.",
    points: [
      { heading: "What it is", detail: "Phishing is when fraudsters send fake emails, SMS or WhatsApp messages that look like they come from banks, government agencies, or trusted companies — to trick you into sharing passwords, OTPs, or making payments." },
      { heading: "How to spot it", detail: "Look for urgency ('act now'), fear ('your account is blocked'), unexpected requests for credentials, and URLs that are slightly different from the official website (e.g., sbi-secure.com instead of sbi.co.in)." },
      { heading: "What to do", detail: "Never click login links in emails. Go directly to the official website by typing the URL. If you entered credentials, change your password immediately and contact your bank." },
    ],
  },
  {
    id: "guide-bec",
    category: "cybersecurity",
    icon: "📧",
    title: "Business Email Compromise (BEC)",
    summary: "Attackers compromise or impersonate business emails to redirect payments.",
    points: [
      { heading: "What it is", detail: "BEC occurs when an attacker gains access to a business email account (or creates a lookalike address) and uses it to redirect payments, change supplier bank details, or authorise fraudulent transactions." },
      { heading: "Common patterns", detail: "Fake bank account change requests from 'suppliers', urgent payment requests from 'management', and invoice redirection. BEC causes billions in losses globally each year." },
      { heading: "Prevention", detail: "Verify all bank account changes by phone using a known number. Implement two-person approval for payments above a threshold. Enable two-factor authentication on all business emails." },
    ],
  },
  {
    id: "guide-fake-invoices",
    category: "cybersecurity",
    icon: "🧾",
    title: "Fake Invoices",
    summary: "Fraudulent invoices sent hoping they get paid without verification.",
    points: [
      { heading: "What it is", detail: "Attackers send invoices for goods or services never ordered, often from company names similar to real suppliers, hoping accounts teams will process them without checking." },
      { heading: "Red flags", detail: "Vague service descriptions, no matching purchase order, invoice amount just below approval thresholds, and follow-up pressure to pay quickly." },
      { heading: "Prevention", detail: "Match every invoice to a purchase order. Verify new vendors via GSTIN before first payment. Implement a two-step approval process for all invoices above ₹50,000." },
    ],
  },
  {
    id: "guide-payment-fraud",
    category: "cybersecurity",
    icon: "💳",
    title: "Payment Fraud",
    summary: "Fraudulent payment requests disguised as legitimate transactions.",
    points: [
      { heading: "Common types", detail: "Fake refund QR codes, advance payment fraud (pay first, receive goods never), overpayment scams, and fake payment confirmation screenshots." },
      { heading: "QR code rule", detail: "You never scan a QR code to receive money — only to send it. If someone sends you a QR code claiming it will deposit money into your account, it is a scam." },
      { heading: "Safe practices", detail: "Always confirm payment receipts through your bank app — never trust screenshots. Use NEFT/RTGS for large amounts which have built-in verification steps." },
    ],
  },
  {
    id: "guide-supplier-fraud",
    category: "cybersecurity",
    icon: "🏭",
    title: "Supplier Fraud",
    summary: "Fraudsters impersonate suppliers or create fake companies to steal payments.",
    points: [
      { heading: "What it is", detail: "Fraudsters create companies with names similar to real suppliers, send realistic-looking invoices, and intercept payments. They may also compromise real supplier email accounts to request bank detail changes." },
      { heading: "Primary defence", detail: "Always verify suppliers using GSTIN — not company name. Company names can be duplicated; GSTINs are unique and verifiable." },
      { heading: "VIGIL approach", detail: "Watchtower verifies GSTIN, PAN and bank account independently. DealLock creates blockchain proof of agreed payment terms before any money moves." },
    ],
  },
  {
    id: "guide-investment-scams",
    category: "cybersecurity",
    icon: "📈",
    title: "Investment Scams",
    summary: "Fake investment schemes targeting business owners with promises of high returns.",
    points: [
      { heading: "Warning signs", detail: "Guaranteed returns, returns above 15% per annum, pressure to invest quickly, referral bonuses, and difficulty verifying the entity on SEBI SCORES." },
      { heading: "Rule of thumb", detail: "No legitimate investment guarantees returns. If someone guarantees 2–3% per month (24–36% annually), it is almost certainly fraudulent." },
      { heading: "Verification", detail: "Check the entity on SEBI SCORES (scores.sebi.gov.in) and the RBI's list of registered NBFCs before investing any business funds." },
    ],
  },
  // Business Risk
  {
    id: "guide-counterparty",
    category: "business",
    icon: "🔍",
    title: "Counterparty Verification",
    summary: "Verify who you are dealing with before committing to any transaction.",
    points: [
      { heading: "Why it matters", detail: "Many MSME fraud losses happen because businesses rely on company names and websites without verifying underlying identity. A 2-minute GSTIN check can prevent a ₹5 lakh loss." },
      { heading: "What to verify", detail: "GSTIN (confirms GST registration and state), PAN (confirms tax identity), bank account and IFSC (confirms the account belongs to the entity). Never rely on company name alone." },
      { heading: "VIGIL Watchtower", detail: "Enter GSTIN, PAN and bank details. VIGIL produces an Evidence Checklist — not a trust score — so you can see exactly what is and isn't verified." },
    ],
  },
  {
    id: "guide-safe-payments",
    category: "business",
    icon: "💰",
    title: "Safe Payment Practices",
    summary: "Practical rules to reduce payment fraud risk for your business.",
    points: [
      { heading: "The golden rules", detail: "1. Verify before you pay. 2. Call to confirm any bank detail changes. 3. Check the payment amount against your typical outflow. 4. Never pay based on urgency alone." },
      { heading: "Payment thresholds", detail: "Define an internal threshold above which payments require two approvals. Payments above 30% of monthly outflow should always get extra scrutiny — VIGIL flags these automatically." },
      { heading: "After payment", detail: "Confirm receipt with the recipient on a known number. Keep records of all payment approvals and communications." },
    ],
  },
  {
    id: "guide-deal-protection",
    category: "business",
    icon: "🔒",
    title: "Deal Protection",
    summary: "Protect your commercial agreements with tamper-evident documentation.",
    points: [
      { heading: "The problem", detail: "Verbal and informal agreements are hard to enforce. When a counterparty claims terms were different, you need evidence — and a WhatsApp chat can be deleted." },
      { heading: "DealLock approach", detail: "DealLock creates a cryptographic hash of agreed terms and records it on a public blockchain. The timestamp and hash are permanent and cannot be altered — giving you tamper-evident proof." },
      { heading: "When to use it", detail: "Use DealLock for any B2B deal above ₹50,000, deals with new counterparties, or deals with extended payment terms. The penalty clause creates a real incentive for counterparties to honour their commitments." },
    ],
  },
  {
    id: "guide-evidence",
    category: "business",
    icon: "📁",
    title: "Evidence Preservation",
    summary: "Preserve evidence from day one — not after you realise something went wrong.",
    points: [
      { heading: "What to preserve", detail: "Original emails (with headers), WhatsApp/SMS screenshots, invoices, delivery receipts, payment records, call logs, and all relevant communication." },
      { heading: "How to preserve it", detail: "Take screenshots with timestamps. Export emails as PDF. Do not delete suspicious messages — they are evidence. Back up evidence to a separate location." },
      { heading: "Why it matters", detail: "Without evidence, cybercrime complaints are difficult to pursue. Samadhaan filings and police complaints both require documented evidence. VIGIL's Case Tracker organises evidence into a structured package." },
    ],
  },
  {
    id: "guide-incident-response",
    category: "business",
    icon: "🚨",
    title: "Incident Response",
    summary: "What to do in the first 24 hours after a suspected fraud.",
    points: [
      { heading: "Immediate steps (first 1 hour)", detail: "1. Stop any further payments to the suspicious party. 2. Contact your bank to block/recall the transaction. 3. Change compromised passwords immediately. 4. Preserve all evidence." },
      { heading: "Next 24 hours", detail: "File a complaint at cybercrime.gov.in or call 1930. For payment fraud, file with your bank's fraud team. Collect all evidence into a case package." },
      { heading: "Escalation channels", detail: "Cybercrime: 1930 / cybercrime.gov.in. Telecom fraud: Chakshu (sancharsaathi.gov.in). MSME payment disputes: samadhaan.msme.gov.in. Suspicious investment schemes: SEBI SCORES." },
    ],
  },
  // Financial Safety
  {
    id: "guide-working-capital",
    category: "financial",
    icon: "⚖️",
    title: "Working Capital",
    summary: "The cash your business needs to run its day-to-day operations.",
    points: [
      { heading: "What it is", detail: "Working capital is the money needed to pay salaries, suppliers, rent and other operating costs. If your working capital runs out, your business cannot operate — even if it is profitable on paper." },
      { heading: "Why it matters for risk", detail: "Fraud losses directly reduce working capital. A ₹5 lakh fraud loss can disrupt an MSME that operates on thin margins. This is why cyber risk directly affects financial health." },
      { heading: "Rule of thumb", detail: "Keep at least 2 months of operating expenses as a working-capital buffer. VIGIL Invest uses your working-capital buffer in the surplus calculation." },
    ],
  },
  {
    id: "guide-liquidity",
    category: "financial",
    icon: "💧",
    title: "Liquidity Buffers",
    summary: "Cash you can access quickly in an emergency.",
    points: [
      { heading: "What it is", detail: "A liquidity buffer is cash or near-cash assets you can access within days — not weeks. It covers unexpected costs, delayed customer payments, or emergency expenses." },
      { heading: "Recommended level", detail: "MSMEs should maintain 1–3 months of expenses as a liquid buffer, separate from operating working capital. This is distinct from long-term investments." },
      { heading: "VIGIL approach", detail: "VIGIL Invest deducts working capital and obligations before calculating deployable surplus — so you never deploy funds you actually need for operations." },
    ],
  },
  {
    id: "guide-risk-reserves",
    category: "financial",
    icon: "🛡️",
    title: "Cyber-Risk Reserves",
    summary: "Extra cash held back when your business faces elevated cyber risk.",
    points: [
      { heading: "Why it exists", detail: "When your VIGIL Cyber Risk Index is elevated, there is a higher probability of an active threat — meaning you may need emergency funds sooner than expected." },
      { heading: "How VIGIL calculates it", detail: "LOW risk: 5% of surplus reserved. MEDIUM: 15%. HIGH: 30%. CRITICAL: 50%. The reserve is deducted before calculating what you can safely deploy." },
      { heading: "It is not permanent", detail: "As your risk index improves (through verification, DealLock activation, case resolution), the reserve requirement decreases and more surplus becomes deployable." },
    ],
  },
  {
    id: "guide-investment-basics",
    category: "financial",
    icon: "🏦",
    title: "Investment Basics for MSMEs",
    summary: "Simple principles for deploying business surplus safely.",
    points: [
      { heading: "Liquidity first", detail: "Business surplus should prioritise liquidity over returns. Unlike personal savings, business funds may be needed on short notice. Liquid funds and short-duration instruments are generally more appropriate than long-term equity investments for business surplus." },
      { heading: "Regulatory note", detail: "VIGIL Invest provides educational guidance only — not regulated investment advice. For personalised investment decisions, consult a SEBI-registered investment adviser." },
      { heading: "VIGIL's role", detail: "VIGIL connects your current cyber-risk exposure with your available surplus. Higher risk = higher reserve = less to deploy. Lower risk = more surplus available for deployment." },
    ],
  },
];

// ── Action Cards ──────────────────────────────────────────────

export const ACTION_CARDS: ActionCard[] = [
  {
    triggerEvent: "SUSPICIOUS_MESSAGE",
    title: "Suspicious Message Detected",
    why: [
      "Message contains urgency or pressure tactics",
      "Contains patterns associated with phishing or scams",
      "Requests sensitive information or immediate payment",
    ],
    steps: [
      "Do not click any links in the message",
      "Do not share OTP, password, PIN or bank details",
      "Paste the message into VIGIL Scam Checker for full analysis",
      "Verify the sender through an independent official channel",
      "If you have already shared information, contact your bank immediately",
    ],
    preserveEvidence: ["Screenshot the message", "Note the sender's number/email", "Save any links (do not click them)"],
    escalateTo: "Cybercrime helpline 1930 if credentials were compromised",
  },
  {
    triggerEvent: "HIGH_VALUE_PAYMENT",
    title: "High-Value Payment Flagged",
    why: [
      "Payment is a significant proportion of your monthly outflow",
      "Large payments to unverified or new recipients carry elevated risk",
      "Fraudsters often target large payment events",
    ],
    steps: [
      "Pause the payment before authorising",
      "Verify the recipient using Watchtower (GSTIN + bank account)",
      "Confirm the invoice matches a real purchase order",
      "Call the recipient on a registered number to confirm",
      "Ensure a second approver has reviewed the payment",
    ],
    preserveEvidence: ["Invoice copy", "Purchase order", "Bank account details provided by recipient", "Email/communication thread"],
  },
  {
    triggerEvent: "SCAM_DETECTED",
    title: "Scam Communication Confirmed",
    why: [
      "Multiple high-confidence scam signals detected",
      "Pattern matches known fraud types targeting Indian MSMEs",
      "AI analysis confirms suspicious intent",
    ],
    steps: [
      "Do not respond to the communication",
      "Do not make any payment",
      "Block the sender",
      "Preserve the evidence (screenshot + metadata)",
      "Report to Chakshu if it is a telecom-based scam",
      "File a cybercrime complaint at cybercrime.gov.in",
    ],
    preserveEvidence: ["Full message screenshot", "Sender's phone number or email", "Any links mentioned (do not click)"],
    escalateTo: "Cybercrime.gov.in / 1930. Chakshu (sancharsaathi.gov.in) for SMS/call scams",
  },
  {
    triggerEvent: "UNVERIFIED_COUNTERPARTY",
    title: "Counterparty Not Verified",
    why: [
      "Counterparty identity could not be fully confirmed",
      "Unverified counterparties carry higher fraud risk",
      "Community reports or failed checks were detected",
    ],
    steps: [
      "Do not make any payment until verification is complete",
      "Run a full Watchtower check with GSTIN, PAN and bank details",
      "Call the counterparty on a number obtained independently",
      "Ask for a signed invoice with GSTIN on official letterhead",
      "Consider a small test transaction before large payments",
    ],
  },
  {
    triggerEvent: "DEALLOCK_BREACH",
    title: "DealLock Breach Detected",
    why: [
      "Counterparty has not fulfilled agreed deal terms",
      "Payment deadline has been missed",
      "Blockchain proof of terms has been recorded",
    ],
    steps: [
      "Document the breach with timestamps",
      "Send a formal written notice to the counterparty",
      "Calculate statutory interest using the VIGIL Interest Calculator",
      "Open a Case in VIGIL Case Tracker",
      "Generate a Samadhaan complaint draft if the counterparty is a larger enterprise",
    ],
    preserveEvidence: ["DealLock terms hash", "Blockchain transaction proof", "Invoice", "Delivery confirmation", "Communication thread"],
    escalateTo: "MSME Samadhaan: samadhaan.msme.gov.in",
  },
  {
    triggerEvent: "PHISHING_ATTEMPT",
    title: "Phishing Attempt Detected",
    why: [
      "Message contains a suspicious link or login request",
      "Sender is impersonating a trusted organization",
      "Credential harvesting patterns detected",
    ],
    steps: [
      "Do not click the link",
      "Do not enter any credentials on the linked page",
      "If you already entered credentials — change your password immediately",
      "Enable two-factor authentication on the affected account",
      "Report to your bank if banking credentials were entered",
    ],
    preserveEvidence: ["Screenshot with URL visible", "Email headers if applicable", "Timestamp of the message"],
    escalateTo: "Bank fraud team immediately if banking credentials were entered. Cybercrime 1930.",
  },
];

// ── Helpers ───────────────────────────────────────────────────

export function getCasesByCategory(category: LearnCase["category"]) {
  return CASES.filter((c) => c.category === category);
}

export function getCasesByRiskLevel(level: LearnCase["riskLevel"]) {
  return CASES.filter((c) => c.riskLevel === level);
}

export function getRelatedCases(riskEventType: string): LearnCase[] {
  return CASES.filter((c) => c.relatedRiskEvents.includes(riskEventType));
}

export function getActionCard(riskEventType: string): ActionCard | undefined {
  return ACTION_CARDS.find((a) => a.triggerEvent === riskEventType);
}

export function getGuidelinesByCategory(category: GuidelineSection["category"]) {
  return GUIDELINES.filter((g) => g.category === category);
}
