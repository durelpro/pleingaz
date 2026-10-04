| Domaine                   | Technologie choisie         | Utilisation dans PLEINGAZ                                        | Priorité    |
| ------------------------- | --------------------------- | ---------------------------------------------------------------- | ----------- |
| Langage principal         | TypeScript                  | Frontend et backend avec un seul langage                         | Obligatoire |
| Frontend                  | Next.js + React             | Site public, espace client, distributeur et administration       | Obligatoire |
| Style et interface        | Tailwind CSS                | Design responsive et mobile-first                                | Obligatoire |
| Composants UI             | shadcn/ui                   | Boutons, formulaires, tableaux, modales et dashboards            | Recommandé  |
| Icônes                    | Lucide React                | Icônes légères et cohérentes                                     | Recommandé  |
| Backend                   | NestJS                      | API, logique métier, sécurité et workflows                       | Obligatoire |
| Base de données           | PostgreSQL                  | Utilisateurs, produits, stocks, commandes, paiements et factures | Obligatoire |
| Géolocalisation           | PostGIS                     | Distances, points de vente proches et cartes de demande          | Obligatoire |
| ORM                       | Prisma                      | Communication entre NestJS et PostgreSQL                         | Obligatoire |
| Requêtes géographiques    | SQL paramétré               | Recherches de distance avec PostGIS                              | Obligatoire |
| Cache                     | Redis                       | Cache, OTP, sessions temporaires et limitation des requêtes      | Recommandé  |
| Tâches en arrière-plan    | BullMQ                      | Notifications, factures, emails et traitement des webhooks       | Recommandé  |
| Cartes                    | Leaflet + React Leaflet     | Carte interactive des distributeurs                              | Recommandé  |
| Authentification          | JWT + cookies HttpOnly      | Connexion sécurisée et gestion des sessions                      | Obligatoire |
| Mots de passe             | Argon2id                    | Hashage sécurisé des mots de passe                               | Obligatoire |
| Permissions               | RBAC                        | Gestion des rôles client, distributeur et administrateur         | Obligatoire |
| Validation                | Zod + ValidationPipe NestJS | Validation des formulaires et des données API                    | Obligatoire |
| Paiements                 | PaymentProvider             | MTN Mobile Money, Orange Money et paiement présentiel            | Obligatoire |
| Fichiers                  | Stockage compatible S3      | Photos, pièces d'identité et factures PDF                        | Recommandé  |
| Notifications             | Email + WhatsApp            | Confirmation, suivi, alertes et assistance                       | Obligatoire |
| Temps réel                | WebSocket / Socket.IO       | Chat, notifications et statut des commandes                      | Plus tard   |
| Recherche initiale        | PostgreSQL                  | Recherche de produits, boutiques, villes et quartiers            | Obligatoire |
| Recherche avancée         | OpenSearch                  | Recherche sémantique et tolérance aux fautes                     | Plus tard   |
| Intelligence artificielle | LLM + RAG + outils internes | Chatbot, recherche géographique et assistant admin               | Plus tard   |
| Tests unitaires           | Jest                        | Tests des services et règles métier                              | Obligatoire |
| Tests API                 | Supertest                   | Tests des routes et permissions                                  | Obligatoire |
| Tests navigateur          | Playwright                  | Tests des parcours client et distributeur                        | Recommandé  |
| Conteneurisation          | Docker + Docker Compose     | Environnement local et déploiement reproductible                 | Obligatoire |
| Serveur                   | Ubuntu Linux                | Hébergement de l'API et des services                             | Recommandé  |
| Reverse proxy             | Nginx                       | HTTPS, routage et protection du serveur                          | Recommandé  |
| Gestion du code           | Git + GitHub                | Historique et collaboration                                      | Obligatoire |
| Monitoring                | Sentry + Uptime Kuma        | Erreurs, disponibilité et surveillance                           | Plus tard   |
