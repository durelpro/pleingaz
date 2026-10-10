# Architecture Technique

## 1. Diagramme d'Architecture Globale
```mermaid
graph TD
    %% Clients
    ClientApp[Client PWA/Web] --> CDN[Cloudflare CDN]
    DistApp[Distributeur PWA] --> CDN
    AdminApp[Admin Control Center] --> CDN

    %% Façade
    CDN --> API[API REST / Backend]
    
    %% Base et Caches
    API --> PG[(PostgreSQL + PostGIS)]
    API --> Redis[(Redis)]
    
    %% Stockage Fichiers
    API --> S3_Public[(S3 Bucket: Public Images)]
    API --> S3_Private[(S3 Bucket: KYC & Factures)]
    
    %% Workers & Files d'attente
    Redis --> Worker[Background Workers]
    Worker --> PG
    
    %% Services Tiers
    API --> PayGateway[Agrégateur Paiement]
    PayGateway --> API
    API --> SMS[Provider SMS]
    API --> WhatsApp[Meta WhatsApp API]
    API --> Nominatim[Serveur Géocodage]
    ClientApp --> Tiles[Fournisseur Tuiles Carte]
    Worker --> LLM[Service IA]
```

## 2. Hébergement et CDN (ADR D2)
**Statut de l'ADR D2 : PROPOSÉ.**
La plateforme doit équilibrer les coûts et la performance depuis le Cameroun.
- **Option A : Hébergement local/régional (ex: Afrique du Sud)**. Latence très faible (50-80ms). Coût élevé, facturation en devise locale (XAF) rare ou premium USD, support variable, conformité forte des données (souveraineté locale).
- **Option B : VPS Européen + Cloudflare (Recommandation de conception)**. Latence API moyenne (120-150ms depuis le Cameroun), mais statiques servis très rapidement via le cache edge de Cloudflare. Coût faible/moyen, facturation en EUR/USD, support mondial robuste, conformité à analyser (transfert de données).
- **Décision** : Le choix est laissé au client, l'Option B est recommandée pour le MVP.
- **Paramétrage Cloudflare** : Anti-bot configuré pour ne pas bloquer les vrais utilisateurs/API. Origine verrouillée sur le trafic CDN. IP réelle via `True-Client-IP`.

