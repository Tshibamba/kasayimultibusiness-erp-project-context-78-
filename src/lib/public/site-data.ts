export type Activite = {
  slug: string;
  nom: string;
  emoji: string;
  accroche: string;
  description: string;
  image: string;
  points: string[];
};

export const ACTIVITES: Activite[] = [
  {
    slug: "agriculture",
    nom: "Agriculture",
    emoji: "🌱",
    accroche: "Notre activité principale",
    description:
      "Production et commercialisation de cultures vivrières et de rente : maïs, soja, arachide, pomme de terre. Gestion rigoureuse des intrants et des récoltes.",
    image: "https://images.pexels.com/photos/31537320/pexels-photo-31537320.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    points: ["Semences sélectionnées et intrants de qualité", "Suivi cultural et calendrier des traitements", "Récoltes tracées et valorisées au juste prix"],
  },
  {
    slug: "commerce",
    nom: "Commerce général",
    emoji: "🛒",
    accroche: "Distribution & approvisionnement",
    description:
      "Achat et revente de produits de première nécessité, matériaux et marchandises diverses pour les particuliers, commerçants et entreprises.",
    image: "https://images.pexels.com/photos/8422738/pexels-photo-8422738.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    points: ["Stock maîtrisé avec réapprovisionnement automatique", "Tarifs compétitifs et facturation conforme", "Large gamme de produits disponibles"],
  },
  {
    slug: "transport",
    nom: "Transport & Logistique",
    emoji: "🚚",
    accroche: "Mobilité fiable",
    description:
      "Transport de marchandises et de personnes, location de véhicules et logistique pour soutenir nos activités et celles de nos clients.",
    image: "https://images.pexels.com/photos/30751528/pexels-photo-30751528.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    points: ["Flotte entretenue et suivie régulièrement", "Chauffeurs qualifiés et expérimentés", "Suivi des trajets et de la consommation"],
  },
  {
    slug: "sous-traitance",
    nom: "Sous-traitance",
    emoji: "🏗️",
    accroche: "Travaux & services",
    description:
      "Réalisation de travaux et prestations pour le compte de tiers : suivi d'avancement, gestion des contrats et respect des délais.",
    image: "https://images.pexels.com/photos/8961260/pexels-photo-8961260.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    points: ["Pilotage par phases avec suivi d'avancement", "Gestion contractualisée des sous-traitants", "Réception provisoire et définitive encadrée"],
  },
  {
    slug: "traiteur",
    nom: "Service traiteur",
    emoji: "🍽️",
    accroche: "Événements & réceptions",
    description:
      "Organisation de réceptions, mariages, séminaires et événements d'entreprise : menus sur mesure, cuisine de qualité et service complet.",
    image: "https://images.pexels.com/photos/35247187/pexels-photo-35247187.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    points: ["Menus personnalisés et coût de revient maîtrisé", "Équipe professionnelle pour vos événements", "Devis clairs avant toute facturation"],
  },
];

export const STATS = [
  { valeur: 5, suffix: "", label: "Activités complémentaires" },
  { valeur: 100, suffix: "%", label: "Conformité SYSCOHADA" },
  { valeur: 12, suffix: "+", label: "Années d'expérience" },
  { valeur: 500, suffix: "+", label: "Clients satisfaits" },
];

export const AVANTAGES = [
  { emoji: "🤝", titre: "Partenaire de confiance", texte: "Une entreprise locale ancrée au KasaÃ¯ Central, au service des communautés et des partenaires." },
  { emoji: "📊", titre: "Gestion rigoureuse", texte: "Une organisation professionnelle : traçabilité, normes comptables SYSCOHADA et reporting fiable." },
  { emoji: "🌍", titre: "Multi-activités", texte: "Cinq métiers complémentaires pour répondre à vos besoins en un seul point de contact." },
  { emoji: "⚡", titre: "Réactivité", texte: "Une équipe disponible et des processus efficaces pour des livraisons et services ponctuels." },
];

export type Slide = {
  image: string;
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  href: string;
};

