"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    BarChart3,
    Bot,
    Settings,
    LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
    { name: "Ana Sayfa", href: "/dashboard", icon: LayoutDashboard },
    { name: "Dersler", href: "/subjects", icon: BookOpen },
    { name: "Takvim", href: "/calendar", icon: Calendar },
    { name: "Analitik", href: "/analytics", icon: BarChart3 },
    { name: "AI Koç", href: "/ai-coach", icon: Bot },
    { name: "Müsaitlik", href: "/settings", icon: Settings },
];

export default function Sidebar({ user }: { user: any }) {
    const pathname = usePathname();

    return (
        <aside className="w-64 flex-col border-r border-slate-200 bg-white hidden md:flex">
            <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm">
                    <BookOpen size={18} />
                </div>
                <span className="font-bold text-slate-900 tracking-tight">EduCoach<span className="text-violet-500">.ai</span></span>
            </div>

            <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${isActive
                                ? "bg-violet-50 text-violet-700 shadow-sm border border-violet-100"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            <Icon size={20} className={isActive ? "text-violet-600" : "text-slate-400"} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-slate-100 p-4">
                <div className="flex items-center gap-3 mb-4 px-3">
                    <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold border border-violet-200">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-bold text-slate-900">
                            {user?.name}
                        </span>
                        <span className="truncate text-xs font-medium text-slate-500">
                            {user?.email}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogOut size={20} className="text-slate-400 group-hover:text-red-500" />
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
}