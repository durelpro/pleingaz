# CR-002 — Lot 1 : Cadrage Complet, Analyse d'Impact & Spécifications Préliminaires

Date : 2026-10-21. Branche : `feat/cr-002-import-reseau`.  
Document de cadrage exhaustif conforme à 100% aux décisions souveraines D-07, D-08, D-09, D-10 du propriétaire.

---

## 1. Matrice d'Impact Intégrale (Décision → Documents → Entités → États → Écrans → Endpoints → Tests → Phase)

| Décision Souveraine | Documents Impactés | Entités Impactées | Nouveaux États / Machines | Écrans IHM Impactés | Endpoints API Impactés | Cas de Tests Critiques | Phase / Jalon |
|---|---|---|---|---|---|---|---|
| **D-07 : Publication immédiate sans mentir sur la vérification** | `03-modele`, `03b-machines`, `04-archi`, `DECISIONS.md`, `13-import-reseau.md` | `Store`, `PlatformSettings` | `verification_level`: `LISTED`, `DOCUMENTS_VERIFIED`, `LOCATION_CONFIRMED`, `FULLY_VERIFIED` | Client : `/search`, fiche boutique, carte Leaflet (icône distinctive, mention légale) | `GET /api/v1/stores/search`, `GET /api/v1/stores/:id` | • Badge vérifié absent si `LISTED`<br/>• Stock affiché "information non actualisée"<br/>• Commande en ligne désactivée côté serveur | Phase 4 / Jalon M36 |
| **D-08 : Personnes et acheteurs : Zéro publication** | `07-donnees-personnelles`, `06a-securite`, `OPEN_QUESTIONS.md`, `13-import-reseau.md` | `ImportRecord` (staging), `Store` | `quarantine_status`: `NONE`, `QUARANTINE_INDIVIDUAL`, `QUARANTINE_AMBIGUOUS` | Admin : `/admin/imports` (tableau quarantaine, revue manuelle) | `GET /api/v1/admin/imports/:id/quarantine` | • Aucune création de compte `User`<br/>• Particulier non exposé publiquement<br/>• `owner_user_id` strictement `NULL` | Phase 4 / Jalon M37 |
| **D-09 : Complétion ultérieure et Réclamation (Claim)** | `02-cadrage`, `03b-machines`, `04-archi`, `13-import-reseau.md` | `Store`, `StoreClaim`, `DistributorApplication` | `claim_status`: `UNCLAIMED`, `INVITED`, `CLAIM_PENDING_REVIEW`, `CLAIMED`, `CLAIM_REJECTED` | Distributeur : `/distributor/claim`, `/distributor/onboarding` (checklist %)<br/>Admin : `/admin/claims` | `POST /api/v1/stores/claim`<br/>`POST /api/v1/admin/claims/:id/review`<br/>`PATCH /api/v1/distributor/onboarding` | • Réclamation par OTP avec téléphone dossier<br/>• Validation obligatoire admin anti-SIM swap<br/>• `field_locks` protégeant contre ré-import | Phase 4 / Jalon M38 |
| **D-10 : Contrôle Administrateur de l'Import** | `06a-securite`, `06b-tests`, `08-tracabilite`, `13-import-reseau.md` | `ImportBatch`, `ImportRecord`, `AuditLog` | `batch_status`: `DRY_RUN`, `APPROVED`, `APPLIED`, `ROLLED_BACK`, `FAILED` | Admin : `/admin/imports` (glisser-déposer, rapport dry-run, approval modal avec case légale, bouton rollback) | `POST /api/v1/admin/imports/dry-run`<br/>`POST /api/v1/admin/imports/approve`<br/>`POST /api/v1/admin/imports/apply`<br/>`POST /api/v1/admin/imports/:id/rollback` | • Idempotence stricte par `UNIQUE(source, source_ref)`<br/>• Rollback dépubliant l'ensemble du lot<br/>• Rejet si case d'accord PLEINGAZ non cochée | Phase 4 / Jalon M39 |

---

## 2. Règles de Classification Formelles et Algorithmiques (D-08)

Chaque entrée lue dans le fichier Google My Maps est passée au crible des filtres suivants :

```text
Entrée Google My Maps (Name, Description, Coordinates, Layer)
  │
  ├── Étape 1 : Contrôle Géographique Strict (Cameroun)
  │     ├── Latitude ∈ [1.6, 13.1] ET Longitude ∈ [8.4, 16.2] ?
  │     └── NON ──> REJET TECHNIQUE (OUT_OF_BOUNDS)
  │
  ├── Étape 2 : Détection des Particuliers et Ménages
  │     ├── Détection de mots-clés d'habitat individuel :
  │     │     \b(Ménage|Menage|Domicile|Residence|Résidence|Maison|Famille)\b
  │     ├── OU Nom composé de 2 ou 3 mots de type [Prénom Nom] sans mention d'activité
  │     └── OUI ──> QUARANTAINE_INDIVIDUAL (Staging seul, ZÉRO publication, ZÉRO compte)
  │
  ├── Étape 3 : Détection des Points de Vente Professionnels
  │     ├── Nom ou description contenant :
  │     │     \b(Dépôt|Depot|ETS|Ets|Société|Societe|SARL|Sarl|Boutique|Boutik|
  │     │        Quincaillerie|Station|Total|Tradex|Shell|Ola|Bocom|Marché|Marche|
  │     │        Comptoir|Distributeur|Grossiste|Semi-grossiste|Revendeur|Magasin)\b
  │     ├── OU Couche Placemark parente nommée "Grossistes" ou "Semi-Grossistes"
  │     └── OUI ──> ÉLIGIBLE IMPORT (Statut Store LISTED)
  │
  └── Étape 4 : Cas Douteux ou Ambigus
        └── Nom d'un mot unique sans contexte ──> QUARANTAINE_AMBIGUOUS (Revue admin manuelle)
```

