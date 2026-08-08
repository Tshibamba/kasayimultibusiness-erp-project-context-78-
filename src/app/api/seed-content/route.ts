import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
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
  if (!(await isEmpty("articles"))) {
    return NextResponse.json({ alreadySeeded: true });
  }

  await db.insert(articles).values([
    {
      titre: "KasayiMultiBusiness lance sa campagne agricole 2026",
      slug: "campagne-agricole-2026",
      categorie: "Agriculture",
      image: "https://images.pexels.com/photos/31537320/pexels-photo-31537320.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      extrait:
        "Semences sélectionnées, intrants de qualité et suivi cultural renforcé : notre entreprise démarre une nouvelle saison agricole ambitieuse au KasaÃ¯ Central.",
      contenu:
        "KasayiMultiBusiness entame sa campagne agricole 2026 avec l'ambition de consolider sa position d'acteur de référence dans la région du KasaÃ¯ Central.\n\nCette saison, nous mettons l'accent sur la qualité des semences et la maîtrise des intrants : engrais, fongicides et herbicides sont sélectionnés avec rigueur pour garantir des rendements optimisés tout en préservant les sols.\n\nNotre équipe suit chaque parcelle selon un calendrier cultural précis, du semis à la récolte. L'objectif : produire mieux, tracer chaque lot et valoriser les récoltes au juste prix pour le bénéfice des communautés locales.\n\nLes inscriptions des partenaires et clients sont ouvertes. Contactez-nous pour découvrir nos offres sur le maïs, le soja, l'arachide et la pomme de terre.",
      auteur: "Direction KasayiMultiBusiness",
      publishedAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      titre: "Une nouvelle flotte pour renforcer notre service de transport",
      slug: "nouvelle-flotte-transport",
      categorie: "Transport",
      image: "https://images.pexels.com/photos/30751528/pexels-photo-30751528.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      extrait:
        "Pour mieux servir nos clients, nous renforçons notre parc de véhicules et ouvrons de nouvelles liaisons, dont Kananga ↔ Kolwezi.",
      contenu:
        "Afin de répondre à une demande croissante, KasayiMultiBusiness investit dans sa flotte de transport.\n\nDes pick-ups pour les livraisons urbaines aux camions pour les longues distances, nos véhicules sont régulièrement entretenus et suivis. Nos chauffeurs, qualifiés et expérimentés, garantissent la ponctualité et la sécurité de vos marchandises.\n\nNous ouvrons également de nouvelles liaisons, notamment entre Kananga et Kolwezi, pour accompagner les entreprises et les commerçants de la région.\n\nBesoin d'un devis de transport ou de location de véhicule ? Notre équipe établit une proposition claire et compétitive.",
      auteur: "Pôle Transport",
      publishedAt: new Date(Date.now() - 6 * 86400000),
    },
    {
      titre: "Service traiteur : sublimez vos événements",
      slug: "service-traiteur-evenements",
      categorie: "Traiteur",
      image: "https://images.pexels.com/photos/35247187/pexels-photo-35247187.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      extrait:
        "Mariages, séminaires, cérémonies : découvrez un service traiteur sur mesure, avec une cuisine savoureuse et une équipe professionnelle.",
      contenu:
        "Votre événement mérite le meilleur. Le service traiteur de KasayiMultiBusiness conçoit des menus personnalisés pour tous vos moments forts : mariages, séminaires d'entreprise, anniversaires et cérémonies officielles.\n\nDu choix des ingrédients à la présentation, chaque détail est soigné. Nous maîtrisons le coût de revient de nos menus afin de vous proposer des devis transparents, sans mauvaise surprise.\n\nNotre équipe se déplace sur le lieu de votre choix et assure un service complet : installation, service à table et nettoyage.\n\nRéservez dès maintenant votre date et bénéficiez d'un accompagnement personnalisé.",
      auteur: "Pôle Traiteur",
      publishedAt: new Date(Date.now() - 11 * 86400000),
    },
    {
      titre: "Commerce général : des produits essentiels à prix juste",
      slug: "commerce-produits-essentiels",
      categorie: "Commerce",
      image: "https://images.pexels.com/photos/8422738/pexels-photo-8422738.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      extrait:
        "Matériaux, alimentation et marchandises diverses : un large assortiment pour les particuliers, commerçants et entreprises.",
      contenu:
        "Au cœur de nos activités, le commerce général répond aux besoins quotidiens des ménages, commerçants et entreprises du KasaÃ¯ Central.\n\nNous proposons un large assortiment : matériaux de construction, produits alimentaires et marchandises diverses. Grâce à une gestion rigoureuse des stocks, nous assurons la disponibilité des produits et un réapprovisionnement régulier.\n\nNotre politique de prix, transparente et compétitive, s'accompagne d'une facturation conforme aux normes en vigueur.\n\nVisitez notre point de vente ou contactez-nous pour connaître nos offres et nos conditions pour les achats en gros.",
      auteur: "Pôle Commerce",
      publishedAt: new Date(Date.now() - 18 * 86400000),
    },
  ]);

  return NextResponse.json({ ok: true, articles: 4 });
}
