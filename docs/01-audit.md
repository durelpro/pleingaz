# Audit Technique et Fonctionnel – Phase 0

## 1. CONSTATÉ (Observations réelles et factuelles)

*Suite à l'exploration passive de `https://www.monpleingaz.com/` et l'analyse des mesures PageSpeed (captures fournies)*

**Architecture et Hébergement :**
- L'application est une **SPA React générée via Vite** (confirmé par le code source HTML, `<div id="root"></div>`, le chargement de modules `type="module"` et les licences React dans `/assets/index-CGpd8iEH.js`).
- Le serveur web en façade est **Nginx** avec un système de proxy/cache (`x-proxy-cache-info: DT:1`).
- HTTP/2 est supporté.

**UI/UX, Composants et Contenus (d'après les captures PageSpeed de l'accueil) :**
- **Couleurs & Identité** : Dominante rouge et orange (dégradés). Le logo "PLEINGAZ" est accompagné du slogan "Bouteilles toujours pleines" (ou "Always Full Cylinders").
- **Bilinguisme** : Un sélecteur de langue (FR/EN) est présent. La page d'accueil affiche des textes bilingues (ex: menu "Français", mais texte "Always Full Cylinders").
- **Navigation** : Le menu desktop contient : Home, About, Products, Services, Contact, FAQ, Blog, et un bouton "Your review".
- **Composants d'action** : Boutons "Discover our offers", barre de recherche, et liens flottants vers les réseaux sociaux (Facebook, Instagram, LinkedIn).

**Performance (PageSpeed Insights, 4 Oct 2026, Lighthouse 13.5.0) :**
- **Mobile** (Émulation Moto G Power, Slow 4G) :
  - **Scores** : Performance 84, Accessibilité 76, Best Practices 100, SEO 83.
  - **Métriques** : LCP 3.6 s, FCP 3.0 s, TBT 0 ms, Speed Index 3.6 s, CLS 0.
- **Desktop** :
  - **Scores** : Performance 93, Accessibilité 76, Best Practices 100, SEO 83.
  - **Métriques** : LCP 1.2 s, FCP 1.1 s, TBT 0 ms, Speed Index 1.6 s, CLS 0.002.
  - *Note : L'accessibilité (76) et le SEO (83) sont perfectibles (contraste, balises meta description manquantes, erreurs robots.txt).*

**SEO et Crawling :**
- **Robots.txt et Sitemap.xml** : Il est confirmé via requêtes `curl` (et signalé par l'audit SEO de Lighthouse) que ces fichiers renvoient le code HTML de la page d'accueil (HTTP 200). Le routage statique Nginx est mal configuré.

**Données NON VÉRIFIABLES :**
- **Catalogue et Prix** : Les prix, horaires et fiches produits détaillées n'étaient pas visibles sur les captures d'accueil fournies. Ces données restent à confirmer.
- **Distributeurs et Carte** : Aucune carte Leaflet ou répertoire de points de vente n'est visible sur les captures de l'accueil.
- **Hébergeur, CI/CD et Analytics** : Impossible d'identifier l'hébergeur physique exact, la pipeline de déploiement, ou les outils statistiques en place sans un accès au backend/serveur.

## 2. RECOMMANDÉ (Propositions architecturales)

- **Correction immédiate du routage Nginx** : Servir de vrais fichiers 404 pour les ressources inexistantes (robots, sitemap) afin de nettoyer l'indexation par les moteurs de recherche.
- **Migration vers Next.js** : La SPA Vite pénalise le SEO (score de 83, metas manquantes). Next.js permettra un Server-Side Rendering (SSR) essentiel pour que chaque produit ou distributeur ait une meta description propre.
- **Amélioration de l'Accessibilité (a11y)** : Corriger les contrastes des textes sur les fonds rouge/orange et structurer la hiérarchie des titres (H1, H2) pour remonter le score de 76 à >90.
- **Hébergement et CDN** : Mise en place de Cloudflare avec des règles strictes de cache (pages publiques en cache, API exclue) pour améliorer le LCP mobile au Cameroun (actuellement à 3.6s en 4G).

## 3. À CONFIRMER (Validation par PLEINGAZ)

- Accès au code source complet pour vérifier les composants internes.
- Prix exacts des produits, tarifs de livraison et politiques de consigne.
- Liste des outils statistiques et pipelines CI/CD existants.

---

## 4. Matrice "À conserver / À moderniser / À remplacer" (Règle R3)

| Élément | Statut de l'audit | Décision (R3) | Justification |
|---|---|---|---|
| SPA React + Vite | CONFIRMÉ | À remplacer | L'architecture SPA montre ses limites SEO (robots.txt invalide, metas manquantes, score SEO 83). Le SSR de Next.js est requis pour le SEO local. |
| Routage Nginx | CONFIRMÉ | À moderniser | La redirection sauvage de `robots.txt` vers l'accueil doit être corrigée par un routage backend standard. |
| Identité, Textes, Menu (FAQ, Blog) | CONFIRMÉ | À conserver | Le rouge/orange, le slogan, et le menu complet (About, Products, FAQ) prouvent l'existence d'un contenu riche qu'il faut impérativement migrer tel quel. |
| Performance Mobile (LCP 3.6s) | CONFIRMÉ | À moderniser | Le LCP de 3.6s en 4G bridée est correct mais peut être ramené sous 2.5s avec Next.js Image Optimization et le CDN. |
| Carte des distributeurs | NON VÉRIFIABLE | À moderniser | (Supposition basée sur le projet cible) Toute carte existante devra passer sur une solution robuste (Leaflet/PostGIS) pour la montée en charge. |
| Accessibilité (Score 76) | CONFIRMÉ | À moderniser | Le design devra intégrer des contrastes WCAG valides et des cibles tactiles plus larges. |
