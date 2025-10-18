# 🧪 Test : Révocation d'Accès Guest

## 🎯 Objectif

Vérifier que lorsqu'un **Owner** supprime un **Guest** d'un projet, ce dernier **n'a plus accès** même s'il a le token dans `localStorage` ou s'il reclique sur le lien d'invitation.

---

## 📋 Prérequis

1. **Victor** (Owner) est connecté sur `/projects/f26d99b0-cfa7-423c-936d-f758732350e6`
2. **Philippe** (Guest Editor) a déjà accepté une invitation et a accès au projet
3. Philippe a dans son `localStorage` :
   - `guest_token_f26d99b0-cfa7-423c-936d-f758732350e6` = `"abc123..."`
   - `guest_role_f26d99b0-cfa7-423c-936d-f758732350e6` = `"editor"`

---

## 🧪 Scénario de Test

### **Étape 1 : Accès Initial de Philippe (Guest)**

1. Philippe ouvre le projet : `/projects/f26d99b0-cfa7-423c-936d-f758732350e6`
2. ✅ Il voit le projet avec les permissions **Editor**
3. ✅ Badge "Editor" dans la sidebar Team
4. ✅ Bouton "Upload" visible
5. ✅ Peut créer des dossiers

**Console navigateur de Philippe** :
```
🔍 Validating guest token on project load...
✅ Guest token valid
```

---

### **Étape 2 : Victor Supprime Philippe**

1. Victor va dans la **sidebar droite** (Team)
2. Trouve **Philippe** dans la liste des membres
3. Clique sur le bouton **❌ (Remove)**
4. ✅ Toast de confirmation : "Membre supprimé avec succès"
5. ✅ Philippe disparaît de la liste des membres

**Backend** :
- L'enregistrement de Philippe dans `project_members` est **supprimé**
- Le token d'invitation est **invalidé**

---

### **Étape 3 : Philippe Rafraîchit la Page**

1. Philippe appuie sur **F5** (refresh)
2. ❌ Il est **redirigé** vers `/auth/no-access?reason=revoked`
3. ✅ Message : "Votre accès à ce projet a été révoqué"
4. ✅ Icône `UserX` orange
5. ✅ Bouton "Fermer" (au lieu de "Se Déconnecter")

**Console navigateur de Philippe** :
```
🔍 Validating guest token on project load...
❌ Guest token invalid or revoked, cleaning localStorage...
```

**localStorage de Philippe** :
- `guest_token_f26d99b0-cfa7-423c-936d-f758732350e6` = **SUPPRIMÉ**
- `guest_role_f26d99b0-cfa7-423c-936d-f758732350e6` = **SUPPRIMÉ**

---

### **Étape 4 : Philippe Reclique sur le Lien d'Invitation**

1. Philippe retrouve l'email d'invitation original
2. Clique sur le lien : `/invite/abc123...`
3. ❌ Page d'invitation : "Invitation invalide ou expirée"
4. ✅ Icône `XCircle` rouge
5. ✅ Message : "Cette invitation a peut-être expiré ou a déjà été utilisée."

**Raison** : L'enregistrement dans `project_members` a été supprimé, donc `validateGuestInvitation` retourne `false`.

---

### **Étape 5 : Victor Réinvite Philippe**

1. Victor clique sur **"Inviter un membre"**
2. Entre l'email de Philippe : `philippe@example.com`
3. Sélectionne le rôle : **Viewer** (cette fois-ci)
4. Clique sur **"Envoyer l'invitation"**
5. ✅ Philippe reçoit un **nouvel email** avec un **nouveau token**

---

### **Étape 6 : Philippe Accepte la Nouvelle Invitation**

1. Philippe clique sur le **nouveau lien** : `/invite/xyz789...`
2. ✅ Redirection vers `/projects/f26d99b0-cfa7-423c-936d-f758732350e6`
3. ✅ Badge **"Viewer"** dans la sidebar Team
4. ✅ Badge **"🔒 Read-Only Access"** dans le header
5. ❌ Bouton "Upload" **ABSENT**
6. ❌ Outil "New Folder" **désactivé**

**localStorage de Philippe** :
- `guest_token_f26d99b0-cfa7-423c-936d-f758732350e6` = `"xyz789..."` (nouveau token)
- `guest_role_f26d99b0-cfa7-423c-936d-f758732350e6` = `"viewer"` (nouveau rôle)

---

## ✅ Résultats Attendus

