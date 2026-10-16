// src/app/(dashboard)/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Target, Clock, CheckCircle2, Calendar as CalendarIcon, Play, Plus, Sparkles, BrainCircuit, ArrowRight } from "lucide-react";
import FloatingCharacter from "@/components/FloatingCharacter";

export default async function DashboardPage() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return null;

    // 1. İstatistikleri Çek
    const subjectCount = await prisma.subject.count({ where: { userId } });

    const completedSessions = await prisma.studySession.findMany({
        where: { userId, status: { in: ["COMPLETED", "PARTIAL"] } }
    });

    const completedTasksCount = completedSessions.length;
    const totalStudyMinutes = completedSessions.reduce((acc, curr) => acc + (curr.actualDuration || 0), 0);
    const totalHours = Math.floor(totalStudyMinutes / 60);

    // 2. Bugünün Görevlerini Çek
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysTasks = await prisma.studyTask.findMany({
        where: { userId, date: { gte: today, lt: tomorrow } },
        include: { subject: true },
        orderBy: { startTime: 'asc' }
    });

    return (
        <div className="mx-auto max-w-6xl space-y-8 pb-10">
            {/* 1. HERO BÖLÜMÜ (Glassmorphism & Aurora Glow) */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 sm:p-12 text-white shadow-2xl border border-slate-800/60 group">
                {/* Arka Plan Glow Efektleri */}
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-600/30 blur-[80px] mix-blend-screen group-hover:bg-violet-500/40 transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-10 -mb-10 w-64 h-64 rounded-full bg-fuchsia-600/20 blur-[60px] mix-blend-screen"></div>
                {/* Gürültü (Noise) Kaplaması - Premium Hissiyat İçin */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 backdrop-blur-md border border-white/10 shadow-inner">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                            <span className="text-sm font-medium text-slate-200 tracking-wide">AI Asistanın Devrede</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                            Merhaba, {session?.user?.name?.split(" ")[0] || "Öğrenci"} 👋
                        </h1>
                        <p className="text-lg text-slate-300 max-w-lg leading-relaxed font-medium">
                            Bugünkü çalışma planın seni hedeflerine bir adım daha yaklaştırıyor. Odaklanma zamanı geldi.
                        </p>
                    </div>

                    {/* Animasyonlu Karakterimiz */}
                    <FloatingCharacter />
                </div>
            </div>

            {/* 2. BENTO GRID: İSTATİSTİK KARTLARI */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Günlük Hedef", value: "1", sub: "/ 4 saat", icon: Target, color: "emerald" },
                    { title: "Toplam Çalışma", value: totalHours.toString(), sub: "saat", icon: Clock, color: "violet" },
                    { title: "Tamamlanan", value: completedTasksCount.toString(), sub: "görev", icon: CheckCircle2, color: "fuchsia" },
                    { title: "Kayıtlı Ders", value: subjectCount.toString(), sub: "adet", icon: CalendarIcon, color: "orange" },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="group relative overflow-hidden rounded-3xl bg-white p-6 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-violet-200">
                            {/* Kart İçi Hafif Glow */}
                            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full bg-${stat.color}-500/5 blur-[40px] group-hover:bg-${stat.color}-500/10 transition-colors duration-500`}></div>

                            <div className="relative z-10 flex items-center gap-5">
                                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                    <Icon size={26} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 mb-1">{stat.title}</p>
                                    <p className="text-2xl font-black text-slate-900 tracking-tight">
                                        {stat.value} <span className="text-sm font-medium text-slate-400">{stat.sub}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* 3. BUGÜNÜN PROGRAMI */}
                <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm lg:col-span-2 flex flex-col relative overflow-hidden">
                    <div className="mb-8 flex items-center justify-between relative z-10">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                Bugünün Programı
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-xs font-bold">{todaysTasks.length}</span>
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Yapay zekâ tarafından optimize edildi.</p>
                        </div>
                        <Link href="/calendar" className="group flex items-center gap-1 rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-100 transition-colors">
                            Tümünü Gör <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {todaysTasks.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-violet-600 mb-5 shadow-inner">
                                <Sparkles size={32} />
                            </div>
                            <h3 className="font-bold text-slate-800 text-xl">Bugün için planın yok</h3>
                            <p className="mt-2 text-sm text-slate-500 max-w-sm">AI asistanın harika bir program hazırlamak için seni bekliyor.</p>
                            <Link href="/calendar" className="mt-6 px-6 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-600/20 transition-all">
                                Plan Oluştur
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3 relative z-10">
                            {todaysTasks.map(task => (
                                <Link href={`/session/${task.id}`} key={task.id} className="group relative flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-violet-300 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                                    {/* Hover'da kayan arkaplan animasyonu */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    <div className="relative z-10 flex items-center gap-5">
                                        <div className="w-1.5 h-12 rounded-full" style={{ backgroundColor: task.subject?.color || '#8b5cf6' }}></div>
                                        <div>
                                            <p className="font-bold text-slate-900 group-hover:text-violet-900 transition-colors">{task.title}</p>
                                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.subject?.color || '#8b5cf6' }}></span>
                                                {task.subject?.name} • {task.durationMinutes} dakika
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative z-10 flex items-center gap-4">
                                        <span className="text-sm font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{task.startTime}</span>
                                        <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white shadow-sm group-hover:scale-110 transition-all duration-300">
                                            <Play size={16} className="ml-0.5 fill-current" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* 4. HIZLI İŞLEMLER (Premium Butonlar) */}
                <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                    <h2 className="mb-8 text-xl font-bold text-slate-900">Hızlı İşlemler</h2>
                    <div className="space-y-4">
                        <Link href="/calendar" className="group relative flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-300 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5 overflow-hidden">
                            <div className="absolute inset-0 bg-violet-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <span className="block font-bold text-slate-800 group-hover:text-violet-900 transition-colors">Yapay Zeka ile Planla</span>
                                    <span className="text-xs font-medium text-slate-500">Programını otomatik oluştur</span>
                                </div>
                            </div>
                        </Link>

                        <Link href="/calendar" className="group relative flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 overflow-hidden">
                            <div className="absolute inset-0 bg-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                    <Play size={20} className="ml-0.5 fill-current" />
                                </div>
                                <div>
                                    <span className="block font-bold text-slate-800 group-hover:text-emerald-900 transition-colors">Odaklanma Başlat</span>
                                    <span className="text-xs font-medium text-slate-500">Pomodoro sayacını aç</span>
                                </div>
                            </div>
                        </Link>

                        <Link href="/subjects" className="group relative flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-300 hover:border-fuchsia-300 hover:shadow-lg hover:shadow-fuchsia-500/10 hover:-translate-y-0.5 overflow-hidden">
                            <div className="absolute inset-0 bg-fuchsia-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-600 group-hover:bg-fuchsia-600 group-hover:text-white transition-colors duration-300">
                                    <Plus size={20} strokeWidth={3} />
                                </div>
                                <div>
                                    <span className="block font-bold text-slate-800 group-hover:text-fuchsia-900 transition-colors">Yeni Ders Ekle</span>
                                    <span className="text-xs font-medium text-slate-500">Müfredatını genişlet</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}