# CR-002 — Lot 0 : état des lieux du système

Date : 2026-10-21. Branche : `feat/cr-002-import-reseau` (créée depuis `master` @ `560bac7`).
Ce rapport ne contient que des constats, comptages et identifiants techniques. Aucun nom, aucun numéro.

## 1. Dépôt Git

| Contrôle | Commande | Résultat |
|---|---|---|
| Synchronisation | `git status -sb` (sur master) | `## master...origin/master` (pas d'avance) |
| Modifications non commitées héritées | idem | 4 fichiers : `apps/api/test/cr001-lifecycle.e2e-spec.ts`, `apps/web/src/app/page.tsx`, `apps/web/src/components/distributor/InventoryList.tsx`, `packages/database/prisma/seed.ts` (voir §8) |
| Dernier commit | `git log --oneline \| head -20` | `560bac7` ; tag `v1.0.0-cr001` sur `ad28a39` |
| Fichiers sensibles suivis | `git ls-files \| grep -iE "\.km[lz]\|data/private"` | aucune sortie (code 1) |
| `data/private/` ignoré | `git check-ignore -v data/private/imports/x.kmz` | **Avant Lot 0 : NON ignoré.** Corrigé dans ce lot (`.gitignore` : `data/private/`, `*.kml`, `*.kmz`) |

## 2. CR-001

| Élément | Constat |
|---|---|
| `docs/12-cr001-specifications.md` | présent (42 430 octets) |
| `docs/00-sources/05-amendements-proprietaire.md` | présent ; dernier identifiant `X-06.10` |
| Matrice `docs/08-tracabilite.md` | X : 48 lignes ; dernier `X-06.10` |
| `docs/06c` | M01..M35, H01..H19 |
| Décisions D-01 à D-06 | `DECISIONS.md` : statut « IMPLÉMENTÉ & VALIDÉ » |

**CR-001 est appliqué** → CR-002 prolonge `05-amendements` à partir de `X-07.01`, 06c à partir de `M36`/`H20`.

## 3. Code et base de données

| Élément | Constat |
|---|---|
| `apps/api` (NestJS) | présent ; modules : ai, alerts, audit, auth, catalog, chat, dashboard, deliveries, distributor, inventory, invoices, notifications, orders, payments, prisma, search, users |
| `apps/web` (Next.js 16.4) | présent ; 18 routes `page.tsx` |
| Schéma | `packages/database/prisma/schema.prisma` (981 lignes, extensions `postgis, pg_trgm, unaccent`) |
| Migrations versionnées | 1 seule : `20261019_phase2_fondations_cr001` |
| Base locale | conteneur `pleingaz-postgres` (postgis 14-3.4), base `pleingaz_db` ; **table `_prisma_migrations` absente** : le schéma a été créé par `prisma db push` (session du 2026-10-21), pas par les migrations |
| Préfixe API | aucun `setGlobalPrefix` dans `main.ts` → les routes ne sont pas sous `/api/v1` |
| Configuration | `apps/api/.env` pointe vers la base `pleingaz` (inexistante dans le conteneur) ; `packages/database/.env` vers `pleingaz_db` : incohérence à résoudre |

### Noms réels à utiliser pour CR-002

| Nom générique du CR | Nom réel dans le code | Écart bloquant pour CR-002 |
|---|---|---|
| DistributorProfile / Store | **`Store`** (`DistributorProfile` n'existe que dans docs/03 et 03b) | `ownerId` **NOT NULL** (D-08.3 exige NULL) ; `city`, `neighborhood` **NOT NULL** (P4 exige NULL si absent) |
| DistributorApplication | `DistributorApplication` | `userId` **requis et unique** → impossible de créer une candidature APPROVED sans compte (D-07.1 / D-08.3) |
| DistributorDocument | `StoreDocument` (types `ID_CARD_FRONT`, `ID_CARD_BACK`, `PORTRAIT_PHOTO`, `SHOP_PHOTO`) | — |
| Inventory | `Inventory` (`level` `BON/MOYEN/FAIBLE/RUPTURE`, défaut `RUPTURE`, `lastConfirmedAt` défaut `now()`) | les défauts fabriquent une fraîcheur fictive si une ligne est créée sans déclaration |
| Setting | `PlatformSettings` (singleton) | — |
| AuditLog | `AuditLog` (`action`, `entity`, `entityId`, `details` JSON) | — |
| États de candidature | `ApplicationStatus` : DRAFT, PENDING, APPROVED, REJECTED, SUSPENDED | docs/02 cite UNDER_REVIEW (absent du code) |
| Coordonnées | `latitude`/`longitude` Float | aucune colonne `geography`, aucun index géographique, aucun CHECK de bornes |
| `is_demo` | **absent du schéma** | DECISIONS (ADR D7) l'affirme, le code ne l'a pas |
| TOTP | **absent** (schéma et `apps/api/src`) | D-10 et ADR D10 l'exigent |
| Permissions | modèles `Permission`/`RolePermission` présents mais **aucune permission semée** ; `roles.guard.ts` contrôle des rôles | D-10.5 exige des permissions |
| Rôles | seed : CUSTOMER, DISTRIBUTOR, COURIER, LOGISTICS_MANAGER, FINANCE_MANAGER, SUPPORT_AGENT, CONTENT_MANAGER, ADMIN, SUPER_ADMIN | docs/02 §171 cite DISTRIBUTOR_STAFF, DISTRIBUTOR_OWNER, DISTRIBUTOR_MANAGER : divergence doc/code |

### Logique existante en conflit avec D-07

| Fichier | Constat |
|---|---|
| `schema.prisma` `Store` | `isVerifiedBadge @default(true)`, `isVisible @default(true)` : une boutique créée sans précision est visible et « vérifiée » |
| `distributor.admin.service.ts:238` | `toggleStoreVisibility` force `isVerifiedBadge = isVisible` : rendre visible = déclarer vérifié |
| `distributor.admin.service.ts:46,139` | approbation → `isVerifiedBadge: true` |
| `search.service.ts:92,109` | filtre public = `isVisible = true` uniquement |

## 4. Documents

Présents : 01, 02-audit-final, 02-cadrage-ux-roles, 03, 03b, 03c, 04, 05a, 05b, 05c, 06a, 06b, 06c, 07, 08, 10, 11, 12, DECISIONS ; `OPEN_QUESTIONS.md` → lien symbolique vers `11-questions-pour-pleingaz.md`. `docs/knowledge/` : **absent**.

## 5. scripts/check-trace.sh (v5, 323 lignes) — base avant CR-002

Commande : `bash scripts/check-trace.sh` (code 0). Section 17 : `ok S : 32`, `ok A : 45`, `ok N : 24`, `ok P : 120`.
Anomalies **préexistantes** (référence ; CR-002 ne doit pas en ajouter) :
- §3 : 8 statuts « À CONFIRMER » (A-07..A-11, A-13, A-31, A-32) ;
- §9 : 161 lignes MVP sans référence M<nn> (dont S-01..S-15) ;
- §11 : 2 doublons signalés en section 42 (V-42.03, libellé vide).

## 6. Fichier source CR-002

`data/private/imports/` : **n'existait pas ; aucun fichier KML/KMZ présent.** Profilage (P2) **non réalisé**. Il le sera dès le dépôt du fichier exporté de Google My Maps.

## 7. Mode retenu : **MODE A**

Le code (API NestJS, Prisma, PostgreSQL/PostGIS) et une base locale existent. Mais quatre prérequis doivent être traités avant toute écriture :
1. **Socle de migrations** : la base a été créée par `db push` ; il faut une migration de rattrapage (baseline) avant la migration CR-002.
2. **Contraintes du modèle** : `Store.ownerId`, `Store.city`, `Store.neighborhood`, `DistributorApplication.userId` doivent devenir nullables.
3. **Défauts dangereux** : `isVerifiedBadge`/`isVisible` à `true` par défaut, et le couplage visibilité = badge.
4. **Contrôles absents** : TOTP, permissions granulaires, `is_demo`.

## 8. Écarts introduits lors de la session précédente (non commités) — à décider

Constat honnête sur le travail non commité du 2026-10-21 (correction du catalogue) :
- `seed.ts` : les **prix distributeur** (`distributorPrice`) et les **poids des accessoires** ne viennent d'aucune source (le site ne publie que les prix publics) → contraire à R1.
- `page.tsx` : catalogue d'accueil **codé en dur** (pas lu en base) ; photos réutilisées pour des produits différents (6 kg et 50 kg affichent la photo 12,5 kg ; tuyau = photo détendeur ; brûleur = photo réchaud) ; sous-titres et badges marketing rédigés sans source.
- Base locale : un rôle PostgreSQL `pleingaz` **SUPERUSER** a été créé dans le conteneur de dev pour lancer le seed (privilège excessif).
- Seed du commit `ad28a39` (déjà sur master) : boutique « siège » avec adresse, coordonnées et numéro WhatsApp **sans source** dans `docs/`, et stock `BON` daté de `now()` → stock inventé.

Ces fichiers ne sont **pas** inclus dans les commits CR-002.
