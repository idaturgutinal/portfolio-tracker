import { prisma } from "@/lib/prisma";
import { getBatchQuotes, toMarketSymbol } from "@/services/marketData";
import type { CreateAlertInput, TriggeredAlert } from "@/types";

export async function getAlertsByUser(userId: string) {
  return prisma.priceAlert.findMany({
    where: { userId },
    include: { asset: { select: { name: true, assetType: true } } },
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });
}

export async function getAlertsBySymbol(userId: string, symbol: string) {
  return prisma.priceAlert.findMany({
    where: { userId, symbol },
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });
}

export async function createAlert(userId: string, input: CreateAlertInput) {
  return prisma.priceAlert.create({
    data: {
      userId,
      assetId: input.assetId,
      symbol: input.symbol,
      condition: input.condition,
      targetPrice: input.targetPrice,
    },
  });
}

export async function deleteAlert(id: string, userId: string) {
  return prisma.priceAlert.deleteMany({ where: { id, userId } });
}

export async function reactivateAlert(id: string, userId: string) {
  return prisma.priceAlert.updateMany({
    where: { id, userId },
    data: { active: true, triggeredAt: null },
  });
}

export async function checkAndFireAlerts(userId: string): Promise<TriggeredAlert[]> {
  const activeAlerts = await prisma.priceAlert.findMany({
    where: { userId, active: true },
    include: { asset: { select: { assetType: true } } },
  });

  if (activeAlerts.length === 0) return [];

  const marketSymbols = activeAlerts.map((a) =>
    toMarketSymbol(a.symbol, a.asset.assetType)
  );
  const quotes = await getBatchQuotes(marketSymbols);

  const triggered: TriggeredAlert[] = [];
  const now = new Date();

  for (const alert of activeAlerts) {
    const marketSym = toMarketSymbol(alert.symbol, alert.asset.assetType);
    const quote = quotes.get(marketSym);
    if (!quote) continue;

    const fires =
      alert.condition === "ABOVE"
        ? quote.price >= alert.targetPrice
        : quote.price <= alert.targetPrice;

    if (fires) {
      triggered.push({
        id: alert.id,
        symbol: alert.symbol,
        condition: alert.condition,
        targetPrice: alert.targetPrice,
        currentPrice: quote.price,
      });
    }
  }

  if (triggered.length > 0) {
    await prisma.priceAlert.updateMany({
      where: { id: { in: triggered.map((t) => t.id) } },
      data: { active: false, triggeredAt: now },
    });
  }

  return triggered;
}
