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

Ce document liste les intentions traitées par l'assistant, avec tous les attributs requis pour le NLP.

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
*   **Infos facultatives :** Marque, Taille.
*   **Question de clarification :** "Dans quel quartier ou ville vous trouvez-vous actuellement ?"
*   **Outils à appeler :** `find_nearest_available_store` ou `search_stores_by_area`.
*   **Gabarit réponse :** "J'ai trouvé [X] distributeurs ouverts près de [Quartier]. Le plus proche est [Nom] à [Distance]. Stock confirmé il y a [Fraîcheur]."
*   **Cas d'échec :** Aucun distributeur trouvé. -> "Aucun distributeur n'a de stock signalé près de chez vous."
*   **Condition d'escalade :** L'utilisateur exprime de la colère car la boutique était fermée.

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
*   **Gabarit réponse :** "Le prix officiel pour la [Marque] [Poids] est de [Prix] CFA."
*   **Cas d'échec :** Produit non trouvé. -> "Je ne trouve pas le prix pour ce produit."
*   **Condition d'escalade :** L'utilisateur signale qu'un distributeur vend plus cher.

## Intention 3 : Horaires d'un point de vente
*   **Description :** Vérifie si un distributeur précis est ouvert.
*   **8 Formulations :**
    1. "Le dépot sctm de mvan est ouvert ?"
    2. "a quelle heure ferme le distributeur d'akwa"
    3. "is the shop open?"
    4. "c'est ouvert?"
    5. "horaires"
    6. "ils travaillent aujourd'hui?"
    7. "heure de fermeture"
    8. "c'est encore ouvert a cette heure ?"
*   **Infos requises :** Nom du distributeur ou zone.
*   **Infos facultatives :** Aucune.
*   **Question de clarification :** "De quel point de vente parlez-vous ?"
*   **Outils à appeler :** `find_open_store`.
*   **Gabarit réponse :** "Oui, [Nom] est ouvert jusqu'à [Heure]."
*   **Cas d'échec :** Distributeur inconnu. -> "Je ne trouve pas ce point de vente."
*   **Condition d'escalade :** Jamais.

## Intention 4 : Créer un compte
*   **Description :** Guide l'utilisateur pour l'inscription.
*   **8 Formulations :**
    1. "comment créer un compte"
    2. "je veux m'inscrire"
    3. "register"
    4. "sign up"
    5. "creer profil"
    6. "comment avoir un compte pleingaz"
    7. "inscription"
    8. "ouvrir un compte"
*   **Infos requises :** Aucune.
*   **Infos facultatives :** Aucune.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit réponse :** "Pour créer un compte, cliquez sur 'Connexion/Inscription' dans le menu avec votre numéro de téléphone."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** "Je n'y arrive pas".

## Intention 5 : Problème de réception OTP
*   **Description :** L'utilisateur n'arrive pas à se connecter car il ne reçoit pas le SMS.
*   **8 Formulations :**
    1. "je recois pas le code"
    2. "le sms n'arrive pas"
    3. "code otp erreur"
    4. "otp not received"
    5. "impossible de me connecter"
    6. "mon compte est bloqué"
    7. "je n'ai pas eu le sms"
    8. "renvoyer le code"
*   **Infos requises :** Numéro de téléphone.
*   **Infos facultatives :** Opérateur.
*   **Question de clarification :** "Pouvez-vous confirmer votre numéro de téléphone ?"
*   **Outils à appeler :** `search_knowledge` (Procédure de secours).
*   **Gabarit réponse :** "Si le SMS tarde, vous pouvez essayer de vous connecter via WhatsApp."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** Si le problème persiste après l'explication, `handoff_to_agent`.

## Intention 6 : Modifier son profil
*   **Description :** Changer de nom ou de ville.
*   **8 Formulations :**
    1. "changer mon nom"
    2. "modifier profil"
    3. "update profile"
    4. "comment changer ma ville"
    5. "erreur sur mon nom"
    6. "modifier infos"
    7. "editer profil"
    8. "paramètres du compte"
