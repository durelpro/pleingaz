PHASE 0. AUDIT RÉEL. N'écris aucune fonctionnalité.
Contexte : docs/00-sources/ contient un audit préliminaire (à vérifier, pas à croire aveuglément).
Tâches :
0.1 Naviguer sur https://www.monpleingaz.com/ (agent navigateur) : toutes les pages, FR et EN, mobile et desktop. Inventaire des pages, composants, formulaires, liens, textes, images.
0.2 Inspection technique : stack, build, hébergement/CDN si détectable, en-têtes de sécurité, SEO (titres, meta, sitemap, robots), poids des pages, Lighthouse mobile en connexion bridée.
0.3 Vérifier chaque affirmation de l'audit préliminaire : CONFIRMÉ / INFIRMÉ / NON VÉRIFIABLE.
0.4 Tableau "À conserver / À moderniser / À remplacer" avec justification (respect de R3).
0.5 ADR D1 : migration Next.js progressive vs Vite + pré-rendu. ADR D2 : hébergement (coût, latence depuis le Cameroun, support). ADR D3 : fournisseur de cartes/géocodage et conditions d'usage en production (ne pas supposer qu'un service public gratuit convient à une charge de production). ADR D4 : agrégateur ou accès direct MTN/Orange (à documenter, à confirmer avec l'entreprise).
0.6 Liste complète des informations à obtenir de PLEINGAZ (OPEN_QUESTIONS.md) : prix officiels, consigne, zones, horaires, mentions légales, CGV, logo/chartes, accès Google Analytics, contenus.
Livrables : docs/01-audit.md (constaté / recommandé / à confirmer), docs/DECISIONS.md, docs/OPEN_QUESTIONS.md.
STOP : attendre ma validation.
