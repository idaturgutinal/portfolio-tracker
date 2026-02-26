import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getSessionUserId,
  unauthorizedResponse,
  badRequest,
  serverError,
} from "@/lib/api-utils";

export async function PUT(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { symbols } = body;

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return badRequest("Symbols array is required.");
    }

    for (const [index, symbol] of symbols.entries()) {
      if (typeof symbol !== "string") continue;
      await prisma.favoritePair.updateMany({
        where: { userId, symbol: symbol.toUpperCase() },
        data: { sortOrder: index },
      });
    }

    const updated = await prisma.favoritePair.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(updated);
  } catch {
    return serverError();
  }
}
