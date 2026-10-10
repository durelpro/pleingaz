# 05d - Contrat de Données et Outils IA (Data Contract)

Ce document spécifie le contrat de données entre l'Assistant IA (LLM) et le système d'information de PLEINGAZ. Il définit la frontière stricte entre la connaissance statique (Knowledge Base) et les données transactionnelles ou volatiles (Base de données), conformément aux règles de sécurité et de fraîcheur.

## 1. Architecture Hybride de l'Information

L'assistant prend ses décisions d'accès à l'information selon une règle de routage stricte :

| Type de requête | Source de Vérité | Outil utilisé | Entités de 03 concernées |
| :--- | :--- | :--- | :--- |
| Explication, Procédure, Politique | Knowledge Base (KB) | `search_knowledge` | KnowledgeDocument |
| Stock, Prix, Horaire, Facture | Base de Données (DB) | Outils API (ex: `get_product_price`) | Product, Store, Inventory, Order, Invoice |
| Question Mixte (Théorie + Pratique) | Les Deux | Multi-tools | (Toutes entités nécessaires) |

## 2. Catalogue des Outils (15 Outils)

Chaque outil est exposé sous forme de Function Calling (schéma JSON validé par Zod côté serveur). L'IA n'exécute **jamais** de SQL libre.

### Modèle standard applicable à tous les outils
*   **Journalisation (Logging) :** Chaque appel d'outil est loggé (nom de l'outil, durée, succès/échec) dans un datalake technique. Les données d'entrée/sortie sont expurgées (masquage PII) avant stockage.
*   **Tests d'abus :** Budget limité (Rate limiting) à 10 appels BDD par session. Alertes si >5 erreurs 4xx/5xx générées par le modèle en moins de 2 minutes.
*   **Erreurs standards :** Timeout (3s), 400 Bad Request (schéma invalide), 401/403 (Unauthorized).

---

### 2.1. Outils de Recherche et de Disponibilité

#### 1. `find_nearest_available_store`
*   **Rôle :** Trouver la boutique ouverte la plus proche ayant du stock.
*   **Authentification requise :** Publique (Anonyme ou Connecté).
*   **Entrée :** `{"latitude": number, "longitude": number, "radiusKm": number}` (Validation: lat [-90,90], lng [-180,180], radiusKm <= 10).
*   **Sortie :** `{"stores": [{"storeId": string, "name": string, "distanceKm": number, "status": string}], "data_as_of": string, "freshness_label": string, "source": "Database"}`
*   **Entités et colonnes lues :** `Store` (id, name, location, isOpen), `Inventory` (level).
*   **Requêtes :** PostGIS (`ST_DWithin`, `ST_Distance`) paginé (LIMIT 5). Index géospatial GIST sur `location`.
*   **Règles de cache :** AUCUN cache (Données critiques de stock).

#### 2. `check_product_availability`
*   **Rôle :** Vérifier la disponibilité d'un produit (marque/poids) dans une zone.
*   **Authentification requise :** Publique.
*   **Entrée :** `{"brand": string, "weightKg": number, "city": string}`
*   **Sortie :** `{"availableStoresCount": number, "data_as_of": string, "freshness_label": "Temps réel", "source": "Database"}`
*   **Entités et colonnes lues :** `Product` (id), `Inventory` (level), `Store` (city).
*   **Requêtes :** SQL paramétré `SELECT count(*) FROM Inventory i JOIN Store s... WHERE level != 'OUT_OF_STOCK'`. Index composé.
*   **Règles de cache :** Aucun cache.

#### 3. `find_open_store`
*   **Rôle :** Vérifier si une boutique est ouverte à l'heure actuelle.
*   **Authentification requise :** Publique.
*   **Entrée :** `{"storeId": string}`
*   **Sortie :** `{"isOpen": boolean, "nextStatusChange": string, "data_as_of": string, "source": "Database"}`
*   **Entités et colonnes lues :** `Store` (isOpen, operatingHours).
*   **Requêtes :** SELECT simple sur PK.
*   **Règles de cache :** Cache 5 minutes.

