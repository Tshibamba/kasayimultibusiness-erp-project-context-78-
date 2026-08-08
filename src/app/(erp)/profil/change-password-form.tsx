"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound } from "lucide-react";
import { Button, Field, Input } from "@/components/agriculture/ui";

export function ChangePasswordForm() {
  const router = useRouter();
  const [cur, setCur] = useState("");
  const [np, setNp] = useState("");
  const [conf, setConf] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (np !== conf) { setErr("Les mots de passe ne correspondent pas."); return; }
    if (np.length < 6) { setErr("Le nouveau mot de passe doit faire au moins 6 caractères."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/staff/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: cur, newPassword: np }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Échec");
      setMsg("Mot de passe modifié avec succès.");
      setCur(""); setNp(""); setConf("");
      router.refresh();
    } catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Mot de passe actuel" required><Input type="password" value={cur} onChange={(e) => setCur(e.target.value)} required /></Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nouveau mot de passe" required><Input type="password" value={np} onChange={(e) => setNp(e.target.value)} required /></Field>
        <Field label="Confirmer" required><Input type="password" value={conf} onChange={(e) => setConf(e.target.value)} required /></Field>
      </div>
      {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{err}</p>}
      {msg && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{msg}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />} Changer le mot de passe
      </Button>
    </form>
  );
}
