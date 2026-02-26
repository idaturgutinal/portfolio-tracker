import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, unauthorizedResponse, badRequest, notFound, serverError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { updateAsset, deleteAsset } from "@/services/portfolio.service";
import type { UpdateAssetInput } from "@/services/portfolio.service";

const VALID_ASSET_TYPES = new Set(["STOCK", "CRYPTO", "ETF", "MUTUAL_FUND", "BOND"]);

async function assertOwner(assetId: string, userId: string) {
  return prisma.asset.findFirst({
    where: { id: assetId, portfolio: { userId } },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const { id } = await params;
    const existing = await assertOwner(id, userId);
    if (!existing) {
      return notFound("Asset not found.");
    }

    const body = (await req.json()) as UpdateAssetInput;

    // Validate optional fields that are present
    if (body.assetType !== undefined && !VALID_ASSET_TYPES.has(body.assetType)) {
      return badRequest("Invalid asset type.");
    }
    if (body.symbol !== undefined) {
      const s = body.symbol.trim();
      if (!s || s.length > 20) {
        return badRequest("Symbol must be 1–20 characters.");
      }
      body.symbol = s.toUpperCase();
    }
    if (body.name !== undefined) {
      const n = body.name.trim();
      if (!n || n.length > 200) {
        return badRequest("Name must be 1–200 characters.");
      }
      body.name = n;
    }
    if (body.quantity !== undefined) {
      if (typeof body.quantity !== "number" || !isFinite(body.quantity) || body.quantity <= 0) {
        return badRequest("Quantity must be a positive number.");
      }
    }
    if (body.averageBuyPrice !== undefined) {
      if (
        typeof body.averageBuyPrice !== "number" ||
        !isFinite(body.averageBuyPrice) ||
        body.averageBuyPrice <= 0
      ) {
        return badRequest("Average buy price must be a positive number.");
      }
    }
    if (body.currency !== undefined) {
      body.currency = body.currency.trim().toUpperCase();
      if (!body.currency || body.currency.length > 10) {
        return badRequest("Invalid currency.");
      }
    }
    if (body.notes !== undefined && body.notes !== null) {
      if (typeof body.notes === "string" && body.notes.length > 1000) {
        return badRequest("Notes must be 1000 characters or fewer.");
      }
    }

    const asset = await updateAsset(id, body);
    return NextResponse.json(asset);
  } catch {
    return serverError();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const { id } = await params;
    const existing = await assertOwner(id, userId);
    if (!existing) {
      return notFound("Asset not found.");
    }

    await deleteAsset(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return serverError();
  }
}
