import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAlertsByUser, createAlert } from "@/services/alert.service";
import type { CreateAlertInput } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const alerts = await getAlertsByUser(session.user.id);
    return NextResponse.json(alerts);
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Partial<CreateAlertInput>;
    const { assetId, symbol, condition, targetPrice } = body;

    if (!assetId || !symbol || !condition || targetPrice == null) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    if (condition !== "ABOVE" && condition !== "BELOW") {
      return NextResponse.json({ error: "Condition must be ABOVE or BELOW." }, { status: 400 });
    }
    if (typeof targetPrice !== "number" || !isFinite(targetPrice) || targetPrice <= 0) {
      return NextResponse.json(
        { error: "Target price must be a positive number." },
        { status: 400 }
      );
    }
    if (typeof symbol !== "string" || symbol.trim().length === 0 || symbol.length > 20) {
      return NextResponse.json({ error: "Invalid symbol." }, { status: 400 });
    }

    const alert = await createAlert(session.user.id, body as CreateAlertInput);
    return NextResponse.json(alert, { status: 201 });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
