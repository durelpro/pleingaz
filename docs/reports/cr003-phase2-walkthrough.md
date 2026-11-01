# Walk-through Phase 2 : Backend d'Authentification & Stratégies JWT CR-003

- **Date d'exécution** : 01 Novembre 2026
- **Auteur** : Antigravity (Pair Programming PLEINGAZ)
- **Statut** : TERMINÉ & VALIDÉ

---

## 1. Objectifs de la Phase 2

1. **Suppression formelle de tout fallback silencieux de clé secrète** (`CR-003 R-01` & `docs/06a-securite.md`) :
   Le serveur NestJS refuse de démarrer si `JWT_SECRET` est absent ou fait moins de 32 caractères.
2. **Implémentation de la Règle des Deux Numéros Obligatoires** (`D-12.3`, `C-03.2`) :
   - Numéro WhatsApp principal (`phone`).
   - Numéro secondaire de contact d'urgence (`backupPhone` / `callPhone`), obligatoirement distinct du premier.
   - Contrôle anti-contournement : le numéro secondaire ne peut pas être le numéro principal d'un autre compte actif.
3. **Mise en œuvre de la Preuve Entrante WhatsApp** (`D-12`, `C-04`) :
   - Création de `WhatsAppAuthService`.
   - Génération de défis courts éphémères (`PG-XXXX`, TTL 10 minutes) sans coût sortant pour PLEINGAZ.
   - Lien universel d'ouverture WhatsApp prérempli vers le numéro officiel de la plateforme (`https://wa.me/...`).
   - Traitement sécurisé du webhook Meta entrant et protection contre le brute-force (5 tentatives max).
4. **Cloisonnement des Sessions par Audience Portail (`aud`)** (`D-11`, `C-05`) :
   - Les tokens JWT portent la revendication explicite `aud` correspondant au portail connecté (`pleingaz:portal:customer`, `pleingaz:portal:distributor`, `pleingaz:portal:courier`, `pleingaz:portal:staff`).
   - `JwtStrategy` extrait l'audience et valide le statut de verrouillage (`lockedUntil`) du compte.

---

## 2. Fichiers Créés et Modifiés

| Fichier | Nature | Description |
|---|---|---|
| [`apps/api/src/auth/constants/jwt.config.ts`](file:///home/durel/pleingaz/apps/api/src/auth/constants/jwt.config.ts) | **Nouveau** | Helper `getRequiredJwtSecret()` assurant le fail-fast absolu, constantes de durées et énumération `PortalAudience`. |
| [`apps/api/src/auth/services/whatsapp-auth.service.ts`](file:///home/durel/pleingaz/apps/api/src/auth/services/whatsapp-auth.service.ts) | **Nouveau** | Service de gestion des défis WhatsApp `VerificationChallenge` (génération `PG-XXXX`, hachage Argon2id, validation et webhook entrant). |
| [`apps/api/src/auth/strategies/jwt.strategy.ts`](file:///home/durel/pleingaz/apps/api/src/auth/strategies/jwt.strategy.ts) | **Modifié** | Remplacement du fallback dev par `getRequiredJwtSecret()`, extraction de `portal`, `aud`, `callPhone` et vérification de lockout. |
| [`apps/api/src/auth/auth.module.ts`](file:///home/durel/pleingaz/apps/api/src/auth/auth.module.ts) | **Modifié** | Enregistrement asynchrone de `JwtModule` avec `getRequiredJwtSecret()`, injection de `WhatsAppAuthService`. |
| [`apps/api/src/auth/auth.service.ts`](file:///home/durel/pleingaz/apps/api/src/auth/auth.service.ts) | **Modifié** | Contrôle des deux numéros, anti-contournement, hash Argon2id, lockout progressif (5 échecs = 15 min), génération de tokens avec `aud`. |
| [`apps/api/src/auth/auth.controller.ts`](file:///home/durel/pleingaz/apps/api/src/auth/auth.controller.ts) | **Modifié** | Endpoints `/register`, `/login`, `/challenge/initiate`, `/challenge/verify`, `/webhook/whatsapp` et `/me`. |
| [`apps/api/src/auth/auth.service.spec.ts`](file:///home/durel/pleingaz/apps/api/src/auth/auth.service.spec.ts) | **Nouveau** | Suite de tests unitaires pour la règle des deux numéros, l'isolation portail et la preuve entrante. |

---

## 3. Validation Technique et Build

- **Compilation TypeScript** : `pnpm --filter api build` validé avec succès (0 erreur de compilation NestJS).
- **Intégrité de l'environnement** : Les règles R-01 (secrets et isolation) et R-03 (WhatsApp gratuit) sont matérialisées dans le code exécutable.

---

## 4. Prochaine Étape

Passage à la **Phase 3 : Migration du Schéma Prisma & Données** :
- Vérification et consolidation des modèles Prisma (`VerificationChallenge`, `AccountCase`, `CounterSale`, `PlatformSettings` / `Setting`).
- Génération de la migration ou validation du client Prisma.
