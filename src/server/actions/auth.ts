// src/server/actions/auth.ts
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function register(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        return { error: "Tüm alanları doldurunuz." };
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return { error: "Bu e-posta adresi zaten kullanılıyor." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return { success: true };
    } catch (error) {
        return { error: "Kayıt sırasında bir hata oluştu." };
    }
}

export async function login(formData: FormData) {
    try {
        await signIn("credentials", {
            ...Object.fromEntries(formData),
            redirectTo: "/dashboard", 
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "E-posta veya şifre hatalı." };
                default:
                    return { error: "Giriş yapılamadı, lütfen tekrar deneyin." };
            }
        }
        throw error;
    }
}