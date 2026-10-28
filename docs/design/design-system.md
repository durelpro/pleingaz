# Design System PLEINGAZ (CR-003)

## 1. Direction Créative & Principes Directeurs

Le design system de PLEINGAZ est conçu selon 5 principes cardinaux adaptés à la réalité d'usage au Cameroun :

1. **Ultra Mobile-First & Low-Bandwidth** : 
   - L'application est consultée majoritairement sur smartphone Android 4G/3G.
   - Poids des pages ultra-léger (< 50 Ko hors images), chargement instantané, zéro framework JavaScript lourd sur les vues publiques et les prototypes.
2. **Accessibilité Cognitive & Visuelle Maximale** :
   - Parcours compréhensibles par tous, y compris les utilisateurs peu à l'aise avec le numérique.
   - Contrastes conformes WCAG AA, tailles de zones tactiles généreuses (minimum 48×48 px pour tous les boutons interactifs).
3. **Clarté Opérationnelle & Traçabilité (D-11 à D-18)** :
   - Chaque profil dispose de son espace propre, épuré, centré sur ses actions quotidiennes sans distraction.
   - La jauge de quota (D-14), la double confirmation (D-17) et le Maker-Checker (D-15/D-18) sont intégrés nativement sous forme d'éléments visuels compréhensibles en un coup d'œil.
4. **Fidélité à l'Identité Historique (D-13)** :
   - Utilisation magistrale du Rouge PLEINGAZ (`#FF0000` / `#DC2626`) et du Jaune Flamme (`#FFB000`) sur fond clair reposant (`#F9FAFB`), typographie Montserrat audacieuse.
5. **Rassurance et Confiance Immédiate** :
   - Affichage transparent des prix officiels homologués, géolocalisation claire, mentions de sécurité et conformité légale.

---

## 2. Tokens de Design (Variables CSS Normalisées)

Ces variables constituent le socle technique unique partagé par tous les composants et prototypes :

```css
:root {
  /* Couleurs de Marque */
  --color-primary: #dc2626;         /* Rouge vibrant conforme AA */
  --color-primary-raw: #ff0000;     /* Rouge historique de marque */
  --color-primary-hover: #b91c1c;   /* Rouge foncé au clic */
  --color-primary-light: #fee2e2;   /* Fond rouge pastel */
  
  --color-secondary: #ffb000;       /* Jaune flamme PLEINGAZ */
  --color-secondary-dark: #d97706;  /* Ambre contrasté pour texte */
  --color-secondary-light: #fef3c7; /* Fond jaune pastel */

  /* Nuances de Neutres */
  --color-bg-body: #f9fafb;         /* Fond principal de l'application */
  --color-bg-surface: #ffffff;      /* Surface des cartes et modales */
  --color-bg-subtle: #f3f4f6;       /* Fond de conteneurs secondaires */
  --color-border: #e5e7eb;          /* Bordures standard */
  --color-border-focus: #dc2626;    /* Bordure focus champ actif */
  
  --color-text-main: #111827;       /* Texte haute visibilité */
  --color-text-muted: #4b5563;      /* Descriptions et libellés */
  --color-text-subtle: #9ca3af;     /* Textes tertiaires et désactivés */
  --color-text-white: #ffffff;      /* Texte blanc sur fond sombre */

  /* Statuts Métier */
  --color-status-success: #059669;
  --color-status-success-bg: #d1fae5;
  --color-status-warning: #d97706;
  --color-status-warning-bg: #fef3c7;
  --color-status-danger: #dc2626;
  --color-status-danger-bg: #fee2e2;
  --color-status-info: #2563eb;
  --color-status-info-bg: #dbeafe;

  /* Typographie */
  --font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Espacements (Système basé sur un pas de 4px) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Rayons de Courbure (Border Radius) */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Ombres Portées (Elevations) */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 3. Composants d'Interface Atomiques & Moléculaires

### 3.1. Boutons (`Button`)
Tous les boutons interactifs ont une hauteur minimale de **48 px** pour être cliquables sans erreur au pouce sur mobile.

- **Bouton Primaire (`.btn-primary`)** :
  - Fond : `--color-primary` (`#DC2626`), texte `--color-text-white`, gras 600, bordure 0.
  - Usage : Action principale par écran ("Commander ma recharge", "Accepter la course", "Valider").
- **Bouton WhatsApp Entrant (`.btn-whatsapp` - D-12)** :
  - Fond : `#25D366` (Vert officiel WhatsApp), icône bulle WhatsApp blanche, texte blanc 600.
  - Action : Ouvre le lien `https://wa.me/<E164>?text=...` pour envoyer le défi chiffré en 1 clic.
- **Bouton Secondaire Contour (`.btn-secondary`)** :
  - Fond : transparent, bordure 2px `--color-border`, texte `--color-text-main`.
  - Usage : Actions secondaires ("Historique", "Annuler", "Détails").
- **Bouton Danger (`.btn-danger`)** :
  - Fond : `--color-primary-light`, texte `--color-primary`, bordure 1px `--color-primary`.
  - Usage : Refus de mission, signalement d'incident, clôture de dossier.

