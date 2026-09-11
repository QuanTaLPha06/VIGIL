/**
 * DealLock blockchain integration.
 * Uses viem to interact with the DealLock contract on Polygon Amoy testnet.
 */

import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  parseEther,
  type PublicClient,
  type Transport,
  type WalletClient,
} from "viem";
import { polygonAmoy } from "viem/chains";

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
export const publicClient: PublicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(
    process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC_URL ||
      "https://rpc-amoy.polygon.technology"
  ),
});

const AMOY_CHAIN_ID = `0x${polygonAmoy.id.toString(16)}`;

const getInjectedProvider = (): InjectedProvider => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error(
      "No compatible wallet found. Install Coinbase Wallet, Rabby, Brave Wallet, or another EIP-1193 wallet."
    );
  }
  return window.ethereum;
};

const ensurePolygonAmoy = async (provider: InjectedProvider) => {
  const chainId = await provider.request({ method: "eth_chainId" });
  if (String(chainId).toLowerCase() === AMOY_CHAIN_ID) return;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: AMOY_CHAIN_ID }],
    });
  } catch (error) {
    if ((error as { code?: number }).code !== 4902) throw error;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: AMOY_CHAIN_ID,
        chainName: "Polygon Amoy",
        nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
        rpcUrls: ["https://rpc-amoy.polygon.technology"],
        blockExplorerUrls: ["https://amoy.polygonscan.com"],
      }],
    });
  }
};

// Connect any browser wallet that implements the EIP-1193 provider interface.
export const connectWallet = async (): Promise<`0x${string}`> => {
  const provider = getInjectedProvider();
  await ensurePolygonAmoy(provider);
  const accounts = await provider.request({
    method: "eth_requestAccounts",
  });

  const address = (accounts as string[])[0];
  if (!address) throw new Error("The wallet did not return an account.");
  return address as `0x${string}`;
};

// Get a wallet client from any injected EIP-1193 wallet.
type DealLockWalletClient = WalletClient<Transport, typeof polygonAmoy>;

export const getWalletClient = async (): Promise<DealLockWalletClient> => {
  const provider = getInjectedProvider();
  await ensurePolygonAmoy(provider);

  return createWalletClient({
    chain: polygonAmoy,
    transport: custom(provider),
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
  amount: string; // in POL (Polygon Amoy)
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

// Get Polygon Amoy explorer URL for a transaction
export const getExplorerUrl = (txHash: string) =>
  `https://amoy.polygonscan.com/tx/${txHash}`;

type InjectedProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: InjectedProvider;
  }
}
