import PDFDocument from "pdfkit";
import { montantEnLettres, calculerIPR, CNSS_PATRONALE, CNSS_SALARIALE } from "@/lib/fiscal";
import { formatNombre } from "@/lib/format";

type CompanyInfo = {
  nom: string;
  adresse?: string | null;
  ville?: string | null;
  telephone?: string | null;
  email?: string | null;
  nif?: string | null;
  rc?: string | null;
  rccm?: string | null;
};

const MARINE = "#1B4F72";
const CIEL = "#2E86AB";
const OR = "#F0A500";
const GRIS = "#555";
const LEFT = 40;
const RIGHT = 555;
const WIDTH = RIGHT - LEFT;

function newDoc() {
  return new PDFDocument({ size: "A4", margin: 40, info: { Producer: "KasayiMultiBusiness ERP" } });
}

function endDoc(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.end();
  });
}

function drawHeader(doc: PDFKit.PDFDocument, c: CompanyInfo) {
  doc.fillColor(MARINE).font("Helvetica-Bold").fontSize(20).text(c.nom, LEFT, 40, { width: 300 });
  let y = 68;
  doc.font("Helvetica").fontSize(9).fillColor(GRIS);
  const lignes = [
    [c.adresse, c.ville].filter(Boolean).join(", "),
    c.telephone,
    c.email,
    [c.nif && `NIF : ${c.nif}`, c.rc && `RC : ${c.rc}`, c.rccm && `RCCM : ${c.rccm}`].filter(Boolean).join("   ·   "),
  ].filter((s): s is string => Boolean(s));
  for (const l of lignes) {
    doc.text(l, LEFT, y, { width: 300 });
    y += 13;
  }
}

function drawFooter(doc: PDFKit.PDFDocument) {
  const y = 800;
  doc.moveTo(LEFT, y).lineTo(RIGHT, y).strokeColor(MARINE).lineWidth(1).stroke();
  doc.font("Helvetica").fontSize(8).fillColor(GRIS).text(
    "Document généré automatiquement par KasayiMultiBusiness ERP — Conformité comptable SYSCOHADA.",
    LEFT,
    y + 8,
    { width: WIDTH, align: "center" }
  );
}

function lignePleine(doc: PDFKit.PDFDocument, y: number, color = MARINE, w = 2) {
  doc.moveTo(LEFT, y).lineTo(RIGHT, y).lineWidth(w).strokeColor(color).stroke();
}