export const SLIDES: Slide[] = [
  {
    image: "https://images.pexels.com/photos/32716005/pexels-photo-32716005.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600",
    eyebrow: "Campagne agricole 2026",
    title: "Cultivons l'avenir du KasaÃ¯ Central",
    text: "Semences, intrants et suivi cultural : nous produisons mieux, pour nourrir et développer la région.",
    cta: "Découvrir l'agriculture",
    href: "/activites#agriculture",
  },
  {
    image: "https://images.pexels.com/photos/30751528/pexels-photo-30751528.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600",
    eyebrow: "Logistique & transport",
    title: "Livrons ensemble, partout",
    text: "Une flotte entretenue et des chauffeurs expérimentés pour acheminer vos marchandises en toute fiabilité.",
    cta: "Nos services de transport",
    href: "/activites#transport",
  },
  {
    image: "https://images.pexels.com/photos/35247187/pexels-photo-35247187.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600",
    eyebrow: "Vos événements",
    title: "Une réception inoubliable",
    text: "Mariages, séminaires, cérémonies : notre service traiteur sublime chacun de vos événements.",
    cta: "Le service traiteur",
    href: "/activites#traiteur",
  },
  {
    image: "https://images.pexels.com/photos/8422738/pexels-photo-8422738.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600",
    eyebrow: "Distribution & approvisionnement",
    title: "Le commerce au service du quotidien",
    text: "Matériaux, alimentation et marchandises : un large assortiment à prix compétitif pour les particuliers et entreprises.",
    cta: "Le commerce général",
    href: "/activites#commerce",
  },
  {
    image: "https://images.pexels.com/photos/8961260/pexels-photo-8961260.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600",
    eyebrow: "Travaux & chantiers",
    title: "Construire l'avenir du Kasaï",
    text: "Construction, routes, forages et réhabilitation : nous réalisons vos projets avec rigueur et dans les délais.",
    cta: "La sous-traitance",
    href: "/activites#sous-traitance",
  },
];

export const FLASH_INFOS: string[] = [
  "🎉 Offre spéciale : remise sur les semences sélectionnées ce mois-ci",
  "🚛 Nouveau service de transport Kananga ↔ Kolwezi",
  "🌱 Inscriptions ouvertes pour la campagne agricole 2026",
  "🍽️ Réservez votre événement avec notre service traiteur",
  "🤝 Devenez partenaire de KasayiMultiBusiness",
];

export const TEMOIGNAGES: { nom: string; role: string; texte: string }[] = [
  { nom: "Jean Mukendi", role: "Commerçant, Kananga", texte: "Une livraison toujours ponctuelle et des produits de qualité. KasayiMultiBusiness est un partenaire sur lequel on peut compter." },
  { nom: "Famille Kabongo", role: "Client traiteur", texte: "Notre mariage a été magnifique grâce au service traiteur. Cuisine délicieuse, équipe professionnelle et service impeccable." },
  { nom: "Coopérative Maji", role: "Partenaire agricole", texte: "Un accompagnement sérieux pour nos approvisionnements en intrants. Je recommande vivement cette entreprise locale." },
];

export const PARTENAIRES: string[] = [
  "Gécamines", "SOTRKI", "Commune de Kasayi", "Banque Rawbank", "Coopérative Maji", "Hôtel Karavia",
];

export const GALERIE: { url: string; legende: string }[] = [
  { url: "https://images.pexels.com/photos/31537320/pexels-photo-31537320.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800", legende: "Récolte dans nos parcelles" },
  { url: "https://images.pexels.com/photos/34792534/pexels-photo-34792534.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800", legende: "Plantation de café" },
  { url: "https://images.pexels.com/photos/6280478/pexels-photo-6280478.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800", legende: "Produits du marché local" },
  { url: "https://images.pexels.com/photos/9759673/pexels-photo-9759673.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800", legende: "Fruits frais" },
  { url: "https://images.pexels.com/photos/30751528/pexels-photo-30751528.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800", legende: "Livraison de marchandises" },
  { url: "https://images.pexels.com/photos/8961260/pexels-photo-8961260.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800", legende: "Chantier de sous-traitance" },
  { url: "https://images.pexels.com/photos/35247187/pexels-photo-35247187.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800", legende: "Service traiteur" },
  { url: "https://images.pexels.com/photos/8422738/pexels-photo-8422738.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800", legende: "Notre commerce général" },
];
