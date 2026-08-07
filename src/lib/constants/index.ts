import type { SortOption } from '@/types'

export const CATEGORIES = [
  { name: 'Anime', slug: 'anime', icon: 'Sparkles', color: '#f472b6' },
  { name: 'Nature', slug: 'nature', icon: 'Leaf', color: '#22c55e' },
  { name: 'Cars', slug: 'cars', icon: 'Car', color: '#ef4444' },
  { name: 'Gaming', slug: 'gaming', icon: 'Gamepad2', color: '#8b5cf6' },
  { name: 'Technology', slug: 'technology', icon: 'Cpu', color: '#3b82f6' },
  { name: 'Minimal', slug: 'minimal', icon: 'Minus', color: '#6b7280' },
  { name: 'Abstract', slug: 'abstract', icon: 'Layers', color: '#ec4899' },
  { name: 'Cyberpunk', slug: 'cyberpunk', icon: 'Zap', color: '#06b6d4' },
  { name: 'Space', slug: 'space', icon: 'Globe', color: '#1e3a5f' },
  { name: 'Dark', slug: 'dark', icon: 'Moon', color: '#1f2937' },
  { name: 'Light', slug: 'light', icon: 'Sun', color: '#fbbf24' },
  { name: 'Cities', slug: 'cities', icon: 'Building2', color: '#f97316' },
  { name: 'Animals', slug: 'animals', icon: 'PawPrint', color: '#a3e635' },
  { name: 'AI Art', slug: 'ai-art', icon: 'Brain', color: '#a855f7' },
  { name: 'Sports', slug: 'sports', icon: 'Trophy', color: '#14b8a6' },
  { name: 'Movies', slug: 'movies', icon: 'Clapperboard', color: '#e11d48' },
  { name: 'Music', slug: 'music', icon: 'Music', color: '#7c3aed' },
  { name: '3D', slug: '3d', icon: 'Box', color: '#0ea5e9' },
  { name: 'Fantasy', slug: 'fantasy', icon: 'Wand2', color: '#c084fc' },
  { name: 'Programming', slug: 'programming', icon: 'Code2', color: '#10b981' },
  { name: 'Architecture', slug: 'architecture', icon: 'Landmark', color: '#78716c' },
  { name: 'Food', slug: 'food', icon: 'UtensilsCrossed', color: '#fb923c' },
  { name: 'Luxury', slug: 'luxury', icon: 'Crown', color: '#eab308' },
  { name: 'Vehicles', slug: 'vehicles', icon: 'Truck', color: '#64748b' },
] as const

export const DEVICE_TYPES = ['phone', 'desktop', 'tablet', 'all'] as const

export const WALLPAPER_TYPES = ['static', 'live'] as const

export const ORIENTATIONS = ['portrait', 'landscape', 'square'] as const

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'most_downloaded', label: 'Most Downloads' },
  { value: 'most_liked', label: 'Most Likes' },
  { value: 'trending', label: 'Trending' },
]

export const ITEMS_PER_PAGE = 24

export const STORAGE_BUCKETS = {
  wallpapers: 'wallpapers',
  avatars: 'avatars',
  thumbnails: 'thumbnails',
  previews: 'previews',
} as const

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export const APP_NAME = 'apex'
export const APP_DESCRIPTION =
  'Discover and download high-quality wallpapers for all your devices'

export const DEFAULT_AVATAR_URL =
  'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=256'

export const AD_PLACEMENTS = [
  { id: 'header-banner', position: 'top' as const, ad_unit_id: '', is_active: false },
  { id: 'sidebar', position: 'sidebar' as const, ad_unit_id: '', is_active: false },
  { id: 'feed-inline', position: 'inline' as const, ad_unit_id: '', is_active: false },
  { id: 'footer-banner', position: 'bottom' as const, ad_unit_id: '', is_active: false },
]

// HilltopAds popunder script — exact code provided by the site owner.
export const POPUNDER_SCRIPT = `(function(rpjg){
var d = document,
    s = d.createElement('script'),
    l = d.scripts[d.scripts.length - 1];
s.settings = rpjg || {};
s.src = "\\/\\/loyal-product.com\\/cVD\\/9h6.bO2d5nlKSNW\\/Qj9ZNbz\\/IU2cOKT_g\\/3wMXyX0o3\\/MtjFYI5KO\\/DJcL3N";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})`;

// HilltopAds in-page multitag (250x300) — independent from the popunder slot.
export const MULTITAG_SCRIPT = `(function(faxyqp){
var d = document,
    s = d.createElement('script'),
    l = d.scripts[d.scripts.length - 1];
s.settings = faxyqp || {};
s.src = "\\/\\/fond-appointment.com\\/b\\/XHV.sQdPGglz0ZYAWecs\\/NeamR9xuHZvUKlMkNPQTYc\\/y_OGT\\/Q_5eOhD\\/kOtPN\\/zQII5fNzD\\/kZ5OM\\/wy";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})`;


export const CACHE_TIMES = {
  swr: 60 * 1000,
  static: 60 * 60 * 1000,
  images: 60 * 60 * 24 * 1000,
  user: 60 * 5 * 1000,
} as const
