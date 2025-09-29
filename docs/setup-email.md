# 📧 Configuration Email (Postmark)

## 🔧 Variables d'environnement

Ajoutez ces variables à votre `.env.local` :

```bash
# Postmark pour l'envoi d'emails
POSTMARK_API_TOKEN=your_postmark_api_token
POSTMARK_FROM_EMAIL=noreply@votre-domaine.com
```

## 🎯 Mode Développement

- **Sans configuration Postmark** : Mode démo automatique
- Emails simulés avec logs dans la console
- Délai artificiel de 1.5 secondes 
- Tous les destinataires marqués comme "envoyé"

## 🚀 Configuration Production

### 1. Créer un compte Postmark

1. Aller sur [postmarkapp.com](https://postmarkapp.com)
2. Créer un compte et un server
3. Récupérer votre **Server API Token**

### 2. Configuration domaine

1. Ajouter votre domaine d'envoi
2. Configurer les enregistrements DNS (SPF, DKIM)
3. Vérifier le domaine

### 3. Variables d'environnement

```bash
POSTMARK_API_TOKEN=xxxxx-xxxxx-xxxxx-xxxxx-xxxxx
POSTMARK_FROM_EMAIL=noreply@votre-domaine.com
```

## 🧪 Test d'envoi

1. **Accéder à l'éditeur** : http://localhost:3000/call-sheets/1/edit
2. **Aller dans "Paramètres"**
3. **Cliquer "Finaliser et envoyer"**
4. **Générer le PDF**
5. **Ajouter des destinataires**
6. **Envoyer l'email**

## 📧 Format des emails

### Contenu automatique :
- **Objet** : "📋 Call Sheet - [Titre] - [Date formatée]"
- **HTML** : Template professionnel avec styles
- **Pièce jointe** : PDF de la call sheet
- **Metadata** : Tracking Postmark

### Personnalisation :
- Objet modifiable
- Message personnalisé optionnel
- Destinataires manuels + équipe auto

## 🔍 Monitoring

### Logs console (mode démo) :
```bash
📧 [DEMO] Simulation envoi email: {
  to: ['user@example.com'],
  subject: 'Call Sheet - Commercial Nike - Lundi 25 septembre 2025',
  pdfUrl: 'blob:http://localhost:3000/...'
}
```

### Production :
- Dashboard Postmark pour delivery tracking
- Webhooks disponibles pour statut en temps réel
- Métriques d'ouverture et clics

## 🚨 Gestion d'erreurs

- **PDF manquant** : Erreur bloquante
- **Destinataires invalides** : Validation email + nom
- **Postmark API** : Retry automatique prévu
- **Pièce jointe** : Vérification taille et format

## 🎨 Template Email

Le template inclut :
- Header avec titre et project
- Date de tournage mise en évidence  
- Message personnalisé (optionnel)
- Checklist des informations contenues
- Footer Call Times

Responsive et compatible tous clients email.
