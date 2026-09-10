"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MessageSquareWarning,
  CreditCard,
  Lock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const actions = [
  {
    href: "/watchtower",
    label: "Verify a company",
    description: "Check GSTIN / PAN / Bank",
    icon: Building2,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    href: "/scam-checker",
    label: "Check a message",
    description: "Analyze suspicious content",
    icon: MessageSquareWarning,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    href: "/payments",
    label: "Assess a payment",
    description: "Single-payment risk check",
    icon: CreditCard,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    href: "/deallock",
    label: "Create a DealLock",
    description: "Protect a B2B deal on-chain",
    icon: Lock,
    color: "text-green-600",
    bg: "bg-green-50",
  },
];

export function QuickActions() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((a) => (
            <Link key={a.href} href={a.href}>
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer group">
                <div className={`p-2 rounded-md ${a.bg}`}>
                  <a.icon className={`h-4 w-4 ${a.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
