# CR-003 — Lot 1 : Analyse d'impact, registre des changements, questions bloquantes et plan d'exécution

- **Branche** : `docs/cr-003-acces-et-espaces`
- **Référence** : Décisions D-11 à D-18, compléments C-01 à C-07, règles d'exécution CR-003.
- **Statut** : En attente de validation de l'utilisateur (Point d'arrêt STOP Lot 1).

---

## 1. Analyse d'impact globale (D-11 à D-18 & C-01 à C-07)

L'intégration des décisions D-11 à D-18 prévaut sur toute documentation antérieure (CR-001 inclus) là où elles divergent. L'impact se structure en 6 axes majeurs :

1. **Cloisonnement strict et modèle "Zéro Fuite" (D-11, C-05, C-06)** :
   - Fermeture totale du domaine public : seule la page d'accueil (`/`), les pages légales/aide et les 3 portails d'accès (`/acheteur`, `/distributeur`, `/livreur`) sont accessibles hors session. L'URL du personnel PLEINGAZ est non référencée et protégée par TOTP.
   - Disparition complète du "sélecteur d'espace" : 1 numéro WhatsApp = 1 seul type d'espace opérationnel.
   - Isolation étanche : bundles JS scindés, 404 automatique en cas de requête hors audience du jeton JWT, messages d'erreurs d'authentification strictement uniformes (anti-énumération).
   - Matrice de visibilité détaillée créée dans `docs/14h-matrice-visibilite.md`.

2. **Refonte de l'authentification et preuve entrante WhatsApp (D-12, C-04)** :
   - Remplacement de l'OTP SMS payant par une vérification entrante WhatsApp 100% gratuite côté PLEINGAZ (`VerificationChannel`).
   - Deux numéros obligatoires : WhatsApp principal (identifiant unique vérifié) + contact secondaire de secours (rappel humain/perte).
   - Implémentation du channel de dev/test `SimulatedChannel` (affichage console, zéro coût).

3. **Expérience acheteur simplifiée & régulation des approvisionnements (D-14, C-01, C-03)** :
   - Limite stricte de **5 bouteilles** de gaz sur une fenêtre glissante (30 jours par défaut, dans `Setting`), avec réservation atomique et libération en cas d'annulation.
   - Intégration des ventes au comptoir dans le décompte de cette limite (D-16).
   - Tableau de bord ergonomique épuré : jauge de quota, historique d'achats chez chaque distributeur (`C-01`), réapprovisionnement en 1 clic.

4. **Nouveau rôle "Gestionnaire de compte" (ACCOUNT_MANAGER) (D-15, C-07)** :
   - Rôle dédié au déblocage d'accès, traitement de perte de numéro et assistance, agissant **exclusivement sous couvert d'un dossier ouvert (`AccountCase`)**.
   - **Interdiction absolue d'usurpation ("voir comme") ou de modification directe des données** : toute mutation sensible (changement de numéro) constitue une demande soumise à double validation par un `ADMIN`.

5. **Traçabilité totale des flux, y compris au comptoir (D-16, D-17, C-02)** :
   - Les ventes physiques en boutique doivent être enregistrées par le distributeur (mode "vente au comptoir") et confirmées par l'acheteur pour entrer dans la traçabilité et le respect de la limite des 5 bouteilles.
   - Double confirmation de livraison obligatoire : bouton livreur "J'ai livré" + bouton client "J'ai reçu ma commande" pour solder la mission (`DELIVERED`). Code PIN relégué en option.
   - Grille tarifaire de livraison duale : forfait fixe **1 000 FCFA** pour la flotte PLEINGAZ (`PLEINGAZ_STAFF` / `PLEINGAZ_DIRECT`) ; tarifs libres bornés par l'admin pour les livreurs partenaires (`DISTRIBUTOR_COURIER`, `INDEPENDENT`).

6. **Canal de diffusion contextuel "Infos" (D-18)** :
   - Module d'annonces administratives ciblées (rôles, zones, comptes spécifiques) présent sur chaque espace avec traçabilité d'accusé de lecture ("J'ai compris").

---

## 2. Registre des changements de décision

