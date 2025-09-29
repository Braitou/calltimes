export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
        }
      }
      memberships: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          role: 'owner' | 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          role: 'owner' | 'admin' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          status: 'active' | 'archived' | 'draft'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          status?: 'active' | 'archived' | 'draft'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          status?: 'active' | 'archived' | 'draft'
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          organization_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          department: string | null
          role: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          department?: string | null
          role?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          department?: string | null
          role?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      call_sheets: {
        Row: {
          id: string
          project_id: string
          organization_id: string
          title: string
          shoot_date: string
          call_time: string
          status: 'draft' | 'sent' | 'archived'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          organization_id: string
          title: string
          shoot_date: string
          call_time: string
          status?: 'draft' | 'sent' | 'archived'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          organization_id?: string
          title?: string
          shoot_date?: string
          call_time?: string
          status?: 'draft' | 'sent' | 'archived'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      call_sheet_locations: {
        Row: {
          id: string
          call_sheet_id: string
          name: string
          address: string
          type: 'main' | 'base_camp' | 'parking' | 'holding'
          notes: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          call_sheet_id: string
          name: string
          address: string
          type: 'main' | 'base_camp' | 'parking' | 'holding'
          notes?: string | null
          sort_order: number
        }
        Update: {
          id?: string
          call_sheet_id?: string
          name?: string
          address?: string
          type?: 'main' | 'base_camp' | 'parking' | 'holding'
          notes?: string | null
          sort_order?: number
        }
      }
      call_sheet_schedule: {
        Row: {
          id: string
          call_sheet_id: string
          time: string
          activity: string
          location: string | null
          notes: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          call_sheet_id: string
          time: string
          activity: string
          location?: string | null
          notes?: string | null
          sort_order: number
        }
        Update: {
          id?: string
          call_sheet_id?: string
          time?: string
          activity?: string
          location?: string | null
          notes?: string | null
          sort_order?: number
        }
      }
      call_sheet_team_rows: {
        Row: {
          id: string
          call_sheet_id: string
          contact_id: string | null
          name: string
          role: string
          department: string
          call_time: string | null
          notes: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          call_sheet_id: string
          contact_id?: string | null
          name: string
          role: string
          department: string
          call_time?: string | null
          notes?: string | null
          sort_order: number
        }
        Update: {
          id?: string
          call_sheet_id?: string
          contact_id?: string | null
          name?: string
          role?: string
          department?: string
          call_time?: string | null
          notes?: string | null
          sort_order?: number
        }
      }
      email_jobs: {
        Row: {
          id: string
          call_sheet_id: string
          status: 'pending' | 'sending' | 'sent' | 'failed'
          scheduled_at: string | null
          sent_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          call_sheet_id: string
          status?: 'pending' | 'sending' | 'sent' | 'failed'
          scheduled_at?: string | null
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          call_sheet_id?: string
          status?: 'pending' | 'sending' | 'sent' | 'failed'
          scheduled_at?: string | null
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
      email_recipients: {
        Row: {
          id: string
          email_job_id: string
          contact_id: string | null
          email: string
          name: string
          status: 'pending' | 'sent' | 'failed' | 'bounced'
          sent_at: string | null
          error_message: string | null
        }
        Insert: {
          id?: string
          email_job_id: string
          contact_id?: string | null
          email: string
          name: string
          status?: 'pending' | 'sent' | 'failed' | 'bounced'
          sent_at?: string | null
          error_message?: string | null
        }
        Update: {
          id?: string
          email_job_id?: string
          contact_id?: string | null
          email?: string
          name?: string
          status?: 'pending' | 'sent' | 'failed' | 'bounced'
          sent_at?: string | null
          error_message?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
