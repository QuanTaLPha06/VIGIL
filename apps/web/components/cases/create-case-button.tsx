"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, AlertCircle } from "lucide-react";
import { addDocument, COLLECTIONS } from "@/lib/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import type { CaseType } from "@vigil/types";

const CASE_TYPES: { value: CaseType; label: string; description: string }[] = [
  {
    value: "SCAM",
    label: "Scam",
    description: "Fraudulent message, fake invoice or phishing attempt",
  },
  {
    value: "SUSPICIOUS_PAYMENT",
    label: "Suspicious Payment",
    description: "Unusual or unexplained payment request",
  },
  {
    value: "DELAYED_PAYMENT",
    label: "Delayed Payment",
    description: "Overdue payment from a counterparty (MSMED Act)",
  },
  {
    value: "DEALLOCK_BREACH",
    label: "DealLock Breach",
    description: "Counterparty breached a DealLock-protected agreement",
  },
  {
    value: "COUNTERPARTY_DISPUTE",
    label: "Counterparty Dispute",
    description: "General dispute with a business counterparty",
  },
];

export function CreateCaseButton() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    type: "" as CaseType | "",
    description: "",
    amount: "",
    dueDate: "",
    counterparty: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.type) {
      setError("Please select a case type.");
      return;
    }
    if (!form.description.trim()) {
      setError("Please add a description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const caseId = await addDocument(COLLECTIONS.CASES, {
        companyId: user.uid,
        type: form.type,
        status: "OPEN",
        description: form.description.trim(),
        amount: form.amount ? parseFloat(form.amount) : null,
        dueDate: form.dueDate || null,
        counterparty: form.counterparty.trim() || null,
        daysOverdue: form.dueDate
          ? Math.max(
              0,
              Math.floor(
                (Date.now() - new Date(form.dueDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            )
          : 0,
        evidence: [],
      });

      setOpen(false);
      setForm({ type: "", description: "", amount: "", dueDate: "", counterparty: "" });
      router.push(`/cases/${caseId}`);
    } catch {
      setError("Failed to create case. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        New Case
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Case</DialogTitle>
            <DialogDescription>
              Track a fraud event, dispute or delayed payment with a full evidence package.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Case type */}
            <div className="space-y-2">
              <Label>Case type</Label>
              <div className="grid grid-cols-1 gap-2">
                {CASE_TYPES.map((ct) => (
                  <label
                    key={ct.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.type === ct.value
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="caseType"
                      value={ct.value}
                      checked={form.type === ct.value}
                      onChange={() => setForm({ ...form, type: ct.value as CaseType })}
                      className="mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium">{ct.label}</p>
                      <p className="text-xs text-muted-foreground">{ct.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="Briefly describe what happened..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            {/* Amount + due date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) — optional</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="200000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due date — optional</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>

            {/* Counterparty */}
            <div className="space-y-2">
              <Label htmlFor="counterparty">Counterparty — optional</Label>
              <Input
                id="counterparty"
                placeholder="Company or person name"
                value={form.counterparty}
                onChange={(e) => setForm({ ...form, counterparty: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Case"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
