# PLEINGAZ : messages consolidés pour reconstruire le projet

Chaque bloc est à coller dans une conversation NEUVE de l'agent (mode Planning), dans l'ordre.
Avant chaque nouvelle phase : `git add . && git commit && git push`.
Après chaque étape validée : relis, teste, commite, pousse.

---

## MESSAGE 1 : PHASE 0 (audit)

```
Lis GEMINI.md et docs/00-master-prompt.md. Applique ces règles pendant toute la conversation.
Lis tous les fichiers de docs/00-sources/ : l'audit préliminaire est une HYPOTHÈSE à vérifier point par point (confirmé / infirmé / non vérifiable), pas une vérité.
Exécute la phase décrite dans docs/prompts/phase-0.md.

Précautions pour l'exploration de https://www.monpleingaz.com/ :
- Observation passive uniquement : naviguer, lire, capturer, inspecter le code et les en-têtes publics.
- Ne soumets aucun formulaire, ne crée aucun compte, ne passe aucune commande, ne tente aucune connexion.
- Ne contourne jamais le captcha ou la protection anti-bot. Si une page est bloquée : note-la "non vérifiable" et dis-moi ce qu'il te faudrait (captures, export du code).
- Pas de scan de vulnérabilités ni de test d'intrusion sur le site en production : constate seulement ce qui est visible publiquement (HTTPS, en-têtes, cookies).
- Rythme raisonnable, pas de crawl massif. Aucune donnée personnelle collectée.
- Mesures de performance (Lighthouse) autorisées en mobile avec connexion bridée.

Livrables : docs/01-audit.md (constaté / recommandé / à confirmer), docs/DECISIONS.md (ADR D1 à D4, statut PROPOSÉ), docs/OPEN_QUESTIONS.md.
Dans OPEN_QUESTIONS.md, ajoute les questions de modèle économique : prix libres ou plafonnés, commission, qui livre, qui encaisse, règles de consigne, zone du pilote, SLA de validation des distributeurs, budget et équipe, numéros officiels WhatsApp et horaires du support.
Donne-moi d'abord ton plan, attends ma validation, puis produis les livrables. STOP à la fin.
```

---

## MESSAGE 2 : PHASE 1 (cadrage), version consolidée

