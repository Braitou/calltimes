# 🚀 Setup Guide - Organization Invitations

## ✅ Ce qui a été créé

### 1. **Migration SQL** (`supabase/migrations/20241017000001_organization_invitations.sql`)
- ✅ Table `organization_invitations` avec tous les champs nécessaires
- ✅ RLS policies pour sécurité multi-tenant
- ✅ Index pour performance
- ✅ Trigger pour limite 20 membres par organisation
- ✅ Fonction `expire_old_organization_invitations()` pour auto-expiration

### 2. **Services Backend**
- ✅ `src/lib/services/organization-invitations.ts` - CRUD complet
- ✅ `src/lib/services/email-organization-invitation.ts` - Email Postmark

### 3. **Pages & Composants**
- ✅ `/settings/team` - Gestion équipe organisation
- ✅ `/invite/org/[token]` - Acceptation invitation
- ✅ `InviteMemberModal` - Modal invitation
- ✅ Lien "Team" ajouté dans Header navigation

---

## 📋 Actions Manuelles Requises

### ÉTAPE 1 : Installer les dépendances manquantes

```bash
npm install @radix-ui/react-label
```

### ÉTAPE 2 : Exécuter la migration SQL dans Supabase

1. Aller sur **Supabase Dashboard** → Ton projet → **SQL Editor**
2. Copier-coller le contenu de `supabase/migrations/20241017000001_organization_invitations.sql`
3. Cliquer sur **Run**
4. Vérifier qu'il n'y a pas d'erreurs

**Points de vérification :**
- ✅ Table `organization_invitations` créée
- ✅ 4 index créés
- ✅ 4 policies RLS créées
- ✅ 2 fonctions créées (`expire_old_organization_invitations`, `check_organization_member_limit`)
- ✅ 1 trigger créé (`enforce_member_limit`)

### ÉTAPE 3 : Configurer Postmark dans `.env.local`

**Ajouter ces variables dans ton `.env.local` :**

```bash
# Postmark (Email Service)
POSTMARK_API_KEY=ton_api_key_postmark
POSTMARK_FROM_EMAIL=noreply@call-times.app

# App URL (pour les liens d'invitation)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Notes :**
- Utilise la même clé API Postmark que pour les call sheets
- Change `NEXT_PUBLIC_APP_URL` en production (ex: `https://call-times.app`)

### ÉTAPE 4 : Redémarrer le serveur Next.js

```bash
npm run dev
```

---

## 🧪 Tests à Effectuer

### Test 1 : Victor crée l'organisation (déjà fait normalement)
✅ Victor a créé son compte
✅ Victor a une organisation "Bandiera Production"

### Test 2 : Victor invite Simon (nouveau flow)

1. **Victor** va sur `/settings/team`
2. Clique sur **"Invite Member"**
3. Entre l'email de Simon : `simon@bandieraprod.com`
4. Sélectionne rôle : **Member**
5. Clique **"Send Invitation"**

**Résultat attendu :**
- ✅ Toast "Invitation sent to simon@bandieraprod.com"
- ✅ Simon apparaît dans "Pending Invitations" avec statut "Invited"
- ✅ Email reçu par Simon avec lien magique

### Test 3 : Simon accepte l'invitation

**Scénario A : Simon n'a PAS de compte**

1. Simon reçoit l'email, clique sur **"Accept Invitation"**
2. Arrive sur `/invite/org/[token]`
3. Voit le formulaire de création de compte :
   - Email (pré-rempli, disabled)
   - Full Name
   - Password
   - Confirm Password
4. Remplit le formulaire, clique **"Create Account & Join"**
5. Compte créé automatiquement
6. Redirigé vers `/dashboard`

**Résultat attendu :**
- ✅ Compte Simon créé dans `users`
- ✅ Membership créé dans `memberships` (role: member)
- ✅ Invitation marquée `accepted` dans `organization_invitations`
- ✅ Simon voit Dashboard + Projets + Contacts de l'org
- ✅ Toast "Welcome to Bandiera Production"

**Scénario B : Simon a DÉJÀ un compte**

