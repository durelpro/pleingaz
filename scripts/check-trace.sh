#!/usr/bin/env bash
# Contrôle de docs/08-tracabilite.md  (v5)  --  LECTURE SEULE
# Usage depuis la racine du projet : bash scripts/check-trace.sh
set -u
SRC="docs/00-sources/02-vision-prompt.md"
TRACE="docs/08-tracabilite.md"
[ -f "$SRC" ]   || { echo "Source introuvable : $SRC"; exit 1; }
[ -f "$TRACE" ] || { echo "Matrice introuvable : $TRACE"; exit 1; }

# Cibles atomiques minimales par section (0 = préambule), estimées par lecture de la source :
# puces + éléments simples listés (états, rôles, entités, étapes, outils, exemples, règles explicites).
TARGETS="10,19,17,29,10,22,15,27,22,18,14,12,9,16,8,9,15,21,7,16,21,10,9,21,18,13,14,8,5,6,5,5,10,8,25,7,13,13,7,13,35,33,14,12,15,14,7,6,8,7,5,6,8,7,64,18,8,16,15,11"

echo "=== 1. COUVERTURE DE LA VISION PAR SECTION ==="
echo "sect | puces source | cible atomique | lignes V | couvert (regroupements nominatifs comptés) | alerte"
awk -F'|' -v T="$TARGETS" 'BEGIN{cur=0; split(T,tg,",")}
FILENAME==ARGV[1] {
  line=$0
  if (line ~ /^[0-9]+\. / && line !~ /[a-z]/) { split(line,a,"."); if (a[1]+0==cur+1) { cur=a[1]+0; next } }
  if (line ~ /^[ \t]*$/) next
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
  tot=0; totc=0
  for (i=0;i<=59;i++) {
    ref=b[i]+n[i]; cible=tg[i+1]+0; al=""
    if (i==0 && ref==0 && lignes[0]==0) continue
    if (lignes[i]==0) al="AUCUNE LIGNE"
    else if (cov[i] < ref) al="SOUS LES PUCES DE LA SOURCE"
    else if (cov[i] < cible-2) al="sous la cible (manque "(cible-cov[i])")"
    printf "%02d | %d | %d | %d | %d | %s\n", i, ref, cible, lignes[i], cov[i], al
    if (lignes[i]>0) { tot+=cible; totc+=cov[i] }
  }
  printf "TOTAL (sections déjà traitées) : couvert %d sur cible %d\n", totc, tot
}' "$SRC" "$TRACE"
echo "(cibles = estimation par lecture, marge d'erreur de 1 à 2 par section ; l'alerte ne se déclenche qu'au-delà)"

echo
echo "=== 2. STATUTS PAR SOURCE ==="
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ { id=$2; gsub(/ /,"",id); src=substr(id,1,1); st=$8; gsub(/^ +| +$/,"",st); c[src" | "st]++ } END { for (k in c) print c[k]" x "k }' "$TRACE" | sort -t'|' -k1,1 -k2
echo "-- Stack : la source marque 4 lignes 'Plus tard' (Temps réel, Recherche avancée, IA, Monitoring). Lignes S 'Plus tard' dans la matrice :"
awk -F'|' 'NF==10 && $2 ~ /^ *S-/ { st=$8; gsub(/^ +| +$/,"",st); if (st ~ /^[Pp]lus tard/) n++ } END { print n+0 }' "$TRACE"

echo
echo "=== 3. STATUTS NON VALIDES (valides : MVP, Plus tard, Écarté) ==="
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ { st=$8; gsub(/^ +| +$/,"",st); if (st !~ /^(MVP|Plus tard|plus tard|Écarté|Ecarté|écarté)/) { id=$2; gsub(/ /,"",id); print id" -> \""st"\"" } }' "$TRACE" | head -40

echo
echo "=== 4. CELLULES VIDES ==="
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ { for(i=2;i<=9;i++){ x=$i; gsub(/ /,"",x); if(x==""){ id=$2; gsub(/ /,"",id); print id" : colonne "(i-1)" vide"; break } } }' "$TRACE" | head -40

