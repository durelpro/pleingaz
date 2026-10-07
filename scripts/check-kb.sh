#!/bin/bash
# check-kb.sh
# Script de validation de la Base de Connaissances (KB) de l'IA

KB_DIR="docs/knowledge"
ERRORS=0

echo "🔍 Démarrage de la vérification de la KB..."

# 1. Vérification des en-têtes et des statuts
echo "📝 Vérification des en-têtes Frontmatter..."
for file in $(find "$KB_DIR" -type f -name "*.md"); do
    if ! grep -q "^---" "$file"; then
        echo "❌ [ERREUR] Pas de frontmatter YAML dans $file"
        ERRORS=$((ERRORS + 1))
    else
        # Vérifie statut valide dans l'en-tête
        statut=$(head -n 15 "$file" | grep "^statut: " | cut -d'"' -f2 | head -n 1)
        if [[ "$statut" != "VALIDATED" && "$statut" != "DRAFT" && "$statut" != "RETIRED" ]]; then
            echo "❌ [ERREUR] Statut '$statut' invalide dans $file"
            ERRORS=$((ERRORS + 1))
        fi
    fi
    # Vérification section vide (titre suivi immédiatement d'un autre titre)
    if grep -P -z -q '(?m)^#.*\n+#' "$file" 2>/dev/null; then
        echo "⚠️ [ATTENTION] Section potentiellement vide dans $file"
    fi
done

# 2. Absence de données chiffrées statiques (prix, stock) hors dialogues
echo "💰 Vérification de l'absence de prix/stocks statiques..."
for file in $(find "$KB_DIR" -type f -name "*.md" | grep -v "dialogues"); do
    if grep -q -E "([0-9]+\s*(FCFA|fcfa)|(stock:|Stock:)\s*[0-9]+)" "$file"; then
        echo "❌ [ERREUR] Prix ou stock détecté hors dossier dialogues dans $file (L'IA doit utiliser les Outils)"
        ERRORS=$((ERRORS + 1))
    fi
done

# 3. Validation JSONL (Évaluation)
if [ -f "$KB_DIR/eval/eval-dataset.jsonl" ]; then
    echo "⚙️ Vérification de la validité du JSONL d'évaluation..."
    if ! jq -e . "$KB_DIR/eval/eval-dataset.jsonl" > /dev/null 2>&1; then
        echo "❌ [ERREUR] Le fichier eval-dataset.jsonl est invalide."
        ERRORS=$((ERRORS + 1))
    fi
    EVAL_COUNT=$(wc -l < "$KB_DIR/eval/eval-dataset.jsonl")
    if [ "$EVAL_COUNT" -lt 150 ]; then
        echo "❌ [ERREUR] Nombre de cas d'évaluation insuffisant : $EVAL_COUNT / 150 attendus."
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "⚠️ [ATTENTION] Fichier eval-dataset.jsonl manquant."
fi

# 4. Décomptes minimaux (Intentions, FAQ, Dialogues)
echo "📊 Vérification des décomptes minimaux..."

if [ -f "$KB_DIR/01-intentions.md" ]; then
    INTENTIONS=$(grep -c "^## Intention" "$KB_DIR/01-intentions.md")
    if [ "$INTENTIONS" -lt 35 ]; then
        echo "❌ [ERREUR] Seulement $INTENTIONS intentions sur 35 attendues."
        ERRORS=$((ERRORS + 1))
    fi
fi

FAQ_FILES=$(find "$KB_DIR/faq" -type f -name "*.md" 2>/dev/null)
if [ -n "$FAQ_FILES" ]; then
    FAQ_COUNT=$(cat $FAQ_FILES | grep -c "^### Q")
    if [ "$FAQ_COUNT" -lt 120 ]; then
        echo "❌ [ERREUR] Seulement $FAQ_COUNT Q/R sur 120 attendues."
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "⚠️ [ATTENTION] Dossier FAQ vide."
fi

DIALOGUES=$(find "$KB_DIR/dialogues" -type f -name "*.md" 2>/dev/null | wc -l)
if [ "$DIALOGUES" -lt 60 ]; then
    echo "❌ [ERREUR] Seulement $DIALOGUES dialogues sur 60 attendus."
    ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
    echo "✅ SUCCÈS : La Base de Connaissances respecte la norme."
    exit 0
else
    echo "💥 ÉCHEC : $ERRORS erreurs trouvées. Corrigez-les."
    exit 1
fi
