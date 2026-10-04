#!/usr/bin/env bash
# Contrôle automatique de docs/08-tracabilite.md
# Usage (depuis la racine du projet) : bash scripts/check-trace.sh
# Lecture seule : ne modifie aucun fichier.
set -u
SRC="docs/00-sources/02-vision-prompt.md"
TRACE="docs/08-tracabilite.md"
[ -f "$SRC" ]   || { echo "Source introuvable : $SRC"; exit 1; }
[ -f "$TRACE" ] || { echo "Matrice introuvable : $TRACE"; exit 1; }

echo "=== 1. COUVERTURE DE LA VISION PAR SECTION (V) ==="
echo "section | puces+items numérotés source | lignes non vides source | lignes V | puces couvertes (regroupements comptés) | alerte"
awk -F'|' 'BEGIN{cur=0}
FILENAME==ARGV[1] {
  line=$0
  if (line ~ /^[0-9]+\. / && line !~ /[a-z]/) { split(line,a,"."); if (a[1]+0==cur+1) { cur=a[1]+0; next } }
  if (line ~ /^[ \t]*$/) next
  nb[cur]++
  if (line ~ /^\* /) b[cur]++
  if (line ~ /^[0-9]+\. /) n[cur]++
  next
}
{
  if (NF==10 && $2 ~ /^ *V-[0-9]+\./) {
    id=$2; gsub(/ /,"",id); sub(/^V-/,"",id); split(id,p,"."); s=p[1]+0
    lignes[s]++
    if (match($3, /regroupe [0-9]+/)) { r=substr($3,RSTART+8,RLENGTH-8)+0; cov[s]+=r } else cov[s]+=1
  }
}
END {
  for (i=0;i<=59;i++) {
    ref=b[i]+n[i]; al=""
    if (i==0 && ref==0) continue
    if (lignes[i]==0) al="AUCUNE LIGNE"
    else if (cov[i] < ref) al="couverture < puces source"
    printf "%02d | %d | %d | %d | %d | %s\n", i, ref, nb[i], lignes[i], cov[i], al
  }
}' "$SRC" "$TRACE"
echo "(section 00 = préambule du prompt : les 8 étapes de la mission avant la section 1 ; IDs V-00.n)"
echo "(pour les sections sans puces : états, rôles, entités, étapes, outils sont listés en lignes simples ; comparer aussi à la colonne 'lignes non vides')"

echo
echo "=== 2. STATUTS PAR SOURCE (lignes complètes à 8 colonnes) ==="
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ {
  id=$2; gsub(/ /,"",id); src=substr(id,1,1)
  st=$8; gsub(/^ +| +$/,"",st)
  k=src" | "st; c[k]++
} END { for (k in c) print c[k]" x "k }' "$TRACE" | sort -t'|' -k1,1 -k2

echo
echo "=== 3. STATUTS NON VALIDES (valides : MVP, Plus tard, Écarté...) ==="
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ {
  st=$8; gsub(/^ +| +$/,"",st)
  if (st !~ /^(MVP|Plus tard|plus tard|Écarté|Ecarté|écarté)/) { id=$2; gsub(/ /,"",id); print id" -> statut=\""st"\"" }
}' "$TRACE" | head -40

echo
echo "=== 4. CELLULES VIDES ==="
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ {
  for(i=2;i<=9;i++){ x=$i; gsub(/ /,"",x); if(x==""){ id=$2; gsub(/ /,"",id); print id" : colonne "(i-1)" vide"; break } }
}' "$TRACE" | head -40

echo
echo "=== 5. LIGNES SANS DOCUMENT (AUCUN dans la colonne documents) ==="
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ && $6 ~ /AUCUN/ { id=$2; gsub(/ /,"",id); print id }' "$TRACE" | tr '\n' ' '; echo

echo
echo "=== 6. PHASES UTILISÉES (valides : 2, 2B, 3 à 10) ==="
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ { ph=$7; gsub(/^ +| +$/,"",ph); c[ph]++ } END { for (k in c) print c[k]" x \""k"\"" }' "$TRACE" | sort -rn
echo "-- lignes dont la phase contient 0, 1 ou 2A (suspect : la Phase 1 est la documentation, 2A n'existe pas) :"
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ { ph=$7; gsub(/^ +| +$/,"",ph); if (ph ~ /(^|[^0-9])(0|1)([^0-9]|$)/ || ph ~ /2A/) { id=$2; gsub(/ /,"",id); print id" phase=\""ph"\"" } }' "$TRACE" | head -40

echo
echo "=== 7. DOCUMENTS CITÉS QUI N'EXISTENT PAS ==="
for t in $(awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ {print $6}' "$TRACE" | grep -o -E '(^|[^0-9.])0[0-9][a-c]?([^0-9]|$)' | grep -o -E '0[0-9][a-c]?' | sort -u); do
  ls docs/${t}-*.md >/dev/null 2>&1 || echo "document cité mais absent : $t"
done

echo
echo "=== 8. IDENTIFIANTS EN DOUBLE DANS LES TABLEAUX PRINCIPAUX ==="
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ { id=$2; gsub(/ /,"",id); print id }' "$TRACE" | sort | uniq -d | head -20

echo
echo "=== 9. LIGNES MVP SANS RÉFÉRENCE À 06c (documents ou justification) ==="
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ { st=$8; gsub(/^ +| +$/,"",st); if (st ~ /^MVP/ && $6 !~ /06c/ && $9 !~ /06c/) { id=$2; gsub(/ /,"",id); print id } }' "$TRACE" | tr '\n' ' '; echo

echo
echo "=== 10. TOTAUX ==="
for p in S A N P V; do printf "%s : " "$p"; awk -F'|' -v p="$p" 'NF==10 && $2 ~ ("^ *" p "-") { id=$2; gsub(/ /,"",id); print id }' "$TRACE" | sort -u | wc -l; done
echo "Sections de décisions :"; grep -n -i "^#.*\(DÉCISIONS DU PROPRIÉTAIRE\|TROUS\|INCOHÉRENCES\)" "$TRACE" | head
