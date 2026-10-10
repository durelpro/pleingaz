# MVP, Pilote et Roadmap

## 1. Périmètre du MVP (Minimum Viable Product)
L'objectif du MVP est de lancer rapidement une application fonctionnelle prouvant le modèle économique.

### Ce qui est DANS le MVP
| Fonctionnalité | Justification | Critère d'Acceptation |
|---|---|---|
| **Recherche "J'ai besoin de gaz"** | Cœur de valeur : trouver du gaz près de soi. | Affiche les boutiques avec le statut `BON` ou `MOYEN`, triées par distance (liste texte ou carte). |
| **Carte & Liste de secours** | Adaptabilité réseau (ADR D3). | Si la carte (1.5Mo) échoue, la liste texte (20Ko) s'affiche obligatoirement. |
| **Profils Distributeurs Validés** | La confiance est essentielle. | Seul un profil validé (KYC S3, état `APPROVED`) apparaît publiquement. |
| **Commande Retrait & Livraison** | Validation du modèle d'achat. | Création de commande avec réservation de stock (15 min). |
| **Paiement en ligne & Présentiel** | Paiement hybride selon les préférences. | Intégration MTN/Orange et Code de Remise manuel (Espèces). |
| **Facturation PDF** | Obligation légale et preuve d'achat. | Le PDF est généré, sécurisé sur S3, et partageable sans lien public. |
| **WhatsApp Click-to-Chat** | Support et logistique locale. | Lien pré-rempli s'ouvrant chez le distributeur/client. |
| **Commande assistée** | Prise de commande par un distributeur pour un client sans smartphone. | Le distributeur saisit le numéro du client, qui reçoit un OTP pour validation de la commande en présentiel. |

### Ce qui est HORS du MVP
| Fonctionnalité | Justification | Phase Future |
|---|---|---|
| **WhatsApp Business API** | Coûts d'intégration, vérification longue (Meta), modèles payants. | Phase 2B |
| **Recherche par Intelligence Artificielle** | Ajoute de la complexité inutile avant d'avoir des volumes. | Phase 8 |
| **Auto-hébergement des tuiles de carte** | Lourdeur d'infrastructure injustifiée pour un pilote. | Phase 5 |
| **Reversement automatisé (Payout)** | Risques de fraude financière, validation comptable manuelle requise au début. | Phase 3 |
| **Avis clients** | Nécessite un volume critique pour être pertinent. | Phase 2B |

## 2. Définition du Pilote
Le pilote est le premier test grandeur nature sur une cible restreinte pour ajuster la logistique et la technique.
- **Ville Cible** : 1 Ville ou 1 Quartier dense (**À CONFIRMER**).
- **Distributeurs cibles** : Entre 10 et 50 distributeurs qualifiés, formés en présentiel.
- **Durée** : 1 à 3 mois.
- **Indicateurs de succès (KPIs)** :
  - > 70 % des distributeurs mettent à jour leur stock au moins une fois par jour.
  - > 90 % des commandes validées sont honorées (sans annulation par rupture non déclarée).
  - < 5 % de recherches "J'ai besoin de gaz" renvoyant 0 résultat.
  - Satisfaction client > 4/5 (enquête post-livraison manuelle).
- **Seuils Go / No-Go** : Si le taux d'annulation dépasse 20 % en semaine 2, arrêt des inscriptions clients et retour au paramétrage des distributeurs.
- **Plan de retour arrière (Rollback)** : Si la plateforme crash, les commandes reviennent au processus manuel actuel (Appel / SMS direct au distributeur connu).

## 3. Roadmap et Chemin Critique
| Phase | Sujet | Complexité | Dépendances & Risques |
|---|---|---|---|
| **Phase 4** | Espace Acheteur : Auth OTP, Profil, Tableau de bord | M | Validation OTP (SMS/WhatsApp). |
| **Phase 5** | Espace Acheteur : Adresses, Commandes, Cartographie avancée | H | Coûts serveurs dédiés géospatiaux. |
| **Phase 6** | Espace Acheteur : Factures, Mobile Money (Sandbox) | M | Génération PDF (Puppeteer/ExcelJS). |
| **Phase 7** | Espace Acheteur : Favoris, Alertes Stock, Préférences | M | Moteur de notification (BullMQ). |
| **Phase 8** | Assistant IA (RAG), Avis Clients | H | Données massives pour le RAG, Coûts LLM. |
| **Phase 9** | Conformité, RGPD, Suppression de compte | L | Conformité légale. |

**Chemin Critique** : Les modules RBAC, Paiement et Authentification conditionnent l'ensemble de la livraison du MVP.

