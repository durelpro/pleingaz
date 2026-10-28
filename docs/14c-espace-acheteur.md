# 14c. Spécification de l'Espace Acheteur, Tableau de Bord et Régulation des Achats

- **Statut** : VALIDÉ (CR-003 D-14, C-01, C-03)
- **Portée** : Expérience acheteur simplifiée, tableau de bord, historique par distributeur, quota de 5 bouteilles et anti-contournement.
- **Phase cible** : MVP (Phase 2 révisée).

---

## 1. Principes Ergonomiques et Navigation Épurée

L'espace Acheteur (`/acheteur`) est conçu pour être accessible aux utilisateurs novices sur smartphones Android d'entrée de gamme au Cameroun :
1. **Navigation restreinte à 5 entrées maximum** (barre inférieure sur mobile / bandeau supérieur sur écran large) :
   - `Accueil` : Tableau de bord personnel, statut de commande en cours, raccourcis de commande.
   - `Trouver du gaz` : Moteur de recherche géolocalisé au clic (CR-001 D-02) ou sélection manuelle de la zone (Ville -> Quartier -> Repère).
   - `Mes commandes` : Suivi en direct, double confirmation de réception ("J'ai reçu ma commande"), annulation possible tant que non confirmée.
   - `Mes factures` : Reçus et factures d'achat immuables au format PDF.
   - `Aide` : Canaux d'assistance directe (Bouton d'appel téléphonique, Click-to-Chat WhatsApp d'urgence, Assistant RAG contrôlé).
2. **Cloisonnement "Aucune Trace" (D-11.5)** :
   Aucun onglet, sélecteur ni mention des profils distributeur, livreur ou administration. Zéro jargon commercial ou technique.

---

## 2. Spécification Détaillée du Tableau de Bord (`/acheteur/dashboard`)

Le tableau de bord ne comporte **aucune donnée fictive**. Les blocs affichent exclusivement des valeurs réelles issues de la base de données ou des états vides explicites :

```
+-------------------------------------------------------------------+
|  [Logo PLEINGAZ]   (Infos: 1)                     [Mon Profil]    |
+-------------------------------------------------------------------+
|  Bonjour, Paul !                                                  |
|  Quota : [====      ] 2/5 bouteilles utilisées (3 disponibles)    |
|  (Prochaine libération : 1 bouteille le 12 novembre à 14:00)       |
+-------------------------------------------------------------------+
|  +-------------------------------------------------------------+  |
|  |           [ J'AI BESOIN DE GAZ MAINTENANT ]                 |  |
|  +-------------------------------------------------------------+  |
+-------------------------------------------------------------------+
|  COMMANDE EN COURS (#PG-9482)                                     |
|  Statut : [En cours de livraison par Jean M.]                      |
|  [Suivi animé : Préparation > Prise en charge > En route]        |
|  Bouton : [ J'AI BIEN REÇU MA COMMANDE ]                          |
+-------------------------------------------------------------------+
|  RECOMMANDER MA DERNIÈRE COMMANDE (Recharge 12.5kg - 6 500 FCFA)  |
|  [Recommander en 1 clic]                                          |
+-------------------------------------------------------------------+
|  MES DISTRIBUTEURS HABITUELS                                       |
|  +-------------------------------------------------------------+  |
|  | Dépôt Akwa Nord (à 650 m) - Stock : [BON (il y a 2h)]       |  |
|  | Mon historique : 4 commandes sur 12 mois                    |  |
|  | [Commander]   [Appeler]   [WhatsApp]   [Itinéraire]         |  |
|  +-------------------------------------------------------------+  |
+-------------------------------------------------------------------+
|  PRODUITS OFFICIELS PLEINGAZ (Prix centralisés)                   |
|  [Bouteille 12.5kg : 6 500 F]  [Bouteille 6kg : 3 200 F] ...       |
+-------------------------------------------------------------------+
|  RUBRIQUE INFOS (Annonces administratives ciblées)                 |
+-------------------------------------------------------------------+
```

### Modules constitutifs du Tableau de Bord :
1. **Salutation & Jauge de Quota** :
   - Indique clairement le nombre de bouteilles acquises sur la période glissante (ex: *« 2 bouteilles sur 5 utilisées »*).
   - Date et heure précises de la prochaine libération de quota calculée par le serveur.
