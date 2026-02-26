import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import {
  getSessionUserId,
  unauthorizedResponse,
  badRequest,
  serverError,
} from "@/lib/api-utils";
import crypto from "crypto";

function maskKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

function generateBinanceSignature(
  queryString: string,
  secret: string
): string {
  return crypto
    .createHmac("sha256", secret)
    .update(queryString)
    .digest("hex");
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const keys = await prisma.binanceApiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        label: true,
        encryptedApiKey: true,
        permissions: true,
        isActive: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const maskedKeys = keys.map((key) => ({
      id: key.id,
      label: key.label,
      maskedApiKey: maskKey(key.encryptedApiKey.length > 20 ? "placeholder" : key.encryptedApiKey),
      permissions: key.permissions,
      isActive: key.isActive,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    }));

    return NextResponse.json(maskedKeys);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { apiKey, secretKey, label } = body;

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
      return badRequest("API Key is required.");
    }
    if (
      !secretKey ||
      typeof secretKey !== "string" ||
      secretKey.trim().length === 0
    ) {
      return badRequest("Secret Key is required.");
    }

    const keyLabel =
      label && typeof label === "string" && label.trim().length > 0
        ? label.trim()
        : "Default";

    // Test the API key by making a request to Binance
    const timestamp = Date.now().toString();
    const queryString = `timestamp=${timestamp}`;
    const signature = generateBinanceSignature(queryString, secretKey.trim());

    const testUrl = `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`;
    const testResponse = await fetch(testUrl, {
      method: "GET",
      headers: {
        "X-MBX-APIKEY": apiKey.trim(),
      },
    });

    if (!testResponse.ok) {
      const errorData = (await testResponse.json().catch(() => null)) as {
        msg?: string;
      } | null;
      return badRequest(
        `Binance API key validation failed: ${errorData?.msg ?? "Invalid API key or secret."}`
      );
    }

    // Encrypt and store
    const encryptedApiKey = encrypt(apiKey.trim());
    const encryptedSecret = encrypt(secretKey.trim());

    const newKey = await prisma.binanceApiKey.create({
      data: {
        userId,
        label: keyLabel,
        encryptedApiKey,
        encryptedSecret,
      },
    });

    return NextResponse.json(
      {
        id: newKey.id,
        label: newKey.label,
        maskedApiKey: maskKey(apiKey.trim()),
        permissions: newKey.permissions,
        isActive: newKey.isActive,
        createdAt: newKey.createdAt,
      },
      { status: 201 }
    );
  } catch {
    return serverError();
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { id } = body;

    if (!id || typeof id !== "string") {
      return badRequest("Key ID is required.");
    }

    const existing = await prisma.binanceApiKey.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "API key not found." },
        { status: 404 }
      );
    }

    await prisma.binanceApiKey.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return serverError();
  }
}
