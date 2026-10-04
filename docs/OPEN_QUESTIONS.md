# Questions ouvertes à confirmer avec PLEINGAZ

Ces questions sont fondamentales et bloquent les choix d'architecture des Phases suivantes (paiement, facturation, livraison). Merci d'y répondre avant d'aborder ces modules.

## 1. Modèle Économique et Tarification
1. **Prix du gaz** : Le prix (ex: 12,5 kg) est-il totalement plafonné (administré par l'État) ou les distributeurs ont-ils une liberté tarifaire ? *(Note : aucun prix ni produit n'était visible sur les captures de la page d'accueil fournies).*
2. **Frais de service / Commission** : PLEINGAZ prend-il une commission sur les ventes générées via la plateforme ? Qui paye les frais de transaction Mobile Money ?
3. **Consigne** : Quelles sont les règles exactes en cas d'achat d'une bouteille avec consigne versus un simple échange (bouteille vide contre pleine) ?

## 2. Paiement et Flux Financiers
4. **Encaissement** : Le client paie-t-il directement le compte Mobile Money du distributeur, ou paie-t-il un compte central PLEINGAZ qui reverse ensuite (settlement) ?
5. **Livraison (Logistique)** : Qui livre le gaz ? Des livreurs PLEINGAZ, les distributeurs eux-mêmes, ou des tiers ? Comment la livraison est-elle facturée ?

## 3. Déploiement, Hébergement et Opérations
6. **Infrastructure existante** : Quel est l'hébergeur physique actuel, la pipeline de CI/CD (déploiement) et les outils d'Analytics en place ?
7. **Zone Pilote** : Quelle est la ville ou la zone géographique prévue pour le lancement pilote ? Combien de distributeurs y seront raccordés au départ ?
8. **Processus d'approbation** : Quel est le délai (SLA) prévu en interne pour approuver un dossier de distributeur après son inscription ?
9. **Budget & Équipe** : Quel est le budget d'hébergement mensuel alloué, et qui administrera la plateforme au quotidien ?

## 4. Législation et Communication
10. **Mentions légales et CGV** : Des textes conformes à la réglementation camerounaise (commerce, facturation électronique, données personnelles) sont-ils en cours de rédaction par votre juriste ?
11. **Numéros officiels** : Quels seront les numéros WhatsApp Business officiels et les horaires d'ouverture du support client ?

## Actions Parallèles à lancer dès aujourd'hui :
- [ ] Souscrire et valider le compte **WhatsApp Business API** via Meta.
- [ ] Créer les environnements **Sandbox de paiement** (Agrégateur ou MTN/Orange) pour le développeur.
- [ ] Vérifier la disponibilité et l'accès au **domaine et DNS** (`monpleingaz.com`).
