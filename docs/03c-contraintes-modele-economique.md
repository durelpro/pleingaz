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
| **Rétention** | 10 ans légal (**À CONFIRMER** avec obligations comptables). Pas de suppression. |

### 1.2 `PaymentTransaction`
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). `gateway_ref` (Unique, ex: ID de transaction MTN/Orange). |
| **Clés Étrangères**| `payment_id` (Ref: Payment). |
| **CHECK** | `CHECK (fee >= 0 AND operator_fee >= 0)` (Stocke les frais réels exacts). |
| **Index** | Index sur `gateway_ref` pour les réconciliations. |
| **Immutabilité** | Strictement immuable à la création. Insert-only. |
| **Rétention** | 10 ans légal (**À CONFIRMER** avec obligations comptables). |

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
| **Rétention** | 10 ans légal (**À CONFIRMER** avec obligations fiscales/comptables). |

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

### 1.11 `DistributorDocument` (CR-001 D-04)
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). `UNIQUE (distributor_id, type)`. |
| **Clés Étrangères**| `distributor_id` (Ref: DistributorProfile). |
| **CHECK** | `CHECK (type IN ('ID_CARD_FRONT', 'ID_CARD_BACK', 'PORTRAIT_PHOTO', 'SHOP_PHOTO'))` (3 pièces exclusives : CNI recto/verso, portrait, boutique). |
| **Logique** | Fichiers chiffrés au repos sur bucket S3 privé (pièces d'identité) ou public après approbation (boutique). Purge systématique des métadonnées EXIF (GPS). Accès via URL signées 15 min. |
| **Immutabilité** | Mutable en cas de rejet motivé pour soumission d'une nouvelle version. |
| **Rétention** | Actif + 1 an (**À CONFIRMER** avec juriste local). Purgé après 30 jours en cas de rejet définitif du dossier KYC. |

### 1.12 `AuditLog`
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK, UUID v7 ou TSID pour tri temporel natif). |
| **Clés Étrangères**| `user_id` (Nullable, si système). |
| **CHECK** | - |
| **Index** | `user_id`, `action`, `created_at`. |
| **Immutabilité** | Strictement immuable. Ne doit JAMAIS faire l'objet d'un `UPDATE` ou `DELETE`. |
| **Rétention** | 10 ans légal (**À CONFIRMER** avec obligations comptables/fiscales camerounaises). |

### 1.13 `LedgerEntry` — Grand Livre Immuable (CR-001 D-06)
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). Index sur `entry_group_id` (regroupement de l'opération comptable). |
| **Clés Étrangères**| `account_id` (Ref: LedgerAccount). |
| **CHECK** | `CHECK (debit >= 0 AND credit >= 0 AND (debit > 0 OR credit > 0))`. |
| **Invariant Comptable**| `SUM(debit) == SUM(credit)` obligatoire par `entry_group_id` (vérifié par trigger ou transaction atomique). |
| **Immutabilité** | Strictement Insert-Only. Interdiction absolue de `UPDATE` ou `DELETE`. Rectification uniquement par écriture inverse (contre-passation). |
| **Rétention** | 10 ans légal (**À CONFIRMER** avec obligations comptables). |

### 1.14 `PayoutBatch` — Lots de Reversement (CR-001 D-06)
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). |
| **Clés Étrangères**| `created_by` (Ref: User), `approved_by` (Ref: User nullable). |
| **CHECK** | `CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXECUTED', 'CANCELLED'))`. |
| **Maker-Checker** | `CHECK (approved_by IS NULL OR approved_by != created_by)` (Interdiction formelle d'auto-approbation). |
| **Exécution** | Le passage à `EXECUTED` exige obligatoirement `payment_proof_url IS NOT NULL` et `external_transaction_id IS NOT NULL`. |
| **Immutabilité** | Montants et lignes scellés dès le passage à `SUBMITTED`. |
| **Rétention** | 10 ans légal (**À CONFIRMER** avec obligations comptables). |

### 1.15 `CashCollection` — Suivi Espèces Livreur (CR-001 D-05, D-06)
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). `UNIQUE (delivery_id)`. |
| **Clés Étrangères**| `delivery_id` (Ref: Delivery), `courier_id` (Ref: Courier). |
| **CHECK** | `CHECK (amount > 0 AND currency = 'XAF')`. |
| **Plafond & Alerte**| Comparé au seuil configuré dans `Setting` (défaut appliqué, à confirmer : exemple illustratif 50 000 FCFA). Si `SUM(amount)` des lignes `COLLECTED` dépasse le plafond, blocage immédiat de nouvelles courses pour le livreur. |
| **Immutabilité** | Mutable uniquement via la machine d'état (`PENDING` -> `COLLECTED` -> `REMITTED_TO_PLEINGAZ` / `DISPUTED`). |
| **Rétention** | 10 ans légal (**À CONFIRMER** avec obligations comptables). |

