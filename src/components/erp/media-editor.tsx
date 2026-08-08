"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ImageIcon } from "lucide-react";

export function MediaEditor({ type, id, label, currentUrl }: { type: string; id: number | string; label: string; currentUrl: string | null }) {
  const router = useRouter();
  const [url, setUrl] = useState(currentUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/medias", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, url }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {url ? <img src={url} alt={label} className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-slate-300"><ImageIcon size={20} /></div>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-700">{label}</p>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://... ou /images/..."
          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 outline-none focus:border-ciel"
        />
      </div>
      <button
        onClick={save}
        disabled={saving}
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition disabled:opacity-50 ${saved ? "bg-emerald-100 text-emerald-600" : "bg-marine/10 text-marine hover:bg-marine hover:text-white"}`}
        title="Enregistrer"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? "✓" : <Save size={14} />}
      </button>
    </div>
  );
}
