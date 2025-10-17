import { Header } from './Header'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  showSidebar?: boolean
  className?: string
  user?: {
    full_name?: string | null
    email: string
  }
}

export function PageLayout({
  children,
  sidebar,
  showSidebar = true,
  className,
  user
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-call-times-black">
      <Header user={user} />
      
      <main className={cn(
        "w-full py-12 mx-auto",
        showSidebar 
          ? "grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 max-w-[1800px] px-8"
          : "max-w-none px-6",  // Augmente le padding pour les pages sans sidebar
        className
      )}>
        <div className="w-full">
          {children}
        </div>
        
        {showSidebar && sidebar && (
          <div className="hidden lg:block">
            {sidebar}
          </div>
        )}
      </main>
    </div>
  )
}

/**
 * Grid Layout Component
 */
interface GridLayoutProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
  className?: string
}

export function GridLayout({ children, cols = 3, className }: GridLayoutProps) {
  const colsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  }[cols]

  return (
    <div className={cn("grid gap-8", colsClass, className)}>
      {children}
    </div>
  )
}

/**
 * Section Header Component
 */
interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <header className={cn("mb-12", className)}>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="page-title text-4xl mb-3">
            {title}
          </h1>
          {subtitle && (
            <p className="text-call-times-text-secondary text-base leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div>
            {action}
          </div>
        )}
      </div>
    </header>
  )
}
