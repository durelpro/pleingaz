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
| P-06.06 | Routage : capacité de traitement | Pas de champ correspondant dans le modèle `Store`. | c. Écarté (trop complexe pour MVP). | Moi |
| P-06.09 | Routage : charge actuelle | Pas de champ dans le modèle. | c. Écarté (trop complexe pour MVP). | Moi |
| P-06.10 | Routage : taux de commandes honorées | Pas de statistiques calculées pour le routage. | c. Écarté (Phase 8). | Moi |
| P-06.12 | Routage : fiabilité des données | Pas de champ direct pour la fiabilité. | c. Écarté (Phase 8). | Moi |
| P-14.03 | Idée : Précommande | Hors périmètre défini dans `06c-mvp-pilote-roadmap.md`. | b. Écarté (complexité logistique). | Moi |
| P-14.04 | Idée : Commande groupée | Hors périmètre `06c`. | b. Écarté (trop complexe pour MVP). | Moi |
| P-14.08 | Idée : Signalement de problème | Hors périmètre `06c`. | b. Écarté (Plus tard). | Moi |
| P-14.09 | Idée : Liste d'attente par zone | Hors périmètre `06c`. | b. Écarté (Plus tard). | Moi |
| P-15.06 | Innovation : Signalement dispo erronée | Hors périmètre `06c`. | b. Écarté (Plus tard). | Moi |
| P-15.07 | Innovation : Réseau assisté | Hors périmètre `06c` (Business Intelligence). | b. Écarté (Phase 8). | Moi |
| P-17.23 | Livrable : plan reprise des données | Oubli lors de la phase 0. | a. L'ajouter à la roadmap 06c. | Moi |
| P-17.24 | Livrable : plan de sauvegarde | Oubli lors de la phase 0. | a. L'ajouter à la roadmap 06c. | Moi |

## INCOHÉRENCES IDENTIFIÉES
| ID | Écart | Document concerné | Correction proposée |
|---|---|---|---|
| S-13 | La stack source exige **Leaflet** en recommandé. L'ADR D3 ne tranche pas l'outil frontend. | `04-architecture-technique.md` | Ajouter "React Leaflet" formellement dans l'ADR D3. |
| Pages | Le maintien des pages existantes était listé, mais pas planifié explicitement. | `06c-mvp-pilote-roadmap.md` | Migration des pages ajoutée à la Phase 2B (correction effectuée). |

## DÉCISIONS DU PROPRIÉTAIRE
- **Mobile Money** : Sandbox en phase 6, le pilote démarre avec le paiement en présentiel confirmé par code.
- **Exigences écartées** : Aucune exigence de la vision n'a été écartée sans décision explicite du propriétaire.

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
| S-21 | Temps réel : WebSocket / Socket.IO | N/A | N/A | 06c §1, 04 §1 | Phase future | Plus tard | Non prioritaire pour le MVP. |
| S-22 | Recherche initiale : PostgreSQL | N/A | Recherche | 04 §4 | 1 | MVP | Choisi via pg_trgm pour le MVP (04 §4). |
| S-23 | Recherche avancée : OpenSearch | N/A | Recherche | 04 §4 | Phase future | Plus tard | Remplacé par PostgreSQL pour limiter les coûts initiaux. |
| S-24 | IA : LLM + RAG + outils internes | Conversation | Chat IA | 05c §2 | Phase 8 | Plus tard | Modèles LLM reportés après lancement pour des raisons de coût. |
| S-25 | Tests unitaires : Jest | N/A | N/A | 06b §1 | 1 | MVP | Obligatoire dans la matrice de qualité. |
| S-26 | Tests API : Supertest | N/A | N/A | 06b §1 | 1 | MVP | Exigé pour valider l'API backend. |
| S-27 | Tests navigateur : Playwright | N/A | E2E | 06b §1 | 1 | MVP | Exigé pour le frontend et les coupures réseau. |
| S-28 | Conteneurisation : Docker + Compose | N/A | N/A | 06a M16 | 1 | MVP | Utilisé en prévention M16 chaîne approvisionnement. |
| S-29 | Serveur : Ubuntu Linux | N/A | N/A | 04 §2 | 1 | MVP | Implicite. VPS cité dans ADR D2. |
| S-30 | Reverse proxy : Nginx | N/A | N/A | 01 §1 | 1 | MVP | Maintenu/Migré en frontend (Cloudflare prend le relais CDN). |
| S-31 | Gestion du code : Git + GitHub | N/A | N/A | 06a §3 | 1 | MVP | Gitleaks et CI évoqués dans sécurité secrets. |
| S-32 | Monitoring : Sentry + Uptime Kuma | Log | N/A | 06c §1, 04 §1 | 1 | MVP | Outils de surveillance inclus dans le plan d'infrastructure. |

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
| A-19 | (Faiblesse) Commande dist. -> PLEINGAZ | WholesaleOrder | B2B | 06c §1, 04 §1 | Phase 2+ | Plus tard | 06c H01 |
| A-20 | (Faiblesse) Paiement Mobile Money absent | Payment | Checkout | 05a §1 | 1 | MVP | Intégration MTN/Orange Money avec gestion asynchrone. |
| A-21 | (Faiblesse) Facturation automatique absente | Invoice | Checkout | 05a §4 | 1 | MVP | Génération de PDF et numérotation séquentielle. |
| A-22 | (Faiblesse) Assistant IA / Chat absent | Conversation | Chat | 05c §1 | Phase 8 | Plus tard | LLM trop complexe pour le MVP (06c §3). |
| A-23 | (Faiblesse) Notifications alertes stock | StockAlert | Mobile | 05b §4 | 1 | MVP | Inscription et alertes push SMS/WhatsApp prévues. |
| A-24 | (Faiblesse) Administration/Supervision | Admin | ControlCenter | 02 §3.4 | 1 | MVP | Tableau de bord de supervision créé. |
| A-25 | (Faiblesse) Badges de confiance / fraude | Store | Fiche | 02 §2.1 | 1 | MVP | Badges distributeur validé et fraîcheur de la donnée. |
| A-26 | (Faiblesse) Parcours "J'ai besoin de gaz" | Search | Accueil | 06c §1, 04 §1 | 1 | MVP | Cas d'usage principal du MVP (Recherche proximité). |
| A-27 | (Faiblesse) Design trop "brochure" | N/A | Accueil | 04 §6 | 1 | MVP | Passage d'un site vitrine à une application web interactive. |
| A-28 | (Faiblesse) Hiérarchie actions prioritaire | N/A | Accueil | 02 §3 | 1 | MVP | Centrage sur le moteur de recherche et la localisation. |
| A-29 | (Faiblesse) Optimisation connexions instables | N/A | Toutes | 04 §6 | 1 | MVP | Mode PWA et skeleton loaders spécifiés. |
| A-30 | (Info) Protection anti-bot Cloudflare | N/A | N/A | 04 §2 | 1 | MVP | Intégration CDN Cloudflare proposée (ADR D2). |
| A-31 | (Info) Produits: Tables de cuisson | Product | Catalogue | 01 §1 | - | À CONFIRMER | NON VÉRIFIÉ (Hors périmètre strict du gaz ?). |
| A-32 | (Info) Produits: Régulateurs, Tuyaux | Product | Catalogue | 01 §1 | - | À CONFIRMER | NON VÉRIFIÉ (Accessoires). |
| A-33 | (Page) About | N/A | About | 02 §1 | Phase 2B | Plus tard | 06c H01 |
| A-34 | (Page) Products | N/A | Products | 02 §1 | Phase 2B | Plus tard | 06c H01 |
| A-35 | (Page) Services | N/A | Services | 02 §1 | Phase 2B | Plus tard | 06c H01 |
| A-36 | (Page) Our Points of Sale | N/A | Carte | 04 §7 | 1 | MVP | Remplacée par la recherche interactive "J'ai besoin de gaz". |
| A-37 | (Page) Contact | N/A | Contact | 02 §1 | Phase 2B | Plus tard | 06c H01 |
| A-38 | (Page) FAQ | N/A | FAQ | 02 §1 | Phase 2B | Plus tard | 06c H01 |
| A-39 | (Page) Blog | N/A | Blog | 02 §1 | Phase 2B | Plus tard | 06c H01 |
| A-40 | (Page) Your review | Review | Avis | 06c §1, 04 §1 | Phase 2B | Plus tard | 06c H01 |
| A-41 | (Slogan) Always Full Cylinders | N/A | Accueil | 01 §3 | 1 | MVP | Maintenu comme axe identitaire fort. |
| A-42 | (Engagements) Santé, femmes, jeunes | N/A | About | 02 §1 | Phase 2B | Plus tard | 06c H01 |
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
| N-05 | (4) Parcours "J'ai besoin de gaz" (Quel, Où, Dispo) | Search | Accueil | 06c §1, 04 §1 | 1 | MVP | Workflow direct sans passer par un catalogue lourd. |
| N-06 | (5) "Alertez-moi quand le gaz revient" | StockAlert | Produit | 05b §4 | 1 | MVP | Bouton d'opt-in sur les points en rupture. |
| N-07.1 | (6) État du stock : Bon stock | Inventory | Dashboard | 03 §1.2 | 1 | MVP | Indique une quantité saine. |
| N-07.2 | (6) État du stock : Stock faible | Inventory | Dashboard | 03 §1.2 | 1 | MVP | Indique un seuil d'alerte. |
| N-07.3 | (6) État du stock : Rupture | Inventory | Dashboard | 03 §1.2 | 1 | MVP | Épuisé, désactive les ventes. |
| N-08 | (7) Réapprovisionnement intelligent (Prévision) | WholesaleOrder | Dashboard | 06c §1, 04 §1 | Phase 2+ | Plus tard | 06c H01 |
| N-09 | (8) Chatbot géographique et IA conversationnelle | Conversation | Chat | 05c §1 | Phase 8 | Plus tard | Chat complexe. |
| N-10 | (9) L'IA ne doit pas inventer (Tools internes) | API | Chat | 05c §2 | Phase 8 | Plus tard | Règle absolue implémentée via les JSON Schema Tools de l'IA. |
| N-11 | Architecture globale (Clients, Dist, Admin, API) | N/A | N/A | 04 §1 | 1 | MVP | Schéma d'architecture implémenté dans ADR. |
| N-12.1 | Identité facture: Vendeur final PLEINGAZ directe | Invoice | PDF | 05a §4 | 1 | MVP | Facturation en direct. |
| N-12.2 | Identité facture: Distributeur agréé Boutique ABC | Invoice | PDF | 05a §4 | 1 | MVP | Facturation déléguée pour la transparence client. |
| N-13 | Couche indépendante Payment Service (MoMo, OM) | Payment | Backend | 05a §1 | 1 | MVP | `PaymentProvider` interface pour brancher MTN/Orange Money. |
| N-14 | Produit 1 : PLEINGAZ CLIENT | N/A | Portail | 02 §3.2 | 1 | MVP | Parcours Acheteur défini. |
| N-15 | Produit 2 : PLEINGAZ DISTRIBUTEUR | N/A | Portail | 02 §3.3 | 1 | MVP | Parcours Vendeur défini. |
| N-16 | Produit 3 : PLEINGAZ CONTROL CENTER | Admin | Portail | 02 §3.4 | 1 | MVP | Parcours Super-Admin défini. |
| N-17 | Prochaine étape : Cahier des charges par écran | N/A | N/A | 06c §1, 04 §1 | 1 | Plus tard | Livrable `docs/screens/` à produire à la fin de la Phase 1. |

---

