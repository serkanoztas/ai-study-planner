// src/app/(dashboard)/settings/page.tsx

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";
import { Clock, Plus, Trash2, Settings as SettingsIcon } from "lucide-react";
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

    // Kullanıcının müsaitlik verilerini getir
    const slots = await prisma.availabilitySlot.findMany({
        where: { userId: session?.user?.id },
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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-8 border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <SettingsIcon size={24} className="text-slate-700" /> Ayarlar ve Müsaitlik
                </h1>
                <p className="text-slate-500 mt-1">Haftalık ders çalışma saatlerini belirle. Yapay zekâ programını bu saatlere göre oluşturacaktır.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <Clock size={20} className="text-blue-600" /> Çalışma Saatleri Ekle
                </h2>

                {/* Ekleme Formu */}
                <form action={addAvailabilitySlot} className="flex flex-col sm:flex-row gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Gün Seçimi</label>
                        <select name="dayOfWeek" className="w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-600 bg-white">
                            {DAYS.map(day => (
                                <option key={day.value} value={day.value}>{day.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Başlangıç Saati</label>
                        <input type="time" name="startTime" required defaultValue="18:00" className="w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-600 bg-white" />
                    </div>

                    <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Bitiş Saati</label>
                        <input type="time" name="endTime" required defaultValue="20:00" className="w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-600 bg-white" />
                    </div>

                    <div className="flex items-end">
                        <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                            <Plus size={18} /> Ekle
                        </button>
                    </div>
                </form>

                {/* Günlük Listeler */}
                <div className="space-y-6">
                    {slotsByDay.map(day => (
                        <div key={day.value} className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="w-32 pt-2 font-medium text-slate-700">
                                {day.label}
                            </div>

                            <div className="flex-1 flex flex-wrap gap-3">
                                {day.slots.length === 0 ? (
                                    <span className="text-sm text-slate-400 pt-2 italic">Müsaitlik eklenmedi.</span>
                                ) : (
                                    day.slots.map(slot => (
                                        <div key={slot.id} className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm">
                                            <span className="font-medium">{slot.startTime}</span> - <span className="font-medium">{slot.endTime}</span>
                                            <form action={async () => {
                                                "use server";
                                                await deleteAvailabilitySlot(slot.id);
                                            }}>
                                                <button type="submit" className="text-blue-400 hover:text-red-500 ml-1 mt-0.5">
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
    );
}