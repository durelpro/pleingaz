# PLEINGAZ : messages de reprise (après restauration depuis GitHub)

Ordre : MESSAGE 1 (dans la réponse du chat : R0 à R2) puis les messages ci-dessous.
Chaque message commence par la même ligne de rappel :

> Lis GEMINI.md et docs/00-master-prompt.md et applique ces règles. Règles de cette reprise : après CHAQUE commit tu fais `git push` et tu vérifies `git status -sb` (aucun "ahead") ; tu n'écris jamais un fichier de la matrice en entier (modifications ciblées, sauvegarde préalable dans /tmp) ; tu colles des sorties RÉELLES, jamais de "[...]" ; tu ne modifies pas la matrice dans le seul but de faire taire le script.

Entre deux messages : l'utilisateur lance lui-même `bash scripts/check-trace.sh` et vérifie le résultat.

---

## TABLE DE RÉFÉRENCE : sujet -> phase (valable pour tous les messages)

| Sujet | Phase |
|---|---|
| Authentification, utilisateurs, rôles et permissions, profils, adresses, base, sécurité de base, journal d'audit | 2 |
| Design, accueil, contenus existants (About, Products, Services, FAQ, Blog, Contact), pages légales | 2B |
| Distributeurs : inscription, dossier, validation, boutique, localisation, carte, badge, horaires, contact, boutons click-to-chat | 3 |
| Catalogue, stock, disponibilité, recherche, alertes de retour en stock | 4 |
| Panier, commandes, livraison, réservation, routage, factures, commande distributeur, commande assistée | 5 |
| Paiements (présentiel confirmé par code, Mobile Money sandbox) | 6 |
| Chat, WhatsApp Business API, notifications, email | 7 |
| IA (chatbot, recherche sémantique, assistant géographique, assistant admin) | 8 |
| Tableau de bord, rapports, prévisions, heatmap, score de fiabilité | 9 |
| PWA, SEO, accessibilité, performance, monitoring, tests de charge | 10 |
| Principes, règles de conception et de développement | Transversal |

Statuts : MVP / Plus tard (avec phase cible et référence `06c H<nn>`). Jamais "écarté" sans décision du propriétaire.
Colonnes : `| ID | Exigence | Entité(s) | Écran(s) | Document(s) et section | Phase | Statut | Justification |`.
Une ligne MVP cite `06c M<nn>`. Regroupements : 6 puces au maximum, strictement équivalentes, nommées dans la colonne Exigence ("regroupe n puces : a, b, c").
Chaque lot : exécuter le script et coller la sortie réelle ; alerte = correction, pas camouflage.

---

## MESSAGE 2 : reconstruire la source V, sections 0 à 30

