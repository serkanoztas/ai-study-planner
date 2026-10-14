// src/app/(dashboard)/calendar/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar as CalendarIcon, Clock, AlertCircle, Sparkles, CheckCircle2, Play } from "lucide-react";
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
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Üst Kısım: Başlık ve AI Plan Oluşturma Butonu */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarIcon size={24} className="text-violet-600" /> Çalışma Takvimi
                    </h1>
                    <p className="text-slate-500 mt-1">Haftalık planını incele ve yapay zekâ ile yeni oturumlar oluştur.</p>
                </div>

                <div className="flex items-center gap-3">
                    <form action={async () => {
                        "use server";
                        await generateStudyPlan();
                    }}>
                        <button type="submit" className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-md shadow-purple-500/20 cursor-pointer">
                            <Sparkles size={18} className="text-fuchsia-200" />
                            AI ile Plan Oluştur
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* SOL: Haftalık Izgara (Takvim Görünümü) */}
                <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                    {/* Takvim Üst Barı (Günler) */}
                    <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70">
                        {DAYS_OF_WEEK.map((day) => (
                            <div key={day} className="p-3 text-center border-r border-slate-200 last:border-r-0">
                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{day}</span>
                            </div>
                        ))}
                    </div>

                    {/* Takvim Gövdesi (Hücreler ve AI Görevleri) */}
                    <div className="grid grid-cols-7 min-h-[550px] bg-slate-50/30">
                        {DAYS_OF_WEEK.map((day, i) => {
                            const dbDayIndex = i === 6 ? 0 : i + 1;
                            const daySlots = availability.filter(slot => slot.dayOfWeek === dbDayIndex);

                            return (
                                <div key={day} className="border-r border-slate-200 last:border-r-0 p-2 flex flex-col gap-2 relative group">
                                    {/* Müsaitlik Göstergesi */}
                                    {daySlots.length > 0 && (
                                        <div className="space-y-1 mb-2">
                                            {daySlots.map(slot => (
                                                <div key={slot.id} className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-md px-1.5 py-1 flex items-center justify-center gap-1 shadow-xs">
                                                    <Clock size={10} />
                                                    {slot.startTime} - {slot.endTime}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* AI Tarafından Atanan Görevler / Oturumlar */}
                                    <div className="space-y-2 flex-1">
                                        {tasks.map(task => {
                                            const taskDate = new Date(task.date);
                                            const taskDay = taskDate.getDay(); // 0: Pazar, 1: Pazartesi...

                                            if (taskDay === dbDayIndex) {
                                                return (
                                                    <Link
                                                        href={`/session/${task.id}`}
                                                        key={task.id}
                                                        className="bg-white border border-violet-100 rounded-xl p-2.5 shadow-xs hover:shadow-md hover:border-violet-300 transition-all block cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.subject?.color || '#8b5cf6' }} />
                                                            <span className="text-[10px] font-bold text-slate-700 truncate">{task.subject?.name}</span>
                                                        </div>
                                                        <p className="text-xs font-semibold text-slate-900 leading-tight">{task.title}</p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-[10px] font-medium text-slate-500">
                                                                {task.startTime} ({task.durationMinutes} dk)
                                                            </span>
                                                            <Play size={12} className="text-violet-500" />
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

                {/* SAĞ: Yaklaşan Sınavlar ve Bildirimler */}
                <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <AlertCircle size={18} className="text-orange-500" /> Yaklaşan Sınavlar
                        </h3>

                        <div className="space-y-3">
                            {exams.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">Yaklaşan sınavın yok.</p>
                            ) : (
                                exams.map(exam => (
                                    <div key={exam.id} className="bg-orange-50/70 border border-orange-100 p-3.5 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: exam.subject.color || '#f97316' }} />
                                            <span className="text-xs font-semibold text-slate-700">{exam.subject.name}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900">{exam.title}</h4>
                                        <p className="text-xs font-medium text-orange-600 mt-1">
                                            {new Date(exam.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - {new Date(exam.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        <Link href="/subjects" className="block text-center text-sm font-semibold text-violet-600 mt-5 hover:underline">
                            Tüm Dersleri Yönet →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}