// src/server/actions/academic.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// --- KONU (TOPIC) AKSİYONLARI ---

export async function createTopic(subjectId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Yetkisiz işlem.");

    const name = formData.get("name") as string;
    const difficulty = parseInt(formData.get("difficulty") as string);

    if (!name) return { error: "Konu adı zorunludur." };

    try {
        await prisma.topic.create({
            data: {
                name,
                difficulty: isNaN(difficulty) ? 2 : difficulty,
                subjectId,
            },
        });

        revalidatePath(`/subjects/${subjectId}`);
        return { success: true };
    } catch (error) {
        return { error: "Konu eklenirken hata oluştu." };
    }
}

export async function deleteTopic(id: string, subjectId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Yetkisiz işlem.");

    try {
        await prisma.topic.delete({ where: { id } });
        revalidatePath(`/subjects/${subjectId}`);
        return { success: true };
    } catch (error) {
        return { error: "Konu silinemedi." };
    }
}

export async function toggleTopicCompletion(id: string, subjectId: string, isCompleted: boolean) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Yetkisiz işlem.");

    try {
        await prisma.topic.update({
            where: { id },
            data: { isCompleted },
        });
        revalidatePath(`/subjects/${subjectId}`);
        return { success: true };
    } catch (error) {
        return { error: "Konu durumu güncellenemedi." };
    }
}

// --- SINAV (EXAM) AKSİYONLARI ---

export async function createExam(subjectId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Yetkisiz işlem.");

    const title = formData.get("title") as string;
    const dateString = formData.get("date") as string;
    const notes = formData.get("notes") as string;

    if (!title || !dateString) return { error: "Sınav adı ve tarihi zorunludur." };

    try {
        await prisma.exam.create({
            data: {
                title,
                date: new Date(dateString),
                notes,
                subjectId,
                userId: session.user.id,
            },
        });

        revalidatePath(`/subjects/${subjectId}`);
        return { success: true };
    } catch (error) {
        return { error: "Sınav eklenirken hata oluştu." };
    }
}

export async function deleteExam(id: string, subjectId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Yetkisiz işlem.");

    try {
        await prisma.exam.delete({
            where: { id, userId: session.user.id },
        });
        revalidatePath(`/subjects/${subjectId}`);
        return { success: true };
    } catch (error) {
        return { error: "Sınav silinemedi." };
    }
}