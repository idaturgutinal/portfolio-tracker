"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COIN_PAIRS, type CoinPair } from "@/components/terminal/mock-data";
import { TerminalHeader } from "@/components/terminal/TerminalHeader";
import { CoinList, type CoinListHandle } from "@/components/terminal/CoinList";
import { CandlestickChart } from "@/components/terminal/CandlestickChart";
import { OrderBook } from "@/components/terminal/OrderBook";
import { MarketTrades } from "@/components/terminal/MarketTrades";
import { OrderForm } from "@/components/terminal/OrderForm";
import { BottomPanel } from "@/components/terminal/BottomPanel";
import { KeyboardShortcuts } from "@/components/terminal/KeyboardShortcuts";
import { useBinanceTickers } from "@/hooks/useBinanceMarket";
import { useBinanceBalances } from "@/hooks/useBinanceAccount";

export default function TerminalPage() {
  const [selectedPair, setSelectedPair] = useState<CoinPair>(COIN_PAIRS[0]);
  const [coinListCollapsed, setCoinListCollapsed] = useState(false);
  const [orderSide, setOrderSide] = useState<"Buy" | "Sell">("Buy");
  const [chartFullscreen, setChartFullscreen] = useState(false);
  const coinListRef = useRef<CoinListHandle>(null);

  const { tickers, isLoading: tickersLoading, error: tickersError } = useBinanceTickers();
  const { balances } = useBinanceBalances(tickers);

  // Get live ticker for the selected pair
  const liveTicker = useMemo(() => {
    return tickers.get(selectedPair.symbol);
  }, [tickers, selectedPair.symbol]);

  // Get live price (fallback to mock)
  const currentPrice = liveTicker?.lastPrice ?? selectedPair.price;

  // Update selectedPair with live data when selecting
  const handleSelectPair = useCallback((pair: CoinPair) => {
    const ticker = tickers.get(pair.symbol);
    if (ticker) {
      setSelectedPair({
        ...pair,
        price: ticker.lastPrice,
        change24h: ticker.priceChangePercent,
        high24h: ticker.highPrice,
        low24h: ticker.lowPrice,
        volume24h: ticker.quoteVolume,
      });
    } else {
      setSelectedPair(pair);
    }
  }, [tickers]);

  const handleBuy = useCallback(() => setOrderSide("Buy"), []);
  const handleSell = useCallback(() => setOrderSide("Sell"), []);
  const handleFocusSearch = useCallback(() => {
    if (coinListCollapsed) setCoinListCollapsed(false);
    setTimeout(() => coinListRef.current?.focusSearch(), 100);
  }, [coinListCollapsed]);
  const handleToggleFullscreen = useCallback(() => setChartFullscreen((prev) => !prev), []);

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] md:h-screen bg-gray-950 text-white">
      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onBuy={handleBuy}
        onSell={handleSell}
        onFocusSearch={handleFocusSearch}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* API Error Banner */}
      {tickersError && (
        <div className="px-4 py-1 bg-yellow-900/50 border-b border-yellow-700 text-xs text-yellow-300">
          Binance API unavailable - showing cached/mock data. {tickersError}
        </div>
      )}

      {/* Terminal Header */}
      <TerminalHeader selectedPair={selectedPair} liveTicker={liveTicker} />

      {/* Main content area */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Coin List (collapsible) */}
        {!chartFullscreen && (
          <div className={`relative flex-shrink-0 border-r border-gray-700 transition-all duration-200 ${coinListCollapsed ? "w-0" : "w-52"}`}>
            {!coinListCollapsed && (
              <div className="h-full w-52">
                <CoinList
                  ref={coinListRef}
                  selectedSymbol={selectedPair.symbol}
                  onSelectPair={handleSelectPair}
                  tickers={tickers}
                  tickersLoading={tickersLoading}
                />
              </div>
            )}
            <button
              onClick={() => setCoinListCollapsed(!coinListCollapsed)}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-gray-700 hover:bg-gray-600 rounded-full p-0.5 border border-gray-600"
            >
              {coinListCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>
          </div>
        )}

        {/* Center + Right */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex min-h-0">
            {/* Center: Chart */}
            <div className={`flex-1 min-w-0 ${chartFullscreen ? "" : "border-r border-gray-700"}`}>
              <CandlestickChart symbol={selectedPair.symbol} basePrice={currentPrice} />
            </div>

            {/* Right: OrderBook + MarketTrades + OrderForm */}
            {!chartFullscreen && (
              <div className="w-72 flex-shrink-0 flex flex-col">
                <div className="flex-1 min-h-0 border-b border-gray-700 overflow-hidden">
                  <OrderBook
                    symbol={selectedPair.symbol}
                    basePrice={currentPrice}
                    baseAsset={selectedPair.baseAsset}
                    quoteAsset={selectedPair.quoteAsset}
                  />
                </div>
                <div className="h-48 border-b border-gray-700 overflow-hidden">
                  <MarketTrades
                    symbol={selectedPair.symbol}
                    basePrice={currentPrice}
                    baseAsset={selectedPair.baseAsset}
                    quoteAsset={selectedPair.quoteAsset}
                  />
                </div>
                <div className="h-80 overflow-hidden">
                  <OrderForm
                    baseAsset={selectedPair.baseAsset}
                    quoteAsset={selectedPair.quoteAsset}
                    currentPrice={currentPrice}
                    side={orderSide}
                    onSideChange={setOrderSide}
                    balances={balances}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Panel */}
          {!chartFullscreen && (
            <div className="h-52 border-t border-gray-700 flex-shrink-0">
              <BottomPanel currentSymbol={selectedPair.symbol} tickers={tickers} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
