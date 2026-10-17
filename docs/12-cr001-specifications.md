# Spécifications Fonctionnelles et Techniques Détaillées — CR-001 (Changement de Périmètre)

Ce document formalise les spécifications exhaustives issues des 6 décisions souveraines du propriétaire (`D-01` à `D-06`), tracées sous les identifiants `X-01.01` à `X-06.10` dans [05-amendements-proprietaire.md](file:///home/durel/pleingaz/docs/00-sources/05-amendements-proprietaire.md). Il constitue la référence technique opposable pour toute la suite de la conception et du développement.

---

## 1. D-01 : Catalogue exclusif PLEINGAZ

### 1.1 Règle Métier & Périmètre
Seuls les produits de marque PLEINGAZ (bouteilles de gaz et accessoires officiels) sont vendus, gérés, recherchés, commandés, facturés et affichés sur l'ensemble des profils applicatifs (visiteur, acheteur, distributeur, livreur, administrateur) et dans l'assistant IA. Toute notion de "marketplace" ou de vente de produits tiers est formellement écartée du périmètre.

### 1.2 Écrans
1. **Admin — Gestion du Catalogue (`/admin/catalog`)** :
   - Interface de gestion du catalogue unique : création, modification, archivage de références (`Product`, `ProductCategory`).
   - Gestion de l'historique des prix (`ProductPrice`, `PriceHistory`) avec date d'effet.
   - Création et gouvernance exclusive des campagnes promotionnelles (`Promotion`).
2. **Distributeur — État des Stocks (`/distributor/stock`)** :
   - Sélection stricte parmi les références du catalogue PLEINGAZ distribuées par le point de vente.
   - Déclaration qualitative exclusive : boutons tactiles larges `BON`, `MOYEN`, `FAIBLE`, `RUPTURE`.
   - Zéro création de produit, zéro modification de libellé, de visuel ou de prix.
   - Déclaration des options de livraison associées à la boutique.
3. **Distributeur — Inscription (`/distributor/register`)** :
   - Le champ libre de produits est remplacé par une liste de sélection à cases à cocher restreinte aux catégories et références PLEINGAZ.
4. **Public & Client — Vitrine et Recherche (`/products`, `/search`)** :
   - Affichage exclusif des références officielles PLEINGAZ.
5. **Chatbot Client (`/chat`)** :
   - Réponses restreintes au catalogue PLEINGAZ ; refus courtois et recentrage immédiat lors de questions sur d'autres marques.

### 1.3 Entités et Champs
- **`Product`** : `id` (PK), `category_id` (FK -> `ProductCategory`), `name`, `sku` (Unique), `description`, `weight_kg` (Decimal), `image_url`, `is_active` (Boolean), `created_at`, `updated_at`. *(Aucun champ `brand` libre).*
- **`ProductCategory`** : `id` (PK), `name` (`Bouteilles`, `Accessoires`), `slug` (Unique), `display_order`.
- **`ProductPrice`** : `id` (PK), `product_id` (FK -> `Product`), `public_price` (Integer FCFA), `distributor_price` (Integer FCFA), `effective_from` (Timestamp UTC), `effective_to` (Timestamp UTC nullable), `status` (`PROPOSED`, `APPROVED`, `REJECTED`, `EXPIRED`), `created_by` (FK -> `User`), `approved_by` (FK -> `User` nullable).
- **`PriceHistory`** : `id` (PK), `product_id` (FK), `old_price`, `new_price`, `change_reason`, `changed_at`, `changed_by`.
- **`OrderItem`**, **`InventoryItem`**, **`InvoiceItem`** : `product_id` (FK obligatoire -> `Product`, `ON DELETE RESTRICT`). Suppression totale de tout champ marque libre.
- *Neutralisation* : L'entité `StoreProductOffer` est déclassée : elle ne peut en aucun cas fixer un prix libre local.

### 1.4 États & Machines d'États
- **`Product`** : `ACTIVE` -> `INACTIVE` -> `ARCHIVED`.
- **`Inventory`** : `BON` | `MOYEN` | `FAIBLE` | `RUPTURE`.
- **`ProductPrice`** : `PROPOSED` -> `APPROVED` | `REJECTED` -> `EXPIRED`.

### 1.5 Endpoints API (`/api/v1`)
- `GET /api/v1/catalog/products` : Liste publique des produits PLEINGAZ actifs.
- `GET /api/v1/catalog/categories` : Catégories actives (Bouteilles, Accessoires).
- `POST /api/v1/admin/catalog/products` : Création de produit (Admin).
- `PUT /api/v1/admin/catalog/products/:id` : Mise à jour de produit (Admin).
- `POST /api/v1/admin/catalog/prices` : Proposition d'un barème de prix (Maker-Checker).
- `POST /api/v1/admin/catalog/prices/:id/approve` : Validation d'un barème de prix.
- `GET /api/v1/distributor/inventory` : Inventaire des références PLEINGAZ du distributeur.
- `PUT /api/v1/distributor/inventory` : Déclaration qualitative de stock (`BON`, `MOYEN`, `FAIBLE`, `RUPTURE`).

### 1.6 Permissions RBAC & Événements d'Audit
- Permissions : `catalog:manage` (Admin), `price:propose` (`FINANCE_MANAGER`), `price:approve` (`ADMIN`, `SUPER_ADMIN`), `inventory:update` (`DISTRIBUTOR`).
- AuditLog : `CATALOG_PRODUCT_CREATED`, `CATALOG_PRODUCT_UPDATED`, `PRICE_PROPOSED`, `PRICE_APPROVED`, `INVENTORY_DECLARED`.

### 1.7 Critères d'Acceptation Testables
1. Toute requête de commande contenant un `product_id` non rattaché au catalogue PLEINGAZ est rejetée avec HTTP 400.
2. Le prix appliqué à la commande est obligatoirement recalculé par le serveur depuis `ProductPrice` actif ; tout montant transmis dans le payload client est écrasé/ignoré.
3. Un utilisateur avec rôle `DISTRIBUTOR` recevant une tentative de création/modification de produit se voit retourner HTTP 403.
4. L'assistant IA sollicité sur une marque tierce répond par un refus courtois et oriente vers PLEINGAZ.

---

## 2. D-02 : Recherche : Localisation au clic + lieu choisi librement

### 2.1 Règle Métier & Confidentialité
La localisation automatique au chargement de la page est formellement proscrite. L'application ne déclenche la demande de géolocalisation native du navigateur (HTTPS obligatoire) qu'au clic explicite de l'utilisateur sur "Rechercher" ou "J'ai besoin de gaz", précédé d'une mention de transparence : *"PLEINGAZ utilise votre position pour trouver les points de vente proches ; elle n'est pas conservée"*.
L'utilisateur conserve en permanence la liberté de choisir son lieu manuellement. Le lieu manuel prime sur le GPS jusqu'au prochain clic sur "Ma position".

### 2.2 Écrans & Composant "Sélecteur de Lieu"
- **Composant tactile universel (Responsive Mobile-first, bilingue FR/EN)** :
  - Bouton prioritaire "Ma position" (déclenchement au clic).
  - Volet "Chercher ailleurs" offrant trois modalités de repli :
    (a) Sélecteur en deux temps : Ville -> Quartier.
    (b) Champ texte d'adresse ou repère ("face pharmacie...") + bouton explicite "Rechercher".
    (c) Carte interactive avec marqueur déplaçable au doigt.
- **Écran de résultats (`/search`)** :
  - Mention explicite d'origine : *"Distance depuis : Ma position"* ou *"Distance depuis : [Lieu choisi]"*.
  - Carte interactive (tuiles Leaflet avec Lazy Loading) ou liste textuelle de secours (20 Ko).
  - Fiche distributeur : distance, statut de stock (`BON`/`MOYEN`/`FAIBLE`/`RUPTURE`), fraîcheur (*"Confirmé il y a X minutes"*), horaires, livraison, boutons d'action (Appel, WhatsApp, Commander).

### 2.3 Spécification des 8 États IHM
1. **Autorisation accordée** : Récupération des coordonnées GPS, affichage des distributeurs avec *"Distance depuis : Ma position"*.
2. **Localisation en cours** : Indicateur de chargement visuel avec bouton d'annulation et timeout configurable (défaut : 8 secondes).
3. **Autorisation refusée** : Fermeture propre de la demande native, affichage immédiat et bienveillant du volet de saisie manuelle sans insister ni bloquer l'écran.
4. **GPS indisponible ou erreur** : Notification *"Position inaccessible. Choisissez votre quartier ci-dessous"*, focus sur la liste des villes/quartiers.
5. **Précision faible** : Affichage d'un badge *"Position approximative"* avec lien d'ajustement sur la carte ou invitation à sélectionner le quartier.
6. **Lieu hors Cameroun ou hors zone** : Message explicite *"PLEINGAZ assure actuellement la distribution au Cameroun"*, proposition des villes desservies.
7. **Aucun distributeur dans le rayon** : Message bienveillant *"Aucun point de vente dans ce rayon"*, boutons pour élargir (ex: 10 km, toute la ville), alerte de réapprovisionnement.
8. **Connexion faible / Hors ligne** : Détection réseau dégradé ou échec de chargement des tuiles cartographiques, bascule automatique sur la **liste de secours textuelle** (20 Ko).

### 2.4 Entités, Paramètres & Endpoints API
- **`SearchEvent`** : `id`, `session_hash`, `coarse_area` (Ville/Quartier ou maille 1 km), `product_id`, `results_count`, `created_at`. *(Interdiction de persister la latitude/longitude exacte).*
- **`Setting`** : `search_default_radius_km` (défaut : 5 km, options : 2, 5, 10, "ville"), `search_gps_timeout_seconds` (défaut : 8 s).
- `GET /api/v1/stores/search` :
  - Paramètres : `lat` ([-90, 90]), `lng` ([-180, 180]), `radius` (max 50 km), `product_id`, `open_now`, `delivery`, `area_id`, `page`, `limit`.
  - Validation Zod/ValidationPipe stricte ; journalisation sans coordonnées GPS fines.
- `POST /api/v1/geo/geocode` :
  - Géocodage d'adresse/repère backend via Nominatim bridé (1 req/sec max par IP/session, cache local PostGIS, pas d'autocomplétion à la frappe).