#### 4. `get_store_details`
*   **Rôle :** Obtenir les informations détaillées d'un distributeur.
*   **Authentification requise :** Publique.
*   **Entrée :** `{"storeId": string}`
*   **Sortie :** `{"name": string, "address": string, "phone": string, "rating": number, "isVerifiedBadge": boolean, "data_as_of": string}`
*   **Entités et colonnes lues :** `Store`.
*   **Requêtes :** SELECT simple.
*   **Règles de cache :** Cache 1 heure.

#### 5. `search_stores_by_area`
*   **Rôle :** Chercher les boutiques dans un quartier textuel.
*   **Authentification requise :** Publique.
*   **Entrée :** `{"city": string, "neighborhood": string}`
*   **Sortie :** `{"stores": [{"storeId": string, "name": string, "address": string}], "data_as_of": string}`
*   **Entités et colonnes lues :** `Store` (city, neighborhood).
*   **Requêtes :** Recherche plein texte (`pg_trgm`) avec seuil de similarité. LIMIT 10.
*   **Règles de cache :** Cache 10 minutes.

#### 6. `get_product_catalog`
*   **Rôle :** Lister les marques de gaz gérées.
*   **Authentification requise :** Publique.
*   **Entrée :** `{}`
*   **Sortie :** `{"brands": [{"brand": string, "weightsAvailable": [number]}], "data_as_of": string}`
*   **Entités et colonnes lues :** `Product` (brand, weightKg).
*   **Requêtes :** SELECT DISTINCT avec GROUP BY.
*   **Règles de cache :** Cache 24 heures.

#### 7. `get_product_price`
*   **Rôle :** Obtenir le prix officiel d'une bouteille. Le prix vient TOUJOURS d'ici, jamais de la KB.
*   **Authentification requise :** Publique.
*   **Entrée :** `{"brand": string, "weightKg": number}`
*   **Sortie :** `{"price": number, "currency": "FCFA", "data_as_of": string, "source": "Database"}`
*   **Entités et colonnes lues :** `Product` (publicPrice).
*   **Requêtes :** SELECT simple par brand et weightKg.
*   **Règles de cache :** Cache 1 heure.

---

### 2.2. Outils de Commandes et Utilisateurs

#### 8. `get_order_status`
*   **Rôle :** Vérifier le statut d'une commande.
*   **Authentification requise :** Connecté.
*   **Entrée :** `{"orderNumber": string}`
*   **Sortie :** `{"status": string, "totalAmount": number, "createdAt": string, "data_as_of": string}`
*   **Entités lues :** `Order` (orderNumber, status, totalAmount, customerId).
*   **Sécurité :** L'outil vérifie `Order.customerId == session.userId`. Renvoie `{"error": "Unauthorized"}` si échec.
*   **Règles de cache :** AUCUN cache.

#### 9. `list_my_orders`
*   **Rôle :** Lister les 5 dernières commandes de l'utilisateur.
*   **Authentification requise :** Connecté.
*   **Entrée :** `{"limit": number}` (max 10)
*   **Sortie :** `{"orders": [{"orderNumber": string, "status": string}], "data_as_of": string}`
*   **Entités lues :** `Order` (status, createdAt). Index sur `customerId`.
*   **Règles de cache :** AUCUN cache.

#### 10. `get_invoice`
*   **Rôle :** Obtenir le lien ou le détail d'une facture.
*   **Authentification requise :** Connecté.
*   **Entrée :** `{"invoiceNumber": string}`
*   **Sortie :** `{"amount": number, "pdfUrl": string, "status": string, "data_as_of": string}`
*   **Sécurité :** Vérifie l'appartenance de la facture.
*   **Règles de cache :** AUCUN cache.