echo
echo "=== 5. TROUS RÉELS : documents = AUCUN (information, pas une erreur : un trou caché est l'erreur) ==="
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ && $6 ~ /AUCUN/ { id=$2; gsub(/ /,"",id); print id }' "$TRACE" | tr '\n' ' '; echo
echo "-- lignes dont la SEULE couverture citée est '06c §1' (suspect : rattachement artificiel) :"
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ { d=$6; gsub(/^ +| +$/,"",d); if (d ~ /^06c *§? *1$/) { n++; ids=ids" "$2 } } END { print n+0" lignes"; }' "$TRACE"

echo
echo "=== 6. PHASES (valides : 2, 2B, 3 à 10, Transversal) ==="
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ { ph=$7; gsub(/^ +| +$/,"",ph); sub(/^Phase /,"",ph); c[ph]++; t++ } END { for (k in c) printf "%d x \"%s\" (%.0f%%)\n", c[k], k, 100*c[k]/t }' "$TRACE" | sort -rn
echo "-- phases valides sans AUCUNE ligne (le projet en comporte 4 produits/stock, 9 analytics, 10 optimisation) :"
for ph in 2 2B 3 4 5 6 7 8 9 10; do n=$(awk -F'|' -v ph="$ph" 'NF==10 && $2 ~ /^ *[SANPV]-/ { x=$7; gsub(/^ +| +$/,"",x); sub(/^Phase /,"",x); if (x==ph) n++ } END{print n+0}' "$TRACE"); [ "$n" -eq 0 ] && echo "   phase $ph : 0 ligne"; done
echo "-- phases non valides :"
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ { ph=$7; gsub(/^ +| +$/,"",ph); sub(/^Phase /,"",ph); if (ph !~ /^(2|2B|3|4|5|6|7|8|9|10|Transversal)$/) { id=$2; gsub(/ /,"",id); print id" phase=\""ph"\"" } }' "$TRACE" | head -20
echo "-- lignes en Phase 2 (fondations : auth, comptes, rôles, base, sécurité) dont l'exigence parle d'un autre sujet :"
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ { ph=$7; gsub(/^ +| +$/,"",ph); sub(/^Phase /,"",ph); if (ph=="2" && tolower($3) ~ /(stock|carte|commande|paiement|mobile money|facture|livraison|chat|chatbot|recherche|boutique|distributeur|heatmap|prévision|whatsapp|notification|rapport|tableau de bord|avis|fidélité)/ && tolower($3) !~ /(compte|auth|rôle|rbac|profil|mot de passe|session|audit)/) { n++; if (n<=12) { id=$2; gsub(/ /,"",id); print "   "id" : "substr($3,1,70) } } } END { print "   total suspect : "n+0 }' "$TRACE"