## 3. Stratégie de Cache (TTL et Durée de cache)
Il est critique de séparer les contenus statiques des contenus dynamiques (stock, données privées).
- **Statiques (CSS, JS, Fonts)** : Durée de cache longue (1 an) avec invalidation par hash de fichier.
- **Images publiques** : Durée de cache de 30 jours au niveau du CDN.
- **Pages Vitrines (SSR Next.js)** : Pré-rendues avec ISR (Incremental Static Regeneration). Durée de cache/TTL de 1 heure.
- **Blocs Dynamiques (ex: Stock d'un point de vente)** : Le squelette de la page du distributeur est en cache, mais **le bloc affichant le stock est toujours chargé dynamiquement (Client-Side Fetch)** et porte un TTL de 0 seconde (pas de cache). Il affiche systématiquement la "date de dernière mise à jour".
- **Données Sensibles (Factures, Profils)** : En-têtes HTTP `Cache-Control: no-store, no-cache, max-age=0`.
- **Redis** : Utilisé pour les caches temporaires (TTL courts, ex: 5 min pour une recherche sans géolocalisation), le rate limiting et le TTL des OTP (ex: 5 minutes). **Règle absolue : jamais de données qui doivent survivre à un redémarrage.**

## 4. API REST et Recherche
- **Standards** : API versionnée (`/api/v1`). Documentation OpenAPI (Swagger) générée automatiquement depuis le code. Erreurs standardisées (RFC 7807), CORS restrictif. 
- **Politique de Versionnement** : Ajouts permis. Casseurs de compatibilité = `/api/v2`. Dépréciation annoncée 6 mois à l'avance via un en-tête `Deprecation: true`.
- **Rate Limiting** : Limites strictes par endpoint via Redis pour contrer le flood :
  - `POST /otp` (Génération) : 3/heure.
  - `POST /login` (Connexion) : 10/heure.
  - `GET /search` (Recherche) : 30/minute.
  - `POST /orders` (Création de commande) : 5/heure.
  - `POST /webhooks/*` : 100/minute (avec vérification stricte de signature).
- **Recherche** : Dans un premier temps, recherche PostgreSQL (extensions `pg_trgm`, `unaccent`, gestion des synonymes de quartiers). La bascule vers OpenSearch ne sera envisagée que si la recherche textuelle dépasse 500ms sur des millions de requêtes ou nécessite des filtres à facettes très complexes.

## 5. Stockage S3 et Fichiers
- **S3 Public** : Logos, photos des boutiques.
- **S3 Privé (Isolé)** : Pièces d'identité (KYC) et Factures PDF.
- **Sécurité S3 Privé** : Accès backend exclusif, génération d'**URL signées** (TTL de 15 minutes) pour l'affichage ponctuel, vérification du type MIME, limitation de taille (ex: 5Mo), analyse antivirus à l'upload, et journalisation stricte des accès (`document:view_identity`).

## 6. Frontend, PWA et Gestion de la Faible Connexion
- **Architecture** : Next.js. Séparation en 3 portails (Public/Client, Distributeur, Admin).
- **Offline / PWA (Mode faible connexion)** : 
  - Service Workers pour le cache des assets vitaux.
  - Sauvegarde locale d'une commande interrompue pour reprise automatique.
  - Affichage explicite des états hors-ligne ("*Vous êtes hors ligne, données potentiellement anciennes*").
  - **Mise à jour de stock Distributeur hors ligne** : Le distributeur modifie son stock sans réseau. L'action va dans une file locale (IndexedDB). À la reconnexion, la mise à jour part vers l'API avec **l'horodatage réel** de la déclaration. La résolution des conflits côté backend priorise toujours l'heure de la déclaration locale face aux déductions automatiques.

## 7. Cartographie, Géocodage et Tuiles (ADR D3)
**Statut de l'ADR D3 : PROPOSÉ.**
- **Géocodage** : Le distributeur cible son adresse à l'inscription. Nominatim utilisé en backend via file d'attente (1 req/sec, User-Agent identifié, cache base de données). Interface `GeocodingProvider` pour changer de fournisseur. Source de vérité = Marqueur validé manuellement + repère texte. Pas d'autocomplétion à la frappe.
- **Tuiles de la carte** : Le serveur public OSM est interdit pour ce trafic.
  - *Option commerciale (Mapbox/JawgMaps)* : Fiable, SLA garanti, mais coût par vue.
  - *Auto-hébergement OSM* : Gratuit à l'usage, mais charge de maintenance serveur complexe (à faire plus tard).
  - *Impact data* : Le chargement vectoriel/raster d'une carte consomme environ **1.5 Mo par écran de carte**. C'est un coût en données (Ko) important au Cameroun.
- **Liste de secours** : Si la carte ne charge pas (échec réseau, blocage pub, ou timeout fournisseur), une **liste textuelle de secours** ordonnée par distance s'affiche obligatoirement. L'impact réseau chute alors à ~20 Ko (JSON pur).

## 8. Tâches en Arrière-plan (Workers)
Gestion des processus asynchrones via files d'attente (ex: BullMQ sur Redis).
- **Files** : Notifications, PDF generation, Webhooks de paiement, Expiration des réservations, Alertes de stock.
- **Résilience** : Reprises automatiques (retries exponentiels), exécution garantie de manière idempotente.
- **File des échecs (Dead Letter Queue)** : Les tâches ayant échoué N fois tombent dans une *dead letter queue* (file des échecs) qui déclenche une alerte critique (Slack/Email) pour inspection manuelle.

## 9. Budgets de Performance
L'audit a mesuré un LCP dégradé de **3,6 s** en mobile (3G bridée). L'objectif est d'atteindre un LCP **< 2,5 s**.
Pour garantir cela, des budgets de performance sont fixés et **seront contrôlés en CI** (via Lighthouse CI et bundlesize) lors de chaque Pull Request :
- **Page SANS carte (ex: Accueil, Liste)** : Poids cible < 300 Ko (gzippé), < 20 requêtes.
- **Page AVEC carte** : Poids cible < 1.5 Mo. Tuiles limitées au viewport visible, chargement paresseux (Lazy Loading).
- **LCP Cible (Slow 4G)** : < 2,5 s.

## 10. Diagrammes de Séquence (Processus Critiques)

### 10.1 Paiement Webhook, Expiration et LATE_SUCCESS
```mermaid
sequenceDiagram
    participant C as Client
    participant API as Plateforme
    participant PG as PostgreSQL
    participant Pay as Gateway Mobile Money
    
    C->>API: Valider Commande
    API->>Pay: Initier Paiement
    Pay-->>API: URL de paiement / Pending
    API->>PG: Sauvegarde Payment (PENDING)
    
    Note over API,Pay: Timeout de la réservation (ex: 15 min)
    API->>PG: Marquer Commande CANCELLED, Payment EXPIRED
    
    Note over Pay,API: 2 heures plus tard...
    Pay->>API: Webhook (SUCCESS)
    API->>PG: Lock IdempotencyKey (ON CONFLICT DO NOTHING)
    API->>PG: Payment était EXPIRED -> passe en LATE_SUCCESS
    API->>PG: Crée une demande de Remboursement (REFUND_REQUESTED)
    API->>C: Notification "Paiement tardif reçu, remboursement initié"
```

### 10.2 Commande, Réservation de Stock et Expiration
```mermaid
sequenceDiagram
    participant C as Client
    participant API as Plateforme
    participant PG as Inventory/StockRes
    participant W as Worker (Cron)
    
    C->>API: Demande de réservation
    API->>PG: Vérifie Disponibilité (Inventory - Réservations Actives)
    API->>PG: Crée StockReservation (RESERVED, +15min TTL)
    API-->>C: Commande DRAFT, Attente paiement
    
    Note over C,API: Le client ne paie pas
    W->>PG: Cherche Réservations expirées
    W->>PG: StockReservation passe à EXPIRED
    W->>PG: Libère le stock pour les autres clients
    W->>C: Notification "Réservation expirée"
```

### 10.3 Mise à jour Stock et Notification de Retour en Stock
```mermaid
sequenceDiagram
    participant Dist as Distributeur
    participant API as Plateforme
    participant PG as PostgreSQL
    participant Notif as Worker Notif
    participant C as Client (Abonné)
    
    C->>API: "M'alerter quand RUPTURE -> BON"
    API->>PG: Enregistre StockAlert
    
    Dist->>API: Met à jour Stock (RUPTURE -> BON)
    API->>PG: Insert InventoryUpdate
    API->>Notif: Trigger Job "Vérifier Alertes"
    Notif->>PG: Trouve les StockAlert correspondantes
    Notif->>C: Envoi SMS/WhatsApp "Le gaz est de retour !"
    Notif->>PG: Marque l'alerte traitée
```

### 10.4 Validation d'un Dossier Distributeur
```mermaid
sequenceDiagram
    participant Dist as Distributeur
    participant API as Plateforme
    participant S3 as S3_Privé
    participant Admin as Admin
    
    Dist->>API: Soumet Dossier (KYC)
    API->>S3: Upload Pièce (Antivirus, MIME Check)
    API->>API: Application passe UNDER_REVIEW
    
    Admin->>API: Demande vue du Dossier
    API->>API: Log Audit (document:view_identity)
    API->>S3: Génère URL Signée (TTL 15 min)
    S3-->>Admin: Affiche Pièce
    
    Admin->>API: Valide Dossier
    API->>API: Application passe APPROVED
    API->>API: DistributorProfile passe APPROVED
    API->>Dist: Notification Succès
```

---

## 11. Correctifs Rapides Existants (Indépendants)
Les correctifs identifiés lors de l'audit initial (notamment le comportement défectueux de Nginx renvoyant des 200 OK sur les fichiers `robots.txt` et `sitemap.xml` non trouvés) sont **indépendants de cette refonte technique globale**. Ils peuvent et doivent être corrigés immédiatement sur l'infrastructure actuelle sans attendre la migration vers Next.js.

## 12. Dépendances des ADR
Tous les ADR restent au statut **PROPOSÉ**. Ce tableau indique quels choix techniques devront être revus si un ADR est finalement rejeté.

| ADR | Sujet | Statut | Choix techniques dépendants |
|---|---|---|---|
| **D1** | Migration Next.js (SSR) | PROPOSÉ | Architecture Frontend (Next.js), hébergement Node.js, pré-rendu SEO. |
| **D2** | Hébergement (VPS + CF) | PROPOSÉ | Stratégie de Cache Edge Cloudflare, latence cible, IP filtering. |
| **D3** | Tuiles de la carte | PROPOSÉ | Budget d'affichage, gestion des écrans de secours (texte pur), consommation data. |
| **D4** | Agrégateur Paiement | PROPOSÉ | Webhooks `LATE_SUCCESS`, UX de paiement redirigé vs intégré. |

---

## 13. Décisions Urgentes à Confirmer (Ajoutées à OPEN_QUESTIONS.md)
1. **Hébergement et Devises** : Le VPS européen (ADR D2) implique des factures en Euro/USD. L'entreprise PLEINGAZ peut-elle régler ces frais internationaux ?
2. **Confidentialité et CDN** : L'utilisation de Cloudflare (US) doit être validée juridiquement et inscrite dans les mentions légales.
3. **Fournisseur de Tuiles (Budget)** : Valider l'enveloppe budgétaire pour JawgMaps, Mapbox ou un auto-hébergement de tuiles OSM.
4. **Environnements Cloud** : Accord sur la séparation des coûts pour financer une vraie Pré-production identique à la Prod.

## 14. Stack technique retenue
La stack de l'audit préliminaire (04-stack.md) a été validée pour le MVP, ajustée par nos ADRs :

| Domaine | Technologie | Statut |
|---|---|---|
| Langage principal | TypeScript | Retenu MVP |
| Frontend | Next.js + React | **PROPOSÉ** (ADR D1) |
| Style et interface | Tailwind CSS | Retenu MVP |
| Composants UI | shadcn/ui | Retenu MVP |
| Icônes | Lucide React | Retenu MVP |
| Backend | NestJS | Retenu MVP |
| Base de données | PostgreSQL | Retenu MVP |
| Géolocalisation | PostGIS | Retenu MVP |
| ORM | Prisma | Retenu MVP |
| Requêtes géographiques | SQL paramétré | Retenu MVP |
| Cache | Redis | Retenu MVP |
| Tâches en arrière-plan | BullMQ | Retenu MVP |
| Cartes | Leaflet + React Leaflet | **PROPOSÉ** (ADR D3) |
| Authentification | JWT + cookies HttpOnly | Retenu MVP |
| Mots de passe | Argon2id | Retenu MVP |
| Permissions | RBAC | Retenu MVP |
| Validation | Zod + ValidationPipe NestJS | Retenu MVP |
| Paiements | PaymentProvider (abstrait) | **PROPOSÉ** (ADR D4) |
| Fichiers | Stockage compatible S3 | Retenu MVP |
| Notifications | Email + WhatsApp | Retenu MVP |
| Temps réel | WebSocket / Socket.IO | Plus tard |
| Recherche initiale | PostgreSQL | Retenu MVP |
| Recherche avancée | OpenSearch | Plus tard |
| IA | LLM + RAG + outils internes | Plus tard |
| Tests unitaires | Jest | Retenu MVP |
| Tests API | Supertest | Retenu MVP |
| Tests navigateur | Playwright | Retenu MVP |
| Conteneurisation | Docker + Compose | Retenu MVP |
| Serveur | Ubuntu Linux | **PROPOSÉ** (ADR D2) |
| Reverse proxy | Nginx | Retenu MVP |
| Gestion du code | Git + GitHub | Retenu MVP |
| Monitoring | Sentry + Uptime Kuma | Retenu MVP |
