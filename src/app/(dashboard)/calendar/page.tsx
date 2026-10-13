// src/app/(dashboard)/calendar/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, BookOpen, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";

const DAYS_OF_WEEK = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export default async function CalendarPage() {
    const session = await auth();

    // Yaklaşan sınavları getir
    const exams = await prisma.exam.findMany({
        where: {
            userId: session?.user?.id,
            date: { gte: new Date() } // Sadece bugünden sonraki sınavlar
        },
        include: { subject: true },
        orderBy: { date: 'asc' }
    });

    // Müsaitlik saatlerini getir
    const availability = await prisma.availabilitySlot.findMany({
        where: { userId: session?.user?.id },
    });

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Üst Kısım: Başlık ve Kontroller */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarIcon size={24} className="text-blue-600" /> Çalışma Takvimi
                    </h1>
                    <p className="text-slate-500 mt-1">Haftalık planını incele ve yeni oturumlar oluştur.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
                        <Sparkles size={18} className="text-blue-100" />
                        AI ile Plan Oluştur
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* SOL: Haftalık Izgara (Takvim Görünümü) */}
                <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Takvim Üst Barı (Günler) */}
                    <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                        {DAYS_OF_WEEK.map((day, i) => (
                            <div key={day} className="p-3 text-center border-r border-slate-200 last:border-r-0">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{day}</span>
                            </div>
                        ))}
                    </div>

                    {/* Takvim Gövdesi (Hücreler) */}
                    <div className="grid grid-cols-7 min-h-[500px]">
                        {DAYS_OF_WEEK.map((day, i) => {
                            // Veritabanında Pazar 0, Pazartesi 1 olarak tutulduğu için dönüşüm yapıyoruz
                            const dbDayIndex = i === 6 ? 0 : i + 1;
                            const daySlots = availability.filter(slot => slot.dayOfWeek === dbDayIndex);

                            return (
                                <div key={day} className="border-r border-slate-200 last:border-r-0 p-2 relative group hover:bg-slate-50 transition-colors">
                                    {/* Müsaitlik Göstergesi */}
                                    {daySlots.length > 0 && (
                                        <div className="mb-2">
                                            {daySlots.map(slot => (
                                                <div key={slot.id} className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 mb-1 flex items-center justify-center gap-1">
                                                    <Clock size={10} />
                                                    {slot.startTime} - {slot.endTime}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Gelecekte buraya AI tarafından oluşturulan StudySession kartları gelecek */}
                                    <div className="flex flex-col items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0">
                                        <span className="text-xs text-slate-400 font-medium">+ Görev</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* SAĞ: Yaklaşan Sınavlar ve Bildirimler */}
                <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <AlertCircle size={18} className="text-orange-500" /> Yaklaşan Sınavlar
                        </h3>

                        <div className="space-y-3">
                            {exams.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-2">Yaklaşan sınavın yok.</p>
                            ) : (
                                exams.map(exam => (
                                    <div key={exam.id} className="bg-orange-50 border border-orange-100 p-3 rounded-xl">
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

                        <Link href="/subjects" className="block text-center text-sm text-blue-600 font-medium mt-4 hover:underline">
                            Tümünü Yönet
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}