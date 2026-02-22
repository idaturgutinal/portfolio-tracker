"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
      <AlertTriangle className="h-12 w-12 text-destructive/60" />
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        {process.env.NODE_ENV === "development" && (
          <div className="bg-muted rounded-md px-3 py-2 text-sm font-mono text-left max-w-md">
            {error.message}
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="ghost" asChild>
          <Link href="/dashboard">← Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
