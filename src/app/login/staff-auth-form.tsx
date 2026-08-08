"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, UserPlus, ShieldCheck, Clock } from "lucide-react";
import { Button, Field, Input, Select } from "@/components/agriculture/ui";

export function StaffAuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", phone: "", departement: "" });

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/staff/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Échec");
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/staff/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Échec");
      setSuccess(j.message || "Compte créé. En attente d'activation par l'administrateur.");
      setRegisterForm({ name: "", email: "", password: "", phone: "", departement: "" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Onglets */}
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
        <button type="button" onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-white text-marine shadow-sm" : "text-slate-500"}`}>
          Connexion
        </button>
        <button type="button" onClick={() => { setMode("register"); setError(null); setSuccess(null); }}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${mode === "register" ? "bg-white text-marine shadow-sm" : "text-slate-500"}`}>
          S'inscrire
        </button>
      </div>

      {mode === "login" ? (
        <form onSubmit={submitLogin} className="space-y-4">
          <Field label="Email professionnel" required>
            <Input type="email" value={loginForm.email} onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))} placeholder="admin@kasayimulti.cd" required />
          </Field>
          <Field label="Mot de passe" required>
            <Input type="password" value={loginForm.password} onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" required />
          </Field>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />} Se connecter
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
            <ShieldCheck size={13} /> Accès réservé au personnel autorisé
          </p>
        </form>
      ) : (
        <form onSubmit={submitRegister} className="space-y-4">
          <Field label="Nom complet" required>
            <Input value={registerForm.name} onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))} placeholder="Jean Mukendi" required />
          </Field>
          <Field label="Email professionnel" required>
            <Input type="email" value={registerForm.email} onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))} placeholder="vous@kasayimulti.cd" required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Téléphone">
              <Input value={registerForm.phone} onChange={(e) => setRegisterForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+243 ..." />
            </Field>
            <Field label="Département souhaité">
              <Select value={registerForm.departement} onChange={(e) => setRegisterForm((f) => ({ ...f, departement: e.target.value }))}>
                <option value="">— Choisir —</option>
                <option value="Agriculture">🌱 Agriculture</option>
                <option value="Commerce">🛒 Commerce</option>
                <option value="Transport">🚚 Transport</option>
                <option value="Sous-traitance">🏗️ Sous-traitance</option>
                <option value="Traiteur">🍽️ Service traiteur</option>
                <option value="Comptabilité">💰 Comptabilité</option>
                <option value="Administration">🔐 Administration</option>
              </Select>
            </Field>
          </div>
          <Field label="Mot de passe" required>
            <Input type="password" value={registerForm.password} onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))} placeholder="Minimum 6 caractères" required />
          </Field>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
          {success && (
            <div className="rounded-lg bg-amber-50 px-3 py-3 text-sm text-amber-700">
              <p className="flex items-center gap-2 font-semibold"><Clock size={15} /> Compte créé — en attente d'activation</p>
              <p className="mt-1 text-xs">{success}</p>
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Créer mon compte agent
          </Button>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
            📋 Votre compte sera créé avec le rôle <strong>Agent de saisie</strong>. L'administrateur l'activera et vous attribuera votre rôle définitif (comptable, responsable, etc.).
          </div>
        </form>
      )}

      <p className="mt-4 text-center text-[11px] text-slate-300">
        Espace agent ERP · KasayiMultiBusiness · {new Date().getFullYear()}
      </p>
    </div>
  );
}