| Décision antérieure (Vision / CR-001) | Nouvelle décision propriétaire (CR-003 D-11 à D-18) | Documents touchés |
|---|---|---|
| **Visiteur non connecté** : exploration libre du catalogue, recherche géolocalisée et carte interactive sans compte. | **Accès authentifié obligatoire** : seule la page d'accueil, mentions légales et formulaires de connexion sont publics. `public_discovery_enabled = false` (réversible). Recherche, carte, prix et IA exigent une session. | `02 §1.1`, `03 §2`, `04 §4`, `05c`, `12 §2`, `14b`, `DECISIONS` (ADR D6/D11) |
| **Profils multiples & sélecteur** : 1 compte utilisateur pouvant basculer entre profil acheteur, distributeur ou livreur via un switch UI. | **Un numéro = un seul type d'espace** (défaut). Aucun sélecteur ni menu d'autre profil. Changement de type uniquement via action administrateur auditée. | `02 §1`, `03 §1`, `03c §1.10`, `04 §1`, `14b`, `DECISIONS` (ADR D11) |
| **Authentification par OTP SMS** : envoi de code SMS automatisé lors de la connexion/commande. | **WhatsApp entrant gratuit** : Preuve entrante (`VerificationChannel`) par message prérempli de l'utilisateur vers PLEINGAZ. SMS classé hors MVP (coût récurrent éliminé). Deux numéros obligatoires (principal + secours). | `02 §1.2`, `04 §8`, `05b §1`, `06a §1`, `06c M12`, `14a`, `DECISIONS` (ADR D12) |
| **Confirmation de livraison par code secret** : passage à `DELIVERED` subordonné uniquement à la saisie du code PIN client 4-6 chiffres. | **Double confirmation par boutons** : livreur ("J'ai livré") + destinataire ("J'ai reçu"). Le code PIN devient une option paramétrable. Gestion explicite du litige (`DISPUTED`) et clôture auditée. | `02 §2.4`, `03b §7`, `04 §10.5`, `05a §2`, `12 §5`, `14d`, `DECISIONS` (ADR D9/D17) |
| **Barème de livraison fixé par l'admin** : `FeeSchedule` national centralisé unique (CR-001 D-05). | **Tarification duale** : PLEINGAZ fixe à 1 000 FCFA pour ses agents / vente directe ; tarifs libres configurés par les livreurs tiers dans des bornes min/max fixées par l'admin. | `03 §1`, `03c §1.15`, `04 §10.5`, `05a §1`, `12 §5`, `14d`, `DECISIONS` (ADR D17) |
| **Points importés (CR-002)** : points de vente pré-enregistrés visibles publiquement. | **Cloisonnement des points importés** : visibles strictement par les acheteurs connectés, selon les mêmes règles de confidentialité. | `02 §1.1`, `04 §4`, `14b` |
| **Périmètre des transactions Admin** : suivi limité aux commandes en ligne et approvisionnements formels. | **Registre exhaustif incluant le comptoir** : enregistrement des ventes physiques en boutique (`CounterSale`) pour imputation dans la limite de 5 bouteilles et détection d'écarts de stock. | `03 §1`, `03b`, `03c`, `05a §1`, `14f`, `DECISIONS` (ADR D16) |

---

## 3. Paramètres métier par défaut (marqués "À CONFIRMER", aucun inventé)

