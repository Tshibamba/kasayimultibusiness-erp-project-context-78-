import { NextResponse } from "next/server";
import { db } from "@/db";
import { services, faqs } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function isEmpty(tableName: string): Promise<boolean> {
  const r = await db.execute(sql`SELECT 1 FROM ${sql.identifier(tableName)} LIMIT 1`);
  return (r.rows?.length ?? 0) === 0;
}

export async function GET() {
  return POST();
}

export async function POST() {
  const rapport: string[] = [];

  if (await isEmpty("services")) {
    await db.insert(services).values([
      { slug: "agriculture", nom: "Agriculture", emoji: "🌱", ordre: 1, accroche: "Notre activité principale", description: "Production et commercialisation de cultures vivrières et de rente : maïs, soja, arachide, pomme de terre. Gestion rigoureuse des intrants et des récoltes.", image: "https://images.pexels.com/photos/31537320/pexels-photo-31537320.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", points: ["Semences sélectionnées et intrants de qualité", "Suivi cultural et calendrier des traitements", "Récoltes tracées et valorisées au juste prix"] },
      { slug: "commerce", nom: "Commerce général", emoji: "🛒", ordre: 2, accroche: "Distribution & approvisionnement", description: "Achat et revente de produits de première nécessité, matériaux et marchandises diverses pour les particuliers, commerçants et entreprises.", image: "https://images.pexels.com/photos/8422738/pexels-photo-8422738.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", points: ["Stock maîtrisé et réapprovisionnement automatique", "Tarifs compétitifs et facturation conforme", "Large gamme de produits disponibles"] },
      { slug: "sous-traitance", nom: "Sous-traitance", emoji: "🏗️", ordre: 3, accroche: "Travaux & services", description: "Réalisation de travaux et prestations pour le compte de tiers : suivi d'avancement, gestion des contrats et respect des délais.", image: "https://images.pexels.com/photos/8961260/pexels-photo-8961260.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", points: ["Pilotage par phases avec suivi d'avancement", "Gestion contractualisée des sous-traitants", "Réception provisoire et définitive encadrée"] },
      { slug: "traiteur", nom: "Service traiteur", emoji: "🍽️", ordre: 4, accroche: "Événements & réceptions", description: "Organisation de réceptions, mariages, séminaires et événements d'entreprise : menus sur mesure, cuisine de qualité et service complet.", image: "https://images.pexels.com/photos/35247187/pexels-photo-35247187.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", points: ["Menus personnalisés et coût de revient maîtrisé", "Équipe professionnelle pour vos événements", "Devis clairs avant toute facturation"] },
      { slug: "transport", nom: "Transport & Logistique", emoji: "🚚", ordre: 5, accroche: "Mobilité fiable", description: "Transport de marchandises et de personnes, location de véhicules et logistique pour soutenir nos activités et celles de nos clients.", image: "https://images.pexels.com/photos/30751528/pexels-photo-30751528.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", points: ["Flotte entretenue et suivie régulièrement", "Chauffeurs qualifiés et expérimentés", "Suivi des trajets et de la consommation"] },
    ]);
    rapport.push("services");
  }

  if (await isEmpty("faqs")) {
    await db.insert(faqs).values([
      { question: "Quels sont vos domaines d'activité ?", reponse: "KasayiMultiBusiness opère dans cinq métiers complémentaires : l'agriculture, le commerce général, le transport, la sous-traitance et le service traiteur.", categorie: "Général", ordre: 1 },
      { question: "Comment puis-je commander ou demander un devis ?", reponse: "Vous pouvez créer un espace client gratuit depuis la page Connexion, puis soumettre une demande de service. Vous pouvez aussi nous écrire directement via la page Contact.", categorie: "Services", ordre: 2 },
      { question: "Quelles sont vos zones d'intervention ?", reponse: "Nous sommes basés au KasaÃ¯ Central (Kananga) et intervenons dans toute la région, notamment sur les axes Kananga – Kolwezi et Kananga – Likasi pour le transport.", categorie: "Logistique", ordre: 3 },
      { question: "Proposez-vous des tarifs pour les entreprises ?", reponse: "Oui. Nous proposons des conditions adaptées aux commerçants et entreprises, notamment pour les achats en gros et les prestations récurrentes. Contactez-nous pour un devis personnalisé.", categorie: "Tarifs", ordre: 4 },
      { question: "Vos factures sont-elles conformes ?", reponse: "Toutes nos factures sont établies conformément à la réglementation fiscale de la RD Congo (TVA 16 %, NIF, RC) et à la norme comptable SYSCOHADA.", categorie: "Facturation", ordre: 5 },
      { question: "Comment puis-je devenir partenaire ?", reponse: "Nous accueillons avec plaisir de nouveaux partenaires (clients, fournisseurs, institutions). Écrivez-nous via le formulaire de contact en précisant votre projet de partenariat.", categorie: "Partenariat", ordre: 6 },
    ]);
    rapport.push("faqs");
  }

  return NextResponse.json({ ok: true, modules: rapport });
}
