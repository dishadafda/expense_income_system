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

        const loginType = credentials.loginType as string | undefined;

        // Admin login: query users table
        if (loginType === "admin") {
          const admin = await prisma.users.findFirst({
            where: { EmailAddress: credentials.email },
          });

          if (!admin || admin.Password !== credentials.password) {
            return null;
          }

          return {
            id: String(admin.UserID),
            name: admin.UserName,
            email: admin.EmailAddress,
            role: "ADMIN" as AppRole,
            userId: admin.UserID,
            peopleId: admin.UserID,
            parentUserId: admin.UserID,
          };
        }

        // User/Employee login: query peoples table
        if (loginType === "user") {
          const person = await prisma.peoples.findFirst({
            where: { Email: credentials.email, IsActive: true },
          });

          if (!person || person.Password !== credentials.password) {
            return null;
          }

          return {
            id: String(person.PeopleID),
            name: person.PeopleName,
            email: person.Email,
            role: "USER" as AppRole,
            userId: person.PeopleID,
            peopleId: person.PeopleID,
            parentUserId: person.UserID,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.userId = u.userId ?? u.id;
        token.role = u.role;
        token.peopleId = u.peopleId ?? u.userId ?? u.id;
        token.parentUserId = u.parentUserId ?? u.userId ?? u.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sUser = session.user as any;
        sUser.userId = token.userId;
        sUser.role = token.role as AppRole;
        sUser.peopleId = (token as any).peopleId;
        sUser.parentUserId = (token as any).parentUserId;
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