/**
 * Format a number as currency.
 * @example formatCurrency(1234.5) → "$1,234.50"
 */
export function formatCurrency(
  value: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a decimal as a percentage string.
 * @example formatPercent(0.1234) → "+12.34%"
 */
export function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(2)}%`;
}

/**
 * Format a number with compact notation for large values.
 * @example formatCompact(1_234_567) → "1.2M"
 */
export function formatCompact(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format a Date or ISO string as a short date.
 * @example formatDate("2024-01-15T00:00:00Z") → "Jan 15, 2024"
 */
export function formatDate(date: Date | string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}
