---
id: "KB-001-SCHEMA"
titre: "Schéma d'en-tête (Frontmatter) des Fichiers KB"
langue: "fr"
audience: "admin"
statut: "VALIDATED"
source: "Interne"
valide_par: "Durel"
date_validation: "2026-10-07"
version: "1.0"
expiration: "2099-12-31"
tags: ["schema", "meta"]
outils_lies: []
---

# Structure requise pour tout fichier de la Base de Connaissances

Tout fichier `.md` importé dans l'entité `KnowledgeDocument` doit impérativement débuter par ce bloc YAML :

```yaml
---
id: "KB-XXX-IDENTIFIANT"
titre: "Titre clair et descriptif"
langue: "fr" # ou "en"
audience: "anonyme" # "anonyme", "acheteur", ou "distributeur"
statut: "DRAFT" # "DRAFT" (brouillon/non validé), "VALIDATED" (indexé par le RAG), ou "RETIRED"
source: "URL ou Nom du document de référence"
valide_par: "Nom de l'admin"
date_validation: "YYYY-MM-DD"
version: "1.0"
expiration: "YYYY-MM-DD" # Optionnel, pour les promos ou annonces
tags: ["mot-cle-1", "mot-cle-2"]
outils_lies: ["outil_optionnel_1"] # Ex: search_stores_by_area
---
```
