"use client";

import { useState, useMemo } from "react";
import { Star, Search } from "lucide-react";
import { COIN_PAIRS, type CoinPair } from "./mock-data";

type Category = "USDT" | "BTC" | "BNB" | "Favorites";
type SortKey = "symbol" | "price" | "change" | "volume";
type SortDir = "asc" | "desc";

interface CoinListProps {
  selectedSymbol: string;
  onSelectPair: (pair: CoinPair) => void;
}

export function CoinList({ selectedSymbol, onSelectPair }: CoinListProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("USDT");
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["BTCUSDT", "ETHUSDT", "SOLUSDT"]));
  const [sortKey, setSortKey] = useState<SortKey>("volume");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    let pairs = COIN_PAIRS;

    if (category === "Favorites") {
      pairs = pairs.filter((p) => favorites.has(p.symbol));
    } else {
      pairs = pairs.filter((p) => p.category === category);
    }

    if (search) {
      const s = search.toUpperCase();
      pairs = pairs.filter((p) => p.symbol.includes(s) || p.baseAsset.includes(s));
    }

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

    return pairs;
  }, [category, search, sortKey, sortDir, favorites]);

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
      </div>

      {/* Coin list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((pair) => (
          <button
            key={pair.symbol}
            onClick={() => onSelectPair(pair)}
            className={`flex items-center w-full px-2 py-1.5 text-xs hover:bg-gray-800 transition-colors ${
              selectedSymbol === pair.symbol ? "bg-gray-800" : ""
            }`}
          >
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(pair.symbol); }}
              className="mr-1 shrink-0"
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
          </button>
        ))}
      </div>
    </div>
  );
}
