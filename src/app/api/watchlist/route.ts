import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, unauthorizedResponse, badRequest, conflictResponse, serverError } from "@/lib/api-utils";
import { getWatchlistByUser, addToWatchlist } from "@/services/watchlist.service";
import { Prisma } from "@prisma/client";
import type { CreateWatchlistItemInput } from "@/types";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const items = await getWatchlistByUser(userId);
    return NextResponse.json(items);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const body = (await req.json()) as Partial<CreateWatchlistItemInput>;
    const { symbol, name, assetType } = body;

    if (!symbol || typeof symbol !== "string" || symbol.trim().length === 0 || symbol.length > 20) {
      return badRequest("Invalid symbol.");
    }
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return badRequest("Name is required.");
    }
    if (!assetType || typeof assetType !== "string") {
      return badRequest("Asset type is required.");
    }

    const item = await addToWatchlist(userId, body as CreateWatchlistItemInput);
    return NextResponse.json(item, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return conflictResponse("This symbol is already in your watchlist.");
    }
    return serverError();
  }
}
