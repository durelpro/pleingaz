# Plan de Test d'Utilisabilité PLEINGAZ (CR-003)

## 1. Objectifs & Méthodologie

Le présent plan de test vise à évaluer scientifiquement l'ergonomie, la simplicité et l'accessibilité cognitive de la plateforme PLEINGAZ sur smartphone dans des conditions réelles d'usage au Cameroun.

### Objectifs Clés :
- **Autonomie complète** : L'utilisateur doit pouvoir réaliser l'action principale de son profil sans aucune explication préalable ni assistance humaine.
- **Seuil de rapidité cible** : L'action clé (commander une bouteille pour l'acheteur, ajuster le stock pour le distributeur, confirmer la remise pour le livreur) doit être complétée en **moins de 60 secondes**.
- **Zéro blocage d'authentification** : Valider l'intuitivité du flux WhatsApp entrant (D-12) face à un public habitué à WhatsApp mais méfiant envers les formulaires web complexes.

---

## 2. Panel des Testeurs (Échantillon Représentatif)

Le test est conduit auprès d'un panel de **5 profils utilisateurs novices** recrutés à Douala et Yaoundé :

| ID | Profil Type | Contexte d'Usage & Équipement | Niveau d'Aisance Numérique |
|---|---|---|---|
| **T1** | **Ménagère (Douala, Bepanda)** | Smartphone Android 6.5 pouces, 3G/4G instable. Utilise WhatsApp quotidiennement, méfiante sur les saisies de cartes bancaires. | Débutant (WhatsApp uniquement) |
| **T2** | **Jeune Cadre (Yaoundé, Bastos)** | Smartphone moderne 4G rapide. Habitué aux commandes en ligne, recherche la vitesse maximale le soir après le travail. | Avancé |
| **T3** | **Gérant de Dépôt (Douala, Bonabéri)** | Commerçant indépendant tenant une quincaillerie/dépôt de gaz. Mains souvent occupées, écran parfois en plein soleil. | Intermédiaire (Mobile Money fréquent) |
| **T4** | **Conducteur Mototaxi (Douala, Ndokoti)** | Smartphone d'entrée de gamme, support guidon moto, utilisation en extérieur avec reflets et bruit ambiant. | Débutant / Pratique |
| **T5** | **Gérante de Restaurant (Yaoundé, Mokolo)** | Commande plusieurs bouteilles par mois, sensible aux ruptures de gaz pendant le service et aux délais de livraison. | Intermédiaire |

---

## 3. Scénarios de Test Chronométrés

Chaque testeur exécute son scénario en observant le protocole du "penser tout haut" (*think aloud protocol*), sans intervention de l'évaluateur sauf en cas d'abandon explicite.

### Scénario A : Inscription & Connexion par WhatsApp (Profil Acheteur - T1 & T2)
- **Consigne** : *"Vous arrivez sur PLEINGAZ pour la première fois. Connectez-vous avec votre numéro WhatsApp pour accéder à votre espace."*
- **Chemin nominal** : Clic sur `Connexion WhatsApp` -> Saisie du numéro WhatsApp et du numéro d'appel -> Clic sur `Envoyer mon code sur WhatsApp` -> Validation du message dans WhatsApp -> Retour automatique sur le tableau de bord acheteur.
- **Seuil de succès** : < 45 secondes. Zéro saisie de mot de passe.

### Scénario B : Commande d'une Bouteille 12.5 kg en Express (Profil Acheteur - T1, T2 & T5)
- **Consigne** : *"Votre bouteille de gaz habituelle est vide. Commandez une recharge livrée à votre domicile avec paiement en espèces."*
- **Chemin nominal** : Tableau de bord acheteur -> Clic sur `Commander ma recharge` -> Choix de la bouteille 12.5 kg -> Validation du repère de quartier (ou saisie rapide) -> Sélection de l'option livraison standard (1 000 FCFA) -> Confirmation finale.
- **Seuil de succès** : < 60 secondes. Vérification que la jauge de quota (D-14) est perçue et comprise.

### Scénario C : Mise à Jour du Stock en Boutique en 1 Clic (Profil Distributeur - T3)
- **Consigne** : *"Vous venez de recevoir une livraison de 10 bouteilles de gaz Total 12.5 kg. Rendez-les disponibles immédiatement pour vos clients."*
- **Chemin nominal** : Espace distributeur -> Vue du stock -> Clic sur le bouton rapide `[ +10 ]` ou incrémentation sur la bouteille concernée -> Confirmation instantanée par toast vert.
- **Seuil de succès** : < 30 secondes.

### Scénario D : Prise en Charge d'une Course & Double Confirmation (Profil Livreur - T4)
- **Consigne** : *"Vous recevez une notification de mission de livraison de bouteille à 500m de votre position. Acceptez la course et confirmez la remise au client."*
- **Chemin nominal** : Espace livreur -> Carte de mission avec repère et tarif net (1 000 FCFA) -> Clic `Accepter la mission` -> Clic `Bouteille récupérée au dépôt` -> Clic `J'ai remis la bouteille au client`.
- **Seuil de succès** : < 45 secondes pour le cycle complet de notification à livraison.

---

## 4. Métriques Collectées & Critères d'Acceptation

Pour chaque tâche, l'observateur consigne de manière rigoureuse :

1. **Taux de Succès Direct (Completion Rate)** : Pourcentage de testeurs réalisant la tâche sans assistance (cible : **>= 90%**).
2. **Temps à la Tâche (Time on Task)** : Durée chronométrée entre le début de la consigne et le clic final de confirmation (cible : **< 60 secondes** sur toutes les tâches).
3. **Taux d'Erreur (Error Rate)** : Nombre de clics erronés ou retours arrière non voulus (cible : **<= 1 par parcours**).
4. **Compréhension des Notions Clés (Questionnaire Post-Test)** :
   - Quota 5 bouteilles : *"Avez-vous compris combien de bouteilles vous pouviez commander ce mois-ci ?"*
   - Double confirmation : *"Savez-vous qui doit confirmer la livraison pour qu'elle soit terminée ?"*
   - Tarifs : *"Combien coûte la livraison standard chez PLEINGAZ ?"*
5. **Score d'Utilisabilité SUS (System Usability Scale)** : 10 questions standardisées notées de 1 à 5, converties en score sur 100 (cible minimale : **>= 80 / 100**, correspondant au grade A "Excellente facilité d'usage").

---

## 5. Grille d'Analyse des Frictions & Plan de Remédiation

| Point de Friction Potentiel | Seuil d'Alerte | Mesure Corrective Immédiate |
|---|---|---|
| Hésitation sur les 2 numéros (WhatsApp vs Appel) | Plus de 10 secondes d'arrêt sur le formulaire | Ajouter un texte d'aide explicite sous chaque champ : *"Le numéro d'appel sert au livreur pour vous guider"*. |
| Confusion sur la jauge de quota (D-14) | Mauvaise interprétation du volume restant | Renforcer le libellé textuel au-dessus de la barre : *"Il vous reste X recharges disponibles ce mois-ci"*. |
| Oubli de la confirmation acheteur à la livraison (D-17) | Absence de validation de l'acheteur après le départ du livreur | Envoi d'une notification WhatsApp de rappel 5 minutes après le clic du livreur + rappel vocal si nécessaire. |
| Taille des boutons de stock sur mobile pour le distributeur | Mauvais clic sur le bouton voisin | Augmenter l'espacement et la surface tactile des touches `+` et `-` à minimum 52×52 px. |