```
Lis GEMINI.md, docs/00-master-prompt.md, docs/01-audit.md, docs/DECISIONS.md, docs/OPEN_QUESTIONS.md, docs/00-sources/ puis docs/prompts/phase-1.md.
Mode Planning. Ne code rien. Travaille UNE tâche à la fois : après chaque fichier, résumé de 10 lignes maximum, liste des décisions à confirmer, STOP. Ne passe pas à la tâche suivante sans mon accord.

RÈGLES TRANSVERSES
- Les ADR sont "PROPOSÉS" tant que je ne les ai pas explicitement validés. Indique dans chaque document ce qui en dépend.
- Modèle économique (qui encaisse, commission, consigne, livraison, prix libres/plafonnés) : ne rien supposer. Décris les alternatives et leur impact sur Payment, Invoice, Settlement, Order. Hypothèse de travail : encaissement centralisé avec Settlement, mais le modèle doit séparer vendeur, encaisseur et livreur et supporter les deux modes (PLEINGAZ ou distributeur encaisse) par configuration, sans migration lourde. Gère aussi les espèces (confirmation distributeur + code client, puis commission réclamée via Settlement).
- Montants en entiers (FCFA), horodatages UTC, suppression logique des données sensibles, journal d'audit, index géographiques.

TÂCHE 1 : docs/02-cadrage-ux-roles.md
- Sitemap des 3 portails, avec les pages existantes (About, Products, Services, FAQ, Blog, points de vente, Contact), "J'ai besoin de gaz", "Devenir distributeur", pages légales (À CONFIRMER), page sécurité du gaz. Navigation mobile : environ 6 entrées.
- Visiteur non connecté : ce qu'il peut faire sans compte (recherche, carte, fiches) et quand l'inscription par OTP est demandée.
- Parcours client, distributeur, admin (Mermaid), AVEC les cas d'échec (paiement refusé, stock épuisé après réservation, distributeur qui refuse ou ne répond pas, livraison échouée, réservation expirée, dossier rejeté) et la commande assistée (téléphone/WhatsApp).
- RBAC exprimé en permissions granulaires : un distributeur ne voit que ses données ; il ne voit que les données client nécessaires à la commande ; accès aux pièces d'identité restreint et journalisé ; actions sensibles auditées ; sous-comptes pour le personnel d'une boutique ; séparation ADMIN / SUPER_ADMIN.
- Un seul User par numéro de téléphone avec plusieurs profils (client, distributeur), un login avec sélecteur d'espace. Comptes du personnel PLEINGAZ séparés, double facteur obligatoire. Rôles = ensembles de permissions configurables ; jeu MVP : Admin, Support, Distributor Manager, avec chemin vers les 8 rôles sans migration lourde.

TÂCHE 2 : docs/03-modele-donnees-etats.md
- ERD global simplifié + ERD par domaine (Mermaid lisibles).
- Toutes les entités du prompt de phase, plus Report, SearchEvent, StockReservation, Settlement/Payout, Address avec champ "repère". Justifie chaque écart.
- Séparation vendeur / encaisseur / livreur dans Order, Payment, Invoice. Factures immuables après émission, avoir pour correction, numérotation unique par vendeur. Politique de frais configurable : fee_bearer = PLATFORM | SELLER | CUSTOMER par mode de paiement et par période ; chaque PaymentTransaction enregistre les frais réels de l'opérateur (aucun pourcentage en dur).
- Contraintes : clé d'idempotence unique sur les paiements (dans PostgreSQL, JAMAIS dans Redis), téléphone unique, une facture par commande, protection contre la surréservation, index spatiaux PostGIS.
- Machines à états avec transitions interdites explicites (distributeur, commande client, commande distributeur, paiement, livraison, StockReservation). Durée de réservation = paramètre configurable (défaut : 15 min paiement en ligne, 30 min retrait avec paiement sur place).
- Pièces d'identité : stockage isolé, accès journalisé.

TÂCHE 3 : docs/04-architecture-technique.md
- API REST (versionnée /api/v1, erreurs standard, pagination, idempotence), architecture frontend (Next.js, rendu, PWA, mode faible connexion), cartographie (PostGIS, Leaflet, géocodage, liste de secours quand la carte ne charge pas).
- Géocodage : Nominatim public acceptable pour le pilote (le DISTRIBUTEUR géocode à l'inscription, pas seulement les admins). Appels uniquement via le backend, 1 requête/seconde avec file d'attente, User-Agent identifiable, cache, pas d'autocomplétion à chaque frappe. Interface GeocodingProvider. Source de vérité = marqueur confirmé par le distributeur + repère textuel (couverture OSM inégale).
- ADR D3 : le serveur de tuiles public OSM n'est pas adapté à une carte publique à fort trafic. Compare fournisseur de tuiles, auto-hébergement plus tard, liste de secours, impact sur la consommation de données.
- Cloudflare en façade : cache uniquement statiques, images, pages publiques ; jamais pour les réponses API contenant stock, commandes, factures, données personnelles, sessions ; exception pour les webhooks de paiement avec vérification de signature ; anti-bot réglé pour ne pas bloquer vrais utilisateurs, moteurs de recherche et API ; IP réelle via en-tête du CDN ; origine verrouillée sur le trafic du CDN ; offre gratuite d'abord ; coûts et mention dans la politique de confidentialité (À CONFIRMER).
- Règle : Redis = cache, rate limiting, TTL des OTP, files d'attente. Jamais pour des données qui doivent survivre.

TÂCHE 4 : docs/05-paiement-notifications-ia.md
- Paiement : interface PaymentProvider (MTN, Orange, Manual), sandbox d'abord ; webhook signé, rejeu inoffensif, idempotence, revérification auprès du fournisseur ; expiration et revérification périodique si l'utilisateur ne valide jamais ; paiement en double, partiel, tardif après annulation ; rapprochement financier ; frais de transaction non supposés (À CONFIRMER, hypothèse pilote : PLEINGAZ absorbe les frais en ligne).
- Notifications : web push, email, WhatsApp, SMS plus tard ; consentement par événement, transactionnel vs marketing ; files avec reprises, anti-doublon, anti-spam. WhatsApp Business API hors MVP (click-to-chat par défaut, règle R10). OTP : interface OtpProvider, compare un prestataire international et un agrégateur local/régional (taux de livraison réel MTN/Orange au Cameroun, coût, identifiant d'expéditeur, délai, support), canal de repli (WhatsApp/vocal). Plafond mensuel de coûts (SMS, LLM) avec alerte à 80 %. Aucun fournisseur validé avant comparaison.
- IA : outils en lecture, typés, filtrés par rôle ; minimisation et masquage des données envoyées au LLM ; interface LLMProvider ; repli sur la recherche classique ; garde-fous (injection de prompt, sorties validées par schéma, jamais d'action sensible sans confirmation) ; jeu de tests réaliste, une invention de stock/prix/horaire = échec bloquant ; l'IA n'arrive qu'après les phases 3 à 5.
- Ajoute à OPEN_QUESTIONS.md les "Démarches à lancer en parallèle" : compte marchand MTN/Orange ou agrégateur + sandbox, numéro WhatsApp officiel + vérification Meta, identifiant d'expéditeur SMS, domaine/DNS/Cloudflare, validation du modèle économique (responsable, délai, dépendance).

TÂCHE 5 : docs/06-securite-mvp-roadmap.md + docs/07-donnees-personnelles.md + docs/08-tracabilite.md
- Modèle de menaces (faux distributeur, usurpation, IDOR commandes/factures, falsification de prix, fraude au paiement et faux webhooks, abus d'OTP, scraping des stocks et numéros, fuite des pièces d'identité, compte admin compromis, injection de prompt, déni de service) : contre-mesure, test, gravité, phase.
- Authentification : politique de mots de passe, verrouillage progressif, double facteur obligatoire pour le personnel, révocation de session, récupération sécurisée. Secrets, sauvegardes (RPO/RTO proposés), test de restauration, journalisation sans données sensibles, rétention, procédure d'incident.
- Tests : stratégie par couche ; cas d'abus obligatoires (double paiement, double commande, surréservation concurrente, webhook rejoué/falsifié, facture d'autrui, prix modifié côté client, distributeur non validé visible, transition interdite, upload malveillant, OTP forcé) ; seuil d'environ 90 % (lignes et branches) sur paiement, permissions, facturation, stock (PAS "100 %") ; tests sur petit Android, connexion bridée, coupure réseau pendant un paiement.
- MVP strict (dans / hors, avec justification, critères mesurables). Pilote : une ville À CONFIRMER par PLEINGAZ, nombre de distributeurs, durée, indicateurs et seuils go/no-go.
- Roadmap : complexité S/M/L, dépendances, chemin critique, prérequis externes ; coûts récurrents par poste en fourchettes À CONFIRMER (aucun prix inventé) ; registre des risques.
- docs/07 : inventaire des données personnelles (nature, finalité, sensibilité, rétention, accès) ; cadre légal camerounais À CONFIRMER, rien d'affirmé sans source. docs/08 : matrice de traçabilité (exigence source → entité, écran, phase, statut MVP/plus tard/écarté).
- Clôture : revue de cohérence entre les docs 02 à 08, correction des incohérences, ADR laissés "PROPOSÉ" ou "À CONFIRMER" tant que je n'ai pas validé, checklist de sortie de phase, plan de la Phase 2.
```

