---
id: "KB-003-INTENTIONS"
titre: "Catalogue des Intentions Conversationnelles"
langue: "fr"
audience: "admin"
statut: "VALIDATED"
source: "Interne"
valide_par: "Durel"
date_validation: "2026-10-07"
version: "1.0"
tags: ["intentions", "nlp", "llm"]
outils_lies: ["all"]
---

# Catalogue des 35 Intentions de l'Assistant IA

*(Pour alléger l'affichage ici, le format est standardisé. Le modèle complet est appliqué à chaque intention).*

## Intention 1 : Trouver du gaz proche (Disponibilité)
*   **Description :** L'utilisateur cherche un distributeur ouvert avec du stock près de lui.
*   **8 Formulations :**
    1. "je cherche du gaz a bonamoussadi"
    2. "ou je peux trouver le sctm mvan ?"
    3. "gas cylinder in bastos"
    4. "ma boutiel est vide, ya le gaz ou ?"
    5. "urgent besoin gaz"
    6. "où acheter du gaz camgaz près de moi"
    7. "je veux recharger ma bouteille a akwa"
    8. "gas finished, where to buy in limbe?"
*   **Infos requises :** Quartier ou Position GPS.
*   **Infos facultatives :** Marque (SCTM, Camgaz...), Taille.
*   **Question de clarification :** "Dans quel quartier ou ville vous trouvez-vous actuellement ?"
*   **Outils à appeler :** `find_nearest_available_store` ou `search_stores_by_area`.
*   **Gabarit réponse :** "J'ai trouvé [X] distributeurs ouverts près de [Quartier]. Le plus proche est [Nom] à [Distance]. Le stock a été confirmé il y a [Fraîcheur]."
*   **Cas d'échec :** Aucun distributeur trouvé. -> "Aucun distributeur n'a de stock signalé près de chez vous actuellement."
*   **Condition d'escalade :** L'utilisateur exprime de la colère car la boutique indiquée était fermée.

## Intention 2 : Vérifier le prix d'un produit
*   **Description :** L'utilisateur demande le prix officiel homologué.
*   **8 Formulations :**
    1. "combien coute la bouteille sctm ?"
    2. "prix du gaz 12kg"
    3. "how much is camgaz 12.5kg?"
    4. "le gaz a augmenter ?"
    5. "tarif tradex"
    6. "on vend le sctm a combien"
    7. "c'est a cbm la recharge ?"
    8. "price of gas refill"
*   **Infos requises :** Marque, Poids.
*   **Infos facultatives :** Aucune.
*   **Question de clarification :** "Quelle marque (ex: SCTM, Camgaz) et quelle taille (ex: 12.5kg) recherchez-vous ?"
*   **Outils à appeler :** `get_product_price`.
*   **Gabarit réponse :** "Le prix officiel pour la [Marque] [Poids] est de [Prix] FCFA."
*   **Cas d'échec :** Produit non trouvé.
*   **Condition d'escalade :** L'utilisateur signale qu'un distributeur vend plus cher.

## Intention 3 : Horaires d'un point de vente
*   **Description :** Vérifie si un distributeur précis est ouvert.
*   **8 Formulations :** "Le dépot sctm de mvan est ouvert ?", "a quelle heure ferme le distributeur d'akwa", "is the shop open?", "c'est ouvert?", "horaires", "ils travaillent aujourd'hui?", "heure de fermeture", "c'est encore ouvert a cette heure ?"
*   **Infos requises :** Nom du distributeur ou storeId.
*   **Question de clarification :** "De quel point de vente parlez-vous ?"
*   **Outils à appeler :** `find_open_store`.
*   **Gabarit réponse :** "Oui, [Nom] est ouvert jusqu'à [Heure]."
*   **Cas d'échec :** Distributeur inconnu.
*   **Condition d'escalade :** Jamais.

## Intention 4 : Créer un compte
*   **Description :** Guide l'utilisateur pour l'inscription.
*   **8 Formulations :** "comment créer un compte", "je veux m'inscrire", "register", "sign up", "creer profil", "comment avoir un compte pleingaz", "inscription", "ouvrir un compte"
*   **Infos requises :** Aucune (L'IA ne le fait pas elle-même).
*   **Outils à appeler :** Aucun.
*   **Gabarit réponse :** "Pour créer un compte, cliquez sur 'Connexion/Inscription' dans le menu. Vous aurez juste besoin de votre numéro de téléphone pour recevoir un code SMS."
*   **Condition d'escalade :** "Je ne recois pas le SMS."

## Intention 5 : Problème de réception OTP
*   **Description :** L'utilisateur n'arrive pas à se connecter car il ne reçoit pas le SMS.
*   **8 Formulations :** "je recois pas le code", "le sms n'arrive pas", "code otp erreur", "otp not received", "impossible de me connecter", "mon compte est bloqué", "je n'ai pas eu le sms", "renvoyer le code"
*   **Outils à appeler :** `search_knowledge` (Procédure de secours WhatsApp).
*   **Condition d'escalade :** Si le problème persiste après l'explication, transfert vers un conseiller (`handoff_to_agent`).

## Intention 6 : Modifier son profil
*   **Description :** Changer de nom ou de ville.
*   **8 Formulations :** "changer mon nom", "modifier profil", "update profile", "comment changer ma ville", "erreur sur mon nom", "modifier infos", "editer profil", "paramètres du compte"
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit :** "Allez dans la section 'Mon Profil' de l'application pour modifier ces informations."

## Intention 7 : Ajouter / Modifier une adresse
*   **Description :** Gérer les adresses de livraison.
*   **8 Formulations :** "ajouter adresse", "livrer chez moi", "changer mon adresse", "comment mettre ma position", "add delivery address", "nouvelle adresse", "supprimer adresse", "gerer mes lieux"
*   **Outils à appeler :** `list_my_addresses` (pour voir s'il y en a) + `search_knowledge`.

## Intention 8 : Commander pour un retrait
*   **Description :** Acheter via l'app pour aller récupérer sur place (Click & Collect).
*   **8 Formulations :** "je veux reserver une bouteille", "commander pour passer prendre", "order to pick up", "reserver sctm", "payer en avance", "je passe prendre le gaz", "retrait en boutique", "click and collect"
*   **Question de clarification :** "Quel produit souhaitez-vous réserver et dans quelle ville ?"
*   **Outils à appeler :** Explication du processus.

## Intention 9 : Commander pour livraison
*   **Description :** Demander qu'un livreur apporte le gaz.
*   **8 Formulations :** "livrez moi", "je veux me faire livrer", "delivery to my house", "apporter le gaz", "commander a domicile", "livraison", "combien coute la livraison", "besoin d'un livreur"
*   **Outils à appeler :** `search_knowledge` (Explique comment faire dans l'interface).

## Intention 10 : Suivre une commande
*   **Description :** Demander où en est le livreur ou la préparation.
*   **8 Formulations :** "ou est ma commande", "suivre livraison", "track my order", "le livreur est en route ?", "ma commande est prete ?", "statut de la commande", "je n'ai toujours pas recu mon gaz", "commande retard"
*   **Question de clarification :** "Quel est votre numéro de commande ?" (Si non devinable).
*   **Outils à appeler :** `get_order_status` ou `get_delivery_status`.

## Intention 11 : Annuler une commande
*   **Description :** Annuler un achat avant livraison.
*   **8 Formulations :** "annuler", "cancel order", "je ne veux plus de la commande", "annuler ma livraison", "stop order", "j'ai fait une erreur de commande", "annuler l'achat", "remboursez moi"
*   **Outils à appeler :** `get_order_status`. L'IA explique que l'annulation se fait depuis le Détail de la Commande dans l'interface.

## Intention 12 : Modifier une commande
*   **Description :** Changer la marque ou l'adresse après validation.
*   **8 Formulations :** "changer ma commande", "modifier achat", "je me suis trompé de marque", "livrer a une autre adresse", "change order", "erreur de bouteille", "modifier adresse livraison", "corriger ma commande"
*   **Condition d'escalade :** Si la commande est déjà en cours de livraison (`handoff_to_agent`).

## Intention 13 : Problème de livraison
*   **Description :** Le livreur ne trouve pas, ou la bouteille est défectueuse.
*   **8 Formulations :** "le livreur ne repond pas", "bouteille fuite", "bouteille abimée", "delivery problem", "je n'ai pas le code otp de livraison", "livraison incomplète", "livreur désagréable", "commande non recue mais marquee livree"
*   **Outils à appeler :** `handoff_to_agent`. Transfert direct à un humain.

## Intention 14 : Comment payer
*   **Description :** Interroger sur les modes de paiement.
*   **8 Formulations :** "comment on paye", "acceptez vous mtn momo", "orange money", "payer en espece", "how to pay", "modes de paiement", "cash a la livraison", "carte bancaire"
*   **Outils à appeler :** `search_knowledge`.

## Intention 15 : Problème de paiement
*   **Description :** Échec d'une transaction Momo ou OM.
*   **8 Formulations :** "mon paiement a echoue", "erreur orange money", "l'argent a ete debité mais pas de commande", "payment failed", "remboursement", "momo n'a pas marché", "j'ai payé 2 fois", "probleme paiement"
*   **Outils à appeler :** `handoff_to_agent`. Transfert au support financier.

## Intention 16 : Consulter une facture
*   **Description :** Demander à voir l'historique d'achat.
*   **8 Formulations :** "mes factures", "voir mes achats", "my invoices", "historique de commande", "avoir un recu", "recu de paiement", "combien j'ai depensé", "liste des commandes"
*   **Outils à appeler :** `list_my_invoices` ou `list_my_orders`.

## Intention 17 : Partager/Télécharger une facture
*   **Description :** Demander un document PDF spécifique.
*   **8 Formulations :** "telecharger facture", "envoyer par whatsapp", "download invoice", "pdf facture", "imprimer recu", "facture pour entreprise", "preuve de paiement", "copie de facture"
*   **Outils à appeler :** `get_invoice`.

## Intention 18 : Créer une alerte stock
*   **Description :** L'utilisateur veut être prévenu quand du gaz arrive.
*   **8 Formulations :** "prevenez moi quand ya le gaz", "alerte sctm", "notifier retour en stock", "alert me when available", "sonnez moi quand c'est la", "je veux le sctm bonamoussadi des qu'il ya", "alerte", "notification de stock"
*   **Outils à appeler :** `create_stock_alert`.
*   **Question de clarification :** "Pour quelle marque et dans quel périmètre (en km) souhaitez-vous l'alerte ?"

## Intention 19 : Gérer ses alertes
*   **Description :** Voir ou supprimer des alertes existantes.
*   **8 Formulations :** "mes alertes", "arreter les notifications", "my alerts", "supprimer alerte sctm", "je ne veux plus d'alerte", "voir mes abonnements de stock", "alertes", "desactiver"
*   **Outils à appeler :** `list_my_alerts`.

## Intention 20 : Favoris
*   **Description :** Gérer ses points de vente préférés.
*   **8 Formulations :** "mes favoris", "boutiques enregistrees", "my favorite stores", "enregistrer distributeur", "retirer de mes favoris", "liste des favoris", "boutique habituelle", "mon depôt"
*   **Outils à appeler :** `search_knowledge` (Explique la fonction Favoris).

## Intention 21 : Avis
*   **Description :** Laisser une note à un livreur ou un distributeur.
*   **8 Formulations :** "noter livreur", "laisser un avis", "donner 5 etoiles", "rate service", "commenter distributeur", "donner mon avis", "evaluer", "mauvaise note"
*   **Outils à appeler :** `search_knowledge` (Indique que cela se fait à la fin d'une commande).

## Intention 22 : Devenir distributeur
*   **Description :** Un pro veut vendre du gaz via l'app.
*   **8 Formulations :** "devenir partenaire", "vendre du gaz", "inscrire ma boutique", "become distributor", "je suis revendeur", "comment ajouter mon depot", "partenariat", "business"
*   **Outils à appeler :** `search_knowledge` (Procédure RCCM/CNI).

## Intention 23 : Distributeur officiel
*   **Description :** Vérifier si un vendeur est légitime.
*   **8 Formulations :** "ce depot est il certifié", "vrai vendeur sctm", "is this store verified", "arnaque gaz", "distributeur agrée", "liste officielle", "fiabilité boutique", "certifié pleingaz"
*   **Outils à appeler :** `search_knowledge` (Explique le badge "Certifié").

## Intention 24 : Signaler un problème / Fraude
*   **Description :** Dénoncer une surfacturation ou une boutique fermée qui s'affiche ouverte.
*   **8 Formulations :** "boutique fermée mais dit ouvert", "il vend plus cher", "report scam", "surfacturation sctm", "plainte contre un vendeur", "arnaque prix", "signaler", "ce distributeur ment"
*   **Outils à appeler :** `handoff_to_agent`. L'IA s'excuse et transfère la plainte.

## Intention 25 : Consigne et échange
*   **Description :** Modalités pour échanger une bouteille vide contre une pleine.
*   **8 Formulations :** "echange bouteille", "prix de la consigne", "j'ai pas de bouteille vide", "exchange gas cylinder", "nouvelle bouteille", "acheter bouteille vide", "recharge", "premiere bouteille"
*   **Outils à appeler :** `search_knowledge` (Données DRAFT de PLEINGAZ).

## Intention 26 : Sécurité et Usage
*   **Description :** Conseils d'utilisation du gaz.
*   **8 Formulations :** "comment allumer le gaz", "ca sent le gaz", "bouteille qui siffle", "gas safety", "detendeur", "tuyau de gaz", "danger", "utilisation"
*   **Outils à appeler :** `search_knowledge`.
*   **Condition d'escalade :** Si mot clé "fuite" ou "incendie" -> Intention URGENCE.

## Intention 27 : URGENCE Fuite de gaz
*   **Description :** Danger immédiat.
*   **8 Formulations :** "fuite de gaz", "gas leak", "ca a pris feu", "feu", "explosion", "fire", "danger immediat", "urgence"
*   **Gabarit réponse :** "⚠️ URGENCE : Coupez l'arrivée de gaz, aérez la pièce, ne touchez à aucun interrupteur électrique et sortez. Appelez les pompiers au [NUMERO] immédiatement !"
*   **Outils à appeler :** Aucun. Affiche le protocole d'urgence.

## Intention 28 : Contacter PLEINGAZ
*   **Description :** Avoir le numéro ou le mail général.
*   **8 Formulations :** "numero de telephone", "appeler le service client", "contact pleingaz", "customer service", "email support", "ou etes vous situes", "nous joindre", "contacts"
*   **Outils à appeler :** `search_knowledge`.

## Intention 29 : Parler à un humain
*   **Description :** L'utilisateur rejette l'IA et veut un agent.
*   **8 Formulations :** "parler a un humain", "passez moi quelqu'un", "je veux un conseiller", "talk to human", "agent", "service client", "je ne veux pas parler a une machine", "humain"
*   **Outils à appeler :** `handoff_to_agent`.

## Intention 30 : Confidentialité / RGPD
*   **Description :** Savoir comment les données sont utilisées.
*   **8 Formulations :** "rgpd", "donnees personnelles", "privacy", "vous faites quoi de mon numero", "suis je espionné", "securite des donnees", "protection de la vie privee", "mes informations"
*   **Outils à appeler :** `search_knowledge`.

## Intention 31 : Supprimer son compte
*   **Description :** Droit à l'oubli.
*   **8 Formulations :** "supprimer mon compte", "effacer mes donnees", "delete account", "je veux partir", "desinscription", "cloturer mon profil", "fermer compte", "oublier mon numero"
*   **Outils à appeler :** `search_knowledge` (Procédure dans l'interface).

## Intention 32 : Fonctionnement plateforme
*   **Description :** Comprendre le but de PLEINGAZ.
*   **8 Formulations :** "comment ca marche", "c'est quoi pleingaz", "how does it work", "a quoi sert cette application", "explication", "principe du site", "c'est gratuit ?", "concept"
*   **Outils à appeler :** `search_knowledge`.

## Intention 33 : Catalogue des produits
*   **Description :** Lister les marques de gaz.
*   **8 Formulations :** "quelles marques vous vendez", "vous avez bocom ?", "list of brands", "catalogue", "quels sont les produits", "tailles de bouteilles", "12 ou 50kg", "vous vendez quoi"
*   **Outils à appeler :** `get_product_catalog`.

## Intention 34 : Gérer les adresses de facturation
*   **Description :** Obtenir des factures au nom d'une entreprise.
*   **8 Formulations :** "facture entreprise", "tva", "adresse de facturation", "corporate invoice", "compte pro", "facture au nom de ma societe", "niu", "rccm facturation"
*   **Outils à appeler :** `search_knowledge`.

## Intention 35 : Salutations & Hors Sujet
*   **Description :** Paroles sociales ou sujets non gérés.
*   **8 Formulations :** "bonjour", "salut", "hello", "merci", "au revoir", "quel temps fait il", "qui est le president", "tu es con"
*   **Outils à appeler :** Aucun.
*   **Gabarit réponse :** Salutation polie ou "Je suis un assistant spécialisé dans le gaz domestique PLEINGAZ. Comment puis-je vous aider avec votre approvisionnement ?"