Conformément à la règle D (rien d'inventé, seules les valeurs données font foi : 5 bouteilles max, 1 000 FCFA livraison PLEINGAZ), les variables suivantes sont modélisées dans `Setting` sous forme de paramètres dynamiques versionnés :

| Paramètre | Clé dans Setting | Valeur par défaut proposée | Statut de la valeur |
|---|---|:---:|:---:|
| Limite bouteilles acheteur | `buyer_bottle_limit` | **5** | **Fixé par propriétaire (D-14)** |
| Tarif livraison PLEINGAZ | `delivery_pleingaz_fee` | **1 000 FCFA** | **Fixé par propriétaire (D-17, C-02)** |
| Fenêtre glissante limite d'achat | `buyer_limit_window_days` | 30 jours | À CONFIRMER (exemple illustratif) |
| Durée validité défi WhatsApp | `verification_challenge_ttl_minutes` | 10 minutes | À CONFIRMER (exemple illustratif) |
| Délais avant clôture unilatérale livraison | `courier_only_confirmation_timeout_hours` | 24 heures | À CONFIRMER (exemple illustratif) |
| Borne min livraison tiers | `courier_fee_min_bound` | 500 FCFA | À CONFIRMER (exemple illustratif) |
| Borne max livraison tiers | `courier_fee_max_bound` | 3 000 FCFA | À CONFIRMER (exemple illustratif) |
| Délai de sécurité changement numéro | `phone_change_cooldown_hours` | 48 heures | À CONFIRMER (exemple illustratif) |
| Seuil fraîcheur stock "Info ancienne" | `stock_freshness_threshold_hours` | 48 heures | À CONFIRMER (exemple illustratif) |
| Durée rétention adresses IP de session | `audit_ip_retention_days` | 90 jours | À CONFIRMER (juriste / ANTIC) |

---

## 4. Les 5 Questions Bloquantes (Soumises au Propriétaire)

1. **Option du flux WhatsApp entrant (C-04)** :
   - *Option A (Recommandée)* : Le site génère un code court unique (ex: `PG-8492`) lié à la session. Le bouton ouvre WhatsApp avec ce code prérempli vers le bot PLEINGAZ. L'utilisateur envoie le message ; le webhook associe immédiatement le numéro expéditeur à la session navigateur qui s'actualise en temps réel.
   - *Option B* : L'utilisateur envoie un mot-clé (ex: "CONNEXION"), le bot répond par un code PIN à 6 chiffres que l'utilisateur doit retaper sur le site web.
   *Confirmez-vous le choix de l'**Option A**, qui minimise les erreurs de saisie sur smartphone ?*

2. **Portée de la limite de 5 bouteilles pour les clients professionnels (D-14, C-03)** :
   La limite stricte de 5 bouteilles s'applique aux particuliers. Pour les clients professionnels (restaurants, blanchisseries, boulangeries) :
   - Doit-on introduire un sous-type de profil acheteur professionnel (`CUSTOMER_PRO`) avec un quota paramétrable plus élevé (ex: 20 ou 50 bouteilles) validé manuellement par le gestionnaire de compte, ou applique-t-on le plafond de 5 à tous les comptes sans exception au MVP ?

3. **Conditions de refus d'une vente au comptoir si quota dépassé (D-16, C-03)** :
   Lorsqu'un client se présente chez un distributeur et que le décompte temps réel indique qu'il a déjà atteint son quota de 5 bouteilles :
   - Le système doit-il bloquer strictement l'enregistrement de la vente (`QUOTA_EXCEEDED`), ou autoriser l'enregistrement en marquant une alerte administrative d'anomalie sans refuser la transaction physique ?

4. **Zones de couverture de la livraison PLEINGAZ à 1 000 FCFA (C-02)** :
   Le tarif forfaitaire de 1 000 FCFA s'applique-t-il strictement au périmètre urbain délimité de Douala et Yaoundé (zones configurées dans `Setting`), ou sans aucune restriction kilométrique dès lors qu'une commande est prise en charge par `PLEINGAZ_STAFF` ?

5. **Impact SEO de la fermeture publique sur le trafic local (D-11)** :
   Avec `public_discovery_enabled = false`, les pages locales d'annuaire (ex: `/points-de-vente/douala/akwa`) ne seront pas indexables par Google car protégées derrière authentification. Confirmez-vous que la priorité de traçabilité et de sécurité l'emporte sur l'acquisition SEO naturelle hors connexion pour la phase pilote ?

---

## 5. Plan d'Exécution Détaillé par Lots

### Lot 1 (Actuel)
- [x] Analyse d'impact complète & registre des changements de décision.
- [x] Établissement de la liste des paramètres par défaut.
- [x] Formalisation des 5 questions bloquantes.
- [ ] **STOP** : Attente de validation formelle de l'utilisateur.

### Lot 2 : Fondations d'accès, WhatsApp & Cloisonnement
- Création de `docs/14a-auth-whatsapp.md` (flux WhatsApp entrant, double numéro, `VerificationChannel`, SimulatedChannel, mot de passe Argon2id, récupération, menaces).
- Création de `docs/14b-espaces-et-isolation.md` (portails `/acheteur`, `/distributeur`, `/livreur`, URL admin masquée, bundles distincts, 404 inter-espaces, règles "aucune trace").
- Mises à jour ciblées : `02` (sitemap, sémantique d'isolation), `03` (modèle `User`, `VerificationChallenge`, `Session`), `03b` (cycles auth), `03c` (contraintes auth), `04` (architecture token audience, proxy), `06a` (menaces social engineering WhatsApp, SIM swap).
- Commit ciblé + push + `git status -sb`. STOP.

### Lot 3 : Espaces Métier, Opérations & Traçabilité
- Création de `docs/14c-espace-acheteur.md` (D-14, jauge 5 bouteilles, réapprovisionnement, historique par distributeur C-01).
- Création de `docs/14d-livraison-livreurs.md` (D-17, double confirmation, flotte PLEINGAZ 1 000 F C-02, livreurs indépendants).
- Création de `docs/14e-gestionnaire-de-compte.md` (D-15, rôle `ACCOUNT_MANAGER`, entité `AccountCase`, limitation stricte sans usurpation C-07).
- Création de `docs/14f-transactions-et-comptoir.md` (D-16, module vente au comptoir, décompte quota, détection écarts).
- Création de `docs/14g-infos-annonces.md` (D-18, composant Infos, ciblage, accusés de lecture).
- Mises à jour ciblées : `05a` (facturation comptoir & livraison), `05b` (notifications WhatsApp in-session), `06b` (tests concurrence limite 5), `06c` (M/H tags), `07` (deux numéros, durées IP/logs).
- Commit ciblé + push + `git status -sb`. STOP.

### Lot 4 : Design System, Charte Graphique & Innovation R11
- Création de `docs/design/charte-graphique.md` (valeurs extraites #FF0000, #FFB000, dégradés du site, Montserrat, ratios WCAG).
- Création de `docs/design/design-system.md` (direction créative, composants, états vides, micro-interactions).
- Création de `docs/design/landing.md` (spécification page d'accueil 3 étapes par profil, FAQ, rassurance, sans liens admin).
- Création de `docs/design/plan-test-utilisabilite.md` (scénarios 5 testeurs, temps < 60s).
- Rédaction des 12 propositions d'amélioration R11 au format standardisé.
- Commit ciblé + push + `git status -sb`. STOP.

### Lot 5 : Prototypes Statiques Autonomes (HTML/CSS Pur)
- Développement dans `design/prototypes/` sans framework ni dépendance externe :
  1. `index.html` (Landing page publique).
  2. `portails-auth.html` (Portails acheteur, distributeur, livreur avec modal WhatsApp).
  3. `home-acheteur.html` (Dashboard client, jauge 5 bouteilles, réassort, distributeurs).
  4. `home-distributeur.html` (Mise à jour stock 1 clic, comptoir, commandes).
  5. `home-livreur.html` (Missions, double confirmation).
  6. `home-gestionnaire.html` (Dossiers `AccountCase`, pas de modification directe).
  7. `parcours-commande.html` (Tunnel 4 écrans fluide).
- Validation des contrastes WCAG AA et poids ultra-léger (< 50 Ko hors images).
- Commit ciblé + push + `git status -sb`. STOP.

### Lot 6 : Traçabilité Finale, Contrôles & Clôture
- Création / mise à jour de `docs/00-sources/05-amendements-proprietaire.md` (exigences X-11 à X-18).
- Mise à jour chirurgicale de `docs/08-tracabilite.md` (nouvelles lignes X, correction des discordances S/A/N/P/V).
- Exécution et validation de `scripts/check-trace.sh` (garantie zéro erreur).
- Création de `docs/14h-matrice-visibilite.md` (cloisonnement intégral par rôle).
- Tag git `cr-003-v1`, push global, walkthrough de livraison final.
