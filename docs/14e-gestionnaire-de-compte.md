# 14e. Spécification du Profil "Gestionnaire de Compte" (ACCOUNT_MANAGER)

- **Statut** : VALIDÉ (CR-003 D-15, C-07)
- **Portée** : Rôle d'assistance aux comptes, entité `AccountCase`, règles strictes d'interdiction de modification directe et principe des deux personnes.
- **Phase cible** : MVP (Phase 2 révisée).

---

## 1. Mission et Périmètre du Rôle `ACCOUNT_MANAGER`

Le rôle **`ACCOUNT_MANAGER`** est créé pour assister les utilisateurs (Acheteurs, Distributeurs, Livreurs) confrontés à des problèmes d'accès, de compte bloqué ou de numéro perdu, **SANS disposer du pouvoir de modifier directement le contenu de leurs comptes** :

1. **Séparation Stricte des Tâches (D-15.4)** :
   - `SUPPORT_AGENT` : Traite les réclamations opérationnelles quotidiennes (orientation, suivi des commandes, litiges de livraison).
   - `DISTRIBUTOR_MANAGER` : Supervise le réseau de points de vente (instruction des dossiers KYC 3 pièces, agréments, gestion des contrats).
   - `ACCOUNT_MANAGER` : Résout les blocages de sécurité et d'identité des utilisateurs, sous le contrôle exclusif de dossiers d'intervention audités.

