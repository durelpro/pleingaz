# Paiement et Facturation

## 1. Architecture de Paiement
- **Interface `PaymentProvider`** : Abstraction stricte pour `MTNProvider`, `OrangeProvider` ou un `ManualPaymentProvider`. Tous les développements commencent en mode Sandbox. Les noms d'API, formats de requêtes et conditions de MTN MoMo et Orange Money (ou de l'agrégateur choisi) sont **À CONFIRMER** avec leur documentation officielle (zéro invention).
- **Frais (fee_bearer)** : Configurable (Plateforme, Vendeur, Client). Enregistrement des frais *réels* prélevés par l'opérateur sur chaque transaction, sans pourcentages en dur. 
  - *Hypothèse pilote* : PLEINGAZ absorbe les frais en ligne (**À CONFIRMER**).
  - *Légalité* : Si le client supporte les frais, cela doit figurer sur une ligne de facture distincte. Légalité locale de la refacturation des frais Mobile Money **À CONFIRMER**.

## 2. Flux de Paiement (Zéro confiance Frontend)
Le frontend ne valide **jamais** un paiement (Règle R4). 
1. Initiation sécurisée côté serveur. Paiement inséré en `PENDING`.
2. Webhook reçu : Vérification de signature cryptographique, fenêtre anti-rejeu (horodatage strict), et filtrage des IPs autorisées du fournisseur (**À CONFIRMER**).
3. Le rejeu de Webhook est géré de manière idempotente via la journalisation dans `PaymentWebhookEvent`.
4. Verrouillage (Idempotence) de la mise à jour via la table `IdempotencyKey` sous PostgreSQL.
5. Revérification active : Un cron job (ou file d'attente) interroge le statut réel auprès de l'opérateur si aucun webhook n'est reçu.
6. Expiration : Si l'utilisateur ne valide jamais sur son téléphone, le paiement passe `EXPIRED` et la réservation de stock est libérée.

## 3. Cas Limites et Remboursements
- **Remboursements partiel et total** : Initiés par un administrateur (ou automatiquement pour un `LATE_SUCCESS`). Génère une demande de remboursement asynchrone auprès de l'opérateur. Crée obligatoirement un Avoir (`CreditNote`) lié à la facture `Invoice`. Le client est notifié. Les délais dépendent du partenaire financier.
- **LATE_SUCCESS** : Paiement réussi après l'annulation de la commande (ex: réseau saturé). Par défaut, le système déclenche un remboursement automatique immédiat sur le moyen d'origine. Aucun `Wallet` interne n'est créé.
- **Paiements en double ou partiels** : Détectés par montant discordant ou ré-utilisation de la référence de commande. Entraînent un blocage et un remboursement manuel.

## 4. Paiement Espèces et Créances Distributeur
- **Flux** : Le client paie de la main à la main. Le distributeur valide avec un "Code de remise" visuel fourni par le client.
- **Créance** : La commission PLEINGAZ devient une dette enregistrée dans `Settlement`.
- **Plafond de créance** : Des règles explicites définissent le plafond autorisé pour un distributeur. Rappels auto envoyés. Suspension automatique si dépassement (**Montants À CONFIRMER**).
- **Désaccord** : Si le distributeur conteste l'encaissement malgré le code, le compte passe en litige (AuditLog des actions, support client requis).

## 5. Rapprochement Financier
- Importation des relevés réels bruts de l'opérateur ou de l'agrégateur (fichiers CSV/API).
- Un algorithme fait correspondre les références de transaction (`gateway_ref`) avec la base de données.
- Détection d'écarts (montants, frais inattendus). Un rapport quotidien est généré.
- Accès strictement réservé au rôle `FINANCE_MANAGER`.

## 6. Facturation et Sécurité
- **Identité** : Affichage strict de l'identité du vendeur ("PLEINGAZ - Vente directe" ou "Distributeur agréé : X"). Mentions fiscales exactes **À CONFIRMER**.
- **Séquençage** : Numérotation continue sans trou ni doublon gérée par base de données transactionnelle (`InvoiceSequence`). Toute modification implique un Avoir (CreditNote).
- **Partage** : Le PDF est stocké sur S3 Privé. Liens signés avec TTL court. Le partage WhatsApp envoie le fichier directement ou un lien à usage restreint, mais n'expose jamais de lien public permanent.

## 7. Anti-fraude et Tests d'Abus
- **Limites** : Plafonds de montants par transaction et par opérateur (**À CONFIRMER**).
- **Règles basiques** : Limite de tentatives par commande. Détection d'une vitesse de paiement inhumaine ou d'un numéro payeur très différent du titulaire de compte.
- **Tests exigés** : 
  - Forçage d'un double paiement simultané.
  - Rejeu d'un ancien webhook.
  - Falsification de la signature du webhook.
  - Tentative de téléchargement de la facture d'autrui.
  - Modification du payload frontend pour abaisser le prix de la commande.
  - Envoi tardif du succès après expiration (LATE_SUCCESS).
