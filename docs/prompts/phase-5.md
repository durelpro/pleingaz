PHASE 5. COMMANDES.
5.1 Panier, commande retrait ou livraison, adresse avec repère, créneau, instructions.
5.2 Routage : score multi-critères (disponibilité, fraîcheur, distance/temps, horaires, capacité, livraison, charge, fiabilité, statut), explicable à l'utilisateur ; le client garde le choix final.
5.3 Réservation temporaire de stock avec expiration stricte (job BullMQ), sans surréservation (transactions + verrous).
5.4 Livraison : statuts PENDING→ASSIGNED→PICKED_UP→IN_TRANSIT→DELIVERED/FAILED/CANCELLED ; code de confirmation de livraison remis au client ; livreurs (propres ou du distributeur).
5.5 Factures : numérotation unique par vendeur, identité du vendeur réel ("PLEINGAZ - Vente directe" ou "Distributeur agréé : X"), PDF, téléchargement, partage WhatsApp, une facture par commande, immuable une fois émise (avoir pour correction). Mentions légales/fiscales : À CONFIRMER, champs configurables.
5.6 Commande distributeur → PLEINGAZ (DRAFT→SUBMITTED→CONFIRMED→PREPARING→SHIPPED→DELIVERED/CANCELLED), historique complet, prix distributeur appliqué côté serveur.
5.7 Commande assistée : un agent ou distributeur saisit une commande pour un client appelant/WhatsApp ; même circuit, traçabilité de l'auteur.
Tests : double commande, prix falsifié, accès aux factures d'autrui, surréservation concurrente.
