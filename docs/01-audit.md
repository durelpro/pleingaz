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
- **Composants d'action** : Boutons "Discover our offers", barre de recherche, et liens flottants vers les réseaux sociaux.

**Performance (PageSpeed Insights, 4 Oct 2026, Lighthouse 13.5.0) :**
- **Mobile** (Émulation Moto G Power, Slow 4G) :
  - **Scores** : Performance 84, Accessibilité 76, Best Practices 100, SEO 83.
  - **Métriques** : LCP mesuré à 3.6 s (le seuil recommandé pour un bon LCP est inférieur à 2.5 s), FCP 3.0 s, TBT 0 ms, Speed Index 3.6 s, CLS 0.
- **Desktop** :
  - **Scores** : Performance 93, Accessibilité 76, Best Practices 100, SEO 83.
  - **Métriques** : LCP 1.2 s, FCP 1.1 s, TBT 0 ms, Speed Index 1.6 s, CLS 0.002.

**SEO et Crawling :**
- **Robots.txt et Sitemap.xml** : Il est confirmé via requêtes HTTP que ces fichiers renvoient le code HTML de la page d'accueil (HTTP 200). Le routage statique Nginx est mal configuré.

**Données NON VÉRIFIÉES, À CONFIRMER avec PLEINGAZ :**
- **Catalogue et Prix** : Les prix, horaires et fiches produits détaillées n'étaient pas visibles sur les captures fournies. Toute donnée issue de l'audit préliminaire reste "NON VÉRIFIÉ, À CONFIRMER avec PLEINGAZ". *Interdiction de les utiliser dans le code, les seeds ou les données de démonstration tant qu'ils ne sont pas confirmés.*
- **Distributeurs et Carte** : Aucun point de vente ou carte (Leaflet/Maps) n'est visible.
- **Infrastructure** : Hébergeur, pipeline de déploiement (CI/CD) et Analytics inaccessibles sans accès au backend.

## 2. CORRECTIFS RAPIDES SUR L'EXISTANT
*Ces correctifs peuvent être appliqués immédiatement, indépendamment de toute refonte d'architecture :*
- **Routage Nginx** : Corriger la configuration Nginx pour renvoyer un véritable HTTP 404 (ou les bons fichiers) sur `/robots.txt` et `/sitemap.xml`, au lieu d'une redirection "catch-all" vers l'accueil.
- **Accessibilité visuelle** : Corriger les ratios de contraste des textes sur fond rouge/orange signalés par Lighthouse pour améliorer le score d'accessibilité (actuellement à 76).
- **Balises Meta manquantes** : Ajouter au moins une balise `<meta name="description">` globale dans le `index.html` existant pour résoudre l'alerte SEO de base de Lighthouse.

## 3. RECOMMANDÉ (Propositions architecturales)
- **Migration vers Next.js** : Passer au Server-Side Rendering (SSR) pour permettre le rendu serveur des pages dynamiques publiques et des pages locales de points de vente.
- **Amélioration de l'Accessibilité (a11y)** : Structurer la hiérarchie des titres (H1, H2) et revoir les cibles tactiles.
- **Hébergement et CDN** : Mise en place de Cloudflare pour rapprocher les ressources et optimiser le LCP mobile depuis le Cameroun.

---

## 4. Matrice "À conserver / À moderniser / À remplacer" (Règle R3)

| Élément | Statut de l'audit | Décision (R3) | Justification |
|---|---|---|---|
| SPA React + Vite | CONFIRMÉ | À remplacer | L'architecture SPA pure ne permet pas un SEO local dynamique efficace (rendu serveur nécessaire par ville/distributeur). |
| Routage Nginx (robots) | CONFIRMÉ | À moderniser | Doit faire l'objet d'un correctif rapide indépendant de la refonte. |
| Identité, Menu, Slogan | CONFIRMÉ | À conserver | L'identité rouge/orange et le menu complet reflètent un contenu riche à migrer tel quel. |
| Performance Mobile | CONFIRMÉ | À moderniser | LCP mesuré à 3.6s en 4G lente. Un passage sous les 2.5s recommandés est à cibler. |
| Carte des distributeurs | NON VÉRIFIABLE | À moderniser | Toute carte devra s'appuyer sur une solution robuste (Leaflet/PostGIS). |
