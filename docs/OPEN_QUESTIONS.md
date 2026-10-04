# Questions ouvertes à confirmer avec PLEINGAZ

Ces questions sont fondamentales et bloquent les choix d'architecture des Phases suivantes (paiement, facturation, livraison). Merci d'y répondre avant d'aborder ces modules.

## 1. Modèle Économique, Tarification et Catalogue
1. **Catalogue et Prix** : Merci de confirmer formellement les prix, les produits existants, et les points de vente actuels. *(Aucun prix n'était visible sur la page d'accueil).* Les prix sont-ils plafonnés par l'État ou libres ?
2. **Frais de service / Commission** : PLEINGAZ prend-il une commission sur les ventes générées via la plateforme ? Qui paye les frais de transaction Mobile Money ?
3. **Consigne** : Quelles sont les règles exactes en cas d'achat d'une bouteille avec consigne versus un simple échange ?

## 2. Paiement et Flux Financiers
4. **Encaissement** : Le client paie-t-il directement le compte Mobile Money du distributeur, ou paie-t-il un compte central PLEINGAZ qui reverse ensuite (settlement) ?
5. **Livraison (Logistique)** : Qui livre le gaz ? Des livreurs PLEINGAZ, les distributeurs eux-mêmes, ou des tiers ? Comment la livraison est-elle facturée ?

## 3. Déploiement, Hébergement et Opérations
6. **Infrastructure existante** : Quel est l'hébergeur physique actuel ? Quel est le pipeline de déploiement (CI/CD) ?
7. **Outils statistiques** : Quels sont les outils de statistiques actuellement branchés (Google Analytics, etc.) auxquels nous devons avoir accès ?
8. **Propriété intellectuelle** : Qui est l'actuel propriétaire (ou registrar) du nom de domaine `monpleingaz.com` et des comptes liés aux réseaux sociaux ?
9. **Zone Pilote** : Quelle est la ville ou la zone géographique prévue pour le lancement pilote ? Combien de distributeurs y seront raccordés au départ ?
10. **Processus d'approbation** : Quel est le délai (SLA) prévu en interne pour approuver un dossier de distributeur après son inscription ?
11. **Budget & Équipe** : Quel est le budget d'hébergement mensuel alloué, et qui administrera la plateforme au quotidien ?

## 4. Législation et Communication
12. **Mentions légales et CGV** : Des textes conformes à la réglementation camerounaise (commerce, facturation électronique, données personnelles) sont-ils en cours de rédaction par votre juriste ?
13. **Numéros officiels** : Quels seront les numéros WhatsApp Business officiels et les horaires d'ouverture du support client ?

## Actions Parallèles à lancer dès aujourd'hui :
- [ ] Souscrire et valider le compte **WhatsApp Business API** via Meta.
- [ ] Créer les environnements **Sandbox de paiement** (Agrégateur ou MTN/Orange) pour le développeur.
- [ ] Vérifier la disponibilité et l'accès au **domaine et DNS**.
- [ ] Rédiger les **textes légaux** (CGV, Mentions Légales) et la page "Sécurité d'utilisation du gaz".

## 5. Cadrage UX et Rôles (Tâche 1)
14. **Délais (Timeouts)** : Quel délai (en minutes) le distributeur a-t-il pour accepter une commande entrante avant qu'elle ne soit annulée ? Quel est le délai de réservation du stock laissé au client pour finaliser son paiement ?
15. **Sous-comptes Boutique** : Confirmez-vous que le gérant d'un point de vente pourra créer des accès restreints (employés) qui peuvent gérer le stock et les commandes mais pas voir les finances ?

## 6. Modèle Économique (Tâche 2)
16. **Consigne et Gestion des bouteilles (Urgent)** : Vendez-vous uniquement le gaz (échange de bouteille vide) ou le client paie-t-il un "dépôt" pour une nouvelle consigne ? Si consigne, appartient-elle au distributeur ou à PLEINGAZ ?
17. **Liberté des prix (StoreProductOffer)** : Les distributeurs ont-ils le droit de fixer leur propre prix de vente par produit, ou le prix public est-il strict et national ?
18. **Recouvrement Espèces** : Lorsqu'un client paie en espèces au distributeur, le distributeur accumule une "dette" (commission due à PLEINGAZ). Comment cette dette est-elle recouvrée (Settlement) ?
19. **Logistique** : Les coursiers sont-ils des employés de la boutique, des indépendants, ou des livreurs PLEINGAZ ?

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
25. **Plafond Dette Distributeur** : Quel est le plafond de créance (en FCFA) autorisé pour un distributeur accumulant des paiements espèces avant la suspension automatique de son compte ?
26. **Remboursements** : Quelle est la politique officielle de Pleingaz pour un remboursement total ou partiel, et quels sont les délais légaux au Cameroun ?
27. **Mentions Fiscales** : Quelles mentions légales (TVA, numéro d'immatriculation) doivent obligatoirement figurer sur les factures et reçus PDF générés ?
28. **Rétention des données et IA** : Quelle est la durée légale de conservation des logs de conversations (LLM) et des données de paiement, compte tenu du contexte légal (À valider par un juriste) ?
29. **Fourchettes de Coûts LLM et API** : Validation des budgets mensuels prévisionnels alloués aux appels IA (OpenAI/Anthropic) et aux frais WhatsApp Business (messages template).
