import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, unauthorizedResponse, serverError } from "@/lib/api-utils";
import { deleteAlert, reactivateAlert } from "@/services/alert.service";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const { id } = await params;
    await deleteAlert(id, userId);
    return new NextResponse(null, { status: 204 });
  } catch {
    return serverError();
  }
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const { id } = await params;
    await reactivateAlert(id, userId);
    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}
