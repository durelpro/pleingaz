# CR-003 — Lot 0 : état des lieux

- Date de l'inventaire : 2026-10-28 (UTC 02:43 à 02:51).
- Branche de travail : `docs/cr-003-acces-et-espaces`, créée depuis `master` @ `560bac7`.
- Portée : inventaire seul. Aucun fichier existant n'a été modifié. Aucun code n'a été touché.
- Convention (R2) : **CONSTATÉ** = observé par commande ; **RECOMMANDÉ** = proposition ; **À CONFIRMER** = décision PLEINGAZ.

---

## 1. Dépôt Git (CONSTATÉ)

| Commande | Résultat |
|---|---|
| `git status -sb` (avant branche) | `## master...origin/master` : propre, synchronisé |
| `git log --oneline \| head -1` | `560bac7 feat: precision geolocalisation WGS84, acces distributeur sans blocage kyc, flotte livreurs siege/distributeurs et design rouge Pleingaz avec photos reelles` |
| Branches distantes | `docs/cr-001-perimetre`, `docs/kb-ia`, `feat/phase-2-fondations` à `feat/phase-10-recette-livraison`, `feat/ameliorations-kyc-fidelite-geoloc` |
| `git merge-base --is-ancestor origin/docs/kb-ia master` | faux : `docs/kb-ia` **non fusionnée** |

Les 20 derniers commits montrent : Lots R1/R2 de CR-001 (docs), puis **Phases 2 à 10 implémentées et fusionnées** (`370e8e4` phase-2 … `d432b03` merge phase-10), puis 4 commits hors phases (KYC, fidélité, géolocalisation, design rouge).

**Conséquence majeure** : la Phase 2 n'est pas « non lancée » ; du code applicatif de production existe pour l'ensemble des phases. CR-003 doit donc proposer un **plan de migration du code** (section 9), sans le modifier avant validation.

## 2. Documentation (CONSTATÉ)

`ls docs/` : `00-master-prompt.md`, `01-audit.md`, `02-audit-final.md`, `02-cadrage-ux-roles.md`, `03-modele-donnees-etats.md`, `03b-machines-etats.md`, `03c-contraintes-modele-economique.md`, `04-architecture-technique.md`, `05a`, `05b`, `05c`, `06a`, `06b`, `06c`, `07-donnees-personnelles.md`, `08-tracabilite.md`, `10-phase1-cloture.md`, `11-questions-pour-pleingaz.md`, `12-cr001-specifications.md`, `DECISIONS.md`, `OPEN_QUESTIONS.md` (lien symbolique vers `11`), `00-sources/`, `prompts/`, `reports/`.

| Élément demandé | État constaté | Preuve |
|---|---|---|
| CR-001 (`docs/12`) | **Présent et appliqué** : ADR D5 à D10 marqués « IMPLÉMENTÉ & VALIDÉ » dans `DECISIONS.md` ; bloc X (48 lignes X-01 à X-06) dans `08` | `grep -cE '^\| *X-' docs/08-tracabilite.md` → 48 |
| CR-002 (`docs/13`) | **Absent** : aucun fichier `docs/13*`, aucune occurrence de « CR-002 » dans le dépôt | `ls docs/13*` → introuvable ; `grep -rn "CR-002" --include=*.md` → 0 |
| `docs/knowledge/` | **Absent de `master`**, présent uniquement sur la branche non fusionnée `docs/kb-ia` (7 fichiers + dialogues) | `git ls-tree -r --name-only origin/docs/kb-ia` |
| `docs/design/`, `design/` | Absents | `ls` → introuvable |
| `docs/00-sources/05-amendements-proprietaire.md` | Présent, sections D-01 à D-06 | `grep -n '^## ' …` |
| `docs/00-sources/site-capture/` | 16 captures PNG : **rapports PageSpeed Insights** de monpleingaz.com (4 oct. 2026), avec miniatures du site seulement | inspection visuelle |
| `legacy/` | **Répertoire vide** : le code de l'ancien site n'est pas dans le dépôt | `ls legacy` → vide |

Termes à remplacer ou harmoniser (occurrences par fichier, `grep -rEl`) :

