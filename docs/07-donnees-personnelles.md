# Données Personnelles et Vie Privée

*Note : Le RGPD européen n'est cité ici que comme référentiel de bonnes pratiques d'ingénierie (Privacy by Design). Le cadre légal applicable au Cameroun (données personnelles, communications électroniques, durées de conservation, notification d'incident) est **À CONFIRMER** avec un juriste local. Ne rien tenir pour acquis sans source juridique locale.*

## 1. Inventaire des Traitements et Données Personnelles
Toutes les durées de conservation proposées et les bases légales proposées sont des hypothèses de conception et sont strictement **À CONFIRMER** par PLEINGAZ avec un juriste camerounais.

| Donnée | Nature | Finalité | Sensibilité | Rétention Proposée | Base Légale Proposée | Accès (Rôle) | Stockage |
|---|---|---|---|---|---|---|---|
| Numéro WhatsApp (`whatsappPhone` - D-12)| Contact | Auth WhatsApp entrante (D-12), OTP, Alertes | Élevée | Actif + 1 an (**À CONFIRMER**) | Contrat (**À CONFIRMER**) | Utilisateur, Distr. (commande), Admin | PostgreSQL (E.164, indexé) |
| Numéro d'appel vocal (`callPhone` - D-12)| Contact | Joignabilité logistique, livreur, support | Élevée | Actif + 1 an (**À CONFIRMER**) | Contrat (**À CONFIRMER**) | Livreur (mission active), Distr., Admin | PostgreSQL (E.164) |
| Email | Contact | Notifications, récapitulatifs, secours | Élevée | Actif + 1 an (**À CONFIRMER**) | Contrat (**À CONFIRMER**) | Utilisateur, Admin | PostgreSQL (Optionnel acheteur) |
| Nom Complet / Raison Sociale | Identité | Facturation, Profil, Reçus | Moyenne | Actif + 10 ans (**À CONFIRMER**) | Obligation légale (**À CONFIRMER**) | Utilisateur, Finance | PostgreSQL |
| Adresses & Repères | Livraison | Acheminement de bouteilles | Élevée | Actif + 1 an (**À CONFIRMER**) | Contrat (**À CONFIRMER**) | Utilisateur, Livreur (actif) | PostgreSQL |
| Coordonnées GPS (Boutique)| Géoloc | Carte Distributeur (D-02) | Moyenne | Actif + 1 an (**À CONFIRMER**) | Consentement (**À CONFIRMER**) | Public (Distributeur) | PostgreSQL |
| Localisation Nav. (Acheteur)| Tech | Filtrage proximité (D-02)| Élevée | Fin de session (**À CONFIRMER**) | Consentement au clic (**À CONFIRMER**) | Non conservée (volatile) | Mémoire / Session |
| Géolocalisation Livreur (`COURIER` - D-17)| Logistique | Suivi en temps réel de la livraison | Élevée | Mission active + 30 j purge (**À CONFIRMER**) | Exécution du contrat (**À CONFIRMER**) | Acheteur (mission en cours), Dispatch, Admin | PostgreSQL / Redis (Purge auto) |
| Défis d'authentification (`VerificationChallenge` - D-12)| Sécurité | Preuve entrante WhatsApp, anti-rejeu | Élevée | 24 heures après expiration/consommation | Intérêt légitime / Sécurité | Système uniquement (zéro accès manuel) | PostgreSQL (Hash Argon2id) |
| Pièces d'identité (3 max)| Admin | KYC Distributeur (D-04) | Maximale | Actif + 1 an (**À CONFIRMER**) | Obligation légale (**À CONFIRMER**) | Admin (`SUPER_ADMIN`, `ADMIN`)| S3 Privé (URL 15 min)|
| Photos Boutique | Public | Visibilité Distributeur | Faible | Actif + 1 an (**À CONFIRMER**) | Intérêt lég. (**À CONFIRMER**) | Public | S3 Public |
| Horaires Boutique | Info | Ouvertures et fermetures | Faible | Actif + 1 an (**À CONFIRMER**) | Contrat (**À CONFIRMER**) | Public | PostgreSQL |
| Historique Commandes & Quota (D-14)| Transac | Suivi commande, jauge 5 btl / 30 j | Moyenne | 5 ans (**À CONFIRMER**) | Contrat (**À CONFIRMER**) | Acheteur, Distributeur, Admin | PostgreSQL |
| Ventes au Comptoir (`CounterSale` - D-16)| Transac | Vente physique directe, contrôle quota | Moyenne | 10 ans (**À CONFIRMER**) | Obligation légale (**À CONFIRMER**) | Distributeur, Acheteur, Admin | PostgreSQL |
| Factures PDF | Transac | Preuve fiscale (D-06)| Moyenne | 10 ans (**À CONFIRMER**) | Obligation légale (**À CONFIRMER**) | Utilisateur, Admin | S3 Privé |
| Paiement & Ledger | Finance | Rapprochement, Écritures | Élevée | 10 ans (**À CONFIRMER**) | Obligation légale (**À CONFIRMER**) | Finance Admin, Auditeur | PostgreSQL (Immuable)|
| Dossiers Support (`AccountCase` - D-15)| Support | Assistance déléguée par Gestionnaire | Élevée | Actif + 5 ans (**À CONFIRMER**) | Contrat / Intérêt légitime | Gestionnaire assigné, Admin | PostgreSQL (Traçabilité stricte)|
| Accusés de Lecture (`InfoNoticeRead` - D-18)| Info | Confirmation de prise de connaissance | Faible | 1 an après expiration annonce | Intérêt légitime | Utilisateur, Admin | PostgreSQL |
| Messages & Chat | Comms | Support, Logistique | Élevée | 1 an (**À CONFIRMER**) | Contrat (**À CONFIRMER**) | Utilisateur, Support | PostgreSQL |
| Conversations IA | Comms | Assistance LLM | Moyenne | 30 jours (**À CONFIRMER**) | Consentement (**À CONFIRMER**) | Utilisateur, Admin | PostgreSQL |
| Avis Clients | Social | Réputation Boutique | Moyenne | Actif + 5 ans (**À CONFIRMER**) | Intérêt lég. (**À CONFIRMER**) | Public (Pseudonyme) | PostgreSQL |
| AuditLog & Maker-Checker| Traces | Traçabilité légale / D-06 / D-15| Élevée | 10 ans (**À CONFIRMER**) | Obligation légale (**À CONFIRMER**) | Super-Admin, Auditeur | PostgreSQL (Append-only)|
| Journaux Techniques & IP | Tech | Sécurité & Détection d'intrusion | Faible | Paramétrable dans `Setting` : 90 jours par défaut (**À CONFIRMER**) | Intérêt lég. / Sécurité (**À CONFIRMER**) | DevOps, DPO | Monitoring & PG (`ipAddress` masquée post-90j) |
| SearchEvent | Analytics| Mots-clés / Zone (D-02)| Faible | 1 an (**À CONFIRMER**) | Intérêt lég. (**À CONFIRMER**) | Analyste | PostgreSQL (Zone grossière)|
| Alertes (Stock) | Préfs | Notifications push / WhatsApp | Moyenne | Jusqu'à désinscription (**À CONFIRMER**)| Consentement (**À CONFIRMER**)| Utilisateur, Système | PostgreSQL |
| Consentements | Preuve | Conformité légale | Faible | 3 ans après opt-out (**À CONFIRMER**) | Obligation légale (**À CONFIRMER**)| Admin | PostgreSQL |
| Appareils & Sessions (D-11)| Tech | Sécurité (JWT, audience par espace) | Faible | 30 jours après révocation (**À CONFIRMER**)| Sécurité (**À CONFIRMER**) | Système | Redis / PostgreSQL |
| Données Livreurs (D-17)| Contact | Acheminement, double confirmation | Moyenne | Actif + 1 an (**À CONFIRMER**) | Contrat (**À CONFIRMER**) | Admin, Dispatch, Acheteur (mission) | PostgreSQL |

## 2. Flux et Prestataires (Transferts de Données)
La légalité de ces transferts, souvent hors du Cameroun, est **À CONFIRMER** par un juriste.
1. **Hébergeur (VPS)** : Reçoit BDD et requêtes. Données stockées en Europe/US. **Validation locale À CONFIRMER**.
2. **CDN (Cloudflare)** : Reçoit les IPs et la localisation du navigateur (Edge). Transfert US. Ne stocke pas de données applicatives.
3. **Fournisseur SMS/OTP** : Fournisseur de secours pour notification textuelle éventuelle (non activé au MVP gratuit WhatsApp D-12).
4. **WhatsApp Cloud API (Meta) / Twilio WhatsApp (D-12)** : Reçoit les webhooks de messages entrants pour l'authentification (preuve entrante Option A) et achemine les notifications transactionnelles autorisées. Transfert mondial.
5. **Paiement (MTN/Orange)** : Reçoit numéro de téléphone payeur, montant, références.
6. **Tuiles / Carte (Jawg/Mapbox)** : Reçoit l'IP et la requête géographique.
7. **Géocodage (Nominatim)** : Requêté côté Backend pour éviter de fuiter les IPs clients. Reçoit une adresse textuelle.
8. **LLM (OpenAI/Anthropic)** : Reçoit les requêtes d'aide (masquées). **La non-réutilisation des données pour l'entraînement doit être contractuellement À CONFIRMER**.
9. **Monitoring (Datadog/Sentry)** : Reçoit les journaux techniques anonymisés (traces d'erreurs, URIs).
10. **Email** : Reçoit l'adresse email et le contenu transactionnel.

## 3. Minimisation et Accès Tiers (Distributeur, Livreur, Gestionnaire, Admin)
- **Minimisation globale** : Le modèle collecte uniquement ce qui est strictement requis pour opérer la plateforme. Par exemple, aucun numéro de compte Mobile Money complet n'est stocké si l'identifiant transactionnel généré par l'opérateur suffit. Les numéros de CNI ne sont jamais saisis en texte clair, seule la photo de la pièce est stockée, limitant le risque d'indexation accidentelle.
- **Principe d'isolation absolue des espaces (D-11 / D-13 / Spécification 14b)** : Les données d'un profil ne sont jamais exposées à un profil non concerné. Tout accès inter-espaces tente de provoquer une erreur 404 (ressource inexistante) pour empêcher toute fuite d'information sur l'existence des utilisateurs ou des données tiers.
- **Accès post-commande (Distributeur)** : Le distributeur est le vendeur final et juridiquement responsable de la transaction. À ce titre, il ne "perd pas" la vue des données de son acheteur immédiatement. Une fenêtre d'accès complet (ex: 30 jours, **À CONFIRMER**) est octroyée après `DELIVERED` ou `CANCELLED` pour permettre la gestion des réclamations, les retours, et le support client. Au-delà de cette fenêtre, l'accès est restreint exclusivement aux données fiscales (celles inscrites en dur sur le PDF de facture). Tout accès à l'historique prolongé est soumis à l'enregistrement d'une trace dans le journal d'audit.
- **Minimisation stricte pour les Livreurs (`COURIER` - D-05 / D-17)** : Le livreur a accès aux détails de contact du client (`callPhone`, repère textuel, instructions de livraison) **exclusivement pendant la durée active de la livraison** (`ASSIGNED`, `PICKED_UP`, `IN_TRANSIT`). Dès la double confirmation de livraison achevée (`DELIVERED`) ou en cas d'annulation/échec (`FAILED`), ces données sont masquées de l'interface mobile du livreur. Aucun carnet d'adresses client ni historique d'itinéraires clients n'est conservé localement sur le terminal du livreur.
- **Encadrement strict du Gestionnaire de compte (`ACCOUNT_MANAGER` - D-15 / Spécification 14e)** : Le gestionnaire de compte n'a AUCUN droit de mutation directe sur les données des clients. Il ne peut jamais se substituer à un client (*impersonation* formellement interdite). Toute action d'assistance exige la création préalable d'un dossier `AccountCase` formel, tracé et motivé. Les actions à risque financier ou de sécurité requièrent une validation préalable par un administrateur (`ADMIN`). Le gestionnaire n'a jamais accès aux mots de passe, tokens ou challenges d'authentification des utilisateurs.
- **Contrôle et calcul du Quota Acheteur (D-14 / Spécification 14c)** : L'espace acheteur expose une jauge de consommation dynamique calculée sur une fenêtre glissante de 30 jours (seuil : 5 bouteilles maximum pour les particuliers). Les données de commande requises pour ce calcul sont strictement limitées aux volumes et dates de livraison confirmées.
- **Minimisation des données de recherche (`SearchEvent` - D-02)** : Les coordonnées GPS précises issues du navigateur lors d'une recherche ne sont JAMAIS persistées en base. Seule la zone géographique grossière (ville / quartier résolu ou arrondi à 1-2 km) est conservée dans `SearchEvent` à des fins d'analyse de la demande non servie. Le dernier lieu choisi manuellement par l'utilisateur peut être mémorisé localement sur l'appareil (via `localStorage`), avec la présence obligatoire d'un bouton explicite pour l'effacer à tout moment.
- **Sous-comptes Boutique (StoreStaff)** : Les vendeurs et employés (`StoreStaff`) ne voient que les commandes en cours qu'ils gèrent à un instant T. Ils n'ont aucun droit d'accès à l'extraction de clientèle, aux données globales de la boutique, ni aux historiques financiers complexes. Ces données sont réservées au rôle supérieur `Distributor Manager`.

## 4. Sécurité Spécifique des Pièces d'Identité et Documents KYC (D-04)
- **Liste limitative des documents** : Conformément à la décision D-04, la collecte documentaire des distributeurs est strictement bornée à 3 pièces : CNI recto/verso (`ID_CARD_FRONT`, `ID_CARD_BACK`), photo portrait du gérant (`PORTRAIT_PHOTO`), et photo de façade de la boutique (`SHOP_PHOTO`). Aucun registre du commerce, NIU ou document fiscal n'est requis ni stocké.
- **Stripping EXIF systématique** : Dès la réception de l'upload sur l'API, les métadonnées EXIF (particulièrement les coordonnées GPS, type d'appareil, date/heure de prise de vue) sont purgées avant écriture sur le stockage objet.
- **Stockage S3 Privé et URLs signées éphémères** : Les pièces d'identité sont isolées dans un bucket S3 strictement privé, chiffré au repos (AES-256 / SSE-S3). Aucune URL publique directe n'existe. L'accès des administrateurs habilités (`ADMIN`, `SUPER_ADMIN`) se fait exclusivement par URL présignée d'une durée de validité maximale de **15 minutes**.
- **Accès restreint et tracé** : Seuls les administrateurs disposant des habilitations requises peuvent générer ces URLs. Chaque consultation génère un événement `AuditLog` horodaté avec identité de l'administrateur et adresse IP.
- **Rétention** : Les documents sont conservés pendant toute la durée d'activité du compte distributeur. En cas de rejet définitif du dossier KYC, les documents sont purgés après un délai de recours de 30 jours (**À CONFIRMER**).

## 5. Droits des Personnes (Procédure et Vérification)
Les droits fondamentaux (accès, rectification, effacement, retrait du consentement) sont centralisés et gérés par le service client ou le Responsable des Données.
- **Délai légal de traitement** : Fixé à 30 jours maximum (**À CONFIRMER** juridiquement au Cameroun). Le processus de réponse sera automatisé ou manuel au cas par cas.
- **Vérification d'Identité Stricte** : Pour empêcher toute altération malveillante par ingénierie sociale ou par détournement de carte SIM (SIM Swap), la suppression ou l'exportation complète d'un compte (portabilité) exige systématiquement une vérification manuelle forte de l'identité du demandeur. Une simple confirmation d'OTP est jugée insuffisante pour ces actions irréversibles. Le support peut exiger l'envoi d'un e-mail depuis l'adresse enregistrée, ou une vérification des dernières factures.
- **Procédure de demande** : Formulable directement depuis l'application via un formulaire sécurisé ou par e-mail avec accusé de réception.
- **Limites d'accès** : Les demandes répétées ou manifestement abusives (harcèlement du support) pourront être limitées selon des seuils raisonnables (**À CONFIRMER**).

## 6. Suppression de Compte, Sauvegarde et Anonymisation
- **Anonymisation (Soft Delete)** : La contrainte d'unicité (téléphones `whatsappPhone` et `callPhone`, email) est libérée lors d'une suppression par un *Soft Delete* (champs PII écrasés par un UUID ou un hash). Les messages privés sont vidés. Le numéro de téléphone original peut ainsi être réutilisé pour une nouvelle inscription.
- **Intégrité de l'Audit** : Cette approche garantit de ne jamais casser la piste de l'`AuditLog` ou les relations avec les anciennes commandes de la boutique.
- **Rétention Comptable & Grand Livre (D-06 / D-16)** : Les factures PDF, écritures du Grand Livre (`LedgerEntry`), transactions au comptoir (`CounterSale`) et journaux d'audit (expurgés des PII directs) sont conservés selon la loi comptable (10 ans, **À CONFIRMER**).
- **Blocage** : Les commandes en cours (`PENDING`, `EN_ROUTE`) bloquent la demande de suppression jusqu'à leur résolution.
- **Sauvegarde et Restauration** : Les données supprimées subsistent temporairement dans les sauvegardes (Backups chiffrés). Elles "disparaissent" naturellement quand la sauvegarde expire (ex: 30 jours, rétention **À CONFIRMER**). Si une restauration d'urgence est nécessaire avant expiration, la procédure technique implique obligatoirement de relancer les routines de *Soft Delete* sur l'instance restaurée pour honorer rétroactivement les droits à l'oubli des clients.

## 7. Gestion du Consentement
- **Preuve** : Versionnement exact des textes acceptés (CGU/Politiques) enregistré en BDD avec un horodatage (timestamp) inaltérable. Cela sert de preuve en cas de contrôle.
- **Canaux** : L'envoi de messages via WhatsApp, les communications Marketing, et les Alertes de Stock font l'objet d'un Opt-In clair (décoché par défaut). L'authentification par WhatsApp (D-12) repose sur la fourniture du service (base contractuelle).
- **Cookies & Audience** : PLEINGAZ compte utiliser des trackers d'audience (Analytics). Un bandeau explicite sera requis (**À CONFIRMER**). Les cookies strictement techniques (JWT) en sont exemptés.
- **Géolocalisation au clic uniquement (D-02)** : Aucun appel à l'API de géolocalisation du navigateur n'est effectué de manière passive ou au chargement de page. L'accès à la localisation GPS est sollicité UNIQUEMENT lors d'un clic explicite de l'utilisateur sur le bouton "Me localiser", précédé ou accompagné d'une mention claire sur l'utilisation immédiate des coordonnées pour classer les distributeurs. L'utilisateur peut révoquer cette permission à tout moment dans son navigateur ou privilégier la localisation manuelle (ville, quartier, repère, sélecteur cartographique), qui prévaut toujours et ne nécessite aucun partage de coordonnées GPS de l'appareil. Aucune géolocalisation par adresse IP n'est employée.
- **Localisation** : Autorisée dynamiquement au niveau du navigateur, révocable via les paramètres de l'OS.

## 8. Conversations IA, Avis et Signalements
- **Conversations LLM** : Conservées temporairement pour garantir la continuité d'assistance contextuelle. Le masquage des PII (numéros de téléphone, noms) est effectué avant l'envoi au fournisseur IA. L'utilisation de ces données pour l'entraînement de modèles publics par nos sous-traitants (OpenAI/Anthropic) est strictement interdite (**À CONFIRMER** contractuellement).
- **Avis et Signalements** : Les avis sont des données publiques (affichées de manière pseudonymisée). Un système de modération back-office est présent. Le distributeur ciblé dispose d'un "Droit de réponse" public ou privé pour régler un litige lié à un avis abusif.

## 9. Incidents (Cybersécurité)
En cas de compromission (Scénario de brèche BDD tel que décrit dans `06a-securite.md`), le "Responsable des données" identifie le segment affecté (ex: Commandes non chiffrées vs factures exposées).
- **Obligation de notification** : Les délais d'alerte des utilisateurs finaux et de l'autorité camerounaise compétente en matière de cyber-régulation sont **À CONFIRMER** juridiquement. Une procédure de communication de crise doit être prête. L'équipe d'astreinte doit pouvoir exporter les logs pertinents pour l'enquête judiciaire locale si nécessaire.

## 10. Plans des Pages Juridiques à Rédiger
Ces pages seront hébergées en Markdown statique ou via un CMS. Leur rédaction formelle incombe à un juriste.
- **Politique de Confidentialité** : 
  - Identité complète du responsable de traitement.
  - Inventaire exhaustif des données collectées (cf. Tableau 1), incluant la distinction claire entre numéro WhatsApp et numéro d'appel.
  - Détail strict des finalités et des durées de conservation proposées (**À CONFIRMER**), incluant la durée de rétention IP paramétrable.
  - Liste des destinataires hors-Cameroun et cadre légal encadrant ce transfert (Meta/WhatsApp, Cloudflare, serveurs cloud).
  - Explication claire de la procédure d'exercice des droits (accès, suppression).
- **Conditions Générales d'Utilisation (CGU/CGS)** : 
  - Cadre d'accès aux services par profil (acheteur, distributeur, livreur, gestionnaire de compte).
  - Limitation explicite du rôle d'intermédiaire de PLEINGAZ.
  - Obligations du distributeur et responsabilités, notamment sur la gestion et le reversement de la consigne et les ventes au comptoir.
  - Modalités de règlement des litiges de facturation, de livraison (double confirmation) et de paiement.
- **Mentions Légales** : 
  - Raison sociale exacte de PLEINGAZ, capital social, immatriculation au registre du commerce.
  - Identité du directeur de la publication et coordonnées complètes.
  - Informations de contact de l'hébergeur technique (ex: DigitalOcean, AWS).
- **Politique de Cookies** : 
  - Typologie claire des cookies : techniques (ex: JWT) dispensés de consentement vs outils d'audience.
  - Procédure de retrait (outil de gestion du consentement).
  - Durée de vie maximale des cookies traceurs fixée à 13 mois (**À CONFIRMER**).

## 11. Gouvernance et Responsabilités
Il est fortement recommandé que PLEINGAZ désigne un "Responsable des Données" (équivalent local d'un DPO). 

Son identité est **À CONFIRMER**. 

Il maintiendra le registre centralisé de traitement.

## 12. Décisions Urgentes à Confirmer (Ajoutées à OPEN_QUESTIONS.md)
*Toutes les questions non validées par un juriste doivent être tranchées urgemment.*

1. Délais comptables officiels pour la conservation des factures et écritures de caisse comptoir.
2. Délais de suppression des pièces KYC rejetées.
3. Cadre des transferts de données hors Cameroun (notamment webhooks WhatsApp Meta).
4. Légalité de l'opt-in marketing implicite vs explicite.
5. Délai légal de réponse aux demandes d'exercice de droits et obligations de notification en cas de faille.
6. Durée légale impérative de rétention des logs de connexion et adresses IP au Cameroun (paramètre par défaut fixé à 90 jours dans `Setting`).