### 2.5 Critères d'Acceptation Testables
1. Le chargement initial de la page d'accueil ne déclenche aucun appel à l'API `navigator.geolocation`.
2. Le refus d'autorisation par l'utilisateur bascule directement sur le formulaire manuel sans alerte intrusive répétée.
3. Les requêtes `GET /api/v1/stores/search` avec coordonnées hors bornes ou hors Cameroun renvoient une erreur 400 documentée.
4. En simulation de connexion 3G bridée avec tuiles bloquées, l'IHM affiche la liste texte en moins de 2,5 s (LCP conforme).

---

## 3. D-03 : Tous les comptes rendus dans l'administration, zéro donnée fictive

### 3.1 Règle Métier & Cloisonnement
Tous les rapports, tableaux de bord de pilotage, statistiques consolidées et métriques de réseau sont strictement réservés au **Control Center Administrateur**. Tout chiffre affiché provient directement d'une requête SQL sur la base de données réelle. Aucune donnée fictive (valeur en dur, graphique d'exemple, placeholder inventé) n'est tolérée en production. Les graines (`seeds`) `is_demo` sont confinées au développement. Les clients, distributeurs et livreurs n'accèdent qu'à leurs données opérationnelles propres (le distributeur consulte un relevé personnel en lecture seule).