1. Simon se connecte à son compte existant
2. Clique sur le lien d'invitation dans l'email
3. Arrive sur `/invite/org/[token]`
4. Voit un écran simplifié avec :
   - Nom de l'organisation
   - Rôle proposé
   - Invité par (Victor)
   - Bouton **"Accept & Join"**
5. Clique sur **"Accept & Join"**
6. Redirigé vers `/dashboard`

**Résultat attendu :**
- ✅ Membership créé dans `memberships`
- ✅ Invitation marquée `accepted`
- ✅ Simon voit maintenant tous les projets de l'org

### Test 4 : Vérifier les limites

1. **Victor** invite 19 autres personnes (total = 20 avec Victor)
2. **Victor** essaie d'inviter une 21ème personne

**Résultat attendu :**
- ❌ Erreur : "Organization member limit reached (max 20 members)"
- ❌ Bouton "Invite Member" grisé
- ✅ Stats affichent "20 / 20 members used"

---

## 🔍 Debugging

### Problème : Email non reçu

**Vérifier :**
1. Logs Next.js : chercher `✅ Organization invitation email sent:` ou erreurs Postmark
2. Postmark Dashboard → Activity → Vérifier l'envoi
3. Vérifier spam/junk folder

**Solution temporaire :**
- Copier le lien d'invitation depuis les logs (il contient le token)
- Construire manuellement : `http://localhost:3000/invite/org/[TOKEN]`

### Problème : Erreur SQL lors de la migration

**Erreur commune :** `relation "organization_invitations" already exists`

**Solution :**
```sql
-- Supprimer la table existante
DROP TABLE IF EXISTS organization_invitations CASCADE;

-- Ré-exécuter la migration complète
```

### Problème : RLS bloque l'accès

**Vérifier les policies :**
```sql
-- Liste toutes les policies de la table
SELECT * FROM pg_policies WHERE tablename = 'organization_invitations';

-- Désactiver temporairement RLS (DEV ONLY)
ALTER TABLE organization_invitations DISABLE ROW LEVEL SECURITY;
```

### Problème : Invitation expirée immédiatement

**Vérifier :**
```sql
SELECT id, email, status, created_at, expires_at, NOW()
FROM organization_invitations
WHERE email = 'simon@bandieraprod.com'
ORDER BY created_at DESC
LIMIT 1;
```

**Solution :**
- Si `expires_at < NOW()` → invitation déjà expirée
- Créer une nouvelle invitation

---

## 📊 Vérifications dans Supabase Dashboard

### Table `organization_invitations`

```sql
-- Voir toutes les invitations
SELECT 
  oi.email,
  oi.role,
  oi.status,
  oi.created_at,
  oi.expires_at,
  o.name as organization_name,
  u.full_name as invited_by_name
FROM organization_invitations oi
JOIN organizations o ON oi.organization_id = o.id
JOIN users u ON oi.invited_by = u.id
ORDER BY oi.created_at DESC;
```

### Table `memberships`

```sql
-- Voir tous les membres d'une org
SELECT 
  m.role,
  m.email,
  u.full_name,
  m.created_at
FROM memberships m
LEFT JOIN users u ON m.user_id = u.id
WHERE m.organization_id = 'ton-org-id'
ORDER BY m.created_at ASC;
```

---

## 🎯 Prochaines Étapes (Session 2)

Une fois que le flow d'invitations organisation fonctionne :

### **Session 2 : Multi-Level Access Control**
- [ ] Helper `getUserAccessType()` pour détecter org_member vs project_guest
- [ ] Middleware protection routes
- [ ] Header adaptatif (navigation complète vs minimale)
- [ ] Restrictions UI dans Project Hub pour viewers
- [ ] RLS policies pour call_sheets (viewers = no access)
- [ ] Tests complets Victor/Simon vs Philippe

---

## 📞 Besoin d'Aide ?

Si tu rencontres un problème :

1. **Vérifier les logs Next.js** (`npm run dev`)
2. **Vérifier les logs Supabase** (SQL Editor → Logs)
3. **Vérifier Postmark Activity** (si problème email)
4. **Partager :**
   - Message d'erreur exact
   - Étape où ça bloque
   - Logs console/terminal

---

**Dernière mise à jour :** 17 octobre 2025  
**Version :** 1.0 - Organization Invitations MVP

