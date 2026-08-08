import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { db } from "@/db";
import { companySettings } from "@/db/schema";
import { getRapportGlobal, syntheseModules } from "@/lib/rapports";
import { formatNombre } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET() {
  const r = await getRapportGlobal();
  const [company] = await db.select().from(companySettings).limit(1);
  const c = {
    nom: company?.nom ?? "KasayiMultiBusiness",
    adresse: company?.adresse ?? null,
    telephone: company?.telephone ?? null,
    email: company?.email ?? null,
  };
  const synthese = syntheseModules(r);
  const dateDuJour = new Intl.DateTimeFormat("fr-CD", { dateStyle: "long", timeZone: "Africa/Lubumbashi" }).format(new Date());

  const MARINE = "#1B4F72";
  const LEFT = 40;
  const RIGHT = 555;
  const WIDTH = RIGHT - LEFT;

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks: Buffer[] = [];
  doc.on("data", (d: Buffer) => chunks.push(d));
  const done = new Promise<Buffer>((res) => doc.on("end", () => res(Buffer.concat(chunks))));

  doc.fillColor(MARINE).font("Helvetica-Bold").fontSize(20).text(c.nom, LEFT, 40, { width: 320 });
  doc.font("Helvetica").fontSize(9).fillColor("#555");
  let y = 68;
  for (const l of [c.adresse, c.telephone, c.email].filter((s): s is string => Boolean(s))) {
    doc.text(l, LEFT, y, { width: 320 });
    y += 12;
  }

  doc.font("Helvetica-Bold").fontSize(20).fillColor(MARINE).text("RAPPORT DE SYNTHÈSE", LEFT, 44, { width: WIDTH, align: "right" });
  doc.font("Helvetica").fontSize(10).fillColor("#555").text(dateDuJour, LEFT, 72, { width: WIDTH, align: "right" });
  doc.moveTo(LEFT, 108).lineTo(RIGHT, 108).lineWidth(2).strokeColor(MARINE).stroke();

  let ky = 128;
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#222").text("Indicateurs clés", LEFT, ky);
  ky += 20;
  const kpis: [string, number][] = [
    ["Trésorerie totale", r.tresorerie],
    ["CA encaissé (commerce)", r.caCommerce],
    ["Créances impayées", r.creances],
    ["Masse salariale / mois", r.masseSalariale],
    ["Valeur stock agriculture", r.agriValeur],
    ["Valeur stock commerce", r.commerceValeur],
    ["Revenus transport", r.revenusTransport],
    ["CA potentiel traiteur", r.caTraiteur],
  ];
  doc.font("Helvetica").fontSize(10);
  for (const [label, val] of kpis) {
    doc.fillColor("#444").text(label, LEFT, ky, { width: 300 });
    doc.fillColor(MARINE).text(formatNombre(val, 0) + " FC", LEFT + 300, ky, { width: WIDTH - 300, align: "right" });
    ky += 17;
  }

  let ty = ky + 22;
  doc.rect(LEFT, ty, WIDTH, 20).fill(MARINE);
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#fff");
  doc.text("Activité", LEFT + 6, ty + 5, { width: 170 });
  doc.text("Indicateur", LEFT + 180, ty + 5, { width: 200 });
  doc.text("Montant (FC)", LEFT + 380, ty + 5, { width: WIDTH - 386, align: "right" });
  ty += 20;
  doc.font("Helvetica").fontSize(9).fillColor("#222");
  for (const s of synthese) {
    doc.text((s.emoji ?? "") + " " + s.module, LEFT + 6, ty + 5, { width: 170 });
    doc.text(s.indicateur, LEFT + 180, ty + 5, { width: 200 });
    doc.text(formatNombre(s.montant, 0), LEFT + 380, ty + 5, { width: WIDTH - 386, align: "right" });
    ty += 18;
  }

  doc.moveTo(LEFT, 800).lineTo(RIGHT, 800).strokeColor(MARINE).lineWidth(1).stroke();
  doc.font("Helvetica").fontSize(8).fillColor("#888").text(
    "Document généré par KasayiMultiBusiness ERP — Conformité SYSCOHADA.",
    LEFT,
    808,
    { width: WIDTH, align: "center" }
  );

  doc.end();
  const buf = await done;
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="rapport-kasayimultibusiness.pdf"',
    },
  });
}