### 3.2 Liste Exhaustive des 15 Rapports du Control Center
| Réf | Rapport | Définition & Métrique Source | Entités Sources | Filtres Disponibles | Permission Requise | Exports Disponibles |
|---|---|---|---|---|---|:---:|
| **R01** | **Ventes & CA** | Somme des ventes nettes, panier moyen, volume par produit | `Order`, `OrderItem`, `Payment` | Jour, semaine, mois, année, ville, distributeur, produit | `report:view_finance` | PDF, CSV, Excel |
| **R02** | **Commandes Réseau** | Volume et statut des commandes (en attente, confirmées, livrées, annulées) | `Order` | Période, ville, statut, distributeur | `order:view_any` | CSV, Excel |
| **R03** | **Finances & Trésorerie** | Encaissements en ligne, commissions prélevées, soldes de règlement | `LedgerAccount`, `LedgerEntry` | Période, tiers (distributeur, livreur) | `report:view_finance` | PDF, CSV, Excel |
| **R04** | **Paiements & Réconciliation** | Transactions MoMo (succès, échecs), rapprochement relevés opérateurs | `PaymentTransaction`, `PaymentWebhookEvent` | Opérateur (MTN/Orange), période, statut | `report:view_finance` | CSV, Excel |
| **R05** | **Disponibilité des Stocks** | Répartition qualitative BON/MOYEN/FAIBLE/RUPTURE par référence | `Inventory`, `Product` | Ville, quartier, référence PLEINGAZ | `store:view_any` | CSV, Excel |
| **R06** | **Ruptures Critiques** | Points de vente déclarant une rupture sur une bouteille clé | `Inventory`, `Store` | Ville, référence produit | `store:view_any` | PDF, CSV |
| **R07** | **Activité Distributeurs** | Candidatures, points de vente actifs, inactifs, suspendus | `DistributorProfile`, `DistributorApplication` | Statut, ville, période | `distributor:approve` | CSV, Excel |
| **R08** | **Stocks Non Actualisés** | Boutiques dont `last_updated_at` dépasse le seuil configuré | `Inventory`, `Store` | Seuil en heures, ville | `distributor:manage` | CSV |
| **R09** | **Activité Livreurs** | Taux de réussite de livraison, délai moyen d'acheminement | `Delivery`, `Courier`, `CourierAvailability` | Zone, livreur, période | `courier:manage` | CSV, Excel |
| **R10** | **Recherches sans Résultat** | Recherches "J'ai besoin de gaz" renvoyant 0 point de vente disponible | `SearchEvent` | Ville, quartier, période | `report:view_analytics` | CSV |
| **R11** | **Demande Géographique** | Volume de recherches et commandes consolidé par quartier/zone | `SearchEvent`, `Order` | Ville, quartier, période | `report:view_analytics` | CSV, Excel |
| **R12** | **Avis & Satisfaction** | Notes moyennes et retours clients vérifiés après livraison | `Review` | Distributeur, période, note | `support:manage` | CSV |
| **R13** | **Incidents & Litiges** | Échecs de livraison, contestations d'encaissement d'espèces, retards | `Report`, `SupportTicket` | Sévérité, type, statut, période | `support:manage` | PDF, CSV |
| **R14** | **Pistes d'Audit Trail** | Journal immuable de l'ensemble des actions sensibles du staff | `AuditLog` | Rôle, utilisateur, type d'action, période | `audit:view` | CSV, Excel |
| **R15** | **Santé de la Plateforme** | Taux de disponibilité API, état des files BullMQ, erreurs webhook | Métriques système, jobs | Période, composant | `system:monitor` | N/A (Vue direct) |

