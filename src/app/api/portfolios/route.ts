import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPortfolio, getPortfolios } from "@/services/portfolio.service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const portfolios = await getPortfolios(session.user.id);
  return NextResponse.json(portfolios);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { name } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Portfolio name is required." }, { status: 400 });
    }

    const trimmed = name.trim();

    // Check for duplicate name (SQLite LIKE is case-insensitive by default for ASCII)
    const existing = await prisma.portfolio.findFirst({
      where: {
        userId: session.user.id,
        name: { equals: trimmed },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A portfolio with this name already exists." },
        { status: 409 }
      );
    }

    const portfolio = await createPortfolio({ name: trimmed, userId: session.user.id });
    return NextResponse.json(portfolio, { status: 201 });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
