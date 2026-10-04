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
| **MVP (1-2)** | Core : Auth, Stock, BDD, Commandes, PWA. | L | Validation Juridique, Accès OTP. |
| **Pilote** | Déploiement terrain, Paiement, Factures. | M | Comptes Marchands MTN/Orange validés. |
| **Phase 2B** | Avis clients, WhatsApp Business API. | M | Compte Meta Officiel, Validation Modèles. |
| **Phase 3** | Payout automatisé aux distributeurs. | H | Intégration API de décaissement (Opérateur). |
| **Phase 4-5** | Cartographie avancée (Auto-hébergement). | H | Coûts serveurs dédiés géospatiaux. |
| **Phase 6-7** | BI, Dashboards avancés, Reporting fiscal. | M | Outils d'export / Data Lake léger. |
| **Phase 8-10**| Assistant IA, Forecasting, Optimisations. | H | Données massives pour le RAG, Coûts LLM. |

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
