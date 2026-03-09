export type UserRole = 'admin' | 'consultant' | 'client'

export type DeliverableType = 'risk_map' | 'brand_book' | 'editorial_line'
export type DeliverableStatus = 'locked' | 'in_progress' | 'published'

export type ContentCardStatus =
  | 'ideia'
  | 'em_producao'
  | 'revisao'
  | 'agendado'
  | 'publicado'
  | 'arquivado'

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
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  profile: Profile
}
