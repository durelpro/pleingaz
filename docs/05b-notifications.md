# Notifications et Communications

## 1. Canaux et Événements
Le système gère un **Centre de notifications** in-app permettant de retrouver l'historique complet.
- **Canaux** : Push Web (PWA), Email, WhatsApp, et SMS (à venir).
- **Événements** : Création de compte, validation/refus KYC, nouvelle commande, commande confirmée/livrée/annulée, facture générée, paiement confirmé/échoué, stock faible, retour en stock, nouveau message de support.
- **Préférences et Heures Calmes** : Distinction stricte entre les notifications transactionnelles (forcées) et marketing (opt-in). Le système bloque les messages non urgents (ex: retour en stock, marketing) pendant les heures calmes (ex: 22h-06h, réglage utilisateur). Désinscription (opt-out) obligatoire sur les emails et messages marketing.

## 2. Gabarits (Templates)
- **Structure** : Variables injectées sécurisées (`{{order_number}}`, `{{amount}}`). Templates versionnés en FR/EN.
- **WhatsApp "Click to chat" (MVP)** : Le système génère un lien WhatsApp avec message prérempli pour initier le contact. Aucun message automatisé n'est envoyé de manière sortante sans action du client (Règle R10).
- **WhatsApp Business API (Post-MVP)** : Nécessite un numéro officiel, la vérification de l'entreprise par Meta, et la soumission de modèles de messages payants (**Coûts À CONFIRMER**).

## 3. Infrastructure Asynchrone et Résilience
- **Files d'attente (Redis/BullMQ)** : Processus asynchrone, reprises (retries) automatiques avec backoff exponentiel.
- **File des échecs (Dead Letter)** : Tout message échouant définitivement est mis en quarantaine pour alerte aux développeurs.
- **Sécurités** : Mécanismes anti-doublon (idempotence d'envoi via un hash de contenu + ID de commande), anti-spam (limite horaire par utilisateur).
- **Repli (Fallback)** : Si WhatsApp échoue, envoi automatique d'un Email. Pour les utilisateurs en zone à connexion bridée, les notifications Web Push restent volontairement très légères (texte pur).

## 4. Stratégie OTP (Authentification)
L'authentification dépend d'une interface abstraite `OtpProvider`.
- **Comparaison de prestataires** : Avant sélection, il faut comparer un acteur international (Twilio/MessageBird) et un acteur régional/local. Critères : Taux de livraison réel au Cameroun sur MTN/Orange, Identifiant d'expéditeur (Sender ID), coût unitaire, rapidité et qualité du support local. Aucun choix ne sera fait sans tests grandeur nature.
- **Canaux de secours** : Code vocal ou via WhatsApp si le SMS n'arrive pas.
- **Règles Anti-abus (OTP)** :
  - Rate limiting strict par numéro et par adresse IP.
  - Délai d'attente croissant (backoff : 1 min, puis 3 min, puis 10 min).
  - Plafond mensuel budgétaire global sur le prestataire avec alerte SMS aux admins dès 80 % atteints.
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
