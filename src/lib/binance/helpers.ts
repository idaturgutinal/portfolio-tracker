/**
 * Helper functions for Binance API integration.
 * Database operations are placeholder — will be connected after merge.
 */

interface UserApiKeys {
  apiKey: string;
  secretKey: string;
}

/**
 * Retrieve a user's active Binance API keys.
 *
 * PLACEHOLDER: Currently reads from environment variables.
 * After merge, this will query the database for the user's encrypted keys
 * and decrypt them.
 *
 * @param _userId - The user ID (unused in placeholder implementation)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUserApiKeys(userId: string): Promise<UserApiKeys | null> {
  // TODO: After merge, use userId to query DB for encrypted keys and decrypt them
  const apiKey = process.env.BINANCE_API_KEY;
  const secretKey = process.env.BINANCE_SECRET_KEY;

  if (!apiKey || !secretKey) {
    return null;
  }

  return { apiKey, secretKey };
}

/**
 * Placeholder decrypt function.
 * After merge, this will use the actual decryption logic.
 */
export function decryptApiKey(encryptedKey: string): string {
  // TODO: Implement actual decryption after merge
  return encryptedKey;
}
