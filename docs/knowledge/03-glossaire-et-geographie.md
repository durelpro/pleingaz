---
id: "KB-005-GLOSSAIRE"
titre: "Glossaire et Géographie"
langue: "fr"
audience: "admin"
statut: "VALIDATED"
source: "Interne"
valide_par: "Durel"
date_validation: "2026-10-07"
version: "1.0"
tags: ["synonymes", "villes", "poids"]
outils_lies: []
---

# 1. Glossaire Technique et Local

*   **Gaz domestique :** Synonymes acceptés : gaz, bouteille, cylindre, recharge, gas, gas cylinder.
*   **Tailles Standards :** Les poids officiels gérés par le système sont : 6kg, 12.5kg (le plus courant), et 50kg (industriel/restaurant).
*   **Acheteur :** Client final, consommateur.
*   **Distributeur :** Boutique, dépôt, point de vente agréé, revendeur.

# 2. Géographie et Bases de Données

L'assistant IA est capable de reconnaître les villes et quartiers du Cameroun. Cependant, l'IA ne s'appuie **jamais** sur une liste textuelle fictive de quartiers. 

*   **Villes Cibles Initiales :** Yaoundé, Douala, Bafoussam, Limbé.
*   **Exemples de Quartiers fréquents :** Bastos, Mvan, Bonamoussadi, Akwa.
*   **Mécanisme de validation :** Lorsqu'un utilisateur demande "Bonamoussadi", l'IA transmet la chaîne de caractères à l'outil `search_stores_by_area` ou convertit en coordonnées pour `find_nearest_available_store`. C'est le moteur **PostGIS** de la base de données qui gère la résolution spatiale.

**Règle Stricte :** Ne jamais inventer qu'une boutique existe dans un quartier non répertorié. Si l'outil BDD échoue, la zone n'est pas couverte.
