# IA et Recherche Avancée (Phase 8)

L'implémentation de l'Intelligence Artificielle n'intervient qu'une fois les bases solides établies (Phases 3 à 5 validées). Elle repose sur une interface `LLMProvider`. En cas d'indisponibilité, le système retombe gracieusement sur une barre de recherche classique.

## 1. Gouvernance et Base de Connaissances (RAG) — Catalogue Exclusif (CR-001 D-01)
L'IA répond sur la base de documents internes gérés par PLEINGAZ (RAG) et sur le catalogue officiel de la marque.
- **Périmètre Restreint Strict** : L'assistant est formellement bridé au catalogue officiel PLEINGAZ (bouteilles de gaz et accessoires certifiés). Toute notion de marketplace ou de produits tiers est exclue.
- **Règle de Refus Poli et Recentrage** : Lorsqu'un utilisateur mentionne ou recherche une marque tierce de gaz ou un produit non référencé, l'assistant refuse poliment et recentre immédiatement la conversation :
  > *"PLEINGAZ distribue exclusivement ses propres bouteilles et accessoires officiels garantis en termes de sécurité. Souhaitez-vous trouver un point de vente PLEINGAZ à proximité ?"*
- **Gouvernance** : L'interface permet aux administrateurs de rédiger, valider, versionner et retirer des documents d'aide (politiques, consignes de sécurité du gaz).
- **Transparence** : Chaque réponse cite sa source et sa validité. Le LLM doit préciser si l'information est "Officielle", "Dynamique" (avec horodatage réel), "Estimée", ou "Indisponible".
- **Tolérance Zéro Inventions** : L'IA n'invente **jamais** un prix, un stock, ou un horaire d'ouverture (Règle R9).

## 2. Outils Internes (Function Calling)
L'assistant agit en accédant à des **outils internes typés et en lecture seule**.
- **Outils Prédéfinis** : `find_nearest_available_store`, `check_product_availability`, `find_open_store`, `get_order_status`, `get_invoice`.
- **Isolation des Données** : Chaque appel passe l'ID de l'utilisateur connecté. Il est techniquement impossible qu'un client interroge les commandes d'un autre. Aucun outil ne permet de lire les pièces d'identité (KYC).
- Aucune action (création de commande, annulation) n'est exécutée silencieusement. Le LLM prépare l'action, l'IHM exige un clic de confirmation de l'utilisateur.

## 3. Assistant Administrateur (Interrogation Métier)
- L'administrateur peut poser des questions en langage naturel (ex: *"Quelles villes sont en rupture ?"*).
- **RÈGLE ABSOLUE : Pas de SQL Libre**. Le modèle ne génère **jamais** de requêtes SQL libres.
- L'IA choisit un **outil de lecture prédéfini** (ex: `list_out_of_stock_stores(city)`, `count_delivered_orders(date_range)`). La base de données calcule le résultat avec certitude. Le modèle reformule les données reçues sans modifier un seul chiffre. S'il n'y a pas d'outil correspondant, l'IA annonce ne pas avoir accès à cette information.
- Les appels d'outils vérifient les permissions (RBAC) de l'administrateur et sont journalisés dans `AuditLog`. Les prévisions de demande utiliseront d'abord des règles explicites avant toute modélisation IA.

## 4. Compréhension du Langage et Assistant Géo (CR-001 D-02)
- **Langues** : Français courant, Anglais, et mélange linguistique toléré. Le support des parlers locaux (pidgin, camfranglais) est hors périmètre initial (**À CONFIRMER**).
- **Assistant Géographique Respectueux** :
  - L'IA ne déclenche **jamais** d'appel autonome en arrière-plan à la géolocalisation native.
  - Elle invite l'utilisateur à exprimer sa ville et son quartier (ex: *"Dans quel quartier de Yaoundé ou Douala cherchez-vous ?"*), ou affiche un composant avec le bouton tactile explicite *"Ma position"* précédé de la mention de transparence.
  - Aucune coordonnée fine n'est injectée dans le prompt ni stockée dans `SearchEvent` (seule la zone grossière est conservée).
  - Algorithme de correspondance avec tables de synonymes pour les quartiers camerounais (`pg_trgm` et `unaccent`).


## 5. Sécurité et Garde-Fous
- **Injection de Prompt Indirecte** : Les descriptions de boutiques, les avis, et les messages des utilisateurs sont des contenus "non fiables" et ne sont **jamais** traités comme des instructions. Ils sont passés dans des blocs strictement délimités (`<untrusted_content>`) et sans impact sur l'exécution.
- Les sorties (outputs) des appels d'outils par le LLM sont validées par des schémas stricts (Zod/JSON Schema).
- **Masquage PII** : Les données personnelles (numéros de téléphone, noms exacts) sont obfusquées avant l'envoi au LLM et dans les journaux système.
- **Conversations** : Consentement requis. Suppression sur simple demande. Durée de conservation et encadrement légal au Cameroun **À CONFIRMER**.
- **Repli Humain** : À la moindre ambiguïté, l'IA s'interrompt : *"Je vais vous mettre en relation avec un conseiller"*.

## 6. Coûts, Évaluation et Lancement
- **Plafonds budgétaires** : Limites dures (Hard Caps) des coûts LLM par mois, et limites de débit (Rate Limits) par IP et utilisateur (Fourchettes **À CONFIRMER**).
- **Critères de lancement** : La production exige la réussite à 100 % sur un jeu de tests de 100+ phrases complexes. Le lancement sera annulé si une invention de stock/prix/horaire est détectée (Tolérance Zéro).
