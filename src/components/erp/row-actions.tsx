"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Eye, EyeOff, Loader2 } from "lucide-react";

export function DeleteButton({ endpoint }: { endpoint: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const del = async () => {
    if (!confirm("Supprimer définitivement cet élément ?")) return;
    setLoading(true);
    try {
      await fetch(endpoint, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      onClick={del}
      disabled={loading}
      title="Supprimer"
      className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-danger disabled:opacity-50"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
    </button>
  );
}

export function TogglePublishButton({
  endpoint,
  published,
}: {
  endpoint: string;
  published: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [p, setP] = useState(published);
  const toggle = async () => {
    setLoading(true);
    const next = !p;
    try {
      await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: next }),
      });
      setP(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50 ${
        p ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : p ? <Eye size={12} /> : <EyeOff size={12} />}
      {p ? "Publié" : "Brouillon"}
    </button>
  );
}
