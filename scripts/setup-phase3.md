# 📄 Setup Phase 3 : PDF & Email

## 🔧 Configuration nécessaire

### 1. Variables d'environnement

Ajouter à votre `.env.local` :

```bash
# Service PDF (local pour dev, Fly.io pour production)
NEXT_PUBLIC_PDF_SERVICE_URL=http://localhost:3001

# Postmark pour l'email (optionnel Phase 3)
POSTMARK_API_TOKEN=votre-token-postmark
POSTMARK_FROM_EMAIL=noreply@votre-domaine.com
```

### 2. Test local du service PDF

```bash
# Terminal 1 : Lancer l'app principale
npm run dev

# Terminal 2 : Lancer le service PDF
cd services/pdf-renderer
npm install
npx playwright install chromium
npm run dev
```

### 3. Tests de convergence

1. **Ouvrir l'éditeur Call Sheet** : http://localhost:3000/call-sheets/1/edit
2. **Remplir quelques données** (titre, lieux, planning, équipe)
3. **Aller dans l'onglet "Paramètres"**
4. **Cliquer "Générer PDF"**
5. **Comparer visuellement** le PDF téléchargé avec la preview

### 4. Points de validation

- [ ] **Service PDF démarre** sans erreur sur :3001
- [ ] **Health check OK** : `curl http://localhost:3001/health`
- [ ] **Génération PDF fonctionne** depuis l'éditeur
- [ ] **Téléchargement automatique** du PDF
- [ ] **Convergence visuelle** : PDF ≈ Preview
- [ ] **Logos affichés** correctement dans le PDF
- [ ] **Données complètes** (planning, équipe, lieux)

## 🐛 Debugging

### Service PDF ne démarre pas
```bash
cd services/pdf-renderer
npm install
npx playwright install chromium --force
```

### Erreur CORS
Vérifier que `ALLOWED_ORIGINS` inclut `http://localhost:3000`

### PDF vide ou malformé
1. Vérifier les logs du service PDF
2. Tester avec `npm test` dans le service
3. Comparer le HTML généré avec la preview

### Logos manquants dans le PDF
1. Vérifier que les URLs sont accessibles
2. URLs Supabase doivent être publiques ou signed
3. Mode demo utilise des blob: URLs

## 🚀 Déploiement (plus tard)

```bash
# Déployer le service PDF sur Fly.io
cd services/pdf-renderer
fly deploy

# Mettre à jour la variable d'environnement
NEXT_PUBLIC_PDF_SERVICE_URL=https://call-times-pdf-renderer.fly.dev
```