| Terme | Fichiers |
|---|---|
| `OtpProvider` | `05b` uniquement (ligne 36). Absent de `04` et du plan Phase 2 (`06c`) |
| `SMS` | 17 fichiers dont `00-master-prompt`, `02`, `03`, `04`, `05a`, `05b`, `06a`, `06b`, `06c`, `07`, `08`, `12`, `11` |
| « sélecteur d'espace » | `02` §1 ligne 5 (« un seul compte … via un sélecteur d'espace ») ; mentions de « switch » dans `01`, `04`, `06b`, `07` |
| code de confirmation obligatoire | `02`, `03`, `03b` §7, `04` §10.5, `05a`, `05b`, `06a`, `12`, `DECISIONS` ADR D9.4 |
| `DeliveryFeeSchedule` | `03`, `05a`, `06a`, `11`, `DECISIONS`, `05-amendements` |
| `ACCOUNT_MANAGER`, `public_discovery` | 0 occurrence |

## 3. Code applicatif (CONSTATÉ)

| Élément | Constat |
|---|---|
| `apps/api` | NestJS ; modules : `ai`, `alerts`, `audit`, `auth`, `catalog`, `chat`, `dashboard`, `deliveries`, `distributor`, `inventory`, `invoices`, `notifications`, `orders`, `payments`, `prisma`, `search`, `users` |
| `apps/web` | Next.js (App Router) ; routes : `/`, `/account`, `/register`, `/search`, `/stores`, `/stores/[storeId]`, `/checkout`, `/chat`, `/support`, `/delivery`, `/distributor/apply`, `/distributor/onboarding`, `/distributor/inventory`, `/admin/login`, `/admin/dashboard`, `/admin/reports`, `/admin/knowledge`, `/admin/system` |
| `apps/web` middleware | **Aucun** (`src/middleware.ts` introuvable) : aucune protection de route côté serveur |
| `robots.txt` / `sitemap` | Absents |
| Schéma | `packages/database/prisma/schema.prisma` : 47 modèles, 22 énumérations, 980 lignes |
| Migrations | **Une seule** : `20261019_phase2_fondations_cr001/migration.sql`, qui crée 12 tables (CR-001 uniquement). `User`, `Order`, `Store`, `LoyaltyTransaction`, `HeatmapEvent`, `Review`… n'ont aucune migration (`grep -c` = 0) → historique de migrations incomplet (base vraisemblablement créée par `db push`, à vérifier) |
| Tests | 22 fichiers `*.spec.ts` / `*.e2e-spec.ts` |
| Seed | `packages/database/prisma/seed.ts` ; crée notamment `store-pleingaz-siege-officiel` |

### 3.1 Noms réels des rôles : trois listes divergentes

| Source | Rôles |
|---|---|
| `docs/02` §3 | `CUSTOMER`, `DISTRIBUTOR_STAFF`, `DISTRIBUTOR_OWNER`, `COURIER`, `SUPPORT_AGENT`, `LOGISTICS_MANAGER`, `DISTRIBUTOR_MANAGER`, `FINANCE_MANAGER`, `SUPER_ADMIN` (+ `ADMIN`) |
| `seed.ts` (base) | `CUSTOMER`, `DISTRIBUTOR`, `COURIER`, `LOGISTICS_MANAGER`, `FINANCE_MANAGER`, `SUPPORT_AGENT`, `CONTENT_MANAGER`, `ADMIN`, `SUPER_ADMIN` |
| `apps/api/src/auth/constants/roles.enum.ts` | `SUPER_ADMIN`, `ADMIN_SUPPORT`, `ADMIN_FINANCE`, `ADMIN_STOCK`, `DISTRIBUTOR`, `COURIER`, `CUSTOMER_B2C`, `CUSTOMER_B2B`, `CALL_CENTER_AGENT` |
| `@Roles(...)` littéraux | `'ADMIN'`, `'SUPPORT'`, `'FINANCE'`, `'LOGISTICS'` |

`ADMIN_FINANCE`, `ADMIN_STOCK`, `ADMIN_SUPPORT`, `'FINANCE'`, `'LOGISTICS'`, `'SUPPORT'` **n'existent pas dans le seed** : les routes concernées (paiements, reversements, factures, rapports) ne sont accessibles qu'à `SUPER_ADMIN` en pratique. `DISTRIBUTOR_MANAGER` (requis par CR-003) n'existe ni dans le seed ni dans le code. `ACCOUNT_MANAGER` n'existe nulle part.

### 3.2 Noms réels des entités (écarts doc ↔ schéma)

