'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { ITEMS_PER_PAGE } from '@/lib/constants'
import type { Wallpaper, WallpaperFilters, PaginatedResponse } from '@/types'

async function fetchWallpapers(
  filters: WallpaperFilters,
  page: number
): Promise<PaginatedResponse<Wallpaper>> {
  const supabase = createClient()
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  let query = supabase
    .from('wallpapers')
    .select('*, uploader:profiles!wallpapers_uploader_id_fkey(*)', { count: 'exact' })
    .eq('status', 'published')
    .eq('visibility', 'public')

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }
  if (filters.categories?.length) {
    const safeSlugs = filters.categories
      .map((s) => s.replace(/[^a-z0-9-]/gi, ""))
      .filter(Boolean)
    if (safeSlugs.length) {
      query = query.or(safeSlugs.map((slug) => `categories.cs.[{"slug":"${slug}"}]`).join(","))
    }
  }
  if (filters.tags?.length) {
    const safeTags = filters.tags
      .map((s) => s.replace(/[^a-z0-9-]/gi, ""))
      .filter(Boolean)
    if (safeTags.length) {
      query = query.or(safeTags.map((slug) => `tags.cs.[{"slug":"${slug}"}]`).join(","))
    }
  }
  if (filters.orientation && filters.orientation !== 'all') {
    query = query.eq('orientation', filters.orientation)
  }
  if (filters.device_type && filters.device_type !== 'all') {
    query = query.eq('device_type', filters.device_type)
  }
  if (filters.is_featured !== undefined) {
    query = query.eq('is_featured', filters.is_featured)
  }
  if (filters.is_premium !== undefined) {
    query = query.eq('is_premium', filters.is_premium)
  }
  if (filters.colors?.length) {
    query = query.overlaps('dominant_colors', filters.colors)
  }

  const sortBy = filters.sort_by ?? 'newest'
  switch (sortBy) {
    case 'popular':
      query = query.order('view_count', { ascending: false })
      break
    case 'most_downloaded':
      query = query.order('download_count', { ascending: false })
      break
    case 'most_liked':
      query = query.order('like_count', { ascending: false })
      break
    case 'trending':
      query = query.order('created_at', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  query = query.range(from, to)

  const { data, count, error } = await query
  if (error) throw error

  // Safety net: re-filter the returned page client-side in case of legacy
  // string-typed entries in the JSONB arrays.
  let rows = (data ?? []) as Wallpaper[]
  if (filters.categories?.length) {
    rows = rows.filter((w) => {
      if (!Array.isArray(w.categories)) return false
      return w.categories.some((c) =>
        typeof c === 'string'
          ? filters.categories!.includes(c)
          : filters.categories!.includes(c.slug)
      )
    })
  }
  if (filters.tags?.length) {
    rows = rows.filter((w) => {
      if (!Array.isArray(w.tags)) return false
      return w.tags.some((t) =>
        typeof t === 'string'
          ? filters.tags!.includes(t)
          : filters.tags!.includes(t.slug)
      )
    })
  }

  return {
    data: rows,
    count: count ?? 0,
    page,
    per_page: ITEMS_PER_PAGE,
    total_pages: Math.ceil((count ?? 0) / ITEMS_PER_PAGE),
  }
}

async function fetchWallpaper(id: string): Promise<Wallpaper> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('wallpapers')
    .select('*, uploader:profiles!wallpapers_uploader_id_fkey(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

async function fetchFeaturedWallpapers(): Promise<Wallpaper[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('wallpapers')
    .select('*, uploader:profiles!wallpapers_uploader_id_fkey(*)')
    .eq('is_featured', true)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .order('featured_at', { ascending: false })
    .limit(12)
  if (error) throw error
  return data ?? []
}

async function fetchWallpaperOfTheDay(): Promise<Wallpaper | null> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('wallpaper_of_the_day')
    .select('wallpaper:wallpapers(*, uploader:profiles!wallpapers_uploader_id_fkey(*))')
    .eq('date', today)
    .single()
  if (error) return null
  return (data?.wallpaper as unknown as Wallpaper) ?? null
}

async function fetchSimilarWallpapers(wallpaper: Wallpaper): Promise<Wallpaper[]> {
  const supabase = createClient()
  const tagSlugs = wallpaper.tags?.map((t) => t.slug) ?? []
  const categorySlugs = wallpaper.categories?.map((c) => c.slug) ?? []

  if (categorySlugs.length === 0) return []

  let query = supabase
    .from('wallpapers')
    .select('*, uploader:profiles!wallpapers_uploader_id_fkey(*)')
    .eq('status', 'published')
    .eq('visibility', 'public')
    .neq('id', wallpaper.id)
    .limit(50)

  query = query.or(
    categorySlugs
      .map((s) => s.replace(/[^a-z0-9-]/gi, ""))
      .filter(Boolean)
      .map((slug) => `categories.cs.[{"slug":"${slug}"}]`)
      .join(",")
  )

  const { data, error } = await query

  if (error) throw error

  const results = ((data ?? []) as Wallpaper[]).sort((a, b) => {
    const aTags = (a.tags ?? []).map((t) => t.slug)
    const bTags = (b.tags ?? []).map((t) => t.slug)
    const aScore = aTags.filter((t) => tagSlugs.includes(t)).length
    const bScore = bTags.filter((t) => tagSlugs.includes(t)).length
    return bScore - aScore
  })

  return results.slice(0, 12)
}

export function useWallpapers(filters: WallpaperFilters, page: number) {
  return useQuery({
    queryKey: ['wallpapers', filters, page],
    queryFn: () => fetchWallpapers(filters, page),
    staleTime: 30 * 1000,
  })
}

export function useWallpaper(id: string) {
  return useQuery({
    queryKey: ['wallpaper', id],
    queryFn: () => fetchWallpaper(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  })
}

export function useFeaturedWallpapers() {
  return useQuery({
    queryKey: ['wallpapers', 'featured'],
    queryFn: fetchFeaturedWallpapers,
    staleTime: 5 * 60 * 1000,
  })
}

export function useWallpaperOfTheDay() {
  return useQuery({
    queryKey: ['wallpapers', 'of-the-day'],
    queryFn: fetchWallpaperOfTheDay,
    staleTime: 60 * 60 * 1000,
  })
}

export function useSimilarWallpapers(wallpaper: Wallpaper) {
  return useQuery({
    queryKey: ['wallpapers', 'similar', wallpaper.id],
    queryFn: () => fetchSimilarWallpapers(wallpaper),
    enabled: !!wallpaper.id,
    staleTime: 5 * 60 * 1000,
  })
}
