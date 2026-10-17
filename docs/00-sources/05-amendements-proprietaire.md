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
