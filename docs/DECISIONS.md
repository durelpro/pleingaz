# Journal des décisions d'architecture (ADR)

## ADR D1 : Architecture Frontend (Migration Next.js vs Vite)
- **Statut** : PROPOSÉ
- **Options comparées** :
  1. Conservation de Vite (SPA) avec ajout d'un système de pré-rendu (SSG). Limites : complexité de pré-générer des milliers de pages (villes, distributeurs, stocks) et de les maintenir à jour en temps réel.
  2. Migration progressive vers Next.js (App Router).
- **Recommandation** : **Migration vers Next.js (App Router)**.
- **Justification** : Le SEO local dynamique (par ville et par distributeur) et la performance mobile sont les piliers du projet. Next.js permet le rendu côté serveur (SSR) des pages publiques et des balises meta dynamiques, ce qui est indispensable pour ce type d'annuaire localisé, contrairement à une SPA pure. *Note : ce choix repose uniquement sur des considérations d'architecture liées au rendu dynamique. Il reste une part d'incertitude sur la lourdeur du framework sur des réseaux très instables par rapport à l'existant.*

## ADR D2 : Stratégie d'hébergement et CDN
- **Statut** : PROPOSÉ
- **Options comparées** :
  1. Hébergement cloud régional (ex. Afrique du Sud) direct.
  2. VPS en Europe + CDN Cloudflare.
- **Recommandation** : **VPS Européen + Cloudflare (Offre Gratuite / Pro)**.
- **Justification** : Cloudflare permet de rapprocher les ressources statiques via ses PoP locaux, visant à optimiser le LCP mobile en réseau bridé sans les coûts d'une présence cloud physique en Afrique. Seules les requêtes API (stock, paiement) toucheront le VPS.

## ADR D3 : Cartographie, Tuiles et Géocodage
- **Statut** : PROPOSÉ
- **Options comparées** :
  1. Utilisation de Google Maps.
  2. Utilisation du serveur public OpenStreetMap via Nominatim.
  3. Base PostGIS + Leaflet + Cache du géocodage backend.
- **Recommandation** : **PostGIS + Leaflet (Backend)** avec serveur de tuiles OSM public (sous réserve de trafic) évoluant vers un fournisseur commercial, et **géocodage Nominatim bridé**.
- **Justification** : Les conditions d'OSM/Nominatim interdisent le trafic massif commercial direct depuis le front-end. Le backend appellera Nominatim avec limitation (1 req/sec) lors de la *création* de boutique. En secours, l'application affichera une "liste" au lieu d'une carte lourde.

## ADR D4 : Intégration des Paiements Mobile Money (Cameroun)
- **Statut** : PROPOSÉ
- **Options comparées** :
  1. Intégration directe via les API MTN MoMo et Orange Money séparées.
  2. Utilisation d'un agrégateur de paiement local (ex: Campay, NotchPay, CinetPay).
- **Recommandation** : **Utilisation d'un agrégateur**.
- **Justification** : La maintenance de multiples API directes et la réconciliation manuelle sont complexes. Un agrégateur offre une interface unifiée, une sandbox fiable, et gère les webhooks d'échec de manière standardisée. (À confirmer avec l'entreprise en fonction des coûts de commission).

---

# Décisions Souveraines du Propriétaire (CR-001)

## ADR D5 : Périmètre Catalogue Exclusif et Prix Centralisés (CR-001 D-01)
- **Statut** : IMPLÉMENTÉ & VALIDÉ À 100% (Recette E2E Phase 10 franchie)
- **Décision** :
  1. Seuls les produits de marque PLEINGAZ (bouteilles de gaz et accessoires officiels vérifiés) sont vendus, gérés et affichés.
  2. Toute notion de "marketplace" ou de vente de produits tiers est formellement écartée du périmètre.
  3. Les distributeurs déclarent exclusivement un état qualitatif de stock (`BON`, `MOYEN`, `FAIBLE`, `RUPTURE`).
  4. Les prix publics et distributeurs sont obligatoirement nationaux, fixés par l'administration (`ProductPrice`, `PriceHistory`) et recalculés systématiquement par le serveur à la commande.
  5. L'entité historique `StoreProductOffer` est déclassée et neutralisée.
