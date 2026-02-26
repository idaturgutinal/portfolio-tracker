import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, unauthorizedResponse, badRequest, conflictResponse, serverError } from "@/lib/api-utils";
import { createPortfolio, getPortfolios } from "@/services/portfolio.service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();
  const portfolios = await getPortfolios(userId);
  return NextResponse.json(portfolios);
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();
  try {
    const { name } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return badRequest("Portfolio name is required.");
    }

    const trimmed = name.trim();

    // Check for duplicate name (SQLite LIKE is case-insensitive by default for ASCII)
    const existing = await prisma.portfolio.findFirst({
      where: {
        userId,
        name: { equals: trimmed },
      },
    });
    if (existing) {
      return conflictResponse("A portfolio with this name already exists.");
    }

    const portfolio = await createPortfolio({ name: trimmed, userId });
    return NextResponse.json(portfolio, { status: 201 });
  } catch {
    return serverError();
  }
}
