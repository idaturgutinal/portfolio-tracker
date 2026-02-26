import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, unauthorizedResponse, serverError } from "@/lib/api-utils";
import { searchSymbols } from "@/services/marketData";

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const q = req.nextUrl.searchParams.get("q")?.trim().slice(0, 100) ?? "";
    const results = await searchSymbols(q);
    return NextResponse.json(results);
  } catch {
    return serverError();
  }
}
