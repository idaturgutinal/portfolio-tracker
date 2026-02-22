import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deletePortfolio } from "@/services/portfolio.service";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId: session.user.id },
      include: { _count: { select: { assets: true } } },
    });

    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
    }

    if (portfolio._count.assets > 0) {
      return NextResponse.json(
        { error: "Cannot delete a portfolio that still has assets. Remove all assets first." },
        { status: 400 }
      );
    }

    await deletePortfolio(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