*   **Infos requises :** Aucune.
*   **Infos facultatives :** Champ à modifier.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit réponse :** "Allez dans la section 'Mon Profil' de l'application pour modifier ces informations."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** N/A.

## Intention 7 : Ajouter / Modifier une adresse
*   **Description :** Gérer les adresses de livraison.
*   **8 Formulations :**
    1. "ajouter adresse"
    2. "livrer chez moi"
    3. "changer mon adresse"
    4. "comment mettre ma position"
    5. "add delivery address"
    6. "nouvelle adresse"
    7. "supprimer adresse"
    8. "gerer mes lieux"
*   **Infos requises :** Aucune.
*   **Infos facultatives :** Aucune.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit réponse :** "Vous pouvez gérer vos lieux dans la section 'Mes Adresses'."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** N/A.

## Intention 8 : Commander pour un retrait
*   **Description :** Acheter via l'app pour aller récupérer sur place (Click & Collect).
*   **8 Formulations :**
    1. "je veux reserver une bouteille"
    2. "commander pour passer prendre"
    3. "order to pick up"
    4. "reserver sctm"
    5. "payer en avance"
    6. "je passe prendre le gaz"
    7. "retrait en boutique"
    8. "click and collect"
*   **Infos requises :** Produit, Ville.
*   **Infos facultatives :** Boutique spécifique.
*   **Question de clarification :** "Quel produit souhaitez-vous réserver et dans quelle ville ?"
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit réponse :** "Pour réserver, trouvez une boutique sur la carte et choisissez 'Retrait en boutique'."
*   **Cas d'échec :** Produit indisponible.
*   **Condition d'escalade :** N/A.

## Intention 9 : Commander pour livraison
*   **Description :** Demander qu'un livreur apporte le gaz.
*   **8 Formulations :**
    1. "livrez moi"
    2. "je veux me faire livrer"
    3. "delivery to my house"
    4. "apporter le gaz"
    5. "commander a domicile"
    6. "livraison"
    7. "combien coute la livraison"
    8. "besoin d'un livreur"
*   **Infos requises :** Aucune.
*   **Infos facultatives :** Adresse.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit réponse :** "Choisissez 'Livraison à domicile' lors de votre commande sur l'application."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** N/A.

## Intention 10 : Suivre une commande
*   **Description :** Demander où en est le livreur ou la préparation.
*   **8 Formulations :**
    1. "ou est ma commande"
    2. "suivre livraison"
    3. "track my order"
    4. "le livreur est en route ?"
    5. "ma commande est prete ?"
    6. "statut de la commande"
    7. "je n'ai toujours pas recu mon gaz"
    8. "commande retard"
*   **Infos requises :** Numéro de commande (si non connecté).
*   **Infos facultatives :** Aucune.
*   **Question de clarification :** "Quel est votre numéro de commande ?"
*   **Outils à appeler :** `get_order_status` ou `get_delivery_status`.
*   **Gabarit réponse :** "Votre commande est actuellement en statut [Statut]."
*   **Cas d'échec :** Commande introuvable.
*   **Condition d'escalade :** Retard de livraison.

## Intention 11 : Annuler une commande
*   **Description :** Annuler un achat avant livraison.
*   **8 Formulations :**
    1. "annuler"
    2. "cancel order"
    3. "je ne veux plus de la commande"
    4. "annuler ma livraison"
    5. "stop order"
    6. "j'ai fait une erreur de commande"
    7. "annuler l'achat"
    8. "remboursez moi"
*   **Infos requises :** Numéro de commande.
*   **Infos facultatives :** Motif.
*   **Question de clarification :** "Quel est le numéro de la commande à annuler ?"
*   **Outils à appeler :** `get_order_status`, puis instruction manuelle.
*   **Gabarit réponse :** "Vous pouvez annuler cette commande directement depuis le détail de la commande."
*   **Cas d'échec :** Déjà en route.
*   **Condition d'escalade :** Déjà payé et en route.