2. **Bouton Principal "J'ai besoin de gaz"** :
   - Bouton de premier plan (hauteur minimale 56 px, contraste WCAG AA) déclenchant la recherche de proximité immédiate.
3. **Mes Distributeurs Habituels (C-01)** :
   - Liste triée des points de vente les plus commandés par cet acheteur sur les 90 derniers jours, complétée par ses distributeurs mis en favoris.
   - **Encart "Mon historique avec ce distributeur"** : Données 100% réelles du client connecté (date de dernière commande, total des commandes sur 12 mois, références commandées, lien direct vers les factures correspondantes).
   - *État vide explicite* : Si l'acheteur n'a jamais commandé chez un distributeur affiché : *"Vous n'avez pas encore commandé chez ce distributeur"*.
   - Indicateur qualitatif de stock en temps réel (`BON`, `MOYEN`, `FAIBLE`, `RUPTURE`) avec mention de fraîcheur (*"Confirmé il y a 2h"* ; au-delà du seuil `Setting` : *"Information ancienne"* — R6).
4. **Recommander ma dernière commande** :
   - Raccourci en 1 clic rechargeant le panier avec les mêmes références et le même distributeur, après vérification temps réel de la disponibilité du stock.
5. **Commande en cours avec Suivi Animé** :
   - Progression visuelle de l'état : `CONFIRMED` -> `PREPARING` -> `PICKED_UP` -> `IN_TRANSIT` -> `DELIVERED_PENDING_CONFIRMATION`.
   - Bouton d'action proéminent : **« J'ai reçu ma commande »** (Double confirmation D-17).
   - Bouton de signalement d'incident (*« Signaler un problème »*).
6. **Panneau Infos (D-18)** :
   - Affichage des alertes et informations ciblées sur la ville/quartier de l'acheteur.

---

## 3. Régulation de la Limite d'Achat (CR-003 D-14, C-03)

### 3.1 Définition et Portée de la Règle Métier
- **Paramètre central** : `buyer_bottle_limit = 5` dans `Setting` (seule valeur autorisée au MVP).
- **Unité de compte** : Strictement une bouteille de gaz (catégorie `Bouteilles`), quelle que soit sa contenance (6 kg, 12.5 kg, etc.). Les accessoires (détendeurs, tuyaux, brûleurs) sont **strictement exclus** de ce plafond.
- **Fenêtre temporelle** : Fenêtre glissante de **30 jours** par défaut (`buyer_limit_window_days = 30` dans `Setting`, À CONFIRMER).
- **Périmètre d'application** : S'applique à tous les comptes `CUSTOMER`. Ne s'applique pas aux commandes grossistes des distributeurs vers PLEINGAZ.
- **Comptes Professionnels (`CUSTOMER_PRO` — Question 2 validée)** :
  Possibilité pour l'administration d'attribuer un profil acheteur professionnel vérifié (restaurants, blanchisseries) avec un quota adapté paramétrable dans `Setting` (ex: 20 ou 50 bouteilles), instruit formellement par le gestionnaire de compte et validé par un `ADMIN`.

### 3.2 Contrôle Atomique et Concurrence
Le décompte des 5 bouteilles est calculé strictement côté serveur via une transaction SQL isolée (`SERIALIZABLE` ou verrou pessimiste `SELECT ... FOR UPDATE`) :

```sql
-- Calcul du quota consommé sur la fenêtre glissante
SELECT COALESCE(SUM(oi.quantity), 0) AS used_bottles
FROM "Order" o
JOIN "OrderItem" oi ON oi.order_id = o.id
JOIN "Product" p ON p.id = oi.product_id
JOIN "ProductCategory" c ON c.id = p.category_id
WHERE o.customer_id = :userId
  AND c.slug = 'bouteilles'
  AND o.status NOT IN ('CANCELLED', 'FAILED')
  AND o.created_at >= (NOW() - INTERVAL '30 days');
```

1. **Réservation temporaire à la création de commande** :
   Dès la soumission d'une commande (`SUBMITTED`), les bouteilles sont réservées dans le quota. Si `used_bottles + requested_quantity > 5`, la commande est **immédiatement rejetée** avec le code d'erreur standard `LIMIT_EXCEEDED` et l'affichage de la date exacte de déblocage.
2. **Libération atomique** :
   En cas d'annulation (`CANCELLED`), d'expiration du paiement ou d'échec de livraison, le quota réservé est libéré instantanément.
