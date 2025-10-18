# 🐛 Debug Email API Route

## 🔍 Problème Actuel

L'API route `/api/invitations/send` retourne une erreur 500.

**Logs navigateur :**
```
POST http://localhost:3000/api/invitations/send 500 (Internal Server Error)
API error: {success: false, error: 'Failed to send email', details: {...}}
```

---

## 📋 Checklist Variables Environnement

Vérifie que **TOUTES** ces variables sont dans ton `.env.local` :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Postmark
POSTMARK_API_KEY=ta-cle-postmark
POSTMARK_FROM_EMAIL=simon@call-times.app

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔎 Voir les Logs Détaillés

### **1. Regarde le terminal Next.js (pas le navigateur)**

Cherche cette ligne après avoir cliqué "Send Invitation" :

```
POST /api/invitations/send 500 in XXXms
```

**Juste au-dessus, tu devrais voir l'erreur exacte**, par exemple :

```
Postmark error: {
  ErrorCode: 400,
  Message: "The 'From' address you supplied (simon@call-times.app) is not a Sender Signature..."
}
```

OU

```
Error fetching invitation: {...}
```

OU

```
TypeError: Cannot read property 'name' of undefined
```

---

## 🛠️ Solutions selon l'erreur

### **Erreur A : "The 'From' address is not a Sender Signature"**

**Cause :** L'adresse dans `POSTMARK_FROM_EMAIL` n'est pas vérifiée

**Solution :**
1. Va sur **Postmark Dashboard → Sender Signatures**
2. Vérifie que `simon@call-times.app` a le statut **"✓ Confirmed"** (vert)
3. Si status = "Pending" → clique sur "Resend verification email"
4. Clique sur le lien dans l'email reçu
5. Attend que status = "Confirmed"
6. Réessaye

### **Erreur B : "Cannot read property 'name' of undefined"**

**Cause :** La migration SQL n'a pas créé la table `organization_invitations`

**Solution :**
1. Exécute le script : `MIGRATION_COMPLETE_ORG_INVITATIONS.sql`
2. Vérifie que les 5 vérifications affichent :
   - Table créée: 1 ✓
   - Index créés: 5 ✓
   - Policies créées: 4 ✓
   - Fonctions créées: 2 ✓
   - Triggers créés: 1 ✓
3. Redémarre Next.js

### **Erreur C : "SUPABASE_SERVICE_ROLE_KEY is undefined"**

**Cause :** Variable manquante dans `.env.local`

**Solution :**
1. Supabase Dashboard → Settings → API
2. Cherche "service_role key"
3. Clique 👁️ pour révéler (commence par `eyJ...`)
4. Copie dans `.env.local` :
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJ...ta-cle-complete...
   ```
5. Redémarre Next.js

### **Erreur D : "Invitation not found"**

**Cause :** L'invitation n'a pas été créée en base

**Solution :**
1. Vérifie dans Supabase → Table Editor → `organization_invitations`
2. S'il n'y a pas de ligne, c'est que la création a échoué
3. Regarde les logs avant l'erreur email (il devrait y avoir une erreur de création)
4. Probable : problème RLS (voir Erreur B)

---

## 🧪 Test Manuel de l'API Route

Pour tester directement l'API (sans passer par l'UI) :

### **1. Crée une invitation manuellement dans Supabase**

```sql
INSERT INTO organization_invitations (
    organization_id,
    email,
    role,
    invited_by
) VALUES (
    '00000000-0000-0000-0000-000000000001', -- TON org_id
    'test@example.com',
    'member',
    'ton-user-id-ici' -- TON user_id
) RETURNING id;
```

Note l'`id` retourné (ex: `abc-123-def`)

### **2. Teste l'API avec curl**

Dans un nouveau terminal :

```bash
curl -X POST http://localhost:3000/api/invitations/send \
  -H "Content-Type: application/json" \
  -d '{"invitationId": "abc-123-def"}'
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "messageId": "abc-postmark-123"
  }
}
```

**Si erreur :**
```json
{
  "success": false,
  "error": "...",
  "details": {...}
}
```

Les `details` te diront exactement ce qui ne va pas.

---

## 📊 Vérifications Finales

### **1. Vérifier les variables env**

Dans le terminal Next.js, ajoute temporairement ce log dans `src/app/api/invitations/send/route.ts` :

```typescript
export async function POST(request: NextRequest) {
  console.log('🔍 ENV CHECK:', {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasPostmarkKey: !!process.env.POSTMARK_API_KEY,
    postmarkFrom: process.env.POSTMARK_FROM_EMAIL
  })
  
  // ... reste du code
```

**Résultat attendu :**
```
🔍 ENV CHECK: {
  hasSupabaseUrl: true,
  hasServiceKey: true,
  hasPostmarkKey: true,
  postmarkFrom: 'simon@call-times.app'
}
```

**Si `false` quelque part :**
- Variable manquante ou mal nommée dans `.env.local`
- Next.js pas redémarré après ajout

### **2. Vérifier que simon@call-times.app est confirmé**

Dans Postmark Dashboard :
- **Sender Signatures** → trouve `simon@call-times.app`
- Status doit être **"✓ Confirmed"** en vert
- Si "Pending" ou absent → ajoute et confirme d'abord

---

## ✅ Récapitulatif Actions

1. [ ] Exécuter `MIGRATION_COMPLETE_ORG_INVITATIONS.sql` dans Supabase
2. [ ] Vérifier les 5 checks (Table, Index, Policies, Fonctions, Triggers)
3. [ ] Confirmer `simon@call-times.app` dans Postmark (status vert ✓)
4. [ ] Vérifier `.env.local` (6 variables requises)
5. [ ] Redémarrer Next.js
6. [ ] Réessayer l'invitation
7. [ ] Regarder les logs du **terminal Next.js** (pas navigateur)
8. [ ] Partager l'erreur exacte si ça ne marche toujours pas

---

**Partage-moi les logs du terminal Next.js après le test ! 🚀**

