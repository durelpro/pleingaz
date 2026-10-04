# Matrice de Traçabilité (Sources vers Architecture)

## Méthode
Ce document prouve que chaque exigence atomique des 5 fichiers sources (Vision, Positionnement, Stack, Audit Préliminaire, Notes Complémentaires) est traitée.
- **ID** : S (Stack), A (Audit), N (Notes), P (Positionnement), V (Vision).
- **Entité(s) / Écran(s)** : Localisation de l'impact dans le système.
- **Document(s)** : Fichier `docs/` et section précise couvrant l'exigence (ex: 03 §2.1). "AUCUN" si non traitée.
- **Statut** : MVP / Plus tard / Écarté (strictement aligné sur le périmètre de `06c-mvp-pilote-roadmap.md`).
- **Justification** : Motif d'écartement ou de report.

## TROUS (Exigences non couvertes)
| ID | Exigence | Pourquoi aucun document ne la traite | Remède proposé | Qui décide |
|---|---|---|---|---|
| A-13 | Coordonnées claires +237... | Le numéro exact dépend de l'entreprise réelle. | a. Ajouter une variable de contact dans les Settings globaux, jamais en dur. | PLEINGAZ |

## INCOHÉRENCES IDENTIFIÉES
| ID | Écart | Document concerné | Correction proposée |
|---|---|---|---|
| S-13 | La stack source exige **Leaflet** en recommandé. L'ADR D3 ne tranche pas l'outil frontend. | `04-architecture-technique.md` | Ajouter "React Leaflet" formellement dans l'ADR D3. |
| Pages | Le maintien des pages existantes était listé, mais pas planifié explicitement. | `06c-mvp-pilote-roadmap.md` | Migration des pages ajoutée à la Phase 2B (correction effectuée). |

---

## BLOC 1 : Stack Technique (S) et Audit Préliminaire (A)

