# CALL TIMES - Brief Direction Artistique

## Concept Produit

**Call Times** est une application SaaS destinée aux producteurs audiovisuels pour créer, gérer et envoyer des call sheets de manière professionnelle et efficace.

### Utilisateurs Cibles
- Producteurs audiovisuels professionnels
- Assistants de production
- Régisseurs de tournage
- Équipes de production indépendantes

### Positionnement
Outil de **commandement professionnel** qui inspire confiance et contrôle total sur la production. Interface pour les pros qui ne plaisantent pas avec l'efficacité.

## Vision Esthétique : Mix entre l'agressivité sportive de Nike et l'élégance chic de Apple

### Philosophie Générale
L'interface doit transmettre **autorité, précision et contrôle absolu**. Chaque élément doit renforcer la sensation que l'utilisateur maîtrise parfaitement sa production.

### Références Visuelles
- **Cockpits d'avions** : interfaces critiques, informations hiérarchisées
- **Terminaux professionnels** : noir/blanc, efficacité avant tout
- **Design industriel** : fonctionnel, robuste, sans compromis

### Mots-clés Directeurs
- **Command** : L'utilisateur est aux commandes
- **Precision** : Chaque détail compte
- **Speed** : Vitesse d'exécution critique
- **Control** : Maîtrise totale du workflow

## Palette de Couleurs

### Variables CSS Obligatoires
```css
:root {
  /* Fondations */
  --black: #000;           /* Fond principal */
  --white: #fff;           /* Texte et éléments critiques */
  
  /* Niveaux de gris */
  --gray-100: #111;        /* Arrière-plans sections */
  --gray-200: #222;        /* Éléments interactifs */
  --gray-300: #333;        /* Bordures et séparateurs */
  --gray-400: #999;        /* Texte secondaire */
  --gray-500: #666;        /* Texte désactivé */
  --gray-600: #ccc;        /* Texte normal */
  
  /* Accent principal */
  --accent: #4ade80;       /* Actions, validations, brand */
  
  /* Couleurs fonctionnelles */
  --blue: #3b82f6;         /* Informations */
  --red: #ef4444;          /* Planning/Urgence */
  --orange: #f97316;       /* Configuration */
  --green: #4ade80;        /* Équipe/Collaboration */
}
```

### Règles d'Usage
- **Noir dominant** : 80% de l'interface
- **Vert accent** : Actions principales uniquement
- **Gris hiérarchisés** : Information et navigation
- **Couleurs fonctionnelles** : Codes visuels spécifiques (éditeur)

## Typographie

### Police Système
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Hiérarchie Obligatoire
```css
/* Titres Héros */
.title-hero {
  font-size: 3rem-8rem;
  font-weight: 900;
  line-height: 0.8;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

/* Titres Sections */
.title-section {
  font-size: 1.2rem-2.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Navigation */
.nav-item {
  font-weight: 500-600;
  text-transform: uppercase;
}

/* Labels UI */
.ui-label {
  font-size: 0.8rem-0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-400);
}

/* Corps de texte */
.body-text {
  font-size: 0.9rem-1.1rem;
  font-weight: 400-500;
  line-height: 1.5;
}
```

### Règles Typographiques
- **Bold dominant** : Font-weight 700+ pour tous les éléments importants
- **Uppercase stratégique** : Titres, navigation, labels
- **Espacement maîtrisé** : Letter-spacing négatif pour gros titres
- **Hiérarchie claire** : Contraste de poids pour organiser l'info

## Architecture Interface

### Système de Navigation
```css
/* Header Navigation */
.header {
  background: var(--black);
  border-bottom: 1px solid var(--gray-300);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}
```

**Principes** :
- Navigation horizontale en header (pas de sidebar)
- Logo "CALL TIMES" en bloc typographique fort
- Actions principales toujours accessibles
- User info discrète à droite

### Grille et Layout
```css
/* Container principal */
.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem-3rem;
}

/* Grilles système */
.grid-2 { grid-template-columns: 1fr 1fr; }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-sidebar { grid-template-columns: 1fr 300px; }
.gap-standard { gap: 2rem-3rem; }
```

### Structure des Pages
```css
/* Page standard */
1. Header (navigation)
2. Page header (titre + actions)
3. Content main (grid selon contexte)
4. Sidebar (300px fixe quand nécessaire)
```

## Composants UI

### Boutons Système
```css
/* Primary - Action principale */
.btn-primary {
  background: var(--accent);
  color: var(--black);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

/* Secondary - Action secondaire */
.btn-secondary {
  background: var(--gray-300);
  color: var(--white);
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
}

/* Danger - Actions critiques */
.btn-danger {
  background: var(--red);
  color: var(--white);
  font-weight: 600;
}
```

### Cards et Sections
```css
.card-standard {
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  border-radius: 8px-12px;
  padding: 1.5rem-2rem;
}

.section-header {
  border-bottom: 1px solid var(--gray-300);
  padding-bottom: 0.75rem;
  margin-bottom: 1.5rem;
}
```

### Status et Badges
```css
/* États système */
.status-active { background: var(--accent); color: var(--black); }
.status-warning { background: var(--orange); color: var(--black); }
.status-error { background: var(--red); color: var(--white); }
.status-inactive { background: var(--gray-300); color: var(--gray-400); }
```

