// src/app/(dashboard)/session/[taskId]/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TimerClient from "../../../../components/TimerClient";

export default async function SessionPage({
    params,
}: {
    params: Promise<{ taskId: string }>;
}) {
    const session = await auth();
    const { taskId } = await params;

    const task = await prisma.studyTask.findUnique({
        where: { id: taskId, userId: session?.user?.id },
        include: { subject: true, topic: true }
    });

    if (!task) redirect("/calendar");

    return (
        <div className="relative min-h-[85vh] flex flex-col items-center justify-center bg-slate-950 rounded-[3rem] p-6 overflow-hidden border border-slate-800/60 shadow-2xl">
            {/* Aurora Arka Plan Efektleri */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-fuchsia-600/10 blur-[80px] rounded-full pointer-events-none mix-blend-screen"></div>

            {/* Gürültü (Noise) Kaplaması */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-2xl">
                <TimerClient
                    taskId={task.id}
                    title={task.title}
                    subjectName={task.subject?.name || "Bilinmeyen Ders"}
                    subjectColor={task.subject?.color || "#8b5cf6"}
                    durationMinutes={task.durationMinutes}
                />
            </div>
        </div>
    );
}