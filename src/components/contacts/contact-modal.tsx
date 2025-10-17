'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const contactSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Téléphone invalide'),
  department: z.string().min(1, 'Le département est requis'),
  role: z.string().min(1, 'Le rôle est requis'),
})

type ContactFormData = z.infer<typeof contactSchema>

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  role: string
  lastUsed: string
  projectCount: number
}

interface ContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: Contact | null
  onSave: (contact: Omit<Contact, 'id' | 'lastUsed' | 'projectCount'>) => void
}

const departments = [
  'Réalisation',
  'Image', 
  'Son',
  'Production',
  'Casting',
  'Technique',
  'Maquillage',
  'Coiffure',
  'Costumes',
  'Autre'
]

export function ContactModal({ open, onOpenChange, contact, onSave }: ContactModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: contact?.firstName || '',
      lastName: contact?.lastName || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
      department: contact?.department || '',
      role: contact?.role || '',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      onSave(data)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Erreur sauvegarde contact:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-call-times-gray-dark border-call-times-gray-light">
        <DialogHeader>
          <DialogTitle className="card-title-custom text-white text-xl">
            {contact ? 'Modifier le contact' : 'Nouveau contact'}
          </DialogTitle>
          <DialogDescription className="text-call-times-text-secondary">
            {contact ? 'Modifiez les informations de ce contact.' : 'Ajoutez un nouveau contact à votre répertoire.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-call-times-text-secondary">Prénom</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Pierre"
                        {...field}
                        className="bg-call-times-gray-medium border-call-times-gray-light text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-call-times-text-secondary">Nom</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Lambert"
                        {...field}
                        className="bg-call-times-gray-medium border-call-times-gray-light text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-call-times-text-secondary">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="pierre.lambert@gmail.com"
                      {...field}
                      className="bg-call-times-gray-medium border-call-times-gray-light text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-call-times-text-secondary">Téléphone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+33 6 12 34 56 78"
                      {...field}
                      className="bg-call-times-gray-medium border-call-times-gray-light text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-call-times-text-secondary">Département</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-call-times-gray-medium border-call-times-gray-light text-white">
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-call-times-gray-dark border-call-times-gray-light">
                        {departments.map((dept) => (
                          <SelectItem 
                            key={dept} 
                            value={dept}
                            className="text-white hover:bg-call-times-gray-medium"
                          >
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-call-times-text-secondary">Rôle</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Réalisateur"
                        {...field}
                        className="bg-call-times-gray-medium border-call-times-gray-light text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-call-times-gray-light text-call-times-text-secondary hover:bg-call-times-gray-medium"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold"
              >
                {isLoading ? 'Sauvegarde...' : contact ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
