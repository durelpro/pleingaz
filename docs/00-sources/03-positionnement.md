1. Positionnement stratégique

Positionnement recommandé

PLEINGAZ devrait être présenté comme :

> Le réseau numérique officiel de distribution du gaz PLEINGAZ au Cameroun.

La plateforme doit réunir trois produits complémentaires.

| Produit | Utilisateurs | Fonction principale |
| --- | --- | --- |
| PLEINGAZ Client | Particuliers et professionnels | Trouver, commander, payer, se faire livrer et suivre le gaz |
| PLEINGAZ Distributeur | Revendeurs et points de vente | Gérer leur boutique, leur stock, leurs commandes et leur relation client |
| PLEINGAZ Control Center | Équipe PLEINGAZ | Valider, superviser, approvisionner, analyser et développer le réseau |

La plateforme ne doit pas être pensée comme un catalogue classique. La question principale du client n’est généralement pas :

> « Quels produits existe-t-il ? »

Mais plutôt :

> « Où puis-je trouver du gaz maintenant ? »

2. Fonction centrale : « J’ai besoin de gaz »

La fonctionnalité la plus importante devrait être un parcours rapide accessible depuis la page d’accueil :

J’ai besoin de gaz

Le client sélectionne :

1. Le produit recherché :
   - bouteille 6 kg ;
   - bouteille 12,5 kg ;
   - bouteille 50 kg ;
   - accessoire ;
   - autre produit disponible.
2. Sa localisation :
   - autoriser la géolocalisation ;
   - saisir une ville ;
   - saisir un quartier ;
   - sélectionner une zone sur la carte.
3. Son besoin :
   - acheter sur place ;
   - commander une livraison ;
   - obtenir l’itinéraire ;
   - appeler le distributeur ;
   - contacter le distributeur sur WhatsApp ;
   - être averti en cas de retour du stock.

La plateforme affiche ensuite directement :

- les points de vente disponibles ;
- la distance ;
- le temps de trajet estimé ;
- l’heure de dernière mise à jour ;
- les horaires ;
- le prix, s’il est renseigné ;
- la livraison disponible ou non ;
- le téléphone ;
- WhatsApp ;
- le statut officiel du distributeur.

Exemple :

```text
12,5 kg disponible

Boutique ABC
✓ Distributeur PLEINGAZ vérifié
🟢 Stock confirmé il y a 14 minutes
📍 1,7 km
🚚 Livraison disponible
🕒 Ouvert jusqu’à 19 h

[Commander] [Itinéraire] [WhatsApp] [Appeler]
```

Cette interface réduit le nombre d’étapes et répond directement au besoin réel du client.

3. Disponibilité vérifiée

La disponibilité du gaz doit devenir le cœur de la différenciation de PLEINGAZ.

États visibles côté client

| Statut | Signification |
| --- | --- |
| 🟢 Disponible | Stock déclaré disponible récemment |
| 🟠 Stock limité | Quantité faible ou seuil d’alerte atteint |
| 🔴 Rupture | Produit déclaré indisponible |
| ⚪ Information ancienne | Stock non actualisé depuis une période définie |

Chaque statut doit obligatoirement afficher :

- la date de dernière mise à jour ;
- éventuellement l’heure ;
- le produit concerné ;
- le distributeur ayant déclaré l’information.

Il faut éviter l’expression « disponible » sans précision temporelle. Une information vieille de plusieurs jours ne doit pas être présentée comme une donnée en temps réel.

Exemple de message fiable

> Stock confirmé il y a 18 minutes.

Ou :

> Dernière mise à jour il y a 3 jours. Disponibilité à confirmer auprès du distributeur.

Système d’alerte en cas de rupture

Lorsqu’un produit est indisponible, afficher :

> Ce produit est actuellement indisponible dans cette zone.

Puis proposer :

> M’avertir lorsque le gaz sera de nouveau disponible.

L’alerte peut être liée :

