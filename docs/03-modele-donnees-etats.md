# Inventaire des Entités et ERD

Ce document dresse l'inventaire complet des entités du domaine et présente le modèle relationnel. Aucune donnée métier réelle de l'audit préliminaire n'est utilisée.

## 1. Inventaire Complet des Entités

| Domaine | Entité | Description | Clés / Relations | Données Sensibles |
|---|---|---|---|---|
| **Accès** | `User` | Compte utilisateur unique par téléphone | Clé: `id`, `phone_number` | Oui |
| **Accès** | `Role` | Rôle (ensemble de permissions) | Clé: `id` | Non |
| **Accès** | `Permission` | Permission granulaire | Clé: `id` | Non |
| **Accès** | `RolePermission` | Association Rôle-Permission | FK: `role_id`, `permission_id` | Non |
| **Accès** | `UserRole` | Rôle d'un utilisateur sur un scope (ex: une boutique) | FK: `user_id`, `role_id`, scope | Non |
| **Accès** | `CustomerProfile` | Profil d'un client | FK: `user_id` | Oui (Données pers.) |
| **Accès** | `DistributorProfile` | Profil d'un distributeur propriétaire | FK: `user_id` | Oui |
| **Accès** | `StaffProfile` | Profil d'un employé PLEINGAZ | FK: `user_id` | Oui |
| **Accès** | `Session` | Session de connexion | FK: `user_id` | Oui (Token) |
| **Accès** | `MfaCredential` | Identifiant TOTP (double facteur) | FK: `user_id` | Oui |
| **Accès** | `RecoveryCode` | Code de secours MFA | FK: `user_id` | Oui |
| **Réseau** | `DistributorApplication` | Dossier de candidature | FK: `distributor_id` | Oui |
| **Réseau** | `DistributorDocument` | Pièce justificative KYC restreinte aux 3 types : `ID_CARD_FRONT`, `ID_CARD_BACK`, `PORTRAIT_PHOTO`, `SHOP_PHOTO` (CR-001 D-04) | FK: `distributor_id` | Oui (CNI, etc.) |
| **Réseau** | `Store` | Boutique physique (un distributeur peut en avoir 0..N) | FK: `distributor_id` | Non |
| **Réseau** | `StoreLocation` | Coordonnées géographiques de la boutique | FK: `store_id` | Non |
| **Réseau** | `StoreHours` | Horaires d'ouverture | FK: `store_id` | Non |
| **Réseau** | `StoreStaff` | Sous-compte pour le personnel de la boutique | FK: `store_id`, `user_id` | Oui |
| **Logistique** | `Courier` | Livreur plateforme indépendant supervisé par l'administration (CR-001 D-05) | FK: `user_id` | Oui |
| **Logistique** | `CourierZone` | Zone géographique d'intervention déclarée du livreur | FK: `courier_id` | Non |
| **Logistique** | `CourierAvailability` | Disponibilité opérationnelle en temps réel (en ligne / hors ligne) | FK: `courier_id` | Non |
| **Logistique** | `DeliveryAssignment` | Proposition, timeout et acceptation d'une mission de livraison | FK: `delivery_id`, `courier_id` | Non |
| **Logistique** | `CashCollection` | Suivi des espèces collectées à la livraison et créance envers PLEINGAZ | FK: `delivery_id`, `courier_id` | Oui (Fonds) |
| **Catalogue** | `ProductCategory` | Catégorie de produit officiel PLEINGAZ (ex: 12.5kg, Accessoires) | Clé: `id` | Non |
| **Catalogue** | `Product` | Produit du catalogue officiel PLEINGAZ (zéro marque tierce - CR-001 D-01) | FK: `category_id` | Non |
| **Catalogue** | `ProductPrice` | Tarification officielle centralisée avec validité temporelle (Maker-Checker) | FK: `product_id` | Non |
| **Catalogue** | `PriceHistory` | Historique audité et opposable des changements de prix catalogue | FK: `product_id` | Non |
| **Catalogue** | `StoreProductOffer` | *Déclassé / inactif* : les prix sont obligatoirement nationaux (CR-001 D-01) | FK: `store_id`, `product_id` | Non |
| **Stock** | `Inventory` | Déclaration qualitative du stock (`BON`/`MOYEN`/`FAIBLE`/`RUPTURE`) | FK: `store_id`, `product_id` | Non |
| **Stock** | `InventoryUpdate` | Historique des déclarations de stock avec horodatage de fraîcheur | FK: `inventory_id` | Non |
| **Stock** | `StockReservation` | Blocage temporaire d'une unité pour une commande | FK: `order_id`, `product_id`, `store_id` | Non |
| **Stock** | `CylinderMovement` | Traçabilité et gestion des consignes (Entrées/Sorties de bouteilles) | FK: `store_id`, `order_id` | Non |
| **Commande** | `Order` | Commande passée par un client | FK: `customer_id`, `store_id` | Oui |
| **Commande** | `OrderItem` | Ligne de la commande client (strictement liée à `Product`) | FK: `order_id`, `product_id` | Non |
| **Commande** | `DistributorOrder` | Commande passée par un distributeur à un grossiste | FK: `distributor_id` | Non |
| **Commande** | `DistributorOrderItem`| Ligne de la commande distributeur | FK: `distributor_order_id`, `product_id`| Non |
| **Commande** | `Delivery` | Processus de livraison avec code de confirmation client obligatoire | FK: `order_id`, `courier_id` | Oui (GPS) |
| **Commande** | `Address` | Adresse et repère texte pour la livraison locale | FK: `user_id` | Oui |
| **Finance** | `Payment` | Tentative ou succès de règlement | FK: `order_id` | Oui |
| **Finance** | `PaymentTransaction` | Traçabilité technique et frais de l'opérateur (fee_bearer) | FK: `payment_id` | Oui |
| **Finance** | `IdempotencyKey` | Verrou contre les double-paiements | FK: `payment_id` | Non |
| **Finance** | `PaymentWebhookEvent` | Trace pour rejeu des webhooks opérateurs | Clé: `event_hash` | Non |
| **Finance** | `Invoice` | Facture globale de la commande émise par la plateforme | FK: `order_id`, `vendor_id` | Non |
| **Finance** | `InvoiceItem` | Ligne de la facture | FK: `invoice_id` | Non |
| **Finance** | `InvoiceSequence` | Compteur de numérotation séquentielle par vendeur | Clé: `vendor_id` | Non |
| **Finance** | `CreditNote` | Avoir d'annulation ou de remboursement (Immuable) | FK: `invoice_id` | Non |
| **Finance** | `Refund` | Remboursement d'un paiement (ex: LATE_SUCCESS) | FK: `payment_id` | Oui |
| **Finance** | `Settlement` | Processus de règlement des créances/dettes | FK: `vendor_id` | Non |
| **Finance** | `Payout` | Virement individuel de reversement | FK: `settlement_id` | Non |
| **Finance** | `PayoutBatch` | Lot de reversement groupé validé en Maker-Checker (CR-001 D-06) | Clé: `id` | Non |
| **Finance** | `LedgerAccount` | Compte du grand livre immuable (Actif, Passif, Charge, Produit) | Clé: `id`, `code` | Non |
| **Finance** | `LedgerEntry` | Écriture à partie double immuable (`SUM(debit)==SUM(credit)`) | FK: `account_id`, `entry_group_id` | Non |
| **Finance** | `DeliveryFeeSchedule` | Barème versionné des frais de livraison et commissions | Clé: `id` | Non |
| **CRM** | `Conversation` | Fil de discussion (Support ou Distributeur/Client) | Clé: `id` | Oui |
| **CRM** | `Message` | Message dans une conversation | FK: `conversation_id` | Oui |
| **CRM** | `Notification` | Alerte utilisateur (App/Email/SMS) | FK: `user_id` | Oui |
| **CRM** | `NotificationPreference`| Préférences et opt-in de notification | FK: `user_id` | Non |
| **CRM** | `Review` | Avis laissé par le client | FK: `order_id`, `store_id` | Non |
| **CRM** | `Favorite` | Boutique ou produit favori | FK: `user_id` | Non |
| **CRM** | `SupportTicket` | Demande d'assistance | FK: `user_id` | Oui |
| **CRM** | `KnowledgeDocument` | Fiche d'aide (ex: sécurité gaz) | Clé: `id` | Non |
| **CRM** | `Report` | Signalement ou litige | FK: `reporter_id`, `order_id` | Oui |
| **Analytics**| `SearchEvent` | Recherches géographiques anonymisées (coarse_area, zéro GPS exact) | Clé: `id` | Non |
| **Analytics**| `AuditLog` | Trace d'une action sensible immuable | FK: `user_id` | Oui |
| **Analytics**| `StockAlert` | Alerte seuil de stock déclenchée | FK: `store_id`, `product_id` | Non |
| **Analytics**| `DemandAlert` | Alerte de rupture (demande insatisfaite) | FK: `store_id`, `product_id` | Non |
| **Analytics**| `Promotion` | Règle de réduction gouvernée exclusivement par l'Admin | Clé: `id` | Non |
| **Analytics**| `LoyaltyAccount` | Compte de points de fidélité | FK: `user_id` | Non |
| **Analytics**| `LoyaltyTransaction` | Gain ou dépense de points | FK: `loyalty_account_id` | Non |
| **Admin** | `Setting` | Paramètres applicatifs (délais, plafonds de caisse, rayons) | Clé: `key` | Non |

