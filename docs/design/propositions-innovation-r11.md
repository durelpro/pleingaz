# Propositions d'Innovation & Expérience Utilisateur (Règle R11 - CR-003)

Le présent document formule **14 propositions d'innovation majeures** visant à transformer l'expérience de distribution du gaz domestique au Cameroun, tout en respectant scrupuleusement la charte graphique officielle et les 8 décisions du propriétaire (D-11 à D-18).

Chaque proposition est rédigée selon le format normalisé obligatoire :
`PROBLÈME / SOLUTION / VALEUR / COMPLEXITÉ / PRIORITÉ`.

---

### Proposition 1 : Re-commande "1-Tap" Instantanée par Raccourci Écran d'Accueil
- **PROBLÈME** : Quand la bouteille de gaz s'éteint en pleine préparation du repas, l'acheteur est pressé et n'a pas le temps de naviguer dans un catalogue ou de re-sélectionner son adresse et sa marque habituelle.
- **SOLUTION** : Un bouton permanent "Recharge Express 1-Clic" sur le tableau de bord acheteur (et installable en widget PWA sur l'écran d'accueil du smartphone). Un seul clic déclenche la commande de la bouteille habituelle chez le distributeur habituel avec l'adresse par défaut, sans aucune étape intermédiaire superflue.
- **VALEUR** : Réduction du temps de commande de 60 secondes à **3 secondes chrono**. Taux de fidélisation accru et soulagement immédiat des ménages en situation d'urgence culinaire.
- **COMPLEXITÉ** : **Faible** (réutilisation des données de profil et du dernier distributeur assigné).
- **PRIORITÉ** : **P1 (MVP immédiat)**.

---

### Proposition 2 : Jauge Prédictive d'Épuisement de Bouteille & Rappel Proactif
- **PROBLÈME** : Les bouteilles de gaz domestique au Cameroun sont métalliques et opaques ; les familles ne savent jamais précisément quand le gaz va s'épuiser et se font systématiquement surprendre.
- **SOLUTION** : Algorithme prédictif léger calculant la durée moyenne de consommation du foyer (ex: 28 jours pour une famille de 4 personnes sur une bouteille 12.5 kg). À J-3 de la date estimée de fin, une notification WhatsApp discrète informe l'acheteur : *"Votre bouteille Tradex arrive probablement à terme. Souhaitez-vous planifier une recharge avant la panne ?"*.
- **VALEUR** : Élimination du stress de la coupure de gaz en pleine cuisson. Lissage des flux de commandes pour les distributeurs et livreurs.
- **COMPLEXITÉ** : **Moyenne** (modèle heuristique sur l'historique des dates de commande, ajustable par l'utilisateur).
- **PRIORITÉ** : **P1 (MVP / Pilote)**.

---

