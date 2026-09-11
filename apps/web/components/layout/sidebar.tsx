"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Building2,
  MessageSquareWarning,
  CreditCard,
  Lock,
  FolderOpen,
  TrendingUp,
  Settings,
  LogOut,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Risk overview",
  },
  {
    href: "/watchtower",
    label: "Watchtower",
    icon: Building2,
    description: "Verify counterparties",
  },
  {
    href: "/scam-checker",
    label: "Scam Checker",
    icon: MessageSquareWarning,
    description: "Analyze suspicious content",
  },
  {
    href: "/payments",
    label: "Payment Risk",
    icon: CreditCard,
    description: "Assess payment risk",
  },
  {
    href: "/deallock",
    label: "DealLock",
    icon: Lock,
    description: "Blockchain deal protection",
  },
  {
    href: "/cases",
    label: "Cases",
    icon: FolderOpen,
    description: "Track fraud cases",
  },
  {
    href: "/invest",
    label: "VIGIL Invest",
    icon: TrendingUp,
    description: "Capital allocation guidance",
  },
  {
    href: "/learn",
    label: "Learn & Respond",
    icon: BookOpen,
    description: "Cases, guides & action steps",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-card border-r flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-vigil-500" />
          <div>
            <span className="text-xl font-bold text-vigil-900">VIGIL</span>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
              Cyber Risk Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group",
                isActive
                  ? "bg-vigil-100 text-vigil-700 font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-vigil-600" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
            pathname === "/settings"
              ? "bg-vigil-100 text-vigil-700 font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
