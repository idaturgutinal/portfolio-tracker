import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, unauthorizedResponse, badRequest, notFound, serverError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { createTransaction } from "@/services/transaction.service";
import type { CreateTransactionInput } from "@/types";

const VALID_TYPES = new Set(["BUY", "SELL", "DIVIDEND"]);

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const body = (await req.json()) as Partial<CreateTransactionInput>;
    const { assetId, type, quantity, pricePerUnit, date, fees, notes } = body;

    // Required fields
    if (!assetId || !type || quantity == null || pricePerUnit == null || !date) {
      return badRequest("Missing required fields.");
    }

    // Type validation
    if (!VALID_TYPES.has(type)) {
      return badRequest("Invalid transaction type.");
    }
    if (typeof quantity !== "number" || !isFinite(quantity) || quantity <= 0) {
      return badRequest("Quantity must be a positive number.");
    }
    if (typeof pricePerUnit !== "number" || !isFinite(pricePerUnit) || pricePerUnit < 0) {
      return badRequest("Price per unit must be a non-negative number.");
    }
    if (fees !== undefined && fees !== null) {
      if (typeof fees !== "number" || !isFinite(fees) || fees < 0) {
        return badRequest("Fees must be a non-negative number.");
      }
    }

    // Date validation
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return badRequest("Invalid date.");
    }
    if (parsedDate > new Date()) {
      return badRequest("Transaction date cannot be in the future.");
    }

    if (notes !== undefined && notes !== null && typeof notes === "string" && notes.length > 1000) {
      return badRequest("Notes must be 1000 characters or fewer.");
    }

    // Ownership check
    const asset = await prisma.asset.findFirst({
      where: { id: assetId, portfolio: { userId } },
    });
    if (!asset) {
      return notFound("Asset not found.");
    }

    // For SELL, check sufficient quantity
    if (type === "SELL" && asset.quantity < quantity) {
      return badRequest(`Insufficient quantity. You hold ${asset.quantity} units.`);
    }

    const transaction = await createTransaction(body as CreateTransactionInput);
    return NextResponse.json(transaction, { status: 201 });
  } catch {
    return serverError();
  }
}
