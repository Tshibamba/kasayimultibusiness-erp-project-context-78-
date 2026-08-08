import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getBilanGlobal, getEvolutionMensuelle } from "@/lib/bilan";

export const dynamic = "force-dynamic";

const MOIS_NOMS = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const an = Number(url.searchParams.get("annee")) || new Date().getFullYear();
  const mo = url.searchParams.get("mois") ? Number(url.searchParams.get("mois")) : null;
  const periode = mo ? `${MOIS_NOMS[mo]} ${an}` : `Année ${an}`;

  const [bilan, evolution] = await Promise.all([getBilanGlobal(an, mo), getEvolutionMensuelle(an)]);
  const wb = XLSX.utils.book_new();

  // Feuille 1 : Bilan par activité
  const lignes = bilan.services.map((s) => ({
    Activité: s.service,
    "Recettes (FC)": s.recettes,
    "Dépenses (FC)": s.depenses,
    "Bénéfice (FC)": s.benefice,
    "Marge (%)": s.recettes > 0 ? Math.round((s.benefice / s.recettes) * 100) : 0,
  }));
  lignes.push({ Activité: "TOTAL GLOBAL", "Recettes (FC)": bilan.totalRecettes, "Dépenses (FC)": bilan.totalDepenses, "Bénéfice (FC)": bilan.beneficeNet, "Marge (%)": bilan.totalRecettes > 0 ? Math.round((bilan.beneficeNet / bilan.totalRecettes) * 100) : 0 });
  const wsBilan = XLSX.utils.json_to_sheet(lignes);
  wsBilan["!cols"] = [{ wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsBilan, `Bilan ${periode}`.slice(0, 31));

  // Feuille 2 : Évolution mensuelle
  const wsEvol = XLSX.utils.json_to_sheet(evolution.map((p) => ({ Mois: p.mois, "Recettes (FC)": p.recettes, "Dépenses (FC)": p.depenses, "Bénéfice (FC)": p.benefice })));
  wsEvol["!cols"] = [{ wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsEvol, `Évolution ${an}`);

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(new Uint8Array(buf), {
    headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="bilan-${an}${mo ? "-" + mo : ""}.xlsx"` },
  });
}
