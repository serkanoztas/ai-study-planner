// src/server/actions/session.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function completeStudySession(taskId: string, durationMinutes: number) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Yetkisiz işlem.");

    try {
        // 1. Gerçekleşen oturumu (StudySession) kaydet
        await prisma.studySession.create({
            data: {
                userId: session.user.id,
                taskId: taskId,
                actualStartTime: new Date(Date.now() - durationMinutes * 60 * 1000), // Süre kadar geçmişe git
                actualEndTime: new Date(),
                actualDuration: Math.round(durationMinutes),
                status: "COMPLETED",
            },
        });

        // 2. İlgili görevin (StudyTask) durumunu güncellemek istersen (opsiyonel)
        // Şemanda isCompleted yok ama ileride eklersen burada güncelleyebilirsin.

        revalidatePath("/calendar");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Session Error:", error);
        return { error: "Oturum kaydedilemedi." };
    }
}