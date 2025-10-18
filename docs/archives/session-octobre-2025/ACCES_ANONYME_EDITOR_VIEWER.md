# 🎫 Accès Anonyme : Editor & Viewer (Sans Compte)

## 🎯 Objectif

Permettre à des **invités externes** d'accéder à un projet **sans créer de compte Call Times**, avec deux niveaux de permissions :
- **Viewer** : Read-only + Download
- **Editor** : Upload + Déplacer fichiers + Créer dossiers

---

## 👥 Hiérarchie des Accès

### **1. Membres Organisation (Owner)**
- ✅ **Compte Call Times requis**
- ✅ Accès complet à tous les projets de leur organisation
- ✅ Peuvent gérer les call sheets
- ✅ Peuvent inviter des membres et des invités
- ✅ Peuvent supprimer n'importe quel fichier

### **2. Invités Projet - Editor**
- ❌ **PAS de compte Call Times requis**
- ✅ Accès anonyme via token dans `localStorage`
- ✅ Peuvent **uploader** des fichiers
- ✅ Peuvent **créer des dossiers**
- ✅ Peuvent **déplacer** des fichiers
- ✅ Peuvent **renommer/supprimer** leurs propres fichiers
- ❌ **NE PEUVENT PAS** supprimer les fichiers d'autres utilisateurs
- ❌ **NE PEUVENT PAS** gérer les call sheets
- ❌ **NE PEUVENT PAS** inviter d'autres membres

### **3. Invités Projet - Viewer**
- ❌ **PAS de compte Call Times requis**
- ✅ Accès anonyme via token dans `localStorage`
- ✅ Peuvent **voir** tous les fichiers
- ✅ Peuvent **télécharger** les fichiers
- ❌ **NE PEUVENT PAS** uploader, créer, modifier ou supprimer

---

## 🔄 Flow d'Invitation

### **Étape 1 : Invitation par un Owner**

```
1. Victor (Owner) va sur /projects/[id]
2. Dans la sidebar droite (Team), clique sur "Inviter un membre"
3. Entre l'email : "philippe@example.com"
4. Sélectionne le rôle : "Editor" ou "Viewer"
5. Clique sur "Envoyer l'invitation"
```

### **Étape 2 : Réception de l'Email**

```
Philippe reçoit un email avec :
- Nom du projet
- Nom de l'inviteur (Victor)
- Rôle assigné (Editor ou Viewer)
- Lien d'invitation : https://call-times.app/invite/[token]
```

### **Étape 3 : Acceptation de l'Invitation**

```
1. Philippe clique sur le lien
   ↓
2. Page /invite/[token] :
   - Valide le token
   - Récupère projectId + projectName + role
   ↓
3. Stockage dans localStorage :
   - guest_token_[projectId] = token
   - guest_role_[projectId] = "editor" (ou "viewer")
   ↓
4. Redirection vers /projects/[projectId]
   ↓
5. Philippe accède au projet avec les permissions Editor ✅
```

---

## 🔐 Stockage & Sécurité

### **localStorage**

```javascript
// Stocké après acceptation de l'invitation
localStorage.setItem('guest_token_f26d99b0-cfa7-423c-936d-f758732350e6', 'abc123...')
localStorage.setItem('guest_role_f26d99b0-cfa7-423c-936d-f758732350e6', 'editor')
```

### **Lecture des Permissions**

Le hook `useProjectAccess(projectId)` :
1. Vérifie si `guest_token_[projectId]` existe dans `localStorage`
2. Si oui, lit `guest_role_[projectId]`
3. Définit les permissions selon le rôle :
   - **Editor** : `canModify = true`, `role = 'editor'`
   - **Viewer** : `canModify = false`, `role = 'viewer'`

### **Validation Backend (RLS)**

Les RLS policies Supabase vérifient :
- **Editors** : Peuvent INSERT/UPDATE/DELETE seulement leurs propres fichiers (`uploaded_by = auth.uid()`)
- **Viewers** : Peuvent seulement SELECT (lecture)

⚠️ **Important** : Les invités anonymes n'ont **pas** de `auth.uid()`, donc les RLS policies les bloquent automatiquement pour les opérations d'écriture. Il faut adapter les policies pour accepter les tokens guests.

---

## 📊 Matrice des Permissions