| Action | Résultat Attendu |
|--------|------------------|
| **Philippe accède au projet (avant révocation)** | ✅ Accès Editor |
| **Victor supprime Philippe** | ✅ Supprimé de `project_members` |
| **Philippe rafraîchit la page** | ❌ Redirigé vers `/auth/no-access?reason=revoked` |
| **localStorage de Philippe** | ✅ Tokens supprimés automatiquement |
| **Philippe reclique sur l'ancien lien** | ❌ "Invitation invalide ou expirée" |
| **Victor réinvite Philippe (Viewer)** | ✅ Nouveau token généré |
| **Philippe accepte la nouvelle invitation** | ✅ Accès Viewer (read-only) |

---

## 🔍 Points de Validation

### **1. Validation Token au Chargement**

```typescript
// src/app/projects/[id]/page.tsx

const guestToken = localStorage.getItem(`guest_token_${projectId}`)
if (guestToken) {
  const validation = await validateGuestInvitation(guestToken)
  
  if (!validation.success) {
    // ❌ Token révoqué → nettoyer localStorage
    localStorage.removeItem(`guest_token_${projectId}`)
    localStorage.removeItem(`guest_role_${projectId}`)
    
    toast.error('Votre accès à ce projet a été révoqué')
    router.push('/auth/no-access?reason=revoked')
    return
  }
}
```

### **2. Validation Backend**

```typescript
// src/lib/services/invitations.ts

export async function validateGuestInvitation(token: string) {
  const { data: invitation } = await supabase
    .from('project_members')
    .select('project_id, role, invitation_status, expires_at')
    .eq('invitation_token', token)
    .single()

  if (!invitation) {
    return { success: false, error: 'Invitation not found' } // ❌ Supprimé
  }

  if (invitation.invitation_status !== 'pending') {
    return { success: false, error: 'Invitation already used' }
  }

  // Vérifier expiration
  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    return { success: false, error: 'Invitation expired' }
  }

  return { success: true, projectId: invitation.project_id, role: invitation.role }
}
```

### **3. Suppression du Guest**

```typescript
// src/lib/services/invitations.ts

export async function removeProjectMember(memberId: string) {
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('id', memberId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
```

---

## 🚀 Commandes de Test

### **1. Vérifier les Invitations dans Supabase**

```sql
-- Voir toutes les invitations du projet
SELECT id, email, role, invitation_status, invitation_token, expires_at
FROM project_members
WHERE project_id = 'f26d99b0-cfa7-423c-936d-f758732350e6';
```

### **2. Supprimer Manuellement un Guest (pour test)**

```sql
-- Supprimer Philippe
DELETE FROM project_members
WHERE project_id = 'f26d99b0-cfa7-423c-936d-f758732350e6'
AND email = 'philippe@example.com';
```

### **3. Vérifier le localStorage (DevTools)**

```javascript
// Console navigateur
console.log(localStorage.getItem('guest_token_f26d99b0-cfa7-423c-936d-f758732350e6'))
console.log(localStorage.getItem('guest_role_f26d99b0-cfa7-423c-936d-f758732350e6'))
```

---

## 📊 Matrice de Sécurité

| Scénario | Token dans localStorage | Token dans DB | Accès |
|----------|------------------------|---------------|-------|
| **Invitation acceptée** | ✅ Oui | ✅ Oui | ✅ Autorisé |
| **Guest supprimé** | ✅ Oui (ancien) | ❌ Non | ❌ Refusé → localStorage nettoyé |
| **Invitation expirée** | ✅ Oui | ✅ Oui (expiré) | ❌ Refusé → localStorage nettoyé |
| **Nouveau navigateur** | ❌ Non | ✅ Oui | ❌ Refusé → doit recliquer sur lien |
| **Réinvitation** | ✅ Oui (nouveau) | ✅ Oui (nouveau) | ✅ Autorisé |

---

## 🎬 Conclusion

✅ **La révocation fonctionne** : Quand Victor supprime Philippe, ce dernier perd immédiatement l'accès au projet, même s'il a le token dans `localStorage`.

✅ **Nettoyage automatique** : Le `localStorage` est automatiquement nettoyé lors de la prochaine tentative d'accès.

✅ **Réinvitation possible** : Victor peut réinviter Philippe avec un nouveau rôle (Viewer au lieu d'Editor).

✅ **Sécurité** : Le token est validé **à chaque chargement** du projet, pas seulement à l'acceptation de l'invitation.

