// src/app/(dashboard)/subjects/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSubject, deleteSubject } from "@/server/actions/subject";
import { BookOpen, Trash2, Plus, Sparkles, FolderOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function SubjectsPage() {
    const session = await auth();

    const subjects = await prisma.subject.findMany({
        where: { userId: session?.user?.id },
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { topics: true, exams: true }
            }
        }
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* 1. Üst Başlık Alanı */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 shadow-sm">
                            <BookOpen size={24} />
                        </div>
                        Ders Yönetimi
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Müfredatını oluştur, derslerini önceliklendir ve çalışmanı organize et.</p>
                </div>

                {/* İstatistik Rozeti (Opsiyonel Detay) */}
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                        Toplam <span className="text-slate-900">{subjects.length}</span> Ders Aktif
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* SOL TARAF: Ders Ekleme Formu (Daha geniş ekranlar için lg:col-span-4) */}
                <div className="lg:col-span-4 h-fit sticky top-6">
                    <div className="bg-white p-7 rounded-[2rem] shadow-lg shadow-slate-200/40 border border-slate-100 relative overflow-hidden group">
                        {/* Arka Plan Glow */}
                        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-violet-500/5 blur-[40px] pointer-events-none"></div>

                        <h2 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
                            <div className="bg-violet-100 p-1.5 rounded-lg text-violet-600">
                                <Plus size={18} strokeWidth={3} />
                            </div>
                            Yeni Ders Ekle
                        </h2>

                        <form action={createSubject} className="space-y-5 relative z-10">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700">Dersin Adı</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="Örn: Veritabanı Yönetimi"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-medium outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 placeholder:text-slate-400"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700">Öncelik Derecesi</label>
                                <div className="relative">
                                    <select
                                        name="priority"
                                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-medium outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                                    >
                                        <option value="1">🟢 Düşük (1)</option>
                                        <option value="2">🟡 Orta (2)</option>
                                        <option value="3">🔴 Yüksek (3)</option>
                                    </select>
                                    {/* Select için özel ok ikonu */}
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">Renk Etiketi</label>
                                <div className="flex flex-wrap gap-3">
                                    {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'].map(color => (
                                        <label key={color} className="cursor-pointer group relative">
                                            <input type="radio" name="color" value={color} className="peer sr-only" defaultChecked={color === '#8b5cf6'} />
                                            <div
                                                className="w-8 h-8 rounded-full shadow-sm peer-checked:ring-4 peer-checked:ring-offset-2 peer-checked:scale-110 transition-all duration-200 peer-focus:outline-none"
                                                style={{ backgroundColor: color, borderColor: color }}
                                            />
                                            {/* Seçili olanın içine tik koyma */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="group w-full mt-4 flex items-center justify-center gap-2 bg-violet-600 text-white rounded-xl p-3.5 text-sm font-bold shadow-md shadow-violet-500/20 hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-600/30 active:scale-[0.98] transition-all">
                                <Sparkles size={18} className="text-violet-200" />
                                Dersi Kaydet
                            </button>
                        </form>
                    </div>
                </div>

                {/* SAĞ TARAF: Dersler Listesi (lg:col-span-8) */}
                <div className="lg:col-span-8">
                    {subjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 rounded-[2rem] p-12 text-center h-[400px]">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                <FolderOpen size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700">Henüz Ders Eklenmemiş</h3>
                            <p className="text-slate-500 mt-2 max-w-sm">Sol taraftaki formu kullanarak çalışman gereken dersleri eklemeye başla.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {subjects.map((subject) => (
                                <div key={subject.id} className="group relative bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 hover:border-slate-200 transition-all duration-300 overflow-hidden">

                                    {/* Kart Üst Tarafındaki İnce Renk Çizgisi */}
                                    <div className="absolute top-0 left-0 w-full h-1.5 opacity-80" style={{ backgroundColor: subject.color || '#8b5cf6' }}></div>
                                    {/* Hover'da Hafif Glow Efekti */}
                                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ backgroundColor: subject.color || '#8b5cf6' }}></div>

                                    <div className="flex items-start justify-between mb-4 relative z-10">
                                        <Link href={`/subjects/${subject.id}`} className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-md border" style={{ color: subject.color || '#8b5cf6', borderColor: `${subject.color}40`, backgroundColor: `${subject.color}10` }}>
                                                    Öncelik: {subject.priority}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-700 transition-colors line-clamp-2">
                                                {subject.name}
                                            </h3>
                                        </Link>

                                        {/* Silme Butonu */}
                                        <form action={async () => {
                                            "use server";
                                            await deleteSubject(subject.id);
                                        }}>
                                            <button
                                                title="Dersi Sil"
                                                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </form>
                                    </div>

                                    {/* Alt İstatistikler & Buton */}
                                    <div className="mt-2 pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
                                        <div className="flex gap-2">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                <BookOpen size={14} className="text-slate-400" />
                                                {subject._count.topics} Konu
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                <Sparkles size={14} className="text-slate-400" />
                                                {subject._count.exams} Sınav
                                            </div>
                                        </div>

                                        <Link
                                            href={`/subjects/${subject.id}`}
                                            className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300"
                                        >
                                            <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}