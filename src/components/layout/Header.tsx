'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'
import { useUserAccess } from '@/hooks/useUserAccess'

interface HeaderProps {
  user?: {
    full_name?: string | null
    email: string
  }
  projectName?: string // Pour les guests : nom du projet
}

export function Header({ user, projectName }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isOrgMember, isProjectGuest, isLoading } = useUserAccess()
  
  // Navigation complète pour membres org
  const orgNavigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Projets', href: '/projects' },
    { name: 'Contacts', href: '/contacts' },
    { name: 'Team', href: '/settings/team' },
  ]

  // Pas de navigation pour les guests (seulement logo + user menu)
  const navigation = isOrgMember ? orgNavigation : []

  const getInitials = (fullName?: string | null, email?: string) => {
    if (fullName) {
      const names = fullName.split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return fullName.slice(0, 2).toUpperCase()
    }
    return email ? email.slice(0, 2).toUpperCase() : 'CT'
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="bg-call-times-black border-b border-call-times-gray-light sticky top-0 z-50">
      <div className="w-full px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href={isOrgMember ? "/dashboard" : "#"} className="text-white">
              <Logo size="small" />
            </Link>
            
            {/* Guest Badge avec nom du projet */}
            {isProjectGuest && projectName && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">→</span>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-1">
                  <span className="text-blue-400 text-sm font-semibold">Guest Access:</span>
                  <span className="text-white text-sm font-medium ml-2">{projectName}</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation (uniquement pour membres org) */}
          {isOrgMember && navigation.length > 0 && (
            <nav className="hidden md:block">
              <ul className="flex gap-8 list-none">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "text-call-times-text-muted font-medium py-2 px-4 rounded-md transition-all duration-200",
                        pathname === item.href
                          ? "text-white bg-call-times-gray-light"
                          : "hover:text-white hover:bg-call-times-gray-medium"
                      )}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Search (uniquement pour membres org) */}
            {isOrgMember && (
              <div className="hidden lg:block">
                <Input
                  type="text"
                  placeholder="Rechercher projets, call sheets..."
                  className="w-80 bg-call-times-gray-dark border-call-times-gray-light text-white placeholder:text-call-times-text-disabled"
                />
              </div>
            )}

            {/* CTA Button (uniquement pour membres org) */}
            {isOrgMember && (
              <Button className="bg-white text-black hover:bg-gray-100 font-bold text-sm uppercase tracking-wider transform hover:-translate-y-0.5 transition-all">
                Nouveau Projet
              </Button>
            )}

            {/* User Avatar */}
            {user && (
              <div className="flex items-center gap-3">
                <span className="hidden md:block text-call-times-text-secondary text-sm">
                  {user.full_name || user.email}
                </span>
                <div className="w-8 h-8 bg-call-times-accent text-black rounded-full flex items-center justify-center font-bold text-sm">
                  {getInitials(user.full_name, user.email)}
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-call-times-text-muted hover:text-white text-sm px-2"
                >
                  Déconnexion
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
