import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { cancelAttempt, finishAttempt, startAttempt, type BackoffPolicy } from "@/lib/backoff";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { signInSchema } from "@/lib/validation";

// Compared against when the email is unknown so both paths cost one bcrypt
// round and response time does not reveal which emails have accounts.
const TIMING_EQUALIZER_HASH = "$2b$12$xS5oCZJX.FY5RY5D83nuCOzk34IM1AnaIit9F.IcfnlKx24sagh4q";

const STRICT: BackoffPolicy = { freeAttempts: 5, maxDelayMs: 30_000, resetAfterMs: 15 * 60 * 1000 };
const DISTRIBUTED: BackoffPolicy = { freeAttempts: 20, maxDelayMs: 30_000, resetAfterMs: 15 * 60 * 1000 };

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
        // A per-IP request cap stops one source from hammering sign-in at all.
        if (ip && !rateLimit(`signin-ip:${ip}`, 30, 15 * 60 * 1000).ok) throw new Error("RateLimited");

        // Failed attempts slow down exponentially instead of locking the
        // account, so an attacker who knows an email can delay its owner by
        // seconds, never shut them out. With a trusted IP the strict policy is
        // scoped to that source and the account-wide policy only kicks in
        // under distributed guessing.
        const keys: [string, BackoffPolicy][] = ip
          ? [
              [`ip:${ip}:${email}`, STRICT],
              [`account:${email}`, DISTRIBUTED],
            ]
          : [[`account:${email}`, STRICT]];

        const started: [string, BackoffPolicy][] = [];
        for (const [key, policy] of keys) {
          const attempt = startAttempt(key, policy);
          if (!attempt.ok) {
            started.forEach(([startedKey]) => cancelAttempt(startedKey));
            throw new Error("RateLimited");
          }
          started.push([key, policy]);
        }

        let succeeded = false;
        try {
          const user = await prisma.user.findUnique({ where: { email } });
          const isValid = await bcrypt.compare(password, user?.password ?? TIMING_EQUALIZER_HASH);
          if (!user || !isValid) return null;
          succeeded = true;
          return { id: user.id.toString(), name: user.name, email: user.email };
        } finally {
          started.forEach(([key, policy]) => finishAttempt(key, succeeded, policy));
        }
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