*Entités neutralisées / ajustées : L'entité `StoreProductOffer` est déclassée au profit du catalogue centralisé `ProductPrice`. `Courier` devient une entité autonome de premier rang rattachée à `User` (CR-001 D-05). Le grand livre immuable `LedgerAccount` / `LedgerEntry` est introduit pour la rigueur financière (CR-001 D-06).*

---

## 2. Diagrammes d'Entité-Relation (ERD)

### 2.1 ERD Global Simplifié
```mermaid
erDiagram
    USER ||--o{ CUSTOMER_PROFILE : "is"
    USER ||--o{ DISTRIBUTOR_PROFILE : "is"
    DISTRIBUTOR_PROFILE ||--o{ STORE : "owns"
    STORE ||--o{ INVENTORY : "tracks"
    ORDER ||--|{ ORDER_ITEM : "contains"
    ORDER ||--o| INVOICE : "generates"
    PAYMENT ||--|{ PAYMENT_TRANSACTION : "executes"
```

### 2.2 ERD 1 : Utilisateurs, Accès et Profils
```mermaid
erDiagram
    USER {
        int id PK
        string phone_number
    }
    ROLE {
        int id PK
        string name
    }
    PERMISSION {
        int id PK
        string action
    }
    USER_ROLE {
        int user_id FK
        int role_id FK
        string scope_type
        int scope_id
    }
    ROLE_PERMISSION {
        int role_id FK
        int permission_id FK
    }
    SESSION {
        int id PK
        int user_id FK
    }
    MFA_CREDENTIAL {
        int id PK
        int user_id FK
    }
    RECOVERY_CODE {
        int id PK
        int user_id FK
    }
    USER ||--o{ USER_ROLE : "has"
    ROLE ||--o{ USER_ROLE : "assigned_to"
    ROLE ||--o{ ROLE_PERMISSION : "includes"
    PERMISSION ||--o{ ROLE_PERMISSION : "part_of"
    USER ||--o{ SESSION : "starts"
    USER ||--o| MFA_CREDENTIAL : "secures"
    USER ||--o{ RECOVERY_CODE : "has"
```