echo
echo "=== 7. DOCUMENTS CITÉS INEXISTANTS ==="
for t in $(awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ {print $6}' "$TRACE" | grep -o -E '(^|[^0-9.])0[0-9][a-c]?([^0-9]|$)' | grep -o -E '0[0-9][a-c]?' | sort -u); do
  ls docs/${t}-*.md >/dev/null 2>&1 || echo "document cité mais absent : $t"
done

echo
echo "=== 8. IDENTIFIANTS EN DOUBLE (tableaux principaux) ==="
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ { id=$2; gsub(/ /,"",id); print id }' "$TRACE" | sort | uniq -d | head -20

echo
echo "=== 9. LIGNES MVP : référence VÉRIFIABLE à 06c (identifiant M<nn> défini dans docs/06c-*.md) ==="
C06=$(ls docs/06c-*.md 2>/dev/null | head -1)
if [ -z "$C06" ]; then echo "06c introuvable"; else
  echo "-- identifiants M<nn> définis dans 06c : $(grep -o -E '\bM[0-9]{2}\b' "$C06" | sort -u | wc -l)"
  awk -F'|' -v C="$C06" 'BEGIN{ while ((getline l < C) > 0) { while (match(l, /M[0-9][0-9]/)) { d[substr(l,RSTART,RLENGTH)]=1; l=substr(l,RSTART+RLENGTH) } } }
  NF==10 && $2 ~ /^ *[SANPV]-/ { st=$8; gsub(/^ +| +$/,"",st)
    if (st ~ /^MVP/) {
      if (match($9, /06c M[0-9][0-9]/)) { k=substr($9,RSTART+4,3); if (!(k in d)) { bad++; if (bad<=15) { id=$2; gsub(/ /,"",id); printf "%s cite %s inexistant dans 06c\n", id, k } } else ok++ }
      else { sans++; if (sans<=15) { id=$2; gsub(/ /,"",id); printf "%s sans référence M<nn>\n", id } }
    }
  } END { printf "lignes MVP avec référence valide : %d | référence inexistante : %d | sans référence : %d\n", ok+0, bad+0, sans+0 }' "$TRACE"
  echo "-- identifiants M<nn> de 06c jamais cités par une ligne MVP (fonction du MVP non tracée) :"
  for k in $(grep -o -E '\bM[0-9]{2}\b' "$C06" | sort -u); do grep -q "06c $k" "$TRACE" || printf "%s " "$k"; done; echo
fi
echo "-- justifications du type '06c §1 : ...' (formule passe-partout, suspect) :"
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ { j=$9; gsub(/^ +/,"",j); if (j ~ /^06c §1/) n++ } END { print n+0" lignes" }' "$TRACE"
echo "-- lignes MVP placées en phase 7 à 10 (incohérent avec un MVP livré avant ; la phase 6 peut contenir le paiement en présentiel) :"
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ { st=$8; gsub(/^ +| +$/,"",st); ph=$7; gsub(/^ +| +$/,"",ph); sub(/^Phase /,"",ph); if (st ~ /^MVP/ && ph ~ /^(7|8|9|10)$/) { n++; if (n<=15) { id=$2; gsub(/ /,"",id); print "   "id" phase "ph" : "substr($3,1,60) } } } END { print "   total : "n+0 }' "$TRACE"
echo "-- section DÉCISIONS DU PROPRIÉTAIRE :"
grep -q -i "^#.*DÉCISIONS DU PROPRIÉTAIRE" "$TRACE" && echo "   présente" || echo "   ABSENTE (elle doit contenir Mobile Money MVP ou phase 6, et toute proposition de ne pas faire une exigence)"

echo
echo "=== 11. DOUBLONS DANS UNE MÊME SECTION (signe de remplissage pour atteindre un chiffre) ==="
awk -F'|' 'NF==10 && $2 ~ /^ *V-[0-9]+\./ {
  id=$2; gsub(/ /,"",id); sub(/^V-/,"",id); split(id,p,"."); sec=p[1]
  t=tolower($3); gsub(/\([0-9]+\)/,"",t); gsub(/[^a-zà-ÿ0-9 ]/,"",t); gsub(/ +/," ",t); gsub(/^ | $/,"",t)
  k=sec"|"t
  if (k in seen) { n++; if (n<=20) printf "section %s : \"%s\" apparaît aussi en V-%s\n", sec, substr(t,1,50), seen[k] }
  else seen[k]=id
} END { print "total doublons : "n+0 }' "$TRACE"

