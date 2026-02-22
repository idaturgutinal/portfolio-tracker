import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchSymbols } from "@/services/marketData";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const q = req.nextUrl.searchParams.get("q")?.trim().slice(0, 100) ?? "";
    const results = await searchSymbols(q);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
