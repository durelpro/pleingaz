# 14f. Spécification du Registre Unique des Transactions et du Mode Vente au Comptoir

- **Statut** : VALIDÉ (CR-003 D-16)
- **Portée** : Traçabilité financière exhaustive, registre Control Center et module d'enregistrement des ventes physiques en boutique ("Vente au comptoir").
- **Phase cible** : MVP (Phase 2 révisée).

---

## 1. Registre Unique des Transactions (Control Center — D-16.1)

Le Control Center Administrateur intègre un **Registre Centralisé des Flux Financiers**, offrant une vision à 360° de l'activité économique de la plateforme. Ce registre ne comporte aucune donnée simulée et s'appuie directement sur le Grand Livre immuable à partie double (CR-001 D-06) :

1. **Typologie Exhaustive des Transactions Enregistrées** :
   - Règlements de commandes en ligne par Mobile Money (MTN MoMo, Orange Money).
   - Règlements de commandes à la livraison payés en espèces (suivi `CashCollection`).
   - **Ventes physiques au comptoir** en boutique déclarées par les distributeurs (`CounterSale`).
   - Commandes d'approvisionnement B2B passées par les distributeurs à PLEINGAZ.
   - Frais de livraison collectés et rétributions des livreurs.
   - Remboursements de clients (`Refund`, avoirs `CreditNote`).
   - Lots de reversements périodiques payés aux partenaires (`PayoutBatch`).

2. **Filtres Multidimensionnels et Relevés** :
   - Période temporelle (Date de début à Date de fin, affichage Africa/Douala).
   - Zone géographique (Ville, Quartier).
   - Partenaire impliqué (Distributeur agréé spécifique, Livreur).
   - Référence produit PLEINGAZ (Bouteille 12.5 kg, 6 kg, détendeur).
   - Moyen de règlement (Mobile Money, Espèces).
   - Statut de rapprochement comptable (`MATCHED`, `PENDING_RECONCILIATION`, `DISPUTED`).

3. **Sécurité et Habilitations d'Accès** :
   - Consultation restreinte strictement aux rôles **`FINANCE_MANAGER`**, **`ADMIN`** et **`SUPER_ADMIN`**.
   - Tout export de données (CSV, Excel, PDF) génère obligatoirement un enregistrement synchrone dans `AuditLog` mentionnant l'identité de l'opérateur, les filtres appliqués et le nombre de lignes extraites.

---

## 2. Mode "Vente au Comptoir" (Distributeurs — D-16.2)

Pour que les achats physiques réalisés directement dans les boutiques soient comptabilisés dans le suivi des stocks et régulés par le quota des 5 bouteilles, les distributeurs disposent d'un module dédié dans leur espace (`/distributeur/comptoir`) :

```
+---------------------------------------------------------------------------------+
|  NOUVELLE VENTE AU COMPTOIR                                                      |
|  Étape 1 : Identifier l'acheteur                                                |
|  [ Scanner le QR Code de l'acheteur ]  ou  [ Saisir le n° WhatsApp (+237...) ]  |
+---------------------------------------------------------------------------------+
|  Acheteur identifié : Paul K.                                                   |
|  Quota actuel : 2 / 5 bouteilles consommées (3 autorisées)                      |
+---------------------------------------------------------------------------------+
|  Étape 2 : Produits PLEINGAZ                                                    |
|  [+] 1 x Recharge Bouteille 12.5kg (6 500 FCFA)                                 |
|  Total à percevoir : 6 500 FCFA                                                 |
|  Moyen de règlement : (o) Espèces en boutique   ( ) Paiement MoMo direct        |
+---------------------------------------------------------------------------------+
|  [ VALIDER LA VENTE ] -> En attente de confirmation de l'acheteur               |
+---------------------------------------------------------------------------------+
```

### 2.1 Déroulement Opérationnel et Règle Anti-Dépassement
1. **Identification de l'acheteur** :
   L'acheteur présente son **Code QR personnel** (affiché dans son espace acheteur mobile) ou communique son numéro WhatsApp principal vérifié.
