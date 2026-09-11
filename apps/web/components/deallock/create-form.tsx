"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ExternalLink, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import {
  connectWallet,
  createDealOnChain,
  hashDealTerms,
  getExplorerUrl,
} from "@/lib/blockchain";
import { addDocument, COLLECTIONS } from "@/lib/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { formatINR, truncateAddress } from "@/lib/utils";

interface DealForm {
  sellerName: string;
  sellerAddress: string;
  amount: string;
  description: string;
  paymentDeadline: string;
  penaltyPercent: string;
}

type Step = "FORM" | "CONNECTING" | "HASHING" | "SIGNING" | "CONFIRMED";

export function DealLockCreateForm() {
  const { user } = useAuth();
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [form, setForm] = useState<DealForm>({
    sellerName: "",
    sellerAddress: "",
    amount: "",
    description: "",
    paymentDeadline: "",
    penaltyPercent: "10",
  });
  const [step, setStep] = useState<Step>("FORM");
  const [txHash, setTxHash] = useState("");
  const [termsHash, setTermsHash] = useState("");
  const [error, setError] = useState("");

  // Pre-flight: detect wallet on mount
  useEffect(() => {
    setHasWallet(typeof window !== "undefined" && !!window.ethereum);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStep("CONNECTING");

    try {
      const walletAddress = await connectWallet();
      setStep("HASHING");

      // Generate canonical terms hash
      const dealId = `DEAL-${Date.now()}`;
      const hash = await hashDealTerms({
        dealId,
        buyerName: user?.displayName || "Unknown",
        sellerName: form.sellerName,
        amount: parseFloat(form.amount),
        currency: "POL",
        deliveryDate: form.paymentDeadline,
        paymentDeadline: form.paymentDeadline,
        penaltyPercent: parseFloat(form.penaltyPercent),
        description: form.description,
      });
      setTermsHash(hash);
      setStep("SIGNING");

      // Write to blockchain
      const deadline = Math.floor(new Date(form.paymentDeadline).getTime() / 1000);
      const txHashResult = await createDealOnChain({
        sellerAddress: form.sellerAddress as `0x${string}`,
        amount: form.amount,
        termsHash: hash,
        paymentDeadlineTimestamp: deadline,
        penaltyPercent: parseInt(form.penaltyPercent),
      });
      setTxHash(txHashResult);

      // Save to Firestore
      await addDocument(COLLECTIONS.DEALS, {
        buyerId: user?.uid,
        buyerName: user?.displayName,
        sellerName: form.sellerName,
        sellerAddress: form.sellerAddress,
        amount: parseFloat(form.amount),
        description: form.description,
        paymentDeadline: form.paymentDeadline,
        penaltyPercent: parseInt(form.penaltyPercent),
        termsHash: hash,
        blockchainTxHash: txHashResult,
        status: "LOCKED",
        network: "polygon-amoy",
      });

      setStep("CONFIRMED");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed. Please try again.");
      setStep("FORM");
    }
  };

  if (step === "CONFIRMED") {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-4">
          <CheckCircle className="h-14 w-14 text-green-500 mx-auto" />
          <div>
            <h3 className="font-bold text-lg">DealLock Created</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your deal is protected on Base Sepolia
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4 text-left space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Terms Hash</p>
              <p className="font-mono text-xs break-all">{termsHash}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Transaction</p>
              <p className="font-mono text-xs break-all">{txHash}</p>
            </div>
          </div>
          <a
            href={getExplorerUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View on Basescan <ExternalLink className="h-3 w-3" />
          </a>
          <Button variant="outline" className="w-full" onClick={() => setStep("FORM")}>
            Create another deal
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isProcessing = step !== "FORM";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Create DealLock</CardTitle>
        <CardDescription>
          Terms are hashed and written to Polygon Amoy. Tamper-evident proof is permanent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Wallet pre-flight warning */}
        {hasWallet === false && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg mb-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">No wallet detected</p>
              <p className="text-xs mt-0.5">
                DealLock requires a browser wallet (MetaMask, Coinbase Wallet, Rabby, etc.).
                Install one and refresh the page to use this feature.
              </p>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">
              {step === "CONNECTING" && "Connecting wallet..."}
              {step === "HASHING" && "Hashing deal terms..."}
              {step === "SIGNING" && "Writing to blockchain..."}
            </p>
            {step === "HASHING" && (
              <p className="text-xs text-muted-foreground text-center">
                Generating SHA-256 hash of canonical terms JSON
              </p>
            )}
          </div>
        )}

        {!isProcessing && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Seller name</Label>
              <Input
                placeholder="Company / person name"
                value={form.sellerName}
                onChange={(e) => setForm({ ...form, sellerName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Seller wallet address</Label>
              <Input
                placeholder="0x..."
                value={form.sellerAddress}
                onChange={(e) => setForm({ ...form, sellerAddress: e.target.value })}
                required
                pattern="^0x[a-fA-F0-9]{40}$"
                title="Valid Ethereum address (0x...)"
              />
            </div>
            <div className="space-y-2">
              <Label>Deal amount (POL)</Label>
              <Input
                type="number"
                placeholder="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                min="0.001"
                step="0.001"
              />
              <p className="text-xs text-muted-foreground">
                Testnet only — use free Amoy POL
              </p>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="e.g. Supply of 100 units by Aug 31"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Payment deadline</Label>
                <Input
                  type="date"
                  value={form.paymentDeadline}
                  onChange={(e) => setForm({ ...form, paymentDeadline: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Penalty %</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={form.penaltyPercent}
                  onChange={(e) => setForm({ ...form, penaltyPercent: e.target.value })}
                  required
                  min="1"
                  max="50"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={hasWallet === false}>
              <Lock className="h-4 w-4 mr-2" />
              {hasWallet === false ? "Wallet required" : "Create DealLock"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