## Intention 12 : Modifier une commande
*   **Description :** Changer la marque ou l'adresse après validation.
*   **8 Formulations :**
    1. "changer ma commande"
    2. "modifier achat"
    3. "je me suis trompé de marque"
    4. "livrer a une autre adresse"
    5. "change order"
    6. "erreur de bouteille"
    7. "modifier adresse livraison"
    8. "corriger ma commande"
*   **Infos requises :** Numéro de commande.
*   **Infos facultatives :** Nouvelle info.
*   **Question de clarification :** "Quelle commande souhaitez-vous modifier ?"
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit réponse :** "Si elle n'est pas encore préparée, annulez-la et recommencez."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** Si la commande est déjà en cours.

## Intention 13 : Problème de livraison
*   **Description :** Le livreur ne trouve pas, ou la bouteille est défectueuse.
*   **8 Formulations :**
    1. "le livreur ne repond pas"
    2. "bouteille fuite"
    3. "bouteille abimée"
    4. "delivery problem"
    5. "je n'ai pas le code otp de livraison"
    6. "livraison incomplète"
    7. "livreur désagréable"
    8. "commande non recue mais marquee livree"
*   **Infos requises :** Numéro de commande.
*   **Infos facultatives :** Nature du problème.
*   **Question de clarification :** "Quel est votre numéro de commande pour que je signale le problème ?"
*   **Outils à appeler :** `handoff_to_agent`.
*   **Gabarit réponse :** "Je transfère votre problème à un conseiller immédiatement."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** Systématique.

## Intention 14 : Comment payer
*   **Description :** Interroger sur les modes de paiement.
*   **8 Formulations :**
    1. "comment on paye"
    2. "acceptez vous mtn momo"
    3. "orange money"
    4. "payer en espece"
    5. "how to pay"
    6. "modes de paiement"
    7. "cash a la livraison"
    8. "carte bancaire"
*   **Infos requises :** Aucune.
*   **Infos facultatives :** Aucune.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit réponse :** "Nous acceptons Mobile Money (MTN/Orange) et le paiement à la livraison."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** N/A.

## Intention 15 : Problème de paiement
*   **Description :** Échec d'une transaction Momo ou OM.
*   **8 Formulations :**
    1. "mon paiement a echoue"
    2. "erreur orange money"
    3. "l'argent a ete debité mais pas de commande"
    4. "payment failed"
    5. "remboursement"
    6. "momo n'a pas marché"
    7. "j'ai payé 2 fois"
    8. "probleme paiement"
*   **Infos requises :** Numéro de téléphone.
*   **Infos facultatives :** ID de transaction.
*   **Question de clarification :** "Avec quel numéro avez-vous tenté de payer ?"
*   **Outils à appeler :** `handoff_to_agent`.
*   **Gabarit réponse :** "Je contacte notre service financier pour vérifier votre transaction."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** Systématique.

## Intention 16 : Consulter une facture
*   **Description :** Demander à voir l'historique d'achat.
*   **8 Formulations :**
    1. "mes factures"
    2. "voir mes achats"
    3. "my invoices"
    4. "historique de commande"
    5. "avoir un recu"
    6. "recu de paiement"
    7. "combien j'ai depensé"
    8. "liste des commandes"
*   **Infos requises :** Utilisateur connecté.
*   **Infos facultatives :** Mois spécifique.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `list_my_invoices` ou `list_my_orders`.
*   **Gabarit réponse :** "Voici vos factures récentes : [Lien]."
*   **Cas d'échec :** Non connecté. -> "Veuillez vous connecter."
*   **Condition d'escalade :** N/A.

## Intention 17 : Partager/Télécharger une facture
*   **Description :** Demander un document PDF spécifique.
*   **8 Formulations :**
    1. "telecharger facture"
    2. "envoyer par whatsapp"
    3. "download invoice"
    4. "pdf facture"
    5. "imprimer recu"
    6. "facture pour entreprise"
    7. "preuve de paiement"
    8. "copie de facture"
*   **Infos requises :** Numéro de facture.
*   **Infos facultatives :** Aucune.
*   **Question de clarification :** "Pour quelle commande voulez-vous le PDF ?"
*   **Outils à appeler :** `get_invoice`.
*   **Gabarit réponse :** "Voici le lien pour télécharger votre facture : [Lien]."
*   **Cas d'échec :** Facture inexistante.
*   **Condition d'escalade :** N/A.

