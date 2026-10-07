---
id: "KB-004-PARCOURS"
titre: "Parcours Conversationnels (Flux)"
langue: "fr"
audience: "admin"
statut: "VALIDATED"
source: "Architecture UX"
valide_par: "Durel"
date_validation: "2026-10-07"
version: "1.0"
tags: ["mermaid", "flow", "conversation"]
outils_lies: []
---

# Parcours Conversationnels Types de l'Assistant

## 1. Recherche de bout en bout ("J'ai besoin de gaz")

```mermaid
graph TD
    A[Utilisateur: J'ai besoin de gaz !] --> B{Position connue ?}
    B -- Non --> C[IA: Dans quel quartier vous trouvez-vous ?]
    C --> D[Utilisateur: Bonamoussadi]
    B -- Oui --> E
    D --> E[Outil: find_nearest_available_store]
    E --> F{Stock trouvé ?}
    F -- Oui --> G[IA: J'ai trouvé X boutiques. La plus proche est Y. Action: Voir boutique]
    F -- Non --> H[IA: Rupture de stock autour de vous. Voulez-vous créer une alerte ?]
```

## 2. Refus de Localisation

```mermaid
graph TD
    A[Utilisateur: Non je ne donne pas mon quartier] --> B[IA: D'accord. Vous pouvez naviguer sur la carte ou me donner une ville plus tard.]
    B --> C[Fin de flux]
```

## 3. Rupture puis Alerte

```mermaid
graph TD
    A[Outil: find_nearest_available_store = VIDE] --> B[IA: Rupture. Alerte ?]
    B --> C[Utilisateur: Oui]
    C --> D{Connecté ?}
    D -- Non --> E[IA: Veuillez vous inscrire pour recevoir le SMS. Lien: Créer un compte]
    D -- Oui --> F[Outil: create_stock_alert]
    F --> G[IA: Alerte configurée ! Vous serez averti.]
```

## 4. Commande jusqu'au suivi

```mermaid
graph TD
    A[Utilisateur: Où est ma commande X ?] --> B[Outil: get_order_status]
    B --> C{Trouvée ?}
    C -- Non --> D[IA: Commande introuvable. Vérifiez le numéro.]
    C -- Oui --> E[IA: Statut: EN ROUTE. Livre: Jean. OTP: ***]
```

## 5. Transfert vers un Conseiller (Escalade)

```mermaid
graph TD
    A[Utilisateur: Je n'ai pas reçu l'OTP] --> B[IA: Explication de secours]
    B --> C[Utilisateur: Ça ne marche toujours pas !]
    C --> D[Outil: handoff_to_agent]
    D --> E[IA: Je transfère votre dossier à un humain. Merci d'attendre.]
```
