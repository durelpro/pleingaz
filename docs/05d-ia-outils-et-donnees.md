# 05d - Contrat de Données et Outils IA (Data Contract)

Ce document spécifie le contrat de données entre l'Assistant IA (LLM) et le système d'information de PLEINGAZ. Il définit la frontière stricte entre la connaissance statique (Knowledge Base) et les données transactionnelles ou volatiles (Base de données), conformément aux règles de sécurité et de fraîcheur.

## 1. Architecture Hybride de l'Information

L'assistant prend ses décisions d'accès à l'information selon une règle de routage stricte :

| Type de requête | Source de Vérité | Outil utilisé | Exemple |
| :--- | :--- | :--- | :--- |
| Explication, Procédure, Politique | Knowledge Base (KB) | `search_knowledge` | "Quels sont les modes de paiement ?" |
| Stock, Prix, Horaire, Facture | Base de Données (DB) | Outils API dédiés | "Combien coûte le gaz SCTM ici ?" |
| Question Mixte (Théorie + Pratique) | Les Deux | Multi-tools | "Puis-je me faire livrer ma commande N°X ?" |

## 2. Catalogue des Outils (15 Outils)

Chaque outil est exposé à l'IA sous forme de fonction (Function Calling) validée via un schéma strict (Zod/JSON Schema). L'IA n'écrit **jamais** de SQL libre.

### 2.1. Outils de Recherche et de Disponibilité (Publics & Privés)

#### 1. `find_nearest_available_store`
*   **Rôle :** Trouver la boutique ouverte la plus proche ayant du stock.
*   **Auth :** Public (Session Anonyme) ou Utilisateur. Si connecté, utilise ses coordonnées par défaut.
*   **Entrée :** `{"latitude": number, "longitude": number, "radiusKm": number (max 10)}`
*   **Sortie :** Liste d'objets `[{"storeId", "name", "distanceKm", "status", "data_as_of"}]`
*   **Entités lues :** `Store`, `Inventory`
*   **Requêtes :** Requête spatiale (PostGIS `ST_Distance`) avec filtre sur `Inventory.level != 'OUT_OF_STOCK'`. Index géospatial requis. Cache : Aucun.

#### 2. `check_product_availability`
*   **Rôle :** Vérifier la disponibilité et le prix d'un produit spécifique.
*   **Auth :** Public.
*   **Entrée :** `{"brand": string, "weightKg": number}`
*   **Sortie :** `{"isAvailable": boolean, "publicPrice": number, "data_as_of": timestamp}`
*   **Entités lues :** `Product`, `Inventory`

#### 3. `find_open_store`
*   **Rôle :** Vérifier si une boutique spécifique est ouverte à l'heure actuelle.
*   **Auth :** Public.
*   **Entrée :** `{"storeId": string}`
*   **Sortie :** `{"isOpen": boolean, "openingHours": object}`
*   **Entités lues :** `Store`

#### 4. `get_store_details`
*   **Rôle :** Obtenir les informations détaillées d'un distributeur.
*   **Entrée :** `{"storeId": string}`
*   **Sortie :** `{"name", "address", "phone", "rating", "isVerifiedBadge"}`

#### 5. `search_stores_by_area`
*   **Rôle :** Chercher les boutiques dans un quartier textuel.
*   **Entrée :** `{"city": string, "neighborhood": string}`
*   **Sortie :** `[{"storeId", "name", "address"}]`
*   **Requêtes :** Recherche plein texte (pg_trgm) sur `city` et `neighborhood`.

#### 6. `get_product_catalog`
*   **Rôle :** Lister les marques de gaz gérées par l'application.
*   **Entrée :** `{}`
*   **Sortie :** `[{"brand", "weightsAvailable"}]`

#### 7. `get_product_price`
*   **Rôle :** Obtenir le prix officiel d'une bouteille (Le prix vient TOUJOURS de cet outil, jamais de la KB).
*   **Entrée :** `{"brand": string, "weightKg": number}`
*   **Sortie :** `{"price": number, "currency": "FCFA"}`

### 2.2. Outils de Commandes et Utilisateurs (Nécessite Authentification)

#### 8. `get_order_status`
*   **Rôle :** Vérifier le statut d'une commande.
*   **Auth :** Utilisateur Connecté.
*   **Entrée :** `{"orderNumber": string}`
*   **Sortie :** `{"status", "totalAmount", "createdAt", "data_as_of"}`
*   **Sécurité :** Rejette si `order.customerId != session.userId`.

