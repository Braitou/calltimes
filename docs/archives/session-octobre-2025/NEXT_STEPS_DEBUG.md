# 🔍 Prochaines Étapes - Debug Détaillé

## ✅ Ce qui vient d'être fait

J'ai ajouté des **logs détaillés** dans l'API route `/api/invitations/send` avec des emojis pour faciliter le debug.

---

## 🚀 Actions Immédiates

### **1. Redémarre Next.js**

```bash
# Arrête le serveur (Ctrl+C)
npm run dev
```

### **2. Réessaye l'Invitation**

- Va sur `http://localhost:3000/settings/team`
- Clique "Invite Member"
- Entre : `bandiera.simon1@gmail.com`
- Clique "Send Invitation"

### **3. Regarde le Terminal Next.js**

Tu vas maintenant voir des **logs détaillés** comme :

```
🔍 API Route Called: /api/invitations/send
📋 ENV Check: {
  hasSupabaseUrl: true,
  hasServiceKey: true,
  hasAnonKey: true,
  hasPostmarkKey: true,
  postmarkFrom: 'simon@call-times.app'
}
📧 Invitation ID: abc-123-def
🔍 Fetching invitation from Supabase...
✅ Invitation found: { id: 'abc-123', email: 'bandiera.simon1@gmail.com', org: 'Bandiera Production' }
📧 Sending email via Postmark... { from: 'simon@call-times.app', to: 'bandiera.simon1@gmail.com' }
```

**Et ensuite SOIT :**

✅ **Succès :**
```
✅ Organization invitation email sent: [MessageID]
POST /api/invitations/send 200 in XXXms
```

❌ **Erreur :**
```
❌ Supabase error: {...}
OU
❌ Postmark error: {...}
OU
❌ Fatal error in API route: {...}
POST /api/invitations/send 500 in XXXms
```

---

## 🎯 Interprétation des Logs

### **Scénario A : ENV Check montre des `false`**

```
📋 ENV Check: {
  hasSupabaseUrl: true,
  hasServiceKey: false,  ← ❌ PROBLÈME ICI
  hasPostmarkKey: true,
  postmarkFrom: 'simon@call-times.app'
}
```

**Solution :** Variable manquante dans `.env.local`

### **Scénario B : Supabase Error**

```
❌ Supabase error: {
  code: 'PGRST116',
  message: 'The result contains 0 rows'
}
```

**Solution :** La table `organization_invitations` n'existe pas ou RLS bloque l'accès
→ Exécute `MIGRATION_COMPLETE_ORG_INVITATIONS.sql`

### **Scénario C : Postmark Error**

```
❌ Postmark error: {
  ErrorCode: 400,
  Message: "The 'From' address you supplied (simon@call-times.app) is not a Sender Signature..."
}
```

**Solution :** Adresse pas vérifiée dans Postmark
→ Postmark Dashboard → Sender Signatures → Confirme `simon@call-times.app`

### **Scénario D : Fatal Error**

```
❌ Fatal error in API route: Cannot read property 'name' of undefined
```

**Solution :** Problème de code (données manquantes)
→ Partage l'erreur exacte

---

## 📋 Actions Selon l'Erreur

### **Si ENV Check montre des `false` :**

1. Vérifie ton `.env.local`
2. Assure-toi que toutes les variables sont présentes
3. Redémarre Next.js

### **Si "Supabase error" :**

1. Exécute `MIGRATION_COMPLETE_ORG_INVITATIONS.sql` dans Supabase
2. Vérifie les 5 checks (Table, Index, Policies, Fonctions, Triggers)
3. Redémarre Next.js

### **Si "Postmark error" :**

1. Va sur Postmark Dashboard → Sender Signatures
2. Confirme que `simon@call-times.app` a le statut ✓ "Confirmed" (vert)
3. Si "Pending" → clique "Resend verification email"
4. Vérifie ta boîte mail et clique sur le lien
5. Réessaye

---

## ✅ Si Tout Fonctionne

Tu verras :

```
🔍 API Route Called: /api/invitations/send
📋 ENV Check: { ... tous à true }
📧 Invitation ID: abc-123
🔍 Fetching invitation from Supabase...
✅ Invitation found: {...}
📧 Sending email via Postmark...
✅ Organization invitation email sent: [MessageID]
POST /api/invitations/send 200 in 1234ms
```

**Et dans l'interface :**
- ✅ Toast "Invitation sent to bandiera.simon1@gmail.com"
- ✅ Simon apparaît dans "Pending Invitations"

**Et dans Postmark Dashboard :**
- ✅ Email visible dans Activity (status: Sent/Delivered)

---

## 🚨 Important

**Copie-colle l'INTÉGRALITÉ des logs depuis :**
```
🔍 API Route Called: /api/invitations/send
```

**Jusqu'à :**
```
POST /api/invitations/send XXX in XXXms
```

**Et partage-les moi !** 

Ça va me dire exactement où ça bloque ! 🚀

