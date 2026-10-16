// src/app/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, BrainCircuit, CalendarCheck, LineChart, ArrowRight, Bot } from "lucide-react";

export default function LandingPage() {
    // Animasyon varyasyonları
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden selection:bg-violet-500/30 relative">

            {/* Arka Plan Glow Efektleri (Aurora Style) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-3000"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <BrainCircuit size={18} className="text-white" />
                    </div>
                    EduCoach<span className="text-violet-400">.ai</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        Giriş Yap
                    </Link>
                    <Link href="/calendar" className="text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md transition-all">
                        Ücretsiz Başla
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center pt-24 pb-32 px-6 text-center max-w-5xl mx-auto">

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="space-y-8 flex flex-col items-center"
                >
                    <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
                        <Sparkles size={14} />
                        Yapay Zekâ Destekli Akademik Asistanın
                    </motion.div>

                    <motion.div variants={fadeUp} className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                            Çalışma Rutinini <br className="hidden md:block" />
                            <span className="bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 animate-gradient-x">
                                Yeniden Keşfet.
                            </span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium">
                            Sınavlarını, derslerini ve müsaitlik saatlerini Gemini AI ile analiz et. Sana özel dinamik programlar oluştur ve EduCoach ile hedeflerine ulaş.
                        </p>
                    </motion.div>

                    <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                        <Link href="/calendar" className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white bg-violet-600 rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(139,92,246,0.4)]">
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            <span className="relative flex items-center gap-2">
                                Hemen Başla <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Feature Cards (Bento Grid) */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-32"
                >
                    <motion.div variants={fadeUp} className="relative group p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent hover:from-violet-500/30 transition-colors">
                        <div className="bg-slate-950/50 backdrop-blur-xl border border-white/5 rounded-[22px] p-8 h-full flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-400 mb-2 group-hover:scale-110 transition-transform">
                                <CalendarCheck size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-200">Akıllı Planlama</h3>
                            <p className="text-sm text-slate-400">Yaklaşan sınavlarına ve boş vakitlerine göre saniyeler içinde haftalık program oluştur.</p>
                        </div>
                    </motion.div>

                    <motion.div variants={fadeUp} className="relative group p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent hover:from-fuchsia-500/30 transition-colors">
                        <div className="bg-slate-950/50 backdrop-blur-xl border border-white/5 rounded-[22px] p-8 h-full flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mb-2 group-hover:scale-110 transition-transform">
                                <Bot size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-200">AI Study Coach</h3>
                            <p className="text-sm text-slate-400">Tıkanıp kaldığında veya motivasyonun düştüğünde kişisel yapay zekâ koçunla dertleş, tavsiye al.</p>
                        </div>
                    </motion.div>

                    <motion.div variants={fadeUp} className="relative group p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent hover:from-orange-500/30 transition-colors">
                        <div className="bg-slate-950/50 backdrop-blur-xl border border-white/5 rounded-[22px] p-8 h-full flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-2 group-hover:scale-110 transition-transform">
                                <LineChart size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-200">Gelişmiş Analitik</h3>
                            <p className="text-sm text-slate-400">Pomodoro sayacı ile odaklan, hangi derse ne kadar çalıştığını profesyonel grafiklerle takip et.</p>
                        </div>
                    </motion.div>
                </motion.div>

            </main>

        </div>
    );
}