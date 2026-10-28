# 14a. Spécification de l'Authentification et Preuve Entrante WhatsApp

- **Statut** : VALIDÉ (CR-003 D-11, D-12, C-04)
- **Portée** : Inscription, connexion, récupération, changement de numéro et vérification sans coût SMS sortant.
- **Phase cible** : MVP (Phase 2 révisée).

---

## 1. Principes Directeurs et Philosophie "Preuve Entrante"

1. **Zéro coût sortant pour PLEINGAZ (D-12.1, C-04)** :
   L'envoi massif d'OTP par SMS ou par messages WhatsApp initiés par l'entreprise (Business-Initiated Conversations) engendre des coûts de facturation récurrents par conversation chez Meta et les opérateurs télécoms locaux.
   La plateforme adopte le paradigme de la **Preuve Entrante** :
   - Le serveur génère un jeton de défi court lié à la session navigateur active de l'utilisateur.
   - L'utilisateur envoie ce défi via WhatsApp vers le numéro officiel vérifié de PLEINGAZ.
   - Le webhook de PLEINGAZ reçoit le message entrant et extrait l'identifiant expéditeur certifié par Meta (`from` au format E.164).
   - L'expéditeur prouve ainsi le contrôle exclusif du numéro de téléphone sans qu'aucun message sortant payant n'ait été émis par PLEINGAZ hors de la fenêtre de service gratuite (User-Initiated 24h Service Window).

2. **Comparaison des Deux Variantes d'Expérience Utilisateur (C-04.2)** :

| Critère | Option A (Recommandée) | Option B (Alternative) |
|---|---|---|
| **Mécanisme** | Le serveur affiche un défi court (ex: `PG-8492`). Le bouton web ouvre WhatsApp avec ce texte prérempli vers le compte officiel PLEINGAZ. L'utilisateur clique sur « Envoyer ». | L'utilisateur envoie un mot-clé générique (ex: `CONNEXION`). Le bot PLEINGAZ répond dans la discussion avec un code PIN à 6 chiffres. L'utilisateur revient sur le site et saisit le code. |
| **Friction mobile** | **Très faible** : un seul tapotement pour basculer vers WhatsApp et un appui sur « Envoyer ». Aucun code à mémoriser ni à retaper. | **Élevée** : bascule aller-retour entre les applications, mémorisation/copie du code, risque d'erreur de frappe sur clavier mobile d'entrée de gamme. |
| **Synchronisation** | La session web écoute l'événement d'approbation (SSE / polling sécurisé) et se connecte automatiquement dès réception du webhook. | La session attend la soumission manuelle du formulaire contenant le code PIN. |
| **Sécurité** | Le défi est éphémère (10 min), lié cryptographiquement à la session et à l'empreinte de l'appareil. | Le code généré doit être stocké temporairement et vérifié contre des attaques par force brute. |
| **Verdict** | **Retenue et recommandée** pour maximiser le taux de conversion sur mobile Android au Cameroun. | Rejetée (friction excessive et dépendance à la vitesse de réponse sortante). |

3. **Conditions et Tarification Meta WhatsApp Business Cloud API (C-04.4)** :
   - *Source vérifiée* : Documentation officielle Meta for Developers (Graph API WhatsApp Business Cloud API - Conversation-Based Pricing).
   - *Principe tarifaire* : Les conversations initiées par l'utilisateur (Service Conversations) s'ouvrent dès que l'entreprise répond à un message entrant dans un délai de 24 heures. Meta octroie un quota mensuel de 1 000 conversations de service gratuites par compte WhatsApp Business, réduisant le coût du MVP à 0 FCFA pour le volume pilote.
   - *Limites techniques* : Webhook public HTTPS obligatoire avec validation de la signature HMAC SHA-256 (`X-Hub-Signature-256`) et token de vérification (`hub.verify_token`).

---

## 2. Architecture de l'Interface `VerificationChannel` (D-12.2)

Le système isole la preuve d'identité derrière une interface polymorphique stricte, remplaçant l'ancien concept `OtpProvider` :

```typescript
export interface VerificationChallenge {
  challengeId: string;
  code: string;           // ex: "PG-7391"
  phone: string;          // Numéro attendu au format E.164 (+237...)
  portal: PortalType;     // CUSTOMER, DISTRIBUTOR, COURIER, STAFF
  expiresAt: Date;
  verifiedAt?: Date;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

export interface VerificationChannel {
  createChallenge(phone: string, portal: PortalType, sessionContext: SessionContext): Promise<VerificationChallenge>;
  verifyIncomingMessage(senderPhone: string, messageText: string, metadata: Record<string, any>): Promise<boolean>;
  getChannelType(): 'WHATSAPP_INBOUND' | 'SIMULATED' | 'MANUAL_ASSISTED';
}
```