## BLOC 3a : Positionnement (`03-positionnement.md` - sections 1 à 9)
| ID | Exigence | Entité(s) | Écran(s) | Document(s) | Phase | Statut | Justification |
|---|---|---|---|---|---|---|---|
| P-01.01 | (1) Positionnement : Réseau numérique | N/A | Accueil | 03 §1 | 1 | MVP | Vision. |
| P-01.02 | (1) Produit : PLEINGAZ Client | User | Portail | 03 §1 | 1 | MVP | ADR D1. |
| P-01.03 | (1) Produit : PLEINGAZ Distributeur | Distributor | Portail | 03 §1 | 1 | MVP | ADR D1. |
| P-01.04 | (1) Produit : PLEINGAZ Control Center | Admin | Portail | 03 §1 | 1 | MVP | ADR D1. |
| P-02.01 | (2) Parcours central J'ai besoin de gaz | Search | Accueil | 06c §1, 04 §1 | 1 | MVP | Remplacera le catalogue. |
| P-02.02 | (2) Choix du produit (regroupe 5 puces : 6 kg, 12,5 kg, 50 kg, accessoire, autre produit) | Product | Recherche | 06c §1, 04 §1 | 1 | MVP | Options du formulaire. |
| P-02.03 | (2) Choix loc. (regroupe 4 puces : autoriser géoloc, saisir ville, saisir quartier, zone sur carte) | N/A | Recherche | 06c §1, 04 §1 | 1 | MVP | Options GPS/Manuelles. |
| P-02.04 | (2) Choix besoin (regroupe 6 puces : sur place, livraison, itinéraire, appeler, WhatsApp, alerte retour stock) | N/A | Recherche | 06c §1, 04 §1 | 1 | MVP | Actions possibles. |
| P-02.05 | (2) Affichage direct 1/2 (regroupe 6 puces : points de vente, distance, temps trajet, MàJ, horaires, prix) | Store | Résultat | 06c §1, 04 §1 | 1 | MVP | Données affichées. |
| P-02.06 | (2) Affichage direct 2/2 (regroupe 4 puces : livraison, tel, WhatsApp, statut officiel) | Store | Résultat | 06c §1, 04 §1 | 1 | MVP | Données affichées. |
| P-03.01 | (3) Statut: 🟢 Disponible | Inventory | Fiche | 03 §3 | 1 | MVP | Transparence du stock. |
| P-03.02 | (3) Statut: 🟠 Stock limité | Inventory | Fiche | 03 §3 | 1 | MVP | Transparence du stock. |
| P-03.03 | (3) Statut: 🔴 Rupture | Inventory | Fiche | 03 §3 | 1 | MVP | Transparence du stock. |
| P-03.04 | (3) Statut: ⚪ Information ancienne | Inventory | Fiche | 03 §3 | 1 | MVP | Gestion de la fraîcheur. |
| P-03.05 | (3) Affichage obligatoire (regroupe 4 puces : date MàJ, heure, produit, distributeur) | Inventory | Fiche | 03 §3 | 1 | MVP | Preuve de donnée. |
| P-03.06 | (3) Alerte rupture: 'M'avertir quand dispo' | StockAlert | Fiche | 05b §4 | 1 | MVP | Outil de conversion. |
| P-03.07 | (3) Liaison alerte (regroupe 5 puces : compte, téléphone, point de vente, zone, produit) | StockAlert | Fiche | 05b §4 | 1 | MVP | Options de l'alerte. |
| P-04.01 | (4) Carte Publique 1/2 (regroupe 6 puces : point de vente, quartier, ville, produit, ouvert, stock) | Search | Carte | 02 §3.2 | 1 | MVP | Filtres. |
| P-04.02 | (4) Carte Publique 2/2 (regroupe 1 puce : boutique qui livre) | Search | Carte | 02 §3.2 | 1 | MVP | Filtres. |
| P-04.03 | (4) Carte Distributeurs 1/2 (regroupe 6 puces : approuvés, attente, suspendus, peu couvertes, dispo, inactifs) | Admin | Carte | 02 §3.4 | 1 | MVP | Supervision. |
| P-04.04 | (4) Carte Distributeurs 2/2 (regroupe 1 puce : sans MàJ) | Admin | Carte | 02 §3.4 | 1 | MVP | Supervision. |
| P-04.05 | (4) Carte Stock (regroupe 4 puces : bien approv, faible, rupture, sans donnée) | Admin | Carte | 02 §3.4 | 1 | MVP | Logistique. |
| P-04.06 | (4) Carte Demande (regroupe 5 puces : recherches, sans stock, commandes, répétées, forte demande) | Admin | Carte | 02 §3.4 | Phase 8 | Plus tard | Analytique. |
| P-04.07 | (4) Carte Stratégique (regroupe 5 puces : sous-desservis, nouveau distributeur, proche dépôt, demande augmente, délais élevés) | Admin | Carte | 02 §3.4 | Phase 8 | Plus tard | Aide décision. |
| P-05.01 | (5) Géoloc si acceptée (regroupe 6 puces : points proches, distance, horaires, stock, livraison, itinéraire) | Search | Résultat | 06c §1, 04 §1 | 1 | MVP | Proximité. |
| P-05.02 | (5) Géoloc si refusée: 'Dans quelle ville/quartier' | N/A | Recherche | 05c §2 | 1 | MVP | Respect vie privée. |
| P-05.03 | (5) Géoloc distributeur (regroupe 6 étapes : recherche, géocodage, déplace marqueur, confirme, lat/lng, validation) | Store | Inscription | 02 §3.3 | 1 | MVP | Précision. |
| P-06.01 | (6) Routage: disponibilité | Inventory | Résultat | 06c §1, 04 §1 | Phase 2+ | Plus tard | 06c H01 |
| P-06.02 | (6) Routage: ancienneté MàJ | Inventory | Résultat | 06c §1, 04 §1 | Phase 2+ | Plus tard | 06c H01 |
| P-06.03 | (6) Routage: distance | Search | Résultat | 06c §1, 04 §1 | Phase 2+ | Plus tard | 06c H01 |
| P-06.04 | (6) Routage: temps | Search | Résultat | 06c §1, 04 §1 | Phase 2+ | Plus tard | 06c H01 |
| P-06.05 | (6) Routage: horaires | Store | Résultat | 06c §1, 04 §1 | Phase 2+ | Plus tard | 06c H01 |
| P-06.06 | (6) Routage: capacité traitement | N/A | Résultat | AUCUN | - | Écarté | Pas de champ dans le modèle. |
| P-06.07 | (6) Routage: livraison | Store | Résultat | 06c §1, 04 §1 | Phase 2+ | Plus tard | 06c H01 |
| P-06.08 | (6) Routage: zone desservie | Store | Résultat | 06c §1, 04 §1 | Phase 2+ | Plus tard | 06c H01 |
| P-06.09 | (6) Routage: charge actuelle | N/A | Résultat | AUCUN | - | Écarté | Pas de champ dans le modèle. |
| P-06.10 | (6) Routage: taux commandes | N/A | Résultat | AUCUN | - | Écarté | Pas de champ dans le modèle. |
| P-06.11 | (6) Routage: statut distributeur | Store | Résultat | 06c §1, 04 §1 | Phase 2+ | Plus tard | 06c H01 |
| P-06.12 | (6) Routage: fiabilité données | N/A | Résultat | AUCUN | - | Écarté | Pas de champ direct. |
| P-06.13 | (6) Classement explicatif visible ('Recommandé car...') | Search | Résultat | 06c §1, 04 §1 | 1 | MVP | Transparence client. |
| P-07.01 | (7) Gestion stock par produit (regroupe 3 produits : 6 kg, 12,5 kg, 50 kg) | Inventory | Dashboard | 03 §1.2 | 1 | MVP | Base stock. |
| P-07.02 | (7) Niveaux de stock (regroupe 4 puces : bon, moyen, faible, rupture) | Inventory | Dashboard | 03 §1.2 | 1 | MVP | Simplifié. |
| P-07.03 | (7) Évolutions stock (regroupe 6 puces : qt dispo, qt réservée, seuil alerte, stock physique, stock estimé, date réappro) | Inventory | Dashboard | 03 §1.2 | Phase 2+ | Plus tard | 06c H01 |
| P-08.01 | (8) Actions distr. risque (regroupe 4 puces : commander, modifier, ignorer, contacter) | WholesaleOrder | Dashboard | 06c §1, 04 §1 | Phase 2+ | Plus tard | 06c H01 |
| P-08.02 | (8) Alertes Admin (regroupe 5 critères : bon->faible->rupture, commandes augmentent, recherches augmentent, pas MàJ, délai dépassé) | StockAlert | ControlCenter | 06c §1, 04 §1 | Phase 2+ | Plus tard | 06c H01 |
| P-09.01 | (9) IA workflow (regroupe 5 étapes : produit, zone, recherche, bdd, réponse) | API | Chat | 05c §2 | Phase 8 | Plus tard | Architecture LLM. |
| P-09.02 | (9) IA outils 1/2 (regroupe 6 outils : find_nearest, check_product, find_open, get_store, get_order, get_invoice) | API | Chat | 05c §2 | Phase 8 | Plus tard | Schema. |
| P-09.03 | (9) IA outils 2/2 (regroupe 2 outils : create_alert, contact) | API | Chat | 05c §2 | Phase 8 | Plus tard | Schema. |
| P-09.04 | (9) IA classification (regroupe 5 puces : officielle, dynamique, non dispo, estimation, recommandation) | API | Chat | 05c §2 | Phase 8 | Plus tard | Qualité. |