### Source S : Stack Technique (`04-stack.md`)
| ID | Exigence | Entité(s) | Écran(s) | Document(s) | Phase | Statut | Justification |
|---|---|---|---|---|---|---|---|
| S-01 | Langage principal : TypeScript | N/A | N/A | 04 §4 (Implicite) | 1 | MVP | Socle technique fondamental. |
| S-02 | Frontend : Next.js + React | N/A | Tous | 04 §6 | 1 | MVP | Architecture retenue pour PWA et pages vitrines. |
| S-03 | Style et interface : Tailwind CSS | N/A | Tous | 04 §14 | 1 | MVP | Stack technique retenue (04 §14). |
| S-04 | Composants UI : shadcn/ui | N/A | Tous | 04 §14 | 1 | MVP | Stack technique retenue (04 §14). |
| S-05 | Icônes : Lucide React | N/A | Tous | 04 §14 | 1 | MVP | Stack technique retenue (04 §14). |
| S-06 | Backend : NestJS | API | N/A | 04 §14 | 1 | MVP | Stack technique retenue (04 §14). |
| S-07 | Base de données : PostgreSQL | Toutes | N/A | 04 §1 | 1 | MVP | Base de données centrale de l'architecture. |
| S-08 | Géolocalisation : PostGIS | Boutique | Carte | 04 §4, §7 | 1 | MVP | Obligatoire pour le calcul de distance. |
| S-09 | ORM : Prisma | N/A | N/A | 04 §14 | 1 | MVP | Stack technique retenue (04 §14). |
| S-10 | Requêtes géographiques : SQL paramétré | N/A | N/A | 06a M17 | 1 | MVP | Règle de sécurité M17 formellement ajoutée. |
| S-11 | Cache : Redis | Cache | N/A | 04 §1, §3 | 1 | MVP | Utilisé pour rate limiting et files d'attente. |
| S-12 | Tâches en arrière-plan : BullMQ | Jobs | N/A | 04 §8 | 1 | MVP | Worker asynchrone explicite dans l'architecture. |
| S-13 | Cartes : Leaflet + React Leaflet | Carte | Carte | 04 §7 | 1 | MVP | Solution frontend proposée pour remplacer Google Maps. |
| S-14 | Authentification : JWT + cookies HttpOnly | Session | Connexion | 06a §2 | 1 | MVP | Mesure de sécurité standard retenue (06a §2). |
| S-15 | Mots de passe : Argon2id | User | Auth | 06a §2 | 1 | MVP | Hashage obligatoire pour le staff/admin. |
| S-16 | Permissions : RBAC | Role | Tous | 06b §3 | 1 | MVP | Séparation stricte des accès validée en architecture. |
| S-17 | Validation : Zod + ValidationPipe NestJS | API | Formulaires | 05c §2 | 1 | MVP | Cité dans la validation des outputs LLM, mais à généraliser. |
| S-18 | Paiements : PaymentProvider | Payment | Checkout | 04 §10.1 | 1 | MVP | Intégration hybride retenue (MTN/Orange/Espèces). |
| S-19 | Fichiers : Stockage compatible S3 | Document | KYC | 04 §5 | 1 | MVP | Isolement des KYC et factures public/privé. |
| S-20 | Notifications : Email + WhatsApp | Message | N/A | 05b §1 | 1 | MVP | Canaux vitaux (WhatsApp click-to-chat MVP, API plus tard). |
| S-21 | Temps réel : WebSocket / Socket.IO | N/A | N/A | 06c §3 | Phase future | Plus tard | Non prioritaire pour le MVP. |
| S-22 | Recherche initiale : PostgreSQL | N/A | Recherche | 04 §4 | 1 | MVP | Choisi via pg_trgm pour le MVP (04 §4). |
| S-23 | Recherche avancée : OpenSearch | N/A | Recherche | 04 §4 | Phase future | Plus tard | Remplacé par PostgreSQL pour limiter les coûts initiaux. |
| S-24 | IA : LLM + RAG + outils internes | Conversation| Chat IA | 05c §2 | Phase 8 | Plus tard | Modèles LLM reportés après lancement pour des raisons de coût. |
| S-25 | Tests unitaires : Jest | N/A | N/A | 06b §1 | 1 | MVP | Obligatoire dans la matrice de qualité. |
| S-26 | Tests API : Supertest | N/A | N/A | 06b §1 | 1 | MVP | Exigé pour valider l'API backend. |
| S-27 | Tests navigateur : Playwright | N/A | E2E | 06b §1 | 1 | MVP | Exigé pour le frontend et les coupures réseau. |
| S-28 | Conteneurisation : Docker + Compose | N/A | N/A | 06a M16 | 1 | MVP | Utilisé en prévention M16 chaîne approvisionnement. |
| S-29 | Serveur : Ubuntu Linux | N/A | N/A | 04 §2 | 1 | MVP | Implicite. VPS cité dans ADR D2. |
| S-30 | Reverse proxy : Nginx | N/A | N/A | 01 §1 | 1 | MVP | Maintenu/Migré en frontend (Cloudflare prend le relais CDN). |
| S-31 | Gestion du code : Git + GitHub | N/A | N/A | 06a §3 | 1 | MVP | Gitleaks et CI évoqués dans sécurité secrets. |
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
| A-07 | (Prix) 6kg: 16120 / Gaz: 3120 | Product | Catalogue | 01 §1 | - | À CONFIRMER | NON VÉRIFIÉ (Règle absolue : aucun prix métier inventé). |
| A-08 | (Prix) 12.5kg: 26500 / Gaz: 6500 | Product | Catalogue | 01 §1 | - | À CONFIRMER | NON VÉRIFIÉ. |
| A-09 | (Prix) 50kg: 76000 / Gaz: 26000 | Product | Catalogue | 01 §1 | - | À CONFIRMER | NON VÉRIFIÉ. |
| A-10 | (Services) Livraison 24h domicile | Order | Livraison | 01 §1 | - | À CONFIRMER | NON VÉRIFIÉ. Mentions logistiques à valider par PLEINGAZ. |
| A-11 | (Services) Livraison pro 6h | Order | Livraison | 01 §1 | - | À CONFIRMER | NON VÉRIFIÉ. |
| A-12 | (Services) Accompagnement revendeurs | Distributor | Inscription | 02 §3.3 | 1 | MVP | Processus KYC ajouté. |
| A-13 | (Force) Coordonnées claires +237... | N/A | Contact | AUCUN | - | À CONFIRMER | Numéro réel à confirmer, stocké en conf jamais en dur. |
| A-14 | (Faiblesse) Pas de statut temps réel | Inventory | Carte/Liste | 03 §1 | 1 | MVP | Au cœur du nouveau système "Digital Distribution Network". |
| A-15 | (Faiblesse) Carte basique sans géoloc. | Store | Carte | 04 §7 | 1 | MVP | Refonte avec PostGIS et Leaflet (ADR D3). |
| A-16 | (Faiblesse) Espace distributeur inexistant | Distributor | Dashboard | 02 §3.3 | 1 | MVP | Création d'un espace métier dédié. |
| A-17 | (Faiblesse) Pas de validation revendeur | Admin | KYC | 03 §2 | 1 | MVP | Validation obligatoire (Statut `APPROVED`) avant visibilité. |
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
| A-31 | (Info) Produits: Tables de cuisson | Product | Catalogue | 01 §1 | - | À CONFIRMER | NON VÉRIFIÉ (Hors périmètre strict du gaz ?). |
| A-32 | (Info) Produits: Régulateurs, Tuyaux | Product | Catalogue | 01 §1 | - | À CONFIRMER | NON VÉRIFIÉ (Accessoires). |
| A-33 | (Page) About | N/A | About | 02 §1 | Phase 2B | Plus tard | Contenu conservé, migration Phase 2B (06c). |
| A-34 | (Page) Products | N/A | Products | 02 §1 | Phase 2B | Plus tard | Contenu conservé, migration Phase 2B (06c). |
| A-35 | (Page) Services | N/A | Services | 02 §1 | Phase 2B | Plus tard | Contenu conservé, migration Phase 2B (06c). |
| A-36 | (Page) Our Points of Sale | N/A | Carte | 04 §7 | 1 | MVP | Remplacée par la recherche interactive "J'ai besoin de gaz". |
| A-37 | (Page) Contact | N/A | Contact | 02 §1 | Phase 2B | Plus tard | Contenu conservé, migration Phase 2B (06c). |
| A-38 | (Page) FAQ | N/A | FAQ | 02 §1 | Phase 2B | Plus tard | Contenu conservé, migration Phase 2B (06c). |
| A-39 | (Page) Blog | N/A | Blog | 02 §1 | Phase 2B | Plus tard | Contenu conservé, migration Phase 2B (06c). |
| A-40 | (Page) Your review | Review | Avis | 06c §1 | Phase 2B | Plus tard | Fonctionnalité d'avis (06c). |
| A-41 | (Slogan) Always Full Cylinders | N/A | Accueil | 01 §3 | 1 | MVP | Maintenu comme axe identitaire fort. |
| A-42 | (Engagements) Santé, femmes, jeunes | N/A | About | 02 §1 | Phase 2B | Plus tard | Contenus conservés, migration Phase 2B (06c). |
| A-43 | (Technique) HTTP/2 supporté | N/A | N/A | 04 §2 | 1 | MVP | Maintenu nativement via Cloudflare/Nginx. |
| A-44 | (SEO) Robots.txt / Sitemap erronés | N/A | SEO | 01 §11 | 1 | MVP | Correctif urgent isolé. |
| A-45 | (Perf) Objectif LCP < 2.5s | N/A | CI/CD | 04 §9 | 1 | MVP | Budgets de performance documentés en architecture. |

