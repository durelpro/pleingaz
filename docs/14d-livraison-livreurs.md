# 14d. Spécification de la Livraison, des Flottes de Livreurs et de la Double Confirmation

- **Statut** : VALIDÉ (CR-003 D-17, C-02)
- **Portée** : Flottes de livreurs, double confirmation de remise, tarification duale (1 000 F PLEINGAZ / tiers bornés) et interface mobile livreur.
- **Phase cible** : MVP (Phase 2 révisée).

---

## 1. Mécanisme de Double Confirmation de Livraison (D-17.1)

Le système antérieur reposant exclusivement sur la saisie d'un code PIN par le livreur est refondu au profit d'un mécanisme de **Double Confirmation Équilibrée** :

1. **Principe des deux boutons** :
   Une livraison n'est réputée achevée (`DELIVERED`) que lorsque le livreur **ET** le destinataire ont tous les deux validé la remise via un bouton d'action visible dans leurs interfaces respectives :
   - Côté Livreur : Bouton **« J'ai livré la commande »**.
   - Côté Destinataire (Espace Acheteur) : Bouton **« J'ai bien reçu ma commande »**.

2. **Cycle de vie des statuts de livraison étendue** :
   - `PENDING` -> `ASSIGNED` : Course attribuée à un livreur agréé.
   - `ASSIGNED` -> `PICKED_UP` : Le livreur a récupéré les bouteilles au point de vente.
   - `PICKED_UP` -> `IN_TRANSIT` : Le livreur est en route vers l'adresse client.
   - `IN_TRANSIT` -> `DELIVERED_PENDING_CONFIRMATION` : Le livreur clique sur « J'ai livré ».
   - `DELIVERED_PENDING_CONFIRMATION` -> `DELIVERED` : L'acheteur clique sur « J'ai reçu » -> Clôture définitive et déblocage des fonds.
   - `DELIVERED_PENDING_CONFIRMATION` -> `DISPUTED` : L'acheteur signale une anomalie (bouteille non reçue, détendeur manquant, montant contesté).
   - `DELIVERED_PENDING_CONFIRMATION` -> `CONFIRMED_BY_COURIER_ONLY` :
     Si le destinataire ne confirme pas dans un délai configurable (`courier_only_confirmation_timeout_hours = 24h` par défaut dans `Setting`), la commande bascule dans cet état d'attente. **Aucune clôture automatique silencieuse** : le dossier est examiné par le `LOGISTICS_MANAGER` ou un `ADMIN` qui tranche après vérification humaine et trace sa décision dans `AuditLog`.

3. **Preuves d'exécution et protection de la vie privée** :
   - Horodatages précis UTC des deux clics.
   - **Écart de distance approximatif (Distance Offset Check)** : Lors du clic livreur, l'application vérifie que la position du livreur se situe dans un rayon raisonnable de l'adresse de destination (ex: < 500 m). **Règle absolue (CR-001 D-02)** : Zéro coordonnée GPS exacte n'est persistée en base (seul un indicateur booléen `is_location_plausible: true` et l'écart grossier en mètres sont conservés).
   - **Code secret client maintenu en option** : Le code de confirmation à 4 chiffres reste activable dans `Setting` (`delivery_code_required = false` par défaut).

---

## 2. Grille Tarifaire et Flotte Officielle PLEINGAZ (D-17.2, C-02)

