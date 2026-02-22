import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await assertOwner(id, session.user.id);
    if (!existing) {
      return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    }

    const body = (await req.json()) as UpdateAssetInput;

    // Validate optional fields that are present
    if (body.assetType !== undefined && !VALID_ASSET_TYPES.has(body.assetType)) {
      return NextResponse.json({ error: "Invalid asset type." }, { status: 400 });
    }
    if (body.symbol !== undefined) {
      const s = body.symbol.trim();
      if (!s || s.length > 20) {
        return NextResponse.json({ error: "Symbol must be 1–20 characters." }, { status: 400 });
      }
      body.symbol = s.toUpperCase();
    }
    if (body.name !== undefined) {
      const n = body.name.trim();
      if (!n || n.length > 200) {
        return NextResponse.json({ error: "Name must be 1–200 characters." }, { status: 400 });
      }
      body.name = n;
    }
    if (body.quantity !== undefined) {
      if (typeof body.quantity !== "number" || !isFinite(body.quantity) || body.quantity <= 0) {
        return NextResponse.json({ error: "Quantity must be a positive number." }, { status: 400 });
      }
    }
    if (body.averageBuyPrice !== undefined) {
      if (
        typeof body.averageBuyPrice !== "number" ||
        !isFinite(body.averageBuyPrice) ||
        body.averageBuyPrice <= 0
      ) {
        return NextResponse.json(
          { error: "Average buy price must be a positive number." },
          { status: 400 }
        );
      }
    }
    if (body.currency !== undefined) {
      body.currency = body.currency.trim().toUpperCase();
      if (!body.currency || body.currency.length > 10) {
        return NextResponse.json({ error: "Invalid currency." }, { status: 400 });
      }
    }
    if (body.notes !== undefined && body.notes !== null) {
      if (typeof body.notes === "string" && body.notes.length > 1000) {
        return NextResponse.json(
          { error: "Notes must be 1000 characters or fewer." },
          { status: 400 }
        );
      }
    }

    const asset = await updateAsset(id, body);
    return NextResponse.json(asset);
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await assertOwner(id, session.user.id);
    if (!existing) {
      return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    }

    await deleteAsset(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
