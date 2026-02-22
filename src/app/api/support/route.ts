import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit(`support:${session.user.id}`, 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { subject, message } = body as { subject?: unknown; message?: unknown };

    if (typeof subject !== "string" || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    if (!subject.trim()) return NextResponse.json({ error: "Subject is required." }, { status: 400 });
    if (!message.trim()) return NextResponse.json({ error: "Message is required." }, { status: 400 });
    if (message.length > 2000) return NextResponse.json({ error: "Message is too long." }, { status: 400 });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "FolioVault <noreply@foliovault.app>",
      to: "support@foliovault.app",
      replyTo: session.user.email ?? undefined,
      subject: `[Support] ${subject.trim()}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px">
          <h2 style="margin:0 0 16px;font-size:18px;color:#111">New support request</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:6px 0;color:#555;font-size:13px;width:100px">From</td><td style="padding:6px 0;font-size:13px">${session.user.name} &lt;${session.user.email}&gt;</td></tr>
            <tr><td style="padding:6px 0;color:#555;font-size:13px">Subject</td><td style="padding:6px 0;font-size:13px">${subject.trim()}</td></tr>
          </table>
          <div style="background:#f4f4f5;border-radius:8px;padding:16px;font-size:14px;color:#111;white-space:pre-wrap">${message.trim()}</div>
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
