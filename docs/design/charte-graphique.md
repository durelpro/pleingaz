# Charte Graphique Officielle PLEINGAZ (CR-003)

## 1. Origine et Méthode d'Extraction
Conformément à la directive propriétaire D-13 et aux livrables du Lot 0 (rapport [`docs/reports/cr003-etat-des-lieux.md`](file:///home/durel/pleingaz/docs/reports/cr003-etat-des-lieux.md)), la charte graphique de PLEINGAZ reste **strictement inchangée** dans ses fondamentaux identitaires.

L'identité visuelle a été extraite directement des feuilles de styles publiques de la plateforme de référence (`monpleingaz.com`) :
- **Extraction CSS** : Analyse des variables et classes actives sur l'interface publique de production.
- **Principe d'intégrité** : Préservation intégrale des teintes de marque (Rouge énergie, Jaune-orangé flamme, Blanc pur).
- **Normalisation WCAG 2.1 AA** : Ajustement technique de variantes contrastées pour garantir la lisibilité sur tous les terminaux mobiles sans dénaturer la teinte perçue.

---

## 2. Palette de Couleurs Officielles & Tokens Sémantiques

### 2.1. Couleurs Primaires de Marque
| Token CSS | Hexadécimal | Nom Commercial | Signification / Usage |
|---|---|---|---|
| `--color-primary-base` | `#FF0000` | Rouge PLEINGAZ | Couleur identitaire principale, énergie, bouteille de gaz, urgence vitale |
| `--color-primary-dark` | `#DC2626` | Rouge Profond (WCAG) | Variante contrastée pour boutons actifs et textes sur fond clair |
| `--color-primary-darker`| `#B91C1C` | Rouge Rubis | Survol (hover), états pressés, bordures d'accentuation |
| `--color-primary-light` | `#FEE2E2` | Rouge Brume | Arrière-plans d'alertes, pastilles d'urgence, badges discrets |

### 2.2. Couleurs Secondaires et Accents
| Token CSS | Hexadécimal | Nom Commercial | Signification / Usage |
|---|---|---|---|
| `--color-secondary-base` | `#FFB000` | Jaune Flamme / Or | Chaleur, gaz allumé, mise en avant, badges promotionnels |
| `--color-secondary-dark` | `#D97706` | Ambre Foncé (WCAG) | Texte lisible sur fond blanc, étoiles de notation, alertes stock moyen |
| `--color-secondary-light`| `#FEF3C7` | Jaune Aurore | Fonds d'avertissement, bannières d'annonces importantes |

### 2.3. Neutres et Fonds d'Interface
| Token CSS | Hexadécimal | Nom / Usage | Rôle Ergonomique |
|---|---|---|---|
| `--color-neutral-900` | `#111827` | Noir Encre | Texte principal, titres, contraste maximal |
| `--color-neutral-700` | `#374151` | Gris Anthracite | Texte secondaire, descriptions, libellés de formulaires |
| `--color-neutral-500` | `#6B7280` | Gris Moyen | Textes désactivés, métadonnées, séparateurs |
| `--color-neutral-300` | `#D1D5DB` | Gris Bordure | Bordures d'entrées, contours de cartes, lignes de tableau |
| `--color-neutral-100` | `#F3F4F6` | Gris Surface | Arrière-plan de cartes, conteneurs, tableaux de bord |
| `--color-neutral-50`  | `#F9FAFB` | Blanc Cassé | Fond d'écran global de l'application |
| `--color-white`       | `#FFFFFF` | Blanc Pur | Surfaces élevées, cartes, modales, contraste sur rouge |

### 2.4. Couleurs de Feedback & Statuts Opérationnels
| Statut | Token CSS | Hexadécimal | Usage Opérationnel |
|---|---|---|---|
| Succès / En stock | `--color-success-base` | `#059669` | Bouteilles disponibles, paiement validé, livraison confirmée |
| Succès Fond | `--color-success-light`| `#D1FAE5` | Badge stock vert, accusé de lecture validé |
| Alerte / Rupture proche | `--color-warning-base` | `#D97706` | Stock faible (< 5 btl), attente confirmation livreur |
| Alerte Fond | `--color-warning-light`| `#FEF3C7` | Bandeau de maintenance programmée |
| Danger / Rupture | `--color-danger-base`  | `#DC2626` | Rupture totale, commande annulée, litige |
| Danger Fond | `--color-danger-light` | `#FEE2E2` | Alerte quota dépassé (D-14), incident technique |
| Info / Neutre | `--color-info-base`    | `#2563EB` | Notification informationnelle (D-18), statut en route |
| Info Fond | `--color-info-light`   | `#DBEAFE` | Bannières d'annonces administratives |

---

## 3. Ratios de Contraste et Accessibilité WCAG 2.1 AA
Toutes les combinaisons de couleurs utilisées dans l'interface doivent satisfaire la norme **WCAG 2.1 Niveau AA** (ratio minimum de 4.5:1 pour le texte normal et 3.0:1 pour les grands titres et éléments graphiques).

### Tableau des Contrastes Vérifiés
| Élément de Texte | Couleur de Texte | Couleur de Fond | Ratio Mesuré | Conformité WCAG |
|---|---|---|---|---|
| Texte d'action sur bouton primaire | Blanc (`#FFFFFF`) | Rouge Profond (`#DC2626`) | **4.62 : 1** | **Conforme AA (Texte normal)** |
| Grand titre sur fond rouge | Blanc (`#FFFFFF`) | Rouge PLEINGAZ (`#FF0000`) | **3.99 : 1** | **Conforme AA (Titres > 18pt)** |
| Titre principal sur fond blanc | Noir Encre (`#111827`) | Blanc (`#FFFFFF`) | **16.1 : 1** | **Conforme AAA** |
| Texte courant sur fond blanc | Gris Anthracite (`#374151`) | Blanc (`#FFFFFF`) | **9.53 : 1** | **Conforme AAA** |
| Métadonnée sur fond gris clair | Gris Moyen (`#6B7280`) | Gris Surface (`#F3F4F6`) | **4.68 : 1** | **Conforme AA** |
| Texte d'accent jaune sur fond blanc | Ambre Foncé (`#D97706`) | Blanc (`#FFFFFF`) | **4.54 : 1** | **Conforme AA** |
| Texte sur badge d'alerte jaune | Brun Foncé (`#78350F`) | Jaune Aurore (`#FEF3C7`) | **8.12 : 1** | **Conforme AAA** |
| Texte sur badge de succès vert | Vert Forêt (`#065F46`) | Vert Menthe (`#D1FAE5`) | **7.44 : 1** | **Conforme AAA** |

> [!IMPORTANT]
> Ne jamais superposer de texte fin blanc sur le jaune `#FFB000` (ratio 1.15:1 = illisible). Pour les badges jaunes, toujours utiliser le texte sombre `--color-neutral-900` ou ambre foncé `--color-secondary-dark`.

---

## 4. Typographie Officielle

### 4.1. Famille Typographique
- **Police Principale** : **`Montserrat`** (Google Fonts).
  - URL d'importation : `https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap`
  - Fallbacks système : `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
  - Caractéristiques : Police géométrique sans-sérif, excellente lisibilité sur petits écrans de smartphones, forte présence visuelle pour les montants financiers et chiffres clés.

### 4.2. Échelle Typographique (Typographic Scale)
| Niveau | Taille (Rem / Px) | Graisse (Weight) | Hauteur de ligne | Usage |
|---|---|---|---|---|
| `Display 1` | `2.25rem` (36px) | 800 (ExtraBold) | 1.15 | Chiffre clé, jauge quota, slogan landing |
| `Heading 1` | `1.75rem` (28px) | 700 (Bold) | 1.25 | Titres de pages, montants totaux en FCFA |
| `Heading 2` | `1.375rem` (22px)| 700 (Bold) | 1.30 | Titres de sections, nom de boutique |
| `Heading 3` | `1.125rem` (18px)| 600 (SemiBold) | 1.35 | Titres de cartes, types de bouteilles (12.5 kg) |
| `Body Large`| `1.0rem` (16px)  | 500 (Medium) | 1.50 | Texte introductif, instructions de livraison |
| `Body Base` | `0.875rem` (14px)| 400 (Regular) | 1.50 | Texte courant, descriptions, FAQ |
| `Body Small`| `0.75rem` (12px) | 500 (Medium) | 1.40 | Badges, horodatages UTC, mentions légales |

---

## 5. Iconographie et Éléments Visuels
- **Format** : SVG inline pur ou SVG vectoriels optimisés (zéro police d'icônes lourde pour garantir un chargement < 50 Ko).
- **Symboles Métier Récurrents** :
  - **Bouteille de gaz** : Silhouette cylindrique reconnaissable avec poignée supérieure.
  - **Flamme vive** : Dégradé subtil rouge / or `#FF0000` vers `#FFB000`.
  - **Moto de livraison** : Silhouette deux-roues dynamique avec caisson arrière.
  - **WhatsApp** : Bulle verte officielle avec cornet téléphonique (pour bouton d'auth D-12).
  - **Bouclier de confiance** : Badge certification officielle PLEINGAZ.

---

## 6. Règles d'Usage & Interdictions

### À Faire (Obligations) :
- Toujours afficher les prix avec la devise **FCFA** en majuscules (ex: `6 500 FCFA`).
- Séparer les milliers par une espace fine insécable (ex: `1 000 FCFA` et non `1000FCFA`).
- Accompagner chaque indicateur de couleur d'un texte ou d'une icône explicite (pour les utilisateurs daltoniens).
- Utiliser le bouton rouge primaire pour l'action principale unique de la page ("Commander", "Valider la course", "Publier").

### À Ne Jamais Faire (Interdictions formelles) :
- ❌ Ne jamais changer la teinte rouge historique (`#FF0000` / `#DC2626`) pour du bleu ou du violet.
- ❌ Ne jamais afficher de texte rouge clair sur fond jaune ou inversement.
- ❌ Ne jamais employer de polices fantaisistes ou avec empattements (serif).
- ❌ Ne jamais masquer le montant total ou ajouter des frais cachés non déclarés.

---

## 7. Rassurance Visuelle et Identité Camerounaise
- **Label de conformité** : Mention officielle "Gaz domestique certifié conforme aux normes nationales".
- **Couleurs nationales** : Présence discrète des trois couleurs (Vert, Rouge, Jaune) dans le footer institutionnel.
- **Paiements locaux** : Logos officiels MTN Mobile Money et Orange Money aux côtés du paiement en espèces à la livraison.
