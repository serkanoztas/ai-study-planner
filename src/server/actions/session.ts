// src/server/actions/session.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function completeStudySession(taskId: string, actualDurationMinutes: number) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Yetkisiz işlem.");

    try {
        // 1. Görevin asıl hedeflenen süresini bul
        const task = await prisma.studyTask.findUnique({
            where: { id: taskId, userId: session.user.id }
        });

        if (!task) return { error: "Görev bulunamadı." };

        // 2. Çok kısaysa kaydetme (Yanlışlıkla basılmış olabilir)
        if (actualDurationMinutes < 3) {
            return { success: true, message: "Oturum çok kısa olduğu için kaydedilmedi." };
        }

        // 3. Durumu (Status) belirle (Hedefin %85-90'ı tamamlandıysa başarılı say)
        const completionRatio = actualDurationMinutes / task.durationMinutes;
        const sessionStatus = completionRatio >= 0.85 ? "COMPLETED" : "PARTIAL";

        // 4. Oturumu kaydet
        await prisma.studySession.create({
            data: {
                userId: session.user.id,
                taskId: taskId,
                actualStartTime: new Date(Date.now() - actualDurationMinutes * 60 * 1000),
                actualEndTime: new Date(),
                actualDuration: Math.round(actualDurationMinutes),
                status: sessionStatus,
            },
        });

        // İstersen StudyTask'in kendi durumunu da burada güncelleyebilirsin
        // Örn: if (sessionStatus === "COMPLETED") { await prisma.studyTask.update(...) }

        revalidatePath("/calendar");
        revalidatePath("/analytics");
        return { success: true };
    } catch (error) {
        console.error("Session Error:", error);
        return { error: "Oturum kaydedilemedi." };
    }
}