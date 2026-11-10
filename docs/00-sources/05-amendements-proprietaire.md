# Amendements du Propriétaire (CR-001)

Ce document constitue la source formelle de rang supérieur (Source X) intégrant les 6 décisions souveraines du propriétaire modifiant le produit. Ces exigences prévalent sur toute vision antérieure issue de `00-sources` en cas de divergence.

---

## D-01 : Catalogue exclusif PLEINGAZ

* **X-01.01** : Un catalogue UNIQUE géré exclusivement par l'administrateur (`Product`, `ProductCategory` : Bouteilles, Accessoires), reprenant le catalogue existant vérifié du site PLEINGAZ sans aucune invention de référence.
* **X-01.02** : Le distributeur ne crée, ne modifie, ne supprime aucun produit, description, photo ou prix ; il déclare uniquement l'état de stock qualitatif des références PLEINGAZ distribuées (`BON` / `MOYEN` / `FAIBLE` / `RUPTURE`) et ses options de livraison ; sélection stricte dans le catalogue lors de l'inscription.
* **X-01.03** : Prix publics et prix distributeurs fixés uniquement par l'administrateur (`ProductPrice`, `PriceHistory`, avec date d'effet) ; aucune fixation locale de prix ; promotions créées uniquement par l'administrateur ; recalcul systématique du prix par le serveur à la commande ; suppression ou neutralisation de toute entité de type `StoreProductOffer` à prix libre *(défaut appliqué, à confirmer)*.
* **X-01.04** : Intégrité BDD stricte : contrainte de clé étrangère obligatoire vers le catalogue (`OrderItem`, `InventoryItem`, `InvoiceItem` référencent obligatoirement un `Product` du catalogue) ; aucun champ libre de marque ou de dénomination produit.
* **X-01.05** : Exclusion formelle de la "marketplace" (vision section 59) et de toute vente de produits tiers, écartées du périmètre sur décision explicite du propriétaire.
* **X-01.06** : Assistant IA et base de connaissances : restreints exclusivement aux produits et services officiels PLEINGAZ ; refus courtois et systématique des demandes portant sur des marques concurrentes.
* **X-01.07** : Question ouverte à consigner : acceptation éventuelle de bouteilles vides d'autres marques agréées à l'échange lors de la consigne *(défaut appliqué, à confirmer)*.

---

## D-02 : Recherche : Localisation au clic + lieu choisi librement

* **X-02.01** : Déclenchement de la géolocalisation au clic uniquement (jamais au chargement de la page) avec affichage préalable d'une mention courte de consentement ("PLEINGAZ utilise votre position pour trouver les points de vente proches ; elle n'est pas conservée") ; rappel technique de l'obligation HTTPS et de l'autorisation native du navigateur non contournable.
* **X-02.02** : Résultats de recherche : distributeurs proches avec distance, état de stock qualitatif et fraîcheur explicite ("Stock confirmé il y a X minutes"), horaires, livraison, contact, classement multi-critères (pas la distance seule), avec mention explicite "Distance depuis : Ma position" ou "Distance depuis : <lieu choisi>".
* **X-02.03** : Lieu manuel toujours accessible ("Chercher ailleurs") : (a) choix d'une ville puis d'un quartier, (b) saisie d'un repère ou d'une adresse avec bouton explicite "Rechercher" (géocodage backend Nominatim bridé à 1 req/s, sans autocomplétion à la frappe, abstraction `GeocodingProvider`), (c) placement d'un point sur la carte interactive ; le lieu manuel prime sur le GPS jusqu'au clic sur "Ma position".
* **X-02.04** : Spécification des 8 états IHM : (1) autorisation accordée, (2) localisation en cours (timeout configurable), (3) autorisation refusée (repli saisie manuelle sans insister), (4) GPS indisponible ou erreur, (5) précision faible ("position approximative", invitation à ajuster), (6) lieu hors Cameroun ou hors zone de service, (7) aucun distributeur dans le rayon (élargir le rayon, alerte réapprovisionnement), (8) connexion faible (liste de secours texte à 20 Ko sans carte).
* **X-02.05** : Rayon de recherche par défaut configuré dans `Setting` (exemple illustratif : 5 km) avec sélection 2 / 5 / 10 km / "toute la ville" ; interdiction formelle de géolocalisation par adresse IP.
* **X-02.06** : Protection de la vie privée : coordonnées GPS précises non stockées par défaut, journalisation `SearchEvent` restreinte à une zone grossière (maille ou quartier), dernier lieu mémorisable sur l'appareil avec bouton d'effacement.
* **X-02.07** : Spécification API : `GET /api/v1/stores/search` avec validation stricte (bornes GPS, rayon maximum, pagination), journalisation sans coordonnées précises ; composant "Sélecteur de lieu" mobile, accessible, bilingue FR/EN.
* **X-02.08** : Assistant IA : demande la ville ou le quartier si non renseignés, peut proposer le bouton "Utiliser ma position", n'accède jamais à la position de manière autonome.
* **X-02.09** : Matrice de tests automatisés (06b) : autorisation refusée, délai GPS dépassé, changement manuel de lieu, coordonnées hors bornes, hors Cameroun, aucun résultat, réseau 3G dégradé, mobile.

