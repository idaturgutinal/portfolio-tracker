import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSessionUserId, unauthorizedResponse, badRequest, tooManyRequests } from "@/lib/api-utils";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rate-limit";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  const rl = rateLimit(`support:${userId}`, 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    return tooManyRequests(undefined, rl.resetAt - Date.now());
  }

  try {
    // We need the full session for user name/email in the email
    const session = await auth();

    const body = await req.json();
    const { subject, message } = body as { subject?: unknown; message?: unknown };

    if (typeof subject !== "string" || typeof message !== "string") {
      return badRequest("Invalid request.");
    }
    if (!subject.trim()) return badRequest("Subject is required.");
    if (!message.trim()) return badRequest("Message is required.");
    if (message.length > 2000) return badRequest("Message is too long.");

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "FolioVault <noreply@foliovault.app>",
      to: "support@foliovault.app",
      replyTo: session?.user?.email ?? undefined,
      subject: `[Support] ${subject.trim()}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px">
          <h2 style="margin:0 0 16px;font-size:18px;color:#111">New support request</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:6px 0;color:#555;font-size:13px;width:100px">From</td><td style="padding:6px 0;font-size:13px">${escapeHtml(session?.user?.name ?? "")} &lt;${escapeHtml(session?.user?.email ?? "")}&gt;</td></tr>
            <tr><td style="padding:6px 0;color:#555;font-size:13px">Subject</td><td style="padding:6px 0;font-size:13px">${escapeHtml(subject.trim())}</td></tr>
          </table>
          <div style="background:#f4f4f5;border-radius:8px;padding:16px;font-size:14px;color:#111;white-space:pre-wrap">${escapeHtml(message.trim())}</div>
        </div>
      `,
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[support]", err);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }
}
