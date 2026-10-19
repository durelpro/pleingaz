# Notifications et Communications

## 1. Canaux et Événements (CR-001 D-04, D-05, D-06)
Le système gère un **Centre de notifications** in-app permettant de retrouver l'historique complet.
- **Canaux** : Push Web (PWA), Email, WhatsApp, et SMS.
- **Événements Métier Standard** : Création de compte, confirmation de commande, facture générée, paiement confirmé/échoué, stock qualitatif faible/rupture, nouveau message support.
- **Nouveaux Événements Logistiques & Livreurs (CR-001 D-05)** :
  - `COURIER_ASSIGNED` : Notification au livreur d'une nouvelle course proposée avec délai d'acceptation (défaut 10 min).
  - `COURIER_TIMEOUT` : Notification de réattribution de course si non-réponse du livreur.
  - `DELIVERY_CODE_ISSUED` : Envoi au client de son **Code de Confirmation confidentiel** (4-6 chiffres) lors de la prise en charge par le livreur.
  - `COURIER_CASH_LIMIT_ALERT` : Alerte au livreur et au responsable logistique lorsque le solde d'espèces collectées approche ou dépasse le plafond `Setting` (défaut appliqué, à confirmer : exemple illustratif 50 000 FCFA), avec notification de suspension automatique de nouvelles courses.
- **Événements KYC Distributeur (CR-001 D-04)** :
  - `KYC_DECISION` : Notification immédiate par SMS/WhatsApp de la décision administrative : approbation `APPROVED` ou rejet `REJECTED` avec **motif obligatoire** formulé en français simple.
- **Événements Financiers et Maker-Checker (CR-001 D-06)** :
  - `MAKER_CHECKER_PENDING` : Alerte aux administrateurs habilités (`ADMIN`, `SUPER_ADMIN`) lors de la soumission d'une proposition tarifaire (`ProductPrice`) ou d'un lot de reversement (`PayoutBatch`).
  - `LATE_SUCCESS_REFUND` : Notification au client informant qu'un paiement tardif a été détecté et qu'un remboursement intégral est en cours.
- **Préférences et Heures Calmes** : Distinction stricte entre notifications transactionnelles (urgentes/forcées) et alertes de confort. Blocage des messages non urgents pendant les heures calmes (ex: 22h-06h).

## 2. Gabarits (Templates)
- **Structure** : Variables injectées sécurisées (`{{order_number}}`, `{{confirmation_code}}`, `{{rejection_reason}}`, `{{amount}}`). Templates versionnés en FR/EN.
- **Gabarits Clés CR-001** :
  - `DISTRIBUTOR_APPROVED` : *"Félicitations ! Votre point de vente PLEINGAZ a été validé. Vous pouvez dès à présent déclarer vos stocks sur votre espace."*
  - `DISTRIBUTOR_REJECTED` : *"Votre candidature PLEINGAZ n'a pas pu être validée pour le motif suivant : {{rejection_reason}}. Vous pouvez soumettre à nouveau vos pièces sur votre profil."*
  - `CLIENT_CONFIRMATION_CODE` : *"Votre livreur est en route ! Votre code secret de remise est : {{confirmation_code}}. Ne le communiquez qu'en échange de votre bouteille PLEINGAZ."*
  - `COURIER_MISSION_OFFER` : *"Nouvelle course disponible à {{pickup_store}} vers {{delivery_quarter}}. Vous avez 10 minutes pour l'accepter."*
- **WhatsApp "Click to chat" (MVP)** : Le système génère un lien WhatsApp avec message prérempli pour initier le contact. Aucun message automatisé n'est envoyé de manière sortante sans action du client (Règle R10).
- **WhatsApp Business API (Post-MVP)** : Nécessite un numéro officiel vérifié par Meta pour les templates transactionnels payants.

## 3. Infrastructure Asynchrone et Résilience
- **Files d'attente (Redis/BullMQ)** : Processus asynchrone, reprises (retries) automatiques avec backoff exponentiel.
- **File des échecs (Dead Letter)** : Tout message échouant définitivement est mis en quarantaine pour alerte aux développeurs.
- **Sécurités** : Mécanismes anti-doublon (idempotence d'envoi via un hash de contenu + ID de commande), anti-spam (limite horaire par utilisateur).
- **Repli (Fallback)** : Si WhatsApp échoue, envoi automatique d'un SMS ou Email. Pour les livreurs et clients en zone à faible réseau, les notifications Web Push restent en texte pur ultra-léger.

## 4. Stratégie OTP (Authentification)
L'authentification dépend d'une interface abstraite `OtpProvider`.
- **Prestataires** : Évaluation d'un agrégateur local ou international pour un taux de délivrabilité optimal sur MTN/Orange au Cameroun.
- **Règles Anti-abus (OTP)** :
  - Rate limiting strict par numéro et par adresse IP.
  - Backoff croissant (1 min, 3 min, 10 min).
  - Plafond mensuel budgétaire avec alerte aux administrateurs.
  - L'OTP n'est jamais envoyé vers l'extérieur pour un compte marqué `is_demo`.

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