### Implémentations requises :
1. **`WhatsAppInboundChannel` (Cible Production)** :
   Traite les payloads entrants du webhook Meta WhatsApp Cloud API. Vérifie l'en-tête `X-Hub-Signature-256` avec le secret de l'application. Valide que le texte correspond au défi actif lié à ce numéro d'expéditeur.
2. **`SimulatedChannel` (Développement, Recette locale & Tests CI)** :
   Actif si `NODE_ENV !== 'production'` ou `WHATSAPP_SIMULATED=true`. Le défi généré est consigné dans la console serveur (`[SIMULATED-AUTH] Code: PG-XXXX pour +2376XXXXXXXX`). Une route d'émulation protégée `/api/v1/test/verify-challenge` permet d'acquitter le défi sans mobile ni connexion WhatsApp réelle.
3. **`ManualAssistedChannel` (Secours d'exception - D-12.2)** :
   Mis en œuvre par le rôle `ACCOUNT_MANAGER` (D-15). Utilisé lors de litiges de perte de compte après vérification d'identité humaine et contre-appel sur le numéro secondaire. Exige la validation formelle d'un `ADMIN` (principe des deux personnes).

---

## 3. Règle des Deux Numéros Obligatoires (D-12.3)

Toute inscription sur la plateforme (Acheteur, Distributeur, Livreur) impose strictement **deux numéros distincts** :

1. **Numéro WhatsApp Principal (`phone`)** :
   - Identifiant de connexion unique du compte.
   - Format international strict E.164 Cameroun (`+2376XXXXXXXX` ou `+2372XXXXXXXX`).
   - Obligatoirement vérifié par défi WhatsApp entrant avant création finale du compte.
2. **Numéro Secondaire de Secours (`backupPhone`)** :
   - Numéro de contact d'urgence distinct du numéro principal (`backupPhone !== phone`).
   - Format E.164 Cameroun.
   - Non vérifié automatiquement au MVP pour éviter toute friction supplémentaire, mais contrôlé syntaxiquement.
   - **Règle anti-contournement (C-03.2)** : Un numéro secondaire ne peut pas être simultanément le numéro principal d'un autre compte utilisateur actif sur la plateforme.
   - Utilisé pour le rappel vocal humain en cas de détresse logistique, d'alerte de sécurité ou de procédure de récupération de compte par le gestionnaire de compte.

---

## 4. Parcours Utilisateurs et Spécification des Écrans

### 4.1 Inscription (Acheteur, Distributeur, Livreur)
- **Écran 1 : Coordonnées d'accès** :
  - Saisie du Numéro WhatsApp principal.
  - Saisie du Numéro secondaire de secours.
  - Saisie du Mot de passe : hachage côté serveur via **Argon2id** (mémoire 64 Mo, 3 itérations, 1 parallélisme). Exigence : 8 caractères minimum, détection des mots de passe triviaux (`12345678`, `pleingaz2026`, etc.) avec jauge de force visuelle en temps réel sans jargon technique.
- **Écran 2 : Identité et Localisation** :
  - Nom, prénom.
  - Ville (liste déroulante normalisée : Douala, Yaoundé, etc.).
  - Quartier et **Repère textuel précis** (ex: *« Face Pharmacie de l'Espoir, portail noir »*).
  - Email (strictement facultatif).
  - Consentement obligatoire au traitement des données personnelles (case non pré-cochée, référence explicite à la loi camerounaise).
- **Écran 3 : Preuve WhatsApp Entrante** :
  - Le serveur génère le défi `challengeId` et le code (ex: `PG-3829`).
  - L'écran affiche un bouton bien visible : **« Activer mon compte sur WhatsApp »**.
  - L'appui ouvre l'URL `https://wa.me/<NUMERO_OFFICIEL_PLEINGAZ>?text=Activer%20mon%20compte%20PLEINGAZ%20code%20PG-3829`.
  - L'utilisateur envoie le message. La page web affiche un état d'attente animé (*« Vérification de votre message en cours... »*) avec un compte à rebours de 10 minutes.
  - Dès réception du webhook, la page web se met à jour instantanément et redirige l'utilisateur vers son espace dédié.
  - *Étapes complémentaires* : Les distributeurs et livreurs sont ensuite orientés vers leur téléversement de documents (KYC 3 pièces pour distributeurs D-04 ; CNI/portrait/véhicule pour livreurs D-17).

### 4.2 Connexion Ordinaire (D-12.4)
- **Formulaire** : Numéro WhatsApp principal + Mot de passe.
- **Sécurité et protection anti-brute-force** :
  - Limitation de débit (Rate Limiting) : 5 tentatives échouées par tranche de 15 minutes par adresse IP et par numéro.
  - Verrouillage progressif du compte : blocage temporaire exponentiel (5 min, 15 min, 1h) en cas d'échecs répétés.
  - Détection anti-robot invisible (CAPTCHA sans friction si suspecté).
- **Appareil de confiance (Trusted Device)** :
  - Cookie HttpOnly signé (`device_trust_token`) valide 30 jours, associé à une empreinte non sensible de l'appareil (`DeviceFingerprint` : User-Agent normalisé, résolution d'écran, langue).
  - Si l'appareil est reconnu de confiance, la connexion par mot de passe est immédiate.
  - Si l'appareil est inconnu : connexion autorisée mais enregistrement de l'appareil et notification d'alerte de sécurité visible lors de l'arrivée sur l'espace.

### 4.3 Mot de Passe Oublié (D-12.5)
1. L'utilisateur indique son numéro WhatsApp sur le portail de son profil.
2. Le serveur vérifie l'existence du compte. Pour prévenir l'énumération, le message affiché est strictement identique que le numéro existe ou non : *« Si ce numéro correspond à un compte actif, appuyez sur le bouton ci-dessous pour confirmer votre demande sur WhatsApp »*.
3. Bouton WhatsApp avec défi unique : `https://wa.me/<NUMERO_OFFICIEL>?text=Reinitialiser%20mon%20mot%20de%20passe%20PLEINGAZ%20code%20RST-5912`.
4. Dès réception du message par le webhook, la session web autorise l'accès à l'écran de saisie du nouveau mot de passe.
5. **Révocation immédiate** : Dès validation du nouveau mot de passe, l'intégralité des sessions et jetons actifs de cet utilisateur sur tous les appareils est révoquée (`Session.revokedAt = now()`).
6. Enregistrement dans `AuditLog` et alerte de sécurité sur le tableau de bord de l'utilisateur.

### 4.4 Procédure de Changement de Numéro et Numéro Perdu (D-12.6)
- **Changement de données courantes** (Nom, Quartier, Repère) : modification immédiate dans l'espace personnel de l'utilisateur, soumise à la saisie du mot de passe courant.
- **Changement de numéro WhatsApp (Action Ultra-Sensible)** :
  1. L'utilisateur saisit son mot de passe actuel et son **nouveau numéro WhatsApp**.
  2. Le serveur déclenche un défi WhatsApp entrant obligatoire sur le **NOUVEAU numéro**.
  3. Dès validation du nouveau numéro, un **délai de sécurité (Cooldown)** configurable de 48 heures (`phone_change_cooldown_hours`) est activé.
  4. Durant ces 48 heures, les actions critiques (commandes volumineuses, changement de coordonnées de paiement, suppression de compte) sont temporairement verrouillées.
  5. Une alerte administrative est consignée dans le Control Center.
- **Numéro Perdu (Perte/Vol de carte SIM ou de téléphone)** :
  1. L'utilisateur ne peut plus recevoir de WhatsApp. Il contacte le support téléphonique ou se présente en boutique.
  2. Le dossier est pris en charge par un **`ACCOUNT_MANAGER`** (D-15).
  3. Le gestionnaire crée un dossier `AccountCase`, consulte le `backupPhone` (numéro secondaire) et effectue un contre-appel vocal de vérification d'identité en posant des questions de contrôle (dernière commande, quartier enregistré).
  4. Le gestionnaire soumet une *Demande de mise à jour de numéro* dans le système.
  5. **Approbation à deux personnes obligatoire** : La demande doit être formellement approuvée par un `ADMIN` distinct dans le Control Center avant d'être effective. Le gestionnaire ne peut jamais appliquer la modification lui-même.

---

## 5. Spécification des Endpoints d'Authentification (`/api/v1/auth/*`)

| Méthode | Route | Rôle / Accès | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/challenge/initiate` | Public | Initie un défi de preuve entrante WhatsApp (inscription ou reset). |
| `POST` | `/api/v1/auth/webhook/whatsapp` | Public (Signature HMAC) | Réception du webhook Meta Cloud API pour validation du défi. |
| `GET` | `/api/v1/auth/challenge/:challengeId/status` | Public (Session active) | Polling / SSE du statut de validation du défi par la page web. |
| `POST` | `/api/v1/auth/register` | Public (Défi validé) | Création finale du compte après preuve du numéro. |
| `POST` | `/api/v1/auth/login` | Public | Connexion par Numéro WhatsApp + Mot de passe (avec cookie `refresh_token`). |
| `POST` | `/api/v1/auth/password-reset` | Public (Défi validé) | Remplacement du mot de passe et révocation globale des sessions. |
| `POST` | `/api/v1/auth/logout` | Authentifié | Déconnexion de la session courante et suppression du cookie. |
| `GET` | `/api/v1/auth/sessions` | Authentifié | Liste des appareils et sessions actives du compte. |
| `DELETE`| `/api/v1/auth/sessions/:id` | Authentifié | Révocation à distance d'une session suspecte. |
| `POST` | `/api/v1/auth/change-phone` | Authentifié | Initie le processus sécurisé de changement de numéro principal. |

---

## 6. Analyse des Menaces et Contre-Mesures de Sécurité (D-12.7)

| Menace identifiée | Description du vecteur | Contre-mesure technique rigoureuse | Gravité |
|---|---|---|:---:|
| **Ingénierie sociale du défi** | Un attaquant convainc la victime d'envoyer un code de validation WhatsApp qu'il a lui-même initié sur son propre navigateur. | Le code généré porte un préfixe d'action explicite (ex: `AUTH-XXXX` vs `RESET-XXXX`) et le texte prérempli WhatsApp indique en français clair : *"PLEINGAZ : Ne partagez jamais ce code. Envoyez ce message uniquement si vous êtes devant votre écran personnel"*. | **ÉLEVÉE** |
| **Détournement de carte SIM (SIM Swap)** | L'attaquant usurpe la carte SIM de la victime auprès de l'opérateur télécom et récupère son compte WhatsApp. | L'accès au compte requiert obligatoirement le **Mot de passe personnel** en plus de la preuve WhatsApp. La simple possession du WhatsApp ne permet pas de se connecter. En cas de réinitialisation de mot de passe, alerte immédiate et délai de sécurité bloquant les mutations sensibles. | **CRITIQUE** |
| **Webhook Meta falsifié (Spoofing)** | Un pirate injecte de faux messages entrants sur l'URL du webhook pour valider des numéros arbitraires. | Contrôle cryptographique strict de l'en-tête HTTP `X-Hub-Signature-256` calculé via HMAC-SHA256 avec le `WHATSAPP_APP_SECRET`. Tout rejet de signature lève une alerte de sécurité immédiate et bloque la requête avec code 401. | **CRITIQUE** |
| **Attaque par rejeu (Replay)** | Réutilisation d'un ancien défi intercepté pour réactiver une session. | Invalidation atomique du défi dès sa première utilisation (`isConsumed = true`). Expiration absolue (TTL) de 10 minutes non prolongeable. | **MOYENNE** |
| **Énumération de comptes et numéros** | Balayage systématique de numéros pour cartographier les utilisateurs inscrits. | Réponses HTTP et messages d'erreur strictement identiques sur les formulaires de connexion et de récupération : *"Identifiants non reconnus"* ou *"Si ce compte existe, une procédure a été transmise"*. Temps de réponse normalisé artificiellement (constant-time response) pour neutraliser les attaques par analyse temporelle. | **ÉLEVÉE** |
| **Création massive de comptes par scripts (Bots)** | Automatisation de requêtes HTTP d'inscription pour saturer le système. | Seule la preuve entrante WhatsApp (impossible à forger sans compte WhatsApp réel lié à une carte SIM physique) permet d'activer le compte. Limitation à 3 défis par IP par heure. | **ÉLEVÉE** |
| **Fatigue de l'utilisateur (Notification Spam)** | Inondation de sollicitations WhatsApp pour pousser à une validation par inadvertance. | PLEINGAZ n'envoie aucun message de confirmation non sollicité. C'est l'utilisateur qui doit initier volontairement l'envoi du message dans sa propre application WhatsApp. | **FAIBLE** |

---

## 7. Plan de Tests de Validation de l'Authentification (D-12.9)

1. `test_challenge_expiration` : Soumission d'une réponse WhatsApp après le délai de 10 minutes -> Défi refusé, session non validée.
2. `test_replay_attack` : Soumission répétée du même code de défi validé -> Deuxième tentative rejetée avec erreur.
3. `test_invalid_webhook_signature` : Émission d'un payload webhook avec signature invalide -> Rejet 401 immédiat, trace dans `AuditLog`.
4. `test_wrong_sender_phone` : Message WhatsApp contenant le code d'une session, mais envoyé depuis un numéro de téléphone différent de celui indiqué dans le formulaire -> Rejet de validation, numéro non certifié.
5. `test_duplicate_account_phone` : Tentative de création d'un compte avec un numéro principal déjà existant -> Blocage sans divulgation d'information sensible.
6. `test_simulated_channel_parity` : Vérification que `SimulatedChannel` produit exactement les mêmes états en base que `WhatsAppInboundChannel` sans accès internet.
7. `test_session_revocation_on_reset` : Vérification que la réinitialisation de mot de passe invalide instantanément tous les jetons JWT/cookies émis antérieurement.
