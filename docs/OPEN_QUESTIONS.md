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

## 5. Cadrage UX et Rôles (Nouvelles Questions)
14. **Délais (Timeouts)** : Quel délai (en minutes) le distributeur a-t-il pour accepter une commande entrante avant qu'elle ne soit annulée ? Quel est le délai de réservation du stock laissé au client pour finaliser son paiement ?
15. **Sous-comptes Boutique** : Confirmez-vous que le gérant d'un point de vente pourra créer des accès restreints (employés) qui peuvent gérer le stock et les commandes mais pas voir les finances ?
