import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getSessionUserId,
  unauthorizedResponse,
  badRequest,
  serverError,
} from "@/lib/api-utils";

const MAX_ALERTS_PER_USER = 20;

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const alerts = await prisma.binancePriceAlert.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(alerts);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { symbol, targetPrice, direction, notifyEmail } = body;

    if (!symbol || typeof symbol !== "string") {
      return badRequest("Symbol is required.");
    }
    if (typeof targetPrice !== "number" || targetPrice <= 0) {
      return badRequest("Target price must be a positive number.");
    }
    if (direction !== "ABOVE" && direction !== "BELOW") {
      return badRequest("Direction must be ABOVE or BELOW.");
    }

    const count = await prisma.binancePriceAlert.count({ where: { userId } });
    if (count >= MAX_ALERTS_PER_USER) {
      return badRequest(`Maximum ${MAX_ALERTS_PER_USER} alerts allowed.`);
    }

    const alert = await prisma.binancePriceAlert.create({
      data: {
        userId,
        symbol: symbol.toUpperCase(),
        targetPrice,
        direction,
        notifyEmail: notifyEmail === true,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch {
    return serverError();
  }
}
