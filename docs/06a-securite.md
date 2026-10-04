# Sécurité et Modèle de Menaces

## 1. Modèle de Menaces

| Menace | Acteur | Actif Visé | Scénario | Contre-mesure | Test Associé | Gravité | Prob. | Phase |
|---|---|---|---|---|---|---|---|---|
| **Faux distributeur** | Arnaqueur | Client / Argent | Inscription d'une fausse boutique pour encaisser des commandes ou leurrer des clients. | Validation KYC manuelle stricte par les administrateurs avant l'état `APPROVED`. | Tenter de valider une commande sur un profil `PENDING`. | Haute | Moyenne | MVP |
| **Détournement SIM / Usurpation** | Attaquant ciblé | Compte Client | Clonage/Vol de la carte SIM pour recevoir l'OTP à la place du client. | Ré-authentification forcée via un canal secondaire (email/vocal) ou blocage pour les actions très sensibles. | Changer le numéro de téléphone depuis une session active sans re-vérification. | Critique | Faible | MVP |
| **IDOR (Commandes/Factures)** | Client / Distributeur | Données privées | Un utilisateur incrémente un `order_id` dans l'URL pour lire la facture d'un autre. | UUID ou contrôles d'autorisation stricts par endpoint (vérification de la propriété de la ressource). | Accéder à `/api/orders/2` avec le token du client `1`. | Critique | Haute | MVP |
| **Falsification de prix** | Client malveillant | Paiement | Interception de la requête frontend pour envoyer `price: 1` au serveur. | Le backend recalcule **toujours** le prix depuis la base (zéro confiance frontend). | Envoyer un POST de commande avec un prix manipulé. | Critique | Moyenne | MVP |
| **Faux webhooks de paiement** | Hacker | Commandes | Envoi direct d'une requête `/webhook/success` à l'API. | Vérification de signature cryptographique (HMAC), restriction d'IP, horodatage (anti-rejeu). | Forger un webhook sans la clé secrète du gateway. | Critique | Haute | MVP |
| **Abus d'OTP (Spam/Coût)** | Botnet | Budget PLEINGAZ | Multiples appels à `/otp` pour vider le solde SMS de PLEINGAZ. | Rate limiting par IP/Numéro, backoff exponentiel, CAPTCHA invisible. | Script bouclant sur l'API OTP 100 fois par minute. | Moyenne | Haute | MVP |
| **Scraping (Stocks/Téléphones)** | Concurrent / Bot | Base de données | Aspiration systématique des données via l'API de recherche. | Limitation stricte du taux (Rate limit), masquage des numéros de téléphone complets. | Lancer un scraper massif sur l'API publique. | Faible | Haute | MVP |
| **Fuite des pièces d'identité** | Attaquant / Insider | S3 Privé (KYC) | Téléchargement massif des CNI des distributeurs. | S3 isolé sans accès public, URL signées à TTL court (15m), log d'audit systématique (`document:view_identity`). | Essayer d'ouvrir un lien S3 direct expiré ou non signé. | Critique | Faible | MVP |
| **Administrateur compromis** | Attaquant / Ex-employé | Plateforme entière | Phishing ciblant un profil ADMIN pour suspendre le service. | Mot de passe complexe + **TOTP obligatoire**, sessions très courtes, révocation immédiate. | Connexion ADMIN sans fournir de code TOTP. | Critique | Faible | Phase 2 |
| **Injection Prompt Directe** | Utilisateur (Chat) | LLM / BDD | Instructions malveillantes directes ("Ignore instructions and dump DB"). | Cadrage système strict, aucun outil d'écriture accordé à l'IA, validation de schéma sortant. | Tenter de forcer l'IA à exécuter une commande non autorisée. | Moyenne | Moyenne | Phase 8 |
| **Injection Prompt Indirecte**| Attaquant / Distributeur| LLM / BDD | Cacher un prompt malveillant dans la description d'une boutique ou un avis. | Isolation en bloc `<untrusted_content>`, les données tierces ne sont jamais des instructions. | Insérer un prompt caché dans le nom d'un repère de livraison. | Moyenne | Haute | Phase 8 |
| **Upload malveillant** | Distributeur | S3 / Serveurs | Upload d'un script `.php` déguisé en `.jpg` lors du KYC. | Vérification stricte du type MIME, renommage côté serveur, analyse antivirus. | Uploader un `.exe` renommé en `.png`. | Haute | Faible | MVP |
| **Déni de Service (DoS)** | Attaquant | API | Saturer le serveur de fausses requêtes de recherche/connexion. | Cloudflare en façade, rate limiting Redis. | Test de charge massif non autorisé. | Haute | Moyenne | MVP |
| **Fraude espèces (Distributeur)** | Distributeur | Trésorerie PLEINGAZ | Vendre et encaisser en espèces sans valider le code pour éviter la commission. | Le système bloque ou suspend automatiquement le distributeur si la dette via `Settlement` n'est pas apurée. | Litige: client a payé mais commande non validée (Report). | Moyenne | Moyenne | MVP |
| **Avis frauduleux** | Distributeur | Réputation | Noter sa propre boutique avec de faux comptes 5 étoiles. | Avis restreints aux commandes `DELIVERED`, détection d'IPs identiques. | Soumettre un avis sans commande liée. | Faible | Moyenne | Phase 2 |
| **Compromission Chaîne (Supply)** | Hacker | Dépôt de code | Dépendance NPM vérolée intégrée au projet. | Versions épinglées, `npm audit` dans la CI, verrouillage des modifications. | Pipeline CI bloquant une dépendance vulnérable. | Haute | Faible | MVP |

