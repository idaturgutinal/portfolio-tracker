"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { SymbolSearchResult } from "@/services/marketData";

export function SymbolSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setActiveIndex(-1);
      clearTimeout(timerRef.current);

      if (!value.trim()) {
        setResults([]);
        setOpen(false);
        return;
      }

      timerRef.current = setTimeout(async () => {
        const res = await fetch(
          `/api/market/search?q=${encodeURIComponent(value)}`
        );
        if (res.ok) {
          const data = (await res.json()) as SymbolSearchResult[];
          setResults(data);
          setOpen(data.length > 0);
        }
      }, 350);
    },
    []
  );

  function selectResult(r: SymbolSearchResult) {
    const type = r.suggestedType || "STOCK";
    router.push(`/dashboard/chart/${encodeURIComponent(r.symbol)}?type=${type}`);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          selectResult(results[activeIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative px-3 py-3 border-b">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Search symbol..."
          className="pl-8 h-8 text-sm"
          autoComplete="off"
        />
      </div>

      {open && results.length > 0 && (
        <ul className="absolute left-3 right-3 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <li key={r.symbol}>
              <button
                type="button"
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                  i === activeIndex ? "bg-accent" : "hover:bg-muted"
                }`}
                onMouseDown={(e) => { e.preventDefault(); selectResult(r); }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span className="font-medium shrink-0">{r.symbol}</span>
                <span className="text-muted-foreground text-xs truncate flex-1">
                  {r.name}
                </span>
                {r.suggestedType && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                    {r.suggestedType}
                  </Badge>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
