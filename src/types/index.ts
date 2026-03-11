export type UserRole = 'admin' | 'consultant' | 'client'

export type DeliverableType = 'risk_map' | 'brand_book' | 'editorial_line'
export type DeliverableStatus = 'locked' | 'in_progress' | 'published'

export type ContentCardStatus =
  | 'a_fazer'
  | 'em_andamento'
  | 'aprovacao'
  | 'aprovado_final'
  | 'agendado'
  | 'publicado'
  | 'arquivado'

export type StageTag =
  | 'aguardando_roteiro'
  | 'roteiro_aprovado'
  | 'em_edicao'
  | 'aprovado_final'

export type ContentChannel =
  | 'instagram'
  | 'linkedin'
  | 'youtube'
  | 'tiktok'
  | 'twitter'
  | 'facebook'
  | 'pinterest'
  | 'blog'
  | 'email'
  | 'outro'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  avatar_url: string | null
  is_active: boolean
  parent_client_id: string | null
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  profile: Profile
}
