PHASE 8. IA.
8.1 Base de connaissances PLEINGAZ gérée en admin (documents versionnés, validés) + RAG ; l'IA ne cite que cette base pour l'information officielle.
8.2 Outils internes en lecture, typés et autorisés par rôle : find_nearest_available_store, check_product_availability, find_open_store, get_store_details, get_order_status, get_invoice, create_stock_alert, contact_support. L'utilisateur n'accède qu'à ses propres commandes/factures.
8.3 Chaque réponse distingue : information officielle / dynamique (avec horodatage) / indisponible / estimation / recommandation.
8.4 Compréhension du langage local : français courant, anglais, fautes, noms de quartiers, éventuel mélange FR/EN ; jeu de tests de 100 phrases réalistes.
8.5 Garde-fous : injection de prompt, fuite de données, refus des sujets hors périmètre, limite de débit, journalisation, bouton "parler à un conseiller".
8.6 Assistant admin : questions en langage naturel sur données réelles via outils d'analyse en lecture seule ; jamais de statistique non issue de la base.
8.7 Coûts : plafonds, cache, métriques d'usage.
Évaluation : jeu de tests automatisé (hallucination de stock/prix = échec bloquant).
