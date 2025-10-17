# 🔒 Project Hub - Mode Lecture Seule pour Guests

## Modifications à Apporter

### 1. Imports et Hook
```typescript
import { useProjectAccess } from '@/hooks/useUserAccess'
```

### 2. Dans le Composant
```typescript
const { canModify, isReadOnly } = useProjectAccess(projectId)
```

### 3. Modifications Conditionnelles

#### **DesktopCanvas**
- `onItemMove` → Désactiver si `isReadOnly`
- `onItemRename` → Désactiver si `isReadOnly`
- `onUpload` → Désactiver si `isReadOnly`
- Filtrer les call sheets du canvas si `isReadOnly`

#### **ToolsSidebar**
- Masquer "New Call Sheet" si `isReadOnly`
- Masquer "Upload Files" si `isReadOnly`
- Masquer "New Folder" si `isReadOnly`
- Griser "Manage Team" si `isReadOnly`

#### **ContextMenu**
- Ne montrer que "Download" et "Open" si `isReadOnly`
- Masquer "Delete", "Rename", "Move" si `isReadOnly`

#### **PreviewSidebar**
- Masquer bouton "Delete" si `isReadOnly`
- Garder bouton "Download"
- Masquer "Invite Member" si `isReadOnly`

#### **Keyboard**
- Désactiver touche Delete si `isReadOnly`

#### **Drag & Drop**
- Désactiver drag & drop si `isReadOnly`

#### **FolderWindow**
- Mode lecture seule (pas de création/suppression)

### 4. Badge Visuel
Ajouter dans le breadcrumb :
```typescript
{isReadOnly && (
  <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-sm font-semibold rounded-full">
    Read-Only Access
  </span>
)}
```

### 5. Header
Passer le nom du projet au Header :
```typescript
<Header user={mockUser} projectName={project?.name} />
```

