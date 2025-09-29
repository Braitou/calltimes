# 📋 PLAN DE DÉVELOPPEMENT - SaaS Call Sheets MVP

> **Objectif** : Construire un MVP fiable permettant de créer, éditer et envoyer des call sheets professionnelles en PDF
> 
> **Timeline** : 8 semaines | **Stack** : Next.js 15.5 + Supabase + Fly.io + Postmark + Tailwind

---

## 🎯 RÈGLES D'OR DU PROJET

- ✅ **Convergence Preview/PDF** : Mêmes composants, mêmes CSS, mêmes fonts
- ✅ **Simplicité avant tout** : 1 template parfait > 4 moyens
- ✅ **Tests précoces** : Validation utilisateur dès la semaine 4
- ✅ **Performance** : PDF généré en < 10 secondes
- ✅ **Sécurité** : RLS strict, URLs signées, tokens courts

---

## 📊 PHASES DE DÉVELOPPEMENT

### 🏗️ **PHASE 1 : FONDATIONS (Semaines 1-2)**

#### **Semaine 1 : Setup Projet & Infrastructure**

**🔧 Initialisation**
- [x] ~~Créer le monorepo `callsheets-app`~~ → **Simplifié :** Structure directe dans `calltimes/`
  - [x] ~~`apps/web` (Next.js 15.5)~~ → **Déplacé :** Application Next.js à la racine `calltimes/`
  - [ ] `services/pdf-renderer` (Node + Playwright) → **À créer plus tard**
- [x] Initialiser Next.js avec App Router + TypeScript
- [x] Installer les dépendances principales :
  - [x] `tailwindcss` + `@tailwindcss/typography`
  - [x] `shadcn/ui` (Card, Button, Input, Table, Dialog)
  - [x] `react-hook-form` + `zod`
  - [x] `@supabase/ssr` + `@supabase/supabase-js`
  - [x] `@sentry/nextjs`
  - [x] `react-email` + `@react-email/components`

**🎨 Configuration UI**
- [x] Setup Tailwind avec config print CSS
- [x] Installer shadcn/ui avec thème sobre
- [x] Créer les tokens CSS pour impression (marges A4, fonts)
- [x] Composant `<A4Page>` de base avec marges fixes

**🔒 Supabase Setup**
- [x] Créer projet Supabase
- [x] Configurer Auth (email + magic link)
- [x] Créer buckets Storage : `org-logos`, `project-assets`, `pdfs`
- [x] Variables d'environnement `.env.local`

#### **Semaine 2 : Base de Données & Auth**

**🗄️ Migrations SQL**
- [x] Table `organizations`
- [x] Table `users` 
- [x] Table `memberships` (multi-tenant)
- [x] Table `projects`
- [x] Table `contacts` (simplifié sans catégories)
- [x] Table `call_sheets`
- [x] Table `call_sheet_locations`
- [x] Table `call_sheet_schedule`
- [x] Table `call_sheet_team_rows`
- [x] Table `email_jobs` + `email_recipients`

**🔐 Sécurité RLS**
- [x] Policies RLS pour toutes les tables
- [x] Tests RLS (utilisateur ne voit que son org)
- [x] Helper functions Supabase (get_user_org_id)

**🌱 Seeds & Tests**
- [x] Données de test (orgs, users, contacts)
- [x] Tests auth basiques (signup/login avec mot de passe)
- [x] Flow d'onboarding pour création d'organisation
- [ ] Validation des policies RLS

**📱 Shell UI**
- [x] Layout principal avec navigation
- [x] Page `/dashboard` (shell avec données mockées)
- [x] Page `/projects` (MISSION CONTROL avec grille projets + filtres statuts)
- [x] Page `/contacts` (CONTACT DIRECTORY avec filtres départements + recherche)
- [x] Composants UI de base (Header, Sidebar, PageLayout, GridLayout, SectionHeader)
- [x] **Structure simplifiée :** Tout déplacé de `apps/web/` vers `calltimes/` directement
- [x] **Application fonctionnelle :** Dashboard accessible sur http://localhost:3000
- [x] **Design System Appliqué :** Vocabulaire "command", couleurs fonctionnelles par section
- [x] **Authentification complète :** Signup, Login, Onboarding, Middleware protection
- [x] **Multi-tenant ready :** Organisation auto-création, RLS policies actives

---

### ✏️ **PHASE 2 : ÉDITEUR & PREVIEW (Semaines 3-4)**

#### **Semaine 3 : Éditeur Core**

**📝 Structure Éditeur**
- [x] Page `/call-sheets/[id]/edit`
- [x] Layout éditeur : sidebar gauche + preview droite
- [x] Composant `<EditorSidebar>` avec 4 sections :
  - [x] **Section 1** : Informations Générales
  - [x] **Section 2** : Planning  
  - [x] **Section 3** : Équipe
  - [x] **Section 4** : Paramètres

