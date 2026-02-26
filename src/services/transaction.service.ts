import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/types";
import type { CreateTransactionInput } from "@/types";

export async function getTransactionsByUser(userId: string) {
  return prisma.transaction.findMany({
    where: { asset: { portfolio: { userId } } },
    include: {
      asset: {
        include: { portfolio: { select: { id: true, name: true } } },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function getTransactions(assetId: string) {
  return prisma.transaction.findMany({
    where: { assetId },
    orderBy: { date: "desc" },
  });
}

export async function createTransaction(input: CreateTransactionInput) {
  const transaction = await prisma.transaction.create({
    data: {
      assetId: input.assetId,
      type: input.type as TransactionType,
      quantity: input.quantity,
      pricePerUnit: input.pricePerUnit,
      fees: input.fees ?? 0,
      date: new Date(input.date),
      notes: input.notes,
    },
  });

  await syncAssetAfterTransaction(input.assetId, input);

  return transaction;
}

async function syncAssetAfterTransaction(
  assetId: string,
  input: CreateTransactionInput
) {
  if (input.type === "DIVIDEND") return;

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) {
    throw new Error(`Asset not found: ${assetId}`);
  }

  if (input.type === "BUY") {
    if (input.quantity <= 0) {
      throw new Error("Buy quantity must be positive.");
    }
    const newQuantity = asset.quantity + input.quantity;
    const newAverage =
      newQuantity > 0
        ? (asset.quantity * asset.averageBuyPrice + input.quantity * input.pricePerUnit) /
          newQuantity
        : 0;

    await prisma.asset.update({
      where: { id: assetId },
      data: { quantity: newQuantity, averageBuyPrice: newAverage },
    });
  } else if (input.type === "SELL") {
    if (input.quantity <= 0) {
      throw new Error("Sell quantity must be positive.");
    }
    if (asset.quantity < input.quantity) {
      throw new Error(
        `Insufficient quantity: cannot sell ${input.quantity}, only ${asset.quantity} held.`
      );
    }
    await prisma.asset.update({
      where: { id: assetId },
      data: { quantity: { decrement: input.quantity } },
    });
  }
}
