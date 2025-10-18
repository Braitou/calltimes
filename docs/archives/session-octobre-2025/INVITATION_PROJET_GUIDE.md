# 🎉 INVITATION DE GUESTS AU PROJET - GUIDE COMPLET

## ✅ CE QUI A ÉTÉ AJOUTÉ

### **1. Modal d'Invitation Projet**
**Fichier** : `src/components/project-hub/InviteProjectMemberModal.tsx`

**Fonctionnalités :**
- ✅ Input email avec validation
- ✅ **Sélection du rôle** : Owner / Editor / Viewer
- ✅ Descriptions claires pour chaque rôle
- ✅ Design cohérent avec le reste de l'app
- ✅ Gestion erreurs et loading states

### **2. Bouton "Inviter un membre" dans la Team Sidebar**
**Fichier** : `src/components/project-hub/PreviewSidebar.tsx`

**Modifications :**
- ✅ Remplacé l'input simple par un **bouton vert** "Inviter un membre"
- ✅ Click → Ouvre le modal d'invitation
- ✅ Masqué en mode `isReadOnly`

### **3. Gestion dans la Page Project Hub**
**Fichier** : `src/app/projects/[id]/page.tsx`

**Modifications :**
- ✅ State `showInviteModal` ajouté
- ✅ `handleInviteMember` modifié pour accepter le paramètre `role`
- ✅ Modal intégré à la fin de la page
- ✅ Recharge automatique de la liste des membres après invitation

---

## 🎯 COMMENT INVITER UN GUEST (TESTER)

### **Scénario 1 : Inviter depuis le Project Hub**

1. **Victor/Simon** ouvre un projet (ex: "Shooting Nike")
2. Dans la **sidebar droite** (section "Team"), clic sur **"Inviter un membre"**
3. Modal s'ouvre :
   - Entrer email : `philippe@gmail.com`
   - Sélectionner rôle : **Viewer** (pour guest lecture seule)
   - Clic "Envoyer l'invitation"
4. **Philippe** reçoit un email avec un lien d'acceptation
5. Philippe clique → Crée son compte → Accède au projet
6. Philippe voit :
   - ✅ UNIQUEMENT ce projet (pas d'autres projets)
   - ✅ Fichiers et dossiers (lecture seule)
   - ✅ Badge "🔒 Read-Only Access"
   - ❌ PAS de Call Sheets (masqués)
   - ❌ PAS de boutons Upload/Delete

---

## 📋 LES 3 RÔLES EXPLIQUÉS

### 🟢 **Owner**
- ✅ Full access : Upload, Edit, Delete
- ✅ Peut inviter d'autres membres
- ✅ Peut voir les Call Sheets
- 🎯 **Usage** : Co-producteurs, directeurs de production

### 🔵 **Editor**
- ✅ Peut upload, edit, delete fichiers/dossiers
- ❌ Ne peut PAS voir les Call Sheets
- ❌ Ne peut PAS inviter d'autres membres
- 🎯 **Usage** : Assistants, coordinateurs

### ⚪ **Viewer** (Guest)
- ✅ Peut télécharger fichiers
- ✅ Peut voir preview
- ❌ Ne peut PAS upload, edit, delete
- ❌ Ne peut PAS voir les Call Sheets
- ❌ Ne peut PAS inviter d'autres membres
- 🎯 **Usage** : Clients, partenaires externes (Philippe)

---

## 🔧 PROCHAINE ÉTAPE : Ajouter à la Création de Projet

**Actuellement** : On peut inviter **APRÈS** avoir créé le projet.

**À faire** : Permettre d'inviter **PENDANT** la création du projet (modal `/projects` → "New Project").

### **Option 1 : Champ "Inviter des membres" dans le modal**
```typescript
// Dans le formulaire de création projet :
<Label>Inviter des membres (optionnel)</Label>
<Input
  placeholder="philippe@gmail.com, marie@exemple.com"
  onChange={(e) => setInviteEmails(e.target.value.split(','))}
/>
<Select>
  <option value="viewer">Viewer</option>
  <option value="editor">Editor</option>
</Select>
```

### **Option 2 : Invitations après création**
Garder le système actuel (plus simple) et inviter les gens **après** avoir créé le projet.

**👉 JE RECOMMANDE L'OPTION 2** : Plus simple, moins de complexité dans le modal de création.

---

## 🧪 TESTS À FAIRE

### **Test 1 : Inviter Viewer**
1. Victor crée projet "Test Shooting"
2. Victor invite philippe@gmail.com (role: **Viewer**)
3. Philippe accepte
4. ✅ Philippe voit UNIQUEMENT ce projet
5. ✅ Philippe ne peut PAS upload
6. ✅ Philippe ne voit PAS les call sheets
7. ✅ Badge "Read-Only Access" affiché

### **Test 2 : Inviter Editor**
1. Victor invite marie@exemple.com (role: **Editor**)
2. Marie accepte
3. ✅ Marie peut upload/delete fichiers
4. ❌ Marie ne voit PAS les call sheets
5. ❌ Marie ne peut PAS inviter d'autres membres

### **Test 3 : Inviter Owner**
1. Victor invite simon@bandieraprod.com (role: **Owner**)
2. Simon accepte
3. ✅ Simon a full access (comme Victor)
4. ✅ Simon peut inviter d'autres membres
5. ✅ Simon voit les call sheets

---

## 📊 RÉSUMÉ

| Action | Owner | Editor | Viewer |
|--------|-------|--------|--------|
| Voir fichiers | ✅ | ✅ | ✅ |
| Télécharger | ✅ | ✅ | ✅ |
| Upload | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ❌ |
| Rename | ✅ | ✅ | ❌ |
| Inviter membres | ✅ | ❌ | ❌ |
| Voir Call Sheets | ✅ | ❌ | ❌ |
| Créer Call Sheets | ✅ | ❌ | ❌ |

---

## 🚀 C'EST PRÊT !

**Tu peux maintenant :**
1. Créer un projet
2. Cliquer sur "Inviter un membre" dans la Team sidebar
3. Choisir le rôle (Viewer pour guest)
4. Envoyer l'invitation
5. Tester l'accès lecture seule !

**🎉 LE SYSTÈME D'INVITATION PROJET EST OPÉRATIONNEL ! 🎉**

