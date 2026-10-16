// src/app/(dashboard)/calendar/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar as CalendarIcon, Clock, AlertCircle, Sparkles, Play, CalendarDays, ArrowRight } from "lucide-react";
import Link from "next/link";
import { generateStudyPlan } from "@/server/actions/ai-planner";

const DAYS_OF_WEEK = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export default async function CalendarPage() {
    const session = await auth();

    // Yaklaşan sınavları getir
    const exams = await prisma.exam.findMany({
        where: {
            userId: session?.user?.id,
            date: { gte: new Date() }
        },
        include: { subject: true },
        orderBy: { date: 'asc' }
    });

    // Müsaitlik saatlerini getir
    const availability = await prisma.availabilitySlot.findMany({
        where: { userId: session?.user?.id },
    });

    // Oluşturulan çalışma görevlerini getir
    const tasks = await prisma.studyTask.findMany({
        where: { userId: session?.user?.id },
        include: { subject: true, topic: true },
        orderBy: { date: 'asc' }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* 1. ÜST BAŞLIK & AI BUTONU */}
            <div className="relative overflow-hidden rounded-[2rem] bg-white p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-violet-500/10 blur-[40px] pointer-events-none"></div>

                <div className="relative z-10 flex items-center gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-sm border border-violet-100">
                        <CalendarDays size={26} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Çalışma Takvimi</h1>
                        <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">Haftalık planını incele ve yapay zekâ ile programını optimize et.</p>
                    </div>
                </div>

                <div className="relative z-10 w-full md:w-auto">
                    <form action={async () => {
                        "use server";
                        await generateStudyPlan();
                    }}>
                        <button type="submit" className="group relative flex w-full md:w-auto items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-xl shadow-slate-900/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all overflow-hidden">
                            {/* Hover'da ortaya çıkan Violet->Fuchsia Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <span className="relative z-10 flex items-center gap-2">
                                <Sparkles size={18} className="text-violet-300 group-hover:text-white transition-colors" />
                                AI ile Plan Oluştur
                            </span>
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* SOL: Haftalık Izgara (Takvim Görünümü - lg:col-span-3) */}
                <div className="lg:col-span-3 bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden flex flex-col relative">

                    {/* Takvim Üst Barı (Günler) */}
                    <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                        {DAYS_OF_WEEK.map((day, index) => (
                            <div key={day} className="p-4 text-center border-r border-slate-100 last:border-r-0">
                                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">{day.slice(0, 3)}</span>
                                <span className="hidden sm:block text-[10px] font-medium text-slate-400 mt-0.5">{day}</span>
                            </div>
                        ))}
                    </div>

                    {/* Takvim Gövdesi */}
                    <div className="grid grid-cols-7 min-h-[600px] bg-slate-50/20">
                        {DAYS_OF_WEEK.map((day, i) => {
                            const dbDayIndex = i === 6 ? 0 : i + 1; // Pazar=0, Pzt=1 formatına çevir
                            const daySlots = availability.filter(slot => slot.dayOfWeek === dbDayIndex);

                            return (
                                <div key={day} className="border-r border-slate-100 last:border-r-0 p-2 sm:p-3 flex flex-col gap-3 relative group hover:bg-slate-50/50 transition-colors">

                                    {/* Müsaitlik Göstergesi */}
                                    {daySlots.length > 0 && (
                                        <div className="space-y-1.5 mb-2">
                                            {daySlots.map(slot => (
                                                <div key={slot.id} className="text-[10px] font-bold text-slate-500 bg-white border border-dashed border-slate-200 rounded-lg px-2 py-1.5 flex items-center justify-center gap-1 shadow-sm">
                                                    <Clock size={12} className="text-slate-400" />
                                                    {slot.startTime} - {slot.endTime}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* AI Tarafından Atanan Görevler / Oturumlar */}
                                    <div className="space-y-2.5 flex-1">
                                        {tasks.map(task => {
                                            const taskDate = new Date(task.date);
                                            const taskDay = taskDate.getDay();

                                            if (taskDay === dbDayIndex) {
                                                const subjectColor = task.subject?.color || '#8b5cf6';

                                                return (
                                                    <Link
                                                        href={`/session/${task.id}`}
                                                        key={task.id}
                                                        className="group/task relative block rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                                                        style={{
                                                            backgroundColor: `${subjectColor}15`, // %15 opacity arka plan
                                                            border: `1px solid ${subjectColor}30`
                                                        }}
                                                    >
                                                        {/* Sol Taraf Kalın Renk Çizgisi (Apple Calendar Style) */}
                                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl" style={{ backgroundColor: subjectColor }}></div>

                                                        <div className="flex flex-col gap-1.5 ml-1">
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider truncate" style={{ color: subjectColor }}>
                                                                    {task.subject?.name}
                                                                </span>
                                                                <Play size={12} style={{ color: subjectColor }} className="opacity-0 group-hover/task:opacity-100 transition-opacity" />
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-2">
                                                                {task.title}
                                                            </p>
                                                            <span className="text-[10px] font-semibold text-slate-600 bg-white/60 w-fit px-1.5 py-0.5 rounded border" style={{ borderColor: `${subjectColor}20` }}>
                                                                {task.startTime} ({task.durationMinutes} dk)
                                                            </span>
                                                        </div>
                                                    </Link>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SAĞ: Yaklaşan Sınavlar ve Bildirimler (lg:col-span-1) */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-7 shadow-sm sticky top-6">
                        <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
                            <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                                <AlertCircle size={20} strokeWidth={2.5} />
                            </div>
                            Sınavlar
                        </h3>

                        <div className="space-y-4">
                            {exams.length === 0 ? (
                                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-sm text-slate-500 font-medium">Yaklaşan sınavın yok.</p>
                                </div>
                            ) : (
                                exams.map(exam => (
                                    <div key={exam.id} className="relative bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all group overflow-hidden">
                                        <div className="absolute inset-0 bg-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: exam.subject.color || '#f97316' }} />
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{exam.subject.name}</span>
                                            </div>
                                            <h4 className="text-base font-bold text-slate-900 leading-snug mb-2">{exam.title}</h4>

                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 w-fit px-2.5 py-1 rounded-lg border border-orange-100">
                                                <Clock size={12} />
                                                {new Date(exam.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} • {new Date(exam.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <Link href="/subjects" className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all">
                            Tüm Dersleri Yönet <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}