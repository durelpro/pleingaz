# Contraintes BDD et Modèle Économique

## 1. Contraintes Critiques par Entité

### 1.1 `Payment`
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). `order_id` (Unique). |
| **Clés Étrangères**| `order_id` (Ref: Order). |
| **CHECK** | `CHECK (amount > 0 AND currency = 'XAF')` (Entier). |
| **Index** | Index sur `status` et `created_at`. |
| **Immutabilité** | Immuable dès le passage à `SUCCESS` ou `FAILED`. |
| **Rétention** | 10 ans légal. Pas de suppression. |

### 1.2 `PaymentTransaction`
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). `gateway_ref` (Unique, ex: ID de transaction MTN/Orange). |
| **Clés Étrangères**| `payment_id` (Ref: Payment). |
| **CHECK** | `CHECK (fee >= 0 AND operator_fee >= 0)` (Stocke les frais réels exacts). |
| **Index** | Index sur `gateway_ref` pour les réconciliations. |
| **Immutabilité** | Strictement immuable à la création. Insert-only. |
| **Rétention** | 10 ans légal. |

### 1.3 `IdempotencyKey`
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `key` (PK, string générée par le front). `payment_id` (Unique). |
| **Clés Étrangères**| `payment_id` (Ref: Payment) optionnel si la tentative échoue avant création. |
| **CHECK** | - |
| **Logique** | `INSERT INTO idempotency_key (key) VALUES (...) ON CONFLICT DO NOTHING`. PostgreSQL garantit le verrouillage concurrentiel. JAMAIS DANS REDIS. |
| **Immutabilité** | Lecture seule après insertion. |
| **Rétention** | Purge asynchrone (cron) après 7 jours. |

### 1.4 `PaymentWebhookEvent`
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `event_hash` (PK, hash SHA-256 du payload complet). |
| **Clés Étrangères**| - |
| **CHECK** | - |
| **Logique** | `INSERT ... ON CONFLICT DO NOTHING`. Si conflit = Rejeu détecté, on ignore silencieusement. |
| **Immutabilité** | Strictement immuable. |
| **Rétention** | 6 mois (audit technique court terme). |

### 1.5 `Invoice`
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). `UNIQUE (vendor_id, sequence_no)`. 1 facture par `order_id` (Unique). |
| **Clés Étrangères**| `order_id` (Ref: Order), `vendor_id` (Ref: Store ou Plateforme). |
| **CHECK** | - |
| **Index** | Index sur `created_at`. |
| **Immutabilité** | Immuable dès le statut `ISSUED`. Avoir (CreditNote) exigé pour toute modification de dette. |
| **Rétention** | 10 ans légal. |

### 1.6 `InvoiceSequence`
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `vendor_id` (PK). |
| **Clés Étrangères**| `vendor_id` (Ref: Store ou Plateforme). |
| **CHECK** | `CHECK (current_val >= 0)`. |
| **Logique** | `UPDATE invoice_sequence SET current_val = current_val + 1 WHERE vendor_id = $1 RETURNING current_val`. Garantit l'absence de trou/doublon sous concurrence forte. |
| **Immutabilité** | Mutable (Compteur). |
| **Rétention** | Permanente. |

### 1.7 `StockReservation`
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). |
| **Clés Étrangères**| `order_id` (Ref: Order), `store_id` (Ref: Store), `product_id` (Ref: Product). |
| **CHECK** | `CHECK (expires_at > created_at)` et `CHECK (quantity > 0)`. |
| **Logique** | Vérifier la dispo : `SELECT SUM(quantity) FROM inventory WHERE ...` MOINS `SELECT SUM(quantity) FROM stock_reservation WHERE expires_at > NOW() AND status = 'RESERVED'`. |
| **Immutabilité** | Statut mutable (`RESERVED` -> `EXPIRED`/`CONFIRMED`). |
| **Rétention** | Hard delete (purge auto via cron) après 30 jours (EXPIRED/CANCELLED). |

### 1.8 `Inventory`
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). `UNIQUE (store_id, product_id)`. |
| **Clés Étrangères**| `store_id` (Ref: Store), `product_id` (Ref: Product). |
| **CHECK** | `CHECK (status IN ('BON', 'MOYEN', 'FAIBLE', 'RUPTURE'))`. |
| **Index** | Index sur `last_updated_at` (utilisé pour la fraîcheur). |
| **Immutabilité** | Mutable. |
| **Rétention** | Permanente. L'historique va dans `InventoryUpdate`. |

### 1.9 `Order`
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). |
| **Clés Étrangères**| `customer_id` (Ref: User), `store_id` (Ref: Store). |
| **CHECK** | - |
| **Index** | Index sur `customer_id` et `status`. |
| **Immutabilité** | Mutable via la machine à états stricte. |
| **Rétention** | Soft delete uniquement. |