### Formulaires
```css
.form-input {
  background: var(--gray-200);
  border: 1px solid var(--gray-300);
  color: var(--white);
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.form-input:focus {
  border-color: var(--accent);
  background: var(--gray-300);
  outline: none;
}
```

## Interactions & Animations

### Micro-interactions Standard
```css
/* Hover states */
.interactive:hover {
  transform: translateY(-1px);
  background: /* couleur légèrement plus claire */;
}

/* Focus states */
.focusable:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Transitions uniformes */
* {
  transition: all 0.2s ease;
}
```

### Feedback Visuel
- **Succès** : Couleur verte + animation subtile
- **Erreur** : Couleur rouge + shake léger
- **Loading** : Spinner minimaliste
- **Sauvegarde** : Indication discrète temps réel

## Responsive Design

### Breakpoints
```css
/* Desktop */
@media (min-width: 1024px) { /* Layout complet */ }

/* Tablet */
@media (max-width: 1024px) { 
  /* Simplification grilles */
  .grid-sidebar { grid-template-columns: 1fr; }
}

/* Mobile */
@media (max-width: 768px) { 
  /* Stack vertical, navigation adaptée */
  .header { flex-direction: column; gap: 1rem; }
}
```

### Adaptation Mobile
- Navigation collapse intelligente
- Touch targets 44px minimum
- Grilles single-column automatiques
- Typographie scalable

## Langage et Ton

### Vocabulaire Interface
```
Ancien terme → Nouveau terme
"Créer" → "LAUNCH"
"Gérer" → "COMMAND" 
"Envoyer" → "DEPLOY"
"Modifier" → "CONFIGURE"
"Voir" → "MONITOR"
```

### Titres de Sections
- **"COMMAND CENTER"** (Dashboard)
- **"MISSION CONTROL"** (Projet actif)
- **"CONTACT DIRECTORY"** (Répertoire)
- **"DEPLOY READY"** (Finalisation)

### Messages Système
- Succès : "MISSION ACCOMPLISHED"
- Erreur : "SYSTEM ERROR - RETRY"
- Sauvegarde : "DATA SECURED"
- Envoi : "DEPLOYMENT SUCCESSFUL"

## Pages Principales

### 1. Dashboard
- **Hero** : "COMMAND CENTER" avec stats imposantes
- **Quick Actions** : 3 cartes horizontales (Nouveau/Manager/Contacts)
- **Overview** : Métriques clés en grid
- **Activity** : Projets et call sheets récents

### 2. Page Projet
- **Header** : Breadcrumb + titre projet + stats temps réel
- **Layout** : Main content + sidebar 300px
- **Sections** : Call sheets avec statuts + Documents
- **Actions** : Sidebar avec workflow rapide

### 3. Contacts
- **Filtres** : Départements horizontaux avec compteurs
- **Display** : Grille cards avec sélection multiple
- **Search** : Intégrée dans header
- **Actions** : Export, import, gestion groupée

### 4. Éditeur Call Sheet
- **Layout** : Split-screen (sidebar 350px + preview)
- **Navigation** : 4 onglets colorés (Infos/Planning/Équipe/Paramètres)
- **Édition** : Temps réel avec preview synchronisé
- **Codes couleurs** : Bleu/Rouge/Vert/Orange par section

### 5. Finalisation
- **Workflow** : Preview → Email → Upload → Send
- **Layout** : Main form + sidebar infos
- **Email** : Multi-destinataires avec compteur
- **Export** : PDF + fichiers supplémentaires

## Guidelines Techniques

### Structure CSS
```scss
// 1. Variables (couleurs, espacements)
// 2. Reset et base
// 3. Layout (grilles, containers)
// 4. Composants (boutons, cards, forms)
// 5. Pages spécifiques
// 6. Responsive
```

### Nomenclature Classes
```css
/* BEM Pattern */
.block__element--modifier

/* Exemples */
.btn__text--uppercase
.card__header--bordered
.nav__link--active
```

### Performance
- CSS critique inline
- Fonts preload
- Animations GPU-accelerated
- Images lazy loading

## Checklist Implémentation

### Obligatoire
- [ ] Variables CSS complètes implémentées
- [ ] Typographie Inter chargée et configurée
- [ ] Navigation header responsive fonctionnelle
- [ ] Composants boutons selon spec
- [ ] États hover/focus sur tous éléments interactifs
- [ ] Grilles responsive pour toutes les pages
- [ ] Codes couleurs éditeur respectés

### Qualité
- [ ] Contraste WCAG AA respecté
- [ ] Navigation clavier complète
- [ ] Animations fluides 60fps
- [ ] Mobile-first implementation
- [ ] Loading states définis
- [ ] Error states gérés

### Brand
- [ ] Logo "CALL TIMES" en bloc typographique
- [ ] Langage "command" appliqué
- [ ] Vert accent (#4ade80) utilisé avec parcimonie
- [ ] Noir dominant maintenu
- [ ] Esthétique "professional command center" cohérente

---

**OBJECTIF** : Créer une interface qui inspire immédiatement confiance et contrôle. L'utilisateur doit sentir qu'il maîtrise parfaitement sa production grâce à un outil conçu pour les vrais professionnels.