2. **Règle Fondamentale : Zéro Mutation Directe & Zéro Usurpation (C-07)** :
   - **Interdiction absolue d'impersonation** : La fonctionnalité « Se connecter en tant que » ou « Voir comme » est **strictement bannie** du système pour garantir l'opposabilité juridique des actions de l'utilisateur.
   - **Interdiction de modification directe** : Le gestionnaire ne peut modifier aucun champ d'identité (nom, prénom, adresse, mot de passe, numéros de téléphone).
   - **Principe des deux personnes (Dual-Control)** : Tout changement sensible (notamment le remplacement d'un numéro de téléphone principal suite à une perte de SIM) prend la forme d'une **Demande formelle préparée** par le gestionnaire dans un dossier, qui doit être **approuvée par un rôle distinct (`ADMIN` ou `SUPER_ADMIN`)**.

---

## 2. Matrice Exhaustive des Permissions du Gestionnaire de Compte (C-07)

| Action Opérationnelle | Statut | Condition Requise | Journalisation `AuditLog` |
|---|:---:|---|:---:|
| **Consulter l'état d'un compte** | **AUTORISÉ** | Dossier `AccountCase` ouvert | OUI (`account:view_status`) |
| **Consulter un profil masqué** (`+237 6** ** ** 12`) | **AUTORISÉ** | Dossier `AccountCase` ouvert | OUI (`account:view_masked`) |
| **Révéler le numéro complet pour contre-appel** | **AUTORISÉ** | Motif obligatoire saisi (ex: appel d'urgence) | OUI synchrone (`account:unmask_phone`) |
| **Consulter l'historique des connexions et échecs** | **AUTORISÉ** | Dossier `AccountCase` ouvert | OUI (`account:view_login_history`) |
| **Lever un verrouillage temporaire (Lockout)** | **AUTORISÉ** | Identité vérifiée via contre-appel sur `backupPhone` | OUI (`account:unlock`) |
| **Déconnecter à distance toutes les sessions** | **AUTORISÉ** | Suspicion de compromission déclarée par le client | OUI (`account:revoke_sessions`) |
| **Relancer le parcours de vérification WhatsApp** | **AUTORISÉ** | L'utilisateur reçoit le défi sur son WhatsApp ; le gestionnaire ne voit ni ne choisit aucun code | OUI (`account:trigger_recovery`) |
| **Préparer une demande de changement de numéro** | **AUTORISÉ** | Dossier instruit avec pièces justificatives | OUI (`account:prepare_phone_change`) |
| **Envoyer un message de dossier au compte** | **AUTORISÉ** | Contexte strict du dossier `AccountCase` | OUI (`account_case:message_send`) |
| **Modifier le nom, prénom ou quartier d'un compte** | **INTERDIT** | L'utilisateur modifie ses données lui-même dans son espace | Rejet HTTP 403 (`ForbiddenException`) |
| **Modifier directement le numéro de téléphone** | **INTERDIT** | Exige la validation formelle d'un `ADMIN` | Rejet HTTP 403 |
| **Consulter ou réinitialiser le mot de passe** | **INTERDIT** | Le gestionnaire n'a aucun accès au secret | Rejet HTTP 403 |
| **Se connecter au compte ("Voir comme")** | **INTERDIT** | Impersonation bannie de l'architecture | Rejet HTTP 403 |
| **Consulter les pièces d'identité KYC privées** | **INTERDIT** | Réservé à `DISTRIBUTOR_MANAGER` et `ADMIN` | Rejet HTTP 403 |
| **Consulter les soldes financiers ou comptes du Grand Livre**| **INTERDIT**| Réservé à `FINANCE_MANAGER` et `ADMIN` | Rejet HTTP 403 |

---

## 3. Cycle de Vie d'un Dossier d'Assistance (`AccountCase`)

Toute interaction du gestionnaire de compte avec les données d'un utilisateur exige l'ouverture préalable d'un dossier `AccountCase`. **Aucune action technique n'est possible hors dossier**.

```
+---------------------------------------------------------------------------------+
|  DOSSIER D'ASSISTANCE #CASE-8491                                                |
|  Utilisateur : Paul K. (Compte Acheteur #PG-8492)                               |
|  Statut : [EN COURS D'INSTRUCTION]                 Gestionnaire : Marc T.       |
|  Motif : [PERTE DE CARTE SIM - DEMANDE DE NOUVEAU NUMÉRO]                       |
+---------------------------------------------------------------------------------+
|  VÉRIFICATIONS RÉALISÉES :                                                      |
|  [x] Contre-appel vocal effectué sur le numéro de secours (+237 670 12 34 56)    |
|  [x] Réponses aux questions de sécurité conformes (Dernière commande à Akwa)   |
|  [ ] Approbation administrative requise pour le nouveau numéro (+237 699 88 77 66)|
+---------------------------------------------------------------------------------+
|  ACTIONS POSSIBLES :                                                            |
|  [Lever verrouillage]  [Déconnecter sessions]  [Soumettre à l'Admin]            |
+---------------------------------------------------------------------------------+
```

### Jalons du dossier :
1. `OPEN` : Création du dossier suite à sollicitation de l'utilisateur (motif obligatoire, ex: perte de téléphone, blocage mot de passe).
2. `INVESTIGATING` : Le gestionnaire examine les métadonnées de connexion, procède au contre-appel téléphonique sur le numéro de secours (`backupPhone`).
3. `PENDING_ADMIN_APPROVAL` : En cas de changement de numéro principal, le gestionnaire soumet la demande avec note explicative interne.
4. `APPROVED_BY_ADMIN` : Un `ADMIN` distinct revoit la demande et l'approuve formellement.
5. `RESOLVED` : Le nouveau numéro est mis à jour dans le système, le compte est déverrouillé, et le délai de sécurité de 48 heures (`phone_change_cooldown_hours`) s'enclenche.
6. `CLOSED_UNRESOLVED` : Si l'identité n'a pas pu être prouvée avec certitude.

---

## 4. Indicateurs Opérationnels dans le Control Center (D-15.3)

Le tableau de bord d'administration affiche en continu les métriques de performance et de sécurité des dossiers d'assistance, calculées sur données 100% réelles :
- **Délai moyen de résolution des dossiers** (SLA cible < 2 heures).
- **Nombre de dossiers ouverts et en attente d'approbation `ADMIN`**.
- **Taux de réouverture de dossiers** (indicateur de qualité de service).
- **Détection des anomalies de sécurité** : Alertes automatiques en cas de demandes multiples de changement de numéro sur une même zone ou par un même gestionnaire.

---

## 5. Endpoints du Gestionnaire de Compte (`/api/v1/account-cases/*`)

| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| `POST` | `/api/v1/account-cases` | `ACCOUNT_MANAGER` | Création d'un dossier avec motif obligatoire. |
| `GET` | `/api/v1/account-cases` | `ACCOUNT_MANAGER`, `ADMIN` | Liste des dossiers ouverts et filtres par statut. |
| `GET` | `/api/v1/account-cases/:id` | `ACCOUNT_MANAGER`, `ADMIN` | Consultation du dossier et historique des notes. |
| `POST` | `/api/v1/account-cases/:id/unmask-phone` | `ACCOUNT_MANAGER` | Démasquage temporaire du numéro complet avec motif auditée. |
| `POST` | `/api/v1/account-cases/:id/unlock-account` | `ACCOUNT_MANAGER` | Levée du verrouillage temporaire de l'utilisateur. |
| `POST` | `/api/v1/account-cases/:id/revoke-sessions`| `ACCOUNT_MANAGER` | Révocation forcée des sessions de l'utilisateur. |
| `POST` | `/api/v1/account-cases/:id/prepare-phone-change`| `ACCOUNT_MANAGER` | Soumission d'une demande de nouveau numéro à l'administration. |
| `POST` | `/api/v1/account-cases/:id/admin-approve-phone` | `ADMIN`, `SUPER_ADMIN` | Approbation formelle du nouveau numéro (principe des deux personnes). |
| `POST` | `/api/v1/account-cases/:id/close` | `ACCOUNT_MANAGER` | Clôture finale du dossier. |
