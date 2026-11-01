# Matrice Complète de Visibilité & Contrôle d'Accès aux Données (CR-003)

## 1. Contexte & Principes Directeurs
Conformément aux décisions D-11 (Espaces séparés et isolation stricte), D-12 (Authentification WhatsApp obligatoire), D-15 (Gestionnaire de compte sans mutation directe) et D-16/D-17 (Traçabilité totale des flux comptoir et livraison), la visibilité des données est gouvernée par 4 règles fondamentales :

1. **Isolation Stricte par Profil (Comportement 404)** : Tout accès tenté par un utilisateur vers une ressource appartenant à un espace non autorisé retourne un code HTTP `404 Not Found` (et non `403 Forbidden`) pour empêcher toute découverte de surface ou fuite d'existence de tiers.
2. **Cloisonnement PII & Numéros de Téléphone (D-12 / D-05 / D-17)** : Le numéro WhatsApp d'un client n'est jamais divulgué au livreur. Le livreur n'a accès au numéro d'appel vocal (`callPhone`) qu'exclusivement pendant le statut de mission active (`IN_TRANSIT`). Dès la confirmation de livraison, le numéro est ré-anonymisé sur le terminal livreur.
3. **Encadrement Maker-Checker du Gestionnaire (D-15)** : Le gestionnaire de compte (`ACCOUNT_MANAGER`) dispose d'une visibilité en lecture seule sur les profils des usagers dans le cadre d'un dossier `AccountCase` ouvert. Il ne peut modifier aucune donnée directement. Toute modification sensible requiert l'approbation d'un `ADMIN`.
4. **Visibilité Fiscale & Audit Immuable (D-06 / D-16)** : L'administrateur souverain (`SUPER_ADMIN`) et l'auditeur (`AUDITOR`) ont accès à l'intégralité des transactions (ventes en ligne, livraisons, ventes directes au comptoir et écritures du Grand Livre).

---

## 2. Définition des 10 Rôles du Système

| Code Rôle | Intitulé | Espace Dédié | Niveau de Privilège |
|---|---|---|---|
| `ANONYMOUS` | Visiteur public | `/` (Landing publique) | Aucun accès authentifié |
| `CUSTOMER` | Acheteur particulier | `/acheteur` | Utilisateur final standard (Quota 5 btl/30j) |
| `CUSTOMER_PRO` | Acheteur pro (restaurant) | `/acheteur` | Grand compte (Quota étendu) |
| `DISTRIBUTOR_MANAGER`| Gérant de dépôt agréé | `/distributeur` | Gestionnaire boutique, stocks et caisse |
| `DISTRIBUTOR_STAFF`  | Vendeur comptoir boutique | `/distributeur` | Ventes comptoir et encaissement |
| `COURIER` | Livreur certifié | `/livreur` (PWA) | Courses et double confirmation |
| `ACCOUNT_MANAGER` | Gestionnaire de compte | `/staff/cases` | Support délégué sous `AccountCase` |
| `AUDITOR` | Auditeur comptable / conformité | `/staff/audit` | Contrôle et exports fiscaux |
| `ADMIN` | Administrateur opérationnel | `/staff/control-center`| Validation Maker-Checker, gestion réseau |
| `SUPER_ADMIN` | Administrateur souverain | `/staff/control-center`| Contrôle total, configuration système |

---

## 3. Matrice de Visibilité : Données × 10 Rôles

### Légende des Droits :
- **`-` (Aucun)** : Aucun droit de lecture ni d'écriture. Accès rejeté en HTTP 404.
- **`R_OWN`** : Lecture restreinte à ses propres données.
- **`RW_OWN`** : Lecture et modification de ses propres données (selon règles métier).
- **`R_CONTEXT`** : Lecture temporaire limitée au strict contexte opérationnel en cours (ex: commande active).
- **`R_ALL`** : Lecture globale sur tout le système.
- **`RW_MC`** : Modification conditionnelle soumise à validation Maker-Checker.
- **`ADMIN_FULL`** : Accès complet d'administration et configuration.

