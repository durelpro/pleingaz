PHASE 6. PAIEMENTS.
6.1 Interface PaymentProvider + ManualPaymentProvider (espèces au retrait / à la livraison avec confirmation par le distributeur ET code client).
6.2 MTNProvider et OrangeProvider en SANDBOX d'abord : initiation côté serveur, transaction ID, statut PENDING tant que non confirmé, webhook signé (vérification de signature), revérification du statut auprès du fournisseur, idempotence, expiration/timeouts, journal d'événements.
6.3 Gestion des échecs, relances, abandons, remboursements, paiement reçu en double.
6.4 Rapprochement financier (écran finance : transactions vs commandes vs factures, écarts).
6.5 Frais de transaction : modéliser sans supposer qui les supporte (À CONFIRMER).
Aucune clé de production dans le code. Tests : faux webhook, webhook rejoué, double clic, paiement partiel, commande annulée pendant le paiement.
