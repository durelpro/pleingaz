# Paiement, Facturation et Grand Livre

## 1. Architecture de Paiement et Encaissement Centralisé (CR-001 D-01, D-06)
- **Encaissement Centralisé** : La plateforme PLEINGAZ encaisse l'intégralité des flux de paiements électroniques (Mobile Money MTN / Orange). Les distributeurs et livreurs sont rémunérés par reversements périodiques (Settlement / `PayoutBatch`).
- **Barèmes Versionnés et Maker-Checker** :
  - Tarifs catalogue (`ProductPrice`) et barèmes de livraison/commissions (`DeliveryFeeSchedule`) proposés par `FINANCE_MANAGER` et approuvés obligatoirement par un rôle distinct (`ADMIN` ou `SUPER_ADMIN`).
  - Recalcul systématique et obligatoire du prix de chaque article par le serveur à la commande depuis `ProductPrice` actif. Tout montant injecté dans le payload client est écrasé.
- **Interface `PaymentProvider`** : Abstraction stricte pour `MTNProvider`, `OrangeProvider` ou un agrégateur agréé. Environnement sandbox obligatoire en développement.
- **Frais (fee_bearer)** : Configurable dans `Setting` (`PLATFORM` par défaut). Les frais d'opérateurs réels exacts sont stockés dans `PaymentTransaction`.

## 2. Flux de Paiement (Zéro confiance Frontend)
Le frontend ne valide **jamais** un paiement (Règle R4). 
1. Initiation sécurisée côté serveur. Paiement inséré en `PENDING`.
2. Webhook reçu : Vérification de signature cryptographique, fenêtre anti-rejeu (horodatage strict), et filtrage des IPs autorisées du fournisseur.
3. Le rejeu de Webhook est géré de manière idempotente via la journalisation dans `PaymentWebhookEvent`.
4. Verrouillage (Idempotence) de la mise à jour via la table `IdempotencyKey` sous PostgreSQL.
5. Revérification active : Un worker BullMQ interroge le statut réel auprès de l'opérateur si aucun webhook n'est reçu.
6. Expiration : Si l'utilisateur ne valide pas sur son téléphone dans le délai imparti, le paiement passe `EXPIRED` et la réservation de stock est libérée.

## 3. Cas Limites, Remboursements et Avoirs (CR-001 D-06)
- **Remboursements partiel et total** : Initiés par un administrateur habilité. Génère une demande auprès de l'opérateur et crée obligatoirement un Avoir immuable (`CreditNote`) rattaché à la facture `Invoice`. Le client est notifié par SMS/WhatsApp.
- **LATE_SUCCESS** : Paiement confirmé après expiration de la commande ou du timeout gateway. Par défaut, le système déclenche un **remboursement automatique immédiat** vers le moyen de paiement d'origine, notifiant le client. Zéro wallet interne virtuel non régulé.
- **Paiements en double ou partiels** : Détectés par montant discordant ou ré-utilisation de la référence de commande. Entraînent un blocage et un remboursement manuel.

## 4. Paiement Espèces et Caisse Distributeur & Livreur (CR-001 D-05, D-06)
- **Validation Sécurisée de Remise** : Le client paie de la main à la main lors de la livraison ou du retrait. La remise est validée **uniquement par la saisie du code secret de confirmation** (4-6 chiffres) fourni au client sur son tableau de bord.
- **Enregistrement de la Créance** : La remise en espèces génère une ligne `CashCollection` liée à la livraison. Le montant perçu constitue une créance envers PLEINGAZ, imputée au débit de la caisse livreur (`1030`) ou distributeur (`1020`).
- **Plafond de Caisse et Suspension Automatique** : Un seuil d'encaissement d'espèces est configuré dans `Setting` (défaut : 50 000 FCFA). Dès que le cumul des espèces non reversées d'un livreur dépasse ce plafond, l'attribution de nouvelles courses est **automatiquement bloquée** jusqu'à remise physique des fonds ou compensation.
- **Régularisation** : PLEINGAZ régularise les créances par déduction directe sur les prochains lots de reversement `PayoutBatch` ou lors de la remise physique en agence.

## 5. Grand Livre Immuable, Rapprochement et Reporting (CR-001 D-03, D-06)
- **Grand Livre à Double Entrée Immuable** :
  - Toute opération financière génère des écritures équilibrées dans `LedgerEntry` : **`SUM(debit) == SUM(credit)`**.
  - Modèle strictement Insert-Only : interdiction technique de tout `UPDATE` ou `DELETE`. Toute rectification s'effectue par contre-passation.
  - Plan de comptes : `1010` Banque/MoMo, `1020` Caisse Distributeurs, `1030` Caisse Livreurs, `4010` Dettes Distributeurs, `4020` Dettes Livreurs, `7010` Produits Ventes, `7020` Commissions, `6010` Frais Opérateurs, `6020` Frais Livraison.
- **Lots de Reversement (`PayoutBatch`)** :
  - Préparation périodique par le rôle `FINANCE_MANAGER`.
  - Approbation obligatoire par `ADMIN` ou `SUPER_ADMIN` (Maker-Checker invariant).
  - Exécution manuelle au MVP : saisie de la référence bancaire/MoMo réelle et téléversement du justificatif pour passage à `EXECUTED`.
- **15 Rapports Exhaustifs du Control Center (CR-001 D-03)** :
  - Endpoints d'administration dédiés (`GET /api/v1/admin/reports/:id`) couvrant les 15 rapports (R01 à R15 : Ventes, Commandes, Trésorerie, Réconciliation, Disponibilité, Ruptures, Distributeurs, Fraîcheur, Livreurs, Recherches sans résultat, Demande géographique, Avis, Incidents, Audit Trail, Santé plateforme).
  - Données 100% réelles issues de requêtes SQL sur les tables métier ; tolérance zéro pour les données fictives ou placeholders en production.
  - Exports disponibles : PDF, CSV, Excel selon le rapport.

## 6. Facturation et Sécurité
- **Émission Exclusive Plateforme** : Seul le système PLEINGAZ émet des factures valides (`Invoice`). Numérotation séquentielle stricte sans trou (`InvoiceSequence`).
- **Immutabilité** : Toute facture émise ne peut être modifiée ; les ajustements exigent obligatoirement un avoir (`CreditNote`).
- **Partage Sécurisé** : PDF stocké sur S3 Privé chiffré au repos. Accès via des URL signées éphémères (TTL court).

## 7. Anti-fraude et Tests d'Abus
- **Contrôles Automatisés** :
  - Forçage d'un double paiement simultané bloqué par `IdempotencyKey`.
  - Rejeu d'un ancien webhook bloqué par `PaymentWebhookEvent`.
  - Falsification de signature webhook rejetée en 401.
  - Tentative de téléchargement de facture d'autrui bloquée en 403.
  - Tentative de modification de prix client écrasée par le recalcul serveur `ProductPrice`.
  - Auto-approbation d'un tarif ou d'un lot financier rejetée par contrainte Maker-Checker (`403`).
  - Validation de livraison avec mauvais code de confirmation rejetée (`400`).
  - Dépassement de plafond de caisse espèces déclenchant la suspension de course.

