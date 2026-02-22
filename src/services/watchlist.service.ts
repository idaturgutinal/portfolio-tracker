import { prisma } from "@/lib/prisma";
import type { CreateWatchlistItemInput } from "@/types";

export async function getWatchlistByUser(userId: string) {
  return prisma.watchlistItem.findMany({
    where: { userId },
    orderBy: { addedAt: "desc" },
  });
}

export async function addToWatchlist(
  userId: string,
  input: CreateWatchlistItemInput
) {
  return prisma.watchlistItem.create({
    data: {
      userId,
      symbol: input.symbol.trim().toUpperCase(),
      name: input.name.trim(),
      assetType: input.assetType,
      notes: input.notes?.trim() || null,
    },
  });
}

export async function removeFromWatchlist(id: string, userId: string) {
  return prisma.watchlistItem.deleteMany({ where: { id, userId } });
}