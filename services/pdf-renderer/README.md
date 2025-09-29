# 📄 Call Times PDF Renderer Service

Service isolé pour la génération de PDF des Call Sheets, optimisé pour déploiement sur Fly.io.

## 🚀 Quick Start

### Développement local

```bash
cd services/pdf-renderer

# Installer les dépendances
npm install

# Installer Playwright
npx playwright install chromium

# Copier et configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# Lancer en mode dev
npm run dev

# Tester la génération PDF
npm test
```

### Test du service

```bash
# Health check
curl http://localhost:3001/health

# Test génération PDF (nécessite Supabase configuré)
curl -X POST http://localhost:3001/render \
  -H "Content-Type: application/json" \
  -d '{"callSheetId": "votre-id", "token": "votre-token"}'
```

## 🐳 Déploiement Fly.io

```bash
# Se connecter à Fly.io
fly auth login

# Créer l'app
fly apps create call-times-pdf-renderer

# Configurer les secrets
fly secrets set SUPABASE_URL=https://votre-projet.supabase.co
fly secrets set SUPABASE_SERVICE_KEY=votre-service-key
fly secrets set ALLOWED_ORIGINS=https://votre-app.vercel.app

# Déployer
fly deploy

# Vérifier le déploiement
fly status
fly logs
```

## 🏗️ Architecture

- **Express.js** : Serveur HTTP léger
- **Playwright** : Génération PDF via Chromium
- **Supabase** : Stockage des PDF et accès aux données
- **Winston** : Logging professionnel
- **Docker** : Containerisation avec optimisations Fly.io

## 🔗 Endpoints

### `GET /health`
Health check pour monitoring et load balancer.

### `POST /render`
Génère un PDF à partir d'un Call Sheet.

**Body:**
```json
{
  "callSheetId": "uuid-du-call-sheet",
  "token": "jwt-token-signé",
  "format": "A4"
}
```

**Response:**
```json
{
  "success": true,
  "pdf_url": "https://storage-url/signed-pdf-url",
  "filename": "call-sheet-123-timestamp.pdf",
  "size": 245760,
  "duration": 1250
}
```

## 🎨 Convergence Preview/PDF

Le HTML généré utilise **exactement les mêmes styles** que la preview web pour garantir une convergence parfaite :

- Mêmes fonts (Inter via Google Fonts)
- Mêmes dimensions et marges
- Mêmes couleurs et espacements
- Logos positionnés identiquement

## ⚡ Performance

- **Cold start** : ~2-3 secondes
- **Génération PDF** : ~1-2 secondes
- **Mémoire** : ~200MB (Chromium + Node)
- **Scaling** : Auto-scale 0→3 instances sur Fly.io

## 🔒 Sécurité

- Validation des tokens JWT (TODO: implémenter)
- Service isolé sans accès direct aux données utilisateur
- Utilise les service keys Supabase pour l'accès admin
- Logs de toutes les opérations

## 🐛 Debugging

```bash
# Logs en temps réel
fly logs

# Accéder au container
fly ssh console

# Tester localement
npm run test
```

## 📝 TODO Phase 3

- [ ] Intégration JWT pour validation des tokens
- [ ] Optimisation CSS pour convergence exacte
- [ ] Tests de charge et performance
- [ ] Monitoring et alertes
