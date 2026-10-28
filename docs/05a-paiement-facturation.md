# Paiement, Facturation et Grand Livre

## 1. Architecture de Paiement et Encaissement Centralisé (CR-001 D-01, D-06 ; CR-003 D-16, D-17, C-02)
- **Encaissement Centralisé** : La plateforme PLEINGAZ encaisse l'intégralité des flux de paiements électroniques (Mobile Money MTN / Orange). Les distributeurs et livreurs sont rémunérés par reversements périodiques (Settlement / `PayoutBatch`).
- **Tarification Duale de Livraison (CR-003 D-17, C-02)** :
  - **Flotte PLEINGAZ (`PLEINGAZ_STAFF` / `PLEINGAZ_DIRECT`)** : Tarif forfaitaire immuable de **1 000 FCFA TTC fixe** dans les zones de service couvertes, versionné dans `Setting` avec date d'effet.
  - **Livreurs Partenaires (`DISTRIBUTOR_COURIER`, `INDEPENDENT`)** : Tarifs librement configurés par le livreur ou sa boutique, obligatoirement contenus dans les bornes minimales et maximales fixées par l'administrateur (`courier_fee_min_bound` et `courier_fee_max_bound` dans `Setting`).
  - Le tarif de livraison retenu est affiché de façon transparente au client et **figé sur la commande** à la validation (zéro surfacturation possible).
- **Barèmes Versionnés et Maker-Checker** :
  - Tarifs catalogue (`ProductPrice`) proposés par `FINANCE_MANAGER` et approuvés obligatoirement par un rôle distinct (`ADMIN` ou `SUPER_ADMIN`).
  - Recalcul systématique et obligatoire du prix de chaque article par le serveur à la commande depuis `ProductPrice` actif. Tout montant injecté dans le payload client est écrasé.
- **Interface `PaymentProvider`** : Abstraction stricte pour `MTNProvider`, `OrangeProvider` ou un `ManualPaymentProvider` (ou un agrégateur agréé). Tous les développements commencent en mode Sandbox. Les noms d'API, formats de requêtes et conditions de MTN MoMo et Orange Money (ou de l'agrégateur choisi) sont **À CONFIRMER** avec leur documentation officielle (zéro invention).
- **Frais (fee_bearer)** : Configurable dans `Setting` (`PLATFORM` par défaut, Vendeur, Client). Enregistrement des frais *réels* prélevés par l'opérateur sur chaque transaction, sans pourcentages en dur dans `PaymentTransaction`.
  - *Hypothèse pilote* : PLEINGAZ absorbe les frais en ligne (**À CONFIRMER**).
  - *Légalité* : Si le client supporte les frais, cela doit figurer sur une ligne de facture distincte. Légalité locale de la refacturation des frais Mobile Money **À CONFIRMER**.

## 2. Flux de Paiement (Zéro confiance Frontend)
Le frontend ne valide **jamais** un paiement (Règle R4). 
1. Initiation sécurisée côté serveur. Paiement inséré en `PENDING`.
2. Webhook reçu : Vérification de signature cryptographique, fenêtre anti-rejeu (horodatage strict), et filtrage des IPs autorisées du fournisseur (**À CONFIRMER**).
3. Le rejeu de Webhook est géré de manière idempotente via la journalisation dans `PaymentWebhookEvent`.
4. Verrouillage (Idempotence) de la mise à jour via la table `IdempotencyKey` sous PostgreSQL.
5. Revérification active : Un worker BullMQ (ou cron job) interroge le statut réel auprès de l'opérateur si aucun webhook n'est reçu.
6. Expiration : Si l'utilisateur ne valide pas sur son téléphone dans le délai imparti, le paiement passe `EXPIRED` et la réservation de stock est libérée.

## 3. Cas Limites, Remboursements et Avoirs (CR-001 D-06)
- **Remboursements partiel et total** : Initiés par un administrateur habilité (ou automatiquement pour un `LATE_SUCCESS`). Génère une demande de remboursement asynchrone auprès de l'opérateur et crée obligatoirement un Avoir immuable (`CreditNote`) rattaché à la facture `Invoice`. Le client est notifié par WhatsApp. Les délais dépendent du partenaire financier.
- **LATE_SUCCESS** : Paiement confirmé après expiration de la commande ou du timeout gateway (ex: réseau saturé). Par défaut, le système déclenche un **remboursement automatique immédiat** vers le moyen de paiement d'origine, notifiant le client. Zéro wallet interne virtuel non régulé.
- **Paiements en double ou partiels** : Détectés par montant discordant ou ré-utilisation de la référence de commande. Entraînent un blocage et un remboursement manuel.

## 4. Paiement Espèces, Ventes au Comptoir et Caisse (CR-001 D-05, D-06 ; CR-003 D-16, D-17)
- **Double Confirmation de Livraison (CR-003 D-17)** : Le paiement en espèces à la livraison est sécurisé par la double confirmation des deux boutons : le livreur valide « J'ai livré » et l'acheteur valide « J'ai reçu ma commande » (le code secret à 4 chiffres reste optionnel dans `Setting`).
- **Enregistrement des Ventes au Comptoir (`CounterSale` — D-16)** :
  - Les ventes en espèces ou Mobile Money direct effectuées directement dans la boutique du distributeur sont obligatoirement saisies au comptoir.
  - L'acheteur valide l'opération depuis son espace personnel.
  - Ces ventes alimentent le grand livre, régulent la créance du distributeur et sont décomptées dans le quota des 5 bouteilles.