**📋 Section Informations Générales**
- [x] Formulaire React Hook Form + Zod
- [x] Champs : titre, date de tournage, description
- [x] Gestion des lieux (ajout/suppression de cards)
- [ ] Upload logo (Supabase Storage + preview)

**⏰ Section Planning**
- [x] Liste des horaires (titre + heure texte libre)
- [x] Boutons Ajouter/Supprimer
- [ ] Boutons Up/Down pour réorganiser (pas de drag & drop)
- [ ] Validation Zod pour les horaires

#### **Semaine 4 : Preview A4 & Équipe**

**👥 Section Équipe**
- [x] Table des membres d'équipe
- [x] Champs : nom, rôle, email, téléphone, call time
- [ ] Boutons Up/Down pour réorganiser
- [ ] Intégration avec répertoire contacts (sélection)
- [ ] Ajout manuel (freelances ponctuels)

**📄 Preview A4 Temps Réel**
- [x] Composant `<CallSheetPreview>` 
- [x] CSS print optimisé (marges 12mm, A4)
- [x] Rendu temps réel des 4 sections
- [x] Police système fixe (Inter/Arial)
- [x] **Synchronisation temps réel** : Preview se met à jour instantanément
- [ ] Tests multi-navigateurs (Chrome, Firefox, Safari)

**💾 Auto-Save**
- [ ] Hook `useAutoSave` avec debounce 500ms
- [ ] Sauvegarde en draft automatique
- [ ] Indicateur de statut (sauvegardé/en cours)

**🧪 Tests Convergence**
- [ ] Prototype PDF simple pour validation
- [ ] Comparaison visuelle preview vs PDF
- [ ] Ajustements CSS si nécessaire

---

### 📄 **PHASE 3 : PDF & EMAIL (Semaine 5)**

#### **Service PDF (Fly.io)**

**🐳 Setup Service**
- [ ] Dockerfile pour service PDF (Node + Playwright)
- [ ] Configuration Fly.io (`fly.toml`)
- [ ] Endpoint `/render?token=...&callSheetId=...`
- [ ] Validation token signé + TTL (15 minutes)

**🎭 Génération PDF**
- [ ] Fetch données call sheet (Supabase service key)
- [ ] Rendu HTML avec mêmes composants que preview
- [ ] Configuration Chromium (A4, marges 12mm)
- [ ] Upload PDF vers bucket `pdfs/`
- [ ] Update `call_sheets.pdf_url`

**📧 Intégration Email**
- [ ] Configuration Postmark (domaine + templates)
- [ ] Page `/finalize/[callSheetId]`
- [ ] Formulaire envoi : objet, message, destinataires auto
- [ ] Envoi PDF en pièce jointe
- [ ] Webhook Postmark pour statut

**🔄 Gestion Erreurs**
- [ ] Retry automatique (3 tentatives)
- [ ] Notifications utilisateur (toast/alert)
- [ ] Logs d'erreur (Sentry)
- [ ] Fallback si service PDF indisponible

---

### 👥 **PHASE 4 : CONTACTS & IMPORT (Semaines 6-7)**

#### **Semaine 6 : CRUD Contacts**

**📇 Interface Contacts**
- [ ] Page `/contacts` avec table
- [ ] Filtres : recherche nom/email/téléphone
- [ ] CRUD complet (Create, Read, Update, Delete)
- [ ] Modal création/édition contact
- [ ] Validation formulaire (email, téléphone)

**🔗 Intégration Éditeur**
- [ ] Sélection contacts depuis l'éditeur
- [ ] Auto-remplissage des champs équipe
- [ ] Conversion ligne manuelle → contact permanent
- [ ] Gestion des contacts "favoris" ou récents

#### **Semaine 7 : Import CSV & Projets**

**📊 Import CSV**
- [ ] Interface upload CSV (drag & drop)
- [ ] Format fixe : `name,role,email,phone`
- [ ] Parsing avec validation
- [ ] Déduplication par email
- [ ] Rapport d'import (créés/ignorés/erreurs)

**📁 Gestion Projets**
- [ ] Page `/projects` avec liste
- [ ] CRUD projets basique
- [ ] Page projet `/projects/[id]` 
- [ ] Liste des call sheets du projet
- [ ] Actions : créer call sheet, dupliquer

**📋 Duplication Call Sheet**
- [ ] Bouton "Dupliquer" sur call sheet existante
- [ ] Copie des données + date +1 jour
- [ ] Modification possible avant sauvegarde

---

### 🚀 **PHASE 5 : FINITIONS & DÉPLOIEMENT (Semaine 8)**

