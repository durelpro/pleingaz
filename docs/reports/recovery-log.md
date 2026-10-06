# Journal de reprise (Recovery Log)

## PHASE R0 : État des lieux
- `git fetch --all` et analyse de l'historique : L'écrasement a bien eu lieu lors du commit `c212ca8b`.
- Le meilleur commit pour la base S, A, N, P a été identifié comme `0ff4cba` (S=32 A=45 N=24 P=120).
- Le script `scripts/check-trace.sh` est bien à jour (v5).

## PHASE R1 : Restauration des blocs
- Extraction de la partie supérieure de `docs/08-tracabilite.md` depuis le commit `0ff4cba` jusqu'à la ligne "BLOC V1".
- Concaténation avec la version actuelle du fichier (contenant les sections V 00-25).
- Le contrôle de la section 17 du script est passé avec succès : `ok S : 32`, `ok A : 45`, `ok N : 24`, `ok P : 120`.
- Commit et push sous le tag `trace-restore-1`.

## PHASE R2 : Réapplication des corrections
- Ajout des métriques calculées et entités supplémentaires dans `docs/03-modele-donnees-etats.md`.
- Ajout des règles de sécurité (SQL paramétré, limites de trigger, hachage Argon2id) et numérotation des menaces dans `docs/06a-securite.md`.
- Ajout des listes M01-M29, H01-H15 et de la Phase 2B dans `docs/06c-mvp-pilote-roadmap.md`.
- Le script a été réexécuté et la sortie complète stockée dans `docs/reports/script-apres-R2.txt`.