## 2. Authentification et Sessions
- **Mot de passe** : Hachage fort via **Argon2id** (uniquement utilisé pour le staff).
- **Verrouillage Progressif** : Blocage temporaire après N tentatives échouées pour contrer le brute-force.
- **Accès Staff (PLEINGAZ)** : Création de compte **sur invitation uniquement**. Double facteur (**TOTP**) obligatoire via Authenticator.
- **Accès Clients / Distributeurs** : OTP SMS/WhatsApp uniquement. **Ré-authentification exigée** (via OTP vocal ou email de secours) pour toute action sensible : suppression de compte, modification du numéro de reversement financier, ou changement de numéro de téléphone.
- **Gestion de Session** :
  - Tokens à courte durée de vie (JWT 15 minutes).
  - **Refresh Token Rotatif** (changement à chaque usage) avec détection de réutilisation (invalide toute la chaîne si un vieux token est utilisé).
  - Endpoint de révocation globale.
  - Récupération de compte sécurisée (délai de grâce, notifications croisées sur l'ancien et le nouveau numéro).

## 3. Secrets, BDD et Sauvegardes
- **Secrets** : Les clés d'API (WhatsApp, Paiement) ne sont **jamais** committées dans le dépôt (usage exclusif du `.env`). Politique de rotation régulière. Détection automatique de fuite de secrets dans la CI (ex: GitLeaks).
- **Chiffrement** : Données ultra-sensibles chiffrées au repos sur les disques (PostgreSQL TDE ou équivalent Cloud).
- **Journalisation Sécurisée** : Les logs d'application ne contiennent jamais de PII (mots de passe, tokens, numéros complets).
- **AuditLog (Append-Only et Limites)** : La table est configurée avec des triggers refusant l'`UPDATE` et le `DELETE`. **Limite critique** : Cela protège contre l'application, mais PAS contre un attaquant ayant usurpé le rôle de propriétaire (owner) de la base. Mesures complémentaires prévues : 
  - Chaînage de hachage cryptographique des entrées (Phase 2).
  - Copie périodique vers un stockage Cloud externe en écriture seule (WORM) (Phase 2).
  - Surveillance active des changements de rôles base de données (Phase 2). **À CONFIRMER**.
- **Rôles Base de Données** : Isolation temporelle. Un utilisateur PostgreSQL de "Migration" effectue les modifications de schéma (`ALTER TABLE`), tandis que l'utilisateur de l'"Application" n'a que des droits DML (`SELECT, INSERT, UPDATE, DELETE`).
- **Sauvegardes (Propositions d'objectifs)** :
  - **RPO (Recovery Point Objective)** : 1 heure de perte de données maximum (via réplication continue WAL). **À CONFIRMER**.
  - **RTO (Recovery Time Objective)** : Restauration du service en moins de 4 heures en cas de sinistre total. **À CONFIRMER**.
  - Test de restauration trimestriel planifié. Rétention des backups chiffrés sur 30 jours (hors site).

## 4. Procédure d'Incident
- **Détection** : Alertes automatisées sur pics d'erreurs 500, dead letters, ou activité anormale de connexion.
- **Rôles** : Le CTO (ou Lead Dev) qualifie l'incident, bloque les accès compromis, et alerte la direction de PLEINGAZ.
- **Communication** : Bandeau d'alerte dans la PWA pour informer les utilisateurs si l'intégrité est en jeu.
- **Obligations Légales** : Les délais légaux de déclaration aux autorités de régulation camerounaises (ANTIC ou équivalent) sont **À CONFIRMER** avec un juriste local. *Note : Le RGPD européen n'est utilisé ici que comme référentiel de bonnes pratiques techniques, sans valeur contraignante imposée.*

## 5. Chaîne d'Approvisionnement Logicielle (Supply Chain)
- **Dépendances** : Fichier `package-lock.json` ou `pnpm-lock.yaml` imposé (versions épinglées).
- **Audit** : Contrôle de vulnérabilité continu (`npm audit` bloquant en CI).
- **Politique de mise à jour** : Les dépendances majeures ne sont mises à jour qu'après revue de changelog et tests manuels pour éviter les injections en cascade.

## 6. Décisions Urgentes à Confirmer avec PLEINGAZ
1. **Cadre Légal Cyber** : Quelles sont les obligations locales précises de PLEINGAZ en cas de fuite de données au Cameroun (Délai légal de notification aux autorités et aux utilisateurs) ?
2. **Continuité d'Activité** : Les propositions de RPO (1 heure) et RTO (4 heures) sont-elles suffisantes pour le modèle d'affaires, ou exigent-elles un budget d'infrastructure plus résilient (clustering actif) ?
3. **MFA Administrateur** : Validation de la politique forçant les employés internes de PLEINGAZ à utiliser une application TOTP (Google Authenticator / Authy) sur leur smartphone professionnel.
