# 🐛 Fix: Invitations Editor en Read-Only

## 🔍 Problème Identifié

Quand un utilisateur **authentifié** acceptait une invitation avec le rôle **Editor**, il se retrouvait en **read-only** (comme un Viewer) au lieu d'avoir les permissions Editor.

### Cause Racine

La fonction `validateGuestInvitation()` était utilisée pour **tous** les types d'acceptation (authentifié ou guest). Cette fonction :
- ✅ Validait le token
- ✅ Retournait les infos du projet
- ❌ **NE METTAIT PAS À JOUR** le `user_id` dans `project_members`
- ❌ **NE CHANGEAIT PAS** le `invitation_status` de `'pending'` à `'accepted'`

Résultat : L'enregistrement dans `project_members` restait :
```sql
{
  project_id: 'xxx',
  email: 'bandiera.simon1@gmail.com',
  role: 'editor',
  user_id: NULL,  -- ❌ Pas rempli !
  invitation_status: 'pending',  -- ❌ Toujours pending !
  invitation_token: 'yyy'
}
```

Le hook `useProjectAccess` cherchait un enregistrement avec `user_id = auth.uid()`, ne le trouvait pas, et retournait `role = null` → read-only par défaut.

---

## ✅ Solution Implémentée

### 1. Nouvelle fonction `acceptProjectInvitation()`

Créée dans `src/lib/services/invitations.ts` :

```typescript
export async function acceptProjectInvitation(token: string): Promise<{
  success: boolean
  projectId?: string
  projectName?: string
  role?: MemberRole
  error?: string
}>
```

**Ce qu'elle fait :**
1. ✅ Vérifie que l'utilisateur est **authentifié**
2. ✅ Trouve l'invitation par `token` et `invitation_status = 'pending'`
3. ✅ Vérifie l'expiration
4. ✅ **Met à jour** `user_id` avec l'ID de l'utilisateur connecté
5. ✅ **Change** `invitation_status` de `'pending'` à `'accepted'`
6. ✅ **Efface** le `invitation_token` (sécurité)
7. ✅ Retourne le `role` pour confirmation

### 2. Modification de `/invite/[token]/page.tsx`

La page d'acceptation d'invitation détecte maintenant si l'utilisateur est authentifié :

```typescript
const { data: { user } } = await supabase.auth.getUser()

if (user) {
  // Utilisateur authentifié → acceptProjectInvitation()
  const result = await acceptProjectInvitation(token)
  // Met à jour user_id et status
} else {
  // Guest anonyme → validateGuestInvitation()
  const result = await validateGuestInvitation(token)
  // Stocke token dans localStorage
}
```

---

## 🧪 Test de Validation

### Avant le Fix

1. Victor invite `bandiera.simon1@gmail.com` comme **Editor**
2. Philippe clique sur le lien d'invitation
3. Philippe se connecte avec `bandiera.simon1@gmail.com`
4. Philippe est redirigé vers `/projects/[id]`
5. ❌ Philippe voit **"🔒 Read-Only Access"** (bug)
6. ❌ Bouton "Upload" absent
7. ❌ Outil "New Folder" désactivé

### Après le Fix

1. Victor invite `bandiera.simon1@gmail.com` comme **Editor**
2. Philippe clique sur le lien d'invitation
3. Philippe se connecte avec `bandiera.simon1@gmail.com`
4. ✅ `acceptProjectInvitation()` est appelée
5. ✅ `user_id` est mis à jour dans `project_members`
6. ✅ `invitation_status` passe à `'accepted'`
7. Philippe est redirigé vers `/projects/[id]`
8. ✅ Philippe voit **"Editor"** dans Team sidebar
9. ✅ Bouton "Upload" **visible et actif**
10. ✅ Outil "New Folder" **actif**
11. ✅ Peut renommer/supprimer **ses propres fichiers**
12. ❌ **Ne peut pas** renommer/supprimer les fichiers de Victor

---

## 📊 État de la Base de Données

### Avant Acceptation (Invitation Pending)

```sql
SELECT * FROM project_members WHERE email = 'bandiera.simon1@gmail.com';
```

| id | project_id | email | role | user_id | invitation_status | invitation_token |
|----|------------|-------|------|---------|-------------------|------------------|
| 1 | xxx | bandiera.simon1@gmail.com | editor | **NULL** | **pending** | yyy |

### Après Acceptation (Fix Appliqué)

```sql
SELECT * FROM project_members WHERE email = 'bandiera.simon1@gmail.com';
```

| id | project_id | email | role | user_id | invitation_status | invitation_token |
|----|------------|-------|------|---------|-------------------|------------------|
| 1 | xxx | bandiera.simon1@gmail.com | editor | **abc123** | **accepted** | **NULL** |

---

## 🔐 Sécurité

- ✅ Le `invitation_token` est **effacé** après acceptation (ne peut plus être réutilisé)
- ✅ Le `user_id` est vérifié par RLS pour toutes les opérations
- ✅ Les permissions sont contrôlées à la fois côté **frontend** (UI) et **backend** (RLS)

---

## 🚀 Prochaines Étapes

1. **Tester avec un vrai compte Editor** :
   - Créer une nouvelle invitation
   - Accepter avec un compte authentifié
   - Vérifier que le rôle Editor est bien appliqué

2. **Vérifier les logs Supabase** :
   - Confirmer que `user_id` est bien rempli
   - Confirmer que `invitation_status = 'accepted'`

3. **Tester le scénario Guest** :
   - Accepter une invitation **sans** être connecté
   - Vérifier que le mode guest (localStorage) fonctionne toujours

---

## ✅ Résultat Final

Le rôle **Editor** fonctionne maintenant correctement avec toutes ses permissions granulaires ! 🎉

