"use client";

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatNombre } from "@/lib/format";

export function BilanEvolutionChart({ data }: { data: { mois: string; recettes: number; depenses: number; benefice: number }[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#27AE60" stopOpacity={0.3} /><stop offset="95%" stopColor="#27AE60" stopOpacity={0.02} /></linearGradient>
            <linearGradient id="gDep" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E74C3C" stopOpacity={0.3} /><stop offset="95%" stopColor="#E74C3C" stopOpacity={0.02} /></linearGradient>
            <linearGradient id="gBen" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1B4F72" stopOpacity={0.3} /><stop offset="95%" stopColor="#1B4F72" stopOpacity={0.02} /></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => formatNombre(Number(v), 0) + " FC"} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="recettes" name="Recettes" stroke="#27AE60" strokeWidth={2} fill="url(#gRec)" />
          <Area type="monotone" dataKey="depenses" name="Dépenses" stroke="#E74C3C" strokeWidth={2} fill="url(#gDep)" />
          <Area type="monotone" dataKey="benefice" name="Bénéfice" stroke="#1B4F72" strokeWidth={2} fill="url(#gBen)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
