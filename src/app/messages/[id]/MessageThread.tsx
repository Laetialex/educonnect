"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "../actions";
import type { Message } from "@/types/database";

export default function MessageThread({
  conversationId,
  currentUserId,
  otherUserName,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef(new Set(initialMessages.map((m) => m.id)));

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          if (seenIds.current.has(incoming.id)) return;
          seenIds.current.add(incoming.id);
          setMessages((prev) => [...prev, incoming]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;

    setText("");

    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId,
      text: value,
      created_at: new Date().toISOString(),
    };
    seenIds.current.add(optimistic.id);
    setMessages((prev) => [...prev, optimistic]);

    const formData = new FormData();
    formData.set("conversationId", conversationId);
    formData.set("text", value);

    startTransition(async () => {
      await sendMessage(formData);
    });
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900">
        {otherUserName}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-slate-400">
            Dis bonjour pour démarrer la conversation 👋
          </p>
        )}

        {messages.map((message) => {
          const isMine = message.sender_id === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isMine
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {message.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-slate-200 p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écris ton message..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
