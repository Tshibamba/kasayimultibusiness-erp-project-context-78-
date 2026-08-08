import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { produitIntrant, fournisseur } from "@/db/schema";
import { sql } from "drizzle-orm";
import { enregistrerMouvement } from "@/lib/agriculture/stock-service";
import type { CategorieIntrant } from "@/db/schema";

export const dynamic = "force-dynamic";

type MouvementSeed = {
  type: "ENTREE" | "SORTIE";
  qte: number;
  prix?: number;
  motif?: string;
  fournisseur?: number;
  jours?: number;
};

type ProduitSeed = {
  nom: string;
  categorie: CategorieIntrant;
  unite: string;
  seuilAlerte: number;
  seuilCritique: number;
  mvt: MouvementSeed[];
};

const FOURNISSEURS = [
  { nom: "AgriDistribution SARL", tel: "+243 970 000 111" },
  { nom: "Semences du KasaÃ¯ Central", tel: "+243 820 222 333" },
  { nom: "Coopérative Agricole Maji", tel: "+243 990 444 555" },
];

const PRODUITS: ProduitSeed[] = [
  {
    nom: "Semence maïs hybride H614",
    categorie: "SEMENCE",
    unite: "sac 10kg",
    seuilAlerte: 25,
    seuilCritique: 12,
    mvt: [
      { type: "ENTREE", qte: 100, prix: 42000, fournisseur: 0, jours: 30, motif: "Achat campagne A" },
      { type: "SORTIE", qte: 40, jours: 22, motif: "Semis parcelle Nord" },
      { type: "SORTIE", qte: 35, jours: 12, motif: "Semis parcelle Sud" },
    ],
  },
  {
    nom: "Engrais DAP 18-46-0",
    categorie: "ENGRAIS",
    unite: "sac 50kg",
    seuilAlerte: 30,
    seuilCritique: 15,
    mvt: [
      { type: "ENTREE", qte: 120, prix: 95000, fournisseur: 1, jours: 28, motif: "Réapprovisionnement" },
      { type: "SORTIE", qte: 60, jours: 18, motif: "Fumure de fond" },
    ],
  },
  {
    nom: "Engrais NPK 15-15-15",
    categorie: "ENGRAIS",
    unite: "sac 50kg",
    seuilAlerte: 20,
    seuilCritique: 10,
    mvt: [
      { type: "ENTREE", qte: 80, prix: 78000, fournisseur: 1, jours: 26, motif: "Réapprovisionnement" },
      { type: "SORTIE", qte: 70, jours: 10, motif: "Apport d'entretien" },
    ],
  },
  {
    nom: "Urée 46%",
    categorie: "ENGRAIS",
    unite: "sac 50kg",
    seuilAlerte: 15,
    seuilCritique: 6,
    mvt: [
      { type: "ENTREE", qte: 50, prix: 68000, fournisseur: 0, jours: 25, motif: "Achat campagne A" },
      { type: "SORTIE", qte: 30, jours: 14, motif: "Fumure d'entretien" },
      { type: "SORTIE", qte: 20, jours: 3, motif: "Dernier apport" },
    ],
  },
  {
    nom: "Herbicide Glyphosate 360",
    categorie: "HERBICIDE",
    unite: "litre",
    seuilAlerte: 10,
    seuilCritique: 4,
    mvt: [
      { type: "ENTREE", qte: 40, prix: 12000, fournisseur: 2, jours: 24, motif: "Désherbage" },
      { type: "SORTIE", qte: 32, jours: 8, motif: "Traitement parcelles" },
    ],
  },
  {
    nom: "Fongicide Mancozèbe 80 WP",
    categorie: "FONGICIDE",
    unite: "kg",
    seuilAlerte: 8,
    seuilCritique: 3,
    mvt: [
      { type: "ENTREE", qte: 20, prix: 18000, fournisseur: 2, jours: 23, motif: "Préventif mildiou" },
      { type: "SORTIE", qte: 12, jours: 6, motif: "Traitement fongique" },
    ],
  },
  {
    nom: "Insecticide Lambda-cyhalothrine",
    categorie: "INSECTICIDE",
    unite: "litre",
    seuilAlerte: 12,
    seuilCritique: 5,
    mvt: [
      { type: "ENTREE", qte: 30, prix: 25000, fournisseur: 0, jours: 20, motif: "Lutte insectes" },
      { type: "SORTIE", qte: 10, jours: 5, motif: "Pulvérisation" },
    ],
  },
  {
    nom: "Semence soja",
    categorie: "SEMENCE",
    unite: "sac 25kg",
    seuilAlerte: 10,
    seuilCritique: 5,
    mvt: [
      { type: "ENTREE", qte: 30, prix: 55000, fournisseur: 1, jours: 18, motif: "Semis soja" },
      { type: "SORTIE", qte: 25, jours: 4, motif: "Semis parcelle Est" },
    ],
  },
  {
    nom: "Pomme de terre de semence",
    categorie: "SEMENCE",
    unite: "sac 50kg",
    seuilAlerte: 20,
    seuilCritique: 8,
    mvt: [
      { type: "ENTREE", qte: 60, prix: 30000, fournisseur: 2, jours: 15, motif: "Plantation" },
    ],
  },
  {
    nom: "Carburant diesel",
    categorie: "CARBURANT",
    unite: "litre",
    seuilAlerte: 150,
    seuilCritique: 60,
    mvt: [
      { type: "ENTREE", qte: 1000, prix: 3200, fournisseur: 0, jours: 12, motif: "Plein réservoir ferme" },
      { type: "SORTIE", qte: 820, jours: 2, motif: "Carburant tracteurs" },
    ],
  },
  {
    nom: "Semence arachide",
    categorie: "SEMENCE",
    unite: "sac",
    seuilAlerte: 12,
    seuilCritique: 5,
    mvt: [
      { type: "ENTREE", qte: 25, prix: 48000, fournisseur: 1, jours: 10, motif: "Semis arachide" },
      { type: "SORTIE", qte: 18, jours: 1, motif: "Plantation parcelle Ouest" },
    ],
  },
];

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export async function GET() {
  return POST();
}

