import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const existingUser = await db.profile.findUnique({
          where: { email: credentials.email }
        });

        if (existingUser) {
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            existingUser.password || ""
          );
          
          if (passwordMatch) {
            return {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
              image: existingUser.imageUrl
            };
          }
        }

        // Sign up new user
        if (credentials.name) {
          const hashedPassword = await bcrypt.hash(credentials.password, 12);
          
          const newUser = await db.profile.create({
            data: {
              email: credentials.email,
              name: credentials.name,
              password: hashedPassword,
              imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${credentials.name}`
            }
          });

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            image: newUser.imageUrl
          };
        }

        return null;
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/sign-in",
    signUp: "/sign-up"
  }
};