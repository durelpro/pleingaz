# Matrice de Traçabilité (Sources vers Architecture)

## Méthode
Ce document prouve que chaque exigence atomique des 5 fichiers sources (Vision, Positionnement, Stack, Audit Préliminaire, Notes Complémentaires) est traitée.
- **ID** : S (Stack), A (Audit), N (Notes), P (Positionnement), V (Vision).
- **Entité(s) / Écran(s)** : Localisation de l'impact dans le système.
- **Document(s)** : Fichier `docs/` et section précise couvrant l'exigence (ex: 03 §2.1). "AUCUN" si non traitée.
- **Statut** : MVP / Plus tard / Écarté (strictement aligné sur le périmètre de `06c-mvp-pilote-roadmap.md`).
- **Justification** : Motif d'écartement ou de report.

## TROUS (Exigences non couvertes)
- *Aucun pour l'instant.*

## INCOHÉRENCES IDENTIFIÉES
- *Aucune pour l'instant.*

---

## BLOC 1 : Stack Technique (S) et Audit Préliminaire (A)

### Source S : Stack Technique (`04-stack.md`)
| ID | Exigence | Entité(s) | Écran(s) | Document(s) | Phase | Statut | Justification |
|---|---|---|---|---|---|---|---|
| S-01 | Langage principal : TypeScript | N/A | N/A | 04 §4 (Implicite) | 1 | MVP | Socle technique fondamental. |
| S-02 | Frontend : Next.js + React | N/A | Tous | 04 §6 | 1 | MVP | Architecture retenue pour PWA et pages vitrines. |
| S-03 | Style et interface : Tailwind CSS | N/A | Tous | AUCUN | 1 | MVP | Non détaillé explicitement dans 04. |
| S-04 | Composants UI : shadcn/ui | N/A | Tous | AUCUN | 1 | MVP | Implicite via Next.js/Tailwind. |
| S-05 | Icônes : Lucide React | N/A | Tous | AUCUN | 1 | MVP | Composant UI. |
| S-06 | Backend : NestJS | API | N/A | AUCUN | 1 | MVP | 04 cite "Backend" mais l'ADR ne force pas explicitement NestJS dans le texte. |
| S-07 | Base de données : PostgreSQL | Toutes | N/A | 04 §1 | 1 | MVP | Base de données centrale de l'architecture. |
| S-08 | Géolocalisation : PostGIS | Boutique | Carte | 04 §4, §7 | 1 | MVP | Obligatoire pour le calcul de distance. |
| S-09 | ORM : Prisma | N/A | N/A | AUCUN | 1 | MVP | Non listé explicitement dans 04 (uniquement PG mentionné). |
| S-10 | Requêtes géographiques : SQL paramétré | N/A | N/A | AUCUN | 1 | MVP | Méthode technique de recherche (PostGIS est cité 04 §4). |
| S-11 | Cache : Redis | Cache | N/A | 04 §1, §3 | 1 | MVP | Utilisé pour rate limiting et files d'attente. |
| S-12 | Tâches en arrière-plan : BullMQ | Jobs | N/A | 04 §8 | 1 | MVP | Worker asynchrone explicite dans l'architecture. |
| S-13 | Cartes : Leaflet + React Leaflet | Carte | Carte | 04 §7 | 1 | MVP | Solution frontend proposée pour remplacer Google Maps. |
| S-14 | Authentification : JWT + cookies HttpOnly | Session | Connexion | 07 §7 | 1 | MVP | Mesure de sécurité standard retenue (06a §2). |
| S-15 | Mots de passe : Argon2id | User | Auth | 06a §2 | 1 | MVP | Hashage obligatoire pour le staff/admin. |
| S-16 | Permissions : RBAC | Role | Tous | 06b §3 | 1 | MVP | Séparation stricte des accès validée en architecture. |
| S-17 | Validation : Zod + ValidationPipe NestJS | API | Formulaires | AUCUN | 1 | MVP | Non documenté formellement dans 04/06. |
| S-18 | Paiements : PaymentProvider | Payment | Checkout | 04 §10.1, 05a §1 | 1 | MVP | Intégration hybride retenue (MTN/Orange/Espèces). |
| S-19 | Fichiers : Stockage compatible S3 | Document | KYC | 04 §5, 07 §4 | 1 | MVP | Isolement des KYC et factures public/privé. |
| S-20 | Notifications : Email + WhatsApp | Message | N/A | 05b §1 | 1 | MVP | Canaux vitaux (WhatsApp click-to-chat MVP, API plus tard). |
| S-21 | Temps réel : WebSocket / Socket.IO | N/A | N/A | AUCUN | Phase future | Plus tard | Non prioritaire pour le MVP. |
| S-22 | Recherche initiale : PostgreSQL | N/A | Recherche | 04 §4 | 1 | MVP | Choisi via pg_trgm pour le MVP (04 §4). |
| S-23 | Recherche avancée : OpenSearch | N/A | Recherche | 04 §4 | Phase future | Plus tard | Remplacé par PostgreSQL pour limiter les coûts initiaux. |
| S-24 | IA : LLM + RAG + outils internes | Conversation| Chat IA | 05c §2, 06c §3 | Phase 8 | Plus tard | Modèles LLM reportés après lancement pour des raisons de coût. |
| S-25 | Tests unitaires : Jest | N/A | N/A | 06b §1 | 1 | MVP | Obligatoire dans la matrice de qualité. |
| S-26 | Tests API : Supertest | N/A | N/A | 06b §1 | 1 | MVP | Exigé pour valider l'API backend. |
| S-27 | Tests navigateur : Playwright | N/A | E2E | 06b §1 | 1 | MVP | Exigé pour le frontend et les coupures réseau. |
| S-28 | Conteneurisation : Docker + Compose | N/A | N/A | AUCUN | 1 | MVP | Implicite mais non formalisé dans docs/04. |
| S-29 | Serveur : Ubuntu Linux | N/A | N/A | AUCUN | 1 | MVP | Implicite. VPS (04 §2). |
| S-30 | Reverse proxy : Nginx | N/A | N/A | 01 §1 | 1 | MVP | Maintenu/Migré en frontend (Cloudflare prend le relais CDN). |
| S-31 | Gestion du code : Git + GitHub | N/A | N/A | AUCUN | 1 | MVP | Infrastructure bas niveau. |
| S-32 | Monitoring : Sentry + Uptime Kuma | Log | N/A | 06c §4 | 1 | MVP | Outils de surveillance inclus dans le plan d'infrastructure. |

