import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { clientIp, rateLimit, refundLimit } from "@/lib/rate-limit";
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
        // Attempts are reserved before any async work so parallel requests
        // cannot race past the limit, and refunded on success so only failures
        // accumulate. With a trusted IP, a tight per-(IP, account) limit slows
        // guessing from one source; the per-account limit caps distributed
        // guessing. Without one, only the looser per-account limit applies so
        // a single attacker cannot quickly lock the owner out.
        const keys = ip
          ? [
              { key: `signin-ip:${ip}`, limit: 30 },
              { key: `signin-fail:${ip}:${email}`, limit: 8 },
              { key: `signin-fail:${email}`, limit: 40 },
            ]
          : [{ key: `signin-fail:${email}`, limit: 20 }];

        const reserved: string[] = [];
        for (const { key, limit } of keys) {
          if (!rateLimit(key, limit, window).ok) {
            reserved.forEach(refundLimit);
            throw new Error("RateLimited");
          }
          reserved.push(key);
        }

        const user = await prisma.user.findUnique({ where: { email } });
        const isValid = user ? await bcrypt.compare(password, user.password) : false;
        if (!user || !isValid) return null;

        // The per-IP request budget stays spent; failure counters are refunded.
        reserved.filter((key) => key.startsWith("signin-fail:")).forEach(refundLimit);
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
