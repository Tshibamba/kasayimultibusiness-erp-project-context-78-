"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Plus } from "lucide-react";
import { Button, Field, Input, Select } from "@/components/agriculture/ui";

type Settings = {
  nom: string | null;
  slogan: string | null;
  adresse: string | null;
  ville: string | null;
  telephone: string | null;
  email: string | null;
  nif: string | null;
  rc: string | null;
  rccm: string | null;
  devisePrincipale: string;
  tvaTaux: string;
} | null;

export function CompanyForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState({
    nom: settings?.nom ?? "",
    slogan: settings?.slogan ?? "",
    adresse: settings?.adresse ?? "",
    ville: settings?.ville ?? "",
    telephone: settings?.telephone ?? "",
    email: settings?.email ?? "",
    nif: settings?.nif ?? "",
    rc: settings?.rc ?? "",
    rccm: settings?.rccm ?? "",
    devisePrincipale: settings?.devisePrincipale ?? "CDF",
    tvaTaux: settings?.tvaTaux ?? "16",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Échec de l'enregistrement");
      setMsg("Paramètres enregistrés avec succès.");
      router.refresh();
    } catch {
      setMsg("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  // Taux de change
  const [rateDevise, setRateDevise] = useState("USD");
  const [rateValue, setRateValue] = useState("");
  const [rateMsg, setRateMsg] = useState<string | null>(null);
  const [rateLoading, setRateLoading] = useState(false);

  const addRate = async () => {
    setRateMsg(null);
    const v = Number(rateValue);
    if (!Number.isFinite(v) || v <= 0) {
      setRateMsg("Saisissez un taux valide.");
      return;
    }
    setRateLoading(true);
    try {
      const res = await fetch("/api/exchange-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devise: rateDevise, rate: v, setBy: "admin" }),
      });
      if (!res.ok) throw new Error("Échec");
      setRateValue("");
      router.refresh();
    } catch {
      setRateMsg("Erreur lors de l'ajout du taux.");
    } finally {
      setRateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nom de l'entreprise" required>
          <Input value={form.nom} onChange={set("nom")} />
        </Field>
        <Field label="Slogan / Activités">
          <Input value={form.slogan} onChange={set("slogan")} />
        </Field>
        <Field label="Adresse">
          <Input value={form.adresse} onChange={set("adresse")} />
        </Field>
        <Field label="Ville">
          <Input value={form.ville} onChange={set("ville")} />
        </Field>
        <Field label="Téléphone">
          <Input value={form.telephone} onChange={set("telephone")} />
        </Field>
        <Field label="Email">
          <Input value={form.email} onChange={set("email")} />
        </Field>
        <Field label="NIF (N° Identification Fiscale)">
          <Input value={form.nif} onChange={set("nif")} placeholder="ex. A1234567" />
        </Field>
        <Field label="RC (Registre du Commerce)">
          <Input value={form.rc} onChange={set("rc")} />
        </Field>
        <Field label="RCCM">
          <Input value={form.rccm} onChange={set("rccm")} />
        </Field>
        <Field label="Devise principale">
          <Select value={form.devisePrincipale} onChange={set("devisePrincipale")}>
            <option value="CDF">CDF (Franc Congolais)</option>
            <option value="USD">USD (Dollar)</option>
            <option value="EUR">EUR (Euro)</option>
          </Select>
        </Field>
        <Field label="Taux de TVA (%)">
          <Input type="number" step="0.01" value={form.tvaTaux} onChange={set("tvaTaux")} />
        </Field>
      </div>

      {msg && (
        <p className={`rounded-lg px-3 py-2 text-sm ${msg.includes("succès") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-danger"}`}>
          {msg}
        </p>
      )}

      <Button onClick={save} disabled={saving}>
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Enregistrer les paramètres
      </Button>

      <div className="border-t border-slate-100 pt-5">
        <h3 className="font-display text-base font-bold text-slate-900">Saisir un nouveau taux de change</h3>
        <p className="mb-3 text-sm text-slate-500">1 unité de la devise = combien de CDF ?</p>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Devise">
            <Select value={rateDevise} onChange={(e) => setRateDevise(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </Select>
          </Field>
          <Field label="Taux en CDF">
            <Input type="number" value={rateValue} onChange={(e) => setRateValue(e.target.value)} placeholder="ex. 2850" />
          </Field>
          <Button variant="secondary" onClick={addRate} disabled={rateLoading}>
            {rateLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Ajouter
          </Button>
        </div>
        {rateMsg && <p className="mt-2 text-xs text-danger">{rateMsg}</p>}
      </div>
    </div>
  );
}
