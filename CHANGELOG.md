# KasayiMultiBusiness ERP — Changelog

Toutes les modifications notables du projet.

## [1.0.0] — 2026-08-03

### Ajouté
- 🌐 Site public : accueil (carrousel 5 services), activités, réalisations, équipe, flotte, actualités, aide, contact
- 👤 Espace client : inscription, connexion, demande de services, newsletter
- 🔐 ERP back-office : auth agents (bcrypt + session HMAC), blocage après 5 tentatives, rôles & permissions
- 🌱 Module Agriculture : stocks CMUP + alertes, parcelles, cultures, traitements (lien stock), récoltes (pertes), ventes (TVA + facture PDF), analyse rentabilité + rendement
- 🚚 Module Transport : véhicules, chauffeurs, missions (km + dates A/R), carburant (conso L/100km + coût/km), entretiens, péages, locations, documents + alertes, bénéfices par véhicule
- 🏗️ Module Sous-traitance : projets, contrats, équipes, matériaux, dépenses, factures TVA, paiements, suivi avancement temporel, bénéfice prévu + réel, alerte dépassement budget, rapport PDF
- 🍽️ Module Traiteur : événements, menus, commandes, stock alimentaire CMUP + alertes, personnel, dépenses, factures TVA, bénéfices
- 🛒 Module Commerce : articles + marges, ventes TVA + facture PDF, gestion paiement interactive, achats
- 👥 Module RH : employés (matricule, grade, CIN, photo), documents, congés + validation, présences, historique carrière (promotions, sanctions, formations), bulletins de paie PDF
- 💰 Module Comptabilité : multi-caisses/banques, mouvements, soldes temps réel
- 📊 Tableau de bord général : analyse consolidée par activité (Recettes/Dépenses/Impôts/Bénéfice net/Rentabilité + TOTAL ENTREPRISE), comparaison mensuelle + annuelle, exports PDF + Excel
- 🏦 Finances transversales : dépenses centralisées (catégorie + responsable + mode paiement + justificatif), recettes centralisées
- 🏛️ Impôts & taxes : enregistrement, suivi échéances, base fiscale par activité
- 📄 Génération PDF : factures, bulletins de paie, rapports, bilan
- 📗 Export Excel : bilan + évolution mensuelle
- 🔒 Sécurité : middleware (toutes les routes financières protégées), 401/307 sans session
- 🎨 Gestionnaire de médias : modification de toutes les images depuis le back-office
- 🗄️ 71 tables en base de données
- 📐 Conformité RG01-RG25 (23/25 règles, 92%)

### Technique
- Next.js 16 + TypeScript + Tailwind CSS v4
- Drizzle ORM + PostgreSQL 16
- PDFKit (PDF) + SheetJS (Excel) + Recharts (graphiques) + bcryptjs (auth)
- 55+ routes API sécurisées
- 25+ pages ERP + 10 pages publiques