### 1.10 `UserRole`
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). `UNIQUE (user_id, role_id, scope_type, scope_id)`. |
| **Clés Étrangères**| `user_id`, `role_id`. |
| **CHECK** | - |
| **Index** | Index sur `user_id`. |
| **Immutabilité** | Mutable (Révocable). |
| **Rétention** | Soft delete (conservation des logs d'accès). |

### 1.11 `DistributorDocument`
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). `UNIQUE (distributor_id, type)`. |
| **Clés Étrangères**| `distributor_id`. |
| **CHECK** | - |
| **Logique** | Fichiers chiffrés au repos sur le bucket. Isolation des URL. |
| **Immutabilité** | Mutable (Mise à jour d'un doc rejeté). |
| **Rétention** | Hard delete immédiat si demande RGPD ("Droit à l'oubli"). |

### 1.12 `AuditLog`
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK, UUID v7 ou TSID pour tri temporel natif). |
| **Clés Étrangères**| `user_id` (Nullable, si système). |
| **CHECK** | - |
| **Index** | `user_id`, `action`, `created_at`. |
| **Immutabilité** | Strictement immuable. Ne doit JAMAIS faire l'objet d'un `UPDATE` ou `DELETE`. |
| **Rétention** | Permanente (ou archivage à froid après N années). |

---

## 2. Modèle Économique : Alternatives et Impacts

L'architecture est "Configuration-Driven". Une table `Setting` permet de basculer entre les modes sans migration de code lourde. L'hypothèse de travail centrale est : **L'encaissement est centralisé chez PLEINGAZ, qui reverse (Settlement) au distributeur après livraison, avec support du paiement espèces local.**

### 2.1 Tableau : Impact des Décisions

| Décision Métier | Impact Modèle / Base de données |
|---|---|
| **Qui encaisse ? (Centralisé vs Direct)** | Modifie le `vendor_id` de l'`Invoice` et le sens du `Settlement` (Plateforme doit Vendeur, ou Vendeur doit Plateforme). Géré par configuration. |
| **Qui paie les frais ? (fee_bearer)** | Le champ `fee_bearer` (`PLATFORM`, `SELLER`, `CUSTOMER`) dans `PaymentTransaction` ajuste dynamiquement le Total Facture vs Total Payé. Les frais réels exacts sont stockés. |
| **Prix : National vs Libre** | Si `National`, l'API lit `ProductPrice`. Si `Libre`, l'API vérifie en priorité `StoreProductOffer`. Géré par une feature flag. |
| **Livraison : Interne vs Externe** | Les `Coursiers/livreurs` peuvent être assignés au niveau `Store` (employés) ou au niveau global (partenaires indépendants). Géré par le scope du `UserRole`. |
| **Consigne** | Si l'utilisateur paie la bouteille, une ligne "Deposit" est ajoutée à l'`Invoice` et déclenche un `CylinderMovement` de type `OUT`. **(À CONFIRMER)** |

### 2.2 Paiement en Espèces (Recouvrement)
1. Le client paie le distributeur de la main à la main lors du retrait.
2. L'encaissement est validé **uniquement** quand le client remet au distributeur un "Code de Confirmation de Remise" généré sur son interface. *(Ce n'est pas un SMS OTP, c'est un code visuel à 4-6 chiffres).*
3. Le distributeur saisit ce code. Le système marque `Order` comme `DELIVERED` et le `Payment` comme `CASH_PAID`.
4. L'espèce étant dans la caisse du distributeur, la commission PLEINGAZ est insérée comme une **créance/dette** dans `Settlement` (Le distributeur doit X FCFA à PLEINGAZ).
5. PLEINGAZ se rembourse en prélevant sur les Payouts futurs des ventes Mobile Money, ou bloque temporairement le distributeur si la dette dépasse un seuil.
6. *Désaccord* : Si le distributeur refuse de valider le code (ex: affirme ne pas avoir reçu l'argent), le client ou le distributeur ouvre un `Report`. L'ordre passe en litige, gelant la comptabilité jusqu'à résolution par le support.

---

## 3. Stock et Logistique Locale

- **Multi-Boutique** : Un distributeur (entité `DistributorProfile`) peut posséder **plusieurs boutiques** (`Store`). Chaque boutique possède son propre `Inventory`.
- **Modèle de Fraîcheur** : Calculée dynamiquement. Si `last_updated_at` < 2h, affiché "Frais/Vérifié récemment". Sinon, la fiabilité baisse visuellement.
- **Sources de mise à jour** (`InventoryUpdate.source`) :
  1. `declared_manual` : Saisie manuelle par le gérant ("J'ai 5 bouteilles").
  2. `one_click_confirm` : Bouton "Mon stock est toujours à ce niveau".
  3. `deducted_auto` : Décrémentation après commande. Si l'algo voit `deducted_auto` s'empiler pendant 3 jours sans validation manuelle, le stock est jugé "non fiable" et requiert l'intervention du gérant.

---

## 4. Décisions Urgentes à Confirmer avec PLEINGAZ

Ces décisions bloquent la finalisation des algorithmes de paiement et de facturation :

1. **Consigne et Gestion des Bouteilles (Urgent)** : Vendez-vous uniquement le gaz (échange de bouteille vide) ou le client paie-t-il un "dépôt" pour une nouvelle consigne ? Si consigne, appartient-elle au distributeur ou à PLEINGAZ ? (Impact : Modélisation des lignes de factures et créances).
2. **Liberté des prix (StoreProductOffer)** : Les distributeurs ont-ils le droit de fixer leur propre prix de vente par produit, ou le prix public est-il strict et national ? (Impact : Requêtes de recherche et filtrage).
3. **Recouvrement Espèces** : Le mécanisme de constitution de dette (Settlement) décrit en 2.2 est-il validé pour la gestion des paiements espèces ?
4. **Logistique** : Les coursiers/livreurs sont-ils des employés de la boutique, des indépendants, ou des livreurs PLEINGAZ ? (Impact : Matrice RBAC et règles d'affectation des livraisons).
