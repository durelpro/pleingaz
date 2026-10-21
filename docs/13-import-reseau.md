# Spécifications Fonctionnelles & Techniques : Import Réseau Existant (CR-002)

## 1. Contexte et Objectifs
Le présent document formalise les spécifications complètes du module d'importation en masse du réseau de distribution historique de PLEINGAZ (issu de l'export de la carte Google My Maps « CARTE CLIENTS PLEINGAZ »).

### 1.1 Objectif Métier
- Rendre immédiatement visibles pour les clients les points de vente réels sur la carte et le moteur de recherche sans trahir la confiance des utilisateurs sur le niveau réel de vérification.
- Permettre aux distributeurs réels de revendiquer (`claim`) leur boutique et de compléter leur profil sous le contrôle strict de l'administrateur PLEINGAZ.

---

## 2. Décisions Souveraines Appliquées

### D-07 : Publication Immédiate sans mentir sur la vérification
- Niveau de vérification explicite (`verification_level`) :
  - `LISTED` : Point de vente importé issu de la carte. Mention publique : *« Point de vente PLEINGAZ — Informations en cours de vérification »*.
  - `DOCUMENTS_VERIFIED` : 3 pièces KYC fournies et validées.
  - `LOCATION_CONFIRMED` : Positionnement GPS confirmé par le distributeur sur place.
  - `FULLY_VERIFIED` : Attribution officielle du badge vérifié par le Super-Admin.
- Le badge *« Distributeur vérifié »* est **strictement réservé** au niveau `FULLY_VERIFIED`.
- État de stock affiché : *« ⚪ Information non actualisée. Contactez le point de vente »*.
- Commande en ligne (`online_ordering_enabled`) : désactivée (`false`) tant que la boutique n'est pas réclamée (`CLAIMED`) et n'a pas déclaré de stock. Seuls les boutons *Appeler* et *Itinéraire* sont actifs.

### D-08 : Personnes et Acheteurs : Zéro Publication
- Filtrage algorithmique strict en pré-import :
  - Points de vente professionnels identifiés $\rightarrow$ Éligibles pour création `Store` statut `LISTED`.
  - Particuliers, ménages et résidences privées $\rightarrow$ **Quarantaine** (`ImportRecord` statut `QUARANTINE_INDIVIDUAL`). Zéro compte créé, zéro publication, zéro notification.
  - Enregistrements douteux / non classés $\rightarrow$ **Quarantaine** (`QUARANTINE_AMBIGUOUS`) pour revue administrateur.
- Aucun compte utilisateur n'est créé lors de l'import : `owner_user_id = NULL` et `claim_status = UNCLAIMED`.
- Déclaration formelle préalable obligatoire : case d'accord écrit PLEINGAZ horodatée et archivée dans `AuditLog`.

### D-09 : Complétion Ultérieure par les Distributeurs (Claim)
- Cycle de réclamation :
  `UNCLAIMED` $\rightarrow$ `INVITED` $\rightarrow$ `CLAIM_PENDING_REVIEW` $\rightarrow$ `CLAIMED` (ou `CLAIM_REJECTED`).
- Authentification par OTP sur le numéro du dossier.
- Approbation obligatoire par un administrateur pour éviter le détournement de carte SIM (SIM Swap) ou les numéros partagés.
- Checklist de complétion progressive débloquant les capacités :
  1. Confirmation/ajustement du marqueur GPS.
  2. Téléversement des 3 pièces KYC (CNI recto/verso, portrait, boutique extérieure).
  3. Saisie des horaires et options de livraison.
  4. Sélection des références distribuées dans le catalogue exclusif PLEINGAZ.
  5. Déclaration du premier état qualitatif de stock.
- Protection contre l'écrasement (`field_locks`) : tout champ renseigné ou modifié par le distributeur est verrouillé et ne peut pas être écrasé par un ré-import ultérieur.

### D-10 : Contrôle Administrateur de l'Import
- Pipeline d'importation en 4 étapes :
  `Fichier KML/KMZ` $\rightarrow$ `Staging (ImportRecord)` $\rightarrow$ `DRY-RUN (Rapport de simulation)` $\rightarrow$ `Validation / Application`.
