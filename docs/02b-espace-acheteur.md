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
2.  **Vérification OTP :** Un code à 4/6 chiffres est envoyé par SMS/WhatsApp. L'assistant IA n'envoie pas de code et ne crée pas de compte de manière autonome pour le MVP ; il redirige l'utilisateur vers ce formulaire.
3.  **Complétion du Profil (Minimal) :** Nom, Prénom, Ville, Quartier, Repère (facultatif).
4.  **Consentements :** Acceptation des CGU et politique de confidentialité.
5.  **Fin :** Redirection vers l'accueil ou le checkout.

### 2.2. Gap Analysis : Mot de Passe vs OTP
*   **Vision (docs/00-sources/02-vision-prompt.md, section 5) :** Demande une connexion par Email et Mot de passe.
*   **Réalité du marché cible :** L'authentification par email/mot de passe a un très fort taux d'abandon en Afrique francophone. Le numéro de téléphone est l'identifiant universel.
*   **DÉCISION DU PROPRIÉTAIRE (cf. docs/08-tracabilite.md) :** Remplacer le mot de passe par un OTP SMS/WhatsApp associé au numéro de téléphone. L'email devient une donnée de récupération / facturation facultative.

### 2.3. Règles et Sécurité
*   **Création au Checkout :** Un compte peut être créé "à la volée" lors de la première commande.
*   **Profils Partagés :** Un même numéro peut techniquement commander pour plusieurs adresses.
*   **Mode faible connexion :** Les formulaires sont mis en cache (PWA) et resoumis lorsque la connexion revient.
*   **Protection OTP :** Maximum 3 demandes d'OTP toutes les 15 minutes. Messages d'erreur très simples (ex: "Code incorrect, veuillez réessayer").
*   **Accessibilité :** Fort contraste, navigation clavier/screen reader supportée.
*   **Suppression :** Renvoie aux règles du doc 07.

## 3. Les 15 Écrans de l'Espace Acheteur

| N° | Écran | Objectif | Données (Entité.Champ) | Actions Possibles | États | Endpoints | Événements d'Audit | Phase |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| 1 | **Connexion** | Saisie Numéro | `User.phone` | Valider | Vide, Erreur Tel | `POST /auth/otp/request` | `AUTH_ATTEMPT` | Ph4 |
| 2 | **Vérification** | Saisie OTP | N/A | Valider, Renvoyer | Vide, Code Faux | `POST /auth/otp/verify` | `AUTH_SUCCESS` / `FAIL` | Ph4 |
| 3 | **Création Profil** | Profil Minimal | `User.firstName, User.city` | Sauvegarder | Erreur validation | `POST /me` | `PROFILE_CREATED` | Ph4 |
| 4 | **Dashboard** | Accueil Connecté | `Order (last), Alert (count)` | Naviguer | Vide (0 commande) | `GET /me/summary` | `DASHBOARD_VIEW` | Ph4 |
| 5 | **Mon Profil** | Édition Infos | `User.email, User.firstName` | Modifier, Sauver | Succès, Erreur API | `GET /me`, `PATCH /me` | `PROFILE_UPDATED` | Ph4 |
| 6 | **Mes Adresses** | Gestion Lieux | `Address.label, Address.gps` | Ajouter, Supprimer | Vide, Géoloc off | `GET /me/addresses`, `POST` | `ADDRESS_ADDED` | Ph5 |
| 7 | **Mes Commandes**| Historique | `Order.status, Order.total` | Filtrer, Cliquer | Vide | `GET /me/orders` | `ORDERS_LIST_VIEW` | Ph5 |
| 8 | **Détail Cmd** | Suivi Temps Réel | `Order.driver, Order.status` | Annuler (si permis)| Erreur chargement | `GET /me/orders/:id` | `ORDER_DETAIL_VIEW` | Ph5 |
| 9 | **Mes Factures** | Liste / PDF | `Invoice.pdfUrl, Invoice.total` | Télécharger, Partager| Vide | `GET /me/invoices` | `INVOICE_DOWNLOADED` | Ph6 |
| 10| **Mes Favoris** | Boutiques Préférées| `Store.name, Store.status` | Supprimer, Commander| Vide, Hors Ligne | `GET /me/favorites`, `POST`| `FAVORITE_ADDED` | Ph7 |
| 11| **Alertes Stock**| Alertes Actives | `Alert.product, Alert.status` | Créer, Supprimer | Vide | `GET /me/alerts`, `POST` | `ALERT_CREATED` | Ph7 |
| 12| **Notifications**| Préférences Canaux| `UserPreference.smsEnabled` | Activer/Désactiver| Sauvegarde en cours | `PATCH /me/preferences` | `PREFS_UPDATED` | Ph7 |
| 13| **Avis & Note** | Feedback Livraison | `Review.rating, Review.comment`| Noter 1-5 étoiles | Déjà noté | `POST /me/orders/:id/reviews`| `REVIEW_SUBMITTED` | Ph8 |
| 14| **Aide & IA** | Chat Support | `AiChatSession.history` | Envoyer Message | Connexion Perdue | `POST /ai/chat` | `CHAT_INITIATED` | Ph8 |
| 15| **Confidentialité**| Export/Suppression | `User.id` | Exporter, Supprimer | Confirmation requise | `DELETE /me` | `ACCOUNT_DELETED` | Ph9 |

## 4. Visiteur Anonyme vs Utilisateur Connecté

| Fonctionnalité | Visiteur Anonyme | Utilisateur Connecté | Rôle de l'Assistant IA |
| :--- | :--- | :--- | :--- |
| Chercher du gaz | Oui (Position manuelle/GPS) | Oui (Utilise adresses sauvées) | Demande la localisation si anonyme. |
| Voir les prix | Oui | Oui | Affiche le prix via l'outil `get_product_price`. |
| Poser des questions | Oui (FAQ) | Oui (FAQ + Perso) | Répond via `search_knowledge`. |
| Créer une alerte | Non (Redirige vers Auth) | Oui | Refuse pour l'anonyme, donne le lien d'inscription. |
| Commander | Non (Force l'Auth au Checkout)| Oui | Explique la procédure. Ne valide pas la commande lui-même. |
| Voir une facture | Non | Oui | Exige d'être connecté via `get_invoice`. |

## 5. Backlog d'Implémentation et Dépendances (Cohérent avec 06c)

*   **Phase 4 (Identité) :** Implémentation OTP (`/auth`), écrans 1 à 5.
    *   *Critères d'acceptation :* Onboarding fonctionnel, pas de crash si pas de réseau.
    *   *Dépendances :* API Twilio/Infobip validée.
*   **Phase 5 (Transactionnel de base) :** Écrans 6, 7, 8 (Commandes, Adresses).
    *   *Critères d'acceptation :* Statut de commande en temps réel.
*   **Phase 6 (Facturation) :** Écran 9.
    *   *Dépendances :* ExcelJS/Puppeteer installés sur le serveur.
*   **Phase 7 (Engagement) :** Écrans 10, 11, 12 (Alertes, Favoris).
    *   *Dépendances :* CRON jobs BullMQ opérationnels.
*   **Phase 8 (Feedback & IA) :** Écrans 13, 14.
    *   *Critères :* Zéro hallucination sur le RAG.
*   **Phase 9 (Conformité) :** Écran 15.
    *   *Critères :* Purge RGPD effective en BDD.
