import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getRapportGlobal, syntheseModules } from "@/lib/rapports";

export const dynamic = "force-dynamic";

export async function GET() {
  const r = await getRapportGlobal();
  const wb = XLSX.utils.book_new();

  const kpi = [
    { Indicateur: "Trésorerie totale", "Montant (FC)": r.tresorerie },
    { Indicateur: "CA encaissé (commerce)", "Montant (FC)": r.caCommerce },
    { Indicateur: "Créances impayées", "Montant (FC)": r.creances },
    { Indicateur: "Masse salariale / mois", "Montant (FC)": r.masseSalariale },
    { Indicateur: "Effectif", "Montant (FC)": r.effectif },
    { Indicateur: "Valeur stock agriculture", "Montant (FC)": r.agriValeur },
    { Indicateur: "Valeur stock commerce", "Montant (FC)": r.commerceValeur },
    { Indicateur: "Revenus transport", "Montant (FC)": r.revenusTransport },
    { Indicateur: "Budget sous-traitance", "Montant (FC)": r.budgetSousTraitance },
    { Indicateur: "CA potentiel traiteur", "Montant (FC)": r.caTraiteur },
    { Indicateur: "Valeur flotte", "Montant (FC)": r.flotteValeur },
  ];
  const wsKpi = XLSX.utils.json_to_sheet(kpi);
  wsKpi["!cols"] = [{ wch: 32 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsKpi, "Indicateurs clés");

  const synthese = syntheseModules(r).map((s) => ({
    Activité: s.module,
    Indicateur: s.indicateur,
    "Montant (FC)": s.montant,
  }));
  const wsSyn = XLSX.utils.json_to_sheet(synthese);
  wsSyn["!cols"] = [{ wch: 24 }, { wch: 26 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsSyn, "Synthèse par activité");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="rapport-kasayimultibusiness.xlsx"',
    },
  });
}
