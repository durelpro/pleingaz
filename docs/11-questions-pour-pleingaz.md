# Questions ouvertes à confirmer avec PLEINGAZ

Ces questions sont fondamentales et bloquent les choix d'architecture des Phases suivantes (paiement, facturation, livraison). Merci d'y répondre avant d'aborder ces modules.

## 1. Modèle Économique, Tarification et Catalogue
1. **Catalogue et Prix** : **[RÉSOLU PAR CR-001 D-01 / ADR D5]** Seuls les produits et accessoires officiels PLEINGAZ sont vendus, gérés et affichés ; la marketplace est exclue ; les prix publics et distributeurs sont nationaux, fixés centralement dans `ProductPrice` et recalculés côté serveur. *(Reste à fournir : barème numérique officiel initial pour le seed de production).*
2. **Frais de service / Commission** : PLEINGAZ prend-il une commission sur les ventes générées via la plateforme ? Qui paye les frais de transaction Mobile Money ?
3. **Consigne** : Quelles sont les règles exactes en cas d'achat d'une bouteille avec consigne versus un simple échange ?
3b. **Échange multimarque de bouteilles (X-01.07)** : Accepte-t-on l'échange de bouteilles vides d'autres marques agréées (ex: Total, Camgaz, Tradex) contre une recharge PLEINGAZ, ou applique-t-on un refus strict (bouteilles PLEINGAZ uniquement) ? *(Défaut appliqué en conception : strict échange de bouteilles PLEINGAZ uniquement, à confirmer).*

## 2. Paiement et Flux Financiers
4. **Encaissement** : **[RÉSOLU PAR CR-001 D-06 / ADR D10]** Encaissement centralisé par PLEINGAZ (Mobile Money ou régularisation espèces), reversements consolidés périodiques en Maker-Checker (`PayoutBatch`), comptabilité immuable en partie double (`LedgerAccount`, `LedgerEntry`).
5. **Livraison (Logistique)** : **[RÉSOLU PAR CR-001 D-05 / ADR D9]** Les livreurs sont des utilisateurs à part entière (`COURIER`, 9e rôle RBAC) supervisés et agréés par PLEINGAZ, avec validation obligatoire de la remise par code confidentiel client. La tarification est gérée par `DeliveryFeeSchedule`.

## 3. Déploiement, Hébergement et Opérations
6. **Infrastructure existante** : Quel est l'hébergeur physique actuel ? Quel est le pipeline de déploiement (CI/CD) ?
7. **Outils statistiques** : Quels sont les outils de statistiques actuellement branchés (Google Analytics, etc.) auxquels nous devons avoir accès ?
8. **Propriété intellectuelle** : Qui est l'actuel propriétaire (ou registrar) du nom de domaine `monpleingaz.com` et des comptes liés aux réseaux sociaux ?
9. **Zone Pilote** : Quelle est la ville ou la zone géographique prévue pour le lancement pilote ? Combien de distributeurs y seront raccordés au départ ?
10. **Processus d'approbation** : Quel est le délai (SLA) prévu en interne pour approuver un dossier de distributeur après son inscription (KYC 3 pièces : CNI, portrait, boutique extérieure) ?
11. **Budget & Équipe** : Quel est le budget d'hébergement mensuel alloué, et qui administrera la plateforme au quotidien ?

## 4. Législation et Communication
12. **Mentions légales et CGV** : Des textes conformes à la réglementation camerounaise (commerce, facturation électronique, données personnelles) sont-ils en cours de rédaction par votre juriste ?
12b. **Réglementation et agrément vente de gaz (X-04.06)** : Une autorisation administrative, licence commerciale ou agrément ministériel spécifique (ex: Ministère de l'Eau et de l'Énergie - MINEE) est-il formellement exigé par la loi camerounaise pour les revendeurs de gaz domestique, en plus des 3 pièces KYC (CNI, portrait, façade de boutique) ? *(À confirmer avec un juriste local).*
13. **Numéros officiels** : Quels seront les numéros WhatsApp Business officiels et les horaires d'ouverture du support client ?

