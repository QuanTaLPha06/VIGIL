/**
 * DealLock blockchain integration.
 * Uses viem to interact with the DealLock contract on Base Sepolia testnet.
 */

import { createWalletClient, createPublicClient, custom, http, parseEther } from "viem";
import { baseSepolia } from "viem/chains";

// ABI — generated after `pnpm blockchain:compile`
// Import from blockchain package once compiled:
// import { DEALLOCK_ABI } from "@vigil/deallock-abi";
// Minimal inline ABI for the key functions:
export const DEALLOCK_ABI = [
  {
    inputs: [
      { name: "_seller", type: "address" },
      { name: "_amount", type: "uint256" },
      { name: "_termsHash", type: "bytes32" },
      { name: "_paymentDeadline", type: "uint256" },
      { name: "_penaltyPercent", type: "uint256" },
    ],
    name: "createDeal",
    outputs: [{ name: "dealId", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "_dealId", type: "uint256" }],
    name: "confirmDeal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_dealId", type: "uint256" }],
    name: "reportBreach",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_dealId", type: "uint256" }],
    name: "getDeal",
    outputs: [
      { name: "buyer", type: "address" },
      { name: "seller", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "termsHash", type: "bytes32" },
      { name: "paymentDeadline", type: "uint256" },
      { name: "penaltyPercent", type: "uint256" },
      { name: "state", type: "uint8" },
      { name: "createdAt", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const DEALLOCK_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_DEALLOCK_CONTRACT_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

// Public client for read operations (no wallet needed)
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(
    process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ||
      "https://sepolia.base.org"
  ),
});

// Connect MetaMask wallet
export const connectWallet = async (): Promise<`0x${string}`> => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed. Please install MetaMask to use DealLock.");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return accounts[0] as `0x${string}`;
};

// Get wallet client (requires MetaMask)
export const getWalletClient = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");

  return createWalletClient({
    chain: baseSepolia,
    transport: custom(window.ethereum),
  });
};

// Hash deal terms deterministically
export const hashDealTerms = async (terms: {
  dealId: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  currency: string;
  deliveryDate: string;
  paymentDeadline: string;
  penaltyPercent: number;
  description: string;
}): Promise<`0x${string}`> => {
  const canonical = JSON.stringify(terms, Object.keys(terms).sort());
  const encoder = new TextEncoder();
  const data = encoder.encode(canonical);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `0x${hashHex}` as `0x${string}`;
};

// Create a deal on-chain
export const createDealOnChain = async (params: {
  sellerAddress: `0x${string}`;
  amount: string; // in ETH (Base Sepolia uses ETH)
  termsHash: `0x${string}`;
  paymentDeadlineTimestamp: number;
  penaltyPercent: number;
}) => {
  const walletClient = await getWalletClient();
  const [account] = await walletClient.getAddresses();

  const hash = await walletClient.writeContract({
    address: DEALLOCK_CONTRACT_ADDRESS,
    abi: DEALLOCK_ABI,
    functionName: "createDeal",
    args: [
      params.sellerAddress,
      parseEther(params.amount),
      params.termsHash as `0x${string}`,
      BigInt(params.paymentDeadlineTimestamp),
      BigInt(params.penaltyPercent),
    ],
    value: parseEther(params.amount),
    account,
  });

  return hash;
};

// Read deal from chain
export const getDealFromChain = async (dealId: bigint) => {
  return publicClient.readContract({
    address: DEALLOCK_CONTRACT_ADDRESS,
    abi: DEALLOCK_ABI,
    functionName: "getDeal",
    args: [dealId],
  });
};

// Get Base Sepolia explorer URL for a transaction
export const getExplorerUrl = (txHash: string) =>
  `https://sepolia.basescan.org/tx/${txHash}`;

// Declare ethereum on window
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown[]>;
    };
  }
}