echo
echo "=== 12. CONTENU REQUIS PAR SECTION (éléments précis de la source qui doivent apparaître) ==="
need() { # section  motif(ERE, insensible à la casse)  libellé
  local sec="$1" re="$2" lab="$3"
  local has; has=$(grep -c -E "^\| V-0*${sec}\." "$TRACE")
  [ "$has" -eq 0 ] && return
  grep -E "^\| V-0*${sec}\." "$TRACE" | grep -q -i -E "$re" || echo "section $sec : manque \"$lab\""
}
need 9 "PENDING" "état PENDING"; need 9 "UNDER_REVIEW" "état UNDER_REVIEW"; need 9 "APPROVED" "état APPROVED"; need 9 "REJECTED" "état REJECTED"; need 9 "SUSPENDED" "état SUSPENDED"
need 9 "jamais.*(visible|automatiquement)|automatiquement visible" "règle : jamais visible officiel automatiquement"
need 9 "badge" "badge Distributeur PLEINGAZ vérifié"
need 10 "partenaire actif" "badge Partenaire actif"; need 10 "stock régulièrement" "badge Stock régulièrement mis à jour"; need 10 "livraison disponible" "badge Livraison disponible"
need 10 "arbitraire|pas.*publi|non publi|interne" "règle : score interne, pas une note publique"
need 11 "limit" "statut Stock limité"; need 11 "indisponible|rupture" "statut Indisponible/Rupture"; need 11 "non actualis|ancienne|information.*(non|anci)" "statut Information non actualisée"
need 11 "date.*(dernière|mise à jour)|il y a" "règle : toujours la date de dernière mise à jour"
need 12 "stock semble faible|seuil" "message stock faible / seuil"; need 12 "alerte" "alerte PLEINGAZ"
need 13 "DRAFT" "état DRAFT"; need 13 "SUBMITTED" "état SUBMITTED"; need 13 "CONFIRMED" "état CONFIRMED"; need 13 "PREPARING" "état PREPARING"; need 13 "SHIPPED" "état SHIPPED"; need 13 "DELIVERED" "état DELIVERED"; need 13 "CANCELLED" "état CANCELLED"; need 13 "historique" "historique complet"
need 14 "retirer|retrait" "retrait en boutique"; need 14 "livr" "livraison"; need 14 "panier" "panier"
need 15 "uniquement|seulement|jamais.*distance" "règle : jamais seulement la distance"
need 17 "Facture PLEINGAZ" "facture PLEINGAZ"; need 17 "distributeur X|facture du distributeur" "facture du distributeur"; need 17 "unique|jamais mélanger|mélang" "facture unique / ne pas mélanger"
need 18 "contacter ce point de vente" "bouton point de vente"; need 18 "contacter PLEINGAZ" "bouton PLEINGAZ"; need 18 "service client" "bouton service client"; need 18 "suivre ma commande" "bouton suivre"; need 18 "automatique|sans action|explicite" "règle : aucun envoi automatique"
need 20 "find_nearest_store" "outil find_nearest_store"; need 20 "check_product_availability" "outil check_product_availability"; need 20 "get_order_status" "outil get_order_status"; need 20 "get_invoice" "outil get_invoice"; need 20 "find_open_store" "outil find_open_store"; need 20 "contact_support" "outil contact_support"
need 22 "PLEINGAZ" "liaisons du chat avec PLEINGAZ"; need 22 "distributeur" "liaisons du chat avec distributeur"; need 22 "humain|conseiller" "transfert vers agent humain"
need 26 "ASSIGNED" "statut ASSIGNED"; need 26 "PICKED_UP" "statut PICKED_UP"; need 26 "IN_TRANSIT" "statut IN_TRANSIT"; need 26 "FAILED" "statut FAILED"; need 26 "gps|tracking" "tracking GPS plus tard"
need 34 "SUPER_ADMIN" "rôle SUPER_ADMIN"; need 34 "LOGISTICS_MANAGER" "rôle LOGISTICS_MANAGER"; need 34 "FINANCE_MANAGER" "rôle FINANCE_MANAGER"; need 34 "SUPPORT_AGENT" "rôle SUPPORT_AGENT"; need 34 "DISTRIBUTOR_MANAGER" "rôle DISTRIBUTOR_MANAGER"
need 56 "inventer.*prix|prix" "règle : ne pas inventer les prix"; need 56 "supprimer" "règle : ne pas supprimer de fonctionnalité sans justification"
need 40 "\\bUser\\b" "entité User"
need 40 "\\bRole\\b" "entité Role"
need 40 "\\bCustomerProfile\\b" "entité CustomerProfile"
need 40 "\\bDistributorProfile\\b" "entité DistributorProfile"
need 40 "\\bDistributorApplication\\b" "entité DistributorApplication"
need 40 "\\bDistributorDocument\\b" "entité DistributorDocument"
need 40 "\\bStore\\b" "entité Store"
need 40 "\\bStoreLocation\\b" "entité StoreLocation"
need 40 "\\bProduct\\b" "entité Product"
need 40 "\\bProductCategory\\b" "entité ProductCategory"
need 40 "\\bInventory\\b" "entité Inventory"
need 40 "\\bInventoryUpdate\\b" "entité InventoryUpdate"
need 40 "\\bOrder\\b" "entité Order"
need 40 "\\bOrderItem\\b" "entité OrderItem"
need 40 "\\bDistributorOrder\\b" "entité DistributorOrder"
need 40 "\\bDistributorOrderItem\\b" "entité DistributorOrderItem"
need 40 "\\bPayment\\b" "entité Payment"
need 40 "\\bPaymentTransaction\\b" "entité PaymentTransaction"
need 40 "\\bInvoice\\b" "entité Invoice"
need 40 "\\bInvoiceItem\\b" "entité InvoiceItem"
need 40 "\\bDelivery\\b" "entité Delivery"
need 40 "\\bConversation\\b" "entité Conversation"
need 40 "\\bMessage\\b" "entité Message"
need 40 "\\bNotification\\b" "entité Notification"
need 40 "\\bReview\\b" "entité Review"
need 40 "\\bFavorite\\b" "entité Favorite"
need 40 "\\bSupportTicket\\b" "entité SupportTicket"
need 40 "\\bKnowledgeDocument\\b" "entité KnowledgeDocument"
need 40 "\\bAuditLog\\b" "entité AuditLog"
need 40 "\\bPromotion\\b" "entité Promotion"
need 40 "\\bLoyaltyAccount\\b" "entité LoyaltyAccount"
need 40 "\\bLoyaltyTransaction\\b" "entité LoyaltyTransaction"
need 40 "\\bStockAlert\\b" "entité StockAlert"
need 40 "\\bDemandAlert\\b" "entité DemandAlert"
need 40 "\\bAddress\\b" "entité Address"
need 41 "\\bCUSTOMER\\b" "rôle CUSTOMER"
need 41 "\\bDISTRIBUTOR\\b" "rôle DISTRIBUTOR"
need 41 "\\bSUPPORT_AGENT\\b" "rôle SUPPORT_AGENT"
need 41 "\\bDISTRIBUTOR_MANAGER\\b" "rôle DISTRIBUTOR_MANAGER"
need 41 "\\bLOGISTICS_MANAGER\\b" "rôle LOGISTICS_MANAGER"
need 41 "\\bFINANCE_MANAGER\\b" "rôle FINANCE_MANAGER"
need 41 "\\bADMIN\\b" "rôle ADMIN"
need 41 "\\bSUPER_ADMIN\\b" "rôle SUPER_ADMIN"
need 34 "\\bCUSTOMER\\b" "rôle CUSTOMER"
need 34 "\\bDISTRIBUTOR\\b" "rôle DISTRIBUTOR"
need 34 "\\bADMIN\\b" "rôle ADMIN"
need 34 "https" "HTTPS"
need 34 "hash|argon" "hashage des mots de passe"
need 34 "jwt|session" "JWT / session sécurisée"
need 34 "refresh" "refresh tokens"
need 34 "rbac" "RBAC"
need 34 "validation serveur|validation c.t. serveur" "validation serveur"
need 34 "rate limit|limitation" "rate limiting"
need 34 "csrf" "CSRF"
need 34 "xss" "XSS"
need 34 "injection" "injection SQL/NoSQL"
need 34 "upload" "validation des uploads"
need 34 "antivirus|scan" "antivirus / scan des fichiers"
need 34 "journalis" "journalisation"
need 34 "audit" "audit logs"
need 34 "sauvegarde" "sauvegardes"
need 34 "secret|chiffrement" "chiffrement des secrets"
need 42 "accueil" "étape client Accueil"
need 42 "recherche" "étape client Recherche"
need 42 "disponibilit" "étape client Disponibilité"
need 42 "choix" "étape client Choix du distributeur"
need 42 "retrait|livraison" "étape client Retrait ou livraison"
need 42 "panier" "étape client Panier"
need 42 "adresse" "étape client Adresse"
need 42 "paiement" "étape client Paiement"
need 42 "confirmation" "étape client Confirmation"
need 42 "suivi" "étape client Suivi"
need 42 "facture" "étape client Facture"
need 42 "avis" "étape client Avis"
need 43 "inscription" "étape distributeur Inscription"
need 43 "dépôt|dossier" "étape distributeur Dépôt du dossier"
need 43 "PENDING" "étape distributeur PENDING"
need 43 "vérification" "étape distributeur Vérification PLEINGAZ"
need 43 "APPROVED" "étape distributeur APPROVED"
need 43 "boutique visible" "étape distributeur Boutique visible"
need 43 "gestion.*stock" "étape distributeur Gestion stock"
need 43 "réception" "étape distributeur Réception commandes"
need 43 "commandes? (à|auprès de) PLEINGAZ" "étape distributeur Commandes à PLEINGAZ"
need 43 "réappro" "étape distributeur Livraison / réapprovisionnement"
need 43 "facturation" "étape distributeur Facturation"
need 43 "suivi.*activité" "étape distributeur Suivi activité"
need 44 "connexion" "étape admin Connexion sécurisée"
need 44 "dashboard" "étape admin Dashboard"
need 44 "supervision" "étape admin Supervision"
need 44 "demandes? de validation" "étape admin Demandes de validation"
need 44 "produits" "étape admin Produits"
need 44 "stocks" "étape admin Stocks"
need 44 "paiements" "étape admin Paiements"
need 44 "factures" "étape admin Factures"
need 44 "livraisons" "étape admin Livraisons"
need 44 "support" "étape admin Support"
need 44 "\\bIA\\b" "étape admin IA"
need 44 "rapports" "étape admin Rapports"
need 44 "audit" "étape admin Audit"
need 45 "pdf" "export PDF"
need 45 "csv" "export CSV"
need 45 "excel" "export Excel"
need 48 "certaine" "INFORMATION CERTAINE"
need 48 "dynamique" "INFORMATION DYNAMIQUE"
need 48 "indisponible" "INFORMATION INDISPONIBLE"
need 58 "probl.me" "format innovation : PROBLÈME"
need 58 "solution" "format innovation : SOLUTION"
need 58 "valeur" "format innovation : VALEUR"
need 58 "complexit" "format innovation : COMPLEXITÉ"
need 58 "priorit" "format innovation : PRIORITÉ"
need 54 "audit" "phase source AUDIT"
need 54 "fondations" "phase source FONDATIONS"
need 54 "distributeurs" "phase source DISTRIBUTEURS"
need 54 "produits" "phase source PRODUITS + STOCK"
need 54 "commandes" "phase source COMMANDES"
need 54 "paiements" "phase source PAIEMENTS"
need 54 "communication" "phase source COMMUNICATION"
need 54 "analytics" "phase source ANALYTICS"
need 54 "optimisation" "phase source OPTIMISATION"
need 55 "double paiement" "test double paiement"
need 55 "double commande" "test double commande"
need 55 "non autoris" "test utilisateur non autorisé"
need 55 "non valid" "test distributeur non validé"
need 55 "prix" "test modification frauduleuse du prix"
need 55 "faux statut|statut de paiement" "test faux statut de paiement"
need 55 "facture.*(autre|quelqu)|appartenant" "test facture d'autrui"
need 57 "audit complet" "livrable audit complet"
need 57 "architecture cible" "livrable architecture cible"
need 57 "sitemap" "livrable sitemap"
need 57 "parcours" "livrable parcours utilisateurs"
need 57 "matrice des r" "livrable matrice des rôles"
need 57 "mod.le de donn" "livrable modèle de données"
need 57 "api" "livrable architecture API"
need 57 "frontend" "livrable architecture frontend"
need 57 "architecture ia|\\bIA\\b" "livrable architecture IA"
need 57 "notifications" "livrable architecture notifications"
need 57 "paiement" "livrable architecture paiement"
need 57 "cartograph" "livrable architecture cartographique"
need 57 "sécurité" "livrable plan de sécurité"
need 57 "tests" "livrable plan de tests"
need 57 "roadmap" "livrable roadmap"
echo "(aucune ligne ci-dessus = tous les éléments requis des sections traitées sont présents)"