export async function POST(req?: NextRequest) {
  const reset = req ? new URL(req.url).searchParams.get("reset") === "1" : false;

  if (reset) {
    await db.execute(
      sql`TRUNCATE TABLE mouvement_stock, alerte_stock, stock_intrant, produit_intrant, fournisseur RESTART IDENTITY CASCADE`
    );
  } else {
    const [{ count }] = (await db
      .select({ count: sql<number>`count(*)::int` })
      .from(produitIntrant)) as { count: number }[];
    if (count > 0) {
      return NextResponse.json({
        alreadySeeded: true,
        count,
        message: "Des données existent déjà. Ajoutez ?reset=1 pour réinitialiser.",
      });
    }
  }

  // 1. Fournisseurs
  const fourniIds: number[] = [];
  for (const f of FOURNISSEURS) {
    const [row] = await db
      .insert(fournisseur)
      .values({ nom: f.nom, telephone: f.tel })
      .returning();
    fourniIds.push(row.id);
  }

  // 2. Produits + mouvements (CMUP + alertes calculés automatiquement)
  let crees = 0;
  for (const p of PRODUITS) {
    const [produit] = await db
      .insert(produitIntrant)
      .values({
        nom: p.nom,
        categorie: p.categorie,
        unite: p.unite,
        seuilAlerte: String(p.seuilAlerte),
        seuilCritique: String(p.seuilCritique),
      })
      .returning();
    crees++;

    for (const m of p.mvt) {
      await enregistrerMouvement({
        produitId: produit.id,
        type: m.type,
        quantite: m.qte,
        prixAchat: m.type === "ENTREE" ? (m.prix ?? null) : null,
        motif: m.motif ?? null,
        reference: m.type === "ENTREE" ? `BC-${1000 + crees}` : null,
        fournisseurId:
          m.type === "ENTREE" && m.fournisseur != null
            ? fourniIds[m.fournisseur]
            : null,
        date: daysAgo(m.jours ?? 0),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    produitsCrees: crees,
    fournisseurs: fourniIds.length,
  });
}
