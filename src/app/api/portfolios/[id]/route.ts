import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, unauthorizedResponse, badRequest, notFound, serverError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { deletePortfolio } from "@/services/portfolio.service";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const { id } = await params;

    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId },
      include: { _count: { select: { assets: true } } },
    });

    if (!portfolio) {
      return notFound("Portfolio not found.");
    }

    if (portfolio._count.assets > 0) {
      return badRequest("Cannot delete a portfolio that still has assets. Remove all assets first.");
    }

    await deletePortfolio(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return serverError();
  }
}