### 3.2. Jauge Visuelle de Quota Acheteur (`QuotaGauge` - D-14)
Conformément à la décision souveraine D-14, l'espace acheteur comporte obligatoirement une jauge très claire indiquant le volume consommé sur les 30 derniers jours (maximum 5 bouteilles pour les particuliers).

- **Structure visuelle** :
  - Barre de progression horizontale segmentée en 5 crans distincts (représentant chacun 1 bouteille).
  - Pastilles numérotées de 1 à 5.
- **États de la Jauge** :
  - **1 à 3 bouteilles (Vert - Normal)** : Barre verte `--color-status-success`. Libellé : `X / 5 bouteilles commandées (Quota disponible)`.
  - **4 bouteilles (Ambre - Attention)** : Barre jaune `--color-status-warning`. Libellé : `4 / 5 bouteilles (Dernière commande autorisée ce mois)`.
  - **5 bouteilles (Rouge - Plafond atteint)** : Barre rouge `--color-status-danger`. Libellé : `Plafond atteint (5/5). Prochaine recharge autorisée le [Date]`. Bouton de commande désactivé avec mention explicite.

### 3.3. Carte de Bouteille de Gaz (`GasBottleCard`)
Carte de sélection de produit avec prix officiel, marque et disponibilité en stock :
- Illustration vectorielle de la bouteille avec couleur officielle de la marque (Tradex, TotalEnergies, Camgaz, SCTM, etc.).
- Capacité en gros caractères (ex: `12.5 kg`).
- Prix officiel homologué bien visible (ex: `6 500 FCFA`).
- Badge de stock en temps réel ("En stock : 14 disponibles" / "Rupture temporaire").
- Sélecteur de type d'achat : Recharge seule (échange de bouteille vide) vs Consigne + Recharge (nouvelle bouteille).

### 3.4. Bloc de Double Confirmation de Livraison (`DoubleConfirmationCard` - D-17)
Composant interactif présent sur l'espace acheteur et sur l'interface livreur :
- **Vue Livreur** :
  - Bouton vert pleine largeur : `[ 📦 J'ai remis la bouteille au client ]`
  - Horodatage certifié dès le clic (`livreurConfirmedAt`).
  - Statut : `En attente de confirmation du client`.
- **Vue Acheteur** :
  - Notification en temps réel : `Le livreur signale que votre bouteille est livrée`.
  - Deux choix clairs :
    - Bouton vert : `[ ✅ J'ai bien reçu ma bouteille ]` -> Valide définitivement la transaction (`DELIVERED`).
    - Bouton contour rouge : `[ ⚠️ Je n'ai rien reçu / Signaler un problème ]` -> Ouvre un signalement d'incident immédiat.

### 3.5. Pavé de Connexion WhatsApp Épuré (`AuthChallengePad` - D-12)
- Étape 1 : Saisie des 2 numéros obligatoires (`Numéro WhatsApp` + `Numéro d'appel pour la livraison`).
- Étape 2 : Bouton `Envoyer mon code par WhatsApp` (génère le lien direct vers le numéro officiel PLEINGAZ).
- Étape 3 : Saisie manuelle de secours si l'utilisateur saisit le code à 6 chiffres reçu : 6 cases de saisie séparées à focus automatique.

### 3.6. Composant Bannières d'Information Ciblées (`InfoNoticeBanner` - D-18)
- Bandeau déployé en haut de tableau de bord selon le profil connecté.
- Type d'information : Sécurité, Approvisionnement, Maintenance.
- Bouton interactif obligatoire : `[ J'ai compris ]` pour acquitter la lecture et libérer l'espace visuel (génère l'enregistrement d'accusé de lecture `InfoNoticeRead`).

---

## 4. États Vides (Empty States) & Chargement

### 4.1. Principes des États Vides
Chaque tableau ou liste vide (aucune commande en cours, zéro mission livreur, aucun dossier support) comporte systématiquement :
- Une illustration vectorielle SVG discrète et thématique.
- Un titre court et rassurant (ex: "Aucune commande en cours").
- Une explication claire (ex: "Vos prochaines recharges de gaz apparaîtront ici").
- Un bouton d'action contextuel clair (ex: "Commander du gaz maintenant").

### 4.2. États de Chargement (Skeletons)
- Utilisation de squelettes animés en CSS pur (dégradé linéaire pulsant) pour simuler le chargement des cartes de stock et de statistiques.
- Aucun spinner bloquant toute la page : chargement progressif garantissant une impression de fluidité immédiate.

---

## 5. Micro-Interactions & Retours Tactiles

- **Feedback de clic** : Effet de légère compression tactile (`transform: scale(0.98)`) au clic sur mobile.
- **Transition d'onglets** : Transition douce d'opacité (`opacity: 0 -> 1` en 150ms) sans rechargement de page perceptible.
- **Indicateurs de succès** : Animation subtile de coche verte lors de la confirmation d'une commande ou de l'acquittement d'une information.