### 2.3 ERD 2 : Réseau et Distributeurs
```mermaid
erDiagram
    DISTRIBUTOR_PROFILE {
        int id PK
        int user_id FK
    }
    STORE {
        int id PK
        int distributor_id FK
    }
    STORE_LOCATION {
        int id PK
        int store_id FK
        geometry point
    }
    STORE_HOURS {
        int id PK
        int store_id FK
    }
    STORE_STAFF {
        int user_id FK
        int store_id FK
    }
    DISTRIBUTOR_APPLICATION {
        int id PK
        int distributor_id FK
    }
    DISTRIBUTOR_DOCUMENT {
        int id PK
        int distributor_id FK
        string document_type
    }
    COURIER {
        int id PK
        int user_id FK
        string status
        string vehicle_type
    }
    COURIER_ZONE {
        int id PK
        int courier_id FK
        string city
        string area_name
    }
    COURIER_AVAILABILITY {
        int courier_id PK_FK
        boolean is_online
        timestamp last_seen_at
    }
    DISTRIBUTOR_PROFILE ||--o{ STORE : "owns"
    STORE ||--o| STORE_LOCATION : "has"
    STORE ||--o{ STORE_HOURS : "opens_during"
    STORE ||--o{ STORE_STAFF : "employs"
    DISTRIBUTOR_PROFILE ||--o| DISTRIBUTOR_APPLICATION : "submits"
    DISTRIBUTOR_PROFILE ||--o{ DISTRIBUTOR_DOCUMENT : "provides_3_docs_only"
    USER ||--o| COURIER : "operates_as"
    COURIER ||--o{ COURIER_ZONE : "covers"
    COURIER ||--o| COURIER_AVAILABILITY : "tracks"
```