## Intention 18 : Créer une alerte stock
*   **Description :** L'utilisateur veut être prévenu quand du gaz arrive.
*   **8 Formulations :**
    1. "prevenez moi quand ya le gaz"
    2. "alerte sctm"
    3. "notifier retour en stock"
    4. "alert me when available"
    5. "sonnez moi quand c'est la"
    6. "je veux le sctm bonamoussadi des qu'il ya"
    7. "alerte"
    8. "notification de stock"
*   **Infos requises :** Produit, Périmètre.
*   **Infos facultatives :** Marque.
*   **Question de clarification :** "Pour quelle marque et dans quelle ville souhaitez-vous l'alerte ?"
*   **Outils à appeler :** `create_stock_alert`.
*   **Gabarit réponse :** "Alerte créée ! Nous vous informerons dès le retour en stock."
*   **Cas d'échec :** Non connecté.
*   **Condition d'escalade :** N/A.

## Intention 19 : Gérer ses alertes
*   **Description :** Voir ou supprimer des alertes existantes.
*   **8 Formulations :**
    1. "mes alertes"
    2. "arreter les notifications"
    3. "my alerts"
    4. "supprimer alerte sctm"
    5. "je ne veux plus d'alerte"
    6. "voir mes abonnements de stock"
    7. "alertes"
    8. "desactiver"
*   **Infos requises :** Utilisateur connecté.
*   **Infos facultatives :** Aucune.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `list_my_alerts`.
*   **Gabarit réponse :** "Vous avez [X] alertes actives."
*   **Cas d'échec :** Non connecté.
*   **Condition d'escalade :** N/A.

## Intention 20 : Favoris
*   **Description :** Gérer ses points de vente préférés.
*   **8 Formulations :**
    1. "mes favoris"
    2. "boutiques enregistrees"
    3. "my favorite stores"
    4. "enregistrer distributeur"
    5. "retirer de mes favoris"
    6. "liste des favoris"
    7. "boutique habituelle"
    8. "mon depôt"
*   **Infos requises :** Utilisateur connecté.
*   **Infos facultatives :** Nom de la boutique.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit réponse :** "Retrouvez vos boutiques préférées dans l'onglet Favoris."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** N/A.

## Intention 21 : Avis
*   **Description :** Laisser une note à un livreur ou un distributeur.
*   **8 Formulations :**
    1. "noter livreur"
    2. "laisser un avis"
    3. "donner 5 etoiles"
    4. "rate service"
    5. "commenter distributeur"
    6. "donner mon avis"
    7. "evaluer"
    8. "mauvaise note"
*   **Infos requises :** Numéro de commande.
*   **Infos facultatives :** Note.
*   **Question de clarification :** "De quelle commande s'agit-il ?"
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit réponse :** "Vous pouvez noter depuis l'historique des commandes."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** Avis très négatif (1 étoile).

## Intention 22 : Devenir distributeur
*   **Description :** Un pro veut vendre du gaz via l'app.
*   **8 Formulations :**
    1. "devenir partenaire"
    2. "vendre du gaz"
    3. "inscrire ma boutique"
    4. "become distributor"
    5. "je suis revendeur"
    6. "comment ajouter mon depot"
    7. "partenariat"
    8. "business"
*   **Infos requises :** Aucune.
*   **Infos facultatives :** Aucune.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit réponse :** "Remplissez le formulaire 'Devenir Partenaire' sur le site."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** N/A.

## Intention 23 : Distributeur officiel
*   **Description :** Vérifier si un vendeur est légitime.
*   **8 Formulations :**
    1. "ce depot est il certifié"
    2. "vrai vendeur sctm"
    3. "is this store verified"
    4. "arnaque gaz"
    5. "distributeur agrée"
    6. "liste officielle"
    7. "fiabilité boutique"
    8. "certifié pleingaz"
