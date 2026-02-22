import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getWatchlistByUser, addToWatchlist } from "@/services/watchlist.service";
import { Prisma } from "@prisma/client";
import type { CreateWatchlistItemInput } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await getWatchlistByUser(session.user.id);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Partial<CreateWatchlistItemInput>;
    const { symbol, name, assetType } = body;

    if (!symbol || typeof symbol !== "string" || symbol.trim().length === 0 || symbol.length > 20) {
      return NextResponse.json({ error: "Invalid symbol." }, { status: 400 });
    }
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!assetType || typeof assetType !== "string") {
      return NextResponse.json({ error: "Asset type is required." }, { status: 400 });
    }

    const item = await addToWatchlist(session.user.id, body as CreateWatchlistItemInput);
    return NextResponse.json(item, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "This symbol is already in your watchlist." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}