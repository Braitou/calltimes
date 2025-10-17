# ⚡ Actions Immédiates - Organization Invitations

## 🎯 À faire MAINTENANT (5 minutes)

### ✅ ÉTAPE 1 : Migration SQL (2 min)

1. **Ouvre Supabase Dashboard** → Ton projet Call Times
2. **Va dans** : SQL Editor (icône ⚡ dans le menu gauche)
3. **Clique** : "New query"
4. **Copie-colle** tout le contenu du fichier : `supabase/migrations/20241017000001_organization_invitations.sql`
5. **Clique** : "Run" (en bas à droite)
6. **Vérification** : Tu devrais voir "Success. No rows returned"

---

### ✅ ÉTAPE 2 : Variables Environnement (1 min)

**Ouvre ton fichier `.env.local`** et ajoute ces 3 lignes :

```bash
# Organization Invitations - Postmark
POSTMARK_API_KEY=ta_cle_deja_existante_pour_call_sheets
POSTMARK_FROM_EMAIL=noreply@call-times.app
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Notes :**
- `POSTMARK_API_KEY` : utilise la MÊME clé que tu as déjà pour les call sheets
- `POSTMARK_FROM_EMAIL` : change si tu veux un autre email d'envoi
- `NEXT_PUBLIC_APP_URL` : change en production (ex: `https://call-times.app`)

---

### ✅ ÉTAPE 3 : Redémarrer Next.js (30 sec)

```bash
# Arrêter le serveur (Ctrl+C si il tourne)
# Puis relancer :
npm run dev
```

---

## 🧪 Test Rapide (2 minutes)

### 1. **Va sur** : `http://localhost:3000/settings/team`

**Tu devrais voir :**
- ✅ Ton compte (Victor) avec badge "You" + rôle "Owner"
- ✅ Stats : 1 member, 0 invitations, 19 slots disponibles
- ✅ Bouton vert "Invite Member" actif

### 2. **Clique** "Invite Member"

**Tu devrais voir :**
- ✅ Modal avec formulaire
- ✅ Input email
- ✅ Sélection rôle (Member / Owner avec icônes)
- ✅ Compteur "1 / 20 members used"

### 3. **Entre un email de test** (ex: `simon@bandieraprod.com`)

**Sélectionne rôle** : Member

**Clique** : "Send Invitation"

### 4. **Vérifie dans le terminal**

**Tu devrais voir dans les logs :**
```
✅ Organization invitation email sent: [MessageID]
```

**OU si erreur Postmark :**
```
❌ Postmark error: {...}
```

### 5. **Vérifie dans Supabase**

**Va dans** : Table Editor → `organization_invitations`

**Tu devrais voir :**
- ✅ 1 ligne avec `email = simon@bandieraprod.com`
- ✅ `status = pending`
- ✅ `expires_at` = dans 7 jours
- ✅ `invitation_token` = UUID

---

## ✅ Si tout fonctionne

**Bravo ! La Session 1 est complète ! 🎉**

Tu peux maintenant :
1. ✅ Inviter des membres à ton organisation
2. ✅ Gérer ton équipe depuis `/settings/team`
3. ✅ Les invités reçoivent un email avec lien magique
4. ✅ Ils peuvent accepter et rejoindre l'org

**Pour tester l'acceptation :**
- Copie le lien d'invitation depuis l'email (ou construis-le avec le token)
- Format : `http://localhost:3000/invite/org/[TOKEN]`
- Ouvre dans navigateur privé (pour simuler un nouvel utilisateur)
- Remplis le formulaire signup
- Tu seras redirigé vers le dashboard avec accès à toute l'org !

---

## ❌ Si ça ne marche pas

### **Erreur : "Database error"**
→ Migration SQL pas exécutée correctement
→ Re-vérifie l'étape 1

### **Erreur : "Failed to send email"**
→ Variable Postmark manquante ou invalide
→ Re-vérifie l'étape 2

### **Email pas reçu**
→ Normal si compte Postmark en "sandbox mode"
→ Regarde dans les logs terminal, il y a le `MessageID`
→ Va dans Postmark Dashboard → Activity pour voir l'email

### **Autre erreur**
→ Copie-colle l'erreur exacte
→ Partage les logs du terminal
→ On debug ensemble !

---

## 📋 Checklist Finale

- [ ] Migration SQL exécutée avec succès
- [ ] Variables env ajoutées dans `.env.local`
- [ ] Serveur Next.js redémarré
- [ ] Page `/settings/team` accessible
- [ ] Modal "Invite Member" fonctionne
- [ ] Invitation créée dans Supabase
- [ ] (Optionnel) Email reçu ou visible dans Postmark

---

**Temps total : ~5-7 minutes**

**Une fois terminé, dis-moi si tout fonctionne ou si tu rencontres un problème !** 🚀

