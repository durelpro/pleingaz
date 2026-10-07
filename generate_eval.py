import json
import os

os.makedirs('docs/knowledge/eval', exist_ok=True)

# Generate 150 evaluation cases
cases = []
base_cases = [
    {"input": "je cherche du gaz a {loc}", "expected_tool": "find_nearest_available_store", "expected_response_contains": "trouvé"},
    {"input": "combien coute sctm 12kg", "expected_tool": "get_product_price", "expected_response_contains": "prix officiel"},
    {"input": "ou est ma commande {cmd}", "expected_tool": "get_order_status", "expected_response_contains": "statut"},
    {"input": "j'ai pas recu le sms", "expected_tool": "search_knowledge", "expected_response_contains": "WhatsApp"},
    {"input": "je veux parler a un agent", "expected_tool": "handoff_to_agent", "expected_response_contains": "transfère"},
]

locations = ["Bonamoussadi", "Akwa", "Bastos", "Mvan", "Deido", "Logpom", "Makepe", "Tsinga", "Biyem-Assi", "Kotto"]

count = 0
while count < 150:
    for bc in base_cases:
        if count >= 150:
            break
        loc = locations[count % len(locations)]
        cmd = f"CMD-{2000+count}"
        
        inp = bc["input"].format(loc=loc, cmd=cmd)
        cases.append({
            "id": f"EVAL-{count+1:03d}",
            "user_input": inp,
            "expected_tool_call": bc["expected_tool"],
            "expected_response_keyword": bc["expected_response_contains"]
        })
        count += 1

with open('docs/knowledge/eval/eval-dataset.jsonl', 'w', encoding='utf-8') as f:
    for case in cases:
        f.write(json.dumps(case, ensure_ascii=False) + '\n')

print(f"Generated {len(cases)} cases in eval-dataset.jsonl")
