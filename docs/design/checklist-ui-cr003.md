# Checklist Design UI & Conformité Visuelle CR-003

## 1. Respect Strict de l'Identité Visuelle Existante (D-13 & R-02)

Cette checklist doit être validée pour chaque écran développé ou modifié dans les portails PLEINGAZ :

- [ ] **Palette de Marque Inviolable** :
  - Rouge PLEINGAZ principal : `#FF0000` (historique) / `#DC2626` (normalisé WCAG 2.1 AA pour textes & boutons d'action).
  - Jaune Flamme / Or : `#FFB000` (accents, chaleur, badges de mise en avant) / `#D97706` (variante contrastée sur fond clair).
  - Neutres reposants : Fond d'application `#F9FAFB`, surfaces de cartes `#FFFFFF`, textes sombres `#111827` (haute visibilité).
  - Statuts d'alerte : Succès `#059669`, Avertissement `#D97706`, Danger `#DC2626`, Info `#2563EB`.

- [ ] **Typographie et Hiérarchie Visuelle** :
  - Police officielle : `Montserrat`, sans-serif (titres audacieux en graisse 700/800, corps de texte lisible en graisse 400/500).
  - Pas d'ad-hoc styling : utilisation exclusive des tokens sémantiques définis dans [`docs/design/design-system.md`](file:///home/durel/pleingaz/docs/design/design-system.md).
  - Pas de texte de petite taille non lisible en extérieur (< 13px proscrit pour toute information métier clé).

- [ ] **Esthétique Moderne, Premium & Finition Soignée** :
  - **Glassmorphism Subtil** : Arrière-plans de navigation ou cartes d'état avec flou d'arrière-plan discret (`backdrop-filter: blur(8px); background: rgba(255, 255, 255, 0.85);` en mode clair, et `rgba(17, 24, 39, 0.85)` en mode sombre).
  - **Micro-Animations Réactives** :
    - Retour tactile actif sur tous les boutons (`transform: scale(0.98)`).
    - Transitions douces de 150ms à 250ms (`cubic-bezier(0.4, 0, 0.2, 1)`).
    - Animation fluide de progression pour la jauge de quota de bouteilles (D-14).
    - Animation de chargement douce (skeleton shimmer) sans blocage brutal de l'écran.
  - **Dark-Mode Cohérent** :
    - Déclinaison sombre élégante (`#0F172A` / `#1E293B`) préservant l'énergie des accents rouges et jaunes sans éblouissement, avec ratios WCAG 2.1 AA validés (minimum 4.5:1).

- [ ] **Ergonomie Mobile Cameroun (Low-Bandwidth & Tactile)** :
  - Hauteur de cible tactile minimale : 48px pour tous les éléments interactifs.
  - Poids des pages ultra-léger (< 50 Ko hors assets SVG optimisés).
  - Bouton WhatsApp officiel vert `#25D366` mis en valeur pour l'authentification entrante sans friction (D-12).

---

## 2. Étanchéité et Règle "Aucune Trace" (D-11 & C-06)

- [ ] **Espace Acheteur (`/acheteur`)** :
  - Aucune trace visuelle, aucun onglet, aucun bouton "Devenir Distributeur" ou "Postuler comme Livreur".
  - Pas de switch de profil ni de sélecteur de rôle dans le profil ou la barre de navigation.
  - Pas de fuite de rôles ou de drapeaux d'administration dans les payloads JSON.

- [ ] **Espace Distributeur (`/distributeur`)** :
  - Interface dédiée à la gestion des stocks qualitatifs (`BON`, `MOYEN`, `FAIBLE`, `RUPTURE`), aux commandes à préparer et au mode Vente au Comptoir (D-16).
  - Aucun lien vers l'espace Acheteur ou Livreur.

- [ ] **Espace Livreur (`/livreur`)** :
  - Interface mobile PWA légère dédiée aux missions, au solde de caisse espèces et à la double confirmation ("J'ai livré" D-17).
  - Zéro composant ou menu étranger à l'activité logistique.

- [ ] **Portail Staff (`<STAFF_PORTAL_ROUTE>`)** :
  - URL non référencée, absente des menus publics, du sitemap et de `robots.txt`.
  - Authentification renforcée (Mot de passe fort + TOTP obligatoire).
