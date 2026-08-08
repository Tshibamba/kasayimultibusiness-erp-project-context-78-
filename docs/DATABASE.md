# Base de données — KasayiMultiBusiness ERP

## Schéma : 74 tables PostgreSQL

### Administration (8 tables)
| Table | Description |
|---|---|
| `users` | Comptes agents (email, passwordHash, roleId, isActive, failedAttempts, lockedUntil) |
| `roles` | 7 rôles système (super_admin, directeur, responsable, comptable, caissier, saisie, auditeur) |
| `permissions` | 60 permissions (10 modules × 6 actions) |
| `role_permissions` | Affectation rôle ↔ permission |
| `company_settings` | Paramètres entreprise (nom, NIF, RC, RCCM, TVA, devise) |
| `branches` | Agences/succursales |
| `audit_logs` | Journal d'audit (action, module, table, IP) |
| `login_history` | Historique connexions (succès/échec, IP, raison) |

### Commun & Site public (10 tables)
| Table | Description |
|---|---|
| `exchange_rates` | Taux de change USD/EUR |
| `notifications` | Notifications internes |
| `clients` | Clients génériques |
| `client_accounts` | Comptes clients (site public) |
| `contact_message` | Messages du formulaire contact |
| `service_requests` | Demandes de service clients |
| `newsletter_subscribers` | Abonnés newsletter |
| `articles` | Articles/actualités |
| `services` | Métiers affichés sur le site |
| `faqs` | Questions fréquentes |

### Agriculture (10 tables)
| Table | Description |
|---|---|
| `fournisseur` | Fournisseurs (typeSemence, conditionsPaiement) |
| `produit_intrant` | Produits (seuilAlerte, seuilCritique) |
| `stock_intrant` | Fiches stock (quantite, CMUP, valeur, statut) |
| `mouvement_stock` | Mouvements (ENTREE/SORTIE/AJUSTEMENT, modePaiement) |
| `alerte_stock` | Alertes (ACTIVE/ACQUITTEE/RESOLUE) |
| `parcelle` | Parcelles (surface, localisation) |
| `culture` | Cultures (responsable, superficie, mainOeuvre) |
| `traitement_culture` | Traitements (décrémente stock intrant) |
| `recolte` | Récoltes (quantite, pertes) |
| `vente_agricole` | Ventes (statutPaiement, montantPaye) |

### Transport (9 tables)
| Table | Description |
|---|---|
| `vehicles` | Véhicules (annee, plaque, statut) |
| `drivers` | Chauffeurs (permis) |
| `trips` | Missions (kilometrage, dateRetour) |
| `fuel_record` | Pleins carburant (litres, odometer) |
| `maintenance` | Entretiens (prochainKm, prochaineDate) |
| `toll` | Péages |
| `transport_expense` | Autres dépenses |
| `vehicle_rental` | Locations externes |
| `vehicle_document` | Documents (assurance, visite, carte grise) |

### Sous-traitance (8 tables)
| Table | Description |
|---|---|
| `projects` | Projets (budget, avancement, statut) |
| `sub_contract` | Contrats (montant, dates, statut) |
| `project_progress` | Suivi avancement temporel |
| `project_team` | Équipes (rôle, coût main d'œuvre) |
| `project_material` | Matériaux (quantite, coutUnitaire) |
| `project_expense` | Dépenses projet |
| `project_invoice` | Factures (TVA auto) |
| `project_payment` | Paiements reçus |

### Traiteur (8 tables)
| Table | Description |
|---|---|
| `events` | Événements (nbInvites, montantTotal) |
| `catering_order` | Commandes clients |
| `menu` | Menus (prixParPersonne) |
| `catering_ingredient` | Stock alimentaire (CMUP) |
| `catering_purchase` | Achats ingrédients |
| `catering_staff` | Personnel événement |
| `catering_expense` | Dépenses événement |
| `catering_invoice` | Factures (TVA auto) |

### Commerce (4 tables)
| Table | Description |
|---|---|
| `commerce_products` | Articles (prixAchat, prixVente, stockMin) |
| `sales` | Ventes (totalHT, taxe, totalTTC, statut) |
| `sale_items` | Lignes de vente |
| `commerce_purchase` | Achats (dépenses approvisionnement) |

### RH (6 tables)
| Table | Description |
|---|---|
| `employees` | Employés (matricule, grade, CIN, photoUrl) |
| `employee_document` | Documents (CV, diplôme, contrat, CIN) |
| `employee_history` | Historique carrière (promotion, sanction, formation) |
| `attendance` | Présences (checkIn, checkOut, statut) |
| `leaves` | Congés (type, jours, statut) |
| `payroll` | Bulletins (CNSS, IPR, salaireNet) |

### Comptabilité (6 tables)
| Table | Description |
|---|---|
| `accounts` | Comptes caisses/banques |
| `transactions` | Mouvements (maj solde auto) |
| `transfers` | Virements inter-comptes |
| `receivables` | Créances clients |
| `payables` | Dettes fournisseurs |
| `tax_payment` | Impôts payés (TVA, IPR, CNSS, IBP) |

### Finances transversales (2 tables)
| Table | Description |
|---|---|
| `depense` | Dépenses centralisées (catégorie, responsable, modePaiement, justificatif) |
| `recette` | Recettes centralisées (source, activité) |

### IA (3 tables)
| Table | Description |
|---|---|
| `ai_conversation` | Conversations (userId, userRole, title) |
| `ai_message` | Messages (role, content, provider, tokensUsed, latencyMs) |
| `ai_setting` | Configuration IA (provider, model, temperature) |