```
[Rappel de reprise ci-dessus]

TÂCHE : reconstruire dans docs/08-tracabilite.md les lignes V-00 à V-30 (le travail antérieur a été perdu en partie). Prérequis : R0 à R2 terminés, scripts/check-trace.sh en version v5, 06c avec ses identifiants M<nn> et H<nn>.

PRÉPARATION
1. Exécute le script et note l'état (section 17 : S, A, N, P doivent être au minimum S=32, A=45, N=24, P=120).
2. Lis docs/00-sources/02-vision-prompt.md en entier et la table de référence ci-dessus.

MÉTHODE : travaille en 3 lots, avec une exécution du script, un commit et un push entre chaque lot.
 Lot A : préambule V-00 (les 8 étapes de mission + la contrainte "pas un site totalement différent" + l'objectif final) et sections 1 à 10.
 Lot B : sections 11 à 20.
 Lot C : sections 21 à 30.

RÈGLE DE GRANULARITÉ : une ligne par exigence atomique : une puce, un champ, un statut, un état, un rôle, une entité, une étape, un outil, un exemple normatif, une règle explicite. Cibles minimales par section (puces + éléments simples) :
 00:10 | 1:19 | 2:17 | 3:29 | 4:10 | 5:22 | 6:15 | 7:27 | 8:22 | 9:18 | 10:14 | 11:12 | 12:9 | 13:16 | 14:8 | 15:9 | 16:15 | 17:21 | 18:7 | 19:16 | 20:21 | 21:10 | 22:9 | 23:21 | 24:18 | 25:13 | 26:14 | 27:8 | 28:5 | 29:6 | 30:5
La couverture se mesure en puces couvertes (les regroupements nominatifs comptent), pas en nombre de lignes.

ÉLÉMENTS À NE PAS OUBLIER (le script les vérifie) :
 - Section 9 : les 5 états PENDING, UNDER_REVIEW, APPROVED, REJECTED, SUSPENDED + le message "Votre demande est en cours de vérification par PLEINGAZ" + le badge "Distributeur PLEINGAZ vérifié" + les règles "jamais visible avant APPROVED" et "seuls les APPROVED apparaissent publiquement".
 - Section 10 : les 8 facteurs du score + les 4 badges (Distributeur vérifié, Partenaire actif, Stock régulièrement mis à jour, Livraison disponible) + 2 règles (score interne, jamais une note publique ; badges attribués par règles administratives explicites).
 - Section 11 : les 4 statuts (disponible, stock limité, indisponible, information non actualisée), OUI/NON, les 4 options de produit (6 kg, 12,5 kg, 50 kg, accessoires), l'exemple "Stock confirmé il y a 18 minutes", la règle "toujours afficher la date".
 - Section 13 : les 5 champs de la commande, le bouton "Valider la commande", les 7 états DRAFT, SUBMITTED, CONFIRMED, PREPARING, SHIPPED, DELIVERED, CANCELLED, les 3 exemples de quantités, l'historique complet.
 - Section 16 : MTN, Orange, présentiel, carte bancaire plus tard, les 5 principes (transaction ID, webhook, vérification serveur, idempotence, journal), les 4 éléments d'abstraction PaymentProvider / MTNProvider / OrangeProvider / ManualPaymentProvider, la règle "jamais payé parce que le frontend affiche succès".
 - Section 18 : les 4 boutons WhatsApp, le message prérempli, la règle "aucun envoi automatique". Click-to-chat = MVP phase 3 ; API Business = plus tard phase 7.
 - Section 20 : les 13 sujets, les 6 outils (find_nearest_store, check_product_availability, get_order_status, get_invoice, find_open_store, contact_support), la règle "ne pas inventer", l'architecture Knowledge Base + RAG + LLM + outils.
 - Section 26 : les 7 statuts de livraison, les 6 champs, "tracking GPS plus tard".

INTERDITS : pas de ligne de remplissage ou en double ; pas de libellé qui ne figure pas dans la source ; pas de "06c §1" passe-partout ; pas de rattachement à un document qui ne traite pas l'exigence (vérifie par grep avant de citer un document ; si rien ne la couvre : AUCUN, et une entrée dans TROUS avec le texte exact de la ligne).

APRÈS CHAQUE LOT : exécute `bash scripts/check-trace.sh` ; colle la sortie complète et réelle ; corrige toute alerte de ses contrôles 1, 3, 4, 6, 8, 9, 11, 12, 13, 14, 15 et 17 ; commit + push ; tag trace-V-lot-A / B / C.
À LA FIN : STOP. Résumé de 10 lignes avec : nombre de lignes V, couverture totale sur cible, nombre de AUCUN, M<nn> jamais cités, lignes en 06c seul par statut.
```

---

## MESSAGE 3 : source V, sections 31 à 59 (deux lots)

