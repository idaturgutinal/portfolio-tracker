import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Globe,
  SquareTerminal,
  BarChart3,
  Bell,
  ArrowLeftRight,
  Shield,
  ArrowRight,
} from "lucide-react";
import { FolioVaultLogo } from "@/components/folio-vault-logo";

const FEATURES = [
  {
    icon: Globe,
    title: "Multi-Currency Support",
    description:
      "Assets tracked in native currency with automatic exchange detection and live FX conversion.",
  },
  {
    icon: SquareTerminal,
    title: "Binance Trading",
    description:
      "Connect your API keys. View balances, place orders, and monitor trades without leaving the app.",
  },
  {
    icon: BarChart3,
    title: "Analytics & P&L",
    description:
      "Performance charts, allocation breakdown, top movers, and detailed profit & loss tracking.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description:
      "Set price targets for any asset. Get notified when your portfolio or Binance pairs hit key levels.",
  },
  {
    icon: ArrowLeftRight,
    title: "Transactions & Dividends",
    description:
      "Full transaction history with automatic cost basis calculation and dividend tracking.",
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description:
      "End-to-end encrypted API keys, bcrypt passwords, rate limiting, and security headers.",
  },
];

const STATS = [
  "6+ Asset Types",
  "9 Currencies",
  "Real-Time Data",
  "Binance Integration",
];

export default async function Home() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

        <div className="relative container mx-auto px-4 py-32 md:py-44 flex flex-col items-center text-center">
          {/* Logo pill */}
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur px-4 py-1.5 mb-6 text-sm font-medium">
            <FolioVaultLogo size={16} className="text-primary" />
            FolioVault
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-2xl">
            Track, analyze &amp; trade — all in one place.
          </h1>

          <p className="mt-4 text-lg text-muted-foreground max-w-xl">
            Multi-currency portfolio tracking, Binance trading, real-time
            analytics, and smart alerts. Built for serious investors.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button size="lg" asChild>
              <Link href="/signup">
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {STATS.map((stat) => (
              <p
                key={stat}
                className="text-sm font-medium text-muted-foreground"
              >
                {stat}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-12">
          Everything you need to manage your portfolio
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border bg-card p-6 space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FolioVaultLogo size={16} className="text-primary" />
            <span>&copy; 2026 FolioVault. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/disclaimer" className="hover:text-foreground transition-colors">
              Disclaimer
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
