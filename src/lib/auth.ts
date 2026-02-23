import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { rateLimit } from "@/lib/rate-limit";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    defaultCurrency?: string;
  }
  interface Session {
    user: { id: string; defaultCurrency: string } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        // Rate limit: 5 attempts per email per 15 minutes
        const rl = rateLimit(`login:${email}`, 5, 15 * 60 * 1000);
        if (!rl.allowed) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          defaultCurrency: user.defaultCurrency,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Google sign-in: upsert user in DB
      if (account?.provider === "google" && user?.email) {
        let dbUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              name: user.name ?? "User",
              email: user.email,
              password: null,
            },
          });
        }
        token.id = dbUser.id;
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.defaultCurrency = dbUser.defaultCurrency;
        return token;
      }
      // Credentials sign-in / token refresh
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
        if (session.defaultCurrency) token.defaultCurrency = session.defaultCurrency;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.defaultCurrency = (token.defaultCurrency as string) ?? "USD";
      }
      return session;
    },
  },
});