| Nom dans les documents / CR-003 | Nom réel dans le schéma | Remarque |
|---|---|---|
| `Setting` | `PlatformSettings` (singleton `id = "singleton"`, colonnes typées) | Pas de table clé/valeur versionnée ; CR-003 exige des réglages versionnés avec date d'effet |
| `DeliveryFeeSchedule` | `FeeSchedule` | Pas de type de livreur ni de bornes min/max |
| `DistributorDocument` (`03c` §1.11) | `StoreDocument` | |
| `DistributorProfile` (`03b` §2) | `Store` + `DistributorApplication` | |
| `PaymentTransaction`, `IdempotencyKey`, `PaymentWebhookEvent`, `InvoiceSequence` (`03c`) | absents (idempotence portée par `Payment.idempotencyKey`) | |
| `Session` | `Session` (`userAgent`, `ipAddress`, sans portail ni appareil) | |
| `AuditLog` | `AuditLog` (`action`, `entity`, `entityId`, `details`, `ipAddress`, `userAgent`) | Pas de `request_id` ni de portail |

### 3.3 États réels (énumérations du schéma)

- `OrderStatus` : `DRAFT, SUBMITTED, CONFIRMED, PREPARING, SHIPPED, DELIVERED, CANCELLED, FAILED`.
- `DeliveryStatus` : `PENDING, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, FAILED, CANCELLED` (aucun état de double confirmation ni de litige).
- `CourierStatus` : `PENDING, APPROVED, SUSPENDED, INACTIVE, REJECTED` ; pas de type de livreur (`PLEINGAZ_STAFF` / `DISTRIBUTOR_COURIER` / `INDEPENDENT`).
- `ApplicationStatus` : `DRAFT, PENDING, APPROVED, REJECTED, SUSPENDED`.
- `StockLevel` : `BON, MOYEN, FAIBLE, RUPTURE` (CR-003 parle de disponible / limité / rupture / information ancienne : correspondance à définir au Lot 1).
- `OrderType` : `B2C_PICKUP, B2C_DELIVERY, B2B_DISTRIBUTOR` ; pas de vente au comptoir.
- `PaymentMethod` : `CASH, MTN_MOMO, ORANGE_MONEY`.
- Absents : `AccountCase`, `CounterSale`, `Announcement*`, `AudienceGroup`, `VerificationChallenge`, `Device`, `PurchaseLimit*`, type de point de vente (`PLEINGAZ_DIRECT`).

## 4. `scripts/check-trace.sh` (CONSTATÉ)

- Version : en-tête « Contrôle de docs/08-tracabilite.md (v5) — LECTURE SEULE », 323 lignes.
- Exécution : `bash scripts/check-trace.sh > /tmp/cr003-trace-avant.txt` → **exit 0**.
- Totaux (section 16) : S 32, A 45, N 24, P 120, V 967, X 48. Section 15 : 0 incohérence ; section 14 : 0 ligne ; section 17 : minima S/A/N/P respectés.
- Le script n'a pas de contrôle spécifique pour X-11 à X-18 : les nouvelles lignes seront contrôlées par les règles génériques existantes (références 06c, phases).
- Références 06c existantes : `M01` à `M35`, `H01` à `H19`.

## 5. Écarts du code avec CR-003 et avec les règles absolues (CONSTATÉ)

Gravité : **C** critique (sécurité), **M** majeure (contraire à une décision), **m** mineure.