- au compte client ;
- au numéro de téléphone ;
- à un point de vente précis ;
- à une zone géographique ;
- à un produit donné.

Cette fonctionnalité transforme une recherche infructueuse en opportunité commerciale.

4. Recherche locale et géographique

La carte ne doit pas être un élément décoratif. Elle doit devenir un véritable moteur de distribution.

Carte publique

Elle permet de rechercher :

- un point de vente ;
- un quartier ;
- une ville ;
- un produit ;
- un distributeur ouvert ;
- un distributeur avec stock ;
- une boutique qui livre.

Carte distributeurs

Elle permet à PLEINGAZ de visualiser :

- les distributeurs approuvés ;
- les candidatures en attente ;
- les distributeurs suspendus ;
- les zones peu couvertes ;
- la disponibilité par produit ;
- les points de vente inactifs ;
- les distributeurs n’ayant pas actualisé leur stock.

Carte de stock

Elle affiche les zones :

- bien approvisionnées ;
- à stock faible ;
- en rupture ;
- sans donnée récente.

Carte de demande

Elle analyse :

- les recherches ;
- les demandes sans stock ;
- les commandes ;
- les recherches répétées ;
- les zones avec forte demande et faible couverture.

Carte stratégique administrative

Elle doit permettre de repérer :

- les quartiers sous-desservis ;
- les zones nécessitant un nouveau distributeur ;
- les zones proches d’un dépôt ou d’un centre logistique ;
- les zones où la demande augmente ;
- les zones où les délais de livraison sont élevés.

5. Géolocalisation responsable

La géolocalisation doit rester facultative.

Si le client accepte

La plateforme utilise sa position approximative pour afficher :

- les points de vente proches ;
- la distance ;
- les horaires ;
- le stock ;
- la livraison ;
- l’itinéraire.

Si le client refuse

La plateforme demande simplement :

> Dans quelle ville ou quel quartier êtes-vous ?

Exemples :

- Bastos ;
- Mvan ;
- Bonamoussadi ;
- Akwa ;
- Bafoussam ;
- Limbé.

Il ne faut pas demander ni conserver une localisation précise lorsque cela n’est pas nécessaire.

Géolocalisation des distributeurs

Lors de l’inscription d’un distributeur :

1. le distributeur recherche son adresse ;
2. un service de géocodage propose une position ;
3. le distributeur déplace le marqueur si nécessaire ;
4. il confirme l’emplacement ;
5. la latitude et la longitude sont enregistrées ;
6. l’équipe PLEINGAZ peut valider la position.

Il ne faut jamais déduire automatiquement une position précise uniquement à partir d’un texte d’adresse.

6. Routage intelligent des commandes

Le meilleur point de vente ne doit pas être choisi uniquement selon la distance.

Le classement doit prendre en compte :

- disponibilité réelle ;
- ancienneté de la mise à jour du stock ;
- distance ;
- temps estimé ;
- horaires ;
- capacité de traitement ;
- possibilité de livraison ;
- zone desservie ;
- charge actuelle ;
- taux de commandes honorées ;
- statut du distributeur ;
- fiabilité des données.

Exemple de classement

Un distributeur situé à 2 km avec stock confirmé il y a 10 minutes peut être prioritaire sur un distributeur situé à 1 km dont le stock n’a pas été actualisé depuis 5 jours.

Ce classement doit toutefois rester compréhensible. Le client doit pouvoir voir pourquoi un point de vente est recommandé :

> Recommandé parce qu’il est ouvert, disponible, proche et propose la livraison.

7. Gestion du stock distributeur

Le distributeur ne devrait pas seulement répondre à la question « avez-vous du gaz ? ».

Il doit pouvoir gérer chaque produit :

| Produit | État | Dernière mise à jour |
| --- | --- | --- |
| 6 kg | 🟢 Bon stock | Aujourd’hui à 08:10 |
| 12,5 kg | 🟠 Stock faible | Aujourd’hui à 08:12 |
| 50 kg | 🔴 Rupture | Hier à 17:45 |

