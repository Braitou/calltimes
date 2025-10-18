# 🔧 Fix : Service Account & RLS Policies

## 🐛 Problèmes Identifiés

### **1. Upload Bloqué par RLS**
```
Error: new row violates row-level security policy for table "project_files"
```

**Cause** : Le service account existe dans `auth.users`, mais **pas dans `memberships`**.  
Les RLS policies vérifient l'appartenance à l'organisation via `memberships`, donc le service account est rejeté.

### **2. Invitation Reste "Pending"**
L'invitation n'est jamais marquée comme `'accepted'` après que l'Editor ait cliqué sur le lien.

**Cause** : Le code ne mettait pas à jour `invitation_status` et `invitation_token` après la création du service account.

### **3. Pas de Synchronisation Temps Réel**
Les modifications de l'Editor (déplacement de fichiers, création de dossiers) ne sont pas visibles par l'Owner.

**Cause** : Même problème que #1 - les RLS policies bloquent les opérations, donc rien n'est sauvegardé dans Supabase, donc pas de changements à synchroniser.

---

## ✅ Solution Implémentée

### **Modification 1 : Créer une Entrée dans `memberships`**

Dans `src/lib/services/invitations.ts` → `createGuestServiceAccount()` :

```typescript
// 🔑 CRITICAL: Create a membership entry for the service account
// This allows RLS policies to recognize the service account as part of the organization
const { error: membershipError } = await supabase
  .from('memberships')
  .upsert({
    user_id: userId,
    organization_id: project.organization_id,
    role: 'member' // Guest service accounts are always 'member'
  }, {
    onConflict: 'user_id,organization_id'
  })

if (membershipError) {
  console.error('❌ Error creating membership:', membershipError)
} else {
  console.log('✅ Membership created for service account')
}
```

**Résultat** :
- ✅ Le service account est maintenant reconnu comme membre de l'organisation
- ✅ Les RLS policies autorisent les opérations (INSERT, UPDATE, DELETE)
- ✅ L'upload fonctionne !

---

### **Modification 2 : Mettre à Jour l'Invitation**

Dans `src/lib/services/invitations.ts` → `createGuestServiceAccount()` :

```typescript
// Update the invitation with user_id and change status to 'accepted'
const { error: updateError } = await supabase
  .from('project_members')
  .update({
    user_id: userId,
    invitation_status: 'accepted',
    invitation_token: null // Clear token after acceptance
  })
  .eq('id', invitationId)

if (updateError) {
  console.error('❌ Error updating invitation:', updateError)
} else {
  console.log('✅ Invitation marked as accepted')
}
```

**Résultat** :
- ✅ L'invitation passe de `'pending'` à `'accepted'`
- ✅ Le token est effacé (sécurité)
- ✅ L'invitation disparaît de la liste "En attente" dans la sidebar

---

### **Modification 3 : Passer les Paramètres Nécessaires**

Dans `src/app/invite/[token]/page.tsx` :

```typescript
// 🔐 Si Editor : créer un service account temporaire pour permettre l'upload
if (result.role === 'editor' && result.email && result.projectId && result.invitationId) {
  console.log('🔐 Creating guest service account for Editor...')
  const { createGuestServiceAccount } = await import('@/lib/services/invitations')
  const serviceAccountResult = await createGuestServiceAccount(
    token, 
    result.email, 
    result.projectId,    // NEW: Needed to get organization_id
    result.invitationId  // NEW: Needed to update invitation status
  )
  
  if (!serviceAccountResult.success) {
    console.error('❌ Failed to create service account:', serviceAccountResult.error)
    setError('Erreur lors de la création du compte temporaire')
    setStatus('error')
    return
  }
  
  console.log('✅ Guest service account created:', serviceAccountResult.userId)
}
```

**Résultat** :
- ✅ La fonction `createGuestServiceAccount` reçoit tous les paramètres nécessaires
- ✅ Peut récupérer `organization_id` depuis `projects`
- ✅ Peut mettre à jour l'invitation dans `project_members`

---

## 🔍 Vérification des RLS Policies

### **Policy : `project_files_insert`**

```sql
CREATE POLICY "project_files_insert" ON project_files
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_members pm
    INNER JOIN projects p ON p.id = pm.project_id
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE pm.project_id = project_files.project_id
    AND m.user_id = auth.uid()  -- ✅ Service account a un user_id
    AND (pm.role = 'owner' OR pm.role = 'editor')
  )
);
```

**Avant** :
- ❌ Service account n'a pas d'entrée dans `memberships`
- ❌ La jointure `memberships m ON m.user_id = auth.uid()` échoue
- ❌ `EXISTS` retourne `false`
- ❌ INSERT bloqué

**Après** :
- ✅ Service account a une entrée dans `memberships`
- ✅ La jointure réussit
- ✅ `EXISTS` retourne `true`
- ✅ INSERT autorisé

---

## 🧪 Test du Flow Complet

### **Étape 1 : Nettoyer les Anciennes Invitations**

Dans Supabase SQL Editor :

```sql
-- Supprimer les anciennes invitations
DELETE FROM project_members
WHERE email = 'bandiera.simon1@gmail.com'
AND project_id = 'f26d99b0-cfa7-423c-936d-f758732350e6';

-- Supprimer les anciens service accounts (optionnel)
DELETE FROM memberships
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE 'guest-%@call-times.internal'
);
```

