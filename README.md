# PLEINGAZ — Plateforme Numérique de Distribution Exclusive de Gaz Domestique (Cameroun)

PLEINGAZ est la plateforme officielle et exclusive de distribution de gaz domestique au Cameroun, opérant sous la directive souveraine **CR-001** (6 Décisions Propriétaire D-01 à D-06).

---

## 🚀 Architecture Globale (Monorepo pnpm)

```
pleingaz/
├── apps/
│   ├── api/             # API NestJS 10, Fastify/Express, WebSocket Gateway, BullMQ
│   └── web/             # PWA Next.js 16 (App Router), Vanilla CSS, Leaflet Carto
├── packages/
│   ├── database/        # Schéma Prisma 5.22+, Client TypeScript, Migrations PostGIS
│   └── eslint-config/   # Configurations de linting partagées
└── docs/                # Spécifications CR-001, Master Prompt, ADRs et Décisions
```

---

## 🏛️ Les 6 Décisions Souveraines CR-001 (D-01 à D-06)

1. **D-01 — Catalogue PLEINGAZ Exclusif & Prix Centralisés** :
   - Neutralisation définitive de toute marketplace ou produit tiers.
   - 5 produits officiels PLEINGAZ uniquement (bouteilles 6kg, 12.5kg, 35kg, détendeurs, tuyaux blindés).
   - Prix officiels nationaux homologués via workflow **Maker-Checker**.

2. **D-02 — Géolocalisation au Clic & Primauté du Choix Manuel** :
   - Aucun déclenchement GPS automatique au chargement.
   - Recherche géolocalisée par formule Haversine SQL native (PostGIS/SQL).
   - Repli textuel manuel (Ville, Quartier, Repère) et protection de la vie privée (zéro coordonnée brute persistée).

3. **D-03 — Stock Qualitatif & Reporting Control Center Zéro Fictif** :
   - Déclaration qualitative par les dépôts : `BON`, `MOYEN`, `FAIBLE`, `RUPTURE`.
   - Confirmation rapide du stock en 1 clic par le distributeur.
   - 15 rapports réels (`R01` à `R15`) calculés sur données authentiques, avec exports audités CSV/Excel.

4. **D-04 — KYC Distributeur Simplifié à 3 Documents** :
   - CNI Recto/Verso (`ID_CARD_FRONT`, `ID_CARD_BACK`).
   - Photo d'identité portrait récent (`PORTRAIT_PHOTO`).
   - Photo extérieure du point de vente (`SHOP_PHOTO`).
   - Cloisonnement S3 privé pour les pièces d'identité et audit trail des consultations.

5. **D-05 — Livreurs Partenaires & Sécurisation de la Remise** :
   - Rôle dédié `COURIER` (9e rôle du RBAC).
   - Réservation éphémère de 15 minutes garantie par file d'attente BullMQ.
   - Remise subordonnée à la validation cryptographique d'un code client haché en **SHA-256**.
   - Plafond d'espèces en caisse (50 000 FCFA par défaut) bloquant automatiquement toute nouvelle course.

6. **D-06 — Gouvernance Financière, Grand Livre & Maker-Checker** :
   - Encaissement centralisé (MTN Mobile Money, Orange Money, Cash).
   - Grand Livre comptable en partie double (`LedgerAccount`, `LedgerEntry`), strictement **Insert-Only**.
   - Lots de reversements (`PayoutBatch`) soumis à double approbation au-delà de 500 000 FCFA.

---

## 🛠️ Prérequis Techniques

- **Node.js** : v20.x ou supérieure
- **pnpm** : v9.x ou supérieure
- **PostgreSQL** : v16.x avec extensions `postgis`, `pg_trgm`, `unaccent`
- **Redis** : v7.x (pour BullMQ et Socket.io)

---

## 💻 Démarrage Rapide Développeur

### 1. Installation des dépendances
```bash
pnpm install
```

### 2. Configuration des variables d'environnement
Créez un fichier `.env` à la racine ou dans chaque sous-projet :
```env
# Base de données
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pleingaz_db?schema=public"

# Redis (BullMQ & Cache)
REDIS_HOST="localhost"
REDIS_PORT=6379

# Sécurité & JWT
JWT_SECRET="pleingaz_super_secret_jwt_key_2026_dev"
JWT_EXPIRES_IN="7d"

# Paramètres Web Next.js
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 3. Migrations et Génération du Client Prisma
```bash
# Générer le client Prisma
pnpm --filter @pleingaz/database prisma generate

# Appliquer les migrations de base de données
pnpm --filter @pleingaz/database prisma migrate deploy
```

### 4. Démarrage des serveurs de développement
```bash
# Démarrer à la fois l'API NestJS et le Web Next.js
pnpm dev

# Ou individuellement :
pnpm --filter api dev      # API sur http://localhost:3001
pnpm --filter web dev      # Web sur http://localhost:3000
```

---

## 🧪 Tests & Recette de Qualification

### Tests Unitaires API (20 Suites / 71 Tests)
```bash
pnpm --filter api test
```

### Test E2E Global CR-001 (Cycle Complet Décisions D-01 à D-06)
```bash
pnpm --filter api test:e2e
```

### Build Production Web (18 Routes Next.js Compilées)
```bash
pnpm --filter web build
```

---

## 🐳 Déploiement Docker

Pour lancer l'environnement complet (PostgreSQL + PostGIS, Redis, API NestJS, Web Next.js) :

```bash
docker compose up -d --build
```

---

## 📱 Routes & Interfaces Utilisateur (PWA Next.js)

| Route | Rôle / Description |
|---|---|
| `/` | Page d'accueil officielle PLEINGAZ avec recherche immédiate au clic (D-02) |
| `/search` | Moteur de recherche dépôts avec Haversine SQL & carte interactive Leaflet |
| `/stores` | Annuaire des points de vente certifiés avec badges de fiabilité |
| `/stores/[storeId]` | Fiche point de vente avec niveau de stock qualitatif et commande |
| `/checkout` | Tunnel de commande B2C avec choix mode de livraison & paiement |
| `/distributor/apply` | Formulaire KYC simplifié en 3 étapes (D-04) |
| `/distributor/inventory` | Gestion qualitative du stock et confirmation rapide en 1 clic (D-03) |
| `/delivery` | Cockpit livreur mobile avec validation par code SHA-256 (D-05) |
| `/admin/login` | Authentification administrative sécurisée |
| `/admin/dashboard` | Control Center en temps réel avec indicateurs clés (D-03) |
| `/admin/reports` | 15 rapports métier exhaustifs avec exports audités CSV/Excel (D-03) |
| `/admin/knowledge` | Base de connaissances et protocoles vitaux d'assistance gaz (D-03) |
| `/admin/system` | Journal d'audit immuable et paramètres de la plateforme |
| `/chat` | Messagerie instantanée en temps réel (WebSocket) |
| `/support` | Assistant IA Zéro-Hallucination & protocole d'urgence fuite de gaz |

---

## 📄 Licence & Propriété
Tous droits réservés © 2026 PLEINGAZ S.A. Plateforme exclusive et confidentielle.