echo
echo "=== 13. LIGNES DONT LE SEUL DOCUMENT EST 06c (aucun document de conception) PAR STATUT ==="
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ { d=$6; gsub(/^ +| +$/,"",d); st=$8; gsub(/^ +| +$/,"",st); if (d ~ /^06c( *§ *[0-9]+)?$/) c[st]++ } END { for (k in c) print c[k]" x "k }' "$TRACE"
echo "(une exigence MVP qui n'a que 06c comme document n'est décrite dans aucun document de conception : à justifier)"

echo
echo "=== 14. LIGNES 'Plus tard' DES PHASES 2 À 6 SANS RÉFÉRENCE À 06c H<nn> ==="
awk -F'|' 'NF==10 && $2 ~ /^ *[SANPV]-/ { st=$8; gsub(/^ +| +$/,"",st); ph=$7; gsub(/^ +| +$/,"",ph); sub(/^Phase /,"",ph); if (st ~ /^[Pp]lus tard/ && ph ~ /^(2|2B|3|4|5|6)$/ && $9 !~ /06c H[0-9][0-9]/) n++ } END { print n+0" lignes" }' "$TRACE"
echo "(un 'Plus tard' placé dans une phase du MVP doit dire pourquoi : 06c H<nn>, ou être placé dans une phase postérieure)"