---

## MESSAGE 3 : PHASE 2, TÂCHE 1 (monorepo, Docker, CI)

```
Lis GEMINI.md, docs/00-master-prompt.md, docs/02 à 08 et docs/prompts/phase-2.md.
Plan global de la Phase 2 : (1) monorepo + Docker Compose + CI, (2) schéma Prisma et migrations, (3) auth + OTP + sessions, (4) RBAC par permissions + tests de non-autorisation, (5) audit log et journalisation. Ajouts : OtpProvider simulé en développement (code dans la console, aucun SMS réel), limitation de débit et verrouillage progressif, TOTP obligatoire pour le personnel, révocation de session, récupération de compte, .env.example sans secret, health checks, données DEMO étiquetées, CI. Cloudflare/DNS n'est PAS dans le chemin bloquant : développement local d'abord.
Chaque tâche : tests, revue de sécurité du diff, commit, résumé de 10 lignes, STOP. Mode Planning : donne-moi d'abord le plan de la TÂCHE 1 uniquement.

Exigences de la Tâche 1 :
1. Docker : jamais sudo (mon utilisateur est dans le groupe docker). Volumes Docker nommés (pas de dossier de données dans le dépôt). Pas de ligne `version:` dans docker-compose.yml. Images épinglées par version précise.
2. Redis : jamais pour des données qui doivent survivre (idempotence de paiement, commandes, réservations = PostgreSQL avec contrainte d'unicité). Redis = cache, rate limiting, TTL des OTP, files. Documente dans docs/04.
3. Réseau : PostgreSQL et Redis liés à 127.0.0.1, mots de passe lus depuis .env (Redis compris), aucune valeur par défaut faible.
4. pnpm workspaces, versions épinglées, pnpm-lock.yaml commité, .nvmrc, packageManager défini. packages/shared (schémas Zod, types partagés).
5. Variables d'environnement validées par Zod au démarrage (échec immédiat). .env jamais commité, .env.example sans secret. Script `pnpm setup:env` qui génère des secrets forts (PostgreSQL, Redis, JWT), construit les URLs, et n'écrase jamais un .env existant sans confirmation.
6. API NestJS : préfixe /api/v1, helmet, CORS restrictif, pas de stack trace en production, format d'erreur standard. Health : /api/v1/health/live et /api/v1/health/ready (PostgreSQL + Redis, 503 si l'un tombe, sans détails exposés).
7. Base : script d'initialisation versionné créant postgis, pg_trgm, unaccent ; fuseau UTC.
8. Next.js App Router, TypeScript strict, simple page d'état technique, TailwindCSS.
9. Qualité : ESLint configuré pour apps/api, apps/web ET packages/shared ; `pnpm lint`, `pnpm test`, `pnpm build` passent depuis un clone propre ; pnpm test ne plante pas sans tests (au moins un vrai test) ; CI avec services PostgreSQL et Redis, pnpm audit, gitleaks, échec si le lockfile est désynchronisé ; lint-staged, commits conventionnels.
10. README : commandes exactes depuis un clone vierge (nvm use, pnpm install, pnpm setup:env, pnpm db:up, pnpm dev), ports, test du 503, mention "jamais sudo avec pnpm ni docker".
Critères de succès : démarrage complet suivant le README sans étape cachée ; /ready renvoie 200 puis 503 quand PostgreSQL est arrêté (teste-le) ; lint, tests, build passent ; aucun secret dans l'historique.
Fais le plan, STOP. Après mon accord : implémente, vérifie, commite, résumé, STOP.
```

