/**
 * Runtime environment variable validation.
 * Uses lazy getters so validation happens at first access, not at import/build time.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Check your .env file or deployment settings.`
    );
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const env = {
  get AUTH_SECRET() {
    return required("AUTH_SECRET");
  },
  get RESEND_API_KEY() {
    return required("RESEND_API_KEY");
  },
  get DATABASE_URL() {
    return optional("DATABASE_URL", "file:./dev.db");
  },
  get NEXTAUTH_URL() {
    return optional("NEXTAUTH_URL", "http://localhost:3000");
  },
  get EMAIL_FROM() {
    return optional("EMAIL_FROM", "Portfolio Tracker <onboarding@resend.dev>");
  },
};
