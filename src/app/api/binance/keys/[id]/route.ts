import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getSessionUserId,
  unauthorizedResponse,
  badRequest,
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

    const existing = await prisma.binanceApiKey.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "API key not found." },
        { status: 404 }
      );
    }

    const body = (await req.json()) as Record<string, unknown>;
    const updateData: Record<string, unknown> = {};

    if (typeof body.label === "string" && body.label.trim().length > 0) {
      updateData.label = body.label.trim();
    }

    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    if (Object.keys(updateData).length === 0) {
      return badRequest("No valid fields to update.");
    }

    const updated = await prisma.binanceApiKey.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        label: true,
        permissions: true,
        isActive: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
      },
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