echo
echo "=== 15. COHÉRENCE DU TABLEAU TROUS AVEC LA MATRICE (même ID = même exigence ?) ==="
awk -F'|' '
function words(t, arr,   i,n,w,a) { delete arr; t=tolower(t); gsub(/\([^)]*\)/," ",t); gsub(/[^a-zà-ÿ ]/," ",t); n=split(t,a," "); for(i=1;i<=n;i++) if (length(a[i])>=5) arr[a[i]]=1 }
NF==10 && $2 ~ /^ *[SANPV]-/ { id=$2; gsub(/ /,"",id); main[id]=$3 }
NF==7 && $2 ~ /^ *[SANPV]-/ { id=$2; gsub(/ /,"",id); tr[id]=$3 }
END {
  for (id in tr) { if (!(id in main)) continue
    words(tr[id], A); words(main[id], B); ok=0; for (w in A) if (w in B) ok=1
    if (!ok) { n++; if (n<=25) printf "%s : TROUS dit \"%s\" mais la matrice dit \"%s\"\n", id, substr(tr[id],1,40), substr(main[id],1,40) }
  }
  print "incohérences TROUS / matrice : "n+0
}' "$TRACE"

echo "=== 16. TOTAUX ==="
for p in S A N P V; do printf "%s : " "$p"; awk -F'|' -v p="$p" 'NF==10 && $2 ~ ("^ *" p "-") { id=$2; gsub(/ /,"",id); print id }' "$TRACE" | sort -u | wc -l; done
echo "Sections de décisions :"; grep -n -i "^#.*\(DÉCISIONS DU PROPRIÉTAIRE\|TROUS\|INCOHÉRENCES\)" "$TRACE" | head


echo
echo "=== 17. BLOCS S/A/N/P NON TRONQUÉS (minima : S=32, A=45, N=24, P=120) ==="
for pair in S:32 A:45 N:24 P:120; do
  p=${pair%%:*}; min=${pair##*:}
  n=$(awk -F'|' -v p="$p" 'NF==10 && $2 ~ ("^ *" p "-") { id=$2; gsub(/ /,"",id); print id }' "$TRACE" | sort -u | wc -l)
  if [ "$n" -lt "$min" ]; then echo "ALERTE $p : $n lignes au lieu d'au moins $min (bloc tronqué ou écrasé ?)"; else echo "ok $p : $n"; fi
done
