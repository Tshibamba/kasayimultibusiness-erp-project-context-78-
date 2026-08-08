"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const logout = async () => {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/");
  };
  return (
    <button
      onClick={logout}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
      Déconnexion
    </button>
  );
}
