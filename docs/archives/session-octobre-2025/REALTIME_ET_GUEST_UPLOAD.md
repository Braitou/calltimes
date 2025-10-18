# 🔄 Temps Réel & Upload pour Guests Editors

## 🎯 Problèmes Résolus

### **Problème 1 : Pas de Synchronisation Temps Réel**
❌ **Avant** : Les modifications d'un utilisateur ne sont pas visibles par les autres en temps réel.
✅ **Après** : Supabase Realtime diffuse tous les changements instantanément.

### **Problème 2 : Editors Guests Ne Peuvent Pas Uploader**
❌ **Avant** : Erreur "User not authenticated" car pas de `auth.uid()`.
✅ **Après** : Service account temporaire créé automatiquement pour les Editors.

---

## 🔄 Solution 1 : Supabase Realtime

### **Activation dans Supabase**

Migration SQL : `supabase/migrations/20241018000001_enable_realtime.sql`

```sql
-- Activer Realtime pour les tables du Project Hub
ALTER PUBLICATION supabase_realtime ADD TABLE project_files;
ALTER PUBLICATION supabase_realtime ADD TABLE project_folders;
ALTER PUBLICATION supabase_realtime ADD TABLE call_sheets;
ALTER PUBLICATION supabase_realtime ADD TABLE project_members;
```

### **Implémentation Client**

Dans `src/app/projects/[id]/page.tsx` :

