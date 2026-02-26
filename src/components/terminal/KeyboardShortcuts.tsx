"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";

interface ShortcutDef {
  key: string;
  label: string;
  description: string;
}

const SHORTCUTS: ShortcutDef[] = [
  { key: "B", label: "B", description: "Switch to Buy tab" },
  { key: "S", label: "S", description: "Switch to Sell tab" },
  { key: "Escape", label: "Esc", description: "Close open modal/dialog" },
  { key: "/", label: "/", description: "Focus coin search" },
  { key: "F", label: "F", description: "Toggle fullscreen chart" },
  { key: "?", label: "?", description: "Toggle shortcuts help" },
];

interface KeyboardShortcutsProps {
  onBuy: () => void;
  onSell: () => void;
  onFocusSearch: () => void;
  onToggleFullscreen: () => void;
}

export function KeyboardShortcuts({
  onBuy,
  onSell,
  onFocusSearch,
  onToggleFullscreen,
}: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea/select
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        if (e.key === "Escape") {
          (target as HTMLInputElement).blur();
        }
        return;
      }

      switch (e.key) {
        case "b":
        case "B":
          e.preventDefault();
          onBuy();
          break;
        case "s":
        case "S":
          e.preventDefault();
          onSell();
          break;
        case "Escape":
          e.preventDefault();
          setShowHelp(false);
          break;
        case "/":
          e.preventDefault();
          onFocusSearch();
          break;
        case "f":
        case "F":
          e.preventDefault();
          onToggleFullscreen();
          break;
        case "?":
          e.preventDefault();
          setShowHelp((prev) => !prev);
          break;
      }
    },
    [onBuy, onSell, onFocusSearch, onToggleFullscreen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-80">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-white">Keyboard Shortcuts</h3>
          <button
            onClick={() => setShowHelp(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 py-3 space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-xs">
              <span className="text-gray-300">{s.description}</span>
              <kbd className="px-2 py-0.5 bg-gray-800 border border-gray-600 rounded text-gray-400 font-mono text-[11px]">
                {s.label}
              </kbd>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-gray-700">
          <p className="text-[10px] text-gray-500 text-center">
            Press <kbd className="px-1 bg-gray-800 border border-gray-600 rounded font-mono">?</kbd> to toggle this overlay
          </p>
        </div>
      </div>
    </div>
  );
}
