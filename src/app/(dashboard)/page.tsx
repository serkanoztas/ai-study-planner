// src/app/(dashboard)/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Target, Clock, CheckCircle2, Calendar as CalendarIcon, Play, Plus, Sparkles, BrainCircuit } from "lucide-react";

export default async function DashboardPage() {
    const session = await auth();

    const subjectCount = await prisma.subject.count({
        where: { userId: session?.user?.id },
    });

    return (
        <div className="mx-auto max-w-6xl space-y-8">
            {/* Modern, Mor Temalı Karşılama Alanı ve 2D Karakter */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-purple-700 p-8 sm:p-12 text-white shadow-xl shadow-purple-500/20">
                {/* Arka plan dekoratif parlamaları */}
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-10 -mb-10 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 space-y-5">
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-2 backdrop-blur-md border border-white/10 shadow-sm">
                            <BrainCircuit size={18} className="text-fuchsia-200" />
                            <span className="text-sm font-semibold text-white tracking-wide">AI Asistanın Devrede</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                            Merhaba, {session?.user?.name?.split(" ")[0]} 👋
                        </h1>
                        <p className="text-md text-purple-100 max-w-lg leading-relaxed font-medium">
                            Bugünkü çalışma planın seni hedeflerine bir adım daha yaklaştırıyor. Hazırsan hemen başlayalım!
                        </p>
                    </div>

                    {/* 2D Karakter Görseli Alanı */}
                    <div className="hidden sm:block w-24 h-24 md:w-48 md:h-48 relative drop-shadow-2xl hover:scale-105 transition-transform duration-500">
                        <Image
                            src="/ai-character.png"
                            alt="AI Study Coach"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="group flex items-center gap-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                        <Target size={26} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Günlük Hedef</p>
                        <p className="text-2xl font-bold text-slate-900">0 <span className="text-sm font-normal text-slate-400">/ 4 saat</span></p>
                    </div>
                </div>

                <div className="group flex items-center gap-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 text-violet-600 group-hover:scale-110 transition-transform">
                        <Clock size={26} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Haftalık Çalışma</p>
                        <p className="text-2xl font-bold text-slate-900">0 <span className="text-sm font-normal text-slate-400">saat</span></p>
                    </div>
                </div>

                <div className="group flex items-center gap-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-100 to-fuchsia-50 text-fuchsia-600 group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={26} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Tamamlanan</p>
                        <p className="text-2xl font-bold text-slate-900">0 <span className="text-sm font-normal text-slate-400">görev</span></p>
                    </div>
                </div>

                <div className="group flex items-center gap-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 group-hover:scale-110 transition-transform">
                        <CalendarIcon size={26} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Kayıtlı Ders</p>
                        <p className="text-2xl font-bold text-slate-900">{subjectCount}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Bugünkü Program (Daha modern Placeholder) */}
                <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm lg:col-span-2 flex flex-col">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Bugünün Çalışma Programı</h2>
                            <p className="text-sm text-slate-500 mt-1">Yapay zekâ tarafından senin için optimize edildi.</p>
                        </div>
                        <Link href="/calendar" className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 transition-colors">Tümünü Gör</Link>
                    </div>

                    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center transition-colors hover:border-violet-200 hover:bg-violet-50/50 min-h-[240px]">
                        <div className="h-16 w-16 mb-4 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 shadow-inner">
                            <Sparkles size={28} />
                        </div>
                        <p className="font-semibold text-slate-700 text-lg">Programın henüz hazır değil</p>
                        <p className="mt-2 text-sm text-slate-500 max-w-sm">Yapay zekâ asistanından senin için kişiselleştirilmiş bir program hazırlamasını isteyebilirsin.</p>
                    </div>
                </div>

                {/* Hızlı İşlemler */}
                <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
                    <h2 className="mb-6 text-xl font-bold text-slate-900">Hızlı İşlemler</h2>
                    <div className="space-y-3">
                        <button className="group flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 text-left transition-all hover:border-violet-200 hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                    <Sparkles size={20} />
                                </div>
                                <span className="font-semibold text-slate-700 group-hover:text-violet-700 transition-colors">Yeni Plan Oluştur</span>
                            </div>
                        </button>
                        <button className="group flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 text-left transition-all hover:border-emerald-200 hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <Play size={20} className="ml-1" />
                                </div>
                                <span className="font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors">Çalışma Oturumu Başlat</span>
                            </div>
                        </button>
                        <Link href="/subjects" className="group flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 text-left transition-all hover:border-fuchsia-200 hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-fuchsia-50 text-fuchsia-600 group-hover:bg-fuchsia-600 group-hover:text-white transition-colors">
                                    <Plus size={20} />
                                </div>
                                <span className="font-semibold text-slate-700 group-hover:text-fuchsia-700 transition-colors">Ders veya Konu Ekle</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}