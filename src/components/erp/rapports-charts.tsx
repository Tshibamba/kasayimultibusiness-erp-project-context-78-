"use client";

import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { formatNombre } from "@/lib/format";

const PALETTE = ["#1B4F72", "#2E86AB", "#F0A500", "#27AE60", "#8E44AD", "#E67E22"];

export function ValeursBarChart({ data }: { data: { module: string; valeur: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="module"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            interval={0}
            angle={-12}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            width={50}
            tickFormatter={(v) => Math.round(Number(v) / 1000) + "k"}
          />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
            formatter={(v) => [formatNombre(Number(v), 0) + " FC", "Valeur"]}
          />
          <Bar dataKey="valeur" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenusPieChart({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) {
    return <div className="grid h-72 place-items-center text-sm text-slate-400">Aucune donnée de revenu.</div>;
  }
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
            formatter={(v) => formatNombre(Number(v), 0) + " FC"}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
