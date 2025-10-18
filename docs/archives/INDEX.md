# 📦 Archives - Call Times

> Documentation historique des sessions de développement et fichiers de debug

---

## 📁 Structure des Archives

### `session-octobre-2025/`
Documentation complète de la session de développement d'octobre 2025, incluant :

**🔐 Sécurité & Accès**
- `ACCES_ANONYME_EDITOR_VIEWER.md` - Implémentation accès anonyme pour guests
- `SECURITE_MULTI_TENANT.md` - Architecture multi-tenant et isolation données
- `MULTI_LEVEL_ACCESS_COMPLETE.md` - Système d'accès multi-niveaux (org/projet)

**👥 Team Management**
- `SETUP_ORGANIZATION_INVITATIONS.md` - Système d'invitations organisation
- `INVITATION_PROJET_GUIDE.md` - Guide invitations projet
- `TEST_REVOCATION_GUEST.md` - Tests révocation d'accès guests

**🎨 UX & Interface**
- `AMELIORATIONS_UX_FINALES.md` - Améliorations UX (noms guests, auto-close modals, etc.)
- `TYPO_IMPLEMENTATION_COMPLETE.md` - Nouvelle identité typographique (Inter + Baskerville)
- `TYPO_SWAP_COMPLETE.md` - Swap fonts (titres Baskerville, sous-titres Inter)
- `ZONE_PRIVEE_IMPLEMENTATION.md` - Zone privée spatiale 60/40 sur canvas

**📁 Project Hub**
- `PROJECT_HUB_READONLY_CHANGES.md` - Mode lecture seule pour guests
- `SELECTION_MULTIPLE_ET_RANGEMENT.md` - Sélection multiple et auto-arrangement
- `EXCEL_MINI_PREVIEW.md` - Visualiseur Excel/CSV avec react-data-grid

**🔧 Fixes Techniques**
- `FIX_EDITOR_INVITATION.md` - Correction invitations éditeur
- `FIX_EMAIL_CORS.md` - Résolution problèmes CORS emails
- `FIX_SERVICE_ACCOUNT_RLS.md` - Service accounts pour guests éditeurs
- `REALTIME_ET_GUEST_UPLOAD.md` - Synchronisation temps réel + upload guests

**📝 Sessions & Résumés**
- `SESSION_1_COMPLETE.md` - Résumé session 1
- `SESSION_16_OCTOBRE_2025.md` - Session du 16 octobre
- `RESUME_SESSION_1.md` - Résumé détaillé session 1
- `ACTIONS_IMMEDIATES.md` - Actions prioritaires
- `ACTION_IMMEDIATE_FIX_INVITATION.md` - Fix urgent invitations
- `NEXT_STEPS_DEBUG.md` - Prochaines étapes debug
- `DEBUG_EMAIL_API.md` - Debug API emails
- `GUIDE_TEST_EDITOR_ROLE.md` - Guide test rôle éditeur

---

### `sql-debug/`
Fichiers SQL de debug et migrations temporaires pour résolution de problèmes RLS :

**🔐 RLS Policies Debugging**
- `ADD_GUEST_ACCESS_TO_RLS.sql` - Ajout accès guests aux policies
- `FIX_RLS_PROJECT_MEMBERS.sql` - Correction policies project_members
- `FIX_ULTIME_RLS.sql` - Tentative fix ultime récursion
- `RLS_SANS_RECURSION.sql` - Policies sans récursion
- `RLS_DEFINITIF_COMPLET.sql` - Version définitive complète
- `NETTOYAGE_TOTAL_RLS.sql` - Nettoyage complet policies
- `FIX_RECURSION_FINAL.sql` - Fix récursion final
- `FIX_RECURSION_VRAIMENT_FINAL.sql` - Fix récursion vraiment final

**🔍 Diagnostics**
- `DIAGNOSTIC_RLS.sql` - Diagnostic policies RLS
- `DIAGNOSTIC_COMPLET_POLICIES.sql` - Diagnostic complet

**🛠️ Migrations & Fixes**
- `EXEC_MAINTENANT_SQL.sql` - Scripts d'exécution immédiate
- `MIGRATION_COMPLETE_ORG_INVITATIONS.sql` - Migration invitations org
- `FIX_UNIQUE_CONSTRAINT.sql` - Correction contraintes uniques
- `UPDATE_RLS_EDITOR_PERMISSIONS.sql` - Permissions granulaires éditeurs

---

## 📌 Notes

- **Date d'archivage** : 18 octobre 2025
- **Raison** : Nettoyage après Phase 5 complète (Project Hub + Team Management)
- **Statut** : Tous les fichiers sont des documentations historiques, les migrations importantes sont dans `supabase/migrations/`

---

## ⚠️ Important

Ces fichiers sont conservés à titre de référence historique. Les migrations SQL importantes ont été intégrées dans le dossier `supabase/migrations/` et ne doivent PAS être réexécutées.

Pour toute question sur l'historique du développement, consulter :
1. `PLAN_DEVELOPPEMENT.md` (racine) - Plan complet et état d'avancement
2. `README.md` (racine) - Documentation principale du projet
3. Cette archive - Détails techniques et résolutions de problèmes


