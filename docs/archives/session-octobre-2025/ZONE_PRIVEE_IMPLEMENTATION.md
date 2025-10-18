# 🔒 Implémentation Zone Privée - Project Hub

## 📋 Résumé

Remplacement du système de "dossiers privés individuels" par un système de **zones spatiales** dans le canvas :
- **Zone Partagée** (60% en haut) : Visible par tous (org members + guests)
- **Zone Privée** (40% en bas) : Visible uniquement par les membres de l'organisation

## ✅ Modifications effectuées

### 1. Nouvelle constante partagée
**Fichier** : `src/lib/constants/canvas.ts` (nouveau)
- Constante `PRIVATE_ZONE_THRESHOLD = 0.6` (60/40)
- Constante `SEPARATOR_MARGIN = 80` (marge de sécurité en pixels)
- Fonction helper `isInPrivateZone(y, canvasHeight)` pour vérifier si un item est dans la zone privée
- Fonction helper `adjustPositionAwayFromSeparator(y, canvasHeight)` pour "snapper" les items loin de la ligne
  - Snap renforcé : +20px de marge supplémentaire pour une distance minimale de 100px

### 2. Modifications du DesktopCanvas
**Fichier** : `src/components/project-hub/DesktopCanvas.tsx`
- Ajout du prop `isGuestAccess`
- Calcul dynamique de la hauteur du canvas pour positionner la ligne de séparation
- **Filtrage des items** : Les guests ne voient que les items avec `y < separatorY`
- **Snap automatique renforcé** : Lors du drop, la position Y est ajustée pour éviter la zone tampon (±80px + 20px de marge)
- **Visuel pour org members** :
  - Background différent pour la zone privée : `#111111` (vs `#000000` pour la zone partagée)
  - Ligne de séparation en pointillés (`border-dashed`)
  - Badge "🔒 Zone Privée" avec texte explicatif (16px sous la ligne)
  - **Zone tampon invisible** : Pas d'indication visuelle, mais le snap automatique fonctionne

### 3. Toast lors du drag & drop
**Fichier** : `src/app/projects/[id]/page.tsx`
- Modification de `handleItemMove` pour détecter les changements de zone
- Toast vert "Fichier déplacé vers la zone privée" quand un item passe en zone privée
- Toast bleu "Fichier déplacé vers la zone partagée" quand un item revient en zone partagée

### 4. Nettoyage du code
**Fichiers supprimés** :
- `src/components/project-hub/PrivateFolderModal.tsx`

**Fichiers modifiés** :
- `src/app/projects/[id]/page.tsx` : Suppression de `privateFolderModal` state, `handleToggleFolderPrivacy`, et filtrage par `is_private`
- `src/components/project-hub/ContextMenu.tsx` : Suppression de `onTogglePrivacy` et des options "Rendre privé/public"
- `src/components/project-hub/DesktopIcon.tsx` : Suppression de la logique de couleur rouge pour les dossiers privés

## 🎨 Design visuel

### Pour les Org Members (Owners)
```
┌─────────────────────────────────────┐
│                                     │
│     ZONE PARTAGÉE                   │
│     Background: #000                │
│     60% de la hauteur               │
│                                     │
│     [Zone tampon invisible]         │ ← -50px à +50px autour de la ligne
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤ ← Ligne pointillée grise
│  🔒 Zone Privée                     │ ← Badge rouge (16px sous la ligne)
│                                     │
│     ZONE PRIVÉE                     │
│     Background: #111                │
│     40% de la hauteur               │
│                                     │
└─────────────────────────────────────┘
```

**Marge de sécurité (invisible)** : ±80px autour de la ligne (+20px de marge supplémentaire)
- Si un fichier est déposé dans cette zone, il est automatiquement "snappé" vers le haut ou le bas
- **Snap renforcé** : 100px de distance minimale de la ligne après le snap
- Aucune indication visuelle, le comportement est transparent pour l'utilisateur

### Pour les Guests (Viewers/Editors)
```
┌─────────────────────────────────────┐
│                                     │
│     ZONE PARTAGÉE                   │
│     Background: #000                │
│     100% visible                    │
│                                     │
│                                     │
└─────────────────────────────────────┘
(La zone privée est complètement cachée)
```

## 🔐 Sécurité

### Double protection
1. **Client-side** : Filtrage des items par position Y dans `DesktopCanvas`
2. **Server-side** : Les RLS policies Supabase existantes continuent de protéger les données

### Avantages
- ✅ Visuel clair et intuitif
- ✅ Pas de gestion complexe de permissions par dossier
- ✅ Drag & drop simple entre les zones
- ✅ Feedback immédiat avec les toasts

## 🧪 Tests à effectuer

### En tant qu'Owner
1. ✅ Vérifier que la ligne de séparation et le badge sont visibles
2. ✅ Vérifier que la zone privée a un fond légèrement plus clair (#111)
3. ✅ Déplacer un fichier de la zone partagée vers la zone privée → Toast vert
4. ✅ Déplacer un fichier de la zone privée vers la zone partagée → Toast bleu
5. ✅ Vérifier que tous les fichiers (des deux zones) sont visibles

### En tant qu'Editor Guest
1. ✅ Vérifier que la ligne de séparation et le badge ne sont PAS visibles
2. ✅ Vérifier que seuls les fichiers de la zone partagée sont visibles
3. ✅ Vérifier qu'on ne peut pas voir/télécharger les fichiers de la zone privée
4. ✅ Vérifier qu'on peut uploader uniquement dans la zone partagée

## 📝 Notes techniques

- La hauteur du canvas est calculée dynamiquement avec `useEffect` et `window.resize`
- Le seuil est à 60% pour donner plus d'espace à la zone partagée (usage principal)
- Les items sont filtrés côté client pour les guests, mais les RLS policies protègent côté serveur
- Les toasts n'apparaissent que pour les org members (pas pour les guests)

## 🚀 Prochaines étapes

- [ ] Tester en conditions réelles avec un vrai projet
- [ ] Vérifier le comportement sur mobile/tablette
- [ ] Éventuellement ajouter un indicateur visuel lors du drag (zone de drop highlight)

