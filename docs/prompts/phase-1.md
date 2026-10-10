PHASE 1. CADRAGE. Aucun code applicatif.
Produis, dans docs/ :
1.1 Sitemap des 3 produits (public, client, distributeur, control center).
1.2 Parcours client, distributeur, admin (diagrammes Mermaid).
1.3 Matrice des rôles et permissions granulaires (CUSTOMER, DISTRIBUTOR, SUPPORT_AGENT, DISTRIBUTOR_MANAGER, LOGISTICS_MANAGER, FINANCE_MANAGER, ADMIN, SUPER_ADMIN).
1.4 Modèle de données complet (ERD Mermaid) incluant au minimum : User, Role, CustomerProfile, DistributorProfile, DistributorApplication, DistributorDocument, Store, StoreLocation, Product, ProductCategory, Inventory (état par produit : BON/MOYEN/FAIBLE/RUPTURE + horodatage), InventoryUpdate, Order, OrderItem, DistributorOrder(+Item), Payment, PaymentTransaction, Invoice(+Item), Delivery, Conversation, Message, Notification, Review, Favorite, SupportTicket, KnowledgeDocument, AuditLog, Promotion, LoyaltyAccount, LoyaltyTransaction, StockAlert, DemandAlert, Address (avec champ repère), Report (signalements), SearchEvent (recherches, même sans résultat), StockReservation.
1.5 Machines à états : distributeur (PENDING→UNDER_REVIEW→APPROVED/REJECTED/SUSPENDED), commande client, commande distributeur (DRAFT→...→DELIVERED/CANCELLED), paiement, livraison, réservation de stock.
1.6 Architecture API (REST, versionnée, pagination, erreurs standard, idempotency-key).
1.7 Architecture frontend, architecture paiement, cartographique, notifications, IA (outils + garde-fous).
1.8 Plan de sécurité (menaces principales : IDOR, faux distributeurs, fraude au paiement, scraping de données, abus d'OTP) et plan de tests.
1.9 Priorisation MVP : ce qui est dans la V1 (recherche + disponibilité + carte + distributeurs validés + commande retrait/livraison + paiement présentiel + facture + WhatsApp) et ce qui est reporté.
1.10 Roadmap avec estimation de complexité (S/M/L) par phase.
STOP : attendre ma validation de l'architecture cible.
