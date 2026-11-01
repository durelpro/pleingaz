# 14b. Spécification des Espaces Séparés, Portails et Isolation Étanche ("Aucune Trace")

- **Statut** : VALIDÉ (CR-003 D-11, C-05, C-06)
- **Portée** : Architecture des portails, isolation des bundles et routes, étanchéité de l'API et traçabilité des sessions.
- **Phase cible** : MVP (Phase 2 révisée).

---

## 1. Principes Fondamentaux et Règle "Aucune Trace" (D-11.5, C-06)

Le modèle multi-profil antérieur reposait sur un compte unique avec un sélecteur d'espace (« switch de profil ») et une interface partagée. Cette approche est **formellement abrogée** par la décision D-11 du propriétaire au profit d'un cloisonnement étanche :

1. **Un numéro WhatsApp = Un seul type d'espace opérationnel (D-11.3)** :
   - Par défaut, un numéro de téléphone principal est rattaché à un seul et unique type d'espace : Acheteur (`CUSTOMER`), Distributeur (`DISTRIBUTOR`), Livreur (`COURIER`), Gestionnaire de compte (`ACCOUNT_MANAGER`) ou Personnel d'administration PLEINGAZ (`STAFF`).
   - Tout changement de type d'espace pour un compte est une action administrative exceptionnelle obligatoirement motivée et consignée dans `AuditLog`.

2. **Principe "Aucune Trace" dans l'Expérience Utilisateur (D-11.5)** :
   - L'espace d'un profil donné ne doit comporter **aucun lien, aucun sous-menu, aucun onglet ni aucun sélecteur** mentionnant ou menant vers un autre profil.
   - *Exemple concret* : Dans l'espace Acheteur, il est strictement interdit d'afficher un bouton ou encart « Devenir Distributeur » ou « Postuler comme Livreur ». Les candidatures s'effectuent exclusivement depuis la page d'accueil publique avant authentification.
   - Les mentions légitimes de distributeurs en tant que points de vente pour acheter du gaz (nom de la boutique, adresse, stock) restent bien entendu autorisées dans l'espace acheteur.

3. **Absence totale de fuite d'informations (Information Leak Prevention)** :
   - **Messages d'erreur de connexion uniformes** : Les erreurs de connexion sur tous les portails affichent strictement le message invariant : *« Identifiants non reconnus. Veuillez vérifier votre numéro et mot de passe. »*. Aucune indication ne révèle si le compte existe, s'il est verrouillé, ou s'il appartient à un autre type d'espace.
   - **Nettoyage des charges utiles API (Zero Role Leak)** : Les réponses JSON émises à destination de l'espace acheteur sont expurgées de tout champ relatif aux rôles RBAC, autorisations internes ou drapeaux administratifs.

---

## 2. Structure des Portails d'Accès et Groupes de Routes

L'application organise ses interfaces en **4 portails étanches** :

| Portail | URL Racine | Rôles Autorisés | Caractéristiques d'Accès |
|---|---|---|---|
| **Portail Public** | `/` | Tout visiteur | Page d'accueil informative, pages légales (CGV, Mentions, Confidentialité), aide générale, accès vers les formulaires de connexion des 3 portails. Recherche et carte verrouillées (`public_discovery_enabled = false`). |
| **Portail Acheteur** | `/acheteur` | `CUSTOMER` | Inscription, connexion, tableau de bord client épuré (D-14), recherche au clic, commande de bouteilles, factures, Infos. |
| **Portail Distributeur** | `/distributeur` | `DISTRIBUTOR` | Inscription & KYC, connexion, gestion du stock qualitatif, commandes à préparer, mode vente au comptoir (D-16), approvisionnements PLEINGAZ, gestion des sous-comptes boutique. |
| **Portail Livreur** | `/livreur` | `COURIER` | Inscription, connexion, interface mobile légère PWA, gestion des missions, double confirmation ("J'ai livré"), suivi de caisse espèces. |
| **Portail Personnel (Staff)** | `/<CONFIG_STAFF_URL>` *(ex: /ops-control)* | `SUPPORT_AGENT`, `DISTRIBUTOR_MANAGER`, `LOGISTICS_MANAGER`, `FINANCE_MANAGER`, `ACCOUNT_MANAGER`, `ADMIN`, `SUPER_ADMIN` | **URL non référencée** paramétrée dans les variables d'environnement (`STAFF_PORTAL_ROUTE`). **Absente à 100% du sitemap, de robots.txt et d'aucun lien public**. Authentification renforcée : Mot de passe fort + **TOTP obligatoire** (Google Authenticator / FreeOTP). Déconnexion automatique après 15 min d'inactivité. |

---

## 3. Mécanismes Techniques d'Isolation et Cloisonnement

### 3.1 Découpage des Bundles JavaScript (Code Splitting par Portail)
Pour garantir qu'un utilisateur inspectant les sources JavaScript de son navigateur ne puisse extraire aucune route, composant ou logique métier d'un autre espace :
- Les applications Web Next.js sont configurées avec des sous-arborescences isolées : `app/(portals)/acheteur/`, `app/(portals)/distributeur/`, `app/(portals)/livreur/`, `app/(staff)/`.
- Chaque groupe de routes charge son propre bundle découpé dynamiquement (Dynamic Imports & Route Groups).
- Le bundle acheteur ne contient aucun module lié aux fonctionnalités distributeurs, livreurs ou administration.

