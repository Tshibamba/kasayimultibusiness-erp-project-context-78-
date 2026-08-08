# API Reference — KasayiMultiBusiness ERP

## Auth

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Non | Connexion client |
| POST | `/api/auth/register` | Non | Inscription client |
| POST | `/api/auth/logout` | Client | Déconnexion client |
| GET | `/api/auth/me` | Client | Infos client connecté |
| POST | `/api/auth/staff/login` | Non | Connexion agent |
| POST | `/api/auth/staff/register` | Non | Inscription agent |
| POST | `/api/auth/staff/logout` | Agent | Déconnexion agent |
| POST | `/api/auth/staff/change-password` | Agent | Changer mot de passe |
| POST | `/api/auth/staff/init` | Non | Init mots de passe (1 fois) |

## Agriculture

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/agriculture/stocks` | Agent | Liste stocks + stats |
| GET | `/api/agriculture/stocks/[id]` | Agent | Fiche de stock complète |
| PATCH | `/api/agriculture/stocks/[id]` | Agent | Modifier seuils |
| POST | `/api/agriculture/mouvements` | Agent | Enregistrer mouvement (CMUP auto) |
| GET | `/api/agriculture/alertes` | Agent | Liste alertes |
| PATCH | `/api/agriculture/alertes/[id]` | Agent | Acquitter alerte |
| POST | `/api/agriculture/produits` | Agent | Créer produit |
| PATCH | `/api/agriculture/produits/[id]` | Agent | Modifier produit |
| POST | `/api/agriculture/fournisseurs` | Agent | Créer fournisseur |
| POST | `/api/agriculture/cultures` | Agent | Créer culture |
| POST | `/api/agriculture/parcelles` | Agent | Créer parcelle |
| POST | `/api/agriculture/traitements` | Agent | Créer traitement (décrémente stock) |
| POST | `/api/agriculture/recoltes` | Agent | Créer récolte |
| POST | `/api/agriculture/ventes` | Agent | Créer vente agricole |
| GET | `/api/agriculture/ventes/[id]/pdf` | Agent | Facture PDF |

## Transport

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/transport/vehicles` | Agent | Créer véhicule |
| POST | `/api/transport/trips` | Agent | Créer mission |
| POST | `/api/transport/fuel` | Agent | Enregistrer plein |
| POST | `/api/transport/maintenance` | Agent | Enregistrer entretien |
| POST | `/api/transport/tolls` | Agent | Enregistrer péage |
| POST | `/api/transport/expenses` | Agent | Autres dépenses |
| POST | `/api/transport/rentals` | Agent | Location véhicule |
| POST | `/api/transport/documents` | Agent | Document véhicule |

## Sous-traitance

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/sous-traitance/projects` | Agent | Créer projet |
| POST | `/api/sous-traitance/contrats` | Agent | Créer contrat |
| POST | `/api/sous-traitance/teams` | Agent | Membre équipe |
| POST | `/api/sous-traitance/materials` | Agent | Achat matériau |
| POST | `/api/sous-traitance/expenses` | Agent | Dépense projet |
| POST | `/api/sous-traitance/invoices` | Agent | Facture (TVA auto) |
| POST | `/api/sous-traitance/payments` | Agent | Paiement reçu |
| POST | `/api/sous-traitance/progress` | Agent | Mise à jour avancement |
| GET | `/api/sous-traitance/[id]/pdf` | Agent | Rapport projet PDF |

## Traiteur

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/traiteur/events` | Agent | Créer événement |
| POST | `/api/traiteur/orders` | Agent | Commande client |
| POST | `/api/traiteur/menus` | Agent | Créer menu |
| POST | `/api/traiteur/ingredients` | Agent | Nouvel ingrédient |
| POST | `/api/traiteur/purchases` | Agent | Achat ingrédient (CMUP) |
| POST | `/api/traiteur/staff` | Agent | Personnel événement |
| POST | `/api/traiteur/expenses` | Agent | Dépense événement |
| POST | `/api/traiteur/invoices` | Agent | Facture (TVA auto) |

## Commerce

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/commerce/products` | Agent | Créer article |
| POST | `/api/commerce/sales` | Agent | Créer vente (TVA auto) |
| PATCH | `/api/commerce/sales/[id]` | Agent | Changer statut paiement |
| GET | `/api/commerce/sales/[id]/pdf` | Agent | Facture PDF |
| POST | `/api/commerce/purchases` | Agent | Achat marchandise |

## RH

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/rh/employees` | Agent | Créer employé |
| PATCH | `/api/rh/employees/[id]` | Agent | Modifier employé |
| DELETE | `/api/rh/employees/[id]` | Agent | Supprimer employé |
| GET | `/api/rh/employees/[id]/payslip` | Agent | Bulletin de paie PDF |
| POST | `/api/rh/documents` | Agent | Document employé |
| POST | `/api/rh/history` | Agent | Historique carrière |
| POST | `/api/rh/leaves` | Agent | Demande de congé |

## Comptabilité

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/comptabilite/accounts` | Agent | Créer compte |
| POST | `/api/comptabilite/transactions` | Agent | Mouvement (maj solde) |

## Administration

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/users` | Admin | Créer utilisateur |
| PATCH | `/api/admin/users/[id]` | Admin | Modifier/désactiver/réinitialiser |
| PATCH | `/api/admin/settings` | Admin | Paramètres entreprise |
| POST | `/api/admin/services` | Admin | Créer métier (site) |
| DELETE | `/api/admin/services/[id]` | Admin | Supprimer métier |
| POST | `/api/admin/articles` | Admin | Créer article |
| PATCH | `/api/admin/medias` | Admin | Modifier image |
| POST | `/api/admin/taxes` | Admin | Enregistrer impôt |

## Bilan & Finances

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/bilan/pdf?annee=YYYY&mois=M` | Agent | Bilan PDF consolidé |
| GET | `/api/bilan/excel?annee=YYYY` | Agent | Bilan Excel |
| GET | `/api/rapports/pdf` | Agent | Rapport PDF |
| GET | `/api/rapports/excel` | Agent | Rapport Excel |
| POST | `/api/finances/depenses` | Agent | Dépense transversale |
| POST | `/api/finances/recettes` | Agent | Recette transversale |

## IA

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/ai/chat` | Agent/Client | Chat intelligent (15 outils ERP) |
| GET | `/api/ai/conversations` | Agent/Client | Historique conversations |
| GET | `/api/ai/conversations?id=X` | Agent/Client | Messages d'une conversation |

## Public (sans auth)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/health` | Vérification serveur |
| GET | `/api/services` | Liste métiers (site public) |
| GET | `/api/articles` | Articles publiés |
| GET | `/api/faqs` | FAQ publique |
| POST | `/api/contact` | Formulaire contact |
| POST | `/api/newsletter` | Inscription newsletter |
| POST | `/api/exchange-rates` | Taux de change |
