// src/server/actions/subject.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createSubject(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Yetkisiz işlem.");

    const name = formData.get("name") as string;
    const color = formData.get("color") as string;
    const priority = parseInt(formData.get("priority") as string);

    if (!name) return { error: "Ders adı zorunludur." };

    try {
        await prisma.subject.create({
            data: {
                name,
                color: color || "#3b82f6",
                priority: isNaN(priority) ? 1 : priority,
                userId: session.user.id,
            },
        });

        revalidatePath("/subjects");
        return { success: true };
    } catch (error) {
        return { error: "Ders eklenirken bir hata oluştu." };
    }
}

export async function deleteSubject(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Yetkisiz işlem.");

    try {
        await prisma.subject.delete({
            where: {
                id,
                userId: session.user.id, // Güvenlik: Sadece kendi dersini silebilir
            },
        });

        revalidatePath("/subjects");
        return { success: true };
    } catch (error) {
        return { error: "Ders silinemedi." };
    }
}