---

## D-03 : Tous les comptes rendus dans l'administration, zéro donnée fictive

* **X-03.01** : Liste exhaustive des 15 rapports du Control Center dans l'administration uniquement : ventes, commandes (en attente, livrées), revenus/finances, paiements, stock déclaré, disponibilité, ruptures, distributeurs (validation, activité, stocks non actualisés), livreurs et livraisons, recherches sans résultat, demande par zone, satisfaction, incidents, audit, état de la plateforme ; pour chacun : métrique précise, entités sources, filtres, permissions requises, états vide/erreur/chargement, export PDF/CSV/Excel audité, fraîcheur ("Calculé le ... à ...").
* **X-03.02** : Cloisonnement strict des profils : acheteurs, distributeurs et livreurs ne voient que leurs données opérationnelles propres sans aucun rapport agrégé ; le distributeur voit un relevé personnel en lecture seule (commandes, commissions retenues, reversements reçus) *(défaut appliqué, à confirmer)*.
* **X-03.03** : Zéro donnée fictive : aucune valeur codée en dur, aucun graphique d'exemple, aucun jeu de démonstration en production ; seeds DEMO étiquetés `is_demo` réservés au dev et exclus des calculs ; bandeau visible en préproduction ; maquettes marquées "exemple illustratif" ; pages publiques sans chiffres inventés.
* **X-03.04** : Traitement des états vides : message explicite par écran ("Aucune commande pour le moment", "Aucun distributeur en attente"), compteurs à 0 réel distincts d'une erreur de chargement.
* **X-03.05** : MVP de l'administration sur données réelles : file de validation distributeurs et livreurs, commandes, stocks non actualisés, livraisons en cours, finances de base, audit, santé système ; analyses avancées (heatmaps, prévisions) reportées en phase 9.
* **X-03.06** : Test automatisé bloquant (06b) : base de données VIDE -> tous les écrans d'administration s'affichent sans erreur ni valeur inventée.

---

## D-04 : Documents du distributeur : trois seulement

* **X-04.01** : `DistributorDocument.type` strictement limité à `ID_CARD_FRONT`, `ID_CARD_BACK` *(recto et verso obligatoires par défaut, à confirmer)*, `PORTRAIT_PHOTO`, `SHOP_PHOTO` ; suppression totale de toute mention de registre de commerce, NIU ou documents administratifs.
* **X-04.02** : Spécifications techniques upload : formats JPEG, PNG, WebP ; taille maximale et dimensions minimales dans `Setting` (exemples illustratifs) ; compression côté client pour connexions faibles ; reprise sur coupure ; brouillon sauvegardé ; scan antivirus ; suppression des métadonnées EXIF (GPS inclus) à l'enregistrement.
* **X-04.03** : Confidentialité renforcée : pièces d'identité et photo portrait privées (bucket S3 isolé, URL signées courte durée, accès par permission dédiée audité) ; photo du lieu de vente publique après approbation (redimensionnée) ; consentement explicite ; durée de conservation après rejet ou clôture de compte à confirmer.
* **X-04.04** : Écran de validation administrateur : consultation sécurisée des 3 documents, localisation confirmée, infos boutique ; checklist (nom CNI = nom compte, photo cohérente, lieu réel) ; décisions `APPROVED` / `REJECTED` (motif obligatoire) / demande d'information complémentaire ; journal d'audit.
* **X-04.05** : UX mobile : capture caméra guidée, prévisualisation, messages d'erreur simples en français.
* **X-04.06** : Question juridique ouverte : vérifier avec un juriste si une autorisation de vente de gaz est exigée par la réglementation camerounaise *(à consigner dans OPEN_QUESTIONS.md)*.

