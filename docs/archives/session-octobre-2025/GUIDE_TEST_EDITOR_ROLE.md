# 🧪 Guide de Test : Rôle Editor

## 📋 Objectif
Tester les permissions granulaires du rôle **Editor** dans le Project Hub, en s'assurant qu'un Editor peut :
- ✅ Uploader des fichiers
- ✅ Créer des dossiers
- ✅ Renommer/Supprimer **uniquement ses propres fichiers**
- ❌ **PAS** renommer/supprimer les fichiers d'autres utilisateurs
- ❌ **PAS** gérer les call sheets
- ❌ **PAS** inviter/retirer des membres

---

## 🎬 Scénario de Test

### **Prérequis**
1. Avoir 2 comptes utilisateurs :
   - **Victor** (Owner) : `bandiera.simon@gmail.com`
   - **Philippe** (Editor) : `bandiera.simon1@gmail.com`

2. Un projet existant avec :
   - Victor comme Owner
   - Philippe invité comme Editor

---

## 🔧 Étapes de Test

### **1️⃣ Inviter Philippe comme Editor**

**En tant que Victor (Owner) :**
1. Se connecter avec `bandiera.simon@gmail.com`
2. Aller sur `/projects/[id]` (un projet existant)
3. Dans la sidebar droite (Team), cliquer sur **"Inviter un membre"**
4. Entrer l'email : `bandiera.simon1@gmail.com`
5. Sélectionner le rôle : **Editor**
6. Cliquer sur **"Envoyer l'invitation"**

**Vérifications :**
- ✅ Toast de succès "Invitation envoyée"
- ✅ Email reçu par Philippe
- ✅ Invitation apparaît dans "Invitations en attente"

---

### **2️⃣ Accepter l'invitation**

**En tant que Philippe (Editor) :**
1. Ouvrir l'email d'invitation
2. Cliquer sur le lien d'invitation
3. Se connecter avec `bandiera.simon1@gmail.com` (ou créer un compte si nouveau)

**Vérifications :**
- ✅ Redirection vers `/projects/[id]`
- ✅ Accès au projet accordé
- ✅ Badge "Editor" visible dans Team sidebar

---

### **3️⃣ Tester les permissions d'upload**

**En tant que Philippe (Editor) :**
1. Aller sur le projet
2. Cliquer sur le bouton **"Upload"** dans le header du canvas

**Vérifications :**
- ✅ Bouton "Upload" **visible et actif**
- ✅ Modal d'upload s'ouvre
- ✅ Upload d'un fichier réussit
- ✅ Fichier apparaît sur le canvas avec `uploaded_by = Philippe`

---

### **4️⃣ Tester la création de dossier**

**En tant que Philippe (Editor) :**
1. Dans la sidebar gauche (Tools), cliquer sur **"New Folder"**

**Vérifications :**
- ✅ Outil "New Folder" **visible et actif**
- ✅ Nouveau dossier créé sur le canvas
- ✅ Dossier renommable immédiatement (mode inline edit)
- ✅ Dossier enregistré avec `created_by = Philippe`

---

### **5️⃣ Tester rename/delete de ses propres fichiers**

**En tant que Philippe (Editor) :**
1. **Right-click** sur un fichier uploadé par Philippe
2. Vérifier les options du context menu

**Vérifications :**
- ✅ Option **"Renommer"** présente
- ✅ Option **"Supprimer"** présente
- ✅ Renommer fonctionne
- ✅ Supprimer fonctionne

---

### **6️⃣ Tester rename/delete des fichiers d'autres users**

**En tant que Victor (Owner) :**
1. Uploader un fichier (ex: `test-victor.pdf`)

**En tant que Philippe (Editor) :**
1. **Right-click** sur le fichier uploadé par Victor
2. Vérifier les options du context menu

**Vérifications :**
- ❌ Option **"Renommer"** **ABSENTE**
- ❌ Option **"Supprimer"** **ABSENTE**
- ✅ Option **"Télécharger"** présente (lecture seule)

---

### **7️⃣ Tester les restrictions Call Sheets**

**En tant que Philippe (Editor) :**
1. Regarder la sidebar gauche (Tools)
2. Chercher l'outil **"Edit Call Sheet"**

