import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export type AppRole = "ADMIN" | "USER";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        loginType: { label: "Login Type", type: "text" }, // "admin" or "user"
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.users.findFirst({
          where: {
            EmailAddress: credentials.email,
          },
        });

        if (!user || user.Password !== credentials.password) {
          return null;
        }

        // Logic: Admin if email is admin@company.com
        const role: AppRole = user.EmailAddress.toLowerCase() === "admin@company.com" ? "ADMIN" : "USER";

        // Optional: Reject if loginType doesn't match actual role to enforce the UI tabs
        if (credentials.loginType === "admin" && role !== "ADMIN") return null;
        if (credentials.loginType === "user" && role !== "USER") return null;

        return {
          id: String(user.UserID),
          name: user.UserName,
          email: user.EmailAddress,
          role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        // @ts-expect-error custom role
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sUser = session.user as any;
        sUser.userId = token.userId;
        sUser.role = token.role as AppRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}