| Entité / Donnée Sensible | ANONYMOUS | CUSTOMER | CUSTOMER_PRO | DISTRIB_MGR | DISTRIB_STAFF | COURIER | ACCOUNT_MGR | AUDITOR | ADMIN | SUPER_ADMIN |
|---|---|---|---|---|---|---|---|---|---|---|
| **Catalogue & Prix Officiels** | R_ALL | R_ALL | R_ALL | R_ALL | R_ALL | R_ALL | R_ALL | R_ALL | R_ALL | ADMIN_FULL |
| **Stocks Boutiques (Temps Réel)**| - | R_LOCAL | R_LOCAL | RW_OWN | RW_OWN | R_CONTEXT | R_ALL | R_ALL | R_ALL | ADMIN_FULL |
| **Numéro WhatsApp Client (`whatsappPhone`)** | - | RW_OWN | RW_OWN | R_CONTEXT | - | - | R_CASE | - | R_ALL | ADMIN_FULL |
| **Numéro d'Appel Client (`callPhone`)** | - | RW_OWN | RW_OWN | R_CONTEXT | R_CONTEXT | R_MISSION | R_CASE | - | R_ALL | ADMIN_FULL |
| **Adresses & Repères Visuels** | - | RW_OWN | RW_OWN | R_CONTEXT | - | R_MISSION | R_CASE | - | R_ALL | ADMIN_FULL |
| **Jauge & Quota Acheteur (D-14)** | - | R_OWN | R_OWN | R_VERIF | R_VERIF | - | R_CASE | R_ALL | R_ALL | ADMIN_FULL |
| **Commandes B2C en Livraison** | - | R_OWN | R_OWN | RW_OWN | R_OWN | RW_MISSION | R_CASE | R_ALL | R_ALL | ADMIN_FULL |
| **Double Confirmation Livraison (D-17)**| - | RW_OWN | RW_OWN | R_OWN | - | RW_OWN | R_CASE | R_ALL | R_ALL | ADMIN_FULL |
| **Ventes au Comptoir (`CounterSale` D-16)**| - | R_OWN | R_OWN | RW_OWN | RW_OWN | - | R_CASE | R_ALL | R_ALL | ADMIN_FULL |
| **Pièces d'Identité KYC Distributeur** | - | - | - | RW_OWN | - | - | - | R_ALL | R_ALL | ADMIN_FULL |
| **Dossiers d'Assistance (`AccountCase` D-15)**| - | - | - | - | - | - | RW_MC | R_ALL | RW_ALL | ADMIN_FULL |
| **Grand Livre Comptable (`LedgerEntry` D-06)**| - | - | - | R_OWN | - | - | - | R_ALL | R_ALL | ADMIN_FULL |
| **Journaux d'Audit Système (`AuditLog`)** | - | - | - | - | - | - | - | R_ALL | R_ALL | ADMIN_FULL |
| **Annonces & Accusés (`InfoNotice` D-18)**| - | RW_OWN | RW_OWN | RW_OWN | RW_OWN | RW_OWN | RW_OWN | R_ALL | RW_MC | ADMIN_FULL |
| **Tokens & Défis WhatsApp (`VerificationChallenge`)**| - | - | - | - | - | - | - | - | - | - (SYSTÈME SEUL) |

---

## 4. Règles d'Isolation et Cloisonnement Technique

### 4.1. Masquage PII du Livreur (`R_MISSION`)
Le champ `callPhone` et l'adresse de livraison précise sont mis à disposition du livreur via une route API dédiée :
`GET /api/v1/courier/active-mission`
- **Filtre dynamique** : L'API n'injecte les données de contact que si le statut de la course est `ASSIGNED`, `PICKED_UP` ou `IN_TRANSIT`.
- **Révocation instantanée** : Dès que l'un des deux événements de double confirmation (`livreurConfirmedAt` ou `clientConfirmedAt`) est acté, le payload de l'API renvoie immédiatement des données anonymisées :
  ```json
  {
    "clientName": "Marie T. (Livraison achevée)",
    "callPhone": "+237 6** *** *21",
    "status": "DELIVERED"
  }
  ```

### 4.2. Cloisonnement du Gestionnaire de Compte (`R_CASE`)
Le gestionnaire de compte ne dispose d'aucune interface de recherche ouverte dans la base complète des utilisateurs.
- L'accès à une fiche client exige la saisie d'un numéro de dossier `caseId` actif ou la création d'un nouveau dossier avec un numéro de téléphone cible et un motif obligatoire.
- Toutes les actions de consultation sont tracées dans `AuditLog` avec la mention :
  `event: "ACCOUNT_CASE_INSPECTED", agentId: "MGR-07", targetPhone: "+237699123456"`.

### 4.3. Contrôle du Quota Comptoir (`R_VERIF`)
Lors d'une vente au comptoir (`CounterSale`), le distributeur ne voit pas l'historique complet des commandes de l'acheteur. Il reçoit uniquement un retour booléen pré-vente :
```json
{
  "quotaAllowed": true,
  "bottlesAvailableThisMonth": 3,
  "maxAllowed": 5
}
```
En cas de dépassement (`quotaAllowed: false`), l'interface de caisse bloque la vente physique avec le code d'erreur `QUOTA_EXCEEDED` et affiche la date de réouverture de droit.
