import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface QuickAction {
  icon: string
  label: string
  href: string
}

interface Stat {
  label: string
  value: string
}

interface SidebarProps {
  title?: string
  quickActions?: QuickAction[]
  stats?: Stat[]
  children?: React.ReactNode
  className?: string
}

export function Sidebar({ quickActions = [], stats = [], children, className }: SidebarProps) {
  return (
    <aside className={cn("w-80 flex-shrink-0 space-y-8", className)}>
      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <Card className="bg-call-times-gray-dark border-call-times-gray-light">
          <CardHeader>
            <CardTitle className="text-white font-bold text-sm uppercase tracking-wider">
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start bg-call-times-gray-medium hover:bg-call-times-gray-light text-white border border-call-times-gray-light transition-all"
                >
                  <span className="w-8 h-8 bg-call-times-accent text-black rounded flex items-center justify-center text-sm mr-3">
                    {action.icon}
                  </span>
                  <span className="font-medium text-sm">{action.label}</span>
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {stats.length > 0 && (
        <Card className="bg-call-times-gray-dark border-call-times-gray-light">
          <CardHeader>
            <CardTitle className="text-white font-bold text-sm uppercase tracking-wider">
              Statistiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-call-times-text-secondary text-sm">{stat.label}</span>
                <span className="text-white font-bold text-lg">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Custom children */}
      {children}
    </aside>
  )
}

export function QuickActionButton({ icon, label, onClick, className }: {
  icon: string
  label: string
  onClick?: () => void
  className?: string
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full justify-start bg-call-times-gray-medium hover:bg-call-times-gray-light text-white border border-call-times-gray-light transition-all",
        className
      )}
    >
      <span className="w-8 h-8 bg-call-times-accent text-black rounded flex items-center justify-center text-sm mr-3">
        {icon}
      </span>
      <span className="font-medium text-sm">{label}</span>
    </Button>
  )
}
