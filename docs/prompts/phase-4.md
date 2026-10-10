PHASE 4. PRODUITS + DISPONIBILITÉ + RECHERCHE.
4.1 Catalogue admin (CRUD, catégories, tarifs public/distributeur/promo, historique des changements de prix audité). Reprendre le catalogue existant par import validé, sans inventer.
4.2 Stock distributeur par produit (BON/MOYEN/FAIBLE/RUPTURE), bouton "Confirmer mon stock maintenant" en un clic, fonctionnement dégradé hors ligne (mise à jour mise en file puis envoyée à la reconnexion, horodatage réel de la déclaration).
4.3 Calcul d'ancienneté : 🟢 🟠 🔴 ⚪ avec libellé "Stock confirmé il y a X min" (R6), seuils configurables.
4.4 Parcours "J'ai besoin de gaz" : produit → lieu (GPS facultatif / quartier / repère) → résultats classés avec raison de la recommandation.
4.5 Requêtes PostGIS (distance, rayon 2/5 km, ouvert maintenant, avec stock, livre).
4.6 Recherche PostgreSQL tolérante aux fautes (pg_trgm, unaccent, synonymes locaux de quartiers) ; journaliser les recherches sans résultat (SearchEvent).
4.7 "Alertez-moi quand le gaz revient" (DemandAlert) avec déclenchement à la remise en stock, anti-spam et consentement.
4.8 Alertes de rappel de stock côté distributeur et alertes admin (stock non mis à jour depuis X jours).
Tests : calcul d'ancienneté, fuseaux horaires, requêtes géographiques, alertes dupliquées.
