"use client";

import { useState, useEffect } from "react";
import type { PortfolioSummary } from "@/types";

/**
 * Fetches portfolio summary data from the API.
 * Returns a PortfolioSummary with: id, name, totalValue, totalCost,
 * totalGainLoss, totalGainLossPct, assetCount.
 */
export function usePortfolio(portfolioId: string | null) {
  const [data, setData] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!portfolioId) return;

    setIsLoading(true);
    setError(null);

    fetch(`/api/portfolios/${portfolioId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load portfolio: ${res.status}`);
        return res.json() as Promise<PortfolioSummary>;
      })
      .then(setData)
      .catch((err: Error) => setError(err))
      .finally(() => setIsLoading(false));
  }, [portfolioId]);

  return { data, isLoading, error };
}
