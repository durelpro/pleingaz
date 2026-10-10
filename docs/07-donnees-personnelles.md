# Données Personnelles et Vie Privée

*Note : Le RGPD européen n'est cité ici que comme référentiel de bonnes pratiques d'ingénierie (Privacy by Design). Le cadre légal applicable au Cameroun (données personnelles, communications électroniques, durées de conservation, notification d'incident) est **À CONFIRMER** avec un juriste local. Ne rien tenir pour acquis sans source juridique locale.*

## 1. Inventaire des Traitements et Données Personnelles
Toutes les durées de conservation proposées et les bases légales proposées sont des hypothèses de conception et sont strictement **À CONFIRMER** par PLEINGAZ et son juriste.

| Donnée | Nature | Finalité | Sensibilité | Rétention Proposée | Base Légale Proposée | Accès (Rôle) | Stockage |
|---|---|---|---|---|---|---|---|
| Téléphone | Contact | Auth (OTP), Alertes | Élevée | Actif + 1 an (**À CONFIRMER**) | Contrat (**À CONFIRMER**) | Utilisateur, Distr. | PostgreSQL |
| Email | Contact | Notifications, Auth | Élevée | Actif + 1 an (**À CONFIRMER**) | Contrat (**À CONFIRMER**) | Utilisateur, Admin | PostgreSQL |
| Nom Complet | Identité | Facturation, Profil | Moyenne | Actif + 10 ans (**À CONFIRMER**) | Obligation légale (**À CONFIRMER**) | Utilisateur, Finance | PostgreSQL |
| Adresses & Repères | Livraison | Acheminement de colis | Élevée | Actif + 1 an (**À CONFIRMER**) | Contrat (**À CONFIRMER**) | Utilisateur, Livreur | PostgreSQL |
| Coordonnées GPS | Géoloc | Carte (Distributeur) | Moyenne | Actif + 1 an (**À CONFIRMER**) | Consentement (**À CONFIRMER**) | Public (Distributeur) | PostgreSQL |
| Localisation Nav. | Tech | Filtrage proximité | Élevée | Fin de session (**À CONFIRMER**) | Consentement (**À CONFIRMER**) | Non conservée | Volatile |
| Pièces d'identité | Admin | KYC (Distributeurs) | Maximale | Actif + 1 an (**À CONFIRMER**) | Obligation légale (**À CONFIRMER**) | Admin (S3 Signed URL) | S3 Privé |
| Photos Boutique | Public | Visibilité Distributeur | Faible | Actif + 1 an (**À CONFIRMER**) | Intérêt lég. (**À CONFIRMER**) | Public | S3 Public |
| Horaires Boutique | Info | Ouvertures | Faible | Actif + 1 an (**À CONFIRMER**) | Contrat (**À CONFIRMER**) | Public | PostgreSQL |
| Historique Commandes| Transac | Prestation, Litiges | Moyenne | 5 ans (**À CONFIRMER**) | Contrat (**À CONFIRMER**) | Utilisateur, Distributeur | PostgreSQL |
| Factures PDF | Transac | Preuve fiscale | Moyenne | 10 ans (**À CONFIRMER**) | Obligation légale (**À CONFIRMER**) | Utilisateur, Admin | S3 Privé |
| Paiement (MoMo) | Finance | Remboursement | Élevée | Actif + 10 ans (**À CONFIRMER**) | Contrat (**À CONFIRMER**) | API, Finance Admin | PostgreSQL |
| Messages & Chat | Comms | Support, Logistique | Élevée | 1 an (**À CONFIRMER**) | Contrat (**À CONFIRMER**) | Utilisateur, Support | PostgreSQL |
| Conversations IA | Comms | Assistance LLM | Moyenne | 30 jours (**À CONFIRMER**) | Consentement (**À CONFIRMER**) | Utilisateur, Admin | PostgreSQL |
| Avis Clients | Social | Réputation Boutique | Moyenne | Actif + 5 ans (**À CONFIRMER**) | Intérêt lég. (**À CONFIRMER**) | Public (Pseudonyme) | PostgreSQL |
| AuditLog | Traces | Traçabilité légale | Moyenne | 1 an (**À CONFIRMER**) | Obligation légale (**À CONFIRMER**) | Super-Admin | PostgreSQL |
| Journaux Techniques | Tech | Sécurité & Debugging | Faible | 30 jours (**À CONFIRMER**) | Intérêt lég. (**À CONFIRMER**) | DevOps | Monitoring |
| SearchEvent | Analytics| Mots-clés de recherche| Faible | 1 an (**À CONFIRMER**) | Intérêt lég. (**À CONFIRMER**) | Analyste | PostgreSQL |
| Alertes (Stock) | Préfs | Notifications push | Moyenne | Jusqu'à désinscription (**À CONFIRMER**)| Consentement (**À CONFIRMER**)| Utilisateur, Système | PostgreSQL |
| Consentements | Preuve | Conformité légale | Faible | 3 ans après opt-out (**À CONFIRMER**) | Obligation légale (**À CONFIRMER**)| Admin | PostgreSQL |
| Appareils & Sessions| Tech | Sécurité (JWT) | Faible | 30 jours après fin (**À CONFIRMER**) | Sécurité (**À CONFIRMER**) | Système | Redis / PG |
| Données Livreurs | Contact | Acheminement Logistique| Moyenne | Actif + 1 an (**À CONFIRMER**) | Contrat (**À CONFIRMER**) | Distributeur, Admin | PostgreSQL |

## 2. Flux et Prestataires (Transferts de Données)
La légalité de ces transferts, souvent hors du Cameroun, est **À CONFIRMER** par un juriste.
1. **Hébergeur (VPS)** : Reçoit BDD et requêtes. Données stockées en Europe/US. **Validation locale À CONFIRMER**.
2. **CDN (Cloudflare)** : Reçoit les IPs et la localisation du navigateur (Edge). Transfert US. Ne stocke pas de données applicatives.
3. **Fournisseur SMS/OTP** : Reçoit les numéros de téléphone et codes temporels.
4. **WhatsApp (Meta)** : Reçoit numéros et contenu des messages "click-to-chat" ou API. Transfert mondial.
5. **Paiement (MTN/Orange)** : Reçoit numéro de téléphone payeur, montant, références.
6. **Tuiles / Carte (Jawg/Mapbox)** : Reçoit l'IP et la requête géographique.
7. **Géocodage (Nominatim)** : Requêté côté Backend pour éviter de fuiter les IPs clients. Reçoit une adresse textuelle.
8. **LLM (OpenAI/Anthropic)** : Reçoit les requêtes d'aide (masquées). **La non-réutilisation des données pour l'entraînement doit être contractuellement À CONFIRMER**.
9. **Monitoring (Datadog/Sentry)** : Reçoit les journaux techniques anonymisés (traces d'erreurs, URIs).
10. **Email** : Reçoit l'adresse email et le contenu transactionnel.

## 3. Minimisation et Accès Distributeur (Vendeur)
- **Minimisation globale** : Le modèle collecte uniquement ce qui est strictement requis pour opérer la plateforme. Par exemple, aucun numéro de compte Mobile Money complet n'est stocké si l'identifiant transactionnel généré par l'opérateur suffit. Les numéros de CNI ne sont jamais saisis en texte clair, seule la photo de la pièce est stockée, limitant le risque d'indexation accidentelle.
- **Accès post-commande (Distributeur)** : Le distributeur est le vendeur final et juridiquement responsable de la transaction. À ce titre, il ne "perd pas" la vue des données de son acheteur immédiatement. Une fenêtre d'accès complet (ex: 30 jours, **À CONFIRMER**) est octroyée après `DELIVERED` ou `CANCELLED` pour permettre la gestion des réclamations, les retours, et le support client. Au-delà de cette fenêtre, l'accès est restreint exclusivement aux données fiscales (celles inscrites en dur sur le PDF de facture). Tout accès à l'historique prolongé est soumis à l'enregistrement d'une trace dans le journal d'audit.
- **Sous-comptes Boutique (StoreStaff)** : Les vendeurs et employés (`StoreStaff`) ne voient que les commandes en cours qu'ils gèrent à un instant T. Ils n'ont aucun droit d'accès à l'extraction de clientèle, aux données globales de la boutique, ni aux historiques financiers complexes. Ces données sont réservées au rôle supérieur `Distributor Manager`.

## 4. Sécurité Spécifique des Pièces d'Identité (KYC)
- Isolées sur S3 Privé, chiffrées au repos. 
- Accessibles uniquement par URL signée de très courte durée. 
- Seuls les rôles possédant la permission stricte `document:view_identity` peuvent y accéder, avec journalisation implacable. 
- Rétention : conservées tant que le compte vit. En cas de rejet définitif du KYC, suppression automatique après un délai probatoire de 30 jours (**À CONFIRMER**).

## 5. Droits des Personnes (Procédure et Vérification)
Les droits fondamentaux (accès, rectification, effacement, retrait du consentement) sont centralisés et gérés par le service client ou le Responsable des Données.
- **Délai légal de traitement** : Fixé à 30 jours maximum (**À CONFIRMER** juridiquement au Cameroun). Le processus de réponse sera automatisé ou manuel au cas par cas.
- **Vérification d'Identité Stricte** : Pour empêcher toute altération malveillante par ingénierie sociale ou par détournement de carte SIM (SIM Swap), la suppression ou l'exportation complète d'un compte (portabilité) exige systématiquement une vérification manuelle forte de l'identité du demandeur. Une simple confirmation d'OTP est jugée insuffisante pour ces actions irréversibles. Le support peut exiger l'envoi d'un e-mail depuis l'adresse enregistrée, ou une vérification des dernières factures.
- **Procédure de demande** : Formulable directement depuis l'application via un formulaire sécurisé ou par e-mail avec accusé de réception.
- **Limites d'accès** : Les demandes répétées ou manifestement abusives (harcèlement du support) pourront être limitées selon des seuils raisonnables (**À CONFIRMER**).

## 6. Suppression de Compte, Sauvegarde et Anonymisation
- **Anonymisation (Soft Delete)** : La contrainte d'unicité (téléphone, email) est libérée lors d'une suppression par un *Soft Delete* (champs PII écrasés par un UUID ou un hash). Les messages privés sont vidés. Le numéro de téléphone original peut ainsi être réutilisé pour une nouvelle inscription.
- **Intégrité de l'Audit** : Cette approche garantit de ne jamais casser la piste de l'`AuditLog` ou les relations avec les anciennes commandes de la boutique.
- **Rétention Comptable** : Les factures PDF et journaux d'audit (expurgés des PII directs) sont conservés selon la loi comptable (**À CONFIRMER**).
- **Blocage** : Les commandes en cours (`PENDING`, `EN_ROUTE`) bloquent la demande de suppression jusqu'à leur résolution.
- **Sauvegarde et Restauration** : Les données supprimées subsistent temporairement dans les sauvegardes (Backups chiffrés). Elles "disparaissent" naturellement quand la sauvegarde expire (ex: 30 jours, rétention **À CONFIRMER**). Si une restauration d'urgence est nécessaire avant expiration, la procédure technique implique obligatoirement de relancer les routines de *Soft Delete* sur l'instance restaurée pour honorer rétroactivement les droits à l'oubli des clients.

## 7. Gestion du Consentement
- **Preuve** : Versionnement exact des textes acceptés (CGU/Politiques) enregistré en BDD avec un horodatage (timestamp) inaltérable. Cela sert de preuve en cas de contrôle.
- **Canaux** : L'envoi de messages via WhatsApp, les communications Marketing, et les Alertes de Stock font l'objet d'un Opt-In clair (décoché par défaut).
- **Cookies & Audience** : PLEINGAZ compte utiliser des trackers d'audience (Analytics). Un bandeau explicite sera requis (**À CONFIRMER**). Les cookies strictement techniques (JWT) en sont exemptés.
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
  - Inventaire exhaustif des données collectées (cf. Tableau 1).
  - Détail strict des finalités et des durées de conservation proposées (**À CONFIRMER**).
  - Liste des destinataires hors-Cameroun et cadre légal encadrant ce transfert.
  - Explication claire de la procédure d'exercice des droits (accès, suppression).
- **Conditions Générales d'Utilisation (CGU/CGS)** : 
  - Cadre d'accès aux services en tant que client ou distributeur.
  - Limitation explicite du rôle d'intermédiaire de PLEINGAZ.
  - Obligations du distributeur et responsabilités, notamment sur la gestion et le reversement de la consigne.
  - Modalités de règlement des litiges de facturation et de paiement.
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

1. Délais comptables officiels pour la conservation des factures.
2. Délais de suppression des pièces KYC rejetées.
3. Cadre des transferts de données hors Cameroun.
4. Légalité de l'opt-in marketing implicite vs explicite.
5. Délai légal de réponse aux demandes d'exercice de droits et obligations de notification en cas de faille.
