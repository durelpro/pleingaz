# Walk-through Phase 4 : Logique Métier, Barèmes & Guards d'Isolation CR-003

- **Date d'exécution** : 01 Novembre 2026
- **Auteur** : Antigravity (Pair Programming PLEINGAZ)
- **Statut** : TERMINÉ & VALIDÉ

---

## 1. Objectifs de la Phase 4

1. **Gardien de Cloisonnement Étanche et Zéro Fuite d'Informations (`D-11.5`, `C-06`, `R-01`)** :
   - Décorateur `@RequirePortal(portal: PortalType)`.
   - Gardien `PortalAudienceGuard` inspectant la revendication `aud` du jeton JWT.
   - **Règle Absolue "Aucune Trace"** : Toute requête hors audience reçoit obligatoirement une réponse **HTTP 404 Not Found** (jamais 403 Forbidden) pour empêcher toute cartographie réseau par un attaquant.
2. **Dynamisation des Barèmes et Paramètres Plateforme (`D-14`)** :
   - Quota acheteur calculé dynamiquement sur la base de `PlatformSettings.buyerBottleLimit` (défaut 5 bouteilles sur 30 jours glissants).
   - Tarification dynamique des livraisons (`deliveryFixedPrice = 2000 FCFA`), gaz et bouteilles via le modèle de configuration centralisé.
3. **Double Confirmation de Livraison (`D-17`)** :
   - Palier 1 : Le livreur clique "J'ai livré" (`courierMarkDelivered`) -> état `DELIVERED_PENDING_CONFIRMATION` avec horodatage certifié `courierConfirmedAt`.
   - Palier 2 : L'acheteur confirme "J'ai bien reçu" (`customerConfirmDelivery`) -> état `DELIVERED` avec horodatage `customerConfirmedAt`.
   - Voie de recours : L'acheteur conteste "Je n'ai rien reçu" (`customerDisputeDelivery`) -> état `DISPUTED` avec motif et horodatage `disputedAt`.
   - Délai de garde : Auto-validation (`autoValidateExpiredDeliveries`) vers `CONFIRMED_BY_COURIER_ONLY` si le client n'a pas contesté au bout de 2 heures.

---

## 2. Fichiers Créés et Modifiés

| Fichier | Nature | Description |
|---|---|---|
| [`apps/api/src/auth/decorators/portal.decorator.ts`](file:///home/durel/pleingaz/apps/api/src/auth/decorators/portal.decorator.ts) | **Nouveau** | Décorateur `@RequirePortal('CUSTOMER' | 'DISTRIBUTOR' | 'COURIER' | 'STAFF')`. |
| [`apps/api/src/auth/guards/portal-audience.guard.ts`](file:///home/durel/pleingaz/apps/api/src/auth/guards/portal-audience.guard.ts) | **Nouveau** | Guard de cloisonnement étanche avec réponse **HTTP 404 systématique**. |
| [`apps/api/src/auth/guards/portal-audience.guard.spec.ts`](file:///home/durel/pleingaz/apps/api/src/auth/guards/portal-audience.guard.spec.ts) | **Nouveau** | Suite de tests unitaires validant l'étanchéité 404 (6 tests passés avec succès). |
| [`apps/api/src/auth/auth.module.ts`](file:///home/durel/pleingaz/apps/api/src/auth/auth.module.ts) | **Modifié** | Enregistrement de `PortalAudienceGuard` dans les providers et exports. |
| [`apps/api/src/cr003/cr003.service.ts`](file:///home/durel/pleingaz/apps/api/src/cr003/cr003.service.ts) | **Modifié** | Lecture dynamique de `PlatformSettings`, méthodes de double confirmation D-17 et auto-validation sous 2h. |
| [`apps/api/src/cr003/cr003.controller.ts`](file:///home/durel/pleingaz/apps/api/src/cr003/cr003.controller.ts) | **Modifié** | Routes REST : `/pricing`, `/deliveries/:id/courier-confirm`, `/customer-confirm`, `/dispute` et `/auto-validate`. |

---

## 3. Validation Technique et Tests Exhaustifs (100% Réalisés)

- **Tests d'Étanchéité API (`portal-audience.guard.spec.ts`)** :
  - `Test Suites: 1 passed, 1 total`
  - `Tests: 6 passed, 6 total` (rejet 404 client vers distributeur, rejet 404 distributeur vers livreur, autorisation audience conforme).
- **Tests Métier Souverains D-11 à D-18 (`cr003.service.spec.ts`)** :
  - `Test Suites: 1 passed, 1 total`
  - `Tests: 17 passed, 17 total` :
    1. Autorisation acheteur sans historique (5 bouteilles restantes).
    2. Cumul commandes livrées + ventes comptoir sur 30 jours glissants (D-14).
    3. Blocage automatique si quota >= 5 bouteilles.
    4. Rejet de vente au comptoir avec `QUOTA_EXCEEDED` si dépassement (D-16).
    5. Vente au comptoir réussie avec reçu fiscal et décompte quota.
    6. Accusé de lecture des InfoNotices avec `InfoNoticeRead` (D-18).
    7. Agrégation centralisée des commandes en ligne et ventes comptoir pour l'admin (D-16).
    8. Calcul des métriques financières et logistiques globales.
    9. Création de dossier `AccountCase` en statut `PROPOSED` (D-15).
    10. Rejet Maker-Checker strict si l'admin est le créateur du dossier (D-15).
    11. Approbation du dossier par un admin distinct et application de l'action.
    12. Remboursement de consigne (+25 000 FCFA) avec trace comptable.
    13. Barèmes dynamiques issus de `PlatformSettings` (prix livraison, prix gaz/btl).
    14. Palier 1 livreur : "J'ai livré" (`DELIVERED_PENDING_CONFIRMATION` + horodatage).
    15. Palier 2 acheteur : confirmation de réception (`DELIVERED` + horodatage).
    16. Contestation client : signalement de non réception (`DISPUTED` + motif).
    17. Auto-validation automatique sous 2h sans contestation client (`CONFIRMED_BY_COURIER_ONLY`).
- **Contrôle Quota dans `OrdersService`** :
  - Blocage automatique pré-commande si le volume dépasse le quota de 5 bouteilles.
- **Compilation Globale** : `pnpm --filter api build` validé avec succès (0 erreur de compilation).

---

## 4. Bilan d'Exécution de la Phase 4

- **Couverture de tests unitaires** : 23 tests au total (6 isolation + 17 métier) validés à 100%.
- **Dépôt distant** : Toutes les modifications sont écrites sur disque et synchronisées par commit et push GitHub.