Les quantités exactes peuvent être facultatives au début. Pour réduire la complexité, une première version peut utiliser des niveaux :

- bon stock ;
- stock moyen ;
- stock faible ;
- rupture.

Une évolution pourra ensuite permettre de saisir :

- quantité disponible ;
- quantité réservée ;
- seuil d’alerte ;
- stock physique ;
- stock estimé ;
- date probable de réapprovisionnement.

8. Réapprovisionnement intelligent

Le système peut détecter les risques à partir de données réelles.

Pour le distributeur

> Votre stock de bouteilles 12,5 kg semble faible.

Actions :

- commander maintenant ;
- modifier le stock ;
- ignorer l’alerte ;
- contacter PLEINGAZ.

Pour PLEINGAZ

> Le distributeur Boutique ABC présente un risque de rupture sur le produit 12,5 kg.

Une alerte peut être déclenchée si :

- le stock passe régulièrement de bon à faible puis rupture ;
- les commandes augmentent ;
- les recherches dans la zone augmentent ;
- le distributeur ne met pas son stock à jour ;
- le délai moyen de réapprovisionnement est dépassé.

La prévision doit d’abord reposer sur des règles explicites. L’intelligence artificielle peut être ajoutée ensuite pour détecter des tendances plus complexes.

9. Assistant IA connecté aux données réelles

L’assistant IA ne doit pas être une simple FAQ et ne doit jamais inventer un stock, un prix, un horaire ou un distributeur.

Exemple

Utilisateur :

> Je suis à Mvan et je cherche une bouteille de 12,5 kg.

L’assistant doit :

1. comprendre le produit ;
2. identifier la zone ;
3. appeler l’outil de recherche ;
4. consulter les données de la plateforme ;
5. retourner une réponse basée sur les résultats réels.

Réponse possible :

> J’ai trouvé 4 points de vente PLEINGAZ autour de Mvan. Le plus proche se trouve à 1,4 km et a déclaré du stock il y a 22 minutes. Voulez-vous commander, appeler le distributeur ou obtenir l’itinéraire ?

Outils internes recommandés

```text
find_nearest_available_store()
check_product_availability()
find_open_store()
get_store_details()
get_order_status()
get_invoice()
create_stock_alert()
contact_support()
```

Classification des réponses

L’assistant doit distinguer :

- information officielle ;
- information dynamique ;
- information non disponible ;
- estimation ;
- recommandation.

Exemple :

> Je n’ai pas de donnée récente sur le stock de cette boutique. Je peux vous montrer les points de vente proches dont le stock a été actualisé récemment.

Architecture

```text
Utilisateur
    ↓
Assistant IA
    ↓
Compréhension de l’intention
    ↓
Appel d’un outil sécurisé
    ↓
Base de données PLEINGAZ
    ↓
Réponse contrôlée
```

Le modèle de langage ne doit pas accéder directement à toutes les données ni pouvoir exécuter une action sensible sans contrôle.

10. Architecture globale optimisée

```text
                         PLEINGAZ
                    Plateforme numérique
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
       ▼                      ▼                      ▼
   CLIENTS              DISTRIBUTEURS             ADMIN
       │                      │                      │
Recherche              Gestion boutique        Supervision
Disponibilité          Gestion stock            Validation
Commande               Commandes PLEINGAZ      Finance
Paiement               Factures                 Logistique
Livraison               Notifications            Analytics
Factures               Communication            IA administrative
Chat                    Statistiques             Rapports
       └──────────────────────┼──────────────────────┘
                              ▼
                       Backend / API
                              │
 ┌──────────────┬──────────────┼──────────────┬──────────────┐
 ▼              ▼              ▼              ▼              ▼
Base de       Paiements      Cartographie    IA contrôlée   Notifications
données       MTN/Orange     GPS/cartes      RAG + outils   WhatsApp
              Présentiel     Distances                      Email
                                                             Web Push
                              │
                              ▼
                      Analytics / BI
                              │
                              ▼
                 PLEINGAZ Intelligence
```

