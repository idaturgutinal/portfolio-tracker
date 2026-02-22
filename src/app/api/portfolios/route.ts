import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPortfolio, getPortfolios } from "@/services/portfolio.service";

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
    const portfolio = await createPortfolio({ name: name.trim(), userId: session.user.id });
    return NextResponse.json(portfolio, { status: 201 });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
