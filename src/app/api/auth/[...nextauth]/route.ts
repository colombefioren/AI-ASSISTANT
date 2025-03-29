// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

// Type definitions for credentials
interface Credentials {
  email: string;
  password: string;
}

// Type definitions for user returned from authorize
interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<AuthUser | null> {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Missing credentials');
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error('No user found with this email');
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET as string,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };