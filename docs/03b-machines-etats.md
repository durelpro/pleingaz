# Machines à États

## 1. DistributorApplication (Dossier de candidature)
```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> UNDER_REVIEW
    UNDER_REVIEW --> APPROVED
    UNDER_REVIEW --> REJECTED
    REJECTED --> PENDING
    APPROVED --> [*]
```
- **Autorisées** :
  - `PENDING` -> `UNDER_REVIEW` (Staff prend en charge, AuditLog OUI).
  - `UNDER_REVIEW` -> `APPROVED` (Staff valide KYC, AuditLog OUI).
  - `UNDER_REVIEW` -> `REJECTED` (Staff refuse avec motif, AuditLog OUI).
  - `REJECTED` -> `PENDING` (Distributeur resoumet, AuditLog OUI).
- **Interdites** : Passer directement de `PENDING` à `APPROVED` ; Revenir de `APPROVED` à `PENDING`.

## 2. Cycle de vie Distributeur (DistributorProfile)
```mermaid
stateDiagram-v2
    [*] --> APPROVED
    APPROVED --> SUSPENDED
    SUSPENDED --> APPROVED
```
- **Autorisées** :
  - `APPROVED` -> `SUSPENDED` (Admin bannit, AuditLog OUI, motif obligatoire).
  - `SUSPENDED` -> `APPROVED` (Admin réactive, AuditLog OUI).
- **Interdites** : Supprimer le profil si des commandes existent.

## 3. Order (Commande Client)
```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> SUBMITTED
    DRAFT --> CANCELLED
    SUBMITTED --> CONFIRMED
    SUBMITTED --> CANCELLED
    CONFIRMED --> PREPARING
    CONFIRMED --> CANCELLED
    PREPARING --> SHIPPED
    PREPARING --> DELIVERED
    SHIPPED --> DELIVERED
    SHIPPED --> CANCELLED
    DELIVERED --> [*]
    CANCELLED --> [*]
```
- **Autorisées** :
  - `DRAFT` -> `SUBMITTED` (Client valide, AuditLog NON).
  - `SUBMITTED` -> `CONFIRMED` (Distributeur accepte, AuditLog OUI).
  - `CONFIRMED` -> `PREPARING` (Distributeur prépare, AuditLog NON).
  - `PREPARING` -> `SHIPPED` (Remis au livreur, AuditLog NON).
  - `SHIPPED` -> `DELIVERED` (Code de remise fourni, AuditLog OUI).
- **Interdites** : Passer de `DRAFT` à `CONFIRMED` ; Revenir de `DELIVERED` à `DRAFT`.

## 4. DistributorOrder (Commande du distributeur vers grossiste)
```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> SUBMITTED
    SUBMITTED --> CONFIRMED
    CONFIRMED --> PREPARING
    PREPARING --> SHIPPED
    SHIPPED --> DELIVERED
    SHIPPED --> CANCELLED
    DELIVERED --> [*]
    CANCELLED --> [*]
```
- **Autorisées** : `DRAFT` -> `SUBMITTED` (Distributeur soumet) -> `CONFIRMED` (Fournisseur accepte).
- **Interdites** : Mêmes règles que `Order`.

## 5. Payment
```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> PROCESSING
    PENDING --> CANCELLED
    PENDING --> EXPIRED
    PROCESSING --> SUCCESS
    PROCESSING --> FAILED
    SUCCESS --> REFUND_REQUESTED
    REFUND_REQUESTED --> PARTIAL_REFUNDED
    REFUND_REQUESTED --> FULL_REFUNDED
    FAILED --> [*]
    CANCELLED --> [*]
    EXPIRED --> LATE_SUCCESS
    LATE_SUCCESS --> REFUND_REQUESTED
    LATE_SUCCESS --> CONVERTED_TO_ORDER
    LATE_SUCCESS --> MANUAL_REVIEW
```
- **Autorisées** :
  - `PENDING` -> `EXPIRED` (Timeout du gateway).
  - `EXPIRED` -> `LATE_SUCCESS` (Paiement réussi APRÈS annulation commande).
  - `LATE_SUCCESS` -> `REFUND_REQUESTED` (Comportement automatique par défaut, initie un remboursement).
  - `LATE_SUCCESS` -> `CONVERTED_TO_ORDER` (Si stock dispo et client confirme).
  - `LATE_SUCCESS` -> `MANUAL_REVIEW` (En cas d'échec du remboursement auto).
- **Gestion du Late Success** : Si un webhook annonce un succès sur un paiement `EXPIRED` ou lié à une commande `CANCELLED`, le paiement passe en `LATE_SUCCESS`. 
  - **Défaut** : Le système déclenche automatiquement un remboursement total vers le moyen de paiement d'origine, notifiant le client. 
  - **Exception** : Le support peut convertir ce paiement en une nouvelle commande si le client accepte et que le stock est disponible. 
  - *(Note : L'option d'un "Wallet interne" pour stocker ce crédit est hors MVP et À CONFIRMER car elle implique un avis juridique strict sur la valeur stockée).*
- **Interdites** : L'utilisateur ne déclenche JAMAIS le passage à `SUCCESS` ; relancer un `FAILED` est interdit (nouveau Payment).

## 6. Invoice
```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> ISSUED
    ISSUED --> PAID
    ISSUED --> CANCELLED_BY_CREDIT_NOTE
    PAID --> [*]
    CANCELLED_BY_CREDIT_NOTE --> [*]
```
- **Autorisées** :
  - `DRAFT` -> `ISSUED` (Facture générée et immuable, AuditLog NON).
  - `ISSUED` -> `PAID` (Paiement confirmé).
  - `ISSUED` -> `CANCELLED_BY_CREDIT_NOTE` (Génère un Avoir, AuditLog OUI).
- **Interdites** : Modifier une facture `ISSUED` ; Supprimer une facture.

## 7. Delivery (Processus de livraison & Double Confirmation D-17)
```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> ASSIGNED
    PENDING --> CANCELLED
    ASSIGNED --> PICKED_UP
    ASSIGNED --> CANCELLED
    PICKED_UP --> IN_TRANSIT
    IN_TRANSIT --> DELIVERED_PENDING_CONFIRMATION : Livreur clique "J'ai livré"
    IN_TRANSIT --> FAILED : Incident de livraison
    DELIVERED_PENDING_CONFIRMATION --> DELIVERED : Client confirme "J'ai reçu"
    DELIVERED_PENDING_CONFIRMATION --> CONFIRMED_BY_COURIER_ONLY : Timeout 2h sans litige client
    DELIVERED_PENDING_CONFIRMATION --> DISPUTED : Client signale "Rien reçu"
    DELIVERED --> [*]
    CONFIRMED_BY_COURIER_ONLY --> [*]
    DISPUTED --> FAILED : Litige confirmé
    FAILED --> [*]
    CANCELLED --> [*]
```
- **Autorisées** :
  - `PENDING` -> `ASSIGNED` (Attribution manuelle/assistée à un livreur via `DeliveryAssignment`).
  - `ASSIGNED` -> `PICKED_UP` (Livreur confirme le retrait de la marchandise chez le distributeur).
  - `PICKED_UP` -> `IN_TRANSIT` (Livreur prend la route vers l'adresse client).
  - `IN_TRANSIT` -> `DELIVERED_PENDING_CONFIRMATION` (Livreur clique sur "J'ai livré" avec horodatage `courierConfirmedAt` - D-17).
  - `DELIVERED_PENDING_CONFIRMATION` -> `DELIVERED` (Acheteur confirme la bonne réception dans son espace client).
  - `DELIVERED_PENDING_CONFIRMATION` -> `CONFIRMED_BY_COURIER_ONLY` (Expiration du délai de 2h sans contestation du client - validation automatique).
  - `DELIVERED_PENDING_CONFIRMATION` -> `DISPUTED` (Acheteur clique sur "Je n'ai rien reçu" - ouverture immédiate d'un ticket d'incident).
  - `IN_TRANSIT` -> `FAILED` (Échec de livraison motivé avec motif parmi enum fermée).
  - `ASSIGNED` / `PENDING` -> `CANCELLED` (Annulation client/support avant prise en charge).
- **Interdites** :
  - Passer directement de `IN_TRANSIT` à `DELIVERED` sans passer par le premier palier de confirmation du livreur (`DELIVERED_PENDING_CONFIRMATION`).
  - Forcer la clôture d'une livraison contestée sans instruction du dossier par le support logistique.

## 8. StockReservation
```mermaid
stateDiagram-v2
    [*] --> RESERVED
    RESERVED --> CONFIRMED
    RESERVED --> EXPIRED
    RESERVED --> CANCELLED
    CONFIRMED --> [*]
    EXPIRED --> [*]
    CANCELLED --> [*]
```
- **Autorisées** : `RESERVED` -> `EXPIRED` (Cron job ou timeout de 15m/30m).
- **Interdites** : Modifier les quantités pendant `RESERVED` ; Réactiver une réservation `EXPIRED`.

## 9. Settlement / Payout
```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> PROCESSING
    PROCESSING --> COMPLETED
    PROCESSING --> FAILED
    COMPLETED --> [*]
    FAILED --> [*]
```
- **Autorisées** : Batch nocturne traite `PENDING` -> `COMPLETED`.
- **Interdites** : Recréer un règlement `COMPLETED`.

## 10. Refund
```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> PROCESSING
    PROCESSING --> COMPLETED
    PROCESSING --> FAILED
    COMPLETED --> [*]
    FAILED --> [*]
```
- **Autorisées** : `PROCESSING` -> `COMPLETED` (Webhook acquéreur).
- **Interdites** : Lancer un `Refund` si solde Payment insuffisant.

## 11. Courier (Cycle de vie du Livreur — CR-001 D-05)
```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> APPROVED
    PENDING --> REJECTED
    APPROVED --> SUSPENDED
    SUSPENDED --> APPROVED
    APPROVED --> INACTIVE
    INACTIVE --> APPROVED
```
- **Autorisées** :
  - `PENDING` -> `APPROVED` (Validation du livreur par l'administrateur après vérification d'identité et véhicule).
  - `PENDING` -> `REJECTED` (Rejet motivé de la candidature — défaut de conception appliqué, à confirmer par le propriétaire).
  - `APPROVED` -> `SUSPENDED` (Suspension manuelle par le staff ou automatique si plafond de caisse espèces dépassé, AuditLog OUI).
  - `SUSPENDED` -> `APPROVED` (Réactivation après régularisation de la caisse ou levée de sanction).
  - `APPROVED` -> `INACTIVE` (Désactivation à la demande du livreur ou inactivité prolongée).
- **Interdites** :
  - Affecter une course à un livreur dont le statut n'est pas strictement `APPROVED`.

## 12. DeliveryAssignment (Affectation de course — CR-001 D-05)
```mermaid
stateDiagram-v2
    [*] --> PROPOSED
    PROPOSED --> ACCEPTED
    PROPOSED --> REJECTED
    PROPOSED --> EXPIRED
```
- **Autorisées** :
  - `PROPOSED` -> `ACCEPTED` (Livreur accepte la course dans le délai imparti, la livraison passe à `ASSIGNED`).
  - `PROPOSED` -> `REJECTED` (Livreur décline explicitement la course ; réattribution par le dispatcheur).
  - `PROPOSED` -> `EXPIRED` (Timeout atteint sans réponse, délai configurable dans `Setting`, réattribution automatique).
- **Interdites** :
  - Accepter une proposition passée en `EXPIRED` ou `REJECTED`.

## 13. PayoutBatch (Lots de reversement Maker-Checker — CR-001 D-06)
```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> SUBMITTED
    SUBMITTED --> APPROVED
    SUBMITTED --> REJECTED
    APPROVED --> EXECUTED
    SUBMITTED --> CANCELLED
    APPROVED --> CANCELLED
```
- **Autorisées** :
  - `DRAFT` -> `SUBMITTED` (`FINANCE_MANAGER` prépare et soumet le lot de reversements consolidé).
  - `SUBMITTED` -> `APPROVED` (`ADMIN` ou `SUPER_ADMIN` approuve le lot avec TOTP — Maker-Checker strict).
  - `SUBMITTED` -> `REJECTED` (`ADMIN` rejette avec motif de correction).
  - `APPROVED` -> `EXECUTED` (Saisie de la référence de transaction bancaire/MoMo et upload de la preuve d'exécution).
- **Interdites** :
  - Approbation par la même personne que le créateur du lot (Maker-Checker invariant).
  - Exécution directe d'un lot sans approbation préalable `APPROVED`.
  - Modification du montant ou des lignes d'un lot une fois `SUBMITTED`.

## 14. CashCollection (Suivi caisse espèces à la livraison — CR-001 D-05, D-06)
```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> COLLECTED
    COLLECTED --> REMITTED_TO_PLEINGAZ
    COLLECTED --> DISPUTED
    DISPUTED --> REMITTED_TO_PLEINGAZ
```
- **Autorisées** :
  - `PENDING` -> `COLLECTED` (Livreur confirme l'encaissement des espèces lors de la saisie du code de livraison).
  - `COLLECTED` -> `REMITTED_TO_PLEINGAZ` (Reversement des espèces à PLEINGAZ validé par le responsable financier).
  - `COLLECTED` -> `DISPUTED` (Divergence de montant constatée lors du versement).
- **Règle de blocage automatique** :
  - Si le solde total `COLLECTED` non encore reversé d'un livreur dépasse le plafond configuré dans `Setting` (défaut appliqué, à confirmer : exemple illustratif 50 000 FCFA), le livreur est automatiquement bloqué pour de nouvelles affectations jusqu'à régularisation.

## 15. VerificationLevel (Échelonnement de vérification — CR-002 D-07)
```mermaid
stateDiagram-v2
    [*] --> LISTED: Import Google My Maps approuvé
    LISTED --> DOCUMENTS_VERIFIED: 3 pièces KYC validées
    DOCUMENTS_VERIFIED --> LOCATION_CONFIRMED: Marqueur GPS confirmé in-situ
    LOCATION_CONFIRMED --> FULLY_VERIFIED: Attribution officielle badge vérifié
```
- **Autorisées** :
  - `LISTED` -> `DOCUMENTS_VERIFIED` (Validation des 3 pièces KYC par l'administrateur).
  - `DOCUMENTS_VERIFIED` -> `LOCATION_CONFIRMED` (Confirmation géodésique sur le terrain).
  - `LOCATION_CONFIRMED` -> `FULLY_VERIFIED` (Approbation souveraine par Super-Admin).
- **Interdites** :
  - Saut direct de `LISTED` à `FULLY_VERIFIED` sans validation des étapes intermédiaires.
  - Attribution du badge "Distributeur PLEINGAZ vérifié" avant le niveau `FULLY_VERIFIED`.

## 16. ClaimStatus (Réclamation de boutique — CR-002 D-09)
```mermaid
stateDiagram-v2
    [*] --> UNCLAIMED: Point importé sans compte
    UNCLAIMED --> INVITED: Lien WhatsApp click-to-chat préparé
    UNCLAIMED --> CLAIM_PENDING_REVIEW: Authentification OTP distributeur
    INVITED --> CLAIM_PENDING_REVIEW: Authentification OTP distributeur
    CLAIM_PENDING_REVIEW --> CLAIMED: Approbation administrateur anti-SIM swap
    CLAIM_PENDING_REVIEW --> CLAIM_REJECTED: Rejet administrateur avec motif
```
- **Autorisées** :
  - `UNCLAIMED` / `INVITED` -> `CLAIM_PENDING_REVIEW` (Distributeur vérifie son numéro par OTP).
  - `CLAIM_PENDING_REVIEW` -> `CLAIMED` (Rattachement effectif validé par l'admin, rôle `DISTRIBUTOR` accordé).
  - `CLAIM_PENDING_REVIEW` -> `CLAIM_REJECTED` (Rejet motivé dans `AuditLog`).
- **Interdites** :
  - Rattachement automatique sans validation administrative humaine préalable.

## 17. ImportBatch (Lots d'importation réseau — CR-002 D-10)
```mermaid
stateDiagram-v2
    [*] --> DRY_RUN: Simulation & contrôle doublons
    DRY_RUN --> APPROVED: Approbation admin (TOTP + case accord)
    APPROVED --> APPLIED: Écriture transactionnelle Store
    APPROVED --> ROLLED_BACK: Annulation avant application
    APPLIED --> ROLLED_BACK: Dépublication transactionnelle
    DRY_RUN --> FAILED: Erreur structurelle fichier
```
- **Autorisées** :
  - `DRY_RUN` -> `APPROVED` (Approbation formelle avec code TOTP et référence d'accord PLEINGAZ).
  - `APPROVED` -> `APPLIED` (Injection des boutiques et mise en ligne contrôlée).
  - `APPLIED` -> `ROLLED_BACK` (Dépublication intégrale du lot).
- **Interdites** :
  - Passage à `APPLIED` sans statut `APPROVED`.
  - Application d'un lot dont la case formelle d'attestation d'accord écrit PLEINGAZ est manquante.

## 18. VerificationChallenge (Preuve Entrante WhatsApp — CR-003 D-12, C-04)
```mermaid
stateDiagram-v2
    [*] --> PENDING_INBOUND
    PENDING_INBOUND --> VERIFIED : Message WhatsApp entrant valide
    PENDING_INBOUND --> EXPIRED : TTL 10 min écoulé
    PENDING_INBOUND --> FAILED : Mauvais expéditeur ou payload corrompu
    VERIFIED --> CONSUMED : Session/Compte activé
```
- **Autorisées** :
  - `PENDING_INBOUND` -> `VERIFIED` (Webhook Meta reçoit le message avec HMAC valide et identifie l'expéditeur E.164).
  - `PENDING_INBOUND` -> `EXPIRED` (Aucun message reçu dans les 10 minutes).
  - `VERIFIED` -> `CONSUMED` (Jeton consommé pour émettre la session ou le mot de passe réinitialisé ; usage unique strict).
- **Interdites** :
  - Réutiliser un défi déjà passé en `CONSUMED` (prévention du rejeu).
  - Valider un défi dont le numéro expéditeur diffère du numéro attendu sur la session web.

## 19. AccountCase (Dossier Gestionnaire de Compte — CR-003 D-15, C-07)
```mermaid
stateDiagram-v2
    [*] --> OPEN
    OPEN --> INVESTIGATING : Prise en charge par ACCOUNT_MANAGER
    INVESTIGATING --> PENDING_ADMIN_APPROVAL : Demande changement numéro préparée
    PENDING_ADMIN_APPROVAL --> APPROVED_BY_ADMIN : ADMIN valide la demande
    PENDING_ADMIN_APPROVAL --> REJECTED_BY_ADMIN : ADMIN refuse la demande
    APPROVED_BY_ADMIN --> RESOLVED : Défi réussi sur nouveau numéro
    INVESTIGATING --> RESOLVED : Déblocage/révocation sessions effectuée
    INVESTIGATING --> CLOSED_UNRESOLVED : Identité non prouvée / motif caduc
    RESOLVED --> [*]
    CLOSED_UNRESOLVED --> [*]
```
- **Autorisées** :
  - `OPEN` -> `INVESTIGATING` (`ACCOUNT_MANAGER` ouvre le dossier après contact client, motif obligatoire).
  - `INVESTIGATING` -> `PENDING_ADMIN_APPROVAL` (Préparation de changement de numéro après contre-appel sur numéro secondaire).
  - `PENDING_ADMIN_APPROVAL` -> `APPROVED_BY_ADMIN` (`ADMIN` valide formellement — Double contrôle).
  - `APPROVED_BY_ADMIN` -> `RESOLVED` (Nouveau numéro activé par défi entrant sous délai de sécurité 48h).
- **Interdites** :
  - Toute action du gestionnaire de compte sans dossier `OPEN` ou `INVESTIGATING` actif avec motif.
  - Modification unilatérale directe du numéro ou d'une donnée de profil par le gestionnaire sans approbation `ADMIN`.


