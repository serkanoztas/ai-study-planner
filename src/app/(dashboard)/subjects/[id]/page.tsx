// src/app/(dashboard)/subjects/[id]/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Calendar, CheckCircle2, Circle, AlertCircle, BookOpen, Clock, Target } from "lucide-react";
import { createTopic, deleteTopic, toggleTopicCompletion, createExam, deleteExam } from "@/server/actions/academic";

export default async function SubjectDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    const { id } = await params;

    // Dersi, konuları ve sınavları ile birlikte getir
    const subject = await prisma.subject.findUnique({
        where: {
            id: id,
            userId: session?.user?.id
        },
        include: {
            topics: { orderBy: { createdAt: 'asc' } },
            exams: { orderBy: { date: 'asc' } }
        }
    });

    if (!subject) redirect("/subjects");

    // Server Actions için ID'leri bağlama (bind)
    const addTopicWithId = createTopic.bind(null, subject.id);
    const addExamWithId = createExam.bind(null, subject.id);

    // İstatistikler
    const completedTopics = subject.topics.filter(t => t.isCompleted).length;
    const progress = subject.topics.length > 0 ? Math.round((completedTopics / subject.topics.length) * 100) : 0;
    const upcomingExams = subject.exams.filter(e => new Date(e.date) >= new Date()).length;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">

            {/* 1. HERO HEADER (Dersin Rengine Duyarlı) */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 sm:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                {/* Arka plan glow (Ders rengiyle) */}
                <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[60px] opacity-20 pointer-events-none" style={{ backgroundColor: subject.color || '#8b5cf6' }}></div>

                <div className="relative z-10 flex items-center gap-6">
                    <Link href="/subjects" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm border border-slate-200">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="flex h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: subject.color || '#8b5cf6' }}></span>
                            <span className="text-xs font-bold tracking-wider uppercase text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                Öncelik: {subject.priority}
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{subject.name}</h1>
                    </div>
                </div>

                {/* Hızlı İstatistik Kartı */}
                <div className="relative z-10 flex gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full md:w-auto">
                    <div className="flex flex-col gap-1 pr-4 border-r border-slate-200">
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><Target size={14} /> İlerleme</span>
                        <span className="text-xl font-bold text-slate-900">%{progress}</span>
                    </div>
                    <div className="flex flex-col gap-1 pl-2">
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><Calendar size={14} /> Yaklaşan Sınav</span>
                        <span className="text-xl font-bold text-slate-900">{upcomingExams}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* SOL KOLON: KONULAR (lg:col-span-7) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white p-7 rounded-[2rem] shadow-lg shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
                        <h2 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
                            <div className="bg-violet-100 p-2 rounded-xl text-violet-600">
                                <BookOpen size={20} strokeWidth={2.5} />
                            </div>
                            Konu Müfredatı
                        </h2>

                        {/* İlerleme Çubuğu (Progress Bar) */}
                        {subject.topics.length > 0 && (
                            <div className="mb-8">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-semibold text-slate-700">Tamamlanan: {completedTopics}/{subject.topics.length}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div className="h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%`, backgroundColor: subject.color || '#8b5cf6' }}></div>
                                </div>
                            </div>
                        )}

                        {/* Konu Ekleme Formu */}
                        <form action={addTopicWithId} className="flex gap-3 mb-8 relative z-10">
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Yeni konu ekle..."
                                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-medium outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                            />
                            <div className="relative w-28 shrink-0">
                                <select name="difficulty" className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-medium outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10">
                                    <option value="1">🟢 Kolay</option>
                                    <option value="2">🟡 Orta</option>
                                    <option value="3">🔴 Zor</option>
                                </select>
                            </div>
                            <button type="submit" className="flex shrink-0 w-12 h-12 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-all shadow-md shadow-violet-500/20 active:scale-95">
                                <Plus size={20} strokeWidth={3} />
                            </button>
                        </form>

                        {/* Konu Listesi */}
                        <div className="space-y-3 relative z-10">
                            {subject.topics.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                                    <p className="text-slate-500 font-medium">Henüz konu eklenmemiş.</p>
                                </div>
                            ) : (
                                subject.topics.map(topic => (
                                    <div key={topic.id} className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${topic.isCompleted ? 'bg-slate-50/80 border-slate-100 hover:border-slate-300' : 'bg-white border-slate-200 hover:border-violet-300 hover:shadow-md'}`}>

                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Checkbox (Toggle) */}
                                            <form action={async () => {
                                                "use server";
                                                await toggleTopicCompletion(topic.id, subject.id, !topic.isCompleted);
                                            }}>
                                                <button type="submit" className={`transition-all duration-300 ${topic.isCompleted ? "text-emerald-500 scale-110" : "text-slate-300 hover:text-violet-500 hover:scale-110"}`}>
                                                    {topic.isCompleted ? <CheckCircle2 size={24} fill="currentColor" className="text-white" /> : <Circle size={24} strokeWidth={2.5} />}
                                                </button>
                                            </form>

                                            <div className="flex flex-col gap-0.5">
                                                <span className={`text-[15px] transition-all duration-300 ${topic.isCompleted ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-800 font-bold'}`}>
                                                    {topic.name}
                                                </span>
                                                {!topic.isCompleted && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex h-2 w-2 rounded-full" style={{ backgroundColor: topic.difficulty === 1 ? '#22c55e' : topic.difficulty === 2 ? '#eab308' : '#ef4444' }}></span>
                                                        <span className="text-xs font-medium text-slate-500">
                                                            {topic.difficulty === 1 ? 'Kolay' : topic.difficulty === 2 ? 'Orta' : 'Zor'} Seviye
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <form action={async () => {
                                            "use server";
                                            await deleteTopic(topic.id, subject.id);
                                        }}>
                                            <button title="Konuyu Sil" className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </form>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* SAĞ KOLON: SINAVLAR (lg:col-span-5) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white p-7 rounded-[2rem] shadow-lg shadow-slate-200/40 border border-slate-100 relative overflow-hidden h-fit sticky top-6">
                        <h2 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
                            <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                                <Calendar size={20} strokeWidth={2.5} />
                            </div>
                            Sınav Takvimi
                        </h2>

                        <form action={addExamWithId} className="space-y-4 mb-8 bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Sınav Adı</label>
                                <input type="text" name="title" required placeholder="Örn: Vize 1" className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Tarih & Saat</label>
                                <input type="datetime-local" name="date" required className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Notlar (Opsiyonel)</label>
                                <input type="text" name="notes" placeholder="Örn: İlk 3 konu dahil" className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" />
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white p-3 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors">
                                Sınav Ekle
                            </button>
                        </form>

                        <div className="space-y-4">
                            {subject.exams.length === 0 ? (
                                <p className="text-sm text-slate-500 font-medium text-center py-6">Planlanmış sınav bulunmuyor.</p>
                            ) : (
                                subject.exams.map(exam => {
                                    const isPast = new Date(exam.date) < new Date();
                                    return (
                                        <div key={exam.id} className={`group relative p-5 rounded-2xl border transition-all duration-300 ${isPast ? 'bg-slate-50 border-slate-100 opacity-60 hover:opacity-100' : 'bg-orange-50 border-orange-200 hover:shadow-md hover:border-orange-300'}`}>
                                            <div className="flex justify-between items-start mb-3 relative z-10">
                                                <div>
                                                    <h4 className={`text-lg font-bold ${isPast ? 'text-slate-700' : 'text-slate-900'}`}>{exam.title}</h4>
                                                    <p className={`text-xs font-semibold flex items-center gap-1 mt-1 ${isPast ? 'text-slate-500' : 'text-orange-600'}`}>
                                                        <Clock size={14} />
                                                        {new Date(exam.date).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <form action={async () => {
                                                    "use server";
                                                    await deleteExam(exam.id, subject.id);
                                                }}>
                                                    <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 bg-white p-1.5 rounded-lg shadow-sm transition-all">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </form>
                                            </div>
                                            {exam.notes && (
                                                <p className="text-sm text-slate-600 flex items-start gap-2 mt-3 bg-white/60 p-3 rounded-xl border border-white/40">
                                                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-orange-400" />
                                                    {exam.notes}
                                                </p>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}