**Vérifications :**
- ❌ Outil **"Edit Call Sheet"** **désactivé** (grisé)
- ❌ Aucun call sheet visible sur le canvas (même si Victor en a créé)

---

### **8️⃣ Tester les restrictions Team Management**

**En tant que Philippe (Editor) :**
1. Regarder la sidebar droite (Team)
2. Chercher le bouton **"Inviter un membre"**

**Vérifications :**
- ❌ Bouton **"Inviter un membre"** **ABSENT**
- ✅ Liste des membres **visible** (lecture seule)
- ❌ Bouton "❌" pour retirer un membre **ABSENT**
- ❌ Invitations en attente **NON VISIBLES**

---

### **9️⃣ Tester les restrictions outils Owner-only**

**En tant que Philippe (Editor) :**
1. Regarder la sidebar gauche (Tools)
2. Vérifier l'état des outils suivants :
   - **Crew List**
   - **Add Contacts**
   - **Send Email**

**Vérifications :**
- ❌ Tous ces outils sont **désactivés** (grisés)
- ✅ Seuls **"Import Docs"** et **"New Folder"** sont actifs

---

### **🔟 Tester le bouton Delete dans Preview Sidebar**

**En tant que Philippe (Editor) :**
1. Cliquer sur un fichier uploadé par Philippe
2. Regarder la sidebar droite (Preview)
3. Vérifier la présence du bouton **"Supprimer"**

**Vérifications :**
- ✅ Bouton **"Supprimer"** présent pour ses propres fichiers
- ✅ Suppression fonctionne

**Puis :**
1. Cliquer sur un fichier uploadé par Victor
2. Regarder la sidebar droite (Preview)

**Vérifications :**
- ❌ Bouton **"Supprimer"** **ABSENT**
- ✅ Bouton **"Télécharger"** présent

---

## ✅ Résumé des Permissions Editor

| Action | Owner | Editor | Viewer |
|--------|-------|--------|--------|
| **Uploader fichiers** | ✅ | ✅ | ❌ |
| **Créer dossiers** | ✅ | ✅ | ❌ |
| **Renommer ses fichiers** | ✅ | ✅ | ❌ |
| **Supprimer ses fichiers** | ✅ | ✅ | ❌ |
| **Renommer fichiers d'autres** | ✅ | ❌ | ❌ |
| **Supprimer fichiers d'autres** | ✅ | ❌ | ❌ |
| **Gérer call sheets** | ✅ | ❌ | ❌ |
| **Inviter membres** | ✅ | ❌ | ❌ |
| **Retirer membres** | ✅ | ❌ | ❌ |
| **Télécharger fichiers** | ✅ | ✅ | ✅ |
| **Voir membres** | ✅ | ✅ | ✅ |

---

## 🐛 Bugs Potentiels à Vérifier

1. **RLS Bypass** : Un Editor ne doit **JAMAIS** pouvoir modifier un fichier d'un autre user via l'API directement (même en contournant l'UI)
2. **Frontend/Backend Mismatch** : Si l'UI cache un bouton mais que l'API route est accessible, c'est un bug de sécurité
3. **Call Sheets Leak** : Un Editor ne doit **JAMAIS** voir les call sheets, même dans les requêtes réseau (vérifier Network tab)
4. **Token Manipulation** : Tester si un Editor peut changer son rôle en modifiant le localStorage ou les cookies

---

## 📝 Checklist Finale

- [ ] Philippe peut uploader des fichiers
- [ ] Philippe peut créer des dossiers
- [ ] Philippe peut renommer/supprimer **ses propres** fichiers
- [ ] Philippe **NE PEUT PAS** renommer/supprimer les fichiers de Victor
- [ ] Philippe **NE VOIT PAS** les call sheets
- [ ] Philippe **NE PEUT PAS** inviter/retirer des membres
- [ ] Philippe **NE PEUT PAS** gérer les call sheets (outil désactivé)
- [ ] Philippe **PEUT** télécharger tous les fichiers
- [ ] Philippe **VOIT** la liste des membres (lecture seule)

---

## 🎉 Résultat Attendu

Si tous les tests passent, le rôle **Editor** est correctement implémenté avec des permissions granulaires sécurisées ! 🚀