### 1.16 `Product` — Catalogue Exclusif PLEINGAZ (CR-001 D-01)
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). `sku` (Unique). |
| **Clés Étrangères**| `category_id` (Ref: ProductCategory). |
| **CHECK & Intégrité**| Aucun champ `brand` libre. Référence BDD obligatoire (`ON DELETE RESTRICT`) depuis `order_item(product_id)`, `inventory(product_id)`, `invoice_item(product_id)`. Interdiction formelle de créer un produit hors catalogue officiel PLEINGAZ. |
| **Immutabilité** | Mutable uniquement par l'administrateur catalogue. Archivage logique (`is_active = false`), jamais de suppression physique si lié à des commandes. |
| **Rétention** | Permanente. |

### 1.17 `ProductPrice` — Tarification Centralisée Maker-Checker (CR-001 D-01, D-06)
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). Index sur `(product_id, effective_from, status)`. |
| **Clés Étrangères**| `product_id` (Ref: Product), `created_by` (Ref: User), `approved_by` (Ref: User nullable). |
| **CHECK** | `CHECK (public_price > 0 AND distributor_price > 0 AND distributor_price <= public_price)`. `CHECK (status IN ('PROPOSED', 'APPROVED', 'REJECTED', 'EXPIRED'))`. |
| **Maker-Checker** | `CHECK (approved_by IS NULL OR approved_by != created_by)`. L'approbateur doit obligatoirement être distinct du proposant. |
| **Règle Serveur** | Le serveur recalcule obligatoirement le prix à la commande selon le tarif actif (`status = 'APPROVED'` et `NOW() BETWEEN effective_from AND COALESCE(effective_to, NOW())`). Tout montant envoyé par le client est écrasé. |
| **Immutabilité** | Une fois `APPROVED`, le barème est immuable dans le temps. Toute modification génère une nouvelle ligne et une trace dans `PriceHistory`. |
| **Rétention** | 10 ans légal (**À CONFIRMER** avec obligations fiscales/comptables). |

### 1.18 `Store` — Modèle de Réseau et Importation (CR-002 D-07, D-08, D-09, D-10)
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). `UNIQUE (source, source_ref)` pour assurer l'idempotence des réimports. Index sur `(verification_level, claim_status)`. |
| **Clés Étrangères**| `distributor_id` (Ref: DistributorProfile, Nullable si non revendiqué), `import_batch_id` (Ref: ImportBatch, Nullable). |
| **CHECK** | `CHECK (verification_level IN ('LISTED', 'CLAIMED_PENDING', 'BASIC_VERIFIED', 'FULLY_VERIFIED'))`. `CHECK (claim_status IN ('UNCLAIMED', 'PENDING_VERIFICATION', 'CLAIMED', 'REJECTED'))`. |
| **Règles Métier** | - Si `verification_level = 'LISTED'`, badge "Distributeur vérifié" formellement interdit, mention obligatoire "Point de vente PLEINGAZ — Informations en cours de vérification".<br>- Si `claim_status = 'UNCLAIMED'`, `distributor_id` est `NULL`. Zéro compte `User` créé à l'import.<br>- Stock initial affiché comme "Information non actualisée. Contactez le point de vente." Commandes en ligne désactivées (`online_ordering_enabled = false`). |
| **Protection des Champs** | Colonne `field_locks` (JSONB) enregistrant les attributs modifiés par un utilisateur ou un administrateur. Lors d'un ré-import du réseau, les champs verrouillés ne sont JAMAIS écrasés. |
| **Rétention** | Soft delete uniquement (`is_active = false`). |

