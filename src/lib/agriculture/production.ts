import { db } from "@/db";
import { culture, parcelle, traitementCulture, recolte, venteAgricole } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { toNum } from "@/lib/format";

export type CultureSynthese = {
  id: number;
  nom: string;
  parcelleNom: string | null;
  statut: string;
  superficie: number;
  coutTotal: number;
  revenu: number;
  marge: number;
  quantiteRecoltee: number;
  rendement: number;
};

export async function getProductionSynthese(): Promise<CultureSynthese[]> {
  const [cultures, parcelles, traitements, recoltes, ventes] = await Promise.all([
    db.select({ id: culture.id, nom: culture.nom, parcelleId: culture.parcelleId, statut: culture.statut, superficie: culture.superficie, mainOeuvre: culture.mainOeuvre })
      .from(culture).orderBy(desc(culture.createdAt)),
    db.select().from(parcelle),
    db.select().from(traitementCulture),
    db.select().from(recolte),
    db.select().from(venteAgricole),
  ]);

  const parcelleNom = new Map(parcelles.map((p) => [p.id, p.nom]));
  const coutMap = new Map<number, number>();
  const revMap = new Map<number, number>();
  const recolteMap = new Map<number, number>();
  for (const c of cultures) coutMap.set(c.id, toNum(c.mainOeuvre));
  for (const t of traitements) coutMap.set(t.cultureId, (coutMap.get(t.cultureId) ?? 0) + toNum(t.cout));
  for (const v of ventes) revMap.set(v.cultureId, (revMap.get(v.cultureId) ?? 0) + toNum(v.total));
  for (const r of recoltes) recolteMap.set(r.cultureId, (recolteMap.get(r.cultureId) ?? 0) + toNum(r.quantite));

  return cultures.map((c) => {
    const cout = coutMap.get(c.id) ?? 0;
    const revenu = revMap.get(c.id) ?? 0;
    return {
      id: c.id,
      nom: c.nom,
      parcelleNom: parcelleNom.get(c.parcelleId) ?? "—",
      statut: c.statut,
      superficie: toNum(c.superficie),
      coutTotal: cout,
      revenu,
      marge: revenu - cout,
      quantiteRecoltee: recolteMap.get(c.id) ?? 0,
      rendement: toNum(c.superficie) > 0 ? Math.round(((recolteMap.get(c.id) ?? 0) / toNum(c.superficie)) * 10) / 10 : 0,
    };
  });
}

export async function getCultureDetail(id: number) {
  const rows = await db
    .select({
      id: culture.id,
      nom: culture.nom,
      variete: culture.variete,
      parcelleId: culture.parcelleId,
      parcelleNom: parcelle.nom,
      dateSemis: culture.dateSemis,
      dateRecoltePrevue: culture.dateRecoltePrevue,
      superficie: culture.superficie,
      mainOeuvre: culture.mainOeuvre,
      statut: culture.statut,
    })
    .from(culture)
    .leftJoin(parcelle, eq(parcelle.id, culture.parcelleId))
    .where(eq(culture.id, id));
  const cult = rows[0];
  if (!cult) return null;

  const [traitements, recoltes, ventes] = await Promise.all([
    db.select().from(traitementCulture).where(eq(traitementCulture.cultureId, id)).orderBy(desc(traitementCulture.date)),
    db.select().from(recolte).where(eq(recolte.cultureId, id)).orderBy(desc(recolte.date)),
    db.select().from(venteAgricole).where(eq(venteAgricole.cultureId, id)).orderBy(desc(venteAgricole.date)),
  ]);

  const coutIntrants = traitements.reduce((s, t) => s + toNum(t.cout), 0);
  const mainOeuvre = toNum(cult.mainOeuvre);
  const coutTotal = coutIntrants + mainOeuvre;
  const revenu = ventes.reduce((s, v) => s + toNum(v.total), 0);

  return {
    culture: cult,
    traitements,
    recoltes,
    ventes,
    coutIntrants,
    mainOeuvre,
    coutTotal,
    revenu,
    marge: revenu - coutTotal,
    quantiteRecoltee: recoltes.reduce((s, r) => s + toNum(r.quantite), 0),
    rendement: toNum(cult.superficie) > 0 ? Math.round((recoltes.reduce((s, r) => s + toNum(r.quantite), 0) / toNum(cult.superficie)) * 10) / 10 : 0,
  };
}
