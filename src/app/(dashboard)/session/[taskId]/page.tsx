// src/app/(dashboard)/session/[taskId]/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FocusTimer from "@/components/FocusTimer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SessionPage({
    params,
}: {
    params: Promise<{ taskId: string }>;
}) {
    const session = await auth();
    const { taskId } = await params;

    // Veritabanından spesifik görevi çekiyoruz
    const task = await prisma.studyTask.findUnique({
        where: {
            id: taskId,
            userId: session?.user?.id
        },
        include: { subject: true }
    });

    if (!task) {
        redirect("/calendar");
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Link href="/calendar" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4">
                <ArrowLeft size={16} /> Takvime Dön
            </Link>

            {/* İstemci Tarafı (Client Component) Kronometreyi Çağırıyoruz */}
            <FocusTimer task={task} />
        </div>
    );
}