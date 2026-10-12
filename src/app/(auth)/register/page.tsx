// src/app/(auth)/register/page.tsx
"use client";

import { register } from "@/server/actions/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        const res = await register(formData);
        if (res?.error) {
            setError(res.error);
        } else if (res?.success) {
            router.push("/login?registered=true");
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50">
                <div className="mb-8 flex flex-col items-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <BookOpen size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">AI Study Planner</h1>
                    <p className="mt-2 text-sm text-slate-500">Hesap oluşturarak çalışmaya başla.</p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">İsim Soyisim</label>
                        <input name="name" type="text" required className="w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">E-posta</label>
                        <input name="email" type="email" required className="w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Şifre</label>
                        <input name="password" type="password" required minLength={6} className="w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
                    </div>
                    <button type="submit" className="mt-2 w-full rounded-lg bg-blue-600 p-2.5 font-medium text-white transition-colors hover:bg-blue-700">
                        Kayıt Ol
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Zaten bir hesabın var mı?{" "}
                    <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                        Giriş Yap
                    </Link>
                </p>
            </div>
        </div>
    );
}