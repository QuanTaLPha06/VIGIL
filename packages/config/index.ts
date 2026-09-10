export const APP_CONFIG = {
  name: "VIGIL",
  tagline: "Cyber Risk Intelligence for MSMEs",
  version: "0.1.0",
  defaultLocale: "en-IN",
  currency: "INR",
  blockchain: {
    network: "polygon-amoy",
    chainId: 80002,
    explorerUrl: "https://amoy.polygonscan.com",
    rpcUrl: "https://rpc-amoy.polygon.technology",
  },
  rbi: {
    defaultBankRate: 6.5,
  },
  msmed: {
    delayThresholdDays: 45,
  },
} as const;
