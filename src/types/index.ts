import type { Session } from '@supabase/supabase-js'

// Re-export Supabase session type
export type SupabaseSession = Session

// Database generated types (matching the Supabase schema)

// Enums
export type UserRole = 'user' | 'admin' | 'artist'
export type WallpaperStatus = 'draft' | 'published' | 'archived' | 'rejected'
export type WallpaperVisibility = 'public' | 'private' | 'unlisted'
export type DeviceType = 'phone' | 'desktop' | 'tablet' | 'all'
export type WallpaperType = 'static' | 'live'
export type Orientation = 'portrait' | 'landscape' | 'square'
export type AdType = 'rewarded' | 'interstitial' | 'banner' | 'native'
export type InteractionType = 'started' | 'completed' | 'skipped' | 'failed'
export type DownloadQuality = 'low' | 'hd' | 'original'
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type ReportReason = 'spam' | 'inappropriate' | 'copyright' | 'other'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'
export type NotificationType = 'system' | 'wallpaper' | 'collection' | 'admin' | 'achievement'
export type StorageBucket = 'wallpapers' | 'avatars' | 'thumbnails' | 'previews'
export type SortOption = 'newest' | 'popular' | 'most_downloaded' | 'most_liked' | 'trending'
export type StudioStatus = 'none' | 'pending' | 'approved' | 'rejected'

// Core interfaces
export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  role: UserRole
  is_premium: boolean
  premium_expires_at: string | null
  coins: number
  studio_status: StudioStatus
  studio_name: string | null
  studio_description: string | null
  studio_avatar_url: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  display_order: number
  is_active: boolean
  wallpaper_count: number
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  usage_count: number
  created_at: string
}

export interface Wallpaper {
  id: string
  title: string
  description: string | null
  slug: string
  status: WallpaperStatus
  visibility: WallpaperVisibility
  thumbnail_url: string | null
  preview_url: string | null
  hd_url: string | null
  original_url: string | null
  original_filename: string | null
  file_size: number | null
  hd_file_size: number | null
  preview_file_size: number | null
  thumbnail_file_size: number | null
  width: number | null
  height: number | null
  aspect_ratio: string | null
  orientation: Orientation | null
  device_type: DeviceType
  wallpaper_type: WallpaperType
  mime_type: string | null
  dominant_colors: string[] | null
  view_count: number
  download_count: number
  like_count: number
  favorite_count: number
  share_count: number
  collection_count: number
  avg_rating: number
  rating_count: number
  is_featured: boolean
  is_premium: boolean
  featured_at: string | null
  uploader_id: string
  artist_id: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  // Joined fields
  uploader?: Profile
  artist?: Profile
  categories?: Category[]
  tags?: Tag[]
}

export interface Favorite {
  id: string
  user_id: string
  wallpaper_id: string
  created_at: string
  wallpaper?: Wallpaper
}

export interface Download {
  id: string
  user_id: string | null
  wallpaper_id: string
  quality: DownloadQuality
  ip_address: string | null
  user_agent: string | null
  device_type: string | null
  created_at: string
  wallpaper?: Wallpaper
}

export interface View {
  id: string
  user_id: string | null
  wallpaper_id: string
  ip_address: string | null
  duration: number | null
  created_at: string
}

export interface Like {
  id: string
  user_id: string
  wallpaper_id: string
  created_at: string
}

export interface SearchHistoryEntry {
  id: string
  user_id: string | null
  query: string
  filters: Record<string, unknown> | null
  results_count: number | null
  created_at: string
}

export interface SearchSuggestion {
  id: string
  term: string
  search_count: number
  last_searched_at: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  data: Record<string, unknown> | null
  is_read: boolean
  created_at: string
}

export interface WallpaperOfTheDay {
  id: string
  wallpaper_id: string
  date: string
  is_manual: boolean
  selected_by: string | null
  created_at: string
  wallpaper?: Wallpaper
}

export interface AdConfiguration {
  id: string
  ad_type: AdType
  provider: string
  ad_unit_id: string
  app_id: string | null
  is_enabled: boolean
  placement_rules: Record<string, unknown> | null
  frequency_cap: number | null
  cooldown_seconds: number
  created_at: string
  updated_at: string
}

export interface UserAdInteraction {
  id: string
  user_id: string
  ad_config_id: string
  wallpaper_id: string | null
  interaction_type: InteractionType
  reward_granted: boolean
  created_at: string
}

export interface ArtistPayout {
  id: string
  artist_id: string
  amount: number
  currency: string
  status: PayoutStatus
  payment_method: string | null
  reference_id: string | null
  notes: string | null
  created_at: string
  processed_at: string | null
}

export interface AppSetting {
  key: string
  value: unknown
  description: string | null
  updated_by: string | null
  updated_at: string
}

export interface Report {
  id: string
  reporter_id: string
  wallpaper_id: string
  reason: ReportReason
  description: string | null
  status: ReportStatus
  reviewed_by: string | null
  review_notes: string | null
  created_at: string
  resolved_at: string | null
}

export interface StudioApplication {
  id: string
  user_id: string
  studio_name: string
  studio_description: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  user?: Profile
}

export interface Rating {
  id: string
  user_id: string
  wallpaper_id: string
  rating: number
  created_at: string
  updated_at: string
}

// Filter types
export interface WallpaperFilters {
  device_type?: DeviceType | 'all'
  wallpaper_type?: WallpaperType | 'all'
  categories?: string[]
  tags?: string[]
  orientation?: Orientation | 'all'
  colors?: string[]
  is_featured?: boolean
  is_premium?: boolean
  sort_by?: 'newest' | 'popular' | 'most_downloaded' | 'most_liked' | 'trending'
  search?: string
  min_width?: number
  min_height?: number
}

// Search types
export interface SearchFilters {
  query: string
  device_type?: DeviceType
  wallpaper_type?: WallpaperType
  orientation?: Orientation
  categories?: string[]
  tags?: string[]
  colors?: string[]
  sort_by?: string
}

// API response types
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// Stats types
export interface WallpaperStats {
  views: number
  downloads: number
  likes: number
  favorites: number
  shares: number
}

export interface AdminStats {
  total_users: number
  total_wallpapers: number
  total_downloads: number
  total_views: number
  total_likes: number
  total_revenue: number
  active_users_today: number
  new_users_this_week: number
  top_wallpapers: Wallpaper[]
  top_categories: Category[]
  recent_downloads: Download[]
}

// Auth types
export interface AuthState {
  user: Profile | null
  session: SupabaseSession | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Ad interaction tracking
export interface AdPlacement {
  screen: 'wallpaper_detail' | 'browse' | 'home' | 'search' | 'download'
  position: 'top' | 'bottom' | 'inline' | 'overlay'
}

// User history
export interface UserHistory {
  recent_views: Wallpaper[]
  recent_downloads: Wallpaper[]
  recent_searches: SearchHistoryEntry[]
  recent_likes: Wallpaper[]
}

// Store types
export interface UIState {
  theme: 'dark' | 'light'
  sidebarOpen: boolean
  searchOpen: boolean
  modalOpen: string | null
}
