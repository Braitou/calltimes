'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout, GridLayout, SectionHeader, Sidebar } from '@/components/layout'

// Mock data for development
const mockUser = {
  full_name: 'Simon Bandiera',
  email: 'simon@call-times.app'
}

const quickActions = [
  { icon: '📁', label: 'Nouveau Projet', href: '/projects/new' },
  { icon: '⚙️', label: 'Manager Projets', href: '/projects' },
  { icon: '👥', label: 'Gerer Contacts', href: '/contacts' },
  { icon: '✏️', label: 'Editeur Call Sheet', href: '/call-sheets/1/edit' },
]

const stats = [
  { label: 'Projets Actifs', value: '12' },
  { label: 'Contacts', value: '247' },
]

export default function DashboardPage() {
  const sidebar = (
    <Sidebar
      title="Command Center"
      quickActions={quickActions}
      stats={stats}
    />
  )

  return (
    <PageLayout user={mockUser} sidebar={sidebar}>
      <SectionHeader
        title="COMMAND CENTER"
        subtitle="Gerez vos productions comme un pro"
        action={
          <Button className="bg-white text-black hover:bg-gray-100 font-bold text-sm uppercase tracking-wider">
            Nouveau Projet
          </Button>
        }
      />

      {/* Quick Actions */}
      <section className="mb-8">
        <GridLayout cols={4}>
          <Card className="bg-call-times-gray-dark border-call-times-gray-light hover:bg-call-times-gray-medium transition-all cursor-pointer transform hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-call-times-accent rounded-lg flex items-center justify-center text-2xl mb-6">
                📁
              </div>
              <h3 className="text-white font-bold text-xl mb-2 uppercase tracking-tight">
                Nouveau Projet
              </h3>
              <p className="text-call-times-text-muted text-sm">
                Lancez une nouvelle production
              </p>
            </CardContent>
          </Card>

          <Card className="bg-call-times-gray-dark border-call-times-gray-light hover:bg-call-times-gray-medium transition-all cursor-pointer transform hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-call-times-accent rounded-lg flex items-center justify-center text-2xl mb-6">
                ⚙️
              </div>
              <h3 className="text-white font-bold text-xl mb-2 uppercase tracking-tight">
                Manager Projets
              </h3>
              <p className="text-call-times-text-muted text-sm">
                Controlez tous vos projets
              </p>
            </CardContent>
          </Card>

          <Card className="bg-call-times-gray-dark border-call-times-gray-light hover:bg-call-times-gray-medium transition-all cursor-pointer transform hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-call-times-accent rounded-lg flex items-center justify-center text-2xl mb-6">
                👥
              </div>
              <h3 className="text-white font-bold text-xl mb-2 uppercase tracking-tight">
                Gerer Contacts
              </h3>
              <p className="text-call-times-text-muted text-sm">
                Votre repertoire professionnel
              </p>
            </CardContent>
          </Card>

          <Card className="bg-call-times-gray-dark border-call-times-gray-light hover:bg-call-times-gray-medium transition-all cursor-pointer transform hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-call-times-accent rounded-lg flex items-center justify-center text-2xl mb-6">
                ✏️
              </div>
              <h3 className="text-white font-bold text-xl mb-2 uppercase tracking-tight">
                Editeur Call Sheet
              </h3>
              <p className="text-call-times-text-muted text-sm">
                Creez et editez vos call sheets
              </p>
            </CardContent>
          </Card>
        </GridLayout>
      </section>

      {/* Stats Overview */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-call-times-gray-dark border-call-times-gray-light">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-call-times-text-muted text-sm font-medium uppercase tracking-wider">
                    Projets Actifs
                  </p>
                  <p className="text-3xl font-black text-white">12</p>
                </div>
                <div className="text-call-times-accent text-2xl">📊</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-call-times-gray-dark border-call-times-gray-light">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-call-times-text-muted text-sm font-medium uppercase tracking-wider">
                    Call Sheets
                  </p>
                  <p className="text-3xl font-black text-white">47</p>
                </div>
                <div className="text-call-times-accent text-2xl">📋</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-call-times-gray-dark border-call-times-gray-light">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-call-times-text-muted text-sm font-medium uppercase tracking-wider">
                    Contacts
                  </p>
                  <p className="text-3xl font-black text-white">247</p>
                </div>
                <div className="text-call-times-accent text-2xl">👥</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-call-times-gray-dark border-call-times-gray-light">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-call-times-text-muted text-sm font-medium uppercase tracking-wider">
                    Emails Envoyes
                  </p>
                  <p className="text-3xl font-black text-white">1.2k</p>
                </div>
                <div className="text-call-times-accent text-2xl">✉️</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-white font-bold text-xl uppercase tracking-wider mb-6">
          Activite Recente
        </h2>
        <Card className="bg-call-times-gray-dark border-call-times-gray-light">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-call-times-gray-medium rounded">
                <div className="w-2 h-2 bg-call-times-accent rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white font-medium">Commercial Nike Air Max - Call Sheet creee</p>
                  <p className="text-call-times-text-muted text-sm">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-call-times-gray-medium rounded">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white font-medium">15 nouveaux contacts ajoutes</p>
                  <p className="text-call-times-text-muted text-sm">Il y a 1 jour</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-call-times-gray-medium rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white font-medium">Shooting Mode Printemps - PDF envoye</p>
                  <p className="text-call-times-text-muted text-sm">Il y a 2 jours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </PageLayout>
  )
}