- **Référence** : [05-amendements-proprietaire.md §X-01](file:///home/durel/pleingaz/docs/00-sources/05-amendements-proprietaire.md) ; [12-cr001-specifications.md §1](file:///home/durel/pleingaz/docs/12-cr001-specifications.md#L7-L62).
- **Validation** : `apps/api/src/catalog/catalog.service.spec.ts` & `apps/api/test/cr001-lifecycle.e2e-spec.ts` (Étape 1).

## ADR D6 : Politique de Géolocalisation au Clic et Primauté du Choix Manuel (CR-001 D-02)
- **Statut** : IMPLÉMENTÉ & VALIDÉ À 100% (Recette E2E Phase 10 franchie)
- **Décision** :
  1. Aucune géolocalisation automatique au chargement de la page.
  2. Déclenchement de l'API native du navigateur uniquement au clic explicite de l'utilisateur sur "Ma position" ou "J'ai besoin de gaz", précédé d'une mention de transparence (*"PLEINGAZ utilise votre position pour trouver les points de vente proches ; elle n'est pas conservée"*). HTTPS obligatoire.
  3. L'utilisateur dispose en permanence du choix de sélectionner son lieu librement (Ville -> Quartier, repère textuel, marqueur sur carte interactive). Le lieu manuel prévaut sur le GPS jusqu'au prochain clic.
  4. Gestion obligatoire des 8 états IHM (autorisation, chargement avec timeout, refus, GPS indisponible, précision faible, hors Cameroun, aucun distributeur dans le rayon, connexion faible avec liste de secours textuelle 20 Ko).
  5. Protection de la vie privée : aucune coordonnée GPS exacte n'est persistée dans `SearchEvent` (agrégation par zone/quartier). Pas de géolocalisation par IP. Rayon par défaut de 5 km dans `Setting`.
- **Référence** : [05-amendements-proprietaire.md §X-02](file:///home/durel/pleingaz/docs/00-sources/05-amendements-proprietaire.md) ; [12-cr001-specifications.md §2](file:///home/durel/pleingaz/docs/12-cr001-specifications.md#L64-L107).
- **Validation** : `apps/api/src/search/search.service.spec.ts` & `apps/api/test/cr001-lifecycle.e2e-spec.ts` (Étape 4).

## ADR D7 : Reporting Exhaustif Réservé au Control Center et Zéro Donnée Fictive (CR-001 D-03)
- **Statut** : IMPLÉMENTÉ & VALIDÉ À 100% (Recette E2E Phase 10 franchie)
- **Décision** :
  1. Tous les rapports d'activité, statistiques consolidées et tableaux de bord sont strictement réservés au Control Center Administrateur.
  2. 100% des métriques affichées sont calculées à partir de données réelles en base de données. Tolérance zéro pour les données fictives, placeholders ou graphiques simulés en production. Seeds de démonstration (`is_demo`) strictement isolées.
  3. Spécification exhaustive des 15 rapports du Control Center (`R01` à `R15`) avec sources, filtres, permissions et formats d'export (PDF, CSV, Excel).
  4. Traitement explicite des états vides (compteurs à 0 réel avec libellés adaptés) distincts des erreurs techniques de chargement.
  5. Les distributeurs et livreurs n'accèdent qu'à leurs données opérationnelles propres (relevé personnel en lecture seule).
- **Référence** : [05-amendements-proprietaire.md §X-03](file:///home/durel/pleingaz/docs/00-sources/05-amendements-proprietaire.md) ; [12-cr001-specifications.md §3](file:///home/durel/pleingaz/docs/12-cr001-specifications.md#L109-L144).
- **Validation** : `apps/api/src/dashboard/reports.service.spec.ts` & `apps/api/test/cr001-lifecycle.e2e-spec.ts` (Étape 3 & 9).

## ADR D8 : Simplification Drastique du KYC Distributeur à 3 Pièces (CR-001 D-04)
- **Statut** : IMPLÉMENTÉ & VALIDÉ À 100% (Recette E2E Phase 10 franchie)
- **Décision** :
  1. Le dossier d'inscription distributeur exige strictement et exclusivement 3 pièces justificatives :
     - La pièce d'identité officielle recto/verso (`ID_CARD_FRONT`, `ID_CARD_BACK`).
     - La photo d'identité portrait récent (`PORTRAIT_PHOTO`).
     - La photo du lieu de vente extérieur (`SHOP_PHOTO`).
  2. Suppression intégrale des exigences de registre du commerce (RC), NIU, patente ou documents administratifs complexes.
  3. Sécurité et confidentialité : upload avec compression client pour réseaux 3G, purge systématique des métadonnées EXIF (GPS).
  4. Stockage cloisonné : `ID_CARD` et `PORTRAIT_PHOTO` dans le bucket S3 privé avec URL signées temporaires (15 min) réservées aux administrateurs habilités ; accès consigné dans `AuditLog`. `SHOP_PHOTO` rendue publique après validation `APPROVED`.
- **Référence** : [05-amendements-proprietaire.md §X-04](file:///home/durel/pleingaz/docs/00-sources/05-amendements-proprietaire.md) ; [12-cr001-specifications.md §4](file:///home/durel/pleingaz/docs/12-cr001-specifications.md#L146-L183).
- **Validation** : `apps/api/src/distributor/distributor.service.spec.ts` & `apps/api/test/cr001-lifecycle.e2e-spec.ts` (Étape 2).

## ADR D9 : Intégration des Livreurs comme Utilisateurs de Première Classe (CR-001 D-05)
- **Statut** : IMPLÉMENTÉ & VALIDÉ À 100% (Recette E2E Phase 10 franchie)
- **Décision** :
  1. Les livreurs sont des utilisateurs de premier rang de la plateforme rattachés au rôle dédié `COURIER` (9e rôle du modèle RBAC), supervisés et validés centralement par PLEINGAZ. Cumul possible compte acheteur et compte livreur sur le même numéro.
  2. Interface mobile dédiée (`/courier`) ultra-légère, tolérante aux déconnexions (mode hors-ligne partiel).
  3. Attribution manuelle assistée par l'administrateur ou le dispatcheur logistique ; timeout d'acceptation paramétrable dans `Setting` (défaut 10 min) avec réattribution automatique. Suivi GPS continu différé hors MVP (`H16`).
  4. Sécurisation de la remise : passage à l'état `DELIVERED` subordonné à la **saisie obligatoire par le livreur du code de confirmation** confidentiel remis par le client.
  5. Suivi des espèces (Cash on Delivery) : enregistrement dans `CashCollection`. Les fonds constituent une dette envers PLEINGAZ. Seuil de caisse configurable dans `Setting` (défaut appliqué, à confirmer : exemple illustratif 50 000 FCFA) bloquant automatiquement toute nouvelle course dès dépassement.
- **Référence** : [05-amendements-proprietaire.md §X-05](file:///home/durel/pleingaz/docs/00-sources/05-amendements-proprietaire.md) ; [12-cr001-specifications.md §5](file:///home/durel/pleingaz/docs/12-cr001-specifications.md#L185-L215).
- **Validation** : `apps/api/src/deliveries/deliveries.service.spec.ts` & `apps/api/test/cr001-lifecycle.e2e-spec.ts` (Étape 5 & 7).

## ADR D10 : Gouvernance Financière Centralisée, Maker-Checker et Grand Livre Immuable (CR-001 D-06)
- **Statut** : IMPLÉMENTÉ & VALIDÉ À 100% (Recette E2E Phase 10 franchie)
- **Décision** :
  1. Encaissement centralisé par PLEINGAZ (Mobile Money ou régularisation espèces). Aucun distributeur ni livreur ne fixe de barème ni n'émet de facture autonome.
  2. Séparation stricte des tâches (**Maker-Checker**) :
     - Les modifications de barèmes (`ProductPrice`, `DeliveryFeeSchedule`) sont proposées par `FINANCE_MANAGER` et approuvées obligatoirement par un rôle distinct (`ADMIN` ou `SUPER_ADMIN`).
     - Les lots de reversement (`PayoutBatch`) sont préparés par la finance et approuvés à deux au-delà du seuil `Setting`. Exécution manuelle au MVP avec saisie de la référence externe et téléversement de la preuve de paiement.
  3. Grand Livre immuable à partie double : entités `LedgerAccount` et `LedgerEntry`. Invariant absolu `SUM(debit) == SUM(credit)` sur chaque opération. Modèle strictement Insert-Only (interdiction technique de tout `UPDATE` ou `DELETE` ; rectifications par contre-passation).
  4. Remboursements gérés par l'admin : traitement automatique par défaut des règlements `LATE_SUCCESS`, émission automatique d'avoirs `CreditNote` immuables rattachés à la facture d'origine.
  5. Sécurité financière renforcée : TOTP obligatoire pour toute approbation, sessions de 15 minutes d'inactivité, traçabilité exhaustive dans `AuditLog`.
- **Référence** : [05-amendements-proprietaire.md §X-06](file:///home/durel/pleingaz/docs/00-sources/05-amendements-proprietaire.md) ; [12-cr001-specifications.md §6](file:///home/durel/pleingaz/docs/12-cr001-specifications.md#L217-L269).
- **Validation** : `apps/api/src/payments/ledger.service.spec.ts`, `apps/api/src/payments/payout.service.spec.ts` & `apps/api/test/cr001-lifecycle.e2e-spec.ts` (Étape 6 & 8).