3. **Inclusion des Ventes au Comptoir (D-16)** :
   Toute bouteille achetée en boutique et enregistrée via le mode comptoir est décomptée au même titre qu'une commande en ligne.
4. **Dérogation Administrative Exceptionnelle** :
   Un `ADMIN` peut accorder une dérogation temporaire (nombre de bouteilles autorisées, motif d'urgence, date d'expiration). L'opération génère une ligne ineffaçable dans `AuditLog`.

### 3.3 Dispositif Anti-Contournement et Limites Honnêtes (C-03.2)
- **Règles techniques de détection** :
  - **Unicité stricte du numéro WhatsApp principal** : Un seul compte acheteur par numéro E.164.
  - **Cloisonnement du numéro de secours** : Le `backupPhone` d'un compte ne peut être utilisé comme `phone` principal par un tiers.
  - **Détection des comptes liés (Algorithme de corrélation heuristique)** :
    Le système surveille les signaux concordants : même numéro secondaire, même adresse avec repère textuel identique, même empreinte d'appareil `DeviceFingerprint`, fréquence anormale de commandes groupées.
  - **Action en cas de soupçon** : Déclenchement d'une alerte au Control Center pour revue humaine. **Jamais de blocage automatisé arbitraire** afin de préserver l'accès des foyers innocents partageant un même repère géographique.
- **Transparence et Limites Honnêtes** :
  En l'absence de vérification formelle de la pièce d'identité des acheteurs (recherche d'une friction minimale pour le grand public), un utilisateur disposant de plusieurs cartes SIM physiques et de repères textuels différents peut théoriquement créer plusieurs comptes. La détection repose sur les alertes de croisement d'adresses et la vigilance des distributeurs lors de la remise.

---

## 4. Parcours Utilisateur Novice (Commande en 4 Écrans)

1. **Écran 1 : Choix de la bouteille** :
   Affichage des 2 références majeures (12.5 kg et 6 kg) avec leur prix officiel immuable en gros caractères (ex: `6 500 FCFA`). Bouton « Commander ».
2. **Écran 2 : Mode de réception & Point de vente** :
   - Choix : *« Je me fais livrer »* (1 000 F PLEINGAZ ou tarif livreur) ou *« Je retire en boutique »* (Gratuit).
   - Sélection du distributeur le plus proche disposant de stock `BON`.
   - Option de livraison : affichage clair des frais de livraison **AVANT validation** (figé sur la commande).
3. **Écran 3 : Adresse & Repère local** :
   Confirmation de l'adresse de livraison et du repère textuel prérempli (ex: *« Face École Publique Akwa »*).
4. **Écran 4 : Confirmation & Paiement** :
   Choix du moyen de paiement (Mobile Money MTN/Orange ou Espèces à la remise). Récapitulatif sans frais cachés. Bouton « Valider ma commande ».
- **Annulation simplifiée** : L'acheteur dispose d'un bouton direct « Annuler ma commande » tant que le distributeur n'a pas validé la préparation.
- **Reprise après coupure réseau** : L'état du panier et de la commande en cours est conservé localement (`localStorage` chiffré) ; l'application reprend automatiquement dès reconnexion.

---

## 5. Endpoints de l'Espace Acheteur (`/api/v1/customer/*`)

| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| `GET` | `/api/v1/customer/dashboard` | `CUSTOMER` | Synthèse tableau de bord (quota, jauge, distributeurs habituels C-01). |
| `GET` | `/api/v1/customer/quota` | `CUSTOMER` | Détail atomique du quota consommé, réservé et date de prochaine libération. |
| `GET` | `/api/v1/customer/frequent-stores` | `CUSTOMER` | Liste des distributeurs habituels avec historique personnel d'achats. |
| `POST` | `/api/v1/customer/orders` | `CUSTOMER` | Création de commande avec vérification atomique du quota des 5 bouteilles. |
| `POST` | `/api/v1/customer/orders/:id/confirm-receipt` | `CUSTOMER` | Double confirmation de livraison ("J'ai reçu ma commande" D-17). |
| `POST` | `/api/v1/customer/orders/:id/cancel` | `CUSTOMER` | Annulation de commande avant acceptation et libération immédiate du quota. |
| `GET` | `/api/v1/customer/invoices` | `CUSTOMER` | Relevé des factures PDF immuables de l'acheteur. |
