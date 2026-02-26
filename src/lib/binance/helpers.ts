import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

interface UserApiKeys {
  apiKey: string;
  secretKey: string;
}

/**
 * Retrieve a user's active Binance API keys from the database,
 * decrypt them, and return as plaintext.
 */
export async function getUserApiKeys(userId: string): Promise<UserApiKeys | null> {
  const keyRecord = await prisma.binanceApiKey.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      encryptedApiKey: true,
      encryptedSecret: true,
    },
  });

  if (!keyRecord) {
    return null;
  }

  // Update lastUsedAt
  await prisma.binanceApiKey.update({
    where: { id: keyRecord.id },
    data: { lastUsedAt: new Date() },
  });

  const apiKey = decrypt(keyRecord.encryptedApiKey);
  const secretKey = decrypt(keyRecord.encryptedSecret);

  return { apiKey, secretKey };
}

/**
 * Retrieve the user's trading-enabled Binance API key.
 * Selects the active key whose label does NOT contain "Read" (case-insensitive).
 * If multiple match, picks the oldest (first created = trading key).
 */
export async function getUserTradingApiKeys(userId: string): Promise<UserApiKeys | null> {
  const activeKeys = await prisma.binanceApiKey.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      label: true,
      encryptedApiKey: true,
      encryptedSecret: true,
    },
  });

  const tradingKey = activeKeys.find(
    (k) => !k.label.toLowerCase().includes("read")
  );

  if (!tradingKey) {
    return null;
  }

  await prisma.binanceApiKey.update({
    where: { id: tradingKey.id },
    data: { lastUsedAt: new Date() },
  });

  const apiKey = decrypt(tradingKey.encryptedApiKey);
  const secretKey = decrypt(tradingKey.encryptedSecret);

  return { apiKey, secretKey };
}
