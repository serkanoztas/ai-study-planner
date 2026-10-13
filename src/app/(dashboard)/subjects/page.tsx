// src/app/(dashboard)/subjects/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSubject, deleteSubject } from "@/server/actions/subject";
import { BookOpen, Trash2, Plus } from "lucide-react";
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
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Ders Yönetimi</h1>
                <p className="text-slate-500 mt-1">Derslerini ekle, önceliklendir ve konularını yönet.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ders Ekleme Formu */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Plus size={18} className="text-blue-600" /> Yeni Ders Ekle
                        </h2>
                        <form action={createSubject} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ders Adı</label>
                                <input name="name" type="text" required placeholder="Örn: Veritabanı Yönetimi" className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Öncelik Derecesi</label>
                                <select name="priority" className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white">
                                    <option value="1">Düşük</option>
                                    <option value="2">Orta</option>
                                    <option value="3">Yüksek</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Renk Etiketi</label>
                                <div className="flex gap-2">
                                    {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'].map(color => (
                                        <label key={color} className="cursor-pointer">
                                            <input type="radio" name="color" value={color} className="peer sr-only" defaultChecked={color === '#3b82f6'} />
                                            <div className="w-6 h-6 rounded-full peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-slate-400" style={{ backgroundColor: color }} />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full mt-2 bg-blue-600 text-white rounded-lg p-2.5 text-sm font-medium hover:bg-blue-700 transition-colors">
                                Dersi Kaydet
                            </button>
                        </form>
                    </div>
                </div>

                {/* Dersler Listesi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {subjects.map((subject) => (
                        <div key={subject.id} className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md hover:border-blue-200 transition-all group">

                            <div className="flex items-start justify-between mb-2">
                                {/* Tıklanabilir Ders Başlığı */}
                                <Link href={`/subjects/${subject.id}`} className="flex items-center gap-2 flex-1">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color || '#3b82f6' }} />
                                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {subject.name}
                                    </h3>
                                </Link>

                                {/* Link'ten Bağımsız Silme Butonu */}
                                <form action={async () => {
                                    "use server";
                                    await deleteSubject(subject.id);
                                }}>
                                    <button className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                        <Trash2 size={16} />
                                    </button>
                                </form>
                            </div>

                            {/* Tıklanabilir Alt İstatistikler */}
                            <Link href={`/subjects/${subject.id}`} className="flex gap-4 mt-4 cursor-pointer block">
                                <div className="text-xs bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-100">
                                    <span className="font-semibold">{subject._count.topics}</span> Konu
                                </div>
                                <div className="text-xs bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-100">
                                    <span className="font-semibold">{subject._count.exams}</span> Sınav
                                </div>
                            </Link>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}