### 2.4 ERD 3 : Catalogue et Stock (CR-001 D-01)
```mermaid
erDiagram
    PRODUCT {
        int id PK
        int category_id FK
        string name
        string sku
    }
    PRODUCT_PRICE {
        int id PK
        int product_id FK
        int public_price
        int distributor_price
        string status
    }
    PRICE_HISTORY {
        int id PK
        int product_id FK
        int old_price
        int new_price
        timestamp changed_at
    }
    INVENTORY {
        int store_id FK
        int product_id FK
        string status
        timestamp last_updated_at
    }
    INVENTORY_UPDATE {
        int id PK
        int inventory_id FK
        string old_status
        string new_status
    }
    STOCK_RESERVATION {
        int id PK
        int store_id FK
        int product_id FK
        timestamp expires_at
    }
    CYLINDER_MOVEMENT {
        int id PK
        int store_id FK
        string type
    }
    PRODUCT ||--o{ PRODUCT_PRICE : "official_price"
    PRODUCT ||--o{ PRICE_HISTORY : "price_audit"
    PRODUCT ||--o{ INVENTORY : "stocked_as_qualitative"
    INVENTORY ||--o{ INVENTORY_UPDATE : "logged_in"
    PRODUCT ||--o{ STOCK_RESERVATION : "reserved_in"
    STORE ||--o{ CYLINDER_MOVEMENT : "exchanges"
```
*Note : L'entité historique `STORE_PRODUCT_OFFER` est neutralisée : les prix sont exclusivement gouvernés par `PRODUCT_PRICE` centralisé (CR-001 D-01).*

### 2.5 ERD 4 : Commandes et Livraison (CR-001 D-05)
```mermaid
erDiagram
    ORDER {
        int id PK
        int customer_id FK
        int store_id FK
        int total_amount
    }
    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int unit_price
    }
    DISTRIBUTOR_ORDER {
        int id PK
        int distributor_id FK
    }
    DISTRIBUTOR_ORDER_ITEM {
        int id PK
        int distributor_order_id FK
        int product_id FK
    }
    DELIVERY {
        int id PK
        int order_id FK
        int courier_id FK
        string status
        string confirmation_code
    }
    DELIVERY_ASSIGNMENT {
        int id PK
        int delivery_id FK
        int courier_id FK
        string status
        timestamp timeout_at
    }
    CASH_COLLECTION {
        int id PK
        int delivery_id FK
        int courier_id FK
        int amount
        string status
    }
    ADDRESS {
        int id PK
        int user_id FK
        string text_landmark
    }
    ORDER ||--|{ ORDER_ITEM : "contains"
    DISTRIBUTOR_ORDER ||--|{ DISTRIBUTOR_ORDER_ITEM : "contains"
    ORDER ||--o| DELIVERY : "shipped_via"
    ORDER ||--o| ADDRESS : "delivered_to"
    DELIVERY ||--o{ DELIVERY_ASSIGNMENT : "assigned_through"
    COURIER ||--o{ DELIVERY_ASSIGNMENT : "receives"
    DELIVERY ||--o| CASH_COLLECTION : "encashes"
    COURIER ||--o{ CASH_COLLECTION : "holds"
```

