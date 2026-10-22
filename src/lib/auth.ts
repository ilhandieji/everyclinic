import { randomBytes } from "node:crypto";
import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { dummyPasswordVerify, verifyPassword } from "@/lib/password";
import { loginBodySchema } from "@/lib/validators/auth";

const THIRTY_DAYS = 30 * 24 * 60 * 60;
const ONE_DAY = 24 * 60 * 60;

function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

function clearSessionClaims(token: JWT): JWT {
  delete token.id;
  delete token.email;
  delete token.sub;
  delete token.rememberMe;
  token.error = "InvalidSession";
  return token;
}

async function revokeSessionRow(sessionToken: string | undefined) {
  if (!sessionToken) {
    return;
  }
  await prisma.session.deleteMany({
    where: { sessionToken },
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember me", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginBodySchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
          rememberMe:
            credentials?.rememberMe === "true" ||
            credentials?.rememberMe === "1",
        });

        if (!parsed.success) {
          return null;
        }

        const { email, password, rememberMe } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, passwordHash: true },
        });

        if (!user) {
          await dummyPasswordVerify(password);
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          rememberMe: rememberMe ?? false,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: THIRTY_DAYS,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const rememberMe = user.rememberMe ?? false;
        const maxAge = rememberMe ? THIRTY_DAYS : ONE_DAY;
        const sessionToken = createSessionToken();

        await prisma.session.create({
          data: {
            sessionToken,
            userId: user.id,
            expires: new Date(Date.now() + maxAge * 1000),
          },
        });

        token.id = user.id;
        token.email = user.email;
        token.rememberMe = rememberMe;
        token.sessionToken = sessionToken;
        token.exp = Math.floor(Date.now() / 1000) + maxAge;
        delete token.error;
        return token;
      }

      if (token.error === "InvalidSession") {
        await revokeSessionRow(token.sessionToken);
        return clearSessionClaims(token);
      }

      if (!token.sessionToken) {
        return clearSessionClaims(token);
      }

      const dbSession = await prisma.session.findUnique({
        where: { sessionToken: token.sessionToken },
        select: { userId: true, expires: true },
      });

      if (!dbSession || dbSession.expires <= new Date() || (token.id && dbSession.userId !== token.id)) {
        await revokeSessionRow(token.sessionToken);
        return clearSessionClaims(token);
      }

      return token;
    },
    async session({ session, token }) {
      if (token.error === "InvalidSession" || !token.id || !token.email) {
        session.error = "InvalidSession";
        session.user = {
          id: "",
          email: "",
        };
        return session;
      }

      session.user.id = token.id;
      session.user.email = token.email;
      return session;
    },
  },
  events: {
    async signOut(message) {
      const token = "token" in message ? message.token : undefined;
      const sessionToken = token?.sessionToken;
      if (!sessionToken) {
        return;
      }
      await prisma.session.deleteMany({
        where: { sessionToken },
      });
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function getSessionMaxAge(rememberMe: boolean): number {
  return rememberMe ? THIRTY_DAYS : ONE_DAY;
}

export function isAuthenticatedSession(
  session: Session | null,
): session is Session {
  return Boolean(
    session?.user?.id && session.user.email && !session.error,
  );
}
