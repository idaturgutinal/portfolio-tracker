import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, unauthorizedResponse, badRequest, notFound, serverError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { createAsset } from "@/services/portfolio.service";
import type { CreateAssetInput } from "@/types";

const VALID_ASSET_TYPES = new Set(["STOCK", "CRYPTO", "ETF", "MUTUAL_FUND", "BOND"]);

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const body = (await req.json()) as Partial<CreateAssetInput>;
    const { portfolioId, symbol, name, assetType, quantity, averageBuyPrice, currency, notes } =
      body;

    // Required field presence
    if (!portfolioId || !symbol || !name || !assetType || quantity == null || averageBuyPrice == null || !currency) {
      return badRequest("Missing required fields.");
    }

    // Type validation
    if (!VALID_ASSET_TYPES.has(assetType)) {
      return badRequest("Invalid asset type.");
    }
    if (typeof symbol !== "string" || symbol.trim().length === 0 || symbol.length > 20) {
      return badRequest("Symbol must be 1–20 characters.");
    }
    if (typeof name !== "string" || name.trim().length === 0 || name.length > 200) {
      return badRequest("Name must be 1–200 characters.");
    }
    if (typeof quantity !== "number" || !isFinite(quantity) || quantity <= 0) {
      return badRequest("Quantity must be a positive number.");
    }
    if (typeof averageBuyPrice !== "number" || !isFinite(averageBuyPrice) || averageBuyPrice <= 0) {
      return badRequest("Average buy price must be a positive number.");
    }
    if (typeof currency !== "string" || currency.trim().length === 0 || currency.length > 10) {
      return badRequest("Invalid currency.");
    }
    if (notes !== undefined && notes !== null && typeof notes === "string" && notes.length > 1000) {
      return badRequest("Notes must be 1000 characters or fewer.");
    }

    // Ownership check
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId },
    });
    if (!portfolio) {
      return notFound("Portfolio not found.");
    }

    const asset = await createAsset({
      ...body,
      symbol: symbol.trim().toUpperCase(),
      name: name.trim(),
      currency: currency.trim().toUpperCase(),
    } as CreateAssetInput);
    return NextResponse.json(asset, { status: 201 });
  } catch {
    return serverError();
  }
}
