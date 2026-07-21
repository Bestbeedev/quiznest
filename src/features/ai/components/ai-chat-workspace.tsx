"use client";

import { useEffect, useRef, useState } from "react";
import { useObject } from "@ai-sdk/react";
import { Send, Plus, Trash2, Bot, User, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { aiChatTurnSchema } from "@/lib/ai/chat-schema";
import {
  createConversationAction,
  getConversationAction,
  associateQuizAction,
  deleteConversationAction,
} from "@/features/ai/actions";
import { AiQuestionBatch } from "@/features/ai/components/ai-question-batch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AiImportQuestion } from "@/lib/validators/ai-import";

type QuizOption = { id: string; title: string };

type ConversationSummary = {
  id: string;
  title: string;
  quizId: string | null;
  quiz: { id: string; title: string } | null;
  updatedAt: Date;
};

type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  proposedQuestions: AiImportQuestion[] | null;
};

export function AiChatWorkspace({
  quizzes,
  initialConversations,
  aiAllowed,
}: {
  quizzes: QuizOption[];
  initialConversations: ConversationSummary[];
  aiAllowed: boolean;
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { object, submit, isLoading, clear } = useObject({
    api: "/api/ai/chat",
    schema: aiChatTurnSchema,
    onError: (error) => {
      toast.error(error.message || "Erreur de communication avec l'IA.");
    },
    onFinish: ({ object: finalObject, error: finishError }) => {
      if (finishError || !finalObject) {
        toast.error("La réponse de l'IA n'a pas pu être traitée. Réessayez.");
        clear();
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "ASSISTANT",
          content: finalObject.reply,
          proposedQuestions: (finalObject.questions as AiImportQuestion[] | undefined) ?? null,
        },
      ]);
      clear();
      setConversations((prev) =>
        [...prev]
          .map((c) => (c.id === activeId ? { ...c, updatedAt: new Date() } : c))
          .sort((a, b) => +b.updatedAt - +a.updatedAt),
      );
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, object]);

  const loadConversation = async (id: string) => {
    const result = await getConversationAction(id);
    if (!result || "error" in result) {
      toast.error(result && "error" in result ? result.error : "Conversation introuvable.");
      return;
    }
    setActiveId(id);
    setQuizId(result.conversation.quizId);
    setMessages(
      result.conversation.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        proposedQuestions: (m.proposedQuestions as AiImportQuestion[] | null) ?? null,
      })),
    );
  };

  const handleNewConversation = () => {
    setActiveId(null);
    setMessages([]);
    setQuizId(null);
    setInput("");
    clear();
  };

  const handleDelete = async (id: string) => {
    await deleteConversationAction(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) handleNewConversation();
  };

  const handleQuizChange = async (value: string | null) => {
    const nextQuizId = !value || value === "none" ? null : value;
    setQuizId(nextQuizId);
    if (activeId) {
      await associateQuizAction(activeId, nextQuizId);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, quizId: nextQuizId, quiz: quizzes.find((q) => q.id === nextQuizId) ?? null }
            : c,
        ),
      );
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    if (!aiAllowed) {
      toast.error("Génération IA indisponible. Passez à un plan supérieur ou configurez votre propre clé API.");
      return;
    }

    let conversationId = activeId;
    if (!conversationId) {
      const result = await createConversationAction(quizId);
      conversationId = result.conversation.id;
      setConversations((prev) => [
        { ...result.conversation, quiz: quizzes.find((q) => q.id === quizId) ?? null },
        ...prev,
      ]);
      setActiveId(conversationId);
    }

    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: "USER", content: trimmed, proposedQuestions: null }]);
    setInput("");
    submit({ conversationId, message: trimmed });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <div className="flex flex-col gap-2 rounded-lg border p-3">
        <Button type="button" size="sm" className="gap-1.5" onClick={handleNewConversation}>
          <Plus className="size-4" />
          Nouvelle conversation
        </Button>

        <div className="mt-2 flex flex-col gap-1 overflow-y-auto">
          {conversations.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">Aucune conversation pour l&apos;instant.</p>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              className={cn(
                "group flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted/60",
                activeId === c.id && "bg-muted",
              )}
            >
              <button type="button" className="flex min-w-0 flex-1 items-center gap-2" onClick={() => loadConversation(c.id)}>
                <MessageSquare className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{c.title}</span>
              </button>
              <button
                type="button"
                aria-label="Supprimer"
                className="shrink-0 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                onClick={() => handleDelete(c.id)}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-h-[32rem] flex-col rounded-lg border">
        <div className="flex items-center justify-between gap-2 border-b p-3">
          <p className="text-sm font-medium">Quiz associé</p>
          <Select value={quizId ?? "none"} onValueChange={handleQuizChange}>
            <SelectTrigger className="h-8 w-56 text-xs">
              <SelectValue placeholder="Aucun quiz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun quiz</SelectItem>
              {quizzes.map((q) => (
                <SelectItem key={q.id} value={q.id}>
                  {q.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <Bot className="size-8" />
              <p>Décrivez le quiz que vous voulez créer — sujet, niveau, nombre de questions.</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={cn("flex gap-2.5", message.role === "USER" && "flex-row-reverse")}>
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                {message.role === "USER" ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
              </div>
              <div className={cn("max-w-[85%] rounded-lg px-3 py-2 text-sm", message.role === "USER" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.proposedQuestions && message.proposedQuestions.length > 0 && (
                  <AiQuestionBatch questions={message.proposedQuestions} quizId={quizId} />
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                <Bot className="size-3.5" />
              </div>
              <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm">
                {object?.reply ? (
                  <p className="whitespace-pre-wrap">{object.reply}</p>
                ) : (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex items-end gap-2 border-t p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ex : Génère 10 questions sur la Révolution française, niveau moyen..."
            rows={2}
            className="w-full min-w-0 resize-none rounded-lg border bg-transparent p-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button type="button" size="icon" disabled={!input.trim() || isLoading} onClick={handleSend}>
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
