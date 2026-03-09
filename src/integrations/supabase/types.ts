// Este arquivo é gerado automaticamente via:
// supabase gen types typescript --local > src/integrations/supabase/types.ts
// NÃO edite manualmente — regenere sempre que o schema mudar.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'consultant' | 'client'
          full_name: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: 'admin' | 'consultant' | 'client'
          full_name?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'consultant' | 'client'
          full_name?: string | null
          avatar_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      consultant_clients: {
        Row: {
          id: string
          consultant_id: string
          client_id: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          consultant_id: string
          client_id: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          consultant_id?: string
          client_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'consultant_clients_consultant_id_fkey'
            columns: ['consultant_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'consultant_clients_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      client_diagnostics: {
        Row: {
          id: string
          client_id: string
          full_name: string | null
          email: string | null
          whatsapp_ddi: string | null
          whatsapp_ddd: string | null
          whatsapp_num: string | null
          social_links: Json | null
          objectives: string | null
          submitted_at: string | null
          is_locked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          full_name?: string | null
          email?: string | null
          whatsapp_ddi?: string | null
          whatsapp_ddd?: string | null
          whatsapp_num?: string | null
          social_links?: Json | null
          objectives?: string | null
          submitted_at?: string | null
          is_locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          email?: string | null
          whatsapp_ddi?: string | null
          whatsapp_ddd?: string | null
          whatsapp_num?: string | null
          social_links?: Json | null
          objectives?: string | null
          submitted_at?: string | null
          is_locked?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'client_diagnostics_client_id_fkey'
            columns: ['client_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      deliverables: {
        Row: {
          id: string
          client_id: string
          type: 'risk_map' | 'brand_book' | 'editorial_line'
          status: 'locked' | 'in_progress' | 'published'
          raw_markdown: string | null
          processed_json: Json | null
          published_at: string | null
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          type: 'risk_map' | 'brand_book' | 'editorial_line'
          status?: 'locked' | 'in_progress' | 'published'
          raw_markdown?: string | null
          processed_json?: Json | null
          published_at?: string | null
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          type?: 'risk_map' | 'brand_book' | 'editorial_line'
          status?: 'locked' | 'in_progress' | 'published'
          raw_markdown?: string | null
          processed_json?: Json | null
          published_at?: string | null
          uploaded_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'deliverables_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      content_cards: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string | null
          channel: string | null
          format_id: string | null
          format_free: string | null
          status: 'ideia' | 'em_producao' | 'revisao' | 'agendado' | 'publicado' | 'arquivado'
          production_date: string | null
          publish_date: string | null
          responsible: string | null
          labels: string[] | null
          internal_notes: string | null
          publish_url: string | null
          metrics: Json | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          description?: string | null
          channel?: string | null
          format_id?: string | null
          format_free?: string | null
          status?: 'ideia' | 'em_producao' | 'revisao' | 'agendado' | 'publicado' | 'arquivado'
          production_date?: string | null
          publish_date?: string | null
          responsible?: string | null
          labels?: string[] | null
          internal_notes?: string | null
          publish_url?: string | null
          metrics?: Json | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          channel?: string | null
          format_id?: string | null
          format_free?: string | null
          status?: 'ideia' | 'em_producao' | 'revisao' | 'agendado' | 'publicado' | 'arquivado'
          production_date?: string | null
          publish_date?: string | null
          responsible?: string | null
          labels?: string[] | null
          internal_notes?: string | null
          publish_url?: string | null
          metrics?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'content_cards_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'content_cards_format_id_fkey'
            columns: ['format_id']
            isOneToOne: false
            referencedRelation: 'content_formats'
            referencedColumns: ['id']
          },
        ]
      }
      card_attachments: {
        Row: {
          id: string
          card_id: string
          file_name: string
          file_url: string
          file_type: string | null
          file_size: number | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          card_id: string
          file_name: string
          file_url: string
          file_type?: string | null
          file_size?: number | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          file_name?: string
          file_url?: string
          file_type?: string | null
          file_size?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'card_attachments_card_id_fkey'
            columns: ['card_id']
            isOneToOne: false
            referencedRelation: 'content_cards'
            referencedColumns: ['id']
          },
        ]
      }
      content_formats: {
        Row: {
          id: string
          name: string
          platforms: string[] | null
          description: string | null
          how_to: string | null
          examples: Json | null
          tips: string[] | null
          thumbnail_url: string | null
          tags: string[] | null
          status: 'active' | 'archived'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          platforms?: string[] | null
          description?: string | null
          how_to?: string | null
          examples?: Json | null
          tips?: string[] | null
          thumbnail_url?: string | null
          tags?: string[] | null
          status?: 'active' | 'archived'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          platforms?: string[] | null
          description?: string | null
          how_to?: string | null
          examples?: Json | null
          tips?: string[] | null
          thumbnail_url?: string | null
          tags?: string[] | null
          status?: 'active' | 'archived'
          updated_at?: string
        }
        Relationships: []
      }
      deliverable_versions: {
        Row: {
          id: string
          deliverable_id: string
          version_number: number
          raw_markdown: string | null
          processed_json: Json | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          deliverable_id: string
          version_number?: number
          raw_markdown?: string | null
          processed_json?: Json | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          version_number?: number
          raw_markdown?: string | null
          processed_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'deliverable_versions_deliverable_id_fkey'
            columns: ['deliverable_id']
            isOneToOne: false
            referencedRelation: 'deliverables'
            referencedColumns: ['id']
          },
        ]
      }
      impersonation_logs: {
        Row: {
          id: string
          consultant_id: string
          client_id: string
          started_at: string
          ended_at: string | null
          action_summary: string | null
        }
        Insert: {
          id?: string
          consultant_id: string
          client_id: string
          started_at?: string
          ended_at?: string | null
          action_summary?: string | null
        }
        Update: {
          ended_at?: string | null
          action_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'impersonation_logs_consultant_id_fkey'
            columns: ['consultant_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'impersonation_logs_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
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
