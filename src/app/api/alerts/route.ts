import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, unauthorizedResponse, badRequest, serverError } from "@/lib/api-utils";
import { getAlertsByUser, createAlert } from "@/services/alert.service";
import type { CreateAlertInput } from "@/types";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const alerts = await getAlertsByUser(userId);
    return NextResponse.json(alerts);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const body = (await req.json()) as Partial<CreateAlertInput>;
    const { assetId, symbol, condition, targetPrice } = body;

    if (!assetId || !symbol || !condition || targetPrice == null) {
      return badRequest("Missing required fields.");
    }
    if (condition !== "ABOVE" && condition !== "BELOW") {
      return badRequest("Condition must be ABOVE or BELOW.");
    }
    if (typeof targetPrice !== "number" || !isFinite(targetPrice) || targetPrice <= 0) {
      return badRequest("Target price must be a positive number.");
    }
    if (typeof symbol !== "string" || symbol.trim().length === 0 || symbol.length > 20) {
      return badRequest("Invalid symbol.");
    }

    const alert = await createAlert(userId, body as CreateAlertInput);
    return NextResponse.json(alert, { status: 201 });
  } catch {
    return serverError();
  }
}
