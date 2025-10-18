# 🚨 FIX IMMÉDIAT : Invitation Projet

## ❌ PROBLÈME

Quand tu essayes d'inviter un membre au projet :
```
GET .../project_members?...&email=eq.bandiera.simon%40gmail.com 406 (Not Acceptable)
Error: Permission denied
```

## 🎯 CAUSE

1. **RLS Policies anciennes** bloquent les requêtes
2. **Service d'invitation** cherchait le user par `email` au lieu de vérifier l'organisation

## ✅ SOLUTION APPLIQUÉE

### **1. Service d'invitation corrigé** ✅
**Fichier** : `src/lib/services/invitations.ts`

**Changement :**
- Avant : Vérifiait si user est dans `project_members` (FAUX pour org members)
- Maintenant : Vérifie si user est dans `memberships` (organisation) ✅

### **2. SQL à exécuter** ⚠️ **ACTION REQUISE**

**Copie-colle ce SQL dans Supabase SQL Editor :**

```sql
-- SUPPRIMER anciennes policies
DROP POLICY IF EXISTS "project_members_select" ON project_members;
DROP POLICY IF EXISTS "project_members_insert" ON project_members;
DROP POLICY IF EXISTS "project_members_update" ON project_members;
DROP POLICY IF EXISTS "project_members_delete" ON project_members;

-- RECRÉER avec bonne logique
CREATE POLICY "project_members_select" ON project_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
  OR
  project_members.user_id = auth.uid()
);

CREATE POLICY "project_members_insert" ON project_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_members.project_id
    AND pm.user_id = auth.uid()
    AND pm.role = 'owner'
  )
);

CREATE POLICY "project_members_update" ON project_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_members.project_id
    AND pm.user_id = auth.uid()
    AND pm.role = 'owner'
  )
);

CREATE POLICY "project_members_delete" ON project_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_members.project_id
    AND pm.user_id = auth.uid()
    AND pm.role = 'owner'
  )
);
```

---

## 📋 ÉTAPES À SUIVRE

### **1. Exécuter le SQL** ⚠️

1. Va dans **Supabase Dashboard**
2. Section **SQL Editor**
3. Copie-colle le SQL ci-dessus
4. Clique **"Run"**

### **2. Recharger l'app**

```bash
# Si l'app tourne déjà, elle devrait continuer
# Sinon, redémarre :
npm run dev
```

### **3. Retester l'invitation**

1. Ouvre un projet
2. Sidebar droite → **"Inviter un membre"**
3. Email : `philippe@gmail.com`
4. Rôle : **Viewer**
5. Clic **"Envoyer l'invitation"**

**✅ Ça devrait fonctionner maintenant !**

---

## 🔍 VÉRIFICATIONS

### **Si ça fonctionne :**
- ✅ Toast "Invitation envoyée"
- ✅ Philippe apparaît dans la Team list (status: pending)
- ✅ Pas d'erreur 406 dans la console

### **Si ça ne fonctionne toujours pas :**

**Check les logs Supabase :**
1. Supabase Dashboard → **Logs**
2. Filtre : `project_members`
3. Regarde les erreurs RLS

**Check la console :**
- Erreur 406 → RLS policy trop stricte
- Erreur 403 → Permission denied
- Erreur 404 → Project not found

---

## 📊 CE QUI A ÉTÉ MODIFIÉ

| Fichier | Changement |
|---------|-----------|
| `src/lib/services/invitations.ts` | ✅ Vérifie org membership au lieu de project membership |
| `FIX_RLS_PROJECT_MEMBERS.sql` | ✅ SQL à exécuter (fix policies) |
| `ACTION_IMMEDIATE_FIX_INVITATION.md` | ✅ Ce guide |

---

## 🚀 APRÈS LE FIX

Une fois que ça fonctionne, tu pourras :
1. Inviter des viewers (guests lecture seule)
2. Inviter des editors (peuvent modifier)
3. Inviter des owners (full access)

**Et tester tout le système multi-niveau ! 🎉**

