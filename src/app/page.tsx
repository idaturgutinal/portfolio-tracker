import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  PieChart,
  Bell,
  Eye,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Multi-Asset Tracking",
    description:
      "Stocks, ETFs, crypto, bonds and more — all in one unified dashboard.",
  },
  {
    icon: PieChart,
    title: "Real-Time Analytics",
    description:
      "Interactive charts for performance, allocation, and P&L breakdown.",
  },
  {
    icon: Bell,
    title: "Price Alerts",
    description:
      "Set target prices and get notified when your assets hit key levels.",
  },
  {
    icon: Eye,
    title: "Watchlist",
    description:
      "Track securities you're interested in before committing capital.",
  },
];

export default async function Home() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient + dot-grid background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative container mx-auto px-4 py-32 md:py-44 flex flex-col items-center text-center">
          {/* Logo pill */}
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur px-4 py-1.5 mb-6 text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-primary" />
            FolioVault
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-2xl">
            Your investments, one clear view.
          </h1>

          <p className="mt-4 text-lg text-muted-foreground max-w-lg">
            Track stocks, ETFs, crypto, and more across all your portfolios
            with real-time analytics, price alerts, and beautiful charts.
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

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border bg-card p-6 space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>FolioVault</span>
        </div>
      </footer>
    </main>
  );
}
