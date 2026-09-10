export const APP_CONFIG = {
  name: "VIGIL",
  tagline: "Cyber Risk Intelligence for MSMEs",
  version: "0.1.0",
  defaultLocale: "en-IN",
  currency: "INR",
  blockchain: {
    network: "base-sepolia",
    chainId: 84532,
    explorerUrl: "https://sepolia.basescan.org",
    rpcUrl: "https://sepolia.base.org",
  },
  rbi: {
    defaultBankRate: 6.5,
  },
  msmed: {
    delayThresholdDays: 45,
  },
} as const;
