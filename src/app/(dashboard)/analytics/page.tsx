// src/app/(dashboard)/analytics/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BarChart3, TrendingUp, Clock, BookOpen, Target, Award, CheckCircle2 } from "lucide-react";

export default async function AnalyticsPage() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return null;

    // 1. Tamamlanan tüm çalışma oturumlarını (StudySession) ve bağlı olduğu dersleri getir
    const completedSessions = await prisma.studySession.findMany({
        where: {
            userId,
            status: { in: ["COMPLETED", "PARTIAL"] } //tam ve kısmi pomodoroları sayar
        },
        include: {
            task: {
                include: { subject: true }
            }
        }
    });

    // 2. İstatistik Hesaplamaları
    const totalStudyMinutes = completedSessions.reduce((acc, curr) => acc + (curr.actualDuration || 0), 0);
    const totalHours = Math.floor(totalStudyMinutes / 60);
    const totalMinutes = totalStudyMinutes % 60;
    const completedTasksCount = completedSessions.length;

    // 3. Ders Bazlı Çalışma Süreleri (Gruplama)
    const subjectStats: Record<string, { name: string, color: string, duration: number }> = {};

    completedSessions.forEach(session => {
        const subject = session.task.subject;
        if (!subjectStats[subject.id]) {
            subjectStats[subject.id] = {
                name: subject.name,
                color: subject.color || '#8b5cf6',
                duration: 0
            };
        }
        subjectStats[subject.id].duration += (session.actualDuration || 0);
    });

    // En çok çalışılandan en aza doğru sırala
    const sortedSubjects = Object.values(subjectStats).sort((a, b) => b.duration - a.duration);
    const maxSubjectDuration = sortedSubjects.length > 0 ? sortedSubjects[0].duration : 1;
    const topSubject = sortedSubjects.length > 0 ? sortedSubjects[0].name : "Henüz Yok";

    return (
        <div className="mx-auto max-w-6xl space-y-8">
            {/* Üst Kısım: Başlık ve Özet */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-100 text-fuchsia-600">
                            <BarChart3 size={24} />
                        </div>
                        Çalışma Analizi
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Performansını takip et ve hedeflerine ne kadar yaklaştığını gör.</p>
                </div>
            </div>

            {/* Özet Kartları */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="group flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                            <Clock size={20} />
                        </div>
                        <h3 className="font-semibold text-slate-600">Toplam Süre</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-slate-900">{totalHours}</span>
                        <span className="text-slate-500 font-medium">sa</span>
                        <span className="text-4xl font-extrabold text-slate-900 ml-2">{totalMinutes}</span>
                        <span className="text-slate-500 font-medium">dk</span>
                    </div>
                </div>

                <div className="group flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                            <CheckCircle2 size={20} />
                        </div>
                        <h3 className="font-semibold text-slate-600">Tamamlanan Oturum</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-slate-900">{completedTasksCount}</span>
                        <span className="text-slate-500 font-medium">görev</span>
                    </div>
                </div>

                <div className="group flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                            <Award size={20} />
                        </div>
                        <h3 className="font-semibold text-slate-600">En Çok Çalışılan</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-slate-900 line-clamp-1">{topSubject}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Derslere Göre Dağılım (Yatay Bar Grafiği) */}
                <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
                    <h2 className="mb-6 text-xl font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen size={20} className="text-violet-600" /> Derslere Göre Dağılım
                    </h2>

                    <div className="space-y-6">
                        {sortedSubjects.length === 0 ? (
                            <p className="text-center text-slate-500 py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                Henüz tamamlanmış bir çalışma oturumu bulunmuyor.
                            </p>
                        ) : (
                            sortedSubjects.map((subject, index) => {
                                const percentage = Math.max(5, (subject.duration / maxSubjectDuration) * 100);
                                const hours = Math.floor(subject.duration / 60);
                                const mins = subject.duration % 60;

                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span className="text-slate-700 flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
                                                {subject.name}
                                            </span>
                                            <span className="text-slate-500">
                                                {hours > 0 ? `${hours}sa ` : ''}{mins}dk
                                            </span>
                                        </div>
                                        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out relative"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: subject.color
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Motivasyon ve AI Tavsiyeleri Alanı */}
                <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-violet-600 to-fuchsia-600 p-7 shadow-sm text-white relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>

                    <div className="relative z-10">
                        <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
                            <TrendingUp size={20} className="text-fuchsia-200" /> Gelişim Raporu
                        </h2>

                        {sortedSubjects.length > 0 ? (
                            <div className="space-y-4">
                                <p className="text-violet-100 text-lg leading-relaxed">
                                    Harika gidiyorsun! En çok odaklandığın ders <strong className="text-white">{topSubject}</strong> olmuş.
                                    Bu ivmeyi koruyarak diğer derslerine de zaman ayırmayı unutma.
                                </p>
                                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 mt-6">
                                    <h4 className="font-semibold mb-2 text-fuchsia-100 flex items-center gap-2">
                                        <Target size={16} /> Koçun Tavsiyesi
                                    </h4>
                                    <p className="text-sm text-white/90">
                                        Sınavlarına yaklaşırken, daha az zaman ayırdığın derslere (listede alt sıralarda olanlara) yönelik kısa tekrar seansları oluşturabilirsin. Takvim üzerinden "AI ile Plan Oluştur" diyerek programını güncellemeyi unutma!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-violet-100 text-lg leading-relaxed mt-4">
                                İlk çalışma oturumunu tamamladığında gelişim raporun ve AI koçunun tavsiyeleri burada belirecek.
                                Hadi, takvimden bir görev seçip kronometreyi başlat!
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}