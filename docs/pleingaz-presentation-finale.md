# DOCUMENT DE SYNTHÈSE PLEINGAZ
## Plateforme Officielle de Distribution de Gaz (Digital Distribution Network)

### 1. PRÉSENTATION DE L'APPLICATION ET DES BESOINS UTILISATEURS

La plateforme PLEINGAZ a été conçue pour résoudre un problème critique au Cameroun : la difficulté de trouver du gaz domestique disponible, au prix officiel, et de manière sécurisée. L'application répond à trois profils d'utilisateurs distincts.

#### A. Le Client (L'Acheteur)
**Le besoin :** "Où trouver du gaz maintenant, puis-je payer par Mobile Money et me faire livrer ?"
**Fonctionnalités :**
- **Recherche par géolocalisation ou quartier :** Le client trouve immédiatement les boutiques autour de lui ayant du *stock réel*.
- **Paiement Mobile Money (MoMo / Orange Money) :** Paiement sécurisé via le téléphone portable, sans besoin de carte bancaire, avec système d'OTP (mot de passe à usage unique par SMS).
- **Suivi de commande et Livraison :** Choix entre retrait en boutique (Click & Collect) ou livraison à domicile.
- **Avis et Fidélité :** Possibilité de noter le distributeur après livraison et de gagner des points de fidélité.

#### B. Le Distributeur (Le Vendeur)
**Le besoin :** "Comment vendre plus, gérer mon stock et recevoir mon argent en toute sécurité ?"
**Fonctionnalités :**
- **Tableau de bord de vente :** Gestion ultra-simplifiée de l'inventaire. Le vendeur sait exactement ce qu'il a en stock.
- **Onboarding numérique :** Inscription rapide avec soumission de pièces justificatives (CNI, Registre de commerce).
- **Visibilité accrue :** Apparition sur la carte interactive (Heatmap) de PLEINGAZ.
- **Reversement financier :** Les paiements des clients vont sur un compte de séquestre PLEINGAZ et sont reversés aux numéros Mobile Money enregistrés par le distributeur.

#### C. L'Administrateur PLEINGAZ (Le Superviseur)
**Le besoin :** "Où est la demande, quels distributeurs sont performants, et y a-t-il un risque de rupture de stock ?"
**Fonctionnalités :**
- **Dashboard Analytique & Insights IA :** Surveillance des ruptures de stock en temps réel.
- **Heatmap (Carte de Chaleur) :** Visualisation géographique des zones où les clients cherchent du gaz sans succès, permettant de cibler où installer de futurs distributeurs.
- **Score de Fiabilité :** Notation automatique des distributeurs basée sur leur réactivité et leurs annulations.
- **Export Excel :** Génération de rapports PDF et Excel pour la comptabilité.

---

### 2. COMMENT FONCTIONNE LA PWA (Progressive Web App) ?

**Qu'est-ce qu'une PWA ?** 
Il s'agit d'un site web ultra-moderne qui se comporte exactement comme une application mobile téléchargeable sur Play Store ou App Store, mais sans avoir besoin de passer par ces plateformes.

**Comment l'utilisateur y accède-t-il ?**
1. L'utilisateur ouvre son navigateur (Chrome, Safari) et va sur **www.pleingaz.cm**.
2. Une notification automatique apparaît en bas de l'écran : *"Ajouter PLEINGAZ à l'écran d'accueil"*.
3. En cliquant sur "Oui", l'application s'installe sur le téléphone sous forme d'icône (avec le logo orange Pleingaz).
4. **Le grand avantage :** Lorsqu'il clique sur l'icône, l'application s'ouvre en plein écran (sans la barre du navigateur), fonctionne plus rapidement grâce au système de cache, et peut même fonctionner **hors-ligne** ou avec une connexion internet très faible (Edge/3G) pour consulter ses dernières commandes.

---

### 3. CE QU'IL RESTE À FAIRE AVANT LE LANCEMENT PUBLIC (TO-DO)

L'application est techniquement terminée et 100% fonctionnelle. Cependant, pour qu'elle opère dans le monde réel, certaines actions administratives et d'infrastructure doivent être réalisées par la direction de PLEINGAZ.

#### A. Configurations des Paiements Mobile Money (Technique & Administratif)
**Ce qui a été fait :** Le code est prêt à traiter les paiements et inclut la sécurité (Idempotence, Webhooks).
**Ce qu'il reste à faire :**
1. Créer un compte "Marchand" chez MTN Cameroun et Orange Cameroun.
2. Obtenir de ces opérateurs les clés d'API de production (API Key, Subscription Key).
3. Insérer ces clés dans les variables d'environnement (`.env.prod`) du serveur.

#### B. Hébergement et Serveurs (Infrastructure)
**Ce qui a été fait :** Le projet est conteneurisé (Docker) et prêt à être déployé.
**Ce qu'il reste à faire :**
1. **Frontend (Site Web) :** Connecter le compte GitHub de PLEINGAZ à une plateforme comme **Vercel** ou **Netlify**. Le déploiement du site client se fera en 1 clic.
2. **Backend (API & Base de données) :** Louer un serveur privé virtuel (VPS chez Hostinger, AWS, ou DigitalOcean). Y installer **PostgreSQL** pour stocker les données, et y faire tourner l'API NestJS.
3. Lier le nom de domaine `www.pleingaz.cm` aux serveurs nouvellement créés.

#### C. Intégration SMS & WhatsApp
**Ce qui a été fait :** Le système de mot de passe par SMS (OTP) et les envois de reçus via WhatsApp sont programmés.
**Ce qu'il reste à faire :**
1. Acheter un pack SMS chez un agrégateur (comme Infobip, Twilio ou un agrégateur local camerounais).
2. Ajouter la clé d'API de ce fournisseur au serveur backend pour que les SMS partent réellement sur les téléphones camerounais.

#### D. Lancement en Phase Pilote (Pratique)
**Recommandation métier :**
Ne pas lancer l'application sur tout le Cameroun d'un seul coup.
1. Choisir **5 distributeurs de confiance** dans un seul quartier (Ex: Bonamoussadi à Douala).
2. Les former pendant 30 minutes (l'interface est très simple).
3. Lancer une campagne publicitaire uniquement sur ce quartier.
4. Observer les premières vraies commandes sur le Dashboard Admin, corriger les éventuels petits bugs logistiques, puis étendre au reste de la ville.

---
*Ce document a été généré automatiquement par le système d'Ingénierie PLEINGAZ.*
