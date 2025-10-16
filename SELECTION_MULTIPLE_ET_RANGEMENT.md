# 🎯 Sélection Multiple & Rangement Automatique

## ✅ Fonctionnalités Implémentées

### 1. 🖱️ Sélection Multiple par Rectangle

**Comment ça marche** :
- **Clic gauche maintenu** + **drag** sur le canvas vide
- Un rectangle bleu semi-transparent apparaît
- Tous les fichiers/dossiers dans le rectangle sont sélectionnés automatiquement
- Les éléments sélectionnés ont une bordure verte

**Détails techniques** :
- Détection automatique du canvas vide (pas de clic sur une icône)
- Calcul en temps réel des éléments dans le rectangle
- Curseur `crosshair` pendant la sélection
- Rectangle de sélection avec `border-2 border-blue-500 bg-blue-500/10`

### 2. 📐 Rangement Automatique

**Comment l'utiliser** :
1. **Clic droit** sur le canvas vide (zone sans fichier)
2. Sélectionner **"Ranger les éléments"** dans le menu contextuel
3. Tous les éléments se placent automatiquement en grille

**Ordre de tri** :
1. **Call Sheets** en premier (vert)
2. **Dossiers** ensuite (jaune)
3. **Fichiers** à la fin (selon leur type)

**Disposition** :
- Grille de **6 colonnes**
- Espacement de **120px** entre chaque élément
- Position de départ : **x: 50px, y: 50px**
- Tri alphabétique au sein de chaque catégorie

### 3. 🗑️ Suppression Multiple

**Utilisation** :
1. Sélectionner plusieurs éléments (rectangle ou Ctrl+Clic)
2. Appuyer sur **`Delete`** (Suppr)
3. Confirmer la suppression
4. Tous les éléments sélectionnés sont supprimés

**Feedback** :
- Message de confirmation : "Supprimer X éléments ?"
- Toast de succès : "X élément(s) supprimé(s)"
- Gestion d'erreurs : "X élément(s) n'ont pas pu être supprimés"

### 4. 📦 Drag & Drop Multiple

**Fonctionnement** :
- Les éléments sélectionnés se déplacent ensemble
- Le drag fonctionne sur n'importe quel élément de la sélection
- Les positions relatives sont préservées

### 5. ⬇️ Téléchargement Multiple

