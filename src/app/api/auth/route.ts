import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (name) {
      // Registration flow
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      return NextResponse.json(
        { message: "User created successfully" },
        { status: 201 }
      );
    } else {
      // Login flow
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          message: "Login successful",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
