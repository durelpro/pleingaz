# Notifications et Communications

## 1. Canaux et Événements (CR-001 D-04, D-05, D-06)
Le système gère un **Centre de notifications** in-app permettant de retrouver l'historique complet.
- **Canaux** : In-App (Centre de notifications et bandeau Infos), Push Web PWA, WhatsApp entrant (`VerificationChannel`) et Email facultatif. Le SMS payant sortant est classé hors MVP pour éliminer les coûts d'envoi récurrents.
- **Événements Métier Standard** : Création de compte via WhatsApp, confirmation de commande, facture générée, paiement confirmé/échoué, stock qualitatif faible/rupture, nouveau message support.
- **Événements de Double Confirmation et Livraison (CR-003 D-17)** :
  - `COURIER_ASSIGNED` : Notification au livreur d'une nouvelle course proposée avec délai d'acceptation (défaut 10 min).
  - `COURIER_TIMEOUT` : Notification de réattribution de course si non-réponse du livreur.
  - `DELIVERY_PENDING_CONFIRMATION` : Notification au client dès que le livreur a cliqué sur « J'ai livré », l'invitant à valider la réception.
  - `DELIVERY_RECEIPT_CONFIRMED` : Notification de clôture définitive de la course dès que l'acheteur valide « J'ai reçu ma commande ».
  - `DELIVERY_DISPUTED` : Alerte au support logistique si l'acheteur signale une contestation sur la livraison.
  - `COURIER_CASH_LIMIT_ALERT` : Alerte au livreur et au responsable logistique lorsque le solde d'espèces collectées approche ou dépasse le plafond `Setting` (défaut appliqué, à confirmer : exemple illustratif 50 000 FCFA), avec notification de suspension automatique de nouvelles courses.
- **Événements de Quota Acheteur (CR-003 D-14)** :
  - `BUYER_QUOTA_REACHED` : Information affichée sur la jauge lorsque les 5 bouteilles sont atteintes, avec la date précise de réouverture.
  - `BUYER_QUOTA_RELEASED` : Notification informant qu'une bouteille s'est libérée suite à l'expiration de la fenêtre de 30 jours.
- **Événements KYC Distributeur (CR-001 D-04)** :
  - `KYC_DECISION` : Notification immédiate par message WhatsApp de la décision administrative : approbation `APPROVED` ou rejet `REJECTED` avec **motif obligatoire** formulé en français simple.
- **Événements Financiers et Maker-Checker (CR-001 D-06)** :
  - `MAKER_CHECKER_PENDING` : Alerte aux administrateurs habilités (`ADMIN`, `SUPER_ADMIN`) lors de la soumission d'une proposition tarifaire (`ProductPrice`) ou d'un lot de reversement (`PayoutBatch`).
  - `LATE_SUCCESS_REFUND` : Notification au client informant qu'un paiement tardif a été détecté et qu'un remboursement intégral est en cours.
- **Préférences et Heures Calmes** : Distinction stricte entre notifications transactionnelles (urgentes/forcées) et alertes de confort. Blocage des messages non urgents pendant les heures calmes (ex: 22h-06h).

## 2. Gabarits (Templates)
- **Structure** : Variables injectées sécurisées (`{{order_number}}`, `{{rejection_reason}}`, `{{amount}}`). Templates versionnés en FR/EN.
- **Gabarits Clés CR-001 & CR-003** :
  - `DISTRIBUTOR_APPROVED` : *"Félicitations ! Votre point de vente PLEINGAZ a été validé. Vous pouvez dès à présent déclarer vos stocks sur votre espace."*
  - `DISTRIBUTOR_REJECTED` : *"Votre candidature PLEINGAZ n'a pas pu être validée pour le motif suivant : {{rejection_reason}}. Vous pouvez soumettre à nouveau vos pièces sur votre profil."*
  - `DELIVERY_ARRIVED_CONFIRM` : *"Votre livreur est arrivé ! Merci d'appuyer sur 'J'ai bien reçu ma commande' dans votre espace PLEINGAZ pour clore la livraison."*
  - `COURIER_MISSION_OFFER` : *"Nouvelle course disponible à {{pickup_store}} vers {{delivery_quarter}}. Vous avez 10 minutes pour l'accepter."*
- **WhatsApp "Preuve Entrante" (CR-003 D-12, C-04)** : L'application prépare un lien `wa.me` contenant le code de défi court (ex: `PG-8492`). L'utilisateur envoie lui-même le message. Aucun message automatisé payant n'est initié par PLEINGAZ hors de la fenêtre gratuite de 24h (Règle R10).

## 3. Infrastructure Asynchrone et Résilience
- **Files d'attente (Redis/BullMQ)** : Processus asynchrone, reprises (retries) automatiques avec backoff exponentiel.
- **File des échecs (Dead Letter)** : Tout message échouant définitivement est mis en quarantaine pour alerte aux développeurs.
- **Sécurités** : Mécanismes anti-doublon (idempotence d'envoi via un hash de contenu + ID de commande), anti-spam (limite horaire par utilisateur).
- **Repli (Fallback)** : En cas d'indisponibilité, les notifications Web Push et in-app restent le canal souverain garanti en texte pur ultra-léger.

## 4. Stratégie de Vérification d'Identité (`VerificationChannel`)
L'authentification et les preuves d'identité dépendent de l'interface `VerificationChannel` (D-12, 14a) :
- **Canaux supportés** :
  - `WhatsAppInboundChannel` (Cible production, preuve entrante webhook Meta sans coût).
  - `SimulatedChannel` (Environnements de dev et tests CI sans dépendance réseau).
  - `ManualAssistedChannel` (Procédure assistée par le gestionnaire de compte avec contre-appel vocal sur `backupPhone` et double validation `ADMIN`).
- **Règles Anti-abus** :
  - Rate limiting strict par numéro et par adresse IP (3 défis par heure).
  - Expiration stricte des défis après 10 minutes (TTL non renouvelable).
  - Le défi est invalidé de manière atomique dès sa première utilisation (`is_consumed = true`).
  - Aucun défi n'est envoyé vers l'extérieur pour un compte de test ou de démo (`is_demo = true`).


## 5. Alertes de Retour en Stock (DemandAlert)
- Les clients demandent à être alertés d'un retour en stock.
- L'alerte est déclenchée **uniquement** quand le distributeur déclare un état `BON` ou `MOYEN`.
- Consentement explicite requis par boutique et produit.
- Anti-spam : La notification n'est envoyée qu'une fois. Il faut se réabonner pour la suivante.

## 6. Tests d'Abus Exigés
- Forçage répété de l'OTP (brute force par numéro et par IP).
- Inscription de centaines de requêtes factices de `DemandAlert` pour inonder un utilisateur.
- Tentative de déclenchement d'envoi sortant vers un numéro lié à un compte `is_demo`.
- Tentative d'interception ou de contournement du code de confirmation de livraison.

