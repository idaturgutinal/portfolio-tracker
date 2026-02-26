"use client";

import { useState, useMemo, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { Star, Search, ChevronUp, ChevronDown } from "lucide-react";
import { COIN_PAIRS, type CoinPair } from "./mock-data";
import { toast } from "@/hooks/use-toast";
import type { TickerData } from "@/hooks/useBinanceMarket";

type Category = "USDT" | "BTC" | "BNB" | "Favorites";
type SortKey = "symbol" | "price" | "change" | "volume";
type SortDir = "asc" | "desc";

interface FavoritePair {
  id: string;
  symbol: string;
  sortOrder: number;
}

interface CoinListProps {
  selectedSymbol: string;
  onSelectPair: (pair: CoinPair) => void;
  tickers?: Map<string, TickerData>;
  tickersLoading?: boolean;
}

export interface CoinListHandle {
  focusSearch: () => void;
}

export const CoinList = forwardRef<CoinListHandle, CoinListProps>(
  function CoinList({ selectedSymbol, onSelectPair, tickers, tickersLoading }, ref) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<Category>("USDT");
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [favoritePairs, setFavoritePairs] = useState<FavoritePair[]>([]);
    const [sortKey, setSortKey] = useState<SortKey>("volume");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [loadingFavs, setLoadingFavs] = useState(false);
    const [flashSymbols, setFlashSymbols] = useState<Map<string, "up" | "down">>(new Map());
    const prevPricesRef = useRef<Map<string, number>>(new Map());
    const searchRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focusSearch: () => searchRef.current?.focus(),
    }));

    // Track price changes for flash animation
    useEffect(() => {
      if (!tickers || tickers.size === 0) return;

      const newFlash = new Map<string, "up" | "down">();
      const prevPrices = prevPricesRef.current;

      tickers.forEach((ticker, symbol) => {
        const prev = prevPrices.get(symbol);
        if (prev !== undefined && prev !== ticker.lastPrice) {
          newFlash.set(symbol, ticker.lastPrice > prev ? "up" : "down");
        }
        prevPrices.set(symbol, ticker.lastPrice);
      });

      if (newFlash.size > 0) {
        setFlashSymbols(newFlash);
        const timeout = setTimeout(() => setFlashSymbols(new Map()), 500);
        return () => clearTimeout(timeout);
      }
    }, [tickers]);

    const fetchFavorites = useCallback(async () => {
      try {
        const res = await fetch("/api/binance/favorites");
        if (res.ok) {
          const data = (await res.json()) as FavoritePair[];
          setFavoritePairs(data);
          setFavorites(new Set(data.map((f) => f.symbol)));
        }
      } catch {
        // Fall back to empty favorites
      }
    }, []);

    useEffect(() => {
      fetchFavorites();
    }, [fetchFavorites]);

    const toggleFavorite = async (symbol: string) => {
      const isFav = favorites.has(symbol);
      setLoadingFavs(true);

      // Optimistic update
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFav) next.delete(symbol);
        else next.add(symbol);
        return next;
      });

      try {
        if (isFav) {
          const res = await fetch("/api/binance/favorites", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symbol }),
          });
          if (!res.ok && res.status !== 204) {
            // Revert on failure
            setFavorites((prev) => new Set([...prev, symbol]));
            toast({ title: "Error", description: "Failed to remove favorite.", variant: "destructive" });
          }
        } else {
          const res = await fetch("/api/binance/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symbol }),
          });
          if (!res.ok) {
            // Revert on failure
            setFavorites((prev) => {
              const next = new Set(prev);
              next.delete(symbol);
              return next;
            });
            toast({ title: "Error", description: "Failed to add favorite.", variant: "destructive" });
          }
        }
        await fetchFavorites();
      } catch {
        // Revert and re-fetch
        await fetchFavorites();
      } finally {
        setLoadingFavs(false);
      }
    };

    const moveFavorite = async (symbol: string, dir: "up" | "down") => {
      const sorted = [...favoritePairs].sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = sorted.findIndex((f) => f.symbol === symbol);
      if (idx < 0) return;
      if (dir === "up" && idx === 0) return;
      if (dir === "down" && idx === sorted.length - 1) return;

      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      const newOrder = sorted.map((f) => f.symbol);
      [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];

      try {
        await fetch("/api/binance/favorites/reorder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbols: newOrder }),
        });
        await fetchFavorites();
      } catch {
        toast({ title: "Error", description: "Failed to reorder.", variant: "destructive" });
      }
    };

    const handleSort = (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("desc");
      }
    };

    // Merge live ticker data with mock coin pairs
    const pairsWithLiveData = useMemo(() => {
      if (!tickers || tickers.size === 0) return COIN_PAIRS;

      return COIN_PAIRS.map((pair) => {
        const ticker = tickers.get(pair.symbol);
        if (!ticker) return pair;
        return {
          ...pair,
          price: ticker.lastPrice,
          change24h: ticker.priceChangePercent,
          high24h: ticker.highPrice,
          low24h: ticker.lowPrice,
          volume24h: ticker.quoteVolume,
        };
      });
    }, [tickers]);

    const filtered = useMemo(() => {
      let pairs = pairsWithLiveData;

      if (category === "Favorites") {
        const favSymbols = favoritePairs
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((f) => f.symbol);
        pairs = favSymbols
          .map((s) => pairsWithLiveData.find((p) => p.symbol === s))
          .filter((p): p is CoinPair => p !== undefined);
      } else {
        pairs = pairs.filter((p) => p.category === category);
      }

      if (search) {
        const s = search.toUpperCase();
        pairs = pairs.filter((p) => p.symbol.includes(s) || p.baseAsset.includes(s));
      }

      if (category !== "Favorites") {
        pairs = [...pairs].sort((a, b) => {
          let cmp = 0;
          switch (sortKey) {
            case "symbol": cmp = a.symbol.localeCompare(b.symbol); break;
            case "price": cmp = a.price - b.price; break;
            case "change": cmp = a.change24h - b.change24h; break;
            case "volume": cmp = a.volume24h - b.volume24h; break;
          }
          return sortDir === "asc" ? cmp : -cmp;
        });
      }

      return pairs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, search, sortKey, sortDir, favoritePairs, pairsWithLiveData]);

    const categories: Category[] = ["USDT", "BTC", "BNB", "Favorites"];

    function formatPrice(price: number): string {
      if (price < 0.001) return price.toFixed(8);
      if (price < 1) return price.toFixed(4);
      if (price < 100) return price.toFixed(2);
      return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    return (
      <div className="flex flex-col h-full bg-gray-900 text-white">
        {/* Search */}
        <div className="p-2 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-7 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex border-b border-gray-700">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                category === cat
                  ? "text-yellow-500 border-b-2 border-yellow-500"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {cat === "Favorites" ? "★" : cat}
            </button>
          ))}
        </div>

        {/* Sort header */}
        <div className="flex items-center px-2 py-1 text-[10px] text-gray-500 border-b border-gray-800">
          <button onClick={() => handleSort("symbol")} className="flex-1 text-left hover:text-gray-300">
            Pair {sortKey === "symbol" ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>
          <button onClick={() => handleSort("price")} className="w-20 text-right hover:text-gray-300">
            Price {sortKey === "price" ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>
          <button onClick={() => handleSort("change")} className="w-16 text-right hover:text-gray-300">
            Change {sortKey === "change" ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>
          {category === "Favorites" && (
            <span className="w-10 text-right">Order</span>
          )}
        </div>

        {/* Loading state */}
        {tickersLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-xs text-gray-400">Loading prices...</span>
          </div>
        )}

        {/* Coin list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((pair) => {
            const flash = flashSymbols.get(pair.symbol);
            return (
              <button
                key={pair.symbol}
                onClick={() => onSelectPair(pair)}
                className={`flex items-center w-full px-2 py-1.5 text-xs hover:bg-gray-800 transition-colors ${
                  selectedSymbol === pair.symbol ? "bg-gray-800" : ""
                } ${flash === "up" ? "bg-green-500/10" : flash === "down" ? "bg-red-500/10" : ""}`}
                style={{ transition: "background-color 0.3s ease" }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(pair.symbol); }}
                  className="mr-1 shrink-0"
                  disabled={loadingFavs}
                >
                  <Star
                    className={`h-3 w-3 ${favorites.has(pair.symbol) ? "fill-yellow-500 text-yellow-500" : "text-gray-600"}`}
                  />
                </button>
                <span className="flex-1 text-left font-medium">{pair.baseAsset}<span className="text-gray-500">/{pair.quoteAsset}</span></span>
                <span className="w-20 text-right font-mono">{formatPrice(pair.price)}</span>
                <span className={`w-16 text-right font-mono ${pair.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {pair.change24h >= 0 ? "+" : ""}{pair.change24h.toFixed(2)}%
                </span>
                {category === "Favorites" && (
                  <span className="w-10 flex justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => moveFavorite(pair.symbol, "up")} className="text-gray-500 hover:text-gray-300">
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button onClick={() => moveFavorite(pair.symbol, "down")} className="text-gray-500 hover:text-gray-300">
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);
