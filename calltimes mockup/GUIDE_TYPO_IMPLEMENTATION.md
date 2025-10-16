# 🎨 NOUVELLE IDENTITÉ TYPO - CALL TIMES

## 📋 Résumé Exécutif

**Concept :** Modernité brutale + Élégance classique  
**Inspiration :** Nike × Apple × Kinfolk  
**Fonts :** Inter Black (sans-serif moderne) + Libre Baskerville Italic (serif élégant)

---

## 🎯 Le Nouveau Logo

### Version Verticale (Principale)
```
CALL  ← Inter Black 900, uppercase, tracking tight
Times ← Libre Baskerville Italic, sentence case, légèrement plus grand
```

### Proportions
- **CALL** : Base 100%
- **Times** : Base 110% (légèrement plus grand pour équilibre visuel)

### Où l'utiliser
- Header principal de l'application
- Page de login
- Emails (signature)
- Documentation

---

## 📐 Hiérarchie Typographique Complète

| Niveau | Font | Weight | Size | Transform | Usage |
|--------|------|--------|------|-----------|-------|
| **Logo CALL** | Inter | 900 | Variable | Uppercase | Branding |
| **Logo Times** | Baskerville | 400 Italic | Variable | Sentence | Branding |
| **Hero Title** | Inter | 900 | 4rem | Uppercase | Landing, sections majeures |
| **Hero Subtitle** | Baskerville | 400 Italic | 2rem | Normal | Accroches élégantes |
| **Page Title** | Inter | 900 | 2.5rem | Uppercase | Titres de pages |
| **Section Header** | Baskerville | 400 Italic | 1.75rem | Normal | Sections importantes |
| **Subsection** | Inter | 700 | 1rem | Uppercase | Catégories, groupes |
| **Card Title** | Inter | 700 | 1.125rem | Normal | Titres cards |
| **Card Subtitle** | Baskerville | 400 Italic | 1rem | Normal | Descriptions courtes |
| **Body** | Inter | 400 | 0.9375rem | Normal | Paragraphes |
| **Label** | Inter | 600 | 0.75rem | Uppercase | Tags, metadata |

---

## 🎨 Règles d'Or

### ✅ À FAIRE
1. **Inter Black** pour tout ce qui est ACTION et IMPACT
   - Boutons principaux
   - Titres de sections
   - Navigation
   - Stats/chiffres importants

2. **Baskerville Italic** pour tout ce qui est ÉLÉGANCE et NARRATION
   - Accroches marketing ("Welcome back, Simon")
   - Descriptions de projets
   - Sous-titres poétiques
   - Citations

3. **Contraste maximal**
   - Ne jamais mélanger les deux dans la même ligne
   - Toujours un espace visuel clair entre elles
   - Passer de l'une à l'autre crée du rythme

### ❌ À ÉVITER
1. Baskerville en uppercase (perd son élégance)
2. Baskerville pour UI/boutons (pas fait pour ça)
3. Inter Regular pour titres (pas assez d'impact)
4. Baskerville en petite taille (< 14px)
5. Trop d'italiques sur une page (dilue l'effet)

---

## 💻 Implémentation Code

### 1. Import des fonts (Next.js)

**Option A : Google Fonts (Recommandé)**
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';
import { Libre_Baskerville } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const baskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-baskerville',
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${inter.variable} ${baskerville.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### 2. Config Tailwind

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        serif: ['var(--font-baskerville)', 'Libre Baskerville', 'serif'],
      },
    },
  },
};
```

### 3. Classes CSS Utility

```css
/* globals.css */

/* Logo */
.logo-call {
  font-family: var(--font-inter);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 0.85;
}

.logo-times {
  font-family: var(--font-baskerville);
  font-style: italic;
  font-weight: 400;
  letter-spacing: 0.02em;
}

/* Hero Title */
.hero-title {
  font-family: var(--font-inter);
  font-weight: 900;
  font-size: 4rem;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 0.9;
}

/* Section Header */
.section-header {
  font-family: var(--font-baskerville);
  font-style: italic;
  font-size: 1.75rem;
  line-height: 1.3;
}

