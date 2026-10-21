# Rapport de Profiling Source — Import Réseau PLEINGAZ (CR-002 Lot 3)

**Date d'exécution** : 21 octobre 2026  
**Fichier source analysé** : `data/private/imports/carte_clients_pleingaz.kmz`  
**Empreinte cryptographique (SHA-256)** : `f552bb1abac7441315945cd8d4def0e2bd774d36a07bd0172cc83aa6744fdb84`  
**Carte source officielle** : Google My Maps *"CARTE CLIENTS PLEINGAZ"*  
**Statut de l'exécution** : **DRY-RUN SIMULATION EXCLUSIVE (ZÉRO ÉCRITURE EN BDD)**

---

## 1. Synthèse Globale du Profiling

| Métrique | Valeur | % du total | Statut / Décision |
|---|---|---|---|
| **Total Placemarks analysés** | **70** | 100,0 % | Fichier intègre, structure XML/KML valide |
| **Points éligibles à l'import immédiat (`LISTED`)** | **69** | **98,6 %** | **Prêts pour intégration en BDD (D-07)** |
| **Points isolés en quarantaine** | **1** | **1,4 %** | **Quarantaine automatique stricte (D-08)** |
| **Points avec coordonnées géographiques valides** | **70** | 100,0 % | 100% situés à l'intérieur du Cameroun (WGS84) |
| **Points avec coordonnées hors Cameroun** | **0** | 0,0 % | Aucune anomalie de projection |
| **Doublons détectés (< 50m / même contact)** | **0** | 0,0 % | Réseau géographiquement bien dispersé |

---

## 2. Répartition par Dossier Géographique (Google My Maps)

| Dossier source | Nombre de points | % du total | Couverture opérationnelle |
|---|---|---|---|
| **DOUALA** | 45 | 64,3 % | Réseau dense (Hub principal Littoral) |
| **YAOUNDE** | 17 | 24,3 % | Capitale politique & région Centre |
| **AUTRES REGIONS** | 8 | 11,4 % | Villes secondaires et axes régionaux |
| **TOTAL** | **70** | **100,0 %** | — |

---

## 3. Classification Algorithmique Métier (Décision D-08)

Conformément à la règle souveraine **D-08 (Zéro Particulier)**, les fiches brutes sont filtrées automatiquement sans intervention humaine subjective :

| Catégorie algorithmique | Nombre | % | Action système appliquée |
|---|---|---|---|
| **Point de Vente Conforme** (`POINT_DE_VENTE_CONFORME`) | 62 | 88,6 % | Import immédiat en BDD : statut `LISTED`, `claim_status: UNCLAIMED`, `owner_user_id: NULL` |
| **Grossiste ou Dépôt** (`GROSSISTE_OU_DEPOT`) | 7 | 10,0 % | Import immédiat en BDD avec tag dépôt : statut `LISTED`, `claim_status: UNCLAIMED` |
| **Particulier ou Ménage** (`PARTICULIER_OU_MENAGE`) | 1 | 1,4 % | **ISOLATION EN QUARANTAINE IMMÉDIATE (`QUARANTINE_INDIVIDUAL`)**. Zéro insertion en table `Store` ni `User`. |
| **Invalide ou Incomplet** (`INVALIDE_OU_INCOMPLET`) | 0 | 0,0 % | Aucune fiche sans nom ou corrompue |

### Détail de l'élément en quarantaine (D-08)
- **Référence source KML** : `kml_pm_38_c061cdc9`
- **Motif d'isolation** : `QUARANTINE_INDIVIDUAL`
- **Détection** : Présence explicite de marqueurs de ménage / domicile privé sans enseigne commerciale.
- **Règle de rétention** : Stockage temporaire en table de staging `ImportRecord` pour traçabilité d'exclusion (durée maximale de 90 jours), zéro création de boutique `Store`, zéro compte `User`.

---

## 4. Analyse de la Qualité des Coordonnées Géographiques

| Critère géographique | Constat | Impact |
|---|---|---|
| **Format des coordonnées** | WGS84 standard `(longitude, latitude, altitude)` | Compatible PostGIS `geometry(Point, 4326)` natif |
| **Bornes territoriales Cameroun** | Lat: [1.5°N, 13.5°N] / Lon: [8.0°E, 16.5°E] | 70/70 points strictement à l'intérieur du Cameroun |
| **Points aberrants (0,0 ou hors pays)** | **0** | Aucune anomalie détectée |
| **Doublons géodésiques (< 50 mètres)** | **0** | Aucun doublon détecté dans le fichier source |

---

## 5. Analyse des Données de Contact Téléphonique

| Statut téléphonique | Nombre | % | Impact sur le cycle de vie (`Claim`) |
|---|---|---|---|
| **Téléphone camerounais valide (E.164 `+237...`)** | 45 | 64,3 % | **Revendication autonome possible via OTP SMS** par le distributeur lors du passage à `CLAIMED` (D-09). |
| **Téléphone manquant ou non exploitable** | 25 | 35,7 % | Affichage public assuré avec mention d'actualisation. Revendication nécessitera une mise en relation préalable avec l'administrateur PLEINGAZ. |

---

## 6. Conformité Sécurité et Données Personnelles

1. **Protection Anti-XSS (M23)** :
   - Les descriptions brutes contenant des balises de mise en page HTML ont été purgées et converties en texte clair sécurisé.
   - 0 script ou balise malveillante n'a franchi le sanitizer.
2. **Protection Anti-Prompt-Injection (M24)** :
   - Aucun vecteur de détournement d'instructions LLM n'a été détecté dans les descriptions.
3. **Protection des Données Personnelles (D-08 & RGPD/Droit camerounais)** :
   - Aucun nom patronymique privé ni numéro de téléphone brut n'est commité dans le dépôt Git (`data/private/` strictement exclu).
   - Les futurs enregistrements de staging `ImportRecord` isolent le cas particulier identifié.
   - Les 69 boutiques seront créées avec `owner_user_id = NULL` : aucun mot de passe, aucun compte utilisateur fictif.

---

## 7. Recommandation pour le Lot 4 (Application en BDD)

Le fichier `carte_clients_pleingaz.kmz` est parfaitement qualifié, propre et validé pour l'importation.

Pour exécuter le **Lot 4 (Migration Prisma & Intégration en BDD)** :
- **69 points de vente** seront créés dans la table `Store` au statut `LISTED` avec coordonnées PostGIS réelles.
- **1 enregistrement** sera consigné dans `ImportRecord` au statut `QUARANTINE_INDIVIDUAL`.
- L'empreinte cryptographique requise pour l'approbation est :
  ```
  f552bb1abac7441315945cd8d4def0e2bd774d36a07bd0172cc83aa6744fdb84
  ```
