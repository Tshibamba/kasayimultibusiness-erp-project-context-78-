"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { formatNombre } from "@/lib/format";

type Point = { date: string; quantite: number; label: string };

export function StockEvolutionChart({
  data,
  seuilAlerte,
  seuilCritique,
  unite,
}: {
  data: Point[];
  seuilAlerte: number;
  seuilCritique: number;
  unite: string;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="grid h-64 place-items-center text-sm text-slate-400">
        Aucun mouvement enregistré pour le moment.
      </div>
    );
  }

  // On complète les bornes pour éviter des marges trop serrées
  const series = [...data];
  if (data.length === 1) {
    series.unshift({ ...data[0], label: "début", quantite: 0 });
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="qteFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2E86AB" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#2E86AB" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              fontSize: 12,
              boxShadow: "0 8px 24px rgba(16,24,40,0.08)",
            }}
            labelStyle={{ fontWeight: 600, color: "#1B4F72" }}
            formatter={(v) => [`${formatNombre(Number(v))} ${unite}`, "Quantité"]}
          />
          {seuilAlerte > 0 && (
            <ReferenceLine
              y={seuilAlerte}
              stroke="#F0A500"
              strokeDasharray="5 4"
              label={{ value: "Alerte", fontSize: 10, fill: "#F0A500", position: "insideTopRight" }}
            />
          )}
          {seuilCritique > 0 && (
            <ReferenceLine
              y={seuilCritique}
              stroke="#E74C3C"
              strokeDasharray="5 4"
              label={{ value: "Critique", fontSize: 10, fill: "#E74C3C", position: "insideBottomRight" }}
            />
          )}
          <Area
            type="monotone"
            dataKey="quantite"
            stroke="#2E86AB"
            strokeWidth={2.5}
            fill="url(#qteFill)"
            dot={{ r: 3, fill: "#1B4F72", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
