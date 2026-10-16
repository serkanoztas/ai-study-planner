// src/server/actions/chat.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { revalidatePath } from "next/cache";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function sendMessage(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Yetkisiz işlem.");

    const userId = session.user.id;
    const content = formData.get("message") as string;
    let conversationId = formData.get("conversationId") as string;

    if (!content || content.trim() === "") return { error: "Mesaj boş olamaz." };

    try {
        // 1. Eğer aktif bir sohbet yoksa yeni bir tane oluştur
        if (!conversationId) {
            const newConv = await prisma.chatConversation.create({
                data: { userId, title: "Yeni Sohbet" }
            });
            conversationId = newConv.id;
        }

        // 2. Kullanıcının mesajını veritabanına kaydet
        await prisma.chatMessage.create({
            data: {
                conversationId,
                role: "USER",
                content,
            }
        });

        // 3. BAĞLAM (CONTEXT) VERİLERİNİ ÇEKME
        // a. Yaklaşan Sınavlar
        const upcomingExams = await prisma.exam.findMany({
            where: { userId, date: { gte: new Date() } },
            select: { title: true, date: true, subject: { select: { name: true } } }
        });

        // b. Tamamlanan veya Kısmi Tamamlanan Oturumlar (Analytics Verisi)
        const completedSessions = await prisma.studySession.findMany({
            where: {
                userId,
                status: { in: ["COMPLETED", "PARTIAL"] }
            }
        });

        const totalStudyMinutes = completedSessions.reduce((acc, curr) => acc + (curr.actualDuration || 0), 0);
        const totalHours = Math.floor(totalStudyMinutes / 60);
        const completedTasksCount = completedSessions.length;
        const recentActivitySummary = `Bugüne kadar toplam ${completedTasksCount} görev tamamlandı ve ${totalHours} saat (${totalStudyMinutes} dakika) çalışıldı.`;

        // c. Aktif Dersler ve Tamamlanmamış Konular
        // Sadece adı, önceliği ve konuları alıyoruz (veriyi küçültmek ve AI'ın kafasını karıştırmamak için select kullanıyoruz)
        const activeSubjects = await prisma.subject.findMany({
            where: { userId },
            select: {
                name: true,
                priority: true, // 1: Düşük, 2: Orta, 3: Yüksek
                topics: {
                    where: { isCompleted: false },
                    select: { name: true, difficulty: true } // 1: Kolay, 2: Orta, 3: Zor
                }
            }
        });

        // 4. Gemini'ye gönderilecek sistem komutunu (Prompt) hazırla
        const prompt = `
Sen "EduCoach" adında profesyonel, motive edici ve anlayışlı bir akademik yapay zekâ koçusun.
Şu an danışmanın olan öğrenciyle (Serkan Öztaş) konuşuyorsun. 
Öğrencinin Akdeniz Üniversitesi Yönetim Bilişim Sistemleri (YBS) 4. sınıf öğrencisi olduğunu unutma.

Öğrencinin Verileri:
- Yaklaşan Sınavları: ${JSON.stringify(upcomingExams)}
- Genel Çalışma İstatistiği: ${recentActivitySummary}
- Aktif Dersleri ve Tamamlanmamış Konuları (Öncelik/Zorluk: 1=Düşük/Kolay, 2=Orta, 3=Yüksek/Zor): ${JSON.stringify(activeSubjects)}

Öğrencinin son mesajı: "${content}"

Kurallar:
1. Öğrenciye her zaman destekleyici, samimi ve motive edici bir dille yaklaş.
2. Yaklaşan sınavları varsa onları hatırlat ve taktikler ver.
3. Çalışma istatistiğini dikkate al. Az çalışmışsa motivasyon ver, çok çalışmışsa (10+ saat) dinlenmesini tavsiye et.
4. "Ne çalışmalıyım?" gibi konularda zorluk (difficulty) ve ders önceliği (priority) yüksek olan tamamlanmamış konuları önceliklendir.
5. Mesajlarını kısa, okunabilir ve net paragraflar halinde yaz. Markdown (kalın, liste vb.) kullan.
`;

        // 5. Gemini API çağrısı
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt,
        });

        const aiMessage = response.text;

        if (aiMessage) {
            // 6. Yapay zekânın cevabını veritabanına kaydet
            await prisma.chatMessage.create({
                data: {
                    conversationId,
                    role: "AI",
                    content: aiMessage,
                }
            });
        }

        revalidatePath("/ai-coach");
        return { success: true, conversationId };

    } catch (error: any) {
        console.error("Chat Error:", error);
        return { error: "Mesaj gönderilirken bir hata oluştu. API yoğun olabilir." };
    }
}