---

## D-05 : Livreurs sur la plateforme

* **X-05.01** : Profil livreur créé et validé par l'administrateur (invitation ou candidature validée, non rattaché en direct aux distributeurs) ; cumul acheteur/livreur permis sur un même numéro ; statut (`PENDING`, `APPROVED`, `SUSPENDED`, `INACTIVE`), disponibilité (`EN_LIGNE`, `HORS_LIGNE`), zones, véhicule, contact ; documents CNI et portrait identiques à D-04 *(défaut appliqué, à confirmer)*.
* **X-05.02** : Interface mobile livreur dédiée et légère : liste "à faire", fiche mission (repère, point carte, références PLEINGAZ, échange bouteille, contact masqué/WhatsApp), actions accepter/refuser, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED` avec code client, `FAILED` avec motif, gains, mode hors ligne partiel et reprise.
* **X-05.03** : Attribution des courses : manuelle par l'administrateur ou le `LOGISTICS_MANAGER` avec suggestion automatique (zone, disponibilité, charge) ; délai d'acceptation et réattribution automatique ; livreur `APPROVED` obligatoire ; suivi GPS temps réel plus tard (H), statuts seuls au MVP.
* **X-05.04** : Minimisation des données : données client strictement nécessaires à la course active ; masquage immédiat après remise ; jamais d'accès à l'historique complet client.
* **X-05.05** : Frais et rémunération : barème versionné fixé uniquement par l'administrateur (`FeeSchedule`) ; calcul système ; paiement sous contrôle admin.
* **X-05.06** : Espèces à la livraison : encaissement par le livreur ; enregistrement "espèces collectées" ; remise à PLEINGAZ ; plafond d'espèces détenues (`Setting`), rappels, suspension automatique selon règle explicite ; rapprochement par l'administrateur.
* **X-05.07** : Modèle de données logistique : `Courier`, `CourierZone`, `CourierAvailability`, `DeliveryAssignment`, `DeliveryFeeSchedule`, `CashCollection`, `CourierPayout` ; réutilisation de `Delivery` ; machines à états avec transitions interdites.
* **X-05.08** : Permissions RBAC : rôle LIVREUR (`COURIER`) ajouté au RBAC (portant le total à 9 rôles) ; permissions `courier:*` ; permissions logistiques pour `LOGISTICS_MANAGER` ; notifications mission et client (livreur en route, code de remise).
* **X-05.09** : Écrans administrateur logistique : liste et validation des livreurs, carte, performance (taux de succès, délai moyen), incidents, espèces en circulation.
* **X-05.10** : Matrice de tests logistique (06b) : livreur non approuvé, mission d'un autre livreur, code de confirmation erroné, double livraison, espèces non remises, réattribution sur expiration.

---

## D-06 : Finances contrôlées par l'administrateur

* **X-06.01** : Barèmes financiers versionnés : `ProductPrice`, `FeeSchedule` (commission, livraison, rémunération livreur, politique `fee_bearer`) avec date d'effet, historique, jamais rétroactifs ; principe de séparation des tâches maker-checker (proposé par un rôle, approuvé par un autre).
* **X-06.02** : Grand livre immuable à écriture double : `LedgerAccount`, `LedgerEntry` pour toute opération financière (vente, paiement, frais opérateur, commission, remboursement, créance espèces, reversement, rémunération livreur) ; invariants débit = crédit, aucune suppression ni modification, correction par écriture inverse, clôture journalière.
* **X-06.03** : Reversements (`PayoutBatch`) créés par `FINANCE_MANAGER` ; approbation par un second rôle (`ADMIN` ou `SUPER_ADMIN`) au-delà d'un seuil configurable ; exécution manuelle au MVP avec référence et preuve ; statuts stricts ; rapprochement avec relevés réels opérateurs ; export audité.
* **X-06.04** : Remboursements : demande, approbation, exécution, motif, plafond ; `LATE_SUCCESS` traité par remboursement par défaut ; avoirs (`CreditNote`) créés uniquement par `FINANCE_MANAGER`.
* **X-06.05** : Gestion des créances espèces : suivi par distributeur et par livreur, plafonds d'alerte, suspension automatique configurable.
* **X-06.06** : Factures immuables : émises uniquement par le système, numérotation séquentielle par vendeur, inaltérables par distributeurs ou livreurs.
* **X-06.07** : Matrice de séparation des tâches : tableau permissions x rôles financiers (`price:propose`, `price:approve`, `fee:propose`, `fee:approve`, `payout:create`, `payout:approve`, `refund:request`, `refund:approve`, `ledger:view`, `cash:reconcile`, `report:view_finance`) garantissant qu'un créateur n'approuve jamais son propre acte.
* **X-06.08** : Tableau de bord financier sur données réelles : encaissements, commissions, créances, reversements dus, remboursements, espèces en circulation, écarts de conciliation ; alertes automatiques.
* **X-06.09** : Sécurité financière : TOTP obligatoire, sessions courtes, traçabilité `AuditLog`, alertes actions sensibles, break-glass `SUPER_ADMIN` audité ; analyse des menaces de fraude interne, collusion et détournement dans 06a.
* **X-06.10** : Cohérence transversale de la conception : mise à jour des machines à états (`PayoutBatch`, `Payout`, `Refund`, `CashCollection`), immutabilité 03c, tests finance 06b, matrice RBAC 02.

---

## D-11 : Accès authentifié obligatoire et espaces étanches par profil (CR-003)

* **X-11.01** : Zéro action métier sans compte authentifié : consultation des stocks, commande, mise à jour de boutique, mission de livraison et assistance exigent une session active valide.
* **X-11.02** : Espaces de travail totalement étanches par profil avec URL dédiées : `/acheteur`, `/distributeur`, `/livreur`, `/staff/cases`, `/staff/control-center`.
* **X-11.03** : Principe d'isolation 404 : toute tentative d'accès inter-espaces ou vers des données non autorisées retourne strictement un code HTTP 404 (ressource inexistante) sans révéler l'existence de l'entité.
* **X-11.04** : Isolation cryptographique des tokens d'accès : claim d'audience `aud` strict par espace (`aud: "pleingaz:buyer"`, `aud: "pleingaz:distributor"`, etc.) avec rejet immédiat en cas d'incohérence.
* **X-11.05** : Accès personnel staff masqué : aucune mention de l'administration sur la landing page publique, URL d'infrastructure masquée sous double facteur TOTP obligatoire.
* **X-11.06** : Rôle unique actif par session utilisateur : le cumul de rôles sur un même numéro WhatsApp exige une sélection explicite de l'espace à la connexion.
* **X-11.07** : Matrice de cloisonnement des profils et des données documentée dans la spécification `14b-espaces-et-isolation.md`.
* **X-11.08** : Tests d'étanchéité automatisés : vérification de l'absence de fuite de données inter-profils et du statut 404 sur toutes les routes croisées.

---

## D-12 : Inscription et connexion gratuites par WhatsApp (CR-003)

* **X-12.01** : Authentification et inscription 100% gratuites pour l'usager, sans mot de passe à mémoriser, basées sur l'application WhatsApp.
* **X-12.02** : Architecture de preuve entrante (Option A) : l'usager clique sur un lien `wa.me` préparé et envoie un défi aléatoire chiffré au numéro officiel de PLEINGAZ pour prouver la détention de la ligne.
* **X-12.03** : Saisie obligatoire de deux numéros de téléphone au format E.164 : un numéro WhatsApp (`whatsappPhone`) et un numéro d'appel vocal (`callPhone`) pour la joignabilité logistique.
* **X-12.04** : Hashage des codes et défis temporaires sous Argon2id avant stockage en base avec durée de validité TTL de 10 minutes.
* **X-12.05** : Purge automatique des défis expirés ou consommés sous 24 heures et journalisation de sécurité anti-rejeu.
* **X-12.06** : Fournisseur SMS de secours optionnel en cas d'indisponibilité temporaire du réseau WhatsApp avec pavé de saisie 6 chiffres.
* **X-12.07** : Analyse des menaces spécifiques (SIM swap, usurpation de numéro, rejeu de webhooks) et contre-mesures intégrées.
* **X-12.08** : Environnement de test local : implémentation d'un canal simulé (`SimulatedChannel`) permettant d'exécuter les tests unitaires et E2E sans dépendance externe.

---

## D-13 : Refonte créative de l'expérience, charte graphique inchangée (CR-003)

* **X-13.01** : Respect strict et intègre de l'identité visuelle historique extraite de `monpleingaz.com` : Rouge `#FF0000` / `#DC2626`, Jaune-orangé `#FFB000`, Blanc et Montserrat.
* **X-13.02** : Refonte ergonomique complète axée sur la modernité, l'ultra mobile-first et la lisibilité sur smartphones en conditions de faible connectivité au Cameroun.
* **X-13.03** : Conformité WCAG 2.1 Niveau AA calculée et vérifiée sur toutes les combinaisons de couleurs texte/surface.
* **X-13.04** : Bibliothèque de composants atomiques légers et expressifs : boutons tactiles >= 48px, cartes de bouteilles, badges de statut unifiés.
* **X-13.05** : Prototypes autonomes statiques HTML/CSS pur exécutables sans dépendances complexes, avec poids inférieur à 50 Ko par page.
* **X-13.06** : Formulations d'au moins 12 propositions d'innovation R11 documentées au format PROBLÈME / SOLUTION / VALEUR / COMPLEXITÉ / PRIORITÉ.

