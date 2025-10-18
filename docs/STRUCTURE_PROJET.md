# 📁 Structure du Projet - Call Times

> Documentation de l'architecture et organisation du code

---

## 🏗️ Architecture Générale

```
calltimes/
├── src/                    # Code source Next.js
├── supabase/              # Migrations et configuration DB
├── services/              # Services externes (PDF renderer)
├── docs/                  # Documentation
├── public/                # Assets statiques
└── scripts/               # Scripts utilitaires
```

---

## 📂 Détail des Dossiers

### `src/app/` - Routes Next.js (App Router)

```
app/
├── api/                   # API Routes
│   └── invitations/       # Endpoints invitations (org + projet)
│
├── auth/                  # Authentification
│   ├── login/            # Page connexion
│   ├── signup/           # Page inscription
│   └── onboarding/       # Configuration initiale
│
├── call-sheets/          # Éditeur Call Sheets
│   └── [id]/
│       └── edit/         # Page édition
│
├── contacts/             # Répertoire contacts
│   └── page.tsx          # Liste + CRUD
│
├── dashboard/            # Tableau de bord
│   └── page.tsx          # Vue d'ensemble
│
├── invite/               # Acceptation invitations
│   ├── [token]/          # Invitations projet (guests)
│   └── org/[token]/      # Invitations organisation
│
├── projects/             # Mission Control
│   ├── page.tsx          # Liste projets
│   ├── new/              # Création projet
│   └── [id]/             # Project Hub (Desktop Canvas)
│
├── settings/             # Paramètres
│   └── team/             # Gestion équipe organisation
│
├── layout.tsx            # Layout racine (fonts, metadata)
├── page.tsx              # Landing page (redirect dashboard)
└── globals.css           # Styles globaux + Tailwind
```

---

### `src/components/` - Composants React

```
components/
├── contacts/             # Composants contacts
│   ├── ContactCard.tsx
│   ├── ContactModal.tsx
│   └── SelectContactModal.tsx
│
├── layout/               # Layout général
│   ├── Header.tsx        # Navigation principale
│   ├── Footer.tsx
│   ├── PageLayout.tsx
│   └── GridLayout.tsx
│
├── project-hub/          # Project Hub (18 composants)
│   ├── DesktopCanvas.tsx         # Canvas principal
│   ├── DesktopIcon.tsx           # Icônes fichiers/dossiers
│   ├── ContextMenu.tsx           # Menu clic droit
│   ├── PreviewSidebar.tsx        # Preview documents
│   ├── ToolsSidebar.tsx          # Actions rapides
│   ├── UploadModal.tsx           # Upload fichiers
│   ├── CreateFolderModal.tsx     # Création dossiers
│   ├── InviteMemberModal.tsx     # Invitations projet
│   ├── FullScreenPreview.tsx     # Modal plein écran
│   ├── ExcelViewer.tsx           # Visualiseur Excel/CSV
│   └── ... (8 autres)
│
├── settings/             # Paramètres
│   └── InviteMemberModal.tsx     # Invitations organisation
│
├── ui/                   # Composants shadcn/ui (18)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ... (14 autres)
│
└── Logo.tsx              # Logo Call Times (3 tailles)
```

---

### `src/lib/` - Logique métier & utilitaires

```
lib/
├── constants/            # Constantes
│   └── canvas.ts         # Constantes zone privée (60/40)
│
├── services/             # Services métier (11 fichiers)
│   ├── call-sheets.ts
│   ├── contacts.ts
│   ├── email-invitation.ts
│   ├── email-organization-invitation.ts
│   ├── files.ts
│   ├── folders.ts
│   ├── invitations.ts
│   ├── organization-invitations.ts
│   ├── projects.ts
│   └── users.ts
│
├── supabase/             # Clients Supabase
│   ├── client.ts         # Client browser
│   ├── server.ts         # Client server
│   ├── middleware.ts     # Client middleware
│   └── admin.ts          # Client admin (service key)
│
├── types/                # Types TypeScript
│   └── database.ts       # Types générés Supabase
│
├── utils/                # Utilitaires
│   ├── position-helpers.ts    # Calcul positions canvas
│   ├── auto-arrange.ts        # Auto-arrangement items
│   └── file-helpers.ts        # Helpers fichiers
│
├── validations/          # Schémas Zod
│   └── call-sheet.ts
│
└── utils.ts              # Utilitaires généraux (cn, etc.)
```

---

### `src/hooks/` - Custom React Hooks

```
hooks/
├── useAutoSave.ts        # Auto-sauvegarde debounced
└── useUserAccess.ts      # Détection type utilisateur + permissions
```

---

### `src/contexts/` - React Contexts

```
contexts/
├── contacts-context.tsx      # État global contacts
└── departments-context.tsx   # État global départements
```

---

### `src/middleware.ts` - Next.js Middleware

