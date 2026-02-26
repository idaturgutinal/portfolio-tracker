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