---

## D-14 : Espace acheteur très simple avec jauge et tableau de bord (CR-003)

* **X-14.01** : Tableau de bord acheteur minimaliste, épuré et compréhensible en un coup d'œil, centré sur la recharge rapide de gaz.
* **X-14.02** : Jauge visuelle de quota obligatoire affichant la consommation sur une fenêtre glissante de 30 jours (seuil : 5 bouteilles maximum pour les particuliers).
* **X-14.03** : Bouton de réassort express "1-Clic" mémorisant la bouteille habituelle, l'adresse par défaut et le distributeur favori (C-01).
* **X-14.04** : Affichage transparent du distributeur habituel avec statut de stock en temps réel et horaires d'ouverture.
* **X-14.05** : Tunnel de commande express en 4 étapes fluides (bouteille, repère de quartier, livraison, confirmation).
* **X-14.06** : Blocage automatique et explicite de toute commande dépassant le plafond légal de 5 bouteilles avec indication de la date de déblocage.
* **X-14.07** : Bouton d'alerte sécurité d'urgence "Odeur suspecte / Fuite de gaz" affichant les consignes vitales immédiates.
* **X-14.08** : Reçus et factures numériques téléchargeables et expédiés par notification WhatsApp.

---

## D-15 : Rôle et profil Gestionnaire de Compte encadré (CR-003)

