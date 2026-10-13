// src/server/actions/availability.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Uygunluk Ekleme
export async function addAvailabilitySlot(formData: FormData) {
    const session = await auth();

    if (!session?.user?.id) throw new Error("Yetkisiz Erişim");

    const dayOfWeek = parseInt(formData.get("dayOfWeek") as string);
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;

    if (isNaN(dayOfWeek) || !startTime || !endTime) {
        if (startTime >= endTime) {
            return { error: "Bitiş saati, başlangıç saatinden daha ileri bir saat olmalıdır." };
        }
    }
    try {
        await prisma.availabilitySlot.create({
            data: {
                dayOfWeek,
                startTime,
                endTime,
                userId: session.user.id,
            },
        });

        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        return { error: "Saat aralığı eklenirken bir hata oluştu." };
    }
}

// Uygunluk Silme
export async function deleteAvailabilitySlot(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Yetkisiz işlem.");

    try {
        await prisma.availabilitySlot.delete({
            where: {
                id,
                userId: session.user.id, // Güvenlik önlemi
            },
        });

        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        return { error: "Saat aralığı silinemedi." };
    }
}