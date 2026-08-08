"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2, ArrowRight } from "lucide-react";

export function NewsletterForm({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Échec");
      setDone(true);
      setEmail("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    variant === "dark"
      ? "bg-white/10 text-white placeholder:text-slate-400 border-white/20"
      : "bg-white text-slate-900 placeholder:text-slate-400 border-slate-300";

  if (done) {
    return (
      <p className={`inline-flex items-center gap-2 text-sm font-medium ${variant === "dark" ? "text-or-clair" : "text-emerald-600"}`}>
        <CheckCircle2 size={16} /> Merci ! Votre inscription est confirmée.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Mail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${variant === "dark" ? "text-slate-400" : "text-slate-400"}`} />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse email"
          required
          className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-ciel focus:ring-2 focus:ring-ciel/25 ${inputCls}`}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-or px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        S'abonner
      </button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  );
}
