# Guide de Test et de Validation — PLEINGAZ (CR-003 & ADR D11–D18)

L'ensemble de la plateforme PLEINGAZ est **opérationnelle, démarrée et validée à 100%** (107/107 tests unitaires et E2E au vert).

---

## 🌐 État des Services en Cours d'Exécution

| Service | Adresse | Statut | Rôle |
|---|---|---|---|
| **Frontend Web Next.js** | `http://localhost:3000` | 🟢 Actif (200 OK) | Application Acheteur, Distributeur, Livreur PWA, Admin |
| **Backend API NestJS** | `http://localhost:3001` | 🟢 Actif (Port 3001) | API REST, Moteur Ledger, WhatsApp, Quotas, Sécurité |
| **PostgreSQL + PostGIS** | `localhost:5432` | 🟢 Healthy | 89 tables Prisma synchronisées |
| **Redis Cache & Queues** | `localhost:6379` | 🟢 Healthy | Rate limiter, BullMQ |

---

## 🧪 Scénarios de Test Pas-à-Pas

### 1. Inscription Acheteur WhatsApp & Règle des 2 Numéros (D-12)
* **URL** : [http://localhost:3000/register](http://localhost:3000/register)
* **Objectif** : Vérifier le flux Inbound WhatsApp et la séparation stricte du numéro d'appel et de WhatsApp.
* **Procédure** :
  1. Remplissez votre nom complet (ex: *Jean Dupont*), ville (*Douala*).
  2. Renseignez un numéro WhatsApp (ex: `699001122`).
  3. Si vous tentez de mettre le **même** numéro pour les appels voix, un avertissement vous bloque immédiatement (*D-12 : Le numéro d'appel doit être distinct pour joindre le client sans data mobile*).
  4. Renseignez un numéro voix distinct (ex: `677889900`).
  5. Cliquez sur **Continuer vers WhatsApp**.
  6. Le système génère un défi cryptographique `PG-XXXX` avec bouton direct `wa.me` pour envoyer le message d'activation, ou bouton de simulation locale instantanée.

---

### 2. Espace Acheteur : Jauge Quota 5 Bouteilles & Réassort (D-14)
* **URL** : [http://localhost:3000/account](http://localhost:3000/account)
* **Objectif** : Visualiser la consommation du ménage, la jauge anti-spéculation et les fonctionnalités de sécurité.
* **Éléments à observer** :
  * **Jauge Dynamique des Quotas** : Affiche le plafond réglementaire de **5 bouteilles / 30 jours glissants**.
  * **Bouton d'Urgence Fuite de Gaz (118 / 18)** : Action immédiate en rouge pour les consignes de sécurité pompiers.
  * **Réassort en 1 clic** : Recommande la dernière bouteille achetée au prix officiel de **6 500 FCFA**.
  * **Distributeur favori** : Statut du stock en direct à Bonapriso / Akwa.

---

### 3. Vente Directe au Comptoir & Reçu Immédiat (D-14, D-16)
* **URL** : [http://localhost:3000/distributor/counter](http://localhost:3000/distributor/counter)
* **Objectif** : Permettre au gérant de point de vente d'enregistrer un achat physique au comptoir.
* **Procédure de test** :
  1. Tapez le numéro du client : `699112233`.
  2. Le système interroge l'API NestJS en temps réel : `Quota disponible: 5 / 5 bouteilles`.
  3. Si vous augmentez la quantité au-delà de 5 bouteilles, le système **bloque la transaction** avec message d'interdiction réglementaire.
  4. Choisissez le mode de règlement : **Espèces** ou **Mobile Money**.
  5. Cliquez sur **Valider la vente**.
  6. Le reçu officiel **RCP-CS-...** est généré avec écriture comptable en partie double (`1010/7010`) et option d'impression papier thermique.

---

### 4. Commande en Ligne & Forfait Coursier Fixe (D-17)
* **URL** : [http://localhost:3000/checkout](http://localhost:3000/checkout)
* **Objectif** : Tester le calcul du prix officiel et le repère visuel obligatoire.
* **Points clés** :
  * Bouteille standard 12.5 kg : **6 500 FCFA** (subventionnée).
  * Forfait de livraison coursier : **1 000 FCFA fixe** (conformément à D-17).
  * Total exact : **7 500 FCFA**.
  * Champ repère visuel (Landmark) : *Ex: Face Pharmacie du Centre, portail bleu*.
  * Bouton de confirmation générant le **Code Secret Client à 4 chiffres**.

---

### 5. Application Mobile Livreur PWA (D-17)
* **URL** : [http://localhost:3000/delivery](http://localhost:3000/delivery)
* **Objectif** : Expérience coursier terrain optimisée pour smartphone.
* **Fonctionnalités à tester** :
  * Affichage de la course assignée avec le repère visuel mis en avant.
  * Boutons d'action rapide : Appel GSM direct (numéro voix) ou WhatsApp en 1 tap.
  * **Jauge d'encaissement espèces** : Limite de sécurité fixée à 50 000 FCFA max en poche.
  * Validation de la remise : Saisie obligatoire du **Code Secret 4 chiffres** remis par le client pour débloquer le bouton **"J'ai livré"**.

---

### 6. Panneau Support & Maker-Checker Changement de Téléphone (D-15)
* **URL** : [http://localhost:3000/admin/account-cases](http://localhost:3000/admin/account-cases)
* **Objectif** : Gestion des litiges et sécurité des comptes par le support client.
* **Points de contrôle** :
  * Masquage par défaut des coordonnées sensibles (RGPD / D-15.1).
  * Bouton **"Démasquer pour enquête"** : Déclenche une trace d'audit immuable (`account:unmask_phone`).
  * Déblocage de tentative (Lockout reset).
  * **Protocole Maker-Checker (D-15.2)** : L'agent support propose un nouveau numéro de téléphone avec motif, qui passe en statut `PENDING_REVIEW` et requiert obligatoirement la validation d'un superviseur distinct (`adminId !== agentId`).

---

### 7. Tiroir d'Annonces & Acquittement "J'ai compris" (D-18)
* **URL** : [http://localhost:3000/](http://localhost:3000/)
* **Objectif** : Communication administrative ciblée.
* **Action** :
  * Cliquez sur la **Cloche de notification** en haut à droite.
  * Le tiroir s'ouvre avec les alertes réglementaires (ex: rappel des prix officiels CSPH, consignes de sécurité).
  * Chaque annonce obligatoire comporte un bouton **"J'ai compris"** qui enregistre l'émargement de l'utilisateur en base de données.
