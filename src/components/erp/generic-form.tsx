"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Modal } from "@/components/agriculture/modal";
import { Button, Field, Input, Select, Textarea } from "@/components/agriculture/ui";

export type FormField = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "textarea";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  half?: boolean;
};

export function GenericForm({
  endpoint,
  title,
  description,
  fields,
  preset,
  triggerLabel = "Ajouter",
  triggerVariant = "gold",
}: {
  endpoint: string;
  title: string;
  description?: string;
  fields: FormField[];
  preset?: Record<string, string | number>;
  triggerLabel?: string;
  triggerVariant?: "primary" | "secondary" | "gold" | "outline";
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const router = useRouter();

  const set = (name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [name]: e.target.value }));

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of fields) {
        const v = values[f.name] ?? "";
        payload[f.name] = f.type === "number" ? (v === "" ? 0 : Number(v)) : v;
      }
      if (preset) Object.assign(payload, preset);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Échec de l'enregistrement.");
      }
      setOpen(false);
      setValues({});
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant={triggerVariant} onClick={() => setOpen(true)}>
        <Plus size={16} />
        {triggerLabel}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={title} description={description} size="lg">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.name} className={f.half === false ? "sm:col-span-1" : f.type === "textarea" ? "sm:col-span-2" : ""}>
              <Field label={f.label} required={f.required}>
                {f.type === "select" ? (
                  <Select value={values[f.name] ?? ""} onChange={set(f.name)}>
                    <option value="">— Sélectionner —</option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                ) : f.type === "textarea" ? (
                  <Textarea rows={3} value={values[f.name] ?? ""} onChange={set(f.name)} placeholder={f.placeholder} />
                ) : (
                  <Input
                    type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                    step={f.type === "number" ? "0.01" : undefined}
                    value={values[f.name] ?? ""}
                    onChange={set(f.name)}
                    placeholder={f.placeholder}
                  />
                )}
              </Field>
            </div>
          ))}
        </div>
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Enregistrer
          </Button>
        </div>
      </Modal>
    </>
  );
}