```
[Rappel de reprise ci-dessus]

TÂCHE : ajouter à docs/08-tracabilite.md les lignes V-31 à V-59 en deux lots (D : 31 à 45 ; E : 46 à 59). Même règles que le message précédent : exécute le script, colle la sortie réelle, commit + push, tag, puis STOP après chaque lot.

LOT D : SECTIONS 31 À 45 (cible atomique entre parenthèses)
 31 Réapprovisionnement (5) : système de rappel, exemple de message, action "Commander maintenant", période configurable, "suggestion et non prédiction certaine". Docs probables : 05b, 03 (Setting, Notification). Plus tard.
 32 Fidélité (10) : 4 sources de points (achats, régularité, recommandations, campagnes), 4 récompenses (réductions, livraison, accessoires, promotions), configurable depuis l'administration. Entités LoyaltyAccount, LoyaltyTransaction, Promotion. Plus tard.
 33 Avis (8) : 5 critères (satisfaction, qualité, livraison, disponibilité, expérience distributeur), lié à une commande réelle, modération. Entité Review.
 34 Sécurité (25) : les 16 mesures (HTTPS, hashage des mots de passe, JWT/session, refresh tokens, RBAC, validation serveur, rate limiting, CSRF, XSS, injection SQL/NoSQL, validation des uploads, antivirus/scan, journalisation, audit logs, sauvegardes, chiffrement des secrets) + les 8 rôles + permissions granulaires. Docs : 06a, 04, 02.
 35 Audit log (7) : les 5 exemples d'actions, "chaque action sensible", affichage dans le back-office. Docs : 03c, 06a.
 36 Performance (13) : les 10 optimisations (images, lazy loading, cache, API, requêtes BDD, pagination, code splitting, compression, CDN, cache serveur), objectif connexion moyenne, PWA, installation Android. Docs : 04, 06b. Phase 10.
 37 SEO (13) : 9 éléments, 3 URLs locales d'exemple, interdiction de pages vides. Note : robots.txt et sitemap.xml = correctif rapide indépendant (01).
 38 Accessibilité (7) : 6 éléments (contraste, clavier, labels, taille des boutons, messages d'erreur, lecteurs d'écran) + WCAG.
 39 Architecture technique (13) : inspecter l'existant, ne pas changer arbitrairement, conserver si viable, 9 couches recommandées (frontend, backend, base, cache, cartes, stockage, notifications, IA, paiements). Docs : 04 (section stack retenue), DECISIONS (D1 à D4 PROPOSÉS).
 40 Modèle de données (35) : UNE ligne par entité : User, Role, CustomerProfile, DistributorProfile, DistributorApplication, DistributorDocument, Store, StoreLocation, Product, ProductCategory, Inventory, InventoryUpdate, Order, OrderItem, DistributorOrder, DistributorOrderItem, Payment, PaymentTransaction, Invoice, InvoiceItem, Delivery, Conversation, Message, Notification, Review, Favorite, SupportTicket, KnowledgeDocument, AuditLog, Promotion, LoyaltyAccount, LoyaltyTransaction, StockAlert, DemandAlert, Address. Chaque ligne cite le domaine d'ERD de 03 et la section de 03c si l'entité est critique.
 41 RBAC (33) : 8 rôles + UNE ligne par permission listée de chaque rôle (CUSTOMER, DISTRIBUTOR, SUPPORT_AGENT, DISTRIBUTOR_MANAGER, FINANCE_MANAGER, LOGISTICS_MANAGER, ADMIN, SUPER_ADMIN). Docs : 02 (catalogue de permissions et matrice).
 42 Parcours client (14) : Accueil, Recherche, Produit/Point de vente, Disponibilité, Choix du distributeur, Retrait ou livraison, Panier, Adresse, Paiement, Confirmation, Suivi, Livraison, Facture, Avis. Docs : 02 (parcours Mermaid).
 43 Parcours distributeur (12) : Inscription, Dépôt du dossier, PENDING, Vérification, APPROVED, Boutique visible, Gestion stock, Réception commandes, Commandes à PLEINGAZ, Livraison/réapprovisionnement, Facturation, Suivi activité.
 44 Parcours administrateur (15) : Connexion sécurisée, Dashboard, Supervision, Distributeurs, Demandes de validation, Produits, Commandes, Stocks, Paiements, Factures, Livraisons, Support, IA, Rapports, Audit.
 45 Rapports (14) : 11 types (ventes, commandes, revenus, produits les plus demandés, villes, distributeurs, disponibilité, ruptures, paiements, livraisons, satisfaction) + 3 exports (PDF, CSV, Excel). Phase 9, plus tard (H).

LOT E : SECTIONS 46 À 59
 46 Dashboard intelligent (7) : principe "informations utiles, pas seulement des graphiques" + 6 exemples d'alertes.
 47 IA administrative (6) : 5 exemples de questions + règle "ne jamais inventer de statistiques". Docs : 05c (outils de lecture prédéfinis, jamais de SQL libre). Phase 8.
 48 Chatbot public (8) : 4 traits (professionnelle, simple, rapide, adaptée au contexte camerounais), 3 catégories (INFORMATION CERTAINE, DYNAMIQUE, INDISPONIBLE), l'exemple de message. Docs : 05c.
 49 UX de confiance (7) : les 6 éléments affichés (distributeur vérifié, stock, dernière mise à jour, distance, livraison, WhatsApp) + objectif. MVP (phases 3 et 4).
 50 Responsive (5) : mobile-first + 4 appareils de test (petit Android, écran moyen, tablette, desktop). Docs : 04, 06b.
 51 PWA (6) : installation, cache, notifications, mode dégradé hors ligne, raccourci écran d'accueil. Phase 10.
 52 Observabilité (8) : 7 éléments (logs, monitoring, erreurs frontend, erreurs backend, temps de réponse, disponibilité API, alertes système) + page admin "État de la plateforme". Phase 10.
 53 Ne pas surcharger (7) : les 6 entrées (Acheter, Trouver du gaz, Commander, Suivre ma commande, Mes factures, Assistance) + règle "pas 30 boutons". Docs : 02 (navigation). Transversal.
 54 Phases de développement (64) : les 10 phases de la source et CHAQUE puce (52 puces). ATTENTION : la numérotation de la source n'est pas celle du projet : source "PHASE 1 — AUDIT" = notre Phase 0 ; source phases 2 à 10 = nos phases 2 à 10. Écris le mapping explicite dans la colonne Justification. Ajoute les 2 règles ("ne pas développer toutes les fonctionnalités simultanément", "ne coder aucune fonctionnalité avant l'audit"). Docs : 06c.
 55 Tests (18) : 11 types + 7 cas à tester particulièrement (double paiement, double commande, utilisateur non autorisé, distributeur non validé, modification frauduleuse du prix, faux statut de paiement, accès à la facture d'autrui). Docs : 06b (cite l'identifiant du cas d'abus).
 56 Règles de développement (8) : les 7 interdictions (NE PAS supprimer une fonctionnalité sans justification, modifier le contenu métier sans vérification, inventer les informations officielles, les prix, les distributeurs, les stocks, les horaires) + "les données dynamiques viennent de la base". Transversal : cite R1 à R11 du prompt maître.
 57 Livrables avant le code (16) : les 15 livrables + "ensuite seulement l'implémentation". Une ligne par livrable avec le fichier de docs/ qui le produit : audit complet = 01 ; architecture cible, API, frontend, cartographie = 04 ; sitemap, parcours, matrice des rôles = 02 ; modèle de données = 03/03b/03c ; IA = 05c ; notifications = 05b ; paiement = 05a ; sécurité = 06a ; tests = 06b ; roadmap = 06c. Vérifie chaque affirmation par grep.
 58 Règle d'innovation (15) : 9 domaines d'amélioration + les 5 champs PROBLÈME, SOLUTION, VALEUR, COMPLEXITÉ, PRIORITÉ + "jamais une fonctionnalité parce qu'elle est à la mode". Vérifie que les idées ajoutées dans 06c (H<nn>) respectent le format.
 59 Objectif final (11) : les 2 énoncés (client, entreprise), les 8 évolutions futures (application Android, application iOS, réseau national, fidélité, marketplace, analytics avancés, automatisation logistique, expansion dans d'autres pays africains), "commence par l'audit, ne code pas". Transversal.

À LA FIN DE CHAQUE LOT : exécute le script, colle la sortie complète, corrige les alertes (contrôle 12 : contenu requis ; contrôle 1 : couverture vs cible), commit + push, tag trace-V-lot-D / E, puis STOP avec un résumé de 10 lignes.
```

