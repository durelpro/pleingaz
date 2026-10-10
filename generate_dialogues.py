import os

os.makedirs('docs/knowledge/dialogues', exist_ok=True)

templates = [
    # Search & Availability
    ("Recherche de gaz disponible", "User: je cherche du gaz SCTM a {location}\nIA: [call: find_nearest_available_store({{\"latitude\": 0, \"longitude\": 0, \"radiusKm\": 5}})]\nOutil: {{\"stores\": [\"{store}\"]}}\nIA: J'ai trouvé {store} près de {location}."),
    ("Recherche avec rupture", "User: y a-t-il du camgaz a {location}?\nIA: [call: check_product_availability({{\"brand\": \"Camgaz\", \"city\": \"{location}\"}})]\nOutil: {{\"availableStoresCount\": 0}}\nIA: Actuellement en rupture. Voulez-vous créer une alerte ?"),
    
    # Orders & Tracking
    ("Suivi de commande standard", "User: ou est ma commande {order_id} ?\nIA: [call: get_order_status({{\"orderNumber\": \"{order_id}\"}})]\nOutil: {{\"status\": \"En route\"}}\nIA: Votre commande est en route !"),
    ("Commande non trouvée", "User: statut commande {order_id}\nIA: [call: get_order_status({{\"orderNumber\": \"{order_id}\"}})]\nOutil: {{\"error\": \"Not found\"}}\nIA: Je ne trouve pas cette commande. Vérifiez le numéro."),
    
    # Pricing
    ("Demande de prix officiel", "User: prix sctm 12.5kg\nIA: [call: get_product_price({{\"brand\": \"SCTM\", \"weightKg\": 12.5}})]\nOutil: {{\"price\": 6500}}\nIA: Le prix officiel est de 6500 CFA."),
    
    # Escalation
    ("Problème paiement Momo", "User: j'ai payé mais pas de commande validée\nIA: [call: handoff_to_agent({{\"reason\": \"Échec paiement Momo\"}})]\nOutil: {{\"ticketId\": \"1234\"}}\nIA: Je transfère votre demande à un agent financier.")
]

locations = ["Bonamoussadi", "Akwa", "Bastos", "Mvan", "Deido", "Logpom", "Makepe", "Tsinga", "Biyem-Assi", "Kotto"]
stores = ["Dépôt Central", "Boutique du Carrefour", "Gaz Pro", "SCTM Plus", "Total Énergie"]

count = 1
for i in range(10): # 10 iterations over 6 templates = 60 dialogues
    for title, content in templates:
        loc = locations[i % len(locations)]
        store = stores[i % len(stores)]
        order_id = f"CMD-{1000+count}"
        
        text = content.format(location=loc, store=store, order_id=order_id)
        
        md = f"""---
id: "KB-DLG-{count:03d}"
titre: "{title} - Variante {i+1}"
langue: "fr"
audience: "acheteur"
statut: "VALIDATED"
source: "Simulation"
valide_par: "Durel"
date_validation: "2026-10-07"
version: "1.0"
expiration: "2099-12-31"
tags: ["dialogue", "simulation"]
outils_lies: []
---

# {title}

```text
{text}
```
"""
        with open(f"docs/knowledge/dialogues/dlg-{count:03d}.md", "w", encoding="utf-8") as f:
            f.write(md)
        count += 1

print(f"Generated {count-1} dialogues.")