// ── FACTURE ──────────────────────────────────────────────────
export async function buildInvoicePdf(opts: {
  company: CompanyInfo;
  reference: string;
  client: string;
  date: string;
  lignes: { designation: string; quantite: number; pu: number }[];
  totalHT: number;
  taxe: number;
  totalTTC: number;
}): Promise<Buffer> {
  const doc = newDoc();
  drawHeader(doc, opts.company);

  // Bloc FACTURE
  doc.font("Helvetica-Bold").fontSize(26).fillColor(MARINE).text("FACTURE", 360, 40, { width: 195, align: "right" });
  doc.font("Helvetica").fontSize(10).fillColor(GRIS);
  doc.text(`N° : ${opts.reference}`, 360, 76, { width: 195, align: "right" });
  doc.text(`Date : ${opts.date}`, 360, 90, { width: 195, align: "right" });

  lignePleine(doc, 150);

  // Client
  doc.font("Helvetica-Bold").fontSize(9).fillColor(MARINE).text("FACTURÉ À", LEFT, 170);
  doc.font("Helvetica-Bold").fontSize(13).fillColor("#222").text(opts.client || "Client", LEFT, 186);

  // Tableau
  const top = 230;
  doc.rect(LEFT, top, WIDTH, 22).fill(MARINE);
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#fff");
  doc.text("N°", LEFT + 6, top + 6);
  doc.text("Désignation", LEFT + 40, top + 6, { width: 200 });
  doc.text("Qté", LEFT + 280, top + 6, { width: 50, align: "right" });
  doc.text("P.U. (FC)", LEFT + 335, top + 6, { width: 80, align: "right" });
  doc.text("Montant (FC)", LEFT + 415, top + 6, { width: WIDTH - 421, align: "right" });

  let y = top + 22;
  doc.fillColor("#222").font("Helvetica").fontSize(9);
  opts.lignes.forEach((l, idx) => {
    if (idx % 2 === 1) doc.rect(LEFT, y, WIDTH, 20).fill("#f1f5f9");
    doc.fillColor(idx % 2 === 1 ? "#222" : "#222").font("Helvetica").fontSize(9);
    doc.text(String(idx + 1), LEFT + 6, y + 5);
    doc.text(l.designation, LEFT + 40, y + 5, { width: 230 });
    doc.text(formatNombre(l.quantite), LEFT + 280, y + 5, { width: 50, align: "right" });
    doc.text(formatNombre(l.pu, 0), LEFT + 335, y + 5, { width: 80, align: "right" });
    doc.text(formatNombre(l.quantite * l.pu, 0), LEFT + 415, y + 5, { width: WIDTH - 421, align: "right" });
    y += 20;
  });
  doc.moveTo(LEFT, y).lineTo(RIGHT, y).lineWidth(0.5).strokeColor("#cbd5e1").stroke();

  // Totaux (encadré à droite)
  const tx = 340;
  let ty = y + 18;
  const totRow = (label: string, value: string, bold = false, color = "#222") => {
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(10).fillColor(color);
    doc.text(label, tx, ty, { width: 120 });
    doc.text(value, tx + 120, ty, { width: RIGHT - (tx + 120), align: "right" });
    ty += 18;
  };
  totRow("Sous-total HT", `${formatNombre(opts.totalHT, 0)} FC`);
  totRow(`TVA (16%)`, `${formatNombre(opts.taxe, 0)} FC`);
  lignePleine(doc, ty - 4, OR, 1);
  totRow("TOTAL TTC", `${formatNombre(opts.totalTTC, 0)} FC`, true, MARINE);

  // Montant en lettres
  doc.font("Helvetica").fontSize(9).fillColor(GRIS).text(
    `Arrêtée la présente facture à la somme de : ${montantEnLettres(opts.totalTTC, "CDF", { majuscule: true })}.`,
    LEFT,
    ty + 16,
    { width: WIDTH }
  );

  // Conditions / signature
  doc.fontSize(8).fillColor("#94a3b8");
  doc.text("Conditions : paiement à 30 jours. Tout retard entraîne une pénalité de 2 % par mois.", LEFT, ty + 44, { width: 280 });
  doc.text("Signature et cachet", LEFT + 320, ty + 44, { width: 195, align: "center" });
  doc.moveTo(LEFT + 320, ty + 80).lineTo(RIGHT, ty + 80).strokeColor("#cbd5e1").stroke();

  drawFooter(doc);
  return endDoc(doc);
}

