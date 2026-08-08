import { db } from "@/db";
import {
  produitIntrant,
  stockIntrant,
  mouvementStock,
  alerteStock,
  fournisseur,
} from "@/db/schema";
import { eq, and, desc, asc, ne, sql } from "drizzle-orm";
import { round, toNum } from "@/lib/format";
import type {
  StatutStock,
  NiveauAlerte,
  TypeAlerte,
  TypeMouvement,
} from "@/db/schema";

// ─────────────────────────────────────────────────────────────
// Logique de statut & alertes
// ─────────────────────────────────────────────────────────────

export function determinerStatut(
  quantite: number,
  seuilAlerte: number,
  seuilCritique: number
): StatutStock {
  if (quantite <= 0) return "RUPTURE";
  if (seuilCritique > 0 && quantite <= seuilCritique) return "CRITIQUE";
  if (seuilAlerte > 0 && quantite <= seuilAlerte) return "FAIBLE";
  return "OK";
}

type CibleAlerte =
  | { niveau: NiveauAlerte; type: TypeAlerte; seuil: number; message: string }
  | null;

export function evaluerAlerte(
  quantite: number,
  seuilAlerte: number,
  seuilCritique: number,
  unite: string
): CibleAlerte {
  if (quantite <= 0) {
    return {
      niveau: "CRITIQUE",
      type: "RUPTURE",
      seuil: 0,
      message: `Rupture de stock totale — quantité disponible : 0 ${unite}. Réapprovisionnement urgent nécessaire.`,
    };
  }
  if (seuilCritique > 0 && quantite <= seuilCritique) {
    return {
      niveau: "DANGER",
      type: "STOCK_CRITIQUE",
      seuil: seuilCritique,
      message: `Stock critique : ${quantite} ${unite} ≤ seuil critique de ${seuilCritique} ${unite}. Commander sans délai.`,
    };
  }
  if (seuilAlerte > 0 && quantite <= seuilAlerte) {
    return {
      niveau: "WARNING",
      type: "STOCK_FAIBLE",
      seuil: seuilAlerte,
      message: `Stock faible : ${quantite} ${unite} ≤ seuil d'alerte de ${seuilAlerte} ${unite}. Prévoir un réapprovisionnement.`,
    };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// Entrée : enregistrement d'un mouvement (ENTREE / SORTIE / AJUSTEMENT)
// Calcule le CMUP, met à jour la fiche stock et déclenche les alertes.
// ─────────────────────────────────────────────────────────────

export type MouvementInput = {
  produitId: number;
  type: TypeMouvement;
  quantite: number; // positive pour ENTREE/SORTIE ; signée pour AJUSTEMENT
  prixAchat?: number | null; // CDF par unité (ENTREE)
  motif?: string | null;
  reference?: string | null;
  fournisseurId?: number | null;
  date?: Date | null; // date du mouvement (défaut = maintenant)
  modePaiement?: string | null;
};

async function verifierEtCreerAlertesTx(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  produitId: number,
  quantite: number,
  seuilAlerte: number,
  seuilCritique: number,
  unite: string
) {
  const cible = evaluerAlerte(quantite, seuilAlerte, seuilCritique, unite);

  if (!cible) {
    // Tout va bien : on résout les alertes actives de ce produit.
    await tx
      .update(alerteStock)
      .set({ statut: "RESOLUE", resolvedAt: new Date() })
      .where(
        and(
          eq(alerteStock.produitId, produitId),
          eq(alerteStock.statut, "ACTIVE")
        )
      );
    return null;
  }

  // Une alerte du même type existe-t-elle déjà (active) ?
  const [existante] = await tx
    .select()
    .from(alerteStock)
    .where(
      and(
        eq(alerteStock.produitId, produitId),
        eq(alerteStock.statut, "ACTIVE"),
        eq(alerteStock.type, cible.type)
      )
    );

  if (existante) {
    await tx
      .update(alerteStock)
      .set({
        niveau: cible.niveau,
        message: cible.message,
        quantite: round(quantite, 2).toString(),
        seuil: round(cible.seuil, 2).toString(),
        createdAt: new Date(),
      })
      .where(eq(alerteStock.id, existante.id));
    return existante.id;
  }

  // On résout les autres alertes actives (type différent) puis on crée.
  await tx
    .update(alerteStock)
    .set({ statut: "RESOLUE", resolvedAt: new Date() })
    .where(
      and(
        eq(alerteStock.produitId, produitId),
        eq(alerteStock.statut, "ACTIVE"),
        ne(alerteStock.type, cible.type)
      )
    );

  const [alerte] = await tx
    .insert(alerteStock)
    .values({
      produitId,
      niveau: cible.niveau,
      type: cible.type,
      message: cible.message,
      statut: "ACTIVE",
      quantite: round(quantite, 2).toString(),
      seuil: round(cible.seuil, 2).toString(),
    })
    .returning();

  return alerte.id;
}

export async function enregistrerMouvement(input: MouvementInput) {
  return await db.transaction(async (tx) => {
    const [produit] = await tx
      .select()
      .from(produitIntrant)
      .where(eq(produitIntrant.id, input.produitId));
    if (!produit) throw new Error("Produit introuvable");

    let [stock] = await tx
      .select()
      .from(stockIntrant)
      .where(eq(stockIntrant.produitId, input.produitId));
    if (!stock) {
      [stock] = await tx
        .insert(stockIntrant)
        .values({
          produitId: input.produitId,
          quantite: "0",
          cmup: "0",
          valeurStock: "0",
          statut: "OK",
        })
        .returning();
    }

    const now = input.date ?? new Date();
    const quantiteAvant = toNum(stock.quantite);
    const cmupAvant = toNum(stock.cmup);
    const seuilAlerte = toNum(produit.seuilAlerte);
    const seuilCritique = toNum(produit.seuilCritique);

    let nouvelleQuantite = quantiteAvant;
    let nouveauCmup = cmupAvant;
    let valeurMouvement = 0;

    if (input.type === "ENTREE") {
      const qte = Math.abs(input.quantite);
      const prix =
        input.prixAchat && input.prixAchat > 0 ? input.prixAchat : cmupAvant;
      const valeurAvant = quantiteAvant * cmupAvant;
      const valeurEntree = qte * prix;
      nouvelleQuantite = quantiteAvant + qte;
      // CMUP = (valeur stock avant + valeur entrée) / (qté avant + qté entrée)
      nouveauCmup =
        nouvelleQuantite > 0 ? (valeurAvant + valeurEntree) / nouvelleQuantite : prix;
      valeurMouvement = valeurEntree;
    } else if (input.type === "SORTIE") {
      const qte = Math.abs(input.quantite);
      nouvelleQuantite = Math.max(0, quantiteAvant - qte);
      nouveauCmup = cmupAvant; // le CMUP ne change pas en sortie
      valeurMouvement = qte * cmupAvant;
    } else {
      // AJUSTEMENT : quantité signée = écart d'inventaire (delta)
      nouvelleQuantite = Math.max(0, quantiteAvant + input.quantite);
      nouveauCmup = cmupAvant;
      valeurMouvement = (nouvelleQuantite - quantiteAvant) * cmupAvant;
    }

    const nouvelleValeur = nouvelleQuantite * nouveauCmup;
    const statut = determinerStatut(nouvelleQuantite, seuilAlerte, seuilCritique);

    await tx
      .update(stockIntrant)
      .set({
        quantite: round(nouvelleQuantite, 2).toString(),
        cmup: round(nouveauCmup, 4).toString(),
        valeurStock: round(nouvelleValeur, 2).toString(),
        statut,
        updatedAt: now,
      })
      .where(eq(stockIntrant.id, stock.id));

    const [mouvement] = await tx
      .insert(mouvementStock)
      .values({
        produitId: input.produitId,
        type: input.type,
        quantite: round(Math.abs(input.quantite), 2).toString(),
        prixAchat:
          input.type === "ENTREE"
            ? round(
                input.prixAchat && input.prixAchat > 0 ? input.prixAchat : cmupAvant,
                4
              ).toString()
            : null,
        motif: input.motif ?? null,
        reference: input.reference ?? null,
        fournisseurId: input.fournisseurId ?? null,
        modePaiement: input.modePaiement ?? null,
        quantiteAvant: round(quantiteAvant, 2).toString(),
        quantiteApres: round(nouvelleQuantite, 2).toString(),
        cmupAvant: round(cmupAvant, 4).toString(),
        cmupApres: round(nouveauCmup, 4).toString(),
        valeur: round(valeurMouvement, 2).toString(),
        createdAt: now,
      })
      .returning();

    const alerteId = await verifierEtCreerAlertesTx(
      tx,
      input.produitId,
      nouvelleQuantite,
      seuilAlerte,
      seuilCritique,
      produit.unite
    );

    return {
      mouvement,
      stockApres: {
        quantite: nouvelleQuantite,
        cmup: nouveauCmup,
        valeurStock: nouvelleValeur,
        statut,
      },
      alerteId,
    };
  });
}

// ─────────────────────────────────────────────────────────────
// Vérification unitaire (scan / cron)
// ─────────────────────────────────────────────────────────────

export async function verifierEtCreerAlertes(produitId: number) {
  return await db.transaction(async (tx) => {
    const [produit] = await tx
      .select()
      .from(produitIntrant)
      .where(eq(produitIntrant.id, produitId));
    if (!produit) return null;

    let [stock] = await tx
      .select()
      .from(stockIntrant)
      .where(eq(stockIntrant.produitId, produitId));
    if (!stock) {
      [stock] = await tx
        .insert(stockIntrant)
        .values({
          produitId,
          quantite: "0",
          cmup: "0",
          valeurStock: "0",
          statut: "RUPTURE",
        })
        .returning();
    }

    const quantite = toNum(stock.quantite);
    const statut = determinerStatut(
      quantite,
      toNum(produit.seuilAlerte),
      toNum(produit.seuilCritique)
    );
    await tx
      .update(stockIntrant)
      .set({ statut, updatedAt: new Date() })
      .where(eq(stockIntrant.id, stock.id));

    const alerteId = await verifierEtCreerAlertesTx(
      tx,
      produitId,
      quantite,
      toNum(produit.seuilAlerte),
      toNum(produit.seuilCritique),
      produit.unite
    );
    return { produitId, statut, alerteId };
  });
}

export async function scannerTousLesStocks() {
  const produits = await db.select({ id: produitIntrant.id }).from(produitIntrant);
  const resultats = [];
  for (const p of produits) {
    resultats.push(await verifierEtCreerAlertes(p.id));
  }
  return resultats;
}

// ─────────────────────────────────────────────────────────────
// Lecture : liste des fiches stock avec statistiques
// ─────────────────────────────────────────────────────────────

export type FicheStockListe = {
  produitId: number;
  nom: string;
  categorie: string;
  unite: string;
  quantite: number;
  cmup: number;
  valeurStock: number;
  statut: StatutStock;
  seuilAlerte: number;
  seuilCritique: number;
  stockId: number | null;
};

export async function getStocksListe(): Promise<{
  items: FicheStockListe[];
  stats: {
    totalProduits: number;
    valeurTotale: number;
    enAlerte: number;
    critiques: number;
    ruptures: number;
    ok: number;
  };
}> {
  const rows = await db
    .select({
      produitId: produitIntrant.id,
      nom: produitIntrant.nom,
      categorie: produitIntrant.categorie,
      unite: produitIntrant.unite,
      seuilAlerte: produitIntrant.seuilAlerte,
      seuilCritique: produitIntrant.seuilCritique,
      quantite: stockIntrant.quantite,
      cmup: stockIntrant.cmup,
      valeurStock: stockIntrant.valeurStock,
      statut: stockIntrant.statut,
      stockId: stockIntrant.id,
    })
    .from(produitIntrant)
    .leftJoin(stockIntrant, eq(stockIntrant.produitId, produitIntrant.id))
    .orderBy(asc(produitIntrant.nom));

  const items: FicheStockListe[] = rows.map((r) => {
    const quantite = toNum(r.quantite);
    const statut =
      r.statut ??
      determinerStatut(quantite, toNum(r.seuilAlerte), toNum(r.seuilCritique));
    return {
      produitId: r.produitId,
      nom: r.nom,
      categorie: r.categorie,
      unite: r.unite,
      quantite,
      cmup: toNum(r.cmup),
      valeurStock: toNum(r.valeurStock),
      statut,
      seuilAlerte: toNum(r.seuilAlerte),
      seuilCritique: toNum(r.seuilCritique),
      stockId: r.stockId,
    };
  });

  const stats = {
    totalProduits: items.length,
    valeurTotale: items.reduce((s, i) => s + i.valeurStock, 0),
    enAlerte: items.filter((i) => i.statut === "FAIBLE").length,
    critiques: items.filter((i) => i.statut === "CRITIQUE").length,
    ruptures: items.filter((i) => i.statut === "RUPTURE").length,
    ok: items.filter((i) => i.statut === "OK").length,
  };

  return { items, stats };
}

// ─────────────────────────────────────────────────────────────
// Lecture : fiche analytique complète d'un produit
// ─────────────────────────────────────────────────────────────

export type PointEvolution = {
  date: string;
  quantite: number;
  valeur: number;
  label: string;
};

export async function getStockFiche(produitId: number) {
  const [produit] = await db
    .select()
    .from(produitIntrant)
    .where(eq(produitIntrant.id, produitId));
  if (!produit) return null;

  const [stock] = await db
    .select()
    .from(stockIntrant)
    .where(eq(stockIntrant.produitId, produitId));

  const mouvements = await db
    .select({
      id: mouvementStock.id,
      type: mouvementStock.type,
      quantite: mouvementStock.quantite,
      prixAchat: mouvementStock.prixAchat,
      motif: mouvementStock.motif,
      reference: mouvementStock.reference,
      fournisseurId: mouvementStock.fournisseurId,
      fournisseurNom: fournisseur.nom,
      quantiteAvant: mouvementStock.quantiteAvant,
      quantiteApres: mouvementStock.quantiteApres,
      cmupAvant: mouvementStock.cmupAvant,
      cmupApres: mouvementStock.cmupApres,
      valeur: mouvementStock.valeur,
      createdAt: mouvementStock.createdAt,
    })
    .from(mouvementStock)
    .leftJoin(fournisseur, eq(fournisseur.id, mouvementStock.fournisseurId))
    .where(eq(mouvementStock.produitId, produitId))
    .orderBy(desc(mouvementStock.createdAt))
    .limit(100);

  const alertes = await db
    .select()
    .from(alerteStock)
    .where(eq(alerteStock.produitId, produitId))
    .orderBy(desc(alerteStock.createdAt))
    .limit(50);

  // Évolution : on reconstitue la courbe à partir des mouvements (asc)
  const asc = [...mouvements].reverse();
  let cumulQte = 0;
  const evolution: PointEvolution[] = asc.map((m) => {
    cumulQte = toNum(m.quantiteApres);
    return {
      date: m.createdAt.toISOString(),
      quantite: round(cumulQte, 2),
      valeur: round(toNum(m.cmupApres) * cumulQte, 2),
      label: m.createdAt.toLocaleDateString("fr-CD", {
        day: "2-digit",
        month: "short",
        timeZone: "Africa/Lubumbashi",
      }),
    };
  });

  const quantite = toNum(stock?.quantite);
  const cmup = toNum(stock?.cmup);
  const statut =
    stock?.statut ??
    determinerStatut(quantite, toNum(produit.seuilAlerte), toNum(produit.seuilCritique));

  return {
    produit,
    stock: stock
      ? {
          ...stock,
          quantite,
          cmup,
          valeurStock: toNum(stock.valeurStock),
          statut,
        }
      : null,
    mouvements,
    alertes,
    evolution,
    seuilAlerte: toNum(produit.seuilAlerte),
    seuilCritique: toNum(produit.seuilCritique),
  };
}

// ─────────────────────────────────────────────────────────────
// Mise à jour des seuils d'un produit
// ─────────────────────────────────────────────────────────────

export async function mettreAJourSeuils(
  produitId: number,
  seuilAlerte: number,
  seuilCritique: number
) {
  await db
    .update(produitIntrant)
    .set({
      seuilAlerte: round(seuilAlerte, 2).toString(),
      seuilCritique: round(seuilCritique, 2).toString(),
      updatedAt: new Date(),
    })
    .where(eq(produitIntrant.id, produitId));

  // Recalcule le statut et les alertes
  return verifierEtCreerAlertes(produitId);
}

// ─────────────────────────────────────────────────────────────
// Gestion des alertes
// ─────────────────────────────────────────────────────────────

export async function acquitterAlerte(id: number, note?: string) {
  const [maj] = await db
    .update(alerteStock)
    .set({ statut: "ACQUITTEE", resolvedAt: new Date(), note: note ?? null })
    .where(eq(alerteStock.id, id))
    .returning();
  return maj;
}

export async function getAlertes(activesSeulement = false) {
  return db
    .select({
      id: alerteStock.id,
      produitId: alerteStock.produitId,
      nom: produitIntrant.nom,
      categorie: produitIntrant.categorie,
      unite: produitIntrant.unite,
      niveau: alerteStock.niveau,
      type: alerteStock.type,
      message: alerteStock.message,
      statut: alerteStock.statut,
      quantite: alerteStock.quantite,
      seuil: alerteStock.seuil,
      note: alerteStock.note,
      createdAt: alerteStock.createdAt,
      resolvedAt: alerteStock.resolvedAt,
    })
    .from(alerteStock)
    .innerJoin(produitIntrant, eq(produitIntrant.id, alerteStock.produitId))
    .where(
      activesSeulement ? eq(alerteStock.statut, "ACTIVE") : sql`TRUE`
    )
    .orderBy(desc(alerteStock.createdAt));
}