## Actions Parallèles à lancer dès aujourd'hui :
- [ ] Souscrire et valider le compte **WhatsApp Business API** via Meta.
- [ ] Créer les environnements **Sandbox de paiement** (Agrégateur ou MTN/Orange) pour le développeur.
- [ ] Vérifier la disponibilité et l'accès au **domaine et DNS**.
- [ ] Rédiger les **textes légaux** (CGV, Mentions Légales) et la page "Sécurité d'utilisation du gaz".

## 5. Cadrage UX et Rôles (Tâche 1)
14. **Délais (Timeouts)** : Quel délai (en minutes) le distributeur a-t-il pour accepter une commande entrante avant qu'elle ne soit annulée ? Quel est le délai de réservation du stock laissé au client pour finaliser son paiement ? *(Configurable dans `Setting`)*.
15. **Sous-comptes Boutique** : Confirmez-vous que le gérant d'un point de vente pourra créer des accès restreints (employés) qui peuvent gérer le stock et les commandes mais pas voir les finances ?

## 6. Modèle Économique (Tâche 2)
16. **Consigne et Gestion des bouteilles (Urgent)** : Vendez-vous uniquement le gaz (échange de bouteille vide) ou le client paie-t-il un "dépôt" pour une nouvelle consigne ? Si consigne, appartient-elle au distributeur ou à PLEINGAZ ?
17. **Liberté des prix (StoreProductOffer)** : **[RÉSOLU PAR CR-001 D-01 / ADR D5]** Aucun prix libre local ; catalogue et barèmes nationaux stricts gérés par l'admin ; `StoreProductOffer` neutralisé.
18. **Recouvrement Espèces** : **[RÉSOLU PAR CR-001 D-05, D-06 / ADR D9, D10]** Enregistrement de chaque encaissement dans `CashCollection`, suivi comptable en dette envers PLEINGAZ dans le Grand Livre, compensation sur reversements et suspension automatique des courses si dépassement du plafond `Setting`.
19. **Logistique** : **[RÉSOLU PAR CR-001 D-05 / ADR D9]** Les livreurs sont des utilisateurs indépendants de la plateforme (`COURIER`), pilotés par l'administration PLEINGAZ.

## 7. Architecture Technique (Tâche 3)
20. **Facturation Internationale** : Le VPS européen (ADR D2) implique des factures en Euro/USD. PLEINGAZ possède-t-elle les moyens de paiement internationaux nécessaires pour cet hébergement ?
21. **Confidentialité et CDN** : L'utilisation d'un CDN comme Cloudflare doit être validée juridiquement et mentionnée dans vos politiques de confidentialité. Confirmez-vous ?
22. **Serveur de Tuiles (Budget)** : Quel est le budget mensuel alloué à l'affichage de la carte, pour provisionner l'achat de tuiles chez un fournisseur comme Mapbox ou JawgMaps ?

## 8. Démarches Externes Critiques
| Démarche | Responsable | Délai Estimé | Dépendance Bloquante |
|---|---|---|---|
| Validation Modèle Économique (Frais & Consigne) | PLEINGAZ | Immédiat | Conception BDD Facturation |
| Ouverture Compte Marchand MTN/Orange ou Agrégateur + Sandbox | PLEINGAZ | 1-3 Semaines | Code intégration Paiement |
| Compte WhatsApp Business Officiel + Vérification Meta | PLEINGAZ | 2-4 Semaines | Notifications Phase 2 |
| Achat et Paramétrage du Domaine DNS & Cloudflare | DÉVELOPPEUR | 1 Semaine | Déploiements Prod |
| Enregistrement Sender ID (SMS) auprès de l'ARPT/Opérateurs | PLEINGAZ / DEV | 2-4 Semaines | OTP Officiel en Prod |

