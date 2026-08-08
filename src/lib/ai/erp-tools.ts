// ─────────────────────────────────────────────────────────────
// ERP AI Tools — Accès intelligent aux données PostgreSQL
// ─────────────────────────────────────────────────────────────

import { db } from "@/db";
import { sql } from "drizzle-orm";
import { toNum } from "@/lib/format";

type ToolResult = { text: string; data?: unknown };
type Row = Record<string, string | number | null>;

function fmt(n: number): string {
  return new Intl.NumberFormat("fr-CD").format(Math.round(n));
}

export async function toolChiffreAffaires(): Promise<ToolResult> {
  const result = await db.execute(sql`
    SELECT
      COALESCE(SUM(v.total), 0) as ca_agri,
      (SELECT COALESCE(SUM(total_ttc), 0) FROM sales WHERE statut = 'PAYEE' AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM NOW()) AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())) as ca_commerce,
      (SELECT COALESCE(SUM(revenu), 0) FROM trips WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW()) AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())) as ca_transport,
      (SELECT COALESCE(SUM(montant_total), 0) FROM events WHERE EXTRACT(MONTH FROM date_evenement) = EXTRACT(MONTH FROM NOW()) AND EXTRACT(YEAR FROM date_evenement) = EXTRACT(YEAR FROM NOW())) as ca_traiteur,
      (SELECT COALESCE(SUM(montant), 0) FROM project_payment WHERE EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM NOW()) AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())) as ca_soustraitance
    FROM vente_agricole v
    WHERE EXTRACT(MONTH FROM v.date) = EXTRACT(MONTH FROM NOW())
      AND EXTRACT(YEAR FROM v.date) = EXTRACT(YEAR FROM NOW())
  `).catch(() => null);
  if (!result?.rows?.length) return { text: "Aucune donnée disponible pour ce mois." };
  const r = result.rows[0] as Row;
  const agri = toNum(r.ca_agri), com = toNum(r.ca_commerce), tra = toNum(r.ca_transport), tit = toNum(r.ca_traiteur), st = toNum(r.ca_soustraitance);
  const total = agri + com + tra + tit + st;
  return { text: `## 📊 Chiffre d'affaires du mois\n\n| Activité | Montant |\n|---|---|\n| 🌱 Agriculture | ${fmt(agri)} FC |\n| 🛒 Commerce | ${fmt(com)} FC |\n| 🚚 Transport | ${fmt(tra)} FC |\n| 🍽️ Traiteur | ${fmt(tit)} FC |\n| 🏗️ Sous-traitance | ${fmt(st)} FC |\n| **TOTAL** | **${fmt(total)} FC** |\n\n${total > 0 ? `✅ Le CA de ce mois s'élève à **${fmt(total)} FC**.` : "⚠️ Aucune vente enregistrée ce mois."}` };
}

export async function toolStockFaible(): Promise<ToolResult> {
  const result = await db.execute(sql`
    SELECT p.nom, s.quantite, p.unite, s.statut FROM produit_intrant p
    LEFT JOIN stock_intrant s ON s.produit_id = p.id
    WHERE s.statut IN ('RUPTURE', 'CRITIQUE', 'FAIBLE')
    ORDER BY CASE s.statut WHEN 'RUPTURE' THEN 0 WHEN 'CRITIQUE' THEN 1 ELSE 2 END LIMIT 10
  `).catch(() => null);
  const rows = (result?.rows ?? []) as Row[];
  if (!rows.length) return { text: "✅ **Aucun produit en alerte.** Tous les stocks sont au-dessus des seuils." };
  const lignes = rows.map(r => `| ${r.nom} | ${r.quantite} ${r.unite} | ${r.statut} |`).join("\n");
  return { text: `## 🔔 Produits en alerte de stock\n\n| Produit | Quantité | Statut |\n|---|---|---|\n${lignes}\n\n⚠️ **${rows.length} produit(s)** nécessitent un réapprovisionnement.` };
}

export async function toolImpayes(): Promise<ToolResult> {
  const result = await db.execute(sql`SELECT client, total_ttc, reference, date FROM sales WHERE statut != 'PAYEE' ORDER BY date DESC LIMIT 10`).catch(() => null);
  const rows = (result?.rows ?? []) as Row[];
  if (!rows.length) return { text: "✅ **Aucune facture impayée.** Toutes les ventes commerciales sont réglées." };
  const lignes = rows.map(r => `| ${r.client} | ${fmt(toNum(r.total_ttc))} FC | ${r.reference} |`).join("\n");
  const total = rows.reduce((s, r) => s + toNum(r.total_ttc), 0);
  return { text: `## 💰 Factures impayées\n\n| Client | Montant | Référence |\n|---|---|---|\n${lignes}\n\n**Total à recouvrer : ${fmt(total)} FC**` };
}

export async function toolRentabilite(): Promise<ToolResult> {
  const result = await db.execute(sql`
    SELECT
      (SELECT COALESCE(SUM(total), 0) FROM vente_agricole WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())) as rec_agri,
      (SELECT COALESCE(SUM(total_ttc), 0) FROM sales WHERE statut = 'PAYEE' AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())) as rec_com,
      (SELECT COALESCE(SUM(revenu), 0) FROM trips WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())) as rec_tra,
      (SELECT COALESCE(SUM(montant_total), 0) FROM events WHERE EXTRACT(YEAR FROM date_evenement) = EXTRACT(YEAR FROM NOW())) as rec_tit,
      (SELECT COALESCE(SUM(montant), 0) FROM project_payment WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())) as rec_st
  `).catch(() => null);
  if (!result?.rows?.length) return { text: "Aucune donnée de rentabilité disponible." };
  const d = result.rows[0] as Row;
  const activites = [
    { nom: "🌱 Agriculture", v: toNum(d.rec_agri) }, { nom: "🛒 Commerce", v: toNum(d.rec_com) },
    { nom: "🚚 Transport", v: toNum(d.rec_tra) }, { nom: "🍽️ Traiteur", v: toNum(d.rec_tit) },
    { nom: "🏗️ Sous-traitance", v: toNum(d.rec_st) },
  ].sort((a, b) => b.v - a.v);
  const lignes = activites.map(a => `| ${a.nom} | ${fmt(a.v)} FC |`).join("\n");
  return { text: `## 📈 Rentabilité par activité (${new Date().getFullYear()})\n\n| Activité | Recettes |\n|---|---|\n${lignes}\n\n🏆 **L'activité la plus rentable est ${activites[0].nom}** avec ${fmt(activites[0].v)} FC.` };
}

export async function toolBenefices(): Promise<ToolResult> {
  const result = await db.execute(sql`
    SELECT
      COALESCE((SELECT SUM(total) FROM vente_agricole WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())), 0) +
      COALESCE((SELECT SUM(total_ttc) FROM sales WHERE statut = 'PAYEE' AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())), 0) +
      COALESCE((SELECT SUM(revenu) FROM trips WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())), 0) +
      COALESCE((SELECT SUM(montant_total) FROM events WHERE EXTRACT(YEAR FROM date_evenement) = EXTRACT(YEAR FROM NOW())), 0) +
      COALESCE((SELECT SUM(montant) FROM project_payment WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())), 0) as recettes,
      COALESCE((SELECT SUM(valeur) FROM mouvement_stock WHERE type = 'ENTREE' AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())), 0) +
      COALESCE((SELECT SUM(cout) FROM fuel_record WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())), 0) +
      COALESCE((SELECT SUM(montant) FROM project_expense WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())), 0) +
      COALESCE((SELECT SUM(total) FROM commerce_purchase WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())), 0) +
      COALESCE((SELECT SUM(salaire_base) FROM employees), 0) as depenses
  `).catch(() => null);
  if (!result?.rows?.length) return { text: "Aucune donnée financière disponible." };
  const d = result.rows[0] as Row;
  const rec = toNum(d.recettes), dep = toNum(d.depenses), ben = rec - dep;
  return { text: `## 💰 Bénéfices ${new Date().getFullYear()}\n\n| Élément | Montant |\n|---|---|\n| Recettes totales | ${fmt(rec)} FC |\n| Dépenses totales | ${fmt(dep)} FC |\n| **Bénéfice net** | **${fmt(ben)} FC** |\n\n${ben >= 0 ? "✅ L'entreprise est **bénéficiaire**." : "⚠️ L'entreprise est **en déficit**."}` };
}

export async function toolEmployesAbsents(): Promise<ToolResult> {
  const result = await db.execute(sql`
    SELECT e.prenom, e.nom, e.poste, l.type, l.date_fin FROM employees e
    JOIN leaves l ON l.employee_id = e.id
    WHERE l.statut = 'approved' AND CURRENT_DATE BETWEEN l.date_debut AND l.date_fin
  `).catch(() => null);
  const rows = (result?.rows ?? []) as Row[];
  if (!rows.length) return { text: "✅ **Aucun employé absent aujourd'hui.**" };
  const lignes = rows.map(r => `- **${r.prenom} ${r.nom}** (${r.poste}) — ${r.type} jusqu'au ${r.date_fin}`).join("\n");
  return { text: `## 👥 Employés absents aujourd'hui\n\n${lignes}\n\n⚠️ **${rows.length} employé(s)** en congé.` };
}

export async function toolVehiculesEntretien(): Promise<ToolResult> {
  const result = await db.execute(sql`
    SELECT v.plaque, v.marque, v.modele, v.statut FROM vehicles v
    WHERE v.statut = 'maintenance' OR EXISTS (
      SELECT 1 FROM maintenance WHERE vehicle_id = v.id AND prochaine_date IS NOT NULL AND prochaine_date <= CURRENT_DATE + INTERVAL '7 days'
    ) LIMIT 10
  `).catch(() => null);
  const rows = (result?.rows ?? []) as Row[];
  if (!rows.length) return { text: "✅ **Aucun véhicule à entretenir** dans les 7 prochains jours." };
  const lignes = rows.map(r => `- **${r.marque} ${r.modele}** (${r.plaque}) — ${r.statut}`).join("\n");
  return { text: `## 🚚 Véhicules à entretenir\n\n${lignes}\n\n⚠️ **${rows.length} véhicule(s)** à intervenir.` };
}

export async function toolDepensesTransport(): Promise<ToolResult> {
  const result = await db.execute(sql`
    SELECT
      COALESCE((SELECT SUM(cout) FROM fuel_record WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())), 0) as carburant,
      COALESCE((SELECT SUM(cout) FROM maintenance WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())), 0) as entretien,
      COALESCE((SELECT SUM(cout) FROM toll WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())), 0) as peages,
      COALESCE((SELECT SUM(montant) FROM transport_expense WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())), 0) as autres,
      COALESCE((SELECT SUM(cout_location) FROM vehicle_rental WHERE EXTRACT(YEAR FROM date_debut) = EXTRACT(YEAR FROM NOW())), 0) as locations
  `).catch(() => null);
  if (!result?.rows?.length) return { text: "Aucune dépense transport disponible." };
  const d = result.rows[0] as Row;
  const total = toNum(d.carburant) + toNum(d.entretien) + toNum(d.peages) + toNum(d.autres) + toNum(d.locations);
  return { text: `## 🚚 Dépenses Transport ${new Date().getFullYear()}\n\n| Catégorie | Montant |\n|---|---|\n| ⛽ Carburant | ${fmt(toNum(d.carburant))} FC |\n| 🔧 Entretien | ${fmt(toNum(d.entretien))} FC |\n| 🛂 Péages | ${fmt(toNum(d.peages))} FC |\n| 📦 Autres | ${fmt(toNum(d.autres))} FC |\n| 🔑 Locations | ${fmt(toNum(d.locations))} FC |\n| **TOTAL** | **${fmt(total)} FC** |` };
}

export async function toolTopVentes(): Promise<ToolResult> {
  const result = await db.execute(sql`SELECT nom, prix_vente, stock, (prix_vente - prix_achat) as marge FROM commerce_products ORDER BY (prix_vente - prix_achat) DESC LIMIT 5`).catch(() => null);
  const rows = (result?.rows ?? []) as Row[];
  if (!rows.length) return { text: "Aucun produit commercial enregistré." };
  const lignes = rows.map((r, i) => `${i + 1}. **${r.nom}** — marge: ${fmt(toNum(r.marge))} FC (stock: ${r.stock})`).join("\n");
  return { text: `## 🏆 Top 5 produits (par marge)\n\n${lignes}` };
}

export async function toolResumeGlobal(): Promise<ToolResult> {
  const result = await db.execute(sql`
    SELECT
      (SELECT count(*) FROM employees WHERE statut = 'ACTIF') as employes,
      (SELECT count(*) FROM produit_intrant) as produits,
      (SELECT count(*) FROM vehicles WHERE statut = 'actif') as vehicules,
      (SELECT count(*) FROM projects WHERE statut = 'encours') as projets,
      (SELECT count(*) FROM events) as events,
      (SELECT count(*) FROM alerte_stock WHERE statut = 'ACTIVE') as alertes
  `).catch(() => null);
  if (!result?.rows?.length) return { text: "Aucune donnée disponible." };
  const d = result.rows[0] as Row;
  return { text: `## 📋 Résumé de l'entreprise\n\n- 👥 **${d.employes}** employés actifs\n- 📦 **${d.produits}** produits intrants\n- 🚚 **${d.vehicules}** véhicules\n- 🏗️ **${d.projets}** projets en cours\n- 🍽️ **${d.events}** événements traiteur\n- 🔔 **${d.alertes}** alertes de stock actives\n\n💡 *Consultez le tableau de bord pour plus de détails.*` };
}

// ── Alertes actives ──────────────────────────────────────────
export async function toolAlertes(): Promise<ToolResult> {
  const stockAlerts = await db.execute(sql`
    SELECT count(*) as cnt FROM alerte_stock WHERE statut = 'ACTIVE'
  `).catch(() => null);
  const nbAlertes = toNum((stockAlerts?.rows?.[0] as Row)?.cnt ?? "0");
  const stockText = await toolStockFaible();
  const vehText = await toolVehiculesEntretien();
  const parts: string[] = [`## 🚨 Alertes actives\n\n**${nbAlertes}** alerte(s) de stock active(s).`];
  if (nbAlertes > 0) parts.push(stockText.text);
  if (vehText.text.includes("véhicule")) parts.push(vehText.text);
  const imp = await toolImpayes();
  if (imp.text.includes("impayée")) parts.push(imp.text);
  parts.push(`\n💡 *Consultez le centre d'alertes pour plus de détails.*`);
  return { text: parts.join("\n\n---\n\n") };
}

// ── Fournisseurs en retard de paiement ────────────────────────
export async function toolFournisseursRetard(): Promise<ToolResult> {
  const result = await db.execute(sql`
    SELECT fournisseur, total, date FROM commerce_purchase
    WHERE date IS NOT NULL AND date < CURRENT_DATE - INTERVAL '30 days'
    ORDER BY date ASC LIMIT 10
  `).catch(() => null);
  const rows = (result?.rows ?? []) as Row[];
  if (!rows.length) return { text: "✅ **Aucun fournisseur en retard de paiement.** Toutes les échéances sont à jour." };
  const lignes = rows.map(r => `| ${r.fournisseur ?? "—"} | ${fmt(toNum(r.total))} FC | ${r.date} |`).join("\n");
  const total = rows.reduce((s, r) => s + toNum(r.total), 0);
  return { text: `## ⚠️ Fournisseurs en retard (>30 jours)\n\n| Fournisseur | Montant | Date |\n|---|---|---|\n${lignes}\n\n**Total dû : ${fmt(total)} FC**` };
}

// ── Recommandations intelligentes ─────────────────────────────
export async function toolRecommandations(): Promise<ToolResult> {
  const rent = await toolRentabilite();
  const stock = await toolStockFaible();
  const imp = await toolImpayes();
  const recos: string[] = ["## 💡 Recommandations automatiques\n"];
  if (stock.text.includes("produit")) recos.push("🔔 **Réapprovisionner** les produits en alerte de stock immédiatement.");
  if (imp.text.includes("impayée")) recos.push("💰 **Relancer** les clients avec factures impayées pour améliorer la trésorerie.");
  if (rent.text.includes("Sous-traitance")) recos.push("📈 La **sous-traitance** semble performante — envisager d'augmenter la capacité.");
  if (rent.text.includes("Transport") && !rent.text.includes("0 FC")) recos.push("🚚 Le **transport** génère du revenu — optimiser les trajets pour réduire les coûts carburant.");
  recos.push("\n📊 *Analysez le bilan financier pour des recommandations détaillées par activité.*");
  return { text: recos.join("\n") };
}

// ── Détection d'anomalies ────────────────────────────────────
export async function toolAnomalies(): Promise<ToolResult> {
  const result = await db.execute(sql`
    SELECT
      (SELECT count(*) FROM produit_intrant p JOIN stock_intrant s ON s.produit_id = p.id WHERE s.quantite < 0) as stock_negatif,
      (SELECT count(*) FROM sales WHERE total_ttc < 0) as ventes_negatives,
      (SELECT count(*) FROM employees WHERE salaire_base < 0) as salaires_negatifs,
      (SELECT count(*) FROM vehicles WHERE cout_achat < 0) as couts_negatifs
  `).catch(() => null);
  if (!result?.rows?.length) return { text: "✅ Aucune anomalie détectée dans les données." };
  const d = result.rows[0] as Row;
  const anomalies: string[] = [];
  if (toNum(d.stock_negatif) > 0) anomalies.push(`⚠️ **${d.stock_negatif}** produit(s) avec stock négatif`);
  if (toNum(d.ventes_negatives) > 0) anomalies.push(`⚠️ **${d.ventes_negatives}** vente(s) avec montant négatif`);
  if (toNum(d.salaires_negatifs) > 0) anomalies.push(`⚠️ **${d.salaires_negatifs}** employé(s) avec salaire négatif`);
  if (toNum(d.couts_negatifs) > 0) anomalies.push(`⚠️ **${d.couts_negatifs}** véhicule(s) avec coût négatif`);
  if (!anomalies.length) return { text: "## 🔍 Détection d'anomalies\n\n✅ **Aucune anomalie détectée.** Les données sont cohérentes." };
  return { text: `## 🔍 Anomalies détectées\n\n${anomalies.join("\n")}\n\n⚠️ Vérifiez ces données dans les modules concernés.` };
}

// ── Ventes du mois passé ─────────────────────────────────────
export async function toolVentesMoisPasse(): Promise<ToolResult> {
  const result = await db.execute(sql`
    SELECT
      COALESCE((SELECT SUM(total) FROM vente_agricole WHERE EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM NOW() - INTERVAL '1 month') AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW() - INTERVAL '1 month')), 0) as agri,
      COALESCE((SELECT SUM(total_ttc) FROM sales WHERE EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM NOW() - INTERVAL '1 month') AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW() - INTERVAL '1 month')), 0) as commerce,
      COALESCE((SELECT SUM(revenu) FROM trips WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW() - INTERVAL '1 month') AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW() - INTERVAL '1 month')), 0) as transport
  `).catch(() => null);
  if (!result?.rows?.length) return { text: "Aucune donnée pour le mois dernier." };
  const d = result.rows[0] as Row;
  const agri = toNum(d.agri), com = toNum(d.commerce), tra = toNum(d.transport);
  const total = agri + com + tra;
  return { text: `## 📊 Ventes du mois dernier\n\n| Activité | Montant |\n|---|---|\n| 🌱 Agriculture | ${fmt(agri)} FC |\n| 🛒 Commerce | ${fmt(com)} FC |\n| 🚚 Transport | ${fmt(tra)} FC |\n| **TOTAL** | **${fmt(total)} FC** |` };
}
