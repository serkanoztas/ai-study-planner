// src/lib/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET,
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" }, // Credentials provider kullanıldığında JWT zorunludur
    pages: {
        signIn: "/login", // Özel giriş sayfamızın rotası
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Şifre", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Geçersiz giriş bilgileri.");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                });

                if (!user || !user.password) {
                    throw new Error("Kullanıcı bulunamadı.");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Hatalı şifre.");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        }
    }
});