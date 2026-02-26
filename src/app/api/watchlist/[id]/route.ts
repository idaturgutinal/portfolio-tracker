import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, unauthorizedResponse, serverError } from "@/lib/api-utils";
import { removeFromWatchlist } from "@/services/watchlist.service";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const { id } = await params;
    await removeFromWatchlist(id, userId);
    return new NextResponse(null, { status: 204 });
  } catch {
    return serverError();
  }
}
