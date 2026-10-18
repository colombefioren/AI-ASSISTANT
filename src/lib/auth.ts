import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { clientIp, peekLimit, rateLimit } from "@/lib/rate-limit";
import { signInSchema } from "@/lib/validation";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const ip = clientIp(req.headers ?? {});
        const window = 15 * 60 * 1000;
        // Only failed attempts count. The per-(IP, account) key slows guessing
        // from one source; the looser per-account key caps distributed guessing
        // without letting a single attacker lock the real owner out quickly.
        const pairKey = `signin-fail:${ip ?? "unknown"}:${email}`;
        const accountKey = `signin-fail:${email}`;
        if (ip && !rateLimit(`signin-ip:${ip}`, 30, window).ok) throw new Error("RateLimited");
        if (!peekLimit(pairKey, 8, window).ok || !peekLimit(accountKey, 40, window).ok) {
          throw new Error("RateLimited");
        }

        const user = await prisma.user.findUnique({ where: { email } });
        const isValid = user ? await bcrypt.compare(password, user.password) : false;
        if (!user || !isValid) {
          rateLimit(pairKey, 8, window);
          rateLimit(accountKey, 40, window);
          return null;
        }

        return { id: user.id.toString(), name: user.name, email: user.email };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id;
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions);
}
