import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { removeFromWatchlist } from "@/services/watchlist.service";

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
    await removeFromWatchlist(id, session.user.id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}