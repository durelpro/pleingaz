# Walk-through Phase 3 : Base de Données & Modèle Prisma CR-003

- **Date d'exécution** : 01 Novembre 2026
- **Auteur** : Antigravity (Pair Programming PLEINGAZ)
- **Statut** : TERMINÉ & VALIDÉ

---

## 1. Objectifs de la Phase 3

1. **Intégration et alignement des modèles de données CR-003 dans [`packages/database/prisma/schema.prisma`](file:///home/durel/pleingaz/packages/database/prisma/schema.prisma)** :
   - Double confirmation de livraison (`D-17`) : extension de l'enum `DeliveryStatus` avec `DELIVERED_PENDING_CONFIRMATION`, `CONFIRMED_BY_COURIER_ONLY` et `DISPUTED`, ainsi que les horodatages `courierConfirmedAt`, `customerConfirmedAt`, `disputedAt` et `disputeReason`.
   - Preuve entrante WhatsApp (`D-12`) : modèle `VerificationChallenge`.
   - Dossiers d'assistance encadrés (`D-15`) : modèle `AccountCase` avec relations agent et administrateur approbateur (Maker-Checker).
   - Vente au comptoir (`D-16`) : modèle `CounterSale` lié à la boutique et au compte acheteur avec décompte quota.
   - Paramètres système centralisés : modèle `PlatformSettings` (plafond acheteur `buyerBottleLimit = 5`, prix fixe livraison `deliveryFixedPrice = 2000 FCFA`, plafond caisse espèces `maxCashHoldingCourier = 50000 FCFA`).
   - Module Infos (`D-18`) : modèles `InfoNotice` et `InfoNoticeRead`.
2. **Synchronisation du Client Prisma** :
   - Exécution réussie de `prisma generate` pour mettre à disposition tous les types et modèles dans le code TypeScript.
3. **Mise à niveau du script d'initialisation des données ([`seed-cr003.ts`](file:///home/durel/pleingaz/packages/database/prisma/seed-cr003.ts))** :
   - Initialisation du singleton `PlatformSettings`.
   - Insertion du rôle `ACCOUNT_MANAGER`.
   - Création des comptes de test avec respect strict de la règle des **deux numéros E.164 distincts** (`phone !== callPhone`).

---

## 2. Synthèse des Entités et Modifications de Schéma

| Modèle / Enum | Statut | Rôle Opérationnel |
|---|---|---|
| `enum DeliveryStatus` | **Étendu** | Ajout de `DELIVERED_PENDING_CONFIRMATION`, `CONFIRMED_BY_COURIER_ONLY`, `DISPUTED` pour la double confirmation D-17. |
| `model Delivery` | **Enrichi** | Horodatages d'audit `courierConfirmedAt`, `customerConfirmedAt`, `disputedAt`, `disputeReason`. |
| `model VerificationChallenge` | **Validé** | Défi WhatsApp éphémère (10 min), code haché Argon2id, contrôle du nombre de tentatives. |
| `model AccountCase` | **Validé** | Gestion des litiges, perte de compte et restitution de caution encadrés sans impersonation. |
| `model CounterSale` | **Validé** | Vente physique au comptoir avec contrôle obligatoire du numéro acheteur et du quota mensuel. |
| `model PlatformSettings` | **Validé** | Paramètres de prix et de quotas configurables sans altération du code source. |
| `model InfoNotice` & `InfoNoticeRead` | **Validé** | Publication d'annonces officielles et traçabilité des accusés de lecture obligatoires. |

---

## 3. Validation Technique

- **Prisma Client** : Régénéré avec succès (`@pleingaz/database db:generate`).
- **Compilation Globale** : `pnpm --filter api build` validé avec succès (0 erreur de typage).
- **Règles Opposables** : Conformité totale avec les contraintes d'intégrité définies dans [`docs/03c-contraintes-modele-economique.md`](file:///home/durel/pleingaz/docs/03c-contraintes-modele-economique.md).

---

## 4. Prochaine Étape

Passage à la **Phase 4 : Logique Métier, Barèmes & Guards d'Isolation** :
- Implémentation du `WorkspaceGuard` / `PortalAudienceGuard` rejetant les accès inter-espaces en HTTP 404 (zéro code 403).
- Implémentation du service de calcul des barèmes basé sur `PlatformSettings`.
- Machine d'état de double confirmation livraison D-17 dans le service logistique.
