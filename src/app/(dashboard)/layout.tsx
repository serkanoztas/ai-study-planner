// src/app/(dashboard)/layout.tsx
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    BarChart3,
    Bot,
    Settings,
    LogOut,
} from "lucide-react";
import { signOut } from "@/lib/auth";


export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const navItems = [
        { name: "Ana Sayfa", href: "/", icon: LayoutDashboard },
        { name: "Dersler", href: "/subjects", icon: BookOpen },
        { name: "Takvim", href: "/calendar", icon: Calendar },
        { name: "Analitik", href: "/analytics", icon: BarChart3 },
        { name: "AI Danışman", href: "/ai-coach", icon: Bot },
        { name: "Müsaitlik", href: "/settings", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 flex-col border-r border-slate-200 bg-white hidden md:flex">
                <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <BookOpen size={18} />
                    </div>
                    <span className="font-bold text-slate-900">AI Study Planner</span>
                </div>

                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600"
                            >
                                <Icon size={20} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-slate-100 p-4">
                    <div className="flex items-center gap-3 mb-4 px-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {session.user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="truncate text-sm font-medium text-slate-900">
                                {session.user.name}
                            </span>
                            <span className="truncate text-xs text-slate-500">
                                {session.user.email}
                            </span>
                        </div>
                    </div>

                    <form
                        action={async () => {
                            "use server";
                            await signOut();
                        }}
                    >
                        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <LogOut size={20} />
                            Çıkış Yap
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobil Topbar (Gelecekte genişletilebilir) */}
                <header className="flex h-16 md:hidden items-center border-b border-slate-200 bg-white px-4">
                    <span className="font-bold text-slate-900">AI Study Planner</span>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}