'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageLayout, SectionHeader, Sidebar } from '@/components/layout'
import { ContactModal, type Contact } from '@/components/contacts/contact-modal'
import { useContacts } from '@/contexts/contacts-context'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Download, Upload, CheckCircle, XCircle, AlertCircle, Edit3, Save, X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as XLSX from 'xlsx'

// Mock data pour le développement
const mockUser = {
  full_name: 'Simon Bandiera',
  email: 'simon@call-times.app'
}

const quickActions = [
  { icon: '👤', label: 'Nouveau Contact', href: '/contacts/new' },
  { icon: '📋', label: 'Voir Contacts', href: '/contacts' },
  { icon: '📄', label: 'Template CSV', href: '/contacts/template.csv' },
]

const stats = [
  { label: 'En attente', value: '0' },
  { label: 'Importés', value: '0' },
  { label: 'Erreurs', value: '0' },
]

interface ParsedContact {
  id: string
  name: string
  role: string
  email: string
  phone: string
  department?: string
  status: 'pending' | 'success' | 'error' | 'duplicate'
  error?: string
  isEditing?: boolean
}

interface ImportResult {
  total: number
  created: number
  duplicates: number
  errors: number
  contacts: ParsedContact[]
}

export default function ImportContactsPage() {
  // Context global des contacts
  const { contacts, addMultipleContacts, getContactByEmail } = useContacts()
  
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([])
  const [showEditInterface, setShowEditInterface] = useState(false)

  // Départements disponibles
  const departments = [
    'Réalisation', 'Image', 'Son', 'Production', 'Régie', 
    'Maquillage', 'Coiffure', 'Costumes', 'Casting', 'Technique', 'Autre'
  ]

  // Auto-détection du département selon le rôle
  const detectDepartment = (role: string): string => {
    const roleLower = role.toLowerCase()
    if (roleLower.includes('réal') || roleLower.includes('real') || roleLower.includes('directeur')) return 'Réalisation'
    if (roleLower.includes('photo') || roleLower.includes('camera') || roleLower.includes('image')) return 'Image'
    if (roleLower.includes('son') || roleLower.includes('audio')) return 'Son'
    if (roleLower.includes('product') || roleLower.includes('assistant')) return 'Production'
    if (roleLower.includes('régie') || roleLower.includes('regie')) return 'Régie'
    if (roleLower.includes('maquill')) return 'Maquillage'
    if (roleLower.includes('coiff')) return 'Coiffure'
    if (roleLower.includes('costume')) return 'Costumes'
    if (roleLower.includes('acteur') || roleLower.includes('actrice') || roleLower.includes('comédien')) return 'Casting'
    if (roleLower.includes('électric') || roleLower.includes('machin') || roleLower.includes('technic')) return 'Technique'
    return 'Autre'
  }

  // Parser CSV basique
  // Fonction pour parser Excel
  const parseExcel = (arrayBuffer: ArrayBuffer): ParsedContact[] => {
    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convertir en JSON avec headers automatiques
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
    
    const contacts: ParsedContact[] = []
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any
      // Essayer différentes variations de noms de colonnes
      // Pour le nom : soit une colonne unique, soit prénom + nom séparés
      let name = row.name || row.Name || row.nom || row.Nom || row.NAME || ''
      if (!name && (row['First Name'] || row['Last Name'])) {
        // Combiner prénom et nom si séparés
        const firstName = row['First Name'] || row['Prénom'] || row['Prenom'] || ''
        const lastName = row['Last Name'] || row['Nom de famille'] || row['Nom'] || ''
        name = `${firstName} ${lastName}`.trim()
      }
      
      // Pour le rôle : plusieurs variations possibles
      const role = row.role || row.Role || row.poste || row.Poste || row.ROLE || 
                   row['Job Title'] || row['Titre'] || row['Fonction'] || 
                   row['Catégorie'] || row.category || row.Category || ''
      
      const email = row.email || row.Email || row.EMAIL || ''
      const phone = row.phone || row.Phone || row.telephone || row.Telephone || row.PHONE || ''
      
      
      if (name.toString().trim()) {
        contacts.push({
          id: `excel-${i}`,
          name: name.toString().trim(),
          role: role.toString().trim(),
          email: email.toString().trim(),
          phone: phone.toString().trim(),
          department: detectDepartment(role.toString().trim()),
          status: 'pending'
        })
      }
    }
    
    return contacts
  }

  const parseCSV = (csvText: string): ParsedContact[] => {
    const lines = csvText.trim().split('\n')
    const contacts: ParsedContact[] = []
    
    if (lines.length === 0) return contacts
    
    // Analyser les headers pour détecter la structure
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase())
    
    // Mapping des colonnes détectées
    const columnMap = {
      name: -1,
      firstName: -1,
      lastName: -1,
      role: -1,
      email: -1,
      phone: -1,
      department: -1
    }
    
    // Détecter les colonnes automatiquement
    headers.forEach((header, index) => {
      const h = header.toLowerCase()
      
      // Nom complet
      if (h.includes('name') && !h.includes('first') && !h.includes('last')) {
        columnMap.name = index
      }
      // Prénom
      else if (h.includes('first') || h.includes('prénom') || h.includes('prenom')) {
        columnMap.firstName = index
      }
      // Nom de famille
      else if (h.includes('last') || h.includes('nom')) {
        columnMap.lastName = index
      }
      // Rôle/Job Title
      else if (h.includes('role') || h.includes('job') || h.includes('title') || 
               h.includes('poste') || h.includes('fonction') || h.includes('titre')) {
        columnMap.role = index
      }
      // Email
      else if (h.includes('email') || h.includes('mail')) {
        columnMap.email = index
      }
      // Téléphone
      else if (h.includes('phone') || h.includes('tel') || h.includes('mobile')) {
        columnMap.phone = index
      }
      // Département/Catégorie
      else if (h.includes('department') || h.includes('catégorie') || h.includes('categorie') ||
               h.includes('département') || h.includes('category')) {
        columnMap.department = index
      }
    })
    
    
    // Parser les lignes de données
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const fields = line.split(',').map(field => field.trim().replace(/"/g, ''))
      
      // Construire le nom
      let name = ''
      if (columnMap.name >= 0) {
        name = fields[columnMap.name] || ''
      } else if (columnMap.firstName >= 0 || columnMap.lastName >= 0) {
        const firstName = columnMap.firstName >= 0 ? (fields[columnMap.firstName] || '') : ''
        const lastName = columnMap.lastName >= 0 ? (fields[columnMap.lastName] || '') : ''
        name = `${firstName} ${lastName}`.trim()
      }
      
      // Extraire les autres champs
      const role = columnMap.role >= 0 ? (fields[columnMap.role] || '') : ''
      const email = columnMap.email >= 0 ? (fields[columnMap.email] || '') : ''
      const phone = columnMap.phone >= 0 ? (fields[columnMap.phone] || '') : ''
      const explicitDepartment = columnMap.department >= 0 ? (fields[columnMap.department] || '') : ''
      
      
      const contact: ParsedContact = {
        id: `import-${Date.now()}-${i}`,
        name: name,
        role: role,
        email: email,
        phone: phone,
        // Utiliser le département explicite ou auto-détecter depuis le rôle
        department: explicitDepartment || detectDepartment(role),
        status: 'pending'
      }
      
      // Validation basique
      if (!contact.name) {
        contact.status = 'error'
        contact.error = 'Nom requis'
      } else if (!contact.email || !contact.email.includes('@')) {
        contact.status = 'error'
        contact.error = 'Email invalide'
      }
      
      if (contact.name) {
        contacts.push(contact)
      }
    }
    
    return contacts
  }

  // Déduplication par email avec contacts existants
  const deduplicateContacts = (parsedContacts: ParsedContact[]): ParsedContact[] => {
    return parsedContacts.map(contact => {
      if (getContactByEmail(contact.email)) {
        return { ...contact, status: 'duplicate' as const, error: 'Email déjà existant' }
      }
      return contact
    })
  }

  // Traitement du fichier CSV - Phase 1: Parsing et préparation
  const processFile = async (file: File) => {
    setIsImporting(true)
    
    try {
      const fileName = file.name.toLowerCase()
      let contacts: ParsedContact[] = []
      
      
      // Détection automatique du type de fichier
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // Traitement Excel
        const arrayBuffer = await file.arrayBuffer()
        contacts = parseExcel(arrayBuffer)
        toast.success(`Fichier Excel analysé !`, {
          description: `${contacts.length} contacts détectés dans le fichier Excel`
        })
      } else if (fileName.endsWith('.csv')) {
        // Traitement CSV
        const text = await file.text()
        contacts = parseCSV(text)
        toast.success(`Fichier CSV analysé !`, {
          description: `${contacts.length} contacts détectés dans le fichier CSV`
        })
      } else {
        throw new Error('Format de fichier non supporté. Utilisez .csv, .xlsx ou .xls')
      }

      
      // Déduplication avec les contacts existants
      contacts = deduplicateContacts(contacts)
      
      // Sauvegarder les contacts parsés et montrer l'interface d'édition
      setParsedContacts(contacts)
      setShowEditInterface(true)
      
    } catch (error) {
      console.error('Erreur lors du parsing:', error)
      toast.error('Erreur lors de la lecture du fichier', {
        description: error instanceof Error ? error.message : 'Format non supporté'
      })
    } finally {
      setIsImporting(false)
    }
  }

  // Validation finale et import - Phase 2: Sauvegarde définitive
  const confirmImport = async () => {
    setIsImporting(true)
    
    try {
      // Filtrer les contacts valides (non erreur, non doublon)
      const validContacts = parsedContacts.filter(c => c.status === 'pending')
      
      // Convertir les contacts valides pour les ajouter au Context
      const contactsToAdd = validContacts.map(contact => {
        const [firstName, ...lastNameParts] = contact.name.split(' ')
        return {
          firstName: firstName || '',
          lastName: lastNameParts.join(' ') || '',
          email: contact.email,
          phone: contact.phone,
          role: contact.role,
          department: contact.department || 'Autre'
        }
      })
      
      // Ajouter les contacts valides au Context global
      if (contactsToAdd.length > 0) {
        addMultipleContacts(contactsToAdd)
      }
      
      // Marquer les contacts valides comme créés
      const updatedContacts = parsedContacts.map(contact => ({
        ...contact,
        status: contact.status === 'pending' ? 'success' as const : contact.status
      }))
      
      // Calculer les stats finales
      const total = parsedContacts.length
      const errors = parsedContacts.filter(c => c.status === 'error').length
      const duplicates = parsedContacts.filter(c => c.status === 'duplicate').length
      
      const result: ImportResult = {
        total,
        created: contactsToAdd.length,
        duplicates,
        errors,
        contacts: updatedContacts
      }
      
      setImportResult(result)
      setShowEditInterface(false)
      
      if (contactsToAdd.length > 0) {
        toast.success(`${contactsToAdd.length} contacts importés avec succès !`)
      }
      if (errors > 0 || duplicates > 0) {
        toast.warning(`${errors} erreurs et ${duplicates} doublons détectés`)
      }
      
    } catch (error) {
      console.error('Erreur import final:', error)
      toast.error('Erreur lors de l\'import final')
    } finally {
      setIsImporting(false)
    }
  }

  // Fonction d'édition directe inline
  const updateContact = (contactId: string, field: keyof ParsedContact, value: string) => {
    setParsedContacts(prev => prev.map(c => 
      c.id === contactId ? { ...c, [field]: value } : c
    ))
    
    // Auto-détection du département si le rôle change
    if (field === 'role' && value) {
      const newDepartment = detectDepartment(value)
      setParsedContacts(prev => prev.map(c => 
        c.id === contactId ? { ...c, department: newDepartment } : c
      ))
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      processFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  })

  const downloadTemplate = () => {
    const template = 'name,role,email,phone\nPierre Lambert,Réalisateur,pierre.lambert@example.com,+33 6 12 34 56 78\nSophie Moreau,Directrice Photo,sophie.moreau@example.com,+33 6 23 45 67 89'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template-contacts.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status: ParsedContact['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
      case 'duplicate': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default: return <div className="w-4 h-4 bg-gray-500 rounded-full" />
    }
  }

  const getStatusColor = (status: ParsedContact['status']) => {
    switch (status) {
      case 'success': return 'text-green-500'
      case 'error': return 'text-red-500'
      case 'duplicate': return 'text-yellow-500'
      default: return 'text-gray-500'
    }
  }

  const dynamicStats = importResult ? [
    { label: 'Total', value: importResult.total.toString() },
    { label: 'Créés', value: importResult.created.toString() },
    { label: 'Erreurs', value: importResult.errors.toString() },
    { label: 'Doublons', value: importResult.duplicates.toString() },
  ] : stats

  const sidebar = (
    <Sidebar 
      title="Import CSV"
      quickActions={quickActions}
      stats={dynamicStats}
    />
  )

  return (
    <PageLayout user={mockUser} sidebar={sidebar}>
      <SectionHeader 
        title="IMPORT CONTACTS"
        subtitle="Importez vos contacts en masse depuis un fichier CSV ou Excel"
        action={
          <div className="flex gap-3">
            <Link href="/contacts">
              <Button variant="outline" className="bg-transparent border-call-times-gray-light text-white hover:bg-call-times-gray-light font-bold text-sm uppercase tracking-wider">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <Button 
              onClick={downloadTemplate}
              variant="outline" 
              className="bg-transparent border-call-times-accent text-call-times-accent hover:bg-call-times-accent hover:text-black font-bold text-sm uppercase tracking-wider"
            >
              <Download className="w-4 h-4 mr-2" />
              Template CSV
            </Button>
          </div>
        }
      />

      <div className="space-y-8">
        {/* Zone de drop */}
        <Card className="bg-call-times-gray-dark border-call-times-gray-light">
          <CardHeader>
            <CardTitle className="text-white font-bold text-xl">
              Importer des contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200
                ${isDragActive || dropzoneActive 
                  ? 'border-call-times-accent bg-call-times-accent/10' 
                  : 'border-call-times-gray-light hover:border-call-times-accent/50'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-call-times-text-muted" />
              
              {isImporting ? (
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    Import en cours...
                  </h3>
                  <p className="text-call-times-text-secondary">
                    Traitement du fichier CSV
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    Glissez votre fichier CSV ou Excel ici
                  </h3>
                  <p className="text-call-times-text-secondary mb-4">
                    ou cliquez pour sélectionner un fichier
                  </p>
                  <p className="text-call-times-text-muted text-sm">
                    Formats supportés : CSV (.csv) et Excel (.xlsx, .xls)
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-call-times-gray-medium rounded-lg">
              <h4 className="text-white font-bold mb-2">📋 Format requis :</h4>
              <code className="text-call-times-accent text-sm">
                name,role,email,phone<br/>
                Pierre Lambert,Réalisateur,pierre@example.com,+33 6 12 34 56 78
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Interface d'édition des contacts */}
        {showEditInterface && parsedContacts.length > 0 && (
          <Card className="bg-call-times-gray-dark border-call-times-gray-light">
            <CardHeader>
              <CardTitle className="text-white font-bold text-xl">
                Vérification et édition des contacts
              </CardTitle>
              <p className="text-call-times-text-secondary">
                Vérifiez les informations détectées et complétez les champs manquants avant l'import final.
              </p>
            </CardHeader>
            <CardContent>
              {/* Actions principales */}
              <div className="flex justify-between items-center mb-6">
                <div className="text-call-times-text-secondary">
                  {parsedContacts.filter(c => c.status === 'pending').length} contacts à importer
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowEditInterface(false)
                      setParsedContacts([])
                    }}
                    className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                  <Button 
                    onClick={confirmImport}
                    disabled={isImporting || parsedContacts.filter(c => c.status === 'pending').length === 0}
                    className="bg-call-times-accent text-black hover:bg-call-times-accent/80 font-bold"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isImporting ? 'Import en cours...' : 'Confirmer l\'import'}
                  </Button>
                </div>
              </div>

              {/* Liste des contacts avec édition */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {parsedContacts.map((contact) => (
                  <ContactEditRow 
                    key={contact.id}
                    contact={contact}
                    departments={departments}
                    onUpdate={updateContact}
                    getStatusIcon={getStatusIcon}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Résultats */}
        {importResult && (
          <Card className="bg-call-times-gray-dark border-call-times-gray-light">
            <CardHeader>
              <CardTitle className="text-white font-bold text-xl">
                Résultats de l'import
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Résumé */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{importResult.total}</div>
                  <div className="text-call-times-text-secondary text-sm">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{importResult.created}</div>
                  <div className="text-call-times-text-secondary text-sm">Créés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">{importResult.duplicates}</div>
                  <div className="text-call-times-text-secondary text-sm">Doublons</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{importResult.errors}</div>
                  <div className="text-call-times-text-secondary text-sm">Erreurs</div>
                </div>
              </div>

              {/* Liste détaillée */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {importResult.contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-3 p-3 bg-call-times-gray-medium rounded">
                    {getStatusIcon(contact.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="text-white font-medium">{contact.name}</span>
                        <span className="text-call-times-text-secondary text-sm">{contact.role}</span>
                        <span className="text-call-times-text-muted text-sm">{contact.email}</span>
                      </div>
                      {contact.error && (
                        <p className={`text-sm ${getStatusColor(contact.status)}`}>
                          {contact.error}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <Link href="/contacts">
                  <Button className="bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold">
                    Voir tous les contacts
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  onClick={() => setImportResult(null)}
                  className="border-call-times-gray-light text-call-times-text-secondary hover:bg-call-times-gray-medium"
                >
                  Nouvel import
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  )
}

// Composant pour l'édition directe inline des contacts
function ContactEditRow({ 
  contact, 
  departments,
  onUpdate,
  getStatusIcon,
  getStatusColor
}: {
  contact: ParsedContact
  departments: string[]
  onUpdate: (id: string, field: keyof ParsedContact, value: string) => void
  getStatusIcon: (status: ParsedContact['status']) => React.ReactNode
  getStatusColor: (status: ParsedContact['status']) => string
}) {
  const isDisabled = contact.status === 'error' || contact.status === 'duplicate'
  
  return (
    <div className={`p-4 rounded transition-all ${
      isDisabled 
        ? 'bg-call-times-gray-medium/50 opacity-60' 
        : 'bg-call-times-gray-medium hover:bg-call-times-gray-light/20'
    }`}>
      <div className="grid grid-cols-12 gap-3 items-center">
        {/* Statut */}
        <div className="col-span-1 flex justify-center">
          {getStatusIcon(contact.status)}
        </div>
        
        {/* Nom - toujours éditable */}
        <div className="col-span-3">
          {contact.name ? (
            <Input
              value={contact.name}
              onChange={(e) => onUpdate(contact.id, 'name', e.target.value)}
              placeholder="Nom complet"
              className="bg-call-times-gray-dark border-call-times-gray-light text-white h-8 text-sm"
              disabled={isDisabled}
            />
          ) : (
            <div 
              className="h-8 bg-gray-500/30 border border-dashed border-gray-400 rounded flex items-center justify-center cursor-pointer hover:bg-gray-500/50 transition-colors"
              onClick={() => document.getElementById(`name-${contact.id}`)?.focus()}
            >
              <Input
                id={`name-${contact.id}`}
                value={contact.name}
                onChange={(e) => onUpdate(contact.id, 'name', e.target.value)}
                placeholder="Cliquez pour ajouter le nom"
                className="bg-transparent border-none text-white h-full text-sm placeholder:text-gray-400"
                disabled={isDisabled}
              />
            </div>
          )}
          {contact.status === 'error' && contact.error && (
            <div className="text-xs text-red-400 mt-1">{contact.error}</div>
          )}
          {contact.status === 'duplicate' && (
            <div className="text-xs text-yellow-400 mt-1">Doublon détecté</div>
          )}
        </div>
        
        {/* Rôle - toujours éditable */}
        <div className="col-span-2">
          {contact.role ? (
            <Input
              value={contact.role}
              onChange={(e) => onUpdate(contact.id, 'role', e.target.value)}
              placeholder="Rôle/Poste"
              className="bg-call-times-gray-dark border-call-times-gray-light text-white h-8 text-sm"
              disabled={isDisabled}
            />
          ) : (
            <div 
              className="h-8 bg-gray-500/30 border border-dashed border-gray-400 rounded flex items-center justify-center cursor-pointer hover:bg-gray-500/50 transition-colors"
              onClick={() => document.getElementById(`role-${contact.id}`)?.focus()}
            >
              <Input
                id={`role-${contact.id}`}
                value={contact.role}
                onChange={(e) => onUpdate(contact.id, 'role', e.target.value)}
                placeholder="Cliquez pour ajouter le rôle"
                className="bg-transparent border-none text-white h-full text-sm placeholder:text-gray-400"
                disabled={isDisabled}
              />
            </div>
          )}
        </div>
        
        {/* Département - sélecteur direct */}
        <div className="col-span-2">
          {!isDisabled ? (
            <Select 
              value={contact.department || ''} 
              onValueChange={(value) => onUpdate(contact.id, 'department', value)}
            >
              <SelectTrigger className={`h-8 text-sm ${
                contact.department 
                  ? 'bg-call-times-accent/20 border-call-times-accent text-call-times-accent'
                  : 'bg-gray-500/30 border-dashed border-gray-400 text-gray-400'
              }`}>
                <SelectValue placeholder="Choisir département" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="inline-flex px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400">
              {contact.department || 'Non défini'}
            </div>
          )}
        </div>
        
        {/* Email - toujours éditable */}
        <div className="col-span-3">
          {contact.email ? (
            <Input
              value={contact.email}
              onChange={(e) => onUpdate(contact.id, 'email', e.target.value)}
              placeholder="Email"
              type="email"
              className="bg-call-times-gray-dark border-call-times-gray-light text-white h-8 text-sm"
              disabled={isDisabled}
            />
          ) : (
            <div 
              className="h-8 bg-gray-500/30 border border-dashed border-gray-400 rounded flex items-center justify-center cursor-pointer hover:bg-gray-500/50 transition-colors"
              onClick={() => document.getElementById(`email-${contact.id}`)?.focus()}
            >
              <Input
                id={`email-${contact.id}`}
                value={contact.email}
                onChange={(e) => onUpdate(contact.id, 'email', e.target.value)}
                placeholder="Cliquez pour ajouter l'email"
                type="email"
                className="bg-transparent border-none text-white h-full text-sm placeholder:text-gray-400"
                disabled={isDisabled}
              />
            </div>
          )}
        </div>
        
        {/* Actions - indicateur de sauvegarde auto */}
        <div className="col-span-1 flex justify-center">
          <div className="text-xs text-call-times-accent font-medium">
            Auto-save ✓
          </div>
        </div>
      </div>
      
      {/* Téléphone sur ligne suivante - toujours éditable */}
      <div className="mt-3 grid grid-cols-12 gap-3">
        <div className="col-span-1"></div>
        <div className="col-span-3">
          {contact.phone ? (
            <Input
              value={contact.phone}
              onChange={(e) => onUpdate(contact.id, 'phone', e.target.value)}
              placeholder="Téléphone"
              className="bg-call-times-gray-dark border-call-times-gray-light text-white h-8 text-sm"
              disabled={isDisabled}
            />
          ) : (
            <div 
              className="h-8 bg-gray-500/30 border border-dashed border-gray-400 rounded flex items-center justify-center cursor-pointer hover:bg-gray-500/50 transition-colors"
              onClick={() => document.getElementById(`phone-${contact.id}`)?.focus()}
            >
              <Input
                id={`phone-${contact.id}`}
                value={contact.phone}
                onChange={(e) => onUpdate(contact.id, 'phone', e.target.value)}
                placeholder="Cliquez pour ajouter le téléphone"
                className="bg-transparent border-none text-white h-full text-sm placeholder:text-gray-400"
                disabled={isDisabled}
              />
            </div>
          )}
        </div>
        <div className="col-span-8 flex items-center">
          <span className="text-xs text-call-times-text-muted">
            💡 Tous les champs sont auto-sauvegardés • Département auto-détecté selon le rôle
          </span>
        </div>
      </div>
    </div>
  )
}