11. Architecture fonctionnelle en trois produits

Produit 1 — PLEINGAZ Client

Parcours principal :

```text
Rechercher
    ↓
Trouver un point de vente
    ↓
Vérifier le stock
    ↓
Choisir retrait ou livraison
    ↓
Commander
    ↓
Payer
    ↓
Suivre
    ↓
Recevoir
    ↓
Télécharger la facture
    ↓
Évaluer
```

Fonctions prioritaires :

- recherche ;
- disponibilité ;
- carte ;
- panier ;
- commande ;
- livraison ;
- paiement ;
- facture ;
- WhatsApp ;
- assistance ;
- favoris ;
- alertes de retour en stock.

Produit 2 — PLEINGAZ Distributeur

Fonctions prioritaires :

- inscription ;
- dépôt de dossier ;
- validation ;
- gestion de boutique ;
- localisation ;
- horaires ;
- stock ;
- réception des commandes ;
- commandes auprès de PLEINGAZ ;
- factures ;
- statistiques ;
- conversation avec PLEINGAZ ;
- alertes de réapprovisionnement.

Produit 3 — PLEINGAZ Control Center

Fonctions prioritaires :

- validation des distributeurs ;
- supervision du stock ;
- gestion des produits ;
- gestion des prix ;
- gestion des commandes ;
- paiements ;
- facturation ;
- livraisons ;
- support ;
- carte réseau ;
- heatmap de la demande ;
- prévision ;
- rapports ;
- audit ;
- configuration de l’IA.

12. Facturation et identité du vendeur

La plateforme doit clairement distinguer le vendeur réel.

Exemples :

```text
PLEINGAZ — Vente directe
```

ou :

```text
PLEINGAZ — Distributeur agréé : Boutique ABC
```

Chaque facture doit posséder :

- son propre numéro ;
- une référence de commande ;
- l’identité du vendeur ;
- l’identité de l’acheteur ;
- les produits ;
- les quantités ;
- le prix unitaire ;
- les frais de livraison ;
- le total ;
- le mode de paiement ;
- le statut du paiement ;
- la date ;
- les informations fiscales ou commerciales validées par PLEINGAZ.

Il faut éviter qu’un client achète auprès d’un distributeur mais pense avoir acheté directement auprès de la maison mère.

13. Paiement avec abstraction fournisseur

Le paiement doit être séparé du reste de l’application.

```text
PLEINGAZ
    ↓
Payment Service
    ↓
 ┌──────────────┬────────────────┬─────────────────┐
 ▼              ▼                ▼
MTN MoMo       Orange Money      Paiement présentiel
```

Interface recommandée :

```text
PaymentProvider
├── MTNProvider
├── OrangeProvider
└── ManualPaymentProvider
```

Principes obligatoires :

- traitement côté serveur ;
- identifiant de transaction ;
- confirmation serveur ;
- webhook ;
- vérification du statut auprès du fournisseur ;
- idempotence ;
- journal des événements ;
- gestion des paiements échoués ;
- prévention des doubles paiements ;
- rapprochement financier.

Une commande ne doit jamais être marquée comme payée uniquement parce que le frontend affiche « succès ».

14. Nouvelles idées à intégrer avec méthode

Toute fonctionnalité supplémentaire doit être évaluée selon le format suivant :