## 9. Décisions Urgentes à Confirmer (Tâche 4)
23. **Légalité Frais** : Est-il légal de faire payer ou d'imputer les frais des opérateurs (MoMo) au client en affichant une ligne distincte sur la facture ?
24. **Propriété de la Consigne** : Lors d'un premier achat, qui est propriétaire de la bouteille consignée (le distributeur ou la plateforme PLEINGAZ) ?
25. **Plafond Dette Distributeur / Livreur** : **[MÉCANISME RÉSOLU PAR CR-001 D-05, D-06 / VALEUR NUMÉRIQUE À CONFIRMER]** Géré par paramètre dynamique dans `Setting` (défaut appliqué : exemple illustratif 50 000 FCFA avec suspension automatique au dépassement ; montant officiel initial à confirmer par PLEINGAZ).
26. **Remboursements** : Quelle est la politique officielle de Pleingaz pour un remboursement total ou partiel, et quels sont les délais légaux au Cameroun ?
27. **Mentions Fiscales** : Quelles mentions légales (TVA, numéro d'immatriculation) doivent obligatoirement figurer sur les factures et reçus PDF générés ?
28. **Rétention des données et IA** : Quelle est la durée légale de conservation des logs de conversations (LLM) et des données de paiement, compte tenu du contexte légal (À valider par un juriste) ?
29. **Fourchettes de Coûts LLM et API** : Validation des budgets mensuels prévisionnels alloués aux appels IA (OpenAI/Anthropic) et aux frais WhatsApp Business (messages template).

## 10. Décisions Urgentes (Tâche 5 - Données Personnelles et Légal)
30. **Cadre Légal Cyber et Notification** : Quelles sont les obligations locales précises de PLEINGAZ en cas de fuite de données au Cameroun (Délai de notification à l'ANTIC, information aux utilisateurs) ?
31. **Durées de Conservation Officielles** : Validation des délais légaux pour les factures (10 ans ?), les CNI rejetées, et les logs serveurs.
32. **Propriété intellectuelle / LLM** : Confirmation de la clause interdisant aux fournisseurs IA (OpenAI, Anthropic) d'utiliser les données des clients camerounais pour entraîner leurs modèles publics.
33. **Cookies et Traqueurs** : PLEINGAZ compte-t-elle utiliser des outils externes d'audience (Google Analytics, Meta Pixel) ? Si oui, le bandeau de consentement devra être complexe.
34. **Gouvernance des données** : Nom et fonction du futur "Responsable des Données Personnelles" chez PLEINGAZ en charge du registre des traitements.
35. **Objectifs RPO / RTO** : Validation des budgets nécessaires pour garantir une perte de données maximale de 1 heure (RPO) et un temps de redémarrage de 4 heures (RTO).

## 11. Décisions Souveraines Résolues par CR-003 (D-11 à D-18)
36. **Accès et Traçabilité (D-11)** : **[RÉSOLU PAR CR-003 / ADR D11]** Zéro action sans compte authentifié ; espaces strictement étanches avec retour HTTP 404 inter-espaces ; staff masqué.
37. **Authentification (D-12)** : **[RÉSOLU PAR CR-003 / ADR D12]** Inscription et connexion 100% gratuites par WhatsApp ; preuve entrante (Option A) ; 2 numéros obligatoires (`whatsappPhone` et `callPhone`).
38. **Expérience et Charte (D-13)** : **[RÉSOLU PAR CR-003 / ADR D13]** Charte historique inchangée (Rouge `#FF0000`, Jaune `#FFB000`, Montserrat) ; design system léger et accessible WCAG AA.
39. **Espace Acheteur & Quota (D-14)** : **[RÉSOLU PAR CR-003 / ADR D14]** Dashboard épuré, jauge visuelle 5 bouteilles / 30 jours, réassort express 1-clic, distributeur favori (C-01).
40. **Gestionnaire de Compte (D-15)** : **[RÉSOLU PAR CR-003 / ADR D15]** 10e rôle RBAC ; zéro mutation directe ; impersonation interdite ; dossiers `AccountCase` obligatoires avec Maker-Checker `ADMIN`.
41. **Visibilité & Comptoir (D-16)** : **[RÉSOLU PAR CR-003 / ADR D16]** Visibilité totale des transactions pour l'administrateur ; module Vente au comptoir (`CounterSale`) avec contrôle quota préalable.
42. **Livraison (D-17)** : **[RÉSOLU PAR CR-003 / ADR D17]** Clôture par double confirmation contradictoire obligatoire ; tarif fixe 1 000 FCFA pour la flotte PLEINGAZ en zone urbaine.
43. **Rubrique Infos (D-18)** : **[RÉSOLU PAR CR-003 / ADR D18]** Annonces ciblées par profil et zone avec accusé de lecture "J'ai compris" obligatoire et Maker-Checker publication.

