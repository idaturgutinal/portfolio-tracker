"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Eye,
  BarChart2,
  Bell,
  Settings,
  LifeBuoy,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { SymbolSearch } from "@/components/symbol-search";
import { FolioVaultLogo } from "@/components/folio-vault-logo";

const MAIN_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/assets", label: "Assets", icon: Wallet },
  { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Eye },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
];

const BOTTOM_NAV = [
  { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface Props {
  userName: string;
  userEmail?: string;
}

export function SidebarNav({ userName, userEmail }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    return href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);
  }

  const navLinkClass = (href: string) =>
    cn(
      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors transition-shadow",
      isActive(href)
        ? "bg-accent text-accent-foreground shadow-sm border border-border/50"
        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
    );

  const SidebarContent = () => (
    <aside className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 h-14 px-4 border-b shrink-0">
        <div className="flex items-center gap-2.5 rounded-full bg-muted/80 px-3.5 py-2 shadow-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
            <FolioVaultLogo size={16} className="text-primary" />
          </div>
          <span className="font-bold text-sm tracking-tight">FolioVault</span>
        </div>
      </div>

      {/* Symbol search */}
      <SymbolSearch />

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {MAIN_NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={navLinkClass(href)}>
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom nav + user */}
      <div className="border-t px-3 py-4 space-y-1 shrink-0">
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={navLinkClass(href)}>
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}

        <div className="pt-3 mt-1 border-t">
          <div className="px-3 py-2">
            <p className="text-sm font-medium truncate">{userName}</p>
            {userEmail && (
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </Button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 border-b bg-background flex items-center px-4 md:hidden">
        <button
          onClick={() => setOpen((o) => !o)}
          className="mr-3 p-1.5 rounded-md hover:bg-accent transition-colors"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="flex items-center gap-2.5 rounded-full bg-muted/80 px-3.5 py-2 shadow-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
            <FolioVaultLogo size={16} className="text-primary" />
          </div>
          <span className="font-bold text-sm tracking-tight">FolioVault</span>
        </div>
      </header>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-background to-muted/30 border-r transition-transform duration-200",
          "md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <SidebarContent />
      </div>
    </>
  );
}
