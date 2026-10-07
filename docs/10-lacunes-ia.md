# Lacunes Identifiées et Recommandations (IA PLEINGAZ)

Ce document liste les manques d'informations métiers et techniques identifiés lors de la conception de la base de connaissances (KB) pour l'Assistant IA PLEINGAZ. Ces éléments devront être clarifiés par le propriétaire du produit (Durel) ou les équipes opérationnelles pour garantir une IA 100% fiable en production.

## 1. Tarification Officielle et Transport
- **Frais de livraison kilométriques :** L'IA sait qu'il y a des frais de livraison, mais aucune matrice de calcul n'a été fournie. Comment l'IA doit-elle justifier le coût d'une livraison ? Est-ce un forfait fixe par ville ou un calcul par kilomètre ?
- **Prix des consignes vides :** Le prix officiel du gaz (la recharge) est connu, mais le prix officiel d'achat d'une bouteille vide (consigne) varie selon les marques. L'IA a besoin d'un barème de prix pour les nouvelles consignes.

## 2. Intégration B2B et Grossistes
- **Limites de commande :** Un utilisateur normal peut-il commander 50 bouteilles d'un coup via l'application ? L'IA doit-elle bloquer les commandes considérées comme "grossistes" et les rediriger vers un agent, ou y a-t-il une limite stricte (ex: max 3 bouteilles) dans l'application ?
- **Facturation TVA :** Les règles d'application de la TVA sur le gaz domestique au Cameroun pour les achats d'entreprises ne sont pas documentées dans la KB.

## 3. Données Géographiques (PostGIS)
- **Découpage des quartiers :** Pour que l'outil `search_stores_by_area` fonctionne correctement, la base de données doit contenir des polygones (limites exactes) des quartiers de Douala/Yaoundé. Ces données cartographiques officielles (Shapefiles) sont-elles déjà acquises ?
- **Zones non desservies :** L'IA a besoin d'une liste claire des zones "Rouges" où les livreurs PLEINGAZ refusent d'aller pour des raisons de sécurité ou d'accessibilité.

## 4. Politique de Retours et Litiges
- **Bouteille défectueuse :** Si un client signale à l'IA que la bouteille fuit *après* le départ du livreur, qui paie le retour ? Est-ce le distributeur, PLEINGAZ, ou le client ? L'IA a besoin d'un arbre de décision légal pour les remplacements.
- **Remboursements MoMo :** Les délais réels de remboursement pour MTN/Orange ne sont pas garantis. La procédure d'escalade vers l'agent est prête, mais le SLA (Service Level Agreement) pour le remboursement effectif n'est pas précisé au client.

## 5. Horaires et Jours Fériés
- **Comportement les jours fériés :** La base de données gère les horaires d'ouverture standards. Comment les distributeurs vont-ils mettre à jour leurs fermetures exceptionnelles (ex: Fête Nationale, Tabaski) ? L'IA risque de donner de faux espoirs si le système ne gère pas un calendrier des jours fériés camerounais.

## Recommandation
Ces lacunes ne bloquent pas le développement technique de l'application (Phase 2), mais elles impacteront l'expérience utilisateur si le client pose une question à l'IA sur ces sujets spécifiques. Il est recommandé de fournir ces réponses dans de futurs commits pour enrichir les fichiers `03-glossaire-et-geographie.md` et `04-cas-limites-et-securite.md`.
