import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/api-utils";
import { getUserApiKeys, getUserTradingApiKeys } from "@/lib/binance/helpers";
import { checkUserRateLimit } from "@/lib/binance/rate-limiter";

interface SignRequestBody {
  method: "GET" | "POST" | "DELETE";
  endpoint: string;
  params: Record<string, string>;
  isTrading?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = checkUserRateLimit(userId);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } },
      );
    }

    const body: SignRequestBody = await request.json();
    const { method, endpoint, params, isTrading } = body;

    if (!method || !endpoint) {
      return NextResponse.json({ error: "Missing method or endpoint" }, { status: 400 });
    }

    const keys = isTrading
      ? await getUserTradingApiKeys(userId)
      : await getUserApiKeys(userId);
    if (!keys) {
      return NextResponse.json(
        { error: "No Binance API keys configured. Please add your API keys in settings." },
        { status: 400 },
      );
    }

    const timestamp = Date.now();
    const allParams: Record<string, string | number> = {
      ...params,
      timestamp,
      recvWindow: 5000,
    };

    const queryString = new URLSearchParams(
      Object.entries(allParams).map(([k, v]) => [k, String(v)]),
    ).toString();

    const signature = crypto
      .createHmac("sha256", keys.secretKey)
      .update(queryString)
      .digest("hex");

    return NextResponse.json({
      apiKey: keys.apiKey,
      signature,
      timestamp,
      queryString,
    });
  } catch (error) {
    console.error("[API] binance/sign error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
