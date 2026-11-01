# CR-003 — T0 : État des Lieux et Inventaire Préliminaire

**Date** : 2026-11-01  
**Branche** : `feat/cr003-pack1`  
**Objectif** : Établir l'inventaire complet du socle existant, identifier les manques et formaliser le plan de déploiement Pack 1 (T1 à T7).

---

## 1. Diagnostic Git et Environnement

- **Branche active** : `feat/cr003-pack1` (alignée sur la dernière version de référence).
- **Historique** : 20 derniers commits intégrés, incluant les jalons fondamentaux des décisions souveraines D-11 à D-18.
- **Services d'infrastructure (Docker Compose)** :
  - `pleingaz-postgres` (PostGIS 14-3.4) : Opérationnel et sain (`healthy`), port `5432`.
  - `pleingaz-redis` (Redis 7 Alpine) : Opérationnel et sain (`healthy`), port `6379`.
- **Espaces applicatifs** :
  - `apps/api` (NestJS 10, Passport, JWT, Argon2, Throttler, WebSocket) : Présent, compilation `nest build` validée (Code 0), suite de tests Jest opérationnelle.
  - `apps/web` (Next.js 16 App Router, TypeScript strict, TailwindCSS) : Présent, structure des portails `/acheteur`, `/distributeur`, `/livreur`, routes staff masquées.
  - `packages/database` (Prisma 5.22, PostgreSQL) : Présent, client régénéré et fonctionnel.

---

## 2. Noms Réels des Entités, États et Rôles

Conformément à l'analyse de `docs/03-modele-donnees-etats.md`, `docs/03b-machines-etats.md` et `docs/02-cadrage-ux-roles.md` :

### 2.1 Entités Métier Principales
- **Identité & Accès** : `User`, `Role`, `Permission`, `RolePermission`, `UserRole`, `VerificationChallenge`, `DeviceFingerprint`, `AccountCase`, `CustomerProfile`, `DistributorProfile`, `StaffProfile`, `Session`, `MfaCredential`, `RecoveryCode`.
- **Réseau de Vente & Points de Distribution** : `DistributorApplication`, `DistributorDocument`, `Store`, `ImportBatch`, `ImportRecord`, `StoreClaim`, `StoreLocation`, `StoreHours`, `StoreStaff`.
- **Catalogue & Stocks** : `ProductCategory`, `Product`, `ProductPrice`, `PriceHistory`, `Inventory`, `InventoryUpdate`, `StockReservation`, `CylinderMovement`.
- **Commandes & Flux Physiques** : `Order`, `OrderItem`, `DistributorOrder`, `DistributorOrderItem`, `Delivery`, `Address`, `CounterSale`.
- **Logistique & Flotte** : `Courier`, `CourierZone`, `CourierAvailability`, `DeliveryAssignment`, `CashCollection`.
- **Finance & Grand Livre Immuable** : `Payment`, `PaymentTransaction`, `IdempotencyKey`, `PaymentWebhookEvent`, `Invoice`, `InvoiceItem`, `InvoiceSequence`, `CreditNote`, `Refund`, `Settlement`, `Payout`, `PayoutBatch`, `LedgerAccount`, `LedgerEntry`, `DeliveryFeeSchedule`.
- **Administration & Alertes** : `Setting`, `AuditLog`, `StockAlert`, `DemandAlert`, `InfoNotice`, `InfoNoticeRead`.

### 2.2 États des Machines à États
- **Statut Utilisateur / Compte** : `ACTIVE`, `LOCKED`, `SUSPENDED`, `PENDING_VERIFICATION`.
- **Statut de Commande (`Order`)** : `DRAFT`, `PENDING`, `ACCEPTED`, `ASSIGNED`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`, `CANCELLED`, `FAILED`.
- **Défi de Preuve Entrante (`VerificationChallenge`)** : `PENDING`, `VERIFIED`, `EXPIRED`, `CONSUMED`.
- **Dossier d'Assistance (`AccountCase`)** : `OPEN`, `PROPOSED`, `ADMIN_APPROVED`, `APPLIED`, `CLOSED`.
- **Niveaux Qualitatifs de Stock** : `BON`, `MOYEN`, `FAIBLE`, `RUPTURE`.
- **Dossier Distributeur KYC** : `DRAFT`, `SUBMITTED`, `IN_REVIEW`, `APPROVED`, `REJECTED`, `SUSPENDED`.

### 2.3 Rôles et Espaces
- **Types d'espaces étanches** : `CUSTOMER`, `DISTRIBUTOR`, `COURIER`, `ACCOUNT_MANAGER`, `STAFF`.
- **Rôles applicatifs** : `CUSTOMER`, `DISTRIBUTOR_OWNER`, `DISTRIBUTOR_STAFF`, `COURIER`, `ACCOUNT_MANAGER`, `LOGISTICS_MANAGER`, `FINANCE_MANAGER`, `SUPPORT_AGENT`, `CONTENT_MANAGER`, `ADMIN`, `SUPER_ADMIN`.

---

## 3. Ce qui Existe vs Ce qui Manque pour le Pack 1

| Composant | État Actuel | Action / Manque à Combler |
|---|---|---|
| **Schéma BDD & Contraintes** | Schéma riche existant | Aligner les contraintes strictes T1 : `space_type` sur `User`, `whatsapp_e164` UNIQUE, CHECK SQL `secondary_e164 != whatsapp_e164`, triggers d'interdiction DELETE/UPDATE sur `AuditLog`. |
| **API Preuve Entrante WhatsApp** | Implémentée partiellement dans `whatsapp-auth.service.ts` | Aligner les routes standardisées T2 (`/auth/register/start`, `/challenges/:id/status`, simulation locale sécurisée). |
| **Design System & Landing** | Palette rouge/jaune et Montserrat en place | Finaliser les jetons stricts (CSS variables), `baseline.md`, `optimisation-vs-existant.md` (T3). |
| **Tableau de Bord Acheteur** | Éléments de tableau de bord présents | Jauge quota 30 jours (5 bouteilles) connectée au serveur, navigation 5 entrées étanche R-01 (T4). |
| **Control Center & Annonces** | Contrôleurs admin existants | Protection TOTP stricte, URL masquée `STAFF_PORTAL_PATH`, module Infos avec ciblage et accusé de lecture (T5). |
| **Profil Gestionnaire de Compte** | Entité `AccountCase` déclarée | Endpoints `ACCOUNT_MANAGER` sans mutation directe ni impersonation (T6). |
| **Preuve d'Isolation & CI** | Guards 404 opérationnels | Suite de tests automatisée anti-fuite (R-01) et vérification d'invisibilité (T7). |

---

## 4. Conclusion du Diagnostic T0

Le socle technique et les dépendances sont consolidés. Les tests de base passent et la base de données PostgreSQL 16 PostGIS est saine. Le plan de travail T1 à T7 est immédiatement déclenché.
