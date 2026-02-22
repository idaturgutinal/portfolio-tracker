import {
  FolderOpen,
  TrendingUp,
  ArrowLeftRight,
  Bell,
  Eye,
  BarChart2,
} from "lucide-react";

export interface GuideStep {
  icon: React.ElementType;
  color: string;       // Tailwind bg color for the icon badge
  title: string;
  body: string;
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    icon: FolderOpen,
    color: "bg-blue-100 text-blue-600",
    title: "Create a Portfolio",
    body: 'Go to Assets → Add Asset → "+ Create new portfolio". Give it a name (e.g. "Main", "ISA", "Crypto") — you can have as many as you like.',
  },
  {
    icon: TrendingUp,
    color: "bg-violet-100 text-violet-600",
    title: "Add Your Holdings",
    body: "Search any stock, crypto, ETF or fund by symbol (AAPL, BTC, SPY…). Enter the quantity you currently hold and your average buy price.",
  },
  {
    icon: ArrowLeftRight,
    color: "bg-amber-100 text-amber-600",
    title: "Log Transactions",
    body: "Use the Transactions page to record every BUY, SELL or DIVIDEND. Quantities and average buy prices are recalculated automatically.",
  },
  {
    icon: Bell,
    color: "bg-red-100 text-red-600",
    title: "Set Price Alerts",
    body: "In Alerts, choose an asset and a target price (above or below). The alert fires the next time you visit the dashboard — no refresh needed.",
  },
  {
    icon: Eye,
    color: "bg-teal-100 text-teal-600",
    title: "Use the Watchlist",
    body: "Track tickers you are researching without committing capital. The Watchlist shows live prices and daily change for every symbol you add.",
  },
  {
    icon: BarChart2,
    color: "bg-orange-100 text-orange-600",
    title: "Analyse Performance",
    body: "The Dashboard shows a portfolio overview. Analytics goes deeper: P&L bar chart, allocation pie, a sortable asset-breakdown table and full return history.",
  },
];