#### **Polish & UX**

**🎨 Interface Finale**
- [ ] Design cohérent sur toutes les pages
- [ ] États de chargement (skeletons)
- [ ] Messages d'erreur utilisateur-friendly
- [ ] Responsive design (desktop priority)

**📊 Observabilité**
- [ ] Configuration Sentry (front + server)
- [ ] Métriques PostHog/Plausible :
  - [ ] `call_sheet_created`
  - [ ] `pdf_generated` 
  - [ ] `email_sent`
  - [ ] `csv_imported`

**🧪 Tests Utilisateurs**
- [ ] Tests avec 3-5 utilisateurs réels
- [ ] Scénario complet : projet → call sheet → PDF → email
- [ ] Corrections bugs critiques
- [ ] Validation convergence preview/PDF

#### **Déploiement Production**

**🌐 Déploiement Web**
- [ ] Configuration Vercel/Fly.io pour app web
- [ ] Variables d'environnement production
- [ ] Domaine personnalisé
- [ ] SSL/HTTPS

**🐳 Déploiement Service PDF**
- [ ] Deploy service PDF sur Fly.io
- [ ] Configuration scaling (min=1, max=3)
- [ ] Health checks et monitoring
- [ ] Tests de charge (10 PDF simultanés)

**📧 Configuration Email**
- [ ] Domaine d'envoi configuré
- [ ] SPF/DKIM/DMARC records
- [ ] Templates Postmark finalisés
- [ ] Tests d'envoi en production

---

## 🎯 ACCEPTANCE CRITERIA MVP

### **Scénario Utilisateur Complet**
- [ ] **Inscription** : Créer compte + organisation
- [ ] **Projet** : Créer un nouveau projet
- [ ] **Contacts** : Ajouter 5 contacts manuellement
- [ ] **Import** : Importer 10 contacts via CSV
- [ ] **Call Sheet** : Créer call sheet complète (infos + planning + équipe)
- [ ] **Preview** : Vérifier rendu A4 temps réel
- [ ] **PDF** : Générer PDF en < 10 secondes
- [ ] **Email** : Envoyer à l'équipe avec PDF
- [ ] **Duplication** : Dupliquer pour "Jour 2"

### **Critères Techniques**
- [ ] **Convergence** : < 2mm différence preview/PDF
- [ ] **Performance** : LCP < 2.5s sur éditeur
- [ ] **Sécurité** : RLS testé avec 2 organisations distinctes
- [ ] **Fiabilité** : 95% emails délivrés (Postmark)
- [ ] **Responsive** : Utilisable sur tablette (iPad)

### **Critères Business**
- [ ] **Onboarding** : < 5 minutes pour première call sheet
- [ ] **Qualité PDF** : Imprimable professionnellement
- [ ] **Import CSV** : > 90% succès sur formats standards
- [ ] **Uptime** : 99% disponibilité service PDF

---

## 📚 DOCUMENTATION TECHNIQUE

### **Architecture**
- [ ] Schéma architecture (diagramme)
- [ ] Documentation API interne
- [ ] Guide déploiement
- [ ] Runbook incidents

### **Développement**
- [ ] README avec setup local
- [ ] Guide contribution
- [ ] Standards code (ESLint + Prettier)
- [ ] Tests automatisés (CI/CD)

---

## 🔄 SUIVI & MÉTRIQUES

### **KPIs Développement**
- [ ] **Vélocité** : Stories/semaine
- [ ] **Qualité** : Bugs/fonctionnalité  
- [ ] **Performance** : Temps génération PDF
- [ ] **Tests** : Couverture code > 70%

### **KPIs Produit (Post-Launch)**
- [ ] **Adoption** : Call sheets créées/semaine
- [ ] **Engagement** : Projets actifs/utilisateur
- [ ] **Satisfaction** : NPS > 50
- [ ] **Technique** : Uptime > 99%

---

## 📞 CONTACTS & RESSOURCES

### **Services Externes**
- **Supabase** : Base de données + Auth + Storage
- **Fly.io** : Hébergement service PDF
- **Postmark** : Envoi emails transactionnels
- **Sentry** : Monitoring erreurs
- **PostHog/Plausible** : Analytics produit

### **Outils Développement**
- **Cursor** : IDE principal
- **GitHub** : Versioning + CI/CD
- **Figma** : Designs UI (si nécessaire)
- **Notion** : Documentation projet

---

> **🎯 Objectif Final** : Un MVP fonctionnel permettant de créer et envoyer des call sheets professionnelles en moins de 5 minutes, avec une qualité PDF impeccable et une UX fluide.

**Dernière mise à jour** : [DATE]  
**Version** : 1.0  
**Statut** : 🚧 En développement
