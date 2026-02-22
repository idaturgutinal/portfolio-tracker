"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GUIDE_STEPS } from "./guide-steps";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";

const COLLAPSE_KEY = "guide_panel_collapsed";

export function UserGuidePanel() {
  // Start collapsed to avoid a flash; useEffect will set the real state
  const [collapsed, setCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {}
    setMounted(true);
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      if (next) {
        localStorage.setItem(COLLAPSE_KEY, "1");
      } else {
        localStorage.removeItem(COLLAPSE_KEY);
      }
    } catch {}
  }

  // Avoid layout shift on first render
  if (!mounted) return null;

  return (
    <Card>
      <CardHeader className="py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Quick Guide</span>
            <span className="text-xs text-muted-foreground">
              — how to get the most out of Portfolio Tracker
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={toggle}
            aria-label={collapsed ? "Expand guide" : "Collapse guide"}
          >
            {collapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="pt-0 pb-5 px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {GUIDE_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="flex gap-3 rounded-lg border bg-muted/30 p-3"
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${step.color}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-medium text-xs leading-snug">{step.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
