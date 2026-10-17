// src/app/(auth)/register/page.tsx
"use client";

import { register } from "@/server/actions/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrainCircuit, ArrowRight, Loader2, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError(null);

        try {
            const res = await register(formData);
            if (res?.error) {
                setError(res.error);
                setIsLoading(false);
            } else {
                // Kayıt başarılıysa login sayfasına yönlendir (parametre ile)
                router.push("/login?registered=true");
            }
        } catch (err) {
            setError("Beklenmeyen bir hata oluştu.");
            setIsLoading(false);
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-slate-950 p-4 sm:p-8 overflow-hidden selection:bg-fuchsia-500/30">

            {/* 1. AURORA ARKA PLAN (Glow Efektleri) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-40 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-violet-600 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-3000"></div>
            </div>

            {/* Gürültü (Noise) Kaplaması */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

            {/* 2. ANA KART (Glassmorphism Bileşeni) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md mt-8 mb-8"
            >
                {/* Kartın etrafındaki ince glow (parlama) sınırı */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-fuchsia-500/30 to-violet-500/30 rounded-[2.5rem] blur opacity-50"></div>

                <div className="relative bg-slate-950/60 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">

                    {/* Logo ve Başlık */}
                    <div className="mb-8 flex flex-col items-center text-center">
                        <Link href="/" className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-500 text-white shadow-lg shadow-fuchsia-500/30 hover:scale-105 transition-transform">
                            <UserPlus size={28} />
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                            Aramıza Katıl
                        </h1>
                        <p className="text-sm font-medium text-slate-400">
                            Yapay zekâ ile çalışma rutinini yeniden keşfet.
                        </p>
                    </div>

                    {/* Hata Mesajı */}
                    {error && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm font-medium text-red-400 flex items-center justify-center text-center">
                            {error}
                        </motion.div>
                    )}

                    {/* Kayıt Formu */}
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Ad Soyad</label>
                            <input
                                name="name"
                                type="text"
                                required
                                disabled={isLoading}
                                placeholder="Örn: Serkan Öztaş"
                                className="w-full rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-sm font-medium text-white outline-none transition-all placeholder:text-slate-600 focus:border-fuchsia-500 focus:bg-slate-900 focus:ring-4 focus:ring-fuchsia-500/20 disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">E-posta Adresi</label>
                            <input
                                name="email"
                                type="email"
                                required
                                disabled={isLoading}
                                placeholder="ornek@ogrenci.edu.tr"
                                className="w-full rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-sm font-medium text-white outline-none transition-all placeholder:text-slate-600 focus:border-fuchsia-500 focus:bg-slate-900 focus:ring-4 focus:ring-fuchsia-500/20 disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Şifre</label>
                            <input
                                name="password"
                                type="password"
                                required
                                disabled={isLoading}
                                placeholder="En az 6 karakter"
                                className="w-full rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-sm font-medium text-white outline-none transition-all placeholder:text-slate-600 focus:border-fuchsia-500 focus:bg-slate-900 focus:ring-4 focus:ring-fuchsia-500/20 disabled:opacity-50"
                            />
                        </div>

                        <div className="pt-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-fuchsia-600 p-4 text-sm font-bold text-white shadow-[0_0_40px_rgba(217,70,239,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(217,70,239,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                            >
                                {/* Buton içi parlama efekti (Ters gradient) */}
                                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-violet-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                                <span className="relative z-10 flex items-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Hesap Oluşturuluyor...
                                        </>
                                    ) : (
                                        <>
                                            Hesabımı Oluştur
                                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>

                    {/* Alt Yönlendirme (Login'e Geçiş) */}
                    <p className="mt-8 text-center text-sm font-medium text-slate-400">
                        Zaten bir hesabın var mı?{" "}
                        <Link href="/login" className="font-bold text-fuchsia-400 transition-colors hover:text-fuchsia-300 hover:underline">
                            Giriş Yap
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}