### Proposition 3 : Scanner de Plombage & Contrôle Qualité Contradictoire
- **PROBLÈME** : La contrefaçon de gaz (bouteilles sous-remplies clandestinement, gaz frelaté, fuite de valve) est une préoccupation majeure de sécurité publique au Cameroun qui freine la confiance envers les livreurs.
- **SOLUTION** : Intégration dans la PWA livreur et sur l'écran acheteur d'un protocole de vérification visuelle : photo guidée du sceau/plombage de la marque et confirmation de la présence du joint d'étanchéité avant validation de la remise de bouteille.
- **VALEUR** : Rassurance totale du client, protection du distributeur agréé contre les accusations indues et traçabilité inviolable en cas de litige qualité.
- **COMPLEXITÉ** : **Faible à Moyenne** (contrôle de conformité intégré dans l'étape de double confirmation).
- **PRIORITÉ** : **P2 (Post-MVP)**.

---

### Proposition 4 : Mode de Commande de Secours par Message WhatsApp Direct (Option A Avancée)
- **PROBLÈME** : Certains utilisateurs se retrouvent en rupture de forfait données mobiles (Data internet) mais disposent d'un pass "WhatsApp illimité" actif chez leur opérateur.
- **SOLUTION** : Possibilité de passer commande directement en envoyant un mot-clé structuré sur le numéro WhatsApp officiel PLEINGAZ (ex: *"GAZ TRADEX 12KG AKWA"*). Le bot conversationnel PLEINGAZ parse le message, vérifie le numéro expéditeur et génère la commande sur la plateforme avec confirmation instantanée par retour WhatsApp.
- **VALEUR** : Couverture des utilisateurs même sans forfait internet général. 100% accessible avec un simple forfait messagerie.
- **COMPLEXITÉ** : **Moyenne** (webhook entrant WhatsApp Cloud API avec moteur de traitement du langage naturel simple).
- **PRIORITÉ** : **P2 (Phase Pilote)**.

---

### Proposition 5 : Mutualisation Logistique par "Grappes d'Immeubles" & Tournées Programmées
- **PROBLÈME** : Effectuer des livraisons unitaires isolées sur des motos pour une seule bouteille à chaque appel augmente l'empreinte carbone, la fatigue des livreurs et les délais de congestion urbaine à Douala/Yaoundé.
- **SOLUTION** : Algorithme de regroupement logistique qui propose aux acheteurs voisins d'un même quartier ou ensemble résidentiel un créneau de livraison groupé (ex: *"Une tournée dessert votre quartier Akwa Nord entre 17h et 18h"*).
- **VALEUR** : Optimisation des trajets des livreurs (jusqu'à 4 bouteilles par tournée optimisée en tricycle ou moto équipée), délais de livraison fiabilisés.
- **COMPLEXITÉ** : **Élevée** (moteur de dispatching géographique avec fenêtres temporelles).
- **PRIORITÉ** : **P3 (Phase d'Optimisation)**.

---

### Proposition 6 : Géocodage Collaboratif par "Repères Visuels Camerounais"
- **PROBLÈME** : Le système d'adressage postal est quasi-inexistant dans la majorité des quartiers des villes camerounaises ; les coordonnées GPS pures sont souvent imprécises ou instables.
- **SOLUTION** : Formulaire d'adresse intelligent combinant : Quartier sélectionné + Carrefour/Repère connu + Champ textuel guidé *"Couleur du portail / En face de quel commerce ?"* avec possibilité de joindre une photo repère du portail (avec purge EXIF automatique).
- **VALEUR** : Zéro appel téléphonique perdu du livreur cherchant son chemin, gain de 15 minutes par livraison, sérénité de l'acheteur.
- **COMPLEXITÉ** : **Faible** (composant UI repère déjà intégré dans le design system).
- **PRIORITÉ** : **P1 (MVP immédiat)**.

---

### Proposition 7 : Bouton d'Alerte Urgence "Odeur de Gaz / Incident" avec Consignes Vocales
- **PROBLÈME** : En cas de suspicion de fuite de gaz ou détendeur défectueux, la panique peut provoquer des gestes dangereux (allumage d'interrupteur, appel téléphonique dans la pièce).
- **SOLUTION** : Bouton rouge d'urgence visible sur l'espace acheteur : affiche instantanément les gestes réflexes vitaux (Aérer, Ne pas allumer la lumière, Couper la vanne) accompagnés d'un message audio vocal en français et pidgin/langue locale, avec mise en relation prioritaire vers le support sécurité PLEINGAZ.
- **VALEUR** : Sauvegarde des vies humaines, utilité publique de PLEINGAZ au-delà du simple commerce, renforcement massif de l'image de marque citoyenne.
- **COMPLEXITÉ** : **Faible** (composant modal d'urgence statique et fichiers audio préenregistrés légers).
- **PRIORITÉ** : **P1 (MVP immédiat)**.

---

### Proposition 8 : Module de Vente au Comptoir "Mode Hors-Ligne Synchro" pour Distributeurs
- **PROBLÈME** : Les coupures d'électricité ou micro-coupures de réseau internet sont fréquentes dans les marchés et dépôts de gaz de quartier au Cameroun.
- **SOLUTION** : Mode hors-ligne PWA pour l'écran de vente au comptoir (`CounterSale` - D-16). Le distributeur saisit le numéro de l'acheteur et valide la vente physique immédiatement ; la transaction est stockée dans le `IndexedDB` local du navigateur et synchronisée automatiquement dès le retour de la connexion avec contrôle du quota en différé.
- **VALEUR** : Zéro blocage des ventes physiques au dépôt lors des pannes de réseau, traçabilité fiscale continue sans cahier papier.
- **COMPLEXITÉ** : **Moyenne** (Service Worker avec stratégie de synchronisation en arrière-plan).
- **PRIORITÉ** : **P2 (Post-MVP)**.

---

### Proposition 9 : Système de Consigne Universelle avec Échange Équitable
- **PROBLÈME** : Les acheteurs disposent souvent de bouteilles vides d'une marque A (ex: SCTM) alors que le distributeur le plus proche n'a que la marque B (ex: Tradex) en stock.
- **SOLUTION** : Gestion par PLEINGAZ d'une chambre de compensation de consigne entre distributeurs partenaires, permettant à l'acheteur d'échanger sa bouteille vide homologuée sans pénalité tarifaire abusive, le distributeur gérant le rééquilibrage de consigne dans son espace professionnel.
- **VALEUR** : Fluidité totale de l'approvisionnement des ménages, fin des pénuries artificielles liées aux blocages de marques.
- **COMPLEXITÉ** : **Élevée** (règles comptables et accords contractuels inter-marques à formaliser).
- **PRIORITÉ** : **P3 (Évolution stratégique)**.

---

### Proposition 10 : Portefeuille de Micro-Épargne Gaz ("Tontine Gaz")
- **PROBLÈME** : Le coût de la première bouteille (consigne + charge initiale pouvant dépasser 25 000 FCFA) représente un investissement lourd pour les ménages à revenu modeste qui se rabattent sur le charbon de bois toxique.
- **SOLUTION** : Possibilité d'épargner par petits montants (500 ou 1 000 FCFA par Mobile Money sans frais) sur un compte d'épargne dédié à l'acquisition d'un kit de gaz, selon le principe très populaire de la tontine camerounaise.
- **VALEUR** : Inclusion énergétique des foyers modestes, transition écologique du charbon de bois vers le GPL propre, création d'une base d'acheteurs captifs et reconnaissants.
- **COMPLEXITÉ** : **Moyenne** (compte de dépôt virtuel en monnaie électronique avec agrément financier ou partenariat bancaire).
- **PRIORITÉ** : **P3 (Phase Pilote)**.

---

### Proposition 11 : Tableau de Bord "Rentabilité & Caisse Quotidienne" pour le Distributeur
- **PROBLÈME** : Les petits gérants de dépôts de gaz ont souvent des difficultés de gestion de trésorerie et mélangent la caisse du gaz avec d'autres produits de quincaillerie ou dépenses personnelles.
- **SOLUTION** : Sur l'espace distributeur, un onglet simplifié "Ma Caisse du Jour" affiche en gros chiffres : Bouteilles vendues (comptoir vs livraison), Total espèces encaissées, Total Mobile Money, Bénéfice net estimé de la journée, et rappel du stock restant pour la commande fournisseur.
- **VALEUR** : Fidélisation absolue des distributeurs qui trouvent dans PLEINGAZ un outil gratuit de gestion de leur commerce bien plus performant que leur cahier papier.
- **COMPLEXITÉ** : **Faible à Moyenne** (requêtes d'agrégation légères sur les transactions du jour).
- **PRIORITÉ** : **P2 (Pilote)**.

---

### Proposition 12 : Double Confirmation Vocale pour Livreurs Analphabètes ou en Conduite
- **PROBLÈME** : Sur sa moto, le livreur ne peut pas taper facilement de longs textes sur son écran et certains conducteurs ont un niveau de lecture limité.
- **SOLUTION** : Validation par appui long (2 secondes) avec signal sonore fort et synthèse vocale de confirmation : *"Course validée. 1 000 FCFA ajoutés à votre solde"*.
- **VALEUR** : Ergonomie adaptée à la conduite de deux-roues, sécurité routière et inclusivité pour tous les conducteurs de la flotte.
- **COMPLEXITÉ** : **Faible** (Web Audio API et événement tactiles `touchstart`/`touchend`).
- **PRIORITÉ** : **P2 (Pilote)**.

---

### Proposition 13 : Badge de Transparence Écologique "Foyer Zéro Charbon"
- **PROBLÈME** : L'impact environnemental de la déforestation liée au charbon de bois n'est pas matérialisé pour les ménages urbains.
- **SOLUTION** : Sur l'espace acheteur, un petit badge valorisant : *"Grâce à vos commandes de gaz GPL sur PLEINGAZ, vous avez évité l'abattage de X arbres ce mois-ci"*.
- **VALEUR** : Fierté d'usage, partage valorisant sur les statuts WhatsApp et sensibilisation positive à la transition énergétique.
- **COMPLEXITÉ** : **Très faible** (calcul mathématique direct basé sur le nombre de kg de gaz consommés).
- **PRIORITÉ** : **P2 (Post-MVP)**.

---

### Proposition 14 : Système d'Alerte "Prix Officiel Garanti" Anti-Spéculation
- **PROBLÈME** : Lors des tensions sur le marché international ou national, certains revendeurs véreux tentent de vendre la bouteille de 12.5 kg à 8 000 ou 10 000 FCFA au lieu du prix officiel homologué (6 500 FCFA).
- **SOLUTION** : Affichage permanent d'un label dynamique certifié par PLEINGAZ : *"Prix officiel Ministère du Commerce : 6 500 FCFA. Tout distributeur sur PLEINGAZ s'engage contractuellement à ce tarif. Signaler un abus en 1 clic"*.
- **VALEUR** : Défense du pouvoir d'achat des consommateurs, rassurance citoyenne et positionnement de PLEINGAZ comme garant de l'éthique commerciale.
- **COMPLEXITÉ** : **Très faible** (paramètre `Setting` modifiable par le SUPER_ADMIN).
- **PRIORITÉ** : **P1 (MVP immédiat)**.
