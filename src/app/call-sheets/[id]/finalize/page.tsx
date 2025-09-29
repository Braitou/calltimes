'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PageLayout } from '@/components/layout/PageLayout'
import { generateCallSheetPDF } from '@/lib/services/pdf'
import { validateEmailRecipients, type EmailRecipient } from '@/lib/services/email'
import { sendCallSheetEmailAction } from './actions'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Mail, Plus, Trash2, Send, FileText, Users } from 'lucide-react'
import Link from 'next/link'

interface CallSheetData {
  id: string
  title: string
  date: string
  project_name: string
  locations: Array<{
    id: number
    name: string
    address: string
    notes: string
  }>
  important_contacts: Array<{
    id: number
    name: string
    role: string
    phone: string
    email: string
  }>
  schedule: Array<{
    id: number
    title: string
    time: string
  }>
  team: Array<{
    id: number
    name: string
    role: string
    department: string
    phone: string
    email: string
    call_time?: string
    on_set_time?: string
  }>
  notes: string
}

export default function FinalizeCallSheetPage() {
  const { id } = useParams()
  const callSheetId = id as string

  // États
  const [callSheet, setCallSheet] = useState<CallSheetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfGenerating, setPdfGenerating] = useState(false)

  // États formulaire email
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [recipients, setRecipients] = useState<EmailRecipient[]>([])
  const [newRecipientEmail, setNewRecipientEmail] = useState('')
  const [newRecipientName, setNewRecipientName] = useState('')
  const [sending, setSending] = useState(false)

  // Charger les données de la call sheet
  useEffect(() => {
    async function loadCallSheet() {
      if (!callSheetId) return

      try {
        // MODE DÉVELOPPEMENT : Utiliser les mêmes données mockées que l'éditeur
        console.log('📄 Chargement call sheet (mode développement):', callSheetId)
        
        // Données mockées identiques à l'éditeur
        const mockCallSheetData: CallSheetData = {
          id: callSheetId,
          title: 'Call Sheet (25 septembre 2025)',
          date: '2025-09-25',
          project_name: 'Commercial Nike',
          locations: [
            {
              id: 1,
              name: 'Studio Harcourt',
              address: '6 Rue de Lota, 75016 Paris',
              notes: 'Accès par la cour intérieure'
            }
          ],
          important_contacts: [
            {
              id: 1,
              name: 'Jean Dupont',
              role: 'Producteur',
              phone: '+33 6 11 22 33 44',
              email: 'jean.dupont@prod.fr'
            }
          ],
          schedule: [
            { id: 1, title: 'Call time — Production', time: '08:00' },
            { id: 2, title: 'Start shooting', time: '09:30' },
            { id: 3, title: 'Lunch', time: '13:00' },
            { id: 4, title: 'Wrap', time: '18:00' }
          ],
          team: [
            {
              id: 1,
              name: 'Simon Bandiera',
              role: 'Régisseur',
              department: 'Production',
              phone: '+33 6 12 34 56 78',
              email: 'bandiera.simon@gmail.com',
              call_time: '08:30',
              on_set_time: '09:00'
            }
          ],
          notes: 'Tournage en studio avec équipe réduite - Version démo Call Times'
        }

        setCallSheet(mockCallSheetData)

        // Générer le sujet par défaut
        const formattedDate = new Date(mockCallSheetData.date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        setEmailSubject(`📋 Call Sheet - ${mockCallSheetData.title} - ${formattedDate}`)

        // Message par défaut
        setEmailMessage(`Bonjour,

Vous trouverez ci-joint la call sheet pour le tournage "${mockCallSheetData.project_name}".

Merci de bien consulter toutes les informations et de nous contacter en cas de question.

Excellente journée de tournage ! 🎬`)

        // Pré-remplir les destinataires avec l'équipe
        const teamRecipients: EmailRecipient[] = mockCallSheetData.team
          ?.filter(member => member.email && member.email.includes('@'))
          .map(member => ({
            email: member.email,
            name: member.name,
            role: member.role
          })) || []

        setRecipients(teamRecipients)

      } catch (error: any) {
        console.error('Erreur chargement call sheet:', error)
        toast.error('Erreur lors du chargement', {
          description: error.message
        })
      } finally {
        setLoading(false)
      }
    }

    loadCallSheet()
  }, [callSheetId])

  // Générer le PDF
  const handleGeneratePDF = async () => {
    if (!callSheet) return

    setPdfGenerating(true)
    try {
      const result = await generateCallSheetPDF({
        callSheetId: callSheet.id,
        callSheetTitle: callSheet.title
      })

      if (result.success && result.pdf_url) {
        setPdfUrl(result.pdf_url)
        toast.success('PDF généré avec succès !', {
          description: 'Le PDF est prêt pour l\'envoi par email.'
        })
      } else {
        throw new Error(result.error || 'Erreur génération PDF')
      }
    } catch (error: any) {
      console.error('Erreur génération PDF:', error)
      toast.error('Erreur génération PDF', {
        description: error.message || 'Impossible de générer le PDF'
      })
    } finally {
      setPdfGenerating(false)
    }
  }

  // Ajouter un destinataire
  const handleAddRecipient = () => {
    if (!newRecipientEmail || !newRecipientName) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    // Vérifier si l'email existe déjà
    if (recipients.some(r => r.email === newRecipientEmail)) {
      toast.error('Cette adresse email est déjà dans la liste')
      return
    }

    const newRecipient: EmailRecipient = {
      email: newRecipientEmail.trim(),
      name: newRecipientName.trim()
    }

    setRecipients([...recipients, newRecipient])
    setNewRecipientEmail('')
    setNewRecipientName('')
    toast.success('Destinataire ajouté')
  }

  // Supprimer un destinataire
  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index))
    toast.success('Destinataire supprimé')
  }

  // Envoyer l'email
  const handleSendEmail = async () => {
    if (!callSheet || !pdfUrl) {
      toast.error('PDF manquant', {
        description: 'Veuillez d\'abord générer le PDF'
      })
      return
    }

    if (recipients.length === 0) {
      toast.error('Aucun destinataire', {
        description: 'Veuillez ajouter au moins un destinataire'
      })
      return
    }

    // Valider les emails
    const { valid, invalid } = validateEmailRecipients(recipients)
    
    if (invalid.length > 0) {
      toast.error(`${invalid.length} email(s) invalide(s)`, {
        description: invalid.map(i => `${i.email}: ${i.error}`).join(', ')
      })
      return
    }

    setSending(true)
    try {
      const result = await sendCallSheetEmailAction({
        callSheetId: callSheet.id,
        callSheetTitle: callSheet.title,
        projectName: callSheet.project_name,
        shootDate: callSheet.date,
        pdfUrl: pdfUrl,
        recipients: valid,
        customMessage: emailMessage.trim() || undefined,
        customSubject: emailSubject.trim() || undefined
      })

      if (result.success) {
        toast.success(`Email envoyé avec succès !`, {
          description: `${valid.length} destinataire(s) notifié(s)`
        })
        
        // TODO: Enregistrer l'envoi en base de données si besoin
        
      } else {
        throw new Error(result.error || 'Erreur envoi email')
      }

    } catch (error: any) {
      console.error('Erreur envoi email:', error)
      toast.error('Erreur envoi email', {
        description: error.message || 'Impossible d\'envoyer l\'email'
      })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <PageLayout title="Finalisation" subtitle="Chargement...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement de la call sheet...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!callSheet) {
    return (
      <PageLayout title="Finalisation" subtitle="Call sheet non trouvée">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Call sheet non trouvée</h3>
          <p className="text-gray-500 mb-6">La call sheet demandée n'existe pas ou n'est plus accessible.</p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>
          </Link>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout 
      title={`Finalisation - ${callSheet.title}`}
      subtitle={`${callSheet.project_name} • ${new Date(callSheet.date).toLocaleDateString('fr-FR')}`}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link href={`/call-sheets/${callSheetId}/edit`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'éditeur
            </Button>
          </Link>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Étape</span>
            <Badge variant="secondary">Finalisation</Badge>
          </div>
        </div>

        {/* Étape 1: Génération PDF */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-orange-600" />
              1. Génération du PDF
            </CardTitle>
            <CardDescription>
              Générez la version finale de votre call sheet en PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                {pdfUrl ? (
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    PDF généré avec succès
                  </div>
                ) : (
                  <p className="text-gray-600">Le PDF doit être généré avant l'envoi</p>
                )}
              </div>
              
              <Button 
                onClick={handleGeneratePDF}
                disabled={pdfGenerating}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {pdfGenerating ? 'Génération...' : 'Générer PDF'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Étape 2: Configuration email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-600" />
              2. Configuration de l'email
            </CardTitle>
            <CardDescription>
              Personnalisez l'objet et le message de votre email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Objet de l'email</label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Ex: Call Sheet - Commercial Nike - Lundi 25 septembre 2024"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Message personnalisé (optionnel)</label>
              <Textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Ajoutez un message personnalisé pour votre équipe..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Étape 3: Destinataires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              3. Destinataires ({recipients.length})
            </CardTitle>
            <CardDescription>
              Gérez la liste des personnes qui recevront la call sheet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Ajouter un destinataire */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Nom complet"
                value={newRecipientName}
                onChange={(e) => setNewRecipientName(e.target.value)}
              />
              <Input
                placeholder="email@exemple.com"
                type="email"
                value={newRecipientEmail}
                onChange={(e) => setNewRecipientEmail(e.target.value)}
              />
              <Button 
                onClick={handleAddRecipient}
                className="w-full"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>

            <Separator />

            {/* Liste des destinataires */}
            {recipients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun destinataire ajouté</p>
                <p className="text-sm">Ajoutez des membres de l'équipe ci-dessus</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recipients.map((recipient, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{recipient.name}</p>
                      <p className="text-sm text-gray-500">{recipient.email}</p>
                      {recipient.role && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {recipient.role}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRecipient(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Étape 4: Envoi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="w-5 h-5 mr-2 text-purple-600" />
              4. Envoi de la call sheet
            </CardTitle>
            <CardDescription>
              Envoyez la call sheet par email à toute votre équipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {recipients.length > 0 
                    ? `Prêt à envoyer à ${recipients.length} destinataire(s)`
                    : 'Aucun destinataire sélectionné'
                  }
                </p>
                <p className="text-sm text-gray-500">
                  {pdfUrl 
                    ? 'PDF attaché et prêt à l\'envoi'
                    : 'PDF manquant - générez-le d\'abord'
                  }
                </p>
              </div>
              
              <Button 
                onClick={handleSendEmail}
                disabled={sending || !pdfUrl || recipients.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {sending ? 'Envoi...' : 'Envoyer la call sheet'}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </PageLayout>
  )
}
