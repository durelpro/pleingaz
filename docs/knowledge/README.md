---
id: "KB-000-README"
titre: "Introduction à la Base de Connaissances"
langue: "fr"
audience: "admin"
statut: "VALIDATED"
source: "Interne"
valide_par: "Durel"
date_validation: "2026-10-07"
version: "1.0"
expiration: "2099-12-31"
tags: ["readme", "meta"]
outils_lies: []
---

# Base de Connaissances de l'IA (Knowledge Base)

Ce dossier contient la source de vérité statique pour l'assistant IA PLEINGAZ. Les fichiers contenus ici seront importés dans l'entité `KnowledgeDocument` de la base de données (Phase 8), puis indexés via `pgvector` pour la recherche sémantique (RAG).

**Règles strictes :**
* Seuls les documents marqués `VALIDATED` dans le frontmatter sont utilisés par l'IA.
* Un fichier = une idée claire, de 150 à 400 mots.
* AUCUNE donnée dynamique chiffrée (prix, stock, horaire) ne doit figurer dans ces documents, à l'exception des dialogues simulés.

## Schéma d'en-tête (Frontmatter obligatoire)
Voir le fichier `schema-kb.md` pour le détail de l'en-tête.
