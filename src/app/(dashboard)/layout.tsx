import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            {/* İstemci tarafında çalışan yeni Sidebar bileşenimiz */}
            <Sidebar user={session.user} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobil Topbar */}
                <header className="flex h-16 md:hidden items-center border-b border-slate-200 bg-white px-4">
                    <span className="font-bold text-slate-900">EduCoach<span className="text-violet-500">.ai</span></span>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}