### Source A : Audit Préliminaire (`01-audit-preliminaire.md`)
| ID | Exigence | Entité(s) | Écran(s) | Document(s) | Phase | Statut | Justification |
|---|---|---|---|---|---|---|---|
| A-01 | (Contexte) Marché avec pénuries, MoMo, WhatsApp | N/A | N/A | 00 R5 | 1 | MVP | Guideline transversale respectée dans l'UX. |
| A-02 | (Marque) "Bouteilles toujours pleines" | N/A | Accueil | 01 §3 | 1 | MVP | Slogan à conserver. |
| A-03 | (Tech) SPA React + Vite existant | N/A | N/A | 04 §6 | 1 | MVP | Architecture modernisée vers Next.js (ADR D1). |
| A-04 | (Design) Multilingue (FR/EN) | N/A | UI globale | 04 §6 | 1 | MVP | Maintenu obligatoirement. |
| A-05 | (Fonctionnel) My account minimaliste | User | Dashboard | 02 §3 | 1 | MVP | Refondu en tableaux de bord Client et Distributeur complets. |
| A-06 | (Design) Palette rouge/orange énergie | N/A | UI globale | 01 §3 | 1 | MVP | Force à conserver. |
| A-07 | (Prix) 6kg: 16120 / Gaz: 3120 | Product | Catalogue | AUCUN | - | À CONFIRMER | NON VÉRIFIÉ (Règle absolue : aucun prix métier inventé). |
| A-08 | (Prix) 12.5kg: 26500 / Gaz: 6500 | Product | Catalogue | AUCUN | - | À CONFIRMER | NON VÉRIFIÉ. |
| A-09 | (Prix) 50kg: 76000 / Gaz: 26000 | Product | Catalogue | AUCUN | - | À CONFIRMER | NON VÉRIFIÉ. |
| A-10 | (Services) Livraison 24h domicile | Order | Livraison | AUCUN | - | À CONFIRMER | NON VÉRIFIÉ. Mentions logistiques à valider par PLEINGAZ. |
| A-11 | (Services) Livraison pro 6h | Order | Livraison | AUCUN | - | À CONFIRMER | NON VÉRIFIÉ. |
| A-12 | (Services) Accompagnement revendeurs | Distributor | Inscription | 02 §3.3 | 1 | MVP | Processus KYC ajouté. |
| A-13 | (Force) Coordonnées claires +237... | N/A | Contact | AUCUN | - | À CONFIRMER | Numéro réel à confirmer. |
| A-14 | (Faiblesse) Pas de statut temps réel | Inventory | Carte/Liste | 03 §1, 04 §3 | 1 | MVP | Au cœur du nouveau système "Digital Distribution Network". |
| A-15 | (Faiblesse) Carte basique sans géoloc. | Store | Carte | 04 §7 | 1 | MVP | Refonte avec PostGIS et Leaflet (ADR D3). |
| A-16 | (Faiblesse) Espace distributeur inexistant | Distributor | Dashboard | 02 §3.3 | 1 | MVP | Création d'un espace métier dédié. |
| A-17 | (Faiblesse) Pas de validation revendeur | Admin | KYC | 03 §2, 06a M01 | 1 | MVP | Validation obligatoire (Statut `APPROVED`) avant visibilité. |
| A-18 | (Faiblesse) Commande client limitée | Order | Checkout | 03 §2 | 1 | MVP | Modélisation complète de la commande et réservation. |
| A-19 | (Faiblesse) Commande dist. -> PLEINGAZ | WholesaleOrder| B2B | 06c §1 | Phase 2+ | Plus tard | Hors MVP (le MVP cible d'abord le Client -> Distributeur). |
| A-20 | (Faiblesse) Paiement Mobile Money absent | Payment | Checkout | 05a §1 | 1 | MVP | Intégration MTN/Orange Money avec gestion asynchrone. |
| A-21 | (Faiblesse) Facturation automatique absente| Invoice | Checkout | 05a §4 | 1 | MVP | Génération de PDF et numérotation séquentielle. |
| A-22 | (Faiblesse) Assistant IA / Chat absent | Conversation| Chat | 05c §1 | Phase 8 | Plus tard | LLM trop complexe pour le MVP (06c §3). |
| A-23 | (Faiblesse) Notifications alertes stock | StockAlert | Mobile | 05b §4 | 1 | MVP | Inscription et alertes push SMS/WhatsApp prévues. |
| A-24 | (Faiblesse) Administration/Supervision | Admin | ControlCenter| 02 §3.4 | 1 | MVP | Tableau de bord de supervision créé. |
| A-25 | (Faiblesse) Badges de confiance / fraude | Store | Fiche | 02 §2.1 | 1 | MVP | Badges distributeur validé et fraîcheur de la donnée. |
| A-26 | (Faiblesse) Parcours "J'ai besoin de gaz" | Search | Accueil | 06c §1 | 1 | MVP | Cas d'usage principal du MVP (Recherche proximité). |
| A-27 | (Faiblesse) Design trop "brochure" | N/A | Accueil | 04 §6 | 1 | MVP | Passage d'un site vitrine à une application web interactive. |
| A-28 | (Faiblesse) Hiérarchie actions prioritaire | N/A | Accueil | 02 §3 | 1 | MVP | Centrage sur le moteur de recherche et la localisation. |
| A-29 | (Faiblesse) Optimisation connexions instables| N/A | Toutes | 04 §6 | 1 | MVP | Mode PWA et skeleton loaders spécifiés. |
| A-30 | (Info) Protection anti-bot Cloudflare | N/A | N/A | 04 §2 | 1 | MVP | Intégration CDN Cloudflare proposée (ADR D2). |
| A-31 | (Info) Produits: Tables de cuisson | Product | Catalogue | AUCUN | - | À CONFIRMER | NON VÉRIFIÉ (Hors périmètre strict du gaz ?). |
| A-32 | (Info) Produits: Régulateurs, Tuyaux | Product | Catalogue | AUCUN | - | À CONFIRMER | NON VÉRIFIÉ (Accessoires). |
| A-33 | (Page) About | N/A | About | AUCUN | Phase 2b | Plus tard | Page de contenu textuel. |
| A-34 | (Page) Products | N/A | Products | AUCUN | 1 | MVP | Sera dynamique via la base de données. |
| A-35 | (Page) Services | N/A | Services | AUCUN | Phase 2b | Plus tard | Page de contenu textuel. |
| A-36 | (Page) Our Points of Sale | N/A | Carte | 04 §7 | 1 | MVP | Remplacée par la recherche interactive "J'ai besoin de gaz". |
| A-37 | (Page) Contact | N/A | Contact | AUCUN | 1 | MVP | Obligatoire (support). |
| A-38 | (Page) FAQ | N/A | FAQ | AUCUN | Phase 2b | Plus tard | Page d'aide statique (Phase 2B de `docs/prompts`). |
| A-39 | (Page) Blog | N/A | Blog | AUCUN | Phase 2b | Plus tard | Non prioritaire pour un MVP e-commerce rapide. |
| A-40 | (Page) Your review | Review | Avis | 06c §1 | Phase 2b | Plus tard | Fonctionnalité d'avis hors du MVP (besoin de volume). |
| A-41 | (Slogan) Always Full Cylinders | N/A | Accueil | 01 §3 | 1 | MVP | Maintenu comme axe identitaire fort. |
| A-42 | (Engagements) Santé, femmes, jeunes | N/A | About | AUCUN | Phase 2b | Plus tard | Contenus institutionnels à migrer plus tard. |
| A-43 | (Technique) HTTP/2 supporté | N/A | N/A | 04 §2 | 1 | MVP | Maintenu nativement via Cloudflare/Nginx. |
| A-44 | (SEO) Robots.txt / Sitemap erronés | N/A | SEO | 01 §11 | 1 | MVP | Correctif urgent isolé. |
| A-45 | (Perf) Objectif LCP < 2.5s | N/A | CI/CD | 04 §9 | 1 | MVP | Budgets de performance documentés en architecture. |
