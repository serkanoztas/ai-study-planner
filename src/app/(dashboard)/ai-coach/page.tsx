// src/app/(dashboard)/coach/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Bot, User, Sparkles } from "lucide-react";
import ChatForm from "@/components/ChatForm";
import ReactMarkdown from "react-markdown";

export default async function CoachPage() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return null;

    // Kullanıcının en son sohbetini ve mesajlarını çek
    const latestConversation = await prisma.chatConversation.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: {
            messages: { orderBy: { createdAt: 'asc' } }
        }
    });

    const messages = latestConversation?.messages || [];
    const conversationId = latestConversation?.id || "";

    return (
        <div className="mx-auto max-w-4xl h-[calc(100vh-120px)] flex flex-col bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">

            {/* Üst Kısım: Başlık */}
            <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-white flex items-center gap-4 shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                    <Bot size={24} className="text-fuchsia-100" />
                </div>
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">AI Koçun <Sparkles size={16} className="text-yellow-300" /></h1>
                    <p className="text-violet-100 text-sm font-medium">Programını esnet, tavsiye al veya sadece sohbet et.</p>
                </div>
            </div>

            {/* Mesajlaşma Alanı */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Bot size={48} className="mb-4 text-violet-200" />
                        <p className="font-medium">Hadi ilk mesajını gönder ve çalışmaya başlayalım!</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className={`flex gap-4 ${msg.role === 'USER' ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${msg.role === 'USER' ? 'bg-slate-200 text-slate-600' : 'bg-violet-100 text-violet-600'}`}>
                                {msg.role === 'USER' ? <User size={20} /> : <Bot size={20} />}
                            </div>

                            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'USER' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-100 shadow-sm text-slate-800 rounded-tl-none'}`}>
                                {msg.role === 'USER' ? (
                                    // Kullanıcı mesajı: Düz metin olarak koru, alt satıra geçişleri (whitespace-pre-wrap) destekle
                                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                        {msg.content}
                                    </div>
                                ) : (
                                    // AI mesajı: Markdown olarak formatla, prose class'ları ile stillendir
                                    <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-violet-700">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Alt Kısım: Mesaj Gönderme Formu */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <ChatForm conversationId={conversationId} />
            </div>

        </div>
    );
}