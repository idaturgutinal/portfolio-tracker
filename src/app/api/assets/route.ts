import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAsset } from "@/services/portfolio.service";
import type { CreateAssetInput } from "@/types";

const VALID_ASSET_TYPES = new Set(["STOCK", "CRYPTO", "ETF", "MUTUAL_FUND", "BOND"]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Partial<CreateAssetInput>;
    const { portfolioId, symbol, name, assetType, quantity, averageBuyPrice, currency, notes } =
      body;

    // Required field presence
    if (!portfolioId || !symbol || !name || !assetType || quantity == null || averageBuyPrice == null || !currency) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Type validation
    if (!VALID_ASSET_TYPES.has(assetType)) {
      return NextResponse.json({ error: "Invalid asset type." }, { status: 400 });
    }
    if (typeof symbol !== "string" || symbol.trim().length === 0 || symbol.length > 20) {
      return NextResponse.json(
        { error: "Symbol must be 1–20 characters." },
        { status: 400 }
      );
    }
    if (typeof name !== "string" || name.trim().length === 0 || name.length > 200) {
      return NextResponse.json(
        { error: "Name must be 1–200 characters." },
        { status: 400 }
      );
    }
    if (typeof quantity !== "number" || !isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be a positive number." }, { status: 400 });
    }
    if (typeof averageBuyPrice !== "number" || !isFinite(averageBuyPrice) || averageBuyPrice <= 0) {
      return NextResponse.json(
        { error: "Average buy price must be a positive number." },
        { status: 400 }
      );
    }
    if (typeof currency !== "string" || currency.trim().length === 0 || currency.length > 10) {
      return NextResponse.json({ error: "Invalid currency." }, { status: 400 });
    }
    if (notes !== undefined && notes !== null && typeof notes === "string" && notes.length > 1000) {
      return NextResponse.json({ error: "Notes must be 1000 characters or fewer." }, { status: 400 });
    }

    // Ownership check
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId: session.user.id },
    });
    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
    }

    const asset = await createAsset({
      ...body,
      symbol: symbol.trim().toUpperCase(),
      name: name.trim(),
      currency: currency.trim().toUpperCase(),
    } as CreateAssetInput);
    return NextResponse.json(asset, { status: 201 });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
