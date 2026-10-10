AUDIT COMPLET DU SITE EXISTANT – PLEINGAZ (https://www.monpleingaz.com/)
Date d’audit : 1er octobre 2026

Périmètre : analyse approfondie de l’existant (contenu, architecture technique, UX/UI, parcours utilisateurs, forces/faiblesses, éléments à conserver/moderniser).

Méthode : navigation réelle des pages principales, inspection du frontend, analyse du contenu métier, comparaison avec les réalités du marché camerounais du gaz domestique (pénuries récurrentes, importance de la disponibilité, Mobile Money, WhatsApp, réseaux de revendeurs).

1. Présentation générale de l’existant

PLEINGAZ est une marque camerounaise de gaz domestique (LPG) distribuée par INFOTECH S.A. (département INFOTECHGAZ), présente depuis décembre 2015.

Slogan fort et bien positionné : « Bouteilles toujours pleines » / « Always Full Cylinders ».
Le site actuel est un site vitrine moderne avec une légère dimension e-commerce/catalogue. Il n’est pas encore une plateforme de distribution numérique.
Pages principales identifiées :

- Accueil
- About
- Products
- Services
- Our Points of Sale (/agences)
- Contact
- FAQ
- Blog
- My account (/mon-compte)
- Your review
- Recherche + sélecteur de langue (FR/EN)

2. Architecture technique actuelle

- Frontend : Application SPA (Single Page Application) construite avec React + Vite (fichiers assets/index-*.js et index-*.css typiques).
- Pas de WordPress, pas d’Elementor, pas de WooCommerce.
- Design responsive de bonne facture.
- Protection anti-bot (challenge captcha type Cloudflare-like) assez agressive.
- Multilingue (FR/EN) présent.
- Présence d’un espace « My account » (mais très minimaliste actuellement).
- Carte des points de vente annoncée comme interactive.
- Pas de preuve visible d’un backend riche (commandes en ligne avancées, stock temps réel, validation distributeurs, etc.).

Conclusion technique : la stack frontend est moderne et viable. Elle peut être conservée et étendue (Next.js ou React + NestJS/Node recommandé pour la suite). Pas de migration forcée nécessaire.

3. Identité visuelle et design

Forces :

- Palette rouge/orange énergique + feu dans le logo → excellente association avec le gaz et l’énergie.
- Hero section impactante avec dégradé rouge-orange.
- Typographie claire.
- Cartes produits propres avec prix affichés (Cylinder+LPG et Gas séparés – très pertinent au Cameroun).
- Témoignages clients.
- Footer clair avec coordonnées et réseaux sociaux (Facebook, Instagram, LinkedIn, TikTok).
- Boutons CTA visibles (« Discover our offers », « Your review »).

Faiblesses :

- Design encore trop « brochure » (site vitrine).
- Manque de hiérarchie visuelle forte pour les actions prioritaires (trouver du gaz disponible maintenant).
- Animations limitées.
- Mobile-first correct mais pas optimisé pour connexions instables (pas de skeleton loaders visibles, images potentiellement lourdes).
- Pas de badges de confiance forts (Distributeur vérifié + dernière mise à jour stock).

4. Contenu et fonctionnalités existantes

Produits affichés (exemples) :

- Bouteille 6 kg (Cylinder+LPG : 16 120 Fcfa / Gas : 3 120 Fcfa)
- Bouteille 12,5 kg (26 500 / 6 500 Fcfa)
- Bouteille 50 kg (76 000 / 26 000 Fcfa)
- Tables de cuisson (verre et acier)
- Régulateurs 6 kg et 12,5 kg
- Tuyaux

Services existants :

- Livraison domicile (24h max)
- Livraison pro/restaurants (6h max) + cartes de fidélité
- Installation et assistance technique
- Accompagnement distributeurs / futurs revendeurs

Points de vente :

- Page dédiée avec promesse de carte interactive.
- Pas encore de système de disponibilité temps réel visible.

Compte utilisateur :

- Lien « My account » existant mais très basique (pas encore d’espace client/distributeur riche).

5. Forces du site actuel (à absolument conserver et amplifier)

- Identité de marque forte (« Bouteilles toujours pleines ») – extrêmement différenciante dans un marché en pénurie.
- Prix affichés clairement (séparation bouteille + gaz).
- Présence multilingue FR/EN.
- Mentions des livraisons rapides et de l’accompagnement distributeurs.
- Stack technique moderne (React/Vite) – bonne base.
- Coordonnées claires (+237 680 00 00 75, emails).
- Engagements sociaux et environnementaux (santé, emploi femmes/jeunes, anti-déforestation).
- Témoignages clients.

6. Faiblesses majeures (par rapport à la vision Digital Distribution Network)

| Domaine | État actuel | Impact |
| --- | --- | --- |
| Disponibilité du gaz | Absente (pas de statut temps réel) | Critique |
| Géolocalisation intelligente | Carte basique | Critique |
| Espace distributeur | Quasi inexistant | Critique |
| Validation des revendeurs | Aucune | Critique |
| Commande client en ligne | Très limitée | Élevé |
| Commande distributeur → PLEINGAZ | Absente | Élevé |
| Paiement Mobile Money | Non visible | Élevé |
| Facturation automatique | Absente | Moyen |
| Assistant IA / Chat | Absent | Moyen |
| Notifications & alertes stock | Absentes | Élevé |
| Administration / Supervision | Absente | Critique |
| Confiance (badges + fraîcheur données) | Faible | Critique |
| Parcours « J’ai besoin de gaz » | Inexistant | Critique |