### 2.1 Boutique Mère et Modèle `PLEINGAZ_DIRECT` (C-02)
1. **Point de vente officiel** : Le siège / boutique mère de PLEINGAZ est enregistré sous le type spécifique `PLEINGAZ_DIRECT` (vente directe d'usine).
2. **Facturation propre** : Émission de factures dédiées portant la mention *« PLEINGAZ - Vente Directe »* avec une numérotation séquentielle autonome (`PG-DIR-YYYY-XXXXX`).
3. **Flotte de livreurs dédiée (`PLEINGAZ_STAFF`)** : Les livreurs salariés de PLEINGAZ sont rattachés directement au siège.

### 2.2 Tarification Fixe PLEINGAZ à 1 000 FCFA
- **Montant forfaitaire** : Toute livraison effectuée par un livreur de type `PLEINGAZ_STAFF` ou rattachée à une vente `PLEINGAZ_DIRECT` est facturée **1 000 FCFA TTC fixe**, quelle que soit la position du client à l'intérieur des zones desservies.
- **Gestion des Zones Desservies (C-02.3)** :
  L'expression *« quelle que soit la position »* s'applique strictement à l'intérieur du périmètre opérationnel défini dans `Setting` (ex: Douala métropole, Yaoundé urbain).
  Si l'adresse du client se situe hors zone couverte par la flotte PLEINGAZ :
  - Le système désactive l'option de livraison directe PLEINGAZ.
  - Un message clair informe l'utilisateur (*« La livraison directe PLEINGAZ ne dessert pas encore ce quartier »*) et lui propose les alternatives immédiates : livraison par un livreur de distributeur tiers ou retrait gratuit au point de vente le plus proche.
- **Versionnement du tarif** : Le tarif de 1 000 FCFA est stocké dans `Setting` (`delivery_pleingaz_fee`), modifiable exclusivement par un `ADMIN` avec date d'effet opposable.

### 2.3 Tarification des Livreurs Tiers (Distributeurs et Indépendants)
- Les livreurs rattachés aux distributeurs (`DISTRIBUTOR_COURIER`) ou indépendants (`INDEPENDENT`) fixent librement leurs tarifs de livraison par zone ou par palier kilométrique.
- **Bornes administratives obligatoires** : Les tarifs libres doivent obligatoirement respecter l'intervalle configuré par l'administration dans `Setting` (ex: `courier_fee_min_bound = 500 FCFA`, `courier_fee_max_bound = 3 000 FCFA`, À CONFIRMER).
- **Transparence totale pour l'acheteur** : Au moment de valider son panier, l'acheteur visualise les livreurs disponibles avec le montant exact de leur tarif. Le prix sélectionné est **figé sur la commande** et ne peut faire l'objet d'aucune surfacturation à l'arrivée.
- *Points À CONFIRMER* : Taux de commission prélevé par PLEINGAZ sur les courses de livreurs tiers et modalités de paie interne des livreurs PLEINGAZ.

---

## 3. Typologie des Comptes Livreurs et Agrément (D-17.3)

| Type de Livreur | Rattachement | Tarification appliquée | Validation |
|---|---|---|---|
| **`PLEINGAZ_STAFF`** | Siège PLEINGAZ (Flotte propre) | 1 000 FCFA fixe (Zones définies) | Validé en interne par l'administrateur |
| **`DISTRIBUTOR_COURIER`**| Rattaché à une boutique partenaire | Tarifs du distributeur dans les bornes admin | Enrôlé par le distributeur, validé par PLEINGAZ |
| **`INDEPENDENT`** | Prestataire de livraison autonome | Tarifs propres dans les bornes admin | Agrément KYC strict par `DISTRIBUTOR_MANAGER` / `ADMIN` |

### Dossier d'Agrément Livreur (Identique à CR-001 D-04) :
1. Pièce d'identité officielle recto/verso (`ID_CARD_FRONT`, `ID_CARD_BACK`).
2. Photo d'identité portrait récente (`PORTRAIT_PHOTO`).
3. Type de véhicule (`VehicleType`: `MOTO`, `VELO`, `VOITURE`, `PIED`) et immatriculation.
4. Deux numéros obligatoires : WhatsApp principal vérifié + contact secondaire de secours.
5. Statut : `PENDING` -> `APPROVED` -> `SUSPENDED`.

---

## 4. Espace Livreur Mobile PWA (`/livreur` — D-17.4)

Interface ultra-légère, mobile-first (< 30 Ko hors images), conçue pour fonctionner avec un réseau 3G instable et en mode hors-ligne partiel :

1. **Gestion des Missions** :
   - Onglet « Missions disponibles » : Notification sonore discrète lors d'une affectation, adresse avec repère textuel, point de vente source, délai d'acceptation (compte à rebours de 10 min configurable dans `Setting`).
   - Boutons : « Accepter la mission » / « Refuser ».
2. **Mission Active** :
   - Fiche épurée : Nom client, quartier, repère textuel précis, bouton d'appel téléphonique direct, bouton WhatsApp. **Données du client limitées à la stricte durée de la mission active**.
   - Références PLEINGAZ à transporter (ex: 1 Bouteille 12.5 kg avec échange de consigne vide).
   - Boutons de jalons :
     - `[ J'ai récupéré le gaz au dépôt ]` -> Passe la livraison à `PICKED_UP`.
     - `[ Je suis en route chez le client ]` -> Passe la livraison à `IN_TRANSIT`.
     - `[ J'ai livré la commande ]` -> Déclenche la double confirmation (`DELIVERED_PENDING_CONFIRMATION`).
     - `[ Échec de livraison ]` -> Saisie obligatoire du motif (`CLIENT_ABSENT`, `ADRESSE_INACCESSIBLE`, `REFUS_PAIEMENT`).
3. **Mes Gains et Solde Caisse Espèces (CR-001 D-05, D-06)** :
   - Relevé des courses exécutées et gains cumulés.
   - **Solde d'espèces détenu (`cashBalance`)** : Total des règlements en espèces encaissés à reverser à PLEINGAZ.
   - **Règle de suspension automatique** : Si le solde d'espèces dépasse le plafond configuré dans `Setting` (`max_cash_holding_courier = 50 000 FCFA` par défaut, À CONFIRMER), le livreur ne peut plus recevoir de nouvelle mission tant que sa dette n'a pas été reversée et rapprochée par la finance.
4. **Configuration des Tarifs** (Livreurs non-PLEINGAZ uniquement) :
   - Saisie de son barème de livraison dans les bornes autorisées par l'administrateur.

---

## 5. Endpoints de Livraison (`/api/v1/deliveries/*`)

| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| `GET` | `/api/v1/deliveries/available` | `COURIER` | Liste des missions proposées au livreur connecté. |
| `POST` | `/api/v1/deliveries/:id/accept` | `COURIER` | Acceptation de mission sous timeout d'assignation. |
| `POST` | `/api/v1/deliveries/:id/pickup` | `COURIER` | Prise en charge au point de vente (`PICKED_UP`). |
| `POST` | `/api/v1/deliveries/:id/transit` | `COURIER` | Départ en route vers le client (`IN_TRANSIT`). |
| `POST` | `/api/v1/deliveries/:id/complete` | `COURIER` | Validation premier bouton ("J'ai livré"). |
| `POST` | `/api/v1/deliveries/:id/dispute` | `CUSTOMER` | Signalement d'incident par le client (`DISPUTED`). |
| `POST` | `/api/v1/deliveries/:id/admin-resolve`| `LOGISTICS_MANAGER`, `ADMIN` | Clôture manuelle arbitrée après timeout unilatéral. |
| `PUT` | `/api/v1/deliveries/courier/rates`| `COURIER` (Tiers) | Mise à jour des tarifs du livreur (contrôle des bornes min/max). |