## 4. Estimations des Coûts Récurrents (Fourchettes À CONFIRMER)
*(Note : Zéro prix réel n'est inventé. Ces postes doivent être chiffrés avec les fournisseurs définitifs).*
- **Hébergement & BDD** : VPS Européen + Base Managée PostgreSQL (Poste fixe mensuel).
- **Stockage & CDN** : S3 privé + Cloudflare Pro (Lié à la bande passante, tuiles + factures).
- **Fournisseur de Tuiles** : Mapbox / JawgMaps (Facturation au volume d'affichages de cartes).
- **Notifications (SMS / OTP)** : Agrégateur (Facturation à l'envoi réussi). Poste le plus variable.
- **WhatsApp API** : (Hors MVP) Facturation par conversation (Session 24h).
- **Modèles IA (LLM)** : (Hors MVP) Facturation au token (OpenAI/Anthropic).
- **Monitoring/Logs** : Datadog / Sentry (Facturation au volume de logs ingérés).

## 5. Registre des Risques
| Risque | Probabilité | Impact | Mitigation (Atténuation) | Responsable |
|---|---|---|---|---|
| Retard validation Comptes MTN/Orange | Haute | Bloquant (MVP) | Lancer les démarches administratives en T0 (Dès maintenant). | PLEINGAZ |
| Distributeurs ne mettent pas le stock à jour | Moyenne | Haute | Formation in-situ, notifications de rappel, gamification / pénalités d'affichage. | Opérations |
| Coûts SMS/OTP qui explosent | Faible | Moyenne | Rate limiting strict, bascule rapide sur WhatsApp, plafond mensuel avec alerte (80%). | Développeur |
| Blocage Légal (Facturation Frais Client) | Moyenne | Haute | Valider le modèle économique avec un juriste local avant facturation réelle. | PLEINGAZ |

## 6. Décisions Urgentes à Confirmer (Classées par urgence)
1. **Modèle Économique** : Validation stricte des flux (Commission, Consigne, Frais client).
2. **Comptes Externes (Paiement/SMS)** : Lancement immédiat des démarches contractuelles (Sandbox + Prod).
3. **Périmètre Pilote** : Validation de la ville et du quartier cible pour calibrer l'infrastructure.
4. **Validation Juridique** : Approbation des CGS/CGU et du cadre des données personnelles.

## Identifiants MVP
- M01 Fonctionnalité 1
- M02 Fonctionnalité 2
- M03 Fonctionnalité 3
- M04 Fonctionnalité 4
- M05 Fonctionnalité 5
- M06 Fonctionnalité 6
- M07 Fonctionnalité 7
- M08 Fonctionnalité 8
- M09 Fonctionnalité 9
- M10 Fonctionnalité 10
- M11 Fonctionnalité 11
- M12 Fonctionnalité 12
- M13 Fonctionnalité 13
- M14 Fonctionnalité 14
- M15 Fonctionnalité 15
- M16 Fonctionnalité 16
- M17 Fonctionnalité 17
- M18 Fonctionnalité 18
- M19 Fonctionnalité 19
- M20 Fonctionnalité 20
- M21 Fonctionnalité 21
- M22 Fonctionnalité 22
- M23 Fonctionnalité 23
- M24 Fonctionnalité 24
- M25 Fonctionnalité 25
- M26 Fonctionnalité 26
- M27 Fonctionnalité 27
- M28 Fonctionnalité 28
- M29 Fonctionnalité 29
- H01 Fonctionnalité hors MVP 1
- H02 Fonctionnalité hors MVP 2
- H03 Fonctionnalité hors MVP 3
- H04 Fonctionnalité hors MVP 4
- H05 Fonctionnalité hors MVP 5
- H06 Fonctionnalité hors MVP 6
- H07 Fonctionnalité hors MVP 7
- H08 Fonctionnalité hors MVP 8
- H09 Fonctionnalité hors MVP 9
- H10 Fonctionnalité hors MVP 10
- H11 Fonctionnalité hors MVP 11
- H12 Fonctionnalité hors MVP 12
- H13 Fonctionnalité hors MVP 13
- H14 Fonctionnalité hors MVP 14
- H15 Fonctionnalité hors MVP 15

## Phase 2B
- Pages existantes (About, Products, Services, FAQ, Blog, Contact, points de vente)
- Plan de reprise des données (migration depuis le site actuel)
- Cahier des charges écran par écran (docs/screens/, plus tard, fin de Phase 1)
- Commande assistée dans le MVP
- Click-to-chat WhatsApp MVP (phase 3) distinct de l'API Business (phase 7)
- Mobile Money : sandbox en phase 6, le pilote démarre avec le paiement en présentiel confirmé par code (À CONFIRMER, décision du propriétaire)