| Idée | Problème | Solution | Valeur | Complexité | Priorité |
| --- | --- | --- | --- | --- | --- |
| Retour en stock | Le client quitte le site en cas de rupture | Alerte automatique | Récupération de ventes | Faible à moyenne | Très haute |
| Stock non actualisé | Données peu fiables | Rappels et statut d’ancienneté | Confiance accrue | Faible | Très haute |
| Précommande | Produit momentanément indisponible | Demande enregistrée auprès d’un distributeur | Meilleure conversion | Moyenne | Haute |
| Commande groupée | Plusieurs clients d’une zone ont le même besoin | Regrouper les demandes | Optimisation logistique | Élevée | Moyenne |
| Mode faible connexion | Internet instable | Interface légère et reprise automatique | Meilleure accessibilité | Moyenne | Haute |
| Paiement à la livraison contrôlé | Certains clients ne peuvent pas payer en ligne | Confirmation manuelle structurée | Élargissement de l’accès | Moyenne | Haute |
| Centre de confiance | Peur des faux distributeurs | Badge, vérification et historique | Réduction du risque | Moyenne | Très haute |
| Signalement d’un problème | Erreur de prix, stock ou comportement | Bouton de signalement | Qualité du réseau | Faible | Haute |
| Liste d’attente par zone | Rupture fréquente | Regrouper les demandes locales | Aide à la planification | Moyenne | Moyenne |
| Mode agent ou revendeur assisté | Certains clients sont peu familiarisés avec le numérique | Commande assistée via WhatsApp ou téléphone | Inclusion | Moyenne | Haute |

15. Innovations supplémentaires pertinentes

Commande assistée

Pour les utilisateurs peu habitués aux plateformes, prévoir une commande assistée :

- via WhatsApp ;
- par téléphone ;
- par un agent PLEINGAZ ;
- par un distributeur partenaire.

La commande doit ensuite être enregistrée dans le même système que les commandes web afin de conserver la traçabilité.

Mode faible connexion

La plateforme doit :

- charger peu d’images ;
- compresser les données ;
- éviter les vidéos lourdes ;
- mettre en cache les éléments stables ;
- permettre la reprise d’une commande interrompue ;
- afficher un état clair lorsque les données ne sont pas à jour.

Vérification du stock par action simple

Pour faciliter l’adoption par les distributeurs, proposer un bouton très visible :

```text
[Confirmer mon stock maintenant]
```

Le distributeur peut confirmer rapidement que le stock n’a pas changé, sans devoir remplir à nouveau tout le formulaire.

Score de fraîcheur des données

Plutôt que de montrer uniquement un score de distributeur, présenter un indicateur de fiabilité de l’information :

- mise à jour récente ;
- mise à jour régulière ;
- données anciennes ;
- stock à confirmer.

Cela est plus compréhensible pour le client qu’une note abstraite.

Réservation temporaire

Lorsqu’un client commande pour un retrait, le stock peut être réservé pendant une durée définie.

Exemple :

> Article réservé pendant 30 minutes, dans l’attente de la confirmation du distributeur.

Cette fonction nécessite une gestion stricte des expirations et des quantités réservées.

Signalement de disponibilité erronée

Le client peut signaler :

- stock annoncé mais absent ;
- boutique fermée ;
- mauvais numéro ;
- mauvais emplacement ;
- prix différent ;
- distributeur non reconnu.

Les signalements doivent alimenter le back-office et le score interne de qualité, sans devenir automatiquement une sanction.

Réseau de distribution assisté par la donnée

PLEINGAZ pourra progressivement calculer :

- la demande par quartier ;
- la fréquence des ruptures ;
- le temps moyen de réponse ;
- le nombre de recherches sans résultat ;
- les zones nécessitant un nouveau revendeur ;
- le potentiel de livraison ;
- les produits à renforcer par zone.

16. Roadmap réorganisée

Phase 0 — Accès et audit de l’existant

Avant tout développement :

- récupérer le contenu réel ;
- identifier les pages ;
- examiner le code ;
- déterminer la stack ;
- analyser l’hébergement ;
- contrôler le domaine et les certificats ;
- vérifier les formulaires ;
- mesurer les performances ;
- vérifier les outils statistiques ;
- inventorier les fonctionnalités existantes ;
- identifier les données à conserver ;
- repérer les risques de migration.

Livrables :