- Idempotence garantie : contrainte d'unicité `UNIQUE(source, source_ref)`. Un rejeu du même fichier ne crée aucun doublon.
- Annulation intégrale (`ROLLBACK`) : dépublication du lot en une transaction auditable.
- Permissions requises : `distributor:bulk_import`, `distributor:bulk_approve`, `distributor:unpublish`, `import:rollback`.

---

## 3. Endpoints d'API (Spécifications)

### 3.1 Public (Recherche & Consultation)
- `GET /api/v1/stores/search` :
  - Paramètres : `lat`, `lng`, `radiusKm`, `city`, `neighborhood`, `query`.
  - Retourne les boutiques actives (`isVisible: true`), incluant les boutiques `LISTED`.
  - Pour les boutiques `LISTED`, exclut le badge de vérification et inclut le flag `onlineOrderingEnabled: false`.
- `GET /api/v1/stores/:id` :
  - Détail d'un point de vente avec mention de transparence et historique de fraîcheur.

### 3.2 Distributeur (Réclamation & Complétion)
- `POST /api/v1/stores/:id/claim` :
  - Déclenche la demande de réclamation avec OTP sur le numéro de contact du dossier.
- `POST /api/v1/stores/:id/claim/verify-otp` :
  - Vérifie le code OTP et passe la demande à l'état `CLAIM_PENDING_REVIEW`.
- `PATCH /api/v1/distributor/stores/:id/onboarding` :
  - Met à jour les éléments de la checklist (localisation, horaires, stock initial) et actualise le `completenessScore`.

### 3.3 Administrateur (Gestion des Lots & Réclamations)
- `POST /api/v1/admin/imports/dry-run` :
  - Téléversement d'un fichier KML/KMZ, simulation complète sans écriture publique, détection des doublons et de la quarantaine.
- `POST /api/v1/admin/imports/:id/approve` :
  - Approbation du lot avec validation TOTP, référence de l'accord écrit de PLEINGAZ et motif.
- `POST /api/v1/admin/imports/:id/apply` :
  - Écriture transactionnelle des `Store` en base de données.
- `POST /api/v1/admin/imports/:id/rollback` :
  - Annulation et dépublication complète du lot d'import.
- `GET /api/v1/admin/imports/:id/quarantine` :
  - Consultation des enregistrements en quarantaine (particuliers ou ambigus).
- `POST /api/v1/admin/claims/:id/review` :
  - Approbation (`CLAIMED`) ou rejet (`CLAIM_REJECTED`) d'une réclamation avec consignation dans l'Audit Trail.

---

## 4. Écrans IHM & Expérience Utilisateur

1. **Carte & Recherche Client (`/search`, `/stores`)** :
   - Marqueurs distinctifs : icône spécifique pour les points `LISTED` (contour neutre sans étoile de vérification).
   - Encadré d'avertissement : *« Informations transmises par le réseau PLEINGAZ en cours de validation sur le terrain »*.
   - Actions restreintes : boutons *« Appeler »* et *« Itinéraire »*. Pas de bouton panier/commande.
2. **Back-Office Administrateur (`/admin/imports`)** :
   - Zone de glisser-déposer de l'archive KMZ / fichier KML.
   - Tableau récapitulatif du Dry-Run : total lu, points éligibles, quarantaine particuliers, doublons détectés.
   - Modal d'approbation souveraine : case à cocher formelle attestant l'accord de PLEINGAZ, saisie du code TOTP administrateur.
   - Journal des lots avec statut et bouton d'annulation (`Rollback`).
3. **Espace Réclamation Distributeur (`/distributor/claim`)** :
   - Recherche de son point de vente par numéro de téléphone.
   - Vérification OTP sécurisée et notification du délai de revue administrative.

---

## 5. Critères d'Acceptation & Sécurité
- **Anti-XSS & Anti-Injection** : Toute balise HTML ou instruction textuelle présente dans la balise `<description>` KML est nettoyée ou échappée ; aucune instruction n'est exécutable ni interprétée par les agents IA.
- **Herméticité des Données Privées** : Aucun nom ou numéro personnel ne figure dans le dépôt Git ; les fichiers sources et dérivés restent strictement cantonnés à `data/private/` (ignoré).
- **Zéro Écrasement** : Les données modifiées par un distributeur officiel (`field_locks`) survivent intégralement à tout ré-import de fichier.