| # | Constat | Fichier | Règle / décision | Grav. |
|---|---|---|---|---|
| E1 | Mot de passe administrateur `admin123` codé en dur **dans le bundle client** ; « session » = `localStorage['pleingaz_admin_auth'] = 'true'` | `apps/web/src/app/admin/login/page.tsx` l.15-16 ; `components/admin/AdminAuthGuard.tsx` l.18 | D-11.4, C-05, 06a | C |
| E2 | Connexion par OTP fixe `'1234'` sans mot de passe | `apps/api/src/auth/auth.service.ts` l.26 | D-12, R-sécurité | C |
| E3 | Secret JWT de repli `fallback_secret_for_dev_only` | `auth/strategies/jwt.strategy.ts` | 06a, conventions (secrets) | C |
| E4 | `isPhoneVerified: true` à l'inscription sans aucune vérification | `auth.service.ts` l.119 | D-12.1 | C |
| E5 | Messages distincts : « Utilisateur introuvable », « OTP invalide », « Compte verrouillé jusqu'à … », « Un compte existe déjà avec ce numéro » → énumération de comptes | `auth.service.ts` l.21, 28, 59, 106 | D-11.5 | M |
| E6 | Lien vers `/admin/dashboard` depuis la page d'accueil publique | `apps/web/src/app/page.tsx` l.399 | D-11.4 | M |
| E7 | Recherche, magasins, catalogue accessibles sans session (`OptionalJwtAuthGuard`, pas de middleware web) | `search.controller.ts`, `catalog.controller.ts`, `apps/web` | D-11.1 | M |
| E8 | Jeton sans audience (portail) ; `/auth/me` renvoie les rôles et les profils distributeur et livreur à tout utilisateur | `auth.service.ts` `generateTokens`, `getMe` | D-11.5 | M |
| E9 | Un seul numéro (`User.phone`) ; pas de numéro secondaire | `schema.prisma` `User` | D-12.3 | M |
| E10 | Remise par code obligatoire ; aucun état de double confirmation | `DeliveryStatus`, `deliveries.service.ts` | D-17.1 | M |
| E11 | Barème unique `FeeSchedule` ; pas de 1 000 F PLEINGAZ ni de prix libres bornés | `FeeSchedule` | D-17.2, C-02 | M |
| E12 | « 100 points de bienvenue » crédités et `loyaltyPoints @default(100)` : valeur métier non fournie par le propriétaire | `auth.service.ts` l.125, 148 ; `schema.prisma` `CustomerProfile` | R1, règle D | M |
| E13 | `supportPhone` et `supportEmail` par défaut dans le schéma (numéro et adresse personnels) | `schema.prisma` `PlatformSettings` | R1, 07 | M |
| E14 | `Store.isVisible` et `isVerifiedBadge` à `true` par défaut | `schema.prisma` `Store` | R5 | M |
| E15 | Noms de rôles incohérents (§3.1) : contrôles d'accès partiellement inopérants | `roles.enum.ts`, `@Roles` | 02 §3 | M |
| E16 | Historique de migrations incomplet (§3) | `prisma/migrations` | conventions | M |
| E17 | Couleurs du code (`#D32F2F`, `#F57C00`, thème `#f97316`) et police Geist **différentes de la charte du site** (§6) | `apps/web/src/app/globals.css`, `layout.tsx`, `public/manifest.json` | D-13.1 | M |
| E18 | Icônes PWA référencées (`/icons/icon-192x192.png`, `512`) absentes de `public/` | `manifest.json` | m | m |

## 6. Charte graphique extraite (inventaire, CONSTATÉ)

Les captures de `site-capture/` étant des miniatures PageSpeed, l'extraction a été faite depuis les ressources publiques du site :

```
curl https://www.monpleingaz.com/                         -> 200, 464 o
curl https://www.monpleingaz.com/assets/index-DE2BJdTY.css -> 200, 32 063 o
curl https://www.monpleingaz.com/assets/index-CGpd8iEH.js  -> 200, 544 347 o
curl https://www.monpleingaz.com/logoprincipal.png         -> 200, 16 733 o, PNG 966 x 318 RGBA
Horodatage : 2026-10-28T02:47:36Z
sha256 index.html  a7ba1aaaec0691d8b655ce505916b0685f9597dc2e385c685dc0ff61459d949e
sha256 CSS         f3d0799595cb46b95dcbc69972815fce183b38fb5737a65f7b8e523557907510
sha256 JS          054d0b76bfd3946cea08ea62acebbf8542140f5ea08928cc1637efbc32591fd8
sha256 logo        8eadc9dcb7c3f36a10cb34110d9f4be1773acdf4eec3d11d84dffa50764ab81e
```

### 6.1 Logo (`logoprincipal.png`)
Mot « PLEINGAZ » en rouge, le « I » remplacé par une flamme jaune-orangé, sous-titre « Bouteilles toujours pleines ». Comptage des pixels opaques (Pillow) :

| Couleur | Pixels | Part |
|---|---|---|
| `#FF0000` (+ `#FE0000`, anticrénelage) | 76 500 | ≈ 91 % |
| `#FFB000` (flamme) | 6 983 | ≈ 9 % |