| Action | Owner | Editor (Anonyme) | Viewer (Anonyme) |
|--------|-------|------------------|------------------|
| **Voir fichiers** | ✅ | ✅ | ✅ |
| **Télécharger fichiers** | ✅ | ✅ | ✅ |
| **Uploader fichiers** | ✅ | ✅ | ❌ |
| **Créer dossiers** | ✅ | ✅ | ❌ |
| **Déplacer fichiers** | ✅ | ✅ | ❌ |
| **Renommer ses fichiers** | ✅ | ✅ | ❌ |
| **Supprimer ses fichiers** | ✅ | ✅ | ❌ |
| **Renommer fichiers d'autres** | ✅ | ❌ | ❌ |
| **Supprimer fichiers d'autres** | ✅ | ❌ | ❌ |
| **Gérer call sheets** | ✅ | ❌ | ❌ |
| **Inviter membres** | ✅ | ❌ | ❌ |

---

## 🧪 Test du Flow

### **Test 1 : Invité Editor**

1. **Depuis le projet** (connecté avec Victor) :
   - Inviter `philippe@example.com` avec rôle **Editor**
2. **Ouvrir le lien d'invitation** dans une fenêtre privée
3. **Vérifier dans la console navigateur** :
   ```
   ✅ Invitation valid: { projectId: 'xxx', role: 'editor' }
   💾 Stored in localStorage: { token: 'guest_token_xxx', role: 'editor' }
   ```
4. **Vérifier dans le projet** :
   - ✅ Badge "Editor" dans Team sidebar
   - ✅ Bouton **"Upload"** visible et actif
   - ✅ Outil **"New Folder"** actif
   - ✅ Peut uploader un fichier
   - ✅ Peut créer un dossier
   - ✅ Peut déplacer un fichier
   - ❌ **NE PEUT PAS** supprimer un fichier uploadé par Victor

### **Test 2 : Invité Viewer**

1. **Depuis le projet** (connecté avec Victor) :
   - Inviter `marie@example.com` avec rôle **Viewer**
2. **Ouvrir le lien d'invitation** dans une fenêtre privée
3. **Vérifier dans la console navigateur** :
   ```
   ✅ Invitation valid: { projectId: 'xxx', role: 'viewer' }
   💾 Stored in localStorage: { token: 'guest_token_xxx', role: 'viewer' }
   ```
4. **Vérifier dans le projet** :
   - ✅ Badge "Viewer" dans Team sidebar
   - ✅ Badge **"🔒 Read-Only Access"** dans le header
   - ❌ Bouton **"Upload"** **ABSENT**
   - ❌ Outil **"New Folder"** **désactivé**
   - ❌ Context menu : seulement "Télécharger" (pas Renommer/Supprimer)
   - ✅ Peut télécharger des fichiers

---

## ⚠️ Limitations Actuelles

### **1. RLS Policies**

Les RLS policies actuelles utilisent `auth.uid()` pour vérifier les permissions. Les invités anonymes **n'ont pas** de `auth.uid()`, donc :
- ❌ Les Editors anonymes **ne peuvent pas** uploader (bloqué par RLS)
- ✅ Les Viewers anonymes peuvent lire (SELECT autorisé sans auth)

**Solution** : Adapter les RLS policies pour accepter les tokens guests stockés dans `localStorage`. Cela nécessite une approche différente, comme :
- Utiliser une fonction Supabase Edge pour valider le token guest
- Ou créer un "user anonyme" temporaire avec un `user_id` généré

### **2. Persistance du Token**

Le token est stocké dans `localStorage`, donc :
- ✅ Persiste entre les sessions (même après fermeture du navigateur)
- ❌ Lié au navigateur (si l'utilisateur change de navigateur, il doit re-cliquer sur le lien)
- ❌ Pas de synchronisation entre appareils

---

## 🚀 Prochaines Étapes

1. **Adapter les RLS Policies** pour accepter les tokens guests
2. **Tester l'upload** en tant qu'Editor anonyme
3. **Implémenter la validation côté backend** du token guest
4. **Ajouter une expiration** du token dans `localStorage` (7 jours)
5. **Gérer la révocation** des invitations (supprimer le token de `localStorage`)

---

## 💡 Cas d'Usage Réel

**Exemple : 1er Assistant Réalisateur**

```
1. Victor (Producteur, Owner) crée un projet "Tournage Nike"
2. Victor invite Philippe (1er AD) comme "Editor"
3. Philippe reçoit l'email, clique sur le lien
4. Philippe accède directement au projet (pas de compte requis)
5. Philippe uploade le plan de travail (PDF)
6. Philippe crée un dossier "Documents Tournage"
7. Philippe déplace le plan de travail dans le dossier
8. Victor voit les changements en temps réel
9. Philippe peut revenir sur le projet à tout moment (token dans localStorage)
```

✅ **Pas de friction** : Philippe n'a pas besoin de créer un compte, il accède directement au projet !

