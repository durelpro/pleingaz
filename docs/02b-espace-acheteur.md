# 02b - Spécifications de l'Espace Acheteur (Buyer Space)

Ce document détaille les spécifications fonctionnelles et techniques de l'espace client (Acheteur) de l'application PLEINGAZ, en intégrant l'onboarding, les écrans de gestion, et le rôle de l'assistant IA.

## 1. Personas Cibles
1.  **Le Particulier ("Père/Mère de famille") :** Souhaite une recharge rapide, près de chez lui. Utilise un smartphone basique. Apprécie la livraison.
2.  **Le Professionnel (ex: Gérant de Restaurant) :** Consommation récurrente, besoin de factures propres, recherche des fournisseurs fiables.
3.  **L'Utilisateur peu à l'aise avec le numérique :** A besoin d'une interface très visuelle (gros boutons) ou préfère utiliser l'assistant IA/le téléphone.
4.  **Le Client assisté (WhatsApp/Téléphone) :** Passe commande via le support, le compte est créé par l'admin et rattaché au numéro de téléphone de l'utilisateur.

## 2. Création de Compte et Authentification

### 2.1. Parcours d'Onboarding
1.  **Saisie du Téléphone :** L'utilisateur entre son numéro (format Cameroun).
2.  **Vérification OTP :** Un code à 4/6 chiffres est envoyé par SMS/WhatsApp.
3.  **Complétion du Profil (Minimal) :** Nom, Prénom, Ville, Quartier, Repère (facultatif).
4.  **Consentements :** Acceptation des CGU et politique de confidentialité.
5.  **Fin :** Redirection vers l'accueil ou le checkout.

### 2.2. Gap Analysis : Mot de Passe vs OTP
*   **Vision (docs/00-sources/02-vision-prompt.md, section 5) :** Demande une connexion par Email et Mot de passe.
*   **Réalité du marché cible :** L'authentification par email/mot de passe a un très fort taux d'abandon en Afrique francophone. Le numéro de téléphone est l'identifiant universel.
*   **DÉCISION DU PROPRIÉTAIRE (Proposée) :** Remplacer le mot de passe par un OTP SMS/WhatsApp associé au numéro de téléphone. L'email devient une donnée de récupération / facturation facultative (ajoutable plus tard). Cette décision sera consignée dans `docs/08-tracabilite.md`.

### 2.3. Règles et Sécurité
*   Un compte peut être créé "à la volée" lors de la première commande (Checkout Guest to Registered).
*   **Mode faible connexion :** Les formulaires sont mis en cache (PWA) et resoumis lorsque la connexion revient.
*   **Protection OTP :** Maximum 3 demandes d'OTP toutes les 15 minutes.
*   **Client assisté :** Si une commande est passée par téléphone, l'admin crée la commande sur le numéro du client. Lorsque le client se connectera plus tard via OTP sur l'app, il retrouvera l'historique lié à son numéro.

## 3. Les 15 Écrans de l'Espace Acheteur

| N° | Écran | Objectif | Endpoints API associés (v1) | Phase |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Inscription / Connexion** | Saisie du Numéro de téléphone. | `POST /auth/otp/request` | Phase 4 |
| 2 | **Vérification OTP** | Validation de l'identité. | `POST /auth/otp/verify` | Phase 4 |
| 3 | **Création Profil** | Récolte des données minimales (Nom, Ville). | `POST /me` | Phase 4 |
| 4 | **Tableau de Bord** | Accueil de l'espace connecté (Résumé). | `GET /me/summary` | Phase 4 |
| 5 | **Mon Profil** | Édition du nom, ajout de l'email. | `GET /me`, `PATCH /me` | Phase 4 |
| 6 | **Mes Adresses** | Gestion des lieux de livraison et repères GPS. | `GET /me/addresses`, `POST /me/addresses` | Phase 5 |
| 7 | **Mes Commandes** | Historique global et statuts. | `GET /me/orders` | Phase 5 |
| 8 | **Détail d'une Commande** | Suivi temps réel (statut animé), OTP de livraison. | `GET /me/orders/:id` | Phase 5 |
| 9 | **Mes Factures** | Liste, téléchargement PDF, partage WhatsApp. | `GET /me/invoices` | Phase 6 |
| 10 | **Mes Favoris** | Accès rapide aux points de vente préférés. | `GET /me/favorites`, `POST /me/favorites` | Phase 7 |
| 11 | **Alertes de Stock** | Création et suivi des alertes de retour en stock. | `GET /me/alerts`, `POST /me/alerts` | Phase 7 |
| 12 | **Notifications & Préf.** | Gérer les canaux (SMS, Push) et fréquences. | `PATCH /me/preferences` | Phase 7 |
| 13 | **Avis & Notation** | Laisser un avis après une livraison terminée. | `POST /me/orders/:id/reviews` | Phase 8 |
| 14 | **Aide & Assistant** | Interface de chat avec l'IA et le support. | `POST /ai/chat` | Phase 8 |
| 15 | **Confidentialité & Suppr.** | RGPD, export de données, suppression de compte. | `DELETE /me` | Phase 9 |

## 4. Visiteur Anonyme vs Utilisateur Connecté

| Fonctionnalité | Visiteur Anonyme | Utilisateur Connecté | Rôle de l'Assistant IA |
| :--- | :--- | :--- | :--- |
| Chercher du gaz | Oui (Position manuelle/GPS) | Oui (Utilise adresses sauvées) | Demande la localisation si anonyme. |
| Voir les prix | Oui | Oui | Affiche le prix via l'outil. |
| Poser des questions (FAQ) | Oui | Oui | Répond via KB. |
| Créer une alerte stock | Non (Redirige vers Auth) | Oui | Refuse pour l'anonyme, propose le lien d'inscription. (Décision : L'IA ne crée pas de compte elle-même au MVP). |
| Commander | Non (Force l'Auth au Checkout)| Oui | Explique la procédure. |
| Voir une facture/commande| Non | Oui | Exige d'être connecté. |

## 5. Backlog d'Implémentation (Phases)

*   **Phase 4 (Identité) :** Implémentation de l'authentification OTP (`/auth`), écrans 1, 2, 3, 4, 5.
*   **Phase 5 (Transactionnel de base) :** Écrans 6 (Adresses), 7 (Commandes), 8 (Détail). Modèles Prisma associés.
*   **Phase 6 (Facturation) :** Écran 9. Intégration PDF (ExcelJS/Puppeteer).
*   **Phase 7 (Engagement) :** Écrans 10 (Favoris), 11 (Alertes), 12 (Préférences).
*   **Phase 8 (Feedback & IA) :** Écrans 13 (Avis) et 14 (Assistant connecté).
*   **Phase 9 (Conformité) :** Écran 15 (Suppression, Export de données).

*(Les mises à jour des dépendances et critères d'acceptation seront reportées dans docs/06c et docs/08-tracabilite.md par modification ciblée).*