#### 11. `list_my_invoices`
*   **Rôle :** Lister les factures de l'utilisateur.
*   **Authentification requise :** Connecté.
*   **Entrée :** `{"limit": number}`
*   **Sortie :** `{"invoices": [...], "data_as_of": string}`
*   **Règles de cache :** AUCUN cache.

#### 12. `get_delivery_status`
*   **Rôle :** Obtenir les informations de livraison et l'OTP de validation.
*   **Authentification requise :** Connecté.
*   **Entrée :** `{"orderNumber": string}`
*   **Sortie :** `{"driverName": string, "status": string, "otpCode": "MASQUÉ_PAR_SECURITE", "data_as_of": string}`
*   **Sécurité :** Masquage total de l'OTP si appelé par le LLM.

#### 13. `create_stock_alert`
*   **Rôle :** Créer une alerte de retour en stock.
*   **Authentification requise :** Connecté.
*   **Entrée :** `{"productId": string, "radiusKm": number}`
*   **Sécurité :** L'IA demande une confirmation explicite à l'utilisateur avant d'appeler l'outil.
*   **Sortie :** `{"success": true, "alertId": string}`

#### 14. `list_my_alerts`
*   **Rôle :** Lister les alertes de stock actives.
*   **Authentification requise :** Connecté.
*   **Entrée :** `{}`
*   **Sortie :** `{"alerts": [...], "data_as_of": string}`

#### 15. `list_my_addresses`
*   **Rôle :** Récupérer les adresses enregistrées de l'utilisateur.
*   **Authentification requise :** Connecté.
*   **Entrée :** `{}`
*   **Sortie :** `{"addresses": [{"id", "label", "city", "neighborhood"}], "data_as_of": string}`
*   **Entités lues :** `Address`

---

### 2.3. Outils Système et IA

#### 16. `search_knowledge`
*   **Rôle :** Interroger la Knowledge Base Validée via RAG (Vector Search).
*   **Entrée :** `{"query": string}`
*   **Sortie :** `{"documents": [{"content": string, "source": string, "status": "VALIDATED"}], "data_as_of": string}`
*   **Requêtes :** pgvector `ORDER BY embedding <=> query_embedding LIMIT 3`. Filtre stricte: `status = 'VALIDATED'`.

#### 17. `handoff_to_agent`
*   **Rôle :** Escalader la conversation vers un humain ou le support client.
*   **Entrée :** `{"reason": string}`
*   **Sortie :** `{"success": true, "ticketId": string, "message": "Un agent va prendre le relais."}`

## 3. Règles de Sécurité Transverses
*   **Authentification Serveur :** L'identifiant de l'utilisateur (`userId`) vient EXCLUSIVEMENT de la session du middleware (JWT/Cookie). Le LLM ne fournit jamais le `userId`.
*   **Minimisation :** Les outils retournent uniquement les champs stricts déclarés dans les schémas de sortie pour ne pas saturer le contexte du modèle.

## 4. Règle de Fraîcheur des Données
Toute réponse renvoyant des données dynamiques (`data_as_of`) inclut un `freshness_label`. Le LLM l'utilise pour nuancer :
*   `data_as_of` < 30 minutes : "Stock confirmé il y a X minutes."
*   `data_as_of` > 30 minutes : "Information ancienne (plus de X minutes). Le stock a pu évoluer."

## 5. Gouvernance de la Base de Connaissances (KB)
*   **DRAFT :** Brouillon ou information non vérifiée. Ignoré par `search_knowledge`.
*   **VALIDATED :** Officiel. Indexé par `pgvector`.
*   **RETIRED :** Remplacé ou obsolète. Supprimé de l'index.
Seul un administrateur peut basculer un document de DRAFT à VALIDATED via le Back-office. Le LLM cite toujours le champ `source` des documents retournés.

## 6. Évaluation et Monitoring (Critères de lancement)
*   Zéro invention (Hallucination) : Testé sur le dataset JSONL de 150 cas (tests unitaires LLM). Toute invention de prix/stock provoque un échec du pipeline CI/CD.
