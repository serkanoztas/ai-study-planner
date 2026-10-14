// src/server/actions/ai-planner.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { revalidatePath } from "next/cache";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateStudyPlan() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Yetkisiz işlem.");

    const userId = session.user.id;

    try {
        const subjects = await prisma.subject.findMany({
            where: { userId },
            include: {
                topics: { where: { isCompleted: false } },
                exams: { where: { date: { gte: new Date() } } },
            },
        });

        const availability = await prisma.availabilitySlot.findMany({
            where: { userId },
        });

        if (subjects.length === 0) {
            return { error: "Plan oluşturmak için önce en az bir ders ve konu eklemelisin." };
        }

        if (availability.length === 0) {
            return { error: "Plan oluşturmak için Ayarlar kısmından müsaitlik saatleri belirlemelisin." };
        }

        const prompt = `
Sen profesyonel bir akademik koç ve akıllı çalışma planlayıcısısın. Aşağıdaki verilere dayanarak öğrenci için dengeli ve gerçekçi bir haftalık çalışma programı hazırla.

Veriler:
- Dersler ve Tamamlanmamış Konular: ${JSON.stringify(subjects)}
- Haftalık Müsaitlik Saatleri (dayOfWeek: 0=Pazar, 1=Pazartesi... 6=Cumartesi): ${JSON.stringify(availability)}

Kurallar:
1. Sınav tarihi yaklaşan derslere öncelik ver.
2. Zorluk derecelerine göre çalışma sürelerini (durationMinutes) optimize et.
3. Sadece JSON formatında, ekstra hiçbir açıklama metni eklemeden şu şemaya uygun bir dizi (array) döndür:
[
  {
    "title": "Veritabanı Normalizasyon Çalışması",
    "subjectId": "ders_id_buraya",
    "topicId": "konu_id_varsa_yoksa_null",
    "date": "YYYY-MM-DD",
    "startTime": "18:00",
    "durationMinutes": 60
  }
]
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt,
        });

        const textResponse = response.text;
        if (!textResponse) {
            throw new Error("Yapay zekâdan geçerli bir yanıt alınamadı.");
        }

        const cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const plannedTasks = JSON.parse(cleanJson);

        // 1. Önce aktif yeni bir StudyPlan oluşturalım
        const newPlan = await prisma.studyPlan.create({
            data: {
                userId,
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 hafta sonu
                isActive: true,
            }
        });

        // 2. Gelen görevleri StudyTask olarak bu plana bağlı olarak kaydedelim
        for (const task of plannedTasks) {
            await prisma.studyTask.create({
                data: {
                    userId,
                    planId: newPlan.id,
                    subjectId: task.subjectId,
                    topicId: task.topicId || null,
                    title: task.title,
                    date: new Date(task.date),
                    startTime: task.startTime || "18:00",
                    durationMinutes: task.durationMinutes || 60,
                },
            });
        }

        revalidatePath("/calendar");
        revalidatePath("/");
        return { success: true, message: "Yapay zekâ çalışma planını başarıyla oluşturdu!" };

    } catch (error: any) {
        console.error("AI Plan Error:", error);
        return { error: "Plan oluşturulurken bir hata oluştu: " + error.message };
    }
}