---

## BLOC 2 : Notes Vision (`02b-notes-vision.md`)
| ID | Exigence | Entité(s) | Écran(s) | Document(s) | Phase | Statut | Justification |
|---|---|---|---|---|---|---|---|
| N-01 | (Concept) Digital Distribution Network | N/A | N/A | 03 §1 | 1 | MVP | Concept central (passage d'un e-commerce classique à un réseau). |
| N-02 | (1) Disponibilité vérifiée, Màj, Distance | Inventory | Fiche | 02 §2.1 | 1 | MVP | Affichage clair de la fraîcheur ("Mise à jour : il y a 14 min"). |
| N-03 | (2) Géolocalisation non obligatoire (Texte seul) | N/A | Recherche | 05c §2 | 1 | MVP | Recherche textuelle (Quartier/Ville) via `pg_trgm` et `unaccent`. |
| N-04.1 | (3) Carte Publique (Où acheter) | Search | Carte | 02 §3 | 1 | MVP | Vue client. |
| N-04.2 | (3) Carte Distributeurs (Où sont mes revendeurs) | Admin | Carte | 02 §3.4 | 1 | MVP | Vue Admin pour la couverture réseau. |
| N-04.3 | (3) Carte Stock (Où y a-t-il du gaz) | Admin | Carte | 02 §3.4 | 1 | MVP | Vue Admin logistique. |
| N-04.4 | (3) Carte Demande (Où les clients recherchent) | Admin | Carte | 02 §3.4 | Phase 8 | Plus tard | Analytique spatiale avancée. |
| N-04.5 | (3) Carte Administrative (Où développer le réseau) | Admin | Carte | 02 §3.4 | Phase 8 | Plus tard | Aide à la décision stratégique. |
| N-05 | (4) Parcours "J'ai besoin de gaz" (Quel, Où, Dispo) | Search | Accueil | 06c §1 | 1 | MVP | Workflow direct sans passer par un catalogue lourd. |
| N-06 | (5) "Alertez-moi quand le gaz revient" | StockAlert | Produit | 05b §4 | 1 | MVP | Bouton d'opt-in sur les points en rupture. |
| N-07.1 | (6) État du stock : Bon stock | Inventory | Dashboard | 03 §1.2 | 1 | MVP | Indique une quantité saine. |
| N-07.2 | (6) État du stock : Stock faible | Inventory | Dashboard | 03 §1.2 | 1 | MVP | Indique un seuil d'alerte. |
| N-07.3 | (6) État du stock : Rupture | Inventory | Dashboard | 03 §1.2 | 1 | MVP | Épuisé, désactive les ventes. |
| N-08 | (7) Réapprovisionnement intelligent (Prévision) | WholesaleOrder| Dashboard | 06c §1 | Phase 2+ | Plus tard | IA/Historique non prioritaire pour le V1 du réseau. |
| N-09 | (8) Chatbot géographique et IA conversationnelle | Conversation| Chat | 05c §1 | Phase 8 | Plus tard | Chat complexe. |
| N-10 | (9) L'IA ne doit pas inventer (Tools internes) | API | Chat | 05c §2 | Phase 8 | Plus tard | Règle absolue implémentée via les JSON Schema Tools de l'IA. |
| N-11 | Architecture globale (Clients, Dist, Admin, API) | N/A | N/A | 04 §1 | 1 | MVP | Schéma d'architecture implémenté dans ADR. |
| N-12.1 | Identité facture: Vendeur final PLEINGAZ directe | Invoice | PDF | 05a §4 | 1 | MVP | Facturation en direct. |
| N-12.2 | Identité facture: Distributeur agréé Boutique ABC | Invoice | PDF | 05a §4 | 1 | MVP | Facturation déléguée pour la transparence client. |
| N-13 | Couche indépendante Payment Service (MoMo, OM) | Payment | Backend | 05a §1 | 1 | MVP | `PaymentProvider` interface pour brancher MTN/Orange Money. |
| N-14 | Produit 1 : PLEINGAZ CLIENT | N/A | Portail | 02 §3.2 | 1 | MVP | Parcours Acheteur défini. |
| N-15 | Produit 2 : PLEINGAZ DISTRIBUTEUR | N/A | Portail | 02 §3.3 | 1 | MVP | Parcours Vendeur défini. |
| N-16 | Produit 3 : PLEINGAZ CONTROL CENTER | Admin | Portail | 02 §3.4 | 1 | MVP | Parcours Super-Admin défini. |
| N-17 | Prochaine étape : Cahier des charges par écran | N/A | N/A | 06c §1 | 1 | Plus tard | Livrable `docs/screens/` à produire à la fin de la Phase 1. |

---

## BLOC 3a : Positionnement (`03-positionnement.md` - sections 1 à 9)
| ID | Exigence | Entité(s) | Écran(s) | Document(s) | Phase | Statut | Justification |
|---|---|---|---|---|---|---|---|
| P-01.1 | Positionnement: "Réseau numérique de distribution" | N/A | Accueil | 03 §1 | 1 | MVP | Vision globale acceptée. |
| P-01.2 | Trois produits (Client, Distributeur, Control Center) | N/A | Architecture | 03 §1 | 1 | MVP | Organisation des accès (ADR D1). |
| P-02.1 | Parcours central "J'ai besoin de gaz" | Search | Accueil | 06c §1 | 1 | MVP | Remplacera le catalogue statique. |
| P-02.2 | Choix du produit (6kg, 12.5kg, 50kg, accessoire) | Product | Recherche | 06c §1 | 1 | MVP | Options de base du formulaire. |
| P-02.3 | Choix localisation (GPS, ville, quartier, carte) | N/A | Recherche | 06c §1 | 1 | MVP | Flexibilité de géolocalisation. |
| P-02.4 | Choix besoin (acheter, livrer, itinéraire, appeler...) | N/A | Recherche | 06c §1 | 1 | MVP | Actions directes depuis la recherche. |
| P-02.5 | Affichage direct: distance, trajet, MàJ, horaires... | Store | Résultat | 06c §1 | 1 | MVP | Interface de résultats. |
| P-03.1 | Statut "Disponible" (récent) | Inventory | Fiche | 03 §1.2 | 1 | MVP | Transparence du stock. |
| P-03.2 | Statut "Stock limité" | Inventory | Fiche | 03 §1.2 | 1 | MVP | Transparence du stock. |
| P-03.3 | Statut "Rupture" | Inventory | Fiche | 03 §1.2 | 1 | MVP | Transparence du stock. |
| P-03.4 | Statut "Information ancienne" | Inventory | Fiche | 03 §1.2 | 1 | MVP | Gestion de la fraîcheur. |
| P-03.5 | Détails affichés: date/heure, produit, distributeur | Inventory | Fiche | 03 §1.2 | 1 | MVP | Preuve de la donnée. |
| P-03.6 | Alerte "M'avertir quand dispo" en cas de rupture | StockAlert | Fiche | 05b §4 | 1 | MVP | Outil de conversion (Notifications). |
| P-04.1 | Carte Publique (ville, stock, ouvert) | Search | Carte | 02 §3.2 | 1 | MVP | Carte frontend client. |
| P-04.2 | Carte Distributeurs (approuvés, zones) | Admin | Carte | 02 §3.4 | 1 | MVP | Supervision du réseau. |
| P-04.3 | Carte de stock (approvisionnement, rupture) | Admin | Carte | 02 §3.4 | 1 | MVP | Supervision logistique. |
| P-04.4 | Carte de demande (recherches, non satisfaites) | Admin | Carte | 02 §3.4 | Phase 8 | Plus tard | Analytique avancée. |
| P-04.5 | Carte stratégique (développement réseau, quartiers) | Admin | Carte | 02 §3.4 | Phase 8 | Plus tard | Stratégie d'entreprise. |
| P-05.1 | Géolocalisation facultative (demander ville si refus) | N/A | Recherche | 05c §2 | 1 | MVP | Respect vie privée. |
| P-05.2 | Géocodage + placement manuel pour distributeurs | Store | Inscription | 02 §3.3 | 1 | MVP | Précision des adresses. |
| P-06.1 | Routage intelligent multicritères (dispo, distance...) | Search | Résultat | 06c §1 | 1 | MVP | Algorithme de tri des résultats. |
| P-06.2 | Classement explicatif visible par le client | Search | Résultat | 06c §1 | 1 | MVP | Transparence algorithmique. |
| P-07.1 | Gestion du stock distributeur par produit | Inventory | Dashboard | 03 §1.2 | 1 | MVP | Base du système. |
| P-07.2 | Niveaux (Bon, Moyen, Faible, Rupture) | Inventory | Dashboard | 03 §1.2 | 1 | MVP | Version simplifiée du stock. |
| P-08.1 | Réappro intelligent: alerte distributeur | StockAlert | Dashboard | 06c §1 | Phase 2+ | Plus tard | Historique nécessaire. |
| P-08.2 | Réappro intelligent: détection risque côté Admin | Admin | ControlCenter | 06c §1 | Phase 2+ | Plus tard | Historique nécessaire. |
| P-09.1 | IA connectée aux données réelles (ne pas inventer) | API | Chat | 05c §2 | Phase 8 | Plus tard | Architecture Agentique stricte. |
| P-09.2 | Appel d'outils (find_nearest, check_availability...) | API | Chat | 05c §2 | Phase 8 | Plus tard | Tools JSON Schema. |
| P-09.3 | IA distingue info officielle vs estimation | API | Chat | 05c §2 | Phase 8 | Plus tard | Prompt engineering. |