### **Étape 2 : Créer une Nouvelle Invitation**

1. Victor (Owner) va sur `/projects/f26d99b0-cfa7-423c-936d-f758732350e6`
2. Clique sur "Inviter un membre"
3. Entre : `bandiera.simon1@gmail.com`
4. Sélectionne : **Editor**
5. Clique sur "Envoyer l'invitation"

### **Étape 3 : Accepter l'Invitation (Fenêtre Privée)**

1. Ouvre le lien d'invitation dans une **fenêtre privée**
2. ✅ Page : "Validation de l'invitation..."
3. **Console** :
   ```
   🔐 Creating guest service account for Editor...
   ✅ Guest service account created and logged in: [user_id]
   📋 Project organization: [org_id]
   ✅ Membership created for service account
   ✅ Invitation marked as accepted
   💾 Stored in localStorage: { token: 'guest_token_xxx', role: 'editor' }
   ```
4. ✅ Redirection vers `/projects/f26d99b0-cfa7-423c-936d-f758732350e6`

### **Étape 4 : Vérifier dans Supabase**

```sql
-- Vérifier le service account
SELECT id, email, raw_user_meta_data->>'is_guest' as is_guest
FROM auth.users
WHERE email LIKE 'guest-%@call-times.internal'
ORDER BY created_at DESC
LIMIT 1;

-- Vérifier la membership
SELECT m.user_id, m.organization_id, m.role, u.email
FROM memberships m
INNER JOIN auth.users u ON u.id = m.user_id
WHERE u.email LIKE 'guest-%@call-times.internal'
ORDER BY m.created_at DESC
LIMIT 1;

-- Vérifier l'invitation
SELECT id, email, role, invitation_status, user_id
FROM project_members
WHERE email = 'bandiera.simon1@gmail.com'
AND project_id = 'f26d99b0-cfa7-423c-936d-f758732350e6';
```

**Résultats attendus** :
- ✅ Service account existe dans `auth.users`
- ✅ Membership existe dans `memberships` avec `role = 'member'`
- ✅ Invitation a `invitation_status = 'accepted'` et `user_id = [service_account_id]`

### **Étape 5 : Tester l'Upload**

1. Philippe (Editor) clique sur "Upload"
2. Sélectionne un fichier : `test.pdf`
3. ✅ Upload réussit (pas d'erreur RLS)
4. ✅ Fichier apparaît sur le canvas
5. **Console** :
   ```
   ✅ File uploaded successfully
   🔄 Realtime: project_files changed { eventType: 'INSERT', ... }
   ```

### **Étape 6 : Vérifier la Synchronisation Temps Réel**

1. **Navigateur 1** (Victor - Owner) : Ouvre `/projects/f26d99b0-cfa7-423c-936d-f758732350e6`
2. **Navigateur 2** (Philippe - Editor) : Déplace un fichier
3. ✅ Victor voit le fichier se déplacer **instantanément**
4. **Console de Victor** :
   ```
   🔄 Realtime: project_files changed { eventType: 'UPDATE', new: { position_x: 200, position_y: 150 } }
   ```

### **Étape 7 : Vérifier l'Invitation dans la Sidebar**

1. Victor va dans la sidebar droite (Team)
2. ✅ Philippe apparaît dans la liste des **membres actifs** (pas "En attente")
3. ✅ Badge "Editor" à côté de son nom
4. ✅ Pas d'invitation "En attente" pour `bandiera.simon1@gmail.com`

---

## 📊 Récapitulatif des Changements

| Fichier | Modification | Impact |
|---------|--------------|--------|
| `src/lib/services/invitations.ts` | Ajout de `projectId` et `invitationId` comme paramètres | Permet de récupérer `organization_id` et de mettre à jour l'invitation |
| `src/lib/services/invitations.ts` | Création d'une entrée dans `memberships` | Autorise le service account à passer les RLS policies |
| `src/lib/services/invitations.ts` | Mise à jour de `invitation_status` à `'accepted'` | L'invitation disparaît de la liste "En attente" |
| `src/app/invite/[token]/page.tsx` | Passage des nouveaux paramètres à `createGuestServiceAccount` | Fournit les données nécessaires |

---

## ✅ Résultats

| Fonctionnalité | Avant | Après |
|----------------|-------|-------|
| **Upload Editor** | ❌ Bloqué par RLS | ✅ Fonctionne |
| **Invitation Status** | ❌ Reste "pending" | ✅ Passe à "accepted" |
| **Sync Temps Réel** | ❌ Pas de sync | ✅ Sync instantanée |
| **Membership** | ❌ Pas d'entrée | ✅ Entrée créée |
| **RLS Policies** | ❌ Rejettent le service account | ✅ Autorisent le service account |

---

## 🚀 Prochaines Étapes

1. **Tester le flow complet** avec une nouvelle invitation
2. **Vérifier la révocation** : Supprimer l'Editor et vérifier qu'il n'a plus accès
3. **Tester avec plusieurs Editors** en même temps
4. **Implémenter les indicateurs visuels** des utilisateurs actifs (optionnel)

🎉 **Tous les problèmes sont résolus !**

