import {
  FolderOpen,
  TrendingUp,
  ArrowLeftRight,
  LineChart,
  Bell,
  Eye,
  BarChart2,
  Download,
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
    title: "Create Portfolios",
    body: "Go to Assets → Add Asset → '+ Create new portfolio'. Organize by strategy — Main, Crypto, ISA — as many as you like.",
  },
  {
    icon: TrendingUp,
    color: "bg-violet-100 text-violet-600",
    title: "Track Any Asset",
    body: "Add stocks, crypto, ETFs, or funds by symbol. Enter your holdings and average buy price for instant portfolio valuation.",
  },
  {
    icon: ArrowLeftRight,
    color: "bg-amber-100 text-amber-600",
    title: "Log Transactions",
    body: "Record every BUY, SELL, or DIVIDEND on the Transactions page. Quantities and averages update automatically.",
  },
  {
    icon: LineChart,
    color: "bg-green-100 text-green-600",
    title: "Binance Trading Terminal",
    body: "Connect your Binance API key in Settings to view real balances, place orders, and track trades — all from within FolioVault.",
  },
  {
    icon: Bell,
    color: "bg-red-100 text-red-600",
    title: "Set Price Alerts",
    body: "Choose any asset, set a target price (above or below), and get notified when it triggers. Works for both portfolio assets and Binance pairs.",
  },
  {
    icon: Eye,
    color: "bg-teal-100 text-teal-600",
    title: "Watchlist",
    body: "Track tickers you're researching without buying. See live prices, daily change, and quick-add to portfolio when ready.",
  },
  {
    icon: BarChart2,
    color: "bg-orange-100 text-orange-600",
    title: "Analytics & Performance",
    body: "Dashboard overview plus deep analytics: P&L charts, allocation breakdown, sortable tables, and full return history.",
  },
  {
    icon: Download,
    color: "bg-gray-100 text-gray-600",
    title: "Export Your Data",
    body: "Export your order history and trade data as CSV for tax reporting or personal records.",
  },
];
