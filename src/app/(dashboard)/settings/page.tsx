// src/app/(dashboard)/settings/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Clock, Plus, Trash2, Sliders, CalendarCheck2 } from "lucide-react";
import { addAvailabilitySlot, deleteAvailabilitySlot } from "@/server/actions/availability";

const DAYS = [
    { value: 1, label: "Pazartesi" },
    { value: 2, label: "Salı" },
    { value: 3, label: "Çarşamba" },
    { value: 4, label: "Perşembe" },
    { value: 5, label: "Cuma" },
    { value: 6, label: "Cumartesi" },
    { value: 0, label: "Pazar" },
];

export default async function SettingsPage() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return null;

    // Kullanıcının müsaitlik verilerini getir
    const slots = await prisma.availabilitySlot.findMany({
        where: { userId },
        orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
        ]
    });

    // Günlere göre gruplama yap
    const slotsByDay = DAYS.map(day => ({
        ...day,
        slots: slots.filter(slot => slot.dayOfWeek === day.value)
    }));

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            {/* 1. ÜST BAŞLIK */}
            <div className="relative overflow-hidden rounded-[2rem] bg-white p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-violet-500/10 blur-[40px] pointer-events-none"></div>

                <div className="relative z-10 flex items-center gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-sm border border-violet-100">
                        <Sliders size={26} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Müsaitlik ve Çalışma Saatleri</h1>
                        <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">Haftalık müsait olduğun zaman dilimlerini belirle. Yapay zekâ programını bu saatlere göre optimize edecektir.</p>
                    </div>
                </div>
            </div>

            {/* 2. ÇALIŞMA SAATLERİ EKLEME FORMU & LİSTESİ */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-fuchsia-500/5 blur-[50px] pointer-events-none"></div>

                <h2 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2 relative z-10">
                    <div className="bg-violet-100 p-2 rounded-xl text-violet-600">
                        <Clock size={20} strokeWidth={2.5} />
                    </div>
                    Yeni Zaman Dilimi Ekle
                </h2>

                {/* Ekleme Formu */}
                <form action={addAvailabilitySlot} className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10 bg-slate-50/80 p-6 rounded-2xl border border-slate-200/60 relative z-10">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Gün Seçimi</label>
                        <select name="dayOfWeek" className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all">
                            {DAYS.map(day => (
                                <option key={day.value} value={day.value}>{day.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Başlangıç Saati</label>
                        <input type="time" name="startTime" required defaultValue="18:00" className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Bitiş Saati</label>
                        <input type="time" name="endTime" required defaultValue="20:00" className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all" />
                    </div>

                    <div className="flex items-end">
                        <button type="submit" className="w-full bg-violet-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-violet-500/20 hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                            <Plus size={18} strokeWidth={3} /> Ekle
                        </button>
                    </div>
                </form>

                {/* Günlük Listeler (Grid / Satır Yapısı) */}
                <div className="space-y-4 relative z-10">
                    <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-4">Haftalık Müsaitlik Programın</h3>

                    <div className="grid grid-cols-1 gap-4">
                        {slotsByDay.map(day => (
                            <div key={day.value} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-4">
                                <div className="flex items-center gap-3 w-40 shrink-0">
                                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500"></div>
                                    <span className="font-bold text-slate-800">{day.label}</span>
                                </div>

                                <div className="flex-1 flex flex-wrap gap-2.5">
                                    {day.slots.length === 0 ? (
                                        <span className="text-xs font-medium text-slate-400 italic py-1">Bu gün için henüz müsaitlik eklenmedi.</span>
                                    ) : (
                                        day.slots.map(slot => (
                                            <div key={slot.id} className="group/slot flex items-center gap-2.5 bg-violet-50 border border-violet-200/60 text-violet-900 px-3.5 py-1.5 rounded-xl text-sm font-bold shadow-xs">
                                                <CalendarCheck2 size={14} className="text-violet-500" />
                                                <span>{slot.startTime} - {slot.endTime}</span>
                                                <form action={async () => {
                                                    "use server";
                                                    await deleteAvailabilitySlot(slot.id);
                                                }}>
                                                    <button type="submit" className="text-violet-400 hover:text-red-500 transition-colors ml-1 p-0.5 rounded-md hover:bg-red-50">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </form>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}