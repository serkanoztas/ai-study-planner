// src/app/(dashboard)/analytics/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BarChart3, TrendingUp, Clock, BookOpen, Target, Award, CheckCircle2 } from "lucide-react";

export default async function AnalyticsPage() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return null;

    // 1. Tamamlanan tüm çalışma oturumlarını getir
    const completedSessions = await prisma.studySession.findMany({
        where: {
            userId,
            status: { in: ["COMPLETED", "PARTIAL"] }
        },
        include: {
            task: { include: { subject: true } }
        }
    });

    // 2. İstatistik Hesaplamaları
    const totalStudyMinutes = completedSessions.reduce((acc, curr) => acc + (curr.actualDuration || 0), 0);
    const totalHours = Math.floor(totalStudyMinutes / 60);
    const totalMinutes = totalStudyMinutes % 60;
    const completedTasksCount = completedSessions.length;

    // 3. Ders Bazlı Çalışma Süreleri
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

    const sortedSubjects = Object.values(subjectStats).sort((a, b) => b.duration - a.duration);
    const maxSubjectDuration = sortedSubjects.length > 0 ? sortedSubjects[0].duration : 1;
    const topSubject = sortedSubjects.length > 0 ? sortedSubjects[0].name : "Henüz Yok";

    return (
        <div className="mx-auto max-w-6xl space-y-8 pb-10">

            {/* 1. ÜST BAŞLIK */}
            <div className="relative overflow-hidden rounded-[2rem] bg-white p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-fuchsia-500/10 blur-[40px] pointer-events-none"></div>

                <div className="relative z-10 flex items-center gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600 shadow-sm border border-fuchsia-100">
                        <BarChart3 size={26} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Çalışma Analizi</h1>
                        <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">Performansını takip et ve hedeflerine ne kadar yaklaştığını gör.</p>
                    </div>
                </div>
            </div>

            {/* 2. ÖZET KARTLARI (Bento Grid) */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="group relative overflow-hidden rounded-[2rem] bg-white p-7 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-violet-200 transition-all duration-300">
                    <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-violet-500/5 blur-[30px] group-hover:bg-violet-500/10 transition-colors duration-500"></div>
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                <Clock size={22} strokeWidth={2.5} />
                            </div>
                            <h3 className="font-bold text-slate-600">Toplam Süre</h3>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-4xl font-black text-slate-900 tracking-tight">{totalHours}</span>
                            <span className="text-sm font-semibold text-slate-400 mr-2">saat</span>
                            <span className="text-4xl font-black text-slate-900 tracking-tight">{totalMinutes}</span>
                            <span className="text-sm font-semibold text-slate-400">dk</span>
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-[2rem] bg-white p-7 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300">
                    <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-emerald-500/5 blur-[30px] group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                <CheckCircle2 size={22} strokeWidth={2.5} />
                            </div>
                            <h3 className="font-bold text-slate-600">Tamamlanan Oturum</h3>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-4xl font-black text-slate-900 tracking-tight">{completedTasksCount}</span>
                            <span className="text-sm font-semibold text-slate-400">görev</span>
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-[2rem] bg-white p-7 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-orange-200 transition-all duration-300">
                    <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-orange-500/5 blur-[30px] group-hover:bg-orange-500/10 transition-colors duration-500"></div>
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                <Award size={22} strokeWidth={2.5} />
                            </div>
                            <h3 className="font-bold text-slate-600">En Çok Çalışılan</h3>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-2xl font-black text-slate-900 tracking-tight line-clamp-1">{topSubject}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 3. DERSLERE GÖRE DAĞILIM (Yatay Progress Bar) */}
                <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
                    <h2 className="mb-8 text-xl font-bold text-slate-900 flex items-center gap-2">
                        <div className="bg-violet-100 p-2 rounded-xl text-violet-600">
                            <BookOpen size={20} strokeWidth={2.5} />
                        </div>
                        Ders Dağılımı
                    </h2>

                    <div className="space-y-7">
                        {sortedSubjects.length === 0 ? (
                            <div className="text-center text-slate-500 py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="font-medium">Henüz tamamlanmış bir çalışma oturumu bulunmuyor.</p>
                            </div>
                        ) : (
                            sortedSubjects.map((subject, index) => {
                                const percentage = Math.max(5, (subject.duration / maxSubjectDuration) * 100);
                                const hours = Math.floor(subject.duration / 60);
                                const mins = subject.duration % 60;

                                return (
                                    <div key={index} className="space-y-3 group">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span className="text-slate-800 flex items-center gap-2.5">
                                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: subject.color }} />
                                                {subject.name}
                                            </span>
                                            <span className="text-slate-500">
                                                {hours > 0 ? `${hours}sa ` : ''}{mins}dk
                                            </span>
                                        </div>
                                        <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out relative group-hover:opacity-90"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: subject.color
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 4. GELİŞİM RAPORU (AI Koç Tavsiyesi - Premium Glassmorphism) */}
                <div className="rounded-[2rem] border border-slate-100 bg-slate-950 p-8 shadow-2xl text-white relative overflow-hidden flex flex-col justify-between group">
                    {/* Aurora Arka Plan Efektleri */}
                    <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-fuchsia-600/30 blur-[60px] mix-blend-screen group-hover:bg-fuchsia-500/40 transition-colors duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-violet-600/30 blur-[60px] mix-blend-screen"></div>

                    <div className="relative z-10 flex flex-col h-full">
                        <h2 className="mb-6 text-xl font-bold flex items-center gap-2">
                            <div className="bg-white/10 p-2 rounded-xl text-fuchsia-300 backdrop-blur-md border border-white/5">
                                <TrendingUp size={20} strokeWidth={2.5} />
                            </div>
                            Gelişim Raporu
                        </h2>

                        {sortedSubjects.length > 0 ? (
                            <div className="space-y-6 flex-1 flex flex-col justify-between">
                                <p className="text-slate-200 text-lg leading-relaxed font-medium">
                                    Harika gidiyorsun! En çok odaklandığın ders <strong className="text-white font-extrabold">{topSubject}</strong> olmuş.
                                    Bu ivmeyi koruyarak diğer derslerine de zaman ayırmayı unutma.
                                </p>

                                {/* Glassmorphism Tavsiye Kartı */}
                                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-lg mt-auto">
                                    <h4 className="font-bold mb-3 text-fuchsia-300 flex items-center gap-2 text-sm uppercase tracking-wider">
                                        <Target size={16} /> Koçun Tavsiyesi
                                    </h4>
                                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                        Sınavlarına yaklaşırken, daha az zaman ayırdığın derslere yönelik kısa tekrar seansları oluşturabilirsin. Takvim üzerinden "AI ile Plan Oluştur" diyerek programını güncellemeyi unutma!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center flex-1 text-center mt-4">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-white/10">
                                    <Clock size={24} />
                                </div>
                                <p className="text-slate-300 text-lg leading-relaxed font-medium max-w-sm">
                                    İlk çalışma oturumunu tamamladığında gelişim raporun ve AI koçunun tavsiyeleri burada belirecek.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}