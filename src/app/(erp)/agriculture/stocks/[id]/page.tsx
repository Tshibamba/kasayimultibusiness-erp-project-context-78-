import { notFound } from "next/navigation";
import { FicheDetail } from "@/components/agriculture/fiche-detail";
import { getStockFiche } from "@/lib/agriculture/stock-service";
import { toNum } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fiche = await getStockFiche(Number(id));
  if (!fiche) notFound();

  const mouvements = fiche.mouvements.map((m) => ({
    id: m.id,
    type: m.type,
    quantite: toNum(m.quantite),
    prixAchat: m.prixAchat != null ? toNum(m.prixAchat) : null,
    motif: m.motif,
    reference: m.reference,
    fournisseurNom: m.fournisseurNom,
    quantiteAvant: toNum(m.quantiteAvant),
    quantiteApres: toNum(m.quantiteApres),
    cmupAvant: toNum(m.cmupAvant),
    cmupApres: toNum(m.cmupApres),
    valeur: toNum(m.valeur),
    createdAt: m.createdAt.toISOString(),
  }));

  const alertes = fiche.alertes.map((a) => ({
    id: a.id,
    niveau: a.niveau,
    type: a.type,
    message: a.message,
    statut: a.statut,
    quantite: toNum(a.quantite),
    seuil: a.seuil != null ? toNum(a.seuil) : null,
    createdAt: a.createdAt.toISOString(),
    resolvedAt: a.resolvedAt ? a.resolvedAt.toISOString() : null,
  }));

  return (
    <FicheDetail
      produit={{
        id: fiche.produit.id,
        nom: fiche.produit.nom,
        categorie: fiche.produit.categorie,
        unite: fiche.produit.unite,
        description: fiche.produit.description,
      }}
      stock={
        fiche.stock
          ? {
              quantite: fiche.stock.quantite,
              cmup: fiche.stock.cmup,
              valeurStock: fiche.stock.valeurStock,
              statut: fiche.stock.statut,
            }
          : null
      }
      seuilAlerte={fiche.seuilAlerte}
      seuilCritique={fiche.seuilCritique}
      mouvements={mouvements}
      alertes={alertes}
      evolution={fiche.evolution}
    />
  );
}