* **X-15.01** : Création du rôle distinct `ACCOUNT_MANAGER` dédié à l'assistance opérationnelle de premier niveau pour les acheteurs et distributeurs.
* **X-15.02** : Interdiction absolue et techniquement verrouillée de toute usurpation d'identité (*impersonation*) : le gestionnaire ne peut jamais agir sous le profil d'un usager.
* **X-15.03** : Zéro mutation directe sur les données utilisateurs : toute intervention d'assistance exige la création préalable d'un dossier formel `AccountCase`.
* **X-15.04** : Motif obligatoire et pièces justificatives consignés pour chaque dossier ouvert sous peine de rejet automatique par le backend.
* **X-15.05** : Principe Maker-Checker strict : les actions sensibles (extension de quota, déblocage de solde, modification de coordonnées) requièrent l'approbation d'un `ADMIN`.
* **X-15.06** : Inaccessibilité totale aux identifiants d'authentification : le gestionnaire n'a aucun accès aux mots de passe, tokens ou défis de connexion.
* **X-15.07** : Journalisation intégrale et immuable de chaque consultation et action d'assistance dans le journal d'audit `AuditLog`.
* **X-15.08** : Machine à états stricte pour les dossiers d'assistance : `OPEN` -> `PROPOSED` -> `ADMIN_APPROVED` -> `APPLIED` -> `CLOSED`.

