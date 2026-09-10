"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/risk/risk-badge";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="h-14 border-b bg-card px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        {/* Live risk badge — subscribes to Firestore */}
        <RiskBadge />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 text-sm">
          <div className="h-7 w-7 rounded-full bg-vigil-100 flex items-center justify-center">
            <User className="h-4 w-4 text-vigil-600" />
          </div>
          <span className="text-muted-foreground hidden sm:block">
            {user?.displayName || user?.email?.split("@")[0] || "User"}
          </span>
        </div>
      </div>
    </header>
  );
}