### 6.2 Couleurs du CSS public (Tailwind v3)
Fréquences `grep` : `#dc2626` (red-600) ×5, `#b91c1c` (red-700) ×3, `#991b1b` (red-800) ×3, `#7f1d1d` (red-900) ×2, `#ef4444`, `#f87171`, `#eab308` (yellow-500), gris `#f3f4f6`, `#e5e7eb`, `#9ca3af`, `#f9fafb`, textes `rgb(17 24 39)` (#111827), `rgb(55 65 81)`, `rgb(75 85 99)`.

Classes relevées dans le JS :
- En-tête principal : `bg-gradient-to-br from-red-700 via-red-600 to-yellow-500 text-white` (dégradé #b91c1c → #dc2626 → #eab308).
- Bouton principal : `bg-gradient-to-r from-red-600 to-red-700 … hover:from-red-700 hover:to-red-800`.
- Fond animé : `linear-gradient(270deg,#7f1d1d,#dc2626,#f87171,#ef4444,#991b1b)`.

### 6.3 Typographie
`@import "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap"` ; `font-family: Montserrat, sans-serif`. Pile système Tailwind en repli.

### 6.4 Ton et textes de marque (chaînes du JS public)
« Bouteilles Toujours Pleines » / « Always Full Cylinders » ; « Nos produits, votre énergie » / « Our products, your energy ». Bilingue FR/EN constaté. Le JS est le bundle de l'ancienne SPA (Vite) : ses autres textes pourront servir de source pour la page d'accueil (Lot 4), marqués « à valider par PLEINGAZ ».

### 6.5 Contrastes WCAG (calcul relatif de luminance WCAG 2.x, sur blanc)

| Couleur | Ratio | Texte normal AA (4,5) | Grand texte AA (3) |
|---|---|---|---|
| `#FF0000` (logo) | 4,00 | échec | ok |
| `#FFB000` (flamme) | 1,83 | échec | échec |
| `#dc2626` | 4,83 | ok | ok |
| `#b91c1c` | 6,47 | ok | ok |
| `#991b1b` | 8,31 | ok | ok |
| `#eab308` | 1,92 | échec | échec |
| `#111827` | 17,74 | ok | ok |

Lecture : le rouge du logo est réservé au logo et aux grands éléments ; le texte rouge utilisera `#dc2626` ou plus foncé (déjà présents dans le CSS du site, donc non inventés) ; le jaune ne porte jamais de texte. À formaliser au Lot 4, À CONFIRMER par PLEINGAZ.

## 7. Points à trancher au Lot 1 (issus de l'inventaire)

1. **CR-002 introuvable** : le registre demande de traiter « les points importés ne sont visibles que des acheteurs authentifiés ». Sans `docs/13`, je ne peux pas harmoniser CR-002 ; je propose de consigner l'exigence comme règle CR-003 autonome.
2. **Code existant** : CR-003 reste documentaire, mais les écarts E1 à E18 imposent un plan de migration ; E1 à E4 sont des failles exploitables dès qu'un environnement est exposé.
3. **Liste de rôles de référence** à fixer (trois listes divergentes).
4. **`Setting` versionné** vs `PlatformSettings` singleton.
5. **`docs/knowledge`** sur une branche non fusionnée : harmoniser sur cette branche ou attendre sa fusion.

## 8. Fichiers produits par le Lot 0
- `docs/reports/cr003-etat-des-lieux.md` (ce fichier). Aucune autre modification.

## 9. Plan de migration du code (RECOMMANDÉ, à valider ; aucune modification avant validation)

| Étape | Contenu | Écarts traités |
|---|---|---|
| M-0 (urgent, indépendant de CR-003) | Supprimer le mot de passe client `admin123`, l'OTP `1234`, le secret JWT de repli ; refuser le démarrage sans `JWT_SECRET` ; `isPhoneVerified=false` | E1-E4 |
| M-1 | Référentiel unique des rôles (seed = enum = docs), ajout `ACCOUNT_MANAGER`, `DISTRIBUTOR_MANAGER` ; migration de base complète (`prisma migrate diff` depuis vide) | E15, E16 |
| M-2 | Authentification CR-003 : `VerificationChannel` (`SimulatedChannel` d'abord), mot de passe + numéro WhatsApp, numéro secondaire, jeton à audience par portail, messages d'erreur uniformes, sessions et appareils | E5, E8, E9 |
| M-3 | Espaces séparés : groupes de routes par portail, middleware serveur, 404 inter-espaces, page d'accueil seule publique, retrait du lien admin | E6, E7 |
| M-4 | Limite d'achat, vente au comptoir, double confirmation, tarifs de livraison, `PLEINGAZ_DIRECT`, gestionnaire de compte, Infos | E10, E11 |
| M-5 | Données : retrait des 100 points et des coordonnées personnelles par défaut, `isVisible=false` par défaut | E12-E14 |
| M-6 | Alignement visuel sur la charte (jetons du Lot 4) | E17, E18 |

Chaque étape sera une phase distincte (plan → validation → code → tests → walkthrough), après clôture de CR-003.