2. **Contrôle automatique du Quota AVANT Enregistrement (Question 3 validée)** :
   Le système interroge immédiatement le service de quota. Si l'acheteur a déjà atteint son plafond de 5 bouteilles sur la fenêtre glissante de 30 jours :
   - Le système **bloque strictement l'enregistrement** (`QUOTA_EXCEEDED`).
   - L'écran affiche un message explicite : *« Quota réglementaire atteint (5/5 bouteilles). Prochaine disponibilité le [Date] »*.
   - Aucune vente au comptoir de bouteilles de gaz ne peut être validée pour cet acheteur sans dérogation administrative préalable.
3. **Double Confirmation de la Vente au Comptoir** :
   - Le distributeur valide la saisie : la transaction passe au statut `PENDING_BUYER_CONFIRMATION`.
   - L'acheteur reçoit une notification instantanée dans son espace web (ou un message d'acquittement WhatsApp) : *« Dépôt Akwa Nord déclare une vente de 1 Bouteille 12.5kg pour 6 500 FCFA. Confirmez-vous cet achat ? »*.
   - Dès que l'acheteur clique sur « Je confirme », la vente passe à `CONFIRMED`, le stock de la boutique est décrémenté, et le quota de l'acheteur est mis à jour.
   - Si l'acheteur ne confirme pas ou conteste, la vente bascule en `REJECTED` ou expire après 2 heures (`EXPIRED`). Elle reste tracée pour l'analyse des écarts.

4. **Inscription Assistée en Boutique (D-16.2)** :
   Si un client physique ne possède pas encore de compte acheteur, le distributeur peut l'aider à créer son profil depuis la boutique :
   - **Règle absolue de confidentialité** : L'acheteur doit valider lui-même la preuve WhatsApp entrante depuis son propre téléphone. Le distributeur ne saisit ni ne voit **jamais le mot de passe** personnel du client.

---

## 3. Détection des Écarts et Pistes d'Audit (D-16.3)

Le système implémente un moteur d'analyse des écarts de flux pour détecter les comportements frauduleux ou les ventes non déclarées :

1. **Équation de Réconciliation Théorique** :
   $$\Delta \text{Stock} = \text{Approvisionnements reçus de PLEINGAZ} - (\text{Commandes en ligne livrées} + \text{Ventes au comptoir confirmées})$$
2. **Alertes de Discordance** :
   Si le stock déclaré par le distributeur (`BON`, `MOYEN`, etc.) ou son inventaire physique diverge de manière substantielle et récurrente du volume d'approvisionnement livré par PLEINGAZ :
   - Une alerte prioritaire est notifiée au `DISTRIBUTOR_MANAGER` et aux auditeurs financiers.
   - L'application ne procède à **aucune sanction automatisée** : les mesures de suspension ou de contrôle sur place relèvent exclusivement d'une décision humaine collégiale documentée dans `AuditLog`.
3. **Obligations Contractuelles** :
   La déclaration sincère de toute vente physique au comptoir constitue une obligation contractuelle d'agrément des distributeurs PLEINGAZ (termes juridiques À CONFIRMER avec le conseil légal).

---

## 4. Endpoints de Gestion du Comptoir (`/api/v1/counter-sales/*`)

| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| `POST` | `/api/v1/counter-sales/check-quota` | `DISTRIBUTOR_STAFF`, `DISTRIBUTOR_OWNER` | Vérification du quota acheteur avant enregistrement. |
| `POST` | `/api/v1/counter-sales` | `DISTRIBUTOR_STAFF`, `DISTRIBUTOR_OWNER` | Enregistrement d'une vente physique en boutique. |
| `POST` | `/api/v1/counter-sales/:id/buyer-confirm`| `CUSTOMER` | Confirmation par l'acheteur de son achat au comptoir. |
| `POST` | `/api/v1/counter-sales/:id/buyer-reject` | `CUSTOMER` | Rejet / Contestation de la vente déclarée par l'acheteur. |
| `GET` | `/api/v1/admin/transactions/registry` | `FINANCE_MANAGER`, `ADMIN` | Registre global des transactions unifié avec filtres et pagination. |
| `POST` | `/api/v1/admin/transactions/export` | `FINANCE_MANAGER`, `ADMIN` | Export audité du registre (CSV / Excel). |