### 2.6 ERD 5 : Paiements, Factures, Grand Livre et Reversements (CR-001 D-06)
```mermaid
erDiagram
    PAYMENT {
        int id PK
        int order_id FK
        int amount
    }
    PAYMENT_TRANSACTION {
        int id PK
        int payment_id FK
        string provider
    }
    PAYMENT_WEBHOOK_EVENT {
        string event_hash PK
    }
    IDEMPOTENCY_KEY {
        string key PK
        int payment_id FK
    }
    INVOICE {
        int id PK
        int order_id FK
        int total_amount
    }
    INVOICE_ITEM {
        int id PK
        int invoice_id FK
    }
    CREDIT_NOTE {
        int id PK
        int invoice_id FK
    }
    REFUND {
        int id PK
        int payment_id FK
    }
    PAYOUT_BATCH {
        int id PK
        string status
        int total_amount
        int created_by FK
        int approved_by FK
    }
    PAYOUT {
        int id PK
        int payout_batch_id FK
        int recipient_id FK
        int amount
        string status
    }
    LEDGER_ACCOUNT {
        int id PK
        string code
        string name
        string type
    }
    LEDGER_ENTRY {
        int id PK
        int account_id FK
        string entry_group_id
        int debit
        int credit
        timestamp created_at
    }
    FEE_SCHEDULE {
        int id PK
        string fee_type
        int amount
        string fee_bearer
        timestamp effective_from
        int created_by FK
        int approved_by FK
    }
    COURIER_PAYOUT {
        int id PK
        int payout_id FK
        int courier_id FK
        int amount
        string status
    }
    PAYMENT ||--|{ PAYMENT_TRANSACTION : "attempts"
    PAYMENT ||--o| IDEMPOTENCY_KEY : "secured_by"
    PAYMENT ||--o| REFUND : "reimbursed_by"
    ORDER ||--o| INVOICE : "invoiced"
    INVOICE ||--|{ INVOICE_ITEM : "bills"
    INVOICE ||--o| CREDIT_NOTE : "cancelled_by"
    PAYOUT_BATCH ||--o{ PAYOUT : "contains"
    PAYOUT ||--o{ COURIER_PAYOUT : "disburses"
    LEDGER_ACCOUNT ||--o{ LEDGER_ENTRY : "accumulates"
```

### 2.7 ERD 6 : Communication, IA et Analytics
```mermaid
erDiagram
    CONVERSATION {
        int id PK
    }
    MESSAGE {
        int id PK
        int conversation_id FK
    }
    NOTIFICATION {
        int id PK
        int user_id FK
    }
    REPORT {
        int id PK
        int order_id FK
    }
    SEARCH_EVENT {
        int id PK
    }
    AUDIT_LOG {
        int id PK
    }
    SUPPORT_TICKET {
        int id PK
    }
    LOYALTY_ACCOUNT {
        int id PK
        int user_id FK
    }
    CONVERSATION ||--|{ MESSAGE : "contains"
```

## 5. Métriques calculées
- Charge actuelle
- Taux de commandes honorées
- Fiabilité des données/fraîcheur
- Délai de réponse

## 6. Entités supplémentaires
- Favorite
- Conversation
- Message
- Report
- DemandAlert
- StockReservation
- Settlement
- Store (capacité estimée)
- DistributorApplication (capacité estimée)
- Setting (coordonnées de contact, seuils de caisse, rayons géographiques)
- CourierZone (zone géographique d'intervention du livreur — CR-001 D-05)
- CourierAvailability (disponibilité opérationnelle temps réel — CR-001 D-05)
- DeliveryAssignment (affectation, timeout et acceptation de course — CR-001 D-05)
- CashCollection (suivi des espèces encaissées à la remise — CR-001 D-05, D-06)
- LedgerAccount (plan de comptes immuable — CR-001 D-06)
- LedgerEntry (écritures à double entrée équilibrées Insert-Only — CR-001 D-06)
- PayoutBatch (lots de reversement groupés Maker-Checker — CR-001 D-06)
- DeliveryFeeSchedule (barème versionné des frais de livraison — CR-001 D-05, D-06)

