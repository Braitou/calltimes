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

## 📈 ÉTAT D'AVANCEMENT GLOBAL

| Phase | Statut | Progression | Fonctionnalités Clés | Date Achèvement |
|-------|---------|-------------|----------------------|------------------|
| **Phase 1** | ✅ **Terminée** | 100% | Fondations + Auth + UI Base | ✅ Semaine 2 |
| **Phase 2** | ✅ **Terminée** | 100% | Éditeur + Preview + Auto-save | ✅ Semaine 4 |
| **Phase 3** | ✅ **Terminée** | 95% | PDF + Email + Finalisation | ✅ Semaine 5 |
| **Phase 4** | ✅ **TERMINÉE** | 100% | **Contacts + Projets + Duplication** | ✅ Semaine 6 |
| **Phase 5** | 🚧 En cours | 90% | **Project Hub + Collaboration** | 🎯 Semaines 8-10 |
| **Phase 6** | ⏳ À venir | 0% | Finitions + Déploiement | 🎯 Semaines 11-12 |

### 🎯 **PROGRESSION TOTALE MVP : ~90% TERMINÉ (MVP V1)**

**✅ Phase 4 COMPLÈTEMENT TERMINÉE ! Tous les succès :**
- ✅ Interface contacts avec toggle Card/Liste
- ✅ CRUD complet (Create, Update, Delete) 
- ✅ Modal sélection contacts dans éditeur
- ✅ Boutons "📇 Répertoire" fonctionnels
- ✅ Sélection multiple de contacts
- ✅ Preview équipe triée par départements
- ✅ **Import CSV/Excel avec drag & drop**
- ✅ **Support XLSX, XLS et CSV**
- ✅ **Parsing intelligent multi-formats**
- ✅ **Détection automatique colonnes**
- ✅ **Auto-détection départements**
- ✅ **Validation et déduplication**
- ✅ **Rapport d'import détaillé**
- ✅ **Gestion projets complète**
- ✅ **Pages /projects avec CRUD**
- ✅ **Page projet /projects/[id] avec call sheets**
- ✅ **Création call sheet depuis projet**
- ✅ **Duplication call sheet avec date +1**
- ✅ **Bouton dupliquer dans éditeur**

**✅ Phase 5 PRESQUE TERMINÉE ! Succès majeurs :**