Protection des routes et gestion authentification (Supabase SSR).

---

### `supabase/migrations/` - Migrations SQL

```
migrations/
├── 20240929000001_initial_schema.sql          # Tables principales
├── 20240929000002_rls_policies.sql            # Policies RLS initiales
├── 20240929000003_seed_data.sql               # Données de test
├── 20240929000004_auto_organization.sql       # Trigger auto-création org
├── 20240929000008_storage_setup.sql           # Buckets Storage
├── 20241009000001_project_hub.sql             # Tables project_files/folders
├── 20241016000006_project_hub_desktop.sql     # Positions X/Y
├── 20241017000001_organization_invitations.sql # Invitations org
├── 20241017000002_guest_access_rls.sql        # Policies guests
├── 20241018000001_enable_realtime.sql         # Realtime
└── 20241018000005_cleanup_guest_memberships.sql # Nettoyage guests
```

**Total** : 25 migrations (dont 5 majeures pour Phase 5)

---

### `services/pdf-renderer/` - Service PDF (Fly.io)

```
pdf-renderer/
├── src/
│   ├── server.js         # Express server
│   ├── health.js         # Health check
│   └── logger.js         # Logging
├── Dockerfile            # Image Docker
├── fly.toml              # Config Fly.io
└── package.json          # Dépendances (Playwright)
```

**Statut** : Mode démo fonctionnel, déploiement Fly.io à venir.

---

### `docs/` - Documentation

```
docs/
├── archives/             # Archives sessions développement
│   ├── INDEX.md          # Index archives
│   ├── session-octobre-2025/  # 25 fichiers MD
│   └── sql-debug/        # 14 fichiers SQL debug
│
├── CHANGELOG_OCTOBRE_2025.md  # Résumé Phase 5
├── STRUCTURE_PROJET.md        # Ce fichier
└── setup-email.md             # Config Postmark
```

---

### `public/` - Assets Statiques

```
public/
├── favicon.ico
└── example-contacts.csv  # Template import contacts
```

---

## 🗄️ Base de Données Supabase

### Tables Principales

| Table | Description | Relations |
|-------|-------------|-----------|
| `organizations` | Organisations (multi-tenant) | → `users`, `projects` |
| `users` | Utilisateurs | → `memberships`, `project_members` |
| `memberships` | Membres organisation | ← `organizations`, `users` |
| `projects` | Projets | ← `organizations` |
| `project_members` | Membres projet (+ guests) | ← `projects`, `users` |
| `project_files` | Fichiers projets | ← `projects` |
| `project_folders` | Dossiers projets | ← `projects` |
| `call_sheets` | Call sheets | ← `projects` |
| `contacts` | Répertoire contacts | ← `organizations` |
| `organization_invitations` | Invitations org | ← `organizations` |

### Buckets Storage

- `org-logos` : Logos organisations
- `project-files` : Fichiers projets (docs, images, etc.)
- `pdfs` : PDFs générés (call sheets)

---

## 🔐 Sécurité

### RLS (Row Level Security)

Toutes les tables ont des policies RLS strictes :
- **Isolation multi-tenant** : Utilisateurs ne voient que leur organisation
- **Permissions granulaires** : Owner/Editor/Viewer
- **Guest access** : Accès restreint via `project_members`

### Authentification

- **Supabase Auth** : Email + mot de passe
- **Magic links** : Invitations organisation
- **Guest tokens** : Accès projet sans compte (localStorage)

---

## 🎨 Design System

### Couleurs

- **Fond** : `#000000` (noir pur)
- **Fond secondaire** : `#0a0a0a` (noir légèrement grisé)
- **Zone privée** : `#111111` (gris très foncé)
- **Accent** : `#4ade80` (vert Call Times)
- **Texte** : `#ffffff` (blanc)

### Typographie

- **Titres** : Libre Baskerville Italic (sentence case)
- **UI/Boutons** : Inter Black 900 (UPPERCASE)
- **Corps** : Inter Regular

### Composants

- **shadcn/ui** : Base composants (Button, Card, Dialog, etc.)
- **Lucide React** : Icônes
- **Tailwind CSS** : Styling

---

## 🚀 Commandes Utiles

```bash
# Développement
npm run dev              # Démarrer Next.js (localhost:3000)

# Build
npm run build           # Build production
npm run start           # Démarrer en production

# Linting
npm run lint            # ESLint

# Supabase
npx supabase db reset   # Reset DB + migrations
npx supabase db push    # Appliquer nouvelles migrations
```

---

## 📊 Statistiques

- **Composants React** : ~50
- **Services** : 11
- **Hooks custom** : 4
- **Migrations SQL** : 25
- **Routes** : 15+
- **Lignes de code** : ~20,000 (estimation)

---

**Dernière mise à jour** : 18 octobre 2025  
**Version** : 2.7 (Private Zone Edition)