### 3.3 Traitement des États Vides & Fraîcheur
- Tout écran affiche un message explicite adapté à la vue : *"Aucune commande pour le moment"*, *"Aucun point de vente en attente"*, avec des compteurs à `0` réel.
- Distinction stricte dans l'interface entre un résultat à `0` et une indisponibilité technique de chargement.
- Chaque rapport affiche son horodatage de génération : *"Calculé le DD/MM/YYYY à HH:mm (données en direct)"*.
- Tout export de fichier (PDF, CSV, Excel) consigne une trace dans `AuditLog` avec l'identifiant de l'administrateur et les filtres appliqués.

### 3.4 Critères d'Acceptation Testables
1. **Test Base Vide (06b)** : Sur une base de données entièrement purgée de données métier, chaque écran et endpoint de reporting retourne HTTP 200 avec des compteurs à 0 et des messages d'état vide conformes, sans aucune erreur 500 ni valeur fictive.
2. Toute tentative d'accès à un rapport d'administration par un utilisateur détenant un rôle `CUSTOMER`, `DISTRIBUTOR` ou `COURIER` est rejetée avec HTTP 403.
3. Les données associées au marqueur `is_demo = true` sont formellement exclues de toutes les requêtes en environnement de production (`NODE_ENV=production`).

---

## 4. D-04 : Documents du distributeur : trois seulement

