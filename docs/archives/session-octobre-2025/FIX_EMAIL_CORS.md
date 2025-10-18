# 🔧 Fix Email CORS - API Route Créée

## ✅ Problème Résolu

**Problème :** Les emails ne pouvaient pas être envoyés depuis le navigateur (CORS)

**Solution :** Création d'une **API Route Next.js** qui envoie les emails côté serveur

---

## 📦 Fichiers Créés/Modifiés

### **1. Nouveau : `src/app/api/invitations/send/route.ts`**
- ✅ API route Next.js (server-side)
- ✅ Envoie les emails via Postmark de manière sécurisée
- ✅ Pas d'exposition de l'API key au client

### **2. Modifié : `src/lib/services/email-organization-invitation.ts`**
- ✅ Simplifié : appelle maintenant l'API route
- ✅ Plus de fetch direct vers Postmark
- ✅ Gestion d'erreurs améliorée

---

## ⚙️ Configuration Requise

### **Option A : Tu as déjà `SUPABASE_SERVICE_ROLE_KEY`**

Si tu l'as déjà dans ton `.env.local`, **tu es prêt ! Rien à faire.**

### **Option B : Tu ne l'as pas (probable)**

**Ajoute cette variable dans `.env.local` :**

```bash
# Supabase Service Role Key (pour API routes server-side)
SUPABASE_SERVICE_ROLE_KEY=ta_service_role_key_ici
```

**Comment trouver cette clé :**

1. Va sur **Supabase Dashboard** → Ton projet
2. **Settings** → **API**
3. Cherche **"service_role key"** (section "Project API keys")
4. Clique sur l'icône 👁️ pour révéler
5. Copie la clé (commence par `eyJ...`)
6. Colle dans `.env.local`

**⚠️ Important :** Cette clé contourne RLS ! Ne JAMAIS l'exposer au client.

---

## 🧪 Test

### **1. Redémarre Next.js**

```bash
# Ctrl+C pour arrêter
npm run dev
```

### **2. Réessaye d'inviter Simon**

1. Va sur `/settings/team`
2. Clique "Invite Member"
3. Entre email : `simon@bandieraprod.com`
4. Clique "Send Invitation"

### **3. Vérifie les logs terminal**

**Avant (erreur CORS) :**
```
❌ Failed to fetch
❌ Failed to send invitation email
```

**Après (succès) :**
```
✅ Organization invitation email sent: [MessageID]
✅ Organization invitation email sent via API route
```

### **4. Vérifie Postmark Dashboard**

- Va sur **Postmark Dashboard** → **Activity**
- Tu devrais voir l'email envoyé avec statut "Sent" ou "Delivered"

---

## 🐛 Troubleshooting

### **Erreur : "Internal server error"**

**Cause :** `SUPABASE_SERVICE_ROLE_KEY` manquante ou invalide

**Solution :**
1. Vérifie que la clé est bien dans `.env.local`
2. Vérifie qu'elle commence par `eyJ`
3. Redémarre Next.js après ajout

### **Erreur : "Failed to send email" (détails Postmark)**

**Cause :** Problème Postmark (API key, domaine, sandbox mode)

**Solution :**
1. Vérifie `POSTMARK_API_KEY` dans `.env.local`
2. Regarde les détails dans les logs (l'API route affiche plus d'infos)
3. Vérifie que ton domaine est vérifié dans Postmark

### **Email envoyé mais pas reçu**

**Cause :** Postmark en "Sandbox Mode" ou domaine non vérifié

**Solution :**
- Vérifie **Postmark Dashboard → Activity**
- Si status = "Queued" → sandbox mode, email ne partira pas
- Si status = "Bounced" → email invalide
- Si status = "Delivered" → vérifie spam/junk folder

---

## ✅ Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` ajoutée dans `.env.local`
- [ ] Next.js redémarré
- [ ] Invitation testée (pas d'erreur CORS)
- [ ] Logs affichent "✅ Organization invitation email sent"
- [ ] Email visible dans Postmark Activity
- [ ] (Optionnel) Email reçu dans boîte mail

---

## 🎯 Résultat Attendu

**Avant :**
- ❌ Erreur "Failed to fetch" dans console
- ❌ Invitation créée MAIS email pas envoyé
- ❌ Pas de trace dans Postmark

**Après :**
- ✅ Pas d'erreur dans console
- ✅ Toast "Invitation sent to [email]"
- ✅ Invitation créée dans Supabase
- ✅ Email envoyé via Postmark (visible dans Activity)
- ✅ Email reçu (si pas sandbox mode)

---

**Temps estimé : 2 minutes (ajout clé + redémarrage + test)**

Dis-moi si ça fonctionne maintenant ! 🚀