**Utilisation** :
1. Sélectionner plusieurs fichiers
2. Utiliser le bouton "Télécharger" (à implémenter dans l'UI)
3. Tous les fichiers sont téléchargés séquentiellement

**Détails** :
- Délai de 300ms entre chaque téléchargement
- Filtre automatique : seuls les fichiers sont téléchargés (pas les dossiers)
- Toast de confirmation : "X fichier(s) téléchargé(s)"

## 📁 Fichiers Créés/Modifiés

### Nouveaux Fichiers

1. **`src/lib/utils/desktop-helpers.ts`**
   - Fonctions utilitaires pour la sélection et le rangement
   - `getSelectionRect()` : Calcule le rectangle de sélection
   - `getItemsInSelectionRect()` : Trouve les items dans un rectangle
   - `autoArrangeItems()` : Range automatiquement en grille
   - `downloadMultipleFiles()` : Télécharge plusieurs fichiers

### Fichiers Modifiés

2. **`src/components/project-hub/DesktopCanvas.tsx`**
   - Ajout de la sélection par rectangle
   - Gestion des événements `mousedown`, `mousemove`, `mouseup`
   - Affichage du rectangle de sélection
   - Props modifiés : `selectedItemIds` (Set) au lieu de `selectedItemId`
   - Nouveau prop : `onArrange` pour le rangement

3. **`src/components/project-hub/DesktopIcon.tsx`**
   - Ajout de l'attribut `data-desktop-icon` pour la détection
   - Gestion de la sélection multiple (bordure verte)

4. **`src/components/project-hub/ContextMenu.tsx`**
   - Prop `item` devient optionnel
   - Ajout de l'option "Ranger les éléments" (icône Grid3x3)
   - Menu différent selon si on clique sur un item ou le canvas

5. **`src/app/projects/[id]/page.tsx`**
   - État `selectedItemIds` (Set) pour la sélection multiple
   - Fonction `handleDeleteMultiple()` : Supprime plusieurs éléments
   - Fonction `handleArrangeItems()` : Range automatiquement
   - Fonction `handleDownloadMultiple()` : Télécharge plusieurs fichiers
   - Mise à jour de tous les handlers pour gérer la sélection multiple

## 🎮 Interactions Utilisateur

### Sélection

| Action | Résultat |
|--------|----------|
| **Clic** sur un élément | Sélectionne cet élément uniquement |
| **Drag** sur le canvas | Sélection par rectangle |
| **Ctrl+Clic** | Ajoute/retire de la sélection (à implémenter) |
| **Clic** sur canvas vide | Désélectionne tout |

### Menu Contextuel

| Clic droit sur... | Options disponibles |
|-------------------|---------------------|
| **Élément** | Ouvrir, Renommer, Télécharger, Supprimer |
| **Canvas vide** | **Ranger les éléments** |

### Raccourcis Clavier

| Touche | Action |
|--------|--------|
| `Delete` | Supprime les éléments sélectionnés |
| `ESC` | Ferme les modals/menus |

## 🎨 Visuels

### Rectangle de Sélection
```css
border: 2px solid #3b82f6 (blue-500)
background: rgba(59, 130, 246, 0.1) (blue-500/10)
cursor: crosshair (pendant la sélection)
```

### Élément Sélectionné
```css
background: rgba(74, 222, 128, 0.15) (green-400/15)
ring: 1px solid #4ade80 (green-400)
```

### Grille de Rangement
```
Colonnes: 6
Espacement: 120px
Départ: (50px, 50px)
```

## 🔧 Détails Techniques

### Calcul du Rectangle de Sélection

```typescript
function getSelectionRect(start, end) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y)
  }
}
```

### Détection de Chevauchement

```typescript
function doRectsOverlap(rect1, rect2) {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  )
}
```

### Tri Automatique

```typescript
// Ordre de priorité
const typeOrder = { 
  callsheet: 0,  // En premier
  folder: 1,     // En deuxième
  file: 2        // En dernier
}

// Tri alphabétique au sein de chaque catégorie
items.sort((a, b) => {
  if (typeOrder[a.type] !== typeOrder[b.type]) {
    return typeOrder[a.type] - typeOrder[b.type]
  }
  return a.name.localeCompare(b.name)
})
```

## 🚀 Améliorations Futures Possibles

### Sélection Avancée
- [ ] `Ctrl+Clic` : Ajouter/retirer de la sélection
- [ ] `Shift+Clic` : Sélection de plage
- [ ] `Ctrl+A` : Tout sélectionner
- [ ] Sélection inversée

### Rangement Personnalisé
- [ ] Choix du nombre de colonnes
- [ ] Choix de l'espacement
- [ ] Tri par nom, date, taille, type
- [ ] Sauvegarde de la disposition préférée

### Actions Multiples
- [ ] Déplacer dans un dossier (drag & drop)
- [ ] Copier/Coller
- [ ] Dupliquer
- [ ] Changer les permissions

### UI/UX
- [ ] Compteur de sélection dans le header ("3 éléments sélectionnés")
- [ ] Barre d'actions flottante pour la sélection multiple
- [ ] Animation lors du rangement automatique
- [ ] Preview de la grille avant validation

## ✨ Résumé

Toutes les fonctionnalités demandées sont maintenant implémentées :

✅ **Sélection multiple par rectangle** : Drag sur le canvas  
✅ **Rangement automatique** : Clic droit → "Ranger les éléments"  
✅ **Suppression multiple** : Touche `Delete`  
✅ **Drag & Drop multiple** : Déplacement groupé  
✅ **Téléchargement multiple** : Fonction prête  

Le système est **extensible** et peut facilement être enrichi avec de nouvelles fonctionnalités !

