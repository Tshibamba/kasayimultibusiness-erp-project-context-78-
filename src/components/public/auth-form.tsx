"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LogIn, UserPlus, ShieldCheck, Sparkles } from "lucide-react";
import { Button, Field, Input } from "@/components/agriculture/ui";
import { ACTIVITES } from "@/lib/public/site-data";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ nom: "", email: "", telephone: "", entreprise: "", password: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { nom: form.nom, email: form.email, telephone: form.telephone, entreprise: form.entreprise, password: form.password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Échec");
      router.refresh();
      router.push("/mon-compte");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => { setMode("login"); setError(null); }}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-white text-marine shadow-sm" : "text-slate-500"}`}
        >
          Connexion
        </button>
        <button
          type="button"
          onClick={() => { setMode("register"); setError(null); }}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${mode === "register" ? "bg-white text-marine shadow-sm" : "text-slate-500"}`}
        >
          Créer un compte
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "register" && (
          <Field label="Nom complet" required>
            <Input value={form.nom} onChange={set("nom")} placeholder="Votre nom" required />
          </Field>
        )}
        <Field label="Email" required>
          <Input type="email" value={form.email} onChange={set("email")} placeholder="vous@email.com" required />
        </Field>
        {mode === "register" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Téléphone">
              <Input value={form.telephone} onChange={set("telephone")} placeholder="+243 ..." />
            </Field>
            <Field label="Entreprise (optionnel)">
              <Input value={form.entreprise} onChange={set("entreprise")} placeholder="Nom de l'entreprise" />
            </Field>
          </div>
        )}
        <Field label="Mot de passe" required>
          <Input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required />
        </Field>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}
          {mode === "login" ? "Se connecter" : "Créer mon compte"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-400">
        Espace réservé aux clients et partenaires. Besoin d'aide ?{" "}
        <Link href="/contact" className="font-medium text-ciel hover:text-marine">Contactez-nous</Link>.
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-3 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1"><ShieldCheck size={12} /> Données sécurisées</span>
        <span className="inline-flex items-center gap-1"><Sparkles size={12} /> Suivi de vos demandes</span>
      </div>
      <div className="mt-2 text-center text-[11px] text-slate-300">
        {ACTIVITES.length} activités disponibles · KasayiMultiBusiness
      </div>
    </div>
  );
}
