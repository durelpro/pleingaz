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
| P-01.01 | (1) Positionnement : Réseau numérique | N/A | Accueil | 03 §1 | 1 | MVP | Vision globale. |
| P-01.02 | (1) Produit : PLEINGAZ Client | User | Portail | 03 §1 | 1 | MVP | ADR D1. |
| P-01.03 | (1) Produit : PLEINGAZ Distributeur | Distributor | Portail | 03 §1 | 1 | MVP | ADR D1. |
| P-01.04 | (1) Produit : PLEINGAZ Control Center | Admin | Portail | 03 §1 | 1 | MVP | ADR D1. |
| P-02.01 | (2) Parcours central J'ai besoin de gaz | Search | Accueil | 06c §1 | 1 | MVP | Remplacera le catalogue. |
| P-02.02 | (2) Choix du produit (regroupe 5 puces : 6 kg, 12,5 kg, 50 kg, accessoire, autre produit) | Product | Recherche | 06c §1 | 1 | MVP | Options du formulaire. |
| P-02.03 | (2) Choix localisation (regroupe 4 puces : autoriser géoloc, saisir ville, saisir quartier, zone sur carte) | N/A | Recherche | 06c §1 | 1 | MVP | Options GPS/Manuelles. |
| P-02.04 | (2) Choix besoin (regroupe 6 puces : sur place, livraison, itinéraire, appeler, WhatsApp, alerte retour stock) | N/A | Recherche | 06c §1 | 1 | MVP | Actions possibles. |
| P-02.05 | (2) Affichage direct (regroupe 10 puces : points de vente, distance, temps trajet, MàJ, horaires, prix, livraison, tel, WhatsApp, statut) | Store | Résultat | 06c §1 | 1 | MVP | Interface de résultats. |
| P-03.01 | (3) Statut: 🟢 Disponible | Inventory | Fiche | 03 §3 | 1 | MVP | Transparence du stock. |
| P-03.02 | (3) Statut: 🟠 Stock limité | Inventory | Fiche | 03 §3 | 1 | MVP | Transparence du stock. |
| P-03.03 | (3) Statut: 🔴 Rupture | Inventory | Fiche | 03 §3 | 1 | MVP | Transparence du stock. |
| P-03.04 | (3) Statut: ⚪ Information ancienne | Inventory | Fiche | 03 §3 | 1 | MVP | Gestion de la fraîcheur. |
| P-03.05 | (3) Affichage obligatoire (regroupe 4 puces : date MàJ, heure, produit, distributeur) | Inventory | Fiche | 03 §3 | 1 | MVP | Preuve de donnée. |
| P-03.06 | (3) Alerte rupture: 'M'avertir quand dispo' | StockAlert | Fiche | 05b §4 | 1 | MVP | Outil de conversion. |
| P-03.07 | (3) Liaison alerte (regroupe 5 puces : compte, téléphone, point de vente, zone, produit) | StockAlert | Fiche | 05b §4 | 1 | MVP | Options de l'alerte. |
| P-04.01 | (4) Carte Publique (regroupe 7 puces : point de vente, quartier, ville, produit, ouvert, stock, boutique qui livre) | Search | Carte | 02 §3.2 | 1 | MVP | Filtres client. |
| P-04.02 | (4) Carte Distributeurs (regroupe 7 puces : approuvés, attente, suspendus, peu couvertes, dispo, inactifs, sans MàJ) | Admin | Carte | 02 §3.4 | 1 | MVP | Supervision Admin. |
| P-04.03 | (4) Carte Stock (regroupe 4 puces : bien approvisionnées, faible, rupture, sans donnée) | Admin | Carte | 02 §3.4 | 1 | MVP | Logistique Admin. |
| P-04.04 | (4) Carte Demande (regroupe 5 puces : recherches, sans stock, commandes, répétées, forte demande) | Admin | Carte | 02 §3.4 | Phase 8 | Plus tard | Analytique spatiale. |
| P-04.05 | (4) Carte Stratégique (regroupe 5 puces : sous-desservis, nouveau distributeur, proche dépôt, demande augmente, délais élevés) | Admin | Carte | 02 §3.4 | Phase 8 | Plus tard | Aide décisionnelle. |
| P-05.01 | (5) Géolocalisation si acceptée (regroupe 6 puces : points proches, distance, horaires, stock, livraison, itinéraire) | Search | Résultat | 06c §1 | 1 | MVP | Affichage proximité. |
| P-05.02 | (5) Géolocalisation si refusée: 'Dans quelle ville/quartier' | N/A | Recherche | 05c §2 | 1 | MVP | Respect vie privée. |
| P-05.03 | (5) Géolocalisation distributeur (regroupe 6 étapes : recherche, géocodage, déplace marqueur, confirme, lat/lng, validation) | Store | Inscription | 02 §3.3 | 1 | MVP | Précision adresse. |
| P-06.01 | (6) Routage intelligent (regroupe 12 critères : dispo, ancienneté MàJ, distance, temps, horaires, capacité, livraison, zone, charge, taux commandes, statut distr, fiabilité) | Search | Résultat | 06c §1 | Phase 2+ | Plus tard | Algorithme complexe. |
| P-06.02 | (6) Classement explicatif visible ('Recommandé car...') | Search | Résultat | 06c §1 | 1 | MVP | Transparence client. |
| P-07.01 | (7) Gestion stock par produit (regroupe 3 produits : 6 kg, 12,5 kg, 50 kg) | Inventory | Dashboard | 03 §1.2 | 1 | MVP | Base du stock. |
| P-07.02 | (7) Niveaux de stock (regroupe 4 puces : bon, moyen, faible, rupture) | Inventory | Dashboard | 03 §1.2 | 1 | MVP | Gestion simplifiée. |
| P-07.03 | (7) Évolutions stock (regroupe 6 puces : qt dispo, qt réservée, seuil alerte, stock physique, stock estimé, date réappro) | Inventory | Dashboard | 03 §1.2 | Phase 2+ | Plus tard | Hors MVP initial. |
| P-08.01 | (8) Actions distr. sur risque (regroupe 4 puces : commander, modifier, ignorer, contacter) | WholesaleOrder | Dashboard | 06c §1 | Phase 2+ | Plus tard | Fonction métier V2. |
| P-08.02 | (8) Alertes Admin (regroupe 5 critères : bon->faible->rupture, commandes augmentent, recherches augmentent, pas MàJ, délai dépassé) | StockAlert | ControlCenter | 06c §1 | Phase 2+ | Plus tard | Analyse risques. |
| P-09.01 | (9) IA workflow (regroupe 5 étapes : produit, zone, recherche, bdd, réponse) | API | Chat | 05c §2 | Phase 8 | Plus tard | Architecture LLM. |
| P-09.02 | (9) IA outils (regroupe 8 outils : find_nearest, check_product, find_open, get_store, get_order, get_invoice, create_alert, contact) | API | Chat | 05c §2 | Phase 8 | Plus tard | Schema Tools. |
| P-09.03 | (9) IA classification (regroupe 5 puces : officielle, dynamique, non dispo, estimation, recommandation) | API | Chat | 05c §2 | Phase 8 | Plus tard | Qualité réponse. |