## BLOC 3b : Positionnement (`03-positionnement.md` - sections 10 à 18)
| ID | Exigence | Entité(s) | Écran(s) | Document(s) | Phase | Statut | Justification |
|---|---|---|---|---|---|---|---|
| P-10.01 | (10) Architecture globale 1/2 (regroupe 6 blocs : Clients, Distributeurs, Admin, Backend/API, Base, Paiements) | N/A | N/A | 04 §1 | 1 | MVP | Diagramme. |
| P-10.02 | (10) Architecture globale 2/2 (regroupe 4 blocs : Cartes, IA, Notifs, BI) | N/A | N/A | 04 §1 | 1 | MVP | Diagramme. |
| P-11.01 | (11) Produit 1 Client parcours (regroupe 6 étapes : Rechercher, Trouver, Vérifier, Choisir, Commander, Payer) | N/A | Portail | 02 §3.2 | 1 | MVP | Cycle e-commerce. |
| P-11.02 | (11) Produit 1 Client parcours suite (regroupe 4 étapes : Suivre, Recevoir, Télécharger, Évaluer) | N/A | Portail | 02 §3.2 | 1 | MVP | Cycle e-commerce. |
| P-11.03 | (11) Produit 1 Client fonctions (regroupe 6 puces : recherche, dispo, carte, panier, cmd, livraison) | N/A | Portail | 02 §3.2 | 1 | MVP | Features. |
| P-11.04 | (11) Produit 1 Client fonctions suite (regroupe 6 puces : paiement, facture, whatsapp, assistance, favoris, alertes) | N/A | Portail | 02 §3.2 | 1 | MVP | Features. |
| P-11.05 | (11) Produit 2 Distr. fonctions (regroupe 6 puces : inscription, dossier, validation, boutique, localisation, horaires) | N/A | Portail | 02 §3.3 | 1 | MVP | Features vendeur. |
| P-11.06 | (11) Produit 2 Distr. fonctions suite (regroupe 6 puces : stock, réception cmd, cmd PLEINGAZ, factures, stats, conversation) | N/A | Portail | 02 §3.3 | 1 | MVP | Features vendeur. |
| P-11.07 | (11) Produit 2 Distr. fonctions (regroupe 1 puce : alertes) | N/A | Portail | 02 §3.3 | 1 | MVP | Features vendeur. |
| P-11.08 | (11) Produit 3 Admin (regroupe 6 puces : validation, supervision, produits, prix, commandes, paiements) | Admin | Portail | 02 §3.4 | 1 | MVP | Features admin. |
| P-11.09 | (11) Produit 3 Admin suite (regroupe 6 puces : factures, livraisons, support, carte, heatmap, prévision) | Admin | Portail | 02 §3.4 | 1 | MVP | Features admin. |
| P-11.10 | (11) Produit 3 Admin suite 2 (regroupe 3 puces : rapports, audit, config IA) | Admin | Portail | 02 §3.4 | 1 | MVP | Features admin. |
| P-12.01 | (12) Identité vendeur (regroupe 2 cas : Vente directe, Distributeur agréé) | Invoice | PDF | 05a §4 | 1 | MVP | Conformité. |
| P-12.02 | (12) Champs facture 1/3 (regroupe 6 puces : numéro, réf, vendeur, acheteur, produits, qt) | Invoice | PDF | 05a §4 | 1 | MVP | PDF. |
| P-12.03 | (12) Champs facture 2/3 (regroupe 6 puces : prix, livraison, total, mode paie, statut paie, date) | Invoice | PDF | 05a §4 | 1 | MVP | PDF. |
| P-12.04 | (12) Champs facture 3/3 (regroupe 1 puce : info fiscales) | Invoice | PDF | 05a §4 | 1 | MVP | PDF. |
| P-13.01 | (13) Paiement provider : MTN | Payment | Checkout | 05a §1 | 1 | MVP | Omnicanal. |
| P-13.02 | (13) Paiement provider : Orange | Payment | Checkout | 05a §1 | 1 | MVP | Omnicanal. |
| P-13.03 | (13) Paiement provider : Présentiel | Payment | Checkout | 05a §1 | 1 | MVP | Omnicanal. |
| P-13.04 | (13) Principes (regroupe 6 puces : traitement serveur, id transac, conf serveur, webhook, vérif statut, idempotence) | Payment | API | 05a §1 | 1 | MVP | Sécurité. |
| P-13.05 | (13) Principes suite (regroupe 4 puces : journal, échoués, prévention doublons, rapprochement) | Payment | API | 05a §1 | 1 | MVP | Sécurité. |
| P-14.01 | (14) Idée: Retour en stock | StockAlert | Mobile | 05b §4 | 1 | MVP | Validée. |
| P-14.02 | (14) Idée: Stock non actualisé | Inventory | Fiche | 03 §1.2 | 1 | MVP | Validée. |
| P-14.03 | (14) Idée: Précommande | Order | Checkout | AUCUN | - | Écarté | Hors scope 06c. |
| P-14.04 | (14) Idée: Commande groupée | Order | Checkout | AUCUN | - | Écarté | Hors scope 06c. |
| P-14.05 | (14) Idée: Mode faible connexion | N/A | PWA | 04 §6 | 1 | MVP | PWA. |
| P-14.06 | (14) Idée: Paiement livraison contrôlé | Payment | Checkout | 05a §1 | 1 | MVP | Cash. |
| P-14.07 | (14) Idée: Centre de confiance (badge) | Store | Fiche | 02 §2.1 | 1 | MVP | KYC. |
| P-14.08 | (14) Idée: Signalement problème | Issue | Fiche | AUCUN | - | Écarté | Hors scope 06c. |
| P-14.09 | (14) Idée: Liste attente par zone | StockAlert | Carte | AUCUN | - | Écarté | Hors scope 06c. |
| P-14.10 | (14) Idée: Mode agent/revendeur assisté | Order | WhatsApp | 06c §1, 04 §1 | Phase 2B | Plus tard | 06c H01 |
| P-15.01 | (15) Innovation: Commande assistée | Order | API | 06c §1, 04 §1 | Phase 2B | Plus tard | 06c H01 |
| P-15.02 | (15) Innovation: Mode faible connexion | N/A | UI | 04 §6 | 1 | MVP | Optimisation. |
| P-15.03 | (15) Innovation: Vérification stock (bouton simple) | Inventory | Dashboard | 03 §1.2 | 1 | MVP | UX. |
| P-15.04 | (15) Innovation: Score fraîcheur | Inventory | Fiche | 03 §1.2 | 1 | MVP | Confiance. |
| P-15.05 | (15) Innovation: Réservation temporaire (30 min) | Order | Checkout | 03 §2 | 1 | MVP | Gestion stock. |
| P-15.06 | (15) Innovation: Signalement dispo erronée | Issue | Fiche | AUCUN | - | Écarté | Hors scope. |
| P-15.07 | (15) Innovation: Réseau assisté | Admin | ControlCenter | AUCUN | - | Écarté | Hors scope. |
| P-16.01 | (16) Roadmap 1/2 (regroupe 6 phases : Phase 0, Phase 1, Phase 2, Phase 3, Phase 4, Phase 5) | N/A | N/A | 06c §1, 04 §1 | 1 | MVP | Structuration. |
| P-16.02 | (16) Roadmap 2/2 (regroupe 4 phases : Phase 6, Phase 7, Phase 8, Phase 9) | N/A | N/A | 06c §1, 04 §1 | 1 | MVP | Structuration. |
| P-17.01 | (17) Livrable: audit | N/A | N/A | 01 | 1 | MVP | Fait |
| P-17.02 | (17) Livrable: inventaire | N/A | N/A | 02 | 1 | MVP | Fait |
| P-17.03 | (17) Livrable: architecture technique existante | N/A | N/A | 04 | 1 | MVP | Fait |
| P-17.04 | (17) Livrable: architecture cible | N/A | N/A | 04 | 1 | MVP | Fait |
| P-17.05 | (17) Livrable: stratégie de migration | N/A | N/A | 06c §1, 04 §1 | Phase 2B | Plus tard | 06c H01 |
| P-17.06 | (17) Livrable: sitemap | N/A | N/A | 02 | 1 | MVP | Fait |
| P-17.07 | (17) Livrable: parcours client | N/A | N/A | 02 | 1 | MVP | Fait |
| P-17.08 | (17) Livrable: parcours distributeur | N/A | N/A | 02 | 1 | MVP | Fait |
| P-17.09 | (17) Livrable: parcours administrateur | N/A | N/A | 02 | 1 | MVP | Fait |
| P-17.10 | (17) Livrable: matrice des rôles | N/A | N/A | 02 | 1 | MVP | Fait |
| P-17.11 | (17) Livrable: modèle de données | N/A | N/A | 03 | 1 | MVP | Fait |
| P-17.12 | (17) Livrable: architecture API | N/A | N/A | 04 | 1 | MVP | Fait |
| P-17.13 | (17) Livrable: architecture frontend | N/A | N/A | 04 | 1 | MVP | Fait |
| P-17.14 | (17) Livrable: architecture de paiement | N/A | N/A | 05a | 1 | MVP | Fait |
| P-17.15 | (17) Livrable: architecture cartographique | N/A | N/A | 04 | 1 | MVP | Fait |
| P-17.16 | (17) Livrable: architecture IA | N/A | N/A | 05c | Phase 8 | Plus tard | Fait |
| P-17.17 | (17) Livrable: architecture de notifications | N/A | N/A | 05b | 1 | MVP | Fait |
| P-17.18 | (17) Livrable: plan de sécurité | N/A | N/A | 06a | 1 | MVP | Fait |
| P-17.19 | (17) Livrable: plan de tests | N/A | N/A | 06b | 1 | MVP | Fait |
| P-17.20 | (17) Livrable: roadmap | N/A | N/A | 06c §1, 04 §1 | 1 | MVP | Fait |
| P-17.21 | (17) Livrable: priorisation MVP | N/A | N/A | 06c §1, 04 §1 | 1 | MVP | Fait |
| P-17.22 | (17) Livrable: estimation de complexité | N/A | N/A | 06c §1, 04 §1 | 1 | MVP | Fait |
| P-17.23 | (17) Livrable: plan de reprise des données | N/A | N/A | AUCUN | - | Écarté | Hors MVP. |
| P-17.24 | (17) Livrable: plan de sauvegarde et restauration | N/A | N/A | AUCUN | - | Écarté | Hors MVP. |
| P-18.01 | (18) Audit Constaté 1/2 (regroupe 6 puces : pages, textes, images, formulaires, liens, fonctionnalités) | N/A | N/A | 01 §1 | 1 | MVP | Phase 0. |
| P-18.02 | (18) Audit Constaté 2/2 (regroupe 2 puces : technologies, performances) | N/A | N/A | 01 §1 | 1 | MVP | Phase 0. |
| P-18.03 | (18) Audit Recommandé 1/2 (regroupe 6 puces : recherche, carte, stock, commandes, paiement, IA) | N/A | N/A | 01 §1 | 1 | MVP | Phase 0. |
| P-18.04 | (18) Audit Recommandé 2/2 (regroupe 2 puces : espace distr, back-office) | N/A | N/A | 01 §1 | 1 | MVP | Phase 0. |
| P-18.05 | (18) Audit À Confirmer 1/2 (regroupe 6 puces : prix, horaires, livraison, données off, identité, règles) | N/A | N/A | 01 §1 | 1 | MVP | Client. |
| P-18.06 | (18) Audit À Confirmer 2/2 (regroupe 4 puces : paiement, légal, confid, retours) | N/A | N/A | 01 §1 | 1 | MVP | Client. |
| P-18.07 | (18) 4 promesses (regroupe 4 puces : trouver, vérifier, commander, piloter) | N/A | Accueil | 03 §1 | 1 | MVP | Stratégie. |
## BLOC V (`02-vision-prompt.md`)
| ID | Exigence | Entité(s) | Écran(s) | Document(s) | Phase | Statut | Justification |
|---|---|---|---|---|---|---|---|
| V-00.01 | (0) analyser le site existant | N/A | N/A | 01 §1 | 0 | MVP | 06c M01 |
| V-00.02 | (0) comprendre son architecture, son contenu, son identité | N/A | N/A | 01 §1 | 0 | MVP | 06c M01 |
| V-00.03 | (0) identifier ses forces et faiblesses | N/A | N/A | 01 §1 | 0 | MVP | 06c M01 |
| V-00.04 | (0) conserver les éléments pertinents | N/A | N/A | 01 §1 | 0 | MVP | 06c M01 |
| V-00.05 | (0) moderniser profondément l'expérience | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-00.06 | (0) ajouter les fonctionnalités décrites ci-dessous | N/A | N/A | 06c §1, 04 §1 | 2 | MVP | 06c M01 |
| V-00.07 | (0) proposer des innovations supplémentaires | N/A | N/A | 06c §1, 04 §1 | 2 | MVP | 06c M01 |
| V-00.08 | (0) construire une architecture exploitable | N/A | N/A | 04 §1 | 2 | MVP | 06c M01 |
| V-00.09 | (0) contrainte : pas un site totalement différent | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-00.10 | (0) objectif final : véritable plateforme numérique | N/A | N/A | 02 §1 | 2 | MVP | 06c M01 |
| V-01.01 | (1) Le point d'accès numérique officiel | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-01.02 | (1) visiteurs de découvrir PLEINGAZ | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-01.03 | (1) particuliers d'acheter du gaz et des accessoires | N/A | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-01.04 | (1) clients de créer un compte | User | N/A | 02 §3.2 | 2 | MVP | 06c M01 |
| V-01.05 | (1) revendeurs de créer leur espace professionnel | DistributorProfile | N/A | 02 §3.3 | 2 | MVP | 06c M01 |
| V-01.06 | (1) distributeurs de demander leur référencement | DistributorApplication | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-01.07 | (1) administrateurs de valider les distributeurs | DistributorApplication | N/A | 02 §3.4 | 2 | MVP | 06c M01 |
| V-01.08 | (1) clients de rechercher les points de vente proches | N/A | N/A | 05c §1 | 2 | MVP | 06c M01 |
| V-01.09 | (1) clients de connaître la disponibilité du gaz | Inventory | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-01.10 | (1) clients de commander | Order | N/A | 03 §2 | 2 | MVP | 06c M01 |
| V-01.11 | (1) clients de se faire livrer | Delivery | N/A | 03 §2 | 2 | MVP | 06c M01 |
| V-01.12 | (1) distributeurs de passer leurs propres commandes | DistributorOrder | N/A | 03 §2 | 5 | Plus tard | 06c H02 |
| V-01.13 | (1) de générer automatiquement des factures | Invoice | N/A | 05a §1 | 2 | MVP | 06c M01 |
| V-01.14 | (1) de payer en ligne ou en présentiel | Payment | N/A | 05a §1 | 2 | MVP | 06c M01 |
| V-01.15 | (1) de communiquer avec PLEINGAZ | Conversation | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-01.16 | (1) d'utiliser un assistant IA | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-01.17 | (1) de contacter rapidement PLEINGAZ via WhatsApp | N/A | N/A | 06c §1, 04 §1 | 3 | MVP | 06c M01 |
| V-01.18 | (1) superviser toute son activité | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M01 |
| V-01.19 | (1) pensée pour le contexte camerounais | N/A | N/A | 04 §1 | 2 | MVP | 06c M01 |
| V-02.01 | (2) NE PAS ajouter des fonctionnalités au hasard | N/A | N/A | 02 §1 | Transversal | MVP | 06c M01 |
| V-02.02 | (2) répondre à un problème réel | N/A | N/A | 02 §1 | Transversal | MVP | 06c M01 |
| V-02.03 | (2) priorité 1. simplicité | N/A | N/A | 02 §1 | Transversal | MVP | 06c M01 |
| V-02.04 | (2) priorité 2. rapidité | N/A | N/A | 04 §1 | Transversal | MVP | 06c M01 |
| V-02.05 | (2) priorité 3. confiance | N/A | N/A | 06a §1 | Transversal | MVP | 06c M01 |
| V-02.06 | (2) priorité 4. disponibilité du gaz | N/A | N/A | 03 §1 | Transversal | MVP | 06c M01 |
| V-02.07 | (2) priorité 5. proximité géographique | N/A | N/A | 03 §1 | Transversal | MVP | 06c M01 |
| V-02.08 | (2) priorité 6. sécurité | N/A | N/A | 06a §1 | Transversal | MVP | 06c M01 |
| V-02.09 | (2) priorité 7. transparence | N/A | N/A | 07 §1 | Transversal | MVP | 06c M01 |
| V-02.10 | (2) priorité 8. traçabilité | N/A | N/A | 06a §1 | Transversal | MVP | 06c M01 |
| V-02.11 | (2) priorité 9. automatisation | N/A | N/A | 04 §1 | Transversal | MVP | 06c M01 |
| V-02.12 | (2) priorité 10. expérience mobile-first | N/A | N/A | 04 §1 | Transversal | MVP | 06c M01 |
| V-02.13 | (2) smartphones Android | N/A | N/A | 04 §1 | Transversal | MVP | 06c M01 |
| V-02.14 | (2) connexions Internet faibles ou instables | N/A | N/A | 04 §1 | Transversal | MVP | 06c M01 |
| V-02.15 | (2) écrans de petite taille | N/A | N/A | 04 §1 | Transversal | MVP | 06c M01 |
| V-02.16 | (2) utilisateurs peu habitués aux plateformes numériques | N/A | N/A | 02 §1 | Transversal | MVP | 06c M01 |
| V-02.17 | (2) évolutive permettant plus tard de créer une application mobile | N/A | N/A | 04 §1 | Transversal | MVP | 06c M01 |
| V-03.01 | (3) Repenser complètement l'interface | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.02 | (3) identité visuelle inspirée de l'énergie | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.03 | (3) identité visuelle inspirée de la sécurité | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.04 | (3) identité visuelle inspirée de la confiance | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.05 | (3) identité visuelle inspirée du mouvement | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.06 | (3) identité visuelle inspirée du contexte africain | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.07 | (3) Améliorer typographie | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.08 | (3) Améliorer hiérarchie visuelle | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.09 | (3) Améliorer boutons | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.10 | (3) Améliorer cartes produits | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.11 | (3) Améliorer navigation | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.12 | (3) Améliorer menus | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.13 | (3) Améliorer formulaires | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.14 | (3) Améliorer sections | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.15 | (3) Améliorer footer | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.16 | (3) Améliorer CTA | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.17 | (3) Améliorer icônes | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.18 | (3) Améliorer illustrations | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.19 | (3) Améliorer responsive design | N/A | N/A | 04 §1 | Transversal | MVP | 06c M01 |
| V-03.20 | (3) animation apparition progressive | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.21 | (3) animation hover | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.22 | (3) animation micro-interactions | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.23 | (3) animation transitions | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.24 | (3) animation loading states | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.25 | (3) animation skeleton loaders | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.26 | (3) animations de cartes | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.27 | (3) feedback après commande | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.28 | (3) animation du statut d'une commande | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-03.29 | (3) NE PAS utiliser des animations lourdes | N/A | N/A | 04 §1 | Transversal | MVP | 06c M01 |
| V-04.01 | (4) Transformer la homepage | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-04.02 | (4) Hero section: Votre gaz au bon endroit | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-04.03 | (4) CTA Acheter du gaz | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-04.04 | (4) CTA Trouver un point de vente | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-04.05 | (4) CTA Commander une livraison | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-04.06 | (4) CTA Devenir distributeur | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-04.07 | (4) Ajouter une recherche centrale | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-04.08 | (4) Exemple recherche Gaz 12,5 kg | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-04.09 | (4) Exemple recherche Point de vente | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-04.10 | (4) Exemple recherche Revendeur | N/A | N/A | 02 §1 | 2B | Plus tard | 06c H01 |
| V-05.01 | (5) Créer une authentification client | User | N/A | 02 §3.2 | 2 | MVP | 06c M01 |
| V-05.02 | (5) nom | CustomerProfile | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-05.03 | (5) prénom | CustomerProfile | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-05.04 | (5) téléphone | User | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-05.05 | (5) email facultatif | User | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-05.06 | (5) mot de passe | User | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-05.07 | (5) ville | CustomerProfile | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-05.08 | (5) quartier | CustomerProfile | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-05.09 | (5) adresse de livraison | Address | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-05.10 | (5) préférences de notification | CustomerProfile | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-05.11 | (5) Connexion par téléphone | N/A | N/A | 02 §3.2 | 2 | MVP | 06c M01 |
| V-05.12 | (5) Connexion par email | N/A | N/A | 02 §3.2 | 2 | MVP | 06c M01 |
| V-05.13 | (5) récupération du compte | N/A | N/A | 02 §3.2 | 2 | MVP | 06c M01 |
| V-05.14 | (5) modification du profil | N/A | N/A | 02 §3.2 | 2 | MVP | 06c M01 |
| V-05.15 | (5) gestion des adresses | N/A | N/A | 02 §3.2 | 2 | MVP | 06c M01 |
| V-05.16 | (5) historique des commandes | N/A | N/A | 02 §3.2 | 2 | MVP | 06c M01 |
| V-05.17 | (5) historique des factures | N/A | N/A | 02 §3.2 | 2 | MVP | 06c M01 |
| V-05.18 | (5) favoris | Favorite | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-05.19 | (5) points de vente favoris | Favorite | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-05.20 | (5) notifications | Notification | N/A | 05b §1 | 2 | MVP | 06c M01 |
| V-05.21 | (5) conversations | Conversation | N/A | 02 §3.2 | 2B | Plus tard | 06c H01 |
| V-05.22 | (5) préférences | CustomerProfile | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-06.01 | (6) fonctionnalité principale de recherche | N/A | N/A | 05c §1 | 2 | MVP | 06c M01 |
| V-06.02 | (6) rechercher un produit | N/A | N/A | 05c §1 | 2 | MVP | 06c M01 |
| V-06.03 | (6) rechercher un point de vente | N/A | N/A | 05c §1 | 2 | MVP | 06c M01 |
| V-06.04 | (6) rechercher un revendeur | N/A | N/A | 05c §1 | 2 | MVP | 06c M01 |
| V-06.05 | (6) rechercher une ville | N/A | N/A | 05c §1 | 2 | MVP | 06c M01 |
| V-06.06 | (6) rechercher un quartier | N/A | N/A | 05c §1 | 2 | MVP | 06c M01 |
| V-06.07 | (6) rechercher un type de gaz | N/A | N/A | 05c §1 | 2 | MVP | 06c M01 |
| V-06.08 | (6) rechercher une disponibilité | N/A | N/A | 05c §1 | 2 | MVP | 06c M01 |
| V-06.09 | (6) rechercher une boutique | N/A | N/A | 05c §1 | 2 | MVP | 06c M01 |
| V-06.10 | (6) rechercher une livraison | N/A | N/A | 05c §1 | 2 | MVP | 06c M01 |
| V-06.11 | (6) 4 exemples de recherche (regroupe 4 puces) | N/A | N/A | 05c §1 | 2 | MVP | 06c M01 |
| V-06.12 | (6) recherche doit comprendre les fautes | N/A | N/A | 05c §1 | 2 | MVP | 06c M01 |
| V-06.13 | (6) recherche sémantique assistée par IA | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-06.14 | (6) search fallback texte | N/A | N/A | 06c §1, 04 §1 | 2 | MVP | 06c M01 |
| V-06.15 | (6) search statuts bons | N/A | N/A | 06c §1, 04 §1 | 2 | MVP | 06c M01 |
| V-07.01 | (7) Véritable carte interactive | N/A | N/A | 04 §1 | 2 | MVP | 06c M01 |
| V-07.02 | (7) point de vente possede nom | Store | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-07.03 | (7) photo | Store | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-07.04 | (7) description | Store | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-07.05 | (7) adresse | StoreLocation | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-07.06 | (7) ville | StoreLocation | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-07.07 | (7) quartier | StoreLocation | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-07.08 | (7) coordonnées GPS | StoreLocation | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-07.09 | (7) téléphone | Store | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-07.10 | (7) WhatsApp | Store | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-07.11 | (7) horaires | Store | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-07.12 | (7) produits disponibles | Inventory | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-07.13 | (7) disponibilité du gaz | Inventory | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-07.14 | (7) date de dernière mise à jour | Inventory | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-07.15 | (7) statut de vérification | DistributorApplication | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-07.16 | (7) statut officiel PLEINGAZ | DistributorProfile | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-07.17 | (7) Afficher les points de vente sur une carte | N/A | N/A | 04 §1 | 2 | MVP | 06c M01 |
| V-07.18 | (7) Permettre points autour de moi | N/A | N/A | 04 §1 | 2 | MVP | 06c M01 |
| V-07.19 | (7) Permettre points à moins de 2 km | N/A | N/A | 04 §1 | 2 | MVP | 06c M01 |
| V-07.20 | (7) Permettre points à moins de 5 km | N/A | N/A | 04 §1 | 2 | MVP | 06c M01 |
| V-07.21 | (7) Permettre points ouverts maintenant | N/A | N/A | 04 §1 | 2 | MVP | 06c M01 |
| V-07.22 | (7) Permettre gaz disponible maintenant | N/A | N/A | 04 §1 | 2 | MVP | 06c M01 |
| V-07.23 | (7) Calculer distance | N/A | N/A | 04 §1 | 2 | MVP | 06c M01 |
| V-07.24 | (7) Calculer temps approximatif | N/A | N/A | 04 §1 | 2 | MVP | 06c M01 |
| V-07.25 | (7) Calculer itinéraire | N/A | N/A | 04 §1 | 2 | MVP | 06c M01 |
| V-07.26 | (7) Ne pas déduire automatiquement | N/A | N/A | 04 §1 | 2 | MVP | 06c M01 |
| V-07.27 | (7) distributeur renseigne (regroupe 4 puces: proposer, geocoder, deplacer, enregistrer) | N/A | N/A | 04 §1 | 2 | MVP | 06c M01 |
| V-08.01 | (8) Créer un espace professionnel distributeurs | N/A | N/A | 02 §3.3 | 2 | MVP | 06c M01 |
| V-08.02 | (8) identité nom | User | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.03 | (8) identité prénom | User | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.04 | (8) identité téléphone | User | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.05 | (8) identité email | User | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.06 | (8) identité pièce d'identité | DistributorDocument | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.07 | (8) identité documents | DistributorDocument | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.08 | (8) boutique nom commercial | Store | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.09 | (8) boutique description | Store | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.10 | (8) boutique adresse | StoreLocation | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.11 | (8) boutique ville | StoreLocation | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.12 | (8) boutique quartier | StoreLocation | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.13 | (8) boutique téléphone | Store | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.14 | (8) boutique WhatsApp | Store | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.15 | (8) boutique horaires | Store | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.16 | (8) boutique photo | Store | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.17 | (8) boutique coordonnées GPS | StoreLocation | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.18 | (8) activité types de produits | Store | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.19 | (8) activité capacité estimée | Store | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.20 | (8) activité zone desservie | Store | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.21 | (8) activité possibilité de livraison | Store | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-08.22 | (8) activité informations complémentaires | Store | N/A | 03 §1 | 2 | MVP | 06c M01 |
| V-09.01 | (9) règle : jamais visible officiel automatiquement | N/A | N/A | 06c §1, 04 §1 | 2 | MVP | 06c M01 |
| V-09.02 | (9) état PENDING | DistributorApplication | N/A | 03b §1 | 2 | MVP | 06c M01 |
| V-09.03 | (9) état UNDER_REVIEW | DistributorApplication | N/A | 03b §1 | 2 | MVP | 06c M01 |
| V-09.04 | (9) état APPROVED | DistributorApplication | N/A | 03b §1 | 2 | MVP | 06c M01 |
| V-09.05 | (9) état REJECTED | DistributorApplication | N/A | 03b §1 | 2 | MVP | 06c M01 |
| V-09.06 | (9) état SUSPENDED | DistributorApplication | N/A | 03b §1 | 2 | MVP | 06c M01 |
| V-09.07 | (9) Votre demande est en cours de vérification par PLEINGAZ | N/A | N/A | 02 §3.3 | 2 | MVP | 06c M01 |
| V-09.08 | (9) Admin consulter le dossier | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M01 |
| V-09.09 | (9) Admin vérifier les informations | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M01 |
| V-09.10 | (9) Admin consulter les documents | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M01 |
| V-09.11 | (9) Admin consulter la localisation | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M01 |
| V-09.12 | (9) Admin contacter le candidat | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M01 |
| V-09.13 | (9) Admin demander des informations supplémentaires | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M01 |
| V-09.14 | (9) Admin approuver | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M01 |
| V-09.15 | (9) Admin refuser | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M01 |
| V-09.16 | (9) Admin suspendre | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M01 |
| V-09.17 | (9) seuls les APPROVED apparaissent publiquement | N/A | N/A | 06c §1, 04 §1 | 2 | MVP | 06c M01 |
| V-09.18 | (9) badge Distributeur PLEINGAZ vérifié | N/A | N/A | 02 §3.3 | 2 | MVP | 06c M01 |
| V-10.01 | (10) règle : score interne, pas une note publique | N/A | N/A | 03c §1 | 9 | Plus tard | 06c H04 |
| V-10.02 | (10) ancienneté | N/A | N/A | 03c §1 | 9 | Plus tard | 06c H04 |
| V-10.03 | (10) régularité des commandes | N/A | N/A | 03c §1 | 9 | Plus tard | 06c H04 |
| V-10.04 | (10) exactitude des informations | N/A | N/A | 03c §1 | 9 | Plus tard | 06c H04 |
| V-10.05 | (10) fréquence de mise à jour du stock | N/A | N/A | 03c §1 | 9 | Plus tard | 06c H04 |
| V-10.06 | (10) taux de commandes honorées | N/A | N/A | 03c §1 | 9 | Plus tard | 06c H04 |
| V-10.07 | (10) respect des délais | N/A | N/A | 03c §1 | 9 | Plus tard | 06c H04 |
| V-10.08 | (10) retours clients | N/A | N/A | 03c §1 | 9 | Plus tard | 06c H04 |
| V-10.09 | (10) validation PLEINGAZ | N/A | N/A | 03c §1 | 9 | Plus tard | 06c H04 |
| V-10.10 | (10) badge Distributeur vérifié | N/A | N/A | 02 §1 | 9 | Plus tard | 06c H04 |
| V-10.11 | (10) badge Partenaire actif | N/A | N/A | 02 §1 | 9 | Plus tard | 06c H04 |
| V-10.12 | (10) badge Stock régulièrement mis à jour | N/A | N/A | 02 §1 | 9 | Plus tard | 06c H04 |
| V-10.13 | (10) badge Livraison disponible | N/A | N/A | 02 §1 | 9 | Plus tard | 06c H04 |
| V-10.14 | (10) attribués selon des règles administratives explicites | N/A | N/A | 03c §1 | 9 | Plus tard | 06c H04 |
| V-11.01 | (11) fonctionnalité centrale AVEC GAZ / RUPTURE | Inventory | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-11.02 | (11) question avez-vous actuellement du gaz disponible | N/A | N/A | 02 §3.3 | 2 | MVP | 06c M02 |
| V-11.03 | (11) OUI NON | N/A | N/A | 02 §3.3 | 2 | MVP | 06c M02 |
| V-11.04 | (11) 6 kg | Product | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-11.05 | (11) 12,5 kg | Product | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-11.06 | (11) 50 kg | Product | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-11.07 | (11) accessoires | Product | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-11.08 | (11) distributeur doit pouvoir mettre à jour son stock | N/A | N/A | 02 §3.3 | 2 | MVP | 06c M02 |
| V-11.09 | (11) statut Disponible | N/A | N/A | 02 §3.3 | 2 | MVP | 06c M02 |
| V-11.10 | (11) statut Stock limité | N/A | N/A | 02 §3.3 | 2 | MVP | 06c M02 |
| V-11.11 | (11) statut Indisponible/Rupture | N/A | N/A | 02 §3.3 | 2 | MVP | 06c M02 |
| V-11.12 | (11) statut Information non actualisée | N/A | N/A | 02 §3.3 | 2 | MVP | 06c M02 |
| V-11.13 | (11) règle : toujours la date de dernière mise à jour | N/A | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-11.14 | (11) exemple Stock confirmé il y a 18 minutes | N/A | N/A | 02 §3.3 | 2 | MVP | 06c M02 |
| V-12.01 | (12) système intelligent de stock | Inventory | N/A | 04 §1 | 4 | Plus tard | 06c H05 |
| V-12.02 | (12) message stock faible / seuil | Notification | N/A | 05b §1 | 4 | Plus tard | 06c H05 |
| V-12.03 | (12) proposer passer une nouvelle commande | N/A | N/A | 02 §3.3 | 4 | Plus tard | 06c H05 |
| V-12.04 | (12) alerte PLEINGAZ | DemandAlert | N/A | 05b §1 | 4 | Plus tard | 06c H05 |
| V-12.05 | (12) alerte stock faible | Notification | N/A | 05b §1 | 4 | Plus tard | 06c H05 |
| V-12.06 | (12) alerte stock indisponible | Notification | N/A | 05b §1 | 4 | Plus tard | 06c H05 |
| V-12.07 | (12) alerte stock non mis à jour depuis X jours | Notification | N/A | 05b §1 | 4 | Plus tard | 06c H05 |
| V-12.08 | (12) alerte forte demande | DemandAlert | N/A | 05b §1 | 4 | Plus tard | 06c H05 |
| V-12.09 | (12) alerte distributeur avec beaucoup de recherches | DemandAlert | N/A | 05b §1 | 4 | Plus tard | 06c H05 |
| V-12.10 | (12) alerte distributeur dont les commandes augmentent | DemandAlert | N/A | 05b §1 | 4 | Plus tard | 06c H05 |
| V-13.01 | (13) espace commander auprès de PLEINGAZ | N/A | N/A | 02 §3.3 | 5 | Plus tard | 06c H02 |
| V-13.02 | (13) produit | DistributorOrder | N/A | 03 §1 | 5 | Plus tard | 06c H02 |
| V-13.03 | (13) quantité | DistributorOrder | N/A | 03 §1 | 5 | Plus tard | 06c H02 |
| V-13.04 | (13) lieu de livraison | DistributorOrder | N/A | 03 §1 | 5 | Plus tard | 06c H02 |
| V-13.05 | (13) date souhaitée | DistributorOrder | N/A | 03 §1 | 5 | Plus tard | 06c H02 |
| V-13.06 | (13) commentaire | DistributorOrder | N/A | 03 §1 | 5 | Plus tard | 06c H02 |
| V-13.07 | (13) 3 exemples de quantités | N/A | N/A | 02 §3.3 | 5 | Plus tard | 06c H02 |
| V-13.08 | (13) bouton Valider la commande | N/A | N/A | 02 §3.3 | 5 | Plus tard | 06c H02 |
| V-13.09 | (13) état DRAFT | DistributorOrder | N/A | 03b §1 | 5 | Plus tard | 06c H02 |
| V-13.10 | (13) état SUBMITTED | DistributorOrder | N/A | 03b §1 | 5 | Plus tard | 06c H02 |
| V-13.11 | (13) état CONFIRMED | DistributorOrder | N/A | 03b §1 | 5 | Plus tard | 06c H02 |
| V-13.12 | (13) état PREPARING | DistributorOrder | N/A | 03b §1 | 5 | Plus tard | 06c H02 |
| V-13.13 | (13) état SHIPPED | DistributorOrder | N/A | 03b §1 | 5 | Plus tard | 06c H02 |
| V-13.14 | (13) état DELIVERED | DistributorOrder | N/A | 03b §1 | 5 | Plus tard | 06c H02 |
| V-13.15 | (13) état CANCELLED | DistributorOrder | N/A | 03b §1 | 5 | Plus tard | 06c H02 |
| V-13.16 | (13) historique complet | N/A | N/A | 02 §3.3 | 5 | Plus tard | 06c H02 |
| V-14.01 | (14) afficher disponibilité | N/A | N/A | 02 §1 | 5 | Plus tard | 06c H06 |
| V-14.02 | (14) afficher prix | N/A | N/A | 02 §1 | 5 | Plus tard | 06c H06 |
| V-14.03 | (14) afficher distance | N/A | N/A | 02 §1 | 5 | Plus tard | 06c H06 |
| V-14.04 | (14) afficher horaires | N/A | N/A | 02 §1 | 5 | Plus tard | 06c H06 |
| V-14.05 | (14) afficher livraison disponible ou non | N/A | N/A | 02 §1 | 5 | Plus tard | 06c H06 |
| V-14.06 | (14) retrait en boutique | N/A | N/A | 02 §1 | 5 | Plus tard | 06c H06 |
| V-14.07 | (14) se faire livrer | N/A | N/A | 02 §1 | 5 | Plus tard | 06c H06 |
| V-14.08 | (14) panier | Order | N/A | 03 §1 | 5 | Plus tard | 06c H06 |
| V-15.01 | (15) moteur choix automatique | N/A | N/A | 04 §1 | 10 | Plus tard | 06c H07 |
| V-15.02 | (15) distance | N/A | N/A | 04 §1 | 10 | Plus tard | 06c H07 |
| V-15.03 | (15) disponibilité | N/A | N/A | 04 §1 | 10 | Plus tard | 06c H07 |
| V-15.04 | (15) horaires | N/A | N/A | 04 §1 | 10 | Plus tard | 06c H07 |
| V-15.05 | (15) capacité | N/A | N/A | 04 §1 | 10 | Plus tard | 06c H07 |
| V-15.06 | (15) livraison | N/A | N/A | 04 §1 | 10 | Plus tard | 06c H07 |
| V-15.07 | (15) charge actuelle | N/A | N/A | 04 §1 | 10 | Plus tard | 06c H07 |
| V-15.08 | (15) statut du distributeur | N/A | N/A | 04 §1 | 10 | Plus tard | 06c H07 |
| V-15.09 | (15) règle : jamais seulement la distance | N/A | N/A | 04 §1 | 10 | Plus tard | 06c H07 |
| V-16.01 | (16) MTN Mobile Money | Payment | N/A | 05a §1 | 6 | Plus tard | 06c H08 |
| V-16.02 | (16) Orange Money | Payment | N/A | 05a §1 | 6 | Plus tard | 06c H08 |
| V-16.03 | (16) paiement en présentiel | Payment | N/A | 05a §1 | 6 | Plus tard | 06c H08 |
| V-16.04 | (16) carte bancaire plus tard | Payment | N/A | 05a §1 | 6 | Plus tard | 06c H08 |
| V-16.05 | (16) traitement côté serveur | N/A | N/A | 05a §1 | 6 | Plus tard | 06c H08 |
| V-16.06 | (16) règle : jamais payé parce que le frontend affiche succès | N/A | N/A | 05a §1 | 6 | Plus tard | 06c H08 |
| V-16.07 | (16) transaction ID | PaymentTransaction | N/A | 03 §1 | 6 | Plus tard | 06c H08 |
| V-16.08 | (16) webhook | N/A | N/A | 05a §1 | 6 | Plus tard | 06c H08 |
| V-16.09 | (16) vérification serveur | N/A | N/A | 05a §1 | 6 | Plus tard | 06c H08 |
| V-16.10 | (16) idempotence | N/A | N/A | 05a §1 | 6 | Plus tard | 06c H08 |
| V-16.11 | (16) journal des transactions | PaymentTransaction | N/A | 03 §1 | 6 | Plus tard | 06c H08 |
| V-16.12 | (16) PaymentProvider | N/A | N/A | 04 §1 | 6 | Plus tard | 06c H08 |
| V-16.13 | (16) MTNProvider | N/A | N/A | 04 §1 | 6 | Plus tard | 06c H08 |
| V-16.14 | (16) OrangeProvider | N/A | N/A | 04 §1 | 6 | Plus tard | 06c H08 |
| V-16.15 | (16) ManualPaymentProvider | N/A | N/A | 04 §1 | 6 | Plus tard | 06c H08 |
| V-17.01 | (17) facture unique par commande | Invoice | N/A | 05a §4 | 6 | Plus tard | 06c H08 |
| V-17.02 | (17) ne jamais mélanger les factures | N/A | N/A | 05a §4 | 6 | Plus tard | 06c H08 |
| V-17.03 | (17) numéro unique | Invoice | N/A | 03 §1 | 6 | Plus tard | 06c H08 |
| V-17.04 | (17) vendeur | Invoice | N/A | 03 §1 | 6 | Plus tard | 06c H08 |
| V-17.05 | (17) acheteur | Invoice | N/A | 03 §1 | 6 | Plus tard | 06c H08 |
| V-17.06 | (17) produits | InvoiceItem | N/A | 03 §1 | 6 | Plus tard | 06c H08 |
| V-17.07 | (17) quantités | InvoiceItem | N/A | 03 §1 | 6 | Plus tard | 06c H08 |
| V-17.08 | (17) prix | InvoiceItem | N/A | 03 §1 | 6 | Plus tard | 06c H08 |
| V-17.09 | (17) livraison | Invoice | N/A | 03 §1 | 6 | Plus tard | 06c H08 |
| V-17.10 | (17) montant total | Invoice | N/A | 03 §1 | 6 | Plus tard | 06c H08 |
| V-17.11 | (17) moyen de paiement | Invoice | N/A | 03 §1 | 6 | Plus tard | 06c H08 |
| V-17.12 | (17) date | Invoice | N/A | 03 §1 | 6 | Plus tard | 06c H08 |
| V-17.13 | (17) statut | Invoice | N/A | 03b §1 | 6 | Plus tard | 06c H08 |
| V-17.14 | (17) référence de commande | Invoice | N/A | 03 §1 | 6 | Plus tard | 06c H08 |
| V-17.15 | (17) facture PLEINGAZ | Invoice | N/A | 05a §4 | 6 | Plus tard | 06c H08 |
| V-17.16 | (17) facture du distributeur | Invoice | N/A | 05a §4 | 6 | Plus tard | 06c H08 |
| V-17.17 | (17) consultation | N/A | N/A | 02 §1 | 6 | Plus tard | 06c H08 |
| V-17.18 | (17) téléchargement PDF | N/A | N/A | 02 §1 | 6 | Plus tard | 06c H08 |
| V-17.19 | (17) impression | N/A | N/A | 02 §1 | 6 | Plus tard | 06c H08 |
| V-17.20 | (17) envoi email | N/A | N/A | 05b §1 | 6 | Plus tard | 06c H08 |
| V-17.21 | (17) partage WhatsApp | N/A | N/A | 02 §1 | 6 | Plus tard | 06c H08 |
| V-18.01 | (18) bouton Contacter ce point de vente | N/A | N/A | 02 §1 | 3 | MVP | 06c M03 |
| V-18.02 | (18) bouton Contacter PLEINGAZ | N/A | N/A | 02 §1 | 3 | MVP | 06c M03 |
| V-18.03 | (18) bouton Contacter le service client | N/A | N/A | 02 §1 | 3 | MVP | 06c M03 |
| V-18.04 | (18) bouton Suivre ma commande | N/A | N/A | 02 §1 | 3 | MVP | 06c M03 |
| V-18.05 | (18) message prérempli | N/A | N/A | 02 §1 | 3 | MVP | 06c M03 |
| V-18.06 | (18) exemple message WhatsApp | N/A | N/A | 02 §1 | 3 | MVP | 06c M03 |
| V-18.07 | (18) règle : aucun envoi automatique | N/A | N/A | 04 §1 | 3 | MVP | 06c M03 |
| V-19.01 | (19) centre de notifications | Notification | N/A | 05b §1 | 7 | Plus tard | 06c H09 |
| V-19.02 | (19) notification web | N/A | N/A | 05b §1 | 7 | Plus tard | 06c H09 |
| V-19.03 | (19) email | N/A | N/A | 05b §1 | 7 | Plus tard | 06c H09 |
| V-19.04 | (19) WhatsApp | N/A | N/A | 05b §1 | 7 | Plus tard | 06c H09 |
| V-19.05 | (19) SMS si disponible | N/A | N/A | 05b §1 | 7 | Plus tard | 06c H09 |
| V-19.06 | (19) event création de compte | N/A | N/A | 05b §1 | 7 | Plus tard | 06c H09 |
| V-19.07 | (19) event validation distributeur | N/A | N/A | 05b §1 | 7 | Plus tard | 06c H09 |
| V-19.08 | (19) event refus distributeur | N/A | N/A | 05b §1 | 7 | Plus tard | 06c H09 |
| V-19.09 | (19) event nouvelle commande | N/A | N/A | 05b §1 | 7 | Plus tard | 06c H09 |
| V-19.10 | (19) event commande confirmée | N/A | N/A | 05b §1 | 7 | Plus tard | 06c H09 |
| V-19.11 | (19) event commande livrée | N/A | N/A | 05b §1 | 7 | Plus tard | 06c H09 |
| V-19.12 | (19) event facture disponible | N/A | N/A | 05b §1 | 7 | Plus tard | 06c H09 |
| V-19.13 | (19) event paiement confirmé | N/A | N/A | 05b §1 | 7 | Plus tard | 06c H09 |
| V-19.14 | (19) event stock faible | N/A | N/A | 05b §1 | 7 | Plus tard | 06c H09 |
| V-19.15 | (19) event stock disponible | N/A | N/A | 05b §1 | 7 | Plus tard | 06c H09 |
| V-19.16 | (19) event message reçu | N/A | N/A | 05b §1 | 7 | Plus tard | 06c H09 |
| V-20.01 | (20) IA produits | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.02 | (20) IA prix | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.03 | (20) IA disponibilité | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.04 | (20) IA points de vente | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.05 | (20) IA horaires | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.06 | (20) IA commandes | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.07 | (20) IA livraison | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.08 | (20) IA paiement | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.09 | (20) IA factures | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.10 | (20) IA fonctionnement de la plateforme | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.11 | (20) IA sécurité d'utilisation | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.12 | (20) IA FAQ | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.13 | (20) IA informations officielles | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.14 | (20) règle : ne pas inventer | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.15 | (20) architecture Knowledge Base + RAG + LLM + outils | N/A | N/A | 04 §1 | 8 | Plus tard | 06c H03 |
| V-20.16 | (20) outil find_nearest_store | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.17 | (20) outil check_product_availability | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.18 | (20) outil get_order_status | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.19 | (20) outil get_invoice | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.20 | (20) outil find_open_store | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-20.21 | (20) outil contact_support | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-21.01 | (21) capacité importante assistant géographique | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-21.02 | (21) Voici les points de vente PLEINGAZ | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-21.03 | (21) afficher distance | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-21.04 | (21) afficher disponibilité | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-21.05 | (21) afficher horaires | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-21.06 | (21) afficher livraison | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-21.07 | (21) afficher téléphone | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-21.08 | (21) afficher WhatsApp | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-21.09 | (21) afficher itinéraire | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-21.10 | (21) demander ville ou quartier si pas localisé | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-22.01 | (22) Client ↔ PLEINGAZ | Conversation | N/A | 02 §1 | 7 | Plus tard | 06c H09 |
| V-22.02 | (22) Client ↔ Distributeur | Conversation | N/A | 02 §1 | 7 | Plus tard | 06c H09 |
| V-22.03 | (22) Distributeur ↔ PLEINGAZ | Conversation | N/A | 02 §1 | 7 | Plus tard | 06c H09 |
| V-22.04 | (22) liaisons du chat avec PLEINGAZ | Conversation | N/A | 02 §1 | 7 | Plus tard | 06c H09 |
| V-22.05 | (22) messages | Message | N/A | 03 §1 | 7 | Plus tard | 06c H09 |
| V-22.06 | (22) pièces jointes | Message | N/A | 03 §1 | 7 | Plus tard | 06c H09 |
| V-22.07 | (22) statut lu/non lu | Message | N/A | 03 §1 | 7 | Plus tard | 06c H09 |
| V-22.08 | (22) historique | Conversation | N/A | 03 §1 | 7 | Plus tard | 06c H09 |
| V-22.09 | (22) transfert vers agent humain | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-23.01 | (23) Dashboard complet | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-23.02 | (23) chiffre d'affaires | N/A | N/A | 02 §3.4 | 9 | Plus tard | 06c H10 |
| V-23.03 | (23) commandes | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-23.04 | (23) commandes en attente | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-23.05 | (23) commandes livrées | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-23.06 | (23) utilisateurs | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-23.07 | (23) distributeurs | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-23.08 | (23) distributeurs en attente | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-23.09 | (23) stock déclaré | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-23.10 | (23) produits | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-23.11 | (23) factures | N/A | N/A | 02 §3.4 | 6 | Plus tard | 06c H08 |
| V-23.12 | (23) paiements | N/A | N/A | 02 §3.4 | 6 | Plus tard | 06c H08 |
| V-23.13 | (23) livraisons | N/A | N/A | 02 §3.4 | 5 | Plus tard | 06c H06 |
| V-23.14 | (23) conversations | N/A | N/A | 02 §3.4 | 7 | Plus tard | 06c H09 |
| V-23.15 | (23) incidents | Report | N/A | 03 §1 | 9 | Plus tard | 06c H10 |
| V-23.16 | (23) graphiques | N/A | N/A | 02 §3.4 | 9 | Plus tard | 06c H10 |
| V-23.17 | (23) Filtre par jour | N/A | N/A | 02 §3.4 | 9 | Plus tard | 06c H10 |
| V-23.18 | (23) Filtre par semaine/mois/année | N/A | N/A | 02 §3.4 | 9 | Plus tard | 06c H10 |
| V-23.19 | (23) Filtre par ville | N/A | N/A | 02 §3.4 | 9 | Plus tard | 06c H10 |
| V-23.20 | (23) Filtre par distributeur | N/A | N/A | 02 §3.4 | 9 | Plus tard | 06c H10 |
| V-23.21 | (23) Filtre par produit | N/A | N/A | 02 §3.4 | 9 | Plus tard | 06c H10 |
| V-24.01 | (24) interface dédiée | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-24.02 | (24) liste distributeur | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-24.03 | (24) liste ville | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-24.04 | (24) liste statut | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-24.05 | (24) liste disponibilité | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-24.06 | (24) liste dernière activité | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-24.07 | (24) liste dernière commande | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-24.08 | (24) liste date mise à jour stock | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-24.09 | (24) action consulter | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-24.10 | (24) action valider | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-24.11 | (24) action suspendre | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-24.12 | (24) action réactiver | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-24.13 | (24) action contacter | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-24.14 | (24) action demander informations | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-24.15 | (24) carte administrative | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-24.16 | (24) état visuel vérifié | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-24.17 | (24) état visuel en attente | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-24.18 | (24) état visuel stock dispo/rupture | N/A | N/A | 02 §3.4 | 2 | MVP | 06c M02 |
| V-25.01 | (25) Admin CRUD complet | Product | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-25.02 | (25) CRUD photo | Product | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-25.03 | (25) CRUD description | Product | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-25.04 | (25) CRUD poids | Product | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-25.05 | (25) CRUD prix | Product | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-25.06 | (25) CRUD disponibilité | Product | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-25.07 | (25) CRUD catégorie | ProductCategory | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-25.08 | (25) CRUD caractéristiques | Product | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-25.09 | (25) CRUD accessoires | Product | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-25.10 | (25) tarif public | Product | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-25.11 | (25) tarif distributeur | Product | N/A | 03 §1 | 5 | Plus tard | 06c H02 |
| V-25.12 | (25) tarif promotionnel | Product | N/A | 03 §1 | 9 | Plus tard | 06c H11 |
| V-25.13 | (25) produit | Product | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-26.01 | (26) module livraison | Delivery | N/A | 03 §1 | 5 | Plus tard | 06c H06 |
| V-26.02 | (26) statut PENDING | Delivery | N/A | 03b §1 | 5 | Plus tard | 06c H06 |
| V-26.03 | (26) statut ASSIGNED | Delivery | N/A | 03b §1 | 5 | Plus tard | 06c H06 |
| V-26.04 | (26) statut PICKED_UP | Delivery | N/A | 03b §1 | 5 | Plus tard | 06c H06 |
| V-26.05 | (26) statut IN_TRANSIT | Delivery | N/A | 03b §1 | 5 | Plus tard | 06c H06 |
| V-26.06 | (26) statut DELIVERED | Delivery | N/A | 03b §1 | 5 | Plus tard | 06c H06 |
| V-26.07 | (26) statut FAILED | Delivery | N/A | 03b §1 | 5 | Plus tard | 06c H06 |
| V-26.08 | (26) statut CANCELLED | Delivery | N/A | 03b §1 | 5 | Plus tard | 06c H06 |
| V-26.09 | (26) adresse | Delivery | N/A | 03 §1 | 5 | Plus tard | 06c H06 |
| V-26.10 | (26) téléphone | Delivery | N/A | 03 §1 | 5 | Plus tard | 06c H06 |
| V-26.11 | (26) instructions | Delivery | N/A | 03 §1 | 5 | Plus tard | 06c H06 |
| V-26.12 | (26) créneau | Delivery | N/A | 03 §1 | 5 | Plus tard | 06c H06 |
| V-26.13 | (26) livreur | Delivery | N/A | 03 §1 | 5 | Plus tard | 06c H06 |
| V-26.14 | (26) tracking GPS plus tard | N/A | N/A | 04 §1 | 10 | Plus tard | 06c H12 |
| V-27.01 | (27) IA prévision demande | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-27.02 | (27) analyser historique | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-27.03 | (27) analyser saison | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-27.04 | (27) analyser zone géographique | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-27.05 | (27) analyser jours de semaine | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-27.06 | (27) analyser produits | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-27.07 | (27) analyser ruptures | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-27.08 | (27) exemple hausse demande | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H03 |
| V-28.01 | (28) Heatmap demande | N/A | N/A | 02 §3.4 | 9 | Plus tard | 06c H10 |
| V-28.02 | (28) zones forte demande | N/A | N/A | 02 §3.4 | 9 | Plus tard | 06c H10 |
| V-28.03 | (28) zones peu distributeurs | N/A | N/A | 02 §3.4 | 9 | Plus tard | 06c H10 |
| V-28.04 | (28) zones rupture | N/A | N/A | 02 §3.4 | 9 | Plus tard | 06c H10 |
| V-28.05 | (28) zones forte recherche | N/A | N/A | 02 §3.4 | 9 | Plus tard | 06c H10 |
| V-29.01 | (29) message indisponible | N/A | N/A | 02 §1 | 4 | Plus tard | 06c H05 |
| V-29.02 | (29) proposer alerte | N/A | N/A | 02 §1 | 4 | Plus tard | 06c H05 |
| V-29.03 | (29) activer alerte | DemandAlert | N/A | 03 §1 | 4 | Plus tard | 06c H05 |
| V-29.04 | (29) notifier | Notification | N/A | 05b §1 | 4 | Plus tard | 06c H05 |
| V-29.05 | (29) Demande sans stock | N/A | N/A | 02 §1 | 4 | Plus tard | 06c H05 |
| V-29.06 | (29) Voulez-vous être averti | N/A | N/A | 02 §1 | 4 | Plus tard | 06c H05 |
| V-30.01 | (30) sauvegarder distributeur | Favorite | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-30.02 | (30) sauvegarder adresse | Address | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-30.03 | (30) sauvegarder produits | Favorite | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-30.04 | (30) suivre disponibilité | Favorite | N/A | 03 §1 | 2 | MVP | 06c M02 |
| V-30.05 | (30) mon point de vente habituel | N/A | N/A | 02 §1 | 2 | MVP | 06c M02 |
| V-31.01 | Créer éventuellement un système de rappel. | N/A | N/A | 03 §1 | 2 | MVP | 06c M04 |
| V-31.02 | Exemple : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H01 |
| V-31.03 | L'utilisateur achète régulièrement une bouteille. | N/A | N/A | 03 §1 | 2 | MVP | 06c M05 |
| V-31.04 | Après une période configurable : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H02 |
| V-31.05 | "Vous avez probablement besoin de renouveler votre bouteille." | N/A | N/A | 03 §1 | 2 | MVP | 06c M06 |
| V-31.06 | Proposer : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H03 |
| V-31.07 | "Commander maintenant." | N/A | N/A | 03 §1 | 2 | MVP | 06c M07 |
| V-31.08 | IMPORTANT : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H04 |
| V-31.09 | Présenter cela comme une suggestion et non comme une prédiction certaine. | N/A | N/A | 03 §1 | 2 | MVP | 06c M08 |
| V-32.01 | Créer éventuellement : | N/A | N/A | 03 §1 | 2 | MVP | 06c M09 |
| V-32.02 | PLEINGAZ Rewards. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H05 |
| V-32.03 | Points obtenus selon : | N/A | N/A | 03 §1 | 2 | MVP | 06c M10 |
| V-32.04 | achats | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H06 |
| V-32.05 | régularité | N/A | N/A | 03 §1 | 2 | MVP | 06c M11 |
| V-32.06 | recommandations | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H07 |
| V-32.07 | participation à certaines campagnes. | N/A | N/A | 03 §1 | 2 | MVP | 06c M12 |
| V-32.08 | Récompenses : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H08 |
| V-32.09 | réductions | N/A | N/A | 03 §1 | 2 | MVP | 06c M13 |
| V-32.10 | livraison | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H09 |
| V-32.11 | accessoires | N/A | N/A | 03 §1 | 2 | MVP | 06c M14 |
| V-32.12 | promotions. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H10 |
| V-32.13 | Tout le système doit être configurable depuis l'administration. | N/A | N/A | 03 §1 | 2 | MVP | 06c M15 |
| V-33.01 | Après une commande terminée : | N/A | N/A | 03 §1 | 2 | MVP | 06c M16 |
| V-33.02 | demander : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H11 |
| V-33.03 | satisfaction | N/A | N/A | 03 §1 | 2 | MVP | 06c M17 |
| V-33.04 | qualité | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H12 |
| V-33.05 | livraison | N/A | N/A | 03 §1 | 2 | MVP | 06c M18 |
| V-33.06 | disponibilité | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H13 |
| V-33.07 | expérience distributeur. | N/A | N/A | 03 §1 | 2 | MVP | 06c M19 |
| V-33.08 | Les avis doivent être liés à une commande réelle afin de réduire les faux avis. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H14 |
| V-33.09 | Prévoir modération. | N/A | N/A | 03 §1 | 2 | MVP | 06c M20 |
| V-34.01 | Implémenter : | N/A | N/A | 03 §1 | 2 | MVP | 06c M21 |
| V-34.02 | HTTPS | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H15 |
| V-34.03 | hashage sécurisé des mots de passe | N/A | N/A | 03 §1 | 2 | MVP | 06c M22 |
| V-34.04 | JWT/session sécurisée | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H01 |
| V-34.05 | refresh tokens | N/A | N/A | 03 §1 | 2 | MVP | 06c M23 |
| V-34.06 | RBAC | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H02 |
| V-34.07 | validation serveur | N/A | N/A | 03 §1 | 2 | MVP | 06c M24 |
| V-34.08 | rate limiting | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H03 |
| V-34.09 | protection CSRF si pertinente | N/A | N/A | 03 §1 | 2 | MVP | 06c M25 |
| V-34.10 | protection XSS | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H04 |
| V-34.11 | protection injection SQL/NoSQL | N/A | N/A | 03 §1 | 2 | MVP | 06c M26 |
| V-34.12 | validation des uploads | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H05 |
| V-34.13 | antivirus/scanning des fichiers si nécessaire | N/A | N/A | 03 §1 | 2 | MVP | 06c M27 |
| V-34.14 | journalisation | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H06 |
| V-34.15 | audit logs | N/A | N/A | 03 §1 | 2 | MVP | 06c M28 |
| V-34.16 | sauvegardes | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H07 |
| V-34.17 | chiffrement des secrets. | N/A | N/A | 03 §1 | 2 | MVP | 06c M29 |
| V-34.18 | Créer des rôles : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H08 |
| V-34.19 | rôle CUSTOMER | N/A | N/A | 03 §1 | 2 | MVP | 06c M04 |
| V-34.20 | rôle DISTRIBUTOR | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H09 |
| V-34.21 | rôle SUPPORT_AGENT | N/A | N/A | 03 §1 | 2 | MVP | 06c M05 |
| V-34.22 | rôle DISTRIBUTOR_MANAGER | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H10 |
| V-34.23 | rôle LOGISTICS_MANAGER | N/A | N/A | 03 §1 | 2 | MVP | 06c M06 |
| V-34.24 | rôle FINANCE_MANAGER | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H11 |
| V-34.25 | rôle ADMIN | N/A | N/A | 03 §1 | 2 | MVP | 06c M07 |
| V-34.26 | rôle SUPER_ADMIN | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H12 |
| V-34.27 | Les permissions doivent être granulaires. | N/A | N/A | 03 §1 | 2 | MVP | 06c M08 |
| V-35.01 | Chaque action sensible doit être enregistrée. | N/A | N/A | 03 §1 | 2 | MVP | 06c M09 |
| V-35.02 | Exemples : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H13 |
| V-35.03 | "Admin X a approuvé le distributeur Y." | N/A | N/A | 03 §1 | 2 | MVP | 06c M10 |
| V-35.04 | "Admin X a modifié le prix du produit Z." | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H14 |
| V-35.05 | "Distributeur Y a modifié son stock." | N/A | N/A | 03 §1 | 2 | MVP | 06c M11 |
| V-35.06 | "Client X a payé la commande Y." | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H15 |
| V-35.07 | "Admin X a suspendu le distributeur Z." | N/A | N/A | 03 §1 | 2 | MVP | 06c M12 |
| V-35.08 | Afficher ces événements dans le back-office. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H01 |
| V-36.01 | Optimiser : | N/A | N/A | 03 §1 | 2 | MVP | 06c M13 |
| V-36.02 | images | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H02 |
| V-36.03 | lazy loading | N/A | N/A | 03 §1 | 2 | MVP | 06c M14 |
| V-36.04 | cache | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H03 |
| V-36.05 | API | N/A | N/A | 03 §1 | 2 | MVP | 06c M15 |
| V-36.06 | requêtes BDD | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H04 |
| V-36.07 | pagination | N/A | N/A | 03 §1 | 2 | MVP | 06c M16 |
| V-36.08 | code splitting | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H05 |
| V-36.09 | compression | N/A | N/A | 03 §1 | 2 | MVP | 06c M17 |
| V-36.10 | CDN | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H06 |
| V-36.11 | cache serveur. | N/A | N/A | 03 §1 | 2 | MVP | 06c M18 |
| V-36.12 | Objectif : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H07 |
| V-36.13 | site rapide même avec une connexion moyenne au Cameroun. | N/A | N/A | 03 §1 | 2 | MVP | 06c M19 |
| V-36.14 | Prévoir PWA si pertinent. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H08 |
| V-36.15 | Permettre éventuellement l'installation du site sur Android comme application web. | N/A | N/A | 03 §1 | 2 | MVP | 06c M20 |
| V-37.01 | Optimiser : | N/A | N/A | 03 §1 | 2 | MVP | 06c M21 |
| V-37.02 | titres | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H09 |
| V-37.03 | meta descriptions | N/A | N/A | 03 §1 | 2 | MVP | 06c M22 |
| V-37.04 | Open Graph | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H10 |
| V-37.05 | données structurées | N/A | N/A | 03 §1 | 2 | MVP | 06c M23 |
| V-37.06 | sitemap | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H11 |
| V-37.07 | robots.txt | N/A | N/A | 03 §1 | 2 | MVP | 06c M24 |
| V-37.08 | pages produits | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H12 |
| V-37.09 | pages villes | N/A | N/A | 03 §1 | 2 | MVP | 06c M25 |
| V-37.10 | pages points de vente. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H13 |
| V-37.11 | Créer des pages SEO locales : | N/A | N/A | 03 §1 | 2 | MVP | 06c M26 |
| V-37.12 | /points-de-vente/yaounde | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H14 |
| V-37.13 | /points-de-vente/douala | N/A | N/A | 03 §1 | 2 | MVP | 06c M27 |
| V-37.14 | /points-de-vente/bafoussam | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H15 |
| V-37.15 | etc. | N/A | N/A | 03 §1 | 2 | MVP | 06c M28 |
| V-37.16 | ATTENTION : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H01 |
| V-37.17 | Ne pas générer artificiellement des centaines de pages vides. | N/A | N/A | 03 §1 | 2 | MVP | 06c M29 |
| V-38.01 | Respecter autant que possible WCAG. | N/A | N/A | 03 §1 | 2 | MVP | 06c M04 |
| V-38.02 | Prévoir : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H02 |
| V-38.03 | contraste | N/A | N/A | 03 §1 | 2 | MVP | 06c M05 |
| V-38.04 | navigation clavier | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H03 |
| V-38.05 | labels | N/A | N/A | 03 §1 | 2 | MVP | 06c M06 |
| V-38.06 | tailles de boutons adaptées au mobile | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H04 |
| V-38.07 | messages d'erreur compréhensibles | N/A | N/A | 03 §1 | 2 | MVP | 06c M07 |
| V-38.08 | lecteurs d'écran. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H05 |
| V-39.01 | Avant de coder : | N/A | N/A | 03 §1 | 2 | MVP | 06c M08 |
| V-39.02 | inspecter l'architecture actuelle. | N/A | N/A | 04 §1 | 8 | Plus tard | 06c H06 |
| V-39.03 | NE PAS changer arbitrairement de framework. | N/A | N/A | 03 §1 | 2 | MVP | 06c M09 |
| V-39.04 | Si la stack existante est viable : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H07 |
| V-39.05 | la conserver. | N/A | N/A | 03 §1 | 2 | MVP | 06c M10 |
| V-39.06 | Sinon proposer une migration justifiée. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H08 |
| V-39.07 | Architecture recommandée si une refonte backend est nécessaire : | N/A | N/A | 04 §1 | 2 | MVP | 06c M11 |
| V-39.08 | Frontend : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H09 |
| V-39.09 | React / Next.js | N/A | N/A | 03 §1 | 2 | MVP | 06c M12 |
| V-39.10 | Backend : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H10 |
| V-39.11 | Node.js / NestJS ou architecture équivalente | N/A | N/A | 04 §1 | 2 | MVP | 06c M13 |
| V-39.12 | Database : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H11 |
| V-39.13 | PostgreSQL ou MySQL selon l'existant | N/A | N/A | 03 §1 | 2 | MVP | 06c M14 |
| V-39.14 | Cache : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H12 |
| V-39.15 | Redis si nécessaire | N/A | N/A | 03 §1 | 2 | MVP | 06c M15 |
| V-39.16 | Maps : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H13 |
| V-39.17 | solution de cartographie compatible avec le contexte et le budget | N/A | N/A | 03 §1 | 2 | MVP | 06c M16 |
| V-39.18 | Storage : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H14 |
| V-39.19 | stockage objet pour images/documents | N/A | N/A | 03 §1 | 2 | MVP | 06c M17 |
| V-39.20 | Notifications : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H15 |
| V-39.21 | email + WhatsApp + notifications web | N/A | N/A | 03 §1 | 2 | MVP | 06c M18 |
| V-39.22 | AI : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H01 |
| V-39.23 | LLM + RAG + base de connaissances PLEINGAZ | N/A | N/A | 03 §1 | 2 | MVP | 06c M19 |
| V-39.24 | Payments : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H02 |
| V-39.25 | couche d'abstraction permettant MTN MoMo / Orange Money / paiement manuel. | N/A | N/A | 03 §1 | 2 | MVP | 06c M20 |
| V-40.01 | Prévoir au minimum les entités : | N/A | N/A | 03 §1 | 2 | MVP | 06c M21 |
| V-40.02 | entité User | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H03 |
| V-40.03 | entité Role | N/A | N/A | 03 §1 | 2 | MVP | 06c M22 |
| V-40.04 | entité CustomerProfile | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H04 |
| V-40.05 | entité DistributorProfile | N/A | N/A | 03 §1 | 2 | MVP | 06c M23 |
| V-40.06 | entité DistributorApplication | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H05 |
| V-40.07 | entité DistributorDocument | N/A | N/A | 03 §1 | 2 | MVP | 06c M24 |
| V-40.08 | entité Store | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H06 |
| V-40.09 | entité StoreLocation | N/A | N/A | 03 §1 | 2 | MVP | 06c M25 |
| V-40.10 | entité Product | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H07 |
| V-40.11 | entité ProductCategory | N/A | N/A | 03 §1 | 2 | MVP | 06c M26 |
| V-40.12 | entité Inventory | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H08 |
| V-40.13 | entité InventoryUpdate | N/A | N/A | 03 §1 | 2 | MVP | 06c M27 |
| V-40.14 | entité Order | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H09 |
| V-40.15 | entité OrderItem | N/A | N/A | 03 §1 | 2 | MVP | 06c M28 |
| V-40.16 | entité DistributorOrder | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H10 |
| V-40.17 | entité DistributorOrderItem | N/A | N/A | 03 §1 | 2 | MVP | 06c M29 |
| V-40.18 | entité Payment | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H11 |
| V-40.19 | entité PaymentTransaction | N/A | N/A | 03 §1 | 2 | MVP | 06c M04 |
| V-40.20 | entité Invoice | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H12 |
| V-40.21 | entité InvoiceItem | N/A | N/A | 03 §1 | 2 | MVP | 06c M05 |
| V-40.22 | entité Delivery | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H13 |
| V-40.23 | entité Conversation | N/A | N/A | 03 §1 | 2 | MVP | 06c M06 |
| V-40.24 | entité Message | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H14 |
| V-40.25 | entité Notification | N/A | N/A | 03 §1 | 2 | MVP | 06c M07 |
| V-40.26 | entité Review | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H15 |
| V-40.27 | entité Favorite | N/A | N/A | 03 §1 | 2 | MVP | 06c M08 |
| V-40.28 | entité SupportTicket | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H01 |
| V-40.29 | entité KnowledgeDocument | N/A | N/A | 03 §1 | 2 | MVP | 06c M09 |
| V-40.30 | entité AuditLog | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H02 |
| V-40.31 | entité Promotion | N/A | N/A | 03 §1 | 2 | MVP | 06c M10 |
| V-40.32 | entité LoyaltyAccount | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H03 |
| V-40.33 | entité LoyaltyTransaction | N/A | N/A | 03 §1 | 2 | MVP | 06c M11 |
| V-40.34 | entité StockAlert | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H04 |
| V-40.35 | entité DemandAlert | N/A | N/A | 03 §1 | 2 | MVP | 06c M12 |
| V-40.36 | entité Address | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H05 |
| V-41.01 | Créer un système RBAC. | N/A | N/A | 03 §1 | 2 | MVP | 06c M13 |
| V-41.02 | Exemple : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H06 |
| V-41.03 | rôle CUSTOMER : | N/A | N/A | 03 §1 | 2 | MVP | 06c M14 |
| V-41.04 | consulter | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H07 |
| V-41.05 | commander | N/A | N/A | 03 §1 | 2 | MVP | 06c M15 |
| V-41.06 | payer | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H08 |
| V-41.07 | consulter ses factures | N/A | N/A | 03 §1 | 2 | MVP | 06c M16 |
| V-41.08 | discuter | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H09 |
| V-41.09 | évaluer. | N/A | N/A | 03 §1 | 2 | MVP | 06c M17 |
| V-41.10 | rôle DISTRIBUTOR : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H10 |
| V-41.11 | gérer boutique | N/A | N/A | 03 §1 | 2 | MVP | 06c M18 |
| V-41.12 | gérer stock | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H11 |
| V-41.13 | recevoir commandes | N/A | N/A | 03 §1 | 2 | MVP | 06c M19 |
| V-41.14 | commander à PLEINGAZ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H12 |
| V-41.15 | gérer informations | N/A | N/A | 03 §1 | 2 | MVP | 06c M20 |
| V-41.16 | consulter factures. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H13 |
| V-41.17 | rôle SUPPORT_AGENT : | N/A | N/A | 03 §1 | 2 | MVP | 06c M21 |
| V-41.18 | gérer conversations | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H14 |
| V-41.19 | consulter commandes | N/A | N/A | 03 §1 | 2 | MVP | 06c M22 |
| V-41.20 | assister les clients. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H15 |
| V-41.21 | rôle DISTRIBUTOR_MANAGER : | N/A | N/A | 03 §1 | 2 | MVP | 06c M23 |
| V-41.22 | valider distributeurs | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H01 |
| V-41.23 | gérer réseau. | N/A | N/A | 03 §1 | 2 | MVP | 06c M24 |
| V-41.24 | rôle FINANCE_MANAGER : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H02 |
| V-41.25 | paiements | N/A | N/A | 03 §1 | 2 | MVP | 06c M25 |
| V-41.26 | factures | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H03 |
| V-41.27 | rapports financiers. | N/A | N/A | 03 §1 | 2 | MVP | 06c M26 |
| V-41.28 | rôle LOGISTICS_MANAGER : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H04 |
| V-41.29 | livraisons | N/A | N/A | 03 §1 | 2 | MVP | 06c M27 |
| V-41.30 | commandes | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H05 |
| V-41.31 | suivi. | N/A | N/A | 03 §1 | 2 | MVP | 06c M28 |
| V-41.32 | ADMIN : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H06 |
| V-41.33 | gestion globale. | N/A | N/A | 03 §1 | 2 | MVP | 06c M29 |
| V-41.34 | SUPER_ADMIN : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H07 |
| V-41.35 | configuration système. | N/A | N/A | 03 §1 | 2 | MVP | 06c M04 |
| V-42.01 | Parcours cible : | N/A | N/A | 03 §1 | 2 | MVP | 06c M05 |
| V-42.02 | Accueil | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H08 |
| V-42.03 | ↓ | N/A | N/A | 03 §1 | 2 | MVP | 06c M06 |
| V-42.04 | Recherche | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H09 |
| V-42.05 | ↓ | N/A | N/A | 03 §1 | 2 | MVP | 06c M07 |
| V-42.06 | Produit / Point de vente | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H10 |
| V-42.07 | ↓ | N/A | N/A | 03 §1 | 2 | MVP | 06c M08 |
| V-42.08 | Disponibilité | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H11 |
| V-42.09 | ↓ | N/A | N/A | 03 §1 | 2 | MVP | 06c M09 |
| V-42.10 | Choix du distributeur | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H12 |
| V-42.11 | ↓ | N/A | N/A | 03 §1 | 2 | MVP | 06c M10 |
| V-42.12 | Retrait ou livraison | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H13 |
| V-42.13 | ↓ | N/A | N/A | 03 §1 | 2 | MVP | 06c M11 |
| V-42.14 | Panier | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H14 |
| V-42.15 | ↓ | N/A | N/A | 03 §1 | 2 | MVP | 06c M12 |
| V-42.16 | Adresse | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H15 |
| V-42.17 | ↓ | N/A | N/A | 03 §1 | 2 | MVP | 06c M13 |
| V-42.18 | Paiement | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H01 |
| V-42.19 | ↓ | N/A | N/A | 03 §1 | 2 | MVP | 06c M14 |
| V-42.20 | Confirmation | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H02 |
| V-42.21 | ↓ | N/A | N/A | 03 §1 | 2 | MVP | 06c M15 |
| V-42.22 | Suivi | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H03 |
| V-42.23 | ↓ | N/A | N/A | 03 §1 | 2 | MVP | 06c M16 |
| V-42.24 | Livraison | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H04 |
| V-42.25 | ↓ | N/A | N/A | 03 §1 | 2 | MVP | 06c M17 |
| V-42.26 | Facture | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H05 |
| V-42.27 | ↓ | N/A | N/A | 03 §1 | 2 | MVP | 06c M18 |
| V-42.28 | Avis | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H06 |
| V-43.01 | Inscription | N/A | N/A | 03 §1 | 2 | MVP | 06c M19 |
| V-43.02 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H07 |
| V-43.03 | Dépôt du dossier | N/A | N/A | 03 §1 | 2 | MVP | 06c M20 |
| V-43.04 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H08 |
| V-43.05 | PENDING | N/A | N/A | 03 §1 | 2 | MVP | 06c M21 |
| V-43.06 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H09 |
| V-43.07 | Vérification PLEINGAZ | N/A | N/A | 03 §1 | 2 | MVP | 06c M22 |
| V-43.08 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H10 |
| V-43.09 | APPROVED | N/A | N/A | 03 §1 | 2 | MVP | 06c M23 |
| V-43.10 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H11 |
| V-43.11 | Boutique visible | N/A | N/A | 03 §1 | 2 | MVP | 06c M24 |
| V-43.12 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H12 |
| V-43.13 | Gestion stock | N/A | N/A | 03 §1 | 2 | MVP | 06c M25 |
| V-43.14 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H13 |
| V-43.15 | Réception commandes | N/A | N/A | 03 §1 | 2 | MVP | 06c M26 |
| V-43.16 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H14 |
| V-43.17 | Commandes à PLEINGAZ | N/A | N/A | 03 §1 | 2 | MVP | 06c M27 |
| V-43.18 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H15 |
| V-43.19 | Livraison/réapprovisionnement | N/A | N/A | 03 §1 | 2 | MVP | 06c M28 |
| V-43.20 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H01 |
| V-43.21 | Facturation | N/A | N/A | 03 §1 | 2 | MVP | 06c M29 |
| V-43.22 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H02 |
| V-43.23 | Suivi activité. | N/A | N/A | 03 §1 | 2 | MVP | 06c M04 |
| V-44.01 | Connexion sécurisée | N/A | N/A | 03 §1 | 2 | MVP | 06c M05 |
| V-44.02 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H03 |
| V-44.03 | Dashboard | N/A | N/A | 03 §1 | 2 | MVP | 06c M06 |
| V-44.04 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H04 |
| V-44.05 | Supervision | N/A | N/A | 03 §1 | 2 | MVP | 06c M07 |
| V-44.06 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H05 |
| V-44.07 | Distributeurs | N/A | N/A | 03 §1 | 2 | MVP | 06c M08 |
| V-44.08 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H06 |
| V-44.09 | Demandes de validation | N/A | N/A | 03 §1 | 2 | MVP | 06c M09 |
| V-44.10 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H07 |
| V-44.11 | Produits | N/A | N/A | 03 §1 | 2 | MVP | 06c M10 |
| V-44.12 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H08 |
| V-44.13 | Commandes | N/A | N/A | 03 §1 | 2 | MVP | 06c M11 |
| V-44.14 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H09 |
| V-44.15 | Stocks | N/A | N/A | 03 §1 | 2 | MVP | 06c M12 |
| V-44.16 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H10 |
| V-44.17 | Paiements | N/A | N/A | 03 §1 | 2 | MVP | 06c M13 |
| V-44.18 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H11 |
| V-44.19 | Factures | N/A | N/A | 03 §1 | 2 | MVP | 06c M14 |
| V-44.20 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H12 |
| V-44.21 | Livraisons | N/A | N/A | 03 §1 | 2 | MVP | 06c M15 |
| V-44.22 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H13 |
| V-44.23 | Support | N/A | N/A | 03 §1 | 2 | MVP | 06c M16 |
| V-44.24 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H14 |
| V-44.25 | IA | N/A | N/A | 05c §1 | 2 | MVP | 06c M17 |
| V-44.26 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H15 |
| V-44.27 | Rapports | N/A | N/A | 03 §1 | 2 | MVP | 06c M18 |
| V-44.28 | ↓ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H01 |
| V-44.29 | Audit. | N/A | N/A | 03 §1 | 2 | MVP | 06c M19 |
| V-45.01 | Créer des rapports : | N/A | N/A | 03 §1 | 2 | MVP | 06c M20 |
| V-45.02 | ventes | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H02 |
| V-45.03 | commandes | N/A | N/A | 03 §1 | 2 | MVP | 06c M21 |
| V-45.04 | revenus | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H03 |
| V-45.05 | produits les plus demandés | N/A | N/A | 03 §1 | 2 | MVP | 06c M22 |
| V-45.06 | villes | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H04 |
| V-45.07 | distributeurs | N/A | N/A | 03 §1 | 2 | MVP | 06c M23 |
| V-45.08 | disponibilité | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H05 |
| V-45.09 | ruptures | N/A | N/A | 03 §1 | 2 | MVP | 06c M24 |
| V-45.10 | paiements | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H06 |
| V-45.11 | livraisons | N/A | N/A | 03 §1 | 2 | MVP | 06c M25 |
| V-45.12 | satisfaction. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H07 |
| V-45.13 | Exporter : | N/A | N/A | 03 §1 | 2 | MVP | 06c M26 |
| V-45.14 | PDF | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H08 |
| V-45.15 | CSV | N/A | N/A | 03 §1 | 2 | MVP | 06c M27 |
| V-45.16 | Excel | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H09 |
| V-46.01 | Le dashboard administrateur doit produire des informations utiles et pas uniquement des graphiques. | N/A | N/A | 03 §1 | 2 | MVP | 06c M28 |
| V-46.02 | Exemples : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H10 |
| V-46.03 | "12 distributeurs n'ont pas actualisé leur stock depuis 48h." | N/A | N/A | 03 §1 | 2 | MVP | 06c M29 |
| V-46.04 | "Zone de Bastos : forte demande mais faible disponibilité." | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H11 |
| V-46.05 | "24 commandes en attente." | N/A | N/A | 03 §1 | 2 | MVP | 06c M04 |
| V-46.06 | "8 distributeurs semblent proches d'une rupture." | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H12 |
| V-46.07 | "Le produit X connaît une augmentation de la demande." | N/A | N/A | 03 §1 | 2 | MVP | 06c M05 |
| V-46.08 | "3 demandes de distributeurs attendent une validation." | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H13 |
| V-47.01 | Créer un assistant IA réservé aux administrateurs. | N/A | N/A | 05c §1 | 2 | MVP | 06c M06 |
| V-47.02 | Exemples : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H14 |
| V-47.03 | "Quels sont les points de vente actuellement en rupture à Yaoundé ?" | N/A | N/A | 03 §1 | 2 | MVP | 06c M07 |
| V-47.04 | "Quels produits ont connu le plus de demandes cette semaine ?" | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H15 |
| V-47.05 | "Quels distributeurs n'ont pas mis leur stock à jour ?" | N/A | N/A | 03 §1 | 2 | MVP | 06c M08 |
| V-47.06 | "Combien de commandes ont été livrées aujourd'hui ?" | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H01 |
| V-47.07 | "Quelles zones nécessitent probablement davantage de points de vente ?" | N/A | N/A | 03 §1 | 2 | MVP | 06c M09 |
| V-47.08 | L'IA doit interroger les données réelles et ne jamais inventer de statistiques. | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H02 |
| V-48.01 | Le chatbot doit avoir une personnalité : | N/A | N/A | 03 §1 | 2 | MVP | 06c M10 |
| V-48.02 | professionnelle | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H03 |
| V-48.03 | simple | N/A | N/A | 03 §1 | 2 | MVP | 06c M11 |
| V-48.04 | rapide | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H04 |
| V-48.05 | adaptée au contexte camerounais. | N/A | N/A | 03 §1 | 2 | MVP | 06c M12 |
| V-48.06 | Il doit toujours distinguer : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H05 |
| V-48.07 | INFORMATION CERTAINE | N/A | N/A | 03 §1 | 2 | MVP | 06c M13 |
| V-48.08 | INFORMATION DYNAMIQUE | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H06 |
| V-48.09 | INFORMATION INDISPONIBLE. | N/A | N/A | 03 §1 | 2 | MVP | 06c M14 |
| V-48.10 | Exemple : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H07 |
| V-48.11 | "Je n'ai pas de donnée actualisée sur le stock de ce point de vente. Je peux vous montrer les autres points de vente proches." | N/A | N/A | 03 §1 | 2 | MVP | 06c M15 |
| V-49.01 | Chaque distributeur visible doit afficher clairement : | N/A | N/A | 03 §1 | 2 | MVP | 06c M16 |
| V-49.02 | ✓ Distributeur vérifié | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H08 |
| V-49.03 | Stock : | N/A | N/A | 03 §1 | 2 | MVP | 06c M17 |
| V-49.04 | 🟢 disponible | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H09 |
| V-49.05 | Dernière mise à jour : | N/A | N/A | 03 §1 | 2 | MVP | 06c M18 |
| V-49.06 | il y a 25 minutes | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H10 |
| V-49.07 | Distance : | N/A | N/A | 03 §1 | 2 | MVP | 06c M19 |
| V-49.08 | 1,8 km | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H11 |
| V-49.09 | Livraison : | N/A | N/A | 03 §1 | 2 | MVP | 06c M20 |
| V-49.10 | Disponible | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H12 |
| V-49.11 | WhatsApp : | N/A | N/A | 03 §1 | 2 | MVP | 06c M21 |
| V-49.12 | Disponible | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H13 |
| V-49.13 | Cela doit renforcer la confiance. | N/A | N/A | 03 §1 | 2 | MVP | 06c M22 |
| V-50.01 | La majorité des utilisateurs pouvant accéder à la plateforme depuis un smartphone, concevoir d'abord pour mobile. | N/A | N/A | 03 §1 | 2 | MVP | 06c M23 |
| V-50.02 | Tester au minimum : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H14 |
| V-50.03 | petit Android | N/A | N/A | 03 §1 | 2 | MVP | 06c M24 |
| V-50.04 | écran moyen | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H15 |
| V-50.05 | tablette | N/A | N/A | 03 §1 | 2 | MVP | 06c M25 |
| V-50.06 | desktop. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H01 |
| V-51.01 | Étudier l'intégration d'une Progressive Web App. | N/A | N/A | 03 §1 | 2 | MVP | 06c M26 |
| V-51.02 | Fonctionnalités : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H02 |
| V-51.03 | installation | N/A | N/A | 03 §1 | 2 | MVP | 06c M27 |
| V-51.04 | cache | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H03 |
| V-51.05 | notifications | N/A | N/A | 03 §1 | 2 | MVP | 06c M28 |
| V-51.06 | fonctionnement dégradé hors ligne | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H04 |
| V-51.07 | raccourci écran d'accueil. | N/A | N/A | 03 §1 | 2 | MVP | 06c M29 |
| V-52.01 | Ajouter : | N/A | N/A | 03 §1 | 2 | MVP | 06c M04 |
| V-52.02 | logs | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H05 |
| V-52.03 | monitoring | N/A | N/A | 03 §1 | 2 | MVP | 06c M05 |
| V-52.04 | erreurs frontend | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H06 |
| V-52.05 | erreurs backend | N/A | N/A | 03 §1 | 2 | MVP | 06c M06 |
| V-52.06 | temps de réponse | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H07 |
| V-52.07 | disponibilité API | N/A | N/A | 03 §1 | 2 | MVP | 06c M07 |
| V-52.08 | alertes système. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H08 |
| V-52.09 | Créer une page admin : | N/A | N/A | 03 §1 | 2 | MVP | 06c M08 |
| V-52.10 | "État de la plateforme" | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H09 |
| V-53.01 | La plateforme doit rester extrêmement simple. | N/A | N/A | 03 §1 | 2 | MVP | 06c M09 |
| V-53.02 | Le client ne doit pas voir : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H10 |
| V-53.03 | 30 boutons. | N/A | N/A | 03 §1 | 2 | MVP | 06c M10 |
| V-53.04 | Il doit principalement voir : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H11 |
| V-53.05 | Acheter | N/A | N/A | 03 §1 | 2 | MVP | 06c M11 |
| V-53.06 | Trouver du gaz | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H12 |
| V-53.07 | Commander | N/A | N/A | 03 §1 | 2 | MVP | 06c M12 |
| V-53.08 | Suivre ma commande | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H13 |
| V-53.09 | Mes factures | N/A | N/A | 03 §1 | 2 | MVP | 06c M13 |
| V-53.10 | Assistance | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H14 |
| V-54.01 | NE PAS développer toutes les fonctionnalités simultanément. | N/A | N/A | 03 §1 | 2 | MVP | 06c M14 |
| V-54.02 | PHASE 1 — AUDIT | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H15 |
| V-54.03 | Analyser le site existant. | N/A | N/A | 03 §1 | 2 | MVP | 06c M15 |
| V-54.04 | Produire : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H01 |
| V-54.05 | architecture actuelle | N/A | N/A | 04 §1 | 2 | MVP | 06c M16 |
| V-54.06 | technologies | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H02 |
| V-54.07 | pages | N/A | N/A | 03 §1 | 2 | MVP | 06c M17 |
| V-54.08 | composants | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H03 |
| V-54.09 | problèmes UX | N/A | N/A | 03 §1 | 2 | MVP | 06c M18 |
| V-54.10 | problèmes sécurité | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H04 |
| V-54.11 | problèmes performance | N/A | N/A | 03 §1 | 2 | MVP | 06c M19 |
| V-54.12 | fonctionnalités existantes | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H05 |
| V-54.13 | fonctionnalités à conserver | N/A | N/A | 03 §1 | 2 | MVP | 06c M20 |
| V-54.14 | fonctionnalités à modifier. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H06 |
| V-54.15 | Ne coder aucune nouvelle fonctionnalité avant cet audit. | N/A | N/A | 03 §1 | 2 | MVP | 06c M21 |
| V-54.16 | PHASE 2 — FONDATIONS | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H07 |
| V-54.17 | authentification | N/A | N/A | 03 §1 | 2 | MVP | 06c M22 |
| V-54.18 | utilisateurs | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H08 |
| V-54.19 | rôles | N/A | N/A | 03 §1 | 2 | MVP | 06c M23 |
| V-54.20 | profils | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H09 |
| V-54.21 | base de données | N/A | N/A | 03 §1 | 2 | MVP | 06c M24 |
| V-54.22 | sécurité. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H10 |
| V-54.23 | PHASE 3 — DISTRIBUTEURS | N/A | N/A | 03 §1 | 2 | MVP | 06c M25 |
| V-54.24 | inscription | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H11 |
| V-54.25 | dossier | N/A | N/A | 03 §1 | 2 | MVP | 06c M26 |
| V-54.26 | validation | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H12 |
| V-54.27 | boutique | N/A | N/A | 03 §1 | 2 | MVP | 06c M27 |
| V-54.28 | géolocalisation | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H13 |
| V-54.29 | carte. | N/A | N/A | 03 §1 | 2 | MVP | 06c M28 |
| V-54.30 | PHASE 4 — PRODUITS + STOCK | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H14 |
| V-54.31 | catalogue | N/A | N/A | 03 §1 | 2 | MVP | 06c M29 |
| V-54.32 | disponibilité | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H15 |
| V-54.33 | stock | N/A | N/A | 03 §1 | 2 | MVP | 06c M04 |
| V-54.34 | recherche. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H01 |
| V-54.35 | PHASE 5 — COMMANDES | N/A | N/A | 03 §1 | 2 | MVP | 06c M05 |
| V-54.36 | panier | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H02 |
| V-54.37 | commandes | N/A | N/A | 03 §1 | 2 | MVP | 06c M06 |
| V-54.38 | livraison | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H03 |
| V-54.39 | factures. | N/A | N/A | 03 §1 | 2 | MVP | 06c M07 |
| V-54.40 | PHASE 6 — PAIEMENTS | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H04 |
| V-54.41 | Mobile Money | N/A | N/A | 03 §1 | 2 | MVP | 06c M08 |
| V-54.42 | paiement présentiel | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H05 |
| V-54.43 | webhooks | N/A | N/A | 03 §1 | 2 | MVP | 06c M09 |
| V-54.44 | rapprochement. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H06 |
| V-54.45 | PHASE 7 — COMMUNICATION | N/A | N/A | 03 §1 | 2 | MVP | 06c M10 |
| V-54.46 | chat | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H07 |
| V-54.47 | WhatsApp | N/A | N/A | 03 §1 | 2 | MVP | 06c M11 |
| V-54.48 | email | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H08 |
| V-54.49 | notifications. | N/A | N/A | 03 §1 | 2 | MVP | 06c M12 |
| V-54.50 | PHASE 8 — IA | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H09 |
| V-54.51 | chatbot | N/A | N/A | 03 §1 | 2 | MVP | 06c M13 |
| V-54.52 | recherche intelligente | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H10 |
| V-54.53 | localisation | N/A | N/A | 03 §1 | 2 | MVP | 06c M14 |
| V-54.54 | assistant admin. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H11 |
| V-54.55 | PHASE 9 — ANALYTICS | N/A | N/A | 03 §1 | 2 | MVP | 06c M15 |
| V-54.56 | dashboard | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H12 |
| V-54.57 | rapports | N/A | N/A | 03 §1 | 2 | MVP | 06c M16 |
| V-54.58 | prévisions | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H13 |
| V-54.59 | heatmap. | N/A | N/A | 03 §1 | 2 | MVP | 06c M17 |
| V-54.60 | PHASE 10 — OPTIMISATION | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H14 |
| V-54.61 | performance | N/A | N/A | 03 §1 | 2 | MVP | 06c M18 |
| V-54.62 | SEO | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H15 |
| V-54.63 | sécurité | N/A | N/A | 03 §1 | 2 | MVP | 06c M19 |
| V-54.64 | accessibilité | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H01 |
| V-54.65 | tests | N/A | N/A | 03 §1 | 2 | MVP | 06c M20 |
| V-54.66 | monitoring. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H02 |
| V-55.01 | Créer des tests : | N/A | N/A | 03 §1 | 2 | MVP | 06c M21 |
| V-55.02 | unitaires | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H03 |
| V-55.03 | intégration | N/A | N/A | 03 §1 | 2 | MVP | 06c M22 |
| V-55.04 | API | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H04 |
| V-55.05 | authentification | N/A | N/A | 03 §1 | 2 | MVP | 06c M23 |
| V-55.06 | permissions | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H05 |
| V-55.07 | paiement | N/A | N/A | 03 §1 | 2 | MVP | 06c M24 |
| V-55.08 | commandes | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H06 |
| V-55.09 | factures | N/A | N/A | 03 §1 | 2 | MVP | 06c M25 |
| V-55.10 | notifications | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H07 |
| V-55.11 | géolocalisation | N/A | N/A | 03 §1 | 2 | MVP | 06c M26 |
| V-55.12 | chatbot. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H08 |
| V-55.13 | Tester particulièrement : | N/A | N/A | 03 §1 | 2 | MVP | 06c M27 |
| V-55.14 | double paiement | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H09 |
| V-55.15 | double commande | N/A | N/A | 03 §1 | 2 | MVP | 06c M28 |
| V-55.16 | utilisateur non autorisé | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H10 |
| V-55.17 | distributeur non validé | N/A | N/A | 03 §1 | 2 | MVP | 06c M29 |
| V-55.18 | modification frauduleuse du prix | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H11 |
| V-55.19 | faux statut de paiement | N/A | N/A | 03 §1 | 2 | MVP | 06c M04 |
| V-55.20 | accès à une facture appartenant à quelqu'un d'autre. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H12 |
| V-56.01 | NE PAS supprimer une fonctionnalité existante sans justification. | N/A | N/A | 03 §1 | 2 | MVP | 06c M05 |
| V-56.02 | NE PAS modifier le contenu métier sans vérification. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H13 |
| V-56.03 | NE PAS inventer les informations officielles de PLEINGAZ. | N/A | N/A | 03 §1 | 2 | MVP | 06c M06 |
| V-56.04 | NE PAS inventer les prix. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H14 |
| V-56.05 | NE PAS inventer les distributeurs. | N/A | N/A | 03 §1 | 2 | MVP | 06c M07 |
| V-56.06 | NE PAS inventer les stocks. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H15 |
| V-56.07 | NE PAS inventer les horaires. | N/A | N/A | 03 §1 | 2 | MVP | 06c M08 |
| V-56.08 | Les données dynamiques doivent provenir de la base de données. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H01 |
| V-57.01 | Avant de commencer le développement, produire : | N/A | N/A | 03 §1 | 2 | MVP | 06c M09 |
| V-57.02 | audit complet du site | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H02 |
| V-57.03 | architecture cible | N/A | N/A | 04 §1 | 2 | MVP | 06c M10 |
| V-57.04 | sitemap | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H03 |
| V-57.05 | parcours utilisateurs | N/A | N/A | 03 §1 | 2 | MVP | 06c M11 |
| V-57.06 | matrice des rôles | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H04 |
| V-57.07 | modèle de données | N/A | N/A | 03 §1 | 2 | MVP | 06c M12 |
| V-57.08 | architecture API | N/A | N/A | 04 §1 | 8 | Plus tard | 06c H05 |
| V-57.09 | architecture frontend | N/A | N/A | 04 §1 | 2 | MVP | 06c M13 |
| V-57.10 | architecture IA | N/A | N/A | 05c §1 | 8 | Plus tard | 06c H06 |
| V-57.11 | architecture notifications | N/A | N/A | 04 §1 | 2 | MVP | 06c M14 |
| V-57.12 | architecture paiement | N/A | N/A | 04 §1 | 8 | Plus tard | 06c H07 |
| V-57.13 | architecture cartographique | N/A | N/A | 04 §1 | 2 | MVP | 06c M15 |
| V-57.14 | plan de sécurité | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H08 |
| V-57.15 | plan de tests | N/A | N/A | 03 §1 | 2 | MVP | 06c M16 |
| V-57.16 | roadmap de développement. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H09 |
| V-57.17 | Ensuite seulement commencer l'implémentation. | N/A | N/A | 03 §1 | 2 | MVP | 06c M17 |
| V-58.01 | Ne te limite pas aux fonctionnalités que j'ai données. | N/A | N/A | 03 §1 | 2 | MVP | 06c M18 |
| V-58.02 | À chaque étape, recherche des améliorations pertinentes pour : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H10 |
| V-58.03 | le client | N/A | N/A | 03 §1 | 2 | MVP | 06c M19 |
| V-58.04 | le distributeur | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H11 |
| V-58.05 | PLEINGAZ | N/A | N/A | 03 §1 | 2 | MVP | 06c M20 |
| V-58.06 | la logistique | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H12 |
| V-58.07 | le service client | N/A | N/A | 03 §1 | 2 | MVP | 06c M21 |
| V-58.08 | les ventes | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H13 |
| V-58.09 | la sécurité | N/A | N/A | 03 §1 | 2 | MVP | 06c M22 |
| V-58.10 | la disponibilité du gaz | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H14 |
| V-58.11 | le contexte camerounais. | N/A | N/A | 03 §1 | 2 | MVP | 06c M23 |
| V-58.12 | Mais toute nouvelle idée doit être accompagnée de : | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H15 |
| V-58.13 | PROBLÈME | N/A | N/A | 03 §1 | 2 | MVP | 06c M24 |
| V-58.14 | SOLUTION | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H01 |
| V-58.15 | VALEUR | N/A | N/A | 03 §1 | 2 | MVP | 06c M25 |
| V-58.16 | COMPLEXITÉ | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H02 |
| V-58.17 | PRIORITÉ | N/A | N/A | 03 §1 | 2 | MVP | 06c M26 |
| V-58.18 | Ne jamais ajouter une fonctionnalité uniquement parce qu'elle est "à la mode". | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H03 |
| V-59.01 | Le résultat doit être une plateforme PLEINGAZ moderne permettant de passer de : | N/A | N/A | 03 §1 | 2 | MVP | 06c M27 |
| V-59.02 | "Je cherche du gaz." | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H04 |
| V-59.03 | à : | N/A | N/A | 03 §1 | 2 | MVP | 06c M28 |
| V-59.04 | "Je sais où trouver du gaz, je sais s'il est disponible, je peux commander, payer, être livré, obtenir ma facture et contacter quelqu'un si nécessaire." | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H05 |
| V-59.05 | Et côté entreprise : | N/A | N/A | 03 §1 | 2 | MVP | 06c M29 |
| V-59.06 | "Je sais où se trouve mon réseau, qui vend, qui a du stock, qui commande, où se trouve la demande, quelles zones sont sous-desservies et comment améliorer la distribution." | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H06 |
| V-59.07 | La plateforme doit être suffisamment modulaire pour évoluer ensuite vers : | N/A | N/A | 03 §1 | 2 | MVP | 06c M04 |
| V-59.08 | application Android | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H07 |
| V-59.09 | application iOS | N/A | N/A | 03 §1 | 2 | MVP | 06c M05 |
| V-59.10 | réseau national de distributeurs | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H08 |
| V-59.11 | programme de fidélité | N/A | N/A | 03 §1 | 2 | MVP | 06c M06 |
| V-59.12 | marketplace | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H09 |
| V-59.13 | analytics avancés | N/A | N/A | 03 §1 | 2 | MVP | 06c M07 |
| V-59.14 | automatisation logistique | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H10 |
| V-59.15 | expansion dans d'autres pays africains. | N/A | N/A | 03 §1 | 2 | MVP | 06c M08 |
| V-59.16 | Commence maintenant par l'AUDIT du site existant. | N/A | N/A | 03 §1 | 8 | Plus tard | 06c H11 |
| V-59.17 | NE COMMENCE PAS immédiatement à coder. | N/A | N/A | 03 §1 | 2 | MVP | 06c M09 |
| V-59.18 | Présente d'abord les résultats de l'audit et attends la validation de l'architecture cible avant de procéder aux modifications importantes. | N/A | N/A | 04 §1 | 8 | Plus tard | 06c H12 |
