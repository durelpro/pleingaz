# Walk-through Phase 1 : Documentation & Cadrage Design CR-003

- **Date d'exécution** : 01 Novembre 2026
- **Auteur** : Antigravity (Pair Programming PLEINGAZ)
- **Statut** : TERMINÉ & VALIDÉ

---

## 1. Objectifs de la Phase 1

1. Spécifier formellement l'authentification par **Preuve Entrante WhatsApp** sans coût SMS sortant (D-12, C-04).
2. Spécifier le **cloisonnement étanche des portails d'accès** ("Règle Aucune Trace", D-11, C-05, C-06).
3. Garantir la **préservation intégrale de l'identité visuelle existante** (D-13, R-02) tout en y intégrant les standards de design modernes (glassmorphism subtil, micro-animations, dark-mode, conformité WCAG AA).
4. Établir la matrice de concordance avec la documentation technique de référence (`docs/02`, `docs/03`, `docs/04`, `docs/06a`).

---

## 2. Livrables et Documents Clés Consolidés

### 2.1 Spécification WhatsApp Inbound ([`docs/14a-auth-whatsapp.md`](file:///home/durel/pleingaz/docs/14a-auth-whatsapp.md))
- **Principe de Preuve Entrante** : L'utilisateur envoie son défi éphémère (`PG-XXXX`) vers le compte WhatsApp officiel de PLEINGAZ. Zéro coût sortant pour la plateforme (bénéficie de la fenêtre de 24h et des 1000 conversations de service gratuites par mois de Meta).
- **Règle des Deux Numéros Obligatoires (D-12.3)** :
  1. Numéro principal WhatsApp (`phone`) : vérifié cryptographiquement par webhook HMAC.
  2. Numéro secondaire de secours (`backupPhone` / `callPhone`) : obligatoire dès l'inscription, non identique au premier, contrôlé syntaxiquement et interdit d'usage comme compte tiers actif.
- **Canaux Polymorphiques (`VerificationChannel`)** :
  - `WhatsAppInboundChannel` (Production - Meta Cloud API).
  - `SimulatedChannel` (Développement, tests CI, route de secours `/api/v1/test/verify-challenge`).
  - `ManualAssistedChannel` (Gestionnaire de compte `ACCOUNT_MANAGER` avec validation `ADMIN`).

### 2.2 Espaces Séparés et Isolation Étanche ([`docs/14b-espaces-et-isolation.md`](file:///home/durel/pleingaz/docs/14b-espaces-et-isolation.md))
- **Un numéro = Un seul portail opérationnel (D-11.3)**.
- **Abolition formelle du switch de profil (D-11.5)** : L'espace Acheteur ne contient aucun composant menant aux rôles livreur ou distributeur.
- **Réponse API 404 systématique** : Tout appel hors audience de jeton (`aud`) reçoit une erreur HTTP 404 Not Found (et jamais 403) pour empêcher la reconnaissance d'adresses API.
- **Protection du Portail Staff** : URL d'accès dynamique non référencée (`<STAFF_PORTAL_ROUTE>`), absente du sitemap et de robots.txt, avec double facteur TOTP obligatoire.

### 2.3 Préservation de l'Identité Visuelle & Checklist Design ([`docs/design/checklist-ui-cr003.md`](file:///home/durel/pleingaz/docs/design/checklist-ui-cr003.md))
- Conservation stricte des couleurs de marque : Rouge `#FF0000` / `#DC2626`, Jaune flamme `#FFB000`, surfaces reposantes `#F9FAFB` / `#FFFFFF`.
- Typographie officielle : `Montserrat` en hiérarchies claires.
- Ergonomie adaptée aux terminaux mobiles locaux (cibles tactiles de 48px minimum, poids de page plume < 50 Ko).
- Finitions haut de gamme : Glassmorphism subtil (`backdrop-filter: blur(8px)`), micro-interactions au toucher (`transform: scale(0.98)`), transitions douces et dark mode contrasté WCAG AA.

---

## 3. Matrice de Concordance

| Document | Section Impactée | Nature de la Règle CR-003 |
|---|---|---|
| [`docs/02-cadrage-ux-roles.md`](file:///home/durel/pleingaz/docs/02-cadrage-ux-roles.md) | Section 1 (Sitemap et Accès) | Cloisonnement strict des 4 portails, sitemap épuré, isolation "Aucune Trace". |
| [`docs/04-architecture-technique.md`](file:///home/durel/pleingaz/docs/04-architecture-technique.md) | Section 1 & 4 (Architecture, API & Auth) | Intégration de `VerificationChannel` et des webhooks WhatsApp Cloud API. |
| [`docs/06a-securite.md`](file:///home/durel/pleingaz/docs/06a-securite.md) | Section 1 & 2 (Menaces, Auth & Sessions) | Menaces M23 à M25 (anti-spoofing WhatsApp, 404 inter-espaces, isolation des jetons). |
| [`docs/design/design-system.md`](file:///home/durel/pleingaz/docs/design/design-system.md) | Sections 2, 3 & 5 | Intégration des composants Jauge Quota (D-14), Double Confirmation (D-17) et boutons WhatsApp (D-12). |

---

## 4. Prochaine Étape

Passage à la **Phase 2 : Backend d'Authentification & Stratégies JWT** :
- Sécurisation du `JWT_SECRET` obligatoire au démarrage (fail-fast).
- Vérification du champ obligatoire `secondaryPhone` / `callPhone`.
- Service de validation du défi WhatsApp (`VerificationChallenge`).
- Tests unitaires et intégration NestJS.