/* Card Subtitle */
.card-subtitle {
  font-family: var(--font-baskerville);
  font-style: italic;
  font-size: 1rem;
  color: #a3a3a3;
}
```

### 4. Composants React

**Logo Component :**
```tsx
// components/Logo.tsx
export function Logo({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizes = {
    small: { call: 'text-2xl', times: 'text-[1.65rem]' },
    medium: { call: 'text-5xl', times: 'text-[3.3rem]' },
    large: { call: 'text-[5rem]', times: 'text-[5.5rem]' },
  };

  return (
    <div className="inline-block">
      <div className={`logo-call ${sizes[size].call}`}>CALL</div>
      <div className={`logo-times ${sizes[size].times}`}>Times</div>
    </div>
  );
}
```

**Hero Title Component :**
```tsx
// components/HeroTitle.tsx
export function HeroTitle({ 
  title, 
  subtitle 
}: { 
  title: string; 
  subtitle?: string;
}) {
  return (
    <div className="space-y-4">
      <h1 className="hero-title">{title}</h1>
      {subtitle && (
        <p className="section-header text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}
```

---

## 📄 Exemples d'Usage par Page

### Dashboard
```tsx
<Logo size="medium" />

<div className="mt-12">
  <p className="section-header mb-2">Welcome back, Simon</p>
  <h1 className="hero-title text-[2.5rem]">DASHBOARD</h1>
  <p className="text-gray-400 mt-2">Your production command center</p>
</div>
```

### Page Mission Control (Projets)
```tsx
<div className="page-header">
  <h1 className="text-4xl font-black uppercase tracking-tight">
    MISSION CONTROL
  </h1>
  <p className="section-header text-xl mt-2">
    Coordonnez vos productions avec élégance
  </p>
</div>
```

### Page Contact Directory
```tsx
<div className="page-header">
  <h1 className="text-4xl font-black uppercase tracking-tight">
    CONTACT DIRECTORY
  </h1>
  <p className="text-gray-400 mt-2">
    Votre arsenal humain pour dominer toutes les productions
  </p>
</div>
```

### Project Card
```tsx
<div className="project-card">
  <div className="text-xs font-semibold uppercase tracking-wider text-gray-600">
    COMMERCIAL • SPORT
  </div>
  <h3 className="text-lg font-bold mt-2">Nike Air Max Campaign</h3>
  <p className="card-subtitle mt-1">Spring 2025 collection launch</p>
  <p className="text-sm text-gray-400 mt-3">
    A dynamic 3-day shoot featuring athletes and lifestyle content.
  </p>
</div>
```

---

## 🎬 Animations & Transitions

Les fonts elegantes méritent des transitions douces :

```css
/* Smooth font weight transitions */
.hover-weight {
  transition: font-weight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Elegant fade-in for Baskerville elements */
.fade-in-elegant {
  animation: fadeInElegant 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInElegant {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 📱 Responsive

### Mobile (< 768px)
- Logo : Size "small"
- Hero Title : 2.5rem → 2rem
- Section Header : 1.75rem → 1.25rem
- Réduire tracking sur Inter Black

### Tablet (768px - 1024px)
- Logo : Size "medium"
- Conserver proportions

### Desktop (> 1024px)
- Logo : Size "medium" ou "large"
- Pleine expression typographique

---

## 🚀 Migration depuis l'ancien design

### Étape 1 : Setup fonts
1. Installer les fonts (voir code ci-dessus)
2. Ajouter les variables CSS
3. Tester le logo

### Étape 2 : Pages principales
1. Dashboard (hero + welcome)
2. Mission Control (page title)
3. Contact Directory (page title)

### Étape 3 : Composants
1. Cards (titles + subtitles)
2. Modals (headers)
3. Empty states (messages)

### Étape 4 : Polish
1. Ajuster spacings
2. Tester responsive
3. Valider contraste/lisibilité

---

## 📊 Checklist de validation

- [ ] Logo affiché correctement (vertical)
- [ ] Inter Black pour tous les titres forts
- [ ] Baskerville Italic pour accroches élégantes
- [ ] Pas de Baskerville en uppercase
- [ ] Pas de Baskerville en petite taille
- [ ] Contraste clair entre les deux fonts
- [ ] Responsive fonctionnel
- [ ] Pas de mixage dans même ligne
- [ ] Animations douces
- [ ] Lisibilité préservée

---

## 💡 Pro Tips

1. **Baskerville donne de l'air** : Ne pas hésiter à augmenter line-height (1.4-1.6)
2. **Inter Black = Impact** : Utiliser -0.02em tracking pour resserrer
3. **Contraste poids** : Jamais Inter Regular avec Baskerville (trop proche)
4. **Espacement** : Toujours plus d'espace autour de Baskerville
5. **Taille relative** : Baskerville ~110% de Inter pour équilibre optique

---

**Le système est prêt ! Combine modernité et élégance pour une identité unique.** 🎨
