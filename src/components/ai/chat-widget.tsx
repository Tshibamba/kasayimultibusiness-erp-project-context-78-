"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bot, X, Send, Loader2, Trash2, Copy, Check, User, Sparkles, MessageSquare } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [conversationId, setConversationId] = useState<number | undefined>();
  const [conversations, setConversations] = useState<{ id: number; title: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open && conversations.length === 0) {
      fetch("/api/ai/conversations").then(r => r.json()).then(d => setConversations(d.conversations || [])).catch(() => {});
    }
  }, [open, conversations.length]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setError(null);
    const newMsgs = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMsgs);
    setLoading(true);

    setAuthRequired(false);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })), conversationId }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setAuthRequired(true);
        setMessages(prev => prev.slice(0, -1));
        setInput(userMsg);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Erreur");
      setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
      if (data.conversationId && !conversationId) setConversationId(data.conversationId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => { setMessages([]); setConversationId(undefined); setShowHistory(false); };
  const loadConversation = async (id: number) => {
    const res = await fetch(`/api/ai/conversations?id=${id}`);
    const data = await res.json();
    setMessages((data.messages || []).map((m: { role: string; content: string }) => ({ role: m.role as "user" | "assistant", content: m.content })));
    setConversationId(id);
    setShowHistory(false);
  };

  const copyMsg = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-800 text-slate-100 rounded-lg p-3 my-2 overflow-x-auto text-xs"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1 rounded text-xs">$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^### (.+)$/gm, '<h3 class="font-bold text-sm mt-2 mb-1">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="font-bold text-base mt-2 mb-1">$1</h2>')
      .replace(/\n/g, "<br/>");
  };

  return (
    <>
      {/* Bouton flottant */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-marine text-white shadow-xl transition hover:scale-110 hover:bg-marine-clair"
          title="Assistant IA"
        >
          <Bot size={26} />
          <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-or text-[10px] font-bold">AI</span>
        </button>
      )}

      {/* Fenêtre de chat */}
      {open && (
        <div className="fixed bottom-0 right-0 z-50 flex h-[100dvh] w-full flex-col bg-white shadow-2xl sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[400px] sm:rounded-2xl sm:border sm:border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-marine to-[#1d5a82] px-4 py-3 text-white sm:rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-or" />
              <span className="font-display text-sm font-bold">Assistant IA</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowHistory(!showHistory)} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-white/15" title="Historique"><MessageSquare size={15} /></button>
              <button onClick={newChat} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-white/15" title="Nouvelle conversation"><Trash2 size={15} /></button>
              <button onClick={() => setOpen(false)} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-white/15" title="Fermer"><X size={18} /></button>
            </div>
          </div>

          {/* Panneau historique */}
          {showHistory && (
            <div className="max-h-48 overflow-y-auto border-b border-slate-100 bg-slate-50 px-3 py-2">
              {conversations.length === 0 ? <p className="py-4 text-center text-xs text-slate-400">Aucune conversation.</p> : conversations.map(c => (
                <button key={c.id} onClick={() => loadConversation(c.id)} className="block w-full truncate rounded-lg px-3 py-2 text-left text-xs text-slate-600 transition hover:bg-white">{c.title}</button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50 px-4 py-3">
            {authRequired ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-or/10"><Sparkles size={28} className="text-or" /></div>
                <p className="font-display text-sm font-bold text-slate-700">Connexion requise</p>
                <p className="mt-1 text-xs text-slate-400">L'assistant IA est réservé aux agents et clients connectés.</p>
                <div className="mt-4 flex flex-col gap-2">
                  <a href="/login" className="rounded-xl bg-marine px-4 py-2 text-xs font-bold text-white transition hover:bg-marine-clair">🔐 Espace agent</a>
                  <a href="/connexion" className="rounded-xl bg-ciel px-4 py-2 text-xs font-bold text-white transition hover:brightness-95">👤 Espace client</a>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-marine/10"><Bot size={32} className="text-marine" /></div>
                <p className="font-display text-sm font-bold text-slate-700">Bonjour ! 👋</p>
                <p className="mt-1 max-w-[260px] text-xs text-slate-400">Posez-moi une question : chiffre d'affaires, stocks, bénéfices...</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {["📊 Chiffre d'affaires", "🔔 Produits en rupture", "💰 Bénéfices", "📋 Résumé"].map(s => (
                    <button key={s} onClick={() => { setInput(s); }} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-marine/5">{s}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${m.role === "user" ? "bg-ciel/10" : "bg-marine/10"}`}>
                      {m.role === "user" ? <User size={14} className="text-ciel" /> : <Bot size={14} className="text-marine" />}
                    </div>
                    <div className={`group max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-ciel text-white" : "bg-white text-slate-700 ring-1 ring-slate-100"}`}>
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
                      {m.role === "assistant" && (
                        <button onClick={() => copyMsg(m.content, i)} className="mt-1 opacity-0 transition group-hover:opacity-100">
                          {copiedIdx === i ? <span className="text-[10px] text-emerald-500">✓ Copié</span> : <Copy size={12} className="text-slate-300 hover:text-slate-500" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2">
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-marine/10"><Bot size={14} className="text-marine" /></div>
                    <div className="flex items-center gap-1 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-danger">{error}</p>}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={1}
                placeholder="Écrivez votre message..."
                className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ciel"
                style={{ maxHeight: "100px" }}
              />
              <button onClick={send} disabled={loading || !input.trim()} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-marine text-white transition hover:bg-marine-clair disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <p className="mt-1 text-center text-[10px] text-slate-300">Assistant IA KasayiMultiBusiness · Mode démo sans clé API</p>
          </div>
        </div>
      )}
    </>
  );
}
