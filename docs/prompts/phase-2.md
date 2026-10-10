PHASE 2. FONDATIONS.
2.1 Monorepo, Docker Compose (PostgreSQL+PostGIS, Redis), CI (lint, tests).
2.2 Prisma + migrations ; extensions PostGIS, pg_trgm, unaccent.
2.3 Auth : inscription/connexion par téléphone (OTP) et email, mot de passe Argon2id, JWT court + refresh token rotatif en cookie HttpOnly, récupération de compte, rate limiting, verrouillage progressif.
2.4 RBAC par permissions (pas seulement par rôle), guards NestJS, tests de non-autorisation.
2.5 Profils client, adresses (ville, quartier, repère, point GPS optionnel), préférences de notification.
2.6 AuditLog (service transversal), journalisation structurée, gestion d'erreurs, health checks.
2.7 Design system : tokens (rouge/orange PLEINGAZ conservés), composants de base, états de chargement (skeletons), mobile-first, FR/EN.
Tests : auth, permissions, rate limiting, accès à la ressource d'autrui.
STOP après plan, puis après chaque tâche.
