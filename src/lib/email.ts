import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Portfolio Tracker <onboarding@resend.dev>";

export async function sendVerificationEmail(
  to: string,
  code: string
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `${code} — your Portfolio Tracker verification code`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px;font-size:20px;color:#111">Verify your email</h2>
        <p style="margin:0 0 24px;color:#555;font-size:14px">
          Enter the code below to complete your Portfolio Tracker sign-up.
          It expires in <strong>10 minutes</strong>.
        </p>
        <div style="display:inline-block;background:#f4f4f5;border-radius:8px;padding:16px 32px;
                    font-size:32px;font-weight:700;letter-spacing:8px;color:#111;text-align:center">
          ${code}
        </div>
        <p style="margin:24px 0 0;color:#999;font-size:12px">
          If you did not request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your Portfolio Tracker password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px;font-size:20px;color:#111">Reset your password</h2>
        <p style="margin:0 0 24px;color:#555;font-size:14px">
          We received a request to reset the password for your Portfolio Tracker
          account. Click the button below to choose a new password.
          This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#111;color:#fff;border-radius:8px;
                  padding:12px 32px;font-size:14px;font-weight:600;text-decoration:none">
          Reset Password
        </a>
        <p style="margin:24px 0 0;color:#999;font-size:12px">
          If you did not request this, you can safely ignore this email.
          Your password will remain unchanged.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}