*   **Infos requises :** Nom boutique.
*   **Infos facultatives :** Ville.
*   **Question de clarification :** "Quel est le nom de la boutique ?"
*   **Outils à appeler :** `search_stores_by_area`.
*   **Gabarit réponse :** "Cette boutique [possède/ne possède pas] le badge Certifié PLEINGAZ."
*   **Cas d'échec :** Introuvable.
*   **Condition d'escalade :** N/A.

## Intention 24 : Signaler un problème / Fraude
*   **Description :** Dénoncer une surfacturation ou une boutique fantôme.
*   **8 Formulations :**
    1. "boutique fermée mais dit ouvert"
    2. "il vend plus cher"
    3. "report scam"
    4. "surfacturation sctm"
    5. "plainte contre un vendeur"
    6. "arnaque prix"
    7. "signaler"
    8. "ce distributeur ment"
*   **Infos requises :** Nom boutique.
*   **Infos facultatives :** Motif.
*   **Question de clarification :** "Pouvez-vous préciser le nom du distributeur et le problème rencontré ?"
*   **Outils à appeler :** `handoff_to_agent`.
*   **Gabarit réponse :** "Merci pour ce signalement. Je transfère à l'équipe conformité."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** Systématique.

## Intention 25 : Consigne et échange
*   **Description :** Modalités pour échanger une bouteille vide.
*   **8 Formulations :**
    1. "echange bouteille"
    2. "prix de la consigne"
    3. "j'ai pas de bouteille vide"
    4. "exchange gas cylinder"
    5. "nouvelle bouteille"
    6. "acheter bouteille vide"
    7. "recharge"
    8. "premiere bouteille"
*   **Infos requises :** Aucune.
*   **Infos facultatives :** Marque.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit réponse :** "La consigne s'achète séparément chez les distributeurs agréés."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** N/A.

## Intention 26 : Sécurité et Usage
*   **Description :** Conseils d'utilisation du gaz.
*   **8 Formulations :**
    1. "comment allumer le gaz"
    2. "ca sent le gaz"
    3. "bouteille qui siffle"
    4. "gas safety"
    5. "detendeur"
    6. "tuyau de gaz"
    7. "danger"
    8. "utilisation"
*   **Infos requises :** Aucune.
*   **Infos facultatives :** Problème.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit réponse :** "Assurez-vous que le détendeur est bien fixé et vérifiez la date du tuyau."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** Si mot-clé fuite/feu (voir Intention 27).

## Intention 27 : URGENCE Fuite de gaz
*   **Description :** Danger immédiat.
*   **8 Formulations :**
    1. "fuite de gaz"
    2. "gas leak"
    3. "ca a pris feu"
    4. "feu"
    5. "explosion"
    6. "fire"
    7. "danger immediat"
    8. "urgence"
*   **Infos requises :** Aucune.
*   **Infos facultatives :** Aucune.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** Aucun.
*   **Gabarit réponse :** "⚠️ URGENCE : Coupez l'arrivée de gaz, aérez, ne touchez à rien d'électrique, évacuez."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** N/A.

## Intention 28 : Contacter PLEINGAZ
*   **Description :** Avoir le numéro ou le mail général.
*   **8 Formulations :**
    1. "numero de telephone"
    2. "appeler le service client"
    3. "contact pleingaz"
    4. "customer service"
    5. "email support"
    6. "ou etes vous situes"
    7. "nous joindre"
    8. "contacts"
*   **Infos requises :** Aucune.
*   **Infos facultatives :** Aucune.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit réponse :** "Vous pouvez nous joindre au [Numéro] ou par email."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** N/A.

## Intention 29 : Parler à un humain
*   **Description :** L'utilisateur rejette l'IA et veut un agent.
*   **8 Formulations :**
    1. "parler a un humain"
    2. "passez moi quelqu'un"
    3. "je veux un conseiller"
    4. "talk to human"
    5. "agent"
    6. "service client"
    7. "je ne veux pas parler a une machine"
    8. "humain"