---

## MESSAGE 4 : PHASE 2, TÂCHE 2 (schéma Prisma, rôles, seeds)

```
Tâche 1 validée. Tâche 2 : schéma Prisma, rôles configurables, données DEMO. Mode Planning : plan d'abord, STOP, puis code, migrations ET tests EXÉCUTÉS par toi (tu as accès à Docker sans sudo, vérifie avec `docker ps`). Colle-moi les sorties réelles. Ne me demande jamais d'éditer des fichiers à la main.

SCHÉMA
1. PostGIS : Unsupported("geography(Point,4326)"), index GIST et contraintes par migration SQL versionnée, requêtes géographiques SQL paramétrées. Ordre (longitude, latitude).
2. User : un seul par téléphone, E.164 avec CHECK en base (^\+[1-9][0-9]{7,14}$), email minuscules unique si non nul, phone_verified_at, email_verified_at, status (ACTIVE, SUSPENDED, PENDING_VERIFICATION, DELETED), locale (fr|en), user_type (PUBLIC | STAFF), password_hash nullable (Argon2id), failed_login_count, locked_until, last_login_at, is_demo. Comptes STAFF : créés sur invitation admin uniquement, mot de passe + TOTP obligatoires, jamais OTP seul ; un STAFF sans MfaCredential vérifié ne peut pas être ACTIVE. Clients : OTP seul possible, avec ré-authentification par OTP récent pour les actions sensibles (prévoir le champ sur Session).
3. Profils : CustomerProfile, DistributorProfile (minimal), StaffProfile.
4. RBAC en base : Role (is_system), Permission, RolePermission (clé composite), UserRole avec scope_type (enum STORE...) et scope_id. Unicité : CREATE UNIQUE INDEX ... ON "UserRole" (user_id, role_id, scope_type, scope_id) NULLS NOT DISTINCT; (l'option se place APRÈS les colonnes). FK vers Store ajoutée en Phase 3. Catalogue de permissions en constantes dans packages/shared, deny-by-default. Rôles de référence : CUSTOMER, DISTRIBUTOR, ADMIN, SUPPORT_AGENT, DISTRIBUTOR_MANAGER.
5. Session (refresh_token_hash unique, family indexée, revoked_at, last_used_at, ip, device_info, champ de vérification forte, détection de réutilisation permise), MfaCredential (secret chiffré AES-256-GCM, version de clé, verified_at, unique par user+type), RecoveryCode (hashés, used_at). OTP dans Redis, hashés, avec TTL.
6. Address : user_id indexé, label, city, neighborhood, landmark (repère), is_default, coordinates nullable, suppression logique.
7. AuditLog append-only : actor_id SANS clé étrangère, actor_type (USER|SYSTEM|ANONYMOUS), action, entity, entity_id, changes sans données sensibles, ip, user_agent, request_id. Triggers bloquant UPDATE/DELETE et TRUNCATE.
8. Anonymisation à la suppression de compte (libère l'unicité sans casser l'audit), documentée dans docs/07.

MIGRATIONS ET DROITS
9. Première migration : en TÊTE uniquement CREATE EXTENSION IF NOT EXISTS postgis/pg_trgm/unaccent. Triggers, CHECK, index UNIQUE NULLS NOT DISTINCT et index GIST EN BAS, après la création des tables. Ne jamais modifier une migration appliquée ; db push interdit hors développement jetable.
10. Deux rôles de base dès maintenant : pleingaz_migrate (propriétaire, migrations) et pleingaz_app (DML seulement, pas de TRUNCATE, aucun droit sur schéma/triggers ; sur AuditLog : SELECT et INSERT uniquement). GRANT + ALTER DEFAULT PRIVILEGES pour les futures tables. DATABASE_URL (app) et MIGRATE_DATABASE_URL. Vérifie que pleingaz_migrate peut créer la base temporaire de Prisma avec postgis (sinon shadowDatabaseUrl/droits). Vérifie prisma migrate diff : aucune dérive.
11. Script `pnpm db:reset:dev` : down -v, PUIS setup:env, PUIS up, attente de la base, migrate, seed:reference. Refuse de s'exécuter en production. (L'ordre compte : sinon mots de passe désynchronisés.)

SEEDS
12. `pnpm seed:reference` : rôles, permissions, associations ; idempotent ; sûr en production. `pnpm seed:demo` : refuse si NODE_ENV=production OU ALLOW_DEMO_SEED != "true", erreur explicite et code de sortie non nul. Comptes is_demo=true, numéros manifestement fictifs, AUCUN envoi sortant vers un compte is_demo. `pnpm seed:demo:purge`. Aucune donnée réelle PLEINGAZ inventée.

TESTS (base pleingaz_test séparée, refus de démarrer si le nom ne finit pas par _test)
13. Migration depuis base vierge ; téléphone et email dupliqués refusés ; format E.164 refusé PAR LA BASE ; AuditLog non modifiable (UPDATE, DELETE, TRUNCATE) avec pleingaz_app, et DROP TRIGGER refusé ; unicité UserRole avec NULL ; rôle limité à une boutique sans droit hors portée ; STAFF sans MFA vérifié non activable ; seed:reference idempotent (2 exécutions = même état) ; seed:demo bloqué en production ; distance Yaoundé-Douala d'environ 200 km ; requête géographique résistante à l'injection.
14. Documente dans docs/09-schema-prisma.md et corrige docs/03 et docs/07 si écart.

PREUVES À FOURNIR (sorties réelles) : docker compose ps ; \dt et \du ; connexion pleingaz_app (SELECT/INSERT OK sur User, DELETE/UPDATE/TRUNCATE refusés sur AuditLog) ; suite de tests complète ; pnpm lint, test, build ; seed:reference deux fois ; seed:demo refusé en production ; git status propre ; commit. Si un test échoue, corrige la cause, pas le test. Résumé de 10 lignes, décisions à confirmer, STOP.
```

---

## VÉRIFICATIONS APRÈS LA TÂCHE 2

```bash
cd ~/pleingaz
nvm use
docker compose ps
pnpm lint && pnpm test && pnpm build
git status --short && git log --oneline | head -5
git push
```
