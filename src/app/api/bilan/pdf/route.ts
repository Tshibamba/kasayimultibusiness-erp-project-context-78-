import { NextRequest } from "next/server";
import PDFDocument from "pdfkit";
import { db } from "@/db";
import { companySettings } from "@/db/schema";
import { getBilanGlobal, getEvolutionMensuelle } from "@/lib/bilan";
import { formatNombre } from "@/lib/format";

export const dynamic = "force-dynamic";

const MOIS_NOMS = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const an = Number(url.searchParams.get("annee")) || new Date().getFullYear();
  const mo = url.searchParams.get("mois") ? Number(url.searchParams.get("mois")) : null;
  const periode = mo ? `${MOIS_NOMS[mo]} ${an}` : `Année ${an}`;

  const [bilan, evolution, rows] = await Promise.all([getBilanGlobal(an, mo), getEvolutionMensuelle(an), db.select().from(companySettings).limit(1)]);
  const company = rows[0];
  const MARINE = "#1B4F72", OR = "#F0A500";
  const LEFT = 40, RIGHT = 555, WIDTH = RIGHT - LEFT;
  const TVA = 0.16;

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((res) => doc.on("end", () => res(Buffer.concat(chunks))));

  doc.fillColor(MARINE).font("Helvetica-Bold").fontSize(18).text(company?.nom ?? "KasayiMultiBusiness", LEFT, 40, { width: 320 });
  doc.font("Helvetica-Bold").fontSize(18).fillColor(MARINE).text("TABLEAU DE BORD GÉNÉRAL", LEFT, 44, { width: WIDTH, align: "right" });
  doc.font("Helvetica").fontSize(10).fillColor("#555").text(periode, LEFT, 72, { width: WIDTH, align: "right" });
  doc.moveTo(LEFT, 100).lineTo(RIGHT, 100).lineWidth(2).strokeColor(MARINE).stroke();

  // Analyse consolidée par activité
  let y = 116;
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#222").text("Analyse consolidée par activité", LEFT, y);
  y += 18;
  doc.rect(LEFT, y, WIDTH, 20).fill(MARINE);
  doc.font("Helvetica-Bold").fontSize(8).fillColor("#fff");
  const cols = [LEFT + 6, LEFT + 100, LEFT + 185, LEFT + 270, LEFT + 360, LEFT + 460];
  doc.text("Activité", cols[0], y + 5, { width: 90 });
  doc.text("Recettes", cols[1], y + 5, { width: 80, align: "right" });
  doc.text("Dépenses", cols[2], y + 5, { width: 80, align: "right" });
  doc.text("Impôts/Taxes", cols[3], y + 5, { width: 85, align: "right" });
  doc.text("Bénéfice net", cols[4], y + 5, { width: 90, align: "right" });
  doc.text("Rentab.", cols[5], y + 5, { width: WIDTH - (cols[5] - LEFT), align: "right" });
  y += 20;

  let totRec = 0, totDep = 0, totImp = 0;
  doc.font("Helvetica").fontSize(8);
  for (const s of bilan.services) {
    const impots = Math.round(s.recettes * TVA);
    const benefNet = s.benefice - impots;
    const rent = s.recettes > 0 ? Math.round((benefNet / s.recettes) * 100) : 0;
    totRec += s.recettes; totDep += s.depenses; totImp += impots;
    doc.fillColor("#222").text(s.service, cols[0], y + 4, { width: 90 });
    doc.fillColor("#27AE60").text(formatNombre(s.recettes, 0), cols[1], y + 4, { width: 80, align: "right" });
    doc.fillColor("#E74C3C").text(formatNombre(s.depenses, 0), cols[2], y + 4, { width: 80, align: "right" });
    doc.fillColor("#444").text(formatNombre(impots, 0), cols[3], y + 4, { width: 85, align: "right" });
    doc.fillColor(benefNet >= 0 ? "#27AE60" : "#E74C3C").text(formatNombre(benefNet, 0), cols[4], y + 4, { width: 90, align: "right" });
    doc.fillColor("#444").text(rent + " %", cols[5], y + 4, { width: WIDTH - (cols[5] - LEFT), align: "right" });
    y += 15;
  }
  // TOTAL ENTREPRISE
  y += 2;
  doc.rect(LEFT, y, WIDTH, 18).fill(OR);
  doc.font("Helvetica-Bold").fontSize(8).fillColor("#fff");
  const totBenNet = totRec - totDep - totImp;
  const totRent = totRec > 0 ? Math.round((totBenNet / totRec) * 100) : 0;
  doc.text("TOTAL ENTREPRISE", cols[0], y + 4, { width: 90 });
  doc.text(formatNombre(totRec, 0), cols[1], y + 4, { width: 80, align: "right" });
  doc.text(formatNombre(totDep, 0), cols[2], y + 4, { width: 80, align: "right" });
  doc.text(formatNombre(totImp, 0), cols[3], y + 4, { width: 85, align: "right" });
  doc.text(formatNombre(totBenNet, 0), cols[4], y + 4, { width: 90, align: "right" });
  doc.text(totRent + " %", cols[5], y + 4, { width: WIDTH - (cols[5] - LEFT), align: "right" });
  y += 28;

  // Comparaison mensuelle
  if (!mo) {
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#222").text("Comparaison mensuelle — " + an, LEFT, y);
    y += 18;
    doc.font("Helvetica").fontSize(8).fillColor("#444");
    let totR = 0, totD = 0, totB = 0;
    for (const p of evolution) {
      if (p.recettes === 0 && p.depenses === 0) continue;
      totR += p.recettes; totD += p.depenses; totB += p.benefice;
      doc.text(p.mois, cols[0], y, { width: 80 });
      doc.fillColor("#27AE60").text(formatNombre(p.recettes, 0) + " FC", cols[1], y, { width: 100, align: "right" });
      doc.fillColor("#E74C3C").text(formatNombre(p.depenses, 0) + " FC", cols[2] + 20, y, { width: 100, align: "right" });
      doc.fillColor(p.benefice >= 0 ? "#27AE60" : "#E74C3C").text(formatNombre(p.benefice, 0) + " FC", cols[3] + 30, y, { width: WIDTH - (cols[3] + 30 - LEFT), align: "right" });
      y += 13;
    }
    y += 2;
    doc.font("Helvetica-Bold").fillColor(MARINE);
    doc.text("TOTAL ANNUEL", cols[0], y, { width: 80 });
    doc.text(formatNombre(totR, 0) + " FC", cols[1], y, { width: 100, align: "right" });
    doc.text(formatNombre(totD, 0) + " FC", cols[2] + 20, y, { width: 100, align: "right" });
    doc.text(formatNombre(totB, 0) + " FC", cols[3] + 30, y, { width: WIDTH - (cols[3] + 30 - LEFT), align: "right" });
    y += 24;
  }

  // Comparaison annuelle
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#222").text("Comparaison annuelle", LEFT, y);
  y += 18;
  doc.font("Helvetica").fontSize(8).fillColor("#444");
  for (let i = 0; i < 3; i++) {
    const a = an - i;
    doc.text(String(a), cols[0], y, { width: 60 });
    // Only current year has data in sandbox
    if (a === an) {
      doc.fillColor("#27AE60").text(formatNombre(totRec, 0) + " FC", cols[1], y, { width: 100, align: "right" });
      doc.fillColor("#E74C3C").text(formatNombre(totDep, 0) + " FC", cols[2] + 20, y, { width: 100, align: "right" });
      doc.fillColor(totBenNet >= 0 ? "#27AE60" : "#E74C3C").text(formatNombre(totBenNet, 0) + " FC", cols[3] + 30, y, { width: WIDTH - (cols[3] + 30 - LEFT), align: "right" });
    } else {
      doc.fillColor("#aaa").text("—", cols[1], y, { width: 100, align: "right" });
      doc.text("—", cols[2] + 20, y, { width: 100, align: "right" });
      doc.text("—", cols[3] + 30, y, { width: WIDTH - (cols[3] + 30 - LEFT), align: "right" });
    }
    y += 13;
  }

  doc.moveTo(LEFT, 800).lineTo(RIGHT, 800).strokeColor(MARINE).lineWidth(1).stroke();
  doc.font("Helvetica").fontSize(8).fillColor("#888").text("Tableau de bord généré par KasayiMultiBusiness ERP — Document confidentiel (RG-FIN-01 à RG-FIN-04).", LEFT, 808, { width: WIDTH, align: "center" });

  doc.end();
  const buf = await done;
  return new Response(new Uint8Array(buf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="tableau-de-bord-${an}${mo ? "-" + mo : ""}.pdf"` },
  });
}