#### 9. `list_my_orders`
*   **Rôle :** Lister les 5 dernières commandes de l'utilisateur.
*   **Auth :** Utilisateur Connecté.
*   **Entrée :** `{"limit": number (default 5)}`

#### 10. `get_invoice`
*   **Rôle :** Obtenir le lien ou le détail d'une facture.
*   **Auth :** Utilisateur Connecté.
*   **Entrée :** `{"invoiceNumber": string}`

#### 11. `list_my_invoices`
*   **Rôle :** Lister les factures de l'utilisateur.
*   **Auth :** Utilisateur Connecté.

#### 12. `get_delivery_status`
*   **Rôle :** Obtenir les informations de livraison et l'OTP.
*   **Auth :** Utilisateur Connecté.
*   **Entrée :** `{"orderNumber": string}`
*   **Sortie :** `{"driverName", "status", "otpCode"}` (Masquage partiel appliqué).

#### 13. `create_stock_alert`
*   **Rôle :** Créer une alerte de retour en stock.
*   **Auth :** Utilisateur Connecté.
*   **Entrée :** `{"productId": string, "radiusKm": number}`
*   **Sécurité :** Exige une confirmation explicite de l'utilisateur avant l'appel.

#### 14. `list_my_alerts`
*   **Rôle :** Lister les alertes actives.
*   **Auth :** Utilisateur Connecté.

#### 15. `list_my_addresses`
*   **Rôle :** Récupérer les adresses enregistrées de l'utilisateur pour calculer un itinéraire.
*   **Auth :** Utilisateur Connecté.

### 2.3. Outils Système

#### 16. `search_knowledge`
*   **Rôle :** Interroger la Knowledge Base Validée via RAG (Vector Search).
*   **Entrée :** `{"query": string}`
*   **Sortie :** Texte extrait des documents marqués `VALIDATED`.

#### 17. `handoff_to_agent`
*   **Rôle :** Escalader la conversation vers un humain.
*   **Entrée :** `{"reason": string}`

## 3. Règles de Sécurité et de Confidentialité
*   **Trust Boundary :** L'identifiant de l'utilisateur (`userId`) est TOUJOURS injecté par le contrôleur backend à partir du JWT/Session. Les outils ignorent tout `userId` fourni par le LLM.
*   **Masquage :** L'outil `get_my_profile_summary` ou `get_delivery_status` ne renvoie jamais de mot de passe, de PIN complet, ou de carte d'identité. Les numéros de téléphone sont partiellement masqués (ex: `+237 6** ** ** 67`) si envoyés à l'IA.
*   **Rate Limiting :** Budget d'appels d'outils limité par session (ex: max 15 requêtes BDD par conversation) pour éviter les attaques par épuisement (Denial of Wallet).
*   **Fallback :** Si un outil BDD échoue (timeout > 3s), le système renvoie un message d'indisponibilité temporaire sans exposer la stack trace au LLM.

## 4. Règle de Fraîcheur des Données
Toute donnée extraite de la base par un outil DOIT inclure un timestamp `data_as_of`. L'IA doit formuler sa réponse en indiquant la fraîcheur :
*   Si < 30 minutes : "Confirmé il y a X minutes."
*   Si > 30 minutes : "Attention, cette information date de plus de X minutes/heures, les stocks ont pu évoluer."

## 5. Gouvernance de la Base de Connaissances (KB)
Les documents de la Knowledge Base suivent un cycle strict :
1.  **DRAFT :** En cours de rédaction ou données "À CONFIRMER" par la direction de PLEINGAZ. Ignoré par l'IA.
2.  **VALIDATED :** Document officiel. Indexé dans la base vectorielle. Source de vérité absolue pour les procédures.
3.  **RETIRED :** Document obsolète, supprimé de l'index vectoriel.

*Note : Toute citation de la KB par l'IA doit idéalement s'accompagner de la source (ex: "Selon la politique de livraison...").*

## 6. Évaluation et Monitoring
*   **Zero Invention :** L'IA ne doit JAMAIS inventer un prix, un stock ou un horaire. Tout écart détecté lors des tests JSONL (eval) constitue un **échec bloquant** du déploiement.
*   **Journalisation :** Tous les appels d'outils sont loggés (sans données sensibles PII) dans l'entité `AiChatSession` pour auditer le raisonnement du modèle.