### 1.19 `ImportBatch` — Lots d'Importation Réseau (CR-002 D-10)
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). `file_hash_sha256` (Unique par fichier). |
| **Clés Étrangères**| `created_by` (Ref: User), `approved_by` (Ref: User, Nullable). |
| **CHECK** | `CHECK (status IN ('STAGED', 'DRY_RUN_COMPLETED', 'PENDING_APPROVAL', 'APPROVED', 'APPLIED', 'REJECTED', 'ROLLED_BACK'))`. |
| **Contrôle & Sécurité**| L'approbation (`APPROVED`) exige impérativement : (1) rôle `ADMIN` ou `SUPER_ADMIN`, (2) saisie réussie du code TOTP, (3) confirmation de l'attestation écrite de PLEINGAZ (`pleingaz_agreement_ref IS NOT NULL`). |
| **Immutabilité** | Une fois `APPLIED`, le lot scelle l'état importé. Un `ROLLBACK` audité permet la révocation groupée si nécessaire. |
| **Rétention** | 10 ans pour la traçabilité des opérations administratives. |

### 1.20 `ImportRecord` — Staging et Quarantaine (CR-002 D-08, D-10)
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). Index sur `(batch_id, status)`. |
| **Clés Étrangères**| `batch_id` (Ref: ImportBatch), `store_id` (Ref: Store, Nullable). |
| **CHECK** | `CHECK (status IN ('STAGED', 'VALIDATED', 'QUARANTINE_INDIVIDUAL', 'QUARANTINE_DUPLICATE', 'QUARANTINE_INVALID_GEO', 'IMPORTED', 'IGNORED'))`. |
| **Zéro Particulier (D-08)**| Détection automatique : tout enregistrement classifié `PARTICULIER_OU_MENAGE` est immédiatement isolé en `QUARANTINE_INDIVIDUAL`. Aucune création dans `Store` ni `User`. |
| **Rétention** | Purge automatique des données brutes en staging/quarantaine 90 jours après l'exécution du lot. |

### 1.21 `StoreClaim` — Revendications de Boutique (CR-002 D-09)
| Propriété | Règle / Instruction SQL |
|---|---|
| **Clés & Unicités** | `id` (PK). Index sur `(store_id, status)`. Un seul claim actif par boutique. |
| **Clés Étrangères**| `store_id` (Ref: Store), `user_id` (Ref: User), `reviewed_by` (Ref: User, Nullable). |
| **CHECK** | `CHECK (status IN ('SUBMITTED', 'PHONE_OTP_PENDING', 'PHONE_OTP_VERIFIED', 'UNDER_ADMIN_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'))`. |
| **Anti-SIM Swap**| Validation OTP sur numéro officiel requise, complétée obligatoirement par une vérification administrative humaine (appel téléphonique ou contrôle terrain) avant passage à `APPROVED`. |
| **Effet d'Approbation**| À l'état `APPROVED` : `Store.distributor_id = user_id`, `Store.claim_status = 'CLAIMED'`, `Store.verification_level = 'BASIC_VERIFIED'`, enregistrement des verrous dans `field_locks`. |
| **Rétention** | Permanente (acte de rattachement juridique). |


---

## 2. Modèle Économique : Règles Validées et Impacts (CR-001)

L'architecture est "Configuration-Driven" via la table `Setting`. Les décisions souveraines du propriétaire ont définitivement tranché les options fondamentales :
- **Catalogue & Prix (D-01)** : Catalogue exclusivement officiel PLEINGAZ. Prix strictement nationaux recalculés côté serveur sur `ProductPrice` ; l'entité `StoreProductOffer` est déclassée/inopérante.
- **Reporting & Contrôle (D-03)** : Tous les rapports et tableaux de bord de synthèse sont réservés au Control Center admin, basés sur des données 100% réelles en BDD.
- **Livreurs (D-05)** : Les livreurs (`COURIER`) sont des utilisateurs à part entière supervisés par la plateforme, avec validation de remise par code client secret et suivi des espèces.
- **Gouvernance Financière (D-06)** : Encaissement centralisé chez PLEINGAZ, séparation des tâches Maker-Checker pour les barèmes et reversements, grand livre immuable à double entrée.

### 2.1 Tableau : Impact des Décisions

