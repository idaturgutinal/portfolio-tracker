"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useBinanceKlines } from "@/hooks/useBinanceMarket";
import { generateCandleData } from "./mock-data";

interface CandlestickChartProps {
  symbol: string;
  basePrice: number;
}

type ChartType = "Candlestick" | "Line" | "Area";

interface IntervalOption {
  label: string;
  value: string;
  minutes: number;
}

const INTERVAL_OPTIONS: IntervalOption[] = [
  { label: "1m", value: "1m", minutes: 1 },
  { label: "5m", value: "5m", minutes: 5 },
  { label: "15m", value: "15m", minutes: 15 },
  { label: "30m", value: "30m", minutes: 30 },
  { label: "1h", value: "1h", minutes: 60 },
  { label: "4h", value: "4h", minutes: 240 },
  { label: "1D", value: "1d", minutes: 1440 },
  { label: "1W", value: "1w", minutes: 10080 },
];

export function CandlestickChart({ symbol, basePrice }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<{ remove: () => void } | null>(null);
  const [selectedInterval, setSelectedInterval] = useState(INTERVAL_OPTIONS[4]);
  const [chartType, setChartType] = useState<ChartType>("Candlestick");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { klines, isLoading, error } = useBinanceKlines(symbol, selectedInterval.value);

  const initChart = useCallback(async () => {
    if (!chartContainerRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    const lc = await import("lightweight-charts");
    const { createChart, ColorType, CrosshairMode, CandlestickSeries, LineSeries, AreaSeries, HistogramSeries } = lc;

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: "#131722" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "#1e222d" },
        horzLines: { color: "#1e222d" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: "#2B2B43",
      },
      timeScale: {
        borderColor: "#2B2B43",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartInstanceRef.current = chart;

    // Use live klines if available, fall back to mock data
    const candles = klines.length > 0
      ? klines
      : generateCandleData(basePrice, 200, selectedInterval.minutes);

    if (chartType === "Candlestick") {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderDownColor: "#ef5350",
        borderUpColor: "#26a69a",
        wickDownColor: "#ef5350",
        wickUpColor: "#26a69a",
      });
      candleSeries.setData(
        candles.map((c) => ({
          time: c.time as import("lightweight-charts").UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );

      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: "#26a69a",
        priceFormat: { type: "volume" as const },
        priceScaleId: "volume",
      });
      chart.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
      volumeSeries.setData(
        candles.map((c) => ({
          time: c.time as import("lightweight-charts").UTCTimestamp,
          value: c.volume,
          color: c.close >= c.open ? "rgba(38, 166, 154, 0.5)" : "rgba(239, 83, 80, 0.5)",
        }))
      );
    } else if (chartType === "Line") {
      const lineSeries = chart.addSeries(LineSeries, {
        color: "#2962FF",
        lineWidth: 2,
      });
      lineSeries.setData(
        candles.map((c) => ({
          time: c.time as import("lightweight-charts").UTCTimestamp,
          value: c.close,
        }))
      );
    } else {
      const areaSeries = chart.addSeries(AreaSeries, {
        topColor: "rgba(41, 98, 255, 0.56)",
        bottomColor: "rgba(41, 98, 255, 0.04)",
        lineColor: "rgba(41, 98, 255, 1)",
        lineWidth: 2,
      });
      areaSeries.setData(
        candles.map((c) => ({
          time: c.time as import("lightweight-charts").UTCTimestamp,
          value: c.close,
        }))
      );
    }

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [basePrice, selectedInterval, chartType, klines]);

  useEffect(() => {
    if (isLoading) return;
    const cleanup = initChart();
    return () => {
      cleanup?.then((fn) => fn?.());
    };
  }, [initChart, isLoading]);

  const toggleFullscreen = () => {
    if (!chartContainerRef.current?.parentElement) return;
    const wrapper = chartContainerRef.current.parentElement;
    if (!isFullscreen) {
      wrapper.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="flex flex-col h-full bg-[#131722]">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-700 bg-gray-900">
        <div className="flex gap-0.5">
          {INTERVAL_OPTIONS.map((interval) => (
            <button
              key={interval.label}
              onClick={() => setSelectedInterval(interval)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedInterval.label === interval.label
                  ? "bg-gray-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {interval.label}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-gray-700 mx-1" />

        <div className="flex gap-0.5">
          {(["Candlestick", "Line", "Area"] as ChartType[]).map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                chartType === type
                  ? "bg-gray-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {error && (
          <span className="text-[10px] text-yellow-500 mr-2">Using mock data</span>
        )}

        <button
          onClick={toggleFullscreen}
          className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-700"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isFullscreen ? (
              <>
                <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
                <line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
              </>
            ) : (
              <>
                <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-2 bg-gray-900/50">
          <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-xs text-gray-400">Loading chart...</span>
        </div>
      )}

      {/* Chart */}
      <div ref={chartContainerRef} className="flex-1 min-h-0" />
    </div>
  );
}
