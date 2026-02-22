"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Wallet, ArrowLeftRight, Bell, Settings, LogOut } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/assets", label: "Assets", icon: Wallet },
  { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b sticky top-0 z-40 bg-background">
      <div className="container flex h-14 items-center gap-6">
        <span className="font-semibold text-sm tracking-tight">FolioVault</span>

        <nav className="flex items-center gap-1 flex-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  active
                    ? "text-foreground bg-accent font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">{userName}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