---

## D-16 : Visibilité de TOUTES les transactions pour l'administrateur et vente comptoir (CR-003)

* **X-16.01** : Visibilité exhaustive et centralisée dans le Control Center de l'administrateur de l'intégralité des flux financiers et physiques du réseau.
* **X-16.02** : Intégration native du mode "Vente au comptoir" (`CounterSale`) : encaissement physique direct en boutique par le distributeur.
* **X-16.03** : Numéro de téléphone acheteur obligatoire lors de la vente au comptoir pour rattachement au compte et vérification du quota légal.
* **X-16.04** : Contrôle pré-vente du quota 5 bouteilles au comptoir : rejet immédiat avec code d'erreur `QUOTA_EXCEEDED` en cas de dépassement.
* **X-16.05** : Génération instantanée d'un reçu fiscal dématérialisé pour les ventes directes au comptoir avec envoi automatique sur WhatsApp.
* **X-16.06** : Enregistrement obligatoire et immuable de chaque vente au comptoir dans le Grand Livre comptable (`LedgerEntry`).
* **X-16.07** : Rapprochement journalier automatique entre le stock physique déclaré et les flux de vente (comptoir vs livraison).
* **X-16.08** : Clôture de caisse quotidienne pour les distributeurs et consolidation dans les rapports de gestion administrateur.

---

## D-17 : Livraison avec double confirmation obligatoire (CR-003)

* **X-17.01** : Clôture de mission de livraison par double confirmation contradictoire obligatoire : validation par le livreur ET validation par l'acheteur.
* **X-17.02** : Horodatage certifié des deux actions : enregistrement de `livreurConfirmedAt` puis de `clientConfirmedAt`.
* **X-17.03** : Déclenchement de la facturation et du crédit de rémunération livreur (1 000 FCFA) uniquement après double validation effective.
* **X-17.04** : Procédure de clôture unilatérale de secours en cas d'absence de réponse de l'acheteur : délai de carence minimum de 30 minutes, géolocalisation livreur conforme à l'adresse et validation par un administrateur.
* **X-17.05** : Tarif standard de livraison fixe de 1 000 FCFA pour la flotte PLEINGAZ dans la zone urbaine couverte.
* **X-17.06** : Liberté tarifaire bornée pour les livreurs tiers et courses hors zone sous plafond fixé dans `Setting`.
* **X-17.07** : PWA livreur légère, tactile et fluide, utilisable en conditions extérieures sur deux-roues motorisé.
* **X-17.08** : Masquage automatique et instantané des données de contact client (`callPhone`) sur le terminal livreur dès validation de la course.

---

## D-18 : Rubrique "Infos" ciblée par profil avec accusé de lecture (CR-003)

* **X-18.01** : Composant "Infos / Annonces" intégré sur chaque espace utilisateur (`/acheteur`, `/distributeur`, `/livreur`, staff).
* **X-18.02** : Ciblage fin des annonces par rôle utilisateur, zone géographique (ville/quartier) et niveau de criticité (`INFO`, `WARNING`, `CRITICAL`).
* **X-18.03** : Bouton d'accusé de lecture explicite "J'ai compris" obligatoire pour les annonces importantes afin de libérer l'espace visuel.
* **X-18.04** : Enregistrement de chaque accusé de lecture dans l'entité `InfoNoticeRead` avec horodatage et identifiant usager.
* **X-18.05** : Principe Maker-Checker pour la publication d'annonces à l'échelle du réseau (création par un gestionnaire, validation par un administrateur).
* **X-18.06** : Tableau de bord de suivi du taux de lecture et de prise de connaissance des consignes opérationnelles et de sécurité.