- audit fonctionnel ;
- audit UX/UI ;
- audit technique ;
- audit SEO ;
- audit performance ;
- audit sécurité ;
- inventaire des contenus ;
- recommandations de migration.

Phase 1 — Fondations

- authentification ;
- utilisateurs ;
- rôles ;
- profils ;
- sessions sécurisées ;
- base de données ;
- journalisation ;
- permissions ;
- gestion des adresses.

Phase 2 — Réseau distributeur

- candidature ;
- documents ;
- validation ;
- boutique ;
- localisation ;
- carte ;
- badge vérifié ;
- horaires ;
- contact.

Phase 3 — Produits et disponibilité

- catalogue ;
- catégories ;
- stocks ;
- état du stock ;
- dernière mise à jour ;
- recherche ;
- filtres ;
- alertes de rupture.

Phase 4 — Commandes

- panier ;
- retrait ;
- livraison ;
- réservation ;
- routage ;
- suivi ;
- facture.

Phase 5 — Paiements

- paiement présentiel ;
- MTN Mobile Money ;
- Orange Money ;
- webhooks ;
- rapprochement ;
- prévention des doublons.

Phase 6 — Communication

- WhatsApp ;
- notifications ;
- email ;
- chat ;
- support humain ;
- centre de notifications.

Phase 7 — Intelligence

- chatbot public ;
- outils internes ;
- recherche sémantique ;
- assistant géographique ;
- assistant administratif ;
- base de connaissances contrôlée.

Phase 8 — Pilotage stratégique

- dashboard ;
- rapports ;
- heatmap ;
- prévisions ;
- détection des ruptures ;
- analyse du réseau ;
- recommandations d’expansion.

Phase 9 — Optimisation

- PWA ;
- SEO local ;
- accessibilité ;
- performances ;
- monitoring ;
- tests de sécurité ;
- tests de charge ;
- préparation d’une application mobile.

17. Livrables avant codage

Avant toute modification importante, il faut produire et valider :

1. audit du site actuel ;
2. inventaire des pages et composants ;
3. architecture technique existante ;
4. architecture cible ;
5. stratégie de migration ;
6. sitemap ;
7. parcours client ;
8. parcours distributeur ;
9. parcours administrateur ;
10. matrice des rôles ;
11. modèle de données ;
12. architecture API ;
13. architecture frontend ;
14. architecture de paiement ;
15. architecture cartographique ;
16. architecture IA ;
17. architecture de notifications ;
18. plan de sécurité ;
19. plan de tests ;
20. roadmap ;
21. priorisation MVP ;
22. estimation de complexité ;
23. plan de reprise des données ;
24. plan de sauvegarde et restauration.

18. Règle stricte pour l’audit réel

L’audit doit séparer clairement :

Ce qui est constaté

Éléments réellement présents sur le site :

- pages ;
- textes ;
- images ;
- formulaires ;
- liens ;
- fonctionnalités ;
- technologies détectées ;
- performances mesurées.

Ce qui est recommandé

Éléments proposés pour la future plateforme :

- recherche avancée ;
- carte ;
- stock ;
- commandes ;
- paiement ;
- IA ;
- espace distributeur ;
- back-office.

Ce qui doit être confirmé

Éléments nécessitant une validation de PLEINGAZ :

- prix ;
- horaires ;
- politique de livraison ;
- données officielles ;
- identité des distributeurs ;
- règles commerciales ;
- conditions de paiement ;
- informations légales ;
- politique de confidentialité ;
- conditions de retour ou d’annulation.

Aucune donnée métier ne doit être inventée.

Conclusion opérationnelle

La meilleure orientation consiste à faire de PLEINGAZ un Digital Distribution Network centré sur quatre promesses :

1. trouver le gaz près de soi ;
2. vérifier sa disponibilité ;
3. commander auprès d’un distributeur fiable ;
4. permettre à PLEINGAZ de piloter intelligemment son réseau.
