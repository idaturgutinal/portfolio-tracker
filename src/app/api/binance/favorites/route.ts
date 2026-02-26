import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getSessionUserId,
  unauthorizedResponse,
  badRequest,
  serverError,
} from "@/lib/api-utils";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const favorites = await prisma.favoritePair.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(favorites);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { symbol } = body;

    if (!symbol || typeof symbol !== "string") {
      return badRequest("Symbol is required.");
    }

    const maxOrder = await prisma.favoritePair.findFirst({
      where: { userId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const favorite = await prisma.favoritePair.create({
      data: {
        userId,
        symbol: symbol.toUpperCase(),
        sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch {
    return serverError();
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { symbol } = body;

    if (!symbol || typeof symbol !== "string") {
      return badRequest("Symbol is required.");
    }

    const existing = await prisma.favoritePair.findUnique({
      where: { userId_symbol: { userId, symbol: symbol.toUpperCase() } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Favorite not found." }, { status: 404 });
    }

    await prisma.favoritePair.delete({ where: { id: existing.id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return serverError();
  }
}