- **Enregistrement de la Créance** : La remise en espèces génère une ligne `CashCollection` liée à la livraison ou à la vente au comptoir. Le montant perçu constitue une créance envers PLEINGAZ, imputée au débit de la caisse livreur (`1030`) ou distributeur (`1020`).
- **Plafond de Caisse et Suspension Automatique** : Un seuil d'encaissement d'espèces est configuré dans `Setting` (défaut appliqué, à confirmer : exemple illustratif 50 000 FCFA). Dès que le cumul des espèces non reversées d'un livreur ou distributeur dépasse ce plafond paramétrable, l'attribution de nouvelles courses ou commandes est **automatiquement bloquée** jusqu'à remise physique des fonds ou compensation.
- **Régularisation** : PLEINGAZ régularise les créances par déduction directe sur les prochains lots de reversement `PayoutBatch` ou lors de la remise physique en agence.
- **Désaccord / Litige** : Si le destinataire signale un problème, la livraison bascule en `DISPUTED` (AuditLog systématique des actions, arbitrage du support logistique requis).


## 5. Grand Livre Immuable, Rapprochement et Reporting (CR-001 D-03, D-06)
- **Grand Livre à Double Entrée Immuable** :
  - Toute opération financière génère des écritures équilibrées dans `LedgerEntry` : **`SUM(debit) == SUM(credit)`**.
  - Modèle strictement Insert-Only : interdiction technique de tout `UPDATE` ou `DELETE`. Toute rectification s'effectue obligatoirement par contre-passation (écriture inverse). Clôture journalière automatisée.
  - Plan de comptes type (soumis à validation comptable, exemple illustratif) : `1010` Banque/MoMo, `1020` Caisse Distributeurs, `1030` Caisse Livreurs, `4010` Dettes Distributeurs, `4020` Dettes Livreurs, `7010` Produits Ventes, `7020` Commissions, `6010` Frais Opérateurs, `6020` Frais Livraison.
- **Lots de Reversement (`PayoutBatch`)** :
  - Préparation périodique par le rôle `FINANCE_MANAGER`.
  - Approbation obligatoire par `ADMIN` ou `SUPER_ADMIN` (Maker-Checker invariant strict, `approved_by != created_by`). Double validation au-delà d'un seuil configurable dans `Setting` (défaut appliqué, à confirmer).
  - Exécution manuelle au MVP : saisie de la référence bancaire/MoMo réelle et téléversement du justificatif pour passage à `EXECUTED`.
- **Rapprochement Financier avec Relevés Opérateurs** :
  - Importation des relevés réels bruts de l'opérateur ou de l'agrégateur (fichiers CSV / API bancaire).
  - Algorithme de réconciliation automatisé faisant correspondre les références de transaction (`gateway_ref`) avec la base de données.
  - Détection proactive des écarts (écarts de montants, frais inattendus, commissions discordantes) avec rapport quotidien généré. Accès strictement réservé au rôle `FINANCE_MANAGER`.
- **15 Rapports Exhaustifs du Control Center (CR-001 D-03)** :
  - Endpoints d'administration dédiés (`GET /api/v1/admin/reports/:id`) couvrant les 15 rapports (R01 à R15 : Ventes, Commandes, Trésorerie, Réconciliation, Disponibilité, Ruptures, Distributeurs, Fraîcheur, Livreurs, Recherches sans résultat, Demande géographique, Avis, Incidents, Audit Trail, Santé plateforme).
  - Données 100% réelles issues de requêtes SQL sur les tables métier ; tolérance zéro pour les données fictives ou placeholders en production.
  - Exports disponibles : PDF, CSV, Excel selon le rapport, journalisés dans `AuditLog`.

## 6. Facturation et Sécurité
- **Émission Exclusive Plateforme & Identité Vendeur** : Seul le système PLEINGAZ émet des factures valides (`Invoice`). Affichage strict de l'identité du vendeur ("PLEINGAZ - Vente directe" ou "Distributeur agréé : X"). Mentions fiscales exactes **À CONFIRMER**.
- **Séquençage & Immutabilité** : Numérotation continue sans trou ni doublon gérée par base de données transactionnelle (`InvoiceSequence`). Toute modification ultérieure exige obligatoirement un Avoir (`CreditNote`).
- **Partage Sécurisé** : PDF stocké sur S3 Privé chiffré au repos (AES-256). Accès via des URL signées éphémères (TTL court). Le partage WhatsApp envoie le fichier directement ou un lien à usage restreint, mais n'expose jamais de lien public permanent.

## 7. Anti-fraude et Tests d'Abus
- **Limites Opérateur** : Plafonds de montants par transaction et par opérateur (**À CONFIRMER**). Limite de tentatives par commande. Détection d'une cadence de paiement anormale ou d'un numéro payeur très différent du titulaire de compte.
- **Contrôles et Tests Automatisés Exigés** :
  - Forçage d'un double paiement simultané bloqué par `IdempotencyKey`.
  - Rejeu d'un ancien webhook bloqué par `PaymentWebhookEvent`.
  - Falsification de signature webhook rejetée en 401 Unauthorized.
  - Tentative de téléchargement de facture d'autrui bloquée en 403 Forbidden.
  - Tentative de modification de prix client écrasée par le recalcul serveur `ProductPrice`.
  - Auto-approbation d'un tarif ou d'un lot financier rejetée par contrainte Maker-Checker (`403`).
  - Validation de livraison avec mauvais code de confirmation rejetée (`400`).
  - Dépassement de plafond de caisse espèces déclenchant la suspension de course.
  - Envoi tardif du succès après expiration traité en `LATE_SUCCESS` (remboursement automatique).
