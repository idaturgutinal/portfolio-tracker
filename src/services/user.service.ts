import { prisma } from "@/lib/prisma";
import type { UserProfile } from "@/types";

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserProfile(id: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, defaultCurrency: true, createdAt: true, password: true },
  });
  if (!user) return null;
  return { ...user, createdAt: user.createdAt.toISOString(), hasPassword: !!user.password };
}

export async function updateUserProfile(
  id: string,
  data: { name?: string; email?: string; defaultCurrency?: string }
) {
  return prisma.user.update({ where: { id }, data });
}

export async function updateUserPassword(id: string, hash: string) {
  return prisma.user.update({ where: { id }, data: { password: hash } });
}

export async function deleteUserAccount(id: string) {
  return prisma.user.delete({ where: { id } });
}

export async function getUserExportData(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      defaultCurrency: true,
      createdAt: true,
      portfolios: {
        select: {
          id: true,
          name: true,
          createdAt: true,
          assets: {
            select: {
              id: true,
              symbol: true,
              name: true,
              assetType: true,
              quantity: true,
              averageBuyPrice: true,
              currency: true,
              notes: true,
              createdAt: true,
              transactions: {
                select: {
                  id: true,
                  type: true,
                  quantity: true,
                  pricePerUnit: true,
                  fees: true,
                  date: true,
                  notes: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getUserAssetsFlat(id: string) {
  const portfolios = await prisma.portfolio.findMany({
    where: { userId: id },
    select: {
      name: true,
      assets: {
        select: {
          id: true,
          symbol: true,
          name: true,
          assetType: true,
          quantity: true,
          averageBuyPrice: true,
          currency: true,
          notes: true,
          createdAt: true,
        },
      },
    },
  });
  return portfolios.flatMap((p) =>
    p.assets.map((a) => ({ ...a, portfolioName: p.name }))
  );
}

export async function getUserTransactionsFlat(id: string) {
  return prisma.transaction.findMany({
    where: { asset: { portfolio: { userId: id } } },
    select: {
      id: true,
      type: true,
      quantity: true,
      pricePerUnit: true,
      fees: true,
      date: true,
      notes: true,
      asset: {
        select: {
          symbol: true,
          name: true,
          portfolio: { select: { name: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });
}
