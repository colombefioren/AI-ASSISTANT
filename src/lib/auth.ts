import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
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

        // Per-IP limit slows credential stuffing; per-account limit protects one
        // account even when the attacker rotates IPs.
        const ipLimit = rateLimit(`signin-ip:${clientIp(req.headers ?? {})}`, 20, 15 * 60 * 1000);
        const accountLimit = rateLimit(`signin-account:${email}`, 8, 15 * 60 * 1000);
        if (!ipLimit.ok || !accountLimit.ok) throw new Error("RateLimited");

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

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
