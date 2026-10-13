// src/app/(dashboard)/subjects/[id]/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Calendar, CheckCircle2, Circle, AlertCircle } from "lucide-react";
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

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Başlık Alanı */}
            <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                <Link href="/subjects" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft size={20} className="text-slate-600" />
                </Link>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color || '#3b82f6' }} />
                <h1 className="text-2xl font-bold text-slate-900">{subject.name}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SOL KOLON: KONULAR */}
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            Konu Listesi
                        </h2>

                        {/* Konu Ekleme Formu */}
                        <form action={addTopicWithId} className="flex gap-2 mb-6">
                            <input type="text" name="name" required placeholder="Yeni konu ekle..." className="flex-1 rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-blue-600" />
                            <select name="difficulty" className="rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-blue-600 bg-white w-24">
                                <option value="1">Kolay</option>
                                <option value="2">Orta</option>
                                <option value="3">Zor</option>
                            </select>
                            <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                                <Plus size={20} />
                            </button>
                        </form>

                        {/* Konular */}
                        <div className="space-y-2">
                            {subject.topics.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">Henüz konu eklenmemiş.</p>
                            ) : (
                                subject.topics.map(topic => (
                                    <div key={topic.id} className={`flex items-center justify-between p-3 rounded-xl border ${topic.isCompleted ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <form action={async () => {
                                                "use server";
                                                await toggleTopicCompletion(topic.id, subject.id, !topic.isCompleted);
                                            }}>
                                                <button type="submit" className={topic.isCompleted ? "text-emerald-500" : "text-slate-300 hover:text-slate-400"}>
                                                    {topic.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                                </button>
                                            </form>
                                            <span className={`text-sm ${topic.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                                                {topic.name}
                                            </span>
                                            {/* Zorluk rozeti */}
                                            {!topic.isCompleted && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                                    {topic.difficulty === 1 ? 'Kolay' : topic.difficulty === 2 ? 'Orta' : 'Zor'}
                                                </span>
                                            )}
                                        </div>

                                        <form action={async () => {
                                            "use server";
                                            await deleteTopic(topic.id, subject.id);
                                        }}>
                                            <button className="text-slate-300 hover:text-red-500 p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        </form>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* SAĞ KOLON: SINAVLAR */}
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-orange-500" /> Sınavlar ve Tarihler
                        </h2>

                        <form action={addExamWithId} className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <input type="text" name="title" required placeholder="Sınav Adı (Örn: Vize 1)" className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-blue-600" />
                            <input type="datetime-local" name="date" required className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-blue-600" />
                            <input type="text" name="notes" placeholder="Notlar (Örn: İlk 3 konu dahil)" className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-blue-600" />
                            <button type="submit" className="w-full bg-slate-900 text-white p-2 rounded-lg text-sm font-medium hover:bg-slate-800">
                                Sınav Ekle
                            </button>
                        </form>

                        <div className="space-y-3">
                            {subject.exams.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">Planlanmış sınav bulunmuyor.</p>
                            ) : (
                                subject.exams.map(exam => {
                                    const isPast = new Date(exam.date) < new Date();
                                    return (
                                        <div key={exam.id} className={`p-4 rounded-xl border ${isPast ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-orange-50/50 border-orange-100'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-slate-900">{exam.title}</h4>
                                                    <p className="text-xs font-medium text-orange-600 mt-0.5">
                                                        {new Date(exam.date).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <form action={async () => {
                                                    "use server";
                                                    await deleteExam(exam.id, subject.id);
                                                }}>
                                                    <button className="text-slate-400 hover:text-red-500">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </form>
                                            </div>
                                            {exam.notes && (
                                                <p className="text-sm text-slate-600 flex items-start gap-1.5 mt-2 bg-white/50 p-2 rounded-md">
                                                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
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