---

## 3. Spécifications du Schéma de Données Révisé

### 3.1 Nouveaux Énumérations Prisma
```prisma
enum VerificationLevel {
  LISTED                // Import initial, non vérifié sur pièces
  DOCUMENTS_VERIFIED    // 3 documents KYC téléversés et vérifiés
  LOCATION_CONFIRMED    // Coordonnées GPS confirmées par le distributeur
  FULLY_VERIFIED        // Attribution officielle du badge Pleingaz vérifié
}

enum ClaimStatus {
  UNCLAIMED             // Aucun compte rattaché
  INVITED               // Message d'invitation préparé par l'admin
  CLAIM_PENDING_REVIEW  // Distributeur authentifié par OTP en attente d'approbation
  CLAIMED               // Boutique rattachée à son propriétaire officiel
  CLAIM_REJECTED        // Demande de réclamation rejetée par l'admin
}

enum NetworkTier {
  WHOLESALER            // Grossiste
  SEMI_WHOLESALER       // Semi-grossiste
  RESELLER              // Revendeur
  UNKNOWN               // Non précisé dans l'import
}

enum ImportBatchStatus {
  DRY_RUN               // Simulation d'import calculée
  APPROVED              // Validé par l'administrateur
  APPLIED               // Appliqué en base de données
  ROLLED_BACK           // Lot annulé / dépublié
  FAILED                // Échec technique
}
```

### 3.2 Champs Ajoutés au Modèle `Store`
* `ownerId`: `String?` (rendu optionnel pour les boutiques importées)
* `city`: `String?` (rendu optionnel, aucune donnée devinée)
* `neighborhood`: `String?` (rendu optionnel)
* `source`: `String @default("MANUAL")` (ex: `"PLEINGAZ_MY_MAPS"`)
* `sourceRef`: `String?` (ex: hash SHA-256 de couche+nom+coords ou ID placemark)
* `importBatchId`: `String?`
* `verificationLevel`: `VerificationLevel @default(LISTED)`
* `claimStatus`: `ClaimStatus @default(UNCLAIMED)`
* `networkTier`: `NetworkTier @default(UNKNOWN)`
* `onlineOrderingEnabled`: `Boolean @default(false)`
* `locationSource`: `String @default("MANUAL")`
* `locationConfirmedAt`: `DateTime?`
* `completenessScore`: `Int @default(0)`
* `contactPhone`: `String?` (E.164 normalisé)
* `contactPhoneRaw`: `String?` (texte brut d'origine)
* `whatsappConfirmed`: `Boolean @default(false)`
* `rawImport`: `Json?` (visibilité strictement réservée à l'administrateur)
* `fieldLocks`: `Json?` (liste des champs modifiés manuellement non écrasables)
* Contrainte d'unicité : `@@unique([source, sourceRef])`

---

## 4. Machines à États & Règles d'Invariance

### 4.1 Machine `VerificationLevel`
* **Transitions Autorisées** :
  * `LISTED` $\rightarrow$ `DOCUMENTS_VERIFIED` (lorsque les 3 pièces KYC sont validées)
  * `DOCUMENTS_VERIFIED` $\rightarrow$ `LOCATION_CONFIRMED` (lorsque le marqueur GPS est validé in-situ)
  * `LOCATION_CONFIRMED` $\rightarrow$ `FULLY_VERIFIED` (approbation souveraine Super-Admin)
* **Transitions Interdites** :
  * Interdiction absolue de passer directement de `LISTED` à `FULLY_VERIFIED`.
  * Rétrogradation impossible sans consignation explicite d'un motif dans `AuditLog`.

### 4.2 Machine `ClaimStatus`
* **Transitions Autorisées** :
  * `UNCLAIMED` $\rightarrow$ `INVITED` (génération d'un lien d'invitation)
  * `UNCLAIMED` ou `INVITED` $\rightarrow$ `CLAIM_PENDING_REVIEW` (soumission OTP distributeur)
  * `CLAIM_PENDING_REVIEW` $\rightarrow$ `CLAIMED` (approbation admin)
  * `CLAIM_PENDING_REVIEW` $\rightarrow$ `CLAIM_REJECTED` (rejet admin avec motif)
* **Garantie Anti-SIM Swap** : Le passage à `CLAIMED` requiert obligatoirement un second examen par l'administrateur, consigné dans `AuditLog`.