```typescript
// 🔄 REALTIME : Écouter les changements en temps réel
useEffect(() => {
  if (!projectId) return

  console.log('🔄 Setting up Realtime subscriptions for project:', projectId)

  const supabase = createSupabaseClient()

  // Écouter les changements sur project_files
  const filesChannel = supabase
    .channel(`project-files-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'project_files',
        filter: `project_id=eq.${projectId}`
      },
      (payload) => {
        console.log('🔄 Realtime: project_files changed', payload)
        loadProjectData() // Recharger les données
      }
    )
    .subscribe()

  // Écouter project_folders et call_sheets de la même manière...

  // Cleanup
  return () => {
    supabase.removeChannel(filesChannel)
    // ...
  }
}, [projectId])
```

### **Résultat**

- ✅ Victor (Owner) déplace un fichier → Philippe (Editor) voit le changement **instantanément**
- ✅ Philippe (Editor) uploade un fichier → Victor voit le nouveau fichier **en temps réel**
- ✅ Marie (Viewer) voit tous les changements en direct (mais ne peut pas modifier)

---

## 🔐 Solution 2 : Service Account pour Guests Editors

### **Concept**

Créer un compte Supabase temporaire pour chaque guest Editor :
- **Email** : `guest-[token]@call-times.internal`
- **Password** : `guest-service-[token]` (déterministe)
- **Métadonnées** : `{ is_guest: true, guest_email: "philippe@example.com" }`

### **Implémentation**

#### **1. Fonction de Création du Service Account**

Dans `src/lib/services/invitations.ts` :

```typescript
export async function createGuestServiceAccount(token: string, email: string): Promise<{
  success: boolean
  userId?: string
  error?: string
}> {
  const supabase = createSupabaseClient()
  const password = `guest-service-${token}`
  const guestEmail = `guest-${token}@call-times.internal`

  // Essayer de créer le compte (échouera si déjà existant)
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: guestEmail,
    password,
    options: {
      data: {
        full_name: `Guest (${email})`,
        is_guest: true,
        guest_email: email
      }
    }
  })

  if (signUpError && !signUpError.message.includes('already registered')) {
    return { success: false, error: signUpError.message }
  }

  // Si signup réussi, on est déjà connecté
  if (signUpData.user) {
    return { success: true, userId: signUpData.user.id }
  }

  // Si compte existe déjà, se connecter
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: guestEmail,
    password
  })

  if (signInError) {
    return { success: false, error: signInError.message }
  }

  return { success: true, userId: signInData.user?.id }
}
```

#### **2. Appel lors de l'Acceptation de l'Invitation**

Dans `src/app/invite/[token]/page.tsx` :

```typescript
const handleAcceptInvitation = async () => {
  // Valider le token
  const result = await validateGuestInvitation(token)

  if (!result.success) {
    setStatus('error')
    return
  }

  // 🔐 Si Editor : créer un service account temporaire
  if (result.role === 'editor' && result.email) {
    console.log('🔐 Creating guest service account for Editor...')
    const serviceAccountResult = await createGuestServiceAccount(token, result.email)
    
    if (serviceAccountResult.success) {
      console.log('✅ Guest service account created:', serviceAccountResult.userId)
      
      // Mettre à jour l'invitation avec le user_id
      const supabase = createSupabaseClient()
      await supabase
        .from('project_members')
        .update({ user_id: serviceAccountResult.userId })
        .eq('id', result.invitationId)
    }
  }

  // Stocker le token dans localStorage
  localStorage.setItem(`guest_token_${result.projectId}`, token)
  localStorage.setItem(`guest_role_${result.projectId}`, result.role)

  // Redirection vers le projet
  router.push(`/projects/${result.projectId}`)
}
```

### **Résultat**

- ✅ Philippe (Editor) accepte l'invitation
- ✅ Un compte `guest-abc123@call-times.internal` est créé automatiquement
- ✅ Philippe est **authentifié** avec ce compte
- ✅ `auth.uid()` retourne l'ID du service account
- ✅ Les RLS policies **autorisent** l'upload car `auth.uid()` existe
- ✅ `uploaded_by` dans `project_files` = ID du service account
- ✅ Philippe peut **uploader, créer des dossiers, déplacer des fichiers**
- ✅ Philippe peut **supprimer/renommer** ses propres fichiers (car `uploaded_by = auth.uid()`)
- ❌ Philippe **ne peut pas** supprimer les fichiers de Victor (car `uploaded_by ≠ auth.uid()`)

---

## 📊 Matrice des Permissions (Mise à Jour)

| Action | Owner (Victor) | Editor (Philippe - Service Account) | Viewer (Marie - Anonyme) |
|--------|----------------|-------------------------------------|--------------------------|
| **Voir fichiers** | ✅ | ✅ | ✅ |
| **Télécharger fichiers** | ✅ | ✅ | ✅ |
| **Uploader fichiers** | ✅ | ✅ (avec service account) | ❌ |
| **Créer dossiers** | ✅ | ✅ (avec service account) | ❌ |
| **Déplacer fichiers** | ✅ | ✅ | ❌ |
| **Renommer ses fichiers** | ✅ | ✅ | ❌ |
| **Supprimer ses fichiers** | ✅ | ✅ | ❌ |
| **Renommer fichiers d'autres** | ✅ | ❌ | ❌ |
| **Supprimer fichiers d'autres** | ✅ | ❌ | ❌ |
| **Gérer call sheets** | ✅ | ❌ | ❌ |
| **Inviter membres** | ✅ | ❌ | ❌ |
| **Voir changements en temps réel** | ✅ | ✅ | ✅ |

---

## 🧪 Test du Flow Complet

### **Étape 1 : Victor Invite Philippe (Editor)**

```
1. Victor va sur /projects/[id]
2. Clique sur "Inviter un membre"
3. Entre : philippe@example.com
4. Sélectionne : Editor
5. Clique sur "Envoyer l'invitation"
```

### **Étape 2 : Philippe Accepte l'Invitation**

```
1. Philippe reçoit l'email
2. Clique sur le lien : /invite/abc123...
3. ✅ Page : "Validation de l'invitation..."
4. 🔐 Console : "Creating guest service account for Editor..."
5. ✅ Console : "Guest service account created: [user_id]"
6. 💾 Console : "Stored in localStorage: { token: 'guest_token_xxx', role: 'editor' }"
7. ✅ Redirection vers /projects/[id]
```

### **Étape 3 : Philippe Uploade un Fichier**

```
1. Philippe voit le bouton "Upload" (actif)
2. Clique sur "Upload"
3. Sélectionne un fichier : "plan_de_travail.pdf"
4. ✅ Upload réussit (car auth.uid() existe)
5. ✅ Fichier apparaît sur le canvas
6. ✅ Victor voit le fichier apparaître EN TEMPS RÉEL (Realtime)
```

**Console de Philippe** :
```
🔐 Authenticated as: guest-abc123@call-times.internal
✅ File uploaded successfully
```

**Console de Victor** :
```
🔄 Realtime: project_files changed { eventType: 'INSERT', new: { id: '...', name: 'plan_de_travail.pdf', uploaded_by: '[service_account_id]' } }
```

### **Étape 4 : Victor Déplace le Fichier**

```
1. Victor drag & drop le fichier vers une nouvelle position
2. ✅ Position sauvegardée dans Supabase
3. ✅ Philippe voit le fichier se déplacer EN TEMPS RÉEL
```

**Console de Philippe** :
```
🔄 Realtime: project_files changed { eventType: 'UPDATE', new: { position_x: 200, position_y: 150 } }
```

### **Étape 5 : Philippe Essaye de Supprimer un Fichier de Victor**

```
1. Philippe clique droit sur un fichier uploadé par Victor
2. ❌ Option "Supprimer" est GRISÉE (disabled)
3. ✅ Tooltip : "Vous ne pouvez supprimer que vos propres fichiers"
```

**Raison** : `useFileOwnership` détecte que `uploaded_by ≠ auth.uid()`.

---

## 🔒 Sécurité

### **Service Account**

- ✅ Email unique par token : `guest-[token]@call-times.internal`
- ✅ Password déterministe : `guest-service-[token]`
- ✅ Métadonnées : `{ is_guest: true, guest_email: "philippe@example.com" }`
- ✅ Lié à l'invitation dans `project_members` via `user_id`

### **Révocation**

Quand Victor supprime Philippe :
1. ✅ L'enregistrement dans `project_members` est supprimé
2. ✅ Le service account **reste** dans `auth.users` (pas de problème)
3. ✅ Philippe ne peut plus accéder au projet (validation token échoue)
4. ✅ Les fichiers uploadés par Philippe **restent** (avec `uploaded_by = service_account_id`)
5. ✅ Victor peut les supprimer (car Owner)

### **RLS Policies**

Les policies existantes fonctionnent **sans modification** :
- ✅ `project_files_insert` : Autorise si `auth.uid()` existe et est Editor/Owner
- ✅ `project_files_update` : Autorise si `uploaded_by = auth.uid()` (Editor) ou Owner
- ✅ `project_files_delete` : Autorise si `uploaded_by = auth.uid()` (Editor) ou Owner

---

## 📝 Prochaines Étapes (Optionnel)

### **1. Indicateurs Visuels des Utilisateurs Actifs**

Afficher des avatars colorés pour chaque utilisateur connecté :
- 🟢 Victor (Owner) - Vert
- 🔵 Philippe (Editor) - Bleu
- 🟡 Marie (Viewer) - Jaune

**Implémentation** : Utiliser Supabase Presence pour tracker les utilisateurs actifs.

### **2. Curseurs en Temps Réel**

Afficher le curseur de chaque utilisateur sur le canvas (comme Figma).

### **3. Notifications de Changements**

Toast notification quand un autre utilisateur modifie quelque chose :
- "Philippe a uploadé plan_de_travail.pdf"
- "Victor a déplacé le fichier vers Dossier A"

---

## ✅ Résumé

| Fonctionnalité | Status |
|----------------|--------|
| **Supabase Realtime activé** | ✅ |
| **Synchronisation temps réel** | ✅ |
| **Service account pour Editors** | ✅ |
| **Upload pour Editors guests** | ✅ |
| **RLS policies compatibles** | ✅ |
| **Révocation fonctionne** | ✅ |
| **Indicateurs visuels** | ⏳ (optionnel) |

🎉 **Les deux problèmes sont résolus !**

