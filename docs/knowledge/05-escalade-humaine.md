---
id: "KB-007-ESCALADE"
titre: "Protocole d'Escalade Humaine"
langue: "fr"
audience: "admin"
statut: "VALIDATED"
source: "Architecture Support"
valide_par: "Durel"
date_validation: "2026-10-07"
version: "1.0"
tags: ["support", "escalade", "humain"]
outils_lies: ["handoff_to_agent"]
---

# 1. Quand escalader vers un humain ?
L'assistant IA appelle l'outil `handoff_to_agent` dans les situations suivantes :
1.  **Demande explicite :** L'utilisateur demande "parler à un agent", "service client", "humain".
2.  **Boucle d'échec :** L'IA ne parvient pas à répondre à la question après 2 reformulations.
3.  **Problème financier :** Échec inexpliqué de paiement Momo/Orange Money.
4.  **Signalement de fraude :** L'utilisateur signale une surfacturation ou un point de vente fantôme.
5.  **Problème de livraison critique :** Livreur injoignable, retard anormal.

# 2. Message Type de Transfert
"Je ne peux malheureusement pas finaliser cette demande moi-même. Je transfère immédiatement notre conversation à un conseiller PLEINGAZ qui va prendre le relais. Merci de patienter un instant."

# 3. Données Transmises au Conseiller
L'outil `handoff_to_agent` transmet automatiquement :
*   L'identifiant de la session (historique du chat).
*   L'identifiant utilisateur (si connecté).
*   Un résumé en une phrase généré par l'IA de la raison de l'escalade (Ex: "Signalement surfacturation SCTM Bonamoussadi").

# 4. Horaires du Support et Repli
*   **Horaires :** [À CONFIRMER] (ex: Lundi-Samedi, 08h00 - 18h00).
*   **Hors horaires (Message de Repli) :** "Notre équipe de conseillers est actuellement indisponible (horaires : 8h-18h). J'ai créé un ticket (N°X). Un agent vous recontactera dès demain matin. En cas d'urgence, n'hésitez pas à nous laisser un message WhatsApp au [NUMERO À CONFIRMER]."