### 3.2 Jeton de Session Lié à l'Audience du Portail (Audience-Bound JWT)
Le jeton JWT émis lors de la connexion porte obligatoirement une claim standard `aud` (Audience) correspondant strictement au portail de connexion :

```json
{
  "sub": "user-uuid-849204",
  "aud": "pleingaz:portal:customer",
  "portal": "CUSTOMER",
  "deviceId": "dev-928410",
  "iss": "https://api.monpleingaz.com",
  "iat": 1730080000,
  "exp": 1730080900
}
```

### 3.3 Règle API : Réponse 404 Systématique (Jamais de 403 Inter-Espaces)
- Lorsqu'une requête API authentifiée se présente sur une route métier n'appartenant pas à l'audience du jeton (ex: un jeton `aud: customer` appelant `/api/v1/distributor/inventory` ou `/api/v1/admin/*`), le garde d'authentification API (`PortalAudienceGuard`) renvoie **immédiatement une réponse HTTP 404 Not Found**, et **jamais un code 403 Forbidden**.
- **Justification de sécurité** : Un code 403 confirme à un attaquant que la route existe et qu'il s'agit d'une ressource protégée. Un code 404 neutralise toute reconnaissance cartographique de l'API.

---

## 4. Traçabilité des Requêtes et Gestion des Sessions (D-11.6)

Chaque requête transitant par le système fait l'objet d'une traçabilité rigoureuse :

1. **En-têtes de Contexte Obligatoires** :
   - `X-Request-ID` : Identifiant unique de corrélation généré à chaque appel API.
   - `User-Agent` : Empreinte de l'appareil client.
   - `X-Forwarded-For` : Adresse IP source du client.
2. **Durée de conservation des adresses IP** :
   - Les adresses IP brutes associées aux sessions sont conservées pour une durée paramétrable dans `Setting` (`audit_ip_retention_days = 90` jours par défaut), puis anonymisées/purgées conformément aux exigences de protection de la vie privée.
3. **Journalisation `AuditLog` systématique** :
   - Toute opération de mutation de données (création, mise à jour, suppression, changement d'état).
   - Toute consultation de **donnée sensible** (pièces d'identité KYC, coordonnées bancaires/MoMo de reversement, numéros non masqués par le gestionnaire de compte).
4. **Supervision des Sessions par l'Utilisateur et l'Administrateur** :
   - Dans chaque espace, un écran de sécurité permet à l'utilisateur de consulter l'historique de ses connexions : Date/Heure, Type d'appareil, Ville approximative (résolue sans géolocalisation fine), Session courante.
   - Bouton de **Déconnexion à distance** permettant de révoquer immédiatement une session suspecte.
   - Envoi d'une alerte immédiate (notification in-app et indicateur visuel) en cas de détection d'une connexion depuis un **nouvel appareil inconnu**.
5. **Redirection Directe Post-Authentification (D-11.7)** :
   - Dès la validation des identifiants sur un portail, l'utilisateur est redirigé immédiatement vers la page d'accueil de son espace sans aucun écran intermédiaire de choix de profil.

---

## 5. Spécification du Test Automatisé de Non-Fuite (C-06.1)

Le système intègre un scénario de test E2E automatisé (Playwright / Jest) exécutable en intégration continue :

```typescript
describe('E2E Isolation - Règle Zéro Fuite', () => {
  it('test_customer_portal_zero_leakage', async () => {
    // 1. Connexion en tant qu'acheteur
    const session = await loginAs('CUSTOMER');
    
    // 2. Analyse du DOM complet de l'espace acheteur
    const pageContent = await session.getPageContent('/acheteur');
    
    // 3. Vérification formelle de l'absence de mentions tierces
    expect(pageContent).not.toMatch(/devenir distributeur/i);
    expect(pageContent).not.toMatch(/espace livreur/i);
    expect(pageContent).not.toMatch(/control center/i);
    expect(pageContent).not.toMatch(/changer de profil/i);
    
    // 4. Analyse du bundle JS chargé
    const loadedScripts = await session.getLoadedScriptSources();
    for (const script of loadedScripts) {
      expect(script).not.toContain('/distributor/');
      expect(script).not.toContain('/admin/');
      expect(script).not.toContain('RoleName.');
    }
    
    // 5. Test d'appel API inter-espaces -> doit renvoyer 404
    const res = await session.apiGet('/api/v1/distributor/inventory');
    expect(res.status).toBe(404);
  });
});
```

---

## 6. Synthèse des Endpoints d'Espace et Sessions

| Méthode | Route | Rôle / Accès | Description |
|---|---|---|---|
| `GET` | `/api/v1/user/sessions` | Authentifié (Tout portail) | Liste des sessions actives et appareils du compte connecté. |
| `DELETE`| `/api/v1/user/sessions/:id` | Authentifié (Tout portail) | Révocation d'une session distante spécifique. |
| `DELETE`| `/api/v1/user/sessions/all-others` | Authentifié (Tout portail) | Déconnexion de tous les autres appareils sauf la session active. |
| `GET` | `/api/v1/user/audit-history` | Authentifié (Tout portail) | Relevé des événements de sécurité du compte (connexions, modifications mot de passe). |
| `POST` | `/api/v1/staff/totp/verify` | Staff PLEINGAZ | Validation du second facteur TOTP pour l'accès au Control Center. |
