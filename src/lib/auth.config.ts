import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.name = user.name;
        token.email = user.email;
        token.defaultCurrency =
          (user as { defaultCurrency?: string }).defaultCurrency ?? "USD";
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
        if (session.defaultCurrency)
          token.defaultCurrency = session.defaultCurrency;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.defaultCurrency =
          (token.defaultCurrency as string) ?? "USD";
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
};
