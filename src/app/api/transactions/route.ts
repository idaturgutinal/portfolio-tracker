import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTransaction } from "@/services/transaction.service";
import type { CreateTransactionInput } from "@/types";

const VALID_TYPES = new Set(["BUY", "SELL", "DIVIDEND"]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Partial<CreateTransactionInput>;
    const { assetId, type, quantity, pricePerUnit, date, fees, notes } = body;

    // Required fields
    if (!assetId || !type || quantity == null || pricePerUnit == null || !date) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Type validation
    if (!VALID_TYPES.has(type)) {
      return NextResponse.json({ error: "Invalid transaction type." }, { status: 400 });
    }
    if (typeof quantity !== "number" || !isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be a positive number." }, { status: 400 });
    }
    if (typeof pricePerUnit !== "number" || !isFinite(pricePerUnit) || pricePerUnit < 0) {
      return NextResponse.json(
        { error: "Price per unit must be a non-negative number." },
        { status: 400 }
      );
    }
    if (fees !== undefined && fees !== null) {
      if (typeof fees !== "number" || !isFinite(fees) || fees < 0) {
        return NextResponse.json({ error: "Fees must be a non-negative number." }, { status: 400 });
      }
    }

    // Date validation
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    }
    if (parsedDate > new Date()) {
      return NextResponse.json({ error: "Transaction date cannot be in the future." }, { status: 400 });
    }

    if (notes !== undefined && notes !== null && typeof notes === "string" && notes.length > 1000) {
      return NextResponse.json({ error: "Notes must be 1000 characters or fewer." }, { status: 400 });
    }

    // Ownership check
    const asset = await prisma.asset.findFirst({
      where: { id: assetId, portfolio: { userId: session.user.id } },
    });
    if (!asset) {
      return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    }

    // For SELL, check sufficient quantity
    if (type === "SELL" && asset.quantity < quantity) {
      return NextResponse.json(
        { error: `Insufficient quantity. You hold ${asset.quantity} units.` },
        { status: 400 }
      );
    }

    const transaction = await createTransaction(body as CreateTransactionInput);
    return NextResponse.json(transaction, { status: 201 });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
