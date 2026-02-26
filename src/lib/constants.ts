import type { AssetType, TransactionType } from "@/types";

// ── Pagination ───────────────────────────────────────────────────────────────

export const PAGE_SIZE = 25;

// ── Asset type display ───────────────────────────────────────────────────────

export const ASSET_TYPES: AssetType[] = [
  "STOCK",
  "CRYPTO",
  "ETF",
  "MUTUAL_FUND",
  "BOND",
];

export const ASSET_TYPE_LABELS: Record<string, string> = {
  STOCK: "Stock",
  CRYPTO: "Crypto",
  ETF: "ETF",
  MUTUAL_FUND: "Mutual Fund",
  BOND: "Bond",
};

export const ASSET_TYPE_BADGE: Record<string, string> = {
  STOCK: "bg-blue-100 text-blue-700",
  CRYPTO: "bg-orange-100 text-orange-700",
  ETF: "bg-green-100 text-green-700",
  MUTUAL_FUND: "bg-purple-100 text-purple-700",
  BOND: "bg-gray-100 text-gray-600",
};

// ── Transaction type display ─────────────────────────────────────────────────

export const TRANSACTION_TYPES: TransactionType[] = ["BUY", "SELL", "DIVIDEND"];

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  BUY: "Buy",
  SELL: "Sell",
  DIVIDEND: "Dividend",
};

export const TRANSACTION_TYPE_BADGE: Record<string, string> = {
  BUY: "bg-green-100 text-green-700",
  SELL: "bg-red-100 text-red-700",
  DIVIDEND: "bg-blue-100 text-blue-700",
};
