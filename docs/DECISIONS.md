# Journal des décisions d'architecture (ADR)

## ADR D1 : Architecture Frontend (Migration Next.js vs Vite)
- **Statut** : PROPOSÉ
- **Options comparées** :
  1. Conservation de Vite (SPA) avec pré-rendu (SSG).
  2. Migration progressive vers Next.js (App Router).
- **Recommandation** : **Migration vers Next.js (App Router)**.
- **Justification** : L'audit PageSpeed révèle un score SEO perfectible (83) et de graves erreurs de crawling (`robots.txt` renvoyant l'accueil). Le SEO local (par ville et par distributeur) étant crucial, Next.js permet le rendu côté serveur (SSR) et la génération native des balises meta dynamiques. Cela corrigera d'emblée l'indexation sans recourir à des hacks de pré-rendu en SPA.

## ADR D2 : Stratégie d'hébergement et CDN
- **Statut** : PROPOSÉ
- **Options comparées** :
  1. Hébergement cloud régional (ex. Afrique du Sud) direct.
  2. VPS en Europe + CDN Cloudflare.
- **Recommandation** : **VPS Européen + Cloudflare (Offre Gratuite / Pro)**.
- **Justification** : L'audit montre un LCP mobile de 3.6s en réseau bridé (Cameroun). Cloudflare permettra de rapprocher les ressources statiques via ses PoP locaux, réduisant le LCP sous les 2.5s recommandés. Seules les requêtes API (stock, paiement) toucheront le VPS.

## ADR D3 : Cartographie, Tuiles et Géocodage
- **Statut** : PROPOSÉ
- **Options comparées** :
  1. Utilisation de Google Maps.
  2. Utilisation du serveur public OpenStreetMap via Nominatim.
  3. Base PostGIS + Leaflet + Cache du géocodage backend.
- **Recommandation** : **PostGIS + Leaflet (Backend)** avec serveur de tuiles OSM public (sous réserve de trafic) évoluant vers un fournisseur commercial, et **géocodage Nominatim bridé**.
- **Justification** : Les conditions d'OSM/Nominatim interdisent le trafic massif commercial direct depuis le front-end. Le backend appellera Nominatim avec limitation (1 req/sec) lors de la *création* de boutique. En secours, l'application affichera une "liste" au lieu d'une carte lourde.

## ADR D4 : Intégration des Paiements Mobile Money (Cameroun)
- **Statut** : PROPOSÉ
- **Options comparées** :
  1. Intégration directe via les API MTN MoMo et Orange Money séparées.
  2. Utilisation d'un agrégateur de paiement local (ex: Campay, NotchPay, CinetPay).
- **Recommandation** : **Utilisation d'un agrégateur**.
- **Justification** : La maintenance de multiples API directes et la réconciliation manuelle sont complexes. Un agrégateur offre une interface unifiée, une sandbox fiable, et gère les webhooks d'échec de manière standardisée. (À confirmer avec l'entreprise en fonction des coûts de commission).