**🎨 Interface & UX :**
- ✅ Interface Desktop Canvas complète (3 colonnes : Tools, Canvas, Preview)
- ✅ Design System cohérent (fond noir #0a0a0a, grille pointillée)
- ✅ Custom scrollbars et CSS avancé
- ✅ Intégration Supabase Storage (upload/download/delete réels)
- ✅ Système d'invitations email complet (Postmark)
- ✅ Page acceptation invitation `/invite/[token]`

**📁 Gestion de Fichiers Avancée :**
- ✅ Drag & drop d'icônes sur canvas (comme Windows/macOS)
- ✅ Sélection multiple (rectangle + Ctrl+Clic)
- ✅ Création et gestion de dossiers
- ✅ Drag & drop de fichiers DANS les dossiers
- ✅ Drag & drop de fichiers HORS des dossiers (vers canvas)
- ✅ Renommage inline (comme Windows)
- ✅ Context menu (clic droit) avec actions
- ✅ Auto-arrangement des items (grille fixe)
- ✅ Suppression multiple (Delete key)
- ✅ Positions sauvegardées en temps réel (Supabase)
- ✅ Table `project_folders` avec positions X/Y

**📄 Preview & Visualisation :**
- ✅ Preview sidebar interactive (images, PDF, vidéos)
- ✅ Modal plein écran pour tous les types de fichiers
- ✅ Navigation entre fichiers (flèches gauche/droite)
- ✅ Téléchargement depuis preview
- ✅ **Visualiseur Excel/CSV complet** avec react-data-grid
- ✅ **Mini-preview Excel/CSV dans sidebar** (5 premières lignes)
- ✅ Support multi-feuilles Excel (onglets)
- ✅ Bouton "Agrandir" au hover

**📋 Call Sheets Intégration :**
- ✅ Call Sheets affichés comme icônes sur canvas
- ✅ Double-clic → ouvre l'éditeur
- ✅ Création depuis "Tools" card
- ✅ Suppression fonctionnelle
- ✅ Fix : Plus de duplication au moment de la création

**🔄 Prochaines étapes (Phase 5 - Finitions) :**
- ⏳ Tests RLS et permissions en conditions réelles
- ⏳ Visualiseurs Word/PowerPoint (Google Docs Viewer)
- ⏳ Notifications et activité récente
- ⏳ Optimisations performances

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
- [x] **Gestion des lieux avancée** : Multi-lieux avec nom + adresse + notes
- [x] **Contacts importants** : Cards avec nom + poste + tel + email
- [x] **Interface triple logos** : Production (gauche) + Marque (centre, plus gros) + Agence (droite)
- [x] Notes générales

**⏰ Section Planning**
- [x] Liste des horaires (titre + heure texte libre)
- [x] **Quick adds intelligents** : Boutons prédéfinis avec heures suggérées
- [x] **Cards éditables complètes** : Titre ET heure modifiables
- [x] **Tri automatique par heure** : Réorganisation temps réel
- [x] **Validation Zod temps réel** : Format HH:MM avec messages d'erreur
- [x] **Boutons Up/Down** : Réorganisation manuelle sans drag & drop
- [x] Boutons Ajouter/Supprimer

#### **Semaine 4 : Preview A4 & Équipe**

**👥 Section Équipe**
- [x] **Gestion avancée par départements** : 9 catégories avec couleurs
- [x] **Organisation automatique** : Tri et groupement par département
- [x] **Ajout manuel complet** : Formulaire 6 champs (nom, poste, dept, call time, tel, email)
- [x] **Boutons répertoire fonctionnels** : Ouverture page contacts en nouvel onglet
- [x] **Boutons Up/Down** : Réorganisation manuelle de l'équipe
- [x] **Codes couleur professionnels** : PROD, REGIE, CAM, REAL, HMC, etc.
- [x] Champs : nom, rôle, email, téléphone, call time, département

**📄 Preview A4 Temps Réel**
- [x] **Template professionnel final** : Header épuré avec 3 logos positionnés
- [x] **Structure logique optimisée** : Titre → Date → Lieux → Contacts → Planning → Équipe → Notes
- [x] **CSS print optimisé** : Marges, typographie, compacité PDF
- [x] **Rendu temps réel complet** : Toutes sections synchronisées
- [x] **Police système fixe** : Design épuré et professionnel
- [x] **Synchronisation temps réel** : Preview se met à jour instantanément
- [x] **Section CREW CALL dynamique** : Affichage équipe par département
- [ ] Tests multi-navigateurs (Chrome, Firefox, Safari)

**💾 Auto-Save**
- [x] **Hook `useAutoSave` professionnel** : Debounce 500ms + gestion d'erreurs
- [x] **Sauvegarde automatique** : Mock avec simulation délai (prêt pour vraie API)
- [x] **Indicateur de statut dynamique** : Sauvegardé/En cours/Erreur avec couleurs

**🧪 Tests Convergence**
- [x] Prototype PDF simple pour validation
- [x] Comparaison visuelle preview vs PDF
- [x] Ajustements CSS si nécessaire

---

### 📄 **PHASE 3 : PDF & EMAIL (Semaine 5)**

#### **Service PDF (Fly.io)**

**🐳 Setup Service**
- [x] Dockerfile pour service PDF (Node + Playwright)
- [x] Configuration Fly.io (`fly.toml`)
- [x] Endpoint `/render?token=...&callSheetId=...`
- [x] **Mode démo fonctionnel** : Fallback avec données de test + téléchargement direct
- [ ] Validation token signé + TTL (15 minutes)

**🎭 Génération PDF**
- [x] Fetch données call sheet (Supabase service key)
- [x] Rendu HTML avec mêmes composants que preview
- [x] Configuration Chromium (A4, marges 12mm)
- [x] Upload PDF vers bucket `pdfs/` (mode production)
- [x] **Convergence Preview/PDF validée** : Différences < 5% (données uniquement)
- [x] **Téléchargement automatique** : PDF se télécharge directement en mode démo

**📧 Intégration Email**
- [x] Configuration Postmark (domaine + templates)
- [x] Page `/finalize/[callSheetId]`
- [x] Formulaire envoi : objet, message, destinataires auto
- [x] Envoi PDF en pièce jointe
- [x] **Tests validation réussis** : Restriction domaine Postmark confirmée (compte pending)
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
- [x] **Page `/contacts` améliorée** : Grille cards + vue liste toggle
- [x] **Filtres avancés** : Recherche temps réel (nom/email/téléphone/rôle) + départements
- [x] **CRUD complet** : Create, Read, Update, Delete fonctionnels
- [x] **Modal création/édition** : Formulaire validé (Zod + React Hook Form)
- [x] **Validation formulaire** : Email, téléphone, champs requis
- [x] **Toggle vue Card/Liste** : Basculement interface pour overview rapide
- [x] **Stats dynamiques** : Compteurs temps réel, notifications toast

**🔗 Intégration Éditeur**
- [x] **Sélection contacts depuis éditeur** : Modal dédiée avec recherche/filtres
- [x] **Auto-remplissage équipe** : Mapping automatique contact → membre équipe
- [x] **Boutons répertoire fonctionnels** : "📇 Répertoire" ouvre modal sélection
- [x] **Modes spécialisés** : Important contacts vs Team members
- [x] **Sélection multiple** : Ajout de plusieurs contacts en une fois
- [x] **Interface optimisée** : Cards compactes avec badges colorés
- [x] **Preview améliorée** : Équipe triée par départements avec headers grisés
- [x] Conversion ligne manuelle → contact permanent
- [x] Gestion des contacts "favoris" ou récents

#### **Semaine 7 : Import CSV & Projets**

**📊 Import CSV/Excel**
- [x] **Interface upload multi-formats** : Drag & drop CSV, XLSX, XLS
- [x] **Détection automatique type fichier** : Parser adapté selon extension
- [x] **Parsing intelligent CSV** : Détection automatique colonnes (name, first/last name, role, job title, email, phone, department, catégorie)
- [x] **Parsing intelligent Excel** : Support colonnes variées (First Name, Last Name, Job Title, Catégorie, etc.)
- [x] **Auto-détection départements** : Depuis colonne explicite OU analyse du rôle
- [x] **Validation temps réel** : Email, téléphone, champs requis
- [x] **Déduplication par email** : Détection automatique des doublons
- [x] **Rapport d'import détaillé** : Statistiques (créés/ignorés/erreurs)
- [x] **Template CSV** : Téléchargement de modèle pré-formaté
- [x] **UX professionnelle** : Interface intuitive avec feedback visuel

**📁 Gestion Projets**
- [x] Page `/projects` avec liste
- [x] CRUD projets basique
- [x] Page projet `/projects/[id]` 
- [x] Liste des call sheets du projet
- [x] Actions : créer call sheet, dupliquer

**📋 Duplication Call Sheet**
- [x] Bouton "Dupliquer" sur call sheet existante
- [x] Copie des données + date +1 jour
- [x] Modification possible avant sauvegarde

---

### 📁 **PHASE 5 : PROJECT HUB & COLLABORATION (Semaines 8-10)**

> **Vision** : Transformer les projets en véritables hubs cloud collaboratifs où toute l'équipe peut consulter et gérer les documents de production

#### **Semaine 8 : File Management Core**

**🗄️ Base de Données**
- [x] Migration : Table `project_files` ✅
  - [x] Colonnes : id, project_id, file_name, file_path, file_type, folder_path ✅
  - [x] Colonnes : uploaded_by, created_at, file_size, mime_type ✅
  - [x] RLS policies pour accès sécurisé ✅
- [x] Migration : Table `project_members` ✅
  - [x] Colonnes : id, project_id, user_id (nullable), email, role ✅
  - [x] Colonnes : invitation_token, invitation_status, invited_at, accepted_at ✅
  - [x] RLS policies pour permissions ✅
- [x] Bucket Supabase Storage : `project-files` avec quotas ✅

**📤 Upload de Fichiers**
- [x] Interface drag & drop (react-dropzone) ✅
- [x] Upload vers Supabase Storage ✅
- [x] Validation : taille max (100MB), types autorisés ✅
- [x] Progress bar et feedback visuel ✅
- [x] Gestion d'erreurs (quota dépassé, type invalide) ✅

**📋 Gestion des Fichiers**
- [x] Liste des fichiers du projet (grid + list view) ✅
- [x] Affichage : nom, type, taille, date upload, uploadé par ✅
- [x] Actions : télécharger, supprimer, renommer ✅
- [x] Tri et filtres basiques (par type, par date) ✅
- [x] Search dans les noms de fichiers ✅

**🖼️ Prévisualisation Basique**
- [x] Preview images (JPG, PNG, GIF, WebP) ✅
- [x] Preview PDF (structure prête, viewer à compléter) ✅
- [x] Modal fullscreen pour viewer ✅
- [x] Navigation entre fichiers (dans modal) ✅
- [x] Fallback pour types non supportés ✅

#### **Semaine 9 : Interface Hub & Collaboration**

**🎨 Page Projet `/projects/[id]` Refonte**
- [x] Layout : Grid 2 colonnes (files principale + sidebar) ✅
- [x] Card "Files" : Liste/grille des fichiers ✅
- [x] Card "Tools" : Actions disponibles ✅
  - [x] Lien vers Call Sheet Editor ✅
  - [x] Statistiques du projet ✅
- [x] Card "Team" : Membres du projet ✅
  - [x] Liste des membres actifs ✅
  - [x] Bouton "Invite Member" ✅
  - [x] Rôles affichés (Owner/Editor/Viewer) ✅
- [x] Header projet : titre, statut, actions rapides ✅

**👥 Système d'Invitations**
- [x] Modal "Invite Member" avec champ email + rôle ✅
- [x] Génération token d'invitation unique (UUID) ✅
- [x] Envoi email via Postmark avec lien magique ✅
- [x] Template email invitation personnalisé ✅
- [x] Page `/invite/[token]` pour acceptation ✅
  - [x] Vérification token valide (expiration 7 jours) ✅
  - [x] Création compte si nouvel utilisateur ✅
  - [x] Association au projet ✅
  - [x] Redirection vers projet après acceptation ✅

**🔐 Permissions & Sécurité**
- [x] Rôles : Owner (full), Editor (upload/delete), Viewer (read-only) ✅
- [x] RLS Supabase : vérification membre avant accès fichiers ✅
- [x] URLs signées pour fichiers (Supabase Storage) ✅
- [ ] Logs d'accès : qui a consulté quel fichier (optionnel)
- [x] Protection téléchargement : vérification permissions ✅

#### **Semaine 10 : Advanced Features & Polish**

**📁 Organisation par Dossiers**
- [x] Création/suppression de dossiers ✅
- [x] Drag & drop pour déplacer fichiers DANS dossiers ✅
- [x] Drag & drop pour sortir fichiers DES dossiers ✅
- [x] Renommage inline (double-clic) ✅
- [x] Context menu (clic droit) avec actions ✅
- [x] Positions X/Y sauvegardées en temps réel ✅
- [ ] Navigation breadcrumb (pas nécessaire pour desktop canvas)
- [ ] Dossiers par défaut suggérés

**🔍 Sélection & Navigation**
- [x] Sélection simple (clic) ✅
- [x] Sélection multiple (Ctrl+Clic) ✅
- [x] Sélection rectangle (drag) ✅
- [x] Suppression multiple (Delete key) ✅
- [x] Auto-arrangement (clic droit → Ranger) ✅
- [x] Navigation entre fichiers (preview modal) ✅
- [ ] Raccourcis clavier avancés (Cmd+A, Cmd+C/V)
- [ ] Vue liste vs grille (toggle) - Actuellement: desktop canvas uniquement

**📎 Visualiseurs Multi-Formats**
- [x] **Excel/CSV Viewer complet** : react-data-grid, multi-feuilles, scroll virtuel ✅
- [x] **Mini-preview Excel/CSV** : 5 premières lignes dans sidebar ✅
- [x] Images : JPG, PNG, GIF, WebP ✅
- [x] PDF : iframe natif ✅
- [x] Video player : MP4, MOV (HTML5 video) ✅
- [x] Audio player : MP3, WAV (HTML5 audio) ✅
- [ ] Office Viewer : Word, PowerPoint (Google Docs Viewer)
- [ ] Amélioration PDF : annotations, zoom, page navigation

**🔔 Notifications**
- [ ] Email : nouveau fichier uploadé
- [ ] Email : nouveau membre ajouté
- [ ] Badge notifications in-app (header)
- [ ] Liste activités récentes du projet

**✨ UX Polish**
- [x] Loading states pour Excel/CSV ✅
- [x] Animations : drag & drop, hover effects ✅
- [x] Empty states : "Aucun fichier" ✅
- [x] Custom scrollbars (style cohérent) ✅
- [x] Feedback visuel : toasts, bordures sélection ✅
- [ ] Responsive : tablet/mobile friendly
- [ ] Animations d'apparition de fichiers
- [ ] Raccourcis clavier : upload (Cmd+U), search (Cmd+K)

**🧪 Tests & Sécurité**
- [x] Tests : upload fichiers volumineux (100MB) ✅
- [x] Tests : suppression fichiers ✅
- [x] Tests : déplacement fichiers (dossiers) ✅
- [ ] Tests : invitations (acceptation, expiration)
- [ ] Tests : permissions (tentative accès non autorisé)
- [ ] Tests : suppression cascade (projet → fichiers)
- [ ] Tests : quotas storage (limite atteinte)

---

### 🚀 **PHASE 6 : FINITIONS & DÉPLOIEMENT (Semaines 11-12)**

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
  - [ ] `file_uploaded`
  - [ ] `member_invited`

**🧪 Tests Utilisateurs**
- [ ] Tests avec 3-5 utilisateurs réels
- [ ] Scénario complet : projet → upload fichiers → invite team → call sheet → PDF → email
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
- [ ] Templates Postmark finalisés (call sheet + invitations)
- [ ] Tests d'envoi en production

**💾 Storage & Quotas**
- [ ] Configuration limites Supabase Storage
- [ ] Monitoring utilisation par projet
- [ ] Alertes quotas (90% utilisés)
- [ ] Plan upgrade storage si besoin

---

## 🎯 ACCEPTANCE CRITERIA MVP

### **Scénario Utilisateur Complet**
- [x] **Inscription** : Créer compte + organisation
- [ ] **Projet** : Créer un nouveau projet
- [x] **Contacts** : Ajouter 5 contacts manuellement ✅ CRUD complet
- [ ] **Import** : Importer 10 contacts via CSV
- [x] **Call Sheet** : Créer call sheet complète (infos + planning + équipe) ✅ Éditeur complet
- [x] **Preview** : Vérifier rendu A4 temps réel ✅ Convergence validée
- [x] **PDF** : Générer PDF en < 10 secondes ✅ Service fonctionnel
- [x] **Email** : Envoyer à l'équipe avec PDF ✅ Postmark intégré
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

> **🎯 Objectif Final** : Une plateforme collaborative complète pour productions audiovisuelles, permettant de gérer projets, fichiers, équipes et call sheets dans un hub cloud centralisé. L'utilisateur peut créer des call sheets professionnelles, partager des documents avec son équipe, et inviter des collaborateurs en quelques clics.

**Dernière mise à jour** : 16 octobre 2025  
**Version** : 2.5 (Project Hub Advanced Edition)  
**Statut** : ✅ Phase 4 TERMINÉE - 🚧 Phase 5 (Project Hub) PRESQUE TERMINÉE - 90% MVP V1 terminé