## BLOC 3b : Positionnement (`03-positionnement.md` - sections 10 à 18)
| ID | Exigence | Entité(s) | Écran(s) | Document(s) | Phase | Statut | Justification |
|---|---|---|---|---|---|---|---|
| P-10.01 | (10) Architecture globale (regroupe 10 blocs : Clients, Distributeurs, Admin, Backend/API, Base, Paiements, Cartes, IA, Notifs, BI) | N/A | N/A | 04 §1 | 1 | MVP | Diagramme validé. |
| P-11.01 | (11) Produit 1 Client parcours (regroupe 10 étapes : Rechercher, Trouver, Vérifier, Choisir, Commander, Payer, Suivre, Recevoir, Télécharger, Évaluer) | N/A | Portail | 02 §3.2 | 1 | MVP | Cycle e-commerce. |
| P-11.02 | (11) Produit 1 Client fonctions (regroupe 12 puces : recherche, dispo, carte, panier, cmd, livraison, paiement, facture, whatsapp, assistance, favoris, alertes) | N/A | Portail | 02 §3.2 | 1 | MVP | Features client. |
| P-11.03 | (11) Produit 2 Distr. fonctions (regroupe 13 puces : inscription, dossier, validation, boutique, localisation, horaires, stock, réception cmd, cmd PLEINGAZ, factures, stats, conversation, alertes) | N/A | Portail | 02 §3.3 | 1 | MVP | Features vendeur. |
| P-11.04 | (11) Produit 3 Admin fonctions (regroupe 15 puces : validation, supervision, produits, prix, commandes, paiements, factures, livraisons, support, carte, heatmap, prévision, rapports, audit, config IA) | Admin | Portail | 02 §3.4 | 1 | MVP | Features admin. |
| P-12.01 | (12) Identité vendeur (regroupe 2 cas : Vente directe, Distributeur agréé) | Invoice | PDF | 05a §4 | 1 | MVP | Conformité légale. |
| P-12.02 | (12) Champs facture (regroupe 13 puces : numéro, réf, vendeur, acheteur, produits, qt, prix, livraison, total, mode paie, statut paie, date, info fiscales) | Invoice | PDF | 05a §4 | 1 | MVP | Structure PDF. |
| P-13.01 | (13) Providers paiement (regroupe 3 modes : MTN, Orange, Présentiel) | Payment | Checkout | 05a §1 | 1 | MVP | Omnicanal. |
| P-13.02 | (13) Principes paiement (regroupe 10 puces : traitement serveur, id transac, conf serveur, webhook, vérif statut, idempotence, journal, échoués, prévention doublons, rapprochement) | Payment | API | 05a §1 | 1 | MVP | Sécurité finance. |
| P-14.01 | (14) Idée: Retour en stock | StockAlert | Mobile | 05b §4 | 1 | MVP | Feature validée. |
| P-14.02 | (14) Idée: Stock non actualisé | Inventory | Fiche | 03 §1.2 | 1 | MVP | Feature validée. |
| P-14.03 | (14) Idée: Précommande | Order | Checkout | 06c §1 | Phase 2+ | Plus tard | Hors MVP strict. |
| P-14.04 | (14) Idée: Commande groupée | Order | Checkout | 06c §1 | Phase 2+ | Plus tard | Hors MVP strict. |
| P-14.05 | (14) Idée: Mode faible connexion | N/A | PWA | 04 §6 | 1 | MVP | Mode offline PWA. |
| P-14.06 | (14) Idée: Paiement livraison contrôlé | Payment | Checkout | 05a §1 | 1 | MVP | Cash on delivery. |
| P-14.07 | (14) Idée: Centre de confiance (badge) | Store | Fiche | 02 §2.1 | 1 | MVP | Vérification KYC. |
| P-14.08 | (14) Idée: Signalement problème | Issue | Fiche | 06c §1 | Phase 2+ | Plus tard | Modération. |
| P-14.09 | (14) Idée: Liste attente par zone | StockAlert | Carte | 06c §1 | Phase 2+ | Plus tard | Analyse admin. |
| P-14.10 | (14) Idée: Mode agent/revendeur assisté | Order | WhatsApp | 06c §1 | Phase 2+ | Plus tard | WhatsApp Bot. |
| P-15.01 | (15) Commande assistée (regroupe 4 puces : WhatsApp, téléphone, agent, partenaire) | Order | API | 06c §1 | Phase 2+ | Plus tard | Support client. |
| P-15.02 | (15) Mode faible connexion (regroupe 6 puces : peu images, compresser, pas vidéos, cache, reprise cmd, état hors-ligne) | N/A | UI | 04 §6 | 1 | MVP | Optimisation perfs. |
| P-15.03 | (15) Vérification stock : bouton simple | Inventory | Dashboard | 03 §1.2 | 1 | MVP | UX distributeur. |
| P-15.04 | (15) Score fraîcheur (regroupe 4 puces : récente, régulière, ancienne, à confirmer) | Inventory | Fiche | 03 §1.2 | 1 | MVP | Confiance donnée. |
| P-15.05 | (15) Réservation temporaire (30 min) | Order | Checkout | 03 §2 | 1 | MVP | Gestion conflits stock. |
| P-15.06 | (15) Signalement (regroupe 6 puces : absent, fermé, mauvais tel, mauvais lieu, prix diff, non reconnu) | Issue | Fiche | 06c §1 | Phase 2+ | Plus tard | Modération crowdsourcée. |
| P-15.07 | (15) Réseau assisté (regroupe 7 puces : demande Q, ruptures, temps rép, sans result, besoin, livr, produits) | Admin | ControlCenter | 06c §1 | Phase 8 | Plus tard | BI avancée. |
| P-16.01 | (16) Roadmap complète (regroupe 10 phases) | N/A | N/A | 06c §1 | 1 | MVP | Structuration du projet. |
| P-17.01 | (17) Livrables avant codage (regroupe 24 puces : audit, inventaire, archi, cible, migration, sitemap, parcours C, parcours D, parcours A, rôles, modèle, API, frontend, paiement, carte, IA, notifs, sécurité, tests, roadmap, MVP, estimations, reprise, sauvegarde) | N/A | N/A | 00 R1 | 1 | MVP | Déjà produits dans docs/. |
| P-18.01 | (18) Audit Constaté (regroupe 8 puces : pages, textes, images, formulaires, liens, fonctionnalités, technologies, performances) | N/A | N/A | 01 §1 | 1 | MVP | Fait dans Phase 0. |
| P-18.02 | (18) Audit Recommandé (regroupe 8 puces : recherche, carte, stock, commandes, paiement, IA, espace distr, back-office) | N/A | N/A | 01 §1 | 1 | MVP | Fait dans Phase 0. |
| P-18.03 | (18) Audit À Confirmer (regroupe 10 puces : prix, horaires, livraison, données off, identité, règles, paiement, légal, confid, retours) | N/A | N/A | 01 §1 | 1 | MVP | Liste fournie au client. |
| P-18.04 | (18) 4 promesses finales (regroupe 4 puces : trouver, vérifier, commander, piloter) | N/A | Accueil | 03 §1 | 1 | MVP | Axe stratégique. |