| Décision Métier | Règle Validée (CR-001) | Impact Modèle / Base de données |
|---|---|---|
| **Qui encaisse ?** | Encaissement centralisé par PLEINGAZ (Mobile Money ou régularisation espèces). | L'`Invoice` globale émise par la plateforme. Les flux alimentent le Grand Livre (`LedgerEntry`). |
| **Qui paie les frais ? (fee_bearer)** | Paramétré dans `Setting` (`PLATFORM` par défaut). | `PaymentTransaction.fee` et `operator_fee` stockés avec exactitude au centime. |
| **Prix : National vs Libre** | **National exclusif (CR-001 D-01)**. | L'API lit exclusivement `ProductPrice` actif. `StoreProductOffer` est neutralisé. |
| **Livraison : Interne vs Externe** | **Plateforme indépendante (CR-001 D-05)**. | Rôle dédié `COURIER` (9e rôle), entités `Courier`, `CourierZone`, `DeliveryAssignment`. |
| **Reversements & Barèmes** | **Maker-Checker strict (CR-001 D-06)**. | Proposition par `FINANCE_MANAGER`, approbation distincte par `ADMIN`/`SUPER_ADMIN`, lot `PayoutBatch`. |

### 2.2 Paiement en Espèces (Recouvrement Sécurisé)
1. Le client paie de la main à la main lors de la livraison ou du retrait.
2. L'encaissement est validé **uniquement** quand le client remet au livreur/distributeur son **Code de Confirmation** confidentiel à 4-6 chiffres.
3. La saisie de ce code valide la commande (`DELIVERED`) et crée l'enregistrement `CashCollection`.
4. L'espèce en main constitue une créance envers PLEINGAZ enregistrée au débit du compte de caisse livreur (`1030`) ou distributeur (`1020`) et au passif envers le réseau.
5. PLEINGAZ régularise la créance lors de la remise physique des fonds ou par compensation automatique sur les futurs lots de reversement `PayoutBatch`.
6. Si le plafond d'espèces en circulation (défaut appliqué, à confirmer : exemple illustratif 50 000 FCFA dans `Setting`) est franchi, le compte livreur est automatiquement suspendu d'attribution jusqu'à régularisation.

---

## 3. Stock et Logistique Locale

- **Multi-Boutique** : Un distributeur (entité `DistributorProfile`) peut posséder plusieurs boutiques (`Store`). Chaque boutique possède son propre `Inventory`.
- **Modèle Qualitatif Exclusif (CR-001 D-01)** : Le stock ne gère pas de compteurs numériques bruts sujets aux erreurs de saisie, mais un état qualitatif parmi `BON`, `MOYEN`, `FAIBLE`, `RUPTURE`.
- **Modèle de Fraîcheur** : Calculé dynamiquement. Si `last_updated_at` < 2h, affiché "Frais/Vérifié récemment". Au-delà du seuil configurable dans `Setting`, une alerte de mise à jour est levée.
- **Sources de mise à jour** (`InventoryUpdate.source`) :
  1. `declared_manual` : Saisie par le gérant via l'IHM tactile (`BON`/`MOYEN`/`FAIBLE`/`RUPTURE`).
  2. `one_click_confirm` : Bouton rapide "Mon stock est toujours conforme".
  3. `deducted_auto` : Dégradation automatique suggérée après enchaînement de commandes.

---

## 4. Points Tranchés et Paramètres Opérationnels (CR-001)

Les 6 décisions souveraines du propriétaire (`D-01` à `D-06`) ont formellement résolu les questions majeures d'architecture :
1. **Consigne et Gestion des Bouteilles** : Gestion des consignes par échange standard de bouteille vide de même format ou facturation de consigne selon barème officiel PLEINGAZ.
2. **Liberté des prix** : **Résolu (D-01)** — Prix strictement centralisé, aucune liberté locale, `StoreProductOffer` neutralisé.
3. **Recouvrement Espèces** : **Résolu (D-05, D-06)** — Enregistrement systématique dans `CashCollection`, suivi en grand livre immuable, plafond bloquant dans `Setting`.
4. **Statut des Livreurs** : **Résolu (D-05)** — Livreurs indépendants de la plateforme (`COURIER`), supervisés centralement par PLEINGAZ.

Les seuls arbitrages résiduels portent sur des seuils numériques (plafonds de caisse, délais d'acceptation de course, frais de livraison par zone) qui sont externalisés et ajustables sans modification de code via la table `Setting`.

