"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type ExportFormat = "csv-assets" | "csv-transactions" | "json";

function triggerDownload(format: ExportFormat) {
  const a = document.createElement("a");
  a.href = `/api/user/export?format=${format}`;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const EXPORTS: { format: ExportFormat; label: string; description: string }[] =
  [
    {
      format: "csv-assets",
      label: "Assets CSV",
      description: "All holdings across every portfolio with quantity and buy price.",
    },
    {
      format: "csv-transactions",
      label: "Transactions CSV",
      description: "Full transaction history: buys, sells, and dividends.",
    },
    {
      format: "json",
      label: "Full Export (JSON)",
      description: "Complete nested export including portfolios, assets, and transactions.",
    },
  ];

export function ExportTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {EXPORTS.map(({ format, label, description }) => (
          <div
            key={format}
            className="flex items-center justify-between gap-4 py-3 border-b last:border-0"
          >
            <div>
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerDownload(format)}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
