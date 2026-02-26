import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getSessionUserId,
  unauthorizedResponse,
  badRequest,
  notFound,
  serverError,
} from "@/lib/api-utils";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const { id } = await params;
    const existing = await prisma.binancePriceAlert.findFirst({
      where: { id, userId },
    });
    if (!existing) return notFound("Alert not found.");

    const body = (await req.json()) as Record<string, unknown>;
    const data: Record<string, unknown> = {};

    if (typeof body.targetPrice === "number" && body.targetPrice > 0) {
      data.targetPrice = body.targetPrice;
    }
    if (body.direction === "ABOVE" || body.direction === "BELOW") {
      data.direction = body.direction;
    }
    if (typeof body.isActive === "boolean") {
      data.isActive = body.isActive;
    }

    if (Object.keys(data).length === 0) {
      return badRequest("No valid fields to update.");
    }

    const updated = await prisma.binancePriceAlert.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch {
    return serverError();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const { id } = await params;
    const existing = await prisma.binancePriceAlert.findFirst({
      where: { id, userId },
    });
    if (!existing) return notFound("Alert not found.");

    await prisma.binancePriceAlert.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return serverError();
  }
}
