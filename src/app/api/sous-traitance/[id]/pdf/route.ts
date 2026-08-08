import { NextRequest } from "next/server";
import PDFDocument from "pdfkit";
import { db } from "@/db";
import { companySettings } from "@/db/schema";
import { getProjetDetail } from "@/lib/soustraitance/analyse";
import { formatNombre } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getProjetDetail(Number(id));
  if (!d) return new Response("Projet introuvable.", { status: 404 });

  const [company] = await db.select().from(companySettings).limit(1);
  const MARINE = "#1B4F72";
  const OR = "#F0A500";
  const LEFT = 40, RIGHT = 555, WIDTH = RIGHT - LEFT;

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((res) => doc.on("end", () => res(Buffer.concat(chunks))));

  // En-tête entreprise
  doc.fillColor(MARINE).font("Helvetica-Bold").fontSize(18).text(company?.nom ?? "KasayiMultiBusiness", LEFT, 40, { width: 320 });
  doc.font("Helvetica").fontSize(9).fillColor("#555");
  let y = 66;
  for (const l of [company?.nif && `NIF : ${company.nif}`, company?.rc && `RC : ${company.rc}`].filter(Boolean)) { doc.text(l as string, LEFT, y, { width: 320 }); y += 12; }

  doc.font("Helvetica-Bold").fontSize(18).fillColor(MARINE).text("RAPPORT DE PROJET", LEFT, 44, { width: WIDTH, align: "right" });
  doc.font("Helvetica").fontSize(10).fillColor("#555").text(`Projet #${d.projet.id}`, LEFT, 72, { width: WIDTH, align: "right" });
  doc.moveTo(LEFT, 100).lineTo(RIGHT, 100).lineWidth(2).strokeColor(MARINE).stroke();

  // Infos projet
  y = 118;
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#222").text(d.projet.nom, LEFT, y, { width: WIDTH });
  y += 22;
  doc.font("Helvetica").fontSize(10).fillColor("#444");
  const infos = [
    ["Client", d.projet.client ?? "—"],
    ["Type de travaux", d.projet.type ?? "—"],
    ["Localisation", d.projet.localisation ?? "—"],
    ["Statut", d.projet.statut],
    ["Avancement", `${formatNombre(Number(d.projet.avancement), 0)} %`],
    ["Période", `${d.projet.dateDebut ?? "—"} → ${d.projet.dateFin ?? "—"}`],
  ];
  for (const [label, val] of infos) {
    doc.fillColor("#888").text(label, LEFT, y, { width: 140 });
    doc.fillColor("#222").font("Helvetica-Bold").text(val, LEFT + 140, y, { width: WIDTH - 140 });
    doc.font("Helvetica");
    y += 16;
  }

  // Synthèse financière
  y += 12;
  doc.rect(LEFT, y, WIDTH, 20).fill(MARINE);
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#fff").text("Synthèse financière", LEFT + 6, y + 5);
  y += 28;
  doc.font("Helvetica").fontSize(10);
  const lignesFin: [string, string, string][] = [
    ["Budget prévu", formatNombre(d.budget, 0) + " FC", "#444"],
    ["Coût matériaux", formatNombre(d.coutMateriaux, 0) + " FC", "#E74C3C"],
    ["Coût main d'œuvre", formatNombre(d.coutMainOeuvre, 0) + " FC", "#E74C3C"],
    ["Autres dépenses", formatNombre(d.coutDepenses, 0) + " FC", "#E74C3C"],
    ["Total des coûts", formatNombre(d.couts, 0) + " FC", "#E74C3C"],
    ["Encaissé (paiements)", formatNombre(d.encaisse, 0) + " FC", "#27AE60"],
    ["Facturé (TTC)", formatNombre(d.facture, 0) + " FC", "#27AE60"],
  ];
  for (const [label, val, color] of lignesFin) {
    doc.fillColor("#444").text(label, LEFT, y, { width: 280 });
    doc.fillColor(color).font("Helvetica-Bold").text(val, LEFT + 280, y, { width: WIDTH - 280, align: "right" });
    doc.font("Helvetica");
    y += 16;
  }
  y += 4;
  doc.moveTo(LEFT, y).lineTo(RIGHT, y).lineWidth(1).strokeColor(OR).stroke();
  y += 6;
  doc.font("Helvetica-Bold").fontSize(12).fillColor(d.benefice >= 0 ? "#27AE60" : "#E74C3C");
  doc.text("RÉSULTAT DU PROJET", LEFT, y, { width: 280 });
  doc.text(formatNombre(d.benefice, 0) + " FC", LEFT + 280, y, { width: WIDTH - 280, align: "right" });

  // Contrats
  y += 30;
  if (d.contrats.length > 0) {
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#222").text("Contrats associés", LEFT, y);
    y += 18;
    doc.font("Helvetica").fontSize(9).fillColor("#444");
    for (const c of d.contrats) {
      doc.text(`${c.reference ?? "—"} — ${c.objet ?? "—"} : ${formatNombre(Number(c.montant), 0)} FC (${c.statut})`, LEFT, y, { width: WIDTH });
      y += 14;
    }
  }

  // Pied de page
  doc.moveTo(LEFT, 800).lineTo(RIGHT, 800).strokeColor(MARINE).lineWidth(1).stroke();
  doc.font("Helvetica").fontSize(8).fillColor("#888").text("Rapport de projet généré par KasayiMultiBusiness ERP — Document confidentiel.", LEFT, 808, { width: WIDTH, align: "center" });

  doc.end();
  const buf = await done;
  return new Response(new Uint8Array(buf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="rapport-projet-${d.projet.id}.pdf"` },
  });
}
