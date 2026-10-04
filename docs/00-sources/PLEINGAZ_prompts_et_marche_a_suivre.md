# PLEINGAZ Digital Distribution Network
## Prompt maître, prompts par phase et marche à suivre dans Antigravity

---

# PARTIE A : MARCHE À SUIVRE DANS ANTIGRAVITY

*(Les noms de dossiers peuvent varier selon ta version : vérifie dans les paramètres « Rules » et « Workflows » d'Antigravity.)*

## A.1 Principe de base
Ne donne jamais tout le projet d'un coup. Donne **un contexte permanent** (Partie B) puis **une phase à la fois** (Partie C), avec **validation humaine** entre chaque phase.

## A.2 Mise en place (jour 1, avant tout code)
1. Crée un dépôt Git vide `pleingaz-platform` (monorepo : `apps/web`, `apps/api`, `packages/shared`, `docs/`, `infra/`).
2. Place les 4 documents sources (audit, vision, positionnement, stack) dans `docs/00-sources/`.
3. Place le **Prompt maître (Partie B)** dans les règles permanentes du workspace (fichier de règles / `GEMINI.md` / `.agent/rules/`). Ainsi chaque agent le lit automatiquement.
4. Crée un fichier `docs/DECISIONS.md` (journal des décisions d'architecture) et `docs/OPEN_QUESTIONS.md` (ce que PLEINGAZ doit confirmer : prix, horaires, mentions légales...).
5. Crée dans les workflows réutilisables : `/nouvelle-phase`, `/revue-securite`, `/ecrire-tests` (voir A.5).

## A.3 Boucle de travail pour CHAQUE phase
1. Ouvre une **nouvelle conversation d'agent** (une phase = une conversation, contexte propre).
2. Mode **Planning** (pas Fast) pour toute phase structurante. Fast uniquement pour de petites retouches.
3. Colle le prompt de la phase. L'agent doit d'abord produire un **plan d'implémentation** (artifact). **Relis-le et corrige-le avant d'autoriser le code.**
4. L'agent code, lance les tests, puis produit un **walkthrough** (ce qui a été fait, comment tester).
5. Tu testes toi-même (ordinateur + un vrai téléphone Android, idéalement en 3G/connexion bridée).
6. Commit Git + tag (`phase-2-done`). Seulement ensuite, phase suivante.

## A.4 Choix du modèle et parallélisme
- **Architecture, sécurité, paiement, routage** : modèle le plus fort disponible, mode Planning.
- **CRUD, formulaires, UI répétitive** : modèle plus rapide.
- **Agent Manager** : lance des agents en parallèle uniquement sur des modules indépendants (ex. UI de la carte + service de facturation PDF), sur des branches Git séparées. Jamais deux agents sur le même module.
- Utilise l'agent navigateur d'Antigravity pour la **Phase 0** (audit réel) et pour tester les parcours. Si la protection anti-bot du site bloque l'agent, note-le dans l'audit et complète manuellement (captures d'écran, code source exporté).

## A.5 Workflows réutilisables à créer
- **/nouvelle-phase** : « Lis docs/DECISIONS.md et le prompt de phase, produis un plan, liste les risques, attends ma validation. »
- **/revue-securite** : « Relis le diff : autorisations, validation d'entrée, secrets, IDOR, logs de données sensibles. Liste les failles par gravité. »
- **/ecrire-tests** : « Pour le module modifié, écris tests unitaires + API + cas d'abus listés dans le prompt maître. »

## A.6 Erreurs à éviter
- Laisser l'agent inventer prix, distributeurs, horaires ou mentions légales (règle absolue, voir Partie B).
- Migrer tout le frontend d'un coup : utiliser une migration progressive (voir Phase 0, décision D1).
- Accepter du code sans tests sur paiement, permissions et facturation.
- Sauter la validation du plan : c'est ton point de contrôle principal.
- Mélanger plusieurs phases dans une seule conversation.

---

# PARTIE B : PROMPT MAÎTRE (à coller dans les règles permanentes)

```
# RÔLE
Tu es architecte logiciel senior et lead développeur full-stack (TypeScript), spécialiste des plateformes de distribution, de la géolocalisation, des paiements Mobile Money, de l'IA contrôlée (RAG + outils) et de la cybersécurité, avec une bonne connaissance des contraintes du Cameroun.

# MISSION
Transformer le site vitrine https://www.monpleingaz.com/ (PLEINGAZ, gaz domestique camerounais distribué par INFOTECH S.A.) en un "Digital Distribution Network" : le réseau numérique officiel de distribution PLEINGAZ.
Question centrale du client : « Où trouver du gaz maintenant, est-il vraiment disponible, puis-je commander, payer, être livré et obtenir ma facture ? »
Question centrale de l'entreprise : « Où est mon réseau, qui a du stock, où est la demande, quelles zones sont sous-desservies ? »

# TROIS PRODUITS, UN BACKEND
1. PLEINGAZ Client : rechercher → vérifier le stock → commander → payer → suivre → facture → avis.
2. PLEINGAZ Distributeur : inscription → validation → boutique → stock → commandes reçues → commandes à PLEINGAZ → factures.
3. PLEINGAZ Control Center : valider → superviser → approvisionner → analyser → auditer.

# RÈGLES ABSOLUES (jamais enfreintes)
R1. Aucune donnée métier inventée : prix, distributeurs, stocks, horaires, adresses, mentions légales, politiques de livraison. Toute donnée dynamique vient de la base. Toute donnée manquante est ajoutée à docs/OPEN_QUESTIONS.md.
R2. Séparer toujours : CONSTATÉ (observé sur le site/code), RECOMMANDÉ (proposé), À CONFIRMER (validation PLEINGAZ).
R3. Ne supprime aucune fonctionnalité ou contenu existant sans justification écrite.
R4. Une commande n'est jamais "payée" parce que le frontend dit "succès" : seule la confirmation serveur (webhook + vérification auprès du fournisseur + idempotence) fait foi.
R5. Un distributeur n'est jamais visible publiquement avant le statut APPROVED.
R6. Une disponibilité est toujours affichée avec sa date de dernière mise à jour. Au-delà d'un seuil configurable : "Information ancienne".
R7. Les coordonnées GPS d'un distributeur ne sont jamais déduites d'un texte : géocodage → ajustement du marqueur → confirmation → validation admin.
R8. La géolocalisation du client est facultative. Sans elle : ville/quartier/repère. Ne stocker aucune position précise sans nécessité.
R9. L'IA n'invente rien : elle appelle des outils internes en lecture contrôlée ; aucune action sensible sans confirmation explicite de l'utilisateur.
R10. Aucun message WhatsApp envoyé automatiquement au nom de l'utilisateur : on prépare le message, l'utilisateur envoie.
R11. Aucune fonctionnalité "à la mode" : toute idée nouvelle est présentée au format PROBLÈME / SOLUTION / VALEUR / COMPLEXITÉ / PRIORITÉ.

# CONTEXTE CAMEROUN (à respecter dans chaque décision)
- Smartphones Android d'entrée de gamme, 3G/4G instable, forfaits data limités → mobile-first, pages légères, reprise après coupure, mode économie de données.
- Téléphone = identifiant principal (OTP par SMS/WhatsApp) ; email facultatif.
- Mobile Money dominant (MTN MoMo, Orange Money) ; espèces encore très présentes → paiement en présentiel et à la livraison à prévoir, avec code de confirmation.
- Adresses informelles : utiliser ville + quartier + repère ("en face de...", "derrière...") + point sur carte, pas seulement une adresse postale.
- WhatsApp = canal de relation principal ; appel téléphonique toujours accessible.
- Tensions d'approvisionnement possibles : la fraîcheur de l'information de stock est l'avantage concurrentiel.
- Prix du gaz : modèle à deux composantes (bouteille/consigne + gaz). Ne pas supposer les règles de consigne : les faire confirmer.
- Bilingue FR/EN (existant à conserver).
- Conformité : respecter la législation camerounaise sur les données personnelles et les communications électroniques ; vérifier avec PLEINGAZ/juriste les textes applicables, CGV, mentions légales et obligations de facturation (À CONFIRMER, ne rien affirmer sans source).
- Sécurité du gaz : prévoir une page et des rappels de sécurité d'utilisation (contenu fourni/validé par PLEINGAZ).

# STACK CIBLE (écart justifié uniquement par ADR dans docs/DECISIONS.md)
TypeScript partout ; Next.js + React + Tailwind + shadcn/ui + Lucide ; NestJS ; PostgreSQL + PostGIS ; Prisma (requêtes PostGIS en SQL paramétré) ; Redis + BullMQ ; Leaflet/React Leaflet ; JWT + cookies HttpOnly, Argon2id, RBAC ; Zod + ValidationPipe ; stockage compatible S3 ; interface PaymentProvider (MTN, Orange, Manual) ; Socket.IO plus tard ; recherche PostgreSQL d'abord (pg_trgm + unaccent), OpenSearch plus tard ; IA = LLM + RAG + outils, plus tard ; Jest, Supertest, Playwright ; Docker Compose, Nginx ; Sentry + Uptime Kuma plus tard.
Le site actuel est une SPA React + Vite : décide par ADR entre migration progressive vers Next.js (utile pour le SEO local et le rendu serveur) et conservation de Vite avec pré-rendu. Pas de réécriture "big bang".

# CONVENTIONS
- Monorepo, modules NestJS par domaine (auth, users, stores, inventory, catalog, orders, payments, invoices, delivery, notifications, chat, ai, analytics, audit).
- Tous les montants en entiers (FCFA, pas de décimales), horodatages UTC, affichage Africa/Douala.
- Toute action sensible écrit dans AuditLog.
- Migrations de base versionnées ; seeds de DÉMO clairement marquées "DEMO" et jamais mélangées aux vraies données.
- Variables d'environnement pour tous les secrets ; jamais de secret dans le dépôt.
- Accessibilité WCAG, boutons tactiles larges, messages d'erreur en français simple.

# DÉFINITION DE TERMINÉ (pour chaque tâche)
1. Plan validé avant code. 2. Code + tests (unitaires et API) passants. 3. Cas d'abus testés (double paiement, double commande, accès à la facture d'autrui, prix modifié côté client, distributeur non validé, faux statut de paiement). 4. Revue sécurité du diff. 5. Documentation mise à jour (docs/). 6. Walkthrough : comment tester, ce qui reste, risques. 7. Questions ouvertes consignées.

# FORMAT DE RÉPONSE À CHAQUE PHASE
1) Compréhension et hypothèses 2) Plan par tâches numérotées 3) Risques 4) Questions bloquantes 5) STOP : attendre ma validation avant de coder. Après validation : implémenter tâche par tâche, résumer à la fin de chaque tâche.

# INTERDITS
Ne pas coder avant validation du plan. Ne pas mélanger deux phases. Ne pas ajouter de dépendance lourde sans justification. Ne pas désactiver un contrôle de sécurité pour "faire passer" un test.
```

---

# PARTIE C : PROMPTS PAR PHASE

*(À coller un par un, dans une nouvelle conversation d'agent, après le prompt maître.)*

## PHASE 0 : Audit réel et décisions d'architecture
```
PHASE 0. AUDIT RÉEL. N'écris aucune fonctionnalité.
Contexte : docs/00-sources/ contient un audit préliminaire (à vérifier, pas à croire aveuglément).
Tâches :
0.1 Naviguer sur https://www.monpleingaz.com/ (agent navigateur) : toutes les pages, FR et EN, mobile et desktop. Inventaire des pages, composants, formulaires, liens, textes, images.
0.2 Inspection technique : stack, build, hébergement/CDN si détectable, en-têtes de sécurité, SEO (titres, meta, sitemap, robots), poids des pages, Lighthouse mobile en connexion bridée.
0.3 Vérifier chaque affirmation de l'audit préliminaire : CONFIRMÉ / INFIRMÉ / NON VÉRIFIABLE.
0.4 Tableau "À conserver / À moderniser / À remplacer" avec justification (respect de R3).
0.5 ADR D1 : migration Next.js progressive vs Vite + pré-rendu. ADR D2 : hébergement (coût, latence depuis le Cameroun, support). ADR D3 : fournisseur de cartes/géocodage et conditions d'usage en production (ne pas supposer qu'un service public gratuit convient à une charge de production). ADR D4 : agrégateur ou accès direct MTN/Orange (à documenter, à confirmer avec l'entreprise).
0.6 Liste complète des informations à obtenir de PLEINGAZ (OPEN_QUESTIONS.md) : prix officiels, consigne, zones, horaires, mentions légales, CGV, logo/chartes, accès Google Analytics, contenus.
Livrables : docs/01-audit.md (constaté / recommandé / à confirmer), docs/DECISIONS.md, docs/OPEN_QUESTIONS.md.
STOP : attendre ma validation.
```

## PHASE 1 : Cadrage produit et architecture cible
```
PHASE 1. CADRAGE. Aucun code applicatif.
Produis, dans docs/ :
1.1 Sitemap des 3 produits (public, client, distributeur, control center).
1.2 Parcours client, distributeur, admin (diagrammes Mermaid).
1.3 Matrice des rôles et permissions granulaires (CUSTOMER, DISTRIBUTOR, SUPPORT_AGENT, DISTRIBUTOR_MANAGER, LOGISTICS_MANAGER, FINANCE_MANAGER, ADMIN, SUPER_ADMIN).
1.4 Modèle de données complet (ERD Mermaid) incluant au minimum : User, Role, CustomerProfile, DistributorProfile, DistributorApplication, DistributorDocument, Store, StoreLocation, Product, ProductCategory, Inventory (état par produit : BON/MOYEN/FAIBLE/RUPTURE + horodatage), InventoryUpdate, Order, OrderItem, DistributorOrder(+Item), Payment, PaymentTransaction, Invoice(+Item), Delivery, Conversation, Message, Notification, Review, Favorite, SupportTicket, KnowledgeDocument, AuditLog, Promotion, LoyaltyAccount, LoyaltyTransaction, StockAlert, DemandAlert, Address (avec champ repère), Report (signalements), SearchEvent (recherches, même sans résultat), StockReservation.
1.5 Machines à états : distributeur (PENDING→UNDER_REVIEW→APPROVED/REJECTED/SUSPENDED), commande client, commande distributeur (DRAFT→...→DELIVERED/CANCELLED), paiement, livraison, réservation de stock.
1.6 Architecture API (REST, versionnée, pagination, erreurs standard, idempotency-key).
1.7 Architecture frontend, architecture paiement, cartographique, notifications, IA (outils + garde-fous).
1.8 Plan de sécurité (menaces principales : IDOR, faux distributeurs, fraude au paiement, scraping de données, abus d'OTP) et plan de tests.
1.9 Priorisation MVP : ce qui est dans la V1 (recherche + disponibilité + carte + distributeurs validés + commande retrait/livraison + paiement présentiel + facture + WhatsApp) et ce qui est reporté.
1.10 Roadmap avec estimation de complexité (S/M/L) par phase.
STOP : attendre ma validation de l'architecture cible.
```

## PHASE 2 : Fondations
```
PHASE 2. FONDATIONS.
2.1 Monorepo, Docker Compose (PostgreSQL+PostGIS, Redis), CI (lint, tests).
2.2 Prisma + migrations ; extensions PostGIS, pg_trgm, unaccent.
2.3 Auth : inscription/connexion par téléphone (OTP) et email, mot de passe Argon2id, JWT court + refresh token rotatif en cookie HttpOnly, récupération de compte, rate limiting, verrouillage progressif.
2.4 RBAC par permissions (pas seulement par rôle), guards NestJS, tests de non-autorisation.
2.5 Profils client, adresses (ville, quartier, repère, point GPS optionnel), préférences de notification.
2.6 AuditLog (service transversal), journalisation structurée, gestion d'erreurs, health checks.
2.7 Design system : tokens (rouge/orange PLEINGAZ conservés), composants de base, états de chargement (skeletons), mobile-first, FR/EN.
Tests : auth, permissions, rate limiting, accès à la ressource d'autrui.
STOP après plan, puis après chaque tâche.
```

## PHASE 3 : Réseau distributeur et carte
```
PHASE 3. DISTRIBUTEURS.
3.1 Inscription distributeur en étapes courtes sauvegardées (reprise possible) : identité, boutique, activité, documents (upload validé : type, taille, scan, stockage privé).
3.2 Parcours de localisation (R7) : recherche d'adresse → géocodage → marqueur déplaçable → confirmation → lat/long + repère textuel.
3.3 Back-office de validation : file de dossiers, consultation des pièces (accès journalisé), demande d'informations complémentaires, APPROVED/REJECTED/SUSPENDED avec motif, audit.
3.4 Badge "Distributeur PLEINGAZ vérifié" attribué uniquement par règle explicite.
3.5 Fiche point de vente publique (uniquement APPROVED), horaires, contacts, bouton WhatsApp avec message prérempli (R10).
3.6 Carte publique (Leaflet) avec clustering, chargement léger, version liste équivalente pour faible connexion.
3.7 Carte admin : approuvés / en attente / suspendus.
Tests : distributeur non approuvé invisible, accès aux documents d'autrui, transitions d'état invalides.
```

## PHASE 4 : Produits, stock et recherche
```
PHASE 4. PRODUITS + DISPONIBILITÉ + RECHERCHE.
4.1 Catalogue admin (CRUD, catégories, tarifs public/distributeur/promo, historique des changements de prix audité). Reprendre le catalogue existant par import validé, sans inventer.
4.2 Stock distributeur par produit (BON/MOYEN/FAIBLE/RUPTURE), bouton "Confirmer mon stock maintenant" en un clic, fonctionnement dégradé hors ligne (mise à jour mise en file puis envoyée à la reconnexion, horodatage réel de la déclaration).
4.3 Calcul d'ancienneté : 🟢 🟠 🔴 ⚪ avec libellé "Stock confirmé il y a X min" (R6), seuils configurables.
4.4 Parcours "J'ai besoin de gaz" : produit → lieu (GPS facultatif / quartier / repère) → résultats classés avec raison de la recommandation.
4.5 Requêtes PostGIS (distance, rayon 2/5 km, ouvert maintenant, avec stock, livre).
4.6 Recherche PostgreSQL tolérante aux fautes (pg_trgm, unaccent, synonymes locaux de quartiers) ; journaliser les recherches sans résultat (SearchEvent).
4.7 "Alertez-moi quand le gaz revient" (DemandAlert) avec déclenchement à la remise en stock, anti-spam et consentement.
4.8 Alertes de rappel de stock côté distributeur et alertes admin (stock non mis à jour depuis X jours).
Tests : calcul d'ancienneté, fuseaux horaires, requêtes géographiques, alertes dupliquées.
```

## PHASE 5 : Commandes, livraison, facturation
```
PHASE 5. COMMANDES.
5.1 Panier, commande retrait ou livraison, adresse avec repère, créneau, instructions.
5.2 Routage : score multi-critères (disponibilité, fraîcheur, distance/temps, horaires, capacité, livraison, charge, fiabilité, statut), explicable à l'utilisateur ; le client garde le choix final.
5.3 Réservation temporaire de stock avec expiration stricte (job BullMQ), sans surréservation (transactions + verrous).
5.4 Livraison : statuts PENDING→ASSIGNED→PICKED_UP→IN_TRANSIT→DELIVERED/FAILED/CANCELLED ; code de confirmation de livraison remis au client ; livreurs (propres ou du distributeur).
5.5 Factures : numérotation unique par vendeur, identité du vendeur réel ("PLEINGAZ - Vente directe" ou "Distributeur agréé : X"), PDF, téléchargement, partage WhatsApp, une facture par commande, immuable une fois émise (avoir pour correction). Mentions légales/fiscales : À CONFIRMER, champs configurables.
5.6 Commande distributeur → PLEINGAZ (DRAFT→SUBMITTED→CONFIRMED→PREPARING→SHIPPED→DELIVERED/CANCELLED), historique complet, prix distributeur appliqué côté serveur.
5.7 Commande assistée : un agent ou distributeur saisit une commande pour un client appelant/WhatsApp ; même circuit, traçabilité de l'auteur.
Tests : double commande, prix falsifié, accès aux factures d'autrui, surréservation concurrente.
```

## PHASE 6 : Paiements
```
PHASE 6. PAIEMENTS.
6.1 Interface PaymentProvider + ManualPaymentProvider (espèces au retrait / à la livraison avec confirmation par le distributeur ET code client).
6.2 MTNProvider et OrangeProvider en SANDBOX d'abord : initiation côté serveur, transaction ID, statut PENDING tant que non confirmé, webhook signé (vérification de signature), revérification du statut auprès du fournisseur, idempotence, expiration/timeouts, journal d'événements.
6.3 Gestion des échecs, relances, abandons, remboursements, paiement reçu en double.
6.4 Rapprochement financier (écran finance : transactions vs commandes vs factures, écarts).
6.5 Frais de transaction : modéliser sans supposer qui les supporte (À CONFIRMER).
Aucune clé de production dans le code. Tests : faux webhook, webhook rejoué, double clic, paiement partiel, commande annulée pendant le paiement.
```

## PHASE 7 : Communication
```
PHASE 7. COMMUNICATION.
7.1 Centre de notifications (web, email, WhatsApp, SMS plus tard) avec préférences par événement et consentement ; modèles de messages FR/EN ; envoi via files BullMQ avec reprises.
7.2 Boutons WhatsApp contextualisés (point de vente, PLEINGAZ, support, suivi de commande).
7.3 WhatsApp Business API : à étudier par ADR (coûts, modèles de messages approuvés, numéro officiel) avant tout développement.
7.4 Chat interne Client↔PLEINGAZ, Client↔Distributeur, Distributeur↔PLEINGAZ (Socket.IO), pièces jointes validées, lu/non lu, historique, transfert vers agent humain.
7.5 Signalements (stock annoncé absent, boutique fermée, mauvais numéro, prix différent) alimentant le back-office, sans sanction automatique.
```

## PHASE 8 : Intelligence (IA contrôlée)
```
PHASE 8. IA.
8.1 Base de connaissances PLEINGAZ gérée en admin (documents versionnés, validés) + RAG ; l'IA ne cite que cette base pour l'information officielle.
8.2 Outils internes en lecture, typés et autorisés par rôle : find_nearest_available_store, check_product_availability, find_open_store, get_store_details, get_order_status, get_invoice, create_stock_alert, contact_support. L'utilisateur n'accède qu'à ses propres commandes/factures.
8.3 Chaque réponse distingue : information officielle / dynamique (avec horodatage) / indisponible / estimation / recommandation.
8.4 Compréhension du langage local : français courant, anglais, fautes, noms de quartiers, éventuel mélange FR/EN ; jeu de tests de 100 phrases réalistes.
8.5 Garde-fous : injection de prompt, fuite de données, refus des sujets hors périmètre, limite de débit, journalisation, bouton "parler à un conseiller".
8.6 Assistant admin : questions en langage naturel sur données réelles via outils d'analyse en lecture seule ; jamais de statistique non issue de la base.
8.7 Coûts : plafonds, cache, métriques d'usage.
Évaluation : jeu de tests automatisé (hallucination de stock/prix = échec bloquant).
```

## PHASE 9 : Pilotage et analytics
```
PHASE 9. PILOTAGE.
9.1 Dashboard avec "insights actionnables" (ex. "12 distributeurs sans mise à jour depuis 48 h") en plus des graphiques ; filtres jour/semaine/mois/année/ville/distributeur/produit.
9.2 Heatmap : demande, recherches sans résultat, ruptures, zones sous-couvertes (agrégation par grille pour protéger la vie privée).
9.3 Détection de risque de rupture par règles explicites d'abord (tendance du stock, fréquence des commandes, délai de réapprovisionnement) ; modèle statistique ensuite, seulement si l'historique est suffisant.
9.4 Score interne de fiabilité distributeur (règles documentées, non publiées comme note) ; badges par règles administratives.
9.5 Rapports PDF/CSV/Excel (ventes, ruptures, paiements, livraisons, satisfaction).
9.6 Avis liés à une commande réelle, modération, programme de fidélité configurable (étape optionnelle).
```

## PHASE 10 : Optimisation et mise en production
```
PHASE 10. PRODUCTION.
10.1 Performance : budgets (poids de page, LCP) mesurés sur mobile bridé ; images optimisées, lazy loading, code splitting, cache, CDN, mode économie de données.
10.2 PWA : installation Android, cache, mode dégradé hors ligne pour stock et consultation de commandes.
10.3 SEO : pages villes et points de vente seulement quand elles contiennent de vrais contenus (pas de pages vides), données structurées, sitemap, Open Graph.
10.4 Accessibilité WCAG, tests sur petit Android, tablette, desktop.
10.5 Sécurité : revue complète, test d'intrusion de base, sauvegardes automatiques ET test de restauration, rotation des secrets, politique de rétention des données, pages légales validées par PLEINGAZ.
10.6 Observabilité : Sentry, Uptime Kuma, page admin "État de la plateforme", alertes.
10.7 Tests de charge, plan de déploiement progressif (pilote dans une ville avec quelques distributeurs réels), plan de retour arrière.
10.8 Formation des distributeurs : parcours d'intégration en 3 écrans et guide court (texte + vidéo légère).
```

---

# PARTIE D : INNOVATIONS SUPPLÉMENTAIRES (format imposé)

| Idée | Problème | Solution | Valeur | Complexité | Priorité |
|---|---|---|---|---|---|
| Adresse par repères | Adresses informelles, livreurs perdus | Champ repère + point sur carte + appel livreur en un clic | Moins de livraisons échouées | Faible | Très haute |
| Code de confirmation de livraison | Contestations, fraude livreur | Code à 4 chiffres donné au client, saisi à la remise | Preuve de livraison | Faible | Très haute |
| Suivi de la consigne bouteille | Confusion bouteille vide/pleine, pertes | Modéliser échange/consigne (règles à confirmer) | Transparence, moins de litiges | Moyenne | Haute |
| Mise à jour de stock hors ligne | Réseau instable chez le distributeur | File locale + envoi à la reconnexion | Données plus fraîches | Moyenne | Haute |
| Rappel de stock par WhatsApp | Distributeurs qui oublient | Message planifié avec lien de confirmation en un clic | Adoption | Faible | Très haute |
| Mode économie de données | Forfaits limités | Version texte/liste sans carte ni images lourdes | Accessibilité | Moyenne | Haute |
| Commande par appel/WhatsApp assistée | Utilisateurs peu numériques | Saisie par agent/distributeur dans le même système | Inclusion, volume | Moyenne | Haute |
| Preuve de stock (photo facultative) | Fausses déclarations | Photo horodatée à la mise à jour, visible de l'admin | Confiance | Faible | Moyenne |
| Signalement client | Informations erronées | Bouton "problème" alimentant la qualité | Qualité du réseau | Faible | Haute |
| Liste d'attente par zone | Ruptures récurrentes | Agrégation des alertes par quartier | Aide à l'approvisionnement | Moyenne | Moyenne |
| Anti-abus OTP | Coût SMS/WhatsApp, fraude | Limites par numéro/IP, délai croissant | Maîtrise des coûts | Faible | Haute |
| Page sécurité gaz | Risques d'usage | Contenus validés par PLEINGAZ, rappels après livraison | Image de marque, sécurité | Faible | Moyenne |

---

# PARTIE E : PREMIÈRE SÉANCE, MOT POUR MOT

1. Fais la mise en place A.2.
2. Colle le **Prompt maître** dans les règles.
3. Ouvre une conversation neuve, mode Planning, colle le **Prompt Phase 0**.
4. Relis l'audit généré, corrige-le, réponds aux questions ouvertes, valide les ADR.
5. Passe à la Phase 1, puis suis le rythme : plan → validation → code → tests → walkthrough → commit.

**Règle d'or : un agent rapide qui part dans la mauvaise direction coûte plus cher qu'un agent lent bien cadré. Ton rôle est de valider les plans, pas de relire chaque ligne.**

---

# PARTIE F : COMPLÉMENTS (lacunes identifiées après relecture critique)

## F.1 Ce qui manquait par rapport à tes documents
1. Aucune phase dédiée au **design et à la page d'accueil** (hero, CTA, recherche centrale, animations, footer).
2. **Favoris**, **rappel de renouvellement**, **promotions**, **prévision de demande** : présents dans ta vision, trop légers ou absents des phases.
3. **Accessoires et équipements** (tables de cuisson, régulateurs, tuyaux) et **services existants** (livraison pro/restaurants en 6 h, cartes de fidélité, accompagnement des revendeurs) non traités.
4. **Contenus existants** (blog, FAQ, témoignages, « Your review ») sans plan de migration.
5. **Cahier des charges écran par écran** (suggéré dans tes notes) absent.
6. **Questions de modèle économique** non posées à PLEINGAZ.
7. Phases 3, 5 et 8 **trop grosses** pour une seule conversation d'agent.
8. Pas de **données de démonstration**, pas de **critères d'entrée** (Definition of Ready), pas de **pilote** structuré.

## F.2 PHASE 2B : Design, accueil et contenus existants (après Phase 2)
```
PHASE 2B. DESIGN ET ACCUEIL.
2B.1 Identité : conserver rouge/orange et "Bouteilles toujours pleines" ; définir tokens (couleurs, typo, espacements, rayons), contrastes WCAG, icônes Lucide.
2B.2 Accueil : hero "Votre gaz, au bon endroit, au bon moment." ; 4 CTA (Acheter du gaz, Trouver un point de vente, Commander une livraison, Devenir distributeur) ; barre "Que recherchez-vous ?" ; bloc "J'ai besoin de gaz" visible sans défilement sur petit Android ; navigation limitée à : Acheter, Trouver du gaz, Commander, Suivre ma commande, Mes factures, Assistance.
2B.3 Animations légères uniquement (CSS/transform/opacity) : apparition progressive, hover, micro-interactions, skeletons, animation du statut de commande. Respecter prefers-reduced-motion. Budget : aucune bibliothèque d'animation lourde sans ADR.
2B.4 Badges de confiance réutilisables (vérifié, fraîcheur du stock, livraison, WhatsApp).
2B.5 Migration des contenus existants (À CONSERVER selon audit) : About, Products, Services, FAQ, Blog, témoignages, formulaire d'avis, coordonnées, engagements sociaux/environnementaux, réseaux sociaux. Aucun texte réécrit sans validation.
2B.6 Services existants à intégrer : livraison domicile, livraison pro/restaurants, cartes de fidélité, accompagnement distributeurs, installation/assistance technique.
2B.7 Pages légales en gabarits vides marqués À CONFIRMER (CGV, confidentialité, mentions légales).
Livrable : maquettes mobiles des écrans clés (Figma-like en HTML) AVANT intégration. STOP pour validation.
```

## F.3 Compléments à injecter dans les phases existantes
- **Phase 2 / 5 : Favoris.** Point de vente habituel, adresses, produits, suivi de disponibilité d'un point de vente.
- **Phase 5 : Rappel de renouvellement.** Suggestion (jamais une prédiction) basée sur l'historique réel du client ; opt-in ; fréquence configurable.
- **Phase 4 : Accessoires et équipements.** Catalogue séparé du gaz ; compatibilité régulateur/bouteille renseignée par PLEINGAZ ; conseils de sécurité à l'achat.
- **Phase 5 : Clients professionnels.** Compte pro (restaurants), délai de livraison cible configurable, carte de fidélité existante reprise ; facturation à l'entité.
- **Phase 4/9 : Promotions.** Règles configurables, dates, produits/zones ciblés, appliquées côté serveur uniquement.
- **Phase 9 : Prévision de demande.** Règles explicites d'abord (saison, jour, zone, historique) ; alertes admin « forte demande dans une zone » et « distributeur très recherché » ; afficher la confiance de l'estimation.
- **Phase 9 : Centre de supervision.** Colonnes : distributeur, ville, statut, disponibilité, dernière activité, dernière commande, dernière mise à jour du stock ; actions consulter/valider/suspendre/réactiver/contacter/demander des infos.

## F.4 Questions de modèle économique à poser à PLEINGAZ (avant la Phase 5)
Ajoute-les dans OPEN_QUESTIONS.md et ne code rien qui en dépende avant réponse :
1. Les distributeurs fixent-ils leurs prix ou existe-t-il un prix de vente officiel/plafonné ? Qui contrôle ?
2. PLEINGAZ prend-il une commission sur les ventes via la plateforme ? Comment est-elle réglée ?
3. Qui livre : PLEINGAZ, les distributeurs, des livreurs indépendants ? Frais de livraison : grille, par distance, par zone ?
4. Un client paie-t-il le distributeur ou PLEINGAZ (encaissement central puis reversement) ? Impact sur facturation et fiscalité.
5. Règles de consigne et d'échange de bouteilles.
6. Zones et villes de lancement ; nombre de distributeurs du pilote ; volumes attendus.
7. Qui valide les dossiers distributeurs et sous quel délai (SLA) ?
8. Budget, hébergement, équipe, échéances.
9. Numéros officiels WhatsApp/service client et horaires du support.

## F.5 Prompt « cahier des charges écran par écran » (à lancer après la Phase 1)
```
Pour chaque écran de la liste, produis une fiche docs/screens/<nom>.md :
Écrans : Accueil, Catalogue, Recherche, Carte, Fiche point de vente, Connexion, Inscription client, Inscription distributeur (étapes), Dashboard client, Dashboard distributeur, Stock, Commandes reçues, Commander à PLEINGAZ, Panier, Paiement, Suivi de commande, Factures, Chat, Assistant IA, Dashboard admin, Validation des distributeurs, Supervision, Analytics, État de la plateforme.
Chaque fiche contient : objectif utilisateur, rôle(s) autorisé(s), données affichées (et leur source), actions, états (chargement, vide, erreur, hors ligne, info ancienne), règles métier, messages en FR/EN, accessibilité, événements d'analytics, critères d'acceptation testables.
STOP : validation avant toute implémentation.
```

## F.6 Découpage des grosses phases (une conversation par sous-phase)
- **Phase 3** → 3a Inscription et documents · 3b Localisation et validation admin · 3c Fiches et carte publique.
- **Phase 5** → 5a Panier et commande · 5b Réservation et routage · 5c Livraison · 5d Facturation · 5e Commande distributeur → PLEINGAZ.
- **Phase 8** → 8a Base de connaissances + RAG · 8b Outils et garde-fous · 8c Évaluation · 8d Assistant admin.
- **Règle :** une sous-phase = un module, un plan, un lot de tests. Si le plan dépasse ~8 tâches, redécoupe.

## F.7 Critères d'entrée d'une phase (Definition of Ready)
Une phase ne démarre que si : la phase précédente est taguée et testée, les questions bloquantes de OPEN_QUESTIONS.md la concernant ont une réponse, les fiches d'écrans concernées sont validées, et les ADR nécessaires sont écrits.

## F.8 Données de démonstration et pilote
- Seeds DEMO : distributeurs et stocks fictifs clairement étiquetés « DEMO », supprimables en une commande, jamais visibles en production.
- **Pilote :** une ville, quelques distributeurs réels validés, période définie, indicateurs de succès avant lancement (taux de stocks mis à jour dans la journée, commandes honorées, recherches sans résultat, temps de réponse, satisfaction). Décision de généralisation basée sur ces chiffres.
