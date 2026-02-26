import type { OrderSide, OrderType } from "./order-client";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface MarketOrderParams {
  symbol: string;
  side: OrderSide;
  quantity: string;
}

export interface LimitOrderParams extends MarketOrderParams {
  price: string;
}

export interface StopLimitOrderParams extends LimitOrderParams {
  stopPrice: string;
}

export interface OcoOrderParams {
  symbol: string;
  side: OrderSide;
  quantity: string;
  price: string;
  stopPrice: string;
  stopLimitPrice: string;
}

// ── Validators ───────────────────────────────────────────────────────────────

function isValidSide(side: string): side is OrderSide {
  return side === "BUY" || side === "SELL";
}

function isValidOrderType(type: string): type is OrderType {
  return type === "MARKET" || type === "LIMIT" || type === "STOP_LOSS_LIMIT";
}

function isPositiveNumber(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

function isValidSymbol(symbol: string): boolean {
  return /^[A-Z0-9]{2,20}$/.test(symbol);
}

export function validateMarketOrder(params: MarketOrderParams): ValidationResult {
  if (!params.symbol || !isValidSymbol(params.symbol)) {
    return { valid: false, error: "Invalid symbol. Must be uppercase alphanumeric (e.g., BTCUSDT)" };
  }
  if (!params.side || !isValidSide(params.side)) {
    return { valid: false, error: "Invalid side. Must be BUY or SELL" };
  }
  if (!params.quantity || !isPositiveNumber(params.quantity)) {
    return { valid: false, error: "Invalid quantity. Must be a positive number" };
  }
  return { valid: true };
}

export function validateLimitOrder(params: LimitOrderParams): ValidationResult {
  const baseResult = validateMarketOrder(params);
  if (!baseResult.valid) return baseResult;

  if (!params.price || !isPositiveNumber(params.price)) {
    return { valid: false, error: "Invalid price. Must be a positive number" };
  }
  return { valid: true };
}

export function validateStopLimitOrder(params: StopLimitOrderParams): ValidationResult {
  const baseResult = validateLimitOrder(params);
  if (!baseResult.valid) return baseResult;

  if (!params.stopPrice || !isPositiveNumber(params.stopPrice)) {
    return { valid: false, error: "Invalid stop price. Must be a positive number" };
  }
  return { valid: true };
}

export function validateOcoOrder(params: OcoOrderParams): ValidationResult {
  if (!params.symbol || !isValidSymbol(params.symbol)) {
    return { valid: false, error: "Invalid symbol. Must be uppercase alphanumeric" };
  }
  if (!params.side || !isValidSide(params.side)) {
    return { valid: false, error: "Invalid side. Must be BUY or SELL" };
  }
  if (!params.quantity || !isPositiveNumber(params.quantity)) {
    return { valid: false, error: "Invalid quantity. Must be a positive number" };
  }
  if (!params.price || !isPositiveNumber(params.price)) {
    return { valid: false, error: "Invalid price. Must be a positive number" };
  }
  if (!params.stopPrice || !isPositiveNumber(params.stopPrice)) {
    return { valid: false, error: "Invalid stop price. Must be a positive number" };
  }
  if (!params.stopLimitPrice || !isPositiveNumber(params.stopLimitPrice)) {
    return { valid: false, error: "Invalid stop limit price. Must be a positive number" };
  }
  return { valid: true };
}

export function validateOrderType(type: string): ValidationResult {
  if (!isValidOrderType(type)) {
    return { valid: false, error: "Invalid order type. Must be MARKET, LIMIT, or STOP_LOSS_LIMIT" };
  }
  return { valid: true };
}

export function validateQuantity(quantity: string, stepSize: string): string {
  const qty = parseFloat(quantity);
  const step = parseFloat(stepSize);
  if (step === 0) return quantity;

  const precision = stepSize.indexOf(".") === -1
    ? 0
    : stepSize.replace(/0+$/, "").split(".")[1]?.length ?? 0;

  const adjusted = Math.floor(qty / step) * step;
  return adjusted.toFixed(precision);
}

export function validatePrice(price: string, tickSize: string): string {
  const p = parseFloat(price);
  const tick = parseFloat(tickSize);
  if (tick === 0) return price;

  const precision = tickSize.indexOf(".") === -1
    ? 0
    : tickSize.replace(/0+$/, "").split(".")[1]?.length ?? 0;

  const adjusted = Math.floor(p / tick) * tick;
  return adjusted.toFixed(precision);
}

export function validateMinNotional(
  price: string,
  quantity: string,
  minNotional: string
): ValidationResult {
  const total = parseFloat(price) * parseFloat(quantity);
  const min = parseFloat(minNotional);

  if (total < min) {
    return {
      valid: false,
      error: `Order total (${total.toFixed(2)}) is below minimum notional value (${min})`,
    };
  }
  return { valid: true };
}
