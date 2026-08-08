"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { Button, Field, Input } from "@/components/agriculture/ui";

export function StaffLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Échec de connexion");
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Email professionnel" required>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@kasayimultibusiness.cd" required />
      </Field>
      <Field label="Mot de passe" required>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
      </Field>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
        Se connecter
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
        <ShieldCheck size={13} /> Accès réservé au personnel autorisé
      </p>
    </form>
  );
}
