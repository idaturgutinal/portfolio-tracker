import type { OrderSide, OrderType } from "./types";

// ── Order Validation ─────────────────────────────────────────────────────────

interface OrderParams {
  symbol?: string;
  side?: string;
  type?: string;
  quantity?: string;
  price?: string;
  stopPrice?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_SIDES: OrderSide[] = ["BUY", "SELL"];
const VALID_ORDER_TYPES: OrderType[] = [
  "MARKET",
  "LIMIT",
  "STOP_LOSS_LIMIT",
  "TAKE_PROFIT_LIMIT",
  "LIMIT_MAKER",
  "OCO",
];

export function validateOrderParams(params: OrderParams): ValidationResult {
  const errors: string[] = [];

  // Symbol
  if (!params.symbol || params.symbol.trim() === "") {
    errors.push("symbol is required and cannot be empty");
  } else if (!/^[A-Z0-9]+$/.test(params.symbol)) {
    errors.push("symbol must contain only uppercase letters and numbers");
  }

  // Side
  if (!params.side) {
    errors.push("side is required");
  } else if (!VALID_SIDES.includes(params.side as OrderSide)) {
    errors.push("side must be BUY or SELL");
  }

  // Type
  if (!params.type) {
    errors.push("type is required");
  } else if (!VALID_ORDER_TYPES.includes(params.type as OrderType)) {
    errors.push(`type must be one of: ${VALID_ORDER_TYPES.join(", ")}`);
  }

  // Quantity
  if (!params.quantity) {
    errors.push("quantity is required");
  } else {
    const qty = Number(params.quantity);
    if (isNaN(qty) || qty <= 0) {
      errors.push("quantity must be a positive number");
    }
  }

  // Price (required for LIMIT, STOP_LOSS_LIMIT, TAKE_PROFIT_LIMIT, LIMIT_MAKER)
  const typesRequiringPrice: string[] = ["LIMIT", "STOP_LOSS_LIMIT", "TAKE_PROFIT_LIMIT", "LIMIT_MAKER"];
  if (params.type && typesRequiringPrice.includes(params.type)) {
    if (!params.price) {
      errors.push(`price is required for ${params.type} orders`);
    } else {
      const price = Number(params.price);
      if (isNaN(price) || price <= 0) {
        errors.push("price must be a positive number");
      }
    }
  }

  // Stop price (required for STOP_LOSS_LIMIT, TAKE_PROFIT_LIMIT)
  const typesRequiringStopPrice: string[] = ["STOP_LOSS_LIMIT", "TAKE_PROFIT_LIMIT"];
  if (params.type && typesRequiringStopPrice.includes(params.type)) {
    if (!params.stopPrice) {
      errors.push(`stopPrice is required for ${params.type} orders`);
    } else {
      const stopPrice = Number(params.stopPrice);
      if (isNaN(stopPrice) || stopPrice <= 0) {
        errors.push("stopPrice must be a positive number");
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ── API Key Validation ───────────────────────────────────────────────────────

export function validateApiKeyFormat(key: string): boolean {
  return /^[A-Za-z0-9]{64}$/.test(key);
}

// ── Input Sanitization ───────────────────────────────────────────────────────

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

export function sanitizeInput(input: string): string {
  return input.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] ?? char);
}
