// src/components/ChatForm.tsx
"use client";

import { useRef, useTransition } from "react";
import { Send, Loader2 } from "lucide-react";
import { sendMessage } from "@/server/actions/chat";
import toast from "react-hot-toast";

export default function ChatForm({ conversationId }: { conversationId: string }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await sendMessage(formData);

            // Backend'den hata dönerse ekrana bildirim bas
            if (result?.error) {
                toast.error(result.error);
            } else {
                // Başarılıysa input'u temizle
                formRef.current?.reset();
            }
        });
    };
    return (
        <form ref={formRef} action={handleSubmit} className="flex items-center gap-3">
            <input type="hidden" name="conversationId" value={conversationId} />
            <input
                type="text"
                name="message"
                placeholder={isPending ? "Koç yanıtlıyor..." : "Aklına takılanları sor..."}
                autoComplete="off"
                required
                disabled={isPending}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
                type="submit"
                disabled={isPending}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-all shadow-sm disabled:bg-violet-400 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : (
                    <Send size={20} className="ml-1" />
                )}
            </button>
        </form>
    );
}