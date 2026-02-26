import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CURRENT_LEGAL_VERSION } from "@/lib/legal-version";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { version } = (await req.json()) as { version?: string };

    if (!version || version !== CURRENT_LEGAL_VERSION) {
      return NextResponse.json({ error: "Invalid version" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        legalConsentVersion: version,
        legalConsentAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
