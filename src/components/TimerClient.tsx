// src/app/(dashboard)/session/[id]/TimerClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Play, Pause, Square, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { completeStudySession } from "@/server/actions/academic";

interface TimerProps {
    taskId: string;
    title: string;
    subjectName: string;
    subjectColor: string;
    durationMinutes: number;
}

export default function TimerClient({ taskId, title, subjectName, subjectColor, durationMinutes }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const router = useRouter();

    const totalSeconds = durationMinutes * 60;
    const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const handleComplete = async () => {
        setIsFinishing(true);
        setIsActive(false);

        // Kalan saniyeden harcanan dakikayı buluyoruz
        const actualDuration = Math.floor((totalSeconds - timeLeft) / 60);

        // TODO: Server Action ile veritabanına kaydet
        await completeStudySession(taskId, actualDuration);

        // Demo amaçlı kısa bir bekleme ve yönlendirme
        setTimeout(() => {
            router.push("/calendar");
            router.refresh();
        }, 1000);
    };

    return (
        <div className="flex flex-col items-center">

            {/* Üst Bilgi Barı */}
            <Link href="/calendar" className="self-start mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                    <ArrowLeft size={16} />
                </div>
                <span className="text-sm font-semibold tracking-wide">Takvime Dön</span>
            </Link>

            {/* Görev Bilgisi (Bento Card) */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] w-full text-center shadow-2xl mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 mb-4">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ backgroundColor: subjectColor, boxShadow: `0 0 12px ${subjectColor}` }}></div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{subjectName}</span>
                </div>
                <h1 className="text-2xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                    {title}
                </h1>
            </div>

            {/* Kronometre ve İlerleme Halkası */}
            <div className="relative flex items-center justify-center mb-12 group">
                {/* Dış Glow */}
                <div className="absolute inset-0 bg-violet-500/20 blur-[60px] rounded-full transition-opacity duration-1000" style={{ opacity: isActive ? 1 : 0.3 }}></div>

                {/* SVG Progress Circle */}
                <svg className="w-64 h-64 sm:w-80 sm:h-80 transform -rotate-90 drop-shadow-2xl">
                    <circle cx="50%" cy="50%" r="48%" className="stroke-slate-800" strokeWidth="8" fill="none" />
                    <circle
                        cx="50%" cy="50%" r="48%"
                        className="transition-all duration-1000 ease-linear"
                        stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round" fill="none"
                        strokeDasharray="300%" strokeDashoffset={`${300 - (progress * 3)}%`}
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#d946ef" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Dijital Saat Göstergesi */}
                <div className="absolute flex flex-col items-center">
                    <span className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatTime(timeLeft)}
                    </span>
                    <span className="text-sm font-semibold text-slate-500 mt-2 uppercase tracking-widest">
                        {isActive ? 'Odaklanılıyor...' : timeLeft === totalSeconds ? 'Hazır' : 'Duraklatıldı'}
                    </span>
                </div>
            </div>

            {/* Kontrol Butonları (Glassmorphism) */}
            <div className="flex items-center gap-4 sm:gap-6">
                <button
                    onClick={() => setIsActive(!isActive)}
                    disabled={isFinishing}
                    className="flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all"
                >
                    {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
                </button>

                <button
                    onClick={handleComplete}
                    disabled={isFinishing || (timeLeft === totalSeconds && !isActive)}
                    className="group relative flex items-center justify-center gap-3 px-8 h-20 rounded-[2rem] bg-violet-600 text-white font-bold shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95 transition-all overflow-hidden disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative z-10 flex items-center gap-2">
                        {isFinishing ? (
                            <>
                                <CheckCircle2 size={24} className="animate-pulse" /> Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <Square size={20} fill="currentColor" /> Çalışmayı Bitir
                            </>
                        )}
                    </span>
                </button>
            </div>
        </div>
    );
}