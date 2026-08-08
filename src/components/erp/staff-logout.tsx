"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

export function StaffLogout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const logout = async () => {
    setLoading(true);
    await fetch("/api/auth/staff/logout", { method: "POST" });
    router.push("/login");
  };
  return (
    <button
      onClick={logout}
      disabled={loading}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
      Déconnexion
    </button>
  );
}
