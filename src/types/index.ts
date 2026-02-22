export type { Portfolio, Asset, Transaction, User } from "@prisma/client";
export { AssetType, TransactionType } from "@prisma/client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  defaultCurrency: string;
  createdAt: string; // ISO string
  hasPassword: boolean;
}

// ─── Enriched / view types ───────────────────────────────────────────────────

export interface AssetWithTransactions {
  id: string;
  portfolioId: string;
  symbol: string;
  name: string;
  assetType: string;
  quantity: number;
  averageBuyPrice: number;
  currency: string;
  notes: string | null;
  transactions: {
    id: string;
    assetId: string;
    type: string;
    quantity: number;
    pricePerUnit: number;
    fees: number;
    date: Date;
    notes: string | null;
  }[];
  /** Populated after fetching a live quote */
  currentPrice?: number;
  currentValue?: number;
  gainLoss?: number;
  gainLossPct?: number;
}

export interface PortfolioSummary {
  id: string;
  name: string;
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPct: number;
  assetCount: number;
}

// ─── API / form input types ───────────────────────────────────────────────────

export interface CreatePortfolioInput {
  name: string;
  userId: string;
}

export interface CreateAssetInput {
  portfolioId: string;
  symbol: string;
  name: string;
  assetType: string;
  quantity: number;
  averageBuyPrice: number;
  currency: string;
  notes?: string;
}

export interface EnrichedAsset {
  id: string;
  /** All underlying DB asset IDs. Single-row assets have ids = [id]. */
  ids: string[];
  symbol: string;
  name: string;
  assetType: string;
  quantity: number;
  averageBuyPrice: number;
  currency: string;
  notes: string | null;
  portfolioId: string;
  portfolioName: string;
  currentPrice: number | null;
  marketValue: number;
  pnl: number;
  /** Fractional: 0.05 = +5% */
  pnlPct: number;
}

export interface PortfolioOption {
  id: string;
  name: string;
}

export interface EnrichedTransaction {
  id: string;
  type: string;
  quantity: number;
  pricePerUnit: number;
  fees: number;
  /** BUY: qty×price+fees  SELL/DIVIDEND: qty×price−fees */
  total: number;
  date: string; // ISO string
  notes: string | null;
  assetId: string;
  assetSymbol: string;
  assetName: string;
  portfolioId: string;
  portfolioName: string;
}

export interface AssetOption {
  id: string;
  symbol: string;
  name: string;
  portfolioName: string;
}

export interface CreateTransactionInput {
  assetId: string;
  type: string;
  quantity: number;
  pricePerUnit: number;
  fees?: number;
  date: string;
  notes?: string;
}

export interface PriceAlertRow {
  id: string;
  assetId: string;
  symbol: string;
  assetName: string;
  condition: "ABOVE" | "BELOW";
  targetPrice: number;
  active: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

export interface CreateAlertInput {
  assetId: string;
  symbol: string;
  condition: "ABOVE" | "BELOW";
  targetPrice: number;
}

export interface TriggeredAlert {
  id: string;
  symbol: string;
  condition: string;
  targetPrice: number;
  currentPrice: number;
}

export interface WatchlistRow {
  id: string;
  symbol: string;
  name: string;
  assetType: string;
  notes: string | null;
  addedAt: string; // ISO string
  currentPrice: number | null;
  change: number | null;
  changePercent: number | null;
  currency: string;
}

export interface CreateWatchlistItemInput {
  symbol: string;
  name: string;
  assetType: string;
  notes?: string;
}