*   **Infos requises :** Aucune.
*   **Infos facultatives :** Raison.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `handoff_to_agent`.
*   **Gabarit réponse :** "Je transfère votre conversation à un conseiller PLEINGAZ."
*   **Cas d'échec :** Agent indisponible. -> "Les agents sont occupés."
*   **Condition d'escalade :** Systématique.

## Intention 30 : Confidentialité / RGPD
*   **Description :** Savoir comment les données sont utilisées.
*   **8 Formulations :**
    1. "rgpd"
    2. "donnees personnelles"
    3. "privacy"
    4. "vous faites quoi de mon numero"
    5. "suis je espionné"
    6. "securite des donnees"
    7. "protection de la vie privee"
    8. "mes informations"
*   **Infos requises :** Aucune.
*   **Infos facultatives :** Aucune.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit réponse :** "Vos données sont sécurisées et non revendues."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** N/A.

## Intention 31 : Supprimer son compte
*   **Description :** Droit à l'oubli.
*   **8 Formulations :**
    1. "supprimer mon compte"
    2. "effacer mes donnees"
    3. "delete account"
    4. "je veux partir"
    5. "desinscription"
    6. "cloturer mon profil"
    7. "fermer compte"
    8. "oublier mon numero"
*   **Infos requises :** Utilisateur connecté.
*   **Infos facultatives :** Aucune.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit réponse :** "Vous pouvez supprimer vos données via 'Confidentialité' dans votre compte."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** L'utilisateur exige qu'on le fasse pour lui.

## Intention 32 : Fonctionnement plateforme
*   **Description :** Comprendre le but de PLEINGAZ.
*   **8 Formulations :**
    1. "comment ca marche"
    2. "c'est quoi pleingaz"
    3. "how does it work"
    4. "a quoi sert cette application"
    5. "explication"
    6. "principe du site"
    7. "c'est gratuit ?"
    8. "concept"
*   **Infos requises :** Aucune.
*   **Infos facultatives :** Aucune.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit réponse :** "PLEINGAZ vous aide à localiser du gaz et vous le faire livrer."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** N/A.

## Intention 33 : Catalogue des produits
*   **Description :** Lister les marques de gaz.
*   **8 Formulations :**
    1. "quelles marques vous vendez"
    2. "vous avez bocom ?"
    3. "list of brands"
    4. "catalogue"
    5. "quels sont les produits"
    6. "tailles de bouteilles"
    7. "12 ou 50kg"
    8. "vous vendez quoi"
*   **Infos requises :** Aucune.
*   **Infos facultatives :** Marque ciblée.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `get_product_catalog`.
*   **Gabarit réponse :** "Nous gérons plusieurs marques dont [Liste]. Voici les tailles : [Tailles]."
*   **Cas d'échec :** Catalogue vide.
*   **Condition d'escalade :** N/A.

## Intention 34 : Gérer les adresses de facturation
*   **Description :** Obtenir des factures au nom d'une entreprise.
*   **8 Formulations :**
    1. "facture entreprise"
    2. "tva"
    3. "adresse de facturation"
    4. "corporate invoice"
    5. "compte pro"
    6. "facture au nom de ma societe"
    7. "niu"
    8. "rccm facturation"
*   **Infos requises :** Utilisateur connecté.
*   **Infos facultatives :** Numéro de commande.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** `search_knowledge`.
*   **Gabarit réponse :** "Vous pouvez ajouter une adresse de facturation pro depuis votre profil."
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** N/A.

## Intention 35 : Salutations & Hors Sujet
*   **Description :** Paroles sociales ou sujets non gérés.
*   **8 Formulations :**
    1. "bonjour"
    2. "salut"
    3. "hello"
    4. "merci"
    5. "au revoir"
    6. "quel temps fait il"
    7. "qui est le president"
    8. "tu es con"
*   **Infos requises :** Aucune.
*   **Infos facultatives :** Aucune.
*   **Question de clarification :** Aucune.
*   **Outils à appeler :** Aucun.
*   **Gabarit réponse :** "Bonjour ! Je suis l'assistant PLEINGAZ. Comment puis-je vous aider avec votre gaz ?"
*   **Cas d'échec :** N/A.
*   **Condition d'escalade :** Insultes répétées.
