// src/components/FocusTimer.tsx
"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Square, CheckCircle2 } from "lucide-react";
import { completeStudySession } from "@/server/actions/session";
import { useRouter } from "next/navigation";

export default function FocusTimer({ task }: { task: any }) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(task.durationMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            setIsFinished(true);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);

    const handleComplete = async () => {
        setIsSaving(true);
        const timeSpentSeconds = (task.durationMinutes * 60) - timeLeft;
        const timeSpentMinutes = Math.max(1, Math.round(timeSpentSeconds / 60)); // En az 1 dakika

        const res = await completeStudySession(task.id, timeSpentMinutes);
        if (res.success) {
            router.push("/calendar"); // Başarılıysa takvime geri dön
        }
        setIsSaving(false);
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100 max-w-md mx-auto mt-10">
            <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">{task.title}</h2>
            <p className="text-sm text-violet-600 font-medium mb-8 bg-violet-50 px-3 py-1 rounded-full">
                Hedef: {task.durationMinutes} Dakika
            </p>

            {/* Dairesel Sayaç Görünümü */}
            <div className="relative flex items-center justify-center w-64 h-64 rounded-full border-8 border-slate-50 mb-8 shadow-inner">
                <div className={`absolute inset-0 rounded-full border-8 ${isActive ? 'border-violet-500 animate-pulse' : 'border-violet-200'}`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}></div>
                <span className="text-6xl font-extrabold text-slate-800 tracking-tighter">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
            </div>

            {isFinished ? (
                <div className="text-center space-y-4">
                    <div className="flex justify-center text-emerald-500 mb-2">
                        <CheckCircle2 size={48} />
                    </div>
                    <p className="text-lg font-bold text-slate-900">Tebrikler, süreyi tamamladın!</p>
                    <button onClick={handleComplete} disabled={isSaving} className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                        {isSaving ? "Kaydediliyor..." : "Oturumu Kaydet ve Bitir"}
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTimer}
                        className={`flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg transition-transform hover:scale-105 ${isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-violet-600 hover:bg-violet-700'}`}
                    >
                        {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                    </button>

                    <button
                        onClick={handleComplete}
                        disabled={isSaving || timeLeft === task.durationMinutes * 60}
                        className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Erken Bitir"
                    >
                        <Square size={24} />
                    </button>
                </div>
            )}
        </div>
    );
}