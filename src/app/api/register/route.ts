import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fieldErrors, registerSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check the highlighted fields.", fields: fieldErrors(parsed.error) },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const ip = clientIp(req.headers);
  // Counted only after validation. Without a trusted client IP, fall back to
  // one shared, looser bucket; set TRUST_PROXY behind a proxy you control.
  const limit = ip
    ? rateLimit(`register:${ip}`, 5, 15 * 60 * 1000)
    : rateLimit("register:shared", 60, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many sign-up attempts. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    await prisma.user.create({
      data: { name, email, password: await bcrypt.hash(password, 12) },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "An account with this email already exists.", fields: { email: "Already registered. Sign in instead." } },
        { status: 409 }
      );
    }
    console.error("Registration failed", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