// ── BULLETIN DE PAIE ─────────────────────────────────────────
export async function buildPayslipPdf(opts: {
  company: CompanyInfo;
  employe: { nom: string; poste?: string | null; departement?: string | null; typeContrat: string; matricule: number };
  periode: string;
  salaireBase: number;
}): Promise<Buffer> {
  const { salaireBase } = opts;
  const cnssSalariale = Math.round(salaireBase * CNSS_SALARIALE);
  const cnssPatronale = Math.round(salaireBase * CNSS_PATRONALE);
  const ipr = calculerIPR(salaireBase);
  const totalRetenues = cnssSalariale + ipr;
  const salaireNet = salaireBase - totalRetenues;

  const doc = newDoc();
  drawHeader(doc, opts.company);

  doc.font("Helvetica-Bold").fontSize(20).fillColor(MARINE).text("BULLETIN DE PAIE", 330, 44, { width: 225, align: "right" });
  doc.font("Helvetica").fontSize(10).fillColor(GRIS).text(`Période : ${opts.periode}`, 330, 76, { width: 225, align: "right" });
  doc.text(`Matricule : ${opts.employe.matricule}`, 330, 90, { width: 225, align: "right" });

  lignePleine(doc, 150);

  // Employé
  doc.font("Helvetica-Bold").fontSize(9).fillColor(MARINE).text("EMPLOYÉ", LEFT, 166);
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#222").text(opts.employe.nom, LEFT, 182);
  doc.font("Helvetica").fontSize(10).fillColor(GRIS);
  let ey = 204;
  const eInfos = [
    opts.employe.poste && `Poste : ${opts.employe.poste}`,
    opts.employe.departement && `Département : ${opts.employe.departement}`,
    `Contrat : ${opts.employe.typeContrat}`,
  ].filter((s): s is string => Boolean(s));
  for (const t of eInfos) {
    doc.text(t, LEFT, ey);
    ey += 14;
  }

  // Tableau gains / retenues
  const top = 260;
  doc.rect(LEFT, top, WIDTH, 22).fill(CIEL);
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#fff");
  doc.text("Rubrique", LEFT + 6, top + 6, { width: 280 });
  doc.text("Base", LEFT + 300, top + 6, { width: 90, align: "right" });
  doc.text("Montant (FC)", LEFT + 395, top + 6, { width: WIDTH - 401, align: "right" });

  let y = top + 22;
  const row = (label: string, base: string, montant: number, color = "#222", bold = false) => {
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(9).fillColor(color);
    doc.text(label, LEFT + 6, y + 5, { width: 280 });
    doc.text(base, LEFT + 300, y + 5, { width: 90, align: "right" });
    doc.text(formatNombre(montant, 0), LEFT + 395, y + 5, { width: WIDTH - 401, align: "right" });
    y += 20;
  };
  row("Salaire de base", formatNombre(salaireBase, 0), salaireBase, "#222", true);
  row("CNSS — part salariale (3,5%)", `-${Math.round(CNSS_SALARIALE * 100)}%`, -cnssSalariale, "#c0392b");
  row("IPR (Impôt Prof. sur Rémunérations)", "barème", -ipr, "#c0392b");
  doc.moveTo(LEFT, y).lineTo(RIGHT, y).lineWidth(0.5).strokeColor("#cbd5e1").stroke();
  row("Total des retenues", "", -totalRetenues, "#c0392b", true);

  // Net à payer (encadré)
  const ny = y + 16;
  doc.rect(LEFT, ny, WIDTH, 34).fill(MARINE);
  doc.font("Helvetica-Bold").fontSize(13).fillColor("#fff").text("NET À PAYER", LEFT + 10, ny + 11);
  doc.text(`${formatNombre(salaireNet, 0)} FC`, LEFT + 250, ny + 11, { width: WIDTH - 260, align: "right" });

  // Détail charges patronales + en lettres
  doc.font("Helvetica").fontSize(9).fillColor(GRIS);
  doc.text(`Charges patronales CNSS (5%) : ${formatNombre(cnssPatronale, 0)} FC`, LEFT, ny + 46, { width: WIDTH });
  doc.text(`Coût employeur total : ${formatNombre(salaireBase + cnssPatronale, 0)} FC`, LEFT, ny + 60, { width: WIDTH });
  doc.text(`Soit : ${montantEnLettres(salaireNet, "CDF", { majuscule: true })}.`, LEFT, ny + 78, { width: WIDTH });

  // Signature
  doc.fontSize(8).fillColor("#94a3b8").text("Signature de l'employé", LEFT + 360, ny + 78, { width: 195, align: "center" });
  doc.moveTo(LEFT + 360, ny + 114).lineTo(RIGHT, ny + 114).strokeColor("#cbd5e1").stroke();

  drawFooter(doc);
  return endDoc(doc);
}
