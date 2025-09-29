# 🎬 CALL TIMES - Professional Call Sheets SaaS

> Application SaaS pour créer, gérer et envoyer des call sheets professionnelles

## 🚀 Quick Start

### Prérequis
- **Node.js** 18+ 
- **npm** ou **yarn**
- **Compte Supabase** (pour la production)

### Installation

```bash
# Clone et installation
git clone <repository>
cd calltimes
npm install

# Démarrage développement
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

## 🏗️ Architecture

### Stack Technique
- **Frontend** : Next.js 15.5 + App Router + TypeScript
- **Styling** : Tailwind CSS 4 + shadcn/ui
- **Database** : Supabase (PostgreSQL + Auth + Storage)
- **Email** : Postmark (production)
- **PDF** : Service dédié Chromium (Fly.io)
- **Monitoring** : Sentry + PostHog/Plausible

### Structure du Projet

```
calltimes/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── dashboard/         # Command Center
│   │   ├── projects/          # Mission Control
│   │   ├── contacts/          # Contact Directory
│   │   └── globals.css        # Styles globaux + Design System
│   ├── components/
│   │   ├── ui/                # Composants shadcn/ui
│   │   └── layout/            # Layout components (Header, Sidebar, etc.)
│   └── lib/
│       ├── supabase/          # Configuration DB + Types
│       └── utils.ts           # Utilitaires
├── supabase/
│   └── migrations/            # Migrations SQL
├── package.json
└── README.md
```

## 🎨 Design System

### Philosophie
**"Professional Command Center"** - Interface qui inspire autorité, précision et contrôle absolu.

### Couleurs
```css
/* Fondations */
--black: #000000              /* Fond principal */
--white: #ffffff              /* Texte critique */

/* Niveaux de gris */
--gray-dark: #111111          /* Sections */
--gray-medium: #222222        /* Éléments interactifs */
--gray-light: #333333         /* Bordures */

/* Accent principal */
--accent: #4ade80             /* Actions, validations */

/* Couleurs fonctionnelles */
--blue: #3b82f6               /* Informations */
--red: #ef4444                /* Planning/Urgence */
--green: #4ade80              /* Équipe/Collaboration */
--orange: #f97316             /* Configuration */
```

### Typographie
- **Police** : Inter (900-400)
- **Hiérarchie** : Bold dominant, uppercase stratégique
- **Titres** : `COMMAND CENTER`, `MISSION CONTROL`

## 🗄️ Base de Données

### Architecture Multi-tenant
Chaque utilisateur appartient à une **organisation**. Les données sont isolées par RLS (Row Level Security).

### Tables Principales
- `organizations` - Organisations (multi-tenant)
- `users` - Utilisateurs (liés à Supabase Auth)
- `memberships` - Liaisons user-organisation + rôles
- `projects` - Projets de production
- `contacts` - Répertoire équipe
- `call_sheets` - Call sheets + métadonnées
- `call_sheet_*` - Détails (lieux, planning, équipe)
- `email_*` - Système d'envoi emails

### Sécurité RLS
```sql
-- Exemple: Les utilisateurs ne voient que les projets de leur org
CREATE POLICY "Users can view organization projects" ON projects
    FOR SELECT USING (user_belongs_to_organization(organization_id));
```

## 🔧 Configuration

### Variables d'Environnement
Créez un fichier `.env.local` :

```bash
# Supabase (Obligatoire pour DB)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Postmark (Production)
POSTMARK_API_TOKEN=your_postmark_token

# Sentry (Monitoring)
SENTRY_DSN=your_sentry_dsn
```

### Setup Supabase

1. **Créer un projet** sur [supabase.com](https://supabase.com)
2. **Exécuter les migrations** :
   ```bash
   # Via Supabase CLI
   supabase db push
   
   # Ou manuellement via Dashboard > SQL Editor
   # Exécuter: supabase/migrations/*.sql
   ```
3. **Configurer Auth** : Email + Magic Link
4. **Créer les buckets Storage** : `org-logos`, `project-assets`, `pdfs`

## 🧪 Développement

### Scripts Disponibles
```bash
npm run dev          # Serveur développement
npm run build        # Build production  
npm run start        # Serveur production
npm run lint         # ESLint
```

### Données de Test
Les migrations incluent des **données de test** :
- 3 organisations type (Studio, Indie, Commercial)
- 4 utilisateurs avec rôles différents
- 5 projets variés + call sheets
- 15 contacts avec tous les départements

### Pages Actuelles
- ✅ **Dashboard** (`/`) - Command Center
- ✅ **Projects** (`/projects`) - Mission Control
- ✅ **Contacts** (`/contacts`) - Contact Directory
- 🚧 **Éditeur** (`/call-sheets/[id]/edit`) - À venir
- 🚧 **Auth** (`/auth/*`) - À venir

## 📋 Roadmap MVP

### ✅ Phase 1 : Fondations (Semaines 1-2)
- [x] Setup Next.js + Tailwind + shadcn/ui
- [x] Design System complet
- [x] Migrations SQL + RLS
- [x] Pages principales (Dashboard, Projects, Contacts)

### 🚧 Phase 2 : Éditeur & Preview (Semaines 3-4)
- [ ] Éditeur call sheet (3 sections)
- [ ] Preview A4 temps réel
- [ ] Auto-save + validation

### 🚧 Phase 3 : PDF & Email (Semaine 5)
- [ ] Service PDF (Fly.io)
- [ ] Intégration Postmark
- [ ] Workflow d'envoi

### 🚧 Phase 4 : Contacts & Import (Semaines 6-7)
- [ ] CRUD contacts complet
- [ ] Import CSV
- [ ] Gestion projets avancée

### 🚧 Phase 5 : Production (Semaine 8)
- [ ] Tests utilisateurs
- [ ] Déploiement
- [ ] Monitoring

## 🎯 Acceptance Criteria MVP

**Scénario utilisateur complet :**
1. Inscription + création organisation
2. Import 10 contacts via CSV
3. Création call sheet complète
4. Preview A4 temps réel
5. Génération PDF < 10 secondes
6. Envoi email à l'équipe

**Critères techniques :**
- Convergence preview/PDF < 2mm
- Performance LCP < 2.5s
- Sécurité RLS testée
- 95% emails délivrés

## 🤝 Contribution

### Standards Code
- **ESLint** + **Prettier** configurés
- **TypeScript** strict mode
- **Conventional Commits**
- **shadcn/ui** pour les composants

### Architecture Composants
```tsx
// Structure type composant page
export default function PageName() {
  const sidebar = <Sidebar />
  
  return (
    <PageLayout user={user} sidebar={sidebar}>
      <SectionHeader title="PAGE TITLE" />
      <section>
        <GridLayout cols={3}>
          {/* Contenu */}
        </GridLayout>
      </section>
    </PageLayout>
  )
}
```

## 📞 Support

### Contacts
- **Développeur** : Simon Bandiera
- **Email** : simon@call-times.app

### Ressources
- **Supabase Docs** : [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs** : [nextjs.org/docs](https://nextjs.org/docs)
- **shadcn/ui** : [ui.shadcn.com](https://ui.shadcn.com)

---

> **🎯 Objectif** : Un MVP permettant de créer et envoyer des call sheets professionnelles en < 5 minutes, avec une qualité PDF impeccable et une UX de commandement militaire.

**Version** : 1.0 | **Status** : 🚧 En développement
