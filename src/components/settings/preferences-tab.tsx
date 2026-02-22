"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme, type Theme } from "@/hooks/use-theme";

const CURRENCIES = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "CHF", label: "CHF — Swiss Franc" },
  { code: "CNY", label: "CNY — Chinese Yuan" },
  { code: "TRY", label: "TRY — Turkish Lira" },
];

const THEMES: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function PreferencesTab({
  defaultCurrency,
}: {
  defaultCurrency: string;
}) {
  const { update } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [currency, setCurrency] = useState(defaultCurrency);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [currencyError, setCurrencyError] = useState<string | null>(null);
  const [currencySuccess, setCurrencySuccess] = useState(false);

  async function handleSaveCurrency() {
    setCurrencyError(null);
    setCurrencySuccess(false);
    setCurrencyLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultCurrency: currency }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCurrencyError(data.error ?? "Failed to update currency");
        return;
      }
      await update({ defaultCurrency: currency });
      setCurrencySuccess(true);
      router.refresh();
    } finally {
      setCurrencyLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Display Currency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <p className="text-sm text-muted-foreground">
            Live market values will be converted to the selected currency.
            Historical buy prices are shown in their recorded currency.
          </p>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {currencyError && (
            <p className="text-sm text-destructive">{currencyError}</p>
          )}
          {currencySuccess && (
            <p className="text-sm text-positive">Currency updated.</p>
          )}
          <Button onClick={handleSaveCurrency} disabled={currencyLoading}>
            {currencyLoading ? "Saving…" : "Save currency"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <Label>Appearance</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as Theme)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Theme preference is saved locally and applied instantly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