---

## MESSAGE 4 : clôture de la matrice et de la Phase 1

```
[Rappel de reprise ci-dessus]

TÂCHE : clôturer la matrice de traçabilité et la Phase 1. Ne commence pas la Phase 2.

1. FINALISER docs/08-tracabilite.md
 - Tableau de synthèse : nombre d'exigences et de lignes par source (S, A, N, P, V) et par statut (MVP / Plus tard), nombre de AUCUN, nombre d'identifiants M<nn> et H<nn> cités.
 - TROUS : une entrée par ligne AUCUN, avec le texte EXACT de la ligne de la matrice, la raison, le remède (a. ajouter à tel document ; b. plus tard avec phase cible et H<nn> ; c. décision du propriétaire) et un décideur précis (propriétaire, PLEINGAZ, juriste, équipe technique).
 - INCOHÉRENCES : écarts entre les sources et les décisions actuelles (D1 à D4 PROPOSÉS : Next.js ou Vite, hébergement, tuiles de carte, paiement ; Leaflet ; conflits entre 06c et les sources).
 - DÉCISIONS DU PROPRIÉTAIRE : toute proposition de ne pas faire une exigence, Mobile Money (MVP ou phase 6, recommandation : sandbox en phase 6, le pilote démarre avec le paiement en présentiel confirmé par code), précommande, commande groupée, réseau assisté, ville du pilote, modèle économique (qui encaisse, commission, consigne, frais Mobile Money).

2. CORRIGER LES DOCUMENTS (une modification ciblée par commit) pour chaque TROU de remède (a) : ajouter à 02, 03, 04, 05x, 06x ou 07 ce qui manque, puis mettre à jour la ligne de la matrice (document cité, section précise) et supprimer l'entrée de TROUS.

3. CONTRÔLE FINAL : scripts/check-trace.sh doit afficher :
 - section 17 : ok pour S, A, N, P ;
 - contrôles 3, 4, 7, 8, 11, 12, 14, 15 : aucun résultat ;
 - contrôle 9 : toutes les lignes MVP avec référence valide et aucun M<nn> non cité (sinon, justifie par écrit chaque M<nn> non cité) ;
 - contrôle 1 : aucune alerte sur les sections 0 à 59.
 Colle la sortie réelle et complète.

4. LIVRABLES DE CLÔTURE
 - docs/10-phase1-cloture.md : checklist de sortie de la Phase 1 (livrables 01 à 08 présents et cohérents, ADR D1 à D4 en PROPOSÉ ou À CONFIRMER, décisions du propriétaire), chiffres de la matrice, risques résiduels.
 - docs/11-questions-pour-pleingaz.md : liste des décisions et informations à obtenir de PLEINGAZ, en français simple, classées par urgence (modèle économique, consigne, prix officiels, horaires, zone pilote, comptes marchands MTN/Orange, WhatsApp, domaine, textes légaux), prête à être envoyée telle quelle.
 - Plan détaillé de la Phase 2 (5 tâches, critères d'acceptation), en tenant compte des messages 3 et 4 de PLEINGAZ_reconstruction_messages.md (Phase 2 Tâche 1 et Tâche 2).

5. Commit + push, tag phase-1-done. Vérifie `git status -sb` et `git log origin/master --oneline | head -3`. STOP. Attends mon feu vert pour la Phase 2.
```