### 4.1 Règle Métier & Réduction KYC
À la création du compte distributeur, le dossier de candidature exige strictement et exclusivement :
1. **La pièce d'identité officielle** : Recto (`ID_CARD_FRONT`) et Verso (`ID_CARD_BACK`).
2. **La photo d'identité de la personne** : Portrait récent (`PORTRAIT_PHOTO`).
3. **La photo du lieu de vente** : Vue extérieure de la boutique physique (`SHOP_PHOTO`).
Toute exigence de registre du commerce, NIU, patente ou "documents administratifs" est intégralement supprimée.

### 4.2 Spécifications Techniques & Sécurité Upload
- **Formats acceptés** : JPEG, PNG, WebP uniquement (vérification des magic bytes côté serveur, pas uniquement de l'extension).
- **Poids et dimensions** : Poids maximal configurable dans `Setting` (exemple illustratif : 5 Mo) ; dimensions minimales pour lisibilité (ex: 800x600 px).
- **Sécurité et conformité mobile** :
  - Guide visuel de cadrage à la caméra et compression locale (HTML5 Canvas / WebP) avant transfert pour réseaux 3G.
  - Sauvegarde locale du brouillon et reprise sur coupure réseau.
  - Analyse antivirus automatique à la réception dans le bucket de transition.
  - **Purge systématique des métadonnées EXIF** (incluant coordonnées GPS, modèle d'appareil) à l'enregistrement définitif.
- **Cloisonnement et Confidentialité** :
  - `ID_CARD_FRONT`, `ID_CARD_BACK` et `PORTRAIT_PHOTO` sont stockés dans le **bucket S3 Privé**.
  - Accès exclusivement réservé aux administrateurs habilités (`document:view_identity`) via des **URL signées à durée courte (15 minutes)**. Toute consultation génère un enregistrement dans `AuditLog`.
  - `SHOP_PHOTO` est redimensionnée et transférée vers le bucket S3 Public uniquement après approbation du compte (`APPROVED`).
  - Recueil du consentement explicite à la collecte lors de la soumission.

### 4.3 Écran de Validation Administrateur (`/admin/distributors/:id/kyc`)
- Visualiseur sécurisé des 3 documents avec loupe et rotation.
- Checklist de conformité opposable :
  - [ ] Nom complet sur la carte = Nom du compte utilisateur.
  - [ ] Cohérence visuelle entre le portrait photo et la photo de la pièce d'identité.
  - [ ] Lieu de vente réel et cohérent avec l'adresse déclarée.
- Décisions auditées avec motif : `APPROVED`, `REJECTED` (motif obligatoire transmis au candidat par SMS/WhatsApp), ou *"Demande d'information complémentaire"*.

### 4.4 Endpoints API (`/api/v1`)
- `POST /api/v1/distributor/documents/presigned-url` : Demande d'URL d'upload direct avec type MIME borné.
- `POST /api/v1/distributor/documents/confirm` : Confirmation d'upload, déclenchement stripping EXIF et antivirus.
- `GET /api/v1/admin/distributors/:id/documents` : Récupération des URL signées sécurisées (Action auditée).
- `POST /api/v1/admin/distributors/:id/review` : Décision d'approbation ou rejet avec motif.

---

## 5. D-05 : Livreurs sur la plateforme

### 5.1 Règle Métier & Modèle d'Exploitation
Les livreurs sont des utilisateurs à part entière de la plateforme, rattachés au rôle dédié **LIVREUR** (`COURIER`). Ils sont créés, validés et supervisés sous le contrôle direct de l'administration PLEINGAZ (invitation ou candidature validée par l'admin, non rattachés en direct à la boutique d'un distributeur). Un même numéro de téléphone peut détenir le profil acheteur et le profil livreur.

### 5.2 Interface Mobile Livreur (`/courier`)
Interface ultra-légère conçue pour les smartphones Android d'entrée de gamme et connexions instables :
- **Onglet "Missions"** : Liste des livraisons assignées avec priorité, distance et état.
- **Fiche Mission active** :
  - Adresse avec repère textuel descriptif et bouton de localisation sur carte.
  - Références PLEINGAZ exactes à livrer et indication d'échange de consigne vide.
  - Bouton d'appel téléphonique et bouton d'ouverture de message WhatsApp pré-rempli.
  - Boutons d'avancement d'état : *"Récupéré chez le distributeur"* (`PICKED_UP`), *"En route"* (`IN_TRANSIT`), *"Livré"* (`DELIVERED`) avec **saisie obligatoire du code de confirmation** remis par le client, ou *"Échec de livraison"* (`FAILED`) avec motif obligatoire.
- **Onglet "Mes Gains & Caisse"** : Historique des rémunérations acquises et cumul des espèces collectées détenues en caisse.
- **Mode hors ligne partiel** : Mémorisation locale de la mission active et synchronisation dès retour du réseau.

### 5.3 Cycle de Vie & Attribution des Livraisons
- **Attribution** : Manuelle par l'administrateur ou le `LOGISTICS_MANAGER` au MVP, assistée par suggestion algorithmique (zone géographique, statut de disponibilité, nombre de courses actives). Délai d'acceptation par le livreur configurable dans `Setting` (défaut : 10 minutes) ; en cas de non-réponse, la mission est réattribuée.
- **Suivi logistique** : Statuts événementiels stricts au MVP ; le suivi GPS continu en temps réel est classé hors MVP (`H16`).
- **Gestion des espèces à la remise** : En cas de paiement à la livraison, le livreur encaisse les fonds. Le système enregistre une ligne `CashCollection`. Les espèces constituent une créance du livreur envers PLEINGAZ. Un plafond d'encaissement est paramétré dans `Setting` (exemple illustratif : 50 000 FCFA). Dès dépassement, de nouvelles attributions sont bloquées jusqu'à remise des fonds.

### 5.4 Entités, Permissions & Machines d'États
- **`Courier`** : `id` (PK), `user_id` (FK -> `User`), `vehicle_type` (`MOTO`, `VELO`, `VOITURE`, `PIED`), `status` (`PENDING`, `APPROVED`, `SUSPENDED`, `INACTIVE`), `cash_balance` (Integer FCFA), `created_at`.
- **`CourierAvailability`** : `courier_id` (FK), `is_online` (Boolean), `last_seen_at`.
- **`CourierZone`** : `courier_id` (FK), `area_name`, `city`.
- **`DeliveryAssignment`** : `id`, `delivery_id`, `courier_id`, `status` (`PROPOSED`, `ACCEPTED`, `REJECTED`, `EXPIRED`), `timeout_at`.
- **`CashCollection`** : `id`, `delivery_id`, `courier_id`, `amount`, `status` (`COLLECTED`, `REMITTED_TO_PLEINGAZ`, `DISPUTED`).
- **`Delivery`** (enrichie) : `id`, `order_id`, `courier_id`, `status` (`PENDING`, `ASSIGNED`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`, `FAILED`, `CANCELLED`), `confirmation_code` (Hash du code à 4-6 chiffres), `failure_reason`.
- **RBAC (9 rôles)** : Rôle `COURIER` doté des permissions `courier:view_assigned`, `courier:update_delivery_status`, `courier:set_availability`. Permissions de supervision `courier:manage` et `delivery:assign` confiées à `LOGISTICS_MANAGER` et `ADMIN`.

---

## 6. D-06 : Finances contrôlées par l'administrateur

### 6.1 Règle Métier & Séparation des Tâches (Maker-Checker)
L'ensemble des paramètres, barèmes, créances, factures, remboursements et reversements est exclusivement administré par le **Control Center**. Aucun distributeur ni livreur ne peut fixer un prix, créer une facture ou exécuter un virement.
Les barèmes et reversements appliquent le principe **Maker-Checker** : un changement de prix ou un lot de reversement est proposé par un rôle (`FINANCE_MANAGER`) et validé par un rôle distinct (`ADMIN` ou `SUPER_ADMIN`).

### 6.2 Grand Livre Immuable à Écriture Double
Pour toute transaction financière (paiement, commission, dette d'espèces, reversement, rémunération de livraison, remboursement), le système génère des écritures équilibrées dans un grand livre à double entrée :
- **Invariants comptables absolus** :
  1. `SUM(debit) == SUM(credit)` sur chaque opération (vérification par contrainte transactionnelle).
  2. Immutabilité stricte : interdiction technique de tout `UPDATE` ou `DELETE` sur `LedgerEntry` (Insert-Only).
  3. Toute correction d'erreur comptable s'effectue obligatoirement par une écriture inverse de contre-passation.
- **Plan de Comptes Type (`LedgerAccount`)** :
  - `1010` : Banque / Compte Marchand Mobile Money (Actif)
  - `1020` : Caisse Espèces Distributeurs (Créance envers distributeurs)
  - `1030` : Caisse Espèces Livreurs (Créance envers livreurs)
  - `4010` : Dettes Reversements Distributeurs (Passif)
  - `4020` : Dettes Rémunération Livreurs (Passif)
  - `7010` : Produits des Ventes Gaz & Accessoires (Produit)
  - `7020` : Produits des Commissions PLEINGAZ (Produit)
  - `6010` : Charges de Frais Opérateurs Mobile Money (Charge)
  - `6020` : Charges de Rémunération des Livraisons (Charge)

### 6.3 Processus de Reversement & Remboursement
- **Reversements Distributeurs & Livreurs (`PayoutBatch`)** :
  - Regroupement périodique (ex: hebdomadaire) créé par le `FINANCE_MANAGER`.
  - Double validation obligatoire (`ADMIN` ou `SUPER_ADMIN`) dès que le montant dépasse le seuil configuré dans `Setting` *(défaut appliqué, à confirmer)*.
  - Exécution manuelle au MVP : saisie du numéro de transaction réel MTN/Orange et upload de la preuve de transfert ; passage à l'état `EXECUTED` avec génération des écritures de débit des dettes et crédit de trésorerie.
- **Remboursements (`Refund`) & Avoirs (`CreditNote`)** :
  - Tout incident de paiement `LATE_SUCCESS` (succès reçu après expiration de réservation) déclenche par défaut un remboursement.
  - Tout remboursement engendre automatiquement un avoir immuable (`CreditNote`) rattaché à la facture d'origine.
- **Sécurité financière renforcée** :
  - Authentification forte **TOTP obligatoire** pour toute validation de barème ou de lot financier.
  - Durée de session raccourcie (15 minutes d'inactivité) pour les rôles financiers.
  - Traçabilité complète dans `AuditLog` avec alerte temps réel sur les opérations sensibles.

### 6.4 Matrice de Séparation des Tâches Financières (Maker-Checker)
| Opération | `FINANCE_MANAGER` | `ADMIN` | `SUPER_ADMIN` | `DISTRIBUTOR` | `COURIER` |
|---|:---:|:---:|:---:|:---:|:---:|
| `price:propose` (Proposer un tarif catalogue) | ✅ | ❌ | ❌ | ❌ | ❌ |
| `price:approve` (Valider un tarif catalogue) | ❌ | ✅ | ✅ | ❌ | ❌ |
| `fee:propose` (Proposer commissions/frais livraison) | ✅ | ❌ | ❌ | ❌ | ❌ |
| `fee:approve` (Valider commissions/frais livraison) | ❌ | ✅ | ✅ | ❌ | ❌ |
| `payout:create` (Créer un lot de reversement) | ✅ | ❌ | ❌ | ❌ | ❌ |
| `payout:approve` (Approuver un lot de reversement) | ❌ | ✅ | ✅ | ❌ | ❌ |
| `payout:execute` (Marquer exécuté avec preuve) | ✅ | ✅ | ✅ | ❌ | ❌ |
| `refund:request` (Demander un remboursement) | ✅ | ✅ | ✅ | ❌ | ❌ |
| `refund:approve` (Valider un remboursement) | ❌ | ✅ | ✅ | ❌ | ❌ |
| `ledger:view` (Consulter le grand livre complet) | ✅ | ✅ | ✅ | ❌ | ❌ |
| `cash:reconcile` (Rapprocher caisse espèces / dettes) | ✅ | ❌ | ✅ | ❌ | ❌ |
| `report:view_finance` (Consulter les rapports financiers) | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 7. Synthèse des Impacts par Document de Conception

| Document | Objet de la mise à jour ciblée | Réf Décision |
|---|---|---|
| [02-cadrage-ux-roles.md](file:///home/durel/pleingaz/docs/02-cadrage-ux-roles.md) | Intégration du rôle `COURIER` (9 rôles), matrice des permissions, parcours logistique et Maker-Checker financier. | D-01, D-02, D-04, D-05, D-06 |
| [03-modele-donnees-etats.md](file:///home/durel/pleingaz/docs/03-modele-donnees-etats.md) | Déclaration des entités logistiques (`Courier`, `DeliveryAssignment`), financières (`LedgerAccount`, `LedgerEntry`, `PayoutBatch`), restriction `DistributorDocument.type`. | D-01, D-04, D-05, D-06 |
| [03b-machines-etats.md](file:///home/durel/pleingaz/docs/03b-machines-etats.md) | Machines à états strictes pour `DeliveryAssignment`, `Delivery`, `Courier`, `PayoutBatch`, `CashCollection`. | D-05, D-06 |
| [03c-contraintes-modele-economique.md](file:///home/durel/pleingaz/docs/03c-contraintes-modele-economique.md) | Contraintes SQL d'intégrité, immutabilité du grand livre, suppression de la liberté tarifaire locale, recouvrement des espèces. | D-01, D-05, D-06 |
| [04-architecture-technique.md](file:///home/durel/pleingaz/docs/04-architecture-technique.md) | Composant PWA Livreur, isolation S3 privé/public, géoloc au clic (8 états, repli 20 Ko), stripping EXIF, URLs signées 15 min. | D-01, D-02, D-04, D-05, D-06 |
| [05a-paiement-facturation.md](file:///home/durel/pleingaz/docs/05a-paiement-facturation.md) | Grand Livre immuable en partie double, validation Maker-Checker des prix et reversements, gestion caisse espèces, 15 rapports réels. | D-01, D-03, D-05, D-06 |
| [05b-notifications.md](file:///home/durel/pleingaz/docs/05b-notifications.md) | Événements logistiques livreur, alertes KYC motivées, notifications d'approbation Maker-Checker. | D-04, D-05, D-06 |
| [05c-ia-recherche.md](file:///home/durel/pleingaz/docs/05c-ia-recherche.md) | Bornage strict du RAG au catalogue officiel PLEINGAZ, refus des marques tierces, guidage géographique sans géoloc autonome. | D-01, D-02 |
| [06a-securite.md](file:///home/durel/pleingaz/docs/06a-securite.md) | Menaces M14 (espèces), M18 (fraude interne Maker-Checker), M19 (traçage/EXIF) ; TOTP obligatoire pour actions financières. | D-02, D-04, D-05, D-06 |
| [06b-tests.md](file:///home/durel/pleingaz/docs/06b-tests.md) | Tests Maker-Checker, code confirmation livraison, test bloquant base de données vide (zéro donnée fictive), 8 états UI. | D-01 à D-06 |
| [06c-mvp-pilote-roadmap.md](file:///home/durel/pleingaz/docs/06c-mvp-pilote-roadmap.md) | Ajout des fonctions MVP M30 à M35 et hors MVP H16 à H19 ; calendrier pilote. | D-01 à D-06 |
| [07-donnees-personnelles.md](file:///home/durel/pleingaz/docs/07-donnees-personnelles.md) | Minimisation données client pour livreur (masquage post-livraison), stripping EXIF, consentement au clic, zone grossière SearchEvent. | D-02, D-04, D-05, D-06 |
| [08-tracabilite.md](file:///home/durel/pleingaz/docs/08-tracabilite.md) | Matrice de traçabilité intégrant les 48 exigences souveraines X-01.01 à X-06.10 et couverture à 100%. | D-01 à D-06 |
| [10-phase1-cloture.md](file:///home/durel/pleingaz/docs/10-phase1-cloture.md) | Clôture de la Phase 1 alignée avec le nouveau périmètre validé et préparation des entités clés en Phase 2. | D-01 à D-06 |
| [DECISIONS.md](file:///home/durel/pleingaz/docs/DECISIONS.md) | Consignation formelle des décisions souveraines D-01 à D-06 sous les ADRs D5 à D10. | D-01 à D-06 |
| [OPEN_QUESTIONS.md](file:///home/durel/pleingaz/docs/OPEN_QUESTIONS.md) | Résolution formelle des questions 1, 4, 5, 17, 18, 19, 25 et consignation des questions résiduelles X-01.07 et X-04.06. | D-